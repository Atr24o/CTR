// cadastro.js
function cadastrar() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const conf_senha = document.getElementById('conf_senha').value;
    const profissao = document.getElementById('profissao').value.trim();

    // Validações
    if (!nome || !email || !senha || !conf_senha) {
        alert('❌ Preencha todos os campos obrigatórios!');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        alert('❌ Digite um email válido!');
        return;
    }

    if (senha.length < 8) {
        alert('❌ A senha deve ter no mínimo 8 caracteres!');
        return;
    }

    if (senha !== conf_senha) {
        alert('❌ As senhas não coincidem!');
        return;
    }

    try {
        // Usa o sistema de armazenamento local
        const novoUsuario = storage.criarUsuario(nome, email, senha, profissao);

        alert('✅ Cadastro realizado com sucesso!\nAgora você pode fazer login.');
        window.location.href = 'Login.html';

    } catch (error) {
        alert('❌ Erro: ' + error.message);
        console.error('Erro no cadastro:', error);
    }
}

// Permite cadastrar com Enter
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                cadastrar();
            }
        });
    });
});