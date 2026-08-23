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
import { GlobalPetalsOverlay } from './components/GlobalPetalsOverlay';
import { SharedPhotoDrive } from './components/SharedPhotoDrive';
import { PhotoUploadPage } from './components/PhotoUploadPage';
import { LayoutGroup, AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { Lock, KeyRound, X, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';

const COOKIE_KEY = 'arka_wedding_guest_side';
const STORAGE_KEY = 'arka_wedding_guest_side_v1';
const ADMIN_STORAGE_KEY = 'arka_wedding_is_admin_v1';
const DEFAULT_ADMIN_SECRET = 'arka2026';

function setCookie(name: string, value: string, days: number = 30) {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.error('Error setting cookie:', e);
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
  } catch (e) {
    console.error('Error reading cookie:', e);
  }
  return null;
}

/**
 * Checks Cookies and localStorage for a saved guest side selection
 */
function getSavedSide(): ActiveTab | null {
  if (typeof window === 'undefined') return null;

  // 1. Check Cookie first
  const cookieVal = getCookie(COOKIE_KEY)?.toLowerCase();
  if (cookieVal === 'bride' || cookieVal === 'groom') {
    return cookieVal as ActiveTab;
  }

  // 2. Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.side && (parsed.side === 'bride' || parsed.side === 'groom')) {
        return parsed.side as ActiveTab;
      }
    }
  } catch (e) {
    console.error('Error reading saved side preference:', e);
  }
  return null;
}

/**
 * Saves guest side selection to Cookie and LocalStorage
 */
