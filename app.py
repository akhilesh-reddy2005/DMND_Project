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
import requests
import base64
from config import DB_NAME as DEFAULT_DB_NAME, MONGODB_URI as DEFAULT_MONGODB_URI

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
GOOGLE_VISION_API_KEY = os.getenv("GOOGLE_VISION_API_KEY")
vision_client = None

if GOOGLE_VISION_API_KEY:
    print("✓ Google Vision API key loaded")
else:
    print("⚠ Google Vision API key not found - image OCR will be disabled")

# ==========================
# MongoDB Setup
# ==========================
MONGODB_URIS = []

env_mongodb_uri = os.getenv("MONGODB_URI")
if env_mongodb_uri:
    MONGODB_URIS.append(env_mongodb_uri)

if DEFAULT_MONGODB_URI and DEFAULT_MONGODB_URI not in MONGODB_URIS:
    MONGODB_URIS.append(DEFAULT_MONGODB_URI)

if "mongodb://localhost:27017/" not in MONGODB_URIS:
    MONGODB_URIS.append("mongodb://localhost:27017/")

DB_NAME = os.getenv("DB_NAME", DEFAULT_DB_NAME)

job_history_collection = None
mongo_errors = []

for mongodb_uri in MONGODB_URIS:
    try:
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        job_history_collection = db["job_history"]
        client.admin.command("ping")
        if mongodb_uri.startswith("mongodb+srv://"):
            print("✓ MongoDB Atlas connected")
        else:
            print("✓ Local MongoDB connected")
        break
    except Exception as e:
        mongo_errors.append(str(e))

if job_history_collection is None:
    print("MongoDB unavailable; history persistence disabled")
    if mongo_errors:
        print(f"Last MongoDB error: {mongo_errors[-1]}")

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

    try:
        tokens = word_tokenize(text)
    except LookupError:
        # Newer NLTK versions may require punkt_tab in addition to punkt.
        nltk.download("punkt")
        nltk.download("punkt_tab")
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

    if not GOOGLE_VISION_API_KEY:
        return "", "Google Vision API key not configured"

    try:
        # Encode image to base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # Call Vision API REST endpoint
        url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_VISION_API_KEY}"
        
        payload = {
            "requests": [
                {
                    "image": {
                        "content": image_base64
                    },
                    "features": [
                        {
                            "type": "DOCUMENT_TEXT_DETECTION"
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        
        # Check for API errors
        if "error" in result:
            error_msg = result["error"].get("message", "Unknown error")
            print(f"Vision API error: {error_msg}")
            return "", error_msg
        
        # Extract text from response
        if "responses" in result and len(result["responses"]) > 0:
            responses = result["responses"][0]
            if "error" in responses:
                error_msg = responses["error"].get("message", "Unknown error in response")
                print(f"Vision API response error: {error_msg}")
                return "", error_msg
            if "fullTextAnnotation" in responses:
                full_text = responses["fullTextAnnotation"].get("text", "")
                return full_text.strip(), None
        
        return "", "No text detected in image"
        
    except requests.exceptions.RequestException as e:
        print(f"Vision API request failed: {e}")
        return "", f"Vision API error: {str(e)}"
    except Exception as e:
        print(f"Vision API error: {e}")
        return "", f"Vision API error: {str(e)}"


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

        data = request.get_json(silent=True) or {}

        title = data.get("title", "")
        description = data.get("description", "")
        salary = data.get("salary", "")
        user_id = data.get("user_id")

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
    # Image upload temporarily disabled
    return jsonify({"error": "Image upload is temporarily disabled. Please use the text input fields to analyze job postings."}), 501


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