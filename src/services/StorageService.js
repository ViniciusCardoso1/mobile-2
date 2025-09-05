import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Serviço para gerenciar o armazenamento local dos dados
 * Utiliza AsyncStorage para persistir dados entre sessões
 */
class StorageService {
  // Chaves para diferentes tipos de dados
  static KEYS = {
    TURMAS: 'turmas',
    ALUNOS: 'alunos',
    PROFESSORES: 'professores',
    DISCIPLINAS: 'disciplinas',
    NOTAS: 'notas',
  };

  /**
   * Salva dados no armazenamento local
   * @param {string} key - Chave para identificar os dados
   * @param {Array} data - Array de dados para salvar
   */
  static async saveData(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.error(`Erro ao salvar dados para ${key}:`, error);
      return false;
    }
  }

  /**
   * Carrega dados do armazenamento local
   * @param {string} key - Chave para identificar os dados
   * @returns {Array} Array de dados ou array vazio se não encontrado
   */
  static async loadData(key) {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : [];
    } catch (error) {
      console.error(`Erro ao carregar dados para ${key}:`, error);
      return [];
    }
  }

  /**
   * Adiciona um novo item aos dados existentes
   * @param {string} key - Chave para identificar os dados
   * @param {Object} item - Item para adicionar
   * @returns {Object} Item adicionado com ID gerado
   */
  static async addItem(key, item) {
    try {
      const existingData = await this.loadData(key);
      const newItem = {
        ...item,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedData = [...existingData, newItem];
      await this.saveData(key, updatedData);
      return newItem;
    } catch (error) {
      console.error(`Erro ao adicionar item para ${key}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um item existente
   * @param {string} key - Chave para identificar os dados
   * @param {string} id - ID do item para atualizar
   * @param {Object} updatedItem - Dados atualizados
   * @returns {Object|null} Item atualizado ou null se não encontrado
   */
  static async updateItem(key, id, updatedItem) {
    try {
      const existingData = await this.loadData(key);
      const itemIndex = existingData.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return null;
      }

      const updated = {
        ...existingData[itemIndex],
        ...updatedItem,
        updatedAt: new Date().toISOString(),
      };

      existingData[itemIndex] = updated;
      await this.saveData(key, existingData);
      return updated;
    } catch (error) {
      console.error(`Erro ao atualizar item para ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove um item dos dados
   * @param {string} key - Chave para identificar os dados
   * @param {string} id - ID do item para remover
   * @returns {boolean} True se removido com sucesso
   */
  static async deleteItem(key, id) {
    try {
      const existingData = await this.loadData(key);
      const filteredData = existingData.filter(item => item.id !== id);
      
      if (filteredData.length === existingData.length) {
        return false; // Item não encontrado
      }

      await this.saveData(key, filteredData);
      return true;
    } catch (error) {
      console.error(`Erro ao deletar item para ${key}:`, error);
      throw error;
    }
  }

  /**
   * Busca um item específico por ID
   * @param {string} key - Chave para identificar os dados
   * @param {string} id - ID do item para buscar
   * @returns {Object|null} Item encontrado ou null
   */
  static async getItemById(key, id) {
    try {
      const data = await this.loadData(key);
      return data.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Erro ao buscar item por ID para ${key}:`, error);
      return null;
    }
  }

  /**
   * Limpa todos os dados de uma chave específica
   * @param {string} key - Chave para limpar
   */
  static async clearData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erro ao limpar dados para ${key}:`, error);
      return false;
    }
  }

  /**
   * Gera um ID único baseado em timestamp e número aleatório
   * @returns {string} ID único
   */
  static generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Inicializa dados de exemplo para demonstração
   */
  static async initializeSampleData() {
    try {
      // Verificar se já existem dados
      const turmas = await this.loadData(this.KEYS.TURMAS);
      if (turmas.length > 0) {
        return; // Dados já existem
      }

      // Dados de exemplo para professores
      const professoresExemplo = [
        {
          nome: 'Dr. João Silva',
          email: 'joao.silva@universidade.edu',
          telefone: '(11) 99999-1111',
          especialidade: 'Matemática',
          departamento: 'Ciências Exatas'
        },
        {
          nome: 'Dra. Maria Santos',
          email: 'maria.santos@universidade.edu',
          telefone: '(11) 99999-2222',
          especialidade: 'Física',
          departamento: 'Ciências Exatas'
        }
      ];

      // Dados de exemplo para disciplinas
      const disciplinasExemplo = [
        {
          nome: 'Cálculo I',
          codigo: 'MAT001',
          cargaHoraria: '60',
          ementa: 'Introdução ao cálculo diferencial e integral',
          preRequisitos: 'Matemática Básica'
        },
        {
          nome: 'Física I',
          codigo: 'FIS001',
          cargaHoraria: '80',
          ementa: 'Mecânica clássica e termodinâmica',
          preRequisitos: 'Cálculo I'
        }
      ];

      // Salvar dados de exemplo
      for (const professor of professoresExemplo) {
        await this.addItem(this.KEYS.PROFESSORES, professor);
      }

      for (const disciplina of disciplinasExemplo) {
        await this.addItem(this.KEYS.DISCIPLINAS, disciplina);
      }

      console.log('Dados de exemplo inicializados com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar dados de exemplo:', error);
    }
  }
}

export default StorageService;

