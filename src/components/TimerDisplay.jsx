import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Digit = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-24 sm:w-24 sm:h-36 bg-white/[0.03] rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group transition-all duration-500 hover:border-brand/30">
        {/* Glow behind digit */}
        <div className="absolute inset-0 bg-brand/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0, rotateX: -90, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)' }}
            exit={{ y: -20, opacity: 0, rotateX: 90, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="text-5xl sm:text-8xl font-bold text-white glow font-mono relative z-10"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        
        {/* Flip Line Overlay */}
        <div className="absolute w-full h-[1px] bg-white/5 top-1/2 left-0 z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
        
        {/* Shine highlight */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
      {label && <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted mt-4 opacity-60">{label}</span>}
    </div>
  );
};

const TimerDisplay = ({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const mH = Math.floor(minutes / 100);
  const mT = Math.floor((minutes % 100) / 10);
  const mO = minutes % 10;
  const sT = Math.floor(seconds / 10);
  const sO = seconds % 10;

  return (
    <div className="flex items-center gap-3 sm:gap-6 select-none py-4">
      <div className="flex gap-2 sm:gap-4">
        {mH > 0 && <Digit value={mH} />}
        <Digit value={mT} />
        <Digit value={mO} />
      </div>
      
      <motion.div 
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-4xl sm:text-7xl font-bold text-white/50 -translate-y-2 font-mono"
      >
        :
      </motion.div>
      
      <div className="flex gap-2 sm:gap-4">
        <Digit value={sT} />
        <Digit value={sO} />
      </div>
    </div>
  );
};

export default TimerDisplay;
