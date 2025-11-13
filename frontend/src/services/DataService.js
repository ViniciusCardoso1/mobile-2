import StorageService from "./StorageService";
import apiService from "./apiService";

// Mapeamento das chaves do StorageService para os recursos da API
const RESOURCE_MAP = {
  [StorageService.KEYS.TURMAS]: "turmas",
  [StorageService.KEYS.ALUNOS]: "alunos",
  [StorageService.KEYS.PROFESSORES]: "professores",
  [StorageService.KEYS.DISCIPLINAS]: "disciplinas",
  [StorageService.KEYS.NOTAS]: "notas",
};

class DataService {
  // O usuário pediu para manter o AsyncStorage, então vamos usá-lo como fallback/cache
  // e a API como fonte primária.

  // A chave é a mesma usada no StorageService (ex: 'alunos')
  static async loadData(key) {
    const resource = RESOURCE_MAP[key];
    if (!resource) {
      console.warn(`Recurso não mapeado para a chave: ${key}`);
      return StorageService.loadData(key);
    }

    try {
      // 1. Tenta carregar da API
      const data = await apiService.getAll(resource);
      // 2. Salva no AsyncStorage para cache/offline (mantendo a lógica do usuário)
      await StorageService.saveData(key, data);
      return data;
    } catch (apiError) {
      console.error(
        `Erro ao carregar dados da API para ${resource}. Tentando AsyncStorage...`,
        apiError
      );
      // 3. Em caso de falha na API, carrega do AsyncStorage
      return StorageService.loadData(key);
    }
  }

  static async addItem(key, item) {
    const resource = RESOURCE_MAP[key];
    if (!resource) {
      console.warn(`Recurso não mapeado para a chave: ${key}`);
      return StorageService.addItem(key, item);
    }

    try {
      // 1. Adiciona na API
      const newItem = await apiService.create(resource, item);
      // 2. Atualiza o AsyncStorage (para manter o cache)
      const currentData = await StorageService.loadData(key);
      currentData.push(newItem);
      await StorageService.saveData(key, currentData);
      return newItem;
    } catch (apiError) {
      console.error(
        `Erro ao adicionar item na API para ${resource}:`,
        apiError
      );
      // Não fazer fallback para AsyncStorage - lançar o erro para que a tela possa tratá-lo
      // Erros de regra de negócio devem ser exibidos ao usuário, não silenciados
      throw apiError;
    }
  }

  static async updateItem(key, id, updatedItem) {
    const resource = RESOURCE_MAP[key];
    if (!resource) {
      console.warn(`Recurso não mapeado para a chave: ${key}`);
      return StorageService.updateItem(key, id, updatedItem);
    }

    try {
      // 1. Atualiza na API
      const updated = await apiService.update(resource, id, updatedItem);
      // 2. Atualiza o AsyncStorage (para manter o cache)
      const currentData = await StorageService.loadData(key);
      const index = currentData.findIndex(
        (item) => String(item.id) === String(id)
      );
      if (index !== -1) {
        currentData[index] = updated;
        await StorageService.saveData(key, currentData);
      }
      return updated;
    } catch (apiError) {
      console.error(
        `Erro ao atualizar item na API para ${resource}:`,
        apiError
      );
      // Não fazer fallback para AsyncStorage - lançar o erro para que a tela possa tratá-lo
      // Erros de regra de negócio devem ser exibidos ao usuário, não silenciados
      throw apiError;
    }
  }

  static async deleteItem(key, id) {
    const resource = RESOURCE_MAP[key];
    if (!resource) {
      console.warn(`Recurso não mapeado para a chave: ${key}`);
      return StorageService.deleteItem(key, id);
    }

    try {
      // 1. Deleta na API
      await apiService.delete(resource, id);
      // 2. Atualiza o AsyncStorage (para manter o cache)
      const currentData = await StorageService.loadData(key);
      const filtered = currentData.filter(
        (item) => String(item.id) !== String(id)
      );
      await StorageService.saveData(key, filtered);
      return true;
    } catch (apiError) {
      console.error(
        `Erro ao deletar item na API para ${resource}. Tentando AsyncStorage...`,
        apiError
      );
      // 3. Em caso de falha na API, deleta no AsyncStorage
      return StorageService.deleteItem(key, id);
    }
  }

  // Outras funções do StorageService que não dependem de CRUD (como generateId e initializeSampleData)
  static generateId = StorageService.generateId;
  static initializeSampleData = StorageService.initializeSampleData;
  static KEYS = StorageService.KEYS;
  static clearData = StorageService.clearData;
}

export default DataService;
