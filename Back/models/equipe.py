class Equipe:
    """Modelo de Equipe"""

    def __init__(self, id=None, nome=None, descricao=None, criador_id=None, data_criacao=None):
        self.id = id
        self.nome = nome
        self.descricao = descricao
        self.criador_id = criador_id
        self.data_criacao = data_criacao

    def to_dict(self):
        """Converte o objeto para dicionário"""
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'criador_id': self.criador_id,
            'data_criacao': str(self.data_criacao) if self.data_criacao else None
        }

    @classmethod
    def from_dict(cls, dados):
        """Cria uma Equipe a partir de um dicionário"""
        return cls(
            id=dados.get('id'),
            nome=dados.get('nome'),
            descricao=dados.get('descricao'),
            criador_id=dados.get('criador_id'),
            data_criacao=dados.get('data_criacao')
        )
