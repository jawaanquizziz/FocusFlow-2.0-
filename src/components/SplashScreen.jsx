import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
  "Focus on being productive, not being busy.",
  "The only way to do great work is to love what you do.",
  "Deep work is the superpower of the 21st century.",
  "Your mind is for having ideas, not holding them.",
  "Flow is the state of being completely involved in an activity for its own sake.",
  "Efficiency is doing things right; effectiveness is doing the right things."
];

const SplashScreen = ({ onComplete }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 2500); // Reduced to 2.5 seconds for a faster feel

    return () => {
      clearInterval(quoteInterval);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[100] bg-[#0D0E12] flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      {/* Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-[500px] h-[500px] bg-brand/20 blur-[120px] rounded-full"
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <img src="/logo.png" alt="FocusFlow Logo" className="w-24 h-24 shadow-[0_0_50px_rgba(88,101,242,0.3)] rounded-3xl" />
        
        <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-bold font-brand tracking-tighter glow">
                Focus<span className="text-brand">Flow</span>
            </h1>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-brand to-transparent" />
        </div>

        <div className="h-20 flex items-center justify-center text-center max-w-md">
            <AnimatePresence mode="wait">
                <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="text-lg text-text-muted italic font-medium leading-relaxed"
                >
                    "{quotes[index]}"
                </motion.p>
            </AnimatePresence>
        </div>
      </motion.div>

      {/* Loading Progress */}
      <div className="absolute bottom-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="w-full h-full bg-brand"
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
