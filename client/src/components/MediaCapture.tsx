import { useState, useRef, useEffect } from 'react';
import { X, Circle, StopCircle, RefreshCw, Check, Video, Mic } from 'lucide-react';
import { optimizeImage, getVideoRecorderOptions, getAudioRecorderOptions } from '../utils/fileOptimizer';

interface MediaCaptureProps {
    mode: 'photo' | 'video' | 'audio';
    onCapture: (file: File) => void;
    onClose: () => void;
}

export default function MediaCapture({ mode, onCapture, onClose }: MediaCaptureProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [timer, setTimer] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
    };

    const startStream = async () => {
        try {
            // stopStream(); // Removed to avoid sync setState in useEffect
            // Instead rely on useEffect cleanup or ensure logic handles existing stream
            const isPortrait = window.innerHeight > window.innerWidth;
            const constraints: MediaStreamConstraints = {
                video: mode === 'audio' ? false : {
                    facingMode,
                    width: { ideal: isPortrait ? 720 : 1280 },
                    height: { ideal: isPortrait ? 1280 : 720 },
                    aspectRatio: { ideal: isPortrait ? 0.5625 : 1.777 }
                },
                audio: mode !== 'photo'
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current && mode !== 'audio') {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Error accessing media:", err);
            alert("Erro ao acessar câmera/microfone: " + (err as Error).message);
            onClose();
        }
    };

    useEffect(() => {
        startStream();
        return () => {
            stopStream();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [facingMode]);


    const takePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const tempFile = new File([blob], 'temp.jpg', { type: 'image/jpeg' });
                    // Aplica compressão extrema: 800px é o ideal para o motor OpenCV mobile
                    const optimized = await optimizeImage(tempFile, 800, 0.6);
                    setCapturedBlob(optimized);
                    stopStream();
                }
            }, 'image/jpeg', 0.8);
        }
    };

    const startRecording = () => {
        if (!stream) return;
        chunksRef.current = [];

        // Aplica opções de bitrate e codec
        const options = mode === 'video' ? getVideoRecorderOptions() : getAudioRecorderOptions();
        const recorder = new MediaRecorder(stream, options);

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
            const mimeType = (options as any).mimeType || (mode === 'video' ? 'video/webm' : 'audio/webm');
            const blob = new Blob(chunksRef.current, { type: mimeType });
            setCapturedBlob(blob);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setTimer(0);
        timerRef.current = window.setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            stopStream();
        }
    };

    const handleConfirm = () => {
        if (capturedBlob) {
            let ext = mode === 'photo' ? 'jpg' : 'webm';
            if (capturedBlob.type.includes('mp4')) ext = 'mp4';
            if (capturedBlob.type.includes('mpeg') || capturedBlob.type.includes('m4a')) ext = 'm4a';
            
            const file = new File([capturedBlob], `capture-${Date.now()}.${ext}`, { type: capturedBlob.type });
            onCapture(file);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const localStyles = {
        overlay: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
        },
        container: {
            width: '100%',
            maxWidth: '500px',
            height: '100%',
            maxHeight: '800px',
            display: 'flex',
            flexDirection: 'column' as const,
            backgroundColor: '#0a0a0f',
            position: 'relative' as const
        },
        header: {
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        },
        title: {
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: '#fff'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer'
        },
        previewContainer: {
            flex: 1,
            position: 'relative' as const,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        },
        preview: {
            width: '100%',
            height: '100%',
            objectFit: 'cover' as const
        },
        audioPreview: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
        },
        instructions: {
            marginTop: '12px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)'
        },
        timer: {
            marginTop: '12px',
            fontSize: '24px',
            fontWeight: 700,
            color: '#ff4757',
            fontFamily: 'monospace'
        },
        timerBadge: {
            position: 'absolute' as const,
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,71,87,0.8)',
            padding: '6px 12px',
            borderRadius: '20px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'monospace'
        },
        footer: {
            padding: '30px 20px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
        },
        captureBtn: {
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
        },
        iconBtn: {
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            gap: '4px'
        },
        confirmBtn: {
            backgroundColor: '#00ff9d',
            color: '#000',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
        }
    };

    return (
        <div style={localStyles.overlay}>
            <div style={localStyles.container}>
                <div style={localStyles.header}>
                    <h3 style={localStyles.title}>
                        {mode === 'photo' ? 'Tirar Foto' : mode === 'video' ? 'Gravar Vídeo' : 'Gravar Áudio'}
                    </h3>
                    <button onClick={onClose} style={localStyles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div style={localStyles.previewContainer}>
                    {mode !== 'audio' && (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{
                                ...localStyles.preview,
                                display: capturedBlob ? 'none' : 'block'
                            }}
                        />
                    )}

                    {capturedBlob && mode === 'photo' && (
                        <img src={URL.createObjectURL(capturedBlob)} style={localStyles.preview} />
                    )}

                    {capturedBlob && mode === 'video' && (
                        <video src={URL.createObjectURL(capturedBlob)} controls style={localStyles.preview} />
                    )}

                    {capturedBlob && mode === 'audio' && (
                        <div style={localStyles.audioPreview}>
                            <Mic size={48} color="#00ff9d" />
                            <audio src={URL.createObjectURL(capturedBlob)} controls style={{ marginTop: '20px' }} />
                        </div>
                    )}

                    {mode === 'audio' && !capturedBlob && (
                        <div style={localStyles.audioPreview}>
                            <Mic size={48} color={isRecording ? '#ff4757' : '#00ff9d'} className={isRecording ? 'pulse' : ''} />
                            {isRecording && <div style={localStyles.timer}>{formatTime(timer)}</div>}
                            {!isRecording && <div style={localStyles.instructions}>Toque para gravar áudio</div>}
                        </div>
                    )}

                    {isRecording && mode === 'video' && (
                        <div style={localStyles.timerBadge}>{formatTime(timer)}</div>
                    )}
                </div>

                <div style={localStyles.footer}>
                    {!capturedBlob ? (
                        <>
                            {mode !== 'audio' && (
                                <button
                                    onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')}
                                    style={localStyles.iconBtn}
                                >
                                    <RefreshCw size={24} />
                                </button>
                            )}

                            {mode === 'photo' ? (
                                <button onClick={takePhoto} style={localStyles.captureBtn}>
                                    <Circle size={48} />
                                </button>
                            ) : (
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    style={{
                                        ...localStyles.captureBtn,
                                        color: isRecording ? '#ff4757' : '#00ff9d'
                                    }}
                                >
                                    {isRecording ? <StopCircle size={48} /> : mode === 'video' ? <Video size={48} /> : <Circle size={48} />}
                                </button>
                            )}

                            <div style={{ width: 44 }}></div>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { setCapturedBlob(null); startStream(); }} style={localStyles.iconBtn}>
                                <RefreshCw size={24} />
                                <span style={{ fontSize: '12px' }}>Refazer</span>
                            </button>
                            <button onClick={handleConfirm} style={localStyles.confirmBtn}>
                                <Check size={24} />
                                Confirmar
                            </button>
                        </>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .pulse { animation: pulse 1.5s infinite; }
            `}</style>
        </div>
    );
}
