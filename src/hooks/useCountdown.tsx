
import { useState, useEffect } from 'react';
import { getTimeLeft, getNextAnniversary } from '../utils/dateUtils';

export const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(getNextAnniversary()));
  const [nextAnniversary, setNextAnniversary] = useState(getNextAnniversary());

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimeLeft = getTimeLeft(nextAnniversary);
      setTimeLeft(updatedTimeLeft);
      
      // If we've crossed over to a new day, recalculate the next anniversary
      if (updatedTimeLeft.days === 0 && updatedTimeLeft.hours === 0 && 
          updatedTimeLeft.minutes === 0 && updatedTimeLeft.seconds === 0) {
        const newNextAnniversary = getNextAnniversary();
        setNextAnniversary(newNextAnniversary);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextAnniversary]);

  return { timeLeft, nextAnniversary };
};
