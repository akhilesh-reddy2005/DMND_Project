# Fake Job Detection - Full Stack Application

A full-stack web application that uses Machine Learning to detect fake job postings.

## 🎯 Features

- ✅ AI-powered job posting analysis (94.85% accuracy)
- ✅ Modern React frontend with Bootstrap 5
- ✅ REST API backend with Flask
- ✅ MongoDB Atlas cloud database
- ✅ Real-time predictions with confidence scores
- ✅ Prediction history tracking

## 🏗️ Tech Stack

**Frontend:**
- React 18 + Vite
- React Router DOM
- Axios for API calls
- Bootstrap 5 + Bootstrap Icons

**Backend:**
- Flask REST API
- Flask-CORS
- scikit-learn (Naive Bayes + TF-IDF)
- NLTK for text preprocessing
- pymongo for MongoDB

**Database:**
- MongoDB Atlas (Cloud)

## 📦 Project Structure

```
fake-job-detection/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Navbar, Footer
│   │   ├── pages/        # Home, Result, History
│   │   ├── services/     # API integration
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── models/               # ML models
│   ├── naive_bayes_model.pkl
│   └── tfidf_vectorizer.pkl
├── app.py               # Flask REST API
├── train_model.py       # Model training script
├── config.py            # Configuration
├── .env                 # MongoDB URI
├── requirements.txt     # Python dependencies
├── setup.ps1           # Auto setup script
├── start-backend.ps1   # Start Flask
└── start-frontend.ps1  # Start React
```

## 🚀 Quick Start

### Option 1: Automated Setup

```powershell
.\setup.ps1
```

Then run in two separate terminals:
```powershell
# Terminal 1
.\start-backend.ps1

# Terminal 2
.\start-frontend.ps1
```

### Option 2: Manual Setup

**1. Install Python Dependencies**

```powershell
python -m pip install -r requirements.txt
```

**2. Train the ML Model (First Time Only)**

```powershell
python train_model.py
```

This creates model files with ~95% accuracy.

**3. Start Flask Backend (Terminal 1)**

```powershell
python app.py
```

Backend runs on: **http://localhost:5000**

**4. Install & Start React Frontend (Terminal 2)**

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:3000**

**5. Open Application**

Visit **http://localhost:3000** in your browser!

## 🔌 API Endpoints

### POST `/api/predict`
Analyze a job posting

**Request:**
```json
{
  "title": "Software Engineer",
  "description": "Full job description...",
  "salary": "$80,000 - $120,000"
}
```

**Response:**
```json
{
  "prediction": "Genuine",
  "confidence": 87.5,
  "saved_to_database": true,
  "timestamp": "2026-03-02T10:30:00"
}
```

### GET `/api/history`
Get last 50 predictions from database

### GET `/stats`
Get prediction statistics

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key-here
MONGODB_URI=your-mongodb-atlas-uri
DB_NAME=fakejobs
```

## 🧪 How It Works

1. **User Input**: Job title + description + salary (optional)
2. **Preprocessing**: Text cleaning, lowercase, stopword removal
3. **Vectorization**: TF-IDF converts text to numerical features
4. **Classification**: Naive Bayes predicts: Fake or Genuine
5. **Output**: Prediction + Confidence score (%)
6. **Storage**: Result saved to MongoDB with timestamp

## 📊 Model Performance

- **Algorithm**: Multinomial Naive Bayes
- **Vectorization**: TF-IDF
- **Training Set**: 17,881 job postings
- **Accuracy**: 94.85%
- **Test Split**: 80/20

## 🛠️ Development

**Backend Development:**
```powershell
python app.py
```

**Frontend Development:**
```powershell
cd frontend
npm run dev
```

**Build Frontend for Production:**
```powershell
cd frontend
npm run build
```

## 📝 Requirements

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account

## 🐛 Troubleshooting

**Port Already in Use:**
- Backend (5000): Change in `app.py`
- Frontend (3000): Change in `vite.config.js`

**MongoDB Connection Error:**
- Check `.env` file for correct URI
- Verify MongoDB Atlas network access

**Model Not Found:**
- Run `python train_model.py` first

## � Authentication & User Features

### What's New
This application now includes **complete user authentication** powered by Firebase:

**Authentication Methods:**
- 📧 Email/Password registration and login
- 🔐 Google Sign-In (OAuth 2.0)
- 👤 User profiles with personal information
- 🔒 Protected routes requiring authentication

**User Features:**
- Personal prediction history tracking
- Only see your own job analyses
- Search and filter your predictions
- User dashboard and profile page

### Setup Firebase Authentication

To enable authentication features, follow the detailed setup guide:

📖 **[Firebase Setup Guide](FIREBASE_SETUP.md)** - Complete step-by-step instructions

**Quick Setup:**
1. Create Firebase project
2. Enable Email/Password and Google authentication
3. Configure frontend `.env` with Firebase credentials
4. Download Firebase Admin SDK JSON for backend
5. Update backend `.env` with credentials path
6. Restart servers

**Environment Variables Required:**

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Backend (`.env`):
```env
MONGODB_URI=your-mongodb-uri
FIREBASE_ADMIN_CREDENTIALS=./firebase-admin-sdk.json
```

### New Pages & Components

- `/login` - Login page with Google Sign-In
- `/register` - User registration page
- `/profile` - User profile and account info
- `/history` - Protected history page (requires login)

### API Changes

- `POST /api/predict` - Now accepts `user_id` parameter
- `GET /api/history/<user_id>` - Returns user-specific predictions
- All endpoints support Firebase token authentication

### Documentation

- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Complete Firebase setup guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## �📄 License

MIT

## 👨‍💻 Author

Built with ❤️ using React, Flask, and Machine Learning
