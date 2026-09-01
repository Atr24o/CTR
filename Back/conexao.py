import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

class Database:
    def __init__(self):
        self.connection = None
        self.cursor = None

    def conectar(self):
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'ctr_db'),
                port=int(os.getenv('DB_PORT', 3306)),
                buffered=True,
                connection_timeout=15,
                ssl_disabled=False,
                ssl_verify_cert=False
            )
            self.cursor = self.connection.cursor(dictionary=True, buffered=True)
            print(f"[OK] Conectado ao MySQL em {os.getenv('DB_HOST', 'localhost')}")
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