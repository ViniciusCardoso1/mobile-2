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
import { useAppData } from "../hooks/useAppData";

const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 600;

const DashboardScreen = () => {
  const theme = useTheme();
  const { data, loading, getStats, getChartData, refreshData } = useAppData();

  const stats = getStats();
  const chartData = getChartData();

  const isLoading = Object.values(loading).some(Boolean);

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: theme.colors.primary },
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

  // Função para definir ícone e cor da taxa de aprovação
  const getApprovalIcon = (percent) => {
    if (percent >= 70) return { icon: "check-circle", color: "#16a34a" }; // verde
    if (percent >= 50) return { icon: "alert-circle", color: "#f59e0b" }; // amarelo
    return { icon: "close-circle", color: "#dc2626" }; // vermelho
  };

  const taxaPercent =
    stats.totalNotas > 0 ? (stats.aprovacoes / stats.totalNotas) * 100 : 0;
  const { icon: taxaIcon, color: taxaColor } = getApprovalIcon(taxaPercent);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refreshData} />
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
        <View style={[styles.statsRow, isSmallScreen && styles.statsColumn]}>
          <StatCard
            title="Turmas"
            value={stats.totalTurmas}
            icon="school"
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
            value={stats.totalNotas > 0 ? `${taxaPercent.toFixed(1)}%` : "0%"}
            subtitle={`${stats.aprovacoes} aprovados`}
            icon={taxaIcon}
            color={taxaColor}
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
              width={screenWidth - (isSmallScreen ? 32 : 64)}
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
                width={screenWidth - (isSmallScreen ? 32 : 64)}
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
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statsColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: { flex: 1, elevation: 2, minWidth: isSmallScreen ? "48%" : 0 },
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
  bottomSpacing: { height: 20 },
});

export default DashboardScreen;
