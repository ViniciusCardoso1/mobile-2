import { useState, useEffect, useCallback } from "react";
import DataService from "../services/DataService";
import StorageService from "../services/StorageService";

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
    setLoading((prev) => ({ ...prev, [entityKey]: true }));
    try {
      const entityData = await DataService.loadData(
        DataService.KEYS[entityKey.toUpperCase()]
      );
      setData((prev) => ({ ...prev, [entityKey]: entityData }));
      return entityData;
    } catch (error) {
      console.error(`Erro ao carregar ${entityKey}:`, error);
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, [entityKey]: false }));
    }
  }, []);

  // Carregar todos os dados
  const loadAllData = useCallback(async () => {
    const promises = Object.keys(data).map((key) => loadEntityData(key));
    await Promise.all(promises);
  }, [loadEntityData, data]);

  // CRUD
  const addItem = useCallback(async (entityKey, item) => {
    try {
      const newItem = await DataService.addItem(
        DataService.KEYS[entityKey.toUpperCase()],
        item
      );
      setData((prev) => ({
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
      const updated = await DataService.updateItem(
        DataService.KEYS[entityKey.toUpperCase()],
        id,
        updatedItem
      );
      if (updated) {
        setData((prev) => ({
          ...prev,
          [entityKey]: prev[entityKey].map((item) =>
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
      const success = await DataService.deleteItem(
        DataService.KEYS[entityKey.toUpperCase()],
        id
      );
      if (success) {
        setData((prev) => ({
          ...prev,
          [entityKey]: prev[entityKey].filter((item) => item.id !== id),
        }));
      }
      return success;
    } catch (error) {
      console.error(`Erro ao deletar ${entityKey}:`, error);
      throw error;
    }
  }, []);

  // Helpers
  const getItemById = useCallback(
    (entityKey, id) => {
      return data[entityKey].find((item) => item.id === id) || null;
    },
    [data]
  );

  const filterItems = useCallback(
    (entityKey, filterFn) => {
      return data[entityKey].filter(filterFn);
    },
    [data]
  );

  const searchItems = useCallback(
    (entityKey, searchText, searchFields) => {
      if (!searchText) return data[entityKey];

      const lowercaseSearch = searchText.toLowerCase();
      return data[entityKey].filter((item) =>
        searchFields.some(
          (field) =>
            item[field] &&
            item[field].toString().toLowerCase().includes(lowercaseSearch)
        )
      );
    },
    [data]
  );

  // Estatísticas
  const getStats = useCallback(() => {
    const totalNotas = data.notas.length;
    
    // Filtrar notas válidas e converter para número
    const notasValidas = data.notas
      .map((nota) => {
        const valorNota = Number(nota.nota);
        return isNaN(valorNota) ? null : valorNota;
      })
      .filter((nota) => nota !== null);
    
    const totalNotasValidas = notasValidas.length;
    
    const mediaGeral =
      totalNotasValidas > 0
        ? notasValidas.reduce((sum, nota) => sum + nota, 0) / totalNotasValidas
        : 0;

    const aprovacoes = notasValidas.filter((nota) => nota >= 7).length;
    const reprovacoes = notasValidas.filter((nota) => nota < 7).length;

    return {
      totalTurmas: data.turmas.length,
      totalAlunos: data.alunos.length,
      totalProfessores: data.professores.length,
      totalDisciplinas: data.disciplinas.length,
      totalNotas: totalNotasValidas,
      mediaGeral: isNaN(mediaGeral) ? 0 : mediaGeral,
      aprovacoes,
      reprovacoes,
      taxaAprovacao: totalNotasValidas > 0 ? (aprovacoes / totalNotasValidas) * 100 : 0,
    };
  }, [data]);

  // Dados para Gráficos
  const getChartData = useCallback(() => {
    const notas = data.notas;
    const disciplinas = data.disciplinas;
    const stats = getStats();

    // 1. Média por Disciplina (BarChart)
    const notasPorDisciplina = disciplinas.map((disciplina) => {
      // Normalizar: nota.disciplina pode ser ID (string) ou objeto com .id
      const notasDisciplina = notas
        .filter((nota) => {
          // Verificar se a nota pertence à disciplina
          const notaDisciplinaId = nota.disciplinaId || 
                                   (nota.disciplina?.id || nota.disciplina) || 
                                   "";
          return String(notaDisciplinaId) === String(disciplina.id);
        })
        .map((nota) => {
          const valorNota = Number(nota.nota);
          return isNaN(valorNota) ? null : valorNota;
        })
        .filter((nota) => nota !== null);
      
      const media =
        notasDisciplina.length > 0
          ? notasDisciplina.reduce((sum, nota) => sum + nota, 0) /
            notasDisciplina.length
          : 0;
      return {
        name: disciplina.nome.substring(0, 8), // Limita o nome para o gráfico
        media: isNaN(media) ? 0 : parseFloat(media.toFixed(1)),
      };
    });

    // 2. Distribuição de Notas (Chips/Tabela)
    const notasValidas = notas
      .map((n) => {
        const valorNota = Number(n.nota);
        return isNaN(valorNota) ? null : valorNota;
      })
      .filter((n) => n !== null);
    
    const distribuicaoNotas = [
      {
        name: "0-3",
        count: notasValidas.filter((n) => n >= 0 && n < 3).length,
        color: "#ef4444", // Vermelho
      },
      {
        name: "3-5",
        count: notasValidas.filter((n) => n >= 3 && n < 5).length,
        color: "#f59e0b", // Laranja
      },
      {
        name: "5-7",
        count: notasValidas.filter((n) => n >= 5 && n < 7).length,
        color: "#eab308", // Amarelo
      },
      {
        name: "7-8.5",
        count: notasValidas.filter((n) => n >= 7 && n < 8.5).length,
        color: "#22c55e", // Verde Claro
      },
      {
        name: "8.5-10",
        count: notasValidas.filter((n) => n >= 8.5 && n <= 10).length,
        color: "#16a34a", // Verde Escuro
      },
    ];

    // 3. Status dos Alunos (PieChart)
    const statusAlunos = [
      {
        name: "Aprovados",
        population: stats.aprovacoes,
        color: "#16a34a",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      },
      {
        name: "Reprovados",
        population: stats.reprovacoes,
        color: "#ef4444",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      },
    ];

    // 4. Evolução de Notas (LineChart) - Dados Mockados para demonstração
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const evolucaoNotas = meses.map(() => {
      const baseMedia = stats.mediaGeral || 7;
      const variacao = (Math.random() - 0.5) * 2;
      return Math.max(0, Math.min(10, baseMedia + variacao));
    });

    return {
      notasPorDisciplina,
      distribuicaoNotas,
      statusAlunos,
      evolucaoNotas,
    };
  }, [data, getStats]);

  // Nome de entidades relacionadas
  const getRelatedEntityName = useCallback(
    (entityKey, id) => {
      const item = getItemById(entityKey, id);
      if (!item) return "Não encontrado";
      return item.nome || item.titulo || "Sem nome";
    },
    [getItemById]
  );

  // Validação
  const validateRelationships = useCallback(
    (entityKey, item) => {
      const errors = [];
      switch (entityKey) {
        case "turmas":
          if (item.professor && !getItemById("professores", item.professor)) {
            errors.push("Professor não encontrado");
          }
          break;
        case "notas":
          if (item.aluno && !getItemById("alunos", item.aluno)) {
            errors.push("Aluno não encontrado");
          }
          if (item.disciplina && !getItemById("disciplinas", item.disciplina)) {
            errors.push("Disciplina não encontrada");
          }
          break;
      }
      return errors;
    },
    [getItemById]
  );

  // Inicializar dados
  useEffect(() => {
    const initializeData = async () => {
      if (!initialized) {
        await DataService.initializeSampleData();
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
      const promises = Object.keys(StorageService.KEYS).map((key) =>
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
      console.error("Erro ao limpar dados:", error);
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
    getChartData,
    getRelatedEntityName,
    validateRelationships,
    loadEntityData,
    loadAllData,
    refreshData,
    clearAllData,
  };
};

export default useAppData;
