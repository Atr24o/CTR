// login.js
async function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    if (!email || !senha) {
        alert('Preencha todos os campos!');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Salva dados do usuário
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            localStorage.setItem('tokenUsuario', 'token_' + Date.now());
            
            alert('✅ Login realizado com sucesso!');
            window.location.href = 'Main_page.html';
        } else {
            alert('❌ Erro: ' + data.erro);
        }
    } catch (error) {
        alert('❌ Erro de conexão: ' + error.message);
    }
}