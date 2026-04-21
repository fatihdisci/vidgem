import React from 'react';
import { useDocumentary } from '../context/DocumentaryContext';
import { Upload, Trash2 } from 'lucide-react';

export const LeftSidebar = React.memo(() => {
    const { 
        scenes, 
        activeSceneId, 
        setActiveSceneId, 
        extinctionYear, 
        setExtinctionYear, 
        channelName, 
        setChannelName, 
        handleFiles, 
        deleteScene 
    } = useDocumentary();

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
        e.target.value = ''; // Reset input to allow re-uploading same files if needed
    };

    return (
        <div className="w-64 bg-zinc-900 border-r border-rose-900/30 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 z-20">
           {/* Global Configuration */}
           <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-3 mb-2">
               <div>
                   <label className="text-xs text-gray-400 font-bold mb-1 block">YOK OLMANIN YILI (EXTINCT IN)</label>
                   <input 
                      type="text" 
                      value={extinctionYear} 
                      onChange={e => setExtinctionYear(e.target.value)} 
                      className="w-full bg-zinc-950 border border-rose-900/30 rounded-md px-2 py-1.5 text-sm text-red-500 font-bold focus:outline-none focus:border-red-500 text-center" 
                      placeholder="Örn: 1936" 
                   />
               </div>
               <div>
                   <label className="text-xs text-gray-400 font-bold mb-1 block">KANAL / LOGO ADI</label>
                   <input 
                      type="text" 
                      value={channelName} 
                      onChange={e => setChannelName(e.target.value)} 
                      className="w-full bg-zinc-950 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500 text-center uppercase" 
                      placeholder="Örn: WILD ARCHIVES" 
                   />
               </div>
           </div>

           <label className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-4 rounded-xl cursor-pointer text-center flex items-center justify-center gap-2 transition-colors">
              <Upload size={18} /> Canlı Fotoları
              <input type="file" multiple accept="image/*" className="hidden" onChange={onFileChange} />
           </label>

           <div className="flex flex-col gap-3 mt-4">
              {scenes.map((scene, idx) => (
                 <div 
                    key={scene.id} 
                    className={`group relative rounded-xl border-2 overflow-hidden bg-black cursor-pointer transition-all aspect-video ${activeSceneId === scene.id ? 'border-amber-500 scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    onClick={() => setActiveSceneId(scene.id)}
                 >
                    <img src={scene.imageUrl} className="w-full h-full object-cover" alt={`Scene ${idx+1}`} />
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 rounded-md font-mono text-xs shadow">{idx + 1}</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteScene(scene.id); }}
                      className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                       <Trash2 size={14} />
                    </button>
                    {scene.notes.length > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-400">
                           {scene.notes.length} Bilgi
                        </div>
                    )}
                 </div>
              ))}
           </div>
        </div>
    );
});
