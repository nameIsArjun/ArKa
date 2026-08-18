import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, Flame, Sun, Heart } from 'lucide-react';

interface EventBackgroundAnimationProps {
  eventId: string;
  category?: 'bride' | 'groom' | 'together';
  isInView?: boolean;
}

export const EventBackgroundAnimation: React.FC<EventBackgroundAnimationProps> = ({
  eventId,
  isInView = true,
}) => {
  if (!isInView) return null;

  // 1. Pitambari Saant Ceremony: Turmeric Shower & Yellow Petals
  if (eventId.includes('haldi')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 opacity-40">
        {/* Warm Golden Turmeric Glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-[#FFC107]/40 via-[#FFD700]/20 to-transparent blur-2xl"
        />

        {/* Floating Turmeric & Flower Petals */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`haldi-${i}`}
            initial={{
              x: Math.random() * 300 - 150,
              y: -20,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              y: [0, 240],
              x: [(i % 2 === 0 ? -1 : 1) * (10 + i * 5), (i % 2 === 0 ? 1 : -1) * (20 + i * 5)],
              opacity: [0, 0.8, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'linear',
            }}
            className="absolute top-0 text-[#FFC107]"
            style={{ left: `${(i * 11) % 100}%` }}
          >
            {i % 3 === 0 ? (
              <Sun size={12 + (i % 3) * 4} className="text-[#FFC107] fill-[#FFD700]/50" />
            ) : (
              <span className="inline-block w-3 h-3 rounded-full bg-[#FFD700]/70 border border-[#E67E22]/50 shadow-sm" />
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  // 2. Jashn-e-Sangeet: Musical Notes & Disco Neon Lights
  if (eventId.includes('sangeet')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 opacity-45">
        {/* Laser Light Beams */}
        <motion.div
          animate={{ rotate: [0, 45, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[-50%] bg-gradient-to-tr from-[#008070]/20 via-[#D4AF37]/20 to-transparent blur-3xl"
        />

        {/* Floating Music Notes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`sangeet-${i}`}
            initial={{ y: 200, opacity: 0, scale: 0.5 }}
            animate={{
              y: [-20, -180],
              opacity: [0, 1, 0],
              scale: [0.6, 1.2, 0.8],
            }}
            transition={{
              duration: 5 + (i % 2),
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
            className="absolute text-[#D4AF37]"
            style={{ left: `${(i * 12 + 5) % 95}%`, bottom: '0%' }}
          >
            <Music size={14 + (i % 3) * 6} className="text-[#D4AF37] drop-shadow-md" />
          </motion.div>
        ))}
      </div>
    );
  }

  // 3. Phoolon Ki Mehndi: Blossom Rose Petals & Mint Swirls
  if (eventId.includes('mehndi')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 opacity-40">
        {/* Soft Floral Blush Ambient */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-gradient-to-tr from-[#FF69B4]/30 via-[#008070]/20 to-transparent blur-2xl"
        />

        {/* Tumbling Rose & Marigold Petals */}
        {Array.from({ length: 11 }).map((_, i) => (
          <motion.div
            key={`mehndi-${i}`}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{
              y: [0, 260],
              x: [(i % 2 === 0 ? 15 : -15), (i % 2 === 0 ? -25 : 25)],
              opacity: [0, 0.85, 0],
              rotate: [0, 270],
            }}
            transition={{
              duration: 4.5 + (i % 3),
              repeat: Infinity,
              delay: i * 0.35,
              ease: 'linear',
            }}
            className="absolute top-0 text-[#FF69B4]"
            style={{ left: `${(i * 13) % 95}%` }}
          >
            <Heart size={10 + (i % 3) * 4} className="text-[#FF69B4] fill-[#FF69B4]/40" />
          </motion.div>
        ))}
      </div>
    );
  }

  // 4. Engagement & Tikka: Ring Sparkles & Champagne Bubbles
  if (eventId.includes('engagement')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 opacity-45">
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/15 via-transparent to-[#0A4A40]/15 blur-xl"
        />

        {/* Rising Champagne Bubbles & Sparkles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`engagement-${i}`}
            initial={{ y: 220, opacity: 0 }}
            animate={{
              y: [-10, -200],
              x: [0, (i % 2 === 0 ? 12 : -12)],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.25,
              ease: 'easeOut',
            }}
            className="absolute text-[#D4AF37]"
            style={{ left: `${(i * 10 + 3) % 95}%`, bottom: '0%' }}
          >
            <Sparkles size={12 + (i % 4) * 3} className="text-[#D4AF37]" />
          </motion.div>
        ))}
      </div>
    );
  }

  // 5. Satsang: Divine Lotus Aura & Holy Chanting Rays
  if (eventId.includes('satsang')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 opacity-40">
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-radial from-[#F3E5AB]/40 via-[#0A4A40]/20 to-transparent blur-2xl"
        />

        {/* Floating Serene Particles */}
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={`satsang-${i}`}
            initial={{ y: 180, opacity: 0 }}
            animate={{
              y: [-10, -170],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 5 + (i % 2),
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
            className="absolute text-[#FFFDF9]"
            style={{ left: `${(i * 14 + 7) % 95}%`, bottom: '0%' }}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F3E5AB] shadow-[0_0_10px_#D4AF37]" />
          </motion.div>
        ))}
      </div>
    );
  }

  // 6. Vivah & Baraat: Sacred Agni Sparks & Red Rose Petals
  if (eventId.includes('wedding')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 opacity-45">
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-t from-[#800020]/25 via-[#D4AF37]/20 to-transparent blur-xl"
        />

        {/* Rising Sacred Agni Sparks */}
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={`vivah-${i}`}
            initial={{ y: 220, opacity: 0, scale: 0.4 }}
            animate={{
              y: [-20, -220],
              x: [(i % 2 === 0 ? 10 : -10), (i % 2 === 0 ? -15 : 15)],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.4],
            }}
            transition={{
              duration: 3.5 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeOut',
            }}
            className="absolute text-[#FFC107]"
            style={{ left: `${(i * 9 + 2) % 96}%`, bottom: '0%' }}
          >
            {i % 2 === 0 ? (
              <Flame size={12 + (i % 3) * 4} className="text-[#FF5722] fill-[#FFC107]" />
            ) : (
              <Sparkles size={10 + (i % 3) * 3} className="text-[#D4AF37]" />
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  // 7. Default Ambient Gold Stardust Glow for Khule Shagun & Sehra Bandi
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 opacity-35">
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 via-transparent to-[#0A4A40]/20 blur-xl"
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`ambient-${i}`}
          initial={{ y: 180, opacity: 0 }}
          animate={{
            y: [-10, -160],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 4.5 + (i % 2),
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
          className="absolute text-[#D4AF37]"
          style={{ left: `${(i * 14 + 5) % 95}%`, bottom: '0%' }}
        >
          <Sparkles size={10 + (i % 3) * 4} />
        </motion.div>
      ))}
    </div>
  );
};
