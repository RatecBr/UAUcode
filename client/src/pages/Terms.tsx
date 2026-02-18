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
        h3: {
            fontSize: '18px',
            fontWeight: 600,
            marginTop: '24px',
            marginBottom: '12px',
            color: 'rgba(255, 255, 255, 0.9)'
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
                <h1 style={styles.h1}>Termos de Uso</h1>
                <p style={styles.p}>Última atualização: 18 de fevereiro de 2026</p>

                <h2 style={styles.h2}>1. Introdução</h2>
                <p style={styles.p}>Bem-vindo ao UAU Code. Ao acessar ou utilizar nossa plataforma de Rrealidade Aumentada (AR), você concorda com estes Termos de Uso. A plataforma permite associar conteúdos digitais (vídeos, áudios e modelos 3D) a imagens físicas ("tags") através da câmera de dispositivos móveis.</p>

                <h2 style={styles.h2}>2. Definições de Serviço</h2>
                <p style={styles.p}>O serviço UAU Code oferece:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Hospedagem de conteúdo multimídia associado a imagens.</li>
                    <li style={styles.li}>Ferramenta de escaneamento via navegador (WebAR).</li>
                    <li style={styles.li}>Painel de gerenciamento para criação e edição de experiências.</li>
                </ul>

                <h2 style={styles.h2}>3. Responsabilidades do Usuário</h2>
                <p style={styles.p}>Você declara e garante que:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>É proprietário ou possui os direitos necessários sobre todo o conteúdo (imagens, vídeos, áudios) que enviar para a plataforma.</li>
                    <li style={styles.li}>Não utilizará o serviço para disseminar conteúdo ilegal, ofensivo, pornográfico, difamatório ou que viole direitos de terceiros.</li>
                    <li style={styles.li}>Não tentará violar a segurança, realizar engenharia reversa ou sobrecarregar a infraestrutura do serviço.</li>
                </ul>

                <h2 style={styles.h2}>4. Conteúdo Gerado pelo Usuário</h2>
                <p style={styles.p}>O UAU Code não reivindica propriedade sobre o conteúdo enviado por você. No entanto, ao usar o serviço, você concede ao UAU Code uma licença mundial, não exclusiva e livre de royalties para hospedar, armazenar, modificar (para fins de otimização técnica) e exibir tal conteúdo exclusivamente para a prestação do serviço.</p>
                <p style={styles.p}>Reservamo-nos o direito de remover qualquer conteúdo que viole estes termos ou a legislação aplicável, sem aviso prévio.</p>

                <h2 style={styles.h2}>5. Planos e Pagamentos</h2>
                <p style={styles.p}>O uso do serviço pode estar sujeito a taxas de assinatura ou planos pré-pagos, detalhados na página de preços.</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>O atraso no pagamento pode resultar na suspensão temporária das experiências AR criadas.</li>
                    <li style={styles.li}>Cancelamentos devem ser solicitados antes da renovação automática do período contratado.</li>
                </ul>

                <h2 style={styles.h2}>6. Limitação de Responsabilidade</h2>
                <p style={styles.p}>O serviço é fornecido "no estado em que se encontra". O UAU Code não garante que o reconhecimento de imagem funcionará em todas as condições de iluminação, qualidade de câmera ou estado físico do material impresso. Em nenhum caso seremos responsáveis por danos indiretos, incidentais ou perda de dados.</p>

                <h2 style={styles.h2}>7. Alterações</h2>
                <p style={styles.p}>O UAU Code pode revisar estes termos a qualquer momento. Ao continuar a usar o serviço após as alterações, você concorda com os novos termos.</p>

                <h2 style={styles.h2}>8. Contato</h2>
                <p style={styles.p}>Dúvidas sobre os termos podem ser enviadas para <a href="mailto:ra.tec.brasil@gmail.com" style={{color: '#BC36C2'}}>ra.tec.brasil@gmail.com</a>.</p>
            </main>

            <Footer />
        </div>
    );
}
