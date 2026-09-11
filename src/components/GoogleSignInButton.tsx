import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  text?: string;
  variant?: 'default' | 'outline' | 'compact' | 'header';
  className?: string;
  id?: string;
  darkMode?: boolean;
}

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.09 3.6-5.17 3.6-9.12z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.24C.45 8.14 0 9.99 0 12s.45 3.86 1.24 5.43l4.04-3.14z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.57l4.04 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
  isLoading = false,
  text = 'Sign in with Google',
  variant = 'default',
  className = '',
  id = 'btn-google-sign-in',
  darkMode = false
}) => {
  if (variant === 'compact') {
    return (
      <button
        id={id}
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-xs active:scale-[0.98] ${
          darkMode
            ? 'bg-[#1E2836] hover:bg-[#263345] border-[#334255] text-[#F8FAFC]'
            : 'bg-white hover:bg-stone-50 border-[#CBD5E1] text-[#0F172A]'
        } ${className}`}
        title="Sign in with Google Account"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" /> : <GoogleIcon className="w-3.5 h-3.5" />}
        <span>{text}</span>
      </button>
    );
  }

  if (variant === 'header') {
    return (
      <button
        id={id}
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-xs active:scale-[0.97] ${
          darkMode
            ? 'bg-[#1E2836] hover:bg-[#263345] border-[#334255] text-amber-300'
            : 'bg-white hover:bg-amber-50/50 border-stone-200 text-stone-800'
        } ${className}`}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" /> : <GoogleIcon className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{text}</span>
        <span className="sm:hidden">Sign In</span>
      </button>
    );
  }

  if (variant === 'outline') {
    return (
      <button
        id={id}
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-xs active:scale-[0.98] ${
          darkMode
            ? 'bg-[#171F2A] hover:bg-[#1E2836] border-[#334255] text-[#F8FAFC]'
            : 'bg-white hover:bg-stone-50 border-[#CBD5E1] text-stone-800'
        } ${className}`}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <GoogleIcon className="w-4 h-4" />}
        <span>{text}</span>
      </button>
    );
  }

  // Default rich button
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`w-full sm:w-auto px-6 py-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-md hover:shadow-lg active:scale-[0.98] ${
        darkMode
          ? 'bg-[#1E2836] hover:bg-[#253243] border-[#334255] text-[#F8FAFC] shadow-black/20'
          : 'bg-white hover:bg-stone-50/90 border-[#CBD5E1] text-stone-800 shadow-stone-200/60'
      } ${className}`}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <GoogleIcon className="w-4 h-4" />}
      <span>{text}</span>
    </button>
  );
};
