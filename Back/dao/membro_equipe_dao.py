from conexao import db
from models.membro_equipe import MembroEquipe

class MembroEquipeDAO:
    """Data Access Object para Membros de Equipe"""

    @staticmethod
    def criar_tabela():
        """Cria a tabela de membros de equipe se não existir"""
        sql = """
        CREATE TABLE IF NOT EXISTS membros_equipe (
            id INT AUTO_INCREMENT PRIMARY KEY,
            equipe_id INT NOT NULL,
            usuario_id INT NOT NULL,
            papel VARCHAR(20) DEFAULT 'membro',
            data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (equipe_id) REFERENCES equipes(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            UNIQUE KEY unique_membro (equipe_id, usuario_id)
        )
        """
        db.conectar()
        db.executar_query(sql)
        db.desconectar()
        print("✅ Tabela 'membros_equipe' criada/verificada com sucesso")

    @staticmethod
    def inserir(membro):
        """Insere um novo membro em uma equipe"""
        sql = "INSERT INTO membros_equipe (equipe_id, usuario_id, papel) VALUES (%s, %s, %s)"
        params = (membro.equipe_id, membro.usuario_id, membro.papel)

        db.conectar()
        membro_id = db.executar_query(sql, params)
        db.desconectar()

        if membro_id:
            membro.id = membro_id
            print(f"✅ Membro inserido na equipe {membro.equipe_id}")
            return membro
        return None

    @staticmethod
    def buscar_por_equipe(equipe_id):
        """Busca todos os membros de uma equipe com informações do usuário"""
        sql = """
        SELECT
            m.id, m.equipe_id, m.usuario_id, m.papel, m.data_entrada,
            u.nome, u.email, u.profissao
        FROM membros_equipe m
        INNER JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.equipe_id = %s
        ORDER BY m.data_entrada ASC
        """

        db.conectar()
        resultados = db.executar_query(sql, (equipe_id,))
        db.desconectar()

        if not resultados:
            return []

        membros = []
        for row in resultados:
            membro = MembroEquipe.from_dict(row)
            # Adiciona informações do usuário
            membro_dict = membro.to_dict()
            membro_dict['usuario'] = {
                'nome': row.get('nome'),
                'email': row.get('email'),
                'profissao': row.get('profissao')
            }
            membros.append(membro_dict)
        return membros

    @staticmethod
    def buscar_equipes_do_usuario(usuario_id):
        """Busca todas as equipes que um usuário participa"""
        sql = """
        SELECT
            e.id, e.nome, e.descricao, e.criador_id, e.data_criacao,
            m.papel
        FROM membros_equipe m
        INNER JOIN equipes e ON m.equipe_id = e.id
        WHERE m.usuario_id = %s
        ORDER BY m.data_entrada DESC
        """

        db.conectar()
        resultados = db.executar_query(sql, (usuario_id,))
        db.desconectar()

        if not resultados:
            return []

        return resultados

    @staticmethod
    def verificar_membro(equipe_id, usuario_id):
        """Verifica se um usuário é membro de uma equipe"""
        sql = "SELECT id FROM membros_equipe WHERE equipe_id = %s AND usuario_id = %s"

        db.conectar()
        resultado = db.executar_query(sql, (equipe_id, usuario_id))
        db.desconectar()

        return resultado is not None and len(resultado) > 0

    @staticmethod
    def deletar(equipe_id, usuario_id):
        """Remove um membro de uma equipe"""
        sql = "DELETE FROM membros_equipe WHERE equipe_id = %s AND usuario_id = %s"

        db.conectar()
        resultado = db.executar_query(sql, (equipe_id, usuario_id))
        db.desconectar()

        if resultado is not None:
            print(f"✅ Membro removido da equipe {equipe_id}")
            return True
        return False
