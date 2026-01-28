import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { easing } from 'maath';

const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create a wavy terrain using sine waves
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 64, 64);
    const count = geo.attributes.position.count;
    const array = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const x = array[i * 3];
      const y = array[i * 3 + 1];
      array[i * 3 + 2] = Math.sin(x * 0.2) * 2 + Math.cos(y * 0.3) * 2;
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
       // Smooth rotation
       meshRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <meshStandardMaterial
        color="#001133"
        roughness={0.2}
        metalness={0.6}
        wireframe={true}
        wireframeLinewidth={0.05}
      />
    </mesh>
  );
};

const Rig = () => {
    return useFrame((state, delta) => {
        // Gentle movement for parallax feel
        easing.damp3(state.camera.position, [state.pointer.x * 0.5, state.pointer.y * 0.5, 8], 0.3, delta)
        state.camera.lookAt(0, 0, 0)
    })
}

const StudentFigure = () => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = -2 + Math.sin(state.clock.elapsedTime) * 0.1;
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    })

    return (
        <group ref={groupRef} position={[0, -2, 0]}>
            {/* Abstract representation of a scholar/student using primitives */}
            <mesh position={[0, 1, 0]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#C5A059" wireframe />
            </mesh>
            <mesh position={[0, 1, 0]} scale={0.5}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color="#705CD7" />
            </mesh>
        </group>
    )
}

const Scene = () => {
  return (
    <>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#C5A059" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        <color attach="background" args={['#000510']} />
        <fog attach="fog" args={['#000510', 5, 25]} />

        <Rig />
        <StudentFigure />
        <Terrain />
    </>
  );
};

export const VisionSection: React.FC = () => {
  return (
    <div className="h-screen w-full relative bg-ui-dark overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
          <Canvas>
            <Scene />
          </Canvas>
      </div>

      {/* Main Hero Overlay - Centered & Responsive */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2 }}
             viewport={{ once: true }}
             className="text-center mix-blend-overlay" // Blend with 3D scene
          >
              <h2 className="text-nobel-gold font-bold tracking-[0.3em] text-xs md:text-sm mb-6 uppercase">
                  The Guide for Better Unionism
              </h2>
              <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-serif font-bold text-white tracking-tighter leading-none">
                  GLOBAL<br/>ORIGINS
              </h1>
          </motion.div>
      </div>

      {/* Bottom Interactive Card - Glassmorphism */}
      <div className="absolute bottom-8 left-0 w-full z-20 px-6 md:px-8 pointer-events-auto flex justify-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="w-full max-w-lg bg-ui-dark/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl text-center"
        >
            <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-[1px] w-8 bg-nobel-gold/50"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-nobel-gold">The Vision</h3>
                <div className="h-[1px] w-8 bg-nobel-gold/50"></div>
            </div>
            <p className="font-serif text-lg md:text-xl text-slate-200 leading-relaxed mb-4 italic">
                "Without the collective voice, we accumulate silence. Unionism isn't noise. It's maintenance."
            </p>
             <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-white/40 text-sm font-sans uppercase tracking-widest"
             >
                Start the Journey ↓
             </motion.div>
        </motion.div>
      </div>

      {/* Vignette for cinematic focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000510_100%)] pointer-events-none z-0 opacity-80"></div>
    </div>
  );
};
