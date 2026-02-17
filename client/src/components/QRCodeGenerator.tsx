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

            // Add logo overlay in center
            if (logoRef.current && logoRef.current.complete) {
                const logoSize = size * 0.2;  // 20% of QR size
                const logoX = (size - logoSize) / 2;
                const logoY = (size - logoSize) / 2;

                // White circle background for logo
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, logoSize / 2 + 6, 0, Math.PI * 2);
                ctx.fill();

                // Draw logo
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
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '16px',
                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple), var(--neon-red))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                UAU Code
            </h3>

            <div style={{
                display: 'inline-block',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 30px rgba(188, 54, 194, 0.3), 0 0 60px rgba(49, 86, 243, 0.2)'
            }}>
                <canvas
                    ref={canvasRef}
                    width={size}
                    height={size}
                    style={{
                        borderRadius: '12px',
                        display: 'block',
                        backgroundColor: '#fff'
                    }}
                />
            </div>

            <div style={{
                marginTop: '16px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
                wordBreak: 'break-all',
                maxWidth: size + 'px',
                margin: '16px auto 0'
            }}>
                {url}
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginTop: '16px',
                maxWidth: size + 'px',
                margin: '16px auto 0'
            }}>
                <button
                    onClick={copyLink}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    📋 Copiar Link
                </button>

                <button
                    onClick={shareWhatsApp}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
                    }}
                >
                    💬 WhatsApp
                </button>

                <button
                    onClick={downloadQR}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(188, 54, 194, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(188, 54, 194, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(188, 54, 194, 0.3)';
                    }}
                >
                    ⬇️ Baixar
                </button>
            </div>
        </div>
    );
}
