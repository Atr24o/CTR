from conexao import db
from models.equipe import Equipe

class EquipeDAO:
    """Data Access Object para Equipe"""

    @staticmethod
    def criar_tabela():
        """Cria a tabela de equipes se não existir"""
        sql = """
        CREATE TABLE IF NOT EXISTS equipes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            descricao TEXT,
            criador_id INT NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
        """
        db.conectar()
        db.executar_query(sql)
        db.desconectar()
        print("✅ Tabela 'equipes' criada/verificada com sucesso")

    @staticmethod
    def inserir(equipe):
        """Insere uma nova equipe no banco"""
        sql = "INSERT INTO equipes (nome, descricao, criador_id) VALUES (%s, %s, %s)"
        params = (equipe.nome, equipe.descricao, equipe.criador_id)

        db.conectar()
        equipe_id = db.executar_query(sql, params)
        db.desconectar()

        if equipe_id:
            equipe.id = equipe_id
            print(f"✅ Equipe {equipe.nome} inserida com ID {equipe_id}")
            return equipe
        return None

    @staticmethod
    def buscar_todas():
        """Retorna todas as equipes"""
        sql = "SELECT id, nome, descricao, criador_id, data_criacao FROM equipes"

        db.conectar()
        resultados = db.executar_query(sql)
        db.desconectar()

        if not resultados:
            return []

        equipes = []
        for row in resultados:
            equipes.append(Equipe.from_dict(row))
        return equipes

    @staticmethod
    def buscar_por_id(id_equipe):
        """Busca uma equipe por ID"""
        sql = "SELECT id, nome, descricao, criador_id, data_criacao FROM equipes WHERE id = %s"

        db.conectar()
        resultado = db.executar_query(sql, (id_equipe,))
        db.desconectar()

        if resultado:
            return Equipe.from_dict(resultado[0])
        return None

    @staticmethod
    def buscar_por_criador(criador_id):
        """Busca equipes criadas por um usuário"""
        sql = "SELECT id, nome, descricao, criador_id, data_criacao FROM equipes WHERE criador_id = %s"

        db.conectar()
        resultados = db.executar_query(sql, (criador_id,))
        db.desconectar()

        if not resultados:
            return []

        equipes = []
        for row in resultados:
            equipes.append(Equipe.from_dict(row))
        return equipes

    @staticmethod
    def atualizar(equipe):
        """Atualiza uma equipe"""
        sql = "UPDATE equipes SET nome = %s, descricao = %s WHERE id = %s"
        params = (equipe.nome, equipe.descricao, equipe.id)

        db.conectar()
        resultado = db.executar_query(sql, params)
        db.desconectar()

        if resultado is not None:
            print(f"✅ Equipe {equipe.id} atualizada com sucesso!")
            return True
        return False

    @staticmethod
    def deletar(id_equipe):
        """Deleta uma equipe"""
        sql = "DELETE FROM equipes WHERE id = %s"

        db.conectar()
        resultado = db.executar_query(sql, (id_equipe,))
        db.desconectar()

        if resultado is not None:
            print(f"✅ Equipe {id_equipe} deletada com sucesso!")
            return True
        return False
