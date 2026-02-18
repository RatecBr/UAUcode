# Changelog

Todas as mudanças notáveis no projeto UAU Code serão documentadas neste arquivo.

## [1.2.2] - 2026-02-18

### ✨ Novas Funcionalidades

- **Nome Completo no Cadastro**: Novo campo "Nome Completo" no formulário de registro.
- **Painel Admin Aprimorado**:
  - Listagem de usuários agora exibe o **Nome Completo**.
  - **Edição de Usuários**: Modal permite editar Nome, Plano e Função de qualquer usuário.
  - Correção de permissões RLS para permitir que Admins salvem alterações em outros perfis.
- **QR Code Generator 2.0**:
  - Novo design com contraste aprimorado.
  - Logo centralizada com melhor resolução e área de respiro.
  - Botão "Copiar Link" estilizado para melhor usabilidade.
- **Dashboard**:
  - Saudação personalizada ("Olá, [Nome]!").
  - Botão de compartilhamento de link com texto explicativo.

### 🐛 Correções de Bugs

- **Database**: Adicionada função `is_admin()` segura para políticas RLS recursivas.
- **Scanner**: Correção na busca de nomes de usuários para dropdown de filtro.
- **Build**: Correção de variáveis não utilizadas no TypeScript (`overlayLink.ts`).

### 💅 UI/UX

- Melhoria no contraste de dropdowns no painel admin (fundo escuro para opções).
- Padronização de estilos de botões e inputs.
