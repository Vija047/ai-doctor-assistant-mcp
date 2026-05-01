import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

print(f"Testing SMTP with User: {SMTP_USERNAME}")
print(f"Password length: {len(SMTP_PASSWORD) if SMTP_PASSWORD else 0}")

try:
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USERNAME, SMTP_PASSWORD)
    print("SUCCESS: SMTP Login successful!")
    
    msg = MIMEText("Test message from Smart Doctor Assistant")
    msg['Subject'] = "SMTP Test"
    msg['From'] = SMTP_USERNAME
    msg['To'] = SMTP_USERNAME # Send to self
    
    server.send_message(msg)
    print("SUCCESS: Test email sent to yourself!")
    server.quit()
except Exception as e:
    print(f"FAILURE: {e}")
