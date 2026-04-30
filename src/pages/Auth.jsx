import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, BookOpen, Timer, Trophy, X, FileText, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/* ─── Google Logo ───────────────────────────────────────────────── */
const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
);

/* ─── Legal Modal ───────────────────────────────────────────────── */
const LegalModal = ({ type, onClose }) => {
    const isTerms = type === 'terms';

    const termsContent = [
        {
            title: '1. Acceptance of Terms',
            body: 'By creating an account or using FocusFlow, you confirm that you are at least 13 years of age. We reserve the right to update these terms at any time. Continued use constitutes acceptance of updated terms.'
        },
        {
            title: '2. Use of the Service',
            body: 'FocusFlow is a productivity platform for personal time management. You agree to use it only for lawful purposes. Permitted uses include personal focus tracking, competing on the leaderboard in good faith, and sharing achievements.'
        },
        {
            title: '3. Prohibited Activities',
            body: 'You may not manipulate leaderboard rankings with bots, create multiple accounts for unfair advantages, reverse-engineer the app, upload malware, harass other users, or use the service for commercial purposes without written consent.'
        },
        {
            title: '4. Account Responsibility',
            body: 'You are responsible for maintaining your account credentials. Notify us immediately at jawaan25fcrit@gmail.com if you suspect unauthorized access. We may suspend accounts that violate these terms.'
        },
        {
            title: '5. Intellectual Property',
            body: 'All FocusFlow content and software is our exclusive property. Your data (sessions, tasks, notes) belongs to you; by using FocusFlow you grant us a limited license to store it to provide the service.'
        },
        {
            title: '6. Disclaimer of Warranties',
            body: 'FocusFlow is provided "as is" without warranties of any kind. We are not responsible for data loss or productivity loss resulting from use or inability to use the service.'
        },
        {
            title: '7. Contact',
            body: 'Questions? Email us at jawaan25fcrit@gmail.com. We aim to respond within 48 hours.'
        },
    ];

    const privacyContent = [
        {
            title: '1. Information We Collect',
            body: 'We collect your name, email, and profile picture (if using Google Sign-In). We also store focus sessions, trees planted, and task data to power the leaderboard. Timer settings are stored locally in your browser.'
        },
        {
            title: '2. How We Use Your Data',
            body: 'We use your data to operate FocusFlow, power the global leaderboard, display your progress, and improve features. We do NOT use your data for advertising or sell it to any third party.'
        },
        {
            title: '3. Third-Party Services',
            body: 'We use Firebase (Google) for authentication, database, and analytics. Spotify integration is optional and only accessed if you connect your account. Both have their own privacy policies.'
        },
        {
            title: '4. Data Security',
            body: 'Your data is stored in Firebase with industry-standard encryption in transit (TLS) and at rest. Firebase Security Rules ensure users can only access their own data.'
        },
        {
            title: '5. Your Rights',
            body: 'You may access your data via the Profile page, correct your display name in settings, or request full deletion by contacting us. You can disable browser notifications anytime.'
        },
        {
            title: '6. Cookies & Local Storage',
            body: 'FocusFlow uses localStorage (not cookies) to persist settings and session history on your device. Firebase uses session cookies for authentication which are required to keep you logged in.'
        },
        {
            title: '7. Contact',
            body: 'Privacy questions? Email jawaan25fcrit@gmail.com. We aim to respond to all privacy requests within 72 hours.'
        },
    ];

    const content = isTerms ? termsContent : privacyContent;
    const accent = isTerms ? 'var(--brand-color)' : '#10b981';
    const accentRgb = isTerms ? 'var(--brand-rgb)' : '16,185,129';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.93, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.93, y: 24, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
                style={{ background: '#0f172a' }}
            >
                {/* Sticky Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-white/10 shrink-0"
                    style={{ background: `rgba(${accentRgb},0.06)` }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: `rgba(${accentRgb},0.12)` }}>
                            {isTerms
                                ? <FileText size={18} style={{ color: accent }} />
                                : <Shield size={18} style={{ color: accent }} />}
                        </div>
                        <div>
                            <h2 className="font-black text-base text-white">
                                {isTerms ? 'Terms of Service' : 'Privacy Policy'}
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent, opacity: 0.7 }}>
                                FocusFlow · Last updated April 2026
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-7 py-5 space-y-5 custom-scrollbar">
                    {/* Intro banner */}
                    <div className="rounded-2xl p-4 text-sm text-slate-300 leading-relaxed border"
                        style={{
                            background: `rgba(${accentRgb},0.06)`,
                            borderColor: `rgba(${accentRgb},0.2)`
                        }}>
                        {isTerms
                            ? 'By using FocusFlow, you agree to these terms. Please read them carefully.'
                            : 'We respect your privacy and are committed to protecting your personal data.'}
                    </div>

                    {/* Sections */}
                    {content.map((section, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="rounded-2xl p-4 border border-white/5 bg-white/[0.03]"
                        >
                            <h3 className="font-black text-sm text-white mb-2 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                                    style={{ background: `rgba(${accentRgb},0.15)`, color: accent }}>
                                    {i + 1}
                                </span>
                                {section.title.replace(/^\d+\.\s/, '')}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{section.body}</p>
                        </motion.div>
                    ))}

                    <p className="text-[10px] text-slate-600 text-center pb-2">
                        © 2026 FocusFlow. All rights reserved.
                    </p>
                </div>

                {/* Sticky Footer */}
                <div className="px-7 py-4 border-t border-white/10 shrink-0" style={{ background: '#0f172a' }}>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: `rgba(${accentRgb},0.8)` }}
                    >
                        Got it — Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── Features list ─────────────────────────────────────────────── */
