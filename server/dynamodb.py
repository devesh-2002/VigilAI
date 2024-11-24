import os
import boto3
from dotenv import load_dotenv

load_dotenv()

session = boto3.Session(
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_DEFAULT_REGION')
)

dynamodb = session.resource('dynamodb')

table = dynamodb.create_table(
    TableName='Emails',
    KeySchema=[
        {
            'AttributeName': 'email_id',
            'KeyType': 'HASH' 
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'email_id',
            'AttributeType': 'S' 
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

table.meta.client.get_waiter('table_exists').wait(TableName='Emails')

print("Table created successfully!")

def delete_table():
    table = dynamodb.Table('Emails')
    table.delete()
    table.meta.client.get_waiter('table_not_exists').wait(TableName='Emails')
    print("Table deleted successfully!")
delete_table()