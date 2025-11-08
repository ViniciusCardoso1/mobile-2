import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "./apiService";

const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";

class AuthService {
  async login(username, password) {
    try {
      const response = await apiService.create("auth/login", {
        username,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(username, email, password) {
    try {
      const response = await apiService.create("auth/register", {
        username,
        email,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async saveToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Erro ao salvar token:", error);
    }
  }

  async getToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error("Erro ao obter token:", error);
      return null;
    }
  }

  async saveUser(user) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  }

  async getUser() {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      return null;
    }
  }

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  async logout() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }
}

export default new AuthService();