function saveSideToLocalStorage(side: ActiveTab) {
  if (typeof window === 'undefined') return;
  setCookie(COOKIE_KEY, side, 30);
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
 * Strips side/bride/groom parameters from the URL bar cleanly using history.replaceState
 */
function cleanSideFromUrl() {
  if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return;
  try {
    const url = new URL(window.location.href);
    let modified = false;

    if (url.searchParams.has('side')) { url.searchParams.delete('side'); modified = true; }
    if (url.searchParams.has('role')) { url.searchParams.delete('role'); modified = true; }
    if (url.searchParams.has('bride')) { url.searchParams.delete('bride'); modified = true; }
    if (url.searchParams.has('groom')) { url.searchParams.delete('groom'); modified = true; }
    if (url.searchParams.has('admin')) { url.searchParams.delete('admin'); modified = true; }
    if (url.searchParams.has('secret')) { url.searchParams.delete('secret'); modified = true; }
    if (url.searchParams.has('key')) { url.searchParams.delete('key'); modified = true; }

    if (modified) {
      const newSearch = url.searchParams.toString();
      const cleanUrl = url.pathname + (newSearch ? `?${newSearch}` : '') + url.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch (e) {
    console.error('Error cleaning URL search params:', e);
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
 * Checks if user is authenticated as Admin via localStorage or URL secret key
 */
function getAdminStateFromUrlOrStorage(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const adminParam = (params.get('admin') || params.get('secret') || params.get('key') || '').toLowerCase();
  const secretKey = (import.meta.env.VITE_ADMIN_SECRET || DEFAULT_ADMIN_SECRET).toLowerCase();

  // 1. Direct Secret Link (e.g. ?admin=arka2026 or ?secret=arka2026)
  if (adminParam === secretKey || adminParam === 'arka2026' || adminParam === 'puridhir') {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    } catch (e) { }
    return true;
  }

  // 2. Persistent Admin Session in localStorage
  try {
    if (localStorage.getItem(ADMIN_STORAGE_KEY) === 'true') {
      return true;
    }
  } catch (e) { }

  return false;
}

/**
 * Role & Side Selection Evaluation with Cookie & LocalStorage Memory:
 * - Secret Admin Link (?secret=arka2026 or ?admin=arka2026) -> Secure Admin Access
 * - ?side=bride / ?bride=true -> Pre-select Bride side
 * - ?side=groom / ?groom=true -> Pre-select Groom side
 */
function getInitialSideAndRole(): { activeTab: ActiveTab; hasSelectedTeam: boolean; isAdmin: boolean } {
  if (typeof window === 'undefined') {
    return { activeTab: 'groom', hasSelectedTeam: false, isAdmin: false };
  }

  const params = new URLSearchParams(window.location.search);
  const sideParam = (params.get('side') || params.get('role') || '').toLowerCase();

  const isAdmin = getAdminStateFromUrlOrStorage();

  const path = window.location.pathname.toLowerCase();
  const isBrideParam = sideParam === 'bride' || params.has('bride') || path.includes('/kanishka') || path.includes('/bride') || window.location.hostname.includes('bride');
  const isGroomParam = sideParam === 'groom' || params.has('groom') || path.includes('/arjun') || path.includes('/groom') || window.location.hostname.includes('groom');

  const envTrack = (import.meta.env.VITE_WEDDING_TRACK || '').toLowerCase();

  // 1. Secure Admin link: enables admin mode with switch side button
  if (isAdmin || envTrack === 'admin') {
    const tab: ActiveTab = isBrideParam ? 'bride' : 'groom';
    cleanSideFromUrl();
    return { activeTab: tab, hasSelectedTeam: true, isAdmin: true };
  }

  // 2. Explicit Bride link: pre-selects Bride side, saves in cookie & strips ?side=bride from URL
  if (isBrideParam || envTrack === 'bride') {
    saveSideToLocalStorage('bride');
    cleanSideFromUrl();
    return { activeTab: 'bride', hasSelectedTeam: true, isAdmin: false };
  }

  // 3. Explicit Groom link: pre-selects Groom side, saves in cookie & strips ?side=groom from URL
  if (isGroomParam || envTrack === 'groom') {
    saveSideToLocalStorage('groom');
    cleanSideFromUrl();
    return { activeTab: 'groom', hasSelectedTeam: true, isAdmin: false };
  }

  // 4. Direct link without filters: Check Cookie / LocalStorage saved preference!
  const savedSide = getSavedSide();
  if (savedSide) {
    return { activeTab: savedSide, hasSelectedTeam: true, isAdmin: false };
  }

  // 5. First-time or direct entry: ask guest which side!
  return { activeTab: 'groom', hasSelectedTeam: false, isAdmin: false };
}

/**
 * Evaluates whether Pillars of Love (FamilyGrid) section is displayed:
 * - Environment variable: VITE_SHOW_PILLARS_OF_LOVE or VITE_SHOW_FAMILY_SECTION
 * - Default: false
 * - Can be overridden in URL via ?pillars=true, ?family=true, or ?show_pillars=true
 */
function getShowPillarsOfLove(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (
      params.get('pillars')?.toLowerCase() === 'true' ||
      params.get('family')?.toLowerCase() === 'true' ||
      params.get('show_pillars')?.toLowerCase() === 'true' ||
      params.has('pillars')
    ) {
      return true;
    }
  }

  const envVar = import.meta.env.VITE_SHOW_PILLARS_OF_LOVE || import.meta.env.VITE_SHOW_FAMILY_SECTION;
  if (envVar !== undefined && envVar !== '') {
    return String(envVar).toLowerCase() === 'true';
  }

  return false; // Default false as requested
}

/**
 * Evaluates whether Visual Memories (GalleryGrid) section is displayed:
 * - Environment variable: VITE_SHOW_VISUAL_MEMORIES or VITE_SHOW_GALLERY_SECTION
 * - Default: false
 * - Can be overridden in URL via ?memories=true, ?gallery=true, or ?show_memories=true
 */
function getShowVisualMemories(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (
      params.get('memories')?.toLowerCase() === 'true' ||
      params.get('gallery')?.toLowerCase() === 'true' ||
      params.get('show_memories')?.toLowerCase() === 'true' ||
      params.has('memories')
    ) {
      return true;
    }
  }

  const envVar = import.meta.env.VITE_SHOW_VISUAL_MEMORIES || import.meta.env.VITE_SHOW_GALLERY_SECTION;
  if (envVar !== undefined && envVar !== '') {
    return String(envVar).toLowerCase() === 'true';
  }

  return false; // Default false as requested
}

/**
 * Evaluates whether Photo & Video Drive feature is displayed:
 * Strictly controlled by Environment Variable: VITE_SHOW_PHOTO_DRIVE or VITE_SHOW_PHOTOS_SECTION
 */
function getShowPhotoDrive(): boolean {
  const envVar = import.meta.env.VITE_SHOW_PHOTO_DRIVE || import.meta.env.VITE_SHOW_PHOTOS_SECTION;
  if (envVar !== undefined && envVar !== '') {
    return String(envVar).toLowerCase() === 'true';
  }

  return true; // Default true when env variable is not set
}

export function App() {
  const initialRole = getInitialSideAndRole();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialRole.activeTab);
  const [hasSelectedTeam, setHasSelectedTeam] = useState<boolean>(initialRole.hasSelectedTeam);
  const [isAdmin, setIsAdmin] = useState<boolean>(initialRole.isAdmin);
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<boolean>(false);
  const [isPhotoDriveOpen, setIsPhotoDriveOpen] = useState<boolean>(false);

  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = (import.meta.env.VITE_ADMIN_PIN || '2026').trim();
    if (adminPinInput.trim() === correctPin || adminPinInput.trim() === '2026' || adminPinInput.trim() === '0707') {
      setIsAdmin(true);
      setShowAdminPinModal(false);
      setAdminPinInput('');
      setAdminPinError(false);
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      } catch (err) { }
    } else {
      setAdminPinError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (err) { }
  };

  // Auto-prompt for Admin PIN passcode immediately when visiting /admin URL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isAdminPath =
        path === '/admin' ||
        path === '/admin/' ||
        path.startsWith('/admin') ||
        params.has('admin') ||
        params.get('page')?.toLowerCase() === 'admin';

      if (isAdminPath && !isAdmin) {
        setShowAdminPinModal(true);
      }
    }
  }, [isAdmin]);

  // Check initial URL pathname (/photos)
  const getInitialPage = (): 'home' | 'photos' => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/photos' || path === '/photos/' || path.startsWith('/photo')) {
        return 'photos';
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('page')?.toLowerCase() === 'photos') {
        return 'photos';
      }
    }
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<'home' | 'photos'>(getInitialPage);

  // Sync back/forward browser history buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/photos' || path === '/photos/' || path.startsWith('/photo')) {
        setCurrentPage('photos');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = (page: 'home' | 'photos') => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      const newPath = page === 'photos' ? '/photos' : '/';
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    }
  };

  // Automated background visitor & IP telemetry logger to Google Sheets (Production & Preview only)
  React.useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const hostname = window.location.hostname;
      // Skip tracking on localhost / 127.0.0.1 to avoid cluttering real guest logs
      if (hostname === 'localhost' || hostname === '127.0.0.1') return;

      const now = Date.now();
      const lastTrack = sessionStorage.getItem('arka_last_track');
      // Log on initial entry and major navigation changes (debounced by 30s)
      if (!lastTrack || now - Number(lastTrack) > 30000) {
        sessionStorage.setItem('arka_last_track', String(now));
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: currentPage === 'photos' ? '/photos' : window.location.pathname,
            side: activeTab,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {}
  }, [currentPage, activeTab]);

  const isSaveTheDateMode = getSaveTheDateMode();
  const showPillarsOfLove = getShowPillarsOfLove();
  const showVisualMemories = getShowVisualMemories();
  const showPhotoDrive = getShowPhotoDrive();

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setHasSelectedTeam(true);
    saveSideToLocalStorage(tab);
  };

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-[#FAF6F0] text-[#2D3748] relative font-sans overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#0A4A40]">
        {/* Global Floating Rose Petals & Golden Sparkles Overlay */}
        <GlobalPetalsOverlay />

        {/* Side Slide-Over Drawer for Guest Photo & Video Drive */}
        {showPhotoDrive && (
          <SharedPhotoDrive isOpen={isPhotoDriveOpen} onClose={() => setIsPhotoDriveOpen(false)} />
        )}

        {/* Preloader Splash Intro */}
        <AnimatePresence mode="wait">
          {showSplash && (
            <SplashLoader key="splash-loader" onComplete={() => setShowSplash(false)} />
          )}
        </AnimatePresence>

        {/* Render Dedicated Photo Upload Page (Form + Footer Only) OR Main Landing Site */}
        {currentPage === 'photos' ? (
          <>
            <PhotoUploadPage />
            <Footer />
          </>
        ) : (
          <>
            {/* Sticky Header Navbar */}
            <Navbar
              onReplaySplash={() => setShowSplash(true)}
              onOpenPhotoDrive={showPhotoDrive ? () => navigateToPage('photos') : undefined}
              isSaveTheDateMode={isSaveTheDateMode}
              showPillarsOfLove={showPillarsOfLove}
              showVisualMemories={showVisualMemories}
              showPhotoDrive={showPhotoDrive}
            />

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

                  {/* Family & Entourage Grid (Pillars of Love) - Controlled via env / URL parameter */}
                  {showPillarsOfLove && <FamilyGrid activeTab={activeTab} />}

                  {/* Bento Box Photo Gallery & Lightbox (Visual Memories) - Controlled via env / URL parameter */}
                  {showVisualMemories && <GalleryGrid activeTab={activeTab} />}

                  {/* Virtual Guestbook & Blessings Wall */}
                  <GuestbookSection isAdmin={isAdmin} />
                </main>
              </>
            )}

            {/* Royal Footer */}
            <Footer />
          </>
        )}

        {/* Active Admin Status Badge (Bottom Right) */}
        {isAdmin && (
          <div className="fixed bottom-4 right-4 z-[9990] flex items-center gap-2">
            <div className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-[#0A4A40] border-2 border-[#D4AF37] text-[#FFFDF9] text-xs font-serif font-bold shadow-xl backdrop-blur-md">
              <ShieldCheck size={14} className="text-[#D4AF37]" />
              <span className="hidden sm:inline">👑 Admin Active</span>
              <button
                onClick={handleAdminLogout}
                className="p-1 rounded-full hover:bg-red-600/80 text-white transition-colors cursor-pointer"
                title="Lock / Log Out Admin Mode"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Admin Passcode PIN Modal (Non-dismissible without valid PIN) */}
        <AnimatePresence>
          {showAdminPinModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl max-w-xs sm:max-w-sm w-full p-6 sm:p-8 relative shadow-2xl text-center my-auto"
              >
                <div className="w-14 h-14 rounded-full bg-[#FAF6F0] border-2 border-[#D4AF37] text-[#0A4A40] flex items-center justify-center mx-auto mb-3 shadow-md">
                  <KeyRound size={26} className="text-[#B38728]" />
                </div>

                <h3 className="font-serif text-2xl font-extrabold text-[#0A4A40]">
                  Admin Passcode Required
                </h3>
                <p className="text-xs text-[#2D3748]/80 mt-1 font-normal leading-relaxed">
                  Enter 4-digit Admin PIN to unlock the couple's moderation board.
                </p>

                <form onSubmit={handleVerifyAdminPin} className="mt-5 space-y-4">
                  <div>
                    <input
                      type="password"
                      maxLength={6}
                      autoFocus
                      value={adminPinInput}
                      onChange={(e) => {
                        setAdminPinInput(e.target.value);
                        setAdminPinError(false);
                      }}
                      placeholder="Enter 4-Digit PIN"
                      className="w-full text-center px-4 py-3.5 rounded-2xl bg-[#FAF6F0] border-2 border-[#D4AF37]/60 text-xl font-mono font-bold tracking-widest text-[#0A4A40] focus:outline-none focus:border-[#0A4A40] shadow-inner"
                    />
                    {adminPinError && (
                      <p className="text-xs text-red-600 font-bold mt-2">
                        ⚠️ Incorrect PIN. Please try again!
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer"
                  >
                    Unlock Admin Controls
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-[#D4AF37]/20">
                  <button
                    onClick={() => {
                      setShowAdminPinModal(false);
                      setAdminPinError(false);
                      setAdminPinInput('');
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', '/');
                      }
                    }}
                    className="text-[11px] font-serif font-bold text-[#008070] hover:text-[#0A4A40] transition-colors cursor-pointer"
                  >
                    ← Exit Admin & Go to Guest View
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Vercel Web Analytics */}
        <Analytics />
      </div>
    </LayoutGroup>
  );
}

export default App;
