import pandas as pd
from pymongo import MongoClient
import json

# Step 1: Load Excel
df = pd.read_excel(r"D:\Projects\New folder\anvesha\datasets\Final Course List (Jan - Apr 2025).xlsx")

# Step 2: Clean column names
df.columns = df.columns.str.strip()  # remove leading/trailing whitespaces
df.rename(columns={
    "Course Name": "title",
    "SME Name": "instructor",
    "Course ID": "course_id",
    "Co-ordinating Institute": "coordinating_institute",
    "Click here to Join the course": "join_link",
    "NPTEL URL": "nptel_url",
    "Duration": "duration",
    "Discipline": "discipline",
    "Institute": "institute",
    "Type of course": "course_type",
    "Exam date": "exam_date",
    "UG/PG": "level",
    "Core/Elective": "category",
    "FDP": "fdp",
    "Applicable NPTEL Domain": "nptel_domain"
}, inplace=True)

# Step 3: Filter only necessary columns
wanted_columns = [
    "course_id", "title", "instructor", "discipline", "institute",
    "coordinating_institute", "duration", "course_type", "exam_date",
    "level", "category", "fdp", "nptel_domain", "join_link", "nptel_url"
]
df = df[wanted_columns]

# Step 4: Fill missing with ""
df = df.fillna("")

# Step 5: Add origin field
df["origin"] = "NPTEL"

# Step 6: Convert to list of dictionaries
courses = df.to_dict(orient="records")

# Step 7: Upload to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["anvesha"]
db.courses.delete_many({})  # Optional: clear previous courses
db.courses.insert_many(courses)

print(f"✅ Uploaded {len(courses)} cleaned courses to MongoDB")
