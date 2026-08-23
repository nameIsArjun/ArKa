import React, { useState, useEffect } from 'react';
import { INITIAL_GUESTBOOK } from '../data/weddingData';
import { motion, AnimatePresence } from 'framer-motion';
import { OrnamentalDivider } from './MandalaPattern';
import { Sparkles, Quote, PenTool, CheckCircle2, Trash2, X, ShieldCheck, RefreshCw } from 'lucide-react';

export interface BlessingItem {
  id: string;
  name: string;
  relation: string;
  message: string;
  date: string;
  status: 'approved' | 'pending' | 'denied';
}

interface GuestbookSectionProps {
  isAdmin?: boolean;
}

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({ isAdmin = false }) => {
  const [blessings, setBlessings] = useState<BlessingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'approved' | 'pending'>('approved');

  // Form fields
  const [guestName, setGuestName] = useState<string>('');
  const [guestRelation, setGuestRelation] = useState<string>('');
  const [guestMessage, setGuestMessage] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Fetch blessings from /api/blessings
  const fetchBlessings = async () => {
    try {
      const res = await fetch('/api/blessings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.blessings)) {
          setBlessings(data.blessings);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching blessings API:', e);
    } finally {
      setIsLoading(false);
    }

    // Fallback to initial guestbook items
    setBlessings(
      INITIAL_GUESTBOOK.map((item) => ({
        ...item,
        status: 'approved' as const,
      }))
    );
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
          relation: guestRelation.trim() || "Well Wisher",
          message: guestMessage.trim(),
        }),
      });

      if (res.ok) {
        setFormSubmitted(true);
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

  // Filter approved vs pending in exact spreadsheet order
  const pendingBlessings = blessings.filter((b) => b.status === 'pending');
  const approvedBlessings = blessings.filter((b) => b.status === 'approved');

  const displayList = isAdmin && adminTab === 'pending' ? pendingBlessings : approvedBlessings;

  return (
    <section id="blessings" className="py-16 px-4 max-w-5xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold mb-2">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>Blessings</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
          Blessings & Wishes
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2D3748] max-w-xl mx-auto font-normal">
          Heartfelt prayers, family blessings, and warm wishes for Arjun Puri & Kanishka Dhir.
        </p>

        <OrnamentalDivider className="max-w-md mx-auto my-4" />

        {/* Action Button: Submit Blessing */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center gap-2 cursor-pointer border border-[#B38728]/40"
          >
            <PenTool size={16} className="text-[#0A4A40]" />
            <span>Write a Blessing for Arjun & Kanishka</span>
          </button>
        </div>
      </div>

      {/* ADMIN MODERATION CONTROL BAR (Visible when isAdmin is true) */}
      {isAdmin && (
        <div className="mb-8 p-4 rounded-3xl bg-[#FFFDF9] border-2 border-[#D4AF37] shadow-xl max-w-3xl mx-auto">
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
              <span>Refresh Queue</span>
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

      {/* Empty State for Pending Tab */}
      {isAdmin && adminTab === 'pending' && pendingBlessings.length === 0 && (
        <div className="p-8 rounded-3xl bg-[#FFFDF9] border border-[#D4AF37]/40 text-center max-w-md mx-auto my-6 shadow-sm">
          <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2" />
          <h4 className="font-serif font-bold text-base text-[#0A4A40]">
            No Pending Blessings
          </h4>
          <p className="text-xs text-[#2D3748]/70 mt-1">
            All submitted guest blessings have been reviewed!
          </p>
        </div>
      )}

      {/* Full Width Blessings Cards Grid in exact Spreadsheet Order */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="bg-[#FFFDF9] border-2 border-[#D4AF37]/40 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all text-left flex flex-col justify-between relative group"
          >
            <div>
              {/* Pending Badge in Admin Mode */}
              {msg.status === 'pending' && (
                <div className="mb-3 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold w-fit flex items-center gap-1">
                  <span>⏳ Awaiting Approval</span>
                </div>
              )}

              {/* Header Info: Name + Relation to Bride/Groom */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#0A4A40] text-[#FFFDF9] font-serif font-extrabold text-sm flex items-center justify-center shadow-md border border-[#D4AF37] shrink-0">
                  {msg.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-base text-[#0A4A40]">
                    {msg.name}
                  </h4>
                  <span className="text-[10px] text-[#008070] uppercase font-serif font-extrabold tracking-wider block">
                    {msg.relation}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="relative bg-[#FAF6F0] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-inner">
                <Quote size={16} className="text-[#B38728] absolute top-2 right-2 opacity-30" />
                <p className="text-xs text-[#2D3748] italic font-serif leading-relaxed pr-4">
                  "{msg.message}"
                </p>
              </div>
            </div>

            {/* Date Tag & Admin Action Bar */}
            <div className="mt-4 pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
              <span className="text-[10px] text-[#8C641D] font-serif font-bold uppercase tracking-wider">
                {msg.date}
              </span>

              {/* Website Admin Quick Action Controls */}
              {isAdmin && (
                <div className="flex items-center gap-1.5">
                  {msg.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(msg.id)}
                      className="px-3 py-1 rounded-full bg-green-600 text-white text-[10px] font-bold hover:bg-green-700 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      title="Approve & Publish to Live Wall"
                    >
                      <CheckCircle2 size={12} />
                      <span>Approve</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeny(msg.id)}
                    className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                    title="Delete / Deny"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

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
                    <span>Send Your Wishes</span>
                  </div>

                  <h3 className="font-serif text-2xl font-extrabold text-[#0A4A40]">
                    Write a Blessing
                  </h3>
                  <p className="text-xs text-[#2D3748]/80 mt-1">
                    Share your love and warm wishes for Arjun Puri & Kanishka Dhir.
                  </p>

                  <form onSubmit={handleGuestSubmit} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#0A4A40] uppercase tracking-wider mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Ramesh Puri & Family"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/50 text-xs text-[#2D3748] focus:outline-none focus:border-[#0A4A40]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#0A4A40] uppercase tracking-wider mb-1">
                        Relation to Bride or Groom *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestRelation}
                        onChange={(e) => setGuestRelation(e.target.value)}
                        placeholder="e.g. Bride's Best Friend, Groom's Cousin, Mama Ji & Mami Ji..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/50 text-xs text-[#2D3748] focus:outline-none focus:border-[#0A4A40]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#0A4A40] uppercase tracking-wider mb-1">
                        Your Blessing / Wish *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={guestMessage}
                        onChange={(e) => setGuestMessage(e.target.value)}
                        placeholder="May your love grow stronger with every passing day..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/50 text-xs text-[#2D3748] focus:outline-none focus:border-[#0A4A40] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {formSubmitting ? 'Submitting...' : 'Wish them well'}
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
                      Thank You for Showering Your Blessings! ✨
                    </h4>
                    <p className="text-xs text-[#2D3748]/85 mt-2 leading-relaxed max-w-sm mx-auto font-serif">
                      Your warm wishes for <strong>Arjun & Kanishka</strong> have been received and will be displayed here soon!
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
