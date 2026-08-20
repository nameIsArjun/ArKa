import React from 'react';
import { INITIAL_GUESTBOOK } from '../data/weddingData';
import { motion } from 'framer-motion';
import { OrnamentalDivider } from './MandalaPattern';
import { Sparkles, Quote } from 'lucide-react';

export const GuestbookSection: React.FC = () => {
  return (
    <section id="blessings" className="py-16 px-4 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold mb-2">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>Blessings</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
          Blessings
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2D3748] max-w-xl mx-auto font-normal">
          Heartfelt prayers, family blessings, and warm wishes for Arjun Puri & Kanishka Dhir.
        </p>

        <OrnamentalDivider className="max-w-md mx-auto" />
      </div>

      {/* Full Width Blessings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_GUESTBOOK.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-[#FFFDF9] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all text-left flex flex-col justify-between relative group"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#0A4A40] text-[#FFFDF9] font-serif font-extrabold text-sm flex items-center justify-center shadow-md border border-[#D4AF37]">
                  {msg.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-base text-[#0A4A40]">
                    {msg.name}
                  </h4>
                  <span className="text-[10px] text-[#008070] uppercase font-serif font-extrabold tracking-wider">
                    {msg.relation}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="relative bg-[#FAF6F0] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-inner">
                <Quote size={16} className="text-[#B38728] absolute top-2 right-2 opacity-30" />
                <p className="text-xs text-[#2D3748] italic font-serif leading-relaxed pr-4">
                  "{msg.message}"
                </p>
              </div>
            </div>

            {/* Date Tag */}
            <div className="mt-4 pt-2 border-t border-[#D4AF37]/20 flex justify-end">
              <span className="text-[10px] text-[#8C641D] font-serif font-bold uppercase tracking-wider">
                {msg.date}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
