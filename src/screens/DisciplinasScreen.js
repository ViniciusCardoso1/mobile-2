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

  const loadDisciplinas = async () => {
    setLoading(true);
    try {
      await StorageService.initializeSampleData();
      const data = await StorageService.loadData(
        StorageService.KEYS.DISCIPLINAS
      );
      setDisciplinas(data || []);
    } catch (error) {
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
      (disciplina.nome || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (disciplina.codigo || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (disciplina.ementa || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const openModal = (disciplina = null) => {
    if (disciplina) {
      setEditingDisciplina(disciplina);
      reset({
        nome: disciplina.nome,
        codigo: disciplina.codigo,
        cargaHoraria: disciplina.cargaHoraria?.toString() || "",
        ementa: disciplina.ementa,
        preRequisitos: disciplina.preRequisitos || "",
      });
    } else {
      setEditingDisciplina(null);
      reset({
        nome: "",
        codigo: "",
        cargaHoraria: "",
        ementa: "",
        preRequisitos: "",
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
    setLoading(true);
    try {
      const disciplinaData = {
        ...data,
        cargaHoraria: parseInt(data.cargaHoraria) || 0,
      };

      if (editingDisciplina) {
        await StorageService.updateItem(
          StorageService.KEYS.DISCIPLINAS,
          editingDisciplina.id,
          disciplinaData
        );
        showCustomAlert("Sucesso", "Disciplina atualizada com sucesso!");
      } else {
        await StorageService.addItem(
          StorageService.KEYS.DISCIPLINAS,
          disciplinaData
        );
        showCustomAlert("Sucesso", "Disciplina criada com sucesso!");
      }

      await loadDisciplinas();
      closeModal();
    } catch (error) {
      showCustomAlert("Erro", "Não foi possível salvar a disciplina");
    } finally {
      setLoading(false);
    }
  };

  // Função corrigida para confirmar e deletar disciplina
  const confirmDeleteDisciplina = (id) => {
    setAlertTitle("Confirmar");
    setAlertMessage("Deseja excluir esta disciplina?");
    setAlertConfirmCallback(() => async () => {
      setShowAlert(false); // fecha o alerta de confirmação

      setLoading(true);
      try {
        const deleted = await StorageService.deleteItem(
          StorageService.KEYS.DISCIPLINAS,
          id
        );
        await loadDisciplinas();

        if (deleted) {
          // Aguarda um pouquinho para evitar sobreposição
          setTimeout(() => {
            showCustomAlert("Sucesso", "Disciplina excluída!");
          }, 300);
        } else {
          showCustomAlert("Erro", "Disciplina não encontrada!");
        }
      } catch (error) {
        showCustomAlert("Erro", "Não foi possível excluir a disciplina");
      } finally {
        setLoading(false);
      }
    });
    setShowAlert(true);
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
          data={filteredDisciplinas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.nome}</Title>
                <Paragraph>Código: {item.codigo}</Paragraph>
                <Paragraph>Carga Horária: {item.cargaHoraria}h</Paragraph>
                <Paragraph>Ementa: {item.ementa}</Paragraph>
                {item.preRequisitos && (
                  <Paragraph>Pré-requisitos: {item.preRequisitos}</Paragraph>
                )}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openModal(item)}>Editar</Button>
                <Button onPress={() => confirmDeleteDisciplina(item.id)}>
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
            name="ementa"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Ementa"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
              />
            )}
          />
          <Controller
            control={control}
            name="preRequisitos"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Pré-requisitos (opcional)"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={2}
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
              {editingDisciplina ? "Salvar Alterações" : "Cadastrar"}
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
