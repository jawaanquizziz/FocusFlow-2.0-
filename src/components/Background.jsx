import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Background = ({ theme = 'midnight', wallpaper = '' }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: 'var(--bg-color)' }}>

      {/* Layer 1: Animated mesh gradient */}
      <div key={theme} className="absolute inset-0 mesh-gradient opacity-100 transition-opacity duration-1000" />

      {/* Layer 2: Radial vignette to deepen edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

      {/* Layer 3: Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      {/* Layer 4: Wallpaper cross-fade */}
      <AnimatePresence mode="wait">
        {wallpaper && (
          <motion.div
            key={wallpaper}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 1.5, ease: 'circOut' }}
            className="absolute inset-0 z-[1]"
          >
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${wallpaper})` }} />
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(1px)' }} />
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, var(--bg-color)CC 0%, transparent 30%, transparent 70%, var(--bg-color)CC 100%)` }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 5: Premium animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <motion.div
          animate={{ x: [0, 80, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(var(--brand-rgb),0.18) 0%, transparent 65%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ x: [0, -60, 30, 0], y: [0, -40, 60, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ repeat: Infinity, duration: 28, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(var(--brand-rgb),0.1) 0%, transparent 65%)', filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{ x: [0, 40, -40, 0], y: [0, 60, 20, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 5 }}
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(var(--brand-rgb),0.08) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
      </div>
    </div>
  );
};

export default Background;
