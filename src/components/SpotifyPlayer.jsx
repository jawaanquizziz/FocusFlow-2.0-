import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Music2, Play, Pause, SkipForward, SkipBack,
    LogOut, ExternalLink, Wifi, WifiOff, Search, Library
} from 'lucide-react';
import { useSpotify } from '../hooks/useSpotify';

/* ── Spotify brand green ─────────────────────────────────────────── */
const SP_GREEN = '#1DB954';
const SP_GREEN_DIM = 'rgba(29,185,84,0.15)';
const SP_GREEN_BORDER = 'rgba(29,185,84,0.3)';

/* ── Spotify logo SVG ────────────────────────────────────────────── */
const SpotifyLogo = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={SP_GREEN}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.517 17.257a.75.75 0 01-1.032.244c-2.822-1.727-6.374-2.117-10.56-1.16a.75.75 0 11-.336-1.462c4.578-1.048 8.505-.597 11.684 1.346a.75.75 0 01.244 1.032zm1.47-3.27a.938.938 0 01-1.29.307c-3.229-1.984-8.148-2.56-11.969-1.4a.938.938 0 11-.546-1.794c4.363-1.328 9.784-.684 13.498 1.597a.938.938 0 01.307 1.29zm.126-3.404C15.553 8.48 9.38 8.275 5.91 9.31a1.125 1.125 0 11-.655-2.153c4.026-1.225 10.72-.988 14.95 1.59a1.125 1.125 0 01-1.092 1.836z"/>
    </svg>
);

