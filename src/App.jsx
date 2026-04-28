import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Progress from './pages/Progress';
import Planner from './pages/Planner';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Background from './components/Background';
import SplashScreen from './components/SplashScreen';
import Auth from './pages/Auth';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [isSplashActive, setIsSplashActive] = useState(true);
  const { user, loading } = useAuth();
  const { theme, wallpaper } = useTheme();

  if (loading) return (
    <div className="fixed inset-0 bg-[#0D0E12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-xs animate-pulse font-bold uppercase tracking-widest">Initializing FocusFlow...</p>
        </div>
    </div>
  );

  return (
    <Router>
      <div className="relative min-h-screen text-white overflow-hidden">
        <Background theme={theme} wallpaper={wallpaper} />

        {/* Splash Screen */}
        <AnimatePresence mode="wait">
            {isSplashActive && (
                <SplashScreen key="splash" onComplete={() => setIsSplashActive(false)} />
            )}
        </AnimatePresence>

        {/* Main Content - shown after splash */}
        {!isSplashActive && (
            <main className="relative z-10">
                <AnimatePresence mode="wait">
                    {!user ? (
                        <motion.div
                            key="auth"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Auth />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="min-h-screen"
                        >
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/timetable" element={<Timetable />} />
                                <Route path="/planner" element={<Planner />} />
                                <Route path="/progress" element={<Progress />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/admin" element={<Admin />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        )}
      </div>
    </Router>
  );
}

export default App;
