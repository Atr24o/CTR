# CTR - Sistema de Gerenciamento de Equipes e Trabalhos

## 📋 Funcionalidades Implementadas

### ✅ Sistema Completo de Armazenamento Local
- Todos os dados são salvos no **localStorage** do navegador
- Nenhuma conexão com servidor necessária
- Dados persistem mesmo após fechar o navegador

---

## 🚀 Como Usar o Sistema

### 1. **Criar uma Conta**
1. Acesse a página **Cadastro.html**
2. Preencha todos os campos:
   - Nome completo
   - Email (usado para login)
   - Senha (mínimo 8 caracteres)
   - Confirmar senha
   - Profissão (opcional)
3. Clique em "Criar conta"
4. Você será redirecionado para o Login

### 2. **Fazer Login**
1. Acesse **Login.html**
2. Digite seu email e senha
3. Clique em "Entrar"
4. Você será levado para a página principal

### 3. **Criar uma Equipe**
1. Na página principal, clique em "Criar uma equipe"
2. Digite o email de pessoas que você quer convidar
   - **Importante:** A pessoa precisa ter uma conta criada primeiro!
3. Pressione Enter para adicionar cada membro
4. Você pode remover membros antes de criar a equipe
5. Clique em "Criar equipe"
6. Digite o nome da equipe
7. Opcionalmente, digite uma descrição
8. Convites serão enviados automaticamente

### 4. **Aceitar/Recusar Convites**
1. Acesse "Entrar em uma equipe"
2. Na seção "Convites para grupos", você verá todos os convites pendentes
3. Clique em:
   - **"Entrar"** para aceitar o convite
   - **"Recusar"** para recusar o convite

### 5. **Gerenciar Trabalhos**
1. Entre em uma equipe clicando em "Ver detalhes"
2. Se você for o **líder**, verá o botão "Gerenciar Trabalhos"
3. Clique nele para ver todos os trabalhos da equipe

### 6. **Enviar um Novo Trabalho**
1. Na página de trabalhos, clique em "+ Enviar Novo Trabalho"
2. Preencha o formulário:
   - **Título:** Nome do trabalho
   - **Responsável:** Escolha um membro da equipe
   - **Data de Entrega:** Escolha a data
   - **Prioridade:** Baixa, Média, Alta ou Urgente
   - **Categoria:** Tipo do trabalho
   - **Descrição:** Detalhes do trabalho
   - **Tags:** Palavras-chave (separadas por vírgula)
   - **Anexos:** Arquivos relacionados (opcional)
3. Marque as opções:
   - Notificar toda a equipe
   - Permitir comentários
4. Clique em "Enviar Trabalho"

### 7. **Interagir com Trabalhos**

#### **Se você é o RESPONSÁVEL:**
- **Atualizar Status:** Altere entre Pendente, Em Andamento, Concluído ou Atrasado
- **Adicionar Progresso:**
  - Digite o percentual (0-100)
  - Descreva o que foi feito
  - O status é atualizado automaticamente:
    - 100% = Concluído
    - Acima de 0% = Em Andamento
- **Enviar Mensagens:** Comunique-se com a equipe sobre o trabalho

#### **Se você é o LÍDER (criador do trabalho):**
- Pode **editar** o trabalho (funcionalidade básica)
- Pode ver todo o histórico de progresso
- Pode ver todas as mensagens

#### **Ver Detalhes do Trabalho:**
1. Clique em "Ver Detalhes" em qualquer trabalho
2. Você verá:
   - Todas as informações do trabalho
   - **Histórico de Progresso:** Todas as atualizações com percentual
   - **Mensagens:** Comunicação da equipe
   - **Enviar Mensagem:** Campo para adicionar comentários

### 8. **Filtrar Trabalhos**
Use o filtro de status para ver apenas:
- Todos os trabalhos
- Pendentes
- Em Andamento
- Concluídos
- Atrasados

### 9. **Salvar Rascunhos**
1. Na página de envio de trabalhos
2. Preencha os campos
3. Clique em "Salvar como Rascunho"
4. Seus rascunhos aparecem na parte inferior
5. Clique em "Carregar" para retomar um rascunho

---

## 🔐 Funcionalidades de Segurança

- **Login obrigatório** para acessar equipes e trabalhos
- Cada usuário só vê as equipes que participa
- Apenas o **responsável** pode atualizar o trabalho
- Apenas o **líder** pode editar o trabalho
- Logout disponível clicando no botão do usuário no canto superior direito

---

## 💾 Gerenciamento de Dados

