
import React from 'react';
import Layout from '../components/Layout';
import Countdown from '../components/Countdown';
import MemoryTimeline from '../components/MemoryTimeline';
import LoveNotes from '../components/LoveNotes';
import AnniversaryAnimation from '../components/AnniversaryAnimation';
import MemorySlideshow from '../components/MemorySlideshow';
import MemoryUploader from '../components/MemoryUploader';
import { useCountdown } from '../hooks/useCountdown';
import ScrollRevealSection from '../components/ScrollRevealSection';
import FloatingHearts from '../components/FloatingHearts';

const Index = () => {
  const { timeLeft } = useCountdown();
  const { isAnniversaryDay } = timeLeft;

  return (
    <Layout>
      <AnniversaryAnimation isAnniversaryDay={isAnniversaryDay} />
      <FloatingHearts />
      
      <div className="space-y-20">
        <ScrollRevealSection direction="up" delay={0}>
          <section className="neu-element p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <Countdown />
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={100}>
          <section className="neu-element p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <MemorySlideshow />
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={200}>
          <section className="neu-element p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <MemoryUploader />
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={300}>
          <section className="neu-element p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <MemoryTimeline />
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={400}>
          <section className="neu-element p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <LoveNotes />
          </section>
        </ScrollRevealSection>
      </div>
    </Layout>
  );
};

export default Index;
