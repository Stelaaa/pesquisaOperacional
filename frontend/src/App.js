import React, { useState } from "react";
import axios from "axios";

function App() {
  const [variables, setVariables] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [variableInput, setVariableInput] = useState({ name: "", coefficient: 0, lowBound: 0 });
  const [constraintInput, setConstraintInput] = useState({
    name: "",
    terms: [],
    type: "less_equal",
    rhs: 0,
  });

  // Adicionar variável
  const addVariable = () => {
    if (!variableInput.name.trim()) {
      alert("O nome da variável não pode estar vazio.");
      return;
    }
    setVariables([...variables, variableInput]); // Atualiza a lista de variáveis
    setVariableInput({ name: "", coefficient: 0, lowBound: 0 }); // Reseta o campo de entrada
  };

  // Adicionar restrição
  const addConstraint = () => {
    if (!constraintInput.name.trim() || !constraintInput.terms.length) {
      alert("A restrição deve ter um nome e pelo menos um termo.");
      return;
    }
    setConstraints([...constraints, constraintInput]); // Atualiza a lista de restrições
    setConstraintInput({ name: "", terms: [], type: "less_equal", rhs: 0 }); // Reseta o campo de entrada
  };

  // Enviar dados para o back-end
  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/optimize", {
        variables,
        constraints,
      });
      setResults(response.data);
    } catch (error) {
      console.error("Erro ao otimizar:", error);
      alert("Erro ao realizar a otimização. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="App">
      <h1>Otimizador de Problemas</h1>

      <div>
        <h2>Variáveis de Decisão</h2>
        <input
          type="text"
          placeholder="Nome"
          value={variableInput.name}
          onChange={(e) => setVariableInput({ ...variableInput, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Coeficiente"
          value={variableInput.coefficient}
          onChange={(e) => setVariableInput({ ...variableInput, coefficient: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Limite Inferior"
          value={variableInput.lowBound}
          onChange={(e) => setVariableInput({ ...variableInput, lowBound: +e.target.value })}
        />
        <button onClick={addVariable}>Adicionar Variável</button>

        <ul>
          {variables.map((variable, index) => (
            <li key={index}>
              {variable.name} (Coeficiente: {variable.coefficient}, Limite Inferior: {variable.lowBound})
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Restrições</h2>
        <input
          type="text"
          placeholder="Nome"
          value={constraintInput.name}
          onChange={(e) => setConstraintInput({ ...constraintInput, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Termos (Ex: x1, x2)"
          onChange={(e) =>
            setConstraintInput({
              ...constraintInput,
              terms: e.target.value.split(",").map((t) => ({ name: t.trim(), coefficient: 1 })),
            })
          }
        />
        <select
          value={constraintInput.type}
          onChange={(e) => setConstraintInput({ ...constraintInput, type: e.target.value })}
        >
          <option value="less_equal">≤</option>
          <option value="greater_equal">≥</option>
          <option value="equal">=</option>
        </select>
        <input
          type="number"
          placeholder="RHS (lado direito)"
          value={constraintInput.rhs}
          onChange={(e) => setConstraintInput({ ...constraintInput, rhs: +e.target.value })}
        />
        <button onClick={addConstraint}>Adicionar Restrição</button>

        <ul>
          {constraints.map((constraint, index) => (
            <li key={index}>
              {constraint.name} ({constraint.type} {constraint.rhs}) Termos:{" "}
              {constraint.terms.map((term) => term.name).join(", ")}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleOptimize} disabled={loading}>
        {loading ? "Otimizando..." : "Otimizar"}
      </button>

      {results && (
        <div>
          <h2>Resultados</h2>
          <p>Valor da Função Objetivo: {results.objective_value}</p>
          <h3>Variáveis</h3>
          <ul>
            {Object.entries(results.solution).map(([name, value]) => (
              <li key={name}>
                {name}: {value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