### **Ver Dados Salvos (Console do Navegador):**
```javascript
// Ver todos os dados
storage.exportarDados()

// Ver usuários
storage.getUsuarios()

// Ver equipes
storage.getEquipes()

// Ver trabalhos
storage.getTrabalhos()

// Ver convites
storage.getConvites()

// Ver mensagens
storage.getMensagens()

// Ver progressos
storage.getProgressos()
```

### **Limpar Todos os Dados:**
```javascript
storage.limparTodosOsDados()
```

### **Exportar/Importar Dados:**
```javascript
// Exportar
const dados = storage.exportarDados()
console.log(JSON.stringify(dados))

// Importar
storage.importarDados(dados)
```

---

## 🎯 Fluxo Completo de Uso

### **Cenário: Equipe de Desenvolvimento**

1. **João** cria uma conta como líder
2. **Maria** e **Pedro** criam suas contas
3. **João** cria a equipe "Desenvolvimento Web"
4. **João** convida Maria e Pedro (usando os emails deles)
5. **Maria** e **Pedro** aceitam os convites
6. **João** acessa "Gerenciar Trabalhos"
7. **João** cria trabalho "Desenvolver tela de login":
   - Responsável: Maria
   - Data: 30/11/2026
   - Prioridade: Alta
   - Descrição: Criar interface de login com validação
8. **Maria** vê o trabalho atribuído a ela
9. **Maria** atualiza o status para "Em Andamento"
10. **Maria** adiciona progresso: "50% - Tela desenvolvida, falta validação"
11. **Maria** envia mensagem: "Preciso da API de autenticação"
12. **João** vê a mensagem e responde no trabalho
13. **Maria** adiciona progresso: "100% - Trabalho concluído"
14. Status automaticamente muda para "Concluído"

---

## 🐛 Solução de Problemas

### **"Usuário não encontrado"**
- A pessoa precisa criar uma conta primeiro antes de ser convidada

### **"Nenhuma equipe selecionada"**
- Volte para "Entrar em uma equipe" e selecione uma equipe

### **Dados perdidos após recarregar**
- Verifique se o localStorage está habilitado no navegador
- Não use modo anônimo/privado

### **Não consigo fazer login**
- Verifique se o email e senha estão corretos
- Lembre-se que o email é case-sensitive

---

## 📊 Estrutura de Dados

### **Usuário:**
- ID único
- Nome, email, senha, profissão
- Data de criação

### **Equipe:**
- ID único
- Nome, descrição
- Líder (ID do usuário)
- Lista de membros com papéis

### **Trabalho:**
- ID único
- Equipe (ID)
- Título, descrição
- Responsável (ID do usuário)
- Criador (ID do usuário)
- Data de entrega
- Status, prioridade, categoria
- Tags, anexos
- Permitir comentários

### **Convite:**
- ID único
- Equipe (ID)
- Remetente (ID)
- Destinatário (ID)
- Status (pendente, aceito, recusado)
- Datas

### **Progresso:**
- ID único
- Trabalho (ID)
- Usuário (ID)
- Descrição
- Percentual (0-100)
- Arquivos
- Data

### **Mensagem:**
- ID único
- Trabalho (ID)
- Usuário (ID)
- Conteúdo
- Tipo (mensagem, progresso, arquivo)
- Data

---

## 🎨 Status dos Trabalhos

- 🟡 **Pendente:** Trabalho criado, aguardando início
- 🔵 **Em Andamento:** Trabalho sendo executado
- 🟢 **Concluído:** Trabalho finalizado (100%)
- 🔴 **Atrasado:** Trabalho não concluído na data prevista

---

## 👥 Papéis na Equipe

- **👑 Líder:** Criador da equipe, pode gerenciar trabalhos e membros
- **👤 Membro:** Pode visualizar, aceitar trabalhos e atualizar progresso

---

## 📱 Próximas Funcionalidades (ToDo)

- [ ] Edição completa de trabalhos
- [ ] Remoção de membros da equipe
- [ ] Notificações em tempo real
- [ ] Filtros avançados
- [ ] Gráficos de progresso
- [ ] Exportar relatórios
- [ ] Upload real de arquivos
- [ ] Integração com banco de dados MySQL

---

## 🆘 Suporte

Para problemas ou dúvidas:
1. Abra o Console do navegador (F12)
2. Verifique se há erros
3. Use os comandos de debug mencionados acima

---

**Versão:** 2.0  
**Última atualização:** 26/11/2026  
**Desenvolvido por:** Equipe CTR
