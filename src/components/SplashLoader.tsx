import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MandalaPattern, CornerBorder } from './MandalaPattern';
import { MonogramLogo } from './MonogramLogo';
import { Sparkles, ArrowRight } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData';

interface SplashLoaderProps {
  onComplete: () => void;
}

export const SplashLoader: React.FC<SplashLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<'loading' | 'gliding' | 'finished'>('loading');

  useEffect(() => {
    // Increment progress bar smoothly from 0 to 100% over 2.4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      // Step 1: Smoothly start glide phase
      const glideTimer = setTimeout(() => {
        setStage('gliding');
      }, 200);

      // Step 2: Complete splash and reveal main home page seamlessly
      const finishTimer = setTimeout(() => {
        setStage('finished');
        onComplete();
      }, 1200);

      return () => {
        clearTimeout(glideTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [progress, onComplete]);

  const handleSkip = () => {
    setProgress(100);
    setStage('finished');
    onComplete();
  };

  if (stage === 'finished') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash-screen-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'gliding' ? 0 : 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between py-10 px-6 bg-[#FAF6F0] text-[#2D3748] overflow-hidden select-none pointer-events-auto"
      >
        {/* Background Corner Filigree Borders */}
        <CornerBorder position="top-left" />
        <CornerBorder position="top-right" />
        <CornerBorder position="bottom-left" />
        <CornerBorder position="bottom-right" />

        {/* Background Rotating Watermark Mandala */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"
        >
          <MandalaPattern size={680} />
        </motion.div>



        {/* Central Monogram & Radiating Concentric Light Rings */}
        <div className="relative flex flex-col items-center justify-center z-20 my-auto w-full">
          {/* Concentric Radiating Halo Ring 1 */}
          <motion.div
            animate={{
              scale: stage === 'gliding' ? 0.3 : [0.95, 1.15, 0.95],
              opacity: stage === 'gliding' ? 0 : [0.3, 0.75, 0.3],
            }}
            transition={{ duration: stage === 'gliding' ? 0.6 : 3.5, repeat: stage === 'gliding' ? 0 : Infinity, ease: 'easeInOut' }}
            className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-[#D4AF37]/50 shadow-[0_0_60px_rgba(212,175,55,0.35)] pointer-events-none"
          />

          {/* Concentric Radiating Halo Ring 2 */}
          <motion.div
            animate={{
              rotate: 360,
              scale: stage === 'gliding' ? 0.2 : [1, 1.08, 1],
              opacity: stage === 'gliding' ? 0 : 0.8,
            }}
            transition={{
              rotate: { duration: 35, repeat: Infinity, ease: 'linear' },
              scale: { duration: stage === 'gliding' ? 0.6 : 4, repeat: stage === 'gliding' ? 0 : Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.5 },
            }}
            className="absolute w-[440px] h-[440px] sm:w-[560px] sm:h-[560px] rounded-full border border-dashed border-[#008070]/30 pointer-events-none"
          />

          {/* Concentric Radiating Halo Ring 3 */}
          <motion.div
            animate={{
              scale: stage === 'gliding' ? 0.1 : [0.9, 1.1, 0.9],
              opacity: stage === 'gliding' ? 0 : [0.2, 0.5, 0.2],
            }}
            transition={{ duration: stage === 'gliding' ? 0.6 : 5, repeat: stage === 'gliding' ? 0 : Infinity, ease: 'easeInOut' }}
            className="absolute w-[580px] h-[580px] sm:w-[700px] sm:h-[700px] rounded-full border border-[#D4AF37]/20 pointer-events-none"
          />

          {/* Floating Stardust Particles */}
          <div className="absolute inset-[-120px] pointer-events-none overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: (i % 6) * 60 - 150,
                  y: Math.random() * 200 - 100,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  y: stage === 'gliding' ? -100 : [0, -40, 0],
                  opacity: stage === 'gliding' ? 0 : [0.2, 0.9, 0.2],
                  scale: stage === 'gliding' ? 0 : [0.6, 1.3, 0.6],
                }}
                transition={{
                  duration: stage === 'gliding' ? 0.5 : 2.5 + (i % 3),
                  repeat: stage === 'gliding' ? 0 : Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
                className="absolute text-[#D4AF37]"
                style={{
                  left: `${(i * 19) % 100}%`,
                  top: `${(i * 23) % 100}%`,
                }}
              >
                <Sparkles size={10 + (i % 4) * 4} />
              </motion.div>
            ))}
          </div>

          {/* Shared Monogram Logo element that glides to navbar logo */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{
              scale: stage === 'gliding' ? 0.25 : 1.1,
              opacity: 1,
              y: stage === 'gliding' ? -260 : 0,
            }}
            transition={{
              duration: stage === 'gliding' ? 0.85 : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex items-center justify-center cursor-pointer z-30"
          >
            <MonogramLogo layoutId="royal-monogram-shared-logo" size="2xl" variant="mandala" />
          </motion.div>


        </div>

        {/* Bottom Loading Progress Bar Section */}
        <div className="w-full max-w-xl mx-auto z-20 relative px-4 flex flex-col items-center pb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: stage === 'gliding' ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-serif font-bold uppercase tracking-widest text-[#8C641D]">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#008070]" />
                Preparing Royal Invitation...
              </span>
              <span>{progress}%</span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2 rounded-full bg-[#F4EDE2] border border-[#D4AF37]/50 overflow-hidden shadow-inner p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#008070] via-[#0A4A40] to-[#D4AF37] shadow-sm"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'gliding' ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleSkip}
            className="mt-4 flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[#0A4A40] bg-[#FFFDF9] hover:bg-[#F4EDE2] border border-[#D4AF37]/60 shadow-sm transition-all duration-300 active:scale-95"
          >
            <span>Skip Intro</span>
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
