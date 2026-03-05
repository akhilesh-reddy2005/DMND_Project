"""Configuration for Fake Job Detection Application"""
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'fake_job_detection')

# Flask
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Model Paths
MODEL_PATH = 'models/naive_bayes_model.pkl'
VECTORIZER_PATH = 'models/tfidf_vectorizer.pkl'

# Dataset
DATASET_PATH = 'fake_job_postings.csv'
