import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full mesh-gradient opacity-40" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/5 blur-[120px] rounded-full" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass w-full max-w-md p-10 rounded-[2.5rem] relative z-10 backdrop-blur-2xl border border-white/10"
            >
                <div className="flex flex-col items-center mb-10">
                    <img src="/logo.png" alt="FocusFlow" className="w-16 h-16 rounded-2xl shadow-xl mb-4" />
                    <h2 className="text-3xl font-bold font-brand tracking-tighter glow">
                        {isLogin ? 'Welcome Back' : 'Start Your Journey'}
                    </h2>
                    <p className="text-text-muted text-sm mt-2 font-medium">
                        {isLogin ? 'Use test@example.com / password123 to preview' : 'Create an account to track your focus'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                            >
                                <label className="text-xs uppercase tracking-widest font-bold text-text-muted ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={18} />
                                    <input 
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-medium"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-muted ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={18} />
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-muted ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={18} />
                            <input 
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl font-bold"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-brand/20 disabled:opacity-50 disabled:active:scale-100 mt-4"
                    >
                        {isSubmitting ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
                        {!isSubmitting && <ArrowRight size={20} />}
                    </button>

                </form>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-text-muted text-sm font-medium">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-brand font-bold ml-2 hover:underline underline-offset-4"
                        >
                            {isLogin ? 'Register' : 'Log In'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
