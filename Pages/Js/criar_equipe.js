// criar_equipe.js - Lógica da página Criar_Equipe.html

let membrosConvidados = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página Criar Equipe carregada');
    redirecionarSeNaoLogado();

    const usuario = storage.getUsuarioLogado();
    atualizarBotaoUsuario(usuario);
    configurarEventos();
    carregarConvitesPendentes();
    renderizarMembros();
});

// ===== ATUALIZAR BOTÃO USUÁRIO =====
function atualizarBotaoUsuario(usuario) {
    const botaoUser = document.getElementById('user');
    if (botaoUser && usuario) {
        botaoUser.setAttribute('data-text', usuario.nome || 'Usuário');
    }
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventos() {
    const inputBusca = document.getElementById('busca');
    const btnCriar = document.getElementById('criar');

    if (inputBusca) {
        inputBusca.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adicionarMembro();
            }
        });
    }

    if (btnCriar) {
        btnCriar.addEventListener('click', criarEquipeHandler);
    }
}

// ===== ADICIONAR MEMBRO À LISTA =====
function adicionarMembro() {
    const inputBusca = document.getElementById('busca');
    const email = inputBusca.value.trim();

    if (!email) {
        alert('⚠️ Digite um email');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        alert('⚠️ Email inválido');
        return;
    }

    // Verifica se o usuário existe
    const usuario = storage.getUsuarioPorEmail(email);
    if (!usuario) {
        alert('❌ Usuário não encontrado com este email!\nPeça para a pessoa criar uma conta primeiro.');
        return;
    }

    const usuarioLogado = storage.getUsuarioLogado();
    if (usuario.id === usuarioLogado.id) {
        alert('⚠️ Você não pode convidar a si mesmo');
        return;
    }

    // Verifica se já foi adicionado
    if (membrosConvidados.find(m => m.id === usuario.id)) {
        alert('⚠️ Este usuário já foi adicionado');
        return;
    }

    membrosConvidados.push(usuario);
    inputBusca.value = '';
    renderizarMembros();

    alert('✅ ' + usuario.nome + ' adicionado à lista!');
}

// ===== RENDERIZAR MEMBROS =====
function renderizarMembros() {
    const container = document.querySelector('#equipe .grid');
    if (!container) return;

    container.innerHTML = '';

    const usuarioLogado = storage.getUsuarioLogado();

    // Adiciona o líder primeiro
    const divLider = document.createElement('div');
    divLider.id = 'membros';
    divLider.className = 'membro-lider';
    divLider.innerHTML = `
        <p><strong>👑 ${usuarioLogado.nome}</strong></p>
        <span style="font-size: 12px; color: #666;">${usuarioLogado.email}</span>
        <span style="font-size: 11px; color: #007bff; margin-top: 5px; display: block;">Líder da Equipe</span>
    `;
    container.appendChild(divLider);

    // Adiciona membros convidados
    if (membrosConvidados.length === 0) {
        const divVazio = document.createElement('div');
        divVazio.id = 'membros';
        divVazio.innerHTML = '<p style="color: #999;">Nenhum membro adicionado ainda</p>';
        container.appendChild(divVazio);
    } else {
        membrosConvidados.forEach((membro, index) => {
            const div = document.createElement('div');
            div.id = 'membros';
            div.innerHTML = `
                <p><strong>${membro.nome}</strong></p>
                <span style="font-size: 12px; color: #666;">${membro.email}</span>
                <span style="font-size: 11px; color: #999;">${membro.profissao || 'Sem profissão'}</span>
                <button onclick="removerMembroLista(${index})" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 8px;
                    font-size: 12px;
                ">Remover</button>
            `;
            container.appendChild(div);
        });
    }
}

// ===== REMOVER MEMBRO DA LISTA =====
function removerMembroLista(index) {
    const membro = membrosConvidados[index];
    if (confirm('Remover ' + membro.nome + ' da lista?')) {
        membrosConvidados.splice(index, 1);
        renderizarMembros();
    }
}