const features = [
    { icon: Timer, title: 'Smart Pomodoro Timer', desc: 'Science-backed 25/5 focus intervals with ambient soundscapes' },
    { icon: Trophy, title: 'Global Leaderboard', desc: 'Compete with students worldwide, track your trees planted' },
    { icon: BookOpen, title: 'Task & Planner', desc: 'Integrated to-do list, timetable, and session planner' },
    { icon: Sparkles, title: 'Progress Analytics', desc: 'Beautiful charts to visualize your productivity journey' },
];

/* ─── Auth Page ─────────────────────────────────────────────────── */
const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | null

    const { login, register, signInWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            if (isLogin) await login(email, password);
            else await register(email, password, name);
        } catch (err) {
            setError(err.message.replace('Firebase: ', '').replace(/\(.*\)\.?$/, '').trim());
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsGoogleLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                setError(err.message.replace('Firebase: ', '').replace(/\(.*\)\.?$/, '').trim());
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--bg-color)' }}>

            {/* ── LEFT PANEL — Branding ───────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center p-16 overflow-hidden">
                <div className="animate-float-1 absolute top-[8%] left-[10%] w-80 h-80 rounded-full opacity-60"
                    style={{ background: 'radial-gradient(circle, rgba(var(--brand-rgb),0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                <div className="animate-float-2 absolute bottom-[12%] right-[8%] w-96 h-96 rounded-full opacity-40"
                    style={{ background: 'radial-gradient(circle, rgba(var(--brand-rgb),0.25) 0%, transparent 70%)', filter: 'blur(60px)' }} />
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 max-w-md w-full">

                    <div className="flex items-center gap-4 mb-12">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl blur-xl opacity-60" style={{ background: 'var(--brand-color)' }} />
                            <img src="/logo.png" alt="FocusFlow" className="relative w-14 h-14 rounded-2xl shadow-2xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                Focus<span style={{ color: 'var(--brand-color)' }}>Flow</span>
                            </h1>
                            <div className="tag-badge mt-1">Student Productivity Suite</div>
                        </div>
                    </div>

                    <h2 className="text-5xl font-bold leading-[1.1] tracking-tight mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <span className="gradient-text">Master Your</span><br />
                        <span className="text-white">Focus. Grow</span><br />
                        <span style={{ color: 'var(--brand-color)' }} className="glow-sm">Your Forest.</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12 font-medium">
                        The all-in-one productivity suite built for ambitious students.
                    </p>

                    <div className="space-y-4">
                        {features.map((f, i) => (
                            <motion.div key={f.title}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.08 }}
                                className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                                    style={{ background: `rgba(var(--brand-rgb), 0.12)`, border: `1px solid rgba(var(--brand-rgb), 0.2)` }}>
                                    <f.icon size={18} style={{ color: 'var(--brand-color)' }} />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{f.title}</p>
                                    <p className="text-slate-500 text-xs">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {['#6366F1', '#10B981', '#F59E0B', '#EF4444'].map((c, i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg-color)] flex items-center justify-center text-xs font-black text-white"
                                    style={{ background: c, zIndex: 4 - i }}>
                                    {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="text-slate-400 text-sm">
                            <span className="text-white font-bold">500+ students</span> already building their forest
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ── RIGHT PANEL — Auth Form ─────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative"
                style={{ background: 'linear-gradient(135deg, rgba(var(--brand-rgb),0.04) 0%, var(--bg-secondary) 100%)' }}>

                <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--brand-rgb),0.4), transparent)' }} />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[420px]">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <img src="/logo.png" alt="FocusFlow" className="w-10 h-10 rounded-xl shadow-lg" />
                        <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            Focus<span style={{ color: 'var(--brand-color)' }}>Flow</span>
                        </span>
                    </div>

                    <div className="mb-8">
                        <AnimatePresence mode="wait">
                            <motion.h2 key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
                                className="text-3xl font-bold text-white mb-2"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {isLogin ? 'Sign in' : 'Create account'}
                            </motion.h2>
                        </AnimatePresence>
                        <p className="text-slate-400 text-sm">
                            {isLogin ? 'Welcome back! Ready to focus today?' : 'Join thousands of students leveling up.'}
                        </p>
                    </div>

                    {/* Google Button */}
                    <motion.button
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isSubmitting}
                        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm text-gray-800 bg-white transition-all shadow-lg hover:shadow-xl disabled:opacity-60 mb-6"
                        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.8) inset' }}>
                        {isGoogleLoading
                            ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            : <GoogleLogo />}
                        <span>{isGoogleLoading ? 'Opening Google...' : 'Continue with Google'}</span>
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 divider-glow" />
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">or</span>
                        <div className="flex-1 divider-glow" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                            placeholder="Your full name"
                                            className="input-premium w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white font-medium placeholder:text-slate-600" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="name@domain.com"
                                    className="input-premium w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white font-medium placeholder:text-slate-600" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-premium w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white font-medium placeholder:text-slate-600" />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="text-red-400 text-xs font-semibold py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    ⚠ {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <motion.button type="submit" disabled={isSubmitting || isGoogleLoading}
                            whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                            className="btn-brand shimmer-btn w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50">
                            {isSubmitting
                                ? <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                : <><span>{isLogin ? 'Sign In' : 'Create Account'}</span><ArrowRight size={16} /></>}
                        </motion.button>
                    </form>

                    {/* Toggle login/register */}
                    <p className="mt-6 text-center text-slate-400 text-sm">
                        {isLogin ? 'New to FocusFlow?' : 'Already have an account?'}{' '}
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="font-bold transition-colors hover:opacity-80"
                            style={{ color: 'var(--brand-color)' }}>
                            {isLogin ? 'Create account' : 'Sign in'}
                        </button>
                    </p>

                    {/* Legal footer — opens modal on click */}
                    <p className="mt-6 text-center text-slate-600 text-xs">
                        By continuing, you agree to FocusFlow's{' '}
                        <button
                            onClick={() => setLegalModal('terms')}
                            className="underline underline-offset-2 hover:text-slate-300 transition-colors font-semibold">
                            Terms of Service
                        </button>
                        {' '}and{' '}
                        <button
                            onClick={() => setLegalModal('privacy')}
                            className="underline underline-offset-2 hover:text-slate-300 transition-colors font-semibold">
                            Privacy Policy
                        </button>
                    </p>
                </motion.div>
            </div>

            {/* ── Legal Modal Overlay ─────────────────────────────────── */}
            <AnimatePresence>
                {legalModal && (
                    <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Auth;
