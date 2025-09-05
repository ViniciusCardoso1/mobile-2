import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints para responsividade
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

// Função para verificar se é mobile
export const isMobile = width < breakpoints.tablet;
export const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
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

// Estilos globais
export const globalStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    padding: getResponsivePadding(),
  },
  
  // Containers responsivos
  responsiveContainer: {
    flex: 1,
    padding: getResponsivePadding(),
    maxWidth: isDesktop ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  
  // Grid responsivo
  responsiveGrid: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  
  // Item do grid
  gridItem: {
    flex: isMobile ? 1 : isTablet ? 0.48 : 0.31,
    minWidth: isMobile ? '100%' : isTablet ? '45%' : '30%',
  },
  
  // Cards responsivos
  responsiveCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  
  // Texto responsivo
  responsiveTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: '600',
    marginBottom: 8,
  },
  
  responsiveSubtitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: '500',
    marginBottom: 6,
  },
  
  responsiveBody: {
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveFontSize(20),
  },
  
  // Botões responsivos
  responsiveButton: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 8,
  },
  
  // Modal responsivo
  responsiveModal: {
    margin: getResponsivePadding(),
    padding: getResponsivePadding(),
    borderRadius: 12,
    maxHeight: height * 0.8,
    maxWidth: isDesktop ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  
  // Input responsivo
  responsiveInput: {
    marginBottom: 16,
    fontSize: getResponsiveFontSize(14),
  },
  
  // Barra de busca responsiva
  responsiveSearchbar: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  
  // FAB responsivo
  responsiveFAB: {
    position: 'absolute',
    margin: getResponsivePadding(),
    right: 0,
    bottom: 0,
  },
  
  // Espaçamentos
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Sombras
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Animações
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0,
  },
  
  // Utilitários
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Estados de loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  // Estados vazios
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  emptyText: {
    fontSize: getResponsiveFontSize(16),
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 16,
  },
});

// Cores do tema
export const colors = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  
  secondary: '#8b5cf6',
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',
  
  success: '#22c55e',
  successLight: '#4ade80',
  successDark: '#16a34a',
  
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningDark: '#d97706',
  
  error: '#ef4444',
  errorLight: '#f87171',
  errorDark: '#dc2626',
  
  info: '#06b6d4',
  infoLight: '#22d3ee',
  infoDark: '#0891b2',
  
  background: '#f8fafc',
  surface: '#ffffff',
  
  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Função para obter cor com opacidade
export const getColorWithOpacity = (color, opacity) => {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
};

// Função para obter estilos de elevação
export const getElevationStyle = (elevation) => {
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation / 2,
    },
    shadowOpacity: 0.1 + (elevation * 0.02),
    shadowRadius: elevation,
    elevation: elevation,
  };
};

export default globalStyles;

