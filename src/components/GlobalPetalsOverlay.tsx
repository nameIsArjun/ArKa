import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const GlobalPetalsOverlay: React.FC = () => {
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 45, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalized = (e.clientX / window.innerWidth - 0.5) * 40;
      mouseX.set(normalized);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX]);

  return (
    <motion.div
      style={{ x: smoothMouseX }}
      className="fixed inset-0 overflow-hidden pointer-events-none z-20"
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={`global-petal-${i}`}
          initial={{ y: '-10vh', opacity: 0, scale: 0.8 }}
          animate={{
            y: ['-10vh', '110vh'],
            x: [0, (i % 2 === 0 ? 45 : -45), (i % 2 === 0 ? -25 : 25)],
            rotate: [0, (i % 2 === 0 ? 360 : -360)],
            opacity: [0, 0.85, 0.85, 0],
          }}
          transition={{
            duration: 10 + (i % 5) * 2,
            repeat: Infinity,
            delay: (i * 0.55) % 9,
            ease: 'linear',
          }}
          className="absolute text-xl sm:text-2xl drop-shadow-md select-none"
          style={{ left: `${(i * 4.2 + 2) % 96}%` }}
        >
          {i % 5 === 0 ? (
            <span>🌹</span>
          ) : i % 5 === 1 ? (
            <span>🌼</span>
          ) : i % 5 === 2 ? (
            <span>🌸</span>
          ) : i % 5 === 3 ? (
            <span>🌺</span>
          ) : (
            <Sparkles size={16} className="text-[#FFD700] drop-shadow-[0_0_8px_#D4AF37]" />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};
