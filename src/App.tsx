import React, { useState } from 'react';
import { ActiveTab } from './types/wedding';
import { WEDDING_DETAILS } from './data/weddingData';
import { SplashLoader } from './components/SplashLoader';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { SaveTheDateView } from './components/SaveTheDateView';
import { TabSwitch } from './components/TabSwitch';
import { EventTimeline } from './components/EventTimeline';
import { FamilyGrid } from './components/FamilyGrid';
import { GalleryGrid } from './components/GalleryGrid';
import { GuestbookSection } from './components/GuestbookSection';
import { Footer } from './components/Footer';
import { LayoutGroup, AnimatePresence } from 'framer-motion';

/**
 * Save The Date Mode Evaluation Rule:
 * 1. If VITE_SAVE_THE_DATE_MODE is false (or set to false):
 *    -> BOTH http://localhost:5173/ and http://localhost:5173/?mode=full open the FULL website!
 * 
 * 2. If VITE_SAVE_THE_DATE_MODE is true:
 *    -> http://localhost:5173/ opens Save The Date mode (ONLY the single Save The Date card)
 *    -> http://localhost:5173/?mode=full opens the FULL website
 */
function getSaveTheDateMode(): boolean {
  const envVar = import.meta.env.VITE_SAVE_THE_DATE_MODE;
  const isEnvTrue =
    envVar !== undefined && envVar !== ''
      ? String(envVar).toLowerCase() === 'true'
      : (WEDDING_DETAILS.isSaveTheDateMode ?? true);

  // If VITE_SAVE_THE_DATE_MODE is false, ALWAYS render full website for all URLs
  if (!isEnvTrue) {
    return false;
  }

  // If VITE_SAVE_THE_DATE_MODE is true, check if URL specifies full details override (?mode=full / ?std=0)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode')?.toLowerCase();
    const std = params.get('std')?.toLowerCase();
    const full = params.get('full')?.toLowerCase();

    if (
      mode === 'full' ||
      mode === 'details' ||
      std === '0' ||
      std === 'false' ||
      full === 'true' ||
      full === '1' ||
      params.has('full')
    ) {
      return false;
    }
  }

  // Default when VITE_SAVE_THE_DATE_MODE is true and no URL override is provided
  return true;
}

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('together');
  const isSaveTheDateMode = getSaveTheDateMode();

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-[#FAF6F0] text-[#2D3748] relative font-sans overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#0A4A40]">
        {/* Preloader Splash Intro */}
        <AnimatePresence mode="wait">
          {showSplash && (
            <SplashLoader key="splash-loader" onComplete={() => setShowSplash(false)} />
          )}
        </AnimatePresence>

        {/* Sticky Header Navbar */}
        <Navbar
          onReplaySplash={() => setShowSplash(true)}
          isSaveTheDateMode={isSaveTheDateMode}
        />

        {/* Main Content: Either Save The Date Landing View OR Full Interactive Wedding Site */}
        {isSaveTheDateMode ? (
          <div className="pt-20 sm:pt-24 min-h-[85vh] flex items-center justify-center">
            <SaveTheDateView />
          </div>
        ) : (
          <>
            {/* Hero Header Section */}
            <HeroHeader />

            {/* Always Floating Perspective Switcher: Bride | Together | Groom */}
            <TabSwitch
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
            />

            <main className="relative z-20 space-y-12 pt-8">
              {/* Interactive Event Itinerary */}
              <EventTimeline activeTab={activeTab} />

              {/* Family & Entourage Grid */}
              <FamilyGrid activeTab={activeTab} />

              {/* Bento Box Photo Gallery & Lightbox */}
              <GalleryGrid activeTab={activeTab} />

              {/* Virtual Guestbook & Blessings Wall */}
              <GuestbookSection />
            </main>
          </>
        )}

        {/* Royal Footer */}
        <Footer />
      </div>
    </LayoutGroup>
  );
}

export default App;
