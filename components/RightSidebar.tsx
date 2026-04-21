import React from 'react';
import { useDocumentary } from '../context/DocumentaryContext';
import { Trash2, Clock, Wand2 } from 'lucide-react';

export const RightSidebar = React.memo(() => {
    const { 
        activeScene, 
        activeNoteId, 
        setActiveNoteId, 
        deleteNote, 
        updateNoteText, 
        updateNoteDuration, 
        autoCalculateDuration 
    } = useDocumentary();

    return (
        <div className="w-80 bg-zinc-900 border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-20">
           <h2 className="text-xl font-bold flex items-center gap-2 text-white border-b border-white/10 pb-4">
               Bilgi Notları
           </h2>
           {activeScene ? (
              <div className="flex flex-col gap-4">
                 {activeScene.notes.length === 0 && (
                     <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-sm text-amber-200">
                         Görsel üzerine tıklayarak canlıyla ilgili bilgi noktaları belirleyin.
                     </div>
                 )}
                 {activeScene.notes.map((note, idx) => (
                    <div 
                       key={note.id} 
                       className={`p-4 rounded-xl border transition-all cursor-pointer ${activeNoteId === note.id ? 'bg-amber-500/5 border-amber-500' : 'bg-black border-white/10 hover:bg-zinc-800'}`}
                       onClick={() => setActiveNoteId(note.id)}
                    >
                       <div className="flex justify-between items-center mb-3">
                           <span className="bg-amber-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">{idx + 1}</span>
                           <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-gray-500 hover:text-red-400 p-1 hover:bg-white/5 rounded">
                               <Trash2 size={16}/>
                           </button>
                       </div>
                       {activeNoteId === note.id ? (
                           <div className="flex flex-col gap-3">
                               <textarea 
                                  value={note.text}
                                  onChange={(e) => updateNoteText(note.id, e.target.value)}
                                  className="w-full bg-zinc-950 border border-amber-500/50 rounded-lg p-3 text-sm text-white resize-none h-28 focus:outline-none focus:border-amber-400"
                                  placeholder="Belgesel metnini buraya girin..."
                                  autoFocus
                               />
                               <div className="bg-black/50 p-3 rounded-lg border border-white/5 space-y-2">
                                   <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                                       <span className="flex items-center gap-1"><Clock size={12}/> Ekranda Kalma Süresi</span>
                                       <span className="text-amber-400 font-bold">{note.duration} saniye</span>
                                   </div>
                                   <input 
                                       type="range" min="3" max="30" step="1" 
                                       value={note.duration}
                                       onChange={(e) => updateNoteDuration(note.id, parseInt(e.target.value))}
                                       className="w-full accent-amber-500"
                                   />
                                   <button 
                                       onClick={() => autoCalculateDuration(note)}
                                       className="w-full flex justify-center items-center gap-1.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-md text-gray-300 transition-colors"
                                   >
                                      <Wand2 size={12}/> Metne Göre Otomatik Hesapla
                                   </button>
                               </div>
                           </div>
                       ) : (
                           <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{note.text}</p>
                       )}
                    </div>
                 ))}
              </div>
           ) : (
               <div className="text-gray-500 text-sm">
                   Önce sol panelden görsel yükleyin.
               </div>
           )}
        </div>
    );
});
