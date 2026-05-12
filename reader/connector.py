import imaplib
import email
import json
import requests
import time
import os
import pandas as pd
from datetime import datetime

CLASSIFY_URL = "http://localhost:8001/classify"
DATA_PATH = "data/processed_emails.csv"
CONFIG_PATH = "data/email_config.json"

def load_credentials():
    """Load email credentials from env vars (priority) or config file."""
    email_user = os.getenv("OTTO_EMAIL_USER")
    email_pass = os.getenv("OTTO_EMAIL_PASS")
    imap_server = os.getenv("OTTO_IMAP_SERVER")

    if email_user and email_pass:
        return email_user, email_pass, imap_server or "outlook.office365.com"

    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH) as f:
            config = json.load(f)
        if config.get("demo") == "true":
            print("App is in demo mode. Connect a real inbox in the app first.")
            return None, None, None
        return config.get("email"), config.get("password"), config.get("imapServer")

    return None, None, None

def poll_inbox():
    email_user, email_pass, imap_server = load_credentials()

    if not email_user or not email_pass:
        print("Error: No email credentials found.")
        print("Run the Ottochive app and complete the email setup, or set")
        print("OTTO_EMAIL_USER / OTTO_EMAIL_PASS environment variables.")
        return False

    print(f"[{datetime.now()}] Connecting to {imap_server} as {email_user}...")
    try:
        mail = imaplib.IMAP4_SSL(imap_server)
        mail.login(email_user, email_pass)
        mail.select("inbox")

        _, messages = mail.search(None, 'UNSEEN')

        for num in messages[0].split():
            _, data = mail.fetch(num, '(RFC822)')
            msg = email.message_from_bytes(data[0][1])

            subject = msg['Subject']
            sender = msg['From']

            if msg.is_multipart():
                body_parts = []
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        body_parts.append(part.get_payload(decode=True).decode())
                body = "\n".join(body_parts)
            else:
                body = msg.get_payload(decode=True).decode()

            print(f"Classifying: {subject[:50]}...")
            try:
                response = requests.post(CLASSIFY_URL, json={"text": body})
                if response.status_code == 200:
                    result = response.json()
                    label = result['label']

                    new_row = {
                        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "sender": sender,
                        "subject": subject,
                        "label": label,
                        "text": body[:500]
                    }

                    df = pd.DataFrame([new_row])
                    header = not os.path.exists(DATA_PATH)
                    df.to_csv(DATA_PATH, mode='a', index=False, header=header)
                    print(f"  → {label}")
            except Exception as e:
                print(f"Classification error: {e}")

        mail.close()
        mail.logout()
        return True
    except Exception as e:
        print(f"Connection error: {e}")
        return False

if __name__ == "__main__":
    email_user, _, _ = load_credentials()
    if not email_user:
        print("No credentials configured. Open the Ottochive app and complete setup first.")
    else:
        print(f"Starting Ottochive connector for {email_user}")
        print("Polling inbox every 10 minutes. Press Ctrl+C to stop.\n")
        while True:
            poll_inbox()
            print("Sleeping for 10 minutes...")
            time.sleep(600)
