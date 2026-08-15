import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'framer-motion';

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Web Audio Synthesizer playing pentatonic Raaga Bhoopali notes (Sa Re Ga Pa Dha)
  const startRagaSynth = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const ragaFrequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4 Raaga Bhoopali
      let step = 0;

      const playNextNote = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sitar/Shehnai timbre (rich harmonic content)
        osc.type = 'triangle';
        const freq = ragaFrequencies[step % ragaFrequencies.length];
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Pitch bend swell (classic Indian meend)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, ctx.currentTime + 0.6);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.5);

        step = (step + 1) % ragaFrequencies.length;
      };

      playNextNote();
      timerRef.current = window.setInterval(playNextNote, 1200);
    } catch {
      console.log('Audio Context not available');
    }
  };

  const stopRagaSynth = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopRagaSynth();
      setIsPlaying(false);
    } else {
      startRagaSynth();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      stopRagaSynth();
    };
  }, []);

  return (
    <button
      onClick={togglePlay}
      title={isPlaying ? 'Mute Sitar Melody' : 'Play Royal Wedding Sitar Raga'}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF9] hover:bg-[#F4EDE2] border border-[#D4AF37]/50 text-[#0A4A40] text-xs font-bold transition-all shadow-sm group"
    >
      <span className="relative flex h-2 w-2">
        {isPlaying && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008070] opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-[#008070]' : 'bg-[#D4AF37]'}`} />
      </span>

      {isPlaying ? (
        <>
          <Volume2 size={15} className="text-[#008070] animate-pulse" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-[#B38728] font-bold">Shehnai Raga</span>
        </>
      ) : (
        <>
          <VolumeX size={15} className="text-[#B38728] group-hover:text-[#0A4A40]" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-[#B38728] font-bold">Play Music</span>
        </>
      )}
    </button>
  );
};