/* ── Focus playlists (Spotify Editorial) ────────────────────────── */
const FOCUS_PLAYLISTS = [
    { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus', desc: 'Keep calm and focus' },
    { id: '37i9dQZF1DX8Uebhn9bgda', name: 'Lo-Fi Beats', desc: 'Beats to study/relax to' },
    { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', desc: 'Relaxing piano to focus' },
    { id: '37i9dQZF1DX9sIqqvKsjEE', name: 'Instrumental Study', desc: 'Pure instrumental focus' },
];

/* ── Marquee for long track names ───────────────────────────────── */
const Marquee = ({ text, className }) => {
    const isLong = text?.length > 22;
    return (
        <div className={`overflow-hidden whitespace-nowrap ${className}`}>
            {isLong ? (
                <motion.span
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: text.length * 0.25, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                    style={{ display: 'inline-block' }}
                >
                    {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
                </motion.span>
            ) : <span>{text}</span>}
        </div>
    );
};

/* ── Main component ──────────────────────────────────────────────── */
const SpotifyPlayer = () => {
    const {
        connected, profile, nowPlaying, isPlaying, loading, error,
        connect, disconnect, togglePlay, skipNext, skipPrev, hasClientId,
        searchTracks, getUserPlaylists, playContext
    } = useSpotify();

    const [activeTab, setActiveTab] = useState('focus'); // focus | library | search
    const [activePlaylist, setActivePlaylist] = useState(null); // For iframe

    const track = nowPlaying;
    const albumArt = track?.album?.images?.[0]?.url;
    const trackName = track?.name || '';
    const artistName = track?.artists?.map(a => a.name).join(', ') || '';

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Library state
    const [library, setLibrary] = useState([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);

    // Fetch library when tab changes to library
    useEffect(() => {
        if (activeTab === 'library' && library.length === 0) {
            setLoadingLibrary(true);
            getUserPlaylists().then(res => {
                setLibrary(res);
                setLoadingLibrary(false);
            });
        }
    }, [activeTab, getUserPlaylists, library.length]);

    // Handle search
    useEffect(() => {
        if (activeTab !== 'search' || !searchQuery) {
            setSearchResults([]);
            return;
        }
        const delayBounceFn = setTimeout(() => {
            setIsSearching(true);
            searchTracks(searchQuery).then(res => {
                setSearchResults(res);
                setIsSearching(false);
            });
        }, 500);
        return () => clearTimeout(delayBounceFn);
    }, [searchQuery, activeTab, searchTracks]);

    const handlePlayItem = (uri, isContext = false) => {
        // If they click an item, try to play it via API
        if (isContext) {
            playContext(uri);
        } else {
            playContext(null, [uri]);
        }
    };

    return (
        <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden relative flex flex-col h-full"
            style={{ boxShadow: connected ? `0 0 40px rgba(29,185,84,0.08), 0 8px 48px rgba(0,0,0,0.5)` : undefined }}>

            {/* Ambient glow when connected + playing */}
            {connected && isPlaying && (
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(29,185,84,0.25) 0%, transparent 70%)', filter: 'blur(20px)' }} />
            )}

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between p-5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl" style={{ background: SP_GREEN_DIM, border: `1px solid ${SP_GREEN_BORDER}` }}>
                        <SpotifyLogo size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white">Spotify</h3>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                            {connected ? (profile?.display_name ? `@${profile.display_name}` : 'Connected') : 'Music for Focus'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Live indicator */}
                    {connected && isPlaying && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ background: SP_GREEN_DIM, border: `1px solid ${SP_GREEN_BORDER}` }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: SP_GREEN }} />
                            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: SP_GREEN }}>Live</span>
                        </div>
                    )}
                    {connected ? (
                        <button onClick={disconnect}
                            className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Disconnect Spotify">
                            <LogOut size={14} />
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <WifiOff size={12} className="text-slate-600" />
                            <span className="text-[10px] text-slate-600 font-bold">Offline</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Error ──────────────────────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mx-5 mb-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl font-semibold">
                        ⚠ {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* ── Not Connected State ─────────────────────────────── */}
            {!connected && (
                <div className="px-5 pb-5 flex flex-col gap-4">
                    {!hasClientId ? (
                        /* Setup instructions */
                        <div className="rounded-2xl p-4 text-xs space-y-2"
                            style={{ background: 'rgba(29,185,84,0.06)', border: `1px solid ${SP_GREEN_BORDER}` }}>
                            <p className="font-black text-white text-sm mb-3">Setup Required</p>
                            <p className="text-slate-400">Add your Spotify Client ID to <code className="text-green-400 bg-white/5 px-1.5 py-0.5 rounded-md">.env</code>:</p>
                            <code className="block bg-black/30 px-3 py-2 rounded-xl text-green-300 text-[10px] font-mono">
                                VITE_SPOTIFY_CLIENT_ID=your_client_id
                            </code>
                            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 font-bold mt-2 transition-opacity hover:opacity-80"
                                style={{ color: SP_GREEN }}>
                                Get Client ID at developer.spotify.com <ExternalLink size={10} />
                            </a>
                        </div>
                    ) : (
                        /* Connect button */
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={connect} disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-sm text-black transition-all disabled:opacity-60"
                            style={{ background: loading ? '#666' : SP_GREEN, boxShadow: `0 8px 24px rgba(29,185,84,0.35)` }}>
                            {loading
                                ? <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                                : <SpotifyLogo size={18} />}
                            {loading ? 'Connecting...' : 'Connect Spotify'}
                        </motion.button>
                    )}

                    {/* Curated playlists (always visible) */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-3">Focus Playlists</p>
                        <div className="grid grid-cols-2 gap-2">
                            {FOCUS_PLAYLISTS.map(pl => (
                                <motion.button key={pl.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => setActivePlaylist(activePlaylist === pl.id ? null : pl.id)}
                                    className="text-left p-3 rounded-2xl border transition-all"
                                    style={{
                                        background: activePlaylist === pl.id ? SP_GREEN_DIM : 'rgba(255,255,255,0.03)',
                                        borderColor: activePlaylist === pl.id ? SP_GREEN_BORDER : 'rgba(255,255,255,0.07)',
                                    }}>
                                    <Music2 size={14} style={{ color: SP_GREEN, marginBottom: 6 }} />
                                    <p className="text-xs font-bold text-white">{pl.name}</p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">{pl.desc}</p>
                                </motion.button>
                            ))}
                        </div>

                        {/* Embedded player */}
                        <AnimatePresence>
                            {activePlaylist && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                                    className="mt-3 overflow-hidden rounded-2xl">
                                    <iframe
                                        src={`https://open.spotify.com/embed/playlist/${activePlaylist}?utm_source=generator&theme=0`}
                                        width="100%" height="152" frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy" style={{ borderRadius: '16px' }}
                                        title="Spotify Playlist"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* ── Connected: Now Playing ──────────────────────────── */}
            {connected && (
                <div className="px-5 pb-5 flex flex-col gap-4">
                    {/* Now Playing Card */}
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {track ? (
                            <div className="flex items-center gap-4">
                                {/* Album Art */}
                                <div className="relative shrink-0">
                                    <motion.img
                                        key={albumArt}
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                        src={albumArt} alt={trackName}
                                        className="w-14 h-14 rounded-xl object-cover shadow-lg"
                                        style={{ boxShadow: `0 8px 20px rgba(0,0,0,0.5)` }}
                                    />
                                    {/* Spinning vinyl ring when playing */}
                                    {isPlaying && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                            className="absolute -inset-1 rounded-full border-2 border-dashed opacity-30"
                                            style={{ borderColor: SP_GREEN }}
                                        />
                                    )}
                                </div>

                                {/* Track info */}
                                <div className="flex-1 min-w-0">
                                    <Marquee text={trackName} className="text-sm font-bold text-white" />
                                    <Marquee text={artistName} className="text-xs text-slate-400 mt-0.5" />
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                            style={{ background: SP_GREEN_DIM, color: SP_GREEN, border: `1px solid ${SP_GREEN_BORDER}` }}>
                                            {isPlaying ? '♫ Playing' : '⏸ Paused'}
                                        </span>
                                    </div>
                                </div>

                                {/* Open in Spotify */}
                                <a href={track.external_urls?.spotify} target="_blank" rel="noreferrer"
                                    className="shrink-0 p-2 rounded-xl text-slate-500 hover:text-green-400 hover:bg-green-500/10 transition-all"
                                    title="Open in Spotify">
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: SP_GREEN_DIM }}>
                                    <Music2 size={16} style={{ color: SP_GREEN }} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Nothing playing</p>
                                    <p className="text-xs text-slate-500">Search or select a playlist below</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                            onClick={skipPrev}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-all hover:bg-white/5">
                            <SkipBack size={18} />
                        </motion.button>

                        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            onClick={togglePlay}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-bold shadow-lg transition-all"
                            style={{ background: SP_GREEN, boxShadow: `0 8px 24px rgba(29,185,84,0.4)` }}>
                            {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
                        </motion.button>

                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                            onClick={skipNext}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-all hover:bg-white/5">
                            <SkipForward size={18} />
                        </motion.button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-white/5 p-1 rounded-xl mb-1 mt-2">
                        {[
                            { id: 'focus', icon: Music2, label: 'Focus' },
                            { id: 'library', icon: Library, label: 'Library' },
                            { id: 'search', icon: Search, label: 'Search' }
                        ].map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === t.id ? 'bg-white/10 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                                <t.icon size={12} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="relative min-h-[160px] max-h-[220px] overflow-y-auto custom-scrollbar pr-1 space-y-2">
                        {activeTab === 'focus' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {FOCUS_PLAYLISTS.map(pl => (
                                        <button key={pl.id} onClick={() => setActivePlaylist(activePlaylist === pl.id ? null : pl.id)}
                                            className="text-left p-3 rounded-2xl border transition-all"
                                            style={{
                                                background: activePlaylist === pl.id ? SP_GREEN_DIM : 'rgba(255,255,255,0.03)',
                                                borderColor: activePlaylist === pl.id ? SP_GREEN_BORDER : 'rgba(255,255,255,0.07)',
                                            }}>
                                            <p className="text-xs font-bold text-white">{pl.name}</p>
                                        </button>
                                    ))}
                                </div>
                                {activePlaylist && (
                                    <iframe
                                        src={`https://open.spotify.com/embed/playlist/${activePlaylist}?utm_source=generator&theme=0`}
                                        width="100%" height="152" frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy" style={{ borderRadius: '16px' }}
                                    />
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'library' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {loadingLibrary ? (
                                    <div className="flex justify-center py-6">
                                        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : library.length === 0 ? (
                                    <p className="text-center text-xs text-slate-500 py-6">No playlists found.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {library.map(pl => (
                                            <button key={pl.id} onClick={() => handlePlayItem(pl.uri, true)}
                                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left">
                                                <img src={pl.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={pl.name} className="w-10 h-10 rounded-lg object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{pl.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{pl.tracks?.total} tracks</p>
                                                </div>
                                                <Play size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'search' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search for a song..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50"
                                    />
                                </div>
                                {isSearching ? (
                                    <div className="flex justify-center py-4">
                                        <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {searchResults.map(track => (
                                            <button key={track.id} onClick={() => handlePlayItem(track.uri, false)}
                                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left group">
                                                <img src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url} alt={track.name} className="w-8 h-8 rounded-md object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{track.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{track.artists?.map(a => a.name).join(', ')}</p>
                                                </div>
                                                <Play size={12} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpotifyPlayer;
