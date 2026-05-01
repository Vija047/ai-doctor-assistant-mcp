import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

class NotificationService:
    @staticmethod
    def send_email(to: str, message: str, subject: str = "Appointment Confirmation") -> bool:
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            print(f"SMTP credentials not set. Mock Email sent to {to}: {message}")
            return True
            
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_USERNAME
            msg['To'] = to
            msg['Subject'] = subject
            
            msg.attach(MIMEText(message, 'plain'))
            
            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            print(f"Real Email sent successfully to {to}")
            return True
        except Exception as e:
            print(f"Failed to send real email: {e}")
            return False
            
    @staticmethod
    def send_slack_notification(channel: str, message: str) -> bool:
        # Mocking a Slack or WhatsApp notification
        print(f"SLACK NOTIFICATION to {channel}:\n{message}\n-------------------------")
        return True
