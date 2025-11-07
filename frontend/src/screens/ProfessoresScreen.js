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
import DataService from "../services/DataService";
import AwesomeAlert from "react-native-awesome-alerts";

export default function ProfessoresScreen() {
  const [professores, setProfessores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmCallback, setAlertConfirmCallback] = useState(null);
  const { control, handleSubmit, reset } = useForm();

  const showCustomAlert = (title, message, onConfirm = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmCallback(() => onConfirm);
    setShowAlert(true);
  };

  const handleConfirmAlert = () => {
    setShowAlert(false);
    if (alertConfirmCallback) {
      const callback = alertConfirmCallback;
      setAlertConfirmCallback(null);
      setTimeout(() => {
        callback();
      }, 300);
    }
  };

  const loadProfessores = async () => {
    setLoading(true);
    try {
      await DataService.initializeSampleData();
      const data = await DataService.loadData(DataService.KEYS.PROFESSORES);
      setProfessores(data || []);
    } catch {
      showCustomAlert("Erro", "Não foi possível carregar os professores");
      setProfessores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessores();
  }, []);

  const filteredProfessores = professores.filter(
    (professor) =>
      (professor.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (professor.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (professor.codigo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (professor.titulacao || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (professor = null) => {
    if (professor) {
      setEditingProfessor(professor);
      reset({
        nome: professor.nome || "",
        codigo: professor.codigo || "",
        email: professor.email || "",
        telefone: professor.telefone || "",
        especialidade: professor.titulacao || "",
      });
    } else {
      setEditingProfessor(null);
      reset({
        nome: "",
        codigo: "",
        email: "",
        telefone: "",
        especialidade: "",
      });
    }
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    reset();
    setEditingProfessor(null);
  };

  const onSubmit = async (data) => {
    // Validação antes de enviar
    if (!data.nome || data.nome.trim() === "") {
      showCustomAlert("Erro", "Por favor, informe o nome do professor");
      return;
    }
    if (!data.codigo || data.codigo.trim() === "") {
      showCustomAlert("Erro", "Por favor, informe o código do professor");
      return;
    }
    if (!data.email || !data.email.includes("@")) {
      showCustomAlert("Erro", "Por favor, insira um email válido contendo '@'.");
      return;
    }
    if (!data.especialidade || data.especialidade.trim() === "") {
      showCustomAlert("Erro", "Por favor, informe a titulação do professor");
      return;
    }
    
    setLoading(true);
    try {
      // Ajustar campos para o formato do backend
      const professorData = {
        nome: data.nome.trim(),
        codigo: data.codigo.trim().toUpperCase(),
        titulacao: data.especialidade.trim(),
        email: data.email.trim(),
        ...(data.telefone && data.telefone.trim() !== "" ? { telefone: data.telefone.replace(/\D/g, "") } : {}),
      };
      if (editingProfessor) {
        await DataService.updateItem(
          DataService.KEYS.PROFESSORES,
          editingProfessor.id,
          professorData
        );
        showCustomAlert("Sucesso", "Professor atualizado com sucesso!");
      } else {
        // Não criar ID manualmente, o backend gera UUID
        await DataService.addItem(DataService.KEYS.PROFESSORES, professorData);
        showCustomAlert("Sucesso", "Professor criado com sucesso!");
      }
      await loadProfessores();
      closeModal();
    } catch (error) {
      const errorMessage = error.message || "Não foi possível salvar o professor";
      showCustomAlert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteProfessor = (id) => {
    showCustomAlert("Confirmar", "Deseja excluir este professor?", async () => {
      setLoading(true);
      try {
        await DataService.deleteItem(DataService.KEYS.PROFESSORES, id);
        await loadProfessores();
      } catch {
        showCustomAlert("Erro", "Não foi possível excluir o professor");
      } finally {
        setLoading(false);
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
      {loading ? (
        <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredProfessores}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.nome}</Title>
                <Paragraph>Código: {item.codigo}</Paragraph>
                <Paragraph>Email: {item.email}</Paragraph>
                {item.telefone && <Paragraph>Telefone: {item.telefone}</Paragraph>}
                <Paragraph>Titulação: {item.titulacao}</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openModal(item)}>Editar</Button>
                <Button onPress={() => confirmDeleteProfessor(item.id)}>Excluir</Button>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={
            <Paragraph style={{ textAlign: "center", marginTop: 20 }}>
              Nenhum professor encontrado.
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
              <TextInput
                label="Nome"
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
                label="Código"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                autoCapitalize="characters"
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
              />
            )}
          />
          <Controller
            control={control}
            name="telefone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Telefone (opcional)"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
                placeholder="(00) 00000-0000"
              />
            )}
          />
          <Controller
            control={control}
            name="especialidade"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Titulação"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                placeholder="Ex: Doutor, Mestre, Especialista"
              />
            )}
          />
          {loading ? (
            <ActivityIndicator animating={true} style={{ marginVertical: 10 }} />
          ) : (
            <Button mode="contained" onPress={handleSubmit(onSubmit)} style={{ marginTop: 10 }}>
              {editingProfessor ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          )}
        </Modal>
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
  fab: { position: "absolute", right: 16, bottom: 16, zIndex: 10 },
  modal: { backgroundColor: "white", padding: 20, margin: 20, borderRadius: 8 },
  input: { marginBottom: 10, width: "100%" },
});
