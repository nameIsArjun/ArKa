import React, { useState } from 'react';
import { ActiveTab } from './types/wedding';
import { WEDDING_DETAILS } from './data/weddingData';
import { SplashLoader } from './components/SplashLoader';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { SaveTheDateView } from './components/SaveTheDateView';
import { EventTimeline } from './components/EventTimeline';
import { FamilyGrid } from './components/FamilyGrid';
import { GalleryGrid } from './components/GalleryGrid';
import { GuestbookSection } from './components/GuestbookSection';
import { Footer } from './components/Footer';
import { LayoutGroup, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'arka_wedding_guest_side_v1';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

/**
 * Checks localStorage for a valid saved guest side selection within the last 24 hours
 */
function getSavedSide(): ActiveTab | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.side && parsed.timestamp) {
      if (Date.now() - parsed.timestamp < EXPIRY_MS) {
        return parsed.side as ActiveTab;
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error('Error reading saved side preference:', e);
  }
  return null;
}

/**
 * Saves guest side selection to localStorage with timestamp for 24-hour persistence
 */
function saveSideToLocalStorage(side: ActiveTab) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ side, timestamp: Date.now() })
    );
  } catch (e) {
    console.error('Error saving side preference:', e);
  }
}

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

/**
 * Role & Side Selection Evaluation with 24-Hour Memory:
 * - ?side=groom / ?groom=true -> Pre-select Groom side, save for 24h, skip popup modal
 * - ?side=bride / ?bride=true -> Pre-select Bride side, save for 24h, skip popup modal
 * - ?admin=true / ?side=admin -> Admin mode enabled (Switch Side button shown)
 * - Direct link without filters (http://localhost:5173/ or ?mode=full):
 *   -> Checks 24-hour localStorage cache! If cached, loads saved side. If new/expired, asks guest!
 */
function getInitialSideAndRole(): { activeTab: ActiveTab; hasSelectedTeam: boolean; isAdmin: boolean } {
  if (typeof window === 'undefined') {
    return { activeTab: 'groom', hasSelectedTeam: false, isAdmin: false };
  }

  const params = new URLSearchParams(window.location.search);
  const sideParam = (params.get('side') || params.get('role') || '').toLowerCase();
  
  const isAdminParam =
    params.get('admin')?.toLowerCase() === 'true' ||
    params.get('admin') === '1' ||
    sideParam === 'admin' ||
    params.has('admin');

  const isBrideParam = sideParam === 'bride' || params.has('bride') || window.location.hostname.includes('bride');
  const isGroomParam = sideParam === 'groom' || params.has('groom') || window.location.hostname.includes('groom');

  const envTrack = (import.meta.env.VITE_WEDDING_TRACK || '').toLowerCase();

  // 1. Admin link: enables admin mode with switch side button
  if (isAdminParam || envTrack === 'admin') {
    const tab: ActiveTab = isBrideParam ? 'bride' : 'groom';
    return { activeTab: tab, hasSelectedTeam: true, isAdmin: true };
  }

  // 2. Explicit Bride link: pre-selects Bride side & saves for 24h
  if (isBrideParam || envTrack === 'bride') {
    saveSideToLocalStorage('bride');
    return { activeTab: 'bride', hasSelectedTeam: true, isAdmin: false };
  }

  // 3. Explicit Groom link: pre-selects Groom side & saves for 24h
  if (isGroomParam || envTrack === 'groom') {
    saveSideToLocalStorage('groom');
    return { activeTab: 'groom', hasSelectedTeam: true, isAdmin: false };
  }

  // 4. Direct link without filters: Check 24-hour saved preference!
  const savedSide = getSavedSide();
  if (savedSide) {
    return { activeTab: savedSide, hasSelectedTeam: true, isAdmin: false };
  }

  // 5. First-time or expired direct entry: ask guest which side!
  return { activeTab: 'groom', hasSelectedTeam: false, isAdmin: false };
}

export function App() {
  const initialRole = getInitialSideAndRole();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialRole.activeTab);
  const [hasSelectedTeam, setHasSelectedTeam] = useState<boolean>(initialRole.hasSelectedTeam);
  const [isAdmin] = useState<boolean>(initialRole.isAdmin);
  const isSaveTheDateMode = getSaveTheDateMode();

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setHasSelectedTeam(true);
    saveSideToLocalStorage(tab);
  };

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

            <main className="relative z-20 space-y-12 pt-8">
              {/* Interactive Event Itinerary */}
              <EventTimeline
                activeTab={activeTab}
                onTabChange={handleTabChange}
                hasSelectedTeam={hasSelectedTeam}
                isAdmin={isAdmin}
              />

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
