import React, { useState } from 'react';
import { ActiveTab, GalleryItem } from '../types/wedding';
import { GALLERY_ITEMS } from '../data/weddingData';
import { LightboxModal } from './LightboxModal';
import { motion, AnimatePresence } from 'framer-motion';
import { OrnamentalDivider } from './MandalaPattern';
import { Sparkles, Maximize2, Camera } from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper';

interface GalleryGridProps {
  activeTab: ActiveTab;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ activeTab }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Filter gallery items per perspective tab & category filter
  const items = GALLERY_ITEMS.filter((item) => {
    // Side filtering
    if (activeTab === 'bride' && item.side !== 'bride') return false;
    if (activeTab === 'groom' && item.side !== 'groom') return false;
    if (activeTab === 'together' && item.side !== 'together') return false;

    // Category filter
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const handlePrev = () => {
    if (selectedItemIndex === null) return;
    setSelectedItemIndex((prev) => (prev === 0 ? items.length - 1 : (prev as number) - 1));
  };

  const handleNext = () => {
    if (selectedItemIndex === null) return;
    setSelectedItemIndex((prev) => (prev === items.length - 1 ? 0 : (prev as number) + 1));
  };

  return (
    <section id="gallery" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold mb-2">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>Visual Memories</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
          Photo Wall & Moments
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2D3748] max-w-xl mx-auto font-normal">
          Glimpses of royal celebrations in Jammu, heartfelt smiles, and timeless memories.
        </p>

        <OrnamentalDivider className="max-w-md mx-auto" />

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {[
            { id: 'all', label: 'All Moments' },
            { id: 'pre-wedding', label: 'Pre-Wedding' },
            { id: 'engagement', label: 'Mehndi & Haldi' },
            { id: 'sangeet', label: 'Sangeet Night' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-serif tracking-wider uppercase transition-all duration-300 ${
                filterCategory === cat.id
                  ? 'bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] border border-[#B38728] shadow-sm font-bold'
                  : 'bg-[#FFFDF9] text-[#2D3748] hover:bg-[#F4EDE2] border border-[#D4AF37]/40 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Masonry Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const spanClass =
              item.aspectRatio === 'wide'
                ? 'sm:col-span-2 lg:col-span-2'
                : item.aspectRatio === 'portrait'
                ? 'row-span-1'
                : 'col-span-1';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => setSelectedItemIndex(index)}
                className={`relative group rounded-3xl overflow-hidden border border-[#D4AF37]/50 bg-[#FAF6F0] cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 min-h-[260px] ${spanClass}`}
              >
                <img
                  src={getAssetUrl(item.image)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800';
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A4A40]/90 via-[#0A4A40]/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Expand Icon Hover */}
                <div className="absolute top-4 right-4 p-2 rounded-full bg-[#FFFDF9]/90 text-[#0A4A40] border border-[#D4AF37] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110 shadow-sm">
                  <Maximize2 size={16} />
                </div>

                {/* Title & Caption */}
                <div className="absolute bottom-4 left-4 right-4 text-left translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#F3E5AB]">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FFFDF9]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#FFFDF9]/90 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-0.5">
                    {item.caption}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <LightboxModal
        item={selectedItemIndex !== null ? items[selectedItemIndex] : null}
        onClose={() => setSelectedItemIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </section>
  );
};
