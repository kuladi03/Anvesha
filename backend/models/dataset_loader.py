import pandas as pd
from pymongo import MongoClient

def load_dataset(dataset_name):
    client = MongoClient("mongodb://localhost:27017/")  # use your connection string
    db = client["anvesha"]  # your DB name from Compass

    # Check if collection exists
    if dataset_name not in db.list_collection_names():
        print(f"[❌] Collection '{dataset_name}' not found.")
        return pd.DataFrame()

    collection = db[dataset_name]
    data = list(collection.find({}, {"_id": 0}))  # exclude _id
    df = pd.DataFrame(data)
    print(f"[✅] Loaded '{dataset_name}' dataset with shape: {df.shape}")
    return df