import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Image as ImageIcon, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const THEME_COLORS = [
  // Original 5
  { id: 'midnight',  label: 'Midnight',   color: '#6366F1', desc: 'Cosmic Indigo' },
  { id: 'cyberpunk', label: 'Cyberpunk',  color: '#F0ABFC', desc: 'Neon Fuchsia' },
  { id: 'forest',    label: 'Forest',     color: '#34D399', desc: 'Deep Emerald' },
  { id: 'oceanic',   label: 'Oceanic',    color: '#38BDF8', desc: 'Ocean Blue' },
  { id: 'sunset',    label: 'Sunset',     color: '#FB923C', desc: 'Burning Dusk' },
  // New 8
  { id: 'aurora',    label: 'Aurora',     color: '#2DD4BF', desc: 'Northern Lights', isNew: true },
  { id: 'rosegold',  label: 'Rose Gold',  color: '#F9A8D4', desc: 'Luxury Pink', isNew: true },
  { id: 'crimson',   label: 'Crimson',    color: '#F87171', desc: 'Blood Red', isNew: true },
  { id: 'galaxy',    label: 'Galaxy',     color: '#A78BFA', desc: 'Deep Violet', isNew: true },
  { id: 'amber',     label: 'Amber',      color: '#FCD34D', desc: 'Golden Hour', isNew: true },
  { id: 'arctic',    label: 'Arctic',     color: '#BAE6FD', desc: 'Ice Crystal', isNew: true },
  { id: 'neonlime',  label: 'Neon Lime',  color: '#A3E635', desc: 'Electric Green', isNew: true },
  { id: 'bloodmoon', label: 'Blood Moon', color: '#FF6B35', desc: 'Volcanic Ember', isNew: true },
];

