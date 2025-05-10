import pandas as pd
from pymongo import MongoClient
import os

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['edudrop']

# Path to the folder containing all your CSVs
dataset_folder = r"D:\Projects\New folder\edudrop\datasets"

# Loop through each CSV and insert into MongoDB
for filename in os.listdir(dataset_folder):
    if filename.endswith('.csv'):
        dataset_name = filename.replace('.csv', '').lower().replace(' ', '_')  # e.g., maharashtra.csv -> maharashtra_dataset
        filepath = os.path.join(dataset_folder, filename)

        # Read and clean
        df = pd.read_csv(filepath)
        if 'Nacionality' in df.columns:
            df.rename(columns={'Nacionality': 'Nationality'}, inplace=True)

        collection = db[f"{dataset_name}"]
        collection.delete_many({})
        collection.insert_many(df.to_dict('records'))
        print(f"✅ Inserted {filename} into '{dataset_name}'")
