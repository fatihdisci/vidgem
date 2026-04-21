import React, { useEffect, useState } from 'react';
import { Scene, Note } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Phase {
    type: 'intro' | 'intro-stamp' | 'intro-fade' | 'full' | 'zooming' | 'note' | 'prepare-out' | 'outro' | 'outro-logo';
    sceneIdx: number;
    noteIdx: number;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const TypewriterText = ({ text, duration }: { text: string, duration: number }) => {
    const words = text.split(" ");
    
    // SESLENDİRME (VOICEOVER) SENKRONİZASYONU:
    // Kutunun ekranda kalma süresinin (duration) %85'ini kelimelerin geliş (okuma) hızı olarak ayırıyoruz.
    // Kalan %15'lik süre ise son kelimenin ekranda kalıp cümlenin algılanması için bekleme (kuyruk) payıdır.
    const activeReadingDuration = duration * 0.85;
    const stagger = activeReadingDuration / Math.max(words.length, 1);
    
    // Geçiş efekti: Her kelimenin belirme süresi. Kesik kesik olmasın, seslendirmenin nefesi gibi birbirine geçsin diye stagger süresine göre dinamik ayarlandı.
    const transitionDuration = Math.max(0.6, stagger * 1.5);

    return (
        <p className="text-2xl md:text-3xl leading-[1.6] text-center font-light tracking-wide text-white flex flex-wrap justify-center gap-x-[0.35em] gap-y-1">
            {words.map((w, i) => (
                <motion.span
                    key={`${w}-${i}`}
                    // CPU Jitter Optimization: Removed blur() filter which is expensive on scale animations
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        duration: transitionDuration, 
                        delay: i * stagger, 
                        ease: [0.25, 0.1, 0.25, 1] // Sinematik yumuşak easing
                    }}
                    className="inline-block text-white"
                >
                    {w}
                </motion.span>
            ))}
        </p>
    );
};

