# Análise de Impacto: Preview de Sobreposição na Galeria

Esta funcionalidade visa exibir uma versão em miniatura ou silenciada do conteúdo (vídeo, áudio, 3D) quando o usuário passa o mouse sobre um item na galeria.

## Análise de Impacto

### 1. Experiência do Usuário (UX)

- **Positivo**: Permite que o usuário saiba o que esperar antes de abrir a experiência completa (Scanner ou Link). Cria uma sensação de dinamismo e modernidade ("Wow Factor").
- **Negativo**: Pode gerar "poluição visual" se muitos previews dispararem ao mesmo tempo em uma grade densa. O áudio auto-reproduzido pode ser irritante (deve ser mudo por padrão).
- **Mobile**: Em dispositivos touch, o "hover" não existe. Precisamos de uma alternativa (ex: long press ou um pequeno botão de "play/olho" visível).

### 2. Performance Técnica

- **Bandwidth (Consumo de Dados)**: Carregar vídeos ou modelos 3D em miniatura pode aumentar drasticamente o consumo de dados se não for implementado com _lazy loading_ agressivo.
- **Memória/CPU**: Renderizar múltiplos componentes de vídeo ou canvas 3D simultaneamente pode deixar a rolagem da página lenta em PCs menos potentes.
- **Bateria**: O uso intensivo de GPU para 3D/Vídeo em background reduz a vida útil da bateria.

### 3. Complexidade de Implementação

- **Componentização**: Necessidade de um `MiniOverlay` que suporte os 4 tipos de conteúdo (`video`, `audio`, `3d`, `link`).
- **Gerenciamento de Recursos**: Lógica para garantir que apenas um preview esteja ativo por vez e que recursos (como áudio) sejam devidamente descartados ao tirar o mouse.

## Estratégia Proposta

1. **Vídeos**: Mostrar apenas um loop de 5-10 segundos, mudo, via atributo `poster` ou um vídeo de baixa resolução.
2. **Áudio**: Exibir uma animação de ondas sonoras (Waveform) em vez de tocar o som imediatamente.
3. **3D**: Exibir uma imagem estática que se torna um modelo 3D simplificado (baixa contagem de polígonos) apenas após 500ms de hover.
4. **Link**: Exibir um screenshot da página ou um ícone elegante de "Link Externo".

## User Review Required

> [!IMPORTANT]
> A implementação pode exigir a geração de "mini-versões" ou thumbnails animados dos vídeos para não pesar no carregamento inicial da página.

## Plano de Implementação

### Galeria (Páginas Home e MyLibrary)

#### [MODIFY] `Home.tsx` / `MyLibrary.tsx`

- Adicionar listeners de `onMouseEnter` e `onMouseLeave`.
- Implementar estado `hoveredId`.

### [NEW] Componente `PreviewContent`

- Componente especializado em renderizar a prévia baseada no `content_type`.

## Plano de Verificação

- Testar consumo de rede (Network tab) ao rolar a galeria.
- Verificar suavidade da animação em dispositivos de entrada.
