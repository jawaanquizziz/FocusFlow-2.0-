import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { MessageSquare, Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const CATEGORY_COLORS = {
    feature: { bg: 'bg-brand/15', text: 'text-brand', border: 'border-brand/20', label: '✨ Feature' },
    bug:     { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20', label: '🐛 Bug Fixed' },
    design:  { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/20', label: '🎨 Design' },
    general: { bg: 'bg-white/8', text: 'text-slate-400', border: 'border-white/10', label: '💬 General' },
};

const Avatar = ({ photoURL, name, size = 44 }) => {
    const initials = (name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#5865F2', '#ED4245', '#57F287', '#FEE75C', '#EB459E', '#3BA55D'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    if (photoURL) return (
        <img src={photoURL} alt={name} referrerPolicy="no-referrer"
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }} />
    );
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 900, color: '#fff', flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.1)'
        }}>{initials}</div>
    );
};

const StarRow = ({ rating }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={13}
                className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />
        ))}
    </div>
);

const FeaturedFeedback = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);
    const [direction, setDirection] = useState(1);
    const timerRef = useRef(null);

    useEffect(() => {
        const q = query(
            collection(db, 'feedback'),
            where('featured', '==', true),
            orderBy('timestamp', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, []);

    // Auto-rotate carousel
    useEffect(() => {
        if (items.length <= 1) return;
        timerRef.current = setInterval(() => {
            setDirection(1);
            setActiveIdx(i => (i + 1) % items.length);
        }, 5000);
        return () => clearInterval(timerRef.current);
    }, [items.length]);

    const goTo = (idx) => {
        setDirection(idx > activeIdx ? 1 : -1);
        setActiveIdx(idx);
        clearInterval(timerRef.current);
    };

    const prev = () => {
        setDirection(-1);
        setActiveIdx(i => (i - 1 + items.length) % items.length);
        clearInterval(timerRef.current);
    };

    const next = () => {
        setDirection(1);
        setActiveIdx(i => (i + 1) % items.length);
        clearInterval(timerRef.current);
    };

    if (loading) return null;
    if (items.length === 0) return null;

    const current = items[activeIdx];
    const cat = CATEGORY_COLORS[current.category] || CATEGORY_COLORS.general;

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.97 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.97 }),
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 glass rounded-[2.5rem] border border-white/10 relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full" />
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.025]" style={{
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)`,
                    backgroundSize: '28px 28px'
                }} />
            </div>

            <div className="relative z-10 p-8 sm:p-10">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="p-3 bg-gradient-to-br from-brand/20 to-purple-500/20 rounded-2xl border border-brand/20">
                                <MessageSquare size={20} className="text-brand" />
                            </div>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand rounded-full border-2 border-[#0f172a] animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white tracking-tight">
                                Community <span className="text-brand">Voices</span>
                            </h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-black">
                                What our users are saying
                            </p>
                        </div>
                    </div>

                    {/* Nav arrows + dots */}
                    {items.length > 1 && (
                        <div className="flex items-center gap-3">
                            <button onClick={prev}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/8 active:scale-95">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex gap-1.5">
                                {items.map((_, i) => (
                                    <button key={i} onClick={() => goTo(i)}
                                        className={`transition-all rounded-full ${i === activeIdx ? 'w-6 h-2 bg-brand' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>
                            <button onClick={next}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/8 active:scale-95">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Card Carousel */}
                <div className="relative overflow-hidden" style={{ minHeight: '160px' }}>
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={current.id}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Single featured card */}
                            <div className="relative bg-white/3 border border-white/8 rounded-[2rem] p-7 sm:p-8">
                                {/* Big quote icon */}
                                <Quote size={48} className="absolute top-6 right-8 text-brand/10 rotate-180" />

                                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                                    {/* Left: avatar + info */}
                                    <div className="flex items-center sm:flex-col sm:items-center gap-4 sm:gap-3 sm:min-w-[80px]">
                                        <Avatar photoURL={current.photoURL} name={current.name} size={52} />
                                        <div className="sm:text-center">
                                            <p className="font-black text-sm text-white leading-tight">
                                                {current.name || 'Anonymous'}
                                            </p>
                                            {current.rating > 0 && (
                                                <div className="mt-1.5 flex sm:justify-center">
                                                    <StarRow rating={current.rating} />
                                                </div>
                                            )}
                                            <span className={`inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
                                                {cat.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="hidden sm:block w-px bg-white/8 self-stretch" />

                                    {/* Right: message */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white/90 text-base sm:text-lg font-semibold leading-relaxed italic relative z-10">
                                            "{current.message}"
                                        </p>
                                        {current.timestamp?.toDate && (
                                            <p className="mt-4 text-[10px] text-slate-600 font-black uppercase tracking-widest">
                                                {current.timestamp.toDate().toLocaleDateString('en-US', {
                                                    month: 'long', day: 'numeric', year: 'numeric'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Mini preview strip (if more than 2) */}
                {items.length > 2 && (
                    <div className="mt-6 flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
                        {items.map((item, i) => (
                            <button
                                key={item.id}
                                onClick={() => goTo(i)}
                                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all text-left ${
                                    i === activeIdx
                                        ? 'bg-brand/10 border-brand/30 shadow-lg shadow-brand/10'
                                        : 'bg-white/3 border-white/8 hover:bg-white/6'
                                }`}
                            >
                                <Avatar photoURL={item.photoURL} name={item.name} size={26} />
                                <span className={`text-xs font-black truncate max-w-[80px] ${i === activeIdx ? 'text-white' : 'text-slate-400'}`}>
                                    {item.name?.split(' ')[0] || 'User'}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </motion.section>
    );
};

export default FeaturedFeedback;
