import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Database, Eye, Share2, Cookie, Mail, UserCheck, Trash2 } from 'lucide-react';

const Section = ({ icon: Icon, title, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass border border-white/10 rounded-[2rem] p-8 space-y-4"
    >
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-400">
                <Icon size={20} />
            </div>
            <h2 className="text-lg font-black">{title}</h2>
        </div>
        <div className="text-sm text-text-muted leading-relaxed space-y-3">
            {children}
        </div>
    </motion.div>
);

const Privacy = () => {
    const lastUpdated = 'April 30, 2026';

    return (
        <div className="min-h-screen p-4 sm:p-8 max-w-3xl mx-auto w-full">
            {/* Back button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors font-bold text-sm group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to FocusFlow
                </Link>
            </motion.div>

            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6">
                    <Lock size={14} className="text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Privacy</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                    Privacy Policy
                </h1>
                <p className="text-text-muted text-sm">
                    Last updated: <span className="text-white font-bold">{lastUpdated}</span>
                </p>
            </motion.div>

            <div className="space-y-4">
                {/* Intro */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass border border-emerald-500/20 rounded-[2rem] p-8 bg-emerald-500/5"
                >
                    <p className="text-sm text-text-muted leading-relaxed">
                        At <span className="text-white font-bold">FocusFlow</span>, your privacy matters deeply to us. This Privacy Policy explains what data we collect, how we use it, and the controls you have over your information. We are committed to transparency and will never sell your personal data.
                    </p>
                </motion.div>

                <Section icon={Database} title="1. Information We Collect" delay={0.1}>
                    <p><strong className="text-white">Account Information:</strong> When you register, we collect your name, email address, and (if you use Google Sign-In) your profile picture.</p>
                    <p><strong className="text-white">Usage Data:</strong> We store your focus sessions, trees planted, session durations, and tasks associated with sessions. This is necessary to power the leaderboard and your personal progress tracking.</p>
                    <p><strong className="text-white">Local Storage:</strong> Timer settings, theme preferences, and recent session history are stored locally in your browser and never transmitted to our servers unless you are signed in.</p>
                    <p><strong className="text-white">Technical Data:</strong> Basic analytics such as page views and feature usage (via Google Analytics) to improve the app. This data is aggregated and anonymized.</p>
                </Section>

                <Section icon={Eye} title="2. How We Use Your Data" delay={0.15}>
                    <p>We use the data we collect for the following purposes:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>To provide, operate, and maintain the FocusFlow service</li>
                        <li>To power the global leaderboard and rank users by focus time and trees planted</li>
                        <li>To display your personal progress, session history, and achievements</li>
                        <li>To send optional browser notifications about session completions</li>
                        <li>To improve and develop new features based on aggregated usage patterns</li>
                        <li>To respond to support requests</li>
                    </ul>
                    <p>We do <strong className="text-white">not</strong> use your data for advertising, profiling, or sell it to any third party.</p>
                </Section>

                <Section icon={Share2} title="3. Data Sharing & Third Parties" delay={0.2}>
                    <p>We use the following trusted third-party services to operate FocusFlow:</p>
                    <div className="space-y-3 mt-2">
                        {[
                            { name: 'Firebase (Google)', use: 'Authentication, database (Firestore), and analytics', link: 'https://firebase.google.com/support/privacy' },
                            { name: 'Spotify API', use: 'Music integration (optional). Only accessed if you connect your account', link: 'https://www.spotify.com/privacy' },
                        ].map(tp => (
                            <div key={tp.name} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-white font-bold text-xs">{tp.name}</p>
                                <p className="text-[11px] mt-1">{tp.use}</p>
                                <a href={tp.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand hover:underline mt-1 block">View their Privacy Policy →</a>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section icon={Lock} title="4. Data Security" delay={0.25}>
                    <p>We take data security seriously. Your data is stored in Firebase's secure cloud infrastructure with industry-standard encryption in transit (TLS) and at rest.</p>
                    <p>Access to your Firestore data is controlled by Firebase Security Rules, ensuring users can only read and write their own data (except for leaderboard rankings which are read-only public).</p>
                    <p>However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security and encourage you to use a strong, unique password.</p>
                </Section>

                <Section icon={UserCheck} title="5. Your Rights & Controls" delay={0.3}>
                    <p>You have the following rights over your data:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong className="text-white">Access:</strong> View all your data via your Profile page</li>
                        <li><strong className="text-white">Correction:</strong> Update your display name anytime through your account settings</li>
                        <li><strong className="text-white">Deletion:</strong> Request deletion of your account and all associated data by contacting us</li>
                        <li><strong className="text-white">Portability:</strong> Request an export of your session history data</li>
                        <li><strong className="text-white">Opt-out:</strong> You can disable browser notifications at any time through your browser settings</li>
                    </ul>
                </Section>

                <Section icon={Cookie} title="6. Cookies & Local Storage" delay={0.35}>
                    <p>FocusFlow uses browser <strong className="text-white">localStorage</strong> (not cookies) to persist your timer settings, theme preferences, and session history between visits. This data stays on your device and is not synced unless you are signed in.</p>
                    <p>Firebase may use session cookies for authentication purposes. These are essential to keep you logged in and cannot be disabled without logging out.</p>
                </Section>

                <Section icon={Trash2} title="7. Data Retention" delay={0.4}>
                    <p>We retain your account and session data for as long as your account is active. If you delete your account, all personally identifiable data is removed from our systems within 30 days.</p>
                    <p>Anonymized, aggregated analytics data (such as total usage statistics) may be retained for longer periods to help us improve the service.</p>
                </Section>

                <Section icon={Mail} title="8. Contact Us" delay={0.45}>
                    <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please reach out to us:</p>
                    <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-white font-bold">FocusFlow Privacy Team</p>
                        <p>Email: <a href="mailto:jawaan25fcrit@gmail.com" className="text-emerald-400 hover:underline">jawaan25fcrit@gmail.com</a></p>
                        <p className="text-[11px] mt-2 text-text-muted/70">We aim to respond to all privacy-related requests within 72 hours.</p>
                    </div>
                </Section>

                {/* Footer links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center pt-4 pb-8"
                >
                    <p className="text-text-muted text-xs">
                        Also read our{' '}
                        <Link to="/terms" className="text-brand hover:underline font-bold">Terms of Service</Link>
                        {' '}·{' '}
                        <Link to="/" className="text-brand hover:underline font-bold">Back to App</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Privacy;
