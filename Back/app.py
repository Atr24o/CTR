from flask import Flask, request, jsonify, session
from flask_cors import CORS
from storage.local_storage import LocalStorage
from utils.validadores import Validadores
import hashlib

app = Flask(__name__)
app.secret_key = '7pr0j3t07ctr7'
CORS(app, supports_credentials=True)

# Inicializa o armazenamento local
storage = LocalStorage()
validadores = Validadores()

# ========== ROTAS DE AUTH ==========

# CADASTRO
@app.route('/api/cadastrar', methods=['POST'])
def cadastrar():
    """Rota para cadastro de usuário"""
    dados = request.json

    if not dados.get('nome') or not dados.get('email') or not dados.get('senha'):
        return jsonify({'erro': 'Todos os campos são obrigatórios'}), 400

    if not validadores.validar_email(dados['email']):
        return jsonify({'erro': 'Email inválido'}), 400

    if len(dados['senha']) < 8:
        return jsonify({'erro': 'Senha deve ter no mínimo 8 caracteres'}), 400

    if dados.get('senha') != dados.get('conf_senha'):
        return jsonify({'erro': 'As senhas estão diferentes'}), 400

    if storage.buscar_usuario_por_email(dados['email']):
        return jsonify({'erro': 'Email já cadastrado'}), 400

    senha_hash = hashlib.sha256(dados['senha'].encode()).hexdigest()
    usuario_data = {
        'nome': dados['nome'],
        'email': dados['email'],
        'senha': senha_hash,
        'profissao': dados.get('profissao', '')
    }

    resultado = storage.inserir_usuario(usuario_data)
    if resultado:
        return jsonify({
            'mensagem': 'Cadastro realizado com sucesso!',
            'usuario': {'id': resultado['id'], 'nome': resultado['nome'], 'email': resultado['email']}
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

    usuario = storage.buscar_usuario_por_email(dados['email'])

    if not usuario:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    senha_hash = hashlib.sha256(dados['senha'].encode()).hexdigest()
    if usuario['senha'] != senha_hash:
        return jsonify({'erro': 'Senha incorreta'}), 401

    session['usuario_id'] = usuario['id']
    session['usuario_nome'] = usuario['nome']

    return jsonify({
        'mensagem': 'Login realizado com sucesso!',
        'usuario': {'id': usuario['id'], 'nome': usuario['nome'], 'email': usuario['email']}
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
    """Lista todos os usuários"""
    usuarios = storage.buscar_todos_usuarios()
    usuarios_sem_senha = [
        {k: v for k, v in u.items() if k != 'senha'}
        for u in usuarios
    ]
    return jsonify(usuarios_sem_senha), 200


@app.route('/api/usuarios/<int:id>', methods=['GET'])
def buscar_usuario(id):
    """Busca um usuário específico"""
    usuario = storage.buscar_usuario_por_id(id)
    if usuario:
        usuario_sem_senha = {k: v for k, v in usuario.items() if k != 'senha'}
        return jsonify(usuario_sem_senha), 200
    else:
        return jsonify({'erro': 'Usuário não encontrado'}), 404


@app.route('/api/usuarios/<int:id>', methods=['PUT'])
def atualizar_usuario(id):
    """Atualiza um usuário"""
    dados = request.json
    usuario = storage.buscar_usuario_por_id(id)

    if not usuario:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    if dados.get('nome'):
        usuario['nome'] = dados['nome']
    if dados.get('email'):
        if not validadores.validar_email(dados['email']):
            return jsonify({'erro': 'Email inválido'}), 400
        usuario['email'] = dados['email']
    if dados.get('profissao'):
        usuario['profissao'] = dados['profissao']

    if storage.atualizar_usuario(id, usuario):
        return jsonify({'mensagem': 'Usuário atualizado com sucesso'}), 200
    else:
        return jsonify({'erro': 'Erro ao atualizar'}), 500


@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    """Deleta um usuário"""
    if storage.deletar_usuario(id):
        return jsonify({'mensagem': 'Usuário deletado com sucesso'}), 200
    else:
        return jsonify({'erro': 'Erro ao deletar'}), 500


# ========== ROTAS DE EQUIPES ==========

@app.route('/api/equipes', methods=['POST'])
def criar_equipe():
    """Cria uma nova equipe"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    dados = request.json

    if not dados.get('nome'):
        return jsonify({'erro': 'Nome da equipe é obrigatório'}), 400

    equipe_data = {
        'nome': dados['nome'],
        'descricao': dados.get('descricao', ''),
        'criador_id': session['usuario_id']
    }

    resultado = storage.inserir_equipe(equipe_data)
    if resultado:
        membro_data = {
            'equipe_id': resultado['id'],
            'usuario_id': session['usuario_id'],
            'papel': 'criador'
        }
        storage.inserir_membro(membro_data)

        return jsonify({
            'mensagem': 'Equipe criada com sucesso!',
            'equipe': resultado
        }), 201
    else:
        return jsonify({'erro': 'Erro ao criar equipe'}), 500


@app.route('/api/equipes', methods=['GET'])
def listar_equipes():
    """Lista todas as equipes"""
    equipes = storage.buscar_todas_equipes()
    return jsonify(equipes), 200


@app.route('/api/equipes/<int:id>', methods=['GET'])
def buscar_equipe(id):
    """Busca uma equipe específica"""
    equipe = storage.buscar_equipe_por_id(id)
    if equipe:
        return jsonify(equipe), 200
    else:
        return jsonify({'erro': 'Equipe não encontrada'}), 404


@app.route('/api/equipes/usuario/<int:usuario_id>', methods=['GET'])
def listar_equipes_usuario(usuario_id):
    """Lista equipes que o usuário participa"""
    equipes = storage.buscar_equipes_do_usuario(usuario_id)
    return jsonify(equipes), 200


@app.route('/api/equipes/<int:id>', methods=['PUT'])
def atualizar_equipe(id):
    """Atualiza uma equipe"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    dados = request.json
    equipe = storage.buscar_equipe_por_id(id)

    if not equipe:
        return jsonify({'erro': 'Equipe não encontrada'}), 404

    if equipe['criador_id'] != session['usuario_id']:
        return jsonify({'erro': 'Apenas o criador pode editar a equipe'}), 403

    if dados.get('nome'):
        equipe['nome'] = dados['nome']
    if dados.get('descricao'):
        equipe['descricao'] = dados['descricao']

    if storage.atualizar_equipe(id, equipe):
        return jsonify({'mensagem': 'Equipe atualizada com sucesso'}), 200
    else:
        return jsonify({'erro': 'Erro ao atualizar'}), 500


@app.route('/api/equipes/<int:id>', methods=['DELETE'])
def deletar_equipe(id):
    """Deleta uma equipe"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    equipe = storage.buscar_equipe_por_id(id)

    if not equipe:
        return jsonify({'erro': 'Equipe não encontrada'}), 404

    if equipe['criador_id'] != session['usuario_id']:
        return jsonify({'erro': 'Apenas o criador pode deletar a equipe'}), 403

    if storage.deletar_equipe(id):
        return jsonify({'mensagem': 'Equipe deletada com sucesso'}), 200
    else:
        return jsonify({'erro': 'Erro ao deletar'}), 500


# ========== ROTAS DE MEMBROS ==========

@app.route('/api/equipes/<int:equipe_id>/membros', methods=['GET'])
def listar_membros(equipe_id):
    """Lista membros de uma equipe"""
    membros = storage.buscar_membros_por_equipe(equipe_id)
    return jsonify(membros), 200


@app.route('/api/equipes/<int:equipe_id>/membros/<int:usuario_id>', methods=['DELETE'])
def remover_membro(equipe_id, usuario_id):
    """Remove um membro da equipe"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    equipe = storage.buscar_equipe_por_id(equipe_id)

    if not equipe:
        return jsonify({'erro': 'Equipe não encontrada'}), 404

    if equipe['criador_id'] != session['usuario_id'] and session['usuario_id'] != usuario_id:
        return jsonify({'erro': 'Sem permissão para remover membro'}), 403

    if storage.deletar_membro(equipe_id, usuario_id):
        return jsonify({'mensagem': 'Membro removido com sucesso'}), 200
    else:
        return jsonify({'erro': 'Erro ao remover membro'}), 500


# ========== ROTAS DE CONVITES ==========

@app.route('/api/convites', methods=['POST'])
def criar_convite():
    """Cria um convite para usuário entrar em equipe"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    dados = request.json

    if not dados.get('equipe_id') or not dados.get('email'):
        return jsonify({'erro': 'Equipe e email são obrigatórios'}), 400

    usuario_convidado = storage.buscar_usuario_por_email(dados['email'])

    if not usuario_convidado:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    equipe_id = dados['equipe_id']

    equipe = storage.buscar_equipe_por_id(equipe_id)
    if not equipe:
        return jsonify({'erro': 'Equipe não encontrada'}), 404

    if storage.verificar_membro(equipe_id, usuario_convidado['id']):
        return jsonify({'erro': 'Usuário já é membro desta equipe'}), 400

    if storage.verificar_convite_existente(equipe_id, usuario_convidado['id']):
        return jsonify({'erro': 'Já existe um convite pendente para este usuário'}), 400

    convite_data = {
        'equipe_id': equipe_id,
        'usuario_id': usuario_convidado['id'],
        'remetente_id': session['usuario_id'],
        'status': 'pendente'
    }

    resultado = storage.inserir_convite(convite_data)
    if resultado:
        return jsonify({
            'mensagem': 'Convite enviado com sucesso!',
            'convite': resultado
        }), 201
    else:
        return jsonify({'erro': 'Erro ao criar convite'}), 500


@app.route('/api/convites/usuario/<int:usuario_id>', methods=['GET'])
def listar_convites_usuario(usuario_id):
    """Lista convites pendentes de um usuário"""
    convites = storage.buscar_convites_por_usuario(usuario_id)
    return jsonify(convites), 200


@app.route('/api/convites/equipe/<int:equipe_id>', methods=['GET'])
def listar_convites_equipe(equipe_id):
    """Lista convites de uma equipe"""
    convites = storage.buscar_convites_por_equipe(equipe_id)
    return jsonify(convites), 200


@app.route('/api/convites/<int:convite_id>/aceitar', methods=['POST'])
def aceitar_convite(convite_id):
    """Aceita um convite de equipe"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    convite = storage.buscar_convite_por_id(convite_id)

    if not convite:
        return jsonify({'erro': 'Convite não encontrado'}), 404

    if convite['usuario_id'] != session['usuario_id']:
        return jsonify({'erro': 'Este convite não é para você'}), 403

    if convite['status'] != 'pendente':
        return jsonify({'erro': 'Convite já foi processado'}), 400

    membro_data = {
        'equipe_id': convite['equipe_id'],
        'usuario_id': convite['usuario_id'],
        'papel': 'membro'
    }

    if storage.inserir_membro(membro_data):
        storage.atualizar_status_convite(convite_id, 'aceito')
        return jsonify({'mensagem': 'Convite aceito! Você entrou na equipe'}), 200
    else:
        return jsonify({'erro': 'Erro ao aceitar convite'}), 500


@app.route('/api/convites/<int:convite_id>/recusar', methods=['POST'])
def recusar_convite(convite_id):
    """Recusa um convite de equipe"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    convite = storage.buscar_convite_por_id(convite_id)

    if not convite:
        return jsonify({'erro': 'Convite não encontrado'}), 404

    if convite['usuario_id'] != session['usuario_id']:
        return jsonify({'erro': 'Este convite não é para você'}), 403

    if convite['status'] != 'pendente':
        return jsonify({'erro': 'Convite já foi processado'}), 400

    if storage.atualizar_status_convite(convite_id, 'recusado'):
        return jsonify({'mensagem': 'Convite recusado'}), 200
    else:
        return jsonify({'erro': 'Erro ao recusar convite'}), 500


@app.route('/api/convites/<int:convite_id>', methods=['DELETE'])
def deletar_convite(convite_id):
    """Cancela um convite"""
    if 'usuario_id' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    convite = storage.buscar_convite_por_id(convite_id)

    if not convite:
        return jsonify({'erro': 'Convite não encontrado'}), 404

    if convite['remetente_id'] != session['usuario_id']:
        return jsonify({'erro': 'Apenas quem enviou pode cancelar o convite'}), 403

    if storage.deletar_convite(convite_id):
        return jsonify({'mensagem': 'Convite cancelado'}), 200
    else:
        return jsonify({'erro': 'Erro ao cancelar convite'}), 500


# ========== INICIALIZAÇÃO ==========

from flask import send_from_directory

@app.route('/')
def index():
    return send_from_directory('../Pages', 'Login.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../Pages', filename)

if __name__ == '__main__':
    print("🚀 Servidor iniciado com armazenamento LOCAL")
    print("📁 Dados salvos em: Back/storage/data/")
    print("🔄 Para migrar para banco de dados, basta substituir LocalStorage por DAO")
    app.run(debug=True, host='0.0.0.0', port=5000)
