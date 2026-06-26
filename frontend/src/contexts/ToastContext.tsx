import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            
            let icon = 'ℹ️';
            let borderColor = 'border-blue-500/20';
            let accentColor = 'bg-blue-500/10 text-blue-400';
            if (isSuccess) {
              icon = '✨';
              borderColor = 'border-pink-500/20';
              accentColor = 'bg-pink-500/10 text-pink-400';
            } else if (isError) {
              icon = '⚠️';
              borderColor = 'border-red-500/20';
              accentColor = 'bg-red-500/10 text-red-400';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
                layout
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-black/90 backdrop-blur-xl border ${borderColor} shadow-2xl shadow-black/50 overflow-hidden relative group`}
              >
                {/* Accent glow line at the left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSuccess ? 'bg-pink-500' : isError ? 'bg-red-500' : 'bg-blue-500'}`} />

                <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${accentColor} flex-shrink-0`}>
                  {icon}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/95 leading-relaxed break-words">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs font-bold p-0.5 border-0 bg-transparent"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
