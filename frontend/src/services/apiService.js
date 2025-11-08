import axios from "axios";
import AuthService from "./AuthService";

// URL do backend NestJS
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Helper para extrair erros de validação por campo do backend
const getValidationErrors = (error) => {
  const errors = {};
  if (error.response?.data?.message) {
    const messages = error.response.data.message;
    
    // Se for string única, tratar como erro geral ou tentar extrair campo
    if (typeof messages === 'string') {
      // Verificar se a mensagem menciona algum campo conhecido
      const fieldMappings = {
        'carga horária': 'cargaHoraria',
        'carga horaria': 'cargaHoraria',
        'carga_horaria': 'cargaHoraria',
        'nome': 'nome',
        'codigo': 'codigo',
        'departamento': 'departamento',
        'periodo': 'periodo',
        'capacidade': 'capacidade',
      };
      
      for (const [key, value] of Object.entries(fieldMappings)) {
        if (messages.toLowerCase().includes(key.toLowerCase())) {
          if (!errors[value]) {
            errors[value] = [];
          }
          errors[value].push(messages);
          return errors;
        }
      }
      
      // Se não encontrou campo específico, adicionar como erro geral
      errors._general = [messages];
      return errors;
    }
    
    if (Array.isArray(messages)) {
      // NestJS retorna array de mensagens no formato: 
      // ["nome must be longer than or equal to 3 characters", "Código deve ter entre 1 e 50 caracteres", ...]
      messages.forEach((msg) => {
        // Mapear campos conhecidos (português e inglês)
        const fieldMappings = {
          'nome': 'nome',
          'name': 'nome',
          'codigo': 'codigo',
          'code': 'codigo',
          'periodo': 'periodo',
          'period': 'periodo',
          'capacidade': 'capacidade',
          'capacity': 'capacidade',
          'professor': 'professor',
          'teacher': 'professor',
          'carga_horaria': 'cargaHoraria',
          'cargahoraria': 'cargaHoraria',
          'carga horária': 'cargaHoraria',
          'carga horaria': 'cargaHoraria',
          'departamento': 'departamento',
          'department': 'departamento',
        };
        
        // Tentar extrair o nome do campo da mensagem
        let fieldName = null;
        
        // Verificar se a mensagem contém algum campo conhecido (buscar por palavra completa)
        for (const [key, value] of Object.entries(fieldMappings)) {
          // Buscar por palavra completa para evitar falsos positivos
          const regex = new RegExp(`\\b${key}\\b`, 'i');
          if (regex.test(msg)) {
            fieldName = value;
            break;
          }
        }
        
        // Se não encontrou, tentar extrair da primeira palavra
        if (!fieldName) {
          const fieldMatch = msg.match(/(\w+)\s/);
          if (fieldMatch) {
            const extractedField = fieldMatch[1].toLowerCase();
            fieldName = fieldMappings[extractedField] || extractedField;
          }
        }
        
        if (fieldName) {
          if (!errors[fieldName]) {
            errors[fieldName] = [];
          }
          errors[fieldName].push(msg);
        } else {
          // Se não conseguir extrair o campo, adicionar como erro geral
          if (!errors._general) {
            errors._general = [];
          }
          errors._general.push(msg);
        }
      });
    }
  }
  return errors;
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
      const formattedData = formatDataForBackend(resource, data, false);
      console.log(`[API] Criando ${resource}:`, formattedData);
      const response = await api.post(`/${resource}`, formattedData);
      console.log(`[API] Resposta de criação ${resource}:`, response.data);
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const validationErrors = getValidationErrors(error);
      console.error(`[API] Erro ao criar ${resource}:`, errorMessage);
      console.error(`[API] Dados enviados:`, data);
      console.error(`[API] Erro completo:`, error.response?.data || error);
      const customError = new Error(errorMessage);
      customError.response = error.response;
      customError.validationErrors = validationErrors;
      throw customError;
    }
  },

  update: async (resource, id, data) => {
    try {
      // Ajustar dados para o formato do backend
      const formattedData = formatDataForBackend(resource, data, true);
      const response = await api.patch(`/${resource}/${id}`, formattedData);
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const validationErrors = getValidationErrors(error);
      console.error(`Erro ao atualizar ${resource} com id ${id}:`, errorMessage);
      const customError = new Error(errorMessage);
      customError.response = error.response;
      customError.validationErrors = validationErrors;
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
const formatDataForBackend = (resource, data, isUpdate = false) => {
  const formatted = { ...data };
  
  // Remover campos que não devem ser enviados
  if (!isUpdate) {
    delete formatted.id;
  }
  delete formatted.createdAt;
  delete formatted.updatedAt;
  
  // Remover campos de relacionamento que são objetos (manter apenas IDs)
  if (formatted.aluno) {
    if (typeof formatted.aluno === 'object') {
      formatted.aluno = formatted.aluno.id || formatted.aluno;
    }
    // Remover se for string vazia (campo opcional)
    if (formatted.aluno === "" || formatted.aluno === null || formatted.aluno === undefined) {
      delete formatted.aluno;
    }
  }
  
  if (formatted.disciplina) {
    if (typeof formatted.disciplina === 'object') {
      formatted.disciplina = formatted.disciplina.id || formatted.disciplina;
    }
    // Remover se for string vazia (campo opcional)
    if (formatted.disciplina === "" || formatted.disciplina === null || formatted.disciplina === undefined) {
      delete formatted.disciplina;
    }
  }
  
  if (formatted.professor) {
    if (typeof formatted.professor === 'object') {
      formatted.professor = formatted.professor.id || formatted.professor;
    }
    // Remover se for string vazia (campo opcional)
    if (formatted.professor === "" || formatted.professor === null || formatted.professor === undefined) {
      delete formatted.professor;
    }
  }
  
  if (formatted.turma) {
    if (typeof formatted.turma === 'object') {
      formatted.turma = formatted.turma.id || formatted.turma;
    }
    // Remover se for string vazia (campo opcional)
    if (formatted.turma === "" || formatted.turma === null || formatted.turma === undefined) {
      delete formatted.turma;
    }
  }
  
  // Remover campos vazios ou undefined
  Object.keys(formatted).forEach(key => {
    if (formatted[key] === "" || formatted[key] === null || formatted[key] === undefined) {
      // Manter campos numéricos que podem ser 0
      if (typeof formatted[key] === 'number' && formatted[key] === 0) {
        return;
      }
      // Manter campos booleanos
      if (typeof formatted[key] === 'boolean') {
        return;
      }
      delete formatted[key];
    }
  });
  
  return formatted;
};

export default apiService;
