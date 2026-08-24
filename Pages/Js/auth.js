// auth.js
// Torna a variável GLOBAL
window.usuarioLogado = false;

function verificarSessao() {
    const token = localStorage.getItem('tokenUsuario');
    if (token && token !== '') {
        return true;
    }
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        if (cookie.trim().startsWith('usuarioLogado=')) {
            return true;
        }
    }
    const sessao = sessionStorage.getItem('usuarioLogado');
    if (sessao === 'true') {
        return true;
    }
    return false;
}

function fazerLogin(usuario) {
    localStorage.setItem('tokenUsuario', 'token_exemplo_' + Date.now());
    localStorage.setItem('usuario', JSON.stringify(usuario));
    window.usuarioLogado = true;
    atualizarInterfaceUsuario();
    return true;
}

function fazerLogout() {
    localStorage.removeItem('tokenUsuario');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuarioLogado');
    document.cookie = 'usuarioLogado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.usuarioLogado = false;
    atualizarInterfaceUsuario();
    return true;
}

function getUsuarioLogado() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        return JSON.parse(usuario);
    }
    return null;
}

function atualizarInterfaceUsuario() {
    const botaoUser = document.getElementById('user');
    const usuario = getUsuarioLogado();
    
    if (botaoUser) {
        if (window.usuarioLogado && usuario) {
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

// Inicializa
window.usuarioLogado = verificarSessao();
atualizarInterfaceUsuario();

// Torna funções globais
window.verificarSessao = verificarSessao;
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;