import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile
} from 'firebase/auth';
import { getAuthInstance, firebaseInitialized } from './firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);

  // Get auth instance - null if Firebase not initialized
  const auth = getAuthInstance();

  // Register with email and password
  const register = async (email, password, displayName) => {
    if (!auth) throw new Error('Firebase authentication not initialized');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    return userCredential;
  };

  // Login with email and password
  const login = (email, password) => {
    if (!auth) throw new Error('Firebase authentication not initialized');
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google
  const loginWithGoogle = () => {
    if (!auth) throw new Error('Firebase authentication not initialized');
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Logout
  const logout = () => {
    if (!auth) return Promise.resolve();
    return signOut(auth);
  };

  // Get current user's ID token
  const getIdToken = async () => {
    if (currentUser && auth) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    if (!firebaseInitialized) {
      setFirebaseError('Firebase not configured. Authentication features disabled.');
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    register,
    login,
    loginWithGoogle,
    logout,
    getIdToken,
    firebaseInitialized,
    firebaseError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
