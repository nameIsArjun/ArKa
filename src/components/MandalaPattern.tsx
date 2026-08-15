import React from 'react';

export const MandalaPattern: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 300 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`opacity-25 pointer-events-none select-none ${className}`}
    >
      <circle cx="100" cy="100" r="96" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx="100" cy="100" r="80" stroke="url(#goldGradient)" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="64" stroke="url(#goldGradient)" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="48" stroke="url(#goldGradient)" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="100" cy="100" r="28" stroke="url(#goldGradient)" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="10" fill="url(#goldGradient)" fillOpacity="0.3" stroke="url(#goldGradient)" />

      {/* Lotus Petals */}
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 30} 100 100)`}>
          <path
            d="M100 20 C108 45, 108 55, 100 70 C92 55, 92 45, 100 20 Z"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="0.8"
          />
          <path
            d="M100 36 C104 50, 104 58, 100 68 C96 58, 96 50, 100 36 Z"
            fill="url(#goldGradient)"
            fillOpacity="0.12"
          />
        </g>
      ))}

      {/* Outer Lotus Ring */}
      {Array.from({ length: 24 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 15} 100 100)`}>
          <circle cx="100" cy="8" r="2" fill="url(#goldGradient)" />
        </g>
      ))}

      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#E5C158" />
          <stop offset="100%" stopColor="#B38728" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const OrnamentalDivider: React.FC<{ title?: string; className?: string }> = ({ title, className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-4 my-8 ${className}`}>
      <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
      <div className="flex items-center gap-2 text-[#D4AF37]">
        <span className="text-xs">◆</span>
        {title && (
          <span className="font-serif tracking-[0.25em] text-xs uppercase font-semibold text-[#0A4A40]">
            {title}
          </span>
        )}
        <span className="text-xs">◆</span>
      </div>
      <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
    </div>
  );
};

export const CornerBorder: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({ position }) => {
  const posClasses = {
    'top-left': 'top-2 left-2 rotate-0',
    'top-right': 'top-2 right-2 rotate-90',
    'bottom-left': 'bottom-2 left-2 -rotate-90',
    'bottom-right': 'bottom-2 right-2 rotate-180',
  };

  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 32 32"
      fill="none"
      className={`absolute ${posClasses[position]} text-[#D4AF37]/60 pointer-events-none`}
    >
      <path d="M2 30V8C2 4.68629 4.68629 2 8 2H30" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 26V10C6 7.79086 7.79086 6 10 6H26" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
      <circle cx="4" cy="4" r="2" fill="currentColor" />
    </svg>
  );
};
