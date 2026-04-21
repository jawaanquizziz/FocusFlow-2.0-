import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Create a single context for auth state
const AuthContext = createContext(null);

// Provider component — wraps the entire app once
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Max 2 second wait, then unblock UI regardless
        const timeout = setTimeout(() => setLoading(false), 2000);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            clearTimeout(timeout);
            if (firebaseUser) {
                // Set user immediately from Firebase Auth — don't block on Firestore
                setUser(firebaseUser);

                // Enrich with Firestore data in background (optional, non-blocking)
                try {
                    const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (snap.exists()) setUser({ ...firebaseUser, ...snap.data() });
                } catch (_) { /* Firestore failure is not critical */ }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => { unsubscribe(); clearTimeout(timeout); };
    }, []);

    const register = async (email, password, name) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        try {
            await setDoc(doc(db, 'users', result.user.uid), {
                name, email,
                createdAt: new Date().toISOString(),
                totalFocusTime: 0
            });
        } catch (_) {}
        return result.user;
    };

    const login = async (email, password) => {
        // Test mode bypass for easy preview
        if (email === 'test@example.com' && password === 'password123') {
            const mockUser = {
                uid: 'test-user-id',
                email: 'test@example.com',
                displayName: 'Test Runner',
                photoURL: 'https://ui-avatars.com/api/?name=Test+Runner&background=5865F2&color=fff',
                totalFocusTime: 45000 // 12.5 hours
            };
            setUser(mockUser);
            return mockUser;
        }
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook — reads from the context, never creates its own subscription
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};
