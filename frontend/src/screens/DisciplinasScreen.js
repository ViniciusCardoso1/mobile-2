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

export default function DisciplinasScreen() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState(null);
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
    const callback = alertConfirmCallback;
    setShowAlert(false);
    setAlertConfirmCallback(null);
    if (callback) {
      setTimeout(() => {
        callback();
      }, 250);
    }
  };

  const loadDisciplinas = async () => {
    setLoading(true);
    try {
      await DataService.initializeSampleData();
      const data = await DataService.loadData(DataService.KEYS.DISCIPLINAS);
      setDisciplinas(data || []);
    } catch {
      showCustomAlert("Erro", "Não foi possível carregar as disciplinas");
      setDisciplinas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisciplinas();
  }, []);

  const filteredDisciplinas = disciplinas.filter(
    (disciplina) =>
      (disciplina.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (disciplina.codigo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (disciplina.departamento || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (disciplina = null) => {
    if (disciplina) {
      setEditingDisciplina(disciplina);
      reset({
        nome: disciplina.nome,
        codigo: disciplina.codigo,
        cargaHoraria: disciplina.carga_horaria?.toString() || disciplina.cargaHoraria?.toString() || "",
        departamento: disciplina.departamento || "",
        ementa: disciplina.ementa || "",
      });
    } else {
      setEditingDisciplina(null);
      reset({
        nome: "",
        codigo: "",
        cargaHoraria: "",
        departamento: "",
        ementa: "",
      });
    }
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    reset();
    setEditingDisciplina(null);
  };

  const onSubmit = async (data) => {
    // Validação antes de enviar
    if (!data.nome || data.nome.trim() === "") {
      showCustomAlert("Erro", "Por favor, informe o nome da disciplina");
      return;
    }
    if (!data.codigo || data.codigo.trim() === "") {
      showCustomAlert("Erro", "Por favor, informe o código da disciplina");
      return;
    }
    if (!data.cargaHoraria || isNaN(parseInt(data.cargaHoraria)) || parseInt(data.cargaHoraria) < 20) {
      showCustomAlert("Erro", "Por favor, informe uma carga horária válida (mínimo 20 horas)");
      return;
    }
    if (!data.departamento || data.departamento.trim() === "") {
      showCustomAlert("Erro", "Por favor, informe o departamento");
      return;
    }
    
    setLoading(true);
    try {
      // Ajustar campos para o formato do backend
      const disciplinaData = {
        nome: data.nome.trim(),
        codigo: data.codigo.trim().toUpperCase(),
        carga_horaria: parseInt(data.cargaHoraria),
        departamento: data.departamento.trim(),
        ...(data.ementa && data.ementa.trim() !== "" ? { ementa: data.ementa.trim() } : {}),
      };
      if (editingDisciplina) {
        await DataService.updateItem(DataService.KEYS.DISCIPLINAS, editingDisciplina.id, disciplinaData);
        showCustomAlert("Sucesso", "Disciplina atualizada com sucesso!");
      } else {
        await DataService.addItem(DataService.KEYS.DISCIPLINAS, disciplinaData);
        showCustomAlert("Sucesso", "Disciplina criada com sucesso!");
      }
      await loadDisciplinas();
      closeModal();
    } catch (error) {
      const errorMessage = error.message || "Não foi possível salvar a disciplina";
      showCustomAlert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteDisciplina = (id) => {
    showCustomAlert("Confirmar", "Deseja excluir esta disciplina?", async () => {
      try {
        setLoading(true);
        await DataService.deleteItem(DataService.KEYS.DISCIPLINAS, id);
        await loadDisciplinas();
      } catch {
        showCustomAlert("Erro", "Não foi possível excluir a disciplina");
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
        <ActivityIndicator animating size="large" style={styles.centeredIndicator} />
      ) : (
        <FlatList
          data={filteredDisciplinas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.nome}</Title>
                <Paragraph>Código: {item.codigo}</Paragraph>
                <Paragraph>Carga Horária: {item.carga_horaria || item.cargaHoraria}h</Paragraph>
                <Paragraph>Departamento: {item.departamento}</Paragraph>
                {item.ementa && <Paragraph>Ementa: {item.ementa}</Paragraph>}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openModal(item)}>Editar</Button>
                <Button mode="contained" buttonColor="#3089ff" textColor="#fff" onPress={() => confirmDeleteDisciplina(item.id)}>
                  Excluir
                </Button>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={
            <Paragraph style={{ textAlign: "center", marginTop: 20 }}>
              Nenhuma disciplina encontrada.
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
                label="Nome da Disciplina"
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
                label="Código da Disciplina"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />
          <Controller
            control={control}
            name="cargaHoraria"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Carga Horária (horas)"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
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
          <Controller
            control={control}
            name="ementa"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Ementa (opcional)"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Descreva o conteúdo da disciplina..."
              />
            )}
          />
          <Button mode="contained" onPress={handleSubmit(onSubmit)} style={{ marginTop: 10 }}>
            {editingDisciplina ? "Salvar Alterações" : "Cadastrar"}
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
  input: { marginBottom: 10 },
  centeredIndicator: { marginTop: 20, alignSelf: "center" },
});
