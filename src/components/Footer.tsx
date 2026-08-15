import React from 'react';
import { MonogramLogo } from './MonogramLogo';
import { MandalaPattern, OrnamentalDivider } from './MandalaPattern';
import { Heart } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-[#F7F2E8] via-[#FAF6F0] to-[#EFE8D8] text-[#2D3748] pt-16 pb-14 px-4 border-t-2 border-[#D4AF37]/50 overflow-hidden shadow-inner">
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

        {/* Heartfelt Thank You Note Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF9]/95 border-2 border-[#D4AF37]/50 shadow-md max-w-xl mx-auto text-center relative backdrop-blur-sm">
          <div className="inline-flex items-center gap-1.5 text-xs font-serif font-extrabold uppercase tracking-[0.2em] text-[#B38728] mb-3">
            <Heart size={13} className="text-[#D4AF37] fill-[#D4AF37]" />
            <span>With Heartfelt Gratitude</span>
            <Heart size={13} className="text-[#D4AF37] fill-[#D4AF37]" />
          </div>
          <p className="font-serif italic text-sm sm:text-base text-[#0A4A40] leading-relaxed">
            "With immense joy and gratitude in our hearts, we thank our beloved families, elders, and dear friends for showering us with eternal blessings and love as we begin this golden lifetime together."
          </p>
          <span className="block mt-4 text-xs font-serif font-extrabold tracking-widest uppercase text-[#008070]">
            — Arjun & Kanishka
          </span>
        </div>
      </div>
    </footer>
  );
};
