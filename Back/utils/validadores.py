import re

class Validadores:
    """Classe para validações de dados"""
    
    @staticmethod
    def validar_email(email):
        """Valida se o email é válido"""
        padrao = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(padrao, email) is not None
    
    @staticmethod
    def validar_senha(senha):
        """Valida se a senha tem no mínimo 6 caracteres"""
        return len(senha) >= 6
    
    @staticmethod
    def validar_nome(nome):
        """Valida se o nome tem pelo menos 3 caracteres"""
        return len(nome.strip()) >= 3