/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, useCursor } from '@react-three/drei';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      boxGeometry: any;
      torusGeometry: any;
      torusKnotGeometry: any;
      planeGeometry: any;
      coneGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      meshNormalMaterial: any;
    }
  }
}

/**
 * A 3D DNA Helix animation representing lineage and history.
 *
 * @param {object} props - Three.js group props.
 * @returns {JSX.Element} The DNAHelix component.
 */
export const DNAHelix = (props: any) => {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  const points = [];
  for (let i = 0; i < 20; i++) {
    points.push(i);
  }

  return (
    <group ref={group} {...props}>
      {points.map((i) => (
        <group key={i} position={[0, (i - 10) * 0.5, 0]}>
          <mesh position={[Math.sin(i * 0.5) * 1.5, 0, Math.cos(i * 0.5) * 1.5]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[Math.sin(i * 0.5 + Math.PI) * 1.5, 0, Math.cos(i * 0.5 + Math.PI) * 1.5]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#002147" emissive="#002147" emissiveIntensity={0.5} />
          </mesh>
          {/* Connecting rod */}
          <mesh rotation={[0, i * 0.5, 0]} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
            <meshStandardMaterial color="#ccc" opacity={0.3} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/**
 * A 3D model of a gavel representing the legislative branch or authority.
 *
 * @param {object} props - Three.js group props.
 * @returns {JSX.Element} The GavelModel component.
 */
export const GavelModel = (props: any) => {
  const mesh = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <group ref={mesh} {...props}>
      {/* Handle */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 2.5, 16]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
        <meshStandardMaterial color="#3E2723" />
      </mesh>
      {/* Gold bands */}
      <mesh position={[0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.02, 16, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[-0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.02, 16, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

/**
 * A 3D model of a scale representing the judiciary branch and justice.
 * The pans animate with a tipping effect.
 *
 * @param {object} props - Three.js group props.
 * @returns {JSX.Element} The ScaleModel component.
 */
export const ScaleModel = (props: any) => {
  const group = useRef<THREE.Group>(null);
  const leftPan = useRef<THREE.Group>(null);
  const rightPan = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) group.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    // Tipping effect
    if (leftPan.current && rightPan.current) {
        const tip = Math.sin(t) * 0.2;
        leftPan.current.position.y = tip;
        rightPan.current.position.y = -tip;
    }
  });

  return (
    <group ref={group} {...props}>
      {/* Base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.2, 32]} />
        <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Center Pole */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 16]} />
        <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[3.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Pans */}
      <group ref={leftPan} position={[-1.7, 1.5, 0]}>
          <mesh position={[0, -1, 0]}>
            <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#C5A059" side={THREE.DoubleSide} />
          </mesh>
          {/* Strings */}
          <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.01, 0.01, 2] as any} /><meshBasicMaterial color="#000" /></mesh>
      </group>
      <group ref={rightPan} position={[1.7, 1.5, 0]}>
          <mesh position={[0, -1, 0]}>
            <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#C5A059" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.01, 0.01, 2] as any} /><meshBasicMaterial color="#000" /></mesh>
      </group>
    </group>
  );
};

/**
 * A 3D pillar model representing the executive branch or stability.
 *
 * @param {object} props - Three.js group props.
 * @returns {JSX.Element} The PillarModel component.
 */
export const PillarModel = (props: any) => {
  return (
    <group {...props}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 3, 8]} />
        <meshStandardMaterial color="#eee" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.8, 0.2, 1.8]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <mesh position={[0, -1.6, 0]}>
        <boxGeometry args={[2, 0.4, 2]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
    </group>
  );
};

/**
 * A floating 3D book model representing the document library.
 * Reacts to hover events by slightly opening.
 *
 * @param {object} props - Three.js group props.
 * @returns {JSX.Element} The FloatingBook component.
 */
export const FloatingBook = (props: any) => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.2;
      group.current.rotation.y += 0.01;
      if (hovered) {
         group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.5, 0.1);
      } else {
         group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.1);
      }
    }
  });

  return (
    <group ref={group} {...props} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
       {/* Cover */}
       <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 3, 0.4]} />
          <meshStandardMaterial color="#002147" />
       </mesh>
       {/* Pages */}
       <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[1.9, 2.9, 0.35]} />
          <meshStandardMaterial color="#fff" />
       </mesh>
       {/* Gold Title */}
       <mesh position={[0, 0.5, 0.21]}>
          <boxGeometry args={[1.5, 0.5, 0.01]} />
          <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.1} />
       </mesh>
    </group>
  );
};

/**
 * A spinning 3D coin model representing the treasurer or finance.
 *
 * @param {object} props - Three.js mesh props.
 * @returns {JSX.Element} The SpinningCoin component.
 */
export const SpinningCoin = (props: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) ref.current.rotation.y += 0.05;
    });
    return (
        <mesh ref={ref} {...props} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[1, 1, 0.1, 32]} />
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.3} />
        </mesh>
    )
}

/**
 * A pulsing 3D orb using mesh distortion for visual effect.
 *
 * @returns {JSX.Element} The PulsingOrb component.
 */
export const PulsingOrb = () => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (ref.current) {
            ref.current.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
        }
    });
    return (
        <mesh ref={ref}>
            <sphereGeometry args={[1, 32, 32]} />
            <MeshDistortMaterial color="#C5A059" speed={2} distort={0.3} />
        </mesh>
    )
}

/**
 * An animated 3D bar for charts, growing from the bottom up.
 *
 * @param {object} props - Component props.
 * @param {number} props.height - Target height of the bar.
 * @param {string} props.color - Color of the bar.
 * @param {object} props.position - Position vector [x, y, z].
 * @param {number} props.delay - Delay before animation starts (not currently used in logic but kept for interface).
 * @returns {JSX.Element} The AnimatedBar component.
 */
export const AnimatedBar = ({ height, color, position, delay }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            // Grow effect
            ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, height, 0.05);
        }
    });
    return (
        <mesh ref={ref} position={position} scale={[1, 0, 1]}>
            <boxGeometry args={[0.8, 1, 0.8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

/**
 * A rotating 3D torus knot representing the Aluta spirit.
 *
 * @param {object} props - Three.js mesh props.
 * @returns {JSX.Element} The AlutaShape component.
 */
export const AlutaShape = (props: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });
    return (
        <mesh ref={ref} {...props}>
            <torusKnotGeometry args={[1, 0.3, 100, 16]} />
            <meshNormalMaterial />
        </mesh>
    )
}

/**
 * A 3D map pin that bounces and scales on hover.
 *
 * @param {object} props - Component props including color and Three.js group props.
 * @returns {JSX.Element} The MapPin3D component.
 */
export const MapPin3D = ({ color, ...props }: any) => {
    const ref = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);
    useCursor(hovered);
    
    useFrame((state) => {
        if (ref.current) {
            // Bounce
            ref.current.position.y = 0.5 + Math.abs(Math.sin(state.clock.getElapsedTime() * 3)) * 0.5;
            ref.current.scale.setScalar(hovered ? 1.5 : 1);
        }
    });

    return (
        <group ref={ref} {...props} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <coneGeometry args={[0.2, 0.8, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    )
}

/**
 * A moving wireframe grid for the ground effect.
 *
 * @returns {JSX.Element} The WavingGrid component.
 */
export const WavingGrid = () => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
             ref.current.position.z = (state.clock.getElapsedTime() * 0.5) % 1;
        }
    })
    return (
        <mesh ref={ref} rotation={[-Math.PI/2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[20, 20, 20, 20]} />
            <meshBasicMaterial color="#333" wireframe transparent opacity={0.1} />
        </mesh>
    )
}