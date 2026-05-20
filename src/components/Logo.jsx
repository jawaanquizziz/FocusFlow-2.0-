import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 80, animated = true }) => {
  return (
    <div className="relative flex items-center justify-center animate-fade-in" style={{ width: size, height: size }}>
      {/* Background Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-60 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--brand-color, #5865F2) 0%, #10b981 70%, transparent 100%)',
          transform: 'scale(1.2)'
        }}
      />
      
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 filter drop-shadow-[0_8px_24px_rgba(88,101,242,0.35)]"
      >
        <defs>
          {/* Brand gradient (Indigo-Purple-Tomato Red/Pink) */}
          <linearGradient id="pomodoroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-color, #5865F2)" />
            <stop offset="60%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          
          {/* Sprout Green Gradient */}
          <linearGradient id="sproutGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          
          {/* Glassmorphic Overlay Gradient */}
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Circular Chronometer Tick Marks */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#sproutGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity="0.5"
          animate={animated ? { rotate: -360 } : {}}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 40
          }}
          style={{ originX: "50px", originY: "50px" }}
        />

        {/* Outer Timer Dial segments */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="var(--brand-color, #5865F2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="40 180 60 80"
          opacity="0.8"
          animate={animated ? { rotate: 360 } : {}}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25
          }}
          style={{ originX: "50px", originY: "50px" }}
        />

        {/* Dynamic growing leaves / stem (top of Tomato) */}
        <g className="origin-bottom" style={{ transformOrigin: "50px 32px" }}>
          {/* Left Stem Leaf */}
          <motion.path
            d="M50 32 C 45 22, 32 20, 34 8 C 42 10, 48 20, 50 32 Z"
            fill="url(#sproutGrad)"
            animate={animated ? {
              rotate: [-2, 3, -2],
              scale: [0.98, 1.02, 0.98]
            } : {}}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: "easeInOut"
            }}
          />
          {/* Right Stem Leaf */}
          <motion.path
            d="M50 32 C 55 22, 68 20, 66 8 C 58 10, 52 20, 50 32 Z"
            fill="url(#sproutGrad)"
            animate={animated ? {
              rotate: [2, -3, 2],
              scale: [1.02, 0.98, 1.02]
            } : {}}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          {/* Small center bud */}
          <circle cx="50" cy="30" r="3.5" fill="#34d399" />
        </g>

        {/* The Pomodoro Body (Sleek Tomato/Zen circle shape) */}
        <motion.path
          d="M50 32 C 26 32, 14 44, 14 62 C 14 78, 28 88, 50 88 C 72 88, 86 78, 86 62 C 86 44, 74 32, 50 32 Z"
          fill="url(#pomodoroGrad)"
          className="drop-shadow-lg"
          animate={animated ? {
            scale: [1, 1.015, 1],
          } : {}}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
          style={{ originX: "50px", originY: "60px" }}
        />

        {/* Glass highlight overlay for 3D premium look */}
        <path
          d="M50 34 C 28 34, 16 45, 16 62 C 16 68, 22 55, 50 55 C 78 55, 84 68, 84 62 C 84 45, 72 34, 50 34 Z"
          fill="url(#glassGrad)"
        />

        {/* Flow Infinity Symbol (Engraved inside the tomato body) */}
        <motion.path
          d="M36 60 C 36 53, 44 49, 50 60 C 56 71, 64 67, 64 60 C 64 53, 56 49, 50 60 C 44 71, 36 67, 36 60 Z"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
          animate={animated ? {
            strokeDasharray: ["0 200", "100 100", "200 0"],
            strokeDashoffset: [0, -100, -200]
          } : {}}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          }}
        />

        {/* Center glowing energy dot */}
        <motion.circle
          cx="50"
          cy="60"
          r="2.5"
          fill="#34d399"
          animate={animated ? {
            scale: [0.7, 1.4, 0.7],
            opacity: [0.5, 1, 0.5]
          } : {}}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
};

export default Logo;
