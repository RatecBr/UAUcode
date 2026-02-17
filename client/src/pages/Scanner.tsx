import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, supabase } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { initCamera, stopCamera } from '../camera';
import { ImageRecognizer } from '../recognition';
import type { RecognitionResult } from '../recognition';
import { VideoOverlay } from '../overlayVideo';
import { AudioOverlay } from '../overlayAudio';
import { Overlay3D } from '../overlay3D';

interface Target {
    id: number;
    name: string;
    target_url: string;
    content_url: string;
    content_type: 'video' | 'audio' | '3d';
}

export default function Scanner() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [allUsers, setAllUsers] = useState<{ id: string; email: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [status, setStatus] = useState<string>('Initializing...');
    const [isDetected, setIsDetected] = useState(false);
    const [activeTarget, setActiveTarget] = useState<Target | null>(null);
    const [loadingNewTarget, setLoadingNewTarget] = useState(false);

    // Refs
    const targetsRef = useRef<Target[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayContainerRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const loopRef = useRef<number | null>(null);
    const recognizerRef = useRef<ImageRecognizer | null>(null);
    const videoOverlayRef = useRef<VideoOverlay | null>(null);
    const audioOverlayRef = useRef<AudioOverlay | null>(null);
    const threeOverlayRef = useRef<Overlay3D | null>(null);
    const isDetectedRef = useRef(false);
    const activeTargetRef = useRef<Target | null>(null);
    const stabilityCounterRef = useRef(0);
    const potentialTargetIdRef = useRef<number | null>(null);
    const currentLoadingIdRef = useRef<number | null>(null);
    const loadingRef = useRef(false);
    const isInitializing = useRef(false);
    const hasInitialized = useRef(false);
    const assetsCacheRef = useRef<Map<number, HTMLVideoElement | HTMLAudioElement>>(new Map());

    const fetchUsers = useCallback(async () => {
        const { data } = await supabase.from('profiles').select('id, email');
        if (data) setAllUsers(data);
    }, []);

    const resetOverlays = useCallback(() => {
        videoOverlayRef.current?.dispose();
        audioOverlayRef.current?.dispose();
        threeOverlayRef.current?.dispose();
        if (overlayContainerRef.current) overlayContainerRef.current.innerHTML = '';
        currentLoadingIdRef.current = null;
        loadingRef.current = false;
        setLoadingNewTarget(false);
        setIsDetected(false);
        setActiveTarget(null);
        isDetectedRef.current = false;
        activeTargetRef.current = null;
    }, []);

    const fetchAndPlay = useCallback(async (url: string, _type: 'video' | 'audio' | '3d', attemptId: number): Promise<string | null> => {
        try {
            if (assetsCacheRef.current.has(attemptId)) {
                const cachedEl = assetsCacheRef.current.get(attemptId);
                return (cachedEl as any).src;
            }
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            assetsCacheRef.current.set(attemptId, { src: blobUrl } as any);
            return blobUrl;
        } catch (e) {
            console.error("Asset fetch error:", e);
            return null;
        }
    }, []);

    const launchContent = useCallback(async (t: Target) => {
        const container = overlayContainerRef.current;
        if (!container) return;
        if (loadingRef.current || (activeTargetRef.current?.id === t.id && isDetectedRef.current)) return;

        loadingRef.current = true;
        setLoadingNewTarget(true);
        currentLoadingIdRef.current = t.id;

        const blobUrl = await fetchAndPlay(t.content_url, t.content_type, t.id);

        if (currentLoadingIdRef.current !== t.id) return;

        loadingRef.current = false;
        setLoadingNewTarget(false);
        currentLoadingIdRef.current = null;

        if (!blobUrl) return;

        resetOverlays();
        setIsDetected(true);
        setActiveTarget(t);
        isDetectedRef.current = true;
        activeTargetRef.current = t;

        if (t.content_type === 'video') {
            videoOverlayRef.current = new VideoOverlay(container);
            videoOverlayRef.current.setSource(blobUrl);
            videoOverlayRef.current.show();
        } else if (t.content_type === 'audio') {
            audioOverlayRef.current = new AudioOverlay(blobUrl);
            audioOverlayRef.current.play();
            const div = document.createElement('div');
            div.className = 'glass-card';
            div.style.padding = '20px';
            div.style.color = 'white';
            div.style.pointerEvents = 'auto';
            div.innerHTML = `<h3>Playing Audio</h3><p>${t.name}</p>`;
            container.appendChild(div);
        } else if (t.content_type === '3d') {
            threeOverlayRef.current = new Overlay3D(container);
            threeOverlayRef.current.loadModel(blobUrl).then(() => {
                threeOverlayRef.current?.show();
            });
        }
    }, [resetOverlays, fetchAndPlay]);

    const drawDebug = useCallback((result: RecognitionResult, visible: boolean) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!visible) return;
        if (result.detected) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        } else {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        }
    }, []);

    const startLoop = useCallback(() => {
        let lastTime = 0;
        const process = (time: number) => {
            if (!streamRef.current || !videoRef.current || !recognizerRef.current) {
                loopRef.current = requestAnimationFrame(process);
                return;
            }
            if (time - lastTime > 150) {
                try {
                    const result = recognizerRef.current.processFrame(videoRef.current);
                    drawDebug(result, false);
                    if (result.detected && result.targetId !== null) {
                        const currentActiveId = activeTargetRef.current?.id;
                        const newTargetId = result.targetId;
                        if (currentActiveId !== newTargetId) {
                            if (potentialTargetIdRef.current === newTargetId) {
                                stabilityCounterRef.current++;
                            } else {
                                potentialTargetIdRef.current = newTargetId;
                                stabilityCounterRef.current = 1;
                            }
                            if (stabilityCounterRef.current >= 3) {
                                const target = targetsRef.current.find(t => t.id === newTargetId);
                                if (target && !loadingRef.current) {
                                    launchContent(target);
                                    stabilityCounterRef.current = 0;
                                    potentialTargetIdRef.current = null;
                                }
                            }
                        } else {
                            stabilityCounterRef.current = 0;
                            potentialTargetIdRef.current = null;
                        }
                    } else {
                        stabilityCounterRef.current = 0;
                        potentialTargetIdRef.current = null;
                    }
                    if (result.homography) result.homography.delete();
                } catch (err) {
                    console.error("Frame processing error", err);
                }
                lastTime = time;
            }
            loopRef.current = requestAnimationFrame(process);
        };
        loopRef.current = requestAnimationFrame(process);
    }, [drawDebug, launchContent]);

    const startCamera = useCallback(async () => {
        if (!videoRef.current) return;
        try {
            streamRef.current = await initCamera(videoRef.current);
            setStatus('');
            startLoop();
        } catch (e) {
            console.error(e);
            setStatus('Camera Error. Please allow permission.');
        }
    }, [startLoop]);

    const loadTargetImage = useCallback((t: Target): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = t.target_url;
            img.onload = () => {
                if (recognizerRef.current) {
                    const added = recognizerRef.current.addTarget(t.id, img);
                    resolve(added);
                } else resolve(false);
            };
            img.onerror = () => resolve(false);
        });
    }, []);

    const initializeScanner = useCallback(async () => {
        if (isInitializing.current || hasInitialized.current) return;
        try {
            isInitializing.current = true;
            setStatus('Fetching experiences...');
            if (!user) return;
            let query = supabase.from('targets').select('*');
            if (selectedUserId && selectedUserId !== 'none') {
                query = query.or(`user_id.eq.${selectedUserId},is_global.eq.true`);
            } else query = query.eq('is_global', true);
            const { data, error } = await query;
            if (error || !data) throw error || new Error("No data");
            const targetsData = data as Target[];
            targetsRef.current = targetsData;
            if (targetsData.length === 0) {
                setStatus('No experiences found.');
                return;
            }
            setStatus('Loading engine...');
            const checkEngine = setInterval(async () => {
                if (recognizerRef.current?.isReady()) {
                    clearInterval(checkEngine);
                    setStatus(`Loading ${data.length} targets...`);
                    let loadedCount = 0;
                    if (recognizerRef.current) {
                        recognizerRef.current.clearTargets();
                        for (const t of data) {
                            const success = await loadTargetImage(t);
                            if (success) loadedCount++;
                        }
                    }
                    if (loadedCount === 0) setStatus('Failed to load targets.');
                    else startCamera();
                }
            }, 500);
        } catch (e) {
            console.error(e);
            setStatus('Error initializing');
        } finally {
            isInitializing.current = false;
        }
    }, [user, selectedUserId, loadTargetImage, startCamera]);

    const stopScan = useCallback(() => {
        if (streamRef.current) stopCamera(streamRef.current);
        streamRef.current = null;
        if (loopRef.current) cancelAnimationFrame(loopRef.current);
        loopRef.current = null;
        resetOverlays();
        recognizerRef.current?.clearTargets();
    }, [resetOverlays]);

    useEffect(() => {
        if (isAdmin) fetchUsers();
    }, [isAdmin, fetchUsers]);

    useEffect(() => {
        if (user && !selectedUserId) setSelectedUserId(user.id);
    }, [user, selectedUserId]);

    useEffect(() => {
        // Instantiate ONLY ONCE
        if (!recognizerRef.current) {
            recognizerRef.current = new ImageRecognizer();
        }
    }, []);

    useEffect(() => {
        if (selectedUserId) initializeScanner();
        return () => stopScan();
    }, [selectedUserId, initializeScanner, stopScan]);

    if (loadingNewTarget) { /* could show something */ }

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100dvh', background: 'var(--background)', overflow: 'hidden' }}>
            <video ref={videoRef} className="camera-feed" playsInline muted autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'block' }} />
            <div ref={overlayContainerRef} className="overlay-container" style={{ zIndex: 10 }}></div>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'var(--space-md)', paddingTop: 'max(var(--space-md), env(safe-area-inset-top))', paddingBottom: 'max(var(--space-md), env(safe-area-inset-bottom))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <button onClick={() => { stopScan(); navigate('/dashboard'); }} className="glass-card" style={{ padding: 'var(--space-sm) var(--space-md)', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text)' }}>
                        <ArrowLeft size={18} /><span>Dashboard</span>
                    </button>
                    {isAdmin && allUsers.length > 0 && (
                        <div style={{ pointerEvents: 'auto', flex: 1, margin: '0 12px' }}>
                            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid var(--neon-purple)', fontSize: '12px', outline: 'none', boxShadow: 'var(--neon-purple-glow)' }}>
                                <option value="" disabled style={{ color: '#000' }}>Selecionar Usuário...</option>
                                <option value="none" style={{ color: '#000' }}>Apenas Globais (UAU Code)</option>
                                {allUsers.map(u => (<option key={u.id} value={u.id} style={{ color: '#000' }}>{u.email} {u.id === user?.id ? '(Você)' : ''}</option>))}
                            </select>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {status && (<div className="glass-card" style={{ padding: 'var(--space-xs) var(--space-sm)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', fontSize: 'var(--font-size-sm)', maxWidth: '200px', borderColor: 'var(--neon-blue)', boxShadow: 'var(--neon-blue-glow)' }}><Loader2 className="spin" size={14} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{status}</span></div>)}
                    </div>
                </div>
                {isDetected && activeTarget && (
                    <div className="glass-card animate-enter" style={{ alignSelf: 'center', marginBottom: 'var(--space-md)', padding: 'var(--space-md)', pointerEvents: 'auto', textAlign: 'center', maxWidth: '300px', width: '100%', border: '1px solid var(--neon-purple)', boxShadow: 'var(--neon-purple-glow)' }}>
                        <div className="neon-flicker" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neon-purple)', marginBottom: 'var(--space-xs)', fontWeight: 800, letterSpacing: '0.2em', textShadow: 'var(--neon-purple-glow)' }}>DETECTADO</div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{activeTarget.name}</div>
                        <button onClick={() => { resetOverlays(); }} className="btn-secondary" style={{ marginTop: 'var(--space-sm)', width: '100%', fontSize: 'var(--font-size-sm)' }}>Fechar Experiência</button>
                    </div>
                )}
            </div>
        </div>
    );
}
