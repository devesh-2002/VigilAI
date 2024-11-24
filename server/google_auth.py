# google_auth.py
import os
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_latest_emails(creds, max_results=5):
    """Fetch and return the latest emails, including images and attachments."""
    service = build('gmail', 'v1', credentials=creds)
    results = service.users().messages().list(userId='me', maxResults=max_results).execute()
    messages = results.get('messages', [])

    email_contents = []
    if not messages:
        return email_contents

    for message in messages:
        msg = service.users().messages().get(userId='me', id=message['id'], format='full').execute()
        email_data = {
            'id': msg['id'],
            'snippet': msg['snippet'],
            'payload': msg['payload']
        }
        email_contents.append(email_data)

    return email_contents

def get_credentials():
    """Get Gmail API credentials."""
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds