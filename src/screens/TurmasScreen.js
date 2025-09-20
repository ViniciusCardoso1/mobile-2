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
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import StorageService from "../services/StorageService";
import AwesomeAlert from "react-native-awesome-alerts";

export default function TurmasScreen() {
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingTurma, setEditingTurma] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmCallback, setAlertConfirmCallback] = useState(null);

  const { control, handleSubmit, reset } = useForm();

  // Função para mostrar alertas genéricos
  const showCustomAlert = (title, message, onConfirm = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmCallback(() => onConfirm);
    setShowAlert(true);
  };

  // Função chamada quando o usuário confirma o alerta
  const handleConfirmAlert = async () => {
    setShowAlert(false);
    if (alertConfirmCallback) {
      // Chama a callback armazenada
      await alertConfirmCallback();
      // Limpa a callback para evitar chamadas repetidas
      setAlertConfirmCallback(null);
    }
  };

  const loadTurmas = async () => {
    setLoading(true);
    try {
      await StorageService.initializeSampleData();
      const data = await StorageService.loadData(StorageService.KEYS.TURMAS);
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
      const data = await StorageService.loadData(
        StorageService.KEYS.PROFESSORES
      );
      setProfessores(data || []);
    } catch (error) {
      console.error("Erro ao carregar professores:", error);
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
      (turma.professor || "").toLowerCase().includes(searchQuery.toLowerCase())
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
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const turmaData = {
        ...data,
        capacidade: parseInt(data.capacidade) || 0,
      };

      if (editingTurma) {
        await StorageService.updateItem(
          StorageService.KEYS.TURMAS,
          editingTurma.id,
          turmaData
        );
        showCustomAlert("Sucesso", "Turma atualizada com sucesso!");
      } else {
        await StorageService.addItem(StorageService.KEYS.TURMAS, turmaData);
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

  // Função corrigida para confirmar e deletar turma
  const confirmDeleteTurma = (id) => {
    setAlertTitle("Confirmar");
    setAlertMessage("Deseja excluir esta turma?");
    setAlertConfirmCallback(() => async () => {
      setShowAlert(false); // fecha o alerta de confirmação

      setLoading(true);
      try {
        const deleted = await StorageService.deleteItem(
          StorageService.KEYS.TURMAS,
          id
        );
        await loadTurmas();

        if (deleted) {
          // Aguarda um pouquinho para evitar sobreposição
          setTimeout(() => {
            showCustomAlert("Sucesso", "Turma excluída!");
          }, 300);
        } else {
          showCustomAlert("Erro", "Turma não encontrada!");
        }
      } catch (error) {
        showCustomAlert("Erro", "Não foi possível excluir a turma");
      } finally {
        setLoading(false);
      }
    });
    setShowAlert(true);
  };

  const getProfessorName = (professorId) => {
    const professor = professores.find((p) => p.id === professorId);
    return professor ? professor.nome : professorId;
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
                <Paragraph>
                  Professor: {getProfessorName(item.professor)}
                </Paragraph>
                <Paragraph>Capacidade: {item.capacidade} alunos</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openModal(item)}>Editar</Button>
                <Button onPress={() => confirmDeleteTurma(item.id)}>
                  Excluir
                </Button>
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
        <Modal
          visible={visible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modal}
        >
          <Controller
            control={control}
            name="nome"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Nome da Turma"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />
          <Controller
            control={control}
            name="codigo"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Código da Turma"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />
          <Controller
            control={control}
            name="periodo"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Período (ex: 2024.1)"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />
          <Controller
            control={control}
            name="professor"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Professor"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />
          <Controller
            control={control}
            name="capacidade"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Capacidade de Alunos"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
            )}
          />

          {loading ? (
            <ActivityIndicator
              animating={true}
              style={{ marginVertical: 10 }}
            />
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={{ marginTop: 10 }}
            >
              {editingTurma ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          )}
        </Modal>

        {/* Alert Modal */}
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title={alertTitle}
          message={alertMessage}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showConfirmButton={true}
          confirmText="OK"
          confirmButtonColor="#3089ff"
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
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    zIndex: 10,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: { marginBottom: 10 },
});
