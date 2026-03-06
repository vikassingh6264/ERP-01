from fastapi import BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os

class EmailSchema(BaseModel):
    recipients: List[str]
    subject: str
    body: str
    attachment_path: Optional[str] = None

# Email configuration - Update with your SMTP details
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', 'noreply@chemexport.com')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

def send_email(email_data: EmailSchema):
    """Send email with optional attachment"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = ', '.join(email_data.recipients)
        msg['Subject'] = email_data.subject
        
        # Add body
        msg.attach(MIMEText(email_data.body, 'html'))
        
        # Add attachment if provided
        if email_data.attachment_path and os.path.exists(email_data.attachment_path):
            with open(email_data.attachment_path, 'rb') as f:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(f.read())
                encoders.encode_base64(part)
                filename = os.path.basename(email_data.attachment_path)
                part.add_header('Content-Disposition', f'attachment; filename={filename}')
                msg.attach(part)
        
        # Send email
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        if SMTP_PASSWORD:
            server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False