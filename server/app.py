from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import boto3
from openai import OpenAI
import numpy as np
from decimal import Decimal
from dotenv import load_dotenv
import base64
import os
from google_auth import get_latest_emails, get_credentials
load_dotenv()

app = FastAPI()
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Emails')

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class EmailRequest(BaseModel):
    number_of_emails: int

@app.get('/')
async def index():
    return "Hello World"

@app.post('/get-emails/')
async def get_emails(request: EmailRequest):
    if request.number_of_emails <= 0:
        raise HTTPException(status_code=400, detail="Number of emails must be greater than 0")

    creds = get_credentials()
    emails = get_latest_emails(creds, max_results=request.number_of_emails)

    for email in emails:
        email_id = email['id']
        snippet = email['snippet']
        payload = email['payload']

        subject = next((header['value'] for header in payload['headers'] if header['name'] == 'Subject'), None)
        sender = next((header['value'] for header in payload['headers'] if header['name'] == 'From'), None)

        plain_text_body = None
        for part in payload['parts']:
            if part['mimeType'] == 'text/plain':
                plain_text_body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                break  

        if plain_text_body is None:
            print(f"Email ID {email_id} has no plain text body.")
            continue  
        elif plain_text_body.strip() == "":
            print(f"Email ID {email_id} has an empty plain text body.")
            continue
        print(plain_text_body)
        embedding_response = client.embeddings.create(
            input=plain_text_body,
            model="text-embedding-3-small"
        )
        embedding = embedding_response.data[0].embedding
        embedding = [Decimal(str(x)) for x in embedding]
        table.put_item(Item={
            'email_id': email_id,
            'snippet': snippet,
            'subject': subject,
            'from': sender,
            'plain_text_body': plain_text_body,
            'embedding': embedding
        })

    return {"emails": emails}


@app.post('/query-email/')
async def query_email(query: str):
    query_embedding_response = client.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    query_embedding = query_embedding_response.data[0].embedding

    response = table.scan()
    emails = response['Items']

    similarities = []
    for email in emails:
        email_embedding = np.array(email['embedding'])
        email_embedding_float = np.array([float(x) for x in email_embedding])

        similarity = np.dot(query_embedding, email_embedding_float) / (np.linalg.norm(query_embedding) * np.linalg.norm(email_embedding_float))
        similarities.append((email, similarity))

    top_emails = sorted(similarities, key=lambda x: x[1], reverse=True)[:5]

    if not top_emails:
        return {"response": "No relevant emails found."}

    email_contents = "\n".join([f"From: {email['from']}\nSubject: {email['subject']}\nBody: {email['plain_text_body']}" for email, _ in top_emails])
    prompt = f"Based on the following emails, answer the query: '{query}'\n\nEmails:\n{email_contents}\n\nResponse:"

    try:
        openai_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
        )
        generated_response = openai_response.choices[0].message.content
        print(generated_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"response": generated_response}

@app.post('/malware-check/')
async def query_email():
    query = """
        Please analyze the following emails and determine whether they are safe to open or potentially malicious. 
    Consider factors such as the sender's email address, subject line, and content of the email including format of Links. 
    Provide a brief explanation for your assessment.
    If you feel any Link is unsafe then mention it specifically whose content should be assessed.
    Is there any cybersecurity risk in any mail do you feel?
    """
    query_embedding_response = client.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    query_embedding = query_embedding_response.data[0].embedding

    response = table.scan()
    emails = response['Items']

    similarities = []
    for email in emails:
        email_embedding = np.array(email['embedding'])
        email_embedding_float = np.array([float(x) for x in email_embedding])

        similarity = np.dot(query_embedding, email_embedding_float) / (np.linalg.norm(query_embedding) * np.linalg.norm(email_embedding_float))
        similarities.append((email, similarity))

    top_emails = sorted(similarities, key=lambda x: x[1], reverse=True)[:5]

    if not top_emails:
        return {"response": "No relevant emails found."}

    email_contents = "\n".join([f"From: {email['from']}\nSubject: {email['subject']}\nBody: {email['plain_text_body']}" for email, _ in top_emails])
    prompt = f"Based on the following emails, answer the query: '{query}'\n\nEmails:\n{email_contents}\n\nResponse:"

    try:
        openai_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
        )
        generated_response = openai_response.choices[0].message.content
        print(generated_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"response": generated_response}