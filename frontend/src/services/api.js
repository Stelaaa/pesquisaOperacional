import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

// Função para obter todos os problemas
export const fetchProblems = async () => {
  try {
    const response = await axios.get(`${API_URL}/problems`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter os problemas:', error);
    throw error; // Repropaga o erro para lidar no front-end
  }
};

// Função para criar um novo problema
export const createProblem = async (problemData) => {
  try {
    const response = await axios.post(`${API_URL}/problems`, problemData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar o problema:', error);
    throw error; // Repropaga o erro para lidar no front-end
  }
};

// Função para atualizar um problema
export const updateProblem = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/problems/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar o problema:', error);
    throw error; // Repropaga o erro para lidar no front-end
  }
};

// Função para deletar um problema
export const deleteProblem = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar o problema:', error);
    throw error; // Repropaga o erro para lidar no front-end
  }
};
