import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
  className?: string;
  variant?: 'compact' | 'expanded';
}

export default function ThemeToggle({
  darkMode,
  onToggle,
  className = '',
  variant = 'expanded'
}: ThemeToggleProps) {
  if (variant === 'compact') {
    return (
      <button
        id="theme-toggle-compact"
        type="button"
        onClick={onToggle}
        aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
        title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
        className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
          darkMode
            ? 'bg-[#1E2836] hover:bg-[#263242] border-[#334255] text-[#FFB074] shadow-xs'
            : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-xs'
        } ${className}`}
      >
        {darkMode ? (
          <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 stroke-[2.2]" />
        )}
      </button>
    );
  }

  return (
    <button
      id="theme-toggle-button"
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={darkMode}
      aria-label={darkMode ? 'Current mode: Dark. Click to switch to Light.' : 'Current mode: Light. Click to switch to Dark.'}
      title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:ring-offset-1 ${
        darkMode
          ? 'bg-[#171F2A] hover:bg-[#1E2836] border-[#334255] text-[#F8FAFC] shadow-sm'
          : 'bg-[#F1F5F9] hover:bg-slate-200/80 border-[#CBD5E1] text-[#0F172A] shadow-xs'
      } ${className}`}
    >
      {/* Sliding pill indicator */}
      <div className="flex items-center gap-1.5">
        <div
          className={`flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-200 ${
            darkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-500 text-white shadow-xs'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
        </div>
        <div
          className={`flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-200 ${
            darkMode ? 'bg-indigo-500 text-white shadow-xs' : 'bg-slate-300/60 text-slate-500'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
        </div>
      </div>

      <span className="text-xs font-semibold tracking-tight font-sans">
        {darkMode ? (
          <span className="text-[#E4E4E7]">Dark</span>
        ) : (
          <span className="text-[#334155]">Light</span>
        )}
      </span>
    </button>
  );
}
