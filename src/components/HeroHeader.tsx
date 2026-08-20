import React from 'react';
import { motion } from 'framer-motion';
import { MonogramLogo } from './MonogramLogo';
import { CountdownTimer } from './CountdownTimer';
import { MandalaPattern, OrnamentalDivider } from './MandalaPattern';
import { Calendar, Sparkles, ChevronDown, Heart } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData';

export const HeroHeader: React.FC = () => {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F4EDE2] text-[#2D3748]">
      
      {/* 1. Background Watermark Mandala with Dual Rotation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <MandalaPattern size={720} className="animate-spin-slow text-[#D4AF37]" />
      </div>

      {/* 2. Hero Ambient Gold & Emerald Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#D4AF37]/20 via-[#008070]/10 to-[#E5C158]/20 blur-3xl pointer-events-none rounded-full" />



      {/* 4. Royal Gold Corner Filigree Ornaments */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#D4AF37]/60 pointer-events-none hidden sm:block" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#D4AF37]/60 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#D4AF37]/60 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#D4AF37]/60 pointer-events-none hidden sm:block" />

      <div className="relative z-30 max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* Sacred Sanskrit Invocation Shlok */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-xs sm:text-sm tracking-[0.3em] text-[#B38728] font-bold uppercase mb-2"
        >
          ॥ श्री गणेशाय नमः ॥
        </motion.div>

        {/* Top Blessing Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FFFDF9]/90 border border-[#D4AF37]/60 text-[#B38728] text-xs font-serif tracking-[0.25em] uppercase mb-6 shadow-md font-semibold backdrop-blur-xs"
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
          className="mt-3 font-serif text-lg sm:text-2xl italic tracking-[0.3em] text-[#008070] uppercase font-semibold flex items-center justify-center gap-3"
        >
          <span className="w-8 h-[1px] bg-[#D4AF37]/60 hidden sm:inline-block" />
          <span>A Journey Begins</span>
          <span className="w-8 h-[1px] bg-[#D4AF37]/60 hidden sm:inline-block" />
        </motion.p>

        <OrnamentalDivider className="w-full max-w-md my-4" />

        {/* Centered Event Date Pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center justify-center text-xs sm:text-sm tracking-widest uppercase font-semibold"
        >
          <div className="flex items-center gap-2 text-[#B38728] px-5 py-2 rounded-full bg-[#FFFDF9]/90 border border-[#D4AF37]/60 shadow-sm backdrop-blur-xs">
            <Calendar size={16} className="text-[#008070]" />
            <span>NOV 12, 2026</span>
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
          href="#itinerary"
          className="mt-10 text-[#B38728] hover:text-[#0A4A40] animate-bounce transition-colors"
          title="Scroll to itinerary"
        >
          <ChevronDown size={28} />
        </a>
      </div>
    </section>
  );
};
