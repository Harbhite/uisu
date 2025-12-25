/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Cylinder, Stars } from '@react-three/drei';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      meshStandardMaterial: any;
    }
  }
}

/**
 * A Three.js scene displaying abstract 3D shapes and stars for the hero section background.
 * Uses floating animations to create a dynamic effect.
 *
 * @returns {JSX.Element} The rendered HeroScene component.
 */
export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#C5A059" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            {/* Abstract Shapes representing the structure */}
            <Box args={[1, 1, 1]} position={[2, 1, -2]} rotation={[0.5, 0.5, 0]}>
                <meshStandardMaterial color="#C5A059" wireframe transparent opacity={0.3} />
            </Box>
            
            <Box args={[0.5, 0.5, 0.5]} position={[-3, 2, -2]}>
                <meshStandardMaterial color="#002147" transparent opacity={0.6} />
            </Box>
            <Cylinder args={[0.2, 0.2, 1]} position={[3, -2, -1]} rotation={[Math.PI/4, 0, 0]}>
                <meshStandardMaterial color="#C5A059" transparent opacity={0.6} />
            </Cylinder>
        </Float>

        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

/**
 * A Three.js scene rendering a 3D model of a tower (representing the UI Tower).
 * The tower includes a base, shaft, clock section, and roof.
 *
 * @returns {JSX.Element} The rendered TowerScene component.
 */
export const TowerScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 2, 8], fov: 35 }}>
        <ambientLight intensity={1.2} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} color="#C5A059" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        <Float rotationIntensity={0.1} floatIntensity={0.2} speed={1}>
          <group rotation={[0, -0.2, 0]} position={[0, -2, 0]}>
            
            {/* Base */}
            <Box args={[2, 0.2, 2]} position={[0, 0, 0]}>
               <meshStandardMaterial color="#DBB68F" />
            </Box>

            {/* Main Shaft */}
            <Box args={[1.2, 4, 1.2]} position={[0, 2, 0]}>
               <meshStandardMaterial color="#E5E4E2" />
            </Box>

            {/* Clock Section */}
            <Box args={[1.3, 1.3, 1.3]} position={[0, 4.5, 0]}>
               <meshStandardMaterial color="#C5A059" metalness={0.5} roughness={0.2} />
            </Box>

            {/* Clock Face (White Circle) */}
            <Cylinder args={[0.5, 0.5, 0.1, 32]} position={[0, 4.5, 0.66]} rotation={[Math.PI/2, 0, 0]}>
               <meshStandardMaterial color="#FFFFFF" />
            </Cylinder>
             {/* Clock Hands */}
            <Box args={[0.05, 0.4, 0.02]} position={[0, 4.6, 0.72]} rotation={[0, 0, 0]}>
               <meshStandardMaterial color="#000" />
            </Box>
             <Box args={[0.05, 0.3, 0.02]} position={[0.1, 4.5, 0.72]} rotation={[0, 0, -Math.PI/2]}>
               <meshStandardMaterial color="#000" />
            </Box>

            {/* Top Roof */}
            <Cylinder args={[0, 1.5, 1, 4]} position={[0, 5.6, 0]} rotation={[0, Math.PI/4, 0]}>
                <meshStandardMaterial color="#002147" />
            </Cylinder>

          </group>
        </Float>
      </Canvas>
    </div>
  );
}