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
                <p style={styles.p}>Última atualização: 18/02/2026</p>

                <h2 style={styles.h2}>1. Introdução</h2>
                <p style={styles.p}>Esta Política de Privacidade descreve como o UAU Code ("nós", "nosso" ou "nossos") coleta, usa e protege suas informações pessoais quando você usa nosso serviço de realidade aumentada.</p>

                <h2 style={styles.h2}>2. Informações que Coletamos</h2>

                <h3 style={styles.h3}>2.1 Informações de Conta</h3>
                <ul style={styles.ul}>
                    <li style={styles.li}>Nome completo</li>
                    <li style={styles.li}>Endereço de e-mail</li>
                    <li style={styles.li}>Informações de autenticação (senha criptografada)</li>
                    <li style={styles.li}>Data de criação da conta</li>
                </ul>

                <h3 style={styles.h3}>2.2 Dados de Uso</h3>
                <ul style={styles.ul}>
                    <li style={styles.li}>Imagens enviadas para reconhecimento (targets)</li>
                    <li style={styles.li}>Conteúdos multimídia associados (vídeos, áudios, 3D)</li>
                    <li style={styles.li}>Histórico de uso e escaneamentos</li>
                    <li style={styles.li}>Logs de acesso e atividade</li>
                </ul>

                <h3 style={styles.h3}>2.3 Informações Técnicas</h3>
                <ul style={styles.ul}>
                    <li style={styles.li}>Endereço IP</li>
                    <li style={styles.li}>Tipo de navegador e dispositivo</li>
                    <li style={styles.li}>Sistema operacional</li>
                    <li style={styles.li}>Dados de cookies e sessão</li>
                </ul>

                <h2 style={styles.h2}>3. Como Usamos suas Informações</h2>
                <p style={styles.p}>Utilizamos suas informações para:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Fornecer e manter nossos serviços de realidade aumentada</li>
                    <li style={styles.li}>Processar imagens e gerar associações automáticas</li>
                    <li style={styles.li}>Gerenciar sua conta e preferências</li>
                    <li style={styles.li}>Processar pagamentos e gerenciar assinaturas</li>
                    <li style={styles.li}>Melhorar a qualidade e precisão de nossos serviços</li>
                    <li style={styles.li}>Comunicar atualizações importantes do serviço</li>
                    <li style={styles.li}>Prevenir fraudes e garantir a segurança</li>
                </ul>

                <h2 style={styles.h2}>4. Tratamento de Imagens</h2>
                <p style={styles.p}>🔒 Política Importante sobre Imagens</p>
                <ul style={styles.ul}>
                    <li style={styles.li}><strong>Processamento:</strong> Imagens "target" são processadas para gerar pontos de reconhecimento para a câmera.</li>
                    <li style={styles.li}><strong>Armazenamento:</strong> Imagens de referência são armazenadas de forma segura para permitir o funcionamento da realidade aumentada.</li>
                    <li style={styles.li}><strong>Criptografia:</strong> Todas as transmissões são protegidas por HTTPS e arquivos armazenados possuem políticas rígidas de acesso.</li>
                </ul>

                <h2 style={styles.h2}>5. Compartilhamento de Dados</h2>
                <p style={styles.p}>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Provedores de Serviço: Para processamento de pagamentos e infraestrutura</li>
                    <li style={styles.li}>Requisitos Legais: Quando exigido por lei ou ordem judicial</li>
                    <li style={styles.li}>Proteção de Direitos: Para proteger nossos direitos legais</li>
                </ul>

                <h2 style={styles.h2}>6. Segurança dos Dados</h2>
                <p style={styles.p}>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Criptografia de dados em trânsito e em repouso</li>
                    <li style={styles.li}>Autenticação segura e controle de acesso</li>
                    <li style={styles.li}>Monitoramento regular de segurança</li>
                    <li style={styles.li}>Backup seguro e recuperação de dados</li>
                </ul>

                <h2 style={styles.h2}>7. Seus Direitos</h2>
                <p style={styles.p}>De acordo com a LGPD, você tem os seguintes direitos:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Acesso: Solicitar informações sobre seus dados pessoais</li>
                    <li style={styles.li}>Correção: Corrigir dados incompletos ou incorretos</li>
                    <li style={styles.li}>Exclusão: Solicitar a remoção de seus dados pessoais</li>
                    <li style={styles.li}>Portabilidade: Receber seus dados em formato estruturado</li>
                    <li style={styles.li}>Oposição: Opor-se ao tratamento de seus dados</li>
                    <li style={styles.li}>Informação: Obter informações sobre o uso de seus dados</li>
                </ul>

                <h2 style={styles.h2}>8. Cookies e Tecnologias Similares</h2>
                <p style={styles.p}>Utilizamos cookies para:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Manter você conectado à sua conta</li>
                    <li style={styles.li}>Lembrar suas preferências</li>
                    <li style={styles.li}>Analisar o uso do serviço</li>
                    <li style={styles.li}>Melhorar a experiência do usuário</li>
                </ul>
                <p style={styles.p}>Você pode gerenciar cookies através das configurações do seu navegador.</p>

                <h2 style={styles.h2}>9. Retenção de Dados</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>Dados da Conta: Mantidos enquanto sua conta estiver ativa</li>
                    <li style={styles.li}>Conteúdos e Imagens: Mantidos enquanto você os utilizar na plataforma</li>
                    <li style={styles.li}>Logs de Acesso: Mantidos por até 12 meses</li>
                </ul>

                <h2 style={styles.h2}>10. Alterações nesta Política</h2>
                <p style={styles.p}>Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas por e-mail ou através de aviso em nosso serviço.</p>

                <h2 style={styles.h2}>11. Contato</h2>
                <p style={styles.p}>Para questões sobre esta Política de Privacidade ou para exercer seus direitos, entre em contato conosco através da nossa página de contato.</p>
                
                <div style={{
                    marginTop: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <strong style={{display: 'block', marginBottom: '8px', color: '#BC36C2'}}>Encarregado de Dados (DPO):</strong>
                    <p style={{margin: 0}}>Email: <a href="mailto:ra.tec.brasil@gmail.com" style={{color: '#fff'}}>ra.tec.brasil@gmail.com</a></p>
                    <p style={{marginTop: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)'}}>Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais.</p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
