import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import AuthService from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";
import AwesomeAlert from "react-native-awesome-alerts";

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: "", password: "" },
  });

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await AuthService.login(data.username, data.password);
      if (response && response.access_token) {
        await AuthService.saveToken(response.access_token);
        await AuthService.saveUser(response.user);
        await login(response.user);
      } else {
        showCustomAlert("Erro", "Credenciais inválidas");
      }
    } catch (error) {
      const errorMessage = error.message || "Erro ao fazer login. Verifique suas credenciais.";
      showCustomAlert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Title style={styles.title}>Bem-vindo</Title>
          <Paragraph style={styles.subtitle}>
            Faça login para acessar o sistema
          </Paragraph>

          <Controller
            control={control}
            name="username"
            rules={{
              required: "Username é obrigatório",
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Username"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  autoCapitalize="none"
                  error={!!errors.username}
                  disabled={loading}
                />
                {errors.username && (
                  <Paragraph style={styles.errorText}>
                    {errors.username.message}
                  </Paragraph>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: "Senha é obrigatória",
              minLength: {
                value: 6,
                message: "Senha deve ter no mínimo 6 caracteres",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Senha"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  error={!!errors.password}
                  disabled={loading}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                {errors.password && (
                  <Paragraph style={styles.errorText}>
                    {errors.password.message}
                  </Paragraph>
                )}
              </View>
            )}
          />

          {loading ? (
            <ActivityIndicator
              animating={true}
              size="large"
              style={styles.loader}
            />
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Entrar
            </Button>
          )}
        </View>
      </ScrollView>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertTitle}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={theme.colors.primary}
        onConfirmPressed={() => setShowAlert(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#64748b",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginLeft: 12,
    marginTop: -8,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  borderRadius: 8,
  elevation: 2,
  shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loader: {
    marginTop: 24,
  },
});

