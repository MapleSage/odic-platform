import os
import smtplib
from email.mime.text import MIMEText

import requests
from fastapi import HTTPException
from pydantic import BaseModel

AZURE_SMTP_HOST = os.environ.get("AZURE_SMTP_HOST", "")
AZURE_SMTP_PORT = int(os.environ.get("AZURE_SMTP_PORT") or "587")
AZURE_SMTP_USER = os.environ.get("AZURE_SMTP_USER", "")
AZURE_SMTP_PASSWORD = os.environ.get("AZURE_SMTP_PASSWORD", "")
AZURE_SMTP_FROM = os.environ.get("AZURE_SMTP_FROM", "")

INFOBIP_BASE_URL = os.environ.get("INFOBIP_BASE_URL", "").rstrip("/")
INFOBIP_API_KEY = os.environ.get("INFOBIP_API_KEY", "")
INFOBIP_WHATSAPP_SENDER = os.environ.get("INFOBIP_WHATSAPP_SENDER", "")


def _email_configured() -> bool:
    return bool(AZURE_SMTP_HOST and AZURE_SMTP_USER and AZURE_SMTP_PASSWORD and AZURE_SMTP_FROM)


def _whatsapp_configured() -> bool:
    return bool(INFOBIP_BASE_URL and INFOBIP_API_KEY and INFOBIP_WHATSAPP_SENDER)


def get_connect_status() -> dict:
    """Channel configuration status for the Connect pack. Honest per-channel state --
    email and WhatsApp send live once credentials are set; voice is reporting-only for now."""
    return {
        "pack": "connect",
        "channels": {
            "email": {"configured": _email_configured(), "provider": "azure-smtp"},
            "whatsapp": {"configured": _whatsapp_configured(), "provider": "infobip"},
            "voice": {
                "configured": False,
                "provider": "infobip",
                "note": "Voice call orchestration is not yet built -- status reporting only.",
            },
        },
        "note": (
            "Connect is enabled per-org from the workspace switcher. Email and WhatsApp send live once "
            "Azure SMTP and Infobip credentials are configured in this environment."
        ),
    }


class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str


class EmailResponse(BaseModel):
    status: str


def send_email(request: EmailRequest) -> EmailResponse:
    if not _email_configured():
        raise HTTPException(status_code=503, detail="Email is not configured in this environment (Azure SMTP credentials missing)")

    message = MIMEText(request.body)
    message["Subject"] = request.subject
    message["From"] = AZURE_SMTP_FROM
    message["To"] = request.to

    try:
        with smtplib.SMTP(AZURE_SMTP_HOST, AZURE_SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(AZURE_SMTP_USER, AZURE_SMTP_PASSWORD)
            server.sendmail(AZURE_SMTP_FROM, [request.to], message.as_string())
    except (smtplib.SMTPException, OSError) as exc:
        raise HTTPException(status_code=502, detail=f"Email send failed: {exc}") from exc

    return EmailResponse(status="sent")


class WhatsAppRequest(BaseModel):
    to: str
    message: str


class WhatsAppResponse(BaseModel):
    status: str
    messageId: str | None = None


def send_whatsapp(request: WhatsAppRequest) -> WhatsAppResponse:
    if not _whatsapp_configured():
        raise HTTPException(status_code=503, detail="WhatsApp is not configured in this environment (Infobip credentials missing)")

    url = f"{INFOBIP_BASE_URL}/whatsapp/1/message/text"
    payload = {
        "from": INFOBIP_WHATSAPP_SENDER,
        "to": request.to,
        "content": {"text": request.message},
    }
    try:
        response = requests.post(
            url,
            headers={"Authorization": f"App {INFOBIP_API_KEY}", "Content-Type": "application/json"},
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"WhatsApp send failed: {exc}") from exc

    data = response.json()
    message_id = None
    try:
        message_id = data["messages"][0]["messageId"]
    except (KeyError, IndexError, TypeError):
        pass
    return WhatsAppResponse(status="sent", messageId=message_id)
