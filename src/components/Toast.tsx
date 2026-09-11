import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastData {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
  darkMode: boolean;
}

export default function Toast({ toast, onClose, darkMode }: ToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration || 6000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          id="in-app-toast-container"
          initial={{ opacity: 0, y: -24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.94 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3.5 ${
            darkMode 
              ? 'bg-[#171F2A]/95 border-emerald-500/50 text-[#F8FAFC] shadow-black/40' 
              : 'bg-white/95 border-emerald-300 text-stone-900 shadow-emerald-900/10'
          }`}
          role="alert"
        >
          <div className={`p-2 rounded-xl shrink-0 ${
            darkMode ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}>
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-sm tracking-tight">
                {toast.title}
              </h4>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                ACTIVE
              </span>
            </div>
            <p className={`text-xs mt-0.5 leading-relaxed font-medium ${darkMode ? 'text-[#CBD5E1]' : 'text-stone-600'}`}>
              {toast.message}
            </p>
          </div>

          <button
            id="btn-close-toast"
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              darkMode ? 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#263242]' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
