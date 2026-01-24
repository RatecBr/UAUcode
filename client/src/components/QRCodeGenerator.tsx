import { useEffect, useRef } from 'react';

interface QRCodeGeneratorProps {
    url: string;
    name: string;
    size?: number;
}

export default function QRCodeGenerator({ url, name, size = 200 }: QRCodeGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        generateQRCode();
    }, [url]);

    const generateQRCode = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use a lightweight QR code generation approach
        // We'll use the QRCode API via dynamic import
        try {
            // @ts-ignore - QRCode library loaded dynamically
            const QRCode = await import('qrcode');
            await QRCode.toCanvas(canvas, url, {
                width: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (e) {
            // Fallback: show URL as text if QRCode library not available
            console.error('QRCode generation failed:', e);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = '#000000';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('QR Code', size / 2, size / 2 - 10);
            ctx.fillText('(instale qrcode)', size / 2, size / 2 + 10);
        }
    };

    const downloadQR = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `qrcode-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{
                    borderRadius: '12px',
                    backgroundColor: '#fff'
                }}
            />
            <div style={{
                marginTop: '12px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)',
                wordBreak: 'break-all'
            }}>
                {url}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                    onClick={copyLink}
                    style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '13px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    Copiar Link
                </button>
                <button
                    onClick={downloadQR}
                    style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '13px',
                        backgroundColor: '#00ff9d',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#000',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Baixar QR
                </button>
            </div>
        </div>
    );
}
