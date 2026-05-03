import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Progress from './pages/Progress';
import Planner from './pages/Planner';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Reports from './pages/Reports';
import FeedbackWidget from './components/FeedbackWidget';
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
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>

                            {/* Floating Global Feedback Widget */}
                            <FeedbackWidget />
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
