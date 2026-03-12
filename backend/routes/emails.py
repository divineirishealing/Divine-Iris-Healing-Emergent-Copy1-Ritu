import os
import asyncio
import logging
import resend
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')


async def send_email(to: str, subject: str, html: str):
    params = {
        "from": SENDER_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to}: {result.get('id', 'OK')}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return None


def enrollment_confirmation_email(booker_name, item_title, participants, total, currency_symbol, attendance_modes, booker_email, phone, program_links=None):
    participant_rows = ""
    for p in participants:
        mode = p.get("attendance_mode", "online")
        mode_label = "Online (Zoom)" if mode == "online" else "Remote Healing"
        mode_color = "#2563eb" if mode == "online" else "#7c3aed"
        first_time = "Yes" if p.get("is_first_time") else "No"
        uid = p.get("uid", "")
        uid_html = f'<br><span style="font-size:10px;color:#D4AF37;font-weight:600">UID: {uid}</span>' if uid else ""
        referred = p.get("referred_by_name", "")
        ref_html = f'<br><span style="font-size:10px;color:#888">Ref: {referred}</span>' if referred else ""
        participant_rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333">{p['name']}{uid_html}{ref_html}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333">{p.get('relationship','')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">
            <span style="background:{mode_color};color:#fff;padding:3px 10px;border-radius:12px;font-size:11px">{mode_label}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555">{first_time}</td>
        </tr>"""

    # Build links section
    links_html = ""
    if program_links:
        link_items = ""
        if program_links.get("whatsapp_group_link"):
            link_items += f'<a href="{program_links["whatsapp_group_link"]}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;margin:4px">Join WhatsApp Group</a>'
        if program_links.get("zoom_link"):
            link_items += f'<a href="{program_links["zoom_link"]}" style="display:inline-block;background:#2D8CFF;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;margin:4px">Join Zoom Meeting</a>'
        if program_links.get("custom_link"):
            label = program_links.get("custom_link_label", "View Link")
            link_items += f'<a href="{program_links["custom_link"]}" style="display:inline-block;background:#D4AF37;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;margin:4px">{label}</a>'
        if link_items:
            links_html = f"""
            <div style="padding:0 32px 24px">
              <div style="background:#f0f7ff;border:1px solid #d0e3f7;border-radius:10px;padding:20px;text-align:center">
                <p style="color:#333;font-size:14px;margin:0 0 12px;font-weight:600">Important Links</p>
                <p style="color:#666;font-size:12px;margin:0 0 16px">Please save these links for your upcoming sessions</p>
                {link_items}
              </div>
            </div>"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f8f8f8">
      <div style="max-width:600px;margin:0 auto;background:#ffffff">
        
        <div style="background:#1a1a1a;padding:32px 24px;text-align:center">
          <h1 style="color:#D4AF37;margin:0;font-size:24px;font-weight:400;letter-spacing:3px">DIVINE IRIS HEALING</h1>
        </div>

        <div style="padding:40px 32px;text-align:center">
          <div style="width:56px;height:56px;background:#e8f5e9;border-radius:50%;margin:0 auto 16px;line-height:56px;font-size:28px">&#10003;</div>
          <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 8px;font-weight:400">Enrollment Confirmed</h2>
          <p style="color:#888;font-size:14px;margin:0">Thank you for enrolling, {booker_name}!</p>
        </div>

        <div style="padding:0 32px 24px">
          <div style="background:#faf8f0;border:1px solid #e8e0c8;border-radius:10px;padding:20px">
            <h3 style="color:#D4AF37;font-size:16px;margin:0 0 4px;font-weight:600">{item_title}</h3>
            <p style="color:#888;font-size:12px;margin:0 0 16px">Booking Reference: Confirmed</p>
            
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#f5f0e0">
                  <th style="padding:8px 12px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px">Participant</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px">Relation</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px">Mode</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px">First Time</th>
                </tr>
              </thead>
              <tbody>
                {participant_rows}
              </tbody>
            </table>

            <div style="border-top:2px solid #D4AF37;margin-top:16px;padding-top:16px;text-align:right">
              <span style="font-size:13px;color:#666">Total Paid: </span>
              <span style="font-size:20px;color:#D4AF37;font-weight:700">{currency_symbol}{total}</span>
            </div>
          </div>
        </div>

        {links_html}

        <div style="padding:0 32px 32px">
          <div style="background:#f9f9f9;border-radius:10px;padding:16px 20px;font-size:13px;color:#555">
            <p style="margin:0 0 4px"><strong>Booked by:</strong> {booker_name}</p>
            <p style="margin:0 0 4px"><strong>Email:</strong> {booker_email}</p>
            <p style="margin:0"><strong>Phone:</strong> {phone}</p>
          </div>
        </div>

        <div style="background:#1a1a1a;padding:24px;text-align:center">
          <p style="color:#D4AF37;font-size:12px;margin:0 0 4px;letter-spacing:2px">DIVINE IRIS HEALING</p>
          <p style="color:#666;font-size:11px;margin:0">Delve into the deeper realm of your soul</p>
          <p style="color:#555;font-size:11px;margin:8px 0 0">support@divineirishealing.com | +971553325778</p>
        </div>
      </div>
    </body>
    </html>
    """
    return html


def participant_notification_email(participant_name, item_title, attendance_mode, booker_name):
    mode_label = "Online (Zoom)" if attendance_mode == "online" else "Remote Healing"
    mode_detail = "You will receive a Zoom link closer to the session date." if attendance_mode == "online" else "This is a remote healing session — no call needed. The healer will work on your energy remotely during the scheduled time."

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f8f8f8">
      <div style="max-width:600px;margin:0 auto;background:#ffffff">
        
        <div style="background:#1a1a1a;padding:32px 24px;text-align:center">
          <h1 style="color:#D4AF37;margin:0;font-size:24px;font-weight:400;letter-spacing:3px">DIVINE IRIS HEALING</h1>
        </div>

        <div style="padding:40px 32px;text-align:center">
          <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 8px;font-weight:400">You've Been Enrolled!</h2>
          <p style="color:#888;font-size:14px;margin:0">Hi {participant_name}, {booker_name} has enrolled you in:</p>
        </div>

        <div style="padding:0 32px 24px">
          <div style="background:#faf8f0;border:1px solid #e8e0c8;border-radius:10px;padding:24px;text-align:center">
            <h3 style="color:#D4AF37;font-size:18px;margin:0 0 12px">{item_title}</h3>
            <p style="color:#333;font-size:14px;margin:0 0 8px"><strong>Mode:</strong> {mode_label}</p>
            <p style="color:#666;font-size:13px;margin:0">{mode_detail}</p>
          </div>
        </div>

        <div style="padding:0 32px 32px;text-align:center">
          <p style="color:#888;font-size:13px">More details will be shared closer to the session date. If you have any questions, please reach out.</p>
        </div>

        <div style="background:#1a1a1a;padding:24px;text-align:center">
          <p style="color:#D4AF37;font-size:12px;margin:0 0 4px;letter-spacing:2px">DIVINE IRIS HEALING</p>
          <p style="color:#666;font-size:11px;margin:0">Delve into the deeper realm of your soul</p>
          <p style="color:#555;font-size:11px;margin:8px 0 0">support@divineirishealing.com | +971553325778</p>
        </div>
      </div>
    </body>
    </html>
    """
    return html
