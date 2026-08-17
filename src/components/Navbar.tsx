import React, { useState, useEffect } from 'react';
import { MonogramLogo } from './MonogramLogo';
import { Menu, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WEDDING_DETAILS } from '../data/weddingData';
import { AudioPlayer } from './AudioPlayer';

interface NavbarProps {
  onReplaySplash: () => void;
  isSaveTheDateMode: boolean;
  showPillarsOfLove?: boolean;
  showVisualMemories?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReplaySplash,
  isSaveTheDateMode,
  showPillarsOfLove = false,
  showVisualMemories = false,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [showNavbarLogo, setShowNavbarLogo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowNavbarLogo(window.scrollY > 220);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Events', href: '#itinerary', show: true },
    { label: 'Entourage', href: '#family', show: showPillarsOfLove },
    { label: 'Gallery', href: '#gallery', show: showVisualMemories },
    { label: 'Guestbook', href: '#guestbook', show: true },
  ].filter((link) => link.show);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#D4AF37]/40 py-2.5 shadow-md'
          : 'bg-gradient-to-b from-[#FFFDF9]/90 via-[#FAF6F0]/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Links (Desktop) */}
        {!isSaveTheDateMode ? (
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest text-[#2D3748] font-semibold">
            {navLinks.filter((_, idx) => idx < Math.ceil(navLinks.length / 2)).map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#B38728] transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
        ) : (
          <div className="hidden md:block w-24" />
        )}

        {/* Center Logo & Title Brand - REVEALS ONLY WHEN HERO LOGO LEAVES VIEWPORT */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: showNavbarLogo ? 1 : 0,
            y: showNavbarLogo ? 0 : -10,
            scale: showNavbarLogo ? 1 : 0.9,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`flex items-center gap-3 ${
            showNavbarLogo ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <MonogramLogo
            size="sm"
            showSubtitle={false}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          <div className="flex flex-col text-left">
            <span className="font-serif font-extrabold text-sm sm:text-base tracking-[0.15em] text-[#0A4A40]">
              {WEDDING_DETAILS.coupleNames}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-semibold text-[#008070]">
              {WEDDING_DETAILS.weddingDateRange} • {WEDDING_DETAILS.city}
            </span>
          </div>
        </motion.div>

        {/* Right Links, Audio Player & Replay Action */}
        <div className="flex items-center gap-3">
          {!isSaveTheDateMode && (
            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest text-[#2D3748] font-semibold mr-2">
              {navLinks.filter((_, idx) => idx >= Math.ceil(navLinks.length / 2)).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-[#B38728] transition-colors relative py-1 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>
          )}

          {/* Soothing Background Audio Player Toggle */}
          <AudioPlayer />

          {/* Replay Intro Button */}
          <button
            onClick={onReplaySplash}
            title="Replay Entrance Intro"
            className="p-1.5 rounded-full text-[#B38728] hover:text-[#0A4A40] hover:bg-[#F4EDE2] border border-[#D4AF37]/40 transition-all"
          >
            <RotateCcw size={14} />
          </button>

          {/* Mobile Menu Button */}
          {!isSaveTheDateMode && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#0A4A40] hover:text-[#B38728]"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {!isSaveTheDateMode && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FFFDF9]/98 border-b border-[#D4AF37]/40 backdrop-blur-xl overflow-hidden shadow-xl"
          >
            <div className="px-6 py-6 flex flex-col gap-4 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-lg tracking-widest font-bold text-[#0A4A40] hover:text-[#B38728] py-1 border-b border-[#D4AF37]/20"
                >
                  {link.label}
                </a>
              ))}

              <div className="flex items-center justify-center gap-4 mt-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onReplaySplash();
                  }}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B38728]"
                >
                  <RotateCcw size={14} /> Replay Intro
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
