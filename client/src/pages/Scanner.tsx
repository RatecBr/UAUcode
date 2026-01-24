import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Bug } from 'lucide-react';
import { initCamera, stopCamera } from '../camera';
import { ImageRecognizer } from '../recognition';
import type { RecognitionResult } from '../recognition';
import { VideoOverlay } from '../overlayVideo';
import { AudioOverlay } from '../overlayAudio';
import { Overlay3D } from '../overlay3D';
import { supabase } from '../AuthContext';

interface Target {
    id: number;
    name: string;
    target_url: string; // Database column
    content_url: string; // Database column
    content_type: 'video' | 'audio' | '3d';
}

export default function Scanner() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [allUsers, setAllUsers] = useState<{ id: string; email: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    useEffect(() => {
        if (user && !selectedUserId) {
            setSelectedUserId(user.id);
        }
    }, [user]);

    const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('id, email');
        if (data) setAllUsers(data);
    };

    // Promote to Admin (TEMPORARY - REMOVE AFTER USE)
    const promoteToAdmin = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, email: user.email, role: 'admin' });
        if (error) {
            alert("Error promoting: " + error.message);
        } else {
            alert("Promoted to Admin! Please logout and login again.");
        }
    };

    // State
    const [_targets, setTargets] = useState<Target[]>([]);
    const [status, setStatus] = useState<string>('Initializing...');
    const [isDetected, setIsDetected] = useState(false);
    const [activeTarget, setActiveTarget] = useState<Target | null>(null);
    const [_loadingNewTarget, setLoadingNewTarget] = useState(false); // UI indicator logic if needed
    const [debugMode, setDebugMode] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>("");

    // Refs
    // Fix for closure trap: Ref that tracks debugMode state
    const debugModeRef = useRef(false);
    const targetsRef = useRef<Target[]>([]); // To access targets inside closure

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null); // For debug drawing
    const overlayContainerRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const loopRef = useRef<number | null>(null);
    const recognizerRef = useRef<ImageRecognizer | null>(null);

    // Overlay Managers
    const videoOverlayRef = useRef<VideoOverlay | null>(null);
    const audioOverlayRef = useRef<AudioOverlay | null>(null);
    const threeOverlayRef = useRef<Overlay3D | null>(null);

    // Refs for Loop State (Avoiding Stale Closures in requestAnimationFrame)
    const isDetectedRef = useRef(false);
    const activeTargetRef = useRef<Target | null>(null);

    // Stability/Debounce Refs
    const stabilityCounterRef = useRef(0);
    const potentialTargetIdRef = useRef<number | null>(null);

    // Asset Cache for Instant Playback
    const assetsCacheRef = useRef<Map<number, HTMLVideoElement | HTMLAudioElement>>(new Map());

    useEffect(() => {
        // Instantiate ONLY ONCE
        if (!recognizerRef.current) {
            recognizerRef.current = new ImageRecognizer();
        }
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            initializeScanner();
        }
        return () => stopScan();
    }, [selectedUserId]);

    // Sync state changes to ref for loop access
    useEffect(() => {
        debugModeRef.current = debugMode;
    }, [debugMode]);

    const isInitializing = useRef(false);
    const hasInitialized = useRef(false);

    const initializeScanner = async () => {
        if (isInitializing.current || hasInitialized.current) return;

        try {
            isInitializing.current = true;
            setStatus('Fetching experiences...');

            if (!user) {
                setStatus('Not authenticated');
                return;
            }

            // Fetch targets: Selected user + Globals, OR just Globals
            let query = supabase.from('targets').select('*');
            if (selectedUserId && selectedUserId !== 'none') {
                query = query.or(`user_id.eq.${selectedUserId},is_global.eq.true`);
            } else {
                query = query.eq('is_global', true);
            }

            const { data, error } = await query;

            if (error) {
                if (error.message?.includes('abort') || error.code === 'ABORT') {
                    console.warn('[Scanner] Fetch aborted.');
                    return;
                }
                throw error;
            }
            if (!data) throw new Error("No data");

            // Type assertion and check
            const targetsData = data as any[];
            setTargets(targetsData);
            targetsRef.current = targetsData;

            if (targetsData.length === 0) {
                setStatus('No experiences found. Add some in Admin.');
                return;
            }

            setStatus('Loading recognition engine...');

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

                    if (loadedCount === 0) {
                        setStatus('Failed to load any target images. Check URLs.');
                    } else {
                        setStatus('Starting Camera...');
                        startCamera();
                    }
                }
            }, 500);

        } catch (e: any) {
            if (e.message?.includes('abort')) return;
            console.error(e);
            setStatus('Error initializing scanner');
        } finally {
            isInitializing.current = false;
        }
    };

    const loadTargetImage = (t: Target): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            // Use Supabase URL directly
            img.src = t.target_url;
            img.onload = () => {
                if (recognizerRef.current) {
                    const added = recognizerRef.current.addTarget(t.id, img);
                    if (added) console.log(`Target ${t.id} loaded.`);
                    else console.error(`Failed to add target ${t.id} to engine.`);
                    resolve(added);
                } else {
                    resolve(false);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image for ${t.name} from ${t.target_url}`);
                resolve(false);
            };
        });
    };

    // Helper: JIT Fetching
    const fetchAndPlay = async (url: string, _type: 'video' | 'audio', attemptId: number): Promise<string | null> => {
        try {
            // Check cache first
            if (assetsCacheRef.current.has(attemptId)) {
                const cachedEl = assetsCacheRef.current.get(attemptId);
                return (cachedEl as any).src;
            }

            console.log(`Fetching asset: ${url}`);
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            return blobUrl;
        } catch (e) {
            console.error("Asset fetch error:", e);
            return null;
        }
    };

    const startCamera = async () => {
        if (!videoRef.current) return;
        try {
            streamRef.current = await initCamera(videoRef.current);
            setStatus('');
            startLoop();
        } catch (e) {
            console.error(e);
            setStatus('Camera Error. Please allow permission.');
        }
    };

    const stopScan = () => {
        if (streamRef.current) {
            stopCamera(streamRef.current);
            streamRef.current = null;
        }
        if (loopRef.current) {
            cancelAnimationFrame(loopRef.current);
            loopRef.current = null;
        }
        resetOverlays();
        recognizerRef.current?.clearTargets();
    };

    const resetOverlays = () => {
        videoOverlayRef.current?.dispose();
        audioOverlayRef.current?.dispose();
        threeOverlayRef.current?.dispose();
        if (overlayContainerRef.current) overlayContainerRef.current.innerHTML = '';

        // Reset State AND Refs
        setIsDetected(false);
        setActiveTarget(null);
        isDetectedRef.current = false;
        activeTargetRef.current = null;
    };

    const startLoop = () => {
        let lastTime = 0;
        const process = (time: number) => {
            if (!streamRef.current || !videoRef.current || !recognizerRef.current) {
                loopRef.current = requestAnimationFrame(process);
                return;
            }

            if (time - lastTime > 150) {
                try {
                    const result = recognizerRef.current.processFrame(videoRef.current);

                    // READ FROM REF, NOT STATE
                    const isDebug = debugModeRef.current;

                    if (isDebug) {
                        // Use targetsRef.current.length to ensure we see the true count updated after init
                        setDebugInfo(`Targets: ${targetsRef.current.length} | Detected: ${result.detected} | Conf: ${result.confidence} | ID: ${result.targetId}`);
                        drawDebug(result, true);
                    } else {
                        drawDebug(result, false);
                    }

                    if (result.detected && result.targetId !== null) {
                        const currentActiveId = activeTargetRef.current?.id;
                        const newTargetId = result.targetId;

                        if (currentActiveId !== newTargetId) {
                            // We see a DIFFERENT target than the one currently playing.
                            // Start stability check.

                            if (potentialTargetIdRef.current === newTargetId) {
                                stabilityCounterRef.current++;
                            } else {
                                // Reset if it's a brand new potential target
                                potentialTargetIdRef.current = newTargetId;
                                stabilityCounterRef.current = 1;
                            }

                            // THRESHOLD: Require 3 consecutive stable frames of the NEW target to switch
                            // This prevents flickering if the camera just passes by quickly.
                            if (stabilityCounterRef.current >= 3) {
                                const target = targetsRef.current.find(t => t.id === newTargetId);
                                if (target && !loadingRef.current) {
                                    console.log(`SWITCHING TARGET (Stable): ${activeTargetRef.current?.name || 'None'} -> ${target.name}`);
                                    launchContent(target);

                                    // Reset counters after launch trigger
                                    stabilityCounterRef.current = 0;
                                    potentialTargetIdRef.current = null;
                                }
                            }
                        } else {
                            // We are seeing the CURRENT target again.
                            // Reset stability for others.
                            stabilityCounterRef.current = 0;
                            potentialTargetIdRef.current = null;
                        }
                    } else {
                        // Nothing detected.
                        // Reset stability counters.
                        stabilityCounterRef.current = 0;
                        potentialTargetIdRef.current = null;
                    }
                    // IMPLIED ELSE: If result.detected is FALSE, we simply do NOTHING. 
                    // The video continues playing because we do not call resetOverlays().

                    if (result.homography) result.homography.delete();

                } catch (err) {
                    console.error("Frame processing error", err);
                }
                lastTime = time;
            }

            loopRef.current = requestAnimationFrame(process);
        };
        loopRef.current = requestAnimationFrame(process);
    };

    const drawDebug = (result: RecognitionResult, visible: boolean) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match dimensions
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
    };

    // Ref to track if we are currently fetching a new target (to prevent double-fetch)
    const loadingRef = useRef(false);

    const launchContent = async (t: Target) => {
        const container = overlayContainerRef.current;
        if (!container) return;

        // Double check to prevent re-entry if we are already loading THIS target
        if (loadingRef.current || (activeTargetRef.current?.id === t.id && isDetectedRef.current)) return;

        // 1. Lock loading state so we don't trigger again
        loadingRef.current = true;
        setLoadingNewTarget(true); // Optional: show a small spinner in the corner, not full screen

        console.log(`Loading content for ${t.name}... (Background)`);

        // 2. Fetch Blob in background (Old content keeps playing!)
        const blobUrl = await fetchAndPlay(t.content_url, t.content_type as any, t.id);

        // 3. Unlock loading state
        loadingRef.current = false;
        setLoadingNewTarget(false);

        if (!blobUrl) {
            console.error("Failed to load new content");
            return;
        }

        // 4. NOW we swap. Stop old content.
        resetOverlays();

        // 5. Update References and State to the NEW target
        setIsDetected(true);
        setActiveTarget(t);
        isDetectedRef.current = true;
        activeTargetRef.current = t;

        // 6. Mount new content instantly (it's already a blob)
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
            div.style.pointerEvents = 'auto'; // allow click
            div.innerHTML = `<h3>Playing Audio</h3><p>${t.name}</p>`;
            container.appendChild(div);
        } else if (t.content_type === '3d') {
            threeOverlayRef.current = new Overlay3D(container);
            threeOverlayRef.current.loadModel(t.content_url).then(() => {
                threeOverlayRef.current?.show();
            });
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100dvh',
            background: 'var(--background)',
            overflow: 'hidden'
        }}>
            <video
                ref={videoRef}
                className="camera-feed"
                playsInline muted autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    display: 'block'
                }}
            />

            <div ref={overlayContainerRef} className="overlay-container" style={{ zIndex: 10 }}></div>

            {/* UI Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 20,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'var(--space-md)',
                paddingTop: 'max(var(--space-md), env(safe-area-inset-top))',
                paddingBottom: 'max(var(--space-md), env(safe-area-inset-bottom))'
            }}>
                {/* Top Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <button
                        onClick={() => { stopScan(); navigate('/admin'); }}
                        className="glass-card"
                        style={{
                            padding: 'var(--space-sm) var(--space-md)',
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            color: 'var(--text)'
                        }}
                    >
                        <ArrowLeft size={18} />
                        <span>Sair</span>
                    </button>

                    {isAdmin && allUsers.length > 0 && (
                        <div style={{ pointerEvents: 'auto', flex: 1, margin: '0 12px' }}>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    fontSize: '12px',
                                    outline: 'none'
                                }}
                            >
                                <option value="" disabled style={{ color: '#000' }}>Selecionar Usuário...</option>
                                <option value="none" style={{ color: '#000' }}>Apenas Globais (UAU)</option>
                                {allUsers.map(u => (
                                    <option key={u.id} value={u.id} style={{ color: '#000' }}>
                                        {u.email} {u.id === user?.id ? '(Você)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-sm)',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                    }}>
                        {status && (
                            <div
                                className="glass-card"
                                style={{
                                    padding: 'var(--space-xs) var(--space-sm)',
                                    display: 'flex',
                                    gap: 'var(--space-sm)',
                                    alignItems: 'center',
                                    fontSize: 'var(--font-size-sm)',
                                    maxWidth: '200px'
                                }}
                            >
                                <Loader2 className="spin" size={14} />
                                <span style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {status}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => { console.log("Debug Click"); setDebugMode(p => !p); }}
                            className="glass-card"
                            style={{
                                padding: 'var(--space-sm)',
                                pointerEvents: 'auto',
                                background: debugMode ? 'rgba(255, 71, 87, 0.5)' : 'var(--glass-bg)'
                            }}
                        >
                            <Bug size={16} color="white" />
                        </button>

                        {debugMode && (
                            <div
                                className="glass-card animate-enter"
                                style={{
                                    padding: 'var(--space-xs)',
                                    fontSize: 'var(--font-size-xs)',
                                    maxWidth: '180px',
                                    wordWrap: 'break-word',
                                    color: 'var(--text)'
                                }}
                            >
                                {debugInfo}
                            </div>
                        )}

                        {/* TEMPORARY: Promote to Admin button - REMOVE AFTER USE */}
                        <button
                            onClick={promoteToAdmin}
                            className="glass-card"
                            style={{
                                padding: 'var(--space-xs) var(--space-sm)',
                                pointerEvents: 'auto',
                                background: 'rgba(0, 255, 157, 0.25)',
                                color: 'var(--primary)',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 600
                            }}
                        >
                            Promover Admin
                        </button>
                    </div>
                </div>

                {/* Bottom Detection Card */}
                {isDetected && activeTarget && (
                    <div
                        className="glass-card animate-enter"
                        style={{
                            alignSelf: 'center',
                            marginBottom: 'var(--space-md)',
                            padding: 'var(--space-md)',
                            pointerEvents: 'auto',
                            textAlign: 'center',
                            maxWidth: '280px',
                            width: '100%'
                        }}
                    >
                        <div style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--primary)',
                            marginBottom: 'var(--space-xs)',
                            fontWeight: 600,
                            letterSpacing: '0.1em'
                        }}>
                            DETECTADO
                        </div>
                        <div style={{
                            fontWeight: 700,
                            fontSize: 'var(--font-size-lg)'
                        }}>
                            {activeTarget.name}
                        </div>
                        <button
                            onClick={() => { resetOverlays(); }}
                            className="btn-secondary"
                            style={{
                                marginTop: 'var(--space-sm)',
                                width: '100%',
                                fontSize: 'var(--font-size-sm)'
                            }}
                        >
                            Fechar Experiência
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
