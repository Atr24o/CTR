// envio_trabalhos.js - Funções para enviar trabalhos

let equipeAtual = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página Envio de Trabalhos carregada');
    redirecionarSeNaoLogado();

    const usuarioLogado = storage.getUsuarioLogado();
    atualizarBotaoUsuario(usuarioLogado);

    // Busca equipe atual
    equipeAtual = localStorage.getItem('equipeAtual');
    if (!equipeAtual) {
        alert('❌ Nenhuma equipe selecionada!');
        window.location.href = 'Entrar_Equipes.html';
        return;
    }

    carregarMembrosEquipe();
    configurarPreviewAnexos();
});

function atualizarBotaoUsuario(usuario) {
    const botaoUser = document.getElementById('user');
    if (botaoUser && usuario) {
        botaoUser.setAttribute('data-text', usuario.nome || 'Usuário');
    }
}

// ===== CARREGAR MEMBROS DA EQUIPE =====
function carregarMembrosEquipe() {
    try {
        const membros = storage.getMembrosEquipe(equipeAtual);
        const select = document.getElementById('responsavel');

        if (!select) return;

        select.innerHTML = '<option value="">Selecione um membro da equipe</option>';

        membros.forEach(membro => {
            const option = document.createElement('option');
            option.value = membro.id;
            option.textContent = membro.nome + ' (' + membro.email + ')';
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar membros:', error);
    }
}

// ===== CONFIGURAR PREVIEW DE ANEXOS =====
function configurarPreviewAnexos() {
    const inputAnexos = document.getElementById('anexos');
    if (!inputAnexos) return;

    inputAnexos.addEventListener('change', function() {
        const files = this.files;
        const previewDiv = document.getElementById('preview-anexos');
        const listaAnexos = document.getElementById('lista-anexos');

        if (files.length > 0) {
            previewDiv.style.display = 'block';
            listaAnexos.innerHTML = '';

            Array.from(files).forEach(file => {
                const li = document.createElement('li');
                li.textContent = `${file.name} (${formatarTamanho(file.size)})`;
                listaAnexos.appendChild(li);
            });
        } else {
            previewDiv.style.display = 'none';
        }
    });
}

function formatarTamanho(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== ENVIAR TRABALHO =====
function enviarTrabalho() {
    const titulo = document.getElementById('titulo').value.trim();
    const responsavelId = document.getElementById('responsavel').value;
    const dataEntrega = document.getElementById('data-entrega').value;
    const prioridade = document.getElementById('prioridade').value;
    const categoria = document.getElementById('categoria').value;
    const descricao = document.getElementById('descricao').value.trim();
    const tags = document.getElementById('tags').value.trim();
    const notificarEquipe = document.getElementById('notificar-equipe').checked;
    const permitirComentarios = document.getElementById('permitir-comentarios').checked;
    const anexos = document.getElementById('anexos').files;

    // Validações
    if (!titulo || titulo === 'teste') {
        alert('❌ Por favor, preencha o título do trabalho!');
        return;
    }

    if (!responsavelId) {
        alert('❌ Por favor, selecione um responsável!');
        return;
    }

    if (!dataEntrega) {
        alert('❌ Por favor, selecione uma data de entrega!');
        return;
    }

    // Verifica se a data é futura
    const dataEscolhida = new Date(dataEntrega);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataEscolhida < hoje) {
        if (!confirm('⚠️ A data de entrega é no passado. Deseja continuar mesmo assim?')) {
            return;
        }
    }

    if (!descricao || descricao === 'teste') {
        alert('❌ Por favor, preencha a descrição do trabalho!');
        return;
    }

    try {
        const usuarioLogado = storage.getUsuarioLogado();

        // Processa tags
        const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t !== '' && t !== 'teste') : [];

        // Processa anexos
        const anexosArray = Array.from(anexos).map(file => file.name);

        // Cria o trabalho
        const trabalho = storage.criarTrabalho({
            equipeId: equipeAtual,
            titulo,
            descricao,
            responsavelId,
            criadoPorId: usuarioLogado.id,
            dataEntrega,
            prioridade,
            categoria,
            tags: tagsArray,
            anexos: anexosArray,
            permitirComentarios
        });

        // Adiciona mensagem inicial no trabalho
        storage.adicionarMensagem(
            trabalho.id,
            usuarioLogado.id,
            `Trabalho criado: ${titulo}\nData de entrega: ${new Date(dataEntrega).toLocaleDateString('pt-BR')}`,
            'mensagem'
        );

        // Notifica o responsável (adiciona mensagem)
        if (responsavelId !== usuarioLogado.id) {
            storage.adicionarMensagem(
                trabalho.id,
                usuarioLogado.id,
                `Você foi atribuído como responsável por este trabalho.`,
                'mensagem'
            );
        }

        // Mostra modal de sucesso
        mostrarModalSucesso();

    } catch (error) {
        alert('❌ Erro ao criar trabalho: ' + error.message);
        console.error('Erro:', error);
    }
}

// ===== SALVAR RASCUNHO =====
function salvarRascunho() {
    const titulo = document.getElementById('titulo').value.trim();
    const responsavelId = document.getElementById('responsavel').value;
    const dataEntrega = document.getElementById('data-entrega').value;
    const prioridade = document.getElementById('prioridade').value;
    const categoria = document.getElementById('categoria').value;
    const descricao = document.getElementById('descricao').value.trim();
    const tags = document.getElementById('tags').value.trim();

    const rascunho = {
        id: 'rascunho_' + Date.now(),
        titulo: titulo || 'Rascunho sem título',
        responsavelId,
        dataEntrega,
        prioridade,
        categoria,
        descricao,
        tags,
        dataSalvo: new Date().toISOString(),
        equipeId: equipeAtual
    };

    // Salva no localStorage
    let rascunhos = JSON.parse(localStorage.getItem('rascunhos') || '[]');
    rascunhos.push(rascunho);
    localStorage.setItem('rascunhos', JSON.stringify(rascunhos));

    alert('✅ Rascunho salvo com sucesso!');
    carregarRascunhos();
}

// ===== CARREGAR RASCUNHOS =====
function carregarRascunhos() {
    const rascunhos = JSON.parse(localStorage.getItem('rascunhos') || '[]');
    const container = document.getElementById('lista-rascunhos');

    if (!container) return;

    // Filtra rascunhos da equipe atual
    const rascunhosEquipe = rascunhos.filter(r => r.equipeId === equipeAtual);

    if (rascunhosEquipe.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Nenhum rascunho salvo</p>';
        return;
    }

    container.innerHTML = '<h3>Rascunhos Salvos</h3>';

    rascunhosEquipe.forEach((rascunho, index) => {
        const div = document.createElement('div');
        div.className = 'rascunho-item';
        div.innerHTML = `
            <div class="rascunho-info">
                <h4>${rascunho.titulo}</h4>
                <p>Salvo em: ${new Date(rascunho.dataSalvo).toLocaleString('pt-BR')}</p>
            </div>
            <div class="rascunho-acoes">
                <button class="btn-carregar" onclick="carregarRascunho('${rascunho.id}')">Carregar</button>
                <button class="btn-excluir" onclick="excluirRascunho('${rascunho.id}')">Excluir</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// ===== CARREGAR RASCUNHO =====
function carregarRascunho(rascunhoId) {
    const rascunhos = JSON.parse(localStorage.getItem('rascunhos') || '[]');
    const rascunho = rascunhos.find(r => r.id === rascunhoId);

    if (!rascunho) {
        alert('❌ Rascunho não encontrado!');
        return;
    }

    // Preenche o formulário
    document.getElementById('titulo').value = rascunho.titulo;
    document.getElementById('responsavel').value = rascunho.responsavelId || '';
    document.getElementById('data-entrega').value = rascunho.dataEntrega || '';
    document.getElementById('prioridade').value = rascunho.prioridade || 'media';
    document.getElementById('categoria').value = rascunho.categoria || '';
    document.getElementById('descricao').value = rascunho.descricao;
    document.getElementById('tags').value = rascunho.tags || '';

    alert('✅ Rascunho carregado!');

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== EXCLUIR RASCUNHO =====
function excluirRascunho(rascunhoId) {
    if (!confirm('Deseja realmente excluir este rascunho?')) {
        return;
    }

    let rascunhos = JSON.parse(localStorage.getItem('rascunhos') || '[]');
    rascunhos = rascunhos.filter(r => r.id !== rascunhoId);
    localStorage.setItem('rascunhos', JSON.stringify(rascunhos));

    alert('✅ Rascunho excluído!');
    carregarRascunhos();
}

// ===== MODAL DE SUCESSO =====
function mostrarModalSucesso() {
    const modal = document.getElementById('modal-sucesso');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function fecharModalSucesso() {
    const modal = document.getElementById('modal-sucesso');
    if (modal) {
        modal.style.display = 'none';
    }
    // Redireciona para página de trabalhos
    window.location.href = 'Trabalhos_Lancados.html';
}

// Carrega rascunhos ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(carregarRascunhos, 500);
});

// Torna funções globais
window.enviarTrabalho = enviarTrabalho;
window.salvarRascunho = salvarRascunho;
window.carregarRascunho = carregarRascunho;
window.excluirRascunho = excluirRascunho;
window.fecharModalSucesso = fecharModalSucesso;
