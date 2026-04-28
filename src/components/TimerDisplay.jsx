import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Digit = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-24 sm:w-24 sm:h-36 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center overflow-hidden border transition-all duration-500 group"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset',
        }}>
        {/* Brand glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(var(--brand-rgb),0.12), transparent 70%)' }} />

        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 18, opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -18, opacity: 0, filter: 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="text-5xl sm:text-8xl font-bold text-white relative z-10"
            style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace', textShadow: '0 0 30px rgba(var(--brand-rgb),0.4)' }}
          >
            {value}
          </motion.span>
        </AnimatePresence>

        {/* Center split line */}
        <div className="absolute w-full h-px top-1/2 left-0 z-10"
          style={{ background: 'rgba(0,0,0,0.3)', boxShadow: '0 1px 0 rgba(255,255,255,0.04)' }} />
        {/* Top shine */}
        <div className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)' }} />
      </div>
      {label && <span className="text-[9px] uppercase tracking-[0.3em] font-bold mt-3 opacity-40" style={{ color: 'var(--color-text-muted)' }}>{label}</span>}
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
