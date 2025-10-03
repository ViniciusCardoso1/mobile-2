import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Text, Card, useTheme, IconButton, Chip } from "react-native-paper";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import StorageService from "../services/StorageService";

const { width: screenWidth } = Dimensions.get("window");

const DashboardScreen = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTurmas: 0,
    totalAlunos: 0,
    totalProfessores: 0,
    totalDisciplinas: 0,
    totalNotas: 0,
    mediaGeral: 0,
    aprovacoes: 0,
    reprovacoes: 0,
  });
  const [chartData, setChartData] = useState({
    notasPorDisciplina: [],
    distribuicaoNotas: [],
    evolucaoNotas: [],
    statusAlunos: [],
  });

  useEffect(() => {
    loadDashboardData();
    StorageService.initializeSampleData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const turmas = await StorageService.loadData(StorageService.KEYS.TURMAS);
      const alunos = await StorageService.loadData(StorageService.KEYS.ALUNOS);
      const professores = await StorageService.loadData(
        StorageService.KEYS.PROFESSORES
      );
      const disciplinas = await StorageService.loadData(
        StorageService.KEYS.DISCIPLINAS
      );
      const notas = await StorageService.loadData(StorageService.KEYS.NOTAS);

      const totalNotas = notas.length;
      const mediaGeral =
        totalNotas > 0
          ? notas.reduce((sum, nota) => sum + nota.nota, 0) / totalNotas
          : 0;

      const aprovacoes = notas.filter((nota) => nota.nota >= 7).length;
      const reprovacoes = notas.filter((nota) => nota.nota < 7).length;

      setStats({
        totalTurmas: turmas.length,
        totalAlunos: alunos.length,
        totalProfessores: professores.length,
        totalDisciplinas: disciplinas.length,
        totalNotas,
        mediaGeral,
        aprovacoes,
        reprovacoes,
      });

      prepareChartData(notas, disciplinas);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (notas, disciplinas) => {
    const notasPorDisciplina = disciplinas.map((disciplina) => {
      const notasDisciplina = notas.filter(
        (nota) => nota.disciplina === disciplina.id
      );
      const media =
        notasDisciplina.length > 0
          ? notasDisciplina.reduce((sum, nota) => sum + nota.nota, 0) /
            notasDisciplina.length
          : 0;
      return {
        name: disciplina.nome.substring(0, 8),
        media: parseFloat(media.toFixed(1)),
      };
    });

    const distribuicaoNotas = [
      {
        name: "0-3",
        count: notas.filter((n) => n.nota >= 0 && n.nota < 3).length,
        color: "#ef4444",
      },
      {
        name: "3-5",
        count: notas.filter((n) => n.nota >= 3 && n.nota < 5).length,
        color: "#f59e0b",
      },
      {
        name: "5-7",
        count: notas.filter((n) => n.nota >= 5 && n.nota < 7).length,
        color: "#eab308",
      },
      {
        name: "7-8.5",
        count: notas.filter((n) => n.nota >= 7 && n.nota < 8.5).length,
        color: "#22c55e",
      },
      {
        name: "8.5-10",
        count: notas.filter((n) => n.nota >= 8.5 && n.nota <= 10).length,
        color: "#16a34a",
      },
    ];

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const evolucaoNotas = meses.map(() => {
      const baseMedia = stats.mediaGeral || 7;
      const variacao = (Math.random() - 0.5) * 2;
      return Math.max(0, Math.min(10, baseMedia + variacao));
    });

    const statusAlunos = [
      {
        name: "Aprovados",
        population: notas.filter((nota) => nota.nota >= 7).length,
        color: theme.colors.primary,
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      },
      {
        name: "Reprovados",
        population: notas.filter((nota) => nota.nota < 7).length,
        color: theme.colors.error,
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      },
    ];

    setChartData({
      notasPorDisciplina,
      distribuicaoNotas,
      evolucaoNotas,
      statusAlunos,
    });
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.primary,
    },
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <Card
      style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
    >
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statCardHeader}>
          <View>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
          </View>
          <IconButton
            icon={icon}
            size={24}
            iconColor={color}
            style={[styles.statIcon, { backgroundColor: color + "20" }]}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadDashboardData} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dashboard Acadêmico</Text>
        <Text style={styles.headerSubtitle}>
          Visão geral do sistema de gerenciamento
        </Text>
      </LinearGradient>

      {/* Estatísticas principais */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            title="Turmas"
            value={stats.totalTurmas}
            icon="school" // ou "account-group"
            color={theme.colors.primary}
          />
          <StatCard
            title="Alunos"
            value={stats.totalAlunos}
            icon="account-multiple"
            color="#22c55e"
          />
          <StatCard
            title="Professores"
            value={stats.totalProfessores}
            icon="account-tie"
            color="#f59e0b"
          />
          <StatCard
            title="Disciplinas"
            value={stats.totalDisciplinas}
            icon="book"
            color="#8b5cf6"
          />
          <StatCard
            title="Média Geral"
            value={stats.mediaGeral.toFixed(1)}
            subtitle={`${stats.totalNotas} notas`}
            icon="star"
            color="#06b6d4"
          />
          <StatCard
            title="Taxa Aprovação"
            value={
              stats.totalNotas > 0
                ? `${((stats.aprovacoes / stats.totalNotas) * 100).toFixed(1)}%`
                : "0%"
            }
            subtitle={`${stats.aprovacoes} aprovados`}
            icon="check-circle"
            color="#16a34a"
          />
        </View>
      </View>

      {/* Gráficos */}
      {chartData.notasPorDisciplina.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Média por Disciplina</Text>
            <BarChart
              data={{
                labels: chartData.notasPorDisciplina.map((item) => item.name),
                datasets: [
                  {
                    data: chartData.notasPorDisciplina.map(
                      (item) => item.media
                    ),
                  },
                ],
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
          </Card.Content>
        </Card>
      )}

      {chartData.statusAlunos.length > 0 &&
        chartData.statusAlunos.some((item) => item.population > 0) && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Status dos Alunos</Text>
              <PieChart
                data={chartData.statusAlunos.filter(
                  (item) => item.population > 0
                )}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

      {/* Distribuição de notas */}
      {chartData.distribuicaoNotas.some((item) => item.count > 0) && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Distribuição de Notas</Text>
            <View style={styles.distributionContainer}>
              {chartData.distribuicaoNotas.map((item, index) => (
                <View key={index} style={styles.distributionItem}>
                  <Chip
                    mode="flat"
                    style={[
                      styles.distributionChip,
                      { backgroundColor: item.color + "20" },
                    ]}
                    textStyle={{ color: item.color, fontWeight: "600" }}
                  >
                    {item.name}
                  </Chip>
                  <Text
                    style={[styles.distributionCount, { color: item.color }]}
                  >
                    {item.count}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 20,
  },
  headerSubtitle: { color: "rgba(255, 255, 255, 0.8)" },
  statsContainer: { padding: 16, marginTop: -20 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: { flex: 1, elevation: 2 },
  statCardContent: { paddingVertical: 16 },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statTitle: { opacity: 0.7, marginBottom: 4 },
  statValue: { fontWeight: "700", marginBottom: 2, fontSize: 18 },
  statSubtitle: { opacity: 0.6, fontSize: 11 },
  statIcon: { margin: 0 },
  chartCard: { margin: 16, marginTop: 8, elevation: 2 },
  chartTitle: { fontWeight: "600", marginBottom: 16, textAlign: "center" },
  chart: { borderRadius: 16 },
  distributionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  distributionItem: { alignItems: "center", gap: 8 },
  distributionChip: { minWidth: 60 },
  distributionCount: { fontWeight: "700", fontSize: 18 },
  summaryCard: { margin: 16, elevation: 2 },
  summaryTitle: { fontWeight: "600", marginBottom: 16 },
  summaryContent: { gap: 8 },
  summaryText: { lineHeight: 20 },
  bottomSpacing: { height: 20 },
});

export default DashboardScreen;
