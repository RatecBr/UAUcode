# Documentação Técnica - Plataforma UAU Code

**Versão:** `UAU Code V.1.3.0 (Neon Edition)`

A **Plataforma UAU Code** é o sucessor definitivo do QR Code. Um ecossistema WebAR de alta performance focado em reconhecimento de imagens (marker-based). Utiliza processamento local no dispositivo do usuário para transformar imagens estáticas em experiências digitais vibrantes com uma estética Neon moderna e tecnológica.

## 📖 Visão Geral do Sistema

O sistema é dividido em três camadas principais:

1.  **Dashboard de Gestão**: Interface moderna com estilo Neon onde usuários gerenciam seus marcadores.
2.  **Motor de Reconhecimento (Engine)**: Núcleo em WebAssembly (OpenCV.js) que processa os frames da câmera com baixa latência.
3.  **Camada de Overlay**: Sistema de renderização que projeta Vídeos, Áudios e Modelos 3D sobre o mundo real.
4.  **Branding Neon**: Identidade visual baseada em gradientes vibrantes (Azul, Roxo, Vermelho) e efeitos de brilho (glow).

---

## 🛠 Arquitetura do Scanner

### Pipeline de Reconhecimento

O processo de detecção segue o fluxo abaixo por frame (aprox. 150ms de intervalo):

1.  **Captura**: Stream de vídeo otimizado.
2.  **Pré-processamento**: Conversão para escala de cinza e normalização de contraste (CLAHE).
3.  **Extração**: Uso do algoritmo ORB para detectar pontos de interesse (Keypoints).
4.  **Matching**: Comparação via Distância Hamming (KNN) contra os alvos pré-carregados.
5.  **Validação**: Verificação de Homografia via RANSAC para garantir que o plano detectado é real.
6.  **Estabilidade**: O conteúdo só é disparado após 3 frames consecutivos de detecção estável.

---

## 💾 Banco de Dados (Supabase)

Migrado para o projeto `UAU-CODE` com suporte a políticas de segurança avançadas.

### Tabelas Principais

#### `profiles`

| Coluna | Tipo | Descrição                                |
| :----- | :--- | :--------------------------------------- |
| `id`   | uuid | Link com Supabase Auth                   |
| `slug` | text | Nome na URL (ex: uaucode.app/s/**nome**) |
| `plan` | text | free, pro, enterprise                    |
| `role` | text | admin, user                              |

#### `targets`

| Coluna         | Tipo | Descrição                  |
| :------------- | :--- | :------------------------- |
| `id`           | int8 | ID serial                  |
| `name`         | text | Nome da experiência        |
| `target_url`   | text | URL da imagem no Storage   |
| `content_url`  | text | URL do conteúdo no Storage |
| `content_type` | text | video, audio, 3d           |

---

## 🎨 Identidade Visual (Design System)

- **Cores**:
  - Azul Elétrico: `#3156F3`
  - Roxo Vibrante: `#BC36C2`
  - Vermelho Coral: `#F5464A`
- **Efeitos**:
  - `box-shadow`: Glow neon em botões e cards.
  - `background`: Gradientes diagonais (135deg).
  - `backdrop-filter`: Glassmorphism profundo (20px blur).

---

## 🚀 Performance e Otimização

- **Downsampling**: Processamento em VGA para manter performance em mobile.
- **JIT Loading**: Pré-carregamento de assets pesados para evitar lag.
- **Asset Caching**: Cache local de conteúdos detectados.

---

## 💡 Troubleshooting

### Erro de Produção (Vercel)

- Certifique-se de que não existem "unused imports" (importações não utilizadas).
- Valide o build localmente com `npm run build` na pasta `client`.

---

_Versão: 1.3.0 - Fev/2026 - UAU Code_
