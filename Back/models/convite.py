class Convite:
    """Modelo de Convite para Equipe"""

    def __init__(self, id=None, equipe_id=None, usuario_id=None, remetente_id=None,
                 status=None, data_criacao=None):
        self.id = id
        self.equipe_id = equipe_id
        self.usuario_id = usuario_id
        self.remetente_id = remetente_id
        self.status = status  # 'pendente', 'aceito', 'recusado'
        self.data_criacao = data_criacao

    def to_dict(self):
        """Converte o objeto para dicionário"""
        return {
            'id': self.id,
            'equipe_id': self.equipe_id,
            'usuario_id': self.usuario_id,
            'remetente_id': self.remetente_id,
            'status': self.status,
            'data_criacao': str(self.data_criacao) if self.data_criacao else None
        }

    @classmethod
    def from_dict(cls, dados):
        """Cria um Convite a partir de um dicionário"""
        return cls(
            id=dados.get('id'),
            equipe_id=dados.get('equipe_id'),
            usuario_id=dados.get('usuario_id'),
            remetente_id=dados.get('remetente_id'),
            status=dados.get('status'),
            data_criacao=dados.get('data_criacao')
        )
