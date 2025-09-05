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
import { MaskService } from 'react-native-mask-text';
import StorageService from '../services/StorageService';

// Schema de validação para professores
const professorSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: yup.string().required('Email é obrigatório').email('Email deve ser válido'),
  telefone: yup.string().required('Telefone é obrigatório').min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  especialidade: yup.string().required('Especialidade é obrigatória'),
  departamento: yup.string().required('Departamento é obrigatório'),
});

const ProfessoresScreen = () => {
  const theme = useTheme();
  const [professores, setProfessores] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(professorSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      especialidade: '',
      departamento: '',
    },
  });

  // Carregar dados ao inicializar
  useEffect(() => {
    loadProfessores();
  }, []);

  const loadProfessores = async () => {
    try {
      const data = await StorageService.loadData(StorageService.KEYS.PROFESSORES);
      setProfessores(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os professores');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const professorData = {
        ...data,
        telefone: data.telefone.replace(/\D/g, ''), // Remove formatação do telefone
      };

      if (editingProfessor) {
        await StorageService.updateItem(StorageService.KEYS.PROFESSORES, editingProfessor.id, professorData);
        Alert.alert('Sucesso', 'Professor atualizado com sucesso!');
      } else {
        await StorageService.addItem(StorageService.KEYS.PROFESSORES, professorData);
        Alert.alert('Sucesso', 'Professor criado com sucesso!');
      }

      await loadProfessores();
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o professor');
    } finally {
      setLoading(false);
    }
  };

  const deleteProfessor = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este professor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteItem(StorageService.KEYS.PROFESSORES, id);
              await loadProfessores();
              Alert.alert('Sucesso', 'Professor excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o professor');
            }
          },
        },
      ]
    );
  };

  const openModal = (professor = null) => {
    setEditingProfessor(professor);
    if (professor) {
      reset({
        nome: professor.nome,
        email: professor.email,
        telefone: formatPhone(professor.telefone),
        especialidade: professor.especialidade,
        departamento: professor.departamento,
      });
    } else {
      reset({
        nome: '',
        email: '',
        telefone: '',
        especialidade: '',
        departamento: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProfessor(null);
    reset();
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return MaskService.toMask('phone', phone, {
      maskType: 'BRL',
      withDDD: true,
      dddMask: '(99) 99999-9999'
    });
  };

  // Filtrar professores baseado na busca
  const filteredProfessores = professores.filter(professor =>
    professor.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    professor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    professor.especialidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    professor.departamento.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Barra de busca */}
      <Searchbar
        placeholder="Buscar professores..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Lista de professores */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredProfessores.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhum professor encontrado
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery ? 'Tente ajustar sua busca' : 'Adicione seu primeiro professor'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredProfessores.map((professor) => (
            <Card key={professor.id} style={styles.professorCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text variant="titleMedium" style={styles.professorTitle}>
                      {professor.nome}
                    </Text>
                    <Chip mode="outlined" style={styles.especialidadeChip}>
                      {professor.especialidade}
                    </Chip>
                  </View>
                  <View style={styles.cardActions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => openModal(professor)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => deleteProfessor(professor.id)}
                    />
                  </View>
                </View>

                <View style={styles.professorDetails}>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Email:</Text> {professor.email}
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Telefone:</Text> {formatPhone(professor.telefone)}
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Departamento:</Text> {professor.departamento}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal para adicionar/editar professor */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
            </Text>

            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nome Completo"
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
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.email}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.email.message}
              </Text>
            )}

            <Controller
              control={control}
              name="telefone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Telefone"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const masked = MaskService.toMask('phone', text, {
                      maskType: 'BRL',
                      withDDD: true,
                      dddMask: '(99) 99999-9999'
                    });
                    onChange(masked);
                  }}
                  error={!!errors.telefone}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.telefone && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.telefone.message}
              </Text>
            )}

            <Controller
              control={control}
              name="especialidade"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Especialidade"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.especialidade}
                  style={styles.input}
                  mode="outlined"
                />
              )}
            />
            {errors.especialidade && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.especialidade.message}
              </Text>
            )}

            <Controller
              control={control}
              name="departamento"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Departamento"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.departamento}
                  style={styles.input}
                  mode="outlined"
                />
              )}
            />
            {errors.departamento && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.departamento.message}
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
                {editingProfessor ? 'Atualizar' : 'Salvar'}
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
  professorCard: {
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
  professorTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  especialidadeChip: {
    alignSelf: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
  },
  professorDetails: {
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

export default ProfessoresScreen;

