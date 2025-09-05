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

// Schema de validação para disciplinas
const disciplinaSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Nome deve ter pelo menos 3 caracteres'),
  codigo: yup.string().required('Código é obrigatório').min(3, 'Código deve ter pelo menos 3 caracteres'),
  cargaHoraria: yup.number().required('Carga horária é obrigatória').min(1, 'Carga horária deve ser maior que 0'),
  ementa: yup.string().required('Ementa é obrigatória').min(10, 'Ementa deve ter pelo menos 10 caracteres'),
  preRequisitos: yup.string(),
});

const DisciplinasScreen = () => {
  const theme = useTheme();
  const [disciplinas, setDisciplinas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(disciplinaSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      cargaHoraria: '',
      ementa: '',
      preRequisitos: '',
    },
  });

  // Carregar dados ao inicializar
  useEffect(() => {
    loadDisciplinas();
  }, []);

  const loadDisciplinas = async () => {
    try {
      const data = await StorageService.loadData(StorageService.KEYS.DISCIPLINAS);
      setDisciplinas(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as disciplinas');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const disciplinaData = {
        ...data,
        cargaHoraria: parseInt(data.cargaHoraria),
      };

      if (editingDisciplina) {
        await StorageService.updateItem(StorageService.KEYS.DISCIPLINAS, editingDisciplina.id, disciplinaData);
        Alert.alert('Sucesso', 'Disciplina atualizada com sucesso!');
      } else {
        await StorageService.addItem(StorageService.KEYS.DISCIPLINAS, disciplinaData);
        Alert.alert('Sucesso', 'Disciplina criada com sucesso!');
      }

      await loadDisciplinas();
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a disciplina');
    } finally {
      setLoading(false);
    }
  };

  const deleteDisciplina = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta disciplina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteItem(StorageService.KEYS.DISCIPLINAS, id);
              await loadDisciplinas();
              Alert.alert('Sucesso', 'Disciplina excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a disciplina');
            }
          },
        },
      ]
    );
  };

  const openModal = (disciplina = null) => {
    setEditingDisciplina(disciplina);
    if (disciplina) {
      reset({
        nome: disciplina.nome,
        codigo: disciplina.codigo,
        cargaHoraria: disciplina.cargaHoraria.toString(),
        ementa: disciplina.ementa,
        preRequisitos: disciplina.preRequisitos || '',
      });
    } else {
      reset({
        nome: '',
        codigo: '',
        cargaHoraria: '',
        ementa: '',
        preRequisitos: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingDisciplina(null);
    reset();
  };

  // Filtrar disciplinas baseado na busca
  const filteredDisciplinas = disciplinas.filter(disciplina =>
    disciplina.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disciplina.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disciplina.ementa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Barra de busca */}
      <Searchbar
        placeholder="Buscar disciplinas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Lista de disciplinas */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredDisciplinas.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhuma disciplina encontrada
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery ? 'Tente ajustar sua busca' : 'Adicione sua primeira disciplina'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredDisciplinas.map((disciplina) => (
            <Card key={disciplina.id} style={styles.disciplinaCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text variant="titleMedium" style={styles.disciplinaTitle}>
                      {disciplina.nome}
                    </Text>
                    <View style={styles.chipContainer}>
                      <Chip mode="outlined" style={styles.codigoChip}>
                        {disciplina.codigo}
                      </Chip>
                      <Chip mode="outlined" style={styles.cargaChip}>
                        {disciplina.cargaHoraria}h
                      </Chip>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => openModal(disciplina)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => deleteDisciplina(disciplina.id)}
                    />
                  </View>
                </View>

                <View style={styles.disciplinaDetails}>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Ementa:</Text> {disciplina.ementa}
                  </Text>
                  {disciplina.preRequisitos && (
                    <Text variant="bodyMedium" style={styles.detailText}>
                      <Text style={styles.detailLabel}>Pré-requisitos:</Text> {disciplina.preRequisitos}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal para adicionar/editar disciplina */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editingDisciplina ? 'Editar Disciplina' : 'Nova Disciplina'}
            </Text>

            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nome da Disciplina"
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
                  label="Código da Disciplina"
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
              name="cargaHoraria"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Carga Horária (horas)"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.cargaHoraria}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              )}
            />
            {errors.cargaHoraria && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.cargaHoraria.message}
              </Text>
            )}

            <Controller
              control={control}
              name="ementa"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Ementa"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.ementa}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                />
              )}
            />
            {errors.ementa && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.ementa.message}
              </Text>
            )}

            <Controller
              control={control}
              name="preRequisitos"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Pré-requisitos (opcional)"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
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
                {editingDisciplina ? 'Atualizar' : 'Salvar'}
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
  disciplinaCard: {
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
  disciplinaTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  codigoChip: {
    alignSelf: 'flex-start',
  },
  cargaChip: {
    alignSelf: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
  },
  disciplinaDetails: {
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

export default DisciplinasScreen;

