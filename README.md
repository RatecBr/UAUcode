# UAU Code - Imagens Inteligentes

**UAU Code** é uma plataforma de reconhecimento de imagens inteligente que transforma fotos comuns em experiências interativas. Com o slogan **"Imagens Inteligentes"**, somos **a evolução do QR Code**, permitindo que qualquer imagem física se torne um portal para conteúdo multimídia (Vídeo, Áudio, 3D).

## 🎯 Visão Geral

UAU Code revoluciona a forma como compartilhamos conteúdo digital. Em vez de QR Codes genéricos, use suas próprias fotos, logos ou designs como marcadores visuais. Aponte a câmera e veja a mágica acontecer.

### ✨ Diferenciais

- **Imagens Personalizadas**: Use qualquer foto como marcador (não apenas QR Codes)
- **100% Web**: Sem apps para instalar, funciona direto no navegador
- **Reconhecimento Local**: Processamento via OpenCV.js (privacidade total)
- **Design Neon Premium**: Interface moderna com gradientes vibrantes
- **Multiplataforma**: iOS, Android, Desktop

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + React + TypeScript)     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Landing   │  │  Dashboard  │  │   Scanner   │         │
│  │    Page     │  │   (Admin)   │  │  (WebAR)    │         │
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
│  Buckets: assets (target-images, content-files)            │
│  RLS Policies: 7 otimizadas (users + public read)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js** v18+
- **Navegador moderno** com suporte a WebAssembly e Câmera
- **Conta Supabase** (Projeto: `nqpkttlgdjpduytebndy`)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/RatecBr/UAUcode.git
cd UAUcode

# Instalar dependências
cd client
npm install
```

### Configuração

Crie um arquivo `.env` em `client/`:

```env
VITE_SUPABASE_URL=https://nqpkttlgdjpduytebndy.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

### Executar Localmente

```bash
npm run dev
```

Acesse `https://localhost:8080` (HTTPS necessário para câmera).

### Build para Produção

```bash
npm run build
npm run preview
```

---

## 🛠 Funcionalidades Principais

### 👤 Para Usuários

- **Criar Experiências**: Upload de imagem + conteúdo (vídeo/áudio/3D)
- **Compartilhar**: Via link direto, WhatsApp ou UAU Code (QR personalizado)
- **Scanner Público**: `uaucode.com/s/seu-slug`
- **Planos**: Free (3 experiências), Pro (ilimitado)

### 🔧 Para Admins

- **Dashboard Completo**: Gestão de usuários e experiências
- **Analytics**: Logs de escaneamento em tempo real
- **Moderação**: Ativar/desativar usuários
- **Global Targets**: Experiências visíveis para todos

### 🎨 Design System

**Paleta Neon**:

- `--neon-blue`: #3156F3 (Electric Blue)
- `--neon-purple`: #BC36C2 (Royal Purple)
- `--neon-red`: #F5464A (Coral Red)

**Efeitos**:

- Glow Neon (box-shadow com blur)
- Glassmorphism (backdrop-filter)
- Gradientes vibrantes
- Micro-animações (hover, pulse)

---

## 📁 Estrutura de Pastas

