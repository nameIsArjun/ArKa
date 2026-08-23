import React from 'react';
import { ActiveTab } from '../types/wedding';
import { FAMILY_MEMBERS } from '../data/weddingData';
import { motion, AnimatePresence } from 'framer-motion';
import { OrnamentalDivider } from './MandalaPattern';
import { Sparkles, Heart, Quote, Pin } from 'lucide-react';

interface FamilyGridProps {
  activeTab: ActiveTab;
}

export const FamilyGrid: React.FC<FamilyGridProps> = ({ activeTab }) => {
  // Separate into Bride's family & Groom's family
  const brideMembers = FAMILY_MEMBERS.filter((m) => m.side === 'bride');
  const groomMembers = FAMILY_MEMBERS.filter((m) => m.side === 'groom');

  const showBride = activeTab === 'bride' || activeTab === 'together';
  const showGroom = activeTab === 'groom' || activeTab === 'together';

  return (
    <section id="family" className="py-16 px-4 max-w-7xl mx-auto">
      {/* Top Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold mb-2">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>The Pillars of Love</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
          Two Families, One Union
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2D3748] max-w-xl mx-auto font-normal">
          Meet the beloved elders, cherished siblings, and dearest family members who surround Arjun & Kanishka with love.
        </p>

        <OrnamentalDivider className="max-w-md mx-auto" />
      </div>

      {/* Dual Side-by-Side Family Columns ("Separated But Together") */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
        {/* Central United Divider Badge */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[#FFFDF9] border-2 border-[#D4AF37] shadow-xl flex items-center justify-center text-[#B38728]">
            <Heart size={20} className="fill-[#D4AF37]" />
          </div>
          <span className="text-[9px] uppercase font-serif font-extrabold tracking-widest text-[#0A4A40] mt-1 bg-[#FFFDF9] px-2 py-0.5 rounded-full border border-[#D4AF37]/40 shadow-sm">
            United In Love
          </span>
        </div>

        {/* ================= BRIDE'S FAMILY COLUMN ================= */}
        {showBride && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`space-y-6 ${!showGroom ? 'lg:col-span-2 max-w-3xl mx-auto w-full' : ''}`}
          >
            {/* Column Header */}
            <div className="bg-gradient-to-r from-[#F4EDE2] via-[#FFFDF9] to-[#F4EDE2] border-2 border-[#D4AF37]/50 rounded-2xl p-4 text-center shadow-md">
              <div className="inline-flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-widest text-[#B38728]">
                <span>🌸 The Dhir Family</span>
                <span className="text-[#008070]">• Bride's Side</span>
              </div>
              <h3 className="font-serif text-2xl font-extrabold text-[#0A4A40] mt-1">
                Kanishka’s Loved Ones
              </h3>
            </div>

            {/* Post-it Parchment Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {brideMembers.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-[#FFFDF9] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative group flex flex-col items-center text-center"
                >
                  {/* Top Gold Pin / Wax Seal Accent */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] border border-[#B38728] shadow-md flex items-center justify-center text-[#0A4A40] z-10">
                    <Pin size={13} className="rotate-45" />
                  </div>

                  {/* Avatar Photo Frame */}
                  <div className="relative w-24 h-24 rounded-full border-2 border-[#D4AF37] p-1 shadow-sm mt-2 mb-3 bg-[#FAF6F0] overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400';
                      }}
                    />
                  </div>

                  {/* Relation Pill */}
                  <span className="px-3 py-1 rounded-full bg-[#F4EDE2] text-[#0A4A40] border border-[#D4AF37]/40 text-[10px] uppercase font-serif font-extrabold tracking-widest mb-1 shadow-sm">
                    {member.relation}
                  </span>

                  {/* Name */}
                  <h4 className="font-serif text-lg font-extrabold text-[#0A4A40]">
                    {member.name}
                  </h4>

                  {/* Parchment Note Box */}
                  <div className="mt-3 bg-[#FAF6F0] border border-[#D4AF37]/30 p-3.5 rounded-2xl relative w-full text-left shadow-inner">
                    <Quote size={14} className="text-[#B38728] absolute top-2 right-2 opacity-40" />
                    <p className="text-xs italic text-[#2D3748] leading-relaxed font-serif pr-4">
                      {member.note}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ================= GROOM'S FAMILY COLUMN ================= */}
        {showGroom && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`space-y-6 ${!showBride ? 'lg:col-span-2 max-w-3xl mx-auto w-full' : ''}`}
          >
            {/* Column Header */}
            <div className="bg-gradient-to-r from-[#F4EDE2] via-[#FFFDF9] to-[#F4EDE2] border-2 border-[#D4AF37]/50 rounded-2xl p-4 text-center shadow-md">
              <div className="inline-flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-widest text-[#B38728]">
                <span>🤵 The Puri Family</span>
                <span className="text-[#008070]">• Groom's Side</span>
              </div>
              <h3 className="font-serif text-2xl font-extrabold text-[#0A4A40] mt-1">
                Arjun’s Loved Ones
              </h3>
            </div>

            {/* Post-it Parchment Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {groomMembers.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-[#FFFDF9] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative group flex flex-col items-center text-center"
                >
                  {/* Top Gold Pin / Wax Seal Accent */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] border border-[#B38728] shadow-md flex items-center justify-center text-[#0A4A40] z-10">
                    <Pin size={13} className="rotate-45" />
                  </div>

                  {/* Avatar Photo Frame */}
                  <div className="relative w-24 h-24 rounded-full border-2 border-[#D4AF37] p-1 shadow-sm mt-2 mb-3 bg-[#FAF6F0] overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
                      }}
                    />
                  </div>

                  {/* Relation Pill */}
                  <span className="px-3 py-1 rounded-full bg-[#F4EDE2] text-[#0A4A40] border border-[#D4AF37]/40 text-[10px] uppercase font-serif font-extrabold tracking-widest mb-1 shadow-sm">
                    {member.relation}
                  </span>

                  {/* Name */}
                  <h4 className="font-serif text-lg font-extrabold text-[#0A4A40]">
                    {member.name}
                  </h4>

                  {/* Parchment Note Box */}
                  <div className="mt-3 bg-[#FAF6F0] border border-[#D4AF37]/30 p-3.5 rounded-2xl relative w-full text-left shadow-inner">
                    <Quote size={14} className="text-[#B38728] absolute top-2 right-2 opacity-40" />
                    <p className="text-xs italic text-[#2D3748] leading-relaxed font-serif pr-4">
                      {member.note}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
