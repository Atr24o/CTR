// entrar_equipes.js - Lógica da página Entrar_Equipes.html

let equipeAtual = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página Entrar Equipes carregada');
    redirecionarSeNaoLogado();

    const usuario = storage.getUsuarioLogado();
    atualizarBotaoUsuario(usuario);

    carregarMinhasEquipes();
    carregarMeusConvites();
});

// ===== ATUALIZAR BOTÃO USUÁRIO =====
function atualizarBotaoUsuario(usuario) {
    const botaoUser = document.getElementById('user');
    if (botaoUser && usuario) {
        botaoUser.setAttribute('data-text', usuario.nome || 'Usuário');
    }
}

// ===== CARREGAR MINHAS EQUIPES =====
function carregarMinhasEquipes() {
    try {
        const usuarioLogado = storage.getUsuarioLogado();
        if (!usuarioLogado) return;

        const equipes = storage.getEquipesDoUsuario(usuarioLogado.id);
        const container = document.querySelector('#gps .hgrid');

        if (!container) return;

        container.innerHTML = '';

        if (equipes.length === 0) {
            container.innerHTML = '<div id="grupos"><p style="color: #999;">Você ainda não participa de nenhuma equipe</p></div>';
            const membrosContainer = document.querySelector('#equipe .grid');
            if (membrosContainer) {
                membrosContainer.innerHTML = '<div id="membros"><p>Nenhuma equipe selecionada.</p></div>';
            }
            return;
        }

        equipes.forEach(equipe => {
            const membro = equipe.membros.find(m => m.usuarioId === usuarioLogado.id);
            const papel = membro ? membro.papel : 'membro';
            const ehLider = papel === 'lider';

            const div = document.createElement('div');
            div.id = 'grupos';
            div.innerHTML = `
                <h3 style="margin: 10px 0; color: #333;">${ehLider ? '👑 ' : ''}${equipe.nome}</h3>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">${equipe.descricao || 'Sem descrição'}</p>
                <p style="font-size: 12px; color: #007bff; margin: 5px 0;">${papel === 'lider' ? 'Líder' : 'Membro'}</p>
                <p style="font-size: 11px; color: #999; margin: 5px 0;">${equipe.membros.length} membro(s)</p>
                <button id="entrar" onclick="visualizarEquipe('${equipe.id}')">
                    Ver Membros
                </button>
                <button onclick="acessarTrabalhos('${equipe.id}')" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 5px;
                    font-size: 14px;
                    width: 100%;
                ">📋 Ver Trabalhos</button>
            `;
            container.appendChild(div);
        });

        // Carrega membros da primeira equipe
        if (equipes.length > 0) {
            equipeAtual = equipes[0].id;
            carregarMembrosEquipe(equipes[0].id);
        }

    } catch (error) {
        console.error('Erro ao carregar equipes:', error);
    }
}

