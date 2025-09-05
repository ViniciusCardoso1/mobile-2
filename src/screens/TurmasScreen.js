import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  Chip,
  IconButton,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import StorageService from '../services/StorageService';

// Schema de validação para turmas
const turmaSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Nome deve ter pelo menos 3 caracteres'),
  codigo: yup.string().required('Código é obrigatório').min(3, 'Código deve ter pelo menos 3 caracteres'),
  periodo: yup.string().required('Período é obrigatório'),
  professor: yup.string().required('Professor é obrigatório'),
  capacidade: yup.number().required('Capacidade é obrigatória').min(1, 'Capacidade deve ser maior que 0'),
});

const TurmasScreen = () => {
  const theme = useTheme();
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTurma, setEditingTurma] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(turmaSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      periodo: '',
      professor: '',
      capacidade: '',
    },
  });

  // Carregar dados ao inicializar
  useEffect(() => {
    loadTurmas();
    loadProfessores();
  }, []);

  const loadTurmas = async () => {
    try {
      const data = await StorageService.loadData(StorageService.KEYS.TURMAS);
      setTurmas(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as turmas');
    }
  };

  const loadProfessores = async () => {
    try {
      const data = await StorageService.loadData(StorageService.KEYS.PROFESSORES);
      setProfessores(data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const turmaData = {
        ...data,
        capacidade: parseInt(data.capacidade),
      };

      if (editingTurma) {
        await StorageService.updateItem(StorageService.KEYS.TURMAS, editingTurma.id, turmaData);
        Alert.alert('Sucesso', 'Turma atualizada com sucesso!');
      } else {
        await StorageService.addItem(StorageService.KEYS.TURMAS, turmaData);
        Alert.alert('Sucesso', 'Turma criada com sucesso!');
      }

      await loadTurmas();
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a turma');
    } finally {
      setLoading(false);
    }
  };

  const deleteTurma = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta turma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteItem(StorageService.KEYS.TURMAS, id);
              await loadTurmas();
              Alert.alert('Sucesso', 'Turma excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a turma');
            }
          },
        },
      ]
    );
  };

  const openModal = (turma = null) => {
    setEditingTurma(turma);
    if (turma) {
      reset({
        nome: turma.nome,
        codigo: turma.codigo,
        periodo: turma.periodo,
        professor: turma.professor,
        capacidade: turma.capacidade.toString(),
      });
    } else {
      reset({
        nome: '',
        codigo: '',
        periodo: '',
        professor: '',
        capacidade: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTurma(null);
    reset();
  };

  // Filtrar turmas baseado na busca
  const filteredTurmas = turmas.filter(turma =>
    turma.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    turma.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    turma.professor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProfessorName = (professorId) => {
    const professor = professores.find(p => p.id === professorId);
    return professor ? professor.nome : professorId;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Barra de busca */}
      <Searchbar
        placeholder="Buscar turmas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Lista de turmas */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredTurmas.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhuma turma encontrada
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery ? 'Tente ajustar sua busca' : 'Adicione sua primeira turma'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredTurmas.map((turma) => (
            <Card key={turma.id} style={styles.turmaCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text variant="titleMedium" style={styles.turmaTitle}>
                      {turma.nome}
                    </Text>
                    <Chip mode="outlined" style={styles.codigoChip}>
                      {turma.codigo}
                    </Chip>
                  </View>
                  <View style={styles.cardActions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => openModal(turma)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => deleteTurma(turma.id)}
                    />
                  </View>
                </View>

                <View style={styles.turmaDetails}>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Período:</Text> {turma.periodo}
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Professor:</Text> {getProfessorName(turma.professor)}
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Capacidade:</Text> {turma.capacidade} alunos
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal para adicionar/editar turma */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editingTurma ? 'Editar Turma' : 'Nova Turma'}
            </Text>

            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nome da Turma"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.nome}
                  style={styles.input}
                  mode="outlined"
                />
              )}
            />
            {errors.nome && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.nome.message}
              </Text>
            )}

            <Controller
              control={control}
              name="codigo"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Código da Turma"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.codigo}
                  style={styles.input}
                  mode="outlined"
                />
              )}
            />
            {errors.codigo && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.codigo.message}
              </Text>
            )}

            <Controller
              control={control}
              name="periodo"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Período (ex: 2024.1)"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.periodo}
                  style={styles.input}
                  mode="outlined"
                />
              )}
            />
            {errors.periodo && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.periodo.message}
              </Text>
            )}

            <Controller
              control={control}
              name="professor"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Professor"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.professor}
                  style={styles.input}
                  mode="outlined"
                />
              )}
            />
            {errors.professor && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.professor.message}
              </Text>
            )}

            <Controller
              control={control}
              name="capacidade"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Capacidade de Alunos"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.capacidade}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              )}
            />
            {errors.capacidade && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.capacidade.message}
              </Text>
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={closeModal}
                style={styles.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                style={styles.saveButton}
              >
                {editingTurma ? 'Atualizar' : 'Salvar'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Botão flutuante para adicionar */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => openModal()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  turmaCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  turmaTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  codigoChip: {
    alignSelf: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
  },
  turmaDetails: {
    gap: 4,
  },
  detailText: {
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '500',
  },
  emptyCard: {
    marginTop: 40,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    opacity: 0.7,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalTitle: {
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TurmasScreen;

