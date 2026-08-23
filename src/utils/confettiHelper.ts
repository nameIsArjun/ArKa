import confetti from 'canvas-confetti';

/**
 * Fires a royal Indian wedding floral petal and golden sparkle celebratory burst.
 * Uses marigold saffron, rose pink/ruby, and golden foil confetti particles.
 */
export function triggerWeddingPetalBurst() {
  if (typeof window === 'undefined') return;

  const count = 70;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // 1. Marigold & Saffron Petals
  fire(0.25, {
    spread: 30,
    startVelocity: 50,
    colors: ['#FF9933', '#FFD700', '#D4AF37'],
    shapes: ['circle'],
    scalar: 1.2,
  });

  // 2. Rose Pink & Ruby Red Petals
  fire(0.2, {
    spread: 60,
    colors: ['#E91E63', '#C2185B', '#FF4081', '#9C27B0'],
    shapes: ['circle'],
    scalar: 1.3,
  });

  // 3. Golden Sparkles & Shimmer
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.9,
    colors: ['#F3E5AB', '#D4AF37', '#FFD700', '#FFF8E7'],
  });

  // 4. Floating Soft Petals
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#FF80AB', '#FFD54F', '#D4AF37'],
    shapes: ['circle'],
    scalar: 1.4,
  });

  // 5. Dual side-cannons for grand royal flourish
  setTimeout(() => {
    confetti({
      particleCount: 35,
      angle: 60,
      spread: 65,
      origin: { x: 0.05, y: 0.75 },
      colors: ['#D4AF37', '#FF9933', '#E91E63', '#FFD700'],
      zIndex: 99999,
    });
    confetti({
      particleCount: 35,
      angle: 120,
      spread: 65,
      origin: { x: 0.95, y: 0.75 },
      colors: ['#D4AF37', '#FF9933', '#E91E63', '#FFD700'],
      zIndex: 99999,
    });
  }, 180);
}
