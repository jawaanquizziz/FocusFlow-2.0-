import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Check, Star } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
    { id: 'general', label: '💬 General' },
    { id: 'feature', label: '✨ Feature Idea' },
    { id: 'bug', label: '🐛 Bug Report' },
    { id: 'design', label: '🎨 Design' },
];

const FeedbackModal = ({ onClose, user }) => {
    const showToast = useToast();
    const [category, setCategory] = useState('general');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                uid: user?.uid || 'anonymous',
                name: user?.displayName || user?.email || 'Anonymous',
                email: user?.email || '',
                photoURL: user?.photoURL || '',
                category,
                rating,
                message: message.trim(),
                timestamp: serverTimestamp(),
                read: false,
            });
            setSent(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Feedback submit failed:', err);
            showToast('Failed to send feedback. Please try again.', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[3rem] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
                {/* Background orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none -ml-10 -mb-10" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand/15 rounded-2xl text-brand">
                            <MessageSquare size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-xl tracking-tight text-white">
                                Share <span className="text-brand">Feedback</span>
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-black">
                                Your voice shapes FocusFlow
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {sent ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-12 gap-4 relative z-10"
                        >
                            <div className="p-5 bg-emerald-500/15 rounded-3xl">
                                <Check size={36} className="text-emerald-400" />
                            </div>
                            <h4 className="text-xl font-black text-white">Thank you! 🎉</h4>
                            <p className="text-slate-400 text-sm font-medium text-center">
                                Your feedback has been sent to the admin. We really appreciate it!
                            </p>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            onSubmit={handleSubmit}
                            className="space-y-5 relative z-10"
                        >
                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setCategory(c.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                                                category === c.id
                                                    ? 'bg-brand/20 border-brand/40 text-brand'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                    Rate your experience
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                size={28}
                                                className={`transition-colors ${
                                                    star <= (hoverRating || rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-slate-600'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    {rating > 0 && (
                                        <span className="ml-2 text-xs font-bold text-slate-400 self-center">
                                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing!'][rating]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                    Your suggestion or feedback *
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Tell us what you'd like to see, what's broken, or what you love..."
                                    rows={4}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-slate-600 focus:border-brand/50 focus:bg-white/8 transition-all outline-none resize-none"
                                />
                                <p className="text-right text-[10px] text-slate-600 font-bold">
                                    {message.length} / 500
                                </p>
                            </div>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={sending || !message.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-brand text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand/90"
                            >
                                {sending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Feedback
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default FeedbackModal;