// ===== VISUALIZAR EQUIPE =====
function visualizarEquipe(equipeId) {
    equipeAtual = equipeId;
    carregarMembrosEquipe(equipeId);

    // Scroll suave até a seção de membros
    const listaMembros = document.getElementById('lista');
    if (listaMembros) {
        listaMembros.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== GERENCIAR TRABALHOS DA EQUIPE =====
function gerenciarEquipe(equipeId) {
    // Salva ID da equipe no localStorage para usar na página de trabalhos
    localStorage.setItem('equipeAtual', equipeId);
    window.location.href = 'Trabalhos_Lancados.html';
}

// ===== ACESSAR TRABALHOS (PARA TODOS OS MEMBROS) =====
function acessarTrabalhos(equipeId) {
    // Salva ID da equipe no localStorage para usar na página de trabalhos
    localStorage.setItem('equipeAtual', equipeId);
    window.location.href = 'Trabalhos_Lancados.html';
}

// ===== CARREGAR MEMBROS DA EQUIPE =====
function carregarMembrosEquipe(equipeId) {
    try {
        const membros = storage.getMembrosEquipe(equipeId);
        const equipe = storage.getEquipePorId(equipeId);
        const container = document.querySelector('#equipe .grid');

        if (!container) return;

        container.innerHTML = '';

        if (!equipe) {
            container.innerHTML = '<div id="membros"><p style="color: #999;">Equipe não encontrada</p></div>';
            return;
        }

        const listaDiv = document.getElementById('lista');
        if (listaDiv) {
            const titulo = listaDiv.querySelector('p');
            if (titulo) {
                titulo.textContent = `Membros da equipe: ${equipe.nome}`;
            }
        }

        if (membros.length === 0) {
            container.innerHTML = '<div id="membros"><p style="color: #999;">Nenhum membro ainda</p></div>';
            return;
        }

        const usuarioLogado = storage.getUsuarioLogado();

        membros.forEach(membro => {
            const div = document.createElement('div');
            div.id = 'membros';

            const ehEuMesmo = membro.id === usuarioLogado.id;
            const ehLider = membro.papel === 'lider';

            div.innerHTML = `
                <p><strong>${ehLider ? '👑 ' : ''}${membro.nome}</strong> ${ehEuMesmo ? '(Você)' : ''}</p>
                <p style="font-size: 12px; color: #666;">${membro.email}</p>
                <p style="font-size: 11px; color: #999;">${membro.profissao || 'Sem profissão'}</p>
                <p style="font-size: 11px; color: #007bff; margin-top: 5px;">${ehLider ? 'Líder' : 'Membro'}</p>
                <p style="font-size: 10px; color: #aaa;">Desde: ${new Date(membro.dataEntrada).toLocaleDateString('pt-BR')}</p>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        console.error('Erro ao carregar membros:', error);
    }
}

// ===== CARREGAR CONVITES =====
function carregarMeusConvites() {
    try {
        const usuarioLogado = storage.getUsuarioLogado();
        if (!usuarioLogado) return;

        const convites = storage.getConvitesDoUsuario(usuarioLogado.id);
        const container = document.querySelector('#convidados .grid');

        if (!container) return;

        container.innerHTML = '';

        if (convites.length === 0) {
            container.innerHTML = '<div id="convite"><p style="color: #999;">Nenhum convite pendente</p></div>';
            return;
        }

        convites.forEach(convite => {
            const equipe = storage.getEquipePorId(convite.equipeId);
            const remetente = storage.getUsuarioPorId(convite.remetenteId);

            if (equipe && remetente) {
                const div = document.createElement('div');
                div.id = 'convite';
                div.innerHTML = `
                    <p><strong>${equipe.nome}</strong></p>
                    <p style="font-size: 12px; color: #666; margin: 5px 0;">${equipe.descricao || 'Sem descrição'}</p>
                    <p style="font-size: 11px; color: #999;">Convite de: ${remetente.nome}</p>
                    <p style="font-size: 10px; color: #aaa;">Enviado: ${new Date(convite.dataCriacao).toLocaleDateString('pt-BR')}</p>
                    <button id="aceitar" onclick="aceitarConviteHandler('${convite.id}')">
                        Entrar
                    </button>
                    <button id="recusar" onclick="recusarConviteHandler('${convite.id}')">
                        Recusar
                    </button>
                `;
                container.appendChild(div);
            }
        });

    } catch (error) {
        console.error('Erro ao carregar convites:', error);
    }
}

// ===== ACEITAR CONVITE =====
function aceitarConviteHandler(conviteId) {
    try {
        const convite = storage.aceitarConvite(conviteId);
        const equipe = storage.getEquipePorId(convite.equipeId);

        alert('✅ Você entrou na equipe "' + equipe.nome + '"!');

        // Recarrega tudo
        carregarMinhasEquipes();
        carregarMeusConvites();

    } catch (error) {
        alert('❌ Erro ao aceitar convite: ' + error.message);
        console.error('Erro:', error);
    }
}

// ===== RECUSAR CONVITE =====
function recusarConviteHandler(conviteId) {
    if (confirm('Deseja realmente recusar este convite?')) {
        try {
            storage.recusarConvite(conviteId);
            alert('✅ Convite recusado');
            carregarMeusConvites();

        } catch (error) {
            alert('❌ Erro ao recusar convite: ' + error.message);
            console.error('Erro:', error);
        }
    }
}

// Torna funções disponíveis globalmente
window.visualizarEquipe = visualizarEquipe;
window.gerenciarEquipe = gerenciarEquipe;
window.acessarTrabalhos = acessarTrabalhos;
window.aceitarConviteHandler = aceitarConviteHandler;
window.recusarConviteHandler = recusarConviteHandler;
