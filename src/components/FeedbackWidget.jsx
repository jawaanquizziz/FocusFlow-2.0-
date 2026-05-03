import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Send, Trash2, X, 
    Sparkles, Shield, AlertCircle, ChevronDown,
    Maximize2, Minimize2
} from 'lucide-react';
import { db } from '../services/firebase';
import { 
    collection, addDoc, onSnapshot, query, 
    orderBy, serverTimestamp, deleteDoc, doc, limit 
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const ADMIN_EMAILS = ['jawaan25fcrit@gmail.com'];

const Avatar = ({ photoURL, name, size = 32 }) => {
    const initials = (name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#5865F2', '#ED4245', '#57F287', '#FEE75C', '#EB459E', '#3BA55D'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    
    if (photoURL) return (
        <img src={photoURL} alt={name} referrerPolicy="no-referrer"
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    );
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.4, fontWeight: 900, color: '#fff'
        }}>{initials}</div>
    );
};

const FeedbackWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || user.uid === 'admin');

    useEffect(() => {
        if (!isOpen) return;
        
        setLoading(true);
        setError(null);

        // Fallback timeout to stop "syncing" if it hangs
        const timeout = setTimeout(() => {
            setLoading(prev => prev ? false : false);
        }, 8000);
        
        const q = query(
            collection(db, 'suggestions'), 
            orderBy('timestamp', 'desc'),
            limit(50)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setSuggestions(docs);
            setLoading(false);
            clearTimeout(timeout);
        }, (err) => {
            console.error('Feedback sync error:', err);
            setError('Could not connect to feed');
            setLoading(false);
            clearTimeout(timeout);
        });
        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'suggestions'), {
                text: inputText.trim(),
                uid: user.uid,
                name: user.displayName || 'Anonymous User',
                photoURL: user.photoURL || '',
                timestamp: serverTimestamp(),
                isAdmin: isAdmin
            });
            setInputText('');
        } catch (error) {
            console.error('Error adding suggestion:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!isAdmin) return;
        try {
            await deleteDoc(doc(db, 'suggestions', id));
        } catch (error) {
            console.error('Error deleting suggestion:', error);
        }
    };

    const formatTime = (ts) => {
        if (!ts) return 'just now';
        const date = ts.toDate();
        const now = new Date();
        const diff = (now - date) / 1000;
        
        if (diff < 60) return 'now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="w-[350px] sm:w-[400px] h-[500px] bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand/20 rounded-xl text-brand">
                                    <MessageSquare size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">Community Feed</h3>
                                    <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Suggestions & Feedback</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-white transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Feed */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-50 gap-2">
                                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Syncing chats...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                                    <AlertCircle size={32} className="mb-3 text-red-400" />
                                    <p className="text-xs font-bold uppercase tracking-widest mb-1">Sync Error</p>
                                    <p className="text-[10px]">{error}</p>
                                </div>
                            ) : suggestions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                                    <Sparkles size={32} className="mb-3 text-brand" />
                                    <p className="text-xs font-bold uppercase tracking-widest mb-1">No suggestions yet</p>
                                    <p className="text-[10px]">Be the first to help us grow!</p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {suggestions.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-3 rounded-2xl border transition-all group ${
                                                item.uid === user.uid 
                                                ? 'bg-brand/10 border-brand/20 ml-4' 
                                                : 'bg-white/5 border-transparent hover:border-white/10 mr-4'
                                            }`}
                                        >
                                            <div className="flex gap-2.5">
                                                <Avatar photoURL={item.photoURL} name={item.name} size={28} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className={`text-[11px] font-black truncate ${item.isAdmin ? 'text-red-400' : 'text-white'}`}>
                                                                {item.name}
                                                            </span>
                                                            {item.isAdmin && <Shield size={8} className="text-red-400 shrink-0" />}
                                                        </div>
                                                        <span className="text-[8px] text-text-muted font-bold shrink-0">{formatTime(item.timestamp)}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-300 leading-normal break-words whitespace-pre-wrap">{item.text}</p>
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        onClick={(e) => handleDelete(e, item.id)}
                                                        className="p-1.5 self-start rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 bg-white/2">
                            <form onSubmit={handleSubmit} className="relative">
                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Suggest a feature..."
                                    maxLength={200}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-text-muted/40 focus:outline-none focus:border-brand/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isSubmitting}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand text-white rounded-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-lg shadow-brand/20"
                                >
                                    {isSubmitting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
                                </button>
                            </form>
                            <p className="text-[8px] text-text-muted/50 mt-2 text-center uppercase tracking-tighter font-bold">
                                Public Feed • Visible to all users
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-2xl shadow-brand/20 flex items-center gap-3 transition-all ${
                    isOpen ? 'bg-white text-[#0f172a]' : 'bg-brand text-white'
                }`}
            >
                {isOpen ? <ChevronDown size={24} /> : (
                    <>
                        <MessageSquare size={22} />
                        <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Suggestions</span>
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default FeedbackWidget;
