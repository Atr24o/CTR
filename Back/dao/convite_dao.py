from conexao import db
from models.convite import Convite

class ConviteDAO:
    """Data Access Object para Convites"""

    @staticmethod
    def criar_tabela():
        """Cria a tabela de convites se não existir"""
        sql = """
        CREATE TABLE IF NOT EXISTS convites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            equipe_id INT NOT NULL,
            usuario_id INT NOT NULL,
            remetente_id INT NOT NULL,
            status VARCHAR(20) DEFAULT 'pendente',
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (equipe_id) REFERENCES equipes(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            UNIQUE KEY unique_convite (equipe_id, usuario_id, status)
        )
        """
        db.conectar()
        db.executar_query(sql)
        db.desconectar()
        print("✅ Tabela 'convites' criada/verificada com sucesso")

    @staticmethod
    def inserir(convite):
        """Insere um novo convite"""
        sql = "INSERT INTO convites (equipe_id, usuario_id, remetente_id, status) VALUES (%s, %s, %s, %s)"
        params = (convite.equipe_id, convite.usuario_id, convite.remetente_id, convite.status or 'pendente')

        db.conectar()
        convite_id = db.executar_query(sql, params)
        db.desconectar()

        if convite_id:
            convite.id = convite_id
            print(f"✅ Convite criado com ID {convite_id}")
            return convite
        return None

    @staticmethod
    def buscar_por_usuario(usuario_id):
        """Busca convites pendentes de um usuário com detalhes"""
        sql = """
        SELECT
            c.id, c.equipe_id, c.usuario_id, c.remetente_id, c.status, c.data_criacao,
            e.nome as equipe_nome, e.descricao as equipe_descricao,
            u.nome as remetente_nome
        FROM convites c
        INNER JOIN equipes e ON c.equipe_id = e.id
        INNER JOIN usuarios u ON c.remetente_id = u.id
        WHERE c.usuario_id = %s AND c.status = 'pendente'
        ORDER BY c.data_criacao DESC
        """

        db.conectar()
        resultados = db.executar_query(sql, (usuario_id,))
        db.desconectar()

        if not resultados:
            return []

        convites = []
        for row in resultados:
            convite = Convite.from_dict(row)
            convite_dict = convite.to_dict()
            convite_dict['equipe'] = {
                'nome': row.get('equipe_nome'),
                'descricao': row.get('equipe_descricao')
            }
            convite_dict['remetente'] = {
                'nome': row.get('remetente_nome')
            }
            convites.append(convite_dict)
        return convites

    @staticmethod
    def buscar_por_equipe(equipe_id):
        """Busca convites de uma equipe"""
        sql = """
        SELECT
            c.id, c.equipe_id, c.usuario_id, c.remetente_id, c.status, c.data_criacao,
            u.nome as usuario_nome, u.email as usuario_email
        FROM convites c
        INNER JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.equipe_id = %s
        ORDER BY c.data_criacao DESC
        """

        db.conectar()
        resultados = db.executar_query(sql, (equipe_id,))
        db.desconectar()

        if not resultados:
            return []

        convites = []
        for row in resultados:
            convite = Convite.from_dict(row)
            convite_dict = convite.to_dict()
            convite_dict['usuario'] = {
                'nome': row.get('usuario_nome'),
                'email': row.get('usuario_email')
            }
            convites.append(convite_dict)
        return convites

    @staticmethod
    def buscar_por_id(convite_id):
        """Busca um convite por ID"""
        sql = "SELECT id, equipe_id, usuario_id, remetente_id, status, data_criacao FROM convites WHERE id = %s"

        db.conectar()
        resultado = db.executar_query(sql, (convite_id,))
        db.desconectar()

        if resultado:
            return Convite.from_dict(resultado[0])
        return None

    @staticmethod
    def atualizar_status(convite_id, status):
        """Atualiza o status de um convite"""
        sql = "UPDATE convites SET status = %s WHERE id = %s"

        db.conectar()
        resultado = db.executar_query(sql, (status, convite_id))
        db.desconectar()

        if resultado is not None:
            print(f"✅ Convite {convite_id} atualizado para {status}")
            return True
        return False

    @staticmethod
    def deletar(convite_id):
        """Deleta um convite"""
        sql = "DELETE FROM convites WHERE id = %s"

        db.conectar()
        resultado = db.executar_query(sql, (convite_id,))
        db.desconectar()

        if resultado is not None:
            print(f"✅ Convite {convite_id} deletado")
            return True
        return False

    @staticmethod
    def verificar_convite_existente(equipe_id, usuario_id):
        """Verifica se já existe convite pendente"""
        sql = "SELECT id FROM convites WHERE equipe_id = %s AND usuario_id = %s AND status = 'pendente'"

        db.conectar()
        resultado = db.executar_query(sql, (equipe_id, usuario_id))
        db.desconectar()

        return resultado is not None and len(resultado) > 0
