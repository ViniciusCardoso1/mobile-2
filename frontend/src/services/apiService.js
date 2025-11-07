import axios from "axios";

// URL do backend NestJS
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper para extrair mensagem de erro do backend
const getErrorMessage = (error) => {
  if (error.response) {
    // Erro do backend com resposta
    const message = error.response.data?.message || error.response.data?.error || "Erro desconhecido";
    // Se for array de mensagens, pegar a primeira
    if (Array.isArray(message)) {
      return message[0];
    }
    return message;
  }
  if (error.request) {
    return "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
  }
  return error.message || "Erro desconhecido";
};

const apiService = {
  // Funções genéricas para CRUD
  getAll: async (resource, params = {}) => {
    try {
      const response = await api.get(`/${resource}`, { params });
      // Backend retorna { data, total, page, limit, totalPages } para paginação
      // Retornar apenas o array de dados para compatibilidade
      return response.data.data || response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error(`Erro ao buscar todos os ${resource}:`, errorMessage);
      const customError = new Error(errorMessage);
      customError.response = error.response;
      throw customError;
    }
  },

  getById: async (resource, id) => {
    try {
      const response = await api.get(`/${resource}/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error(`Erro ao buscar ${resource} com id ${id}:`, errorMessage);
      const customError = new Error(errorMessage);
      customError.response = error.response;
      throw customError;
    }
  },

  create: async (resource, data) => {
    try {
      // Ajustar dados para o formato do backend
      const formattedData = formatDataForBackend(resource, data);
      const response = await api.post(`/${resource}`, formattedData);
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error(`Erro ao criar ${resource}:`, errorMessage);
      const customError = new Error(errorMessage);
      customError.response = error.response;
      throw customError;
    }
  },

  update: async (resource, id, data) => {
    try {
      // Ajustar dados para o formato do backend
      const formattedData = formatDataForBackend(resource, data);
      const response = await api.patch(`/${resource}/${id}`, formattedData);
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error(`Erro ao atualizar ${resource} com id ${id}:`, errorMessage);
      const customError = new Error(errorMessage);
      customError.response = error.response;
      throw customError;
    }
  },

  delete: async (resource, id) => {
    try {
      await api.delete(`/${resource}/${id}`);
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error(`Erro ao deletar ${resource} com id ${id}:`, errorMessage);
      const customError = new Error(errorMessage);
      customError.response = error.response;
      throw customError;
    }
  },

  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao buscar estatísticas do dashboard:', errorMessage);
      const customError = new Error(errorMessage);
      customError.response = error.response;
      throw customError;
    }
  },
};

// Função para formatar dados conforme esperado pelo backend
const formatDataForBackend = (resource, data) => {
  const formatted = { ...data };
  
  // Remover campos que não devem ser enviados
  delete formatted.id;
  delete formatted.createdAt;
  delete formatted.updatedAt;
  
  // Ajustar campos específicos por recurso
  switch (resource) {
    case "turmas":
      if (formatted.professor) {
        formatted.professor = formatted.professor;
      }
      break;
    case "alunos":
      if (formatted.turma) {
        formatted.turma = formatted.turma;
      }
      break;
    case "notas":
      if (formatted.aluno) {
        formatted.aluno = formatted.aluno;
      }
      if (formatted.disciplina) {
        formatted.disciplina = formatted.disciplina;
      }
      if (formatted.data) {
        formatted.data = formatted.data;
      }
      break;
  }
  
  return formatted;
};

export default apiService;
