import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Play } from 'lucide-react';
import { supabase } from '../AuthContext';
import { initCamera } from '../camera';
import { ImageRecognizer } from '../recognition';
import type { RecognitionResult } from '../recognition';
import { VideoOverlay } from '../overlayVideo';
import { AudioOverlay } from '../overlayAudio';
import { Overlay3D } from '../overlay3D';
import { LinkOverlay } from '../overlayLink';

interface Target {
    id: number;
    name: string;
    target_url: string;
    content_url: string;
    content_type: 'video' | 'audio' | '3d' | 'link';
    profiles?: { full_name?: string; email?: string };
}

interface UserProfile {
    id: string;
    slug: string;
    email: string;
}

export default function PublicScanner() {
    const { userSlug, targetId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [status, setStatus] = useState('Carregando...');
    const [isDetected, setIsDetected] = useState(false);

    // Refs para controle refinado (Espelhando Admin Scanner)
    const activeTargetRef = useRef<Target | null>(null);
    const [activeTarget, setActiveTarget] = useState<Target | null>(null);
    const [loadingNewTarget, setLoadingNewTarget] = useState(false);
    const [showManualStart, setShowManualStart] = useState(false);
    const loadingRef = useRef(false);
    const currentLoadingIdRef = useRef<number | null>(null);

    // Cache de assets para evitar re-downloads
    const assetsCacheRef = useRef<Map<number, Blob | string>>(new Map());

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayContainerRef = useRef<HTMLDivElement>(null);
    const recognizerRef = useRef<ImageRecognizer | null>(null);
    const targetsRef = useRef<Target[]>([]);
    const isScanning = useRef(false);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Refs de Overlay
    const videoOverlayRef = useRef<VideoOverlay | null>(null);
    const audioOverlayRef = useRef<AudioOverlay | null>(null);
    const overlay3DRef = useRef<Overlay3D | null>(null);
    const linkOverlayRef = useRef<LinkOverlay | null>(null);

    // Sistema de Estabilidade e Detecção
    const stabilityCounterRef = useRef(0);
    const potentialTargetIdRef = useRef<number | null>(null);
    const lastDetectedIdRef = useRef<number | null>(null);
    const STABILITY_THRESHOLD = 3;
    const SCAN_THROTTLE_MS = 150; // Throttle para economizar bateria e CPU

    useEffect(() => {
        initializeScanner();
        return () => {
            stopScan();
        };
    }, [userSlug, targetId]);

    const isInitializing = useRef(false);
    const hasInitialized = useRef(false);

    const initializeScanner = async () => {
        if (isInitializing.current || hasInitialized.current) {
            console.log('[PublicScanner] Já inicializando ou inicializado.');
            return;
        }

        try {
            isInitializing.current = true;
            console.log('[PublicScanner] Iniciando...');

            setLoading(true);
            setError(null);
            setStatus('Buscando usuário...');

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, slug, email')
                .eq('slug', userSlug)
                .eq('is_active', true)
                .single();

            if (profileError) {
                if (profileError.message?.includes('abort') || profileError.code === 'ABORT') {
                    console.warn('[PublicScanner] Requisição de perfil abortada.');
                    return;
                }
                console.error('[PublicScanner] Erro ao buscar perfil:', profileError);
                setError(`Erro ao buscar usuário: ${profileError.message}`);
                setLoading(false);
                return;
            }

            if (!profile) {
                setError('Usuário não encontrado ou inativo.');
                setLoading(false);
                return;
            }

            setUserProfile(profile);
            setStatus('Carregando experiências...');

            let query = supabase
                .from('targets')
                .select('*, profiles(full_name, email)')
                .or(`user_id.eq.${profile.id},is_global.eq.true`);

            if (targetId) {
                query = query.eq('id', parseInt(targetId));
            }

            const { data: targetsData, error: targetsError } = await query;

            if (targetsError) {
                if (targetsError.message?.includes('abort')) return;
                console.error('[PublicScanner] Erro ao buscar targets:', targetsError);
                setError(`Erro ao buscar experiências: ${targetsError.message}`);
                setLoading(false);
                return;
            }

            if (!targetsData || targetsData.length === 0) {
                setError('Nenhuma experiência encontrada.');
                setLoading(false);
                return;
            }

            targetsRef.current = targetsData as Target[];
            setStatus('Iniciando câmera...');

            let retryCount = 0;
            const checkVideoExist = setInterval(async () => {
                if (videoRef.current || retryCount > 10) {
                    clearInterval(checkVideoExist);
                    if (videoRef.current) {
                        try {
                            const stream = await initCamera(videoRef.current);
                            streamRef.current = stream;
                            console.log('[PublicScanner] Câmera iniciada.');
                            setShowManualStart(false);
                        } catch (camError: any) {
                            console.error('[PublicScanner] Erro na câmera:', camError);
                            setError(`Erro ao acessar câmera: ${camError.message}. Verifique as permissões.`);
                            setShowManualStart(true);
                            setLoading(false);
                            return;
                        }
                    } else {
                        console.error('[PublicScanner] Elemento de vídeo não encontrado no DOM.');
                    }
                }
                retryCount++;
            }, 500);

            recognizerRef.current = new ImageRecognizer();

            setStatus('Carregando imagens alvo...');
            const checkEngine = setInterval(async () => {
                if (recognizerRef.current?.isReady()) {
                    clearInterval(checkEngine);
                    recognizerRef.current.clearTargets();
                    for (const target of targetsData) {
                        await loadTargetImageToRecognizer(target);
                    }
                    setLoading(false);
                    setStatus('');
                    hasInitialized.current = true;
                    startScan();
                    console.log('[PublicScanner] Inicialização concluída com sucesso!');
                }
            }, 500);
        } catch (e: any) {
            if (e.message?.includes('abort')) return;
            console.error('[PublicScanner] Erro fatal:', e);
            setError('Erro ao inicializar: ' + e.message);
            setLoading(false);
        } finally {
            isInitializing.current = false;
        }
    };

    const loadTargetImageToRecognizer = (target: Target): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = target.target_url;
            img.onload = () => {
                if (recognizerRef.current) {
                    const added = recognizerRef.current.addTarget(target.id, img);
                    resolve(added);
                } else {
                    resolve(false);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image for ${target.name}`);
                resolve(false);
            };
        });
    };

    // Helper: JIT Fetching (Background loading)
    const fetchAsset = async (url: string, targetId: number): Promise<string | null> => {
        try {
            if (assetsCacheRef.current.has(targetId)) {
                const cached = assetsCacheRef.current.get(targetId);
                return typeof cached === 'string' ? cached : URL.createObjectURL(cached as Blob);
            }

            console.log(`[PublicScanner] Fetching asset em background: ${url}`);
            const response = await fetch(url);
            const blob = await response.blob();
            assetsCacheRef.current.set(targetId, blob);
            return URL.createObjectURL(blob);
        } catch (e) {
            console.error("[PublicScanner] Erro no fetch do asset:", e);
            return null;
        }
    };

    const startScan = () => {
        if (isScanning.current) return;
        isScanning.current = true;

        let lastTime = 0;

        const scanLoop = (time: number) => {
            if (!isScanning.current || !videoRef.current || !canvasRef.current || !recognizerRef.current) {
                return;
            }

            // Throttle: Processa a cada 150ms para economizar recursos e baterias
            if (time - lastTime < SCAN_THROTTLE_MS) {
                animationFrameRef.current = requestAnimationFrame(scanLoop);
                return;
            }
            lastTime = time;

            const video = videoRef.current;
            if (video.readyState < 2) {
                animationFrameRef.current = requestAnimationFrame(scanLoop);
                return;
            }

            try {
                const result: RecognitionResult = recognizerRef.current.processFrame(video);



                if (result.detected && result.targetId !== null) {
                    const currentActiveId = activeTargetRef.current?.id;
                    const newTargetId = result.targetId;

                    if (currentActiveId !== newTargetId) {
                        // Vimos um target DIFERENTE do atual
                        if (potentialTargetIdRef.current === newTargetId) {
                            stabilityCounterRef.current++;
                        } else {
                            potentialTargetIdRef.current = newTargetId;
                            stabilityCounterRef.current = 1;
                        }

                        if (stabilityCounterRef.current >= STABILITY_THRESHOLD) {
                            const matchedTarget = targetsRef.current.find(t => t.id === newTargetId);
                            if (matchedTarget && !loadingRef.current) {
                                handleTargetDetected(matchedTarget);
                                // Reset stability após disparar
                                stabilityCounterRef.current = 0;
                                potentialTargetIdRef.current = null;
                            }
                        }
                    } else {
                        // Confirmando o target atual, reseta outros potenciais
                        stabilityCounterRef.current = 0;
                        potentialTargetIdRef.current = null;
                    }
                } else {
                    // Nada detectado, limpa contadores de potencial mas mantém o atual rodando
                    stabilityCounterRef.current = 0;
                    potentialTargetIdRef.current = null;
                }
            } catch (e) {
                // Ignore recognition errors if engine is busy
            }

            animationFrameRef.current = requestAnimationFrame(scanLoop);
        };

        animationFrameRef.current = requestAnimationFrame(scanLoop);
    };

    const handleTargetDetected = async (target: Target) => {
        const container = overlayContainerRef.current;
        if (!container) return;

        // Evita re-disparo se já estamos carregando ou já é o ativo
        if (loadingRef.current || (activeTargetRef.current?.id === target.id && isDetected)) return;

        console.log(`[PublicScanner] Preparando conteúdo para ${target.name}...`);

        // Tipo LINK: exibe a página dentro de um iframe overlay
        if (target.content_type === 'link') {
            resetOverlays();
            activeTargetRef.current = target;
            setActiveTarget(target);
            setIsDetected(true);
            try { supabase.from('scan_logs').insert({ target_id: target.id }).then(); } catch (_) { }
            const lo = new LinkOverlay(() => resetOverlays());
            lo.setSource(target.content_url);
            lo.show();
            linkOverlayRef.current = lo;
            return;
        }

        // 1. Bloqueia disparo concorrente
        loadingRef.current = true;
        setLoadingNewTarget(true);
        currentLoadingIdRef.current = target.id;

        // 2. Carrega asset em background (Blob ou Cache)
        const assetUrl = await fetchAsset(target.content_url, target.id);

        // 3. Verificação de Integridade: Se durante o download o usuário cancelou ou o target mudou, abortamos.
        if (currentLoadingIdRef.current !== target.id) {
            console.log(`[PublicScanner] Download concluído para ${target.name}, mas a carga foi cancelada/trocada.`);
            return;
        }

        // 4. Desbloqueia e limpa ID de carga
        loadingRef.current = false;
        setLoadingNewTarget(false);
        currentLoadingIdRef.current = null;

        if (!assetUrl) {
            console.error('[PublicScanner] Falha ao carregar asset.');
            return;
        }

        // Para o overlay anterior e atualiza estado
        resetOverlays();
        activeTargetRef.current = target;
        setActiveTarget(target);
        setIsDetected(true);

        try {
            supabase.from('scan_logs').insert({ target_id: target.id }).then();
        } catch (e) { }

        // Monta o novo conteúdo
        if (target.content_type === 'video') {
            videoOverlayRef.current = new VideoOverlay(container);
            videoOverlayRef.current.setSource(assetUrl);
            videoOverlayRef.current.show();
        } else if (target.content_type === 'audio') {
            audioOverlayRef.current = new AudioOverlay(assetUrl);
            audioOverlayRef.current.play();
        } else if (target.content_type === '3d') {
            overlay3DRef.current = new Overlay3D(container);
            overlay3DRef.current.loadModel(assetUrl).then(() => {
                if (activeTargetRef.current?.id === target.id) {
                    overlay3DRef.current?.show();
                }
            });
        }
    };

    const resetOverlays = () => {
        videoOverlayRef.current?.dispose();
        audioOverlayRef.current?.dispose();
        overlay3DRef.current?.dispose();
        // Nula ANTES do dispose para evitar loop recursivo via onClose
        const link = linkOverlayRef.current;
        linkOverlayRef.current = null;
        link?.dispose();

        if (overlayContainerRef.current) {
            overlayContainerRef.current.innerHTML = '';
        }

        currentLoadingIdRef.current = null;
        loadingRef.current = false;
        setLoadingNewTarget(false);

        activeTargetRef.current = null;
        setIsDetected(false);
        setActiveTarget(null);
        stabilityCounterRef.current = 0;
        potentialTargetIdRef.current = null;
        lastDetectedIdRef.current = null;
    };

    const stopScan = () => {
        isScanning.current = false;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        resetOverlays();
    };

    const styles = {
        container: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            overflow: 'hidden'
        },
        video: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover' as const,
            zIndex: 1
        },
        canvas: {
            display: 'none'
        },
        overlay: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            pointerEvents: 'none' as const,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        },
        ui: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
            pointerEvents: 'none' as const,
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            padding: '16px',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        },
        backBtn: {
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: 'none',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            pointerEvents: 'auto' as const
        },
        statusBadge: {
            padding: '8px 12px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px'
        },
        userInfo: {
            padding: '8px 12px',
            backgroundColor: 'rgba(188, 54, 194, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            fontSize: '12px',
            color: 'var(--neon-purple)',
            border: '1px solid rgba(188, 54, 194, 0.2)'
        },
        detectedCard: {
            alignSelf: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(30px)',
            borderRadius: '24px',
            padding: '24px',
            textAlign: 'center' as const,
            maxWidth: '300px',
            width: '100%',
            pointerEvents: 'auto' as const,
            border: '1px solid var(--neon-purple)',
            boxShadow: '0 0 30px rgba(188, 54, 194, 0.3)'
        },
        detectedLabel: {
            fontSize: '11px',
            color: 'var(--neon-purple)',
            fontWeight: 800,
            letterSpacing: '0.2em',
            marginBottom: '8px',
            textTransform: 'uppercase' as const
        },
        detectedName: {
            fontSize: '18px',
            fontWeight: 700
        },
        closeBtn: {
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
        },
        errorContainer: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0a0a0f',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center' as const,
            color: '#fff'
        },
        errorIcon: {
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,71,87,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
        },
        errorTitle: {
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '8px'
        },
        errorText: {
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)'
        },
        loadingContainer: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0a0a0f',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: '#fff'
        },
        loadingText: {
            color: 'rgba(255,255,255,0.7)',
            fontSize: '14px'
        }
    };

    return (
        <div style={styles.container}>
            <video ref={videoRef} style={styles.video} playsInline autoPlay muted />
            <canvas ref={canvasRef} style={styles.canvas} />
            <div ref={overlayContainerRef} style={styles.overlay} />

            {loading && (
                <div style={styles.loadingContainer}>
                    <img src="/logo.png" style={{ width: '120px', height: 'auto', marginBottom: '24px', filter: 'drop-shadow(0 0 10px var(--neon-purple))' }} />
                    <Loader2 size={32} color="var(--neon-purple)" className="spin" />
                    <div style={styles.loadingText}>{status}</div>
                </div>
            )}

            {error && (
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>
                        <AlertCircle size={32} color="#ff4757" />
                    </div>
                    <div style={styles.errorTitle}>Ops!</div>
                    <div style={styles.errorText}>{error}</div>
                    <button
                        onClick={() => navigate('/')}
                        style={{ ...styles.backBtn, marginTop: '24px', pointerEvents: 'auto' }}
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div style={styles.ui}>
                    {!isDetected && (
                        <div style={styles.header}>
                            <button style={styles.backBtn} onClick={() => navigate('/')}>
                                <ArrowLeft size={18} />
                                Sair
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                {status && (
                                    <div style={styles.statusBadge}>
                                        <Loader2 size={14} className="spin" />
                                        {status}
                                    </div>
                                )}

                                {userProfile && (
                                    <div style={styles.userInfo}>
                                        @{userProfile.slug}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', paddingBottom: '100px', pointerEvents: 'none' }}>
                        {loadingNewTarget && (
                            <div style={{
                                ...styles.statusBadge,
                                alignSelf: 'center',
                                marginBottom: '20px',
                                backgroundColor: 'rgba(188, 54, 194, 0.2)',
                                border: '1px solid rgba(188, 54, 194, 0.3)',
                                color: 'var(--neon-purple)',
                                animation: 'pulse 2s infinite'
                            }}>
                                <Loader2 size={16} className="spin" />
                                Carregando conteúdo...
                            </div>
                        )}

                        {showManualStart && (
                            <button
                                onClick={async () => {
                                    if (videoRef.current) {
                                        try {
                                            await videoRef.current.play();
                                            setShowManualStart(false);
                                        } catch (e) {
                                            console.error("Manual start failed", e);
                                        }
                                    }
                                }}
                                style={{
                                    ...styles.closeBtn,
                                    background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    padding: '16px 32px',
                                    width: 'auto',
                                    pointerEvents: 'auto',
                                    boxShadow: 'var(--neon-purple-glow)',
                                    border: 'none'
                                }}
                            >
                                <Play size={20} fill="#000" />
                                INICIAR CÂMERA
                            </button>
                        )}

                        {isDetected && activeTarget && activeTarget.content_type !== 'link' && (
                            <div style={{
                                pointerEvents: 'auto' as const,
                                width: '95%',
                                alignSelf: 'center',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                                border: 'none',
                                color: '#fff',
                                gap: '12px'
                            }}>
                                {/* Canto Esquerdo: Sair */}
                                <button 
                                    onClick={() => navigate('/')} 
                                    style={{ 
                                        padding: '10px 16px', 
                                        borderRadius: '16px', 
                                        background: 'rgba(255,255,255,0.1)', 
                                        backdropFilter: 'blur(10px)',
                                        color: '#fff', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <ArrowLeft size={14} /> Sair
                                </button>

                                {/* Centro: Info */}
                                <div style={{ textAlign: 'center', flex: 1, paddingBottom: '4px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{activeTarget.name}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7, color: '#fff' }}>
                                        por {activeTarget.profiles?.full_name || activeTarget.profiles?.email?.split('@')[0] || 'UAU Code'}
                                    </div>
                                </div>

                                {/* Canto Direito: Fechar */}
                                <button 
                                    onClick={resetOverlays} 
                                    style={{ 
                                        padding: '10px 16px', 
                                        borderRadius: '16px', 
                                        background: 'var(--neon-purple)', 
                                        color: '#fff', 
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        boxShadow: '0 4px 12px rgba(188, 54, 194, 0.3)'
                                    }}
                                >
                                    Fechar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
