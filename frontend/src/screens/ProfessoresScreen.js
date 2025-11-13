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

// Função para formatar telefone com máscara
const formatPhoneNumber = (text) => {
  // Remove tudo que não é dígito
  const numbers = text.replace(/\D/g, "");
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara baseado no tamanho
  if (limitedNumbers.length === 0) {
    return "";
  } else if (limitedNumbers.length <= 2) {
    return `(${limitedNumbers}`;
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    // Celular: (00) 00000-0000
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
};

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
  const { control, handleSubmit, reset, setError, formState: { errors } } = useForm();

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
      // Formatar telefone se existir (pode vir sem máscara do backend)
      const telefoneFormatado = professor.telefone ? formatPhoneNumber(professor.telefone) : "";
      reset({
        nome: professor.nome || "",
        codigo: professor.codigo || "",
        email: professor.email || "",
        telefone: telefoneFormatado,
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
          const errorMessage = error.message || "Não foi possível salvar o professor";
          showCustomAlert("Erro", errorMessage);
        } else {
          // Se houver erros de campo, também mostrar mensagem geral para garantir que o usuário veja
          const errorMessage = error.message || "Não foi possível salvar o professor. Verifique os campos destacados.";
          showCustomAlert("Erro", errorMessage);
        }
      } else {
        const errorMessage = error.message || "Não foi possível salvar o professor";
        showCustomAlert("Erro", errorMessage);
      }
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
              <View>
                <TextInput
                  label="Código"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  autoCapitalize="characters"
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
            name="email"
            rules={{ 
              required: "Email é obrigatório",
              validate: (value) => {
                if (!value || !value.trim()) {
                  return "Email é obrigatório";
                }
                if (!value.includes("@")) {
                  return "Email deve conter o símbolo '@'";
                }
                if (!value.includes(".")) {
                  return "Email deve conter um domínio válido";
                }
                const emailParts = value.split("@");
                if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
                  return "Email inválido";
                }
                return true;
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  error={!!errors.email}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="telefone"
            rules={{ 
              validate: (value) => {
                // Telefone é opcional, mas se preenchido, deve ser válido
                if (value && value.trim()) {
                  const numbers = value.replace(/\D/g, "");
                  if (numbers.length < 10) {
                    return "Telefone deve conter pelo menos 10 dígitos";
                  }
                  if (numbers.length > 11) {
                    return "Telefone deve conter no máximo 11 dígitos";
                  }
                }
                return true;
              }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Telefone (opcional)"
                  value={value}
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumber(text);
                    onChange(formatted);
                  }}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                  placeholder="(00) 00000-0000"
                  error={!!errors.telefone}
                />
                {errors.telefone && (
                  <Text style={styles.errorText}>{errors.telefone.message}</Text>
                )}
              </View>
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
});
