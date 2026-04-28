import { useState, useEffect, useCallback, useRef } from 'react';

const SCOPES = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-private',
    'user-read-email',
    'streaming',
].join(' ');

/* ── PKCE Helpers ────────────────────────────────────────────────── */
const generateVerifier = () => {
    const arr = new Uint8Array(64);
    crypto.getRandomValues(arr);
    return btoa(String.fromCharCode(...arr))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 128);
};

const generateChallenge = async (verifier) => {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/* ── Hook ────────────────────────────────────────────────────────── */
export const useSpotify = () => {
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const REDIRECT_URI = window.location.origin + window.location.pathname;

    const [token, setToken] = useState(() => localStorage.getItem('sp_token'));
    const [expiry, setExpiry] = useState(() => parseInt(localStorage.getItem('sp_expiry') || '0'));
    const [nowPlaying, setNowPlaying] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [profile, setProfile] = useState(() => {
        try { return JSON.parse(localStorage.getItem('sp_profile') || 'null'); } catch { return null; }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const pollRef = useRef(null);

    const isValid = useCallback(() => token && Date.now() < expiry, [token, expiry]);

    /* Store token */
    const storeToken = useCallback((data) => {
        const exp = Date.now() + data.expires_in * 1000;
        localStorage.setItem('sp_token', data.access_token);
        localStorage.setItem('sp_expiry', exp.toString());
        if (data.refresh_token) localStorage.setItem('sp_refresh', data.refresh_token);
        setToken(data.access_token);
        setExpiry(exp);
    }, []);

    /* Refresh */
    const refresh = useCallback(async () => {
        const rt = localStorage.getItem('sp_refresh');
        if (!rt || !CLIENT_ID) return null;
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: rt, client_id: CLIENT_ID }),
        });
        const data = await res.json();
        if (data.access_token) { storeToken(data); return data.access_token; }
        return null;
    }, [CLIENT_ID, storeToken]);

    /* Get valid token */
    const getToken = useCallback(async () => {
        if (isValid()) return token;
        return await refresh();
    }, [isValid, token, refresh]);

    /* API helper */
    const api = useCallback(async (path, opts = {}) => {
        const t = await getToken();
        if (!t) return null;
        try {
            const res = await fetch(`https://api.spotify.com/v1${path}`, {
                ...opts,
                headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', ...opts.headers },
            });
            if (res.status === 204) return true;
            if (!res.ok) return null;
            return res.json();
        } catch { return null; }
    }, [getToken]);

    /* Exchange auth code → token */
    const exchangeCode = useCallback(async (code) => {
        const verifier = sessionStorage.getItem('sp_verifier');
        if (!verifier || !CLIENT_ID) return;
        setLoading(true);
        try {
            const res = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: window.location.origin + '/',
                    client_id: CLIENT_ID,
                    code_verifier: verifier,
                }),
            });
            const data = await res.json();
            if (data.access_token) {
                storeToken(data);
                sessionStorage.removeItem('sp_verifier');
                window.history.replaceState({}, '', '/');
            } else {
                setError('Spotify auth failed. Please try again.');
            }
        } catch (e) {
            setError('Could not connect to Spotify.');
        } finally {
            setLoading(false);
        }
    }, [CLIENT_ID, storeToken]);

    /* Handle callback on mount */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const err = params.get('error');
        if (err) { window.history.replaceState({}, '', '/'); return; }
        if (code && sessionStorage.getItem('sp_verifier')) {
            exchangeCode(code);
        }
    }, [exchangeCode]);

    /* Fetch now playing */
    const fetchNowPlaying = useCallback(async () => {
        const data = await api('/me/player/currently-playing');
        if (data?.item) {
            setNowPlaying(data.item);
            setIsPlaying(data.is_playing);
        } else if (data === null) {
            setNowPlaying(null);
            setIsPlaying(false);
        }
    }, [api]);

    /* On valid token — fetch profile & start polling */
    useEffect(() => {
        if (!isValid()) return;
        api('/me').then(p => {
            if (p) {
                setProfile(p);
                localStorage.setItem('sp_profile', JSON.stringify(p));
            }
        });
        fetchNowPlaying();
        pollRef.current = setInterval(fetchNowPlaying, 5000);
        return () => clearInterval(pollRef.current);
    }, [token]); // eslint-disable-line

    /* Controls */
    const togglePlay = useCallback(async () => {
        const t = await getToken();
        if (!t) return;
        await fetch(`https://api.spotify.com/v1/me/player/${isPlaying ? 'pause' : 'play'}`, {
            method: 'PUT', headers: { Authorization: `Bearer ${t}` },
        });
        setTimeout(fetchNowPlaying, 400);
    }, [getToken, isPlaying, fetchNowPlaying]);

    const skipNext = useCallback(async () => {
        await api('/me/player/next', { method: 'POST' });
        setTimeout(fetchNowPlaying, 600);
    }, [api, fetchNowPlaying]);

    const skipPrev = useCallback(async () => {
        await api('/me/player/previous', { method: 'POST' });
        setTimeout(fetchNowPlaying, 600);
    }, [api, fetchNowPlaying]);

    /* Connect — initiate PKCE OAuth */
    const connect = useCallback(async () => {
        if (!CLIENT_ID) {
            alert('Add VITE_SPOTIFY_CLIENT_ID to your .env file!\nSee the Spotify setup instructions.');
            return;
        }
        const verifier = generateVerifier();
        const challenge = await generateChallenge(verifier);
        sessionStorage.setItem('sp_verifier', verifier);
        const url = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: window.location.origin + '/',
            code_challenge_method: 'S256',
            code_challenge: challenge,
            scope: SCOPES,
        });
        window.location.href = url;
    }, [CLIENT_ID]);

    /* Disconnect */
    const disconnect = useCallback(() => {
        ['sp_token', 'sp_expiry', 'sp_refresh', 'sp_profile'].forEach(k => localStorage.removeItem(k));
        clearInterval(pollRef.current);
        setToken(null);
        setProfile(null);
        setNowPlaying(null);
        setIsPlaying(false);
    }, []);

    return {
        connected: isValid(),
        profile,
        nowPlaying,
        isPlaying,
        loading,
        error,
        connect,
        disconnect,
        togglePlay,
        skipNext,
        skipPrev,
        hasClientId: !!CLIENT_ID,
    };
};
