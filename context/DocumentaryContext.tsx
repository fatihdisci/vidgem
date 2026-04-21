import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Scene, Note } from '../types';

interface DocumentaryContextType {
    scenes: Scene[];
    activeSceneId: string | null;
    activeNoteId: string | null;
    extinctionYear: string;
    channelName: string;
    setActiveSceneId: (id: string | null) => void;
    setActiveNoteId: (id: string | null) => void;
    handleSetExtinctionYear: (year: string) => void;
    handleSetChannelName: (name: string) => void;
    handleFiles: (files: FileList) => void;
    deleteScene: (id: string) => void;
    addNoteToActiveScene: (x: number, y: number) => void;
    updateNoteText: (id: string, text: string) => void;
    updateNoteDuration: (id: string, duration: number) => void;
    deleteNote: (id: string) => void;
    autoCalculateDuration: (note: Note) => void;
    reorderScenes: (fromId: string, toId: string) => void;
    activeScene: Scene | undefined;
}

const DocumentaryContext = createContext<DocumentaryContextType | undefined>(undefined);

export function DocumentaryProvider({ children }: { children: React.ReactNode }) {
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

    // Global Config
    const [extinctionYear, setExtinctionYear] = useState(
        () => localStorage.getItem('doc_extinctionYear') ?? "1936"
    );
    const [channelName, setChannelName] = useState(
        () => localStorage.getItem('doc_channelName') ?? "WILD ARCHIVES"
    );

    const handleSetExtinctionYear = useCallback((year: string) => {
        localStorage.setItem('doc_extinctionYear', year);
        setExtinctionYear(year);
    }, []);

    const handleSetChannelName = useCallback((name: string) => {
        localStorage.setItem('doc_channelName', name);
        setChannelName(name);
    }, []);

    // Memoize the active entities
    const activeScene = useMemo(() => scenes.find(s => s.id === activeSceneId), [scenes, activeSceneId]);

    const handleFiles = useCallback((files: FileList) => {
        const newScenes = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(2, 9),
            imageUrl: URL.createObjectURL(file), // Creates Blob URL
            notes: []
        }));
        setScenes(prev => [...prev, ...newScenes]);
        if (!activeSceneId && newScenes.length > 0) {
            setActiveSceneId(newScenes[0].id);
        }
    }, [activeSceneId]);

    const deleteScene = useCallback((id: string) => {
        setScenes(prev => {
            const sceneToDelete = prev.find(s => s.id === id);
            if (sceneToDelete) {
                // MEMORY LEAK TACKLED: Revoke Object URL to free up browser RAM
                URL.revokeObjectURL(sceneToDelete.imageUrl);
            }
            const newScenes = prev.filter(s => s.id !== id);
            // Update active scene if needed
            if (activeSceneId === id) {
                setActiveSceneId(newScenes.length > 0 ? newScenes[0].id : null);
                setActiveNoteId(null);
            }
            return newScenes;
        });
    }, [activeSceneId]);

    const addNoteToActiveScene = useCallback((x: number, y: number) => {
        if (!activeSceneId) return;
        
        const newNote: Note = {
            id: Math.random().toString(36).substring(2, 9),
            text: "Enter a striking fact about this species. (e.g. This species was last observed in the wild in 1936...)",
            x, y,
            duration: 5
        };

        setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, notes: [...s.notes, newNote] } : s));
        setActiveNoteId(newNote.id);
    }, [activeSceneId]);

    const updateNoteText = useCallback((id: string, text: string) => {
        setScenes(prev => prev.map(s => ({
            ...s, notes: s.notes.map(n => n.id === id ? { ...n, text } : n)
        })));
    }, []);

    const updateNoteDuration = useCallback((id: string, duration: number) => {
        setScenes(prev => prev.map(s => ({
            ...s, notes: s.notes.map(n => n.id === id ? { ...n, duration } : n)
        })));
    }, []);

    const deleteNote = useCallback((id: string) => {
        setScenes(prev => prev.map(s => ({
            ...s, notes: s.notes.filter(n => n.id !== id)
        })));
        if (activeNoteId === id) setActiveNoteId(null);
    }, [activeNoteId]);

    const reorderScenes = useCallback((fromId: string, toId: string) => {
        setScenes(prev => {
            const from = prev.findIndex(s => s.id === fromId);
            const to = prev.findIndex(s => s.id === toId);
            if (from === -1 || to === -1) return prev;
            const newArr = [...prev];
            const [moved] = newArr.splice(from, 1);
            newArr.splice(to, 0, moved);
            return newArr;
        });
    }, []);

    const autoCalculateDuration = useCallback((note: Note) => {
        const words = note.text.split(" ").length;
        const calc = Math.max(3, Math.ceil(words * 0.45)); // Fast reading speed assumption
        updateNoteDuration(note.id, calc);
    }, [updateNoteDuration]);

    const value = useMemo(() => ({
        scenes, activeSceneId, activeNoteId, extinctionYear, channelName,
        setActiveSceneId, setActiveNoteId, handleSetExtinctionYear, handleSetChannelName,
        handleFiles, deleteScene, addNoteToActiveScene, updateNoteText, updateNoteDuration, deleteNote, autoCalculateDuration, reorderScenes,
        activeScene
    }), [
        scenes, activeSceneId, activeNoteId, extinctionYear, channelName, 
        activeScene, handleFiles, deleteScene, addNoteToActiveScene, 
        updateNoteText, updateNoteDuration, deleteNote, autoCalculateDuration, reorderScenes
    ]);

    return (
        <DocumentaryContext.Provider value={value}>
            {children}
        </DocumentaryContext.Provider>
    );
}

export function useDocumentary() {
    const context = useContext(DocumentaryContext);
    if (!context) {
        throw new Error('useDocumentary must be used within a DocumentaryProvider');
    }
    return context;
}
