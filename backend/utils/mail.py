from .config import settings
from email.message import EmailMessage
import aiosmtplib
from pathlib import Path


MAIL_FROM = settings.MAIL_FROM
MAIL_PASSWORD = settings.MAIL_PASSWORD
MAIL_SERVER = settings.MAIL_SERVER
MAIL_PORT = settings.MAIL_PORT
MAIL_CONSOLE = settings.MAIL_CONSOLE
ROOT_URL = settings.ROOT_URL
MAIL_USERNAME = settings.MAIL_USERNAME

# Get the templates directory path
TEMPLATES_DIR = Path(__file__).parent.parent / 'templates'


def load_email_template(template_name: str) -> str:
    template_path = TEMPLATES_DIR / template_name
    with open(template_path, 'r', encoding='utf-8') as file:
        return file.read()


async def send_email(to_email: str, subject: str, html_body: str) -> None:
    if MAIL_CONSOLE:
        print(f'📨 FAKE SEND to {to_email} — subject: {subject}')
        print(html_body)
        return

    message = EmailMessage()
    message['From'] = MAIL_FROM
    message['To'] = to_email
    message['Subject'] = subject
    message.set_content(html_body, subtype='html')

    client = aiosmtplib.SMTP(
        hostname=MAIL_SERVER,
        port=MAIL_PORT,
        use_tls=True
    )

    try:
        await client.connect()
        await client.login(MAIL_USERNAME, MAIL_PASSWORD)
        await client.send_message(message)
    except Exception as e:
        print(f'❌ Email send failed: {e}')
    finally:
        await client.quit()


async def send_verification_email(email: str, token: str) -> None:
    url = f'{ROOT_URL}/verify-email/{token}'
    template = load_email_template('email_verification.html')
    html_body = template.format(verification_url=url)
    await send_email(email, 'SummarMe Email Verification', html_body)


async def send_password_reset_email(email: str, token: str) -> None:
    url = f'{ROOT_URL}/reset-password/{token}'
    template = load_email_template('password_reset.html')
    html_body = template.format(reset_url=url)
    await send_email(email, 'SummarMe Password Reset', html_body)