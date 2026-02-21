# Plano de Implementação: Safe Delete (Limpeza de Storage)

Atualmente, deletar uma experiência remove apenas a linha no banco de dados, deixando arquivos órfãos no Storage. Este plano visa corrigir isso.

## Alterações Propostas

### 1. No Painel Administrativo (`AdminDashboard.tsx`)

- Atualizar `handleDelete` para:
  1. Identificar o `target_url` e `content_url` da experiência antes de deletar.
  2. Extrair os caminhos dos arquivos de dentro das URLs (bucket `assets`).
  3. Chamar `supabase.storage.from('assets').remove([path1, path2])`.
  4. Deletar a linha no banco de dados.

### 2. Na Minha Biblioteca (`MyLibrary.tsx`)

- Aplicar a mesma lógica para garantir que usuários comuns também limpem seus arquivos ao deletar experiências.

## Verificação

- Deletar uma experiência e conferir no console do Supabase se os arquivos sumiram do bucket `assets`.
