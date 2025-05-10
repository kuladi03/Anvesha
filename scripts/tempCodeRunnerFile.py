df["registeredOn"] = pd.to_datetime(df["registeredOn"])
# df["daysSinceRegistration"] = (datetime.utcnow() - df["registeredOn"]).dt.days
# df["attendanceRate"] = df["attendance"].apply(lambda x: x["presentDays"] / x["totalDays"] if x and "totalDays" in x and x["totalDays"] > 0 else np.nan)

# # Fill NA
# df["totalActivityMinutes"].fillna(0, inplace=True)
# df["attendanceRate"].fillna(df["attendanceRate"].mean(), inplace=True)

# # Aggregate subject scores
# df["averageScore"] = df["subjectScores"].apply(
#     lambda scores: np.mean([s["score"] for s in scores]) if isinstance(scores, list) and len(scores) > 0 else 0
# )