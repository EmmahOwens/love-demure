
import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { formatDateToString } from '../utils/dateUtils';
import { Heart } from 'lucide-react';

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center mx-2 sm:mx-4">
      <div className="neu-element w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2 transition-all duration-300 hover:shadow-lg hover:scale-105">
        <span className="text-2xl sm:text-3xl font-semibold">{value}</span>
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};

const Countdown: React.FC = () => {
  const { timeLeft, nextAnniversary } = useCountdown();
  const { days, hours, minutes, seconds, isPast, isAnniversaryDay } = timeLeft;
  
  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-center mb-6">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/30" />
        <Heart size={16} className="mx-2 text-primary/60" fill="currentColor" />
        <h2 className="text-2xl sm:text-3xl font-semibold text-center">
          {isAnniversaryDay 
            ? "Our Hearts Celebrate Today!" 
            : isPast 
              ? "Cherishing moments since our last heart dance" 
              : "Counting heartbeats until we celebrate our love"}
        </h2>
        <Heart size={16} className="mx-2 text-primary/60" fill="currentColor" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/30" />
      </div>
      
      <p className="text-center text-muted-foreground mb-8">
        {isAnniversaryDay
          ? "Today our souls dance in celebration of our endless love ❤️"
          : `${isPast ? "Our love bloomed" : "Our hearts will rejoice"} on ${formatDateToString(nextAnniversary)}`
        }
      </p>
      
      <div className="flex justify-center items-center mb-8 animate-fade-in">
        <CountdownUnit value={days} label="Days" />
        <CountdownUnit value={hours} label="Hours" />
        <CountdownUnit value={minutes} label="Minutes" />
        <CountdownUnit value={seconds} label="Seconds" />
      </div>
      
      {isAnniversaryDay && (
        <div className="neu-element p-6 text-center animate-scale-up relative overflow-hidden">
          <div className="absolute -top-4 -right-4 rotate-12">
            <Heart size={80} className="text-primary/10" fill="currentColor" />
          </div>
          <p className="text-xl font-medium text-primary relative z-10">
            May our love story continue to unfold with endless chapters of joy, passion, and beautiful memories!
          </p>
        </div>
      )}
    </div>
  );
};

export default Countdown;
