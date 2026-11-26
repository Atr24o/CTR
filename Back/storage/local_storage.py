"""
Sistema de armazenamento local em JSON
Simula um banco de dados usando arquivos JSON
Facilmente substituível por banco de dados real posteriormente
"""
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

class LocalStorage:
    """Gerenciador de armazenamento local em JSON"""

    def __init__(self, data_dir='data'):
        """Inicializa o storage com um diretório de dados"""
        self.data_dir = data_dir
        self.usuarios_file = os.path.join(data_dir, 'usuarios.json')
        self.equipes_file = os.path.join(data_dir, 'equipes.json')
        self.membros_file = os.path.join(data_dir, 'membros_equipe.json')
        self.convites_file = os.path.join(data_dir, 'convites.json')

        # Cria o diretório se não existir
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)

        # Inicializa os arquivos se não existirem
        self._init_files()

    def _init_files(self):
        """Inicializa os arquivos JSON vazios se não existirem"""
        files = [
            self.usuarios_file,
            self.equipes_file,
            self.membros_file,
            self.convites_file
        ]

        for file_path in files:
            if not os.path.exists(file_path):
                self._save_json(file_path, {
                    'next_id': 1,
                    'data': []
                })

    def _load_json(self, file_path: str) -> dict:
        """Carrega dados de um arquivo JSON"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {'next_id': 1, 'data': []}

    def _save_json(self, file_path: str, data: dict):
        """Salva dados em um arquivo JSON"""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    # ========== USUÁRIOS ==========

    def inserir_usuario(self, usuario_data: dict) -> Optional[dict]:
        """Insere um novo usuário"""
        storage = self._load_json(self.usuarios_file)

        # Verifica se email já existe
        if any(u['email'] == usuario_data['email'] for u in storage['data']):
            return None

        # Adiciona ID e data de criação
        usuario_data['id'] = storage['next_id']
        usuario_data['data_criacao'] = datetime.now().isoformat()

        storage['data'].append(usuario_data)
        storage['next_id'] += 1

        self._save_json(self.usuarios_file, storage)
        return usuario_data

    def buscar_usuario_por_email(self, email: str) -> Optional[dict]:
        """Busca usuário por email"""
        storage = self._load_json(self.usuarios_file)
        for usuario in storage['data']:
            if usuario['email'] == email:
                return usuario
        return None

    def buscar_usuario_por_id(self, usuario_id: int) -> Optional[dict]:
        """Busca usuário por ID"""
        storage = self._load_json(self.usuarios_file)
        for usuario in storage['data']:
            if usuario['id'] == usuario_id:
                return usuario
        return None

    def buscar_todos_usuarios(self) -> List[dict]:
        """Retorna todos os usuários"""
        storage = self._load_json(self.usuarios_file)
        return storage['data']

    def atualizar_usuario(self, usuario_id: int, dados: dict) -> bool:
        """Atualiza um usuário"""
        storage = self._load_json(self.usuarios_file)

        for i, usuario in enumerate(storage['data']):
            if usuario['id'] == usuario_id:
                # Mantém ID e data_criacao
                dados['id'] = usuario_id
                dados['data_criacao'] = usuario.get('data_criacao')
                storage['data'][i] = dados
                self._save_json(self.usuarios_file, storage)
                return True
        return False

    def deletar_usuario(self, usuario_id: int) -> bool:
        """Deleta um usuário"""
        storage = self._load_json(self.usuarios_file)
        storage['data'] = [u for u in storage['data'] if u['id'] != usuario_id]
        self._save_json(self.usuarios_file, storage)
        return True

    # ========== EQUIPES ==========

    def inserir_equipe(self, equipe_data: dict) -> Optional[dict]:
        """Insere uma nova equipe"""
        storage = self._load_json(self.equipes_file)

        equipe_data['id'] = storage['next_id']
        equipe_data['data_criacao'] = datetime.now().isoformat()

        storage['data'].append(equipe_data)
        storage['next_id'] += 1

        self._save_json(self.equipes_file, storage)
        return equipe_data

    def buscar_equipe_por_id(self, equipe_id: int) -> Optional[dict]:
        """Busca equipe por ID"""
        storage = self._load_json(self.equipes_file)
        for equipe in storage['data']:
            if equipe['id'] == equipe_id:
                return equipe
        return None

    def buscar_todas_equipes(self) -> List[dict]:
        """Retorna todas as equipes"""
        storage = self._load_json(self.equipes_file)
        return storage['data']

    def buscar_equipes_por_criador(self, criador_id: int) -> List[dict]:
        """Busca equipes criadas por um usuário"""
        storage = self._load_json(self.equipes_file)
        return [e for e in storage['data'] if e['criador_id'] == criador_id]

    def atualizar_equipe(self, equipe_id: int, dados: dict) -> bool:
        """Atualiza uma equipe"""
        storage = self._load_json(self.equipes_file)

        for i, equipe in enumerate(storage['data']):
            if equipe['id'] == equipe_id:
                dados['id'] = equipe_id
                dados['data_criacao'] = equipe.get('data_criacao')
                dados['criador_id'] = equipe.get('criador_id')
                storage['data'][i] = dados
                self._save_json(self.equipes_file, storage)
                return True
        return False

    def deletar_equipe(self, equipe_id: int) -> bool:
        """Deleta uma equipe"""
        storage = self._load_json(self.equipes_file)
        storage['data'] = [e for e in storage['data'] if e['id'] != equipe_id]
        self._save_json(self.equipes_file, storage)

        # Remove membros associados
        membros_storage = self._load_json(self.membros_file)
        membros_storage['data'] = [m for m in membros_storage['data'] if m['equipe_id'] != equipe_id]
        self._save_json(self.membros_file, membros_storage)

        # Remove convites associados
        convites_storage = self._load_json(self.convites_file)
        convites_storage['data'] = [c for c in convites_storage['data'] if c['equipe_id'] != equipe_id]
        self._save_json(self.convites_file, convites_storage)

        return True

    # ========== MEMBROS DE EQUIPE ==========

    def inserir_membro(self, membro_data: dict) -> Optional[dict]:
        """Insere um novo membro em uma equipe"""
        storage = self._load_json(self.membros_file)

        # Verifica se já é membro
        if any(m['equipe_id'] == membro_data['equipe_id'] and
               m['usuario_id'] == membro_data['usuario_id']
               for m in storage['data']):
            return None

        membro_data['id'] = storage['next_id']
        membro_data['data_entrada'] = datetime.now().isoformat()

        storage['data'].append(membro_data)
        storage['next_id'] += 1

        self._save_json(self.membros_file, storage)
        return membro_data

    def buscar_membros_por_equipe(self, equipe_id: int) -> List[dict]:
        """Busca membros de uma equipe com informações do usuário"""
        membros_storage = self._load_json(self.membros_file)
        usuarios_storage = self._load_json(self.usuarios_file)

        membros = [m for m in membros_storage['data'] if m['equipe_id'] == equipe_id]

        # Enriquece com dados do usuário
        result = []
        for membro in membros:
            usuario = next((u for u in usuarios_storage['data'] if u['id'] == membro['usuario_id']), None)
            if usuario:
                membro_dict = membro.copy()
                membro_dict['usuario'] = {
                    'nome': usuario['nome'],
                    'email': usuario['email'],
                    'profissao': usuario.get('profissao', '')
                }
                result.append(membro_dict)

        return result

    def buscar_equipes_do_usuario(self, usuario_id: int) -> List[dict]:
        """Busca equipes que um usuário participa"""
        membros_storage = self._load_json(self.membros_file)
        equipes_storage = self._load_json(self.equipes_file)

        membros = [m for m in membros_storage['data'] if m['usuario_id'] == usuario_id]

        result = []
        for membro in membros:
            equipe = next((e for e in equipes_storage['data'] if e['id'] == membro['equipe_id']), None)
            if equipe:
                equipe_dict = equipe.copy()
                equipe_dict['papel'] = membro['papel']
                result.append(equipe_dict)

        return result

    def verificar_membro(self, equipe_id: int, usuario_id: int) -> bool:
        """Verifica se usuário é membro de uma equipe"""
        storage = self._load_json(self.membros_file)
        return any(m['equipe_id'] == equipe_id and m['usuario_id'] == usuario_id
                   for m in storage['data'])

    def deletar_membro(self, equipe_id: int, usuario_id: int) -> bool:
        """Remove membro de uma equipe"""
        storage = self._load_json(self.membros_file)
        storage['data'] = [m for m in storage['data']
                          if not (m['equipe_id'] == equipe_id and m['usuario_id'] == usuario_id)]
        self._save_json(self.membros_file, storage)
        return True

    # ========== CONVITES ==========

    def inserir_convite(self, convite_data: dict) -> Optional[dict]:
        """Insere um novo convite"""
        storage = self._load_json(self.convites_file)

        # Verifica se já existe convite pendente
        if any(c['equipe_id'] == convite_data['equipe_id'] and
               c['usuario_id'] == convite_data['usuario_id'] and
               c['status'] == 'pendente'
               for c in storage['data']):
            return None

        convite_data['id'] = storage['next_id']
        convite_data['data_criacao'] = datetime.now().isoformat()
        convite_data['status'] = convite_data.get('status', 'pendente')

        storage['data'].append(convite_data)
        storage['next_id'] += 1

        self._save_json(self.convites_file, storage)
        return convite_data

    def buscar_convite_por_id(self, convite_id: int) -> Optional[dict]:
        """Busca convite por ID"""
        storage = self._load_json(self.convites_file)
        for convite in storage['data']:
            if convite['id'] == convite_id:
                return convite
        return None

    def buscar_convites_por_usuario(self, usuario_id: int) -> List[dict]:
        """Busca convites pendentes de um usuário com detalhes"""
        convites_storage = self._load_json(self.convites_file)
        equipes_storage = self._load_json(self.equipes_file)
        usuarios_storage = self._load_json(self.usuarios_file)

        convites = [c for c in convites_storage['data']
                   if c['usuario_id'] == usuario_id and c['status'] == 'pendente']

        result = []
        for convite in convites:
            equipe = next((e for e in equipes_storage['data'] if e['id'] == convite['equipe_id']), None)
            remetente = next((u for u in usuarios_storage['data'] if u['id'] == convite['remetente_id']), None)

            if equipe and remetente:
                convite_dict = convite.copy()
                convite_dict['equipe'] = {
                    'nome': equipe['nome'],
                    'descricao': equipe.get('descricao', '')
                }
                convite_dict['remetente'] = {
                    'nome': remetente['nome']
                }
                result.append(convite_dict)

        return result

    def buscar_convites_por_equipe(self, equipe_id: int) -> List[dict]:
        """Busca convites de uma equipe"""
        convites_storage = self._load_json(self.convites_file)
        usuarios_storage = self._load_json(self.usuarios_file)

        convites = [c for c in convites_storage['data'] if c['equipe_id'] == equipe_id]

        result = []
        for convite in convites:
            usuario = next((u for u in usuarios_storage['data'] if u['id'] == convite['usuario_id']), None)

            if usuario:
                convite_dict = convite.copy()
                convite_dict['usuario'] = {
                    'nome': usuario['nome'],
                    'email': usuario['email']
                }
                result.append(convite_dict)

        return result

    def atualizar_status_convite(self, convite_id: int, status: str) -> bool:
        """Atualiza o status de um convite"""
        storage = self._load_json(self.convites_file)

        for i, convite in enumerate(storage['data']):
            if convite['id'] == convite_id:
                storage['data'][i]['status'] = status
                self._save_json(self.convites_file, storage)
                return True
        return False

    def deletar_convite(self, convite_id: int) -> bool:
        """Deleta um convite"""
        storage = self._load_json(self.convites_file)
        storage['data'] = [c for c in storage['data'] if c['id'] != convite_id]
        self._save_json(self.convites_file, storage)
        return True

    def verificar_convite_existente(self, equipe_id: int, usuario_id: int) -> bool:
        """Verifica se existe convite pendente"""
        storage = self._load_json(self.convites_file)
        return any(c['equipe_id'] == equipe_id and
                  c['usuario_id'] == usuario_id and
                  c['status'] == 'pendente'
                  for c in storage['data'])
