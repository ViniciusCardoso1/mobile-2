import AsyncStorage from "@react-native-async-storage/async-storage";

class StorageService {
  static KEYS = {
    TURMAS: "turmas",
    ALUNOS: "alunos",
    PROFESSORES: "professores",
    DISCIPLINAS: "disciplinas",
    NOTAS: "notas",
  };

  static async saveData(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Erro ao salvar dados para ${key}:`, error);
      return false;
    }
  }

  static async loadData(key) {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : [];
    } catch (error) {
      console.error(`Erro ao carregar dados para ${key}:`, error);
      return [];
    }
  }

  static async addItem(key, item) {
    try {
      const data = await this.loadData(key);
      const newItem = {
        ...item,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.push(newItem);
      await this.saveData(key, data);
      return newItem;
    } catch (error) {
      console.error(`Erro ao adicionar item para ${key}:`, error);
      throw error;
    }
  }

  static async updateItem(key, id, updatedItem) {
    try {
      const data = await this.loadData(key);
      const index = data.findIndex((item) => item.id === id);
      if (index === -1) return null;

      data[index] = {
        ...data[index],
        ...updatedItem,
        updatedAt: new Date().toISOString(),
      };
      await this.saveData(key, data);
      return data[index];
    } catch (error) {
      console.error(`Erro ao atualizar item para ${key}:`, error);
      throw error;
    }
  }

  static async deleteItem(key, id) {
    try {
      const data = await this.loadData(key);
      // força comparar ID como string
      const filtered = data.filter((item) => String(item.id) !== String(id));
      if (filtered.length === data.length) return false;

      await this.saveData(key, filtered);
      return true;
    } catch (error) {
      console.error(`Erro ao deletar item para ${key}:`, error);
      throw error;
    }
  }

  static async clearData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erro ao limpar dados para ${key}:`, error);
      return false;
    }
  }

  static generateId() {
    return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  static async initializeSampleData() {
    const alunos = await this.loadData(this.KEYS.ALUNOS);
    if (alunos.length > 0) return;

    const sampleAlunos = [
      {
        nome: "Ana Clara",
        matricula: "A001",
        email: "ana@email.com",
        telefone: "11999991111",
      },
      {
        nome: "Bruno Silva",
        matricula: "A002",
        email: "bruno@email.com",
        telefone: "11999992222",
      },
    ];

    for (const aluno of sampleAlunos) {
      await this.addItem(this.KEYS.ALUNOS, aluno);
    }
  }
}

export default StorageService;
