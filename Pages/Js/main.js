// main.js - VERSÃO COMPLETA

// ===== AUTENTICAÇÃO =====
let usuarioLogado = false;

function verificarSessao() {
    const token = localStorage.getItem('tokenUsuario');
    if (token && token !== '') return true;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        if (cookie.trim().startsWith('usuarioLogado=')) {
            return true;
        }
    }
    
    const sessao = sessionStorage.getItem('usuarioLogado');
    if (sessao === 'true') return true;
    
    return false;
}

function fazerLogin(usuario) {
    localStorage.setItem('tokenUsuario', 'token_exemplo_' + Date.now());
    localStorage.setItem('usuario', JSON.stringify(usuario));
    usuarioLogado = true;
    atualizarInterfaceUsuario();
    console.log('✅ Login realizado!');
    alert('Login realizado com sucesso!');
    return true;
}

function fazerLogout() {
    localStorage.removeItem('tokenUsuario');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuarioLogado');
    document.cookie = 'usuarioLogado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    usuarioLogado = false;
    atualizarInterfaceUsuario();
    console.log('✅ Logout realizado!');
    alert('Logout realizado com sucesso!');
    return true;
}

function getUsuarioLogado() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

function atualizarInterfaceUsuario() {
    const botaoUser = document.getElementById('user');
    const usuario = getUsuarioLogado();
    
    if (botaoUser) {
        if (usuarioLogado && usuario) {
            botaoUser.setAttribute('data-text', usuario.nome || 'Usuário');
            const icon = botaoUser.querySelector('img');
            if (icon) {
                icon.style.border = '2px solid #4CAF50';
                icon.style.borderRadius = '50%';
            }
        } else {
            botaoUser.setAttribute('data-text', 'Visitante');
            const icon = botaoUser.querySelector('img');
            if (icon) {
                icon.style.border = 'none';
            }
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

    console.log('📝 Para testar, digite no console:');
    console.log('  fazerLogin({nome: "João"}) - para logar');
    console.log('  fazerLogout() - para deslogar');
}

// Executa quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarPagina);
} else {
    iniciarPagina();
}

// Torna funções globais
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.verificarSessao = verificarSessao;