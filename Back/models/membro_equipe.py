class MembroEquipe:
    """Modelo de Membro de Equipe"""

    def __init__(self, id=None, equipe_id=None, usuario_id=None, papel=None, data_entrada=None):
        self.id = id
        self.equipe_id = equipe_id
        self.usuario_id = usuario_id
        self.papel = papel  # 'criador', 'membro'
        self.data_entrada = data_entrada

    def to_dict(self):
        """Converte o objeto para dicionário"""
        return {
            'id': self.id,
            'equipe_id': self.equipe_id,
            'usuario_id': self.usuario_id,
            'papel': self.papel,
            'data_entrada': str(self.data_entrada) if self.data_entrada else None
        }

    @classmethod
    def from_dict(cls, dados):
        """Cria um MembroEquipe a partir de um dicionário"""
        return cls(
            id=dados.get('id'),
            equipe_id=dados.get('equipe_id'),
            usuario_id=dados.get('usuario_id'),
            papel=dados.get('papel'),
            data_entrada=dados.get('data_entrada')
        )
