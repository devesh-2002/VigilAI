# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google_auth import get_latest_emails, get_credentials

app = FastAPI()

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

    return {"emails": emails}