export function Player({ scenes, extinctionYear, channelName, onComplete }: { scenes: Scene[], extinctionYear: string, channelName: string, onComplete: () => void }) {
    const [phase, setPhase] = useState<Phase>({ type: 'intro', sceneIdx: -1, noteIdx: -1 });

    useEffect(() => {
        let cancelled = false;
        
        const run = async () => {
            await sleep(300); // UI stabilization buffer

            // INTRO SEQUENCE
            if (cancelled) return;
            setPhase({ type: 'intro', sceneIdx: -1, noteIdx: -1 });
            await sleep(2000); // Show EXTINCT IN text
            
            if (cancelled) return;
            setPhase({ type: 'intro-stamp', sceneIdx: -1, noteIdx: -1 });
            await sleep(2500); // BANG! Show STATUS: EXTINCT

            if (cancelled) return;
            setPhase({ type: 'intro-fade', sceneIdx: -1, noteIdx: -1 });
            await sleep(1000); // Fade to first scene

            for (let i = 0; i < scenes.length; i++) {
                if (cancelled) return;
                const scene = scenes[i];

                // 1) Enter Scene
                setPhase({ type: 'full', sceneIdx: i, noteIdx: -1 });
                await sleep(2500); 
                
                for (let j = 0; j < scene.notes.length; j++) {
                    if (cancelled) return;
                    const holdDuration = scene.notes[j].duration * 1000;
                   
                    // 2) Travel to Note
                    setPhase({ type: 'zooming', sceneIdx: i, noteIdx: j });
                    await sleep(1800); // 1.8s ultra-smooth travel time

                    // 3) Read Note
                    setPhase({ type: 'note', sceneIdx: i, noteIdx: j });
                    await sleep(holdDuration); 

                    // 4) If not the last note, do a mini zoom-out recoil smoothly
                    if (j < scene.notes.length - 1) {
                         setPhase({ type: 'prepare-out', sceneIdx: i, noteIdx: j });
                         await sleep(1200); 
                    }
                }

                // 5) Outro for the entire scene (zoom out completely)
                setPhase({ type: 'prepare-out', sceneIdx: i, noteIdx: -1 });
                await sleep(1500);
            }

            // OUTRO SEQUENCE
            if (!cancelled) {
                setPhase({ type: 'outro', sceneIdx: -1, noteIdx: -1 });
                await sleep(3500); // "Bir daha asla geri dönmeyecekler..."

                if (cancelled) return;
                setPhase({ type: 'outro-logo', sceneIdx: -1, noteIdx: -1 });
                await sleep(4000); // Show Channel Name / Logo
            }

            if (!cancelled) onComplete();
        };

        run();
        return () => { cancelled = true; };
    }, [scenes, onComplete]);

    const currentScene = phase.sceneIdx >= 0 && phase.sceneIdx < scenes.length ? scenes[phase.sceneIdx] : null;
    const currentNote = phase.noteIdx >= 0 && currentScene ? currentScene.notes[phase.noteIdx] : null;

    const isZoomed = phase.type === 'zooming' || phase.type === 'note';
    const showNote = phase.type === 'note';
    const isIntro = phase.type.startsWith('intro');
    const isOutro = phase.type.startsWith('outro');

    // Cinematic smooth scaling logic
    const getScale = () => {
        if (isIntro || isOutro) return 1;
        if (phase.type === 'full') return 1.05;    // Intro pan
        if (phase.type === 'zooming') return 2.2;  // Target zoom level
        if (phase.type === 'note') return 2.3;     // Slowly drift inward during reading
        if (phase.type === 'prepare-out') return 1; // Smoothly return to center
        return 1;
    }

    // Hand-crafted easing curves to eliminate stuttering
    const getTransitionParams = () => {
        if (phase.type === 'full') return { duration: 1.5, ease: "easeOut" }; 
        if (phase.type === 'zooming') return { duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }; // Cinematic ease-in-out
        if (phase.type === 'note') return { duration: currentNote?.duration || 1, ease: "linear" }; // Constant drift
        if (phase.type === 'prepare-out') return { duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }; // Smooth release
        return { duration: 1.5, ease: "easeInOut" };
    }

    return (
        <div className="fixed inset-0 bg-[#000] z-[100] flex items-center justify-center overflow-hidden font-sans cursor-none selection:bg-transparent">
             
             {/* The zooming container (Hardware accelerated via will-change) */}
             <motion.div
                initial={false}
                animate={{ 
                    scale: getScale(),
                    x: (isZoomed && currentNote) ? `${(50 - currentNote.x)}%` : "0%",
                    y: (isZoomed && currentNote) ? `${(50 - currentNote.y)}%` : "0%",
                    opacity: (isIntro && phase.type !== 'intro-fade') || isOutro ? 0 : 1 // Hide scene during pure intro/outro
                }}
                transition={{ ...getTransitionParams(), opacity: { duration: 1.5 } }} // Smooth fade in from intro
                className="relative w-full h-full will-change-transform"
                style={{ 
                    transformOrigin: "center center",
                    backfaceVisibility: "hidden", // Force GPU layer optimization
                    perspective: 1000, 
                    WebkitFontSmoothing: 'antialiased'
                }}
             >
                 {/* 
                   CRITICAL FIX: 
                   Images are absolute inset-0 so they stack on top of each other. 
                   When scene changes, the old image fades out while the new fades in smoothly. 
                   No layout jumps. No black flashes! 
                 */}
                 <AnimatePresence>
                    {currentScene && (
                        <motion.img 
                            key={currentScene.id}
                            src={currentScene.imageUrl} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute inset-0 m-auto w-full h-full object-cover" 
                        />
                    )}
                 </AnimatePresence>
                 
                 {/* Modern Holographic Marker */}
                 <AnimatePresence>
                    {(isZoomed && currentNote) && (
                        <motion.div 
                            className="absolute z-10 flex items-center justify-center"
                            initial={{ scale: 0, opacity: 0, rotate: -45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0, rotate: 45 }}
                            transition={{ type: "spring", damping: 15, stiffness: 100 }}
                            style={{
                                left: `${currentNote.x}%`,
                                top: `${currentNote.y}%`,
                                x: '-50%', y: '-50%' // Pin exactly on the coordinate
                            }}
                        >
                            <div className="relative w-14 h-14 flex items-center justify-center">
                                {/* Glowing outer field */}
                                <div className="absolute inset-[-20%] bg-amber-400/20 rounded-full blur-xl animate-pulse" />
                                
                                {/* Dashed targeting ring */}
                                <div className="absolute inset-0 rounded-full border border-amber-300/40 border-dashed animate-[spin_8s_linear_infinite]" />
                                
                                {/* Tech brackets */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-amber-400" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-amber-400" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-amber-400" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-amber-400" />
                                
                                {/* Inner solid core */}
                                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_15px_#fbbf24] z-10" />
                                <div className="absolute inset-0 rounded-full bg-amber-300/30 animate-ping" />
                            </div>
                        </motion.div>
                    )}
                 </AnimatePresence>
             </motion.div>

             {/* Dark Cinematic Overlay (vignette focus) */}
             <AnimatePresence>
                {showNote && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.8 }} 
                        className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 z-20 pointer-events-none" 
                    />
                )}
             </AnimatePresence>

             {/* Constant Cinematic Black Bars (Letterbox) */}
             <div className="absolute top-0 left-0 right-0 h-[10vh] bg-black z-40 pointer-events-none" />
             <div className="absolute bottom-0 left-0 right-0 h-[10vh] bg-black z-40 pointer-events-none" />

             {/* Modern Glassmorphism Info Panel */}
             <AnimatePresence>
                {showNote && currentNote && (
                   <motion.div 
                      key="note-box"
                      className="absolute z-50 w-full max-w-4xl left-1/2 -translate-x-1/2 bottom-[14%] px-6 lg:px-0"
                      // Performance fix: Switched from CSS filter 'blur' to purely opacity/transform to ensure 60fps
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} // Super smooth cubic bezier
                   >
                       {/* Connection Laser Line (rising from the box) */}
                       <motion.div 
                          className="absolute bottom-[100%] left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-t from-amber-400/60 to-transparent"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 120, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                       />

                       <div className="relative bg-black/50 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-8 lg:p-12 text-white ring-1 ring-white/5">
                           {/* Decorative Top Highlight */}
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                           
                           {/* Daktilo EFekti ile Metin */}
                           <TypewriterText text={currentNote.text} duration={currentNote.duration} />
                       </div>
                   </motion.div>
                )}
             </AnimatePresence>

             {/* INTRO OVERLAY */}
             <AnimatePresence>
                 {(phase.type === 'intro' || phase.type === 'intro-stamp') && (
                     <motion.div 
                         className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black"
                         initial={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         transition={{ duration: 1.5, ease: "easeInOut" }}
                     >
                         {/* Typewriter Year Box */}
                         <div className="text-center font-mono">
                             <motion.div 
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ duration: 0.5 }}
                                 className="text-gray-400 text-lg md:text-2xl tracking-[0.3em] font-medium uppercase"
                             >
                                 <TypewriterText text={`EXTINCT IN: ${extinctionYear}`} duration={1.5} />
                             </motion.div>
                         </div>

                         {/* Huge Red Stamp */}
                         <AnimatePresence>
                             {phase.type === 'intro-stamp' && (
                                 <motion.div 
                                     initial={{ scale: 3, opacity: 0, rotate: -5 }}
                                     animate={{ scale: 1, opacity: 1, rotate: -5 }}
                                     transition={{ type: "spring", damping: 10, stiffness: 100, mass: 0.5 }}
                                     className="absolute border-[6px] border-red-600 rounded-xl px-8 py-3 mt-16"
                                 >
                                     <span className="text-red-600 text-5xl md:text-7xl font-black tracking-tighter uppercase whitespace-nowrap block" style={{ textShadow: "0 0 20px rgba(220, 38, 38, 0.4)" }}>
                                         STATUS: EXTINCT
                                     </span>
                                     <motion.div 
                                        className="absolute inset-0 bg-red-600 opacity-20 filter blur-xl" 
                                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                                        transition={{ duration: 0.2, repeat: Infinity }}
                                     />
                                 </motion.div>
                             )}
                         </AnimatePresence>
                     </motion.div>
                 )}
             </AnimatePresence>

             {/* OUTRO OVERLAY */}
             <AnimatePresence>
                 {isOutro && (
                     <motion.div 
                         className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ duration: 2, ease: "easeInOut" }}
                     >
                         <AnimatePresence>
                             {phase.type === 'outro' && (
                                 <motion.div 
                                     initial={{ opacity: 0 }}
                                     animate={{ opacity: 1 }}
                                     exit={{ opacity: 0, scale: 1.1 }}
                                     transition={{ duration: 2 }}
                                     className="absolute"
                                 >
                                     <h2 className="text-amber-500 font-serif text-3xl md:text-5xl tracking-wide font-light italic">
                                         "They are never coming back..."
                                     </h2>
                                 </motion.div>
                             )}
                         </AnimatePresence>

                         <AnimatePresence>
                             {phase.type === 'outro-logo' && (
                                 <motion.div 
                                     initial={{ opacity: 0, scale: 0.9 }}
                                     animate={{ opacity: 1, scale: 1 }}
                                     transition={{ duration: 2.5, ease: "easeOut" }}
                                     className="absolute flex flex-col items-center gap-4"
                                 >
                                     <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center overflow-hidden">
                                         {/* Minimalist Globe / Leave Icon Placeholder */}
                                         <svg className="w-8 h-8 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                                         </svg>
                                     </div>
                                     <h1 className="text-white text-2xl md:text-4xl tracking-[0.4em] font-black uppercase text-center mt-2">
                                         {channelName}
                                     </h1>
                                 </motion.div>
                             )}
                         </AnimatePresence>
                     </motion.div>
                 )}
             </AnimatePresence>
        </div>
    );
}
