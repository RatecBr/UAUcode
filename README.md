MAIPIX é uma plataforma WebAR (Realidade Aumentada Web) de alta performance. Sob o slogan **"Imagens que falam"**, transformamos marcadores físicos em experiências imersivas (Vídeo, Áudio, 3D) com processamento local via OpenCV.js e React.

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
cd MAIPIX

# Instalar dependências do cliente
cd client
npm install
```

### Configuração

1.  **Supabase**: Configure as credenciais em `client/src/AuthContext.tsx`
2.  **Tabelas necessárias**:
    -   `profiles`: Gerencia usuários, planos (free, pro, enterprise), roles (admin, user) e slugs personalizados.
    -   `targets`: Armazena os marcadores, URLs de conteúdo, contagem de scans e flag `is_global`.

### Executar Localmente

```bash
cd client
npm run dev
```

Acesse `http://localhost:8080`

---

## 🛠 Funcionalidades Principais

### MAIPIX - WebAR Image Recognition Platform

MAIPIX é uma plataforma WebAR (Realidade Aumentada Web) de alta performance para reconhecimento de imagens utilizando OpenCV.js e React. O sistema permite criar experiências imersivas associando conteúdos multimídia (Vídeo, Áudio, 3D) a marcadores físicos (imagens-alvo), com suporte a captura direta de mídia e gerenciamento global de alvos.

---

## 🚀 Funcionalidades Principais

-   **Reconhecimento de Imagem Local**: Processamento via OpenCV.js diretamente no navegador (WASM).
-   **Landing Page de Alta Conversão**: Nova interface pública focada em marketing e conversão.
-   **Acessibilidade**: Suporte para "leitura" de rótulos e etiquetas para pessoas com deficiência visual.
-   **Suporte Multimídia**: Reproduza Vídeos, Áudio ou Modelos 3D (GLB) ao detectar um alvo.
-   **Modo Offline (PWA)**: Aplicativo instalável com suporte a cache de assets críticos.
-   **Capacidade de Compressão Inteligente**: Opção de economia de dados para vídeos (ideal para WebAR).
-   **Captura Direta de Mídia**: Faça upload ou tire fotos/grave vídeos diretamente do Dashboard.
-   **Gerenciamento de Alvos**: Dashboard administrativo para criar e gerenciar experiências.
-   **Reconhecimento Híbrido**: O scanner reconhece tanto Marcadores do Usuário quanto Marcadores Globais da plataforma.
-   **Feedback Visual Premium**: Interface moderna com animações via Framer Motion.

---

## 🛠️ Stack Tecnológica

-   **Frontend**: Vite, React 19, TypeScript, Tailwind CSS.
-   **Backend/DB**: Supabase (Auth, PostgreSQL, Storage).
-   **Processamento**: OpenCV.js (WebAssembly).
-   **AR/3D**: Three.js / Google Model Viewer.
-   **Hospedagem**: Vercel.

---

## 📋 Arquitetura do Sistema

-   **Slugs Personalizados**: Cada usuário tem sua própria URL de scanner (ex: `maipix.app/s/seu-nome`).
-   **Detecção Multialvo**: O sistema carrega os descritores de imagem (ORB/AKAZE) e compara com o stream da câmera.
-   **Persistência de Detecção**: Algoritmo que mantém o conteúdo visível por 2s após a perda do alvo para evitar flickering.

---

## 📂 Estrutura de Pastas

```text
MAIPIX/
├── client/              # Frontend React + PWA
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Login, Dashboard, Scanner
│   │   ├── hooks/       # Lógica Customizada
│   │   └── utils/       # OpenCV e Helpers
│   └── public/          # Manifest, Service Worker, OpenCV.js
├── migrations/          # Scripts SQL do Supabase
└── server/              # Referência (Lógica centralizada no Supabase)
```

---

## 🔐 Segurança & RLS

O sistema utiliza **Row Level Security (RLS)** no Supabase:
-   Usuários só podem ver e editar seus próprios alvos.
-   Usuários anônimos podem ler alvos globais através do scanner.

---

## 🚀 Deploy Automatizado

O deploy é configurado via CI/CD (GitHub → Vercel):

1.  Faça o push para a branch `main`.
2.  O Vercel detecta a alteração na pasta `client` e executa o build.
3.  Certifique-se de configurar as Secret Env Vars (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) no painel da Vercel.

---

## 🛠️ Boas Práticas e Build

Para garantir que o deploy na Vercel não falhe, siga estas regras:

1. **Imports Limpos**: Nunca deixe ícones (lucide-react) ou bibliotecas importadas que não estão sendo usadas. O `tsc` (TypeScript Compiler) na Vercel está configurado para falhar o build em caso de variáveis não utilizadas.
2. **Teste de Build Local**: Sempre rode `npm run build` na pasta `client` antes de fazer o push para o GitHub. Se der erro aqui, a Vercel também vai falhar.
3. **OpenCV.js**: O arquivo `opencv.js` deve permanecer na pasta `public`. Ele é carregado via script tag no `index.html`.

---

### v1.2.0 (2026-01-25)
-   **New Landing Page**: Desenvolvida página inicial poderosa com foco em "Imagens que falam".
-   **Accessibility Focus**: Novas funcionalidades para leitura de rótulos e etiquetas.
-   **Branding v2**: Novo logotipo minimalista oficial aplicado em todo o sistema.
-   **Video Optimization**: Lógica de compressão "Economy" para carregamento instantâneo.
-   **Clean UI**: Remoção de ferramentas de debug e simplificação do scanner público.

### v1.1.0 (2026-01-24)
-   **Rebranding**: Transição completa da marca para **MAIPIX**.
-   **Media Capture**: Implementação de gravação direta de vídeo e áudio no navegador.
-   **Global Targets**: Lógica de reconhecimento de alvos mestres em todos os slugs.
-   **Admin Optimization**: Dashboard com visão macro e seletor de usuário no scanner para performance.
-   **UI/UX**: Redesign completo estilo Glassmorphism com novos feedbacks de carregamento.

---

*Desenvolvido pela equipe MAIPIX & Antigravity*
