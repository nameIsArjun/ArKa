import React from 'react';
import { ActiveTab } from '../types/wedding';
import { BRIDE_PROFILE, GROOM_PROFILE, TOGETHER_PROFILE } from '../data/weddingData';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerBorder, OrnamentalDivider } from './MandalaPattern';
import { Heart, Quote, Sparkles, Star } from 'lucide-react';

interface ProfileCardProps {
  activeTab: ActiveTab;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ activeTab }) => {
  const profile =
    activeTab === 'bride'
      ? BRIDE_PROFILE
      : activeTab === 'groom'
      ? GROOM_PROFILE
      : TOGETHER_PROFILE;

  return (
    <section id="story" className="py-16 px-4 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative bg-[#FFFDF9] border-2 border-[#D4AF37]/50 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden"
        >
          <CornerBorder position="top-left" />
          <CornerBorder position="top-right" />
          <CornerBorder position="bottom-left" />
          <CornerBorder position="bottom-right" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Photo Card Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative group max-w-xs sm:max-w-sm w-full">
                {/* Gold Outer Glow Frame */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#D4AF37] via-[#008070] to-[#E5C158] opacity-60 blur-md group-hover:opacity-100 transition duration-500" />

                {/* Main Image Box */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-[#FAF6F0] aspect-[3/4] shadow-xl">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A4A40]/90 via-transparent to-transparent opacity-75" />

                  {/* Name Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md border border-[#D4AF37] text-[#0A4A40] text-[10px] uppercase tracking-widest font-serif font-bold mb-1 shadow-sm">
                      {profile.role}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FFFDF9]">
                      {profile.name}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info Column */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold mb-2">
                <Sparkles size={14} className="text-[#B38728]" />
                <span>Perspective & Heritage</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0A4A40] tracking-tight">
                {activeTab === 'bride'
                  ? 'Meet The Royal Bride'
                  : activeTab === 'groom'
                  ? 'Meet The Royal Groom'
                  : 'Two Hearts, One Sacred Vow'}
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#2D3748] font-normal">
                {profile.bio}
              </p>

              {/* Quote Box */}
              <div className="mt-6 p-5 rounded-2xl bg-[#F4EDE2]/70 border-l-4 border-[#D4AF37] relative">
                <Quote size={24} className="text-[#B38728]/40 absolute top-3 right-3" />
                <p className="font-serif italic text-base sm:text-lg text-[#0A4A40] font-semibold leading-snug">
                  {profile.quote}
                </p>
              </div>

              {/* Fun Facts & Hobbies */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.funFact && (
                  <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-[#D4AF37]/40 shadow-sm flex items-start gap-2.5">
                    <Star size={18} className="text-[#B38728] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-serif uppercase tracking-wider text-[#008070] font-bold">
                        Special Memory
                      </span>
                      <span className="text-xs text-[#2D3748] font-medium leading-tight">
                        {profile.funFact}
                      </span>
                    </div>
                  </div>
                )}

                {profile.hobbies && profile.hobbies.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-[#D4AF37]/40 shadow-sm flex items-start gap-2.5">
                    <Heart size={18} className="text-[#0A4A40] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-serif uppercase tracking-wider text-[#008070] font-bold">
                        Passions & Affinities
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {profile.hobbies.map((hobby) => (
                          <span
                            key={hobby}
                            className="px-2 py-0.5 rounded-md bg-[#F4EDE2] text-[#0A4A40] text-[10px] font-bold"
                          >
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
