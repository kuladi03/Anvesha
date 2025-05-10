from flask import Flask, Response, jsonify, request , Blueprint
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from bson.json_util import dumps
from bson import SON
import traceback
from flask_pymongo import PyMongo
from bson import ObjectId, json_util
import calendar
import joblib
import numpy as np
from collections import defaultdict
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="backend\.env")
# Get FRONTEND_URL from environment variables
frontend_url = os.getenv("FRONTEND_URL")
backend_url = os.getenv("BACKEND_URL")

app = Flask(__name__)
# Exact and strict CORS setup
# Set up CORS dynamically based on the environment
if os.getenv("FLASK_ENV") == "production":
    CORS(app, origins=[frontend_url], methods=["GET", "POST", "PUT", "OPTIONS"], allow_headers=["Content-Type"])
else:
    CORS(app, origins=["http://localhost:3000"], methods=["GET", "POST", "PUT", "OPTIONS"], allow_headers=["Content-Type"])

client = MongoClient(os.getenv("MongoURI"))
db = client["anvesha"]

model = joblib.load(r"models\dropout_risk_model.pkl")
label_encoders = joblib.load(r"models\label_encoders.pkl")

@app.route("/report/<report_id>")
def view_report(report_id):
    report = db["reports"].find_one({"_id": ObjectId(report_id)})
    if report:
        return Response(report["html"], mimetype="text/html")
    else:
        return "Report not found", 404
    
@app.route("/api/latest-report/<dataset>", methods=["GET"])
def get_latest_report(dataset):
    try:
        # Fetch the latest report for the specified dataset, sorted by 'generated_on' in descending order
        latest_report = db["reports"].find_one(
            {"dataset": dataset.lower()},
            sort=[("generated_on", -1)]
        )

        if latest_report:
            top_features = latest_report["metadata"].get("top_features", "")
            
            # Split the top_features string into a list, using commas as the delimiter
            top_features_list = [feature.strip() for feature in top_features.split(",")] if top_features else []

            # Return the data in a JSON format
            return jsonify({
                "report_id": str(latest_report["_id"]),
                "best_model": latest_report["metadata"].get("best_model"),
                "accuracy": latest_report["metadata"].get("accuracy"),
                "dropout_percentage": latest_report["metadata"].get("dropout_percentage"),
                "top_features": top_features_list
            })
        else:
            # Return error if no report is found
            return jsonify({"error": "No report found for this dataset"}), 404

    except Exception as e:
        # Return error if something goes wrong during the execution
        return jsonify({"error": str(e)}), 500



@app.route("/api/dashboard/<collection_name>", methods=["GET"])
def get_dashboard_data(collection_name):
    if collection_name not in db.list_collection_names():
        return jsonify({"error": "Collection not found"}), 404

    collection = db[collection_name]

    total_students = collection.count_documents({})
    dropout_students = collection.count_documents({"Target": "Dropout"})
    dropout_rate = (dropout_students / total_students) * 100 if total_students else 0

    # Utility: group by attribute and count dropouts
    def group_by_attr_vs_dropout(field):
        pipeline = [
            {"$group": {
                "_id": {field: f"${field}", "Target": "$Target"},
                "count": {"$sum": 1}
            }}
        ]
        results = collection.aggregate(pipeline)
        grouped = defaultdict(lambda: defaultdict(int))
        for row in results:
            attr = row["_id"][field]
            status = row["_id"]["Target"]
            grouped[attr][status] += row["count"]
        return grouped

    gender_vs_dropout = group_by_attr_vs_dropout("Gender")
    debtor_vs_dropout = group_by_attr_vs_dropout("Debtor")
    tuition_vs_dropout = group_by_attr_vs_dropout("Tuition fees up to date")

    # Optional: Age Bucket vs Dropout
    age_bucket_map = {
        "<18": [],
        "18-22": [],
        "23-26": [],
        "27-30": [],
        "31+": []
    }

    for doc in collection.find({}, {"Age at enrollment": 1, "Target": 1}):
        age = doc.get("Age at enrollment", 0)
        bucket = (
            "<18" if age < 18 else
            "18-22" if age <= 22 else
            "23-26" if age <= 26 else
            "27-30" if age <= 30 else
            "31+"
        )
        age_bucket_map[bucket].append(doc.get("Target", "Unknown"))

    age_vs_dropout = {}
    for bucket, targets in age_bucket_map.items():
        counts = defaultdict(int)
        for t in targets:
            counts[t] += 1
        age_vs_dropout[bucket] = dict(counts)  # convert to normal dict for JSON serialization

    return jsonify({
        "total_students": total_students,
        "dropout_students": dropout_students,
        "dropout_rate": round(dropout_rate, 2),
        "gender_vs_dropout": gender_vs_dropout,
        "debtor_vs_dropout": debtor_vs_dropout,
        "tuition_vs_dropout": tuition_vs_dropout,
        "age_vs_dropout": age_vs_dropout
    })

    
