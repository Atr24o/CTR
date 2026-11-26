// convites.js - Gerenciamento de convites

const API_URL = 'http://localhost:5000/api';

// ===== LISTAR CONVITES DO USUÁRIO =====
async function carregarMeusConvites() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario) {
            window.location.href = 'Login.html';
            return [];
        }

        const response = await fetch(`${API_URL}/convites/usuario/${usuario.id}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const convites = await response.json();
            return convites;
        } else {
            console.error('Erro ao carregar convites');
            return [];
        }
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

// ===== LISTAR CONVITES DE UMA EQUIPE =====
async function carregarConvitesEquipe(equipeId) {
    try {
        const response = await fetch(`${API_URL}/convites/equipe/${equipeId}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const convites = await response.json();
            return convites;
        } else {
            console.error('Erro ao carregar convites da equipe');
            return [];
        }
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

// ===== ACEITAR CONVITE =====
async function aceitarConvite(conviteId) {
    try {
        const response = await fetch(`${API_URL}/convites/${conviteId}/aceitar`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.mensagem);
            return true;
        } else {
            alert('❌ ' + data.erro);
            return false;
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro de conexão');
        return false;
    }
}

// ===== RECUSAR CONVITE =====
async function recusarConvite(conviteId) {
    try {
        const response = await fetch(`${API_URL}/convites/${conviteId}/recusar`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.mensagem);
            return true;
        } else {
            alert('❌ ' + data.erro);
            return false;
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro de conexão');
        return false;
    }
}

// ===== CANCELAR CONVITE (quem enviou) =====
async function cancelarConvite(conviteId) {
    try {
        const confirmacao = confirm('Deseja cancelar este convite?');
        if (!confirmacao) return false;

        const response = await fetch(`${API_URL}/convites/${conviteId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.mensagem);
            return true;
        } else {
            alert('❌ ' + data.erro);
            return false;
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro de conexão');
        return false;
    }
}
