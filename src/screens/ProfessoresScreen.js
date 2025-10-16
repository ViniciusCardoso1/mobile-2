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
import { MaskedTextInput } from "react-native-mask-text";
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
      (professor.especialidade || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (professor.departamento || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (professor = null) => {
    if (professor) {
      setEditingProfessor(professor);
      reset({
        nome: professor.nome || "",
        email: professor.email || "",
        telefone: professor.telefone || "",
        especialidade: professor.especialidade || "",
        departamento: professor.departamento || "",
      });
    } else {
      setEditingProfessor(null);
      reset({
        nome: "",
        email: "",
        telefone: "",
        especialidade: "",
        departamento: "",
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
    if (!data.email.includes("@")) {
      showCustomAlert("Erro", "Por favor, insira um email válido contendo '@'.");
      return;
    }
    setLoading(true);
    try {
      const professorData = { ...data, telefone: data.telefone?.replace(/\D/g, "") || "" };
      if (editingProfessor) {
        await DataService.updateItem(
          DataService.KEYS.PROFESSORES,
          editingProfessor.id,
          professorData
        );
        showCustomAlert("Sucesso", "Professor atualizado com sucesso!");
      } else {
        const newProfessor = { ...professorData, id: Date.now().toString() };
        await DataService.addItem(DataService.KEYS.PROFESSORES, newProfessor);
        showCustomAlert("Sucesso", "Professor criado com sucesso!");
      }
      await loadProfessores();
      closeModal();
    } catch {
      showCustomAlert("Erro", "Não foi possível salvar o professor");
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
                <Paragraph>Email: {item.email}</Paragraph>
                <Paragraph>Telefone: {item.telefone}</Paragraph>
                <Paragraph>Especialidade: {item.especialidade}</Paragraph>
                <Paragraph>Departamento: {item.departamento}</Paragraph>
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
                label="Telefone"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                keyboardType="phone-pad"
                mode="outlined"
                render={(props) => (
                  <MaskedTextInput
                    {...props}
                    mask="(99) 99999-9999"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            )}
          />
          <Controller
            control={control}
            name="especialidade"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Especialidade"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />
          <Controller
            control={control}
            name="departamento"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Departamento"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
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
