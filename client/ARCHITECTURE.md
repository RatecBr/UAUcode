# 🏗️ Arquitetura do Sistema UAU Code

## Visão Geral

A arquitetura do UAU Code é baseada em uma aplicação Single Page Application (SPA) construída com React e Vite, comunicando-se diretamente com o Supabase para backend-as-a-service (BaaS).

## 🧩 Estrutura de Pastas (Client)

```
/client
  /src
    /assets       # Imagens e recursos estáticos
    /components   # Componentes reutilizáveis (QRCodeGenerator, etc)
    /pages        # Páginas principais (Dashboard, Scanner, Login, Admin)
    /TargetTracking # Lógica de reconhecimento de imagem (AR)
  /public         # Arquivos públicos (manifest.json, logos)
```

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

#### `profiles` (Usuários)

- Extensão da tabela `auth.users`.
- Campos: `id`, `email`, `role` (admin/user), `plan` (free/pro), `full_name`, `is_active`.
- **Triggers**: `handle_new_user` cria automaticamente um perfil ao cadastrar.

#### `targets` (Experiências AR)

- Armazena os dados das experiências.
- Campos: `target_url` (imagem alvo), `content_url` (vídeo/áudio), `type`, `user_id`.

### 🔒 Segurança (RLS - Row Level Security)

A segurança é garantida via políticas RLS no Postgres:

- **Leitura Pública**: Usuários ativos podem ser lidos.
- **Atualização Própria**: Usuários só podem editar seu próprio perfil.
- **Admin Full Access**: Policies `profiles_admin_select_all` e `profiles_admin_update_all` garantem que administradores possam gerenciar qualquer usuário.

## 🔄 Fluxo de Autenticação

1. Login via `Supabase Auth`.
2. `AuthContext` mantém o estado da sessão e busca o perfil do usuário.
3. Se `role === 'admin'`, libera acesso às rotas `/admin`.

## 📸 Engine AR

- Utiliza processamento de imagem no navegador (WASM) para detectar marcadores.
- `Scanner.tsx` gerencia o ciclo de vida da câmera e overlays.
