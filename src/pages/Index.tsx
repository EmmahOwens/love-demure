
import React from 'react';
import Layout from '../components/Layout';
import Countdown from '../components/Countdown';
import MemoryTimeline from '../components/MemoryTimeline';
import LoveNotes from '../components/LoveNotes';
import AnniversaryAnimation from '../components/AnniversaryAnimation';
import MemorySlideshow from '../components/MemorySlideshow';
import MemoryUploader from '../components/MemoryUploader';
import { useCountdown } from '../hooks/useCountdown';

const Index = () => {
  const { timeLeft } = useCountdown();
  const { isAnniversaryDay } = timeLeft;

  return (
    <Layout>
      <AnniversaryAnimation isAnniversaryDay={isAnniversaryDay} />
      
      <div className="space-y-20">
        <section className="neu-element p-6 sm:p-10">
          <Countdown />
        </section>
        
        <section className="neu-element p-6 sm:p-10">
          <MemorySlideshow />
        </section>
        
        <section className="neu-element p-6 sm:p-10">
          <MemoryUploader />
        </section>
        
        <section className="neu-element p-6 sm:p-10">
          <MemoryTimeline />
        </section>
        
        <section className="neu-element p-6 sm:p-10">
          <LoveNotes />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
