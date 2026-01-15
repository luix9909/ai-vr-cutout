
import React, { useEffect } from 'react';
import { Canvas, useThree, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import * as THREE from 'three';
import { SpatialItem } from '../types';
import SpatialItemView from './SpatialItemView';

// Global XR Store
export const store = createXRStore({
  depthSensing: true,
  hand: true,
});

// Fix: Correctly extend React.JSX for proper intrinsic element support in React 18+ and Three.js
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

interface Props {
  items: SpatialItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<SpatialItem>) => void;
}

const SceneContent: React.FC<Props> = ({ items, selectedId, onSelect, onUpdate }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.6, 3); // Average eye height in meters
  }, [camera]);

  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />
      
      {items.map((item) => (
        <SpatialItemView
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onSelect={onSelect}
          onUpdate={onUpdate}
        />
      ))}

      {/* Subtle floor for orientation */}
      <gridHelper args={[20, 40, 0x444444, 0x222222]} position={[0, 0, 0]} />
    </>
  );
};

const ARWorld: React.FC<Props> = (props) => {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas shadows dpr={[1, 2]} className="w-full h-full">
        <XR store={store}>
          <PerspectiveCamera makeDefault fov={60} />
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            minDistance={0.5} 
            maxDistance={30}
            makeDefault
          />
          <SceneContent {...props} />
        </XR>
      </Canvas>
    </div>
  );
};

export default ARWorld;
