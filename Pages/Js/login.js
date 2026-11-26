// login.js
function login() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        alert('❌ Preencha todos os campos!');
        return;
    }

    try {
        // Autentica usando o sistema de armazenamento local
        const usuario = storage.autenticarUsuario(email, senha);

        // Faz login (salva sessão)
        storage.fazerLogin(usuario);

        alert('✅ Login realizado com sucesso!\nBem-vindo, ' + usuario.nome + '!');
        window.location.href = 'Main_page.html';

    } catch (error) {
        alert('❌ Erro: ' + error.message);
        console.error('Erro no login:', error);
    }
}

// Permite fazer login com Enter
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    });
});