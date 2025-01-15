from flask import Flask, request, jsonify
from pulp import LpProblem, LpVariable, LpMaximize, lpSum, value
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
import json
from sqlalchemy import create_engine
import psycopg2

# Carregar variáveis de ambiente
load_dotenv()

# Obter informações do banco de dados a partir do .env
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"

# Testar a conexão manualmente
try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        print("Conexão bem-sucedida com o banco de dados!")
except Exception as e:
    print(f"Erro ao conectar ao banco de dados: {e}")
    raise

# Configurar o Flask e o SQLAlchemy
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo para armazenar problemas de otimização
class OptimizationProblem(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Chave primária
    name = db.Column(db.String(100), nullable=False)  # Nome do problema
    variables = db.Column(db.Text, nullable=False)  # JSON string com as variáveis
    constraints = db.Column(db.Text, nullable=False)  # JSON string com as restrições
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  # Timestamp

# Criar tabelas no banco de dados
with app.app_context():
    db.create_all()

# Rota para Criar um Novo Problema
@app.route('/problems', methods=['POST'])
def create_problem():
    data = request.json  # Receber dados do cliente
    problem = OptimizationProblem(
        name=data['name'],
        variables=json.dumps(data['variables']),
        constraints=json.dumps(data['constraints']),
    )
    db.session.add(problem)
    db.session.commit()
    return jsonify({"message": "Problem created", "id": problem.id}), 201

# Rota para Listar Todos os Problemas
@app.route('/problems', methods=['GET'])
def get_problems():
    problems = OptimizationProblem.query.all()
    return jsonify([
        {
            "id": problem.id,
            "name": problem.name,
            "variables": json.loads(problem.variables),
            "constraints": json.loads(problem.constraints),
            "created_at": problem.created_at,
        } for problem in problems
    ])

# Rota para Atualizar um Problema
@app.route('/problems/<int:id>', methods=['PUT'])
def update_problem(id):
    data = request.json
    problem = OptimizationProblem.query.get_or_404(id)
    problem.name = data['name']
    problem.variables = json.dumps(data['variables'])
    problem.constraints = json.dumps(data['constraints'])
    db.session.commit()
    return jsonify({"message": "Problem updated"})

# Rota para Deletar um Problema
@app.route('/problems/<int:id>', methods=['DELETE'])
def delete_problem(id):
    problem = OptimizationProblem.query.get_or_404(id)
    db.session.delete(problem)
    db.session.commit()
    return jsonify({"message": "Problem deleted"})

# Rota principal
@app.route('/')
def home():
    return "Bem-vindo ao Flask! O servidor está funcionando."

# Rota de otimização
@app.route('/optimize', methods=['POST'])
def optimize():
    data = request.json

    # Configuração básica
    problem = LpProblem(name="Optimization Problem", sense=LpMaximize)

    # Variáveis de decisão
    variables = {}
    for var in data['variables']:
        variables[var['name']] = LpVariable(
            var['name'], lowBound=var.get('lowBound', 0), cat="Continuous"
        )

    # Função objetivo
    problem += lpSum(
        [var['coefficient'] * variables[var['name']] for var in data['variables']]
    ), "Objective Function"

    # Restrições
    for constraint in data['constraints']:
        expr = lpSum(
            [term['coefficient'] * variables[term['name']] for term in constraint['terms']]
        )
        if constraint['type'] == "less_equal":
            problem += expr <= constraint['rhs'], constraint['name']
        elif constraint['type'] == "greater_equal":
            problem += expr >= constraint['rhs'], constraint['name']
        elif constraint['type'] == "equal":
            problem += expr == constraint['rhs'], constraint['name']

    # Resolver problema
    problem.solve()

    # Retornar resultados
    solution = {v.name: v.varValue for v in problem.variables()}
    return jsonify({
        "status": "Success",
        "solution": solution,
        "objective_value": value(problem.objective)
    })

if __name__ == '__main__':
    app.run(debug=True)