// ===== CRIAR EQUIPE =====
function criarEquipeHandler() {
    const nomeEquipe = prompt('Digite o nome da equipe:');

    if (!nomeEquipe || nomeEquipe.trim() === '') {
        alert('⚠️ Nome da equipe é obrigatório');
        return;
    }

    const descricao = prompt('Digite uma descrição para a equipe (opcional):') || '';

    try {
        const usuarioLogado = storage.getUsuarioLogado();

        // Cria a equipe
        const equipe = storage.criarEquipe(nomeEquipe.trim(), descricao, usuarioLogado);

        // Envia convites
        let convitesEnviados = 0;
        membrosConvidados.forEach(membro => {
            try {
                storage.criarConvite(equipe.id, usuarioLogado.id, membro.email);
                convitesEnviados++;
            } catch (error) {
                console.error('Erro ao enviar convite:', error);
            }
        });

        alert('✅ Equipe "' + nomeEquipe + '" criada com sucesso!\n' +
              (convitesEnviados > 0 ? convitesEnviados + ' convite(s) enviado(s)!' : 'Convide membros depois.'));

        // Limpa e redireciona
        membrosConvidados = [];
        setTimeout(() => {
            window.location.href = 'Entrar_Equipes.html';
        }, 500);

    } catch (error) {
        alert('❌ Erro ao criar equipe: ' + error.message);
        console.error('Erro:', error);
    }
}

// ===== CARREGAR CONVITES PENDENTES =====
function carregarConvitesPendentes() {
    try {
        const usuarioLogado = storage.getUsuarioLogado();
        if (!usuarioLogado) return;

        // Busca equipes onde o usuário é o líder
        const todasEquipes = storage.getEquipes();
        const minhasEquipes = todasEquipes.filter(e => e.liderId === usuarioLogado.id);

        const containerConvites = document.querySelector('#convidados .grid');
        if (!containerConvites) return;

        containerConvites.innerHTML = '';

        if (minhasEquipes.length === 0) {
            containerConvites.innerHTML = '<div id="convite"><p style="color: #999;">Você ainda não criou nenhuma equipe</p></div>';
            return;
        }

        minhasEquipes.forEach(equipe => {
            // Conta membros e convites pendentes
            const numMembros = equipe.membros.length;
            const convitesPendentes = storage.getConvites().filter(c =>
                c.equipeId === equipe.id && c.status === 'pendente'
            ).length;

            const div = document.createElement('div');
            div.id = 'convite';
            div.style.cursor = 'pointer';
            div.innerHTML = `
                <p><strong>👑 ${equipe.nome}</strong></p>
                <p style="font-size: 12px; color: #666; margin: 5px 0;">${equipe.descricao || 'Sem descrição'}</p>
                <p style="font-size: 11px; color: #007bff; margin: 3px 0;">👥 ${numMembros} membro(s)</p>
                <p style="font-size: 11px; color: #ff9800; margin: 3px 0;">📧 ${convitesPendentes} convite(s) pendente(s)</p>
                <p style="font-size: 10px; color: #999; margin: 5px 0;">Criada em: ${new Date(equipe.dataCriacao).toLocaleDateString('pt-BR')}</p>
                <button onclick="gerenciarEquipe('${equipe.id}')" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                    font-size: 12px;
                    width: 100%;
                ">Gerenciar Equipe</button>
            `;
            containerConvites.appendChild(div);
        });

    } catch (error) {
        console.error('Erro ao carregar equipes:', error);
    }
}

function gerenciarEquipe(equipeId) {
    // Salva ID da equipe e redireciona para página de trabalhos
    localStorage.setItem('equipeAtual', equipeId);
    window.location.href = 'Trabalhos_Lancados.html';
}

// Torna funções disponíveis globalmente
window.removerMembroLista = removerMembroLista;
window.gerenciarEquipe = gerenciarEquipe;
