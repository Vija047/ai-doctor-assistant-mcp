import json
from services.notification_service import NotificationService

def send_email(to: str, message: str) -> str:
    """Send an email confirmation to the patient."""
    success = NotificationService.send_email(to, message)
    if success:
        return json.dumps({"status": "success", "message": "Email sent successfully"})
    else:
        return json.dumps({"status": "error", "message": "Failed to send email"})
