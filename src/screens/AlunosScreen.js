import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Card, Title, Paragraph, FAB, Portal, Modal, TextInput, Button, ActivityIndicator } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import StorageService from "../services/StorageService";

export default function AlunosScreen() {
  const [alunos, setAlunos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingAluno, setEditingAluno] = useState(null);

  const { control, handleSubmit, reset } = useForm();

  const loadAlunos = async () => {
    setLoading(true);
    try {
      await StorageService.initializeSampleData();
      const data = await StorageService.loadData(StorageService.KEYS.ALUNOS);
      setAlunos(data || []);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os alunos");
      setAlunos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlunos();
  }, []);

  const filteredAlunos = alunos.filter(
    aluno =>
      (aluno.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (aluno.matricula || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (aluno.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (aluno = null) => {
    if (aluno) {
      setEditingAluno(aluno);
      reset(aluno);
    } else {
      setEditingAluno(null);
      reset({ nome: "", matricula: "", email: "", telefone: "" });
    }
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    reset();
    setEditingAluno(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const alunoData = { ...data, telefone: data.telefone?.replace(/\D/g, "") || "" };

      if (editingAluno) {
        await StorageService.updateItem(StorageService.KEYS.ALUNOS, editingAluno.id, alunoData);
        Alert.alert("Sucesso", "Aluno atualizado com sucesso!");
      } else {
        await StorageService.addItem(StorageService.KEYS.ALUNOS, alunoData);
        Alert.alert("Sucesso", "Aluno criado com sucesso!");
      }

      await loadAlunos();
      closeModal();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o aluno");
    } finally {
      setLoading(false);
    }
  };

  const deleteAluno = async (id) => {
    Alert.alert("Confirmar", "Deseja excluir este aluno?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const deleted = await StorageService.deleteItem(StorageService.KEYS.ALUNOS, id);
            if (deleted) {
              await loadAlunos();
              Alert.alert("Sucesso", "Aluno excluído!");
            } else {
              Alert.alert("Erro", "Aluno não encontrado!");
            }
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o aluno");
          }
        },
      },
    ]);
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
          data={filteredAlunos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.nome}</Title>
                <Paragraph>Matrícula: {item.matricula}</Paragraph>
                <Paragraph>Email: {item.email}</Paragraph>
                <Paragraph>Telefone: {item.telefone}</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openModal(item)}>Editar</Button>
                <Button onPress={() => deleteAluno(item.id)}>Excluir</Button>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={<Paragraph style={{ textAlign: "center", marginTop: 20 }}>Nenhum aluno encontrado.</Paragraph>}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <FAB style={styles.fab} icon="plus" onPress={() => openModal()} />

      <Portal>
        <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Controller control={control} name="nome" rules={{ required: true }} render={({ field: { onChange, value } }) => <TextInput label="Nome" value={value} onChangeText={onChange} style={styles.input} mode="outlined" />} />
          <Controller control={control} name="matricula" rules={{ required: true }} render={({ field: { onChange, value } }) => <TextInput label="Matrícula" value={value} onChangeText={onChange} style={styles.input} mode="outlined" />} />
          <Controller control={control} name="email" rules={{ required: true }} render={({ field: { onChange, value } }) => <TextInput label="Email" value={value} onChangeText={onChange} style={styles.input} mode="outlined" />} />
          <Controller control={control} name="telefone" render={({ field: { onChange, value } }) => <TextInput label="Telefone" value={value} onChangeText={onChange} style={styles.input} keyboardType="phone-pad" mode="outlined" />} />

          {loading ? (
            <ActivityIndicator animating={true} style={{ marginVertical: 10 }} />
          ) : (
            <Button mode="contained" onPress={handleSubmit(onSubmit)} style={{ marginTop: 10 }}>
              {editingAluno ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          )}
        </Modal>
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
