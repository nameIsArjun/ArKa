import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types/wedding';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

interface TabSwitchProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const TabSwitch: React.FC<TabSwitchProps> = ({ activeTab, onTabChange }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const itineraryEl = document.getElementById('itinerary');
      if (itineraryEl) {
        const rect = itineraryEl.getBoundingClientRect();
        // Visible ONLY when the user is going through/exploring the Events section
        const isScrollingEvents = rect.top <= 300 && rect.bottom >= 150;
        setIsVisible(isScrollingEvents);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-[78px] sm:top-[84px] left-0 right-0 z-30 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-[#FFFDF9]/95 border-2 border-[#D4AF37] rounded-full p-1 sm:p-1.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-1 w-full max-w-lg pointer-events-auto">
            {/* Bride Button */}
            <button
              onClick={() => onTabChange('bride')}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-full text-[11px] sm:text-xs font-serif font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === 'bride'
                  ? 'bg-[#0A4A40] text-[#FFFDF9] shadow-md border border-[#D4AF37]'
                  : 'text-[#2D3748] hover:text-[#0A4A40] hover:bg-[#F4EDE2]/60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#D4AF37]/30 text-[#0A4A40] hidden sm:flex items-center justify-center font-bold text-[10px]">
                K
              </span>
              <span>Bride</span>
              {activeTab === 'bride' && <Sparkles size={12} className="text-[#D4AF37]" />}
            </button>

            {/* Together Button */}
            <button
              onClick={() => onTabChange('together')}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-full text-[11px] sm:text-xs font-serif font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === 'together'
                  ? 'bg-[#0A4A40] text-[#FFFDF9] shadow-md border border-[#D4AF37]'
                  : 'text-[#2D3748] hover:text-[#0A4A40] hover:bg-[#F4EDE2]/60'
              }`}
            >
              <Heart size={12} className={activeTab === 'together' ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#B38728]'} />
              <span>Together</span>
            </button>

            {/* Groom Button */}
            <button
              onClick={() => onTabChange('groom')}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-full text-[11px] sm:text-xs font-serif font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === 'groom'
                  ? 'bg-[#0A4A40] text-[#FFFDF9] shadow-md border border-[#D4AF37]'
                  : 'text-[#2D3748] hover:text-[#0A4A40] hover:bg-[#F4EDE2]/60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#D4AF37]/30 text-[#0A4A40] hidden sm:flex items-center justify-center font-bold text-[10px]">
                A
              </span>
              <span>Groom</span>
              {activeTab === 'groom' && <Sparkles size={12} className="text-[#D4AF37]" />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
