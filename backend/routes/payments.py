from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
import uuid
import logging

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse, CheckoutStatusResponse
)
from routes.emails import send_email, enrollment_confirmation_email, participant_notification_email
from utils.uid_generator import generate_uid
import stripe as stripe_lib

async def create_checkout_no_adaptive(stripe_checkout: StripeCheckout, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
    """Create a Stripe checkout session with Adaptive Pricing DISABLED and billing address collection REQUIRED."""
    stripe_lib.api_key = stripe_checkout.api_key
    product_name = request.metadata.get("item_title", "Payment") if request.metadata else "Payment"
    line_items = [{
        "price_data": {
            "currency": request.currency,
            "product_data": {"name": product_name or "Payment"},
            "unit_amount": int(round(request.amount * 100)),
        },
        "quantity": 1,
    }]
    session_params = {
        "line_items": line_items,
        "mode": "payment",
        "success_url": request.success_url,
        "cancel_url": request.cancel_url,
        "metadata": request.metadata or {},
        "adaptive_pricing": {"enabled": False},
        "billing_address_collection": "required",
    }
    if request.payment_methods:
        session_params["payment_method_types"] = request.payment_methods
    # Pre-fill customer email if available
    customer_email = (request.metadata or {}).get("email")
    if customer_email:
        session_params["customer_email"] = customer_email
    session = stripe_lib.checkout.Session.create(**session_params)
    return CheckoutSessionResponse(session_id=session.id, url=session.url)

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/payments", tags=["Payments"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

logger = logging.getLogger(__name__)


async def _get_stripe_key():
    """Get Stripe key from key_manager (MongoDB) with .env fallback."""
    try:
        from key_manager import get_key
        key = await get_key("stripe_api_key")
        return key or STRIPE_API_KEY
    except Exception:
        return STRIPE_API_KEY

CURRENCY_SYMBOLS = {
    'aed': 'AED ', 'usd': '$', 'inr': '₹', 'eur': '€', 'gbp': '£'
}

# Gulf countries for AED pricing
AED_COUNTRIES = {"AE", "SA", "QA", "KW", "OM", "BH"}


async def _run_post_payment_fraud_check(enrollment_id: str, session_id: str, tx: dict, card_country: str = None, billing_country: str = None):
    """Post-payment fraud detection: compare card/billing country vs claimed country.
    Creates a fraud alert if mismatch detected on INR transactions."""
    enrollment = await db.enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not enrollment:
        return

    claimed_country = enrollment.get("booker_country", "")
    ip_country = enrollment.get("ip_info", {}).get("country", "")
    currency = tx.get("currency", "")
    amount = tx.get("amount", 0)
    phone = enrollment.get("phone", "")
    browser_tz = enrollment.get("browser_timezone", "")

    # Build fraud signals
    signals = {
        "claimed_country": claimed_country,
        "ip_country": ip_country,
        "card_country": card_country,
        "billing_country": billing_country,
        "phone": phone,
        "browser_timezone": browser_tz,
        "currency_charged": currency,
        "amount_charged": amount,
    }

    # Determine fraud severity
    fraud_reasons = []
    severity = "none"

    # Check 1: Card country mismatch (strongest signal)
    if card_country and claimed_country:
        if claimed_country == "IN" and card_country != "IN":
            fraud_reasons.append(f"Card issued in {card_country}, not India")
            severity = "high"
        elif claimed_country in AED_COUNTRIES and card_country not in AED_COUNTRIES and card_country != "IN":
            fraud_reasons.append(f"Card issued in {card_country}, not Gulf region")
            severity = "medium"

    # Check 2: Billing country mismatch
    if billing_country and claimed_country and billing_country != claimed_country:
        fraud_reasons.append(f"Billing address country ({billing_country}) differs from claimed ({claimed_country})")
        if severity == "none":
            severity = "medium"

    # Check 3: INR payment with non-Indian card (critical)
    if currency == "inr" and card_country and card_country != "IN":
        fraud_reasons.append(f"Paid in INR but card is from {card_country}")
        severity = "critical"

    # Check 4: VPN was detected during enrollment
    if enrollment.get("vpn_blocked"):
        fraud_reasons.append("VPN/Proxy was detected during enrollment")
        if severity in ("none", "low"):
            severity = "medium"

    # Check 5: IP vs card country mismatch
    if card_country and ip_country and card_country != ip_country:
        fraud_reasons.append(f"IP country ({ip_country}) differs from card country ({card_country})")
        if severity == "none":
            severity = "low"

    if not fraud_reasons:
        # No fraud detected — store clean record
        await db.enrollments.update_one(
            {"id": enrollment_id},
            {"$set": {"fraud_status": "clean", "card_country": card_country, "billing_country": billing_country}}
        )
        return

    # Create fraud alert
    alert = {
        "id": str(uuid.uuid4()),
        "enrollment_id": enrollment_id,
        "stripe_session_id": session_id,
        "booker_name": enrollment.get("booker_name", ""),
        "booker_email": enrollment.get("booker_email", ""),
        "severity": severity,
        "reasons": fraud_reasons,
        "signals": signals,
        "status": "new",  # new → reviewed → confirmed_fraud → legitimate
        "admin_notes": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.fraud_alerts.insert_one(alert)

    # Update enrollment with fraud flag
    await db.enrollments.update_one(
        {"id": enrollment_id},
        {"$set": {
            "fraud_status": "flagged",
            "fraud_severity": severity,
            "card_country": card_country,
            "billing_country": billing_country,
        }}
    )

    # If critical (INR with non-Indian card), block this email from future INR
    if severity == "critical":
        email = enrollment.get("booker_email", "").lower()
        if email:
            await db.fraud_blocklist.update_one(
                {"email": email},
                {"$set": {
                    "email": email,
                    "reason": "; ".join(fraud_reasons),
                    "enrollment_id": enrollment_id,
                    "blocked_at": datetime.now(timezone.utc).isoformat(),
                }},
                upsert=True,
            )

    logger.warning(f"[FRAUD ALERT] enrollment={enrollment_id} severity={severity} reasons={fraud_reasons}")


async def generate_participant_uids(session_id: str):
    """Generate UIDs for all participants in an enrollment linked to this payment."""
    tx = await db.payment_transactions.find_one({"stripe_session_id": session_id}, {"_id": 0})
    if not tx:
        return

    enrollment_id = tx.get("enrollment_id")
    if not enrollment_id:
        return

    enrollment = await db.enrollments.find_one({"id": enrollment_id})
    if not enrollment:
        return

    participants = enrollment.get("participants", [])
    item_title = tx.get("item_title", "Program")
    updated = False

    for i, p in enumerate(participants):
        if not p.get("uid"):
            uid = await generate_uid(db, item_title, p.get("name", "Unknown"))
            participants[i]["uid"] = uid
            updated = True

    if updated:
        await db.enrollments.update_one(
            {"id": enrollment_id},
            {"$set": {"participants": participants}}
        )


async def send_enrollment_emails(session_id: str):
    """Send confirmation email to booker + notification emails to participants who opted in."""
    tx = await db.payment_transactions.find_one({"stripe_session_id": session_id}, {"_id": 0})
    if not tx:
        return

    enrollment_id = tx.get("enrollment_id")
    if not enrollment_id:
        return

    enrollment = await db.enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not enrollment:
        return

    booker_name = enrollment.get("booker_name", "")
    booker_email = enrollment.get("booker_email", "")
    phone = enrollment.get("phone", "")
    participants = enrollment.get("participants", [])
    item_title = tx.get("item_title", "")
    total = tx.get("amount", 0)
    currency = tx.get("currency", "aed")
    symbol = CURRENCY_SYMBOLS.get(currency, currency.upper() + " ")

    # Fetch program links
    program_links = {}
    item_id = tx.get("item_id")
    item_type = tx.get("item_type")
    if item_id and item_type == "program":
        program = await db.programs.find_one({"id": item_id}, {"_id": 0})
        if program:
            if program.get("show_whatsapp_link") and program.get("whatsapp_group_link"):
                program_links["whatsapp_group_link"] = program["whatsapp_group_link"]
            if program.get("show_whatsapp_link_2") and program.get("whatsapp_group_link_2"):
                program_links["whatsapp_group_link_2"] = program["whatsapp_group_link_2"]
            if program.get("show_zoom_link") and program.get("zoom_link"):
                program_links["zoom_link"] = program["zoom_link"]
            if program.get("show_custom_link") and program.get("custom_link"):
                program_links["custom_link"] = program["custom_link"]
                program_links["custom_link_label"] = program.get("custom_link_label", "Link")

    # Fetch social links and community WhatsApp (global)
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    settings = settings or {}
    social_links = {k: v for k, v in settings.items() if k.startswith("social_") or k.startswith("show_")}
    community_whatsapp = settings.get("community_whatsapp_link", "")

    # 1. Send booker confirmation (from receipt email)
    program_description = ""
    program_start_date = ""
    program_duration = ""
    program_end_date = ""
    program_timing = ""
    program_timezone = ""
    logo_url = ""
    tier_index = tx.get("tier_index")
    if booker_email:
        if item_id and item_type == "program":
            program = await db.programs.find_one({"id": item_id}, {"_id": 0})
            if program:
                program_description = program.get("description", "")
                # Use tier-specific dates/duration if available
                tiers = program.get("duration_tiers", [])
                if tier_index is not None and tiers and 0 <= tier_index < len(tiers):
                    tier = tiers[tier_index]
                    program_duration = tier.get("label", program.get("duration", ""))
                    program_start_date = tier.get("start_date", program.get("start_date", ""))
                    program_end_date = tier.get("end_date", program.get("end_date", ""))
                else:
                    program_duration = program.get("duration", "")
                    program_start_date = program.get("start_date", "")
                    program_end_date = program.get("end_date", "")
                program_timing = program.get("timing", "") or ""
                program_timezone = program.get("time_zone", "") or ""
        elif item_id and item_type == "session":
            session = await db.sessions.find_one({"id": item_id}, {"_id": 0})
            if session:
                program_description = session.get("description", "")
                program_duration = session.get("duration", "")
                program_timing = session.get("timing", "") or ""
                program_timezone = session.get("time_zone", "") or ""

        # Get receipt template and logo
        from routes.emails import get_receipt_template
        receipt_tpl, logo_path = await get_receipt_template()
        logo_url = ""
        if logo_path:
            host = os.environ.get('BACKEND_URL', '') or os.environ.get('HOST_URL', '')
            logo_url = f"{host}{logo_path}" if logo_path.startswith("/api") else logo_path

    # Fetch social links from settings
        settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
        settings = settings or {}
        social_links = {k: v for k, v in settings.items() if k.startswith("social_") or k.startswith("show_")}

        # Get community WhatsApp link (global from site settings)
        community_whatsapp = settings.get("community_whatsapp_link", "")

        html = enrollment_confirmation_email(
            booker_name=booker_name,
            item_title=item_title,
            participants=participants,
            total=total,
            currency_symbol=symbol,
            attendance_modes=[p.get("attendance_mode", "online") for p in participants],
            booker_email=booker_email,
            phone=phone,
            program_links=program_links,
            program_description=program_description,
            program_start_date=program_start_date,
            program_duration=program_duration,
            program_end_date=program_end_date,
            program_timing=program_timing,
            program_timezone=program_timezone,
            logo_url=logo_url,
            receipt_template=receipt_tpl,
            social_links=social_links,
            community_whatsapp=community_whatsapp,
            footer_phone=settings.get("footer_phone", ""),
            footer_email=settings.get("footer_email", ""),
            site_url="https://divineirishealing.com",
        )
        from key_manager import get_key
        receipt_sender = await get_key("receipt_email") or os.environ.get("RECEIPT_EMAIL", "receipt@divineirishealing.com")
        await send_email(booker_email, f"Payment Receipt — {item_title} — Divine Iris Healing", html, from_email=receipt_sender)

    # 2. Send participant notifications (everything except receipt)
    for p in participants:
        if p.get("notify") and p.get("email"):
            p_html = participant_notification_email(
                participant_name=p["name"],
                item_title=item_title,
                attendance_mode=p.get("attendance_mode", "online"),
                booker_name=booker_name,
                program_links=program_links,
                program_description=program_description,
                program_start_date=program_start_date,
                program_duration=program_duration,
                program_end_date=program_end_date,
                program_timing=program_timing,
                program_timezone=program_timezone,
                logo_url=logo_url,
                social_links=social_links,
                community_whatsapp=community_whatsapp,
            )
            await send_email(p["email"], f"You've Been Enrolled — {item_title}", p_html)

    # Mark emails as sent
    await db.payment_transactions.update_one(
        {"stripe_session_id": session_id},
        {"$set": {"emails_sent": True, "updated_at": datetime.now(timezone.utc)}}
    )


class CreateCheckoutRequest(BaseModel):
    item_type: str  # "program" or "session"
    item_id: str
    currency: str = "usd"
    origin_url: str


class CheckStatusRequest(BaseModel):
    session_id: str



class CreateSponsorCheckoutRequest(BaseModel):
    name: str
    email: str
    amount: float
    currency: str = "inr"
    message: str = ""
    anonymous: bool = False
    origin_url: str


@router.post("/sponsor-checkout")
async def create_sponsor_checkout(req: CreateSponsorCheckoutRequest, http_request: Request):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    currency = req.currency.lower()
    origin = req.origin_url.rstrip('/')
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/#sponsor"

    host_url = str(http_request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=await _get_stripe_key(), webhook_url=webhook_url)

    checkout_request = CheckoutSessionRequest(
        amount=float(req.amount),
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "item_type": "sponsor",
            "donor_name": req.name if not req.anonymous else "Anonymous",
            "donor_email": req.email,
            "message": req.message,
            "anonymous": str(req.anonymous),
            "currency": currency,
        }
    )

    session: CheckoutSessionResponse = await create_checkout_no_adaptive(stripe_checkout, checkout_request)

    transaction = {
        "id": str(uuid.uuid4()),
        "stripe_session_id": session.session_id,
        "item_type": "sponsor",
        "item_id": "sponsor",
        "item_title": "Shine a Light Contribution",
        "amount": float(req.amount),
        "currency": currency,
        "payment_status": "pending",
        "donor_name": req.name,
        "donor_email": req.email,
        "message": req.message,
        "anonymous": req.anonymous,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await db.payment_transactions.insert_one(transaction)

    return {"url": session.url, "session_id": session.session_id}



@router.post("/create-checkout")
async def create_checkout(req: CreateCheckoutRequest, http_request: Request):
    # Fetch item from DB to get the price (NEVER from frontend)
    if req.item_type == "program":
        item = await db.programs.find_one({"id": req.item_id})
        if not item:
            raise HTTPException(status_code=404, detail="Program not found")
        if not item.get("enrollment_open", True):
            raise HTTPException(status_code=400, detail="Enrollment is not open for this program")
    elif req.item_type == "session":
        item = await db.sessions.find_one({"id": req.item_id})
        if not item:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        raise HTTPException(status_code=400, detail="Invalid item type")

    # Get price for the requested currency from DB
    currency = req.currency.lower()
    price_field = f"price_{currency}"

    # Check offer price first for programs
    amount = 0.0
    if req.item_type == "program":
        offer_field = f"offer_price_{currency}"
        offer_amount = float(item.get(offer_field, 0))
        if offer_amount > 0:
            amount = offer_amount
        else:
            amount = float(item.get(price_field, 0))
    else:
        amount = float(item.get(price_field, 0))

    if amount <= 0:
        raise HTTPException(status_code=400, detail=f"No price set for currency: {currency}")

    # Build URLs
    origin = req.origin_url.rstrip('/')
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/payment/cancel?item_type={req.item_type}&item_id={req.item_id}"

    # Initialize Stripe checkout
    host_url = str(http_request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=await _get_stripe_key(), webhook_url=webhook_url)

    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=float(amount),
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "item_type": req.item_type,
            "item_id": req.item_id,
            "item_title": item.get("title", ""),
            "currency": currency,
        }
    )

    session: CheckoutSessionResponse = await create_checkout_no_adaptive(stripe_checkout, checkout_request)

    # Create payment transaction record BEFORE redirect
    transaction = {
        "id": str(uuid.uuid4()),
        "stripe_session_id": session.session_id,
        "item_type": req.item_type,
        "item_id": req.item_id,
        "item_title": item.get("title", ""),
        "amount": float(amount),
        "currency": currency,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await db.payment_transactions.insert_one(transaction)

    return {"url": session.url, "session_id": session.session_id}


@router.get("/status/{session_id}")
async def check_payment_status(session_id: str, http_request: Request, background_tasks: BackgroundTasks):
    # Check if already processed
    tx = await db.payment_transactions.find_one({"stripe_session_id": session_id})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Fetch program links if available
    program_links = {}
    item_id = tx.get("item_id")
    item_type = tx.get("item_type")
    if item_id and item_type == "program":
        program = await db.programs.find_one({"id": item_id}, {"_id": 0})
        if program:
            if program.get("show_whatsapp_link") and program.get("whatsapp_group_link"):
                program_links["whatsapp_group_link"] = program["whatsapp_group_link"]
            if program.get("show_whatsapp_link_2") and program.get("whatsapp_group_link_2"):
                program_links["whatsapp_group_link_2"] = program["whatsapp_group_link_2"]
            if program.get("show_zoom_link") and program.get("zoom_link"):
                program_links["zoom_link"] = program["zoom_link"]
            if program.get("show_custom_link") and program.get("custom_link"):
                program_links["custom_link"] = program["custom_link"]
                program_links["custom_link_label"] = program.get("custom_link_label", "Link")

    # Get enrollment details for richer response
    enrollment_id = tx.get("enrollment_id")
    participants = []
    booker_name = ""
    booker_email = ""
    if enrollment_id:
        enrollment = await db.enrollments.find_one({"id": enrollment_id}, {"_id": 0})
        if enrollment:
            participants = enrollment.get("participants", [])
            booker_name = enrollment.get("booker_name", "")
            booker_email = enrollment.get("booker_email", "")

    # Fetch community whatsapp from settings
    settings = await db.site_settings.find_one({"type": "site_settings"}, {"_id": 0})
    community_whatsapp = settings.get("community_whatsapp_link", "") if settings else ""

    # If already marked as paid, return immediately (prevent double processing)
    if tx.get("payment_status") == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "amount": tx.get("amount", 0),
            "currency": tx.get("currency", "usd"),
            "item_title": tx.get("item_title", ""),
            "program_links": program_links,
            "community_whatsapp": community_whatsapp,
            "participants": participants,
            "booker_name": booker_name,
            "booker_email": booker_email,
        }

    # Poll Stripe for status
    host_url = str(http_request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=await _get_stripe_key(), webhook_url=webhook_url)

    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

        # Update transaction
        new_status = status.payment_status
        await db.payment_transactions.update_one(
            {"stripe_session_id": session_id},
            {"$set": {
                "payment_status": new_status,
                "updated_at": datetime.now(timezone.utc),
            }}
        )

        # Send confirmation emails when payment is newly confirmed
        if new_status == "paid" and not tx.get("emails_sent"):
            # Extract card country from Stripe for fraud detection
            try:
                stripe_lib.api_key = await _get_stripe_key()
                stripe_session = stripe_lib.checkout.Session.retrieve(
                    session_id, expand=["payment_intent.payment_method"]
                )
                card_country = None
                billing_country = None
                if stripe_session.payment_intent and stripe_session.payment_intent.payment_method:
                    pm = stripe_session.payment_intent.payment_method
                    if hasattr(pm, 'card') and pm.card:
                        card_country = pm.card.country
                    if hasattr(pm, 'billing_details') and pm.billing_details and pm.billing_details.address:
                        billing_country = pm.billing_details.address.country

                # Store card info in transaction
                card_info = {}
                if card_country:
                    card_info["card_country"] = card_country
                if billing_country:
                    card_info["billing_country"] = billing_country
                if card_info:
                    await db.payment_transactions.update_one(
                        {"stripe_session_id": session_id},
                        {"$set": card_info}
                    )

                # Run post-payment fraud check
                if enrollment_id and (card_country or billing_country):
                    await _run_post_payment_fraud_check(
                        enrollment_id, session_id, tx,
                        card_country=card_country,
                        billing_country=billing_country,
                    )
            except Exception as e:
                logger.warning(f"Card country extraction failed for {session_id}: {e}")

            # Generate UIDs for all participants
            await generate_participant_uids(session_id)
            background_tasks.add_task(send_enrollment_emails, session_id)

        # Re-fetch participants after UID generation
        if enrollment_id:
            enrollment = await db.enrollments.find_one({"id": enrollment_id}, {"_id": 0})
            if enrollment:
                participants = enrollment.get("participants", [])

        return {
            "status": status.status,
            "payment_status": new_status,
            "amount": status.amount_total / 100,  # Convert from cents
            "currency": status.currency,
            "item_title": tx.get("item_title", ""),
            "program_links": program_links,
            "community_whatsapp": community_whatsapp,
            "participants": participants,
            "booker_name": booker_name,
            "booker_email": booker_email,
        }
    except Exception as e:
        return {
            "status": "pending",
            "payment_status": "pending",
            "amount": tx.get("amount", 0),
            "currency": tx.get("currency", "usd"),
            "item_title": tx.get("item_title", ""),
            "program_links": program_links,
            "community_whatsapp": community_whatsapp,
            "participants": participants,
            "booker_name": booker_name,
            "booker_email": booker_email,
            "error": str(e),
        }


@router.get("/transactions")
async def get_transactions():
    transactions = await db.payment_transactions.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return transactions
