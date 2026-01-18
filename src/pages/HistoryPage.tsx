import React, { useEffect } from 'react';
import { VisionSection } from './history/VisionSection';
import { NarrativeSection } from './history/NarrativeSection';
import { EstablishmentSection } from './history/EstablishmentSection';
import { EvolutionCarousel } from './history/EvolutionCarousel';
import { SEO } from '@/components/SEO';
import Lenis from 'lenis';

/**
 * History Page Animation Stack:
 * 1. GSAP (ScrollTrigger for pinning and parallax)
 * 2. Framer Motion (Layout transitions, spring physics for carousel)
 * 3. React Three Fiber (3D Canvas management)
 * 4. React Three Drei (3D helpers: Stars, Text, Camera)
 * 5. Maath (Smooth animation damping for 3D camera rig)
 * 6. React Use Gesture (Draggable interactions for the carousel)
 * 7. Zustand (State management for cross-component animation synchronization)
 * 8. Lenis (High-performance smooth scrolling)
 * 9. Three.js (Core WebGL engine)
 */

const HistoryPage: React.FC = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="w-full relative">
      <SEO
        title="History - University of Ibadan Students' Union"
        description="The evolution of student unionism from global origins to the University of Ibadan."
      />
      <VisionSection />
      <NarrativeSection />
      <EstablishmentSection />
      <EvolutionCarousel />
    </div>
  );
};

export default HistoryPage;
