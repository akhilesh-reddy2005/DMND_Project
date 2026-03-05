"""
Fake Job Posting Detection - Flask Web Application
This application predicts whether a job posting is fake or genuine using ML
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pickle
import os
from datetime import datetime
from dotenv import load_dotenv
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
try:
    # Use service account credentials if available, otherwise use default
    firebase_cred_path = os.getenv('FIREBASE_ADMIN_CREDENTIALS')
    if firebase_cred_path and os.path.exists(firebase_cred_path):
        cred = credentials.Certificate(firebase_cred_path)
        firebase_admin.initialize_app(cred)
        print("✓ Firebase Admin SDK initialized with credentials")
    else:
        # Initialize without credentials (will work in some environments)
        try:
            firebase_admin.initialize_app()
            print("✓ Firebase Admin SDK initialized")
        except:
            print("⚠ Firebase Admin SDK not initialized - auth verification disabled")
except Exception as e:
    print(f"⚠ Firebase Admin initialization warning: {e}")

# Download NLTK data if not already present
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt_tab', quiet=True)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Enable CORS for React frontend
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# MongoDB Configuration - Updated database name
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
DB_NAME = 'fakejobs'  # Updated database name

# Initialize MongoDB client with timeout
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
    db = client[DB_NAME]
    job_history_collection = db['job_history']  # Updated collection name
    # Test connection
    client.admin.command('ping')
    print("✓ Connected to MongoDB successfully!")
except Exception as e:
    print(f"✗ MongoDB connection error: {e}")
    print("Note: The app will continue but predictions won't be saved to database.")
    job_history_collection = None

# Load ML model and vectorizer
MODEL_PATH = 'models/naive_bayes_model.pkl'
VECTORIZER_PATH = 'models/tfidf_vectorizer.pkl'

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print(f"✓ Model loaded from {MODEL_PATH}")
    
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    print(f"✓ Vectorizer loaded from {VECTORIZER_PATH}")
    
    model_loaded = True
except FileNotFoundError as e:
    print(f"✗ Model files not found: {e}")
    print("Please run 'python model_training.py' first to train the model.")
    model_loaded = False
except Exception as e:
    print(f"✗ Error loading model: {e}")
    model_loaded = False

# Stopwords for text preprocessing
try:
    stop_words = set(stopwords.words('english'))
except:
    stop_words = set()


# ========== AUTHENTICATION MIDDLEWARE ==========

def verify_firebase_token(f):
    """
    Decorator to verify Firebase authentication token
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if Firebase is initialized
        if not firebase_admin._apps:
            # Firebase not initialized, skip auth
            return f(*args, **kwargs)
        
        # Get token from Authorization header
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split('Bearer ')[1]
        
        if not token:
            # No token provided - allow for non-authenticated requests
            return f(*args, **kwargs)
        
        try:
            # Verify the token
            decoded_token = auth.verify_id_token(token)
            request.user_id = decoded_token['uid']
            request.user_email = decoded_token.get('email', '')
        except Exception as e:
            print(f"Token verification error: {e}")
            # Continue without authentication
            pass
        
        return f(*args, **kwargs)
    return decorated_function


def preprocess_text(text):
    """
    Preprocess text data: lowercase, remove special chars, remove stopwords
    
    Args:
        text (str): Input text
        
    Returns:
        str: Cleaned text
    """
    if not text or text.strip() == "":
        return ""
    
    # Convert to lowercase
    text = str(text).lower()
    
    # Remove special characters and digits
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
    
    return ' '.join(tokens)


def predict_job(title, description, salary=""):
    """
    Predict if a job posting is fake or genuine
    
    Args:
        title (str): Job title
        description (str): Job description
        salary (str): Salary information (optional)
        
    Returns:
        dict: Prediction results
    """
    if not model_loaded:
        return {
            'error': 'Model not loaded. Please train the model first.',
            'prediction': None,
            'confidence': None
        }
    
    # Combine all text fields
    combined_text = f"{title} {description} {salary}"
    
    # Preprocess text
    processed_text = preprocess_text(combined_text)
    
    if not processed_text:
        return {
            'error': 'Invalid input. Please provide valid job details.',
            'prediction': None,
            'confidence': None
        }
    
    # Transform using TF-IDF
    text_tfidf = vectorizer.transform([processed_text])
    
    # Predict
    prediction = model.predict(text_tfidf)[0]
    
    # Get probability scores
    probabilities = model.predict_proba(text_tfidf)[0]
    confidence = float(probabilities[prediction])
    
    # Determine result
    result = "Fake" if prediction == 1 else "Genuine"
    
    return {
        'prediction': result,
        'confidence': confidence,
        'confidence_percentage': round(confidence * 100, 2),
        'error': None
    }


