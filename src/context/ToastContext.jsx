import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let icon = <Info size={18} />;
            let bgClass = 'bg-slate-900/95 border-white/10 text-slate-100';
            let iconBg = 'bg-slate-800 text-slate-300';
            
            if (t.type === 'success') {
              icon = <CheckCircle size={18} />;
              bgClass = 'bg-emerald-950/95 border-emerald-500/20 text-emerald-100';
              iconBg = 'bg-emerald-500/20 text-emerald-400';
            } else if (t.type === 'error') {
              icon = <ShieldAlert size={18} />;
              bgClass = 'bg-red-950/95 border-red-500/20 text-red-100';
              iconBg = 'bg-red-500/20 text-red-400';
            } else if (t.type === 'warning') {
              icon = <AlertTriangle size={18} />;
              bgClass = 'bg-amber-950/95 border-amber-500/20 text-amber-100';
              iconBg = 'bg-amber-500/20 text-amber-400';
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`pointer-events-auto p-4 rounded-[1.5rem] border backdrop-blur-xl shadow-2xl flex items-start gap-3 ${bgClass}`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>
                  {icon}
                </div>
                <div className="flex-1 text-xs font-bold leading-relaxed pt-1.5">
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
