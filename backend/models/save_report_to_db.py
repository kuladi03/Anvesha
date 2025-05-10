from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def save_html_report_to_mongo(report_html, dataset_name: str, metadata=None):
    client = MongoClient(os.getenv("MongoURI"))
    db = client["anvesha"]
    collection = db["reports"]

    report_doc = {
        "dataset": dataset_name,  # 🔥 Save dataset info here
        "generated_on": datetime.now(),
        "html": report_html,
        "metadata": metadata or {}
    }

    result = collection.insert_one(report_doc)
    print(f"[✅] Report saved in MongoDB with ID: {result.inserted_id}")
    return result.inserted_id
