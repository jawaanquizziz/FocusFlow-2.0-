import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 1800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-color)' }}
    >
      {/* Large ambient glow */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[700px] h-[700px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, var(--brand-color) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </motion.div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-70"
            style={{ background: 'var(--brand-color)', transform: 'scale(1.3)' }} />
          <img src="/logo.png" alt="FocusFlow"
            className="relative w-20 h-20 rounded-3xl shadow-2xl ring-1 ring-white/10" />
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-2"
        >
          <h1 className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Focus<span className="glow" style={{ color: 'var(--brand-color)' }}>Flow</span>
          </h1>
          <div className="tag-badge">Student Productivity Suite</div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-slate-400 text-sm font-medium tracking-wide"
        >
          Focus. Grow. Conquer.
        </motion.p>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-40 h-0.5 rounded-full overflow-hidden mt-4"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ delay: 0.7, duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
            className="h-full w-full rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, var(--brand-color), rgba(var(--brand-rgb), 0.4))' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
