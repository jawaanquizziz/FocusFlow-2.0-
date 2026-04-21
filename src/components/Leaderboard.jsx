import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Flame, User, Medal } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const Leaderboard = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        try {
            const q = query(
                collection(db, 'users'),
                orderBy('totalFocusTime', 'desc'),
                limit(10)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(u => (u.totalFocusTime || 0) > 0); // Only users with focus time
                setRankings(data);
                setLoading(false);
            }, (error) => {
                console.error('Leaderboard error:', error);
                setRankings([]);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (e) {
            setLoading(false);
        }
    }, []);

    const formatTime = (seconds) => {
        if (!seconds) return '0 min';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const rankColors = [
        { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400' },
        { bg: 'bg-slate-400/10', border: 'border-slate-400/20', text: 'text-slate-300' },
        { bg: 'bg-orange-700/10', border: 'border-orange-700/20', text: 'text-orange-400' },
    ];

    const RankIcon = ({ index }) => {
        if (index === 0) return <Crown size={16} className="text-yellow-400" />;
        if (index === 1) return <Medal size={16} className="text-slate-300" />;
        if (index === 2) return <Medal size={16} className="text-orange-400" />;
        return <span className="text-xs font-black text-text-muted">{index + 1}</span>;
    };

    return (
        <div className="glass p-6 rounded-[2.5rem] flex flex-col h-full border border-white/10 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand/15 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand/10 rounded-2xl text-brand shadow-lg shadow-brand/10">
                    <Trophy size={22} />
                </div>
                <div>
                    <h3 className="text-lg font-black">Global Board</h3>
                    <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Live Rankings</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-black uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-3">
                        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest animate-pulse">Loading...</p>
                    </div>
                ) : rankings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-32 gap-3 text-center"
                    >
                        <Flame size={32} className="text-brand/40" />
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">
                            No focus sessions yet
                        </p>
                        <p className="text-[10px] text-text-muted/60">
                            Be the first to start a session!
                        </p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {rankings.map((ranker, index) => {
                            const isYou = ranker.id === user?.uid;
                            const style = rankColors[index] || { bg: 'bg-white/3', border: 'border-transparent', text: 'text-text-muted' };

                            return (
                                <motion.div
                                    key={ranker.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between p-3 rounded-2xl border ${isYou ? 'bg-brand/10 border-brand/30' : `${style.bg} ${style.border} hover:bg-white/5`} transition-all`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${index < 3 ? style.bg : 'bg-white/5'} border ${index < 3 ? style.border : 'border-transparent'}`}>
                                            <RankIcon index={index} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold flex items-center gap-1.5">
                                                {ranker.name || ranker.displayName || 'Anonymous'}
                                                {isYou && <span className="text-[8px] bg-brand text-white px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider">You</span>}
                                            </span>
                                            <span className="text-[10px] text-text-muted font-medium">{formatTime(ranker.totalFocusTime)}</span>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-black ${index < 3 ? style.text : 'text-text-muted'}`}>
                                        <User size={10} />
                                        {index + 1}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                    Focus more to climb ranks ⚡
                </p>
            </div>
        </div>
    );
};

export default Leaderboard;
