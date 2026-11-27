const tamanhoMaximoFoto = 1024 * 1024;
let avatarSelecionado = null;
let avatarEmCarregamento = false;
let usuarioDoPerfil = null;

document.addEventListener('DOMContentLoaded', function() {
    const sessao = storage.getUsuarioLogado();
    if (!storage.isLogado() || !sessao) {
        alert('Faça login para visualizar seu perfil.');
        window.location.href = 'Login.html';
        return;
    }

    usuarioDoPerfil = storage.getUsuarioPorId(sessao.id);
    if (!usuarioDoPerfil) {
        mostrarMensagem('Não foi possível localizar os dados da sua conta.', 'erro');
        return;
    }

    document.getElementById('nome-perfil').value = usuarioDoPerfil.nome || '';
    document.getElementById('email-perfil').value = usuarioDoPerfil.email || '';
    document.getElementById('profissao-perfil').value = usuarioDoPerfil.profissao || '';
    document.getElementById('avatar-preview').src = usuarioDoPerfil.avatar || 'css/images/User.png';

    document.getElementById('form-perfil').addEventListener('submit', salvarPerfil);
    document.getElementById('foto-perfil').addEventListener('change', selecionarFoto);
    document.getElementById('sair-perfil').addEventListener('click', sairDaConta);
});

function selecionarFoto(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(arquivo.type)) {
        mostrarMensagem('Escolha uma imagem JPG, PNG, GIF ou WebP.', 'erro');
        event.target.value = '';
        return;
    }

    if (arquivo.size > tamanhoMaximoFoto) {
        mostrarMensagem('A imagem deve ter no máximo 1 MB.', 'erro');
        event.target.value = '';
        return;
    }

    avatarEmCarregamento = true;
    const leitor = new FileReader();

    leitor.onload = function() {
        if (typeof leitor.result !== 'string') {
            avatarEmCarregamento = false;
            mostrarMensagem('Não foi possível carregar essa imagem.', 'erro');
            return;
        }

        avatarSelecionado = leitor.result;
        document.getElementById('avatar-preview').src = avatarSelecionado;
        avatarEmCarregamento = false;
        mostrarMensagem('Prévia da foto atualizada. Salve para aplicar.', '');
    };

    leitor.onerror = function() {
        avatarEmCarregamento = false;
        mostrarMensagem('Ocorreu um erro ao ler a imagem.', 'erro');
    };

    leitor.readAsDataURL(arquivo);
}

function salvarPerfil(event) {
    event.preventDefault();

    if (avatarEmCarregamento) {
        mostrarMensagem('Aguarde o carregamento da imagem antes de salvar.', 'erro');
        return;
    }

    const nome = document.getElementById('nome-perfil').value.trim();
    const email = document.getElementById('email-perfil').value.trim();
    const profissao = document.getElementById('profissao-perfil').value.trim();
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    if (!nome || !email) {
        mostrarMensagem('Nome e email são obrigatórios.', 'erro');
        return;
    }

    if (novaSenha || confirmarSenha) {
        if (novaSenha.length < 8) {
            mostrarMensagem('A nova senha deve ter no mínimo 8 caracteres.', 'erro');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            mostrarMensagem('As senhas não coincidem.', 'erro');
            return;
        }
    }

    const dados = { nome, email, profissao };
    if (novaSenha) dados.senha = novaSenha;
    if (avatarSelecionado) dados.avatar = avatarSelecionado;

    try {
        usuarioDoPerfil = storage.atualizarUsuario(usuarioDoPerfil.id, dados);
        avatarSelecionado = null;
        document.getElementById('foto-perfil').value = '';
        document.getElementById('nova-senha').value = '';
        document.getElementById('confirmar-senha').value = '';
        mostrarMensagem('Perfil atualizado com sucesso.', 'sucesso');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        mostrarMensagem(error.message || 'Não foi possível atualizar o perfil.', 'erro');
    }
}

function sairDaConta() {
    if (!confirm('Deseja sair da sua conta?')) return;

    storage.fazerLogout();
    window.location.href = 'Main_page.html';
}

function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById('perfil-mensagem');
    mensagem.textContent = texto;
    mensagem.className = `perfil-mensagem${tipo ? ` ${tipo}` : ''}`;
}
