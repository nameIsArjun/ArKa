import React, { useState } from 'react';
import { GuestMessage } from '../types/wedding';
import { INITIAL_GUESTBOOK } from '../data/weddingData';
import { motion, AnimatePresence } from 'framer-motion';
import { OrnamentalDivider } from './MandalaPattern';
import { Sparkles, MessageSquareHeart, Send } from 'lucide-react';

interface GuestbookSectionProps {
  newBlessing?: { name: string; relation: string; message: string } | null;
}

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({ newBlessing }) => {
  const [messages, setMessages] = useState<GuestMessage[]>(INITIAL_GUESTBOOK);
  const [inputName, setInputName] = useState('');
  const [inputRelation, setInputRelation] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  // Handle new blessing submission
  const handlePostWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputMessage.trim()) return;

    const newMsg: GuestMessage = {
      id: `msg-${Date.now()}`,
      name: inputName,
      relation: inputRelation || 'Cherished Guest',
      message: inputMessage,
      date: 'Just Now',
      avatarBg: 'bg-[#0A4A40]',
    };

    setMessages([newMsg, ...messages]);
    setInputName('');
    setInputRelation('');
    setInputMessage('');
  };

  return (
    <section id="guestbook" className="py-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold mb-2">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>Warmest Wishes</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
          Virtual Blessings Wall
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2D3748] max-w-xl mx-auto font-normal">
          Leave your prayers, heartfelt advice, and warm love for Arjun & Kanishka.
        </p>

        <OrnamentalDivider className="max-w-md mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Wish Input Form */}
        <div className="lg:col-span-5 bg-[#FFFDF9] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-xl h-fit">
          <div className="flex items-center gap-2 text-xs uppercase font-serif font-bold text-[#0A4A40] tracking-wider mb-4">
            <MessageSquareHeart size={18} className="text-[#B38728]" />
            <span>Leave a Blessing</span>
          </div>

          <form onSubmit={handlePostWish} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Vikramaditya & Family"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-xs text-[#2D3748] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                Relationship to Couple
              </label>
              <input
                type="text"
                value={inputRelation}
                onChange={(e) => setInputRelation(e.target.value)}
                placeholder="e.g. Childhood Friend / Family"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-xs text-[#2D3748] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                Your Message / Blessing *
              </label>
              <textarea
                rows={4}
                required
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share your prayers or cherished memory..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-xs text-[#2D3748] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 flex items-center justify-center gap-2"
            >
              <span>Post Blessing</span>
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Message Feed Grid */}
        <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#FFFDF9] border border-[#D4AF37]/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full bg-[#0A4A40] text-[#FFFDF9] font-serif font-bold text-xs flex items-center justify-center shadow-sm border border-[#D4AF37]`}
                    >
                      {msg.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#0A4A40]">
                        {msg.name}
                      </h4>
                      <span className="text-[10px] text-[#008070] uppercase font-bold">
                        {msg.relation}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-serif">{msg.date}</span>
                </div>

                <p className="mt-3 text-xs text-[#2D3748] italic font-serif leading-relaxed pl-2 border-l-2 border-[#D4AF37]">
                  "{msg.message}"
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
