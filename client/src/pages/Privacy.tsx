import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
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
                <h1 style={styles.h1}>Política de Privacidade</h1>
                <p style={styles.p}>Última atualização: 18 de fevereiro de 2026</p>

                <h2 style={styles.h2}>1. Coleta de Informações (Dados Pessoais)</h2>
                <p style={styles.p}>O UAU Code trata dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Coletamos as seguintes categorias de dados:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}><strong>Dados de Cadastro:</strong> Nome completo, endereço de e-mail e senha (armazenada de forma criptografada).</li>
                    <li style={styles.li}><strong>Dados de Uso:</strong> Imagens de referência ("targets"), arquivos multimídia associados, logs de acesso e estatísticas de escaneamento.</li>
                    <li style={styles.li}><strong>Dados Técnicos:</strong> Endereço IP, tipo de dispositivo, navegador, sistema operacional e cookies essenciais.</li>
                </ul>

                <h2 style={styles.h2}>2. Uso de Imagens e Câmera</h2>
                <p style={styles.p}>Ao usar a funcionalidade de reconhecimento de imagem (WebAR):</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>A câmera do seu dispositivo é acessada apenas enquanto você está na página de escaneamento.</li>
                    <li style={styles.li}>O processamento da imagem da câmera ocorre localmente no seu dispositivo (client-side) sempre que possível, para fins de reconhecimento.</li>
                    <li style={styles.li}>Não coletamos nem armazenamos o feed de vídeo da sua câmera em nossos servidores, exceto para fins de logs técnicos de erro caso solicitado (apenas metadados).</li>
                </ul>

                <h2 style={styles.h2}>3. Armazenamento e Compartilhamento</h2>
                <p style={styles.p}>Seus dados são armazenados na infraestrutura do Supabase (PostgreSQL), um provedor que cumpre padrões de segurança como SOC2 e GDPR.</p>
                <ul style={styles.ul}>
                    <li style={styles.li}><strong>Não vendemos seus dados</strong> para terceiros.</li>
                    <li style={styles.li}>Compartilhamos dados apenas com provedores de serviço essenciais (hospedagem, processamento de pagamentos) ou se exigido por lei.</li>
                </ul>

                <h2 style={styles.h2}>4. Seus Direitos (LGPD)</h2>
                <p style={styles.p}>Você tem o direito de solicitar a qualquer momento:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>A confirmação da existência de tratamento de seus dados.</li>
                    <li style={styles.li}>O acesso aos dados que possuímos sobre você.</li>
                    <li style={styles.li}>A correção de dados incompletos, inexatos ou desatualizados.</li>
                    <li style={styles.li}>A anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                    <li style={styles.li}>A eliminação dos dados pessoais tratados com o seu consentimento.</li>
                </ul>

                <h2 style={styles.h2}>5. Exclusão de Conta</h2>
                <p style={styles.p}>Para solicitar a exclusão da sua conta e de todos os dados associados, entre em contato através do e-mail abaixo. A exclusão será processada em até 30 dias, salvo obrigações legais de retenção.</p>

                <h2 style={styles.h2}>6. Segurança</h2>
                <p style={styles.p}>Adotamos medidas técnicas como criptografia (HTTPS/SSL), Row Level Security (RLS) no banco de dados e autenticação segura para proteger suas informações contra acesso não autorizado.</p>

                <h2 style={styles.h2}>7. Contato e Encarregado (DPO)</h2>
                <p style={styles.p}>Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:</p>
                <div style={{
                    marginTop: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <p style={{margin: 0}}><strong>E-mail:</strong> <a href="mailto:ra.tec.brasil@gmail.com" style={{color: '#fff'}}>ra.tec.brasil@gmail.com</a></p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
