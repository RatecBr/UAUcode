import { useNavigate } from 'react-router-dom';
import { Instagram, Youtube, Mail } from 'lucide-react';

export default function Footer() {
    const navigate = useNavigate();

    const styles = {
        footer: {
            backgroundColor: '#050508',
            color: '#fff',
            padding: '60px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
        },
        column: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '16px'
        },
        logo: {
            fontSize: '24px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 50%, var(--neon-red) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            display: 'inline-block'
        },
        description: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            lineHeight: '1.6',
            maxWidth: '300px'
        },
        social: {
            display: 'flex',
            gap: '16px',
            marginTop: '16px'
        },
        socialIcon: {
            color: 'rgba(255, 255, 255, 0.6)',
            transition: 'color 0.2s',
            cursor: 'pointer'
        },
        title: {
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '16px',
            color: '#fff'
        },
        link: {
            color: 'rgba(255, 255, 255, 0.6)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.2s',
            cursor: 'pointer'
        },
        bottom: {
            marginTop: '60px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center' as const,
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '8px',
            alignItems: 'center'
        },
        heart: {
            color: '#ff4757',
            display: 'inline-block',
            margin: '0 4px'
        }
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                {/* Brand Column */}
                <div style={styles.column}>
                    <h2 style={styles.logo}>UAU Code</h2>
                    <p style={styles.description}>
                        Ferramenta de inteligência artificial para reconhecer imagens e dar vida a objetos estáticos. Timeline interativa, IA fluida e sistema revolucionário.
                    </p>
                    <div style={styles.social}>
                        <a href="https://www.instagram.com/ra.tec.br/" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                            <Instagram size={20} />
                        </a>
                        <a href="https://www.youtube.com/@ra.tec.brasil" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                            <Youtube size={20} />
                        </a>
                        <a href="mailto:ra.tec.brasil@gmail.com" style={styles.socialIcon}>
                            <Mail size={20} />
                        </a>
                    </div>
                </div>

                {/* Resources Column */}
                <div style={styles.column}>
                    <h3 style={styles.title}>Recursos</h3>
                    <span onClick={() => navigate('/')} style={styles.link}>Como Funciona</span>
                    <span onClick={() => navigate('/')} style={styles.link}>Sobre</span>
                    <span onClick={() => navigate('/')} style={styles.link}>Preços</span>
                    <span onClick={() => navigate('/')} style={styles.link}>Acessibilidade</span>
                </div>

                {/* Support Column */}
                <div style={styles.column}>
                    <h3 style={styles.title}>Suporte</h3>
                    <span onClick={() => navigate('/')} style={styles.link}>FAQ</span>
                    <a href="mailto:ra.tec.brasil@gmail.com" style={styles.link}>Contato</a>
                    <span onClick={() => navigate('/privacy')} style={styles.link}>Privacidade</span>
                    <span onClick={() => navigate('/terms')} style={styles.link}>Termos</span>
                </div>
            </div>

            <div style={styles.bottom}>
                <div>
                    Feito com <span style={styles.heart}>❤</span> para a comunidade brasileira
                </div>
                <div>
                    © 2026 UAU Code. Todos os direitos reservados.
                </div>
                <div style={{ marginTop: '8px' }}>
                    Contato: <a href="https://api.whatsapp.com/send?phone=5562981173666" style={{ ...styles.link, color: '#25D366' }}>(62) 98117-3666</a> | <a href="mailto:ra.tec.brasil@gmail.com" style={styles.link}>ra.tec.brasil@gmail.com</a>
                </div>
            </div>
        </footer>
    );
}
