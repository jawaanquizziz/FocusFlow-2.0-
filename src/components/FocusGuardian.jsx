import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../constants/timer';

const FocusGuardian = ({ isRunning, mode }) => {
  const isBreak = mode === MODES.SHORT_BREAK || mode === MODES.LONG_BREAK;
  
  // Majestic 3D roaming path - Always active, wider when running
  const orbitPath = {
    x: isRunning 
      ? [300, 500, 200, -200, -500, -300, 300] 
      : [100, 150, 0, -150, -100, 100],
    y: isRunning 
      ? [-200, -350, -500, -450, -200, -100, -200] 
      : [-150, -200, -250, -200, -150, -150],
    // 3D Banking and Rotation
    rotate: isRunning ? [15, 25, 0, -25, -15, 10, 15] : [5, 10, 0, -10, -5, 5],
    rotateY: isRunning ? [0, 15, 0, -15, 0] : 0,
    scaleX: isRunning ? [1, 1, -1, -1, 1, 1, 1] : [1, 1, -1, -1, 1, 1],
  };

  return (
    <div className="absolute inset-0 z-[1000] pointer-events-none overflow-visible">
      <motion.div
        animate={orbitPath}
        transition={{
          repeat: Infinity,
          duration: 15, // Slower, more majestic speed
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            y: isRunning ? [0, -15, 0] : [0, -6, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
          className="relative group perspective-1000"
        >
          {/* Enhanced 3D Magical Glow */}
          <motion.div
            animate={{
              scale: isRunning ? [1, 1.8, 1] : [1, 1.2, 1],
              opacity: isRunning ? [0.15, 0.3, 0.15] : 0.05,
            }}
            transition={{ repeat: Infinity, duration: 5 }}
            className={`absolute inset-[-40px] blur-3xl rounded-full ${isBreak ? 'bg-emerald-400/50' : 'bg-brand/50'}`}
          />

          {/* 3D Bird Design */}
          <div className="relative w-20 h-20 flex items-center justify-center translate-z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] overflow-visible">
              <defs>
                <radialGradient id="body3D" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                  <stop offset="0%" stopColor={isBreak ? '#A7F3D0' : '#C7D2FE'} />
                  <stop offset="60%" stopColor={isBreak ? '#34D399' : '#818CF8'} />
                  <stop offset="100%" stopColor={isBreak ? '#065f46' : '#312e81'} />
                </radialGradient>
                <filter id="shadow3D">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.5"/>
                </filter>
              </defs>

              {/* Tail with 3D Depth */}
              <motion.g animate={{ rotate: isRunning ? [-12, 12, -12] : 0 }} style={{ originX: '20px', originY: '50px' }}>
                <path d="M25 50 L0 30 L8 50 L0 70 Z" fill={isBreak ? '#064e3b' : '#1e1b4b'} filter="url(#shadow3D)" />
              </motion.g>
              
              {/* Back Wing (Darker for depth) */}
              <motion.path
                d="M45 40 Q20 -10 30 50 Z"
                fill={isBreak ? '#064e3b' : '#1e1b4b'}
                animate={{ 
                  rotate: isRunning ? [-50, 40, -50] : [-5, 5, -5],
                  scaleY: isRunning ? [1, 0.4, 1] : 1
                }}
                style={{ originX: '45px', originY: '40px' }}
                transition={{ repeat: Infinity, duration: isRunning ? 0.4 : 3 }}
              />

              {/* Main Body (Spherical 3D) */}
              <circle cx="50" cy="55" r="40" fill="url(#body3D)" />
              
              {/* 3D Highlight Shine */}
              <ellipse cx="35" cy="40" rx="12" ry="8" fill="white" fillOpacity="0.2" transform="rotate(-30, 35, 40)" />

              {/* Scarf (3D Wrapped) */}
              <path d="M30 70 Q50 90 70 70" fill="none" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
              <path d="M68 72 L78 90 M68 72 L62 95" stroke="#B91C1C" strokeWidth="5" strokeLinecap="round" />

              {/* Eye (Large & Expressive) */}
              <circle cx="70" cy="45" r="11" fill="white" />
              <motion.g
                animate={{ 
                    scaleY: [1, 1, 0, 1, 1],
                    x: [0, 3, 0, -3, 0] 
                }}
                transition={{ repeat: Infinity, duration: 6, times: [0, 0.8, 0.85, 0.9, 1] }}
                style={{ originX: '74px', originY: '45px' }}
              >
                <circle cx="74" cy="45" r="6" fill="black" />
                <circle cx="77" cy="42" r="2.5" fill="white" />
              </motion.g>

              {/* Front Wing (Brighter with Highlight) */}
              <motion.path
                d="M50 55 Q20 15 35 80 Z"
                fill={isBreak ? '#10B981' : '#6366F1'}
                animate={{ 
                  rotate: isRunning ? [-60, 50, -60] : [-10, 10, -10],
                  scaleY: isRunning ? [1, 0.3, 1] : 1
                }}
                style={{ originX: '50px', originY: '55px' }}
                transition={{ repeat: Infinity, duration: isRunning ? 0.4 : 3 }}
                filter="url(#shadow3D)"
              />

              {/* Beak (Shiny 3D Tip) */}
              <path d="M85 50 L98 56 L85 62 Z" fill="#D97706" />
              <path d="M85 50 L96 55 L85 54 Z" fill="#FBBF24" />
              
              {/* Crown / Golden Tuft */}
              <motion.path 
                d="M45 18 Q50 -5 55 18" 
                stroke="#FBBF24" 
                strokeWidth="5" 
                fill="none" 
                strokeLinecap="round" 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FocusGuardian;
