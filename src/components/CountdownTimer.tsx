import React, { useState, useEffect } from 'react';
import { WEDDING_DETAILS } from '../data/weddingData';

export const CountdownTimer: React.FC = () => {
  const targetDate = new Date(`${WEDDING_DETAILS.targetDate}+05:30`).getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 my-6">
      {timeUnits.map((unit, idx) => (
        <div key={unit.label} className="flex items-center gap-3 sm:gap-6">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[#FFFDF9] border border-[#D4AF37]/60 shadow-[0_4px_20px_rgba(212,175,55,0.2)] flex items-center justify-center backdrop-blur-md">
              <span className="font-serif text-xl sm:text-3xl font-extrabold text-[#0A4A40]">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className="mt-1.5 font-serif text-[10px] sm:text-xs tracking-widest text-[#B38728] uppercase font-bold">
              {unit.label}
            </span>
          </div>
          {idx < timeUnits.length - 1 && (
            <span className="font-serif text-xl sm:text-2xl text-[#D4AF37] -mt-5 font-bold">:</span>
          )}
        </div>
      ))}
    </div>
  );
};
