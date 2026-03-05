# Firebase Authentication Setup Guide

## Overview

This application uses Firebase Authentication for user management with support for:
- Email/Password authentication
- Google Sign-In
- Protected routes and user-specific history

## Prerequisites

- Node.js installed
- Python 3.7+ installed
- Active Firebase project
- MongoDB database (Atlas or local)

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select existing project
3. Enter project name (e.g., "fake-job-detector")
4. Follow the setup wizard

---

## Step 2: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Save
3. Enable **Google Sign-In**:
   - Click on "Google"
   - Toggle "Enable"
   - Enter support email
   - Save

---

## Step 3: Register Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click **Web** icon (`</>`)
4. Register app with nickname (e.g., "fake-job-detector-web")
5. **Copy the Firebase configuration** - you'll need these values:
   ```javascript
   apiKey: "...",
   authDomain: "...",
   projectId: "...",
   storageBucket: "...",
   messagingSenderId: "...",
   appId: "..."
   ```

---

## Step 4: Configure Frontend Environment

1. Navigate to `frontend/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `frontend/.env` and add your Firebase configuration:
   ```env
   VITE_API_URL=http://localhost:5000
   
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

---

## Step 5: Setup Firebase Admin SDK (Backend)

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Save it securely (e.g., `firebase-admin-sdk.json` in project root)
5. **IMPORTANT**: Add this file to `.gitignore` to prevent committing credentials

6. Update root `.env` file:
   ```env
   FIREBASE_ADMIN_CREDENTIALS=./firebase-admin-sdk.json
   ```

---

## Step 6: MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist your IP address (or 0.0.0.0/0 for development)
5. Get connection string
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/
   ```

---

## Step 7: Install Dependencies

### Backend:
```bash
pip install firebase-admin
# or if using requirements.txt
pip install -r requirements.txt
```

### Frontend:
```bash
cd frontend
npm install
```

---

## Step 8: Start the Application

### Backend:
```bash
python app.py
```

### Frontend:
```bash
cd frontend
npm run dev
```

---

## Project Structure

```
fake-job-detection/
├── frontend/
│   ├── src/
│   │   ├── firebase.js              # Firebase initialization
│   │   ├── authContext.jsx          # Auth state management
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx   # Route protection
│   │   │   └── Navbar.jsx           # Auth-aware navigation
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Profile.jsx          # User profile
│   │   │   ├── History.jsx          # User's prediction history
│   │   │   └── ...
│   │   └── services/
│   │       └── api.js               # API calls with auth tokens
│   └── .env                         # Frontend environment variables
├── app.py                           # Flask backend with Firebase auth
├── .env                             # Backend environment variables
└── firebase-admin-sdk.json          # Firebase admin credentials (git-ignored)
```

---

## Security Best Practices

### ✅ DO:
- Keep Firebase Admin SDK credentials secure
- Add sensitive files to `.gitignore`
- Use environment variables for all secrets
- Enable Firebase security rules
- Validate tokens on backend

### ❌ DON'T:
- Commit `.env` files
- Share Firebase Admin SDK JSON publicly
- Use production credentials in development
- Hardcode API keys in source code

---

## Testing Authentication

1. **Register a new user**:
   - Go to `http://localhost:3000/register`
   - Fill in name, email, password
   - Click "Create Account"

2. **Login with email**:
   - Go to `http://localhost:3000/login`
   - Enter credentials
   - Click "Sign In"

3. **Login with Google**:
   - Click "Sign in with Google" button
   - Select Google account
   - Authorize app

4. **Test protected routes**:
   - Try accessing `/history` without login (should redirect to `/login`)
   - Login and access `/history` (should work)
   - View profile at `/profile`

5. **Test job prediction with user tracking**:
   - Login
   - Analyze a job posting
   - Check `/history` to see saved prediction

---

## Troubleshooting

### "Firebase Admin SDK not initialized"
- **Solution**: Check `FIREBASE_ADMIN_CREDENTIALS` path in `.env`
- Verify JSON file exists and is valid

### "MongoDB connection error"
- **Solution**: Check `MONGODB_URI` in `.env`
- Verify MongoDB service is running
- Check network/firewall settings

### "Token verification error"
- **Solution**: Verify frontend Firebase config matches backend
- Check that user is logged in
- Try logout and login again

### Google Sign-In not working
- **Solution**: Verify Google auth is enabled in Firebase Console
- Check authorized domains in Firebase settings
- Ensure `authDomain` is correct in frontend `.env`

---

## Database Schema

### Collection: `job_history`

```javascript
{
  "_id": ObjectId,
  "user_id": "firebase-uid",        // Firebase user ID
  "title": "Job Title",             // Job posting title
  "description": "Job description", // Full job description
  "salary": "$50,000",              // Salary info
  "prediction": "Fake" | "Genuine", // Model prediction
  "confidence": 85.5,               // Confidence percentage
  "created_at": ISODate             // Timestamp
}
```

---

## API Endpoints

### Authentication Required:

- `POST /api/predict` - Make prediction (saves with user_id if authenticated)
- `GET /api/history/<user_id>` - Get user's prediction history

### Public:

- `GET /` - API info
- `GET /stats` - General statistics

---

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [React Context API](https://react.dev/reference/react/useContext)

---

## Support

For issues or questions:
1. Check Firebase Console for authentication errors
2. Check browser console for frontend errors
3. Check terminal/logs for backend errors
4. Verify all environment variables are set correctly

---

**🎉 You're all set! Users can now register, login, and track their job analysis history.**
