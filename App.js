import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";

// Importação das telas
import DashboardScreen from "./src/screens/DashboardScreen";
import TurmasScreen from "./src/screens/TurmasScreen";
import AlunosScreen from "./src/screens/AlunosScreen";
import ProfessoresScreen from "./src/screens/ProfessoresScreen";
import DisciplinasScreen from "./src/screens/DisciplinasScreen";
import NotasScreen from "./src/screens/NotasScreen";

// Tema personalizado herdando do DefaultTheme
const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6366f1", // Indigo suave
    accent: "#8b5cf6", // Violeta suave
    background: "#f8fafc", // Cinza muito claro
    surface: "#ffffff",
    text: "#1e293b", // Cinza escuro
    placeholder: "#64748b", // Cinza médio
    backdrop: "rgba(0, 0, 0, 0.5)",
    onSurface: "#1e293b",
    disabled: "#cbd5e1",
    notification: "#ef4444",
  },
};

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor={theme.colors.background} />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName;

                switch (route.name) {
                  case "Dashboard":
                    iconName = "dashboard";
                    break;
                  case "Turmas":
                    iconName = "class";
                    break;
                  case "Alunos":
                    iconName = "people";
                    break;
                  case "Professores":
                    iconName = "person";
                    break;
                  case "Disciplinas":
                    iconName = "book";
                    break;
                  case "Notas":
                    iconName = "grade";
                    break;
                  default:
                    iconName = "circle";
                }

                return (
                  <MaterialIcons name={iconName} size={size} color={color} />
                );
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.placeholder,
              tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopColor: "#e2e8f0",
                borderTopWidth: 1,
                paddingBottom: 0,
                paddingTop: 5,
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "500",
              },
              headerStyle: {
                backgroundColor: theme.colors.surface,
                borderBottomColor: "#e2e8f0",
                borderBottomWidth: 1,
              },
              headerTitleStyle: {
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: "600",
              },
            })}
          >
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: "Dashboard" }}
            />
            <Tab.Screen
              name="Turmas"
              component={TurmasScreen}
              options={{ title: "Turmas" }}
            />
            <Tab.Screen
              name="Alunos"
              component={AlunosScreen}
              options={{ title: "Alunos" }}
            />
            <Tab.Screen
              name="Professores"
              component={ProfessoresScreen}
              options={{ title: "Professores" }}
            />
            <Tab.Screen
              name="Disciplinas"
              component={DisciplinasScreen}
              options={{ title: "Disciplinas" }}
            />
            <Tab.Screen
              name="Notas"
              component={NotasScreen}
              options={{ title: "Notas" }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