def save_to_mongodb(title, description, salary, prediction, confidence, user_id=None):
    """
    Save prediction result to MongoDB
    
    Args:
        title (str): Job title
        description (str): Job description
        salary (str): Salary information
        prediction (str): Prediction result (Fake/Genuine)
        confidence (float): Confidence score
        user_id (str): User ID from Firebase authentication
        
    Returns:
        bool: Success status
    """
    if job_history_collection is None:
        return False
    
    try:
        document = {
            'user_id': user_id,
            'title': title,
            'description': description,
            'salary': salary,
            'prediction': prediction,
            'confidence': confidence,
            'created_at': datetime.utcnow()
        }
        
        job_history_collection.insert_one(document)
        return True
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
        return False


@app.route('/')
def index():
    """
    API root endpoint
    """
    return jsonify({
        'message': 'Fake Job Detection API',
        'version': '2.0',
        'endpoints': {
            'predict': '/api/predict (POST)',
            'history': '/api/history (GET)',
            'stats': '/stats (GET)'
        },
        'frontend': 'http://localhost:3000'
    })


@app.route('/api/predict', methods=['POST'])
@verify_firebase_token
def api_predict():
    """
    API endpoint for predictions (JSON response)
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        salary = data.get('salary', '').strip()
        user_id = data.get('user_id', None)
        
        # Validate input
        if not title or not description:
            return jsonify({'error': 'Title and description are required'}), 400
        
        # Make prediction
        result = predict_job(title, description, salary)
        
        if result['error']:
            return jsonify({'error': result['error']}), 500
        
        # Save to MongoDB with user_id
        db_saved = save_to_mongodb(
            title, 
            description, 
            salary, 
            result['prediction'], 
            result['confidence'],
            user_id
        )
        
        # Return JSON response
        return jsonify({
            'prediction': result['prediction'],
            'confidence': result['confidence_percentage'],
            'saved_to_database': db_saved,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in API prediction: {e}")
        return jsonify({'error': 'Internal server error'}), 500




@app.route('/api/history/<user_id>', methods=['GET'])
@verify_firebase_token
def api_history(user_id):
    """
    API endpoint to get prediction history for a specific user (JSON response)
    
    Args:
        user_id (str): Firebase user ID
    """
    if job_history_collection is None:
        # Return empty array if database is not connected
        return jsonify([])
    
    try:
        # Get predictions for this user, sorted by created_at
        query = {'user_id': user_id}
        predictions = list(job_history_collection.find(query)
                          .sort('created_at', -1)
                          .limit(100))
        
        # Convert ObjectId to string and format dates for JSON serialization
        for pred in predictions:
            pred['_id'] = str(pred['_id'])
            if 'created_at' in pred:
                pred['timestamp'] = pred['created_at'].isoformat()
                del pred['created_at']
        
        return jsonify(predictions)
    except Exception as e:
        print(f"Error fetching history: {e}")
        return jsonify([])  # Return empty array on error


@app.route('/stats')
def stats():
    """
    Show statistics about predictions
    """
    if predictions_collection is None:
        return jsonify({'error': 'Database not connected'}), 500
    
    try:
        total = predictions_collection.count_documents({})
        fake_count = predictions_collection.count_documents({'prediction': 'Fake'})
        genuine_count = predictions_collection.count_documents({'prediction': 'Genuine'})
        
        avg_confidence = None
        if total > 0:
            pipeline = [
                {
                    '$group': {
                        '_id': None,
                        'avg_confidence': {'$avg': '$confidence_score'}
                    }
                }
            ]
            result = list(predictions_collection.aggregate(pipeline))
            if result:
                avg_confidence = round(result[0]['avg_confidence'] * 100, 2)
        
        return jsonify({
            'total_predictions': total,
            'fake_predictions': fake_count,
            'genuine_predictions': genuine_count,
            'average_confidence': avg_confidence
        })
    
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': 'Error fetching statistics'}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("FAKE JOB POSTING DETECTION - WEB APPLICATION")
    print("="*60)
    print(f"\nServer starting...")
    print(f"Access the application at: http://localhost:5000")
    print(f"\nPress CTRL+C to stop the server\n")
    print("="*60 + "\n")
    
    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
