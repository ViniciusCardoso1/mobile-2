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

  const { control, handleSubmit, reset, setValue, watch, setError, formState: { errors } } = useForm();

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
      setTurmas(Array.isArray(data) ? data : []);
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
      setProfessores(Array.isArray(data) ? data : []);
    } catch (error) {
      setProfessores([]);
    }
  };

  useEffect(() => {
    loadTurmas();
    loadProfessores();
  }, []);

  const getProfessorName = (professorId) => {
    if (!professorId || !Array.isArray(professores)) return "Nenhum professor";
    const professor = professores.find((p) => p && (p.id === professorId || String(p.id) === String(professorId)));
    return professor ? professor.nome : "Nenhum professor";
  };

  const filteredTurmas = Array.isArray(turmas) ? turmas.filter(
    (turma) => {
      if (!turma) return false;
      try {
        const professorId = turma.professorId || turma.professor?.id || turma.professor;
        const professorName = getProfessorName(professorId);
        return (
          (turma.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (turma.codigo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (turma.periodo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (professorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (turma.capacidade?.toString() || "").includes(searchQuery)
        );
      } catch (error) {
        console.error("Erro ao filtrar turma:", error);
        return false;
      }
    }
  ) : [];

  const openModal = (turma = null) => {
    if (turma) {
      setEditingTurma(turma);
      // Normalizar professor ID
      const professorId = turma.professorId || turma.professor?.id || turma.professor || "";
      reset({
        nome: turma.nome,
        codigo: turma.codigo,
        periodo: turma.periodo,
        professor: professorId,
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
    // Limpar erros anteriores do backend
    const currentErrors = Object.keys(errors);
    currentErrors.forEach(key => {
      if (errors[key]?.type === 'manual') {
        setError(key, { type: 'manual', message: '' });
      }
    });
    
    setLoading(true);
    try {
      // Converter período de "2025.2" para "2025/2" se necessário
      let periodo = data.periodo.trim();
      if (periodo.includes('.')) {
        periodo = periodo.replace('.', '/');
      }
      
      const turmaData = { 
        nome: data.nome.trim(),
        codigo: data.codigo.trim().toUpperCase(),
        periodo: periodo,
        capacidade: parseInt(data.capacidade),
        // Só incluir professor se foi selecionado
        ...(data.professor && data.professor !== "" ? { professor: data.professor } : {}),
      };
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
      // Se houver erros de validação do backend, mapear para os campos
      let hasFieldErrors = false;
      if (error.validationErrors) {
        Object.keys(error.validationErrors).forEach((field) => {
          if (field !== '_general') {
            hasFieldErrors = true;
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
        } else if (!hasFieldErrors) {
          // Se não houver erros de campo específicos, mostrar mensagem geral
          const errorMessage = error.message || "Não foi possível salvar a turma";
          showCustomAlert("Erro", errorMessage);
        } else {
          // Se houver erros de campo, também mostrar mensagem geral para garantir que o usuário veja
          const errorMessage = error.message || "Não foi possível salvar a turma. Verifique os campos destacados.";
          showCustomAlert("Erro", errorMessage);
        }
      } else {
        const errorMessage = error.message || "Não foi possível salvar a turma";
        showCustomAlert("Erro", errorMessage);
      }
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
          keyExtractor={(item, index) => item?.id ? String(item.id) : `turma-${index}`}
          renderItem={({ item }) => {
            if (!item) return null;
            try {
              const professorId = item.professorId || item.professor?.id || item.professor;
              return (
                <Card style={styles.card}>
                  <Card.Content>
                    <Title>{item.nome || "Sem nome"}</Title>
                    <Paragraph>Código: {item.codigo || "N/A"}</Paragraph>
                    <Paragraph>Período: {item.periodo || "N/A"}</Paragraph>
                    <Paragraph>Professor: {getProfessorName(professorId)}</Paragraph>
                    <Paragraph>Capacidade: {item.capacidade || 0} alunos</Paragraph>
                  </Card.Content>
                  <Card.Actions>
                    <Button onPress={() => openModal(item)}>Editar</Button>
                    <Button onPress={() => confirmDeleteTurma(item.id)}>Excluir</Button>
                  </Card.Actions>
                </Card>
              );
            } catch (error) {
              console.error("Erro ao renderizar turma:", error);
              return null;
            }
          }}
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
                  label="Nome da Turma" 
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
                value: 1,
                message: "Código deve ter entre 1 e 50 caracteres"
              },
              maxLength: {
                value: 50,
                message: "Código deve ter entre 1 e 50 caracteres"
              },
              pattern: {
                value: /^[A-Z0-9]+$/,
                message: "Código deve conter apenas letras maiúsculas e números"
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput 
                  label="Código da Turma" 
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
            name="periodo"
            rules={{ 
              required: "Período é obrigatório",
              validate: (value) => {
                if (!value) return "Período é obrigatório";
                // Aceitar tanto formato com ponto quanto com barra
                const periodoPattern = /^\d{4}[./][12]$/;
                if (!periodoPattern.test(value)) {
                  return "Período deve estar no formato YYYY/1 ou YYYY/2 (ex: 2024/1 ou 2024.1)";
                }
                return true;
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput 
                  label="Período (ex: 2024/1 ou 2024.1)" 
                  value={value} 
                  onChangeText={onChange} 
                  style={styles.input} 
                  mode="outlined"
                  error={!!errors.periodo}
                />
                {errors.periodo && (
                  <Text style={styles.errorText}>{errors.periodo.message}</Text>
                )}
              </View>
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
            rules={{ 
              required: "Capacidade é obrigatória",
              validate: (value) => {
                const num = parseInt(value);
                if (isNaN(num)) {
                  return "Capacidade deve ser um número inteiro";
                }
                if (num < 5) {
                  return "Capacidade mínima é 5 alunos";
                }
                if (num > 50) {
                  return "Capacidade máxima é 50 alunos";
                }
                return true;
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput 
                  label="Capacidade de Alunos" 
                  value={value} 
                  onChangeText={onChange} 
                  style={styles.input} 
                  mode="outlined" 
                  keyboardType="numeric"
                  error={!!errors.capacidade}
                />
                {errors.capacidade && (
                  <Text style={styles.errorText}>{errors.capacidade.message}</Text>
                )}
              </View>
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
});
