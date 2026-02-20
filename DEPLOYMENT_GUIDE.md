# Guia de Deploy e Versionamento - UAU Code

> **Versão Atual:** v1.4.0
> **Data:** 19/02/2026

Este documento contém as instruções passo a passo para realizar o deploy do UAU Code e manter o versionamento correto.

## 1. Regras de Versionamento (SemVer)

O projeto segue estritamente o **Semantic Versioning** (X.Y.Z):

- **Major (X)**: Mudanças que quebram compatibilidade (ex: v1.0.0 -> v2.0.0).
- **Minor (Y)**: Novas funcionalidades backward-compatible (ex: v1.3.0 -> v1.4.0).
- **Patch (Z)**: Correções de bugs (ex: v1.4.0 -> v1.4.1).

### Checklist de Atualização de Versão:

Antes de cada deploy, verifique:

1.  [ ] **package.json**: Atualize o campo `"version": "X.Y.Z"`.
2.  [ ] **DOCUMENTATION.md**:
    - Atualize o título `This document describes vX.Y.Z`.
    - Atualize a seção "Roadmap" marcando as features entregues.
    - Atualize a data de "Última atualização" no rodapé.
3.  [ ] **DEPLOY_RULES.ts**: Se houver mudanças nas regras de deploy, atualize este arquivo.

---

## 2. Processo de Deploy (GitHub + Vercel)

O deploy para produção é **automático** ao enviar código para a branch `main` do GitHub, graças à integração com a Vercel.

### Passo a Passo:

1.  **Stage (Preparar Arquivos):**

    ```bash
    git add .
    ```

2.  **Commit (Salvar Alterações):**
    Use uma mensagem descritiva seguindo o padrão Conventional Commits.

    ```bash
    git commit -m "feat: descrição das novas funcionalidades (vX.Y.Z)"
    ```

    _Exemplo: `git commit -m "feat: release v1.4.0 - categorias, fluxo passo a passo"`_

3.  **Push (Enviar para GitHub):**

    ```bash
    git push origin main
    ```

4.  **Verificação:**
    - Acesse o painel da Vercel.
    - Verifique se o build iniciou automaticamente.
    - Aguarde o status "Ready".

### Em Caso de Falha no Build:

1.  Verifique os logs na Vercel.
2.  Corrija o erro localmente.
3.  Atualize a versão "Patch" (ex: v1.4.0 -> v1.4.1) se necessário.
4.  Faça novo commit e push.

---

## 3. Comandos Úteis

- **Verificar status do git:** `git status`
- **Verificar versão atual:** `npm list --depth=0` (ou veja package.json)
- **Rodar projeto localmente:** `npm run dev`

---

**Nota:** Mantenha este documento atualizado sempre que o processo de deploy mudar.
