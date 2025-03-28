
import React, { Suspense } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the memory components for better performance
const LazyMemorySlideshow = React.lazy(() => import('../components/MemorySlideshow'));
const LazyMemoryUploader = React.lazy(() => import('../components/MemoryUploader'));

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
            <Suspense fallback={
              <div className="w-full max-w-4xl mx-auto py-6 px-4">
                <h2 className="text-3xl font-semibold text-center mb-6">Memory Slideshow</h2>
                <div className="neu-element p-8 flex flex-col space-y-4 min-h-[300px]">
                  <Skeleton className="h-[220px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>
            }>
              <LazyMemorySlideshow />
            </Suspense>
          </section>
        </ScrollRevealSection>
        
        <ScrollRevealSection direction="up" delay={200}>
          <section className="neu-element p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <Suspense fallback={
              <div className="w-full max-w-4xl mx-auto py-6 px-4">
                <h2 className="text-3xl font-semibold text-center mb-6">Upload a Memory</h2>
                <div className="neu-element-inset p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-[220px] w-full rounded-xl" />
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-20 w-full rounded-md" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            }>
              <LazyMemoryUploader />
            </Suspense>
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
