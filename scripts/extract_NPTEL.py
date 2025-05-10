import pandas as pd
from pymongo import MongoClient

# Step 1: Read Excel file
df = pd.read_excel(r"D:\Projects\New folder\anvesha\datasets\Final Course List (Jan - Apr 2025).xlsx")

# Step 2: Rename and clean columns (adjust based on actual sheet)
df = df.rename(columns={
    "Course ID": "course_id",
    "Discipline": "discipline",
    "Course Name": "title",
    "SME Name": "instructor",
    "Institute": "institute",
    '"Co-ordinating Institute"': "coordinating_institute",
    "Duration": "duration",
    "Type of course": "course_type",
    "Exam date": "exam_date",
    "UG/PG": "level",
    "Core/Elective": "category",
    "FDP": "fdp",
    "Applicable NPTEL Domain": "nptel_domain",
    "Click here to Join the course": "join_link",
    "Old course URL": "old_url",
    "NPTEL URL": "nptel_url"
})

# Step 3: Drop completely empty rows (optional)
df = df.dropna(subset=["course_id", "title", "discipline"], how="all")

# Step 4: Convert DataFrame to dict
course_documents = df.to_dict(orient='records')

# Step 5: Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["anvesha"]
courses_collection = db["courses"]

# Step 6: Insert into MongoDB
courses_collection.insert_many(course_documents)

print(f"✅ Inserted {len(course_documents)} courses into MongoDB 'courses' collection.")
