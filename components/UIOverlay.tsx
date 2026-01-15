
import React, { useState } from 'react';
import { MediaType, SpatialItem } from '../types';
import { store } from './ARWorld';

interface Props {
  items: SpatialItem[];
  selectedId: string | null;
  onAddItem: (item: SpatialItem) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<SpatialItem>) => void;
  onSelect: (id: string | null) => void;
}

const UIOverlay: React.FC<Props> = ({ items, selectedId, onAddItem, onRemoveItem, onUpdateItem, onSelect }) => {
  const selectedItem = items.find(i => i.id === selectedId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;

      const newItem: SpatialItem = {
        id: Math.random().toString(36).substr(2, 9),
        url: result,
        type: type,
        position: [0, 1.5, -2], // Place 2 meters in front at eye level
        rotation: [0, 0, 0],
        scale: 1
      };

      onAddItem(newItem);
    };
    reader.readAsDataURL(file);
  };

  const handleMovement = (axis: number, val: number) => {
    if (!selectedId || !selectedItem) return;
    const newPos = [...selectedItem.position] as [number, number, number];
    newPos[axis] += val;
    onUpdateItem(selectedId, { position: newPos });
  };

  const handleScale = (val: number) => {
    if (!selectedId || !selectedItem) return;
    onUpdateItem(selectedId, { scale: Math.max(0.1, selectedItem.scale + val) });
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-20">
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-4">
        <div className="glass p-5 rounded-3xl pointer-events-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-float">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold">SpatialVision</h1>
            <p className="text-white/50 text-xs">رؤية مكانية حية</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          <button 
            onClick={() => store.enterAR()}
            className="pointer-events-auto glass px-6 py-3 rounded-full text-white font-bold text-sm bg-blue-600/30 border-blue-500/50 hover:bg-blue-600/50 transition-all flex items-center gap-3 neon-border"
          >
            <span>دخول وضع AR / VR</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          </button>

          <div className="flex gap-2 pointer-events-auto mt-2">
            <label className="glass w-12 h-12 rounded-full cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center text-white">
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </label>
            <label className="glass w-12 h-12 rounded-full cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center text-white">
              <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </label>
          </div>
        </div>
      </div>

      {/* Management Sidebar */}
      <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
        <div className="flex flex-col gap-3 pointer-events-auto max-h-[300px] overflow-y-auto w-full md:w-64 scrollbar-hide">
          {items.map(item => (
            <div 
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`glass p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${selectedId === item.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-transparent'}`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40">
                {item.type === 'image' ? (
                  <img src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 italic text-[10px]">فيديو</div>
                )}
              </div>
              <span className="text-white text-sm font-medium">عنصر {item.id.substr(0, 4)}</span>
            </div>
          ))}
        </div>

        {selectedItem ? (
          <div className="glass p-8 rounded-[35px] pointer-events-auto w-full max-w-md shadow-2xl border-t border-white/10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                 <h3 className="text-white font-bold text-lg">التحكم المكاني</h3>
              </div>
              <button 
                onClick={() => onRemoveItem(selectedId!)}
                className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest text-center">الموقع في الفضاء</p>
                <div className="flex items-center justify-center gap-8">
                  <div className="grid grid-cols-3 gap-2">
                    <div />
                    <button onClick={() => handleMovement(1, 0.1)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-white flex items-center justify-center">↑</button>
                    <div />
                    <button onClick={() => handleMovement(0, -0.1)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-white flex items-center justify-center">←</button>
                    <button onClick={() => handleMovement(1, -0.1)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-white flex items-center justify-center">↓</button>
                    <button onClick={() => handleMovement(0, 0.1)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-white flex items-center justify-center">→</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleMovement(2, -0.2)} className="w-20 py-3 bg-blue-600/20 hover:bg-blue-600/40 rounded-xl text-white text-xs font-bold">أقرب</button>
                    <button onClick={() => handleMovement(2, 0.2)} className="w-20 py-3 bg-blue-600/20 hover:bg-blue-600/40 rounded-xl text-white text-xs font-bold">أبعد</button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-4">
                 <div className="flex-1 space-y-2">
                    <p className="text-white/40 text-[10px] uppercase font-bold text-center">الحجم</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleScale(0.1)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white">+</button>
                      <button onClick={() => handleScale(-0.1)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white">-</button>
                    </div>
                 </div>
                 <button 
                  onClick={() => onSelect(null)}
                  className="flex-[1.5] py-3 bg-white text-black font-bold rounded-xl text-sm transition-all hover:scale-[1.02]"
                >
                  تثبيت العنصر
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass px-8 py-5 rounded-full pointer-events-auto flex items-center gap-4 border border-blue-500/20 animate-pulse">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            <p className="text-white/80 text-sm font-medium">حدد أي عنصر للتحريك أو الحذف</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIOverlay;
