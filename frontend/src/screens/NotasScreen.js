import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Card,
  Text,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
  Chip,
  Menu,
  useTheme,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import DataService from "../services/DataService";
import AwesomeAlert from "react-native-awesome-alerts";

const NotasScreen = () => {
  const theme = useTheme();

  const [notas, setNotas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNota, setEditingNota] = useState(null);

  // Estados para controlar menus dropdown
  const [alunoMenuVisible, setAlunoMenuVisible] = useState(false);
  const [disciplinaMenuVisible, setDisciplinaMenuVisible] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmCallback, setAlertConfirmCallback] = useState(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      aluno: "",
      disciplina: "",
      nota: "",
      data: "",
      observacoes: "",
    },
  });

  // Para mostrar o nome selecionado no botão
  const selectedAlunoId = watch("aluno");
  const selectedDisciplinaId = watch("disciplina");

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
      await alertConfirmCallback();
      setAlertConfirmCallback(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notasData, alunosData, disciplinasData] = await Promise.all([
        DataService.loadData(DataService.KEYS.NOTAS),
        DataService.loadData(DataService.KEYS.ALUNOS),
        DataService.loadData(DataService.KEYS.DISCIPLINAS),
      ]);
      setNotas(notasData || []);
      setAlunos(alunosData || []);
      setDisciplinas(disciplinasData || []);
    } catch (error) {
      showCustomAlert("Erro", "Não foi possível carregar os dados");
      setNotas([]);
      setAlunos([]);
      setDisciplinas([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (nota = null) => {
    if (nota) {
      setEditingNota(nota);
      reset({
        aluno: nota.aluno,
        disciplina: nota.disciplina,
        nota: nota.nota?.toString() || "",
        data: nota.data || "",
        observacoes: nota.observacoes || "",
      });
    } else {
      setEditingNota(null);
      reset({
        aluno: "",
        disciplina: "",
        nota: "",
        data: new Date().toISOString().split("T")[0],
        observacoes: "",
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    reset();
    setEditingNota(null);
    setAlunoMenuVisible(false);
    setDisciplinaMenuVisible(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const notaData = { ...data, nota: parseFloat(data.nota) };

      if (editingNota) {
        await DataService.updateItem(
          DataService.KEYS.NOTAS,
          editingNota.id,
          notaData
        );
        showCustomAlert("Sucesso", "Nota atualizada com sucesso!");
      } else {
        await DataService.addItem(DataService.KEYS.NOTAS, {
          ...notaData,
          id: Date.now().toString(),
        });
        showCustomAlert("Sucesso", "Nota criada com sucesso!");
      }

      await loadData();
      closeModal();
    } catch {
      showCustomAlert("Erro", "Não foi possível salvar a nota");
    } finally {
      setLoading(false);
    }
  };

  // Função para confirmar exclusão com alerta encadeado
  const confirmDeleteNota = (id) => {
    setAlertTitle("Confirmar");
    setAlertMessage("A nota será excluída.");
    setAlertConfirmCallback(() => async () => {
      setShowAlert(false); // fecha o alerta de confirmação

      setLoading(true);
      try {
        await DataService.deleteItem(DataService.KEYS.NOTAS, id);
        await loadData();

        // Após exclusão, mostra alerta de sucesso
        setAlertTitle("Sucesso");
        setAlertMessage("Nota excluída com sucesso!");
        setAlertConfirmCallback(null);
        setShowAlert(true);
      } catch {
        setAlertTitle("Erro");
        setAlertMessage("Não foi possível excluir a nota");
        setAlertConfirmCallback(null);
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    });
    setShowAlert(true);
  };

  const getAlunoName = (alunoId) => {
    const aluno = alunos.find((a) => a.id === alunoId);
    return aluno ? aluno.nome : "Selecione um aluno";
  };

  const getDisciplinaName = (disciplinaId) => {
    const disciplina = disciplinas.find((d) => d.id === disciplinaId);
    return disciplina ? disciplina.nome : "Selecione uma disciplina";
  };

  const getNotaColor = (nota) => {
    if (nota >= 7) return "#4caf50"; // verde
    if (nota >= 5) return "#ff9800"; // laranja
    return "#f44336"; // vermelho
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const filteredNotas = notas.filter((nota) => {
    const alunoName = getAlunoName(nota.aluno).toLowerCase();
    const disciplinaName = getDisciplinaName(nota.disciplina).toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      alunoName.includes(query) ||
      disciplinaName.includes(query) ||
      (nota.nota?.toString() || "").includes(query)
    );
  });

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
          data={filteredNotas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>{getAlunoName(item.aluno)}</Text>
                <Text style={styles.subtitle}>
                  {getDisciplinaName(item.disciplina)}
                </Text>
                <View style={styles.chipRow}>
                  <Chip
                    style={[
                      styles.notaChip,
                      { backgroundColor: getNotaColor(item.nota) + "33" },
                    ]} // 20% opacity
                    textStyle={{
                      color: getNotaColor(item.nota),
                      fontWeight: "600",
                    }}
                  >
                    {item.nota?.toFixed(1)}
                  </Chip>
                  <Chip style={styles.dataChip}>{formatDate(item.data)}</Chip>
                </View>
                {item.observacoes ? (
                  <Text style={styles.observacoes}>
                    <Text style={{ fontWeight: "600" }}>Observações: </Text>
                    {item.observacoes}
                  </Text>
                ) : null}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openModal(item)}>Editar</Button>
                <Button onPress={() => confirmDeleteNota(item.id)}>
                  Excluir
                </Button>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Nenhuma nota encontrada.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <FAB style={styles.fab} icon="plus" onPress={() => openModal()} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modal}
        >
          {/* Menu para selecionar aluno */}
          <Menu
            visible={alunoMenuVisible}
            onDismiss={() => setAlunoMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setAlunoMenuVisible(true)}
                style={styles.input}
                contentStyle={{ justifyContent: "space-between" }}
              >
                {getAlunoName(selectedAlunoId)}
              </Button>
            }
          >
            {alunos.length === 0 ? (
              <Menu.Item title="Nenhum aluno cadastrado" disabled />
            ) : (
              alunos.map((aluno) => (
                <Menu.Item
                  key={aluno.id}
                  onPress={() => {
                    setValue("aluno", aluno.id);
                    setAlunoMenuVisible(false);
                  }}
                  title={aluno.nome}
                />
              ))
            )}
          </Menu>

          {/* Menu para selecionar disciplina */}
          <Menu
            visible={disciplinaMenuVisible}
            onDismiss={() => setDisciplinaMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setDisciplinaMenuVisible(true)}
                style={styles.input}
                contentStyle={{ justifyContent: "space-between" }}
              >
                {getDisciplinaName(selectedDisciplinaId)}
              </Button>
            }
          >
            {disciplinas.length === 0 ? (
              <Menu.Item title="Nenhuma disciplina cadastrada" disabled />
            ) : (
              disciplinas.map((disciplina) => (
                <Menu.Item
                  key={disciplina.id}
                  onPress={() => {
                    setValue("disciplina", disciplina.id);
                    setDisciplinaMenuVisible(false);
                  }}
                  title={disciplina.nome}
                />
              ))
            )}
          </Menu>

          {/* Nota */}
          <Controller
            control={control}
            name="nota"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Nota"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />

          {/* Data */}
          <Controller
            control={control}
            name="data"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Data"
                placeholder="AAAA-MM-DD"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />

          {/* Observações */}
          <Controller
            control={control}
            name="observacoes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Observações"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                style={styles.input}
                mode="outlined"
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
              {editingNota ? "Salvar Alterações" : "Adicionar Nota"}
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
          confirmButtonColor={theme.colors.primary}
          onConfirmPressed={handleConfirmAlert}
        />
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchInput: { marginBottom: 10 },
  card: { marginBottom: 10 },
  title: { fontWeight: "600", fontSize: 16, marginBottom: 2 },
  subtitle: { opacity: 0.7, marginBottom: 8 },
  chipRow: { flexDirection: "row", marginBottom: 4, flexWrap: "wrap" },
  notaChip: { marginRight: 8, marginBottom: 4 },
  dataChip: { marginRight: 8, marginBottom: 4 },
  observacoes: { lineHeight: 20 },
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

export default NotasScreen;
