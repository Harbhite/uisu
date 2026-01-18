import { Suspense, useEffect, useRef } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';

// Components
import { HistoryScene } from "@/components/history/HistoryScene";
import { GlobalOrigins } from "@/components/history/GlobalOrigins";
import { AfricanContext } from "@/components/history/AfricanContext";
import { NigerianEvolution } from "@/components/history/NigerianEvolution";
import { UISUEras } from "@/components/history/UISUEras";
import { DecryptionText } from "@/components/history/DecryptionText";
import { ArrowDown } from 'lucide-react';

const HistoryPage = () => {
  return (
    <div className="bg-black min-h-screen text-slate-100 font-sans selection:bg-nobel-gold selection:text-black w-full overflow-x-hidden">
      <SEO
        title="The Chronicle | UISU"
        description="A journey through time: The evolution of student activism from Bologna to Ibadan."
        image="/screenshots/history.png"
      />

      <Navbar isMenuOpen={false} setIsMenuOpen={() => {}} user={null} handleLogout={() => {}} />

      {/* GLOBAL 3D SCENE BACKGROUND */}
      <div className="fixed inset-0 z-0">
         <Canvas gl={{ antialias: false, stencil: false, depth: true }} dpr={[1, 1.5]}>
            <Suspense fallback={null}>
                <HistoryScene />
            </Suspense>
         </Canvas>
      </div>

      <Loader />

      {/* Global Noise Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url('/noise.svg')` }}></div>

      <main className="relative z-10 pointer-events-none">
        {/* Pointer events allow scroll but clicks need to pass through to interactive elements if defined.
            We need pointer-events-auto on the actual content sections. */}

        {/* HERO */}
        <div className="h-screen w-full flex flex-col items-center justify-center text-center relative pointer-events-auto">
            <div className="mb-4 text-nobel-gold/80 tracking-[0.5em] text-xs uppercase backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full border border-white/10">
                The Archive
            </div>
            <h1 className="text-7xl md:text-9xl font-bold font-serif text-white tracking-tighter mb-8 mix-blend-overlay">
                <DecryptionText text="CHRONICLE" revealSpeed={150} />
            </h1>
            <p className="max-w-md mx-auto text-slate-400 leading-relaxed mb-12 backdrop-blur-sm p-4 rounded-xl">
                Trace the lineage of resistance. From the stone halls of Bologna to the Aluta trenches of Ibadan.
            </p>
            <div className="animate-bounce">
                <ArrowDown className="text-nobel-gold opacity-50" />
            </div>
        </div>

        {/* 1. Global Origins */}
        <div className="relative pointer-events-auto">
            <GlobalOrigins />
        </div>

        {/* 2. African Context */}
        <div className="relative pointer-events-auto">
            <AfricanContext />
        </div>

        {/* 3. Nigerian Evolution */}
        <div className="relative pointer-events-auto">
            <NigerianEvolution />
        </div>

        {/* 4. UI/UISU Eras */}
        <div className="relative pointer-events-auto">
            <UISUEras />
        </div>

        {/* Footer Area */}
        <div className="py-32 bg-black/80 backdrop-blur-xl text-center relative z-10 pointer-events-auto border-t border-white/10">
            <h2 className="text-4xl font-serif text-slate-500 mb-8">History is still being written.</h2>
            <div className="w-px h-24 bg-gradient-to-b from-nobel-gold to-transparent mx-auto"></div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
