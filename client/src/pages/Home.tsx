import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Play, Box, Eye, Upload, Share2 } from 'lucide-react';
import Footer from '../components/Footer';
import CreationForm from '../components/Creation/CreationForm';
import LoginModal from '../components/Auth/LoginModal';
import { useAuth } from '../AuthContext';
import { useCreation } from '../contexts/CreationContext';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isPendingAuth, setIsPendingAuth } = useCreation();
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Se o usuário logar e tiver uma criação pendente, redireciona para a biblioteca (onde o upload continuará)
    useEffect(() => {
        if (user && isPendingAuth) {
            navigate('/library'); // Vamos criar essa rota em breve
        }
    }, [user, isPendingAuth, navigate]);

    const handleCreationSuccess = () => {
        if (!user) {
            setIsPendingAuth(true);
            setShowLoginModal(true);
        } else {
            // Se já estiver logado, vai direto para salvar (na biblioteca ou aqui mesmo)
            navigate('/library');
        }
    };

    const styles = {
        container: {
            minHeight: '100%',
            backgroundColor: 'var(--background)',
            color: 'var(--text)',
            overflowX: 'hidden' as const,
            fontFamily: 'Inter, system-ui, sans-serif',
            paddingBottom: '40px'
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
            letterSpacing: '0.05em',
            cursor: 'pointer'
        },
        navBtn: {
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            transition: 'opacity 0.2s',
            opacity: 0.8
        },
        loginBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '50px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
        },
        hero: {
            padding: '40px 24px',
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
            fontSize: 'clamp(32px, 6vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '16px',
            position: 'relative' as const,
            zIndex: 1
        },
        slogan: {
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: 'var(--text-muted)',
            marginBottom: '40px',
            fontWeight: 400,
            maxWidth: '600px',
            margin: '0 auto'
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
            gap: '24px',
            marginTop: '40px'
        },
        card: {
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--glass-border)',
            padding: '24px',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)'
        },
        cardIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(188, 54, 194, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: '#BC36C2'
        },
        cardTitle: {
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text)'
        },
        cardText: {
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: 1.5
        }
    };

    return (
        <div style={styles.container}>


            <main>
                <section style={styles.hero}>
                    <div style={styles.bgGlow} />
                    <h1 style={styles.h1}>
                        <span className="neon-gradient-text">Imagens Inteligentes!</span>
                    </h1>
                    <p style={styles.slogan}>
                       Crie a Mágica Agora! É só tirar uma foto, escolher o conteúdo e pronto.
  <p></p>
                    </p>
                    
                    {/* NEW CREATION FORM */}
                    <CreationForm onSuccess={handleCreationSuccess} />

                </section>

                <section id="how-it-works" style={styles.section}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#BC36C2', marginBottom: '8px' }}>Como Funciona?</h2>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '24px'
                    }}>
                        {/* Simplified steps */}
                        <div style={{ flex: '1 1 200px', maxWidth: '300px', textAlign: 'center', opacity: 0.9 }}>
                            <div style={{ margin: '0 auto 16px', color: 'var(--neon-purple)' }}><Upload size={32} /></div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>1. Escolha a Foto</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Qualquer imagem serve! Tire uma foto ou suba uma imagem que você queira dar vida. Pode ser um cartão, um rótulo ou quadro. </p>
                        </div>
                        <div style={{ flex: '1 1 200px', maxWidth: '300px', textAlign: 'center', opacity: 0.9 }}>
                            <div style={{ margin: '0 auto 16px', color: 'var(--neon-blue)' }}><Play size={32} /></div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>2. Adicione o Conteúdo</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Escolha o que vai acontecer: um vídeo que toca sobre a imagem, uma página da internet, um áudio ou até um objeto 3D flutuante.</p>
                        </div>
                         <div style={{ flex: '1 1 200px', maxWidth: '300px', textAlign: 'center', opacity: 0.9 }}>
                            <div style={{ margin: '0 auto 16px', color: 'var(--neon-red)' }}><Share2 size={32} /></div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>3. Compartilhe facilmente</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Link direto para a magia. Use seu link exclusivo. Seu cliente só precisa apontar a câmera. Sem baixar apps!</p>
                        </div>
                    </div>
                </section>

                <section id="about" style={{ ...styles.section, paddingTop: 0 }}>
                    <div style={styles.grid}>
                        <div style={styles.card}>
                            <div style={styles.cardIcon}><Smartphone size={20} /></div>
                            <h3 style={styles.cardTitle}>Sem Apps</h3>
                            <p style={styles.cardText}>Funciona direto no navegador. Nada de App Store ou Google Play. Seu cliente só precisa da câmera do celular e 1 segundo para ver a mágica.</p>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.cardIcon}><Eye size={20} /></div>
                            <h3 style={styles.cardTitle}>Acessível</h3>
                            <p style={styles.cardText}>Ideal para inclusão e acessibilidade. Transforme rótulos e etiquetas em áudio. UAU Code permite que pessoas cegas ou com baixa visão "leiam" produtos apenas apontando o celular.</p>
                        </div>
                         <div style={styles.card}>
                            <div style={styles.cardIcon}><Box size={20} /></div>
                            <h3 style={styles.cardTitle}>3D & Video</h3>
                            <p style={styles.cardText}>Suporte total a múltiplas mídiasDê voz às suas fotos com vídeos, áudios imersivos ou até modelos 3D que flutuam sobre o papel.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)} 
                onSuccess={() => {
                    setShowLoginModal(false);
                    if (isPendingAuth) navigate('/library');
                }}
            />

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                }
            `}</style>
            
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, rgba(10, 10, 15, 0) 0%, var(--background) 100%)' }} />
        </div>
    );
}