```text
UAUcode/
├── client/                    # Frontend React + PWA
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── QRCodeGenerator.tsx  # UAU Code com logo roxo
│   │   │   ├── MediaCapture.tsx     # Captura vídeo/áudio
│   │   │   └── ...
│   │   ├── pages/             # Páginas principais
│   │   │   ├── Landing.tsx    # Landing page
│   │   │   ├── Login.tsx      # Auth
│   │   │   ├── Dashboard.tsx  # Admin panel
│   │   │   ├── Scanner.tsx    # Scanner privado
│   │   │   └── PublicScanner.tsx  # Scanner público
│   │   ├── styles/            # CSS Global
│   │   │   ├── theme.css      # Variáveis CSS
│   │   │   └── ...
│   │   ├── AuthContext.tsx    # Contexto Supabase
│   │   └── main.tsx           # Entry point
│   ├── public/
│   │   ├── opencv.js          # OpenCV WASM
│   │   ├── logo.png           # Logo UAU Code
│   │   └── manifest.json      # PWA config
│   ├── index.html             # HTML base
│   ├── vite.config.ts         # Vite config
│   └── package.json
├── MIGRATION_AUDIT.md         # Auditoria migração DB
├── README.md                  # Este arquivo
└── .gitignore
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas

#### `profiles`

```sql
- id (uuid, PK)
- email (text)
- role (text: 'user' | 'admin')
- plan (text: 'free' | 'pro')
- slug (text, unique)
- is_active (boolean)
- created_at (timestamp)
```

#### `targets`

```sql
- id (bigint, PK)
- user_id (uuid, FK -> profiles)
- name (text)
- image_url (text)
- content_type (text: 'video' | 'audio' | '3d')
- content_url (text)
- is_global (boolean)
- created_at (timestamp)
```

#### `scan_logs`

```sql
- id (bigint, PK)
- target_id (bigint, FK -> targets)
- scanned_at (timestamp)
- user_agent (text)
```

### Políticas RLS (7 total)

**Profiles** (2):

- Users can view own profiles
- Public can view profiles by slug

**Targets** (3):

- Users can CRUD own targets
- Public can view targets by user slug

**Scan Logs** (2):

- Anyone can insert scan logs
- Owners can view scan logs

### Storage Buckets

**assets** (público):

- `target-images/` - Imagens de marcadores
- `content-files/` - Vídeos, áudios, modelos 3D

---

## 🎯 Fluxo de Uso

### 1. Criar Experiência

```
Usuário → Dashboard → "+" FAB Button
  ↓
Upload Imagem (marcador)
  ↓
Upload Conteúdo (vídeo/áudio/3D)
  ↓
Salvar → Gera URL pública
```

### 2. Compartilhar

```
Dashboard → Ícone Share
  ↓
Opções:
  - 📋 Copiar Link
  - 💬 WhatsApp
  - ⬇️ Baixar UAU Code (QR roxo com logo)
```

### 3. Escanear

```
Usuário → uaucode.com/s/slug
  ↓
Permite câmera
  ↓
Aponta para imagem física
  ↓
OpenCV detecta → Mostra conteúdo
```

---

## 🔐 Segurança

- **RLS Policies**: Todas as tabelas protegidas
- **Auth JWT**: Supabase GoTrue
- **HTTPS Only**: Câmera requer SSL
- **Storage Public**: Apenas leitura pública
- **CORS**: Configurado para domínio principal

---

## 📊 Planos

| Plano     | Experiências | Preço     |
| --------- | ------------ | --------- |
| **Free**  | 3            | Grátis    |
| **Pro**   | Ilimitado    | R$ 29/mês |
| **Admin** | 999999       | -         |

---

## 🚢 Deploy

### Vercel (Recomendado)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel --prod
```

**Configurações Vercel**:

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder
```

---

## 📝 Changelog

### v1.3.1 (2026-02-17) - "Brand Consistency"

**Posicionamento**:

- ✅ "O sucessor do QR Code" → "A evolução do QR Code"
- ✅ "Imagens que falam" → "Imagens Inteligentes"
- ✅ Removidas todas as referências a "Realidade Aumentada"

**Meta Tags**:

- ✅ Título: `UAU Code` (sem sufixo)
- ✅ Description: "Imagens Inteligentes - A evolução do QR Code"
- ✅ Open Graph atualizado

### v1.3.0 (2026-02-17) - "Neon Revolution"

**Database**:

- ✅ Migração completa para novo projeto Supabase
- ✅ Limpeza de políticas RLS (18 → 7)
- ✅ Banco zerado (0 experiências antigas)

**UI/UX**:

- ✅ FAB Button neon com animação pulsante
- ✅ QR Code roxo (#5A1A5E) com logo UAU Code
- ✅ Botão WhatsApp para compartilhamento
- ✅ Gradientes vibrantes em toda interface

**Brand**:

- ✅ Transição MAIPIX → UAU Code
- ✅ Logo atualizado
- ✅ Manifest PWA atualizado

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Propriedade de **RatecBr**. Todos os direitos reservados.

---

## 🆘 Suporte

- **Email**: suporte@uaucode.com
- **GitHub Issues**: https://github.com/RatecBr/UAUcode/issues
- **Documentação**: Este arquivo

---

## 🎓 Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Reconhecimento**: OpenCV.js (WASM)
- **Backend**: Supabase (Auth, DB, Storage)
- **Styling**: CSS Modules, CSS Variables
- **PWA**: Manifest, Service Worker
- **Deploy**: Vercel

---

_Desenvolvido com 💜 por Antigravity AI_

**UAU Code** - A evolução do QR Code. Imagens Inteligentes.
