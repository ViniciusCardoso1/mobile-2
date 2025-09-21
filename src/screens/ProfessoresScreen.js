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
import { MaskService } from "react-native-mask-text";
import StorageService from "../services/StorageService";
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

  // Função para mostrar alertas genéricos
  const showCustomAlert = (title, message, onConfirm = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmCallback(() => onConfirm);
    setShowAlert(true);
  };

  const handleConfirmAlert = async () => {
    setShowAlert(false);
    if (alertConfirmCallback) {
      await alertConfirmCallback();
      setAlertConfirmCallback(null);
    }
  };

  const loadProfessores = async () => {
    setLoading(true);
    try {
      await StorageService.initializeSampleData();
      const data = await StorageService.loadData(StorageService.KEYS.PROFESSORES);
      setProfessores(data || []);
    } catch (error) {
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

  // Função de formatação de telefone com proteção
  const formatPhone = (phone) => {
    if (!phone) return "";
    if (!MaskService || !MaskService.toMask) return phone;
    return MaskService.toMask("phone", phone, {
      maskType: "BRL",
      withDDD: true,
      dddMask: "(99) 99999-9999",
    });
  };

  const openModal = (professor = null) => {
    if (professor) {
      setEditingProfessor(professor);
      reset({
        ...professor,
        telefone: formatPhone(professor.telefone),
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
    setLoading(true);
    try {
      const professorData = {
        ...data,
        telefone: data.telefone?.replace(/\D/g, "") || "",
      };

      if (editingProfessor) {
        await StorageService.updateItem(
          StorageService.KEYS.PROFESSORES,
          editingProfessor.id,
          professorData
        );
        showCustomAlert("Sucesso", "Professor atualizado com sucesso!");
      } else {
        await StorageService.addItem(StorageService.KEYS.PROFESSORES, professorData);
        showCustomAlert("Sucesso", "Professor criado com sucesso!");
      }

      await loadProfessores();
      closeModal();
    } catch (error) {
      showCustomAlert("Erro", "Não foi possível salvar o professor");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteProfessor = (id) => {
    setAlertTitle("Confirmar");
    setAlertMessage("Deseja excluir este professor?");
    setAlertConfirmCallback(() => async () => {
      setShowAlert(false);
      setLoading(true);
      try {
        const deleted = await StorageService.deleteItem(StorageService.KEYS.PROFESSORES, id);
        await loadProfessores();

        if (deleted) {
          setTimeout(() => {
            showCustomAlert("Sucesso", "Professor excluído!");
          }, 300);
        } else {
          showCustomAlert("Erro", "Professor não encontrado!");
        }
      } catch (error) {
        showCustomAlert("Erro", "Não foi possível excluir o professor");
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
          data={filteredProfessores}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.nome}</Title>
                <Paragraph>Email: {item.email}</Paragraph>
                <Paragraph>Telefone: {formatPhone(item.telefone)}</Paragraph>
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
                value={value}
                onChangeText={(text) => {
                  if (MaskService && MaskService.toMask) {
                    const masked = MaskService.toMask("phone", text, {
                      maskType: "BRL",
                      withDDD: true,
                      dddMask: "(99) 99999-9999",
                    });
                    onChange(masked);
                  } else {
                    onChange(text);
                  }
                }}
                style={styles.input}
                keyboardType="phone-pad"
                mode="outlined"
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
  input: { marginBottom: 10 },
});
