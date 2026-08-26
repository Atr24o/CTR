// cadastro.js
async function cadastrar() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const conf_senha = document.getElementById('conf_senha').value;
    const profissao = document.getElementById('profissao').value;
    
    // Validações
    if (!nome || !email || !senha || !conf_senha) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    if (senha.length < 8) {
        alert('A senha deve ter no mínimo 8 caracteres!');
        return;
    }
    
    if (senha !== conf_senha) {
        alert('As senhas não coincidem!');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha,
                conf_senha: conf_senha,
                profissao: profissao
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Cadastro realizado com sucesso!');
            window.location.href = 'Login.html';
        } else {
            alert('❌ Erro: ' + data.erro);
        }
    } catch (error) {
        alert('❌ Erro de conexão: ' + error.message);
    }
}