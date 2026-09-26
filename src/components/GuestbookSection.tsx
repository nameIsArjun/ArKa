import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrnamentalDivider, CornerBorder } from './MandalaPattern';
import {
  Sparkles,
  Quote,
  PenTool,
  CheckCircle2,
  Trash2,
  X,
  ShieldCheck,
  RefreshCw,
  Crown,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Pin
} from 'lucide-react';
import { triggerWeddingPetalBurst } from '../utils/confettiHelper';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

export interface BlessingItem {
  id: string;
  name: string;
  relation: string;
  message: string;
  date: string;
  status: 'approved' | 'pending' | 'denied';
  isPinned?: boolean;
}

interface GuestbookSectionProps {
  isAdmin?: boolean;
}

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({ isAdmin = false }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [blessings, setBlessings] = useState<BlessingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'approved' | 'pending'>('approved');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalSlides, setTotalSlides] = useState<number>(0);

  // Form fields
  const [guestName, setGuestName] = useState<string>('');
  const [guestRelation, setGuestRelation] = useState<string>('');
  const [guestMessage, setGuestMessage] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Fetch blessings live from Google Sheets API
  const fetchBlessings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/blessings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.blessings)) {
          setBlessings(data.blessings);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching blessings from Google Sheets API:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlessings();
  }, []);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMessage.trim()) return;

    setFormSubmitting(true);
    try {
      const res = await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          name: guestName.trim(),
          relation: guestRelation.trim() || 'Well Wisher',
          message: guestMessage.trim(),
        }),
      });

      if (res.ok) {
        setFormSubmitted(true);
        triggerWeddingPetalBurst();
        fetchBlessings();
      }
    } catch (e) {
      console.error('Error submitting blessing:', e);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCloseSubmitModal = () => {
    setIsSubmitModalOpen(false);
    setFormSubmitted(false);
    setGuestName('');
    setGuestRelation('');
    setGuestMessage('');
  };

  // Website Admin Actions
  const handleApprove = async (id: string) => {
    setBlessings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'approved' as const } : b)));
    try {
      await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id }),
      });
      fetchBlessings();
    } catch (e) {
      console.error('Error approving blessing:', e);
    }
  };

  const handleDeny = async (id: string) => {
    setBlessings((prev) => prev.filter((b) => b.id !== id));
    try {
      await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deny', id }),
      });
      fetchBlessings();
    } catch (e) {
      console.error('Error denying blessing:', e);
    }
  };

  const handleTogglePin = async (id: string) => {
    setBlessings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPinned: !b.isPinned } : b))
    );
    try {
      await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin', id }),
      });
      fetchBlessings();
    } catch (e) {
      console.error('Error pinning blessing:', e);
    }
  };

  // Filter approved vs pending
  const pendingBlessings = blessings.filter((b) => b.status === 'pending');
  const approvedBlessings = blessings.filter((b) => b.status === 'approved');

  const displayList = isAdmin && adminTab === 'pending' ? pendingBlessings : approvedBlessings;

  // Sort pinned blessings to the front
  const sortedList = [...displayList].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <section id="blessings" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto relative select-none">
      {/* Background Subtle Warm Floral Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-[#D4AF37]/10 via-[#008070]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold mb-2">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>Keepsake Registry</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
          Words of Love &amp; Blessings
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#2D3748] max-w-2xl mx-auto font-normal leading-relaxed">
          A treasured collection of heartfelt prayers, cherished memories, and warm wedding wishes penned for Arjun &amp; Kanishka as they begin their forever.
        </p>

        <OrnamentalDivider className="max-w-md mx-auto my-5" />

        {/* Action Button: Send a Note */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-widest shadow-xl hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-[#B38728]/40 group"
          >
            <PenTool size={15} className="text-[#0A4A40] group-hover:rotate-12 transition-transform" />
            <span>Send a Blessing for the Couple 💌</span>
          </button>
        </div>
      </div>

      {/* ADMIN MODERATION CONTROL BAR */}
      {isAdmin && (
        <div className="mb-10 p-5 rounded-3xl bg-[#FFFDF9] border-2 border-[#D4AF37] shadow-xl max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#008070]" />
              <span className="font-serif font-extrabold text-sm text-[#0A4A40] uppercase tracking-wider">
                👑 Website Admin Approval Portal
              </span>
            </div>
            <button
              onClick={fetchBlessings}
              className="text-[11px] font-bold text-[#8C641D] bg-[#FAF6F0] hover:bg-[#D4AF37]/20 px-3 py-1 rounded-full border border-[#D4AF37]/40 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Refresh Live Data</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdminTab('approved')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${adminTab === 'approved'
                ? 'bg-[#0A4A40] text-[#FFFDF9] shadow-md'
                : 'bg-[#FAF6F0] text-[#0A4A40] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30'
                }`}
            >
              <span>Published Wall ({approvedBlessings.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('pending')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${adminTab === 'pending'
                ? 'bg-[#B38728] text-white shadow-md'
                : 'bg-[#FAF6F0] text-[#0A4A40] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30'
                }`}
            >
              <span>Pending Review Queue ({pendingBlessings.length})</span>
              {pendingBlessings.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingBlessings.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ROYAL KEEPSAKE CARDS SHOWCASE */}
      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw size={26} className="animate-spin text-[#D4AF37] mx-auto mb-3" />
          <p className="text-xs font-serif font-bold uppercase tracking-wider text-[#8C641D]">
            Loading heartfelt blessings...
          </p>
        </div>
      ) : sortedList.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#FFFDF9] border-2 border-[#D4AF37]/40 text-center max-w-md mx-auto my-6 shadow-sm">
          <Quote size={36} className="text-[#D4AF37] mx-auto mb-3 opacity-60" />
          <h4 className="font-serif font-bold text-lg text-[#0A4A40]">No Blessings Yet</h4>
          <p className="text-xs text-[#2D3748]/70 mt-1">
            Be the very first to share your warm wishes for Arjun &amp; Kanishka!
          </p>
        </div>
      ) : (
        <div className="relative w-full">
          {/* SWIPER CONTAINER (Auto-scrolls every 30 seconds + Manual Controls + Pauses on Hover) */}
          <Swiper
            modules={[Autoplay, Keyboard, Navigation, Pagination]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setTotalSlides(sortedList.length);
            }}
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.realIndex);
            }}
            loop={sortedList.length > 3}
            grabCursor={true}
            keyboard={{ enabled: true }}
            autoplay={{
              delay: 30000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            spaceBetween={20}
            slidesPerView={1.08}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 28,
              },
            }}
            className="w-full !py-4 !px-1"
          >
            {sortedList.map((msg) => {
              const isPinned = !!msg.isPinned;
              const formattedMessage = msg.message.replace(/^["“”']+|["“”']+$/g, '').trim();

              return (
                <SwiperSlide key={msg.id} className="h-auto pb-3">
                  <div
                    className={`h-full min-h-[300px] sm:min-h-[275px] relative bg-[#FFFDF9] rounded-3xl p-5 sm:p-6 text-left flex flex-col justify-between transition-all duration-300 ${isPinned
                      ? 'border-2 border-[#D4AF37] shadow-[0_12px_32px_-8px_rgba(212,175,55,0.3)] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FFFDF9]'
                      : 'border-2 border-[#D4AF37]/35 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.18)] hover:border-[#D4AF37] hover:shadow-[0_16px_36px_-8px_rgba(212,175,55,0.28)]'
                      }`}
                  >
                    {/* Delicate Royal Corner Filigree */}
                    <CornerBorder position="top-left" />
                    <CornerBorder position="top-right" />

                    <div className="flex-1 flex flex-col">
                      {/* Top Header: Elder Crown Badge or Pinned Ribbon */}
                      {isPinned && (
                        <div className="mb-2.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-[#0A4A40] border border-[#B38728] shadow-xs flex items-center gap-1 text-[10px] font-serif font-extrabold tracking-wider uppercase w-fit">
                          <Crown size={11} className="text-[#0A4A40]" />
                          <span>Elder Blessing</span>
                        </div>
                      )}

                      {/* Author Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0A4A40] to-[#008070] text-[#FFFDF9] font-serif font-extrabold text-sm flex items-center justify-center shadow-md border border-[#D4AF37] shrink-0">
                          {msg.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-extrabold text-sm sm:text-base text-[#0A4A40] leading-snug truncate">
                            {msg.name}
                          </h4>
                          <span className="text-[10px] sm:text-[11px] text-[#008070] uppercase font-serif font-extrabold tracking-wider block truncate mt-0.5">
                            {msg.relation}
                          </span>
                        </div>
                      </div>

                      {/* Calligraphy Message Body (Contained and scrollable for long wishes) */}
                      <div className="relative bg-[#FAF6F0]/90 p-3.5 sm:p-4 rounded-2xl border border-[#D4AF37]/30 shadow-inner flex-1 min-h-[100px] sm:min-h-[110px] max-h-[190px] overflow-y-auto">
                        <Quote size={20} className="text-[#B38728] absolute top-2 right-2 opacity-25" />
                        <p className="font-serif text-xs sm:text-sm text-[#2D3748] italic leading-relaxed pr-3 whitespace-pre-line break-words">
                          &ldquo;{formattedMessage}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Footer: Date Tag & Interactive Petal / Admin Controls */}
                    <div className="mt-5 pt-3 border-t border-[#D4AF37]/25 flex items-center justify-between">
                      <span className="text-[11px] text-[#8C641D] font-serif font-bold tracking-wider">
                        {msg.date}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Shower Petals Mini Action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerWeddingPetalBurst();
                          }}
                          className="p-1.5 rounded-full bg-[#FAF6F0] text-[#B38728] hover:bg-[#D4AF37] hover:text-white transition-all cursor-pointer border border-[#D4AF37]/40 shadow-2xs"
                          title="Shower rose petals on this wish"
                        >
                          <Flower2 size={13} />
                        </button>

                        {/* Website Admin Controls */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(msg.id);
                              }}
                              className={`p-1.5 rounded-full transition-all cursor-pointer ${isPinned
                                ? 'bg-[#D4AF37] text-white shadow-xs'
                                : 'bg-[#FAF6F0] text-[#8C641D] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40'
                                }`}
                              title={isPinned ? 'Unpin' : 'Pin to Front'}
                            >
                              <Pin size={11} />
                            </button>

                            {msg.status === 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(msg.id);
                                }}
                                className="px-2.5 py-1 rounded-full bg-green-600 text-white text-[10px] font-bold hover:bg-green-700 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                title="Approve"
                              >
                                <CheckCircle2 size={11} />
                                <span>Approve</span>
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeny(msg.id);
                              }}
                              className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer border border-red-200"
                              title="Delete"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}

      {/* GUEST BLESSING SUBMISSION MODAL */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl text-left my-auto"
            >
              <button
                onClick={handleCloseSubmitModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF6F0] text-[#0A4A40] hover:bg-[#D4AF37] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {!formSubmitted ? (
                <>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#008070] font-extrabold mb-1">
                    <PenTool size={15} className="text-[#B38728]" />
                    <span>Send Your Love</span>
                  </div>

                  <h3 className="font-serif text-2xl font-extrabold text-[#0A4A40]">
                    Send Love to Arjun &amp; Kanishka
                  </h3>
                  <p className="text-xs text-[#2D3748]/80 mt-1">
                    Whether it's a blessing, marriage advice, or a sweet memory, we would love to read your note!
                  </p>

                  <form onSubmit={handleGuestSubmit} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#0A4A40] uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Ramesh Uncle & Family"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/50 text-xs text-[#2D3748] focus:outline-none focus:border-[#0A4A40]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#0A4A40] uppercase tracking-wider mb-1">
                        How do you know the couple? (e.g. Groom's Cousin, College Friend) *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestRelation}
                        onChange={(e) => setGuestRelation(e.target.value)}
                        placeholder="e.g. Bride's Best Friend, Groom's Cousin, Mama Ji..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/50 text-xs text-[#2D3748] focus:outline-none focus:border-[#0A4A40]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#0A4A40] uppercase tracking-wider mb-1">
                        Your Note or Blessing *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={guestMessage}
                        onChange={(e) => setGuestMessage(e.target.value)}
                        placeholder="Share your blessing, favorite memory, or sweet advice for Arjun & Kanishka..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/50 text-xs text-[#2D3748] focus:outline-none focus:border-[#0A4A40] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {formSubmitting ? 'Sending...' : 'Send With Love & Blessings 💌'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-400 text-green-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={32} />
                  </div>

                  <div>
                    <h4 className="font-serif text-xl font-extrabold text-[#0A4A40]">
                      Thank you for the love! ✨
                    </h4>
                    <p className="text-xs text-[#2D3748]/85 mt-2 leading-relaxed max-w-sm mx-auto font-serif">
                      Your sweet words mean the world to Arjun &amp; Kanishka. Your message has been received with love!
                    </p>
                  </div>

                  <button
                    onClick={handleCloseSubmitModal}
                    className="mt-2 py-2.5 px-6 rounded-full bg-[#0A4A40] text-[#FFFDF9] font-serif font-bold text-xs hover:bg-[#008070] transition-all shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
