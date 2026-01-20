import React, { useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { useHistoryStore } from './store';
import { ChevronRight, Landmark, Shield, Gavel, Scale, Scroll, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const eras = [
    { id: 1, year: '1948', title: 'Foundation', desc: 'Establishment of UCI', icon: Landmark, color: 'bg-emerald-700' },
    { id: 2, year: '1957', title: 'Independence', desc: 'Student Activism Begins', icon: Shield, color: 'bg-cyan-700' },
    { id: 3, year: '1960', title: 'Republic', desc: 'First Indigenous Union', icon: Scroll, color: 'bg-blue-700' },
    { id: 4, year: '1978', title: 'Ali Must Go', desc: 'Nationwide Protests', icon: Users, color: 'bg-orange-700' },
    { id: 5, year: '1990', title: 'Resistance', desc: 'Military Era Struggles', icon: Gavel, color: 'bg-red-700' },
    { id: 6, year: '2000s', title: 'Rebirth', desc: 'Modern Unionism', icon: Scale, color: 'bg-purple-700' },
];

const ITEM_ANGLE = 360 / eras.length;

export const EvolutionCarousel: React.FC = () => {
  const { activeEraIndex, setActiveEraIndex } = useHistoryStore();
  const [isDragging, setIsDragging] = useState(false);

  // Motion value for rotation
  const rotation = useMotionValue(0);
  const springRotation = useSpring(rotation, { damping: 20, stiffness: 100 });

  const bind = useDrag(({ offset: [x], active, movement: [mx], direction: [dx], velocity: [vx] }) => {
    setIsDragging(active);

    // Calculate rotation based on drag
    // This is simplified; usually we map x pixels to degrees
    const currentRotation = -activeEraIndex * ITEM_ANGLE;
    const dragOffset = mx / 2; // sensitivity

    if (active) {
        rotation.set(currentRotation + dragOffset);
    } else {
        // Snap to nearest
        const finalRotation = currentRotation + dragOffset + (vx * dx * 50); // Momentum
        const snapIndex = Math.round(-finalRotation / ITEM_ANGLE);

        // Clamp/Wrap index? Let's clamp for history (linear time) or wrap for cyclical
        // History is linear usually, but layout is circular. Let's wrap.
        const normalizedIndex = ((snapIndex % eras.length) + eras.length) % eras.length;

        setActiveEraIndex(normalizedIndex);
        rotation.set(-normalizedIndex * ITEM_ANGLE); // Snap
    }
  });

  // Update rotation when store changes (e.g. if controlled externally)
  React.useEffect(() => {
    if (!isDragging) {
        rotation.set(-activeEraIndex * ITEM_ANGLE);
    }
  }, [activeEraIndex, isDragging, rotation]);

  return (
    <section className="h-screen w-full relative bg-ui-dark text-white overflow-hidden flex flex-col items-center justify-between py-20">

      {/* Center Content - Updates based on active index */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none mix-blend-difference">
         <h2 className="text-6xl md:text-8xl font-serif font-bold mb-2">
            {eras[activeEraIndex].year}
         </h2>
         <p className="text-2xl font-sans uppercase tracking-widest text-nobel-gold">
            {eras[activeEraIndex].title}
         </p>
      </div>

      {/* The Wheel */}
      {/* We shift it up so the bottom half is visible, like the reference?
          The reference (opl-master-1) has the TOP half visible.
          "Turn insurance spend..." text is below the wheel? No, inside.
          Let's replicate: Large circle at top, cards at bottom.
      */}
      <div
        className="absolute top-[-50vh] left-1/2 -translate-x-1/2 w-[150vh] h-[150vh] rounded-full border-[2rem] border-ui-blue/20 cursor-grab active:cursor-grabbing touch-none"
        {...bind()}
        style={{ touchAction: 'none' }}
      >
        <motion.div
            className="w-full h-full relative rounded-full"
            style={{ rotate: springRotation }}
        >
            {eras.map((era, i) => {
                const angle = i * ITEM_ANGLE;
                return (
                    <div
                        key={era.id}
                        className="absolute top-0 left-1/2 w-48 h-[50%] -translate-x-1/2 origin-bottom pt-12"
                        style={{ transform: `rotate(${angle}deg)` }}
                    >
                        <div className={cn(
                            "w-full h-64 rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-300",
                            era.color,
                            activeEraIndex === i ? "scale-110 shadow-2xl ring-4 ring-nobel-gold" : "opacity-50 scale-90"
                        )}>
                            <era.icon size={48} className="mb-4 text-white" />
                            <span className="text-xl font-bold">{era.year}</span>
                        </div>
                    </div>
                );
            })}
        </motion.div>
      </div>

      {/* Bottom Cards Area */}
      <div className="w-full max-w-6xl z-10 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mt-auto">
         <div className="bg-nobel-cream text-ui-dark p-6 rounded-lg shadow-lg">
            <h4 className="font-bold mb-2 flex items-center"><Landmark className="mr-2"/> PRE-NATAL EXPENSES</h4>
            <p className="text-sm opacity-80">{eras[activeEraIndex].desc}</p>
         </div>
         <div className="bg-nobel-cream text-ui-dark p-6 rounded-lg shadow-lg">
            <h4 className="font-bold mb-2 flex items-center"><Shield className="mr-2"/> SATISFACTION SCORES</h4>
            <p className="text-sm opacity-80">Highest ever team satisfaction reported during the {eras[activeEraIndex].title} era.</p>
         </div>
         <div className="bg-nobel-cream text-ui-dark p-6 rounded-lg shadow-lg">
            <h4 className="font-bold mb-2 flex items-center"><Users className="mr-2"/> THOUSANDS OF STUDENTS</h4>
            <p className="text-sm opacity-80">Over 20,000 students united under the banner of Aluta.</p>
         </div>
      </div>
    </section>
  );
};
