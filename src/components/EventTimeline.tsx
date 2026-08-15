import React, { useState } from 'react';
import { ActiveTab, EventItem } from '../types/wedding';
import { WEDDING_EVENTS } from '../data/weddingData';
import { motion, AnimatePresence } from 'framer-motion';
import { OrnamentalDivider } from './MandalaPattern';
import { Clock, MapPin, Sparkles, ExternalLink, Download, Shirt, X } from 'lucide-react';

interface EventTimelineProps {
  activeTab: ActiveTab;
  onSelectRsvpEvent?: (eventId?: string) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ activeTab, onSelectRsvpEvent }) => {
  const [selectedMapEvent, setSelectedMapEvent] = useState<EventItem | null>(null);

  // Filter events strictly based on active tab
  const filteredEvents = WEDDING_EVENTS.filter((evt) => {
    if (activeTab === 'bride') return evt.category === 'bride';
    if (activeTab === 'groom') return evt.category === 'groom';
    if (activeTab === 'together') return evt.category === 'together';
    return true;
  });

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
    <section id="itinerary" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-semibold mb-2">
          <Sparkles size={14} className="text-[#B38728]" />
          <span>Royal Itinerary</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
          Celebrations & Schedule
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2D3748] max-w-xl mx-auto font-normal">
          Explore the sacred rituals, royal feasting, and celebratory galas awaiting our cherished guests in Udaipur.
        </p>

        <OrnamentalDivider className="max-w-md mx-auto" />
      </div>

      {/* Timeline Grid */}
      <div className="space-y-8 relative">
        {/* Center Guide Line for Desktop */}
        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20 -translate-x-1/2" />

        <AnimatePresence mode="popLayout">
          {filteredEvents.map((evt, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={evt.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative flex flex-col lg:flex-row items-center ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Center Badge Node */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-[#FFFDF9] border-2 border-[#D4AF37] shadow-md items-center justify-center text-[#0A4A40] font-serif font-bold text-xs">
                  {idx + 1}
                </div>

                {/* Content Card */}
                <div className="w-full lg:w-[calc(50%-2rem)] bg-[#FFFDF9] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-xl hover:border-[#D4AF37] transition-all group">
                  {/* Event Header Image */}
                  <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 border border-[#D4AF37]/30">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A4A40]/90 via-[#0A4A40]/30 to-transparent" />

                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md border border-[#D4AF37] text-[#0A4A40] text-xs font-serif font-bold shadow-sm">
                      {evt.date}
                    </div>

                    {/* Title in Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <span className="text-[10px] uppercase tracking-widest text-[#F3E5AB] font-bold">
                        {evt.subtitle}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-[#FFFDF9]">
                        {evt.title}
                      </h3>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0A4A40]">
                      <Clock size={15} className="text-[#B38728] shrink-0" />
                      <span>{evt.time}</span>
                    </div>

                    <div className="flex items-start gap-2 text-xs font-medium text-[#2D3748]">
                      <MapPin size={15} className="text-[#008070] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0A4A40]">{evt.location}</span>
                        <span className="block text-[11px] text-[#2D3748]/70">{evt.venueName}</span>
                      </div>
                    </div>

                    {/* Dress Code Box */}
                    <div className="p-3 rounded-xl bg-[#F4EDE2]/70 border border-[#D4AF37]/30 flex items-start gap-2.5">
                      <Shirt size={16} className="text-[#B38728] shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#0A4A40]">
                            Dress Code: {evt.dressCode}
                          </span>
                          {/* Color Chips */}
                          <div className="flex items-center gap-1">
                            {evt.dressCodeColors.map((color) => (
                              <span
                                key={color}
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-[#2D3748]/80 mt-0.5">
                          {evt.dressCodeDescription}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#2D3748] leading-relaxed pt-1">
                      {evt.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedMapEvent(evt)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0A4A40] hover:text-[#008070] transition-colors"
                    >
                      <MapPin size={14} className="text-[#B38728]" />
                      <span>View Venue Map</span>
                    </button>

                    <button
                      onClick={() => downloadIcs(evt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4EDE2] hover:bg-[#D4AF37] text-[#0A4A40] hover:text-white border border-[#D4AF37]/40 text-xs font-bold transition-all shadow-sm"
                    >
                      <Download size={13} />
                      <span>Add to Calendar</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Map Modal */}
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
                <span className="text-xs text-[#008070] font-semibold z-10">Jammu, J&K, India</span>
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
