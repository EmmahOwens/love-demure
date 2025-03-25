
export const getTimeLeft = (targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isAnniversaryDay: boolean;
} => {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();
  const isPast = difference < 0;
  
  // Check if today is the anniversary
  const isAnniversaryDay = 
    now.getDate() === targetDate.getDate() && 
    now.getMonth() === targetDate.getMonth();
  
  // Calculate absolute difference for display purposes
  const absDifference = Math.abs(difference);
  
  // Calculate time units
  const days = Math.floor(absDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDifference % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, isPast, isAnniversaryDay };
};

export const getNextAnniversary = (): Date => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Create May 20th date for this year
  let anniversaryDate = new Date(currentYear, 4, 20); // Month is 0-indexed
  
  // If May 20th has already passed this year, get next year's date
  if (now > anniversaryDate) {
    anniversaryDate = new Date(currentYear + 1, 4, 20);
  }
  
  return anniversaryDate;
};

export const formatDateToString = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString(undefined, options);
};
