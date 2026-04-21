import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Background = ({ theme = 'midnight', wallpaper = '' }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0D0E12]">
      {/* Layer 1: Base Mesh Gradient (Themes) */}
      <div key={theme} className="absolute inset-0 mesh-gradient opacity-40 transition-opacity duration-1000" />
      
      {/* Layer 2: Picture Wallpapers with Cross-Fade */}
      <AnimatePresence mode="wait">
        {wallpaper && (
          <motion.div
            key={wallpaper}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="absolute inset-0 z-1"
          >
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${wallpaper})` }}
            />
            {/* Ambient Overlays to ensure text readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0D0E12]/80 via-transparent to-[#0D0E12]/80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Noise Overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-3">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-brand/10 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full"
        />
      </div>
    </div>
  );
};

export default Background;
