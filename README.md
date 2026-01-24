# IMAGYNE - WebAR Image Recognition Platform

Imagyne é uma plataforma WebAR (Realidade Aumentada Web) para reconhecimento de imagens utilizando OpenCV.js e React. O sistema permite associar conteúdos multimídia (Vídeo, Áudio, 3D) a uma imagem-alvo impressa e disparar a exibição ao reconhecê-la pela câmera.

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
cd IMAGYNE

# Instalar dependências do cliente
cd client
npm install
```

### Configuração

1. **Supabase**: Configure as credenciais em `client/src/AuthContext.tsx`
2. **Tabelas necessárias**:
   - `profiles` (id, email, role)
   - `targets` (id, name, target_url, content_url, content_type)

### Executar Localmente

```bash
cd client
npm run dev
```

Acesse `http://localhost:8080`

---

## 🛠 Funcionalidades

### Autenticação
- Login/Signup via Supabase Auth
- Roles: `admin` e `user`
- Admins acessam Dashboard, users vão direto ao Scanner

### Admin Dashboard
- Upload de imagens-alvo (targets)
- Upload de conteúdo (vídeo, áudio, 3D .glb)
- Gerenciamento de experiências AR

### Scanner (WebAR)
- Reconhecimento de imagens em tempo real (OpenCV.js ORB + RANSAC)
- Overlays:
  - **Vídeo**: Player flutuante autoplay
  - **Áudio**: Player com controles
  - **3D**: Renderizador Three.js para GLB/GLTF
- Debug mode para desenvolvimento

---

## 📂 Estrutura do Projeto

```
IMAGYNE/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── AuthContext.tsx # Auth + Supabase client (SINGLE SOURCE)
│   │   ├── App.tsx         # Rotas e PrivateRoute
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Scanner.tsx
│   │   │   └── ManageUsers.tsx
│   │   ├── recognition.ts  # OpenCV.js image matching
│   │   ├── overlay*.ts     # Video, Audio, 3D overlays
│   │   └── camera.ts       # Camera initialization
│   ├── public/
│   │   └── opencv.js       # OpenCV WASM
│   └── package.json
├── .agent/                 # AI Agent skills and workflows
└── README.md
```

---

## ⚠️ Limitações Conhecidas

- **Iluminação**: O detector ORB é sensível a reflexos e baixa luz
- **Rastreamento**: Não há tracking 6DoF (conteúdo aparece na tela, não "gruda" na imagem)
- **Performance**: Depende da CPU do dispositivo móvel
- **Arquivo 3D**: Modelos devem ser leves (<5MB)

---

## 🔮 Roadmap

- [ ] Tracking 6DoF com WebXR
- [ ] Deep Learning (MobileNet/TF.js) para reconhecimento robusto
- [ ] Processamento híbrido cloud/device
- [ ] Múltiplos targets simultâneos
- [ ] PWA com cache offline

---

## 🚀 Deploy

### GitHub → Vercel (Recomendado)

O deploy é automatizado via GitHub. Quando você faz push para a branch `main`, o Vercel detecta e faz deploy automaticamente.

```bash
# 1. Verificar se o build passa
cd client
npm run build

# 2. Commit e push
git add .
git commit -m "IMAGYNE v1.XX - DESCRIPTION"
git push origin main

# 3. Vercel faz deploy automático
# Acesse o dashboard Vercel para ver o status
```

### Variáveis de Ambiente (Vercel Dashboard)

Configure em **Project Settings → Environment Variables**:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Rollback

Via Vercel Dashboard: **Deployments → Versão anterior → Promote to Production**

---

## 📝 Changelog

### v1.06 (2026-01-24)
- Sistema de autenticação completo com Supabase
- Admin Dashboard para gerenciamento de targets
- Scanner WebAR com overlays de vídeo, áudio e 3D
- Fix: Client Supabase único (evita GoTrueClient múltiplos)
- Fix: AuthContext com loading state robusto

---

*Desenvolvido por Antigravity*
