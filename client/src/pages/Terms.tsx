import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
    const navigate = useNavigate();

    const styles = {
        container: {
            backgroundColor: '#0a0a0f',
            color: '#fff',
            minHeight: '100vh',
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        header: {
            padding: '40px 24px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.2s'
        },
        content: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '24px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
        },
        h1: {
            fontSize: '32px',
            fontWeight: 800,
            marginBottom: '16px',
            color: '#BC36C2'
        },
        h2: {
            fontSize: '24px',
            fontWeight: 700,
            marginTop: '40px',
            marginBottom: '16px',
            color: '#fff'
        },
        p: {
            marginBottom: '16px',
            fontSize: '16px'
        },
        ul: {
            paddingLeft: '24px',
            marginBottom: '16px'
        },
        li: {
            marginBottom: '8px'
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button style={styles.backButton} onClick={() => navigate('/login')}>
                    <ArrowLeft size={16} /> Voltar para login
                </button>
            </header>

            <main style={styles.content}>
                <h1 style={styles.h1}>Termos de Serviço</h1>
                <p style={styles.p}>Última atualização: 18/02/2026</p>

                <h2 style={styles.h2}>1. Aceitação dos Termos</h2>
                <p style={styles.p}>Ao acessar e usar o UAU Code, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concorda com qualquer parte destes termos, não deve usar nosso serviço.</p>

                <h2 style={styles.h2}>2. Descrição do Serviço</h2>
                <p style={styles.p}>O UAU Code é uma plataforma de realidade aumentada que permite:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Dar vida a imagens estáticas através de reconhecimento de imagem e inteligência artificial</li>
                    <li style={styles.li}>Associar vídeos, áudios e modelos 3D a imagens físicas</li>
                    <li style={styles.li}>Acessar ferramentas de acessibilidade digital e interação</li>
                </ul>

                <h2 style={styles.h2}>3. Conta de Usuário</h2>
                <p style={styles.p}>Para usar nossos serviços, você deve:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Fornecer informações precisas e completas durante o registro</li>
                    <li style={styles.li}>Manter a segurança de sua conta e senha</li>
                    <li style={styles.li}>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                    <li style={styles.li}>Ser responsável por todas as atividades em sua conta</li>
                </ul>

                <h2 style={styles.h2}>4. Uso Aceitável</h2>
                <p style={styles.p}>Você concorda em não usar o serviço para:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Atividades ilegais ou não autorizadas</li>
                    <li style={styles.li}>Violar direitos de propriedade intelectual</li>
                    <li style={styles.li}>Transmitir conteúdo ofensivo, difamatório ou prejudicial</li>
                    <li style={styles.li}>Interferir com a segurança ou funcionalidade do serviço</li>
                </ul>

                <h2 style={styles.h2}>5. Planos e Pagamentos</h2>
                <p style={styles.p}>Nossos serviços incluem:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Plano Gratuito: Acesso básico para novos usuários</li>
                    <li style={styles.li}>Planos Pagos: Acesso a recursos premium e maior volume de escaneamentos</li>
                    <li style={styles.li}>Política de Reembolso: Conforme nossa política de cancelamento</li>
                </ul>

                <h2 style={styles.h2}>6. Propriedade Intelectual</h2>
                <p style={styles.p}>O UAU Code e todo seu conteúdo, recursos e funcionalidades são propriedade exclusiva nossa e de nossos licenciadores, protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.</p>

                <h2 style={styles.h2}>7. Limitação de Responsabilidade</h2>
                <p style={styles.p}>O serviço é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será ininterrupto, livre de erros ou completamente seguro. Nossa responsabilidade é limitada ao máximo permitido por lei.</p>

                <h2 style={styles.h2}>8. Modificações dos Termos</h2>
                <p style={styles.p}>Reservamos o direito de modificar estes termos a qualquer momento. As alterações serão efetivas imediatamente após a publicação. O uso continuado do serviço constitui aceitação dos termos modificados.</p>

                <h2 style={styles.h2}>9. Contato</h2>
                <p style={styles.p}>Para questões sobre estes Termos de Serviço, entre em contato conosco através da nossa página de contato ou pelo email <a href="mailto:ra.tec.brasil@gmail.com" style={{color: '#BC36C2'}}>ra.tec.brasil@gmail.com</a>.</p>
            </main>

            <Footer />
        </div>
    );
}
