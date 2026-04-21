import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Image as ImageIcon, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const THEME_COLORS = [
  { id: 'midnight', label: 'Midnight', color: 'bg-[#5865F2]' },
  { id: 'cyberpunk', label: 'Cyberpunk', color: 'bg-[#FF00E5]' },
  { id: 'forest', label: 'Forest', color: 'bg-[#10B981]' },
  { id: 'oceanic', label: 'Oceanic', color: 'bg-[#0EA5E9]' },
  { id: 'sunset', label: 'Sunset', color: 'bg-[#F97316]' },
];

const WALLPAPERS = [
  { id: 'none', label: 'None', image: '' },
  { id: 'lofi', label: 'Lofi Cafe', image: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f67?q=80&w=1920&auto=format&fit=crop' },
  { id: 'cyber', label: 'Neon City', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920&auto=format&fit=crop' },
  { id: 'zen', label: 'Zen Garden', image: 'https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?q=80&w=1920&auto=format&fit=crop' },
  { id: 'space', label: 'Stellar', image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop' },
];

const ThemeGallery = ({ isOpen, onClose }) => {
    const { theme, setTheme, wallpaper, setWallpaper } = useTheme();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="glass relative w-full max-w-2xl bg-[#0D0E12] p-10 rounded-[3rem] shadow-2xl border border-white/10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-brand/10 rounded-2xl text-brand">
                                <Palette size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold glow font-brand tracking-tighter">Theme Gallery</h2>
                                <p className="text-text-muted text-sm uppercase tracking-widest font-bold">Customize your sanctuary</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Color Themes */}
                            <section>
                                <label className="block text-xs font-bold text-text-muted mb-4 uppercase tracking-[0.2em] ml-1">Atmosphere Pulse</label>
                                <div className="grid grid-cols-5 gap-4">
                                    {THEME_COLORS.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`group flex flex-col items-center gap-3 transition-all p-2 rounded-2xl border-2 ${
                                                theme === t.id ? 'border-brand bg-brand/5' : 'border-transparent hover:bg-white/5'
                                            }`}
                                        >
                                            <div className={`w-full aspect-square rounded-xl ${t.color} shadow-lg group-hover:scale-105 transition-transform`} />
                                            <span className="text-[10px] font-bold uppercase tracking-tight opacity-60">
                                                {t.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Wallpapers */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <ImageIcon size={14} />
                                        Premium Wallpapers
                                    </label>
                                </div>
                                <div className="grid grid-cols-5 gap-4">
                                    {WALLPAPERS.map((w) => (
                                        <button
                                            key={w.id}
                                            onClick={() => setWallpaper(w.image)}
                                            className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                                                wallpaper === w.image ? 'border-brand scale-105' : 'border-transparent hover:border-white/20'
                                            }`}
                                        >
                                            {w.image ? (
                                                <img src={w.image} alt={w.label} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] uppercase font-bold text-text-muted">Clean</div>
                                            )}
                                            
                                            {wallpaper === w.image && (
                                                <div className="absolute inset-0 bg-brand/20 flex items-center justify-center">
                                                    <Check size={20} className="text-white" />
                                                </div>
                                            )}

                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1">
                                                <p className="text-[8px] font-bold uppercase text-center tracking-tighter">{w.label}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="mt-12 text-center">
                            <button
                                onClick={onClose}
                                className="px-10 py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand/20 active:scale-95"
                            >
                                Apply Experience
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ThemeGallery;
