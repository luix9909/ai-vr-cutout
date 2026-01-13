
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MediaItem, LayoutConfig } from './types';
import MediaFrame from './components/MediaFrame';

const LAYOUT_CONFIG: LayoutConfig = {
  radius: 4,          // Radius in meters
  gap: 1.524,         // 5 feet gap in meters
  itemWidth: 0.8,     // Width of each frame
  heightStep: 1.2,    // Vertical distance between rings
  baseHeight: 1.5     // Base height for the first ring
};

const App: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isInVR, setIsInVR] = useState(false);
  const [status, setStatus] = useState('ارفع ملفاتك للبدء في بناء معرضك الخاص');
  const sceneRef = useRef<any>(null);

  // Calculate position for circular layout
  const calculatePosition = useCallback((index: number) => {
    const { radius, gap, itemWidth, heightStep, baseHeight } = LAYOUT_CONFIG;
    
    // Circumference C = 2 * PI * R
    const circumference = 2 * Math.PI * radius;
    // Total space per item = width + gap
    const spacePerItem = itemWidth + gap;
    // Items per ring
    const itemsPerRing = Math.floor(circumference / spacePerItem);
    
    const ringIndex = Math.floor(index / itemsPerRing);
    const positionInRing = index % itemsPerRing;
    
    // Angle in radians
    const angle = (positionInRing / itemsPerRing) * Math.PI * 2;
    
    const x = Math.sin(angle) * radius;
    const z = -Math.cos(angle) * radius; // Negative Z is forward
    const y = baseHeight + (ringIndex * heightStep);
    
    return { x, y, z };
  }, []);

  useEffect(() => {
    const scene = document.querySelector('a-scene');
    if (scene) {
      scene.addEventListener('enter-vr', () => setIsInVR(true));
      scene.addEventListener('exit-vr', () => setIsInVR(false));
    }
    
    // Custom A-Frame component to always face camera
    // Fix: Access AFRAME and THREE from window to resolve name errors
    const AFRAME = (window as any).AFRAME;
    if (AFRAME && !AFRAME.components['always-face-camera']) {
      const THREE = AFRAME.THREE;
      AFRAME.registerComponent('always-face-camera', {
        tick: function () {
          const camera = document.querySelector('[camera]');
          if (camera) {
            const cameraWorldPos = new THREE.Vector3();
            // Fix: Cast element to any to access A-Frame specific property object3D
            (camera as any).object3D.getWorldPosition(cameraWorldPos);
            // We want it to look at the camera but stay vertical
            const self = this as any;
            const target = new THREE.Vector3(cameraWorldPos.x, self.el.object3D.position.y, cameraWorldPos.z);
            self.el.object3D.lookAt(target);
          }
        }
      });
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    // Fix: Explicitly cast to File[] to ensure 'type' and 'name' are recognized
    const newFiles = Array.from(e.target.files) as File[];
    const newItems: MediaItem[] = newFiles.map((file, idx) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      return {
        id: `media-${Date.now()}-${idx}`,
        url,
        type: isVideo ? 'video' : 'image',
        name: file.name
      };
    });

    setMediaItems(prev => [...prev, ...newItems]);
    setStatus(`تمت إضافة ${newItems.length} عناصر جديدة بنجاح`);
  };

  const clearAll = () => {
    if (window.confirm('هل أنت متأكد من مسح المعرض بالكامل؟')) {
      setMediaItems([]);
      setStatus('تم مسح المعرض');
    }
  };

  return (
    <div className="relative w-full h-screen font-sans">
      {/* Dashboard UI - Hidden in VR/AR to prevent "purple bar" covering view */}
      {!isInVR && (
        <div className="fixed bottom-0 left-0 w-full z-50 p-6 bg-slate-950/90 border-t-2 border-purple-600 shadow-[0_-10px_40px_rgba(147,51,234,0.3)] animate-in slide-in-from-bottom duration-500">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-right flex-1">
              <h1 className="text-xl font-bold text-purple-300 mb-1">🖼️ معرض الذكاء الاصطناعي الفضائي</h1>
              <p className="text-slate-400 text-sm">{status}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg active:scale-95">
                <span>➕ رفع ملفات</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
              
              <button 
                onClick={clearAll}
                className="bg-red-900/40 hover:bg-red-800 text-red-300 px-4 py-2 rounded-full border border-red-900/60 transition-all text-sm"
              >
                🗑️ مسح الكل
              </button>
            </div>
          </div>
          
          {/* Thumbnails list */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {mediaItems.map(item => (
              <div key={item.id} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-purple-500/30">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={item.url} className="w-full h-full object-cover" alt="" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A-Frame Scene */}
      <a-scene 
        ref={sceneRef}
        embedded 
        renderer="antialias: true; colorManagement: true;"
        background="color: #050014"
        vr-mode-ui="enabled: true"
        loading-screen="dotsColor: #a855f7; backgroundColor: #050014"
      >
        <a-assets>
          {mediaItems.map(item => (
            item.type === 'video' ? (
              <video 
                key={item.id} 
                id={item.id} 
                src={item.url} 
                autoPlay 
                loop 
                muted 
                playsInline 
                crossOrigin="anonymous" 
              />
            ) : (
              <img 
                key={item.id} 
                id={item.id} 
                src={item.url} 
                crossOrigin="anonymous" 
              />
            )
          ))}
        </a-assets>

        {/* Lighting */}
        <a-light type="ambient" intensity="0.6" color="#d8b4fe"></a-light>
        <a-light type="point" position="0 5 0" intensity="1.2" color="#ffffff"></a-light>
        
        {/* Floor */}
        <a-entity position="0 0 0">
          <a-grid 
            position="0 -0.01 0" 
            rotation="-90 0 0" 
            width="20" 
            height="20" 
            color="#7e22ce" 
            opacity="0.1"
          />
          <a-circle 
            radius="10" 
            rotation="-90 0 0" 
            material="color: #0a0414; opacity: 0.8; transparent: true"
          />
        </a-entity>

        {/* Gallery Items */}
        {mediaItems.map((item, index) => {
          const pos = calculatePosition(index);
          return (
            <MediaFrame 
              key={item.id}
              item={item}
              position={`${pos.x} ${pos.y} ${pos.z}`}
              width={LAYOUT_CONFIG.itemWidth}
            />
          );
        })}

        {/* Camera Rig */}
        <a-entity id="rig" position="0 0 0">
          <a-camera id="camera" wasd-controls="acceleration: 15" look-controls="pointerLockEnabled: false">
            {/* Minimal VR instruction in camera view if needed */}
          </a-camera>
          
          <a-entity laser-controls="hand: left" raycaster="objects: .clickable; far: 10; showLine: true"></a-entity>
          <a-entity laser-controls="hand: right" raycaster="objects: .clickable; far: 10; showLine: true"></a-entity>
        </a-entity>

      </a-scene>
    </div>
  );
};

export default App;
