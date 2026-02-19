# UAU Code Client

## 🚀 Sobre o Projeto

UAU Code é uma aplicação web progressiva (PWA) de Realidade Aumentada (AR) que permite aos usuários criar, gerenciar e escanear experiências interativas. Através de "Imagens Inteligentes", o sistema reconhece alvos impressos e sobrepõe conteúdo digital (vídeo, áudio, modelos 3D ou links).

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Estilização**: CSS Modules (Glassmorphism, Neon Theme), Lucide React
- **Backend**: Supabase (Auth, Postgres, Storage, Edge Functions)
- **AR Engine**: OpenCV.js / MindAR (custom implementation)

## ✨ Funcionalidades Principais

### 👤 Usuário

- **Cadastro/Login**: Autenticação segura via Supabase Auth.
- **Dashboard**: Gerenciamento de experiências (criação, edição, exclusão).
- **QR Code Generator**: Geração de QR Codes estilizados com logo e cores da marca.
- **Scanner**: Leitor de AR integrado via câmera do dispositivo.

### 🛡️ Admin

- **Painel Administrativo**: Visão geral de usuários e estatísticas.
- **Gerenciamento de Usuários**:
  - Listagem com nomes completos.
  - Edição de perfil (Nome, Plano, Função).
  - Ativação/Desativação de contas.
- **Controle de Planos**: Gratuito, Profissional (Limites de 1 vs 20 experiências).

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- NPM ou Yarn

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
# Acesse em https://localhost:8080 (HTTPS necessário para câmera)
```

### Build (Produção)

```bash
npm run build
# Os arquivos gerados estarão na pasta /dist
```

### Preview

```bash
npm run preview
```

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🚀 Deploy

Este projeto é otimizado para deploy em Vercel ou Netlify.
Basta conectar o repositório git e configurar as variáveis de ambiente.
O comando de build é `npm run build` e a pasta de saída é `dist`.
