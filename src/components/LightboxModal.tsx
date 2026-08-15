import React from 'react';
import { GalleryItem } from '../types/wedding';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface LightboxModalProps {
  item: GalleryItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ item, onClose, onPrev, onNext }) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-[#FFFDF9] text-[#0A4A40] hover:bg-[#D4AF37] hover:text-white border border-[#D4AF37] shadow-lg transition-all"
        >
          <X size={22} />
        </button>

        {/* Prev Arrow */}
        <button
          onClick={onPrev}
          className="absolute left-3 sm:left-6 z-50 p-3 rounded-full bg-[#FFFDF9] hover:bg-[#D4AF37] text-[#0A4A40] hover:text-white border border-[#D4AF37] shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Next Arrow */}
        <button
          onClick={onNext}
          className="absolute right-3 sm:right-6 z-50 p-3 rounded-full bg-[#FFFDF9] hover:bg-[#D4AF37] text-[#0A4A40] hover:text-white border border-[#D4AF37] shadow-xl transition-all"
        >
          <ChevronRight size={24} />
        </button>

        {/* Main Content Card */}
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl w-full max-h-[85vh] bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center"
        >
          <div className="relative w-full h-[60vh] sm:h-[68vh] bg-[#FAF6F0] flex items-center justify-center overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200';
              }}
            />
          </div>

          {/* Caption Overlay */}
          <div className="w-full p-4 sm:p-6 bg-[#FFFDF9] text-[#2D3748] text-center border-t border-[#D4AF37]/40 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#008070] font-bold mb-1">
              <Sparkles size={12} className="text-[#B38728]" />
              <span>{item.category}</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-[#0A4A40]">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#2D3748] mt-1 max-w-lg">
              {item.caption}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
