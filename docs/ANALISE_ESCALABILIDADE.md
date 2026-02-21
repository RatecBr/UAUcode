# Análise Técnica: Limites de Escalabilidade do Scanner

Esta análise avalia o impacto do número de experiências (alvos) carregados simultaneamente no Scanner de um usuário.

## ⚙️ O Motor de Reconhecimento

O UAU Code utiliza **ORB (Oriented FAST and Rotated BRIEF)** via OpenCV (WebAssembly). É um motor robusto, mas o processamento de imagem é feito inteiramente na CPU do dispositivo do usuário (Smartphone).

## 📊 Impacto da Quantidade de Alvos

### 1. Tempo de Inicialização (Download e Extração)

- **O que acontece**: Ao entrar em um Slug, o navegador baixa a imagem de cada alvo e extrai as "características" (keypoints).
- **Escala**:
  - **1-10 alvos**: Quase instantâneo.
  - **20-50 alvos**: Pode levar de 3 a 8 segundos dependendo da internet e do processador.
  - **100+ alvos**: A experiência se torna frustrante, com a barra de progresso demorando muito.

### 2. Latência do Scanner (FPS)

- **O que acontece**: O motor percorre a lista de alvos um por um em cada frame da câmera (`knnMatch`).
- **Escala**:
  - O custo de processamento é **Linear O(N)**. Dobrar os alvos corta o FPS pela metade.
  - Em celulares intermediários, carregar mais de **20-30 alvos** simultaneamente pode fazer o scanner "engasgar" (lag), dificultando a detecção rápida.

### 3. Consumo de Memória (RAM)

- Cada alvo ocupa aproximadamente **150KB - 300KB** de memória RAM para armazenar os descritores matemáticos.
- Celulares mais antigos podem fechar o navegador se o consumo de RAM somar mais de 200MB apenas para os alvos (o que ocorreria com ~500 alvos).

## 🚀 Recomendações de Limites Sugeridos

| Nível de Plano   | Sugestão de Limite | Justificativa                                                                            |
| :--------------- | :----------------- | :--------------------------------------------------------------------------------------- |
| **Gratuito**     | **5**              | Excelente performance, incentiva o upgrade.                                              |
| **Profissional** | **30**             | Limite seguro para manter o scanner a 20+ FPS em celulares modernos.                     |
| **Empresarial**  | **100**            | Máximo razoável. Acima disso, precisaremos de "Paginação Espacial" ou "Grupos de Alvos". |

## 🛠️ Próximos Passos Propostos

1. **Implementar Trava de Quota**: Impedir a criação de novos alvos acima do limite do plano.
2. **Otimização de Carregamento**: Se um usuário tiver 50 experiências, carregar apenas as 20 mais recentes ou mais acessadas no scanner por padrão.
3. **Feedback de Performance**: Avisar ao Admin/Usuário quando ele adicionar muitos itens: "Atenção: Muitos alvos podem tornar o scanner lento".

> [!IMPORTANT]
> Manter o limite de **20-30 alvos por Slug** garante que a detecção aconteça em menos de 1 segundo.
