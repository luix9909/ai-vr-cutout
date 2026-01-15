
import React, { useState, useCallback } from 'react';
import { SpatialItem } from './types';
import CameraPassthrough from './components/CameraPassthrough';
import ARWorld from './components/ARWorld';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [items, setItems] = useState<SpatialItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAddItem = useCallback((newItem: SpatialItem) => {
    setItems(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<SpatialItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  return (
    <div className="relative w-full h-screen bg-black select-none overflow-hidden">
      {/* Passthrough Video Feed */}
      <CameraPassthrough />

      {/* 3D AR Layer */}
      <ARWorld 
        items={items} 
        selectedId={selectedId} 
        onSelect={setSelectedId} 
        onUpdate={handleUpdateItem}
      />

      {/* UI Interaction Layer */}
      <UIOverlay 
        items={items}
        selectedId={selectedId}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateItem={handleUpdateItem}
        onSelect={setSelectedId}
      />

      {/* Visual Enhancements */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.5)] z-10" />
    </div>
  );
};

export default App;
