import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const GlobalPetalsOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-20">
      {Array.from({ length: 22 }).map((_, i) => (
        <motion.div
          key={`global-petal-${i}`}
          initial={{ y: '-10vh', opacity: 0, scale: 0.8 }}
          animate={{
            y: ['-10vh', '110vh'],
            x: [0, (i % 2 === 0 ? 50 : -50), (i % 2 === 0 ? -30 : 30)],
            rotate: [0, 360],
            opacity: [0, 0.85, 0.85, 0],
          }}
          transition={{
            duration: 9 + (i % 6) * 1.8,
            repeat: Infinity,
            delay: (i * 0.6) % 8,
            ease: 'linear',
          }}
          className="absolute text-xl sm:text-2xl drop-shadow-md select-none"
          style={{ left: `${(i * 4.6 + 2) % 96}%` }}
        >
          {i % 4 === 0 ? (
            <span>🌹</span>
          ) : i % 4 === 1 ? (
            <span>🌸</span>
          ) : i % 4 === 2 ? (
            <span>🌺</span>
          ) : (
            <Sparkles size={18} className="text-[#FFD700] drop-shadow-[0_0_8px_#D4AF37]" />
          )}
        </motion.div>
      ))}
    </div>
  );
};
