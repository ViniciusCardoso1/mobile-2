import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
  Menu,
  useTheme,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import DataService from "../services/DataService";
import AwesomeAlert from "react-native-awesome-alerts";

// Função para formatar telefone com máscara
const formatPhoneNumber = (text) => {
  // Remove tudo que não é dígito
  const numbers = text.replace(/\D/g, "");
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara baseado no tamanho
  if (limitedNumbers.length === 0) {
    return "";
  } else if (limitedNumbers.length <= 2) {
    return `(${limitedNumbers}`;
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    // Celular: (00) 00000-0000
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
};

export default function AlunosScreen() {
  const theme = useTheme();
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingAluno, setEditingAluno] = useState(null);
  const [turmaMenuVisible, setTurmaMenuVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmCallback, setAlertConfirmCallback] = useState(null);

  const { control, handleSubmit, reset, setValue, watch, setError, formState: { errors } } = useForm({
    defaultValues: { nome: "", matricula: "", email: "", telefone: "", turma: "" },
  });

  const selectedTurmaId = watch("turma");

  const showCustomAlert = (title, message, onConfirm = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmCallback(() => onConfirm);
    setShowAlert(true);
  };

  const handleConfirmAlert = async () => {
    setShowAlert(false);
    if (alertConfirmCallback) {
      const callback = alertConfirmCallback;
      setAlertConfirmCallback(null);
      await callback();
    }
  };

  const loadAlunos = async () => {
    setLoading(true);
    try {
      const [alunosData, turmasData] = await Promise.all([
        DataService.loadData(DataService.KEYS.ALUNOS),
        DataService.loadData(DataService.KEYS.TURMAS),
      ]);
      setAlunos(Array.isArray(alunosData) ? alunosData : []);
      setTurmas(Array.isArray(turmasData) ? turmasData : []);
    } catch {
      showCustomAlert("Erro", "Não foi possível carregar os alunos ou turmas");
      setAlunos([]);
      setTurmas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlunos();
  }, []);

  const getTurmaName = (turmaId) => {
    if (!turmaId || !Array.isArray(turmas)) return "Nenhuma turma";
    const turma = turmas.find((t) => t && (t.id === turmaId || String(t.id) === String(turmaId)));
    return turma ? turma.nome : "Nenhuma turma";
  };

  const filteredAlunos = Array.isArray(alunos) ? alunos.filter(
    (aluno) => {
      if (!aluno) return false;
      try {
        const turmaId = aluno.turmaId || aluno.turma?.id || aluno.turma;
        const turmaName = getTurmaName(turmaId);
        return (
          (aluno.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (aluno.matricula || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (aluno.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (aluno.telefone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (turmaName || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
      } catch (error) {
        console.error("Erro ao filtrar aluno:", error);
        return false;
      }
    }
  ) : [];

  const openModal = (aluno = null) => {
    if (aluno) {
      setEditingAluno(aluno);
      // Normalizar turma ID
      const turmaId = aluno.turmaId || aluno.turma?.id || aluno.turma || "";
      // Formatar telefone se existir (pode vir sem máscara do backend)
      const telefoneFormatado = aluno.telefone ? formatPhoneNumber(aluno.telefone) : "";
      reset({
        nome: aluno.nome || "",
        matricula: aluno.matricula || "",
        email: aluno.email || "",
        telefone: telefoneFormatado,
        turma: turmaId,
      });
    } else {
      setEditingAluno(null);
      reset({ nome: "", matricula: "", email: "", telefone: "", turma: "" });
    }
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    reset();
    setEditingAluno(null);
    setTurmaMenuVisible(false);
  };

  const onSubmit = async (data) => {
    // Limpar erros anteriores do backend
    const currentErrors = Object.keys(errors);
    currentErrors.forEach(key => {
      if (errors[key]?.type === 'manual') {
        setError(key, { type: 'manual', message: '' });
      }
    });

    setLoading(true);
    try {
      const alunoData = { 
        nome: data.nome.trim(),
        matricula: data.matricula.trim().toUpperCase(),
        email: data.email.trim(),
        telefone: data.telefone.replace(/\D/g, ""),
        // Só incluir turma se foi selecionada
        ...(data.turma && data.turma !== "" ? { turma: data.turma } : {}),
      };
      if (editingAluno) {
        await DataService.updateItem(DataService.KEYS.ALUNOS, editingAluno.id, alunoData);
        showCustomAlert("Sucesso", "Aluno atualizado com sucesso!");
      } else {
        // Não criar ID manualmente, o backend gera UUID
        await DataService.addItem(DataService.KEYS.ALUNOS, alunoData);
        showCustomAlert("Sucesso", "Aluno criado com sucesso!");
      }
      await loadAlunos();
      closeModal();
    } catch (error) {
      // Se houver erros de validação do backend, mapear para os campos
      if (error.validationErrors) {
        Object.keys(error.validationErrors).forEach((field) => {
          if (field !== '_general') {
            const fieldErrors = error.validationErrors[field];
            // Pegar a primeira mensagem de erro do campo
            const errorMessage = fieldErrors[0] || error.message;
            setError(field, { 
              type: 'manual', 
              message: errorMessage 
            });
          }
        });
        // Se houver erros gerais, mostrar no alert
        if (error.validationErrors._general && error.validationErrors._general.length > 0) {
          showCustomAlert("Erro", error.validationErrors._general[0]);
        }
      } else {
        const errorMessage = error.message || "Não foi possível salvar o aluno";
        showCustomAlert("Erro", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAluno = (id) => {
    showCustomAlert("Confirmar", "Deseja excluir este aluno?", async () => {
      try {
        await DataService.deleteItem(DataService.KEYS.ALUNOS, id);
        await loadAlunos();
      } catch (error) {
        const errorMessage = error.message || "Não foi possível excluir o aluno";
        showCustomAlert("Erro", errorMessage);
      }
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Pesquisar"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        mode="outlined"
      />
      <FlatList
        data={filteredAlunos}
        keyExtractor={(item, index) => item?.id ? String(item.id) : `aluno-${index}`}
        renderItem={({ item }) => {
          if (!item) return null;
          try {
            const turmaId = item.turmaId || item.turma?.id || item.turma;
            return (
              <Card style={styles.card}>
                <Card.Content>
                  <Title>{item.nome || "Sem nome"}</Title>
                  <Paragraph>Matrícula: {item.matricula || "N/A"}</Paragraph>
                  <Paragraph>Email: {item.email || "N/A"}</Paragraph>
                  <Paragraph>Telefone: {item.telefone || "N/A"}</Paragraph>
                  <Paragraph>Turma: {getTurmaName(turmaId)}</Paragraph>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => openModal(item)}>Editar</Button>
                  <Button
                    mode="contained"
                    buttonColor="#3089ff"
                    textColor="#fff"
                    onPress={() => confirmDeleteAluno(item.id)}
                  >
                    Excluir
                  </Button>
                </Card.Actions>
              </Card>
            );
          } catch (error) {
            console.error("Erro ao renderizar aluno:", error);
            return null;
          }
        }}
        ListEmptyComponent={
          <Paragraph style={{ textAlign: "center", marginTop: 20 }}>
            Nenhum aluno encontrado.
          </Paragraph>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <FAB style={styles.fab} icon="plus" onPress={() => openModal()} />
      {loading && <ActivityIndicator animating style={{ position: "absolute", top: "50%", left: "50%" }} />}
      <Portal>
        <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Nome" value={value} onChangeText={onChange} style={styles.input} mode="outlined" />
            )}
          />
          <Controller
            control={control}
            name="matricula"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Matrícula" value={value} onChangeText={onChange} style={styles.input} mode="outlined" />
            )}
          />
          <Controller
            control={control}
            name="email"
            rules={{ 
              required: "Email é obrigatório",
              validate: (value) => {
                if (!value || !value.trim()) {
                  return "Email é obrigatório";
                }
                if (!value.includes("@")) {
                  return "Email deve conter o símbolo '@'";
                }
                if (!value.includes(".")) {
                  return "Email deve conter um domínio válido";
                }
                const emailParts = value.split("@");
                if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
                  return "Email inválido";
                }
                return true;
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="telefone"
            rules={{ 
              required: "Telefone é obrigatório",
              validate: (value) => {
                if (!value || !value.trim()) {
                  return "Telefone é obrigatório";
                }
                const numbers = value.replace(/\D/g, "");
                if (numbers.length < 10) {
                  return "Telefone deve conter pelo menos 10 dígitos";
                }
                if (numbers.length > 11) {
                  return "Telefone deve conter no máximo 11 dígitos";
                }
                return true;
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Telefone"
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumber(text);
                    onChange(formatted);
                  }}
                  placeholder="(00) 00000-0000"
                  error={!!errors.telefone}
                />
                {errors.telefone && (
                  <Text style={styles.errorText}>{errors.telefone.message}</Text>
                )}
              </View>
            )}
          />
          <Menu
            visible={turmaMenuVisible}
            onDismiss={() => setTurmaMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setTurmaMenuVisible(true)}
                style={styles.input}
                contentStyle={{ justifyContent: "space-between" }}
              >
                {getTurmaName(selectedTurmaId)}
              </Button>
            }
          >
            {turmas.length === 0 ? (
              <Menu.Item title="Nenhuma turma cadastrada" disabled />
            ) : (
              turmas.map((turma) => (
                <Menu.Item
                  key={turma.id}
                  onPress={() => {
                    setValue("turma", turma.id);
                    setTurmaMenuVisible(false);
                  }}
                  title={turma.nome}
                />
              ))
            )}
          </Menu>
          <Button mode="contained" onPress={handleSubmit(onSubmit)} style={{ marginTop: 10 }}>
            {editingAluno ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </Modal>
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title={alertTitle}
          message={alertMessage}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showConfirmButton
          confirmText="OK"
          confirmButtonColor={theme.colors.primary}
          onConfirmPressed={handleConfirmAlert}
        />
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchInput: { marginBottom: 10 },
  card: { marginBottom: 10 },
  fab: { position: "absolute", right: 16, bottom: 16, zIndex: 10 },
  modal: { backgroundColor: "white", padding: 20, margin: 20, borderRadius: 8 },
  input: { marginBottom: 10, width: "100%" },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
});
