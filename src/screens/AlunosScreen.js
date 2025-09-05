import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, Dimensions } from "react-native";
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
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MaskService } from "react-native-mask-text";
import StorageService from "../services/StorageService";

// Schema de validação para alunos
const alunoSchema = yup.object().shape({
  nome: yup
    .string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  matricula: yup
    .string()
    .required("Matrícula é obrigatória")
    .min(5, "Matrícula deve ter pelo menos 5 caracteres"),
  email: yup
    .string()
    .required("Email é obrigatório")
    .email("Email deve ser válido"),
  telefone: yup
    .string()
    .required("Telefone é obrigatório")
    .min(10, "Telefone deve ter pelo menos 10 dígitos"),
  dataNascimento: yup.string().required("Data de nascimento é obrigatória"),
});

const AlunosScreen = () => {
  const theme = useTheme();
  const [alunos, setAlunos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAluno, setEditingAluno] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(alunoSchema),
    defaultValues: {
      nome: "",
      matricula: "",
      email: "",
      telefone: "",
      dataNascimento: "",
    },
  });

  // Carregar dados ao inicializar
  useEffect(() => {
    loadAlunos();
  }, []);

  const loadAlunos = async () => {
    try {
      const data = await StorageService.loadData(StorageService.KEYS.ALUNOS);
      setAlunos(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os alunos");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const alunoData = {
        ...data,
        telefone: data.telefone.replace(/\D/g, ""), // Remove formatação do telefone
      };

      if (editingAluno) {
        await StorageService.updateItem(
          StorageService.KEYS.ALUNOS,
          editingAluno.id,
          alunoData
        );
        Alert.alert("Sucesso", "Aluno atualizado com sucesso!");
      } else {
        await StorageService.addItem(StorageService.KEYS.ALUNOS, alunoData);
        Alert.alert("Sucesso", "Aluno criado com sucesso!");
      }

      await loadAlunos();
      closeModal();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o aluno");
    } finally {
      setLoading(false);
    }
  };

  const deleteAluno = async (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este aluno?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.deleteItem(StorageService.KEYS.ALUNOS, id);
              await loadAlunos();
              Alert.alert("Sucesso", "Aluno excluído com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o aluno");
            }
          },
        },
      ]
    );
  };

  const openModal = (aluno = null) => {
    setEditingAluno(aluno);
    if (aluno) {
      reset({
        nome: aluno.nome,
        matricula: aluno.matricula,
        email: aluno.email,
        telefone: formatPhone(aluno.telefone),
        dataNascimento: aluno.dataNascimento,
      });
    } else {
      reset({
        nome: "",
        matricula: "",
        email: "",
        telefone: "",
        dataNascimento: "",
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAluno(null);
    reset();
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    return MaskService.toMask("phone", phone, {
      maskType: "BRL",
      withDDD: true,
      dddMask: "(99) 99999-9999",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Filtrar alunos baseado na busca
  const filteredAlunos = alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aluno.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Barra de busca */}
      <Searchbar
        placeholder="Buscar alunos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Lista de alunos */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlunos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhum aluno encontrado
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery
                  ? "Tente ajustar sua busca"
                  : "Adicione seu primeiro aluno"}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredAlunos.map((aluno) => (
            <Card key={aluno.id} style={styles.alunoCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text variant="titleMedium" style={styles.alunoTitle}>
                      {aluno.nome}
                    </Text>
                    <Chip mode="outlined" style={styles.matriculaChip}>
                      {aluno.matricula}
                    </Chip>
                  </View>
                  <View style={styles.cardActions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => openModal(aluno)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => deleteAluno(aluno.id)}
                    />
                  </View>
                </View>

                <View style={styles.alunoDetails}>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Email:</Text> {aluno.email}
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Telefone:</Text>{" "}
                    {formatPhone(aluno.telefone)}
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    <Text style={styles.detailLabel}>Nascimento:</Text>{" "}
                    {formatDate(aluno.dataNascimento)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal para adicionar/editar aluno */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editingAluno ? "Editar Aluno" : "Novo Aluno"}
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
              name="matricula"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Matrícula"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.matricula}
                  style={styles.input}
                  mode="outlined"
                />
              )}
            />
            {errors.matricula && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.matricula.message}
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
                    const masked = MaskService.toMask("phone", text, {
                      maskType: "BRL",
                      withDDD: true,
                      dddMask: "(99) 99999-9999",
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
              name="dataNascimento"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Data de Nascimento (DD/MM/AAAA)"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const masked = MaskService.toMask("datetime", text, {
                      format: "DD/MM/YYYY",
                    });
                    onChange(masked);
                  }}
                  error={!!errors.dataNascimento}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              )}
            />
            {errors.dataNascimento && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.dataNascimento.message}
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
                {editingAluno ? "Atualizar" : "Salvar"}
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
  alunoCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  alunoTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  matriculaChip: {
    alignSelf: "flex-start",
  },
  cardActions: {
    flexDirection: "row",
  },
  alunoDetails: {
    gap: 4,
  },
  detailText: {
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: "500",
  },
  emptyCard: {
    marginTop: 40,
    elevation: 1,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    opacity: 0.7,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: Dimensions.get("window").height * 0.8,
  },
  modalTitle: {
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
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
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AlunosScreen;
