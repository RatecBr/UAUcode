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

interface Target {
    id: number;
    name: string;
    targetUrl: string;
    contentUrl: string;
    contentType: 'video' | 'audio' | '3d';
}

export default function Scanner() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // State
    const [, setTargets] = useState<Target[]>([]);
    const [status, setStatus] = useState<string>('Initializing...');
    const [isDetected, setIsDetected] = useState(false);
    const [activeTarget, setActiveTarget] = useState<Target | null>(null);
    // const [loadingNewTarget, setLoadingNewTarget] = useState(false); // Removed unused
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

        initializeScanner();
        return () => stopScan();
    }, []);

    // Sync state changes to ref for loop access
    useEffect(() => {
        debugModeRef.current = debugMode;
    }, [debugMode]);

    const initializeScanner = async () => {
        setStatus('Fetching experiences...');
        try {
            const res = await fetch('/api/targets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to load targets");
            let data: Target[] = await res.json();

            // Sanitize URLs to force relative paths (Proxied by Vite) to avoid Mixed Content
            data = data.map(t => ({
                ...t,
                targetUrl: t.targetUrl.replace('http://localhost:3000', ''),
                contentUrl: t.contentUrl.replace('http://localhost:3000', '')
            }));

            setTargets(data);
            targetsRef.current = data;

            if (data.length === 0) {
                setStatus('No experiences found. Add some in Admin.');
                return;
            }

            // REMOVED: Mass preloadAssets causing network congestion
            // We will load Just-In-Time (JIT) when detected.

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

        } catch (e) {
            console.error(e);
            setStatus('Error initializing scanner');
        }
    };

    const loadTargetImage = (t: Target): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = t.targetUrl;
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
                console.error(`Failed to load image for ${t.name} from ${t.targetUrl}`);
                resolve(false);
            };
        });
    };

    // Helper: JIT Fetching
    const fetchAndPlay = async (url: string, attemptId: number): Promise<string | null> => {
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
        // setLoadingNewTarget(true); // Optional: show a small spinner in the corner, not full screen

        console.log(`Loading content for ${t.name}... (Background)`);

        // 2. Fetch Blob in background (Old content keeps playing!)
        const blobUrl = await fetchAndPlay(t.contentUrl, t.id);

        // 3. Unlock loading state
        loadingRef.current = false;
        // setLoadingNewTarget(false);

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
        if (t.contentType === 'video') {
            videoOverlayRef.current = new VideoOverlay(container);
            videoOverlayRef.current.setSource(blobUrl);
            videoOverlayRef.current.show();
        } else if (t.contentType === 'audio') {
            audioOverlayRef.current = new AudioOverlay(blobUrl);
            audioOverlayRef.current.play();
            const div = document.createElement('div');
            div.className = 'glass-card';
            div.style.padding = '20px';
            div.style.color = 'white';
            div.style.pointerEvents = 'auto'; // allow click
            div.innerHTML = `<h3>Playing Audio</h3><p>${t.name}</p>`;
            container.appendChild(div);
        } else if (t.contentType === '3d') {
            threeOverlayRef.current = new Overlay3D(container);
            threeOverlayRef.current.loadModel(t.contentUrl).then(() => {
                threeOverlayRef.current?.show();
            });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'black', overflow: 'hidden' }}>
            <video
                ref={videoRef}
                className="camera-feed"
                playsInline muted autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    pointerEvents: 'none', display: 'block'
                }}
            />

            <div ref={overlayContainerRef} className="overlay-container" style={{ zIndex: 10 }}></div>

            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 20, pointerEvents: 'none',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <button
                        onClick={() => { stopScan(); navigate('/admin'); }}
                        className="glass-card"
                        style={{ padding: '10px', pointerEvents: 'auto', display: 'flex', gap: '5px' }}
                    >
                        <ArrowLeft size={20} color="white" /> <span style={{ color: 'white' }}>Exit</span>
                    </button>

                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {status && (
                            <div className="glass-card" style={{ padding: '8px 15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Loader2 className="spin" size={16} />
                                <span>{status}</span>
                            </div>
                        )}
                        <button
                            onClick={() => { console.log("Debug Click"); setDebugMode(p => !p); }}
                            className="glass-card"
                            style={{ padding: '8px', pointerEvents: 'auto', background: debugMode ? 'rgba(255,0,0,0.5)' : 'rgba(255,255,255,0.1)' }}
                        >
                            <Bug size={16} color="white" />
                        </button>
                        {debugMode && (
                            <div className="glass-card" style={{ padding: '5px', fontSize: '10px', maxWidth: '200px', wordWrap: 'break-word', color: 'white' }}>
                                {debugInfo}
                            </div>
                        )}
                    </div>
                </div>

                {isDetected && activeTarget && (
                    <div className="glass-card animate-enter" style={{ margin: '0 auto', marginBottom: '20px', padding: '15px', pointerEvents: 'auto', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#00ff9d', marginBottom: '5px' }}>DETECTED</div>
                        <div style={{ fontWeight: 'bold' }}>{activeTarget.name}</div>
                        <button
                            onClick={() => { resetOverlays(); }}
                            style={{
                                marginTop: '10px', background: 'rgba(255,255,255,0.2)', border: 'none',
                                color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                            }}
                        >
                            Close Experience
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
