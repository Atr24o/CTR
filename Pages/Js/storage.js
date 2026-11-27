// ===== SISTEMA DE ARMAZENAMENTO LOCAL =====
// Gerencia todos os dados localmente usando localStorage

class StorageManager {
    constructor() {
        this.initializeStorage();
    }

    // Inicializa estrutura de dados
    initializeStorage() {
        if (!localStorage.getItem('usuarios')) {
            localStorage.setItem('usuarios', JSON.stringify([]));
        }
        if (!localStorage.getItem('equipes')) {
            localStorage.setItem('equipes', JSON.stringify([]));
        }
        if (!localStorage.getItem('trabalhos')) {
            localStorage.setItem('trabalhos', JSON.stringify([]));
        }
        if (!localStorage.getItem('convites')) {
            localStorage.setItem('convites', JSON.stringify([]));
        }
        if (!localStorage.getItem('mensagens')) {
            localStorage.setItem('mensagens', JSON.stringify([]));
        }
        if (!localStorage.getItem('progressos')) {
            localStorage.setItem('progressos', JSON.stringify([]));
        }
    }

    // ===== USUÁRIOS =====
    criarUsuario(nome, email, senha, profissao) {
        const usuarios = this.getUsuarios();

        // Verifica se email já existe
        if (usuarios.find(u => u.email === email)) {
            throw new Error('Email já cadastrado!');
        }

        const novoUsuario = {
            id: this.gerarId(),
            nome,
            email,
            senha, // Em produção, isso deveria ser criptografado
            profissao,
            dataCriacao: new Date().toISOString(),
            avatar: null
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        return novoUsuario;
    }

    getUsuarios() {
        return JSON.parse(localStorage.getItem('usuarios') || '[]');
    }

    getUsuarioPorEmail(email) {
        const usuarios = this.getUsuarios();
        return usuarios.find(u => u.email === email);
    }

    getUsuarioPorId(id) {
        const usuarios = this.getUsuarios();
        return usuarios.find(u => u.id === id);
    }

    atualizarUsuario(id, dados) {
        const usuarios = this.getUsuarios();
        const indice = usuarios.findIndex(usuario => usuario.id === id);

        if (indice === -1) {
            throw new Error('Usuário não encontrado!');
        }

        const email = dados.email.trim();
        const emailEmUso = usuarios.some(usuario =>
            usuario.id !== id && usuario.email.toLowerCase() === email.toLowerCase()
        );

        if (emailEmUso) {
            throw new Error('Este email já está cadastrado!');
        }

        const usuarioAtualizado = {
            ...usuarios[indice],
            ...dados,
            email
        };

        usuarios[indice] = usuarioAtualizado;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        const usuarioLogado = this.getUsuarioLogado();
        if (usuarioLogado && usuarioLogado.id === id) {
            const { senha, avatar, ...dadosDaSessao } = usuarioAtualizado;
            localStorage.setItem('usuarioLogado', JSON.stringify(dadosDaSessao));
        }

        return usuarioAtualizado;
    }

    autenticarUsuario(email, senha) {
        const usuario = this.getUsuarioPorEmail(email);
        if (!usuario) {
            throw new Error('Usuário não encontrado!');
        }
        if (usuario.senha !== senha) {
            throw new Error('Senha incorreta!');
        }
        return usuario;
    }

    // ===== SESSÃO =====
    fazerLogin(usuario) {
        const { senha, avatar, ...usuarioSemSenha } = usuario;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioSemSenha));
        localStorage.setItem('tokenUsuario', 'token_' + Date.now());
        return usuarioSemSenha;
    }

    fazerLogout() {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('tokenUsuario');
    }

    getUsuarioLogado() {
        const usuario = localStorage.getItem('usuarioLogado');
        return usuario ? JSON.parse(usuario) : null;
    }

    isLogado() {
        return !!localStorage.getItem('tokenUsuario');
    }

    // ===== EQUIPES =====
    criarEquipe(nome, descricao, lider) {
        const equipes = this.getEquipes();

        const novaEquipe = {
            id: this.gerarId(),
            nome,
            descricao: descricao || '',
            liderId: lider.id,
            membros: [
                {
                    usuarioId: lider.id,
                    papel: 'lider',
                    dataEntrada: new Date().toISOString()
                }
            ],
            dataCriacao: new Date().toISOString()
        };

        equipes.push(novaEquipe);
        localStorage.setItem('equipes', JSON.stringify(equipes));
        return novaEquipe;
    }

    getEquipes() {
        return JSON.parse(localStorage.getItem('equipes') || '[]');
    }

    getEquipePorId(id) {
        const equipes = this.getEquipes();
        return equipes.find(e => e.id === id);
    }

    getEquipesDoUsuario(usuarioId) {
        const equipes = this.getEquipes();
        return equipes.filter(e =>
            e.membros.some(m => m.usuarioId === usuarioId)
        );
    }

    adicionarMembroEquipe(equipeId, usuarioId, papel = 'membro') {
        const equipes = this.getEquipes();
        const equipe = equipes.find(e => e.id === equipeId);

        if (!equipe) {
            throw new Error('Equipe não encontrada!');
        }

        if (equipe.membros.some(m => m.usuarioId === usuarioId)) {
            throw new Error('Usuário já é membro da equipe!');
        }

        equipe.membros.push({
            usuarioId,
            papel,
            dataEntrada: new Date().toISOString()
        });

        localStorage.setItem('equipes', JSON.stringify(equipes));
        return equipe;
    }

    removerMembroEquipe(equipeId, usuarioId) {
        const equipes = this.getEquipes();
        const equipe = equipes.find(e => e.id === equipeId);

        if (!equipe) {
            throw new Error('Equipe não encontrada!');
        }

        equipe.membros = equipe.membros.filter(m => m.usuarioId !== usuarioId);
        localStorage.setItem('equipes', JSON.stringify(equipes));
        return equipe;
    }

    getMembrosEquipe(equipeId) {
        const equipe = this.getEquipePorId(equipeId);
        if (!equipe) return [];

        return equipe.membros.map(m => {
            const usuario = this.getUsuarioPorId(m.usuarioId);
            return {
                ...usuario,
                papel: m.papel,
                dataEntrada: m.dataEntrada
            };
        });
    }

    // ===== CONVITES =====
    criarConvite(equipeId, remetenteId, emailDestino) {
        const convites = this.getConvites();
        const destinatario = this.getUsuarioPorEmail(emailDestino);

        if (!destinatario) {
            throw new Error('Usuário não encontrado com este email!');
        }

        const equipe = this.getEquipePorId(equipeId);
        if (!equipe) {
            throw new Error('Equipe não encontrada!');
        }

        // Verifica se já existe convite pendente
        const convitePendente = convites.find(c =>
            c.equipeId === equipeId &&
            c.destinatarioId === destinatario.id &&
            c.status === 'pendente'
        );

        if (convitePendente) {
            throw new Error('Já existe um convite pendente para este usuário!');
        }

        const novoConvite = {
            id: this.gerarId(),
            equipeId,
            remetenteId,
            destinatarioId: destinatario.id,
            status: 'pendente', // pendente, aceito, recusado
            dataCriacao: new Date().toISOString(),
            dataResposta: null
        };

        convites.push(novoConvite);
        localStorage.setItem('convites', JSON.stringify(convites));
        return novoConvite;
    }

    getConvites() {
        return JSON.parse(localStorage.getItem('convites') || '[]');
    }

    getConvitesDoUsuario(usuarioId) {
        const convites = this.getConvites();
        return convites.filter(c =>
            c.destinatarioId === usuarioId && c.status === 'pendente'
        );
    }

    aceitarConvite(conviteId) {
        const convites = this.getConvites();
        const convite = convites.find(c => c.id === conviteId);

        if (!convite) {
            throw new Error('Convite não encontrado!');
        }

        convite.status = 'aceito';
        convite.dataResposta = new Date().toISOString();
        localStorage.setItem('convites', JSON.stringify(convites));

        // Adiciona usuário à equipe
        this.adicionarMembroEquipe(convite.equipeId, convite.destinatarioId);
        return convite;
    }

    recusarConvite(conviteId) {
        const convites = this.getConvites();
        const convite = convites.find(c => c.id === conviteId);

        if (!convite) {
            throw new Error('Convite não encontrado!');
        }

        convite.status = 'recusado';
        convite.dataResposta = new Date().toISOString();
        localStorage.setItem('convites', JSON.stringify(convites));
        return convite;
    }

    // ===== TRABALHOS =====
    criarTrabalho(dados) {
        const trabalhos = this.getTrabalhos();

        const novoTrabalho = {
            id: this.gerarId(),
            equipeId: dados.equipeId,
            titulo: dados.titulo,
            descricao: dados.descricao,
            responsavelId: dados.responsavelId,
            criadoPorId: dados.criadoPorId,
            dataEntrega: dados.dataEntrega,
            prioridade: dados.prioridade || 'media',
            categoria: dados.categoria || '',
            tags: dados.tags || [],
            status: 'pendente', // pendente, em_andamento, concluido, atrasado
            anexos: dados.anexos || [],
            permitirComentarios: dados.permitirComentarios !== false,
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        trabalhos.push(novoTrabalho);
        localStorage.setItem('trabalhos', JSON.stringify(trabalhos));
        return novoTrabalho;
    }

    getTrabalhos() {
        return JSON.parse(localStorage.getItem('trabalhos') || '[]');
    }

    getTrabalhoPorId(id) {
        const trabalhos = this.getTrabalhos();
        return trabalhos.find(t => t.id === id);
    }

    getTrabalhosEquipe(equipeId) {
        const trabalhos = this.getTrabalhos();
        return trabalhos.filter(t => t.equipeId === equipeId);
    }

    getTrabalhosUsuario(usuarioId) {
        const trabalhos = this.getTrabalhos();
        return trabalhos.filter(t => t.responsavelId === usuarioId);
    }

    atualizarStatusTrabalho(trabalhoId, novoStatus) {
        const trabalhos = this.getTrabalhos();
        const trabalho = trabalhos.find(t => t.id === trabalhoId);

        if (!trabalho) {
            throw new Error('Trabalho não encontrado!');
        }

        trabalho.status = novoStatus;
        trabalho.dataAtualizacao = new Date().toISOString();

        if (novoStatus === 'concluido') {
            trabalho.dataConclusao = new Date().toISOString();
        }

        localStorage.setItem('trabalhos', JSON.stringify(trabalhos));
        return trabalho;
    }

    editarTrabalho(trabalhoId, dadosAtualizados) {
        const trabalhos = this.getTrabalhos();
        const trabalho = trabalhos.find(t => t.id === trabalhoId);

        if (!trabalho) {
            throw new Error('Trabalho não encontrado!');
        }

        Object.assign(trabalho, dadosAtualizados);
        trabalho.dataAtualizacao = new Date().toISOString();

        localStorage.setItem('trabalhos', JSON.stringify(trabalhos));
        return trabalho;
    }

    deletarTrabalho(trabalhoId) {
        const trabalhos = this.getTrabalhos();
        const index = trabalhos.findIndex(t => t.id === trabalhoId);

        if (index === -1) {
            throw new Error('Trabalho não encontrado!');
        }

        // Remove o trabalho
        trabalhos.splice(index, 1);
        localStorage.setItem('trabalhos', JSON.stringify(trabalhos));

        // Remove mensagens relacionadas
        const mensagens = this.getMensagens();
        const mensagensFiltradas = mensagens.filter(m => m.trabalhoId !== trabalhoId);
        localStorage.setItem('mensagens', JSON.stringify(mensagensFiltradas));

        // Remove progressos relacionados
        const progressos = this.getProgressos();
        const progressosFiltrados = progressos.filter(p => p.trabalhoId !== trabalhoId);
        localStorage.setItem('progressos', JSON.stringify(progressosFiltrados));

        return true;
    }

    // ===== MENSAGENS NO TRABALHO =====
    adicionarMensagem(trabalhoId, usuarioId, conteudo, tipo = 'mensagem') {
        const mensagens = this.getMensagens();

        const novaMensagem = {
            id: this.gerarId(),
            trabalhoId,
            usuarioId,
            conteudo,
            tipo, // mensagem, progresso, arquivo
            dataCriacao: new Date().toISOString()
        };

        mensagens.push(novaMensagem);
        localStorage.setItem('mensagens', JSON.stringify(mensagens));
        return novaMensagem;
    }

    getMensagens() {
        return JSON.parse(localStorage.getItem('mensagens') || '[]');
    }

    getMensagensTrabalho(trabalhoId) {
        const mensagens = this.getMensagens();
        return mensagens.filter(m => m.trabalhoId === trabalhoId);
    }

    // ===== PROGRESSOS =====
    adicionarProgresso(trabalhoId, usuarioId, descricao, percentual, arquivos = []) {
        const progressos = this.getProgressos();

        const novoProgresso = {
            id: this.gerarId(),
            trabalhoId,
            usuarioId,
            descricao,
            percentual,
            arquivos,
            dataCriacao: new Date().toISOString()
        };

        progressos.push(novoProgresso);
        localStorage.setItem('progressos', JSON.stringify(progressos));

        // Adiciona mensagem automática
        this.adicionarMensagem(
            trabalhoId,
            usuarioId,
            `Progresso atualizado: ${percentual}% - ${descricao}`,
            'progresso'
        );

        return novoProgresso;
    }

    getProgressos() {
        return JSON.parse(localStorage.getItem('progressos') || '[]');
    }

    getProgressosTrabalho(trabalhoId) {
        const progressos = this.getProgressos();
        return progressos.filter(p => p.trabalhoId === trabalhoId);
    }

    getUltimoProgresso(trabalhoId) {
        const progressos = this.getProgressosTrabalho(trabalhoId);
        return progressos.length > 0 ? progressos[progressos.length - 1] : null;
    }

    // ===== UTILIDADES =====
    gerarId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    limparTodosOsDados() {
        localStorage.clear();
        this.initializeStorage();
    }

    exportarDados() {
        return {
            usuarios: this.getUsuarios(),
            equipes: this.getEquipes(),
            trabalhos: this.getTrabalhos(),
            convites: this.getConvites(),
            mensagens: this.getMensagens(),
            progressos: this.getProgressos()
        };
    }

    importarDados(dados) {
        if (dados.usuarios) localStorage.setItem('usuarios', JSON.stringify(dados.usuarios));
        if (dados.equipes) localStorage.setItem('equipes', JSON.stringify(dados.equipes));
        if (dados.trabalhos) localStorage.setItem('trabalhos', JSON.stringify(dados.trabalhos));
        if (dados.convites) localStorage.setItem('convites', JSON.stringify(dados.convites));
        if (dados.mensagens) localStorage.setItem('mensagens', JSON.stringify(dados.mensagens));
        if (dados.progressos) localStorage.setItem('progressos', JSON.stringify(dados.progressos));
    }
}

// Instância global
const storage = new StorageManager();
window.storage = storage;
