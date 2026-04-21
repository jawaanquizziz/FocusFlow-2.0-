import React, { useState, useRef } from 'react';
import { CloudRain, Flame, Trees, Coffee, Volume2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOUNDS = [
  { id: 'rain', name: 'Rain', icon: CloudRain, file: '/audio/rain.wav', color: 'text-blue-400' },
  { id: 'fire', name: 'Fire', icon: Flame, file: '/audio/fire.wav', color: 'text-orange-400' },
  { id: 'forest', name: 'Forest', icon: Trees, file: '/audio/forest.wav', color: 'text-green-400' },
  { id: 'cafe', name: 'Cafe', icon: Coffee, file: '/audio/cafe.mp3', color: 'text-amber-400' },
];

const SoundButton = ({ sound, isActive, onToggle }) => {
  const Icon = sound.icon;
  
  return (
    <button
      onClick={() => onToggle(sound)}
      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-[2rem] transition-all relative overflow-hidden group ${
        isActive 
          ? 'bg-brand text-white shadow-[0_12px_30px_rgba(88,101,242,0.4)] scale-105' 
          : 'bg-white/[0.03] text-text-muted hover:text-white hover:bg-white/[0.06] border border-white/5'
      }`}
    >
      {isActive && (
        <motion.div 
            layoutId="activeGlow"
            className="absolute inset-0 bg-white/20 blur-xl"
        />
      )}
      
      <div className={`p-4 rounded-2xl transition-all relative z-10 ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:scale-110'}`}>
        <Icon size={24} className={isActive ? 'text-white' : sound.color} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">{sound.name}</span>
    </button>
  );
};

const AmbientSounds = () => {
  const [activeSoundId, setActiveSoundId] = useState(null);
  const audioRef = useRef(null);

  const toggleSound = (sound) => {
    if (activeSoundId === sound.id) {
      audioRef.current.pause();
      setActiveSoundId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(sound.file);
      audioRef.current.loop = true;
      audioRef.current.play();
      setActiveSoundId(sound.id);
    }
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] h-full flex flex-col relative overflow-hidden border border-white/5 group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
        <Music size={100} />
      </div>

      <header className="mb-6 relative z-10">
        <h2 className="text-xl font-bold text-white">Ambience</h2>
        <p className="text-text-muted text-[10px] uppercase tracking-widest font-semibold mt-1">Focus Soundscape</p>
      </header>

      <div className="grid grid-cols-4 gap-3 w-full relative z-10">
        {SOUNDS.map((sound) => (
          <SoundButton
            key={sound.id}
            sound={sound}
            isActive={activeSoundId === sound.id}
            onToggle={toggleSound}
          />
        ))}
      </div>
      
      <div className="mt-auto pt-6 flex items-center gap-3 relative z-10 min-h-[40px]">
        <AnimatePresence mode="wait">
            {activeSoundId ? (
                <motion.div 
                    key="playing"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 text-brand text-xs font-bold bg-brand/10 px-4 py-2 rounded-xl border border-brand/20 w-fit"
                >
                    <div className="flex gap-1 items-end h-3">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-brand rounded-full" />
                        <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-brand rounded-full" />
                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1 bg-brand rounded-full" />
                    </div>
                    <span className="uppercase tracking-widest">Playing {SOUNDS.find(s => s.id === activeSoundId)?.name}</span>
                </motion.div>
            ) : (
                <motion.span 
                    key="silent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="text-[10px] text-text-muted uppercase tracking-[0.2em]"
                >
                    System Silent
                </motion.span>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AmbientSounds;