const WALLPAPERS = [
  { id: 'none',      label: 'Clean',       image: '', desc: 'Pure dark mode' },
  { id: 'ethereal',  label: 'Ethereal Flow', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop', desc: 'Abstract liquid gradient' },
  { id: 'cyber',     label: 'Neon City',   image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920&auto=format&fit=crop', desc: 'Cyberpunk streets' },
  { id: 'zen',       label: 'Zen Garden',  image: 'https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?q=80&w=1920&auto=format&fit=crop', desc: 'Minimalist calm' },
  { id: 'space',     label: 'Stellar',     image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop', desc: 'Deep cosmos' },
  { id: 'mountain',  label: 'Peaks',       image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&auto=format&fit=crop', desc: 'Alpine majesty' },
  { id: 'forest2',   label: 'Forest Mist', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop', desc: 'Misty woodlands' },
  { id: 'aurora2',   label: 'Northern Lights', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop', desc: 'Aurora borealis' },
  { id: 'rain',      label: 'Rainy City',  image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1920&auto=format&fit=crop', desc: 'Wet neon nights' },
  { id: 'desert',    label: 'Desert Dusk', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1920&auto=format&fit=crop', desc: 'Golden sands' },
];

const ThemeGallery = ({ isOpen, onClose }) => {
  const { theme, setTheme, wallpaper, setWallpaper } = useTheme();
  const [activeTab, setActiveTab] = useState('themes');
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        try {
          setWallpaper(dataUrl);
        } catch (err) {
          alert('Failed to save image. It might be too large.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

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
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass relative w-full max-w-3xl bg-[#0D0E12] rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 pb-0 shrink-0">
              <button
                onClick={onClose}
                className="absolute top-7 right-7 text-text-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full z-10"
              >
                <X size={22} />
              </button>

              <div className="flex items-center gap-4 mb-7">
                <div className="p-4 bg-brand/10 rounded-2xl text-brand">
                  <Palette size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold glow font-brand tracking-tighter">Theme Gallery</h2>
                  <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Customize your sanctuary</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-0">
                {[
                  { id: 'themes', label: 'Color Themes', icon: <Palette size={14} /> },
                  { id: 'wallpapers', label: 'Wallpapers', icon: <ImageIcon size={14} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? 'bg-brand text-white shadow-lg shadow-brand/30'
                        : 'text-text-muted bg-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5 mt-6 mx-8 shrink-0" />

            {/* Scrollable content */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-8 pt-6">

              {/* ── THEMES TAB ── */}
              {activeTab === 'themes' && (
                <div>
                  {/* Currently selected preview */}
                  <div
                    className="mb-6 p-4 rounded-2xl border border-white/10 flex items-center gap-4"
                    style={{ background: `rgba(${THEME_COLORS.find(t => t.id === theme)?.color || '#6366F1'}, 0.05)` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl shadow-lg shrink-0"
                      style={{ background: THEME_COLORS.find(t => t.id === theme)?.color || '#6366F1' }}
                    />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white">{THEME_COLORS.find(t => t.id === theme)?.label}</p>
                      <p className="text-[10px] text-text-muted font-bold">{THEME_COLORS.find(t => t.id === theme)?.desc}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted bg-white/5 px-3 py-1.5 rounded-full">Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {THEME_COLORS.map((t) => (
                      <motion.button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className={`group relative flex flex-col items-center gap-3 transition-all p-3 rounded-2xl border-2 ${
                          theme === t.id
                            ? 'border-white/30 bg-white/5'
                            : 'border-transparent hover:bg-white/5'
                        }`}
                      >
                        {/* Color swatch with gradient */}
                        <div
                          className="w-full aspect-video rounded-xl shadow-lg relative overflow-hidden"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, ${t.color}CC, ${t.color}44)`,
                            boxShadow: theme === t.id ? `0 0 20px ${t.color}60` : 'none'
                          }}
                        >
                          {/* Animated shimmer on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {theme === t.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/40 rounded-full p-1">
                                <Check size={14} className="text-white" />
                              </div>
                            </div>
                          )}
                          {t.isNew && (
                            <span className="absolute top-1.5 right-1.5 text-[7px] font-black uppercase tracking-wider bg-brand text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Sparkles size={7} /> New
                            </span>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase tracking-tight text-white">{t.label}</p>
                          <p className="text-[9px] text-text-muted font-bold">{t.desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── WALLPAPERS TAB ── */}
              {activeTab === 'wallpapers' && (
                <div className="space-y-6">
                  {/* Custom Wallpaper Input */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center hover:border-white/20 transition-colors">
                    <div className="flex gap-3 items-center">
                      <ImageIcon size={20} className="text-text-muted shrink-0" />
                      <div>
                        <p className="text-sm text-white font-bold">Custom Wallpaper</p>
                        <p className="text-[10px] text-text-muted">Upload an image from your device</p>
                      </div>
                    </div>
                    
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <div className="flex items-center gap-3">
                      {wallpaper && wallpaper.startsWith('data:image') && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 px-3 py-1.5 rounded-full shrink-0">Active</span>
                      )}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {WALLPAPERS.map((w) => (
                    <motion.button
                      key={w.id}
                      onClick={() => setWallpaper(w.image)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all ${
                        wallpaper === w.image
                          ? 'border-brand shadow-lg shadow-brand/30'
                          : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      {w.image ? (
                        <img src={w.image} alt={w.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center gap-2">
                          <Palette size={20} className="text-text-muted opacity-50" />
                          <span className="text-[10px] uppercase font-bold text-text-muted">Clean</span>
                        </div>
                      )}

                      {wallpaper === w.image && (
                        <div className="absolute inset-0 bg-brand/20 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-1.5">
                            <Check size={16} className="text-white" />
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-[9px] font-black uppercase tracking-tight text-white">{w.label}</p>
                        <p className="text-[8px] text-white/60 font-bold">{w.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 shrink-0">
              <div className="h-px bg-white/5 mb-5" />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">
                  {THEME_COLORS.length} Themes · {WALLPAPERS.length} Wallpapers
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand/20 active:scale-95 text-sm"
                >
                  Apply Experience
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ThemeGallery;
