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
    const linkUsuario = botaoUser ? botaoUser.closest('a') : null;

    if (botaoUser) {
        if (usuario) {
            const perfil = storage.getUsuarioPorId(usuario.id);
            botaoUser.setAttribute('data-text', usuario.nome || 'Usuário');
            if (linkUsuario) {
                linkUsuario.href = 'Perfil.html';
            }

            const icon = botaoUser.querySelector('img');
            if (icon) {
                icon.src = perfil && perfil.avatar ? perfil.avatar : 'css/images/User.png';
                icon.style.border = '2px solid #4caf50';
                icon.style.borderRadius = '50%';
            }

            botaoUser.onclick = function(event) {
                event.preventDefault();
                window.location.href = 'Perfil.html';
            };
        } else {
            botaoUser.setAttribute('data-text', 'Visitante');
            if (linkUsuario) {
                linkUsuario.href = 'Login.html';
            }

            const icon = botaoUser.querySelector('img');
            if (icon) {
                icon.src = 'css/images/User.png';
                icon.style.border = 'none';
            }

            botaoUser.onclick = function(event) {
                event.preventDefault();
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

function iniciarBannerSlideshow() {
    const imagemBanner = document.getElementById('banner-imagem');
    const envelopes = document.querySelectorAll('.envelope-banner');
    if (!imagemBanner || envelopes.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const slides = [
        {
            src: 'css/images/home-office.jpg',
            alt: 'Notebook em uma estação de trabalho em casa'
        },
        {
            src: 'css/images/trabalho-remoto.jpg',
            alt: 'Estação de trabalho com uma chamada de vídeo em andamento'
        }
    ];
    let indiceAtual = 0;
    const duracaoTransicao = 1800;
    const momentoTrocaImagem = duracaoTransicao / 2;
    const tempoExibicao = 7000;

    slides.forEach(function(slide) {
        const imagem = new Image();
        imagem.src = slide.src;
    });

    function trocarImagem() {
        imagemBanner.classList.add('is-fading');
        envelopes.forEach(function(envelope) {
            envelope.classList.add('is-sending');
        });
        window.setTimeout(function() {
            indiceAtual = (indiceAtual + 1) % slides.length;
            imagemBanner.src = slides[indiceAtual].src;
            imagemBanner.alt = slides[indiceAtual].alt;
            imagemBanner.classList.remove('is-fading');
        }, momentoTrocaImagem);
        window.setTimeout(function() {
            envelopes.forEach(function(envelope) {
                envelope.classList.remove('is-sending');
            });
            window.setTimeout(trocarImagem, tempoExibicao);
        }, duracaoTransicao);
    }

    window.setTimeout(trocarImagem, tempoExibicao);
}

// ===== INICIALIZAÇÃO =====
function iniciarPagina() {
    console.log('🚀 Inicializando página...');

    usuarioLogado = verificarSessao();
    atualizarInterfaceUsuario();
    iniciarBannerSlideshow();

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