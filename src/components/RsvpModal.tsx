import React, { useState } from 'react';
import { RsvpFormData } from '../types/wedding';
import { WEDDING_EVENTS } from '../data/weddingData';
import { motion, AnimatePresence } from 'framer-motion';
import { MonogramLogo } from './MonogramLogo';
import { X, CheckCircle2, Heart, Send, ArrowRight, ArrowLeft, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (blessing: { name: string; relation: string; message: string }) => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [formData, setFormData] = useState<RsvpFormData>({
    fullName: '',
    email: '',
    phone: '',
    side: 'both',
    guestCount: 1,
    attendingEvents: ['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5'],
    dietaryPreference: 'royal-veg',
    specialRequirements: '',
    blessingMessage: '',
  });

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0A4A40', '#D4AF37', '#008070', '#F3E5AB'],
      });

      setIsSubmitted(true);

      if (onSubmitted && formData.blessingMessage.trim()) {
        onSubmitted({
          name: formData.fullName || 'Royal Guest',
          relation: formData.side === 'bride' ? "Bride's Guest" : formData.side === 'groom' ? "Groom's Guest" : 'Cherished Guest',
          message: formData.blessingMessage,
        });
      }
    }
  };

  const toggleEvent = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      attendingEvents: prev.attendingEvents.includes(eventId)
        ? prev.attendingEvents.filter((id) => id !== eventId)
        : [...prev.attendingEvents, eventId],
    }));
  };

  const handleReset = () => {
    setStep(1);
    setIsSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative max-w-xl w-full bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#F4EDE2] text-[#0A4A40] hover:bg-[#D4AF37] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {!isSubmitted ? (
            <>
              {/* Top Header */}
              <div className="text-center mb-6">
                <MonogramLogo size="sm" variant="mandala" showSubtitle={false} className="mx-auto mb-2" />
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0A4A40]">
                  Royal RSVP
                </h3>
                <p className="text-xs text-[#2D3748] mt-0.5 font-medium">
                  Arjun & Kanishka • November 24–27, 2026 • Udaipur
                </p>

                {/* 4-Step Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        step === i
                          ? 'w-8 bg-[#0A4A40]'
                          : step > i
                          ? 'w-4 bg-[#008070]'
                          : 'w-4 bg-[#D4AF37]/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleNextStep} className="space-y-5">
                {/* STEP 1: GUEST DETAILS */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-xs uppercase font-serif font-bold text-[#008070] tracking-wider mb-2">
                      Step 1 of 4: Primary Guest Details
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Maharani Sunita & Family"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-sm text-[#2D3748] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-sm text-[#2D3748] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                          Phone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-sm text-[#2D3748] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                        Whose Guest Are You?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'bride', label: "Bride's Side" },
                          { id: 'groom', label: "Groom's Side" },
                          { id: 'both', label: 'Both' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, side: s.id as 'bride' | 'groom' | 'both' })}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                              formData.side === s.id
                                ? 'bg-[#0A4A40] text-[#FFFDF9] border-[#D4AF37] font-bold'
                                : 'bg-[#FAF6F0] text-[#2D3748] border-[#D4AF37]/30'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: EVENTS & GUEST COUNT */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-xs uppercase font-serif font-bold text-[#008070] tracking-wider mb-2">
                      Step 2 of 4: Events & Party Size
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                        Total Number of Guests Attending
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              guestCount: Math.max(1, prev.guestCount - 1),
                            }))
                          }
                          className="w-10 h-10 rounded-xl bg-[#0A4A40] text-white font-bold text-lg hover:bg-[#008070]"
                        >
                          -
                        </button>
                        <span className="font-serif text-2xl font-bold text-[#0A4A40] w-12 text-center">
                          {formData.guestCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              guestCount: prev.guestCount + 1,
                            }))
                          }
                          className="w-10 h-10 rounded-xl bg-[#0A4A40] text-white font-bold text-lg hover:bg-[#008070]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                        Select Events You Will Attend
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {WEDDING_EVENTS.map((evt) => {
                          const checked = formData.attendingEvents.includes(evt.id);
                          return (
                            <div
                              key={evt.id}
                              onClick={() => toggleEvent(evt.id)}
                              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                checked
                                  ? 'bg-[#F4EDE2] border-[#D4AF37]'
                                  : 'bg-[#FAF6F0] border-[#D4AF37]/30 opacity-70'
                              }`}
                            >
                              <div className="text-left">
                                <span className="block font-serif text-sm font-bold text-[#0A4A40]">
                                  {evt.title}
                                </span>
                                <span className="block text-[10px] text-[#2D3748]">
                                  {evt.date} • {evt.time}
                                </span>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                  checked
                                    ? 'bg-[#0A4A40] border-[#D4AF37] text-white'
                                    : 'border-gray-400'
                                }`}
                              >
                                {checked && <CheckCircle2 size={14} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: MEAL PREFERENCES */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-xs uppercase font-serif font-bold text-[#008070] tracking-wider mb-2">
                      Step 3 of 4: Royal Dining Preferences
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A4A40] mb-2">
                        Preferred Cuisine / Dietary Choice
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'royal-veg', label: 'Royal Vegetarian Thali' },
                          { id: 'jain', label: 'Strict Jain Thali' },
                          { id: 'non-veg', label: 'Non-Veg Gourmet Gala' },
                          { id: 'vegan', label: 'Vegan / Plant-Based' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, dietaryPreference: m.id as any })
                            }
                            className={`p-3 rounded-xl text-left border transition-all text-xs font-semibold ${
                              formData.dietaryPreference === m.id
                                ? 'bg-[#0A4A40] text-[#FFFDF9] border-[#D4AF37] font-bold'
                                : 'bg-[#FAF6F0] text-[#2D3748] border-[#D4AF37]/30'
                            }`}
                          >
                            <Utensils size={14} className="mb-1 text-[#B38728]" />
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                        Allergies or Special Requirements
                      </label>
                      <textarea
                        rows={2}
                        value={formData.specialRequirements}
                        onChange={(e) =>
                          setFormData({ ...formData, specialRequirements: e.target.value })
                        }
                        placeholder="e.g. Nut allergies, wheelchair assistance required..."
                        className="w-full px-4 py-2 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-xs text-[#2D3748] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: BLESSING MESSAGE */}
                {step === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-xs uppercase font-serif font-bold text-[#008070] tracking-wider mb-2">
                      Step 4 of 4: Send Blessings to the Couple
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A4A40] mb-1">
                        Personal Wish or Blessing for Arjun & Kanishka
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.blessingMessage}
                        onChange={(e) =>
                          setFormData({ ...formData, blessingMessage: e.target.value })
                        }
                        placeholder="Write your heartfelt blessings to publish on their live guestbook wall..."
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-sm text-[#2D3748] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/30">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((prev) => prev - 1)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#0A4A40] text-[#0A4A40] text-xs font-bold hover:bg-[#F4EDE2]"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105"
                  >
                    <span>{step === 4 ? 'Confirm & Send Blessings' : 'Next Step'}</span>
                    {step === 4 ? <Send size={14} /> : <ArrowRight size={14} />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* SUCCESS CONFIRMATION STATE */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-[#0A4A40] text-[#D4AF37] border-2 border-[#D4AF37] shadow-md flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>

              <h3 className="font-serif text-3xl font-extrabold text-[#0A4A40]">
                RSVP Received!
              </h3>
              <p className="font-serif text-lg italic text-[#008070] mt-1 font-bold">
                Dhanyawad, {formData.fullName}!
              </p>
              <p className="text-xs text-[#2D3748] mt-3 max-w-sm mx-auto leading-relaxed">
                Your presence will illuminate our sacred celebrations in Udaipur. A confirmation pass has been saved for your records.
              </p>

              <button
                onClick={handleReset}
                className="mt-6 px-8 py-3 rounded-full bg-[#0A4A40] text-white text-xs font-serif font-bold tracking-widest uppercase shadow-lg hover:bg-[#008070] transition-all"
              >
                Close & Return to Dashboard
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
