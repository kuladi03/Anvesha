import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def load_dataset(dataset_name):
    client = MongoClient(os.getenv("MongoURI"))
    db = client["anvesha"]


    # Check if collection exists
    if dataset_name not in db.list_collection_names():
        print(f"[❌] Collection '{dataset_name}' not found.")
        return pd.DataFrame()

    collection = db[dataset_name]
    data = list(collection.find({}, {"_id": 0}))  # exclude _id
    df = pd.DataFrame(data)
    print(f"[✅] Loaded '{dataset_name}' dataset with shape: {df.shape}")
    return df