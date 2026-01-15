
import React, { useRef, useState } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import * as THREE from 'three';
import { SpatialItem } from '../types';

// Fix: Correctly extend React.JSX for proper intrinsic element support in React 18+ and Three.js
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

interface Props {
  item: SpatialItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<SpatialItem>) => void;
}

const SpatialItemView: React.FC<Props> = ({ item, isSelected, onSelect, onUpdate }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [video] = useState(() => {
    if (item.type === 'video') {
      const v = document.createElement('video');
      v.src = item.url;
      v.crossOrigin = 'anonymous';
      v.loop = true;
      v.muted = true;
      v.play().catch(console.error);
      return v;
    }
    return null;
  });

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(new THREE.Vector3(...item.position), 0.15);
      meshRef.current.rotation.set(...item.rotation);
      
      const targetScale = item.scale * (isSelected ? 1.05 : 1.0);
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
    }
  });

  const handleInteraction = () => {
    onSelect(item.id);
  };

  return (
    <Interactive onSelect={handleInteraction}>
      <mesh 
        ref={meshRef} 
        onPointerDown={(e) => {
          e.stopPropagation();
          handleInteraction();
        }}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        {item.type === 'image' ? (
          <meshStandardMaterial 
            map={new THREE.TextureLoader().load(item.url)} 
            side={THREE.DoubleSide}
            emissive={isSelected ? "#3b82f6" : "#000"}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        ) : (
          <meshStandardMaterial side={THREE.DoubleSide}>
             {video && <videoTexture attach="map" args={[video]} />}
          </meshStandardMaterial>
        )}
        
        {/* Selection Border / Highlight */}
        {isSelected && (
          <mesh position={[0, 0, -0.01]} scale={[1.08, 1.08, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        )}
      </mesh>
    </Interactive>
  );
};

export default SpatialItemView;
