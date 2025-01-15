import psycopg2
from dotenv import load_dotenv
import os

# Carregar variáveis do .env
load_dotenv()

# Obter variáveis
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

if not (USER and PASSWORD and HOST and PORT and DBNAME):
    print("Erro: Uma ou mais variáveis de ambiente não foram carregadas.")
    exit()

# Tentar conexão com o banco
try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("Conexão bem-sucedida com o banco de dados!")
    
    # Exemplo de consulta
    cursor = connection.cursor()
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    print("Current Time:", result)

    # Fechar conexão
    cursor.close()
    connection.close()
    print("Conexão fechada.")

except Exception as e:
    print(f"Erro ao conectar ao banco de dados: {e}")
