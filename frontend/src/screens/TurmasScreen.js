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
import DataService from "../services/DataService";
import AwesomeAlert from "react-native-awesome-alerts";

export default function TurmasScreen() {
  const theme = useTheme();
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingTurma, setEditingTurma] = useState(null);
  const [professorMenuVisible, setProfessorMenuVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmCallback, setAlertConfirmCallback] = useState(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm();

  const showCustomAlert = (title, message, onConfirm = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmCallback(() => onConfirm);
    setShowAlert(true);
  };

  const handleConfirmAlert = async () => {
    const callback = alertConfirmCallback;
    setShowAlert(false);
    setAlertConfirmCallback(null);
    if (callback) {
      setTimeout(async () => {
        await callback();
      }, 300);
    }
  };

  const loadTurmas = async () => {
    setLoading(true);
    try {
      await DataService.initializeSampleData();
      const data = await DataService.loadData(DataService.KEYS.TURMAS);
      setTurmas(data || []);
    } catch (error) {
      showCustomAlert("Erro", "Não foi possível carregar as turmas");
      setTurmas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessores = async () => {
    try {
      const data = await DataService.loadData(DataService.KEYS.PROFESSORES);
      setProfessores(data || []);
    } catch (error) {
      setProfessores([]);
    }
  };

  useEffect(() => {
    loadTurmas();
    loadProfessores();
  }, []);

  const filteredTurmas = turmas.filter(
    (turma) =>
      (turma.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (turma.codigo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (turma.periodo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      getProfessorName(turma.professor)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const openModal = (turma = null) => {
    if (turma) {
      setEditingTurma(turma);
      reset({
        nome: turma.nome,
        codigo: turma.codigo,
        periodo: turma.periodo,
        professor: turma.professor,
        capacidade: turma.capacidade?.toString() || "",
      });
    } else {
      setEditingTurma(null);
      reset({
        nome: "",
        codigo: "",
        periodo: "",
        professor: "",
        capacidade: "",
      });
    }
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    reset();
    setEditingTurma(null);
    setProfessorMenuVisible(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const turmaData = { ...data, capacidade: parseInt(data.capacidade) || 0 };
      if (editingTurma) {
        await DataService.updateItem(DataService.KEYS.TURMAS, editingTurma.id, turmaData);
        showCustomAlert("Sucesso", "Turma atualizada com sucesso!");
      } else {
        await DataService.addItem(DataService.KEYS.TURMAS, turmaData);
        showCustomAlert("Sucesso", "Turma criada com sucesso!");
      }
      await loadTurmas();
      closeModal();
    } catch (error) {
      showCustomAlert("Erro", "Não foi possível salvar a turma");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTurma = (id) => {
    showCustomAlert("Confirmar", "Deseja excluir esta turma?", async () => {
      setLoading(true);
      try {
        await DataService.deleteItem(DataService.KEYS.TURMAS, id);
        await loadTurmas();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    });
  };

  const getProfessorName = (professorId) => {
    const professor = professores.find((p) => p.id === professorId);
    return professor ? professor.nome : "Selecione um professor";
  };

  const selectedProfessorId = watch("professor");

  return (
    <View style={styles.container}>
      <TextInput
        label="Pesquisar"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        mode="outlined"
      />
      {loading ? (
        <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredTurmas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.nome}</Title>
                <Paragraph>Código: {item.codigo}</Paragraph>
                <Paragraph>Período: {item.periodo}</Paragraph>
                <Paragraph>Professor: {getProfessorName(item.professor)}</Paragraph>
                <Paragraph>Capacidade: {item.capacidade} alunos</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openModal(item)}>Editar</Button>
                <Button onPress={() => confirmDeleteTurma(item.id)}>Excluir</Button>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={
            <Paragraph style={{ textAlign: "center", marginTop: 20 }}>
              Nenhuma turma encontrada.
            </Paragraph>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      <FAB style={styles.fab} icon="plus" onPress={() => openModal()} />
      <Portal>
        <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Controller
            control={control}
            name="nome"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Nome da Turma" value={value} onChangeText={onChange} style={styles.input} mode="outlined" />
            )}
          />
          <Controller
            control={control}
            name="codigo"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Código da Turma" value={value} onChangeText={onChange} style={styles.input} mode="outlined" />
            )}
          />
          <Controller
            control={control}
            name="periodo"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Período (ex: 2024.1)" value={value} onChangeText={onChange} style={styles.input} mode="outlined" />
            )}
          />
          <Menu
            visible={professorMenuVisible}
            onDismiss={() => setProfessorMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setProfessorMenuVisible(true)} style={styles.input} contentStyle={{ justifyContent: "space-between" }}>
                {getProfessorName(selectedProfessorId)}
              </Button>
            }
          >
            {professores.length === 0 ? (
              <Menu.Item title="Nenhum professor cadastrado" disabled />
            ) : (
              professores.map((professor) => (
                <Menu.Item
                  key={professor.id}
                  onPress={() => {
                    setValue("professor", professor.id);
                    setProfessorMenuVisible(false);
                  }}
                  title={professor.nome}
                />
              ))
            )}
          </Menu>
          <Controller
            control={control}
            name="capacidade"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Capacidade de Alunos" value={value} onChangeText={onChange} style={styles.input} mode="outlined" keyboardType="numeric" />
            )}
          />
          {loading ? (
            <ActivityIndicator animating={true} style={{ marginVertical: 10 }} />
          ) : (
            <Button mode="contained" onPress={handleSubmit(onSubmit)} style={{ marginTop: 10 }}>
              {editingTurma ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          )}
        </Modal>
      </Portal>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertTitle}
        message={alertMessage}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={theme.colors.primary}
        onConfirmPressed={handleConfirmAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchInput: { marginBottom: 10 },
  card: { marginBottom: 10 },
  fab: { position: "absolute", right: 16, bottom: 16, zIndex: 10 },
  modal: { backgroundColor: "white", padding: 20, margin: 20, borderRadius: 8 },
  input: { marginBottom: 10 },
});
