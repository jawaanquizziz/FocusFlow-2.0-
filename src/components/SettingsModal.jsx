import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const THEMES = [
  { id: 'midnight', label: 'Midnight', color: 'bg-[#5865F2]' },
  { id: 'cyberpunk', label: 'Cyberpunk', color: 'bg-[#FF00E5]' },
  { id: 'forest', label: 'Forest', color: 'bg-[#10B981]' },
  { id: 'oceanic', label: 'Oceanic', color: 'bg-[#0EA5E9]' },
  { id: 'sunset', label: 'Sunset', color: 'bg-[#F97316]' },
];

const SettingsModal = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const { theme, setTheme } = useTheme();

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
                <label className="block text-sm font-medium text-text-muted mb-4 uppercase tracking-wide flex items-center gap-2">
                  <Palette size={16} />
                  Visual Theme
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`group relative flex flex-col items-center gap-2 transition-all p-1 rounded-xl border-2 ${
                        theme === t.id ? 'border-brand' : 'border-transparent hover:border-white/10'
                      }`}
                    >
                      <div className={`w-full aspect-square rounded-lg ${t.color} shadow-lg transition-transform group-hover:scale-110`} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
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
