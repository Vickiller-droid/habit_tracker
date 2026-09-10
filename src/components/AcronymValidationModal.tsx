import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Check, Edit3, AlertCircle } from 'lucide-react';

interface AcronymValidationModalProps {
  isOpen: boolean;
  suspiciousWord: string;
  darkMode: boolean;
  onConfirmAcronym: (word: string) => void;
  onCorrect: () => void;
}

export default function AcronymValidationModal({
  isOpen,
  suspiciousWord,
  darkMode,
  onConfirmAcronym,
  onCorrect
}: AcronymValidationModalProps) {
  if (!isOpen || !suspiciousWord) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative overflow-hidden ${
            darkMode 
              ? 'bg-stone-900 border-stone-800 text-stone-100' 
              : 'bg-white border-orange-100 text-stone-850'
          }`}
        >
          {/* Header Accent */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Word Validation Check
              </span>
              <h3 className="text-base font-display font-black tracking-tight">
                Unrecognized Term Detected
              </h3>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border mb-5 ${
            darkMode ? 'bg-stone-850 border-stone-800' : 'bg-orange-50/50 border-orange-100'
          }`}>
            <p className="text-xs font-semibold leading-relaxed text-stone-750 dark:text-stone-250">
              This doesn&apos;t appear to be a recognized word or phrase. Is it an acronym or an intentional keyword?
            </p>
            <div className="mt-2.5 text-center py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl font-mono font-bold text-amber-600 dark:text-amber-400 text-sm tracking-wide">
              &ldquo;{suspiciousWord}&rdquo;
            </div>
            <p className="text-[11px] mt-2.5 text-stone-500 dark:text-stone-400">
              Confirming intentional keywords, codenames, or abbreviations allows Vicfungo to learn your vocabulary while keeping your lists clean.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onConfirmAcronym(suspiciousWord)}
              className="flex-1 py-3 px-4 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" /> Yes, it&apos;s intentional
            </button>
            <button
              onClick={onCorrect}
              className={`flex-1 py-3 px-4 font-bold text-xs rounded-2xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                darkMode 
                  ? 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-300' 
                  : 'border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <Edit3 className="w-4 h-4" /> No, I&apos;ll edit it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
