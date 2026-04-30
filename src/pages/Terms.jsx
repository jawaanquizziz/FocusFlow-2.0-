import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertTriangle, Ban, RotateCcw, Mail } from 'lucide-react';

const Section = ({ icon: Icon, title, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass border border-white/10 rounded-[2rem] p-8 space-y-4"
    >
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-brand/10 rounded-2xl text-brand">
                <Icon size={20} />
            </div>
            <h2 className="text-lg font-black">{title}</h2>
        </div>
        <div className="text-sm text-text-muted leading-relaxed space-y-3">
            {children}
        </div>
    </motion.div>
);

const Terms = () => {
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
                <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-2 rounded-full mb-6">
                    <FileText size={14} className="text-brand" />
                    <span className="text-xs font-black uppercase tracking-widest text-brand">Legal</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                    Terms of Service
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
                    className="glass border border-white/10 rounded-[2rem] p-8 bg-brand/5"
                >
                    <p className="text-sm text-text-muted leading-relaxed">
                        Welcome to <span className="text-white font-bold">FocusFlow</span>. By accessing or using our application, you agree to be bound by these Terms of Service. Please read them carefully before using the platform. If you do not agree, please discontinue use of the service.
                    </p>
                </motion.div>

                <Section icon={FileText} title="1. Acceptance of Terms" delay={0.1}>
                    <p>By creating an account or using FocusFlow, you confirm that you are at least 13 years of age and have the legal capacity to enter into these terms. If you are under 18, please ensure a parent or guardian has reviewed and agreed to these terms.</p>
                    <p>We reserve the right to update these terms at any time. Continued use of FocusFlow after changes constitutes your acceptance of the updated terms.</p>
                </Section>

                <Section icon={Shield} title="2. Use of the Service" delay={0.15}>
                    <p>FocusFlow is a productivity platform designed to help users manage their time, track focus sessions, and grow a virtual forest. You agree to use the service only for lawful purposes and in a manner that does not infringe the rights of others.</p>
                    <p><strong className="text-white">Permitted uses:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Personal productivity tracking and focus management</li>
                        <li>Competing on the global leaderboard in good faith</li>
                        <li>Sharing your achievements on social platforms</li>
                    </ul>
                </Section>

                <Section icon={Ban} title="3. Prohibited Activities" delay={0.2}>
                    <p>You agree NOT to engage in any of the following:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Attempting to manipulate leaderboard rankings through bots or scripts</li>
                        <li>Creating multiple accounts to gain unfair advantages</li>
                        <li>Reverse engineering, decompiling, or disassembling any part of FocusFlow</li>
                        <li>Uploading or transmitting viruses, malware, or harmful code</li>
                        <li>Harassing, abusing, or impersonating other users</li>
                        <li>Using the service for any commercial purpose without written consent</li>
                    </ul>
                </Section>

                <Section icon={AlertTriangle} title="4. Account Responsibility" delay={0.25}>
                    <p>You are responsible for maintaining the confidentiality of your account credentials. All activities that occur under your account are your responsibility. Please notify us immediately at <span className="text-brand font-bold">jawaan25fcrit@gmail.com</span> if you suspect unauthorized access.</p>
                    <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>
                </Section>

                <Section icon={Shield} title="5. Intellectual Property" delay={0.3}>
                    <p>All content, features, and functionality of FocusFlow — including but not limited to text, graphics, logos, icons, and software — are the exclusive property of FocusFlow and are protected by applicable intellectual property laws.</p>
                    <p>Your data (focus sessions, tasks, notes) belongs to you. By using FocusFlow, you grant us a limited license to store and process that data solely to provide the service.</p>
                </Section>

                <Section icon={AlertTriangle} title="6. Disclaimer of Warranties" delay={0.35}>
                    <p>FocusFlow is provided <strong className="text-white">"as is"</strong> and <strong className="text-white">"as available"</strong> without any warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses.</p>
                    <p>We are not responsible for any loss of data or productivity resulting from use or inability to use the service.</p>
                </Section>

                <Section icon={RotateCcw} title="7. Changes & Termination" delay={0.4}>
                    <p>We reserve the right to modify, suspend, or discontinue any part of FocusFlow at any time with or without notice. We may also terminate your access for violation of these terms.</p>
                    <p>Upon termination, your right to use the service ceases immediately. We may retain certain information as required by law or for legitimate business purposes.</p>
                </Section>

                <Section icon={Mail} title="8. Contact Us" delay={0.45}>
                    <p>If you have any questions about these Terms of Service, please contact us:</p>
                    <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-white font-bold">FocusFlow Support</p>
                        <p>Email: <a href="mailto:jawaan25fcrit@gmail.com" className="text-brand hover:underline">jawaan25fcrit@gmail.com</a></p>
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
                        <Link to="/privacy" className="text-brand hover:underline font-bold">Privacy Policy</Link>
                        {' '}·{' '}
                        <Link to="/" className="text-brand hover:underline font-bold">Back to App</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
