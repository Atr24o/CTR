from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dao.usuario_dao import UsuarioDAO
from models.usuario import Usuario
from utils.validadores import Validadores
import hashlib

app = Flask(__name__)
app.secret_key = '7pr0j3t07ctr7'
CORS(app)  # Permite que o front-end acesse a API

dao = UsuarioDAO()
validadores = Validadores()

# ========== ROTAS DE AUTH ==========

# CADASTRO
@app.route('/api/cadastrar', methods=['POST'])
def cadastrar():
    """Rota para cadastro de usuário"""
    dados = request.json

    # Valida campos obrigatórios
    if not dados.get('nome') or not dados.get('email') or not dados.get('senha'):
        return jsonify({'erro': 'Todos os campos são obrigatórios'}), 400

    # Valida email
    if not validadores.validar_email(dados['email']):
        return jsonify({'erro': 'Email inválido'}), 400

    # Valida senha (mínimo 8 caracteres)
    if len(dados['senha']) < 8:
        return jsonify({'erro': 'Senha deve ter no mínimo 8 caracteres'}), 400

    # Verifica se senhas coincidem
    if dados.get('senha') != dados.get('conf_senha'):
        return jsonify({'erro': 'As senhas estão diferentes'}), 400

    # Verifica se email já existe
    if dao.buscar_por_email(dados['email']):
        return jsonify({'erro': 'Email já cadastrado'}), 400

    # Cria usuário (hash da senha)
    senha_hash = hashlib.sha256(dados['senha'].encode()).hexdigest()
    usuario = Usuario(
        nome=dados['nome'],
        email=dados['email'],
        senha=senha_hash,
        profissao=dados.get('profissao', '')
    )

    resultado = dao.inserir(usuario)
    if resultado:
        return jsonify({
            'mensagem': 'Cadastro realizado com sucesso!',
            'usuario': {'id': usuario.id, 'nome': usuario.nome, 'email': usuario.email}
        }), 201
    else:
        return jsonify({'erro': 'Erro ao cadastrar usuário'}), 500


# LOGIN
@app.route('/api/login', methods=['POST'])
def login():
    """Rota para login de usuário"""
    dados = request.json

    if not dados.get('email') or not dados.get('senha'):
        return jsonify({'erro': 'Email e senha são obrigatórios'}), 400

    # Busca usuário pelo email
    usuario = dao.buscar_por_email(dados['email'])

    if not usuario:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    # Verifica senha
    senha_hash = hashlib.sha256(dados['senha'].encode()).hexdigest()
    if usuario.senha != senha_hash:
        return jsonify({'erro': 'Senha incorreta'}), 401

    # Cria sessão (login)
    session['usuario_id'] = usuario.id
    session['usuario_nome'] = usuario.nome

    return jsonify({
        'mensagem': 'Login realizado com sucesso!',
        'usuario': {'id': usuario.id, 'nome': usuario.nome, 'email': usuario.email}
    }), 200


# LOGOUT
@app.route('/api/logout', methods=['POST'])
def logout():
    """Rota para logout"""
    session.clear()
    return jsonify({'mensagem': 'Logout realizado com sucesso'}), 200


@app.route('/api/verificar_sessao', methods=['GET'])
def verificar_sessao():
    """Verifica se o usuário está logado"""
    if 'usuario_id' in session:
        return jsonify({
            'logado': True,
            'usuario': {
                'id': session['usuario_id'],
                'nome': session.get('usuario_nome')
            }
        }), 200
    else:
        return jsonify({'logado': False}), 200


# ========== ROTAS DE USUÁRIOS ==========

@app.route('/api/usuarios', methods=['GET'])
def listar_usuarios():
    """Lista todos os usuários (admin)"""
    usuarios = dao.buscar_todos()
    return jsonify([u.to_dict() for u in usuarios]), 200


@app.route('/api/usuarios/<int:id>', methods=['GET'])
def buscar_usuario(id):
    """Busca um usuário específico"""
    usuario = dao.buscar_por_id(id)
    if usuario:
        return jsonify(usuario.to_dict()), 200
    else:
        return jsonify({'erro': 'Usuário não encontrado'}), 404


@app.route('/api/usuarios/<int:id>', methods=['PUT'])
def atualizar_usuario(id):
    """Atualiza um usuário"""
    dados = request.json
    usuario = dao.buscar_por_id(id)
    
    if not usuario:
        return jsonify({'erro': 'Usuário não encontrado'}), 404
    
    if dados.get('nome'):
        usuario.nome = dados['nome']
    if dados.get('email'):
        if not validadores.validar_email(dados['email']):
            return jsonify({'erro': 'Email inválido'}), 400
        usuario.email = dados['email']
    if dados.get('profissao'):
        usuario.profissao = dados['profissao']
    
    if dao.atualizar(usuario):
        return jsonify({'mensagem': 'Usuário atualizado com sucesso'}), 200
    else:
        return jsonify({'erro': 'Erro ao atualizar'}), 500


@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    """Deleta um usuário"""
    if dao.deletar(id):
        return jsonify({'mensagem': 'Usuário deletado com sucesso'}), 200
    else:
        return jsonify({'erro': 'Erro ao deletar'}), 500


# ========== INICIALIZAÇÃO ==========

from flask import send_from_directory

# Servir arquivos HTML
@app.route('/')
def index():
    return send_from_directory('../Pages', 'Login.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../Pages', filename)

if __name__ == '__main__':
    # Cria a tabela apenas se não existir
    dao.criar_tabela()
    app.run(debug=False, host='0.0.0.0', port=5000)