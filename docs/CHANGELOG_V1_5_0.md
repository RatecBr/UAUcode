# Changelog v1.5.0 - Painel do Usuário e Paginação Inteligente

Esta versão eleva o UAU Code para um novo patamar de maturidade, oferecendo autonomia total ao usuário e ao administrador para gerenciarem suas contas e uma interface que se adapta de forma inteligente ao dispositivo.

## 🚀 Novas Funcionalidades

### 👤 Perfil do Usuário & Admin

Todos os usuários, incluindo administradores, agora têm controle total sobre sua identidade:

- **Painel Unificado**: Acesso à edição de nome e troca de senha via `/profile`.
- **Acesso Admin**: Botão de perfil dedicado dentro do `AdminDashboard` e na Sidebar dedicada.
- **Segurança**: Funcionalidade de troca de senha integrada com validação em tempo real.
- **Monitoramento de Plano**: Visualização clara do plano atual e consumo de cotas.

### 📱 Navegação Mobile Refinada (BottomNav)

A navegação mobile foi simplificada e focada:

- **Logo/Avatar Inteligente**: O avatar agora é o ponto de entrada direto para o seu perfil pessoal.
- **Botão "Criar"**: Novo botão (ícone de `Plus`) posicionado estrategicamente ao lado do avatar.
- **Acesso Admin**: Restaurado botão "**Admin**" (ícone de `ShieldCheck`) no `BottomNav` exclusivamente para administradores.
- **Remoção de Redundâncias**: Interface limpa e intuitiva, removendo nomes e botões desnecessários.

### 🖥️ Sincronização Desktop

- **Sidebar**: Agora exibe "Perfil" para todos e "**Admin**" (em vez de Painel) exclusivamente para administradores.
- **Admin Dashboard**: Botão de perfil integrado diretamente no cabeçalho.
  permitindo que admins acessem tanto o perfil pessoal quanto a área de gestão.
- **Botão Painel Mobile**: O BottomNav mobile agora leva ao perfil ou admin dependendo da role.

### 🔢 Paginação Inteligente

Acabamos com a rolagem infinita desorganizada:

- **6 itens/página (Mobile)**: Otimizado para telas pequenas e carregamento rápido.
- **12 itens/página (PC)**: Aproveitamento total do espaço em monitores.
- **Galerias Sincronizadas**: Aplicado tanto na Biblioteca privada quanto na Galeria Pública da Home.

## 🎨 Melhorias de UI/UX

- **Link Setup**: O botão de configuração do slug foi movido para junto do link na biblioteca, tornando o fluxo de compartilhamento mais intuitivo.
- **Limpeza de Lints**: Código otimizado e avisos de performance removidos para um build mais limpo.

---

_UAU Code v1.5.0 - Sua marca, suas regras, em qualquer tela._
