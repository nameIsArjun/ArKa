import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, EventItem } from '../types/wedding';
import { WEDDING_EVENTS } from '../data/weddingData';
import { motion, AnimatePresence } from 'framer-motion';
import { OrnamentalDivider } from './MandalaPattern';
import { Clock, MapPin, Sparkles, ExternalLink, Download, Shirt, X, Lock, RefreshCw, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper';
import { EventBackgroundAnimation } from './EventBackgroundAnimation';

interface EventTimelineProps {
  activeTab: ActiveTab;
  onTabChange?: (tab: ActiveTab) => void;
  hasSelectedTeam: boolean;
  isAdmin?: boolean;
}

// Map each eventId to its custom artwork illustration
function getEventArtwork(eventId: string): string {
  if (eventId.includes('shagun')) return getAssetUrl('/images/art/art_shagun.jpg');
  if (eventId.includes('satsang')) return getAssetUrl('/images/art/art_satsang.jpg');
  if (eventId.includes('sehra')) return getAssetUrl('/images/art/art_sehra.jpg');
  if (eventId.includes('haldi')) return getAssetUrl('/images/art/art_haldi.jpg');
  if (eventId.includes('engagement')) return getAssetUrl('/images/art/art_engagement.jpg');
  if (eventId.includes('mehndi')) return getAssetUrl('/images/art/art_mehndi.jpg');
  if (eventId.includes('sangeet')) return getAssetUrl('/images/art/art_sangeet.jpg');
  return getAssetUrl('/images/art/art_vivah.jpg');
}

// Helper for short concise event titles on sidebar tiles
function getEventShortTitle(evt: EventItem): string {
  if (evt.id.includes('shagun')) return 'Khule Shagun';
  if (evt.id.includes('satsang')) return 'Divine Satsang';
  if (evt.id.includes('engagement')) return 'Sangeet Gala';
  if (evt.id.includes('haldi')) return 'Pitambari Haldi';
  if (evt.id.includes('sehra')) return 'Sehra Bandi';
  if (evt.id.includes('vivah')) return 'Shubh Vivah';
  if (evt.id.includes('mehndi')) return 'Mehndi Night';
  return evt.title;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ activeTab, onTabChange, hasSelectedTeam, isAdmin }) => {
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
  const [selectedMapEvent, setSelectedMapEvent] = useState<EventItem | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1); // 1 = down, -1 = up

  const stageAreaRef = useRef<HTMLDivElement>(null);

  // Automatically trigger popup modal ONLY when guest scrolls down to Itinerary section if team is not chosen yet
  useEffect(() => {
    const handleScroll = () => {
      if (hasSelectedTeam) return;
      const itineraryEl = document.getElementById('itinerary');
      if (itineraryEl) {
        const rect = itineraryEl.getBoundingClientRect();
        // Triggers ONLY when top of Itinerary section reaches 65% of viewport height
        const isInItineraryView = rect.top <= window.innerHeight * 0.65 && rect.bottom >= 150;
        if (isInItineraryView) {
          setShowTeamModal(true);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasSelectedTeam]);

  const handleSelectTeam = (tab: ActiveTab) => {
    onTabChange?.(tab);
    setShowTeamModal(false);
  };

  // Strictly 2 cases:
  // - groom: shows Groom Rituals + Joint Together Celebrations
  // - bride: shows Bride Rituals + Joint Together Celebrations
  const filteredEvents = WEDDING_EVENTS.filter((evt) => {
    if (activeTab === 'bride') {
      return evt.category === 'bride' || evt.category === 'together';
    }
    // Default or groom side
    return evt.category === 'groom' || evt.category === 'together';
  });

  // Reset active index if tab changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeTab]);

  const selectEventIndex = (newIdx: number) => {
    if (newIdx === activeIndex) return;
    setDirection(newIdx > activeIndex ? 1 : -1);
    setActiveIndex(newIdx);
  };

  const handleNext = () => {
    if (activeIndex < filteredEvents.length - 1) {
      setDirection(1);
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveIndex((prev) => prev - 1);
    }
  };

  // Handle Mouse Wheel scrolling inside fixed right stage area on desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 30) {
      handleNext();
    } else if (e.deltaY < -30) {
      handlePrev();
    }
  };

  const currentEvt = filteredEvents[activeIndex] || filteredEvents[0];

  // Generate .ics calendar download for an event
  const downloadIcs = (evt: EventItem) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Arjun & Kanishka Wedding//EN
BEGIN:VEVENT
SUMMARY:${evt.title} - Arjun & Kanishka Wedding
DESCRIPTION:${evt.description} | Dress Code: ${evt.dressCode}
LOCATION:${evt.venueName}, ${evt.address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${evt.id}-arjun-kanishka-wedding.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="itinerary" className="py-16 px-4 max-w-6xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-semibold mb-2">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>Royal Itinerary</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
          Celebrations & Schedule
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2D3748] max-w-xl mx-auto font-normal">
          Explore the sacred rituals, royal feasting, and celebratory galas awaiting our cherished guests in Jammu & Bathinda.
        </p>

        <OrnamentalDivider className="max-w-md mx-auto" />
      </div>

      {/* Active Side Header Banner (shown after selection to switch side anytime) */}
      {hasSelectedTeam && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4AF37]/50 shadow-md max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {activeTab === 'bride' ? '👰' : '🤵'}
            </span>
            <div>
              <span className="text-xs font-serif font-extrabold text-[#0A4A40] uppercase tracking-wider block">
                {activeTab === 'bride'
                  ? 'Team Bride Schedule (Kanishka’s Side)'
                  : 'Team Groom Schedule (Arjun’s Side)'}
              </span>
              <span className="text-[11px] text-[#008070] font-medium">
                Includes Family Rituals & Joint Main Wedding Celebrations
              </span>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowTeamModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF6F0] hover:bg-[#D4AF37] text-[#0A4A40] hover:text-white border border-[#D4AF37]/50 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Switch Side</span>
            </button>
          )}
        </div>
      )}

      {/* Unselected Teaser State: Shown until guest chooses a team */}
      {!hasSelectedTeam ? (
        <div className="bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl p-8 sm:p-12 shadow-2xl text-center max-w-2xl mx-auto my-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
          
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF6F0] border-2 border-[#D4AF37] text-[#0A4A40] flex items-center justify-center mx-auto shadow-md">
              <Lock size={28} className="text-[#B38728]" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0A4A40]">
              Unlock Your Personalized Itinerary
            </h3>
            <p className="text-xs sm:text-sm text-[#2D3748]/80 max-w-md mx-auto leading-relaxed font-serif">
              Please choose whether you are celebrating with <strong>Team Groom</strong> or <strong>Team Bride</strong> to reveal your customized schedule of rituals & grand galas.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setShowTeamModal(true)}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-widest shadow-xl hover:brightness-105 transition-all cursor-pointer"
              >
                Choose Team Groom or Team Bride
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* FIXED STAGE + VERTICAL CARD SWITCHER (CARDS MOVE UP/DOWN WITHIN THIS FIXED STAGE) */
        <div className="space-y-6">

          {/* MOBILE ONLY: HORIZONTAL INSTAGRAM STORY BAR */}
          <div className="block lg:hidden sticky top-20 z-30 bg-[#FFFDF9]/95 backdrop-blur-md py-3 px-3 rounded-2xl border border-[#D4AF37]/50 shadow-lg mb-4">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-1 px-1">
              {filteredEvents.map((evt, idx) => {
                const artUrl = getEventArtwork(evt.id);
                const isActive = activeIndex === idx;

                return (
                  <button
                    key={evt.id}
                    onClick={() => selectEventIndex(idx)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                  >
                    <div
                      className={`relative w-14 h-14 rounded-full p-0.5 transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#0A4A40] shadow-md scale-105 ring-2 ring-[#D4AF37]'
                          : 'bg-[#D4AF37]/30 hover:bg-[#D4AF37]/60'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#FFFDF9] border-2 border-[#FFFDF9] p-0.5 flex items-center justify-center">
                        <img
                          src={artUrl}
                          alt={evt.title}
                          className="w-full h-full object-contain object-center rounded-full group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0A4A40] text-[#FFFDF9] border border-[#D4AF37] text-[9px] font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-serif font-extrabold max-w-[65px] truncate transition-colors ${
                        isActive ? 'text-[#0A4A40]' : 'text-[#2D3748]/70'
                      }`}
                    >
                      {getEventShortTitle(evt)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESKTOP & MOBILE MAIN STAGE CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[640px]">
            
            {/* DESKTOP VERTICAL SIDEBAR MENU */}
            <div className="hidden lg:flex lg:col-span-4 flex-col bg-[#FFFDF9] border-2 border-[#D4AF37]/60 rounded-3xl p-4 shadow-xl space-y-3 h-[640px]">
              <div className="px-3 py-2 border-b border-[#D4AF37]/30 text-left flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#B38728]" />
                  <span className="font-serif font-extrabold text-xs text-[#0A4A40] uppercase tracking-wider">
                    Event Highlights
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#008070] bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                  {activeIndex + 1} of {filteredEvents.length}
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto p-1 scrollbar-none">
                {filteredEvents.map((evt, idx) => {
                  const artUrl = getEventArtwork(evt.id);
                  const isActive = activeIndex === idx;

                  return (
                    <button
                      key={evt.id}
                      onClick={() => selectEventIndex(idx)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 text-left cursor-pointer border-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#FAF6F0] via-[#FFFDF9] to-[#FAF6F0] border-[#D4AF37] shadow-md'
                          : 'bg-[#FFFDF9] border-transparent hover:bg-[#FAF6F0]/60 hover:border-[#D4AF37]/30'
                      }`}
                    >
                      {/* Vertical Story Avatar Circle */}
                      <div
                        className={`relative w-12 h-12 rounded-full shrink-0 p-0.5 transition-all ${
                          isActive
                            ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#0A4A40] ring-2 ring-[#D4AF37]'
                            : 'bg-[#D4AF37]/30'
                        }`}
                      >
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#FFFDF9] p-0.5 flex items-center justify-center">
                          <img
                            src={artUrl}
                            alt={evt.title}
                            className="w-full h-full object-contain object-center rounded-full"
                          />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0A4A40] text-[#FFFDF9] border border-[#D4AF37] text-[9px] font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Event Title & Date Info */}
                      <div className="min-w-0 flex-1">
                        <span
                          className={`font-serif font-extrabold text-sm block truncate ${
                            isActive ? 'text-[#0A4A40]' : 'text-[#2D3748]'
                          }`}
                        >
                          {getEventShortTitle(evt)}
                        </span>
                        <span className="text-[11px] text-[#008070] font-medium block truncate">
                          {evt.date.split(',')[0]} • {evt.time}
                        </span>
                      </div>

                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="w-1.5 h-7 rounded-full bg-[#D4AF37] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT FIXED STAGE AREA: CARDS SLIDE UP & DOWN WITHIN THIS STAGE (NO PAGE SCROLLING DOWN) */}
            <div
              ref={stageAreaRef}
              onWheel={handleWheel}
              className="lg:col-span-8 relative h-[640px] flex flex-col justify-between"
            >
              <AnimatePresence mode="wait" initial={false}>
                {currentEvt && (
                  <motion.div
                    key={currentEvt.id}
                    initial={{ opacity: 0, y: direction * 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: direction * -40 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="w-full h-full bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl overflow-hidden shadow-2xl relative group text-left flex flex-col justify-between"
                  >
                    {/* Dynamic Event Background Particle Backdrop */}
                    <EventBackgroundAnimation eventId={currentEvt.id} category={currentEvt.category} isInView={true} />

                    {/* Stage Hero Artwork Image Header */}
                    <div className="relative h-60 sm:h-72 bg-[#FFFDF9] border-b-2 border-[#D4AF37]/40 flex items-center justify-center p-3 shrink-0">
                      <img
                        src={getEventArtwork(currentEvt.id)}
                        alt={currentEvt.title}
                        className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A4A40]/90 via-[#0A4A40]/20 to-transparent pointer-events-none" />

                      {/* Date Tag */}
                      <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#FFFDF9]/95 backdrop-blur-md border border-[#D4AF37] text-[#0A4A40] text-xs font-serif font-extrabold shadow-md flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#B38728]" />
                        <span>{currentEvt.date}</span>
                      </div>

                      {/* Event Badge */}
                      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0A4A40] border-2 border-[#D4AF37] text-[#FFFDF9] text-xs font-serif font-extrabold flex items-center justify-center shadow-md">
                        #{activeIndex + 1}
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        <span className="text-[10px] uppercase tracking-widest text-[#F3E5AB] font-bold block">
                          {currentEvt.subtitle}
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#FFFDF9]">
                          {currentEvt.title}
                        </h3>
                      </div>
                    </div>

                    {/* Stage Card Details Body */}
                    <div className="p-6 space-y-4 relative z-10 flex-1 overflow-y-auto scrollbar-none flex flex-col justify-between">
                      
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-[#0A4A40]">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#D4AF37]/40 shadow-xs">
                            <Clock size={13} className="text-[#B38728] shrink-0" />
                            <span>{currentEvt.time}</span>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#D4AF37]/40 shadow-xs">
                            <MapPin size={13} className="text-[#008070] shrink-0" />
                            <span>{currentEvt.location}</span>
                          </div>
                        </div>

                        <div className="text-xs text-[#2D3748]">
                          <span className="font-bold text-[#0A4A40] block text-sm">{currentEvt.venueName}</span>
                          <span className="text-[11px] text-[#2D3748]/75">{currentEvt.address}</span>
                        </div>

                        {/* Dress Code Box */}
                        <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/90 border border-[#D4AF37]/40 flex items-start gap-3 backdrop-blur-sm">
                          <Shirt size={17} className="text-[#B38728] shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-serif font-extrabold uppercase tracking-wider text-[#0A4A40]">
                                Dress Code: {currentEvt.dressCode}
                              </span>
                              <div className="flex items-center gap-1">
                                {currentEvt.dressCodeColors.map((color) => (
                                  <span
                                    key={color}
                                    className="w-3 h-3 rounded-full border border-black/20 shadow-xs"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-[#2D3748]/85 font-medium">
                              {currentEvt.dressCodeDescription}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#2D3748] leading-relaxed font-serif italic">
                          "{currentEvt.description}"
                        </p>
                      </div>

                      {/* Action Buttons & Stage Stepper Controls */}
                      <div className="pt-3 border-t border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
                        <button
                          onClick={() => setSelectedMapEvent(currentEvt)}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#0A4A40] hover:text-[#008070] transition-colors cursor-pointer"
                        >
                          <MapPin size={14} className="text-[#B38728]" />
                          <span>View Directions</span>
                        </button>

                        {/* Prev / Next Card Stage Arrows */}
                        <div className="flex items-center gap-2">
                          <button
                            disabled={activeIndex === 0}
                            onClick={handlePrev}
                            className={`p-2 rounded-full border transition-all cursor-pointer ${
                              activeIndex === 0
                                ? 'opacity-30 cursor-not-allowed border-gray-300'
                                : 'bg-[#FAF6F0] hover:bg-[#D4AF37] text-[#0A4A40] hover:text-white border-[#D4AF37]/50 shadow-xs'
                            }`}
                          >
                            <ChevronUp size={16} />
                          </button>
                          
                          <button
                            disabled={activeIndex === filteredEvents.length - 1}
                            onClick={handleNext}
                            className={`p-2 rounded-full border transition-all cursor-pointer ${
                              activeIndex === filteredEvents.length - 1
                                ? 'opacity-30 cursor-not-allowed border-gray-300'
                                : 'bg-[#FAF6F0] hover:bg-[#D4AF37] text-[#0A4A40] hover:text-white border-[#D4AF37]/50 shadow-xs'
                            }`}
                          >
                            <ChevronDown size={16} />
                          </button>

                          <button
                            onClick={() => downloadIcs(currentEvt)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F4EDE2] hover:bg-[#D4AF37] text-[#0A4A40] hover:text-white border border-[#D4AF37]/50 text-xs font-bold transition-all shadow-sm cursor-pointer ml-2"
                          >
                            <Download size={13} />
                            <span>Add to Calendar</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

      {/* TEAM SELECTION POPUP MODAL: DULHAN & GROOM CARDS ONLY */}
      <AnimatePresence>
        {showTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl text-center max-h-[90vh] overflow-y-auto"
            >
              {hasSelectedTeam && (
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF6F0] text-[#0A4A40] hover:bg-[#D4AF37] hover:text-white transition-colors cursor-pointer z-10"
                >
                  <X size={18} />
                </button>
              )}

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF6F0] border border-[#D4AF37]/50 text-[#0A4A40] text-xs font-serif font-extrabold shadow-xs mb-2">
                <Sparkles size={14} className="text-[#B38728]" />
                <span>Guest Personalization</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#0A4A40]">
                Which side are you celebrating with?
              </h3>
              <p className="text-xs sm:text-sm text-[#2D3748]/80 max-w-md mx-auto mt-1 font-normal">
                Select your side to unlock your family's rituals & grand wedding celebrations!
              </p>

              {/* Horizontal 2 Cards Grid: Strictly Bride or Groom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 text-left">
                
                {/* Dulhan (Bride) Card */}
                <div
                  onClick={() => handleSelectTeam('bride')}
                  className="bg-[#FAF6F0] border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                >
                  <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden mb-4 border border-[#D4AF37]/40 shadow-sm bg-[#FFFDF9] flex items-center justify-center p-2">
                    <img
                      src={getAssetUrl('/images/art/card_dulhan.jpg')}
                      alt="Dulhan Bride Art"
                      className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A4A40]/80 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#FFFDF9]/95 backdrop-blur-md border border-[#D4AF37] text-[#0A4A40] text-xs font-serif font-extrabold shadow-sm z-10">
                      👰 Dulhan Side
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-extrabold text-lg text-[#0A4A40]">
                      Team Bride (Kanishka's Guest)
                    </h4>
                    <p className="text-xs text-[#008070] font-medium mt-1">
                      Haldi • Mehndi • Sangeet • Main Wedding
                    </p>
                  </div>

                  <button className="mt-4 w-full py-2.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-wider shadow-md group-hover:brightness-105 transition-all text-center cursor-pointer">
                    Celebrate with Team Bride
                  </button>
                </div>

                {/* Dulhe Raja (Groom) Card */}
                <div
                  onClick={() => handleSelectTeam('groom')}
                  className="bg-[#FAF6F0] border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                >
                  <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden mb-4 border border-[#D4AF37]/40 shadow-sm bg-[#FFFDF9] flex items-center justify-center p-2">
                    <img
                      src={getAssetUrl('/images/art/card_groom.jpg')}
                      alt="Dulhe Raja Groom Art"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A4A40]/80 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#FFFDF9]/95 backdrop-blur-md border border-[#D4AF37] text-[#0A4A40] text-xs font-serif font-extrabold shadow-sm z-10">
                      🤵 Groom Side
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-extrabold text-lg text-[#0A4A40]">
                      Team Groom (Arjun's Guest)
                    </h4>
                    <p className="text-xs text-[#008070] font-medium mt-1">
                      Shagun • Satsang • Sehra Bandi • Main Wedding
                    </p>
                  </div>

                  <button className="mt-4 w-full py-2.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-wider shadow-md group-hover:brightness-105 transition-all text-center cursor-pointer">
                    Celebrate with Team Groom
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map Directions Modal */}
      <AnimatePresence>
        {selectedMapEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FAF6F0] border-2 border-[#D4AF37] rounded-3xl max-w-lg w-full p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedMapEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#0F4C81] text-[#FAF6F0] hover:bg-[#0A2B4C]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#00A896] font-bold">
                <MapPin size={16} className="text-[#D4AF37]" />
                <span>Venue Directions</span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#0A4A40] mt-1">
                {selectedMapEvent.venueName}
              </h3>
              <p className="text-xs text-[#2D3748]/80 mt-1">{selectedMapEvent.address}</p>

              {/* Map Graphic Box */}
              <div className="my-4 h-48 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/50 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
                <MapPin size={36} className="text-[#0A4A40] animate-bounce z-10" />
                <span className="font-serif text-lg font-bold text-[#0A4A40] z-10 mt-2">
                  {selectedMapEvent.location}
                </span>
                <span className="text-xs text-[#008070] font-semibold z-10">Jammu & Bathinda</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <a
                  href={selectedMapEvent.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
