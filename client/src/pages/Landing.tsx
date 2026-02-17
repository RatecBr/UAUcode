import { useNavigate } from 'react-router-dom';
import { Smartphone, Layers, ArrowRight, Play, Mic, Box, Eye, MessageCircle, Upload, Wand2, Share2 } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    const styles = {
        container: {
            minHeight: '100dvh',
            backgroundColor: '#0a0a0f',
            color: '#fff',
            overflowX: 'hidden' as const,
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        header: {
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '32px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 50%, var(--neon-red) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.05em'
        },
        hero: {
            padding: '80px 24px',
            textAlign: 'center' as const,
            position: 'relative' as const,
            maxWidth: '1000px',
            margin: '0 auto'
        },
        bgGlow: {
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(188, 54, 194, 0.15) 0%, transparent 70%)',
            zIndex: 0,
            pointerEvents: 'none' as const
        },
        h1: {
            fontSize: 'clamp(40px, 8vw, 84px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '24px',
            position: 'relative' as const,
            zIndex: 1
        },
        slogan: {
            fontSize: 'clamp(18px, 4vw, 24px)',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '40px',
            fontWeight: 400,
            maxWidth: '600px',
            margin: '0 auto 40px'
        },
        cta: {
            padding: '18px 36px',
            fontSize: '18px',
            fontWeight: 700,
            backgroundColor: '#BC36C2',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 0 30px rgba(188, 54, 194, 0.5)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        },
        section: {
            padding: '80px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative' as const,
            zIndex: 1
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            marginTop: '40px'
        },
        card: {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '32px',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s ease'
        },
        cardIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'rgba(188, 54, 194, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: '#BC36C2'
        },
        iconBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        cardTitle: {
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '12px'
        },
        cardText: {
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.5)',
            lineHeight: 1.6
        },
        stepNumber: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#BC36C2',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px',
            marginBottom: '16px'
        },
        arrow: {
            color: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '40px'
        },
        footer: {
            padding: '60px 24px',
            textAlign: 'center' as const,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '14px'
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={{ ...styles.logo, display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.png" alt="UAU Code Logo" className="logo-glow" style={{ height: '100px', objectFit: 'contain' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '50px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#BC36C2',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(188, 54, 194, 0.15)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(188, 54, 194, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Entrar
                    </button>
                </div>
            </header>

            <main>
                <section style={styles.hero}>
                    <div style={styles.bgGlow} />
                    <h1 style={styles.h1}>
                        <span className="neon-gradient-text">Imagens Inteligentes.</span>
                    </h1>
                    <p style={styles.slogan}>
                        Com UAU Code, a evolução do QR Code, suas fotos ganham vida.
                        É só apontar a câmera e a mágica acontece.
                        <strong> Experimente agora, 100% grátis e sem complicação.</strong>
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                        style={{ ...styles.cta, backgroundColor: 'unset', boxShadow: 'unset' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Criar minha conta grátis
                        <ArrowRight size={20} />
                    </button>
                </section>

                <section style={{ ...styles.section, paddingTop: '0' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#BC36C2', marginBottom: '8px' }}>É simples como 1, 2, 3</h2>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: '40px',
                        marginTop: '20px'
                    }}>
                        {/* Step 1 */}
                        <div style={{ flex: '1 1 250px', maxWidth: '300px', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, rgba(49, 86, 243, 0.1) 0%, rgba(188, 54, 194, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: '#BC36C2',
                                border: '1px solid rgba(188, 54, 194, 0.2)'
                            }}>
                                <Upload size={32} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>1. Suba uma foto</h3>
                            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                                Tire uma foto ou suba uma imagem que você queira dar vida. Pode ser um cartão, um rótulo ou quadro.
                            </p>
                        </div>

                        <div style={{ ...styles.arrow, color: '#BC36C2' }} className="hide-mobile">
                            <ArrowRight size={32} />
                        </div>

                        {/* Step 2 */}
                        <div style={{ flex: '1 1 250px', maxWidth: '300px', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, rgba(49, 86, 243, 0.1) 0%, rgba(188, 54, 194, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: '#BC36C2',
                                border: '1px solid rgba(188, 54, 194, 0.2)'
                            }}>
                                <Wand2 size={32} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>2. Adicione a mágica</h3>
                            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                                Escolha o que vai acontecer: um vídeo que toca sobre a imagem, um áudio ou até um objeto 3D flutuante.
                            </p>
                        </div>

                        <div style={{ ...styles.arrow, color: '#3156F3' }} className="hide-mobile">
                            <ArrowRight size={32} />
                        </div>

                        {/* Step 3 */}
                        <div style={{ flex: '1 1 250px', maxWidth: '300px', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, rgba(49, 86, 243, 0.1) 0%, rgba(188, 54, 194, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: '#BC36C2',
                                border: '1px solid rgba(188, 54, 194, 0.2)'
                            }}>
                                <Share2 size={32} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>3. Pronto para usar</h3>
                            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                                Use seu link exclusivo. Seu cliente só precisa apontar a câmera. Sem baixar apps!
                            </p>
                        </div>
                    </div>
                </section>

                <section style={styles.section}>
                    <h2 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '16px' }}>
                        Por que usar o UAU Code?
                    </h2>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Transforme imagens estáticas em algo extraordinário
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                        <img src="/logo.png" alt="UAU Code Logo" style={{ width: '280px', height: 'auto', objectFit: 'contain' }} />
                    </div>
                    <div style={styles.grid}>
                        <div style={styles.card}>
                            <div style={styles.cardIcon}><Smartphone size={24} /></div>
                            <h3 style={styles.cardTitle}>Sem Aplicativos</h3>
                            <p style={styles.cardText}>
                                Nada de App Store ou Google Play. Seu cliente só precisa da câmera do celular e 1 segundo para ver a mágica.
                            </p>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.cardIcon}><Eye size={24} /></div>
                            <h3 style={styles.cardTitle}>Acessibilidade Real</h3>
                            <p style={styles.cardText}>
                                Transforme rótulos e etiquetas em áudio. UAU Code permite que pessoas cegas ou com baixa visão "leiam" produtos apenas apontando o celular.
                            </p>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.cardIcon}><Layers size={24} /></div>
                            <h3 style={styles.cardTitle}>Multimídia Total</h3>
                            <p style={styles.cardText}>
                                Dê voz às suas fotos com vídeos, áudios imersivos ou até modelos 3D que flutuam sobre o papel.
                            </p>
                        </div>
                    </div>
                </section>

                <section style={{ ...styles.section, backgroundColor: 'rgba(188, 54, 194, 0.02)', borderRadius: '40px', border: '1px solid rgba(188, 54, 194, 0.05)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: '48px' }}>
                        <div style={{ flex: '1 1 400px' }}>
                            <h2 style={{ fontSize: '36px', marginBottom: '24px' }}>
                                O que você pode criar?
                            </h2>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ color: '#BC36C2', marginTop: '4px' }}><Play size={20} /></div>
                                    <div>
                                        <strong>Cartões de Visita com Vídeo</strong>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                                            Imagine seu cartão de papel começando a rodar um vídeo de apresentação assim que alguém olha pra ele.
                                        </p>
                                    </div>
                                </li>
                                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ color: '#3156F3', marginTop: '4px' }}><Mic size={20} /></div>
                                    <div>
                                        <strong>Cardápios que falam</strong>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                                            Áudios explicativos sobre cada prato do seu menu direto na mesa do cliente.
                                        </p>
                                    </div>
                                </li>
                                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ color: '#F5464A', marginTop: '4px' }}><Box size={20} /></div>
                                    <div>
                                        <strong>Produtos em 3D</strong>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                                            Mostre seus móveis, roupas ou embalagens em 3D sobre o mundo real.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                            <div className="glass-card" style={{ padding: '40px', display: 'inline-block' }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⭐</div>
                                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Sua marca no próximo nível.</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
                                    Saia do óbvio e surpreenda quem te vê.
                                    <br /><br />
                                    <strong>Transforme imagens estáticas em algo extraordinário</strong>
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn-primary"
                                    style={{ width: '100%', borderRadius: '12px' }}
                                >
                                    Começar Grátis
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer style={styles.footer}>
                <p style={{ marginBottom: '24px' }}>UAU Code © 2026. A evolução do QR Code.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '32px' }}>
                    <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Login</span>
                    <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Privacidade</span>
                    <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Termos</span>
                </div>
                <button
                    onClick={() => window.open('https://api.whatsapp.com/send?phone=5561981005548', '_blank')}
                    style={{
                        margin: '0 auto',
                        background: 'transparent',
                        border: '1px solid rgba(37, 211, 102, 0.3)',
                        color: '#25D366',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 211, 102, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <MessageCircle size={20} /> Falar com um consultor
                </button>
            </footer>
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
                    50% { transform: translateY(-20px) rotate(5deg); opacity: 0.4; }
                    100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
                }
                .bubble {
                    position: absolute;
                    border-radius: 50%;
                    background: radial-gradient(circle, var(--color) 0%, transparent 70%);
                    filter: blur(40px);
                    z-index: 0;
                    opacity: 0.2;
                    animation: float 6s ease-in-out infinite;
                }
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                }
            `}</style>
            
            {/* Background elements */}
            <div className="bubble" style={{ top: '10%', left: '10%', width: '300px', height: '300px', '--color': 'var(--neon-blue)', animationDelay: '0s' } as React.CSSProperties} />
            <div className="bubble" style={{ top: '60%', right: '5%', width: '400px', height: '400px', '--color': 'var(--neon-purple)', animationDelay: '2s' } as React.CSSProperties} />
            <div className="bubble" style={{ bottom: '5%', left: '15%', width: '250px', height: '250px', '--color': 'var(--neon-red)', animationDelay: '4s' } as React.CSSProperties} />

        </div>
    );
}
