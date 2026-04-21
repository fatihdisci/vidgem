import React from 'react';
import { useDocumentary } from '../context/DocumentaryContext';
import { Upload } from 'lucide-react';

export const EditorCanvas = React.memo(() => {
    const { activeScene, activeNoteId, setActiveNoteId, addNoteToActiveScene } = useDocumentary();

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!activeScene) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        addNoteToActiveScene(x, y);
    };

    return (
        <div className="flex-1 bg-[#0f0f0f] flex flex-col items-center justify-center p-8 overflow-hidden relative" onClick={() => setActiveNoteId(null)}>
           {activeScene ? (
              <div className="relative w-full max-w-5xl aspect-video border border-white/5 rounded-lg shadow-2xl bg-black ring-1 ring-white/10 overflow-hidden">
                 <img src={activeScene.imageUrl} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Canvas Editor" />
                 
                 {/* Click overlay */}
                 <div className="absolute inset-0 cursor-crosshair z-10" onClick={handleImageClick}>
                    {activeScene.notes.map((note, index) => (
                       <div 
                          key={note.id}
                          className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] border-[3px] transition-transform ${activeNoteId === note.id ? 'bg-amber-500 border-white scale-125 text-black z-20' : 'bg-zinc-800 border-amber-500 text-white hover:scale-110 z-10'}`}
                          style={{ left: `${note.x}%`, top: `${note.y}%` }}
                          onClick={(e) => { e.stopPropagation(); setActiveNoteId(note.id); }}
                       >
                          {index + 1}
                       </div>
                    ))}
                 </div>
              </div>
           ) : (
              <div className="text-gray-500 text-lg flex flex-col items-center gap-4">
                  <div className="p-4 bg-zinc-900 rounded-full border border-zinc-800">
                      <Upload size={32} className="text-zinc-600" />
                  </div>
                  <p>Sol panelden canlının fotoğraflarını yükleyin.</p>
              </div>
           )}
        </div>
    );
});
