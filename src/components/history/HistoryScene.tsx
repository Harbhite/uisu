import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles, Float, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

const CURVE_POINTS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -20),
  new THREE.Vector3(10, 5, -40),
  new THREE.Vector3(-5, -5, -60),
  new THREE.Vector3(0, 0, -80),
  new THREE.Vector3(5, 10, -100),
  new THREE.Vector3(0, 0, -120)
];

const HistoryTunnel = () => {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(CURVE_POINTS, false, 'catmullrom', 0.5);
  }, []);

  const linePoints = useMemo(() => curve.getPoints(300), [curve]);

  return (
    <group>
        {/* The Main "Thread" of History */}
        <line>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={linePoints.length}
                    array={new Float32Array(linePoints.flatMap(p => [p.x, p.y, p.z]))}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color="#C5A059" transparent opacity={0.2} linewidth={1} />
        </line>

        {/* Floating Particles for atmosphere */}
        <Sparkles count={500} scale={[20, 20, 120]} size={4} speed={0.4} opacity={0.5} color="#4c8bf5" position={[0, 0, -60]} />
        <Stars radius={50} depth={100} count={2000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
};

const CameraRig = () => {
  const { camera } = useThree();

  useFrame(() => {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPos = window.scrollY;
    const progress = Math.min(Math.max(scrollPos / scrollMax, 0), 1);

    // Interpolate camera position based on scroll
    // Simple linear interpolation for now along Z axis mainly
    // Refined: Follow the curve?
    // For simplicity and stability, we move along Z and add some noise

    const zPos = -progress * 110; // Move from 0 to -110

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, zPos, 0.1);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(progress * Math.PI * 4) * 5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, Math.cos(progress * Math.PI * 3) * 2, 0.05);

    camera.lookAt(0, 0, zPos - 20); // Look ahead
  });

  return null;
}

export const HistoryScene = () => {
  return (
    <>
      <color attach="background" args={['#000810']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#C5A059" />
      <pointLight position={[-10, -10, -50]} intensity={2} color="#003366" />

      <HistoryTunnel />
      <CameraRig />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};
