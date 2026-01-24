# IMAGYNE - Image Recognition PWA

Imagyne é uma aplicação Web Progressiva (PWA) de reconhecimento de imagens utilizando OpenCV.js e React. O sistema permite associar conteúdos multimídia (Vídeo, Áudio, 3D) a uma imagem-alvo impressa e disparar a exibição ao reconhecê-la pela câmera.

## 🚀 Como Rodar

### Pré-requisitos
- Node.js (v18+)
- Navegador com suporte a WebAssembly e Câmera (Chrome/Safari Mobile)

### Passo 1: Instalação
Na raiz do projeto:

```bash
# Instalar dependências do servidor
cd server
npm install

# Instalar dependências do cliente
cd ../client
npm install
# (Caso necessário, instale three.js explicitamente se falhar)
npm install three @types/three
```

### Passo 2: Iniciar Servidor (Backend)
Em um terminal:
```bash
cd server
npm run dev
```
O servidor rodará em `http://localhost:3000`.

### Passo 3: Iniciar Cliente (Frontend)
Em outro terminal:
```bash
cd client
npm run dev
```
Acesse a aplicação (geralmente `http://localhost:5173`).

---

## 🛠 Funcionalidades
1. **Setup**: Interface para upload de imagem-alvo e conteúdo multimídia.
2. **Reconhecimento**: Processamento de vídeo em tempo real (ORB + RANSAC) via OpenCV.js (WASM).
3. **Overlays**:
   - **Vídeo**: Player flutuante.
   - **Áudio**: Tocador com controle.
   - **3D**: Renderizador Three.js para modelos .glb/.gltf.
4. **PWA**: Instalável, funciona offline (após cache dos assets principais).

## ⚠️ Limitações Conhecidas
- **Iluminação**: O detector ORB é sensível a reflexos e baixa luz.
- **Rastreamento**: NÃO há tracking geométrico (o objeto 3D não "gruda" na imagem, apenas aparece na tela).
- **Performance**: Depende fortemente da CPU do dispositivo móvel. Devices antigos podem ter FPS baixo.
- **Arquivo**: O modelo 3D deve ser leve (<5MB) para carregamento rápido.

## 🔮 Melhorias Futuras
- **Tracking 6DoF**: Integrar com AR.js ou WebXR para fixar o conteúdo no espaço 3D.
- **Deep Learning**: Substituir ORB por MobileNet/TF.js para reconhecimento mais robusto de objetos genéricos.
- **Nuvem**: Processamento híbrido para reduzir carga no dispositivo.
- **Múltiplos Targets**: Suporte a banco de dados de imagens (Feature Matching escalável).

## 📁 Estrutura
- `/client`: Frontend React + Vite
- `/server`: Backend Express (Armazenamento)
- `/storage`: Arquivos de upload

---
*Desenvolvido por Antigravity*
