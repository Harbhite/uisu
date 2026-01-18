import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Text, Float, PerspectiveCamera } from '@react-three/drei';
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
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <meshStandardMaterial
        color="#001133"
        roughness={0.2}
        metalness={0.6}
        wireframe={true} // Cyber/Surreal look
        wireframeLinewidth={0.05}
      />
    </mesh>
  );
};

const Rig = () => {
    return useFrame((state, delta) => {
        easing.damp3(state.camera.position, [state.pointer.x * 2, state.pointer.y * 2, 8], 0.3, delta)
        state.camera.lookAt(0, 0, 0)
    })
}

const ZebraTerrain = () => {
   // Simulating the black/white wavy pattern from opl-master-9.jpg
   const meshRef = useRef<THREE.Mesh>(null);

   useFrame(({ clock }) => {
       if (meshRef.current) {
           meshRef.current.position.y = -3 + Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
       }
   });

   return (
     <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, -10]}>
        <planeGeometry args={[100, 100, 128, 128]} />
        <meshStandardMaterial
            color="#F9F8F4" // Cream base
            roughness={1}
        >
            {/* We would ideally use a texture here. For now, let's just make it a cool looking terrain */}
        </meshStandardMaterial>
     </mesh>
   )
}

const StudentFigure = () => {
    return (
        <group position={[0, -2, 0]}>
            <mesh position={[0, 1, 0]}>
                <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
                <meshStandardMaterial color="#003366" />
            </mesh>
            <mesh position={[0, 1.8, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="#003366" />
            </mesh>
        </group>
    )
}

const FloatingTitle = () => {
    return (
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
            <Text
                // font="/fonts/Geist-Bold.ttf" // Removed to prevent loading errors if missing
                fontSize={1}
                color="#F9F8F4"
                position={[0, 2, 0]}
                anchorX="center"
                anchorY="middle"
                maxWidth={10}
                textAlign="center"
            >
                GLOBAL ORIGINS
            </Text>
            <Text
                fontSize={0.3}
                color="#C5A059"
                position={[0, 1.2, 0]}
                anchorX="center"
                anchorY="middle"
            >
                The Guide for Better Unionism
            </Text>
        </Float>
    )
}

const Scene = () => {
  return (
    <>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#C5A059" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Background Gradient Sphere or Fog */}
        <color attach="background" args={['#000510']} />
        <fog attach="fog" args={['#000510', 5, 25]} />

        <Rig />
        <FloatingTitle />
        <StudentFigure />
        <Terrain />
    </>
  );
};

export const VisionSection: React.FC = () => {
  return (
    <div className="h-screen w-full relative bg-ui-dark">
      <Canvas>
        <Scene />
      </Canvas>

      {/* Overlay Text Content - Bottom Panel style from image */}
      <div className="absolute bottom-0 left-0 w-full bg-nobel-cream text-ui-dark p-8 md:p-12 rounded-t-[3rem] shadow-2xl z-10">
        <div className="max-w-4xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="w-8 h-8 rounded-full border border-ui-dark flex items-center justify-center mx-auto mb-4 text-xs font-serif">01</div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Unionism isn't a luxury</h3>
                <p className="font-serif text-2xl md:text-3xl leading-relaxed">
                    "Without the collective voice, we accumulate silence: poor representation, slow progress, and emotional disconnect. Unionism isn't noise. It's maintenance."
                </p>
            </motion.div>
        </div>
      </div>
    </div>
  );
};
