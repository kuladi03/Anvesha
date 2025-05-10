from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Test connection
try:
    client = MongoClient(os.getenv("MongoURI"))
    print("Connection successful")
except Exception as e:
    print("Error:", e)

db = client["anvesha"]
collection = db["students"]
result = collection.find_one()  # Just fetch the first document
print(result)
