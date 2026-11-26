// main.js - VERSÃO COMPLETA COM STORAGE

// ===== AUTENTICAÇÃO =====
let usuarioLogado = false;

function verificarSessao() {
    return storage.isLogado();
}

function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        storage.fazerLogout();
        usuarioLogado = false;
        alert('✅ Logout realizado com sucesso!');
        window.location.href = 'Main_page.html';
    }
}

function getUsuarioLogado() {
    return storage.getUsuarioLogado();
}

function atualizarInterfaceUsuario() {
    const botaoUser = document.getElementById('user');
    const usuario = getUsuarioLogado();

    if (botaoUser) {
        if (usuario) {
            botaoUser.setAttribute('data-text', usuario.nome || 'Usuário');
            const icon = botaoUser.querySelector('img');
            if (icon) {
                icon.style.border = '2px solid #4caf50';
                icon.style.borderRadius = '50%';
            }
            // Adiciona evento de clique para logout
            botaoUser.onclick = function() {
                if (confirm('Deseja sair da sua conta?')) {
                    fazerLogout();
                }
            };
        } else {
            botaoUser.setAttribute('data-text', 'Visitante');
            const icon = botaoUser.querySelector('img');
            if (icon) {
                icon.style.border = 'none';
            }
            botaoUser.onclick = function() {
                window.location.href = 'Login.html';
            };
        }
    }
}

// ===== MODAL =====
function mostrarAviso() {
    const modal = document.getElementById('modalAviso');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function fecharModal() {
    const modal = document.getElementById('modalAviso');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== VERIFICAÇÃO =====
function verificarLogin(event) {
    console.log('🔍 Verificando login...');

    const estaLogado = verificarSessao();
    console.log('📊 Status:', estaLogado ? 'Logado' : 'Não logado');

    if (!estaLogado) {
        event.preventDefault();
        console.log('🚫 Acesso bloqueado!');
        mostrarAviso();
        return false;
    }

    console.log('✅ Acesso permitido!');
    return true;
}

function redirecionarSeNaoLogado() {
    if (!verificarSessao()) {
        alert('❌ Você precisa estar logado para acessar esta página!');
        window.location.href = 'Main_page.html';
    }
}

// ===== INICIALIZAÇÃO =====
function iniciarPagina() {
    console.log('🚀 Inicializando página...');

    usuarioLogado = verificarSessao();
    atualizarInterfaceUsuario();

    const linkEntrar = document.getElementById('linkEntrar');
    const linkCriar = document.getElementById('linkCriar');
    const modal = document.getElementById('modalAviso');

    console.log('🔍 Elementos encontrados:');
    console.log('  - linkEntrar:', linkEntrar ? '✅' : '❌');
    console.log('  - linkCriar:', linkCriar ? '✅' : '❌');

    if (linkEntrar) {
        linkEntrar.addEventListener('click', verificarLogin);
        console.log('✅ Evento adicionado ao linkEntrar');
    }

    if (linkCriar) {
        linkCriar.addEventListener('click', verificarLogin);
        console.log('✅ Evento adicionado ao linkCriar');
    }

    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                fecharModal();
            }
        });
    }

    console.log('📝 Sistema de armazenamento local ativo');
    console.log('💾 Usuário logado:', getUsuarioLogado()?.nome || 'Nenhum');
}

// Executa quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarPagina);
} else {
    iniciarPagina();
}

// Torna funções globais
window.fazerLogout = fazerLogout;
window.verificarSessao = verificarSessao;
window.getUsuarioLogado = getUsuarioLogado;
window.redirecionarSeNaoLogado = redirecionarSeNaoLogado;