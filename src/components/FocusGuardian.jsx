import React from 'react';
import { motion } from 'framer-motion';
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
          <div className="relative w-24 h-24 flex items-center justify-center translate-z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)] overflow-visible">
              <defs>
                {/* 3D Volumetric body shading */}
                <radialGradient id="body3D" cx="35%" cy="35%" r="65%" fx="25%" fy="25%">
                  <stop offset="0%" stopColor={isBreak ? '#a7f3d0' : '#e0e7ff'} />
                  <stop offset="35%" stopColor={isBreak ? '#34d399' : '#818cf8'} />
                  <stop offset="75%" stopColor={isBreak ? '#059669' : '#4f46e5'} />
                  <stop offset="100%" stopColor={isBreak ? '#064e3b' : '#312e81'} />
                </radialGradient>

                {/* 3D Chest/Underbelly highlight */}
                <linearGradient id="chestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>

                {/* Wing Shading Gradients */}
                <linearGradient id="frontWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isBreak ? '#34d399' : '#818cf8'} />
                  <stop offset="50%" stopColor={isBreak ? '#059669' : '#4f46e5'} />
                  <stop offset="100%" stopColor={isBreak ? '#064e3b' : '#1e1b4b'} />
                </linearGradient>

                <linearGradient id="backWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isBreak ? '#065f46' : '#312e81'} />
                  <stop offset="100%" stopColor={isBreak ? '#022c22' : '#0f172a'} />
                </linearGradient>

                {/* Beak gradients */}
                <linearGradient id="beakTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="beakBot" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>

                <filter id="shadow3D">
                  <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* 1. Tail Feathers (Stacked Layered Depth) */}
              <g filter="url(#shadow3D)">
                {/* Upper Tail Feather */}
                <motion.path 
                  d="M25 50 L-6 24 L6 42 Z" 
                  fill={isBreak ? '#065f46' : '#3730a3'}
                  animate={{ rotate: isRunning ? [-15, 10, -15] : 0 }} 
                  style={{ originX: '25px', originY: '50px' }}
                />
                {/* Center Tail Feather */}
                <motion.path 
                  d="M27 52 L-12 50 L6 50 Z" 
                  fill={isBreak ? '#047857' : '#4f46e5'}
                  animate={{ rotate: isRunning ? [-8, 8, -8] : 0 }} 
                  style={{ originX: '27px', originY: '52px' }}
                />
                {/* Lower Tail Feather */}
                <motion.path 
                  d="M25 54 L-6 76 L6 58 Z" 
                  fill={isBreak ? '#064e3b' : '#312e81'}
                  animate={{ rotate: isRunning ? [-18, 12, -18] : 0 }} 
                  style={{ originX: '25px', originY: '54px' }}
                />
              </g>

              {/* 2. Back Wing (Darker behind body, Flapping) */}
              <motion.g
                animate={{ 
                  rotate: isRunning ? [-55, 35, -55] : [-4, 6, -4],
                  scaleY: isRunning ? [1, 0.4, 1] : 1
                }}
                style={{ originX: '45px', originY: '42px' }}
                transition={{ repeat: Infinity, duration: isRunning ? 0.35 : 3, ease: "easeInOut" }}
              >
                {/* Back Wing Layer 1 */}
                <path d="M45 42 Q15 -18 25 45 Z" fill="url(#backWingGrad)" />
                {/* Back Wing Layer 2 (Smaller feather edge) */}
                <path d="M45 42 Q25 -2 32 40 Z" fill={isBreak ? '#022c22' : '#1e1b4b'} opacity="0.6" />
              </motion.g>

              {/* 3. Main Sphere Body (3D Volumetric Gradient) */}
              <circle cx="50" cy="55" r="39" fill="url(#body3D)" />

              {/* 4. 3D Chest highlight / Volume mask */}
              <path 
                d="M50 94 C 28 94, 16 82, 16 64 C 16 54, 30 46, 50 46 C 70 46, 84 54, 84 64 C 84 82, 72 94, 50 94 Z" 
                fill="url(#chestGrad)" 
                opacity="0.8"
              />

              {/* 5. 3D Spherical Rim Glow */}
              <path 
                d="M14 55 A 36 36 0 0 1 86 55 A 38 38 0 0 0 14 55 Z" 
                fill="white" 
                opacity="0.12" 
              />

              {/* 6. Scarf (Folded dynamically around volumetric chest) */}
              <path d="M22 66 Q50 90 78 66" fill="none" stroke="#ef4444" strokeWidth="8.5" strokeLinecap="round" filter="url(#shadow3D)" />
              {/* Scarf fold highlights */}
              <path d="M26 68 Q50 91 74 68" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              {/* Scarf tail layers */}
              <path d="M72 68 L82 89" stroke="#dc2626" strokeWidth="5.5" strokeLinecap="round" filter="url(#shadow3D)" />
              <path d="M72 68 L66 94" stroke="#b91c1c" strokeWidth="5.5" strokeLinecap="round" filter="url(#shadow3D)" />

              {/* 7. Expressive 3D Eyes (Volumetric sphere glass style) */}
              <circle cx="70" cy="45" r="11" fill="white" filter="url(#shadow3D)" />
              {/* Eye pupil with sparkle */}
              <motion.g
                animate={{ 
                  scaleY: [1, 1, 0.05, 1, 1],
                  x: [0, 2.5, 0, -2.5, 0] 
                }}
                transition={{ repeat: Infinity, duration: 6, times: [0, 0.8, 0.83, 0.86, 1] }}
                style={{ originX: '73px', originY: '45px' }}
              >
                <circle cx="73" cy="45" r="6.5" fill="#1e293b" />
                <circle cx="76.5" cy="41.5" r="2.5" fill="white" />
                <circle cx="71" cy="48" r="1" fill="white" opacity="0.6" />
              </motion.g>

              {/* 8. 3D Beak (Multi-faceted shaded volumetric cone) */}
              <g filter="url(#shadow3D)">
                {/* Upper Beak Facet */}
                <path d="M85 49 L99 55 L85 55 Z" fill="url(#beakTop)" />
                {/* Lower Beak Facet */}
                <path d="M85 55 L99 55 L85 62 Z" fill="url(#beakBot)" />
                {/* Beak Highlight Line */}
                <line x1="85" y1="55" x2="98" y2="55" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
              </g>

              {/* 9. Front Wing (Rich layered feathers, flapping) */}
              <motion.g
                animate={{ 
                  rotate: isRunning ? [-65, 45, -65] : [-8, 12, -8],
                  scaleY: isRunning ? [1, 0.35, 1] : 1
                }}
                style={{ originX: '48px', originY: '56px' }}
                transition={{ repeat: Infinity, duration: isRunning ? 0.35 : 3, ease: "easeInOut" }}
                filter="url(#shadow3D)"
              >
                {/* Front Wing Main Covert */}
                <path d="M48 56 Q16 12 36 82 Z" fill="url(#frontWingGrad)" />
                
                {/* Highlights on Wing to accentuate volume */}
                <path d="M45 56 Q23 24 35 72" fill="none" stroke={isBreak ? '#a7f3d0' : '#c7d2fe'} strokeWidth="3" strokeLinecap="round" opacity="0.35" />
                
                {/* Secondary Wing Feather Layer */}
                <path d="M48 56 Q24 28 38 78 Z" fill={isBreak ? '#10b981' : '#6366f1'} opacity="0.45" />
              </motion.g>

              {/* 10. Volumetric Crown Tuft */}
              <motion.g
                animate={{ y: [0, -3.5, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                filter="url(#shadow3D)"
              >
                {/* Left Tuft feather */}
                <path d="M44 19 C 44 8, 48 3, 50 19 Z" fill="#fbbf24" />
                {/* Center Tuft feather */}
                <path d="M48 18 C 49 6, 53 2, 53 18 Z" fill="#f59e0b" />
                {/* Right Tuft feather */}
                <path d="M52 19 C 54 9, 58 4, 56 19 Z" fill="#d97706" />
              </motion.g>

              {/* 11. Specular Lens Flare Spot (For realistic round look) */}
              <circle cx="34" cy="36" r="6" fill="white" opacity="0.18" filter="blur(1px)" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FocusGuardian;
