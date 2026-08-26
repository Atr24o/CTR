from conexao import db
from dao.usuario_dao import UsuarioDAO
from models.usuario import Usuario
import hashlib

print("=== Teste 1: Conexão ===")
db.conectar()
print(f"Conexão ativa: {db.connection is not None}")

if db.connection:
    print(f"Banco: {db.connection.database}")
    db.desconectar()

print("\n=== Teste 2: Criar tabela ===")
resultado = UsuarioDAO.criar_tabela()
print(f"Resultado: {resultado}")

print("\n=== Teste 3: Inserir usuário ===")
senha_hash = hashlib.sha256('12345678'.encode()).hexdigest()
usuario = Usuario(
    nome="Teste",
    email="teste@teste.com",
    senha=senha_hash,
    profissao="Dev"
)
resultado = UsuarioDAO.inserir(usuario)
print(f"Resultado inserir: {resultado}")

if resultado:
    print(f"ID gerado: {resultado.id}")

print("\n=== Teste 4: Buscar todos ===")
usuarios = UsuarioDAO.buscar_todos()
print(f"Usuários encontrados: {len(usuarios)}")
for u in usuarios:
    print(f"  - {u.nome} ({u.email})")

print("\n=== Teste 5: Buscar por email ===")
usuario_buscado = UsuarioDAO.buscar_por_email('teste@teste.com')
if usuario_buscado:
    print(f"Usuário encontrado: {usuario_buscado.nome}")
else:
    print("Usuário NÃO encontrado")