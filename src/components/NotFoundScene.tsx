import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AsciiRenderer, useTexture, Float, TorusKnot, Stars } from '@react-three/drei'
import * as THREE from 'three'

function LogoCube() {
  // Use the logo as a texture for the cube
  const texture = useTexture('/uisu-logo.png')
  const meshRef = useRef<THREE.Mesh>(null)

  // Rotate the cube
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.5, 2.5, 2.5]} />
      <meshStandardMaterial map={texture} color="white" roughness={0.5} />
    </mesh>
  )
}

function OrbitingRing() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime()
      ref.current.rotation.x = t * 0.5
      ref.current.rotation.y = t * 0.2
      // Add a slight wobble
      ref.current.position.y = Math.sin(t) * 0.5
    }
  })

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[3.5, 0.2, 128, 16]} />
      <meshStandardMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
    </mesh>
  )
}

export default function NotFoundScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <color attach="background" args={['#000510']} />

        {/* Lighting to ensure the ASCII renderer picks up shapes */}
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} />
        <pointLight position={[-10, -10, -10]} intensity={5} />

        {/* Floating Container for the Logo */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <LogoCube />
        </Float>

        {/* The "Another Thing" - An orbiting ring representing continuity */}
        <OrbitingRing />

        {/* Background Stars for depth */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* The ASCII Effect */}
        {/* fgColor: Gold, bgColor: Dark Blue/Black mix */}
        <AsciiRenderer
          fgColor="#C5A059"
          bgColor="#001020"
          characters=" .:-+*=%@#"
          invert={false}
          resolution={0.2}
        />
      </Canvas>
    </div>
  )
}
