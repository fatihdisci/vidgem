import React, { useState } from 'react';
import { useDocumentary } from './context/DocumentaryContext';
import { Play, Video } from 'lucide-react';
import { Player } from './components/Player';
import { LeftSidebar } from './components/LeftSidebar';
import { EditorCanvas } from './components/EditorCanvas';
import { RightSidebar } from './components/RightSidebar';

export default function App() {
  const { scenes, extinctionYear, channelName } = useDocumentary();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Pures preload: Forces browser to cache images completely into RAM before firing Player
  const preloadImagesAndStart = async (startRoutine: () => void) => {
      setIsPreloading(true);
      const promises = scenes.map(scene => {
          return new Promise<void>((resolve) => {
              const img = new Image();
              img.src = scene.imageUrl;
              img.onload = () => resolve();
              img.onerror = () => resolve();
          });
      });
      await Promise.all(promises);
      setIsPreloading(false);
      startRoutine();
  };

  const executePreview = () => {
    document.documentElement.requestFullscreen().catch(e => console.log(e));
    setIsPlaying(true);
  };

  const executeRecording = async () => {
    try {
      await document.documentElement.requestFullscreen();
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 60, max: 60 },
          // Pushed limits to 4K resolution bounds based on user request (Lossless/Maximum capacity)
          width: { ideal: 3840, max: 3840 }, 
          height: { ideal: 2160, max: 2160 }
        },
        preferCurrentTab: true,
        audio: false, 
      });

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=h264') 
         ? 'video/webm;codecs=h264' 
         : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm');

      // Supercharged Bitrate: 40 Mbps for 4K pristine quality, virtually lossless
      const recorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 40 * 1024 * 1024 
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' }); 
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${channelName}_Documentary.mp4`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach(track => track.stop());
        
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
      alert("Ekran kaydı başlatılamadı: " + (err.message || err));
    }
  };

  const startPreview = () => preloadImagesAndStart(executePreview);
  const startRecording = () => preloadImagesAndStart(executeRecording);

  const handlePresentationEnd = () => {
    if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    setIsPlaying(false);
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
    }
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden relative">
      
      {isPreloading && (
          <div className="absolute inset-0 bg-black z-[200] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-amber-500 font-bold tracking-widest uppercase">Preparing Assets...</p>
          </div>
      )}

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
                     className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-black flex items-center gap-2 transition-colors text-sm font-bold"
                  >
                     <Video size={16} /> Video Olarak İndir (MP4)
                  </button>
               </>
           )}
        </div>
      </header>

      {/* Main Content (Refactored Components) */}
      <div className="flex flex-1 min-h-0 relative z-10">
        <LeftSidebar />
        <EditorCanvas />
        <RightSidebar />
      </div>

    </div>
  );
}
