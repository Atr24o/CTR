class Usuario:
    """Modelo de Usuário"""

    def __init__(self, id=None, nome=None, email=None, senha=None, profissao=None):
        self.id = id
        self.nome = nome
        self.email = email
        self.senha = senha
        self.profissao = profissao

    def to_dict(self):
        """Converte o objeto para dicionário"""
        return{
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'profissao' : self.profissao
        }

    @classmethod
    def from_dict(cls, dados):
        """Cria um Usuário a partir de um dicionário"""
        return cls(
            id=dados.get('id'),
            nome=dados.get('nome'),
            email=dados.get('email'),
            senha=dados.get('senha'),
            profissao=dados.get('profissao')
        )