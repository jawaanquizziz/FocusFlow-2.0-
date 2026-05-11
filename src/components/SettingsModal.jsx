import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, ChevronRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';



const SettingsModal = ({ isOpen, onClose, settings, onSave, onOpenThemeGallery }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const { theme } = useTheme();

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass relative w-full max-w-md bg-[#2C2F33] p-8 rounded-2xl shadow-2xl border border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 glow">Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2 uppercase tracking-wide">
                  Pomodoro (min)
                </label>
                <input
                  type="number"
                  value={localSettings.pomodoro / 60}
                  onChange={(e) => setLocalSettings({ ...localSettings, pomodoro: Number(e.target.value) * 60 })}
                  className="w-full bg-[#3a3f42] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2 uppercase tracking-wide">
                  Short Break (min)
                </label>
                <input
                  type="number"
                  value={localSettings.shortBreak / 60}
                  onChange={(e) => setLocalSettings({ ...localSettings, shortBreak: Number(e.target.value) * 60 })}
                  className="w-full bg-[#3a3f42] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2 uppercase tracking-wide">
                  Long Break (min)
                </label>
                <input
                  type="number"
                  value={localSettings.longBreak / 60}
                  onChange={(e) => setLocalSettings({ ...localSettings, longBreak: Number(e.target.value) * 60 })}
                  className="w-full bg-[#3a3f42] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Palette size={16} />
                  Visual Theme
                </label>
                <motion.button
                  onClick={() => { onClose(); onOpenThemeGallery?.(); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/40 hover:bg-brand/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl shadow-lg shrink-0"
                      style={{ background: `var(--brand-color)` }}
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold text-white capitalize">{theme}</p>
                      <p className="text-[10px] text-text-muted">Active theme</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-brand">
                    <span className="text-[10px] font-black uppercase tracking-widest">Browse All</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(88,101,242,0.3)]"
              >
                Save Changes
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/5"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
