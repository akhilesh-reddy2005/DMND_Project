import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let app;
let auth;
let firebaseInitialized = false;

try {
  // Check if config has required fields
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firebaseInitialized = true;
    console.log("✓ Firebase initialized successfully");
  } else {
    console.warn("⚠ Firebase configuration incomplete - authentication disabled");
    firebaseInitialized = false;
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  firebaseInitialized = false;
}

export { firebaseInitialized };
export const getAuthInstance = () => (firebaseInitialized && auth) ? auth : null;
export default app;
