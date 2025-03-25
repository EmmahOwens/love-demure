
import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { formatDateToString } from '../utils/dateUtils';

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center mx-2 sm:mx-4">
      <div className="neu-element w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
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
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6">
        {isAnniversaryDay 
          ? "Happy Anniversary Day!" 
          : isPast 
            ? "Time since our last anniversary" 
            : "Countdown to our anniversary"}
      </h2>
      
      <p className="text-center text-muted-foreground mb-8">
        {isAnniversaryDay
          ? "Today is our special day! ❤️"
          : `${isPast ? "Our last" : "Our next"} anniversary is on ${formatDateToString(nextAnniversary)}`
        }
      </p>
      
      <div className="flex justify-center items-center mb-8 animate-fade-in">
        <CountdownUnit value={days} label="Days" />
        <CountdownUnit value={hours} label="Hours" />
        <CountdownUnit value={minutes} label="Minutes" />
        <CountdownUnit value={seconds} label="Seconds" />
      </div>
      
      {isAnniversaryDay && (
        <div className="neu-element p-6 text-center animate-scale-up">
          <p className="text-xl font-medium text-primary">
            Wishing us a day filled with love, joy, and beautiful memories!
          </p>
        </div>
      )}
    </div>
  );
};

export default Countdown;
