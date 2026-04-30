import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Crown, Medal, Share2, X,
    Link as LinkIcon, Check
} from 'lucide-react';

// Twitter/X logo (removed from newer lucide-react)
const TwitterIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

/* ─── Avatar helper ─────────────────────────────────────────────────── */
const Avatar = ({ photoURL, name, size = 30 }) => {
    const initials = (name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#5865F2', '#ED4245', '#57F287', '#FEE75C', '#EB459E', '#3BA55D'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    if (photoURL) return (
        <img src={photoURL} alt={name} referrerPolicy="no-referrer"
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 900, color: '#fff', flexShrink: 0,
        }}>{initials}</div>
    );
};

/* ─── Social Share Modal ────────────────────────────────────────────── */
const ShareModal = ({ ranker, rank, onClose }) => {
    const [copied, setCopied] = useState(false);
    const name = ranker?.name || ranker?.displayName || 'Someone';
    const trees = ranker?.treesPlanted ?? 0;
    const sessions = ranker?.sessionsCount ?? 0;

    const shareText = `🌳 I'm ranked #${rank} on FocusFlow with ${trees} trees planted across ${sessions} focus sessions! Join me and grow your forest of productivity 🚀 #FocusFlow #DeepWork #Pomodoro`;
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://focusflow.app';

    const platforms = [
        {
            label: 'Twitter / X',
            icon: TwitterIcon,
            color: 'bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] border-[#1DA1F2]/30',
            action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank'),
        },
        {
            label: 'WhatsApp',
            icon: () => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            ),
            color: 'bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border-[#25D366]/30',
            action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank'),
        },
        {
            label: 'Facebook',
            icon: () => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
            color: 'bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border-[#1877F2]/30',
            action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank'),
        },
    ];

    const copyText = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.createElement('textarea');
            el.value = `${shareText}\n${shareUrl}`;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand/10 rounded-2xl"><Share2 size={20} className="text-brand" /></div>
                        <div>
                            <h3 className="font-black text-base">Share Achievement</h3>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Brag to the world 🌍</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="bg-gradient-to-br from-brand/20 to-emerald-500/10 border border-brand/20 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar photoURL={ranker?.photoURL} name={name} size={36} />
                        <div>
                            <p className="font-black text-sm">{name}</p>
                            <p className="text-[10px] text-text-muted font-bold">Rank #{rank} · FocusFlow</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-xl font-black text-emerald-400">{trees}</p>
                            <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Trees 🌳</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-brand">{sessions}</p>
                            <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Sessions ⚡</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    {platforms.map(p => (
                        <motion.button key={p.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={p.action}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border font-bold text-sm transition-all ${p.color}`}>
                            <p.icon size={18} />
                            Share on {p.label}
                        </motion.button>
                    ))}
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={copyText}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-bold text-sm transition-all
                        ${copied ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-text-muted hover:text-white hover:bg-white/10'}`}>
                    {copied ? <Check size={16} /> : <LinkIcon size={16} />}
                    {copied ? 'Copied!' : 'Copy Link & Text'}
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

/* ─── Main Leaderboard Component ────────────────────────────────────── */
const Leaderboard = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myRank, setMyRank] = useState(null);
    const [myData, setMyData] = useState(null);
    const [shareTarget, setShareTarget] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchAll = async () => {
        try {
            // Fetch ALL users — sort locally so no Firestore index needed
            // and every user (including those with 0 trees) is visible
            const snap = await getDocs(collection(db, 'users'));
            const all = snap.docs.map(d => ({
                id: d.id,
                name: d.data().name || d.data().displayName || 'Anonymous',
                photoURL: d.data().photoURL || '',
                treesPlanted: d.data().treesPlanted ?? 0,
                sessionsCount: d.data().sessionsCount ?? 0,
                totalFocusTime: d.data().totalFocusTime ?? 0,
            }));

            // Sort by trees descending, then by sessions as tiebreaker
            all.sort((a, b) => b.treesPlanted - a.treesPlanted || b.sessionsCount - a.sessionsCount);

            setRankings(all.map((r, i) => ({ ...r, rank: i + 1 })));

            // Find current user rank
            if (user?.uid) {
                const idx = all.findIndex(r => r.id === user.uid);
                if (idx >= 0) {
                    setMyRank(idx + 1);
                    setMyData(all[idx]);
                }
            }
            setLoading(false);
        } catch (e) {
            console.error('Leaderboard fetch error:', e);
            setError(e.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchAll();
        // Refresh every 30 seconds to stay up-to-date
        const interval = setInterval(fetchAll, 30000);
        return () => clearInterval(interval);
    }, [user?.uid]);

    const fmtTime = (s) => {
        if (!s) return '0m';
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const rankStyles = [
        { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
        { bg: 'bg-slate-400/10',  border: 'border-slate-400/20',  text: 'text-slate-300',  glow: 'shadow-slate-400/10' },
        { bg: 'bg-orange-700/10', border: 'border-orange-700/20', text: 'text-orange-400', glow: 'shadow-orange-700/10' },
    ];

    const RankBadge = ({ index }) => {
        if (index === 0) return <Crown size={14} className="text-yellow-400" />;
        if (index === 1) return <Medal size={14} className="text-slate-300" />;
        if (index === 2) return <Medal size={14} className="text-orange-400" />;
        return <span className="text-[11px] font-black text-text-muted">{index + 1}</span>;
    };

    const isMe = (id) => id === user?.uid;
    const myName = user?.displayName || myData?.name || 'You';
    const myPhoto = user?.photoURL || myData?.photoURL || '';

    return (
        <>
            <div className="glass p-6 rounded-[2.5rem] flex flex-col h-full border border-white/10 relative overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand/15 blur-[80px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-brand/10 rounded-2xl text-brand shadow-lg shadow-brand/10"><Trophy size={22} /></div>
                    <div>
                        <h3 className="text-lg font-black">Global Board</h3>
                        <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Live Rankings</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] text-green-400 font-black uppercase tracking-wider">Live</span>
                    </div>
                </div>

                {/* Column labels */}
                {!loading && rankings.length > 0 && (
                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 px-2 pb-2 text-[9px] font-black uppercase tracking-widest text-text-muted/50">
                        <span className="w-7" />
                        <span>Player</span>
                        <span className="text-right">Trees</span>
                        <span className="text-right">Sessions</span>
                    </div>
                )}

                {/* List */}
                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-3">
                            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                            <p className="text-text-muted text-xs font-bold uppercase tracking-widest animate-pulse">Loading...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-center px-4">
                            <span className="text-4xl">⚠️</span>
                            <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Connection Error</p>
                            <p className="text-[10px] text-text-muted">{error}</p>
                        </div>
                    ) : rankings.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-32 gap-3 text-center">
                            <span className="text-4xl opacity-40 filter grayscale">🌲</span>
                            <p className="text-text-muted text-xs font-bold uppercase tracking-widest">No users yet</p>
                            <p className="text-[10px] text-text-muted/60">Be the first to plant a tree!</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {rankings.map((ranker, index) => {
                                const me = isMe(ranker.id);
                                const style = rankStyles[index] || { bg: 'bg-white/3', border: 'border-transparent', text: 'text-text-muted', glow: '' };

                                return (
                                    <motion.div key={ranker.id} layout
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.04 }}
                                        className={`grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center p-3 rounded-2xl border transition-all group
                                            ${me
                                                ? 'bg-brand/10 border-brand/30 shadow-lg shadow-brand/10'
                                                : `${style.bg} ${style.border} hover:bg-white/5`
                                            }`}>

                                        {/* Rank badge */}
                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0
                                            ${index < 3 ? `${style.bg} border ${style.border}` : 'bg-white/5 border border-transparent'}`}>
                                            <RankBadge index={index} />
                                        </div>

                                        {/* Name + avatar */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Avatar photoURL={ranker.photoURL} name={ranker.name} size={26} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold truncate flex items-center gap-1">
                                                    {ranker.name}
                                                    {me && <span className="text-[7px] bg-brand text-white px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider shrink-0">You</span>}
                                                </p>
                                                <p className="text-[9px] text-text-muted">{fmtTime(ranker.totalFocusTime)}</p>
                                            </div>
                                        </div>

                                        {/* Trees */}
                                        <p className={`text-xs font-black ${index < 3 ? style.text : 'text-text-muted'} shrink-0 text-right`}>
                                            {ranker.treesPlanted} 🌳
                                        </p>

                                        {/* Sessions + share */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <p className="text-xs font-black text-text-muted text-right">
                                                ⚡{ranker.sessionsCount}
                                            </p>
                                            {me && (
                                                <button
                                                    onClick={() => setShareTarget({ ranker, rank: index + 1 })}
                                                    className="p-1 rounded-lg bg-brand/10 text-brand hover:bg-brand/30 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Share Achievement">
                                                    <Share2 size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {/* ── Your Position Footer (always shown when logged in) ── */}
                {user && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <Avatar photoURL={myPhoto} name={myName} size={28} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate flex items-center gap-1">
                                    {myName}
                                    <span className="text-[7px] bg-brand text-white px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider shrink-0">You</span>
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    {myData?.treesPlanted ?? 0} 🌳 &nbsp;·&nbsp; ⚡{myData?.sessionsCount ?? 0} &nbsp;·&nbsp; {fmtTime(myData?.totalFocusTime)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Your Rank</p>
                                    <p className="text-sm font-black text-brand">
                                        {myRank != null ? `#${myRank}` : (
                                            <span className="inline-block w-4 h-4 border border-brand border-t-transparent rounded-full animate-spin align-middle" />
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShareTarget({
                                        ranker: { ...myData, photoURL: myPhoto, name: myName },
                                        rank: myRank ?? '?'
                                    })}
                                    className="p-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-all"
                                    title="Share your rank">
                                    <Share2 size={14} />
                                </button>
                            </div>
                        </div>
                        {!(myData?.treesPlanted) && (
                            <p className="text-[10px] text-text-muted/60 mt-2 text-center">
                                🌱 Complete a focus session to plant your first tree!
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {shareTarget && (
                    <ShareModal
                        ranker={shareTarget.ranker}
                        rank={shareTarget.rank}
                        onClose={() => setShareTarget(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Leaderboard;
