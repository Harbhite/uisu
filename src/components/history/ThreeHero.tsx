import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const TimeTunnel = () => {
  const points = useRef<THREE.Points>(null);

  // Generate random particles
  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
    }
    return pos;
  }, []);

  useFrame(() => {
    if (points.current) {
       points.current.rotation.z += 0.001;
       points.current.position.z += 0.05;
       if (points.current.position.z > 20) {
          points.current.position.z = -20;
       }
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#C5A059"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

export const ThreeHero = () => {
  return (
    <div className="w-full h-screen absolute top-0 left-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <color attach="background" args={['#001122']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={500} scale={12} size={4} speed={0.4} opacity={0.5} color="#C5A059" />

        <TimeTunnel />

        <fog attach="fog" args={['#001122', 5, 30]} />
      </Canvas>
    </div>
  );
};
