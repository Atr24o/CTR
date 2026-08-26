import mysql.connector
from mysql.connector import Error

class Database:
    def __init__(self):
        self.connection = None
        self.cursor = None

    def conectar(self):
        try:
            self.connection = mysql.connector.connect(
                host='localhost',
                user='root',
                password='Mhbl@2024',
                database='ctr_db',
                port=3306,
                buffered=True  # Adiciona buffered=True para evitar "Unread result found"
            )
            self.cursor = self.connection.cursor(dictionary=True, buffered=True)
            print("[OK] Conectado ao MySQL")
            return True
        except Error as e:
            print(f"[ERRO] Falha ao conectar: {e}")
            return False

    def desconectar(self):
        if self.cursor:
            try:
                self.cursor.close()
            except:
                pass
        if self.connection:
            try:
                self.connection.close()
            except:
                pass
        print("[OK] Desconectado do MySQL")

    def executar_query(self, sql, params=None):
        try:
            if not self.connection or not self.connection.is_connected():
                print("[AVISO] Reconectando...")
                self.conectar()

            if not self.connection:
                print("[ERRO] Sem conexão")
                return None

            # Limpa resultados pendentes
            if self.cursor:
                try:
                    self.cursor.fetchall()
                except:
                    pass

            self.cursor.execute(sql, params or ())
            self.connection.commit()

            if sql.strip().upper().startswith('INSERT'):
                return self.cursor.lastrowid
            if sql.strip().upper().startswith('SELECT'):
                return self.cursor.fetchall()
            return True

        except Error as e:
            print(f"[ERRO] Query falhou: {e}")
            if self.connection:
                self.connection.rollback()
            return None

# Instancia global
db = Database()