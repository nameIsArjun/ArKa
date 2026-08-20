import React from 'react';
import { MonogramLogo } from './MonogramLogo';
import { CountdownTimer } from './CountdownTimer';
import { MandalaPattern, OrnamentalDivider } from './MandalaPattern';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { triggerIcsDownload, getGoogleCalendarUrl } from '../utils/calendarHelper';

export const SaveTheDateView: React.FC = () => {
  // Download Safari-compatible .ics reminder file + Google Calendar fallback for Save The Date
  const downloadSaveTheDateIcs = () => {
    const params = {
      id: 'save-the-date',
      title: 'Save The Date: Arjun Puri & Kanishka Dhir Wedding',
      description: 'Save the date for the wedding of Arjun Puri & Kanishka Dhir!',
      dateStr: 'Thursday, November 12, 2026',
      venueName: 'Anutham Hotel & Resort',
      address: 'Jammu, J&K',
    };

    triggerIcsDownload(params);
    window.open(getGoogleCalendarUrl(params), '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto text-center relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#FFFDF9]/95 border-2 border-[#D4AF37] rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden backdrop-blur-md"
      >
        {/* Background Mandala Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <MandalaPattern size={600} />
        </div>

        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4EDE2] text-[#0A4A40] border border-[#D4AF37]/50 text-xs font-serif font-bold tracking-[0.25em] uppercase mb-6 shadow-sm">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>Save The Date</span>
        </div>

        {/* Central Monogram Logo */}
        <div className="my-4">
          <MonogramLogo size="xl" variant="mandala" animateGlow={true} spinRing={true} />
        </div>

        {/* Couple Names */}
        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-[#0A4A40] tracking-tight mt-4">
          Arjun Puri & Kanishka Dhir
        </h1>

        <p className="font-serif italic text-base sm:text-xl text-[#B38728] mt-2 font-medium">
          Together with their families, invite you to save the date for their wedding
        </p>

        <OrnamentalDivider className="max-w-md mx-auto my-6" />

        {/* Highlighted Save The Date Box */}
        <div className="bg-gradient-to-r from-[#F4EDE2] via-[#FFFDF9] to-[#F4EDE2] border-2 border-[#D4AF37]/60 rounded-2xl p-6 my-6 max-w-md mx-auto shadow-md text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#008070] block mb-1">
            Official Wedding Date
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0A4A40]">
            November 12, 2026
          </p>
        </div>

        {/* Live Countdown Timer */}
        <div className="my-8">
          <span className="text-xs uppercase font-serif tracking-[0.2em] font-bold text-[#8C641D]">
            Counting Down To November 12, 2026
          </span>
          <CountdownTimer />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center mt-8">
          <button
            onClick={downloadSaveTheDateIcs}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 transition-all duration-300 transform hover:scale-105"
          >
            <Calendar size={18} />
            <span>Add Calendar Reminder</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
};
