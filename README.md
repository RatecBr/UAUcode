# UAU Code - O Sucessor do QR Code

**UAU Code** é uma plataforma WebAR (Realidade Aumentada Web) de alta performance. Sob o slogan **"Imagens que falam"**, transformamos marcadores físicos em experiências imersivas (Vídeo, Áudio, 3D) com uma estética Neon moderna e vibrante.

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
│  Tables: profiles, targets, scan_logs                       │
│  Buckets: assets, target-images, content-files              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Como Rodar

### Pré-requisitos

- Node.js (v18+)
- Navegador com suporte a WebAssembly e Câmera (Chrome/Safari Mobile)
- Conta Supabase (Projeto: UAU-CODE)

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd UAU-CODE

# Instalar dependências
cd client
npm install
```

### Executar Localmente

```bash
npm run dev
```

Acesse `https://localhost:8080` (Atenção: Necessário HTTPS para acesso à câmera).

---

## 🛠 Funcionalidades Principais

- **Visual Neon Premium**: Interface totalmente remodelada com gradientes vibrantes e efeitos de brilho neon.
- **Reconhecimento Local**: Processamento via OpenCV.js (WASM) diretamente no navegador.
- **Acessibilidade**: Transforme rótulos físicos em áudio para acessibilidade universal.
- **Suporte Multimídia**: Vídeos Transparentes, Áudio Imersivo e Objetos 3D (GLB).
- **Dashboard Admin**: Gestão completa de usuários e marcadores globais.

---

## 🎨 Design System

- **Paleta**: Electric Blue, Royal Purple e Coral Red.
- **Efeitos**: Glow Neon, Glassmorphism Profundo, Micro-animações.

---

## 📁 Estrutura de Pastas

```text
UAU-CODE/
├── client/              # Frontend React + PWA
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Landing, Login, Dashboard, Scanner
│   │   ├── styles/      # Temas e CSS Global
│   │   └── utils/       # OpenCV e Helpers
│   └── public/          # Assets estáticos e OpenCV.js
├── migrations/          # Scripts SQL do Supabase
└── DOCUMENTATION.md      # Detalhes técnicos profundos
```

---

### v1.3.0 (2026-02-17) - "Neon Revolution"

- **Nova Marca**: Transição completa de MAIPIX para **UAU Code**.
- **Tema Neon**: Estilo visual futurista com glow e gradientes Blue-Purple-Red.
- **Migração Supabase**: Banco de dados migrado para novo projeto dedicado.
- **UI Refresh**: Landing Page, Dashboard e Login totalmente redesenhados.

---

_Desenvolvido por Antigravity AI_
