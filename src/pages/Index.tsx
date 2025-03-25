
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

const Index = () => {
  const { timeLeft } = useCountdown();
  const { isAnniversaryDay } = timeLeft;

  return (
    <Layout>
      <AnniversaryAnimation isAnniversaryDay={isAnniversaryDay} />
      
      <div className="space-y-16">
        <ScrollRevealSection direction="up" delay={0}>
          <section className="neu-element p-6 sm:p-10">
            <Countdown />
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={100}>
          <section className="neu-element p-6 sm:p-10">
            <MemorySlideshow />
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={200}>
          <section className="neu-element p-6 sm:p-10">
            <MemoryUploader />
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={300}>
          <section className="neu-element p-6 sm:p-10">
            <MemoryTimeline />
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={400}>
          <section className="neu-element p-6 sm:p-10">
            <LoveNotes />
          </section>
        </ScrollRevealSection>
      </div>
    </Layout>
  );
};

export default Index;
