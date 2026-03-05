"""
Fake Job Posting Detection - Flask Web Application
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pickle
import os
from datetime import datetime
from dotenv import load_dotenv
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from google.cloud import vision

load_dotenv()

# ==========================
# Initialize Flask
# ==========================
app = Flask(__name__)
CORS(app)

# ==========================
# Firebase Initialization
# ==========================
try:
    cred_path = os.getenv("FIREBASE_ADMIN_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✓ Firebase initialized")
except Exception as e:
    print(f"Firebase initialization warning: {e}")

# ==========================
# NLTK Setup
# ==========================
try:
    nltk.data.find('tokenizers/punkt')
except:
    nltk.download('punkt')
    nltk.download('stopwords')

stop_words = set(stopwords.words('english'))

# ==========================
# Google Vision Setup
# ==========================
vision_client = None
try:
    vision_client = vision.ImageAnnotatorClient()
    print("✓ Google Vision client initialized")
except Exception as e:
    print(f"Google Vision initialization warning: {e}")

# ==========================
# MongoDB Setup
# ==========================
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "fakejobs"

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    job_history_collection = db["job_history"]
    client.admin.command("ping")
    print("✓ MongoDB connected")
except Exception as e:
    print(f"MongoDB connection error: {e}")
    job_history_collection = None

# ==========================
# Load ML Model
# ==========================
MODEL_PATH = "models/naive_bayes_model.pkl"
VECTORIZER_PATH = "models/tfidf_vectorizer.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)

    print("✓ Model and vectorizer loaded")

except Exception as e:
    print(f"Model loading error: {e}")
    model = None
    vectorizer = None

# ==========================
# Authentication Decorator
# ==========================
def verify_firebase_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        if not firebase_admin._apps:
            return f(*args, **kwargs)

        token = None

        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split("Bearer ")[1]

        if token:
            try:
                decoded = auth.verify_id_token(token)
                request.user_id = decoded["uid"]
            except Exception as e:
                print("Token verification error:", e)

        return f(*args, **kwargs)

    return decorated

# ==========================
# Text Preprocessing
# ==========================
def preprocess_text(text):

    text = text.lower()
    text = re.sub(r"[^a-zA-Z\s]", "", text)

    tokens = word_tokenize(text)

    tokens = [w for w in tokens if w not in stop_words and len(w) > 2]

    return " ".join(tokens)

# ==========================
# Prediction Function
# ==========================
def predict_job(title, description, salary=""):

    if model is None or vectorizer is None:
        return {"error": "Model not loaded"}

    combined = f"{title} {description} {salary}"

    processed = preprocess_text(combined)

    vector = vectorizer.transform([processed])

    prediction = model.predict(vector)[0]

    probs = model.predict_proba(vector)[0]
    confidence = float(probs[prediction])

    result = "Fake" if prediction == 1 else "Genuine"

    return {
        "prediction": result,
        "confidence": round(confidence * 100, 2)
    }


def extract_text_from_image(image_bytes):

    if vision_client is None:
        return "", "Google Vision client not initialized"

    try:
        image = vision.Image(content=image_bytes)
        response = vision_client.document_text_detection(image=image)

        if response.error.message:
            return "", response.error.message

        full_text = response.full_text_annotation.text if response.full_text_annotation else ""
        return full_text.strip(), None
    except Exception as e:
        return "", str(e)


def build_title_description_from_ocr(ocr_text):

    if not ocr_text:
        return "", ""

    lines = [line.strip() for line in ocr_text.splitlines() if line.strip()]
    if not lines:
        return "", ""

    title = lines[0][:160]
    description = "\n".join(lines[1:]).strip()

    if not description:
        description = ocr_text[:3000]

    return title, description

# ==========================
# Save Prediction
# ==========================
def save_prediction(title, description, salary, prediction, confidence, user_id=None):

    if job_history_collection is None:
        return False

    try:
        job_history_collection.insert_one({

            "user_id": user_id,
            "title": title,
            "description": description,
            "salary": salary,
            "prediction": prediction,
            "confidence": confidence,
            "created_at": datetime.utcnow()

        })

        return True

    except Exception as e:
        print("MongoDB save error:", e)
        return False

# ==========================
# Routes
# ==========================
@app.route("/")
def home():

    return jsonify({
        "message": "Fake Job Detection API",
        "version": "2.0"
    })

# --------------------------
# Predict Job
# --------------------------
@app.route("/api/predict", methods=["POST"])
@verify_firebase_token
def api_predict():

    try:

        data = request.get_json()

        title = data.get("title", "")
        description = data.get("description", "")
        salary = data.get("salary", "")
        user_id = data.get("user_id")

        result = predict_job(title, description, salary)

        saved = save_prediction(
            title,
            description,
            salary,
            result["prediction"],
            result["confidence"],
            user_id
        )

        return jsonify({
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "saved": saved
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": "Internal server error"}), 500


# --------------------------
# Predict Job from Image/File (Vision OCR)
# --------------------------
@app.route("/api/predict-from-image", methods=["POST"])
@verify_firebase_token
def api_predict_from_image():

    try:
        uploaded_file = request.files.get("file")
        if not uploaded_file:
            return jsonify({"error": "No file uploaded"}), 400

        file_bytes = uploaded_file.read()
        if not file_bytes:
            return jsonify({"error": "Uploaded file is empty"}), 400

        salary = request.form.get("salary", "")
        user_id = request.form.get("user_id")

        ocr_text, ocr_error = extract_text_from_image(file_bytes)
        if ocr_error:
            return jsonify({"error": f"Vision OCR failed: {ocr_error}"}), 500

        if not ocr_text or len(ocr_text.strip()) < 20:
            return jsonify({"error": "Could not extract enough text from image/file"}), 400

        title, description = build_title_description_from_ocr(ocr_text)
        if not title:
            title = "Uploaded Job Posting"

        result = predict_job(title, description, salary)
        if "error" in result:
            return jsonify({"error": result["error"]}), 500

        saved = save_prediction(
            title,
            description,
            salary,
            result["prediction"],
            result["confidence"],
            user_id
        )

        return jsonify({
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "saved": saved,
            "title": title,
            "description": description
        })

    except Exception as e:
        print("Image prediction error:", e)
        return jsonify({"error": "Internal server error"}), 500

# --------------------------
# User History
# --------------------------
@app.route("/api/history/<user_id>", methods=["GET"])
def history(user_id):

    if job_history_collection is None:
        return jsonify([])

    results = list(
        job_history_collection
        .find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(50)
    )

    for r in results:
        r["_id"] = str(r["_id"])
        r["created_at"] = r["created_at"].isoformat()

    return jsonify(results)

# ==========================
# Run Server
# ==========================
if __name__ == "__main__":

    print("\nFake Job Detection Server Running")
    print("http://localhost:5000\n")

    app.run(debug=True)