# Documentação Técnica - Plataforma MAIPIX

**Versão:** `MAIPIX V.1.20 - DEPLOY`

A **Plataforma MAIPIX** é um ecossistema WebAR de alta performance focado em reconhecimento de imagens (marker-based). Utiliza processamento local no dispositivo do usuário para garantir privacidade e baixa latência.

## 📖 Visão Geral do Sistema

O sistema é dividido em três camadas principais:
1.  **Dashboard de Gestão**: Onde usuários e admins gerenciam seus marcadores e conteúdos.
2.  **Motor de Reconhecimento (Engine)**: Núcleo em WebAssembly (OpenCV.js) que processa os frames da câmera.
3.  **Camada de Overlay**: Sistema de renderização que projeta Vídeos, Áudios e Modelos 3D sobre o mundo real.
4.  **Acessibilidade**: Módulo de leitura de etiquetas para áudio, otimizando a experiência para PCD.

---

## 🛠 Arquitetura do Scanner

### Pipeline de Reconhecimento
O processo de detecção segue o fluxo abaixo por frame (aprox. 150ms de intervalo):
1.  **Captura**: Stream de vídeo em 480p/720p.
2.  **Pré-processamento**: Conversão para escala de cinza e normalização de contraste (CLAHE).
3.  **Extração**: Uso do algoritmo ORB para detectar pontos de interesse (Keypoints).
4.  **Matching**: Comparação via Distância Hamming (KNN) contra os alvos pré-carregados.
5.  **Validação**: Verificação de Homografia via RANSAC para garantir que o plano detectado é real.
6.  **Estabilidade**: O conteúdo só é disparado após 3 frames consecutivos de detecção estável.

### Lógica de Experiências Globais
As experiências globais são carregadas em todos os contextos de scanner. 
- **Query**: `supabase.from('targets').select('*').or('user_id.eq.ID_DONO,is_global.eq.true')`.
- Isso garante que a capacidade de reconhecimento seja somada (Experiências do Cliente + Experiências da MAIPIX).

---

## 🎴 Dashboard e Media Capture

O Dashboard utiliza uma arquitetura baseada em **MediaStream Recording API**.
- **Foto Alvo**: Captura de frame estático do vídeo e conversão para DataURL/Blob para upload.
- **Vídeo/Áudio**: Utiliza o `MediaRecorder` para gerar arquivos `.webm` ou `.ogg` em tempo real, permitindo que o usuário crie conteúdo sem precisar de ferramentas externas.

---

## 💾 Banco de Dados (Supabase)

### Tabelas Principais

#### `profiles`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid | Link com Supabase Auth |
| `slug` | text | Nome na URL (ex: maipix.app/s/**jose**) |
| `plan` | text | free, pro, enterprise |
| `role` | text | admin, user |

#### `targets`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | int8 | ID serial |
| `name` | text | Nome da experiência |
| `target_url` | text | URL da imagem no Storage |
| `content_url` | text | URL do vídeo/áudio/3D no Storage |
| `content_type`| text | video, audio, 3d |
| `is_global` | bool | Se visível em todos os slugs |
| `user_id` | uuid | Dono da experiência |

---

## 🚀 Performance e Otimização

Para manter 60 FPS na interface e 10-15 FPS no reconhecimento em dispositivos móveis:
- **Downsampling**: O reconhecimento processa uma version reduzida (VGA) do frame original.
- **JIT Loading**: Conteúdos pesados (vídeos) são baixados via `fetch` para Blobs no momento da detecção estável, evitando gaps de carregamento do player nativo.
- **Asset Caching**: O `PublicScanner` mantém um cache em memória dos assets já baixados para evitar re-downloads durante a mesma sessão.

---

## 🛡 Segurança

- **RLS (Row Level Security)**: Configurado no Supabase para garantir que usuários comuns só editem seus próprios dados, enquanto Admins têm bypass total.
- **CORS**: Domínios de Storage configurados para permitir acesso apenas das origens autorizadas (localhost e maipix.app).

---

*Versão: 1.2.0 - Jan/2026*
