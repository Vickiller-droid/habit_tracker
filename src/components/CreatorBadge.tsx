import React from 'react';

interface CreatorBadgeProps {
  size?: 'xs' | 'sm' | 'md';
  label?: 'Creator' | 'Founder';
  darkMode?: boolean;
  className?: string;
  showSparkle?: boolean;
}

export const CreatorBadge: React.FC<CreatorBadgeProps> = ({
  size = 'sm',
  label = 'Creator',
  darkMode = false,
  className = '',
  showSparkle = true
}) => {
  const sizeClasses = {
    xs: 'text-[8px] px-1.5 py-0.2',
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1'
  }[size];

  return (
    <span
      id="creator-identity-badge"
      className={`inline-flex items-center gap-1 font-mono font-bold rounded-full border shadow-xs transition-all select-none ${sizeClasses} ${
        darkMode
          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/15 text-amber-300 border-amber-400/40 shadow-amber-950/20'
          : 'bg-gradient-to-r from-amber-50 to-orange-50/70 text-amber-800 border-amber-300/80 shadow-amber-100/50'
      } ${className}`}
      title="Verified Platform Creator / Founder"
    >
      {showSparkle && (
        <span className="text-[#FF7A1A] text-[10px] leading-none">⚡</span>
      )}
      <span>{label}</span>
    </span>
  );
};
