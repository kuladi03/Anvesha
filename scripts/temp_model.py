import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# Load the dataset
df = pd.read_csv(r'D:\Projects\New folder\anvesha\datasets\india.csv')

# Feature engineering/mapping
df['gender'] = df['Gender'].map({1: 'Male', 0: 'Female'})
df['age'] = df['Age at enrollment']
df['maritalStatus'] = df['Marital status'].map({1: 'Single', 2: 'Married', 3: 'Other', 4: 'Divorced'})
df['course'] = df['Course']
df['previousQualification'] = df["Previous qualification"]
df['motherQualification'] = df["Mother's qualification"]
df['fatherQualification'] = df["Father's qualification"]
df['motherOccupation'] = df["Mother's occupation"]
df['fatherOccupation'] = df["Father's occupation"]
df['specialNeeds'] = df['Educational special needs'].astype(bool)
df['debtor'] = df['Debtor'].astype(bool)
df['tuitionUpToDate'] = df['Tuition fees up to date'].astype(bool)
df['scholarshipHolder'] = df['Scholarship holder'].astype(bool)
df['profileCompleted'] = True
df['averageScore'] = df[["Curricular units 1st sem (grade)", "Curricular units 2nd sem (grade)"]].mean(axis=1)
df['riskLabel'] = df['Target']

# Fill missing features with default values
df['caste'] = 'Unknown'
df['area'] = 'Unknown'
df['standard'] = 0
df['state'] = 'Unknown'
df['school'] = 'Unknown'
df['daysSinceRegistration'] = 0
df['totalActivityMinutes'] = 0
df['attendanceRate'] = 1.0

# Select only our desired features
features = [
    'gender', 'age', 'caste', 'area', 'standard', 'state', 'school', 'maritalStatus', 'course',
    'previousQualification', 'motherQualification', 'fatherQualification', 'motherOccupation', 'fatherOccupation',
    'specialNeeds', 'debtor', 'tuitionUpToDate', 'scholarshipHolder', 'profileCompleted',
    'daysSinceRegistration', 'totalActivityMinutes', 'attendanceRate', 'averageScore'
]
target = 'riskLabel'

X = df[features]
y = df[target]

# Preprocess categorical features
categorical_cols = X.select_dtypes(include=['object', 'bool']).columns.tolist()

preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
], remainder='passthrough')

pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
])

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
pipeline.fit(X_train, y_train)

# Evaluate
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))

# Save model
joblib.dump(pipeline, 'student_risk_realistic_model.joblib')
print("Model saved as 'student_risk_realistic_model.joblib'")

# Optional: Print encoded feature names
encoder = pipeline.named_steps['preprocessor'].named_transformers_['cat']
feature_names = encoder.get_feature_names_out(categorical_cols)
print("Encoded categorical feature names:", feature_names)
