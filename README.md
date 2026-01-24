# UAU - WebAR Image Recognition Platform

UAU é uma plataforma WebAR (Realidade Aumentada Web) de alta performance para reconhecimento de imagens utilizando OpenCV.js e React. O sistema permite criar experiências imersivas associando conteúdos multimídia (Vídeo, Áudio, 3D) a marcadores físicos (imagens-alvo), com suporte a captura direta de mídia e gerenciamento global de alvos.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vite + React)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Login     │  │    Admin    │  │   Scanner   │         │
│  │   Page      │  │  Dashboard  │  │   (WebAR)   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┴────────────────┘                 │
│                          │                                  │
│                  ┌───────┴───────┐                          │
│                  │  AuthContext  │                          │
│                  │  (Supabase)   │                          │
│                  └───────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE (Backend)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │   Storage   │  │  Database   │         │
│  │  (GoTrue)   │  │   (S3)      │  │  (Postgres) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  Tables: profiles, targets                                  │
│  Buckets: target-images, content-files                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Como Rodar

### Pré-requisitos
- Node.js (v18+)
- Navegador com suporte a WebAssembly e Câmera (Chrome/Safari Mobile)
- Conta Supabase com projeto configurado

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd UAU

# Instalar dependências do cliente
cd client
npm install
```

### Configuração

1. **Supabase**: Configure as credenciais em `client/src/AuthContext.tsx`
2. **Tabelas necessárias**:
   - `profiles`: Gerencia usuários, planos (free, pro, enterprise), roles (admin, user) e slugs personalizados.
   - `targets`: Armazena os marcadores, URLs de conteúdo, contagem de scans e flag `is_global`.

### Executar Localmente

```bash
cd client
npm run dev
```

Acesse `http://localhost:8080`

---

## 🛠 Funcionalidades Principais

### Autenticação e Perfis
- Login/Signup via Supabase Auth.
- **Roles dinâmicas**: Diferenciação visual e funcional entre Administradores e Usuários.
- **Slugs Personalizados**: Cada usuário tem sua própria URL de scanner (ex: `uau.app/s/seu-nome`).

### Admin Dashboard (Modern UI)
- **Interface Glassmorphism**: Design premium e responsivo.
- **Media Capture**: Capture fotos para alvos ou grave vídeos/áudios diretamente do dashboard.
- **Gestão de Experiências**: Upload, edição e exclusão de conteúdos em tempo real.
- **Visualização de Admin**: Administradores podem visualizar e gerenciar experiências de todos os usuários da base.

### Experiências Globais (Marcadores Mestre)
- Marcadores definidos pelo admin como `is_global` são reconhecidos em **todos os links SLUG** do sistema.
- Ideal para branding da plataforma, tutoriais de uso ou campanhas transversais.

### Scanner (WebAR Engine)
- **Reconhecimento Offline-first**: Processamento local via OpenCV.js (ORB + RANSAC).
- **Sticky Playback**: O conteúdo persiste na tela mesmo se o rastreamento for perdido momentaneamente.
- **Zero-Latency Switching**: Carregamento JIT (Just-In-Time) em background para trocas instantâneas de conteúdo.
- **Seletor Admin**: No scanner de testes, admins podem escolher qual usuário simular para otimizar a performance de leitura.

---

## 📂 Estrutura do Projeto

```
UAU/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # MediaCapture, QRCodeGenerator, etc.
│   │   ├── pages/          # Dashboard, Login, Admin, Scanner, PublicScanner
│   │   ├── recognition.ts  # OpenCV.js image matching core
│   │   ├── overlay*.ts     # Gerenciadores de Vídeo, Áudio e 3D
│   │   └── camera.ts       # Inicialização e controle de stream
│   ├── public/
│   │   └── opencv.js       # Binário WASM OpenCV
│   └── package.json
├── .agent/                 # Instruções e habilidades do Assistente AI
└── README.md
```

---

## 🚀 Deploy Automatizado

O deploy é configurado via CI/CD (GitHub → Vercel):

1. Faça o push para a branch `main`.
2. O Vercel detecta a alteração na pasta `client` e executa o build.
3. Certifique-se de configurar as Secret Env Vars (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) no painel da Vercel.

---

## 📝 Changelog Recente

### v1.1.0 (2026-01-24)
- **Rebranding**: Transição completa da marca para **UAU**.
- **Media Capture**: Implementação de gravação direta de vídeo e áudio no navegador.
- **Global Targets**: Lógica de reconhecimento de alvos mestres em todos os slugs.
- **Admin Optimization**: Dashboard com visão macro e seletor de usuário no scanner para performance.
- **UI/UX**: Redesign completo estilo Glassmorphism com novos feedbacks de carregamento.

---

*Desenvolvido pela equipe UAU & Antigravity*
