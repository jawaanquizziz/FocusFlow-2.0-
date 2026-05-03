import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  signInWithPopup,
  signInAnonymously,
} from 'firebase/auth';
import { auth, db, googleProvider } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Create a single context for auth state
const AuthContext = createContext(null);

// Provider component — wraps the entire app once
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Max 500ms wait, then unblock UI regardless
        const timeout = setTimeout(() => setLoading(false), 500);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            clearTimeout(timeout);
            if (firebaseUser) {
                // Set user immediately from Firebase Auth — don't block on Firestore
                setUser(firebaseUser);

                // Enrich with Firestore data in background
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const snap = await getDoc(userDocRef);
                    
                    if (snap.exists()) {
                        const data = snap.data();
                        setUser({ ...firebaseUser, ...data });

                        // Update missing profile info if needed
                        if (!data.name || !data.email || !data.photoURL) {
                            await setDoc(userDocRef, {
                                name: data.name || firebaseUser.displayName || 'Anonymous',
                                email: data.email || firebaseUser.email || '',
                                photoURL: data.photoURL || firebaseUser.photoURL || '',
                            }, { merge: true });
                        }

                        // Sync local stats to cloud
                        const localSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
                        const localFocusSeconds = parseInt(localStorage.getItem('focusSeconds') || '0');
                        const localTrees = localSessions.filter(s => s.mode === 'pomodoro').length;

                        if (localTrees > (data.treesPlanted || 0) || localFocusSeconds > (data.totalFocusTime || 0)) {
                            await setDoc(userDocRef, {
                                treesPlanted: Math.max(localTrees, data.treesPlanted || 0),
                                sessionsCount: Math.max(localSessions.length, data.sessionsCount || 0),
                                totalFocusTime: Math.max(localFocusSeconds, data.totalFocusTime || 0),
                            }, { merge: true });
                        }
                    } else {
                        // CRITICAL: If they exist in Auth but NOT Firestore, create the doc now
                        console.log("User doc missing in Firestore. Creating now...");
                        const localSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
                        const localFocusSeconds = parseInt(localStorage.getItem('focusSeconds') || '0');
                        
                        await setDoc(userDocRef, {
                            name: firebaseUser.displayName || 'Anonymous',
                            email: firebaseUser.email || '',
                            photoURL: firebaseUser.photoURL || '',
                            createdAt: new Date().toISOString(),
                            totalFocusTime: localFocusSeconds,
                            treesPlanted: localSessions.filter(s => s.mode === 'pomodoro').length,
                            sessionsCount: localSessions.length,
                        }, { merge: true });
                    }
                } catch (err) { 
                    console.error('Firestore Sync Error:', err);
                }
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
                totalFocusTime: 0,
                treesPlanted: 0,
                sessionsCount: 0,
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

    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;

        // Upsert Firestore document — only write fields that are missing
        try {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                name: firebaseUser.displayName || 'Anonymous',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || '',
                createdAt: new Date().toISOString(),
                totalFocusTime: 0,
                treesPlanted: 0,
            }, { merge: true }); // merge: true keeps existing treesPlanted intact
        } catch (_) {}

        return firebaseUser;
    };

    const signInAsGuest = async (name) => {
        const result = await signInAnonymously(auth);
        await updateProfile(result.user, { displayName: name });
        try {
            await setDoc(doc(db, 'users', result.user.uid), {
                name: name,
                email: 'Guest',
                createdAt: new Date().toISOString(),
                totalFocusTime: 0,
                treesPlanted: 0,
                sessionsCount: 0,
                isGuest: true,
            }, { merge: true });
        } catch (_) {}
        return result.user;
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, loading, register, login, signInWithGoogle, signInAsGuest, logout }}>
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
