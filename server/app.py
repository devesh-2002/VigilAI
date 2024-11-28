from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3
from openai import OpenAI
import numpy as np
from decimal import Decimal
from dotenv import load_dotenv
import base64
import os
from google_auth import get_latest_emails, get_credentials
from tensorflow.keras.models import load_model
from fastapi import FastAPI, File, UploadFile
from tensorflow.keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
import pickle


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Emails')

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class TextInput(BaseModel):
    text: str

with open('tokenizer.pkl', 'rb') as handle:
    tokenizer = pickle.load(handle)

class EmailRequest(BaseModel):
    number_of_emails: int
class QueryRequest(BaseModel):
    query: str

class XssRequest(BaseModel):
    text: str 
    
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
        if 'parts' in payload:
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
async def query_email(query: QueryRequest):
    print(f"Received query: {query}")
    query_embedding_response = client.embeddings.create(
        input=str(query),
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
    prompt = f"Based on the following emails, Be elaborate if possible. answer the query. : '{query}'\n\nEmails:\n{email_contents}\n\nResponse:"

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

def preprocess_file(file_path, max_length=1024):
    with open(file_path, 'rb') as f:
        data = np.frombuffer(f.read(), dtype=np.uint8)
        if len(data) < max_length:
            data = np.pad(data, (0, max_length - len(data)), 'constant')
        else:
            data = data[:max_length]
    return data.reshape(-1, 1024, 1)

@app.post("/detect-malware/")
async def detect_malware(input_file: UploadFile = File(...), reference_file: UploadFile = File(...)):
    input_file_path = f"/tmp/{input_file.filename}"
    reference_file_path = f"/tmp/{reference_file.filename}"

    with open(input_file_path, "wb") as f:
        f.write(await input_file.read())
    with open(reference_file_path, "wb") as f:
        f.write(await reference_file.read())

    input_data = preprocess_file(input_file_path)
    reference_data = preprocess_file(reference_file_path)

    prediction = siamese_model.predict([input_data, reference_data])
    similarity_score = prediction[0][0]

    if similarity_score > 0.5:
        result = {"message": "The input file is likely malware.", "similarity_score": float(similarity_score)}
    else:
        result = {"message": "The input file is likely benign.", "similarity_score": float(similarity_score)}

    return JSONResponse(content=result)

xss_model = load_model('XSS_Detection.h5')
tokenizer = Tokenizer(num_words=5000)

@app.post('/xss-predict')
async def xss_predict(input: TextInput):
    sample_sequence = tokenizer.texts_to_sequences([input.text])
    padded_sample = pad_sequences(sample_sequence, maxlen=100)
    prediction = xss_model.predict(padded_sample)
    print(prediction)
    predicted_class = np.argmax(prediction)
    # return {"prediction": "XSS Prone!" if predicted_class == 1 else "Benign. Your code is safe!"}
    prompt = f"""Based on the following code : {input}. 
    The Predicted Class is : {predicted_class}. 0 means Benign, 1 means XSS Prone. 
    The prediction is {prediction}. 
    You need to give the result in terms of percentage, and what it means. 
    You also don't need to tell whether the prediction is correct or not.
    You need to give some suggestions to make improvements in the given code regardless of the prediction, atleast few suggestions should be related to  the current code.
    ."""
    openai_response = client.chat.completions.create(
                model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
    )
    generated_response = openai_response.choices[0].message.content
    print(generated_response)
    return generated_response



