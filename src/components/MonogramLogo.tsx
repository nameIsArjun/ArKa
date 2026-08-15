import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper';

interface MonogramLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'mandala' | 'card' | 'center';
  animateGlow?: boolean;
  spinRing?: boolean;
  layoutId?: string;
}

export const MonogramLogo: React.FC<MonogramLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  onClick,
  variant = 'mandala',
  animateGlow = true,
  spinRing = true,
  layoutId,
}) => {
  const sizeMap = {
    sm: { box: 'w-11 h-11', text: 'text-[9px]', sparkSize: 10 },
    md: { box: 'w-16 h-16', text: 'text-[10px]', sparkSize: 12 },
    lg: { box: 'w-28 h-28 sm:w-32 sm:h-32', text: 'text-xs', sparkSize: 14 },
    xl: { box: 'w-40 h-40 sm:w-48 sm:h-48', text: 'text-sm', sparkSize: 18 },
    '2xl': { box: 'w-56 h-56 sm:w-72 sm:h-72', text: 'text-base', sparkSize: 22 },
  };

  const imageSrcMap = {
    mandala: getAssetUrl('/images/royal-mandala-logo.png'),
    card: getAssetUrl('/images/royal-card-full.jpg'),
    center: getAssetUrl('/images/royal-monogram-center.png'),
  };

  const { box, text, sparkSize } = sizeMap[size];
  const imgSrc = imageSrcMap[variant];

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center cursor-pointer group select-none ${className}`}
    >
      <motion.div
        layoutId={layoutId}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 24,
        }}
        className={`relative ${box} flex items-center justify-center`}
      >
        {/* Layer 1: Soft Pulsing Ambient Golden/Champagne Halo */}
        {animateGlow && (
          <motion.div
            animate={{
              opacity: [0.35, 0.75, 0.35],
              scale: [0.95, 1.1, 0.95],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-[-8px] rounded-full bg-gradient-to-tr from-[#D4AF37]/40 via-[#008070]/20 to-[#E5C158]/40 blur-xl pointer-events-none"
          />
        )}

        {/* Layer 2: Clockwise Outer Gold Filigree Ring */}
        {spinRing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-6px] rounded-full border-2 border-dashed border-[#D4AF37]/50 pointer-events-none"
          />
        )}

        {/* Layer 3: Counter-Clockwise Stardust Ring */}
        {spinRing && (
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-2px] rounded-full border border-dotted border-[#C5A059]/40 pointer-events-none"
          />
        )}

        {/* Layer 4: Orbiting Sparkle Star 1 */}
        {animateGlow && size !== 'sm' && (
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-14px] pointer-events-none flex items-start justify-center"
          >
            <Sparkles size={sparkSize} className="text-[#D4AF37] animate-pulse" />
          </motion.div>
        )}

        {/* Layer 5: Orbiting Sparkle Star 2 */}
        {animateGlow && (size === 'xl' || size === '2xl' || size === 'lg') && (
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-14px] pointer-events-none flex items-end justify-center"
          >
            <Sparkles size={sparkSize - 2} className="text-[#008070] animate-pulse" />
          </motion.div>
        )}

        {/* Layer 6: Main Logo Image - PERFECTLY CENTERED */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imgSrc}
            alt="Arjun & Kanishka Royal Emblem"
            className={`w-full h-full object-contain ${
              variant === 'card'
                ? 'rounded-2xl border border-[#D4AF37]/50 shadow-2xl'
                : 'drop-shadow-[0_10px_28px_rgba(212,175,55,0.4)]'
            }`}
            loading="eager"
          />

          {/* Shimmer Light Reflection Overlay Sweep */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity">
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
            />
          </div>
        </div>
      </motion.div>

      {showSubtitle && (
        <div className="mt-3 text-center">
          <p className={`font-serif font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#B38728] via-[#D4AF37] to-[#8C641D] ${text}`}>
            Arjun & Kanishka
          </p>
        </div>
      )}
    </div>
  );
};
