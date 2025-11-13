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
  const { control, handleSubmit, reset, setError, formState: { errors } } = useForm();

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
    // Limpar erros anteriores do backend
    const currentErrors = Object.keys(errors);
    currentErrors.forEach(key => {
      if (errors[key]?.type === 'manual') {
        setError(key, { type: 'manual', message: '' });
      }
    });
    
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
      // Se houver erros de validação do backend, mapear para os campos
      if (error.validationErrors) {
        let hasFieldErrors = false;
        Object.keys(error.validationErrors).forEach((field) => {
          if (field !== '_general') {
            hasFieldErrors = true;
            const fieldErrors = error.validationErrors[field];
            // Mapear campos do backend para campos do frontend
            const fieldMapping = {
              'carga_horaria': 'cargaHoraria',
              'cargahoraria': 'cargaHoraria',
            };
            const frontendField = fieldMapping[field] || field;
            const errorMessage = fieldErrors[0] || error.message;
            setError(frontendField, { 
              type: 'manual', 
              message: errorMessage 
            });
          }
        });
        // Se houver erros gerais, mostrar no alert
        if (error.validationErrors._general && error.validationErrors._general.length > 0) {
          showCustomAlert("Erro", error.validationErrors._general[0]);
        } else if (!hasFieldErrors) {
          // Se não houver erros de campo específicos, mostrar mensagem geral
          const errorMessage = error.message || "Não foi possível salvar a disciplina";
          showCustomAlert("Erro", errorMessage);
        } else {
          // Se houver erros de campo, também mostrar mensagem geral para garantir que o usuário veja
          const errorMessage = error.message || "Não foi possível salvar a disciplina. Verifique os campos destacados.";
          showCustomAlert("Erro", errorMessage);
        }
      } else {
        const errorMessage = error.message || "Não foi possível salvar a disciplina";
        showCustomAlert("Erro", errorMessage);
      }
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
            rules={{ 
              required: "Nome é obrigatório",
              minLength: {
                value: 3,
                message: "Nome deve ter entre 3 e 255 caracteres"
              },
              maxLength: {
                value: 255,
                message: "Nome deve ter entre 3 e 255 caracteres"
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Nome da Disciplina"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.nome}
                />
                {errors.nome && (
                  <Text style={styles.errorText}>{errors.nome.message}</Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="codigo"
            rules={{ 
              required: "Código é obrigatório",
              minLength: {
                value: 3,
                message: "Código deve ter entre 3 e 50 caracteres"
              },
              maxLength: {
                value: 50,
                message: "Código deve ter entre 3 e 50 caracteres"
              },
              pattern: {
                value: /^[A-Z0-9]+$/,
                message: "Código deve conter apenas letras maiúsculas e números"
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Código da Disciplina"
                  value={value}
                  onChangeText={(text) => onChange(text.toUpperCase())}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.codigo}
                />
                {errors.codigo && (
                  <Text style={styles.errorText}>{errors.codigo.message}</Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="cargaHoraria"
            rules={{ 
              required: "Carga horária é obrigatória",
              validate: (value) => {
                const num = parseInt(value);
                if (isNaN(num)) {
                  return "Carga horária deve ser um número inteiro";
                }
                if (num < 20) {
                  return "Carga horária mínima é 20 horas";
                }
                if (num > 200) {
                  return "Carga horária máxima é 200 horas";
                }
                return true;
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Carga Horária (horas)"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                  error={!!errors.cargaHoraria}
                />
                {errors.cargaHoraria && (
                  <Text style={styles.errorText}>{errors.cargaHoraria.message}</Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="departamento"
            rules={{ 
              required: "Departamento é obrigatório",
              minLength: {
                value: 3,
                message: "Departamento deve ter entre 3 e 255 caracteres"
              },
              maxLength: {
                value: 255,
                message: "Departamento deve ter entre 3 e 255 caracteres"
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Departamento"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.departamento}
                />
                {errors.departamento && (
                  <Text style={styles.errorText}>{errors.departamento.message}</Text>
                )}
              </View>
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
});
