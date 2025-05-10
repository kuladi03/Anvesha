from pymongo import MongoClient
from datetime import datetime

def save_html_report_to_mongo(report_html, dataset_name: str, metadata=None):
    client = MongoClient("mongodb://localhost:27017/")
    db = client["edudrop"]
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
