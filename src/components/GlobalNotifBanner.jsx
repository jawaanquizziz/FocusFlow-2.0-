import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const DISMISSED_KEY = 'focusflow_dismissed_notif_ts';

const GlobalNotifBanner = () => {
    const [globalNotif, setGlobalNotif] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'notifications'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.active) {
                    // Check if the user has already dismissed this exact notification
                    // by comparing its server timestamp
                    const notifTs = data.timestamp?.seconds ?? 0;
                    const dismissedTs = Number(localStorage.getItem(DISMISSED_KEY) || 0);

                    if (notifTs > dismissedTs) {
                        setGlobalNotif(data);
                        setVisible(true);
                    } else {
                        // Already dismissed this one
                        setVisible(false);
                    }
                } else {
                    setGlobalNotif(null);
                    setVisible(false);
                }
            } else {
                setGlobalNotif(null);
                setVisible(false);
            }
        });
        return () => unsub();
    }, []);

    const handleDismiss = () => {
        // Save the timestamp of the notification that was dismissed
        // so it won't reappear even after a page refresh
        if (globalNotif?.timestamp?.seconds) {
            localStorage.setItem(DISMISSED_KEY, String(globalNotif.timestamp.seconds));
        }
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && globalNotif && (
                <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: 'relative', zIndex: 999 }}
                >
                    <div
                        style={{
                            margin: '0 auto',
                            maxWidth: '1400px',
                            padding: '0 1rem',
                        }}
                    >
                        <div
                            className="glass p-5 rounded-[2rem] border border-brand/30 bg-brand/5 relative overflow-hidden"
                            style={{ marginBottom: '0' }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[40px] rounded-full pointer-events-none" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-brand/20 rounded-2xl text-brand animate-pulse shrink-0">
                                    <Zap size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-brand mb-1">
                                        {globalNotif.title}
                                    </h4>
                                    <p className="text-sm text-white/90 font-medium leading-snug">
                                        {globalNotif.message}
                                    </p>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-white transition-colors shrink-0"
                                    title="Dismiss"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalNotifBanner;
