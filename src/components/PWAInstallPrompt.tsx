import React from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'settings' | 'banner';
  className?: string;
  darkMode?: boolean;
}

export const PWAInstallPrompt: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
  darkMode = false,
}) => {
  const { isInstalled, isIOS, showIOSGuide, setShowIOSGuide, install, hasDeferredPrompt } = usePWAInstall();

  // If already running as an installed PWA, hide install trigger
  if (isInstalled) {
    return null;
  }

  // Header Button Variant
  if (variant === 'header') {
    return (
      <>
        <button
          id="btn-pwa-install-header"
          type="button"
          onClick={install}
          className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95 ${
            darkMode
              ? 'bg-[#1E2836] border-[#334255] text-amber-300 hover:bg-[#263242] hover:border-amber-500/50'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300'
          } ${className}`}
          title="Install Vicfungo as a native desktop or mobile app"
        >
          <span className="text-sm">📲</span>
          <span className="hidden md:inline">Install Vicfungo App</span>
          <span className="md:hidden">Install App</span>
        </button>

        {/* iOS Safari Guide Modal */}
        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} darkMode={darkMode} />
        )}
      </>
    );
  }

  // Settings Card Variant
  if (variant === 'settings') {
    return (
      <>
        <div
          id="card-pwa-install-settings"
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#1E2836] border-[#334255] text-[#F8FAFC]'
              : 'bg-gradient-to-r from-amber-50/70 to-orange-50/70 border-amber-200 text-stone-900'
          } ${className}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EA580C]/15 border border-[#EA580C]/30 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-[#EA580C]" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-display flex items-center gap-1.5">
                  Install Progressive Web App
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EA580C]/15 text-[#EA580C] border border-[#EA580C]/25">
                    Offline Ready
                  </span>
                </h4>
                <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} mt-0.5 leading-relaxed`}>
                  Run Vicfungo outside your browser with zero latency, full offline tracking, and native device habit notifications.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-pwa-install-settings-action"
              onClick={install}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#EA580C] to-[#FF7A1A] hover:from-orange-600 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-premium-orange transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Download className="w-4 h-4" />
              📲 Install Vicfungo App
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} darkMode={darkMode} />
        )}
      </>
    );
  }

  // Dashboard Banner Variant
  return (
    <>
      <div
        id="banner-pwa-install-dashboard"
        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
          darkMode
            ? 'bg-[#1A2332] border-[#334255] text-slate-200'
            : 'bg-white border-amber-200 text-stone-800 shadow-sm'
        } ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-xs font-bold block truncate">Install Vicfungo on your Home Screen</span>
            <span className={`text-[11px] block truncate ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Instant offline loading &amp; native habit alert notifications
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={install}
          className="px-3 py-1.5 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 cursor-pointer active:scale-95"
        >
          📲 Install App
        </button>
      </div>

      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} darkMode={darkMode} />
      )}
    </>
  );
};

interface IOSInstallModalProps {
  onClose: () => void;
  darkMode: boolean;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ onClose, darkMode }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
          darkMode ? 'bg-[#0F172A] border-[#334255] text-slate-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              V
            </div>
            <div>
              <h3 className="font-bold text-sm">Install Vicfungo on iOS</h3>
              <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Safari Progressive Web App</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs leading-relaxed">
          <p className={`${darkMode ? 'text-slate-300' : 'text-stone-600'}`}>
            To install this app on your iPhone or iPad home screen:
          </p>

          <div className={`p-3 rounded-xl border flex items-start gap-3 ${
            darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0 font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">1. Tap the Share icon</span>
              <span className={darkMode ? 'text-slate-400' : 'text-stone-500'}>
                Located at the bottom of Safari (or top toolbar on iPad).
              </span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-start gap-3 ${
            darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0 font-bold">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">2. Select &quot;Add to Home Screen&quot;</span>
              <span className={darkMode ? 'text-slate-400' : 'text-stone-500'}>
                Scroll down through the share options list and select <strong>Add to Home Screen</strong>.
              </span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-start gap-3 ${
            darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 font-bold">
              ✓
            </div>
            <div>
              <span className="font-bold block">3. Tap &quot;Add&quot;</span>
              <span className={darkMode ? 'text-slate-400' : 'text-stone-500'}>
                Confirm in the top right corner. Vicfungo will now launch like a full native iOS app!
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-[#EA580C] to-[#FF7A1A] hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