@app.route('/api/solution-pathways', methods=['GET'])
def get_solution_pathways():
    collection = db["solution_pathways"]
    category = request.args.get('category')  # Get the category from query params

    try:
        if category:
            # Find documents where category matches the provided value
            results = collection.find({"category": category})
        else:
            # If no category is provided, return all documents
            results = collection.find()

        # Convert results to a list of dictionaries
        solution_pathways = []
        for result in results:
            result['_id'] = str(result['_id'])  # Convert ObjectId to string
            if 'addedOn' in result and result['addedOn']:
                result['addedOn'] = result['addedOn'].isoformat()  # Convert date to ISO format
            solution_pathways.append(result)

        return jsonify(solution_pathways), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        # Respond to CORS preflight
        return '', 200

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    student = db.students.find_one({"email": email, "password": password})
    if not student:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "studentId": str(student["_id"]),
        "name": student["name"]
    }), 200



@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    required_fields = ["name", "email", "password"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    existing = db.students.find_one({"email": data["email"]})
    if existing:
        return jsonify({"error": "User already exists"}), 409

    student = {
        "name": data["name"],
        "email": data["email"],
        "password": data["password"],  # In production: hash this!
        "registeredOn": datetime.utcnow(),
        "profileCompleted": False
    }

    student_id = db.students.insert_one(student).inserted_id

    # Create default profile with actual defaults

    db.profiles.insert_one({
        "studentId": ObjectId(student_id),
        "gender": "Not specified",
        "age": 18,
        "caste": "Unknown",
        "area": "Unknown",
        "standard": "Unknown",
        "state": "Unknown",
        "school": "Not specified",
        "maritalStatus": "Unknown",
        "course": "Unknown",
        "previousQualification": "Unknown",
        "motherQualification": "Unknown",
        "fatherQualification": "Unknown",
        "motherOccupation": "Unknown",
        "fatherOccupation": "Unknown",
        "specialNeeds": "Unknown",
        "debtor": "Unknown",
        "tuitionUpToDate": "Unknown",
        "scholarshipHolder": "Unknown"
    })


    default_subjects = [""]
    subject_scores = [{"subjectId": f"id_{i}", "subject": s, "score": 0.0} for i, s in enumerate(default_subjects)]
    daily_progress = [{"date": "1", "progress": 0} for _ in default_subjects]
    time_spent = [{"subject": s, "minutes": 0} for s in default_subjects]
    attendance = {
        "totalDays": 0,
        "presentDays": 0
    }

    db.performance_analytics.insert_one({
        "studentId": student_id,
        "subjectScores": subject_scores,
        "dailyProgress": daily_progress,
        "timeSpent": time_spent,
        "attendance": attendance,
        "riskScore": 0,
        "riskLabel": "Not calculated",
        "lastUpdated": datetime.utcnow()
    })

    # Create default course activity log with one placeholder course
    db.course_activity_logs.insert_one({
        "studentId": student_id,
        "courseId": "default_course_id",
        "courseTitle": "Default Course",
        "origin": "NPTEL",
        "joinLink": "https://nptel.ac.in/course/default",  # Optional, but good to include
        "activityLogs": [
            {
                "date": datetime.utcnow(),
                "durationMinutes": 0
            }
        ],
        "lastAccessed": datetime.utcnow()
    })
    
    return jsonify({"message": "Registration successful", "studentId": str(student_id)}), 201

@app.route("/api/profile/<student_id>", methods=["GET"])
def get_profile(student_id):
    try:
        student_obj_id = ObjectId(student_id)

        student = db.students.find_one({"_id": student_obj_id}, {"password": 0})
        profile = db.profiles.find_one({"studentId": student_obj_id})

        if not student and not profile:
            return jsonify({"error": "Student and profile not found"}), 404

        if student:
            student["_id"] = str(student["_id"])
        if profile:
            profile["_id"] = str(profile["_id"])
            profile["studentId"] = str(profile["studentId"])

        return jsonify({
            "student": student,
            "profile": profile
        }), 200

    except Exception as e:
        return jsonify({"error": "Invalid ID or server error"}), 500


@app.route("/api/profile/<student_id>", methods=["PUT"])
def update_profile(student_id):
    try:
        data = request.get_json()
        student_obj_id = ObjectId(student_id)

        # Validate required profile fields
        required_fields = ["gender", "age", "standard", "state", "school"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Update student basic info
        db.students.update_one(
            {"_id": student_obj_id},
            {"$set": {
                "name": data.get("name", ""),
                "email": data.get("email", "")
            }}
        )

        # Prepare profile update document
        profile_update = {
            "gender": data["gender"],
            "age": int(data["age"]),
            "standard": data["standard"],
            "state": data["state"],
            "school": data["school"],
            "caste": data.get("caste", ""),
            "area": data.get("area", ""),
            "maritalStatus": data.get("maritalStatus", ""),
            "course": data.get("course", ""),
            "previousQualification": data.get("previousQualification", ""),
            "motherQualification": data.get("motherQualification", ""),
            "fatherQualification": data.get("fatherQualification", ""),
            "motherOccupation": data.get("motherOccupation", ""),
            "fatherOccupation": data.get("fatherOccupation", ""),
            "specialNeeds": data.get("specialNeeds", ""),
            "debtor": data.get("debtor", ""),
            "tuitionUpToDate": data.get("tuitionUpToDate", ""),
            "scholarshipHolder": data.get("scholarshipHolder", "")
        }

        profile_update_result = db.profiles.update_one(
            {"studentId": student_obj_id},
            {"$set": profile_update}
        )

        if profile_update_result.matched_count == 0:
            return jsonify({"error": "Profile not found"}), 404

        return jsonify({"message": "Student and profile updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        filters = {}

        discipline = request.args.get('discipline')
        origin = request.args.get('origin')
        level = request.args.get('level')

        if discipline:
            filters['discipline'] = discipline
        if origin:
            filters['origin'] = origin
        if level:
            filters['level'] = level

        courses = list(db.courses.find(filters, {'_id': 0}))
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask import jsonify, request
from bson import ObjectId
from datetime import datetime

@app.route('/api/performance/<student_id>', methods=['GET'])
def get_performance_analytics(student_id):
    try:
        student_obj_id = ObjectId(student_id)

        # 1. Fetch course activity logs
        activities = list(db.course_activity_logs.find({"studentId": student_obj_id}))

        subject_scores = []
        time_spent = []
        daily_progress = {}

        for activity in activities:
            course_title = activity.get("courseTitle", "Unknown")
            course_id = activity.get("courseId", "unknown")

            logs = activity.get("activityLogs", [])
            

            # Simulated score based on latest activity duration
            latest_log = logs[-1] if logs else {}
            simulated_score = 70 + (latest_log.get("durationMinutes", 0) % 30)

            subject_scores.append({
                "subjectId": course_id,
                "subject": course_title,
                "score": simulated_score
            })

            total_minutes = sum(log.get("durationMinutes", 0) for log in logs)
            time_spent.append({
                "subject": course_title,
                "minutes": total_minutes
            })

            for log in logs:
                date_str = str(log.get("date"))  # Ensure it's a string
                duration = log.get("durationMinutes", 0)
                if date_str:
                    daily_progress[date_str] = daily_progress.get(date_str, 0) + duration

        daily_progress_arr = [
            {
                "date": str(date)[:10],  # Get 'YYYY-MM-DD',
                "progress": minutes // 10  # Simulated progress
            }
            for date, minutes in sorted(daily_progress.items())
        ]

        # 3. Fetch attendance from student_profiles or fallback
        now = datetime.utcnow()
        total_days = calendar.monthrange(now.year, now.month)[1]
        profile = db.student_profiles.find_one({"_id": student_obj_id})
        attendance = profile.get("attendance") if profile and profile.get("attendance") else {
            "totalDays": total_days,
            "presentDays": len(daily_progress)  # fallback: assume active days as present
        }

        # 4. Compute riskScore
        total_days = attendance.get("totalDays", 100)
        present_days = attendance.get("presentDays", 0)

        for activity in activities:
            activity["_id"] = str(activity["_id"])
            activity["studentId"] = str(activity["studentId"])
        # 5. Construct performance object and upsert
        data = {
            "studentId": student_obj_id,
            "subjectScores": [
                {
                    "subjectId": s["subjectId"],
                    "subject": s["subject"],
                    "score": float(s["score"])  # Ensure float (double)
                } for s in subject_scores
            ],
            "timeSpent": time_spent,
            "dailyProgress": daily_progress_arr,
            "attendance": attendance,
            "lastUpdated": datetime.utcnow(),
            "courseActivityLogs": activities  # <-- Add this back
        }


        db.performance_analytics.update_one(
            {"studentId": student_obj_id},
            {"$set": data},
            upsert=True
        )

        # Convert ObjectId to str for JSON response
        data["studentId"] = str(student_obj_id)

        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/performance/update-time/<student_id>", methods=["PUT"])
def update_time_spent_from_activity(student_id):
    try:
        student_obj_id = ObjectId(student_id)

        # Fetch activity logs for this student
        activity_logs = list(db.course_activity_logs.find({"studentId": student_obj_id}))
        if not activity_logs:
            return jsonify({"error": "No course activity logs found"}), 404

        # Aggregate time spent by course title
        time_spent_by_course = {}
        for log in activity_logs:
            course_title = log.get("courseTitle", "Unknown Course")
            total_minutes = sum(entry.get("durationMinutes", 0) for entry in log.get("activityLogs", []))
            time_spent_by_course[course_title] = time_spent_by_course.get(course_title, 0) + total_minutes

        # Format for Mongo update
        time_spent_array = [{"subject": title, "minutes": minutes} for title, minutes in time_spent_by_course.items()]

        # Update performance_analytics
        db.performance_analytics.update_one(
            {"studentId": student_obj_id},
            {"$set": {
                "timeSpent": time_spent_array,
                "lastUpdated": datetime.utcnow()
            }}
        )

        return jsonify({"message": "Time spent updated from course activity logs"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/performance/update-daily/<student_id>", methods=["PUT"])
def update_daily_progress_from_activity(student_id):
    try:
        student_obj_id = ObjectId(student_id)
        activity_logs = list(db.course_activity_logs.find({"studentId": student_obj_id}))

        if not activity_logs:
            return jsonify({"error": "No course activity logs found"}), 404

        daily_minutes = {}

        for log in activity_logs:
            for entry in log.get("activityLogs", []):
                date_str = entry.get("date")
                minutes = entry.get("durationMinutes", 0)
                daily_minutes[date_str] = daily_minutes.get(date_str, 0) + minutes

        # Convert to list sorted by date
        daily_progress = [
            {"date": date, "progress": minutes} for date, minutes in sorted(daily_minutes.items())
        ]

        db.performance_analytics.update_one(
            {"studentId": student_obj_id},
            {"$set": {
                "dailyProgress": daily_progress,
                "lastUpdated": datetime.utcnow()
            }}
        )

        return jsonify({"message": "Daily progress updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/activity/<student_id>", methods=["GET"])
def get_course_activity(student_id):
    try:
        student_obj_id = ObjectId(student_id)
        activities = list(db.course_activity_logs.find({"studentId": student_obj_id}))
        for activity in activities:
            activity["_id"] = str(activity["_id"])
            activity["studentId"] = str(activity["studentId"])
        return jsonify(activities), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/activity", methods=["POST"])
def add_course_activity():
    try:
        data = request.get_json()
        required = ["studentId", "courseId", "courseTitle", "origin", "joinLink"]
        if not all(k in data for k in required):
            return jsonify({"error": "Missing required fields"}), 400

        student_obj_id = ObjectId(data["studentId"])
        existing = db.course_activity_logs.find_one({
            "studentId": student_obj_id,
            "courseId": data["courseId"]
        })

        if existing:
            return jsonify({"error": "Course activity already exists for this student"}), 409

        record = {
            "studentId": student_obj_id,
            "courseId": data["courseId"],
            "courseTitle": data["courseTitle"],
            "origin": data["origin"],
            "joinLink": data["joinLink"],
            "activityLogs": [],
            "lastAccessed": datetime.utcnow()
        }

        inserted_id = db.course_activity_logs.insert_one(record).inserted_id
        return jsonify({"message": "Course activity initialized", "id": str(inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/activity/<student_id>/<course_id>", methods=["PUT"])
def update_course_activity(student_id, course_id):
    try:
        data = request.get_json()
        duration = int(data.get("durationMinutes", 0))
        if duration <= 0:
            return jsonify({"error": "Duration must be positive"}), 400

        student_obj_id = ObjectId(student_id)
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        # First try to update an existing log for today
        result = db.course_activity_logs.update_one(
            {
                "studentId": student_obj_id,
                "courseId": course_id,
                "activityLogs.date": today
            },
            {
                "$inc": {"activityLogs.$.durationMinutes": duration},
                "$set": {"lastAccessed": datetime.utcnow()}
            }
        )

        # If no matching activity log for today, push a new one
        if result.matched_count == 0:
            result = db.course_activity_logs.update_one(
                {
                    "studentId": student_obj_id,
                    "courseId": course_id
                },
                {
                    "$push": {"activityLogs": {"date": today, "durationMinutes": duration}},
                    "$set": {"lastAccessed": datetime.utcnow()}
                }
            )
            if result.matched_count == 0:
                return jsonify({"error": "No matching course activity found"}), 404

        return jsonify({"message": "Activity log updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/api/student-dashboard/<student_id>', methods=['GET'])
def get_student_dashboard(student_id):
    try:
        object_id = ObjectId(student_id)

        # Fetch from collections
        student = db.students.find_one({"_id": object_id})
        profile = db.profiles.find_one({"studentId": object_id})
        performance = db.performance_analytics.find_one({"studentId": object_id})
        course_logs = list(db.course_activity_logs.find({"studentId": object_id}))

        # Basic check
        if not student or not profile or not performance:
            return jsonify({"error": "Student data not found"}), 404

        # Daily progress
        daily_progress = [
            {"name": f"date {i+1}", "progress": w.get("progress", 0)}
            for i, w in enumerate(performance.get("dailyProgress", []))
        ]

        # Attendance
        attendance_data = performance.get("attendance", {})
        total_days = attendance_data.get("totalDays", 0)
        present_days = attendance_data.get("presentDays", 0)
        attendance_percent = round((present_days / total_days) * 100) if total_days else 0

        # Ongoing courses
        ongoing_courses = [
            {   
                "courseId" : log.get("courseId"),
                "title": log.get("courseTitle", "Untitled"),
                "origin": log.get("origin"),
                "joinLink": log.get("joinLink"),
                "lastAccessed": log.get("lastAccessed")
            }
            for log in course_logs
        ]

        # Risk Score and Risk Label (from performance_analytics)
        risk_score = performance.get("riskScore", None)
        risk_label = performance.get("riskLabel", "Not Available")

        # Construct full response
        response = {
            "studentName": student.get("name"),
            "email": student.get("email"),
            "progressPercent": daily_progress[-1]["progress"] * 10 if daily_progress else 0,
            "learningStreak": present_days,  # Placeholder
            "dailyProgress": daily_progress,
            "attendance": {
                "percentage": attendance_percent,
                "present": present_days,
                "total": total_days
            },
            "subjectScores": performance.get("subjectScores", []),
            "timeSpent": performance.get("timeSpent", []),
            "ongoingCourses": ongoing_courses,
            "studentInfo": {
                "gender": profile.get("gender"),
                "age": profile.get("age"),
                "caste": profile.get("caste"),
                "area": profile.get("area"),
                "standard": profile.get("standard"),
                "state": profile.get("state"),
                "school": profile.get("school")
            },
            # Add risk score and risk label for the frontend card
            "riskScore": risk_score,
            "riskLabel": risk_label
        }

        return jsonify(response), 200

    except Exception as e:
        print("Error in get_student_dashboard:", str(e))
        return jsonify({"error": "Server error"}), 500

    
@app.route('/api/recommendations/<student_id>', methods=['GET'])
def recommend_courses(student_id):
    try:
        # Step 1: Get student's enrolled courseIds
        joined_courses = db.course_activity_logs.find({"studentId": ObjectId(student_id)})
        joined_ids = [course["courseId"] for course in joined_courses]

        # Step 2: Get metadata for joined courses
        joined_metadata = db.courses.find({"course_id": {"$in": joined_ids}})
        disciplines = set()
        domains = set()
        levels = set()

        for course in joined_metadata:
            if course.get("discipline"):
                disciplines.add(course["discipline"])
            if course.get("nptel_domain"):
                domains.add(course["nptel_domain"])
            if course.get("level"):
                levels.add(course["level"])

        # Step 3: Aggregate with scoring logic
        pipeline = [
            {"$match": {"course_id": {"$nin": joined_ids}}},
            {"$addFields": {
                "score": {
                    "$add": [
                        {"$cond": [{"$in": ["$discipline", list(disciplines)]}, 1, 0]},
                        {"$cond": [{"$in": ["$nptel_domain", list(domains)]}, 1, 0]},
                        {"$cond": [{"$in": ["$level", list(levels)]}, 1, 0]}
                    ]
                }
            }},
            {"$match": {"score": {"$gt": 0}}},
            {"$sort": SON([("score", -1)])},
            {"$limit": 10}
        ]

        recommended_courses = list(db.courses.aggregate(pipeline))

        # Step 4: Convert ObjectId and return
        for course in recommended_courses:
            course["_id"] = str(course["_id"])

        return jsonify(recommended_courses), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    # Route to fetch necessary data for model and get predictions
@app.route('/model_predict/<student_id>', methods=['GET'])
def model_predict(student_id):
    # Fetch student data
    student = db.students.find_one({"_id": ObjectId(student_id)})
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Fetch profile data
    profile = db.profiles.find_one({"studentId": ObjectId(student_id)})
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    # Fetch profile analytics
    performance_analytics = db.performance_analytics.find_one({"studentId": ObjectId(student_id)})
    if not performance_analytics:
        return jsonify({"error": "Profile analytics not found"}), 404

    # Fetch course analytics logs
    course_analytics = db.course_activity_logs.find_one({"studentId": ObjectId(student_id)})
    if not course_analytics:
        return jsonify({"error": "Course analytics not found"}), 404

    # Data preprocessing for model input
    features = preprocess_data_for_model(student, profile, performance_analytics, course_analytics)

    # Feed data to model and get predictions (e.g., dropout risk)
    prediction = model.predict([features])
    predicted_risk_label = label_encoders['riskLabel'].inverse_transform([prediction])[0]  # Inverse transform to get label
    risk_label_to_score = {
        "high": 1,
        "medium": 0.5,
        "low": 0
    }

    # Set the risk score based on the predicted label
    risk_score = risk_label_to_score.get(predicted_risk_label, 0)  # Default to 0 if label is not found

    # Ensure risk_score is a native Python int
    risk_score = int(risk_score)

    # Update the performance_analytics collection with risk score and label
    db.performance_analytics.update_one(
        {"studentId": ObjectId(student_id)},
        {
            "$set": {
                "riskScore": risk_score,
                "riskLabel": predicted_risk_label
            }
        },
        upsert=True  # If no matching record, it will create a new one
    )

    # Return model prediction as response
    result = {
        "studentId": student_id,
        "dropoutRiskPrediction": predicted_risk_label,
        "riskScore": risk_score
    }

    return jsonify(result)

import numpy as np
from datetime import datetime

# Example of the preprocessing function:
def preprocess_data_for_model(student, profile, performance_analytics, course_analytics):
    # Helper function to safely transform categorical variables using label encoders
    def safe_transform(label_encoder, value):
        try:
            if value in label_encoder.classes_:
                return label_encoder.transform([value])[0]
            else:
                return 0  # Default encoding for unknown values
        except KeyError:
            return 0  # Default encoding for unknown values

    # Extract features from the student document
    gender = student.get('gender', 'Unknown')
    age = student.get('age', 0)
    standard = student.get('standard' , 0)
    caste = student.get('caste', 'Unknown')
    area = student.get('area', 'Unknown')
    state = student.get('state', 'Unknown')
    school = student.get('school', 'Unknown')
    marital_status = student.get('maritalStatus', 'Unknown')
    course = student.get('course', 'Unknown')
    previous_qualification = student.get('previousQualification', 'Unknown')
    mother_qualification = student.get('motherQualification', 'Unknown')
    father_qualification = student.get('fatherQualification', 'Unknown')
    mother_occupation = student.get('motherOccupation', 'Unknown')
    father_occupation = student.get('fatherOccupation', 'Unknown')
    special_needs = student.get('specialNeeds', 'Unknown')
    debtor = student.get('debtor', 'Unknown')
    tuition_up_to_date = student.get('tuitionUpToDate', 'Unknown')
    scholarship_holder = student.get('scholarshipHolder', 'Unknown')
    profile_completed = student.get('profileCompleted', False)

    # Calculate days since registration
    registered_on = student.get('registeredOn')
    if registered_on:
        days_since_registration = (datetime.now() - registered_on).days
    else:
        days_since_registration = 0

    # Calculate total activity minutes from performance_analytics
    total_activity_minutes = sum(item['durationMinutes'] for item in performance_analytics.get('activityLogs', []))

    # Calculate attendance rate
    attendance_data = profile.get('attendance', {})
    total_days = attendance_data.get('totalDays', 0)
    present_days = attendance_data.get('presentDays', 0)
    attendance_rate = present_days / total_days if total_days > 0 else 0

    # Calculate average score from subjectScores
    subject_scores = profile.get('subjectScores', [])
    total_score = sum(subject['score'] for subject in subject_scores)
    average_score = total_score / len(subject_scores) if subject_scores else 0

    # Encode categorical features using label encoders
    gender_encoded = safe_transform(label_encoders['gender'], gender)
    marital_status_encoded = safe_transform(label_encoders['maritalStatus'], marital_status)
    course_encoded = safe_transform(label_encoders['course'], course)
    previous_qualification_encoded = safe_transform(label_encoders['previousQualification'], previous_qualification)
    mother_qualification_encoded = safe_transform(label_encoders['motherQualification'], mother_qualification)
    father_qualification_encoded = safe_transform(label_encoders['fatherQualification'], father_qualification)
    
    # Encode other categorical features (such as caste, area, standard, state, school, etc.)
    caste_encoded = safe_transform(label_encoders['caste'], caste)
    area_encoded = safe_transform(label_encoders['area'], area)
    state_encoded = safe_transform(label_encoders['state'], state)
    school_encoded = safe_transform(label_encoders['school'], school)
    
    # Encode other potential categorical features
    mother_occupation_encoded = safe_transform(label_encoders['motherOccupation'], mother_occupation)
    father_occupation_encoded = safe_transform(label_encoders['fatherOccupation'], father_occupation)
    special_needs_encoded = safe_transform(label_encoders['specialNeeds'], special_needs)
    debtor_encoded = safe_transform(label_encoders['debtor'], debtor)
    tuition_up_to_date_encoded = safe_transform(label_encoders['tuitionUpToDate'], tuition_up_to_date)
    scholarship_holder_encoded = safe_transform(label_encoders['scholarshipHolder'], scholarship_holder)

    # Feature vector (combine all features)
    features = np.array([
        gender_encoded,
        age,
        caste_encoded,
        area_encoded,
        standard,
        state_encoded,
        school_encoded,
        marital_status_encoded,
        course_encoded,
        previous_qualification_encoded,
        mother_qualification_encoded,
        father_qualification_encoded,
        mother_occupation_encoded,
        father_occupation_encoded,
        special_needs_encoded,
        debtor_encoded,
        tuition_up_to_date_encoded,
        scholarship_holder_encoded,
        profile_completed,
        days_since_registration,
        total_activity_minutes,
        attendance_rate,
        average_score
    ])

    return features


    
if __name__ == "__main__":
    app.run(debug=True)


