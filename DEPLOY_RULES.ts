export {};

// =============================================================================
// REGRAS DE DEPLOY E CONVENÇÕES DE PROJETO
// =============================================================================

/**
 * ⚠️ ATENÇÃO: LEITURA OBRIGATÓRIA ANTES DE QUALQUER DEPLOY ⚠️
 *
 * Este documento define as regras estritas para deploy e padrões do projeto UAU Code.
 * O não cumprimento destas regras resultará em reversão imediata das alterações.
 */

// 1. AUTORIZAÇÃO DE DEPLOY
// -----------------------------------------------------------------------------
// - NENHUM deploy para produção deve ser feito diretamente para o Vercel CLI.
// - O Deploy é feito AUTOMATICAMENTE via GitHub ao realizar push na branch main.
// - Certifique-se de que tudo está testado localmente antes do push.

// 2. NOMENCLATURA E VERSIONAMENTO
// -----------------------------------------------------------------------------
// - O projeto DEVE sempre ser referenciado como "UAU Code" (ou variantes como UAUCode).
// - O versionamento deve seguir estritamente o Semantic Versioning (SemVer) no formato:
//   vX.Y.Z (Ex: v1.3.4, v1.3.5)
// - Ao bump de versão, atualizar:
//   a) package.json
//   b) DOCUMENTATION.md (se houver seção de histórico)
//   c) Mensagem de commit/release

// 3. DESIGN SYSTEM & UI
// -----------------------------------------------------------------------------
// - Logo: Deve ser exibida de forma harmônica e legível. Evite tamanhos minúsculos.
//   Em rodapés escuros, garantir contraste adequado ou usar versão monocromática/branca se disponível.
// - Cores: Respeitar a paleta "Neon Revolution":
//   - Neon Blue (#?), Neon Purple (#BC36C2), Neon Red (#?)
//   - Fundo Dark (#0a0a0f)
// - Tipografia: Inter, system-ui, sans-serif.

// 4. ESTRUTURA DE NAVEGAÇÃO
// -----------------------------------------------------------------------------
// - Cabeçalho (Header):
//   - Deve conter a Logo.
//   - Deve conter links de navegação para seções principais:
//     - "Como funciona" (âncora para seção explicativa)
//     - "Sobre" (âncora para seção de benefícios/sobre)
//   - Botão de Ação: "Entrar" (Login)

// 5. RODAPÉ (FOOTER)
// -----------------------------------------------------------------------------
// - Deve refletir a marca de forma profissional.
// - Links obrigatórios legais: Termos de Uso, Política de Privacidade.
// - Redes Sociais atuais: Instagram (@ra.tec.br), YouTube (@ra.tec.brasil), Email.

// 6. PROCESSOS DE CODING
// -----------------------------------------------------------------------------
// - Commits devem seguir o padrão Conventional Commits (feat:, fix:, docs:, style:, refactor:).
// - Nunca commitar segredos ou chaves de API (.env deve estar no .gitignore).

// =============================================================================
// FIM DAS REGRAS
// =============================================================================
