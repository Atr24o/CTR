// equipes.js - Gerenciamento de equipes

const API_URL = 'http://localhost:5000/api';

// ===== CRIAR EQUIPE =====
async function criarEquipe(nome, descricao, membrosEmails) {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario) {
            alert('❌ Você precisa estar logado');
            window.location.href = 'Login.html';
            return;
        }

        // 1. Cria a equipe
        const responseEquipe = await fetch(`${API_URL}/equipes`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                descricao: descricao
            })
        });

        const dataEquipe = await responseEquipe.json();

        if (!responseEquipe.ok) {
            alert('❌ Erro ao criar equipe: ' + dataEquipe.erro);
            return null;
        }

        const equipe = dataEquipe.equipe;

        // 2. Envia convites para os membros
        if (membrosEmails && membrosEmails.length > 0) {
            for (const email of membrosEmails) {
                if (email && email.trim() !== '') {
                    await enviarConvite(equipe.id, email.trim());
                }
            }
        }

        alert('✅ Equipe criada com sucesso!');
        return equipe;

    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro de conexão: ' + error.message);
        return null;
    }
}

// ===== ENVIAR CONVITE =====
async function enviarConvite(equipeId, email) {
    try {
        const response = await fetch(`${API_URL}/convites`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                equipe_id: equipeId,
                email: email
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Convite enviado para ${email}`);
            return true;
        } else {
            console.warn(`⚠️ Erro ao enviar convite para ${email}: ${data.erro}`);
            return false;
        }
    } catch (error) {
        console.error('Erro ao enviar convite:', error);
        return false;
    }
}

// ===== LISTAR EQUIPES DO USUÁRIO =====
async function carregarMinhasEquipes() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario) {
            window.location.href = 'Login.html';
            return [];
        }

        const response = await fetch(`${API_URL}/equipes/usuario/${usuario.id}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const equipes = await response.json();
            return equipes;
        } else {
            console.error('Erro ao carregar equipes');
            return [];
        }
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

// ===== LISTAR MEMBROS DE UMA EQUIPE =====
async function carregarMembrosEquipe(equipeId) {
    try {
        const response = await fetch(`${API_URL}/equipes/${equipeId}/membros`, {
            credentials: 'include'
        });

        if (response.ok) {
            const membros = await response.json();
            return membros;
        } else {
            console.error('Erro ao carregar membros');
            return [];
        }
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

// ===== REMOVER MEMBRO =====
async function removerMembroEquipe(equipeId, usuarioId) {
    try {
        const response = await fetch(`${API_URL}/equipes/${equipeId}/membros/${usuarioId}`, {
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

// ===== SAIR DA EQUIPE =====
async function sairDaEquipe(equipeId) {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario) return false;

        const confirmacao = confirm('Tem certeza que deseja sair desta equipe?');
        if (!confirmacao) return false;

        return await removerMembroEquipe(equipeId, usuario.id);
    } catch (error) {
        console.error('Erro:', error);
        return false;
    }
}

// ===== DELETAR EQUIPE =====
async function deletarEquipe(equipeId) {
    try {
        const confirmacao = confirm('Tem certeza que deseja deletar esta equipe? Esta ação não pode ser desfeita!');
        if (!confirmacao) return false;

        const response = await fetch(`${API_URL}/equipes/${equipeId}`, {
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

// ===== BUSCAR USUÁRIO POR EMAIL (para verificação antes de convidar) =====
async function verificarEmailExiste(email) {
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            credentials: 'include'
        });

        if (response.ok) {
            const usuarios = await response.json();
            return usuarios.some(u => u.email === email);
        }
        return false;
    } catch (error) {
        console.error('Erro:', error);
        return false;
    }
}
