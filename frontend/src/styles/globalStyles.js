import { StyleSheet, Dimensions, Platform } from "react-native";
import { getBottomSpace } from "react-native-iphone-x-helper";

const { width, height } = Dimensions.get("window");

// Breakpoints para responsividade
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

// Função para verificar se é mobile
export const isMobile = width < breakpoints.tablet;
export const isTablet =
  width >= breakpoints.tablet && width < breakpoints.desktop;
export const isDesktop = width >= breakpoints.desktop;

// Função para obter padding responsivo
export const getResponsivePadding = () => {
  if (isMobile) return 16;
  if (isTablet) return 24;
  return 32;
};

// Função para obter tamanho de fonte responsivo
export const getResponsiveFontSize = (base) => {
  const scale = isMobile ? 1 : isTablet ? 1.1 : 1.2;
  return base * scale;
};

// Função para obter número de colunas responsivo
export const getResponsiveColumns = () => {
  if (isMobile) return 1;
  if (isTablet) return 2;
  return 3;
};

// Cores do tema
export const colors = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#06b6d4",

  background: "#f8fafc",
  surface: "#ffffff",

  text: "#1e293b",
  textSecondary: "#64748b",
  textLight: "#94a3b8",

  border: "#e2e8f0",
  borderLight: "#f1f5f9",

  overlay: "rgba(0, 0, 0, 0.5)",
};

// Estilos globais
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getResponsivePadding(),
    paddingBottom: 110 + getBottomSpace(),
  },

  responsiveContainer: {
    flex: 1,
    padding: getResponsivePadding(),
    maxWidth: isDesktop ? 1200 : "100%",
    alignSelf: "center",
    width: "100%",
    paddingBottom: 100,
  },

  responsiveGrid: {
    flexDirection: isMobile ? "column" : "row",
    flexWrap: "wrap",
    gap: 16,
  },

  gridItem: {
    flex: isMobile ? 1 : isTablet ? 0.48 : 0.31,
    minWidth: isMobile ? "100%" : isTablet ? "45%" : "30%",
  },

  responsiveCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },

  responsiveTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: "600",
    marginBottom: 8,
  },

  responsiveSubtitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: "500",
    marginBottom: 6,
  },

  responsiveBody: {
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveFontSize(20),
  },

  responsiveButton: {
    minHeight: 48,
    justifyContent: "center",
    borderRadius: 8,
  },

  responsiveModal: {
    margin: getResponsivePadding(),
    padding: getResponsivePadding(),
    borderRadius: 12,
    maxHeight: height * 0.8,
    maxWidth: isDesktop ? 600 : "100%",
    alignSelf: "center",
    width: "100%",
  },

  responsiveInput: {
    marginBottom: 16,
    fontSize: getResponsiveFontSize(14),
  },

  responsiveSearchbar: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },

  responsiveFAB: {
    position: "absolute",
    margin: getResponsivePadding(),
    right: 0,
    bottom: 0,
  },

  // 🚀 Bottom bar ajustada
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 0,
    height: 80 + getBottomSpace(),
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1000, // garante sobreposição
    paddingBottom: (getBottomSpace() || 10) + 40,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  fadeIn: { opacity: 1 },
  fadeOut: { opacity: 0 },

  centerContent: { justifyContent: "center", alignItems: "flex-end" },
  spaceBetween: { justifyContent: "space-between" },
  spaceAround: { justifyContent: "space-around" },
  flexRow: { flexDirection: "row" },
  flexColumn: { flexDirection: "column" },
  flex1: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: getResponsiveFontSize(16),
    textAlign: "center",
    opacity: 0.7,
    marginTop: 16,
  },
});

// Funções utilitárias
export const getColorWithOpacity = (color, opacity) => {
  return (
    color +
    Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")
  );
};

export const getElevationStyle = (elevation) => ({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: elevation / 2 },
  shadowOpacity: 0.1 + elevation * 0.02,
  shadowRadius: elevation,
  elevation,
});

export default globalStyles;
