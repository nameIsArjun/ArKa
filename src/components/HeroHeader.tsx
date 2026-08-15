import React from 'react';
import { motion } from 'framer-motion';
import { MonogramLogo } from './MonogramLogo';
import { CountdownTimer } from './CountdownTimer';
import { MandalaPattern, OrnamentalDivider } from './MandalaPattern';
import { Calendar, MapPin, Sparkles, ChevronDown } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData';

export const HeroHeader: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F4EDE2] text-[#2D3748]">
      {/* Background Watermark Mandala */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <MandalaPattern size={680} className="animate-spin-slow" />
      </div>

      {/* Hero Ambient Gold Glow */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#D4AF37]/15 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Top Blessing Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FFFDF9] border border-[#D4AF37]/60 text-[#B38728] text-xs font-serif tracking-[0.25em] uppercase mb-6 shadow-sm font-semibold"
        >
          <Sparkles size={13} className="text-[#008070]" />
          <span>Together With Their Families</span>
          <Sparkles size={13} className="text-[#008070]" />
        </motion.div>

        {/* Central Animated Royal Monogram */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <MonogramLogo size="xl" variant="mandala" />
        </motion.div>

        {/* Main Title: Arjun & Kanishka */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-6 font-serif text-4xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-[#0A4A40] drop-shadow-sm"
        >
          Arjun & Kanishka
        </motion.h1>

        {/* Tagline: A Journey Begins */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-3 font-serif text-lg sm:text-2xl italic tracking-[0.3em] text-[#008070] uppercase font-semibold"
        >
          A Journey Begins
        </motion.p>

        <OrnamentalDivider className="w-full max-w-md my-4" />

        {/* Event Details Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm tracking-widest text-[#2D3748] uppercase font-semibold"
        >
          <div className="flex items-center gap-1.5 text-[#B38728]">
            <Calendar size={16} />
            <span>{WEDDING_DETAILS.weddingDateRange}</span>
          </div>
          <span className="hidden sm:inline text-[#D4AF37]">•</span>
          <div className="flex items-center gap-1.5 text-[#008070]">
            <MapPin size={16} />
            <span>{WEDDING_DETAILS.mainLocation}</span>
          </div>
        </motion.div>

        {/* Live Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full"
        >
          <CountdownTimer />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-4"
        >
          <a
            href="#itinerary"
            className="px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest text-[#0A4A40] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] shadow-gold-glow hover:brightness-105 active:scale-95 transition-all duration-300 border border-[#B38728]/40"
          >
            Explore Events
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <a
          href="#tabs-section"
          className="mt-12 text-[#B38728] hover:text-[#0A4A40] animate-bounce transition-colors"
          title="Scroll to perspectives"
        >
          <ChevronDown size={28} />
        </a>
      </div>
    </section>
  );
};
