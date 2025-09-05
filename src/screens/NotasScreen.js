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
  Menu,
  Divider,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import StorageService from '../services/StorageService';

// Schema de validação para notas
const notaSchema = yup.object().shape({
  aluno: yup.string().required('Aluno é obrigatório'),
  disciplina: yup.string().required('Disciplina é obrigatória'),
  nota: yup.number().required('Nota é obrigatória').min(0, 'Nota deve ser maior ou igual a 0').max(10, 'Nota deve ser menor ou igual a 10'),
  data: yup.string().required('Data é obrigatória'),
  observacoes: yup.string(),
});

const NotasScreen = () => {
  const theme = useTheme();
  const [notas, setNotas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [alunoMenuVisible, setAlunoMenuVisible] = useState(false);
  const [disciplinaMenuVisible, setDisciplinaMenuVisible] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(notaSchema),
    defaultValues: {
      aluno: '',
      disciplina: '',
      nota: '',
      data: '',
      observacoes: '',
    },
  });

  // Carregar dados ao inicializar
  useEffect(() => {
    loadNotas();
    loadAlunos();
    loadDisciplinas();
  }, []);

  const loadNotas = async () => {
    try {
      const data = await StorageService.loadData(StorageService.KEYS.NOTAS);
      setNotas(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as notas');
    }
  };

  const loadAlunos = async () => {
    try {
      const data = await StorageService.loadData(StorageService.KEYS.ALUNOS);
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const loadDisciplinas = async () => {
    try {
      const data = await StorageService.loadData(StorageService.KEYS.DISCIPLINAS);
      setDisciplinas(data);
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const notaData = {
        ...data,
        nota: parseFloat(data.nota),
      };

      if (editingNota) {
        await StorageService.updateItem(StorageService.KEYS.NOTAS, editingNota.id, notaData);
        Alert.alert('Sucesso', 'Nota atualizada com sucesso!');
      } else {
        await StorageService.addItem(StorageService.KEYS.NOTAS, notaData);
        Alert.alert('Sucesso', 'Nota criada com sucesso!');
      }

      await loadNotas();
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a nota');
    } finally {
      setLoading(false);
    }
  };

  const deleteNota = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteItem(StorageService.KEYS.NOTAS, id);
              await loadNotas();
              Alert.alert('Sucesso', 'Nota excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a nota');
            }
          },
        },
      ]
    );
  };

  const openModal = (nota = null) => {
    setEditingNota(nota);
    if (nota) {
      const aluno = alunos.find(a => a.id === nota.aluno);
      const disciplina = disciplinas.find(d => d.id === nota.disciplina);
      
      setSelectedAluno(aluno);
      setSelectedDisciplina(disciplina);
      
      reset({
        aluno: nota.aluno,
        disciplina: nota.disciplina,
        nota: nota.nota.toString(),
        data: nota.data,
        observacoes: nota.observacoes || '',
      });
    } else {
      setSelectedAluno(null);
      setSelectedDisciplina(null);
      reset({
        aluno: '',
        disciplina: '',
        nota: '',
        data: new Date().toISOString().split('T')[0],
        observacoes: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingNota(null);
    setSelectedAluno(null);
    setSelectedDisciplina(null);
    reset();
  };

  const selectAluno = (aluno) => {
    setSelectedAluno(aluno);
    setValue('aluno', aluno.id);
    setAlunoMenuVisible(false);
  };

  const selectDisciplina = (disciplina) => {
    setSelectedDisciplina(disciplina);
    setValue('disciplina', disciplina.id);
    setDisciplinaMenuVisible(false);
  };

  const getAlunoName = (alunoId) => {
    const aluno = alunos.find(a => a.id === alunoId);
    return aluno ? aluno.nome : 'Aluno não encontrado';
  };

  const getDisciplinaName = (disciplinaId) => {
    const disciplina = disciplinas.find(d => d.id === disciplinaId);
    return disciplina ? disciplina.nome : 'Disciplina não encontrada';
  };

  const getNotaColor = (nota) => {
    if (nota >= 7) return theme.colors.primary;
    if (nota >= 5) return '#f59e0b';
    return theme.colors.error;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Filtrar notas baseado na busca
  const filteredNotas = notas.filter(nota => {
    const alunoName = getAlunoName(nota.aluno).toLowerCase();
    const disciplinaName = getDisciplinaName(nota.disciplina).toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return alunoName.includes(query) || 
           disciplinaName.includes(query) ||
           nota.nota.toString().includes(query);
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Barra de busca */}
      <Searchbar
        placeholder="Buscar notas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Lista de notas */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredNotas.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhuma nota encontrada
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery ? 'Tente ajustar sua busca' : 'Adicione sua primeira nota'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredNotas.map((nota) => (
            <Card key={nota.id} style={styles.notaCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text variant="titleMedium" style={styles.alunoTitle}>
                      {getAlunoName(nota.aluno)}
                    </Text>
                    <Text variant="bodyMedium" style={styles.disciplinaSubtitle}>
                      {getDisciplinaName(nota.disciplina)}
                    </Text>
                    <View style={styles.chipContainer}>
                      <Chip 
                        mode="flat" 
                        style={[styles.notaChip, { backgroundColor: getNotaColor(nota.nota) + '20' }]}
                        textStyle={{ color: getNotaColor(nota.nota), fontWeight: '600' }}
                      >
                        {nota.nota.toFixed(1)}
                      </Chip>
                      <Chip mode="outlined" style={styles.dataChip}>
                        {formatDate(nota.data)}
                      </Chip>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => openModal(nota)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => deleteNota(nota.id)}
                    />
                  </View>
                </View>

                {nota.observacoes && (
                  <View style={styles.notaDetails}>
                    <Text variant="bodyMedium" style={styles.detailText}>
                      <Text style={styles.detailLabel}>Observações:</Text> {nota.observacoes}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal para adicionar/editar nota */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editingNota ? 'Editar Nota' : 'Nova Nota'}
            </Text>

            {/* Seleção de Aluno */}
            <Text variant="bodyMedium" style={styles.fieldLabel}>Aluno</Text>
            <Menu
              visible={alunoMenuVisible}
              onDismiss={() => setAlunoMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setAlunoMenuVisible(true)}
                  style={[styles.selectButton, errors.aluno && { borderColor: theme.colors.error }]}
                  contentStyle={styles.selectButtonContent}
                >
                  {selectedAluno ? selectedAluno.nome : 'Selecionar Aluno'}
                </Button>
              }
            >
              {alunos.map((aluno) => (
                <Menu.Item
                  key={aluno.id}
                  onPress={() => selectAluno(aluno)}
                  title={aluno.nome}
                />
              ))}
            </Menu>
            {errors.aluno && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Aluno é obrigatório
              </Text>
            )}

            {/* Seleção de Disciplina */}
            <Text variant="bodyMedium" style={styles.fieldLabel}>Disciplina</Text>
            <Menu
              visible={disciplinaMenuVisible}
              onDismiss={() => setDisciplinaMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setDisciplinaMenuVisible(true)}
                  style={[styles.selectButton, errors.disciplina && { borderColor: theme.colors.error }]}
                  contentStyle={styles.selectButtonContent}
                >
                  {selectedDisciplina ? selectedDisciplina.nome : 'Selecionar Disciplina'}
                </Button>
              }
            >
              {disciplinas.map((disciplina) => (
                <Menu.Item
                  key={disciplina.id}
                  onPress={() => selectDisciplina(disciplina)}
                  title={disciplina.nome}
                />
              ))}
            </Menu>
            {errors.disciplina && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Disciplina é obrigatória
              </Text>
            )}

            <Controller
              control={control}
              name="nota"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nota (0-10)"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.nota}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              )}
            />
            {errors.nota && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.nota.message}
              </Text>
            )}

            <Controller
              control={control}
              name="data"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Data (AAAA-MM-DD)"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.data}
                  style={styles.input}
                  mode="outlined"
                />
              )}
            />
            {errors.data && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.data.message}
              </Text>
            )}

            <Controller
              control={control}
              name="observacoes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Observações (opcional)"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />
              )}
            />

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
                {editingNota ? 'Atualizar' : 'Salvar'}
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
  notaCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  alunoTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  disciplinaSubtitle: {
    opacity: 0.7,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  notaChip: {
    alignSelf: 'flex-start',
  },
  dataChip: {
    alignSelf: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
  },
  notaDetails: {
    marginTop: 8,
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
  fieldLabel: {
    marginBottom: 8,
    marginLeft: 12,
    fontWeight: '500',
  },
  selectButton: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  selectButtonContent: {
    justifyContent: 'flex-start',
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

export default NotasScreen;

