import React, { useState } from 'react';
import { Scene, Note } from './types';
import { Play, Upload, Trash2, Video, Plus, Check, Clock, Wand2 } from 'lucide-react';
import { Player } from './components/Player';

export default function App() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Global Documentary Config
  const [extinctionYear, setExtinctionYear] = useState("1936");
  const [channelName, setChannelName] = useState("WILD ARCHIVES");

  const activeScene = scenes.find(s => s.id === activeSceneId);
  const activeNote = activeScene?.notes.find(n => n.id === activeNoteId);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newScenes = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      imageUrl: URL.createObjectURL(file),
      notes: []
    }));
    setScenes(prev => [...prev, ...newScenes]);
    if (!activeSceneId && newScenes.length > 0) {
       setActiveSceneId(newScenes[0].id);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeScene) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      text: "Canlı hakkında çarpıcı bir bilgi girin. (Örn: Bu tür, en son 1936 yılında vahşi doğada gözlemlenmiştir...)",
      x, y,
      duration: 5
    };

    setScenes(scenes.map(s => s.id === activeScene.id ? { ...s, notes: [...s.notes, newNote] } : s));
    setActiveNoteId(newNote.id);
  };

  const deleteScene = (id: string) => {
      const filtered = scenes.filter(s => s.id !== id);
      setScenes(filtered);
      if (activeSceneId === id) setActiveSceneId(filtered.length > 0 ? filtered[0].id : null);
      if (activeSceneId === id) setActiveNoteId(null);
  };

  const deleteNote = (id: string) => {
      if (!activeScene) return;
      setScenes(scenes.map(s => s.id === activeScene.id ? { ...s, notes: s.notes.filter(n => n.id !== id) } : s));
      if (activeNoteId === id) setActiveNoteId(null);
  };

  const updateNoteText = (id: string, text: string) => {
      if (!activeScene) return;
      setScenes(scenes.map(s => 
          s.id === activeScene.id 
            ? { ...s, notes: s.notes.map(n => n.id === id ? { ...n, text } : n) } 
            : s
      ));
  };

  const updateNoteDuration = (id: string, duration: number) => {
      if (!activeScene) return;
      setScenes(scenes.map(s => 
          s.id === activeScene.id 
            ? { ...s, notes: s.notes.map(n => n.id === id ? { ...n, duration } : n) } 
            : s
      ));
  };

  const autoCalculateDuration = (note: Note) => {
      if (!activeScene) return;
      const words = note.text.trim().split(/\s+/).length || 1;
      const minReadSeconds = Math.max(3, Math.ceil(words / 2.5) + 2);
      updateNoteDuration(note.id, minReadSeconds);
  };

  const startPreview = async () => {
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
    } catch (e) {}
    setIsPlaying(true);
  };

  const startRecording = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          await new Promise(r => setTimeout(r, 800)); // wait for fullscreen animation
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: "browser",
          frameRate: { ideal: 60, max: 60 },
          width: { ideal: 2560, max: 2560 }, // 2K/1440p (Optimal threshold for hardware real-time encoding)
          height: { ideal: 1440, max: 1440 }
        },
        preferCurrentTab: true,
        audio: false, 
      });

      // Prioritize H264 (usually hardware accelerated in browser) over VP9 for flawless 60fps encoding
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=h264') 
         ? 'video/webm;codecs=h264' 
         : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm');

      const recorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 15000000 // 15 Mbps (Excellent 1440p quality, avoids frame drops)
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      
      recorder.onstop = () => {
        // Enforce MP4 extension download
        const blob = new Blob(chunks, { type: 'video/mp4' }); 
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'sunum-videosu.mp4';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach(track => track.stop());
        
        // Kayıt bitince tam ekrandan çık
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(e => console.log(e));
        }
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setIsPlaying(true);
    } catch (err: any) {
      console.error("Recording setup failed", err);
      alert("Ekran kaydı başlatılamadı. Tarayıcı izinlerini kontrol edin veya pencereyi tam ekran yaparak deneyin: " + (err.message || err));
    }
  };

  const handlePresentationEnd = () => {
     setIsPlaying(false);
     if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
     } else {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(e => console.log(e));
        }
     }
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      
      {isPlaying && (
         <Player scenes={scenes} onComplete={handlePresentationEnd} extinctionYear={extinctionYear} channelName={channelName} />
      )}

      {/* Header */}
      <header className="bg-zinc-950 border-b border-rose-900/30 h-16 flex items-center justify-between px-6 shrink-0 relative z-20">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">Kayıp Türler: Belgesel Motoru</h1>
        <div className="flex gap-4">
           {scenes.length > 0 && (
               <>
                  <button 
                     onClick={startPreview} 
                     className="px-5 py-2 rounded-full border border-white/20 text-white flex items-center gap-2 hover:bg-white/10 transition-colors text-sm font-semibold"
                  >
                     <Play size={16} /> Önizleme
                  </button>
                  <button 
                     onClick={startRecording}
                     className="px-5 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-black flex items-center gap-2 transition-colors text-sm font-bold"
                  >
                     <Video size={16} /> Video Olarak İndir (MP4)
                  </button>
               </>
           )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative z-10">
        
        {/* Left Sidebar - Scene Management */}
        <div className="w-64 bg-zinc-900 border-r border-rose-900/30 p-4 flex flex-col gap-4 overflow-y-auto">
           
           {/* Global Configuration */}
           <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-3 mb-2">
               <div>
                   <label className="text-xs text-gray-400 font-bold mb-1 block">YOK OLMANIN YILI (EXTINCT IN)</label>
                   <input type="text" value={extinctionYear} onChange={e => setExtinctionYear(e.target.value)} className="w-full bg-zinc-950 border border-rose-900/30 rounded-md px-2 py-1.5 text-sm text-red-500 font-bold focus:outline-none focus:border-red-500 text-center" placeholder="Örn: 1936" />
               </div>
               <div>
                   <label className="text-xs text-gray-400 font-bold mb-1 block">KANAL / LOGO ADI</label>
                   <input type="text" value={channelName} onChange={e => setChannelName(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500 text-center uppercase" placeholder="Örn: WILD ARCHIVES" />
               </div>
           </div>

           <label className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-4 rounded-xl cursor-pointer text-center flex items-center justify-center gap-2 transition-colors">
              <Upload size={18} /> Canlı Fotoları
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
           </label>

           <div className="flex flex-col gap-3 mt-4">
              {scenes.map((scene, idx) => (
                 <div 
                    key={scene.id} 
                    className={`group relative rounded-xl border-2 overflow-hidden bg-black cursor-pointer transition-all aspect-video ${activeSceneId === scene.id ? 'border-amber-500 scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    onClick={() => setActiveSceneId(scene.id)}
                 >
                    <img src={scene.imageUrl} className="w-full h-full object-cover" />
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

        {/* Middle - Editor Canvas */}
        <div className="flex-1 bg-[#0f0f0f] flex flex-col items-center justify-center p-8 overflow-hidden relative" onClick={() => setActiveNoteId(null)}>
           {activeScene ? (
              <div className="relative w-full max-w-5xl aspect-video border border-white/5 rounded-lg shadow-2xl bg-black ring-1 ring-white/10 overflow-hidden">
                 <img src={activeScene.imageUrl} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                 
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

        {/* Right Sidebar - Notes */}
        <div className="w-80 bg-zinc-900 border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
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
                 
                 {activeScene.notes.length > 0 && (
                     <button className="flex items-center justify-center gap-2 text-xs py-3 text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 rounded-xl transition-colors">
                         <Plus size={14} /> Yeni Not Eklemek İçin Resme Tıklayın
                     </button>
                 )}
              </div>
           ) : (
              <p className="text-sm text-gray-500 mt-4 text-center">Önce görsel seçin.</p>
           )}
        </div>

      </div>
    </div>
  );
}
