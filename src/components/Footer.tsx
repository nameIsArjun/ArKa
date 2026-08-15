import React from 'react';
import { MonogramLogo } from './MonogramLogo';
import { MandalaPattern, OrnamentalDivider } from './MandalaPattern';
import { Heart } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-[#F7F2E8] via-[#FAF6F0] to-[#EFE8D8] text-[#2D3748] pt-16 pb-12 px-4 border-t-2 border-[#D4AF37]/50 overflow-hidden shadow-inner">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <MandalaPattern size={550} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <MonogramLogo size="lg" variant="mandala" showSubtitle={false} />

        <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A4A40]">
          {WEDDING_DETAILS.coupleNames}
        </h3>

        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold">
          #ArjunWedsKanishka • {WEDDING_DETAILS.weddingDateRange} • {WEDDING_DETAILS.city}
        </p>

        <OrnamentalDivider className="w-full max-w-sm my-6" />

        <p className="text-xs text-[#2D3748]/80 max-w-md mx-auto leading-relaxed font-medium">
          Thank you for being part of our journey. We look forward to celebrating sacred vows and everlasting memories with you under the stars of Rajasthan.
        </p>

        <div className="mt-8 text-[11px] text-[#B38728] flex items-center gap-1.5 uppercase tracking-widest font-bold">
          <span>Crafted with</span>
          <Heart size={12} className="text-red-500 fill-red-500" />
          <span>for {WEDDING_DETAILS.coupleNames}</span>
        </div>
      </div>
    </footer>
  );
};
