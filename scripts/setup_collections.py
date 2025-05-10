from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["edudrop"]

def create_students_collection():
    db.create_collection("students", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "email", "password", "registeredOn"],
            "properties": {
                "name": {"bsonType": "string"},
                "email": {"bsonType": "string"},
                "password": {"bsonType": "string"},
                "registeredOn": {"bsonType": "date"},
                "profileCompleted": {"bsonType": "bool"}
            }
        }
    })

def create_profiles_collection():
    db.create_collection("profiles", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["studentId", "gender", "age", "standard", "state", "school"],
            "properties": {
                "studentId": {"bsonType": "objectId"},
                "gender": {"bsonType": "string"},
                "age": {"bsonType": "int"},
                "caste": {"bsonType": "string"},
                "area": {"bsonType": "string"},
                "standard": {"bsonType": "string"},
                "state": {"bsonType": "string"},
                "school": {"bsonType": "string"},

                "maritalStatus": {"bsonType": "int"},
                "applicationMode": {"bsonType": "int"},
                "applicationOrder": {"bsonType": "int"},
                "course": {"bsonType": "int"},
                "attendanceMode": {"bsonType": "int"},
                "previousQualification": {"bsonType": "int"},
                "nationality": {"bsonType": "int"},
                "motherQualification": {"bsonType": "int"},
                "fatherQualification": {"bsonType": "int"},
                "motherOccupation": {"bsonType": "int"},
                "fatherOccupation": {"bsonType": "int"},
                "displaced": {"bsonType": "int"},
                "specialNeeds": {"bsonType": "int"},
                "debtor": {"bsonType": "int"},
                "tuitionUpToDate": {"bsonType": "int"},
                "scholarshipHolder": {"bsonType": "int"}
            }
        }
    })


def create_performance_analytics_collection():
    db.create_collection("performance_analytics", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["studentId", "subjectScores", "weeklyProgress", "timeSpent", "riskScore", "riskLabel"],
            "properties": {
                "studentId": {"bsonType": "objectId"},
                "subjectScores": {
                    "bsonType": "array",
                    "items": {
                        "bsonType": "object",
                        "required": ["subject", "score"],
                        "properties": {
                            "subjectId": {"bsonType": "string"},
                            "subject": {"bsonType": "string"},
                            "score": {"bsonType": "double"}
                        }
                    }
                },
                "weeklyProgress": {
                    "bsonType": "array",
                    "items": {
                        "bsonType": "object",
                        "required": ["week", "progress"],
                        "properties": {
                            "week": {"bsonType": "string"},
                            "progress": {"bsonType": "int"}
                        }
                    }
                },
                "timeSpent": {
                    "bsonType": "array",
                    "items": {
                        "bsonType": "object",
                        "required": ["subject", "minutes"],
                        "properties": {
                            "subject": {"bsonType": "string"},
                            "minutes": {"bsonType": "int"}
                        }
                    }
                },
                "riskScore": {"bsonType": "int"},
                "riskLabel": {"bsonType": "string"},
                "lastUpdated": {"bsonType": "date"},
                "attendance": {
                    "bsonType": "object",
                    "properties": {
                        "totalDays": {"bsonType": "int"},
                        "presentDays": {"bsonType": "int"}
                    }
                    }
            }
        }
    })

def setup_all():
    collections = db.list_collection_names()
    
    if "students" not in collections:
        create_students_collection()
        print("✅ Created 'students' collection.")
    if "profiles" not in collections:
        create_profiles_collection()
        print("✅ Created 'profiles' collection.")
    if "performance_analytics" not in collections:
        create_performance_analytics_collection()
        print("✅ Created 'performance_analytics' collection.")

if __name__ == "__main__":
    setup_all()
