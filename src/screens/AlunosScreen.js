import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
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
import { MaskedTextInput } from "react-native-mask-text";
import DataService from "../services/DataService";
import AwesomeAlert from "react-native-awesome-alerts";

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

  const { control, handleSubmit, reset, setValue, watch } = useForm({
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
      setAlunos(alunosData || []);
      setTurmas(turmasData || []);
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

  const filteredAlunos = alunos.filter(
    (aluno) =>
      (aluno.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (aluno.matricula || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (aluno.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (getTurmaName(aluno.turma) || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (aluno = null) => {
    if (aluno) {
      setEditingAluno(aluno);
      reset({
        nome: aluno.nome || "",
        matricula: aluno.matricula || "",
        email: aluno.email || "",
        telefone: aluno.telefone || "",
        turma: aluno.turma || "",
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
    if (!data.email.includes("@")) {
      showCustomAlert("Erro", "Por favor, insira um email válido contendo '@'.");
      return;
    }

    setLoading(true);
    try {
      const alunoData = { ...data, telefone: data.telefone?.replace(/\D/g, "") || "" };
      if (editingAluno) {
        await DataService.updateItem(DataService.KEYS.ALUNOS, editingAluno.id, alunoData);
        showCustomAlert("Sucesso", "Aluno atualizado com sucesso!");
      } else {
        const newAluno = { ...alunoData, id: Date.now().toString() };
        await DataService.addItem(DataService.KEYS.ALUNOS, newAluno);
        showCustomAlert("Sucesso", "Aluno criado com sucesso!");
      }
      await loadAlunos();
      closeModal();
    } catch {
      showCustomAlert("Erro", "Não foi possível salvar o aluno");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAluno = (id) => {
    showCustomAlert("Confirmar", "Deseja excluir este aluno?", async () => {
      try {
        await DataService.deleteItem(DataService.KEYS.ALUNOS, id);
        await loadAlunos();
      } catch {
        showCustomAlert("Erro", "Não foi possível excluir o aluno");
      }
    });
  };

  const getTurmaName = (turmaId) => {
    const turma = turmas.find((t) => t.id === turmaId);
    return turma ? turma.nome : "Selecione uma turma";
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
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.nome}</Title>
              <Paragraph>Matrícula: {item.matricula}</Paragraph>
              <Paragraph>Email: {item.email}</Paragraph>
              <Paragraph>Telefone: {item.telefone}</Paragraph>
              <Paragraph>Turma: {getTurmaName(item.turma)}</Paragraph>
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
        )}
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
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          <Controller
            control={control}
            name="telefone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Telefone"
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                render={(props) => (
                  <MaskedTextInput {...props} mask="(99) 99999-9999" value={value} onChangeText={onChange} />
                )}
              />
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
});
