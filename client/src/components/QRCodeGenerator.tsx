import { useEffect, useRef, useCallback } from 'react';

interface QRCodeGeneratorProps {
    url: string;
    name: string;
    size?: number;
}

export default function QRCodeGenerator({ url, name, size = 256 }: QRCodeGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);

    const generateQRCode = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            const QRCode = await import('qrcode');
            await QRCode.toCanvas(canvas, url, {
                width: size,
                margin: 2,
                color: {
                    dark: '#5A1A5E',  // Roxo escuro
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'H'  // High error correction for logo overlay
            });

            {/* Add logo overlay in center */}
            if (logoRef.current && logoRef.current.complete) {
                const logoSize = size * 0.24;  // 24% of QR size (Increased from 20%)
                const logoX = (size - logoSize) / 2;
                const logoY = (size - logoSize) / 2;

                // White circle background for logo
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, logoSize / 2 + 5, 0, Math.PI * 2);
                ctx.fill();

                // Draw logo with high quality smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(logoRef.current, logoX, logoY, logoSize, logoSize);
            }
        } catch (e) {
            console.error('QR Code generation failed:', e);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = '#5A1A5E';
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('QR Code', size / 2, size / 2);
        }
    }, [url, size]);

    useEffect(() => {
        generateQRCode();
    }, [generateQRCode]);

    const downloadQR = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `uaucode-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert('✅ Link copiado!');
    };

    const shareWhatsApp = () => {
        const text = `🎯 Confira minha experiência AR: *${name}*\n\n${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {/* Hidden logo image for canvas overlay */}
            <img 
                ref={logoRef} 
                src="/logo.png" 
                alt="UAU Logo" 
                style={{ display: 'none' }}
                onLoad={generateQRCode}
            />
            
            <h3 style={{
                fontSize: '22px',
                fontWeight: 800,
                marginBottom: '20px',
                color: '#fff',
                textShadow: '0 0 20px rgba(188, 54, 194, 0.5)'
            }}>
                UAU Code
            </h3>

            <div style={{
                display: 'inline-block',
                padding: '20px',
                background: '#fff',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
                <canvas
                    ref={canvasRef}
                    width={size}
                    height={size}
                    style={{
                        borderRadius: '8px',
                        display: 'block',
                    }}
                />
            </div>

            <div style={{
                marginTop: '20px',
                fontSize: '13px',
                color: '#fff',
                fontWeight: 500,
                wordBreak: 'break-all',
                maxWidth: size + 'px',
                margin: '20px auto 0',
                padding: '10px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px'
            }}>
                {url}
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '20px',
                maxWidth: size + 'px',
                margin: '20px auto 0'
            }}>
                <button
                    onClick={copyLink}
                    title="Copiar Link"
                    style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    📋
                </button>

                <button
                    onClick={shareWhatsApp}
                    style={{
                        flex: 2,
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: 700,
                        background: '#25D366',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    💬 WhatsApp
                </button>

                <button
                    onClick={downloadQR}
                    title="Baixar QR Code"
                    style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(188, 54, 194, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    ⬇️
                </button>
            </div>
        </div>
    );
}
