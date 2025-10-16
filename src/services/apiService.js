import axios from "axios";

const API_URL = "http://localhost:3000"; // URL padrão do JSON Server

const api = axios.create({
  baseURL: API_URL,
});

const apiService = {
  // Funções genéricas para CRUD
  getAll: async (resource) => {
    try {
      const response = await api.get(`/${resource}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar todos os ${resource}:`, error);
      throw error;
    }
  },

  getById: async (resource, id) => {
    try {
      const response = await api.get(`/${resource}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ${resource} com id ${id}:`, error);
      throw error;
    }
  },

  create: async (resource, data) => {
    try {
      const response = await api.post(`/${resource}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar ${resource}:`, error);
      throw error;
    }
  },

  update: async (resource, id, data) => {
    try {
      const response = await api.put(`/${resource}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar ${resource} com id ${id}:`, error);
      throw error;
    }
  },

  delete: async (resource, id) => {
    try {
      await api.delete(`/${resource}/${id}`);
      return true;
    } catch (error) {
      console.error(`Erro ao deletar ${resource} com id ${id}:`, error);
      throw error;
    }
  },

  // Funções específicas para cada recurso (opcional, mas útil para tipagem/clareza)
  // Exemplo:
  // getAlunos: () => apiService.getAll('alunos'),
  // createAluno: (data) => apiService.create('alunos', data),
  // ...
};

export default apiService;
