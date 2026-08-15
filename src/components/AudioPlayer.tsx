import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // High-quality soothing background wedding flute & sitar melody URL
  const SOOTHING_WEDDING_MUSIC_URL =
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=indian-sitar-ambient-112349.mp3';

  // Fallback Web Audio Synthesizer (Raaga Bhoopali) if MP3 fails to load
  const startFallbackSynth = () => {
    try {
      if (audioCtxRef.current) return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const ragaFrequencies = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
      let step = 0;

      const playNextNote = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const freq = ragaFrequencies[step % ragaFrequencies.length];
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.015, ctx.currentTime + 0.8);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.9);

        step = (step + 1) % ragaFrequencies.length;
      };

      playNextNote();
      timerRef.current = window.setInterval(playNextNote, 1400);
    } catch {
      console.log('Audio Context fallback unavaiable');
    }
  };

  const stopFallbackSynth = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const playMusic = () => {
    setShowTooltip(false);
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          startFallbackSynth();
          setIsPlaying(true);
        });
    } else {
      startFallbackSynth();
      setIsPlaying(true);
    }
  };

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopFallbackSynth();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  useEffect(() => {
    const audio = new Audio(SOOTHING_WEDDING_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.5; // Mid Volume
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopFallbackSynth();
    };
  }, []);

  return (
    <div className="relative inline-flex items-center">
      {/* Tooltip Callout Pill */}
      <AnimatePresence>
        {!isPlaying && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-full mt-2.5 z-50 whitespace-nowrap"
          >
            {/* Arrow Pointer */}
            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#FFFDF9] border-t border-l border-[#D4AF37]/60 transform rotate-45" />

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FFFDF9] border border-[#D4AF37] shadow-xl text-left backdrop-blur-md">
              <Sparkles size={14} className="text-[#D4AF37] animate-bounce shrink-0" />
              <button
                onClick={playMusic}
                className="text-xs font-serif font-bold text-[#0A4A40] hover:text-[#B38728] transition-colors cursor-pointer"
              >
                Turn on to enjoy soothing background music! 🎵
              </button>
              <button
                onClick={() => setShowTooltip(false)}
                className="p-0.5 rounded-full text-[#B38728] hover:bg-[#FAF6F0] transition-colors ml-1"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Music Toggle Button */}
      <button
        onClick={togglePlay}
        title={isPlaying ? 'Mute Background Music' : 'Play Soothing Wedding Music'}
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9] hover:bg-[#F4EDE2] border border-[#D4AF37]/50 text-[#0A4A40] text-xs font-bold transition-all shadow-sm group select-none cursor-pointer"
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008070] opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isPlaying ? 'bg-[#008070]' : 'bg-[#D4AF37]'
            }`}
          />
        </span>

        {isPlaying ? (
          <>
            <Volume2 size={14} className="text-[#008070] animate-pulse" />
            <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-[#008070] font-extrabold">
              Playing Music
            </span>
          </>
        ) : (
          <>
            <VolumeX size={14} className="text-[#B38728] group-hover:text-[#0A4A40]" />
            <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-[#B38728] font-bold">
              Music Off
            </span>
          </>
        )}
      </button>
    </div>
  );
};
