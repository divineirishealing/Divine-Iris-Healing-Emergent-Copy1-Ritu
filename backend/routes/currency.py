from fastapi import APIRouter, Request
from models import CurrencyInfo
import httpx, logging, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/currency", tags=["Currency"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logger = logging.getLogger(__name__)

# Country code → currency mapping
# Strict 3-currency rule: India=INR, Gulf=AED, everyone else=USD
AED_COUNTRIES = {"AE", "SA", "QA", "KW", "OM", "BH"}
INR_COUNTRIES = {"IN"}

def get_currency_for_country(country_code):
    if country_code in INR_COUNTRIES:
        return "inr"
    if country_code in AED_COUNTRIES:
        return "aed"
    return "usd"

CURRENCY_SYMBOLS = {
    "aed": "AED", "inr": "INR", "usd": "USD", "gbp": "GBP", "eur": "EUR",
    "cad": "CAD", "aud": "AUD", "sgd": "SGD", "jpy": "JPY", "krw": "KRW",
    "sar": "SAR", "qar": "QAR", "kwd": "KWD", "omr": "OMR", "bhd": "BHD",
    "pkr": "PKR", "bdt": "BDT", "lkr": "LKR", "npr": "NPR", "myr": "MYR",
    "zar": "ZAR", "ngn": "NGN", "kes": "KES", "egp": "EGP", "php": "PHP",
    "thb": "THB", "idr": "IDR", "vnd": "VND", "brl": "BRL", "mxn": "MXN",
    "try": "TRY", "rub": "RUB", "cny": "CNY", "hkd": "HKD", "twd": "TWD",
    "nzd": "NZD", "chf": "CHF", "sek": "SEK", "nok": "NOK", "dkk": "DKK", "pln": "PLN",
}

# Default exchange rates (1 AED = X local currency) - admin can override
DEFAULT_EXCHANGE_RATES = {
    "gbp": 0.22, "eur": 0.25, "cad": 0.37, "aud": 0.41, "sgd": 0.37,
    "jpy": 40.8, "krw": 365.0, "sar": 1.02, "qar": 0.99, "kwd": 0.083,
    "omr": 0.105, "bhd": 0.103, "pkr": 76.0, "bdt": 29.4, "lkr": 87.0,
    "npr": 36.2, "myr": 1.21, "zar": 5.0, "ngn": 420.0, "kes": 42.0,
    "egp": 13.4, "php": 15.3, "thb": 9.7, "idr": 4290.0, "vnd": 6800.0,
    "brl": 1.33, "mxn": 4.62, "try": 8.8, "rub": 24.8, "cny": 1.97,
    "hkd": 2.13, "twd": 8.7, "nzd": 0.45, "chf": 0.24, "sek": 2.82,
    "nok": 2.88, "dkk": 1.87, "pln": 1.08,
}


async def get_exchange_rates():
    """Get exchange rates from DB (admin-managed) with defaults fallback"""
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if settings and settings.get("exchange_rates"):
        merged = {**DEFAULT_EXCHANGE_RATES, **settings["exchange_rates"]}
        return merged
    return DEFAULT_EXCHANGE_RATES


async def detect_country_from_ip(request: Request) -> str:
    """Detect country from IP using ip-api.com"""
    forwarded = request.headers.get("x-forwarded-for", "")
    ip = forwarded.split(",")[0].strip() if forwarded else request.client.host

    # Check Cloudflare header first
    cf_country = request.headers.get("CF-IPCountry", "")
    if cf_country and len(cf_country) == 2:
        return cf_country.upper()

    try:
        async with httpx.AsyncClient(timeout=5) as http:
            resp = await http.get(f"http://ip-api.com/json/{ip}?fields=status,countryCode")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "success":
                    return data.get("countryCode", "AE")
    except Exception as e:
        logger.warning(f"IP detection failed: {e}")

    return "AE"


@router.get("/detect")
async def detect_currency(request: Request, preview_country: str = None):
    """Detect user's currency from IP, return currency + exchange rate + country"""
    if preview_country:
        country = preview_country.upper()
    else:
        country = await detect_country_from_ip(request)
    currency = get_currency_for_country(country)
    symbol = CURRENCY_SYMBOLS.get(currency, currency.upper())
    rates = await get_exchange_rates()

    # All 3 currencies are primary (prices set directly in admin)
    return {
        "currency": currency,
        "symbol": symbol,
        "country": country,
        "rate": 1.0,
        "is_primary": True,
    }


@router.get("/exchange-rates")
async def get_rates():
    """Get all exchange rates (admin-managed)"""
    rates = await get_exchange_rates()
    return {"base": "aed", "rates": rates}


@router.put("/exchange-rates")
async def update_rates(data: dict):
    """Admin: Update fixed exchange rates"""
    rates = data.get("rates", {})
    await db.site_settings.update_one(
        {"id": "site_settings"},
        {"$set": {"exchange_rates": rates}},
        upsert=True,
    )
    return {"message": "Exchange rates updated", "rates": rates}


@router.get("/supported")
async def get_supported_currencies():
    return {
        "currencies": [
            {"code": "aed", "symbol": "AED", "name": "UAE Dirham"},
            {"code": "usd", "symbol": "USD", "name": "US Dollar"},
            {"code": "inr", "symbol": "INR", "name": "Indian Rupee"},
            {"code": "eur", "symbol": "EUR", "name": "Euro"},
            {"code": "gbp", "symbol": "GBP", "name": "British Pound"},
        ]
    }
