import { useState, useEffect, useCallback } from 'react';
import StorageService from '../services/StorageService';

export const useAppData = () => {
  const [data, setData] = useState({
    turmas: [],
    alunos: [],
    professores: [],
    disciplinas: [],
    notas: [],
  });
  
  const [loading, setLoading] = useState({
    turmas: false,
    alunos: false,
    professores: false,
    disciplinas: false,
    notas: false,
  });
  
  const [initialized, setInitialized] = useState(false);

  // Carregar dados de uma entidade específica
  const loadEntityData = useCallback(async (entityKey) => {
    setLoading(prev => ({ ...prev, [entityKey]: true }));
    try {
      const entityData = await StorageService.loadData(StorageService.KEYS[entityKey.toUpperCase()]);
      setData(prev => ({ ...prev, [entityKey]: entityData }));
      return entityData;
    } catch (error) {
      console.error(`Erro ao carregar ${entityKey}:`, error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, [entityKey]: false }));
    }
  }, []);

  // Carregar todos os dados
  const loadAllData = useCallback(async () => {
    const promises = Object.keys(data).map(key => loadEntityData(key));
    await Promise.all(promises);
  }, [loadEntityData, data]);

  // CRUD
  const addItem = useCallback(async (entityKey, item) => {
    try {
      const newItem = await StorageService.addItem(
        StorageService.KEYS[entityKey.toUpperCase()], 
        item
      );
      setData(prev => ({
        ...prev,
        [entityKey]: [...prev[entityKey], newItem],
      }));
      return newItem;
    } catch (error) {
      console.error(`Erro ao adicionar ${entityKey}:`, error);
      throw error;
    }
  }, []);

  const updateItem = useCallback(async (entityKey, id, updatedItem) => {
    try {
      const updated = await StorageService.updateItem(
        StorageService.KEYS[entityKey.toUpperCase()], 
        id, 
        updatedItem
      );
      if (updated) {
        setData(prev => ({
          ...prev,
          [entityKey]: prev[entityKey].map(item => 
            item.id === id ? updated : item
          ),
        }));
      }
      return updated;
    } catch (error) {
      console.error(`Erro ao atualizar ${entityKey}:`, error);
      throw error;
    }
  }, []);

  const deleteItem = useCallback(async (entityKey, id) => {
    try {
      const success = await StorageService.deleteItem(
        StorageService.KEYS[entityKey.toUpperCase()], 
        id
      );
      if (success) {
        setData(prev => ({
          ...prev,
          [entityKey]: prev[entityKey].filter(item => item.id !== id),
        }));
      }
      return success;
    } catch (error) {
      console.error(`Erro ao deletar ${entityKey}:`, error);
      throw error;
    }
  }, []);

  // Helpers
  const getItemById = useCallback((entityKey, id) => {
    return data[entityKey].find(item => item.id === id) || null;
  }, [data]);

  const filterItems = useCallback((entityKey, filterFn) => {
    return data[entityKey].filter(filterFn);
  }, [data]);

  const searchItems = useCallback((entityKey, searchText, searchFields) => {
    if (!searchText) return data[entityKey];
    
    const lowercaseSearch = searchText.toLowerCase();
    return data[entityKey].filter(item => 
      searchFields.some(field => 
        item[field] && item[field].toString().toLowerCase().includes(lowercaseSearch)
      )
    );
  }, [data]);

  // Estatísticas
  const getStats = useCallback(() => {
    const totalNotas = data.notas.length;
    const mediaGeral = totalNotas > 0 
      ? data.notas.reduce((sum, nota) => sum + nota.nota, 0) / totalNotas 
      : 0;
    
    const aprovacoes = data.notas.filter(nota => nota.nota >= 7).length;
    const reprovacoes = data.notas.filter(nota => nota.nota < 7).length;
    
    return {
      totalTurmas: data.turmas.length,
      totalAlunos: data.alunos.length,
      totalProfessores: data.professores.length,
      totalDisciplinas: data.disciplinas.length,
      totalNotas,
      mediaGeral,
      aprovacoes,
      reprovacoes,
      taxaAprovacao: totalNotas > 0 ? (aprovacoes / totalNotas) * 100 : 0,
    };
  }, [data]);

  // Nome de entidades relacionadas
  const getRelatedEntityName = useCallback((entityKey, id) => {
    const item = getItemById(entityKey, id);
    if (!item) return 'Não encontrado';
    return item.nome || item.titulo || 'Sem nome';
  }, [getItemById]);

  // Validação
  const validateRelationships = useCallback((entityKey, item) => {
    const errors = [];
    switch (entityKey) {
      case 'turmas':
        if (item.professor && !getItemById('professores', item.professor)) {
          errors.push('Professor não encontrado');
        }
        break;
      case 'notas':
        if (item.aluno && !getItemById('alunos', item.aluno)) {
          errors.push('Aluno não encontrado');
        }
        if (item.disciplina && !getItemById('disciplinas', item.disciplina)) {
          errors.push('Disciplina não encontrada');
        }
        break;
    }
    return errors;
  }, [getItemById]);

  // Inicializar dados
  useEffect(() => {
    const initializeData = async () => {
      if (!initialized) {
        await StorageService.initializeSampleData();
        await loadAllData();
        setInitialized(true);
      }
    };
    initializeData();
  }, [initialized, loadAllData]);

  // Controle de dados
  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const clearAllData = useCallback(async () => {
    try {
      const promises = Object.keys(StorageService.KEYS).map(key => 
        StorageService.clearData(StorageService.KEYS[key])
      );
      await Promise.all(promises);
      setData({
        turmas: [],
        alunos: [],
        professores: [],
        disciplinas: [],
        notas: [],
      });
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }, []);

  return {
    data,
    loading,
    initialized,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    filterItems,
    searchItems,
    getStats,
    getRelatedEntityName,
    validateRelationships,
    loadEntityData,
    loadAllData,
    refreshData,
    clearAllData,
  };
};

export default useAppData;
