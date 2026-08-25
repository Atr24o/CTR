from conexao import db
from models.usuario import Usuario

class UsuarioDao:
    """Data Access Object para Usuário"""

    @staticmethod
    def criar_tabela():
        """Cria a tabela de usuário se não existir"""
        sql = """
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            profissao VARCHAR(100),
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        db.conectar()
        db.executar_query(sql)
        db.desconectar()
        print("Tabela 'usuarios' criada/verificada com sucesso")

        @staticmethod
    def inserir(usuario):
        """Insere um novo usuário no banco"""
        sql = "INSERT INTO usuarios (nome, email, senha, profissao) VALUES (%s, %s, %s, %s)"
        params = (usuario.nome, usuario.email, usuario.senha, usuario.profissao)
        
        db.conectar()
        usuario_id = db.executar_query(sql, params)
        db.desconectar()
        
        if usuario_id:
            usuario.id = usuario_id
            print(f"✅ Usuário {usuario.nome} inserido com ID {usuario_id}")
            return usuario
        return None
    
    # Os outros métodos (buscar_todos, buscar_por_id, etc) permanecem iguais
    @staticmethod
    def buscar_todos():
        sql = "SELECT id, nome, email, profissao, data_criacao FROM usuarios"
        
        db.conectar()
        resultados = db.executar_query(sql)
        db.desconectar()
        
        usuarios = []
        for row in resultados:
            usuarios.append(Usuario.from_dict(row))
        return usuarios
    
    @staticmethod
    def buscar_por_id(id_usuario):
        sql = "SELECT id, nome, email, profissao, data_criacao FROM usuarios WHERE id = %s"
        
        db.conectar()
        resultado = db.executar_query(sql, (id_usuario,))
        db.desconectar()
        
        if resultado:
            return Usuario.from_dict(resultado[0])
        return None
    
    @staticmethod
    def buscar_por_email(email):
        sql = "SELECT id, nome, email, senha, profissao FROM usuarios WHERE email = %s"
        
        db.conectar()
        resultado = db.executar_query(sql, (email,))
        db.desconectar()
        
        if resultado:
            return Usuario.from_dict(resultado[0])
        return None
    
    @staticmethod
    def atualizar(usuario):
        sql = "UPDATE usuarios SET nome = %s, email = %s, profissao = %s WHERE id = %s"
        params = (usuario.nome, usuario.email, usuario.profissao, usuario.id)
        
        db.conectar()
        resultado = db.executar_query(sql, params)
        db.desconectar()
        
        if resultado is not None:
            print(f"✅ Usuário {usuario.id} atualizado com sucesso!")
            return True
        return False
    
    @staticmethod
    def deletar(id_usuario):
        sql = "DELETE FROM usuarios WHERE id = %s"
        
        db.conectar()
        resultado = db.executar_query(sql, (id_usuario,))
        db.desconectar()
        
        if resultado is not None:
            print(f"✅ Usuário {id_usuario} deletado com sucesso!")
            return True
        return False