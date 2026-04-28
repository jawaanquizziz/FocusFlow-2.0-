import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
let auth;
let db;
let analytics;
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
// Always prompt account selection so users can switch Google accounts
googleProvider.setCustomParameters({ prompt: 'select_account' });

try {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Analytics is only supported in some environments (e.g. not server-side)
    isSupported().then(yes => {
        if (yes) analytics = getAnalytics(app);
    });
    
} catch (error) {
    console.error("Firebase Initialization Failed:", error);
    auth = { onAuthStateChanged: (cb) => cb(null) };
    db = {};
}

export { auth, db, googleProvider, analytics };
