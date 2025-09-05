import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { globalStyles } from '../styles/globalStyles';

/**
 * Componente de loading reutilizável com animações
 */
export const LoadingComponent = ({ 
  size = 'large', 
  text = 'Carregando...', 
  style,
  showText = true 
}) => {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={[styles.container, globalStyles.centerContent, style]}>
      <ActivityIndicator 
        size={size} 
        color={theme.colors.primary}
        style={styles.indicator}
      />
      {showText && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text 
            variant="bodyMedium" 
            style={[styles.text, { color: theme.colors.text }]}
          >
            {text}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

/**
 * Componente para estado vazio
 */
export const EmptyStateComponent = ({ 
  icon = 'inbox', 
  title = 'Nenhum item encontrado',
  subtitle = 'Adicione itens para começar',
  action,
  style 
}) => {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View 
      style={[
        styles.emptyContainer, 
        globalStyles.centerContent, 
        { transform: [{ scale: scaleAnim }] },
        style
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
        <Text style={[styles.iconText, { color: theme.colors.primary }]}>
          📋
        </Text>
      </View>
      <Text 
        variant="titleMedium" 
        style={[styles.emptyTitle, { color: theme.colors.text }]}
      >
        {title}
      </Text>
      <Text 
        variant="bodyMedium" 
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {subtitle}
      </Text>
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </Animated.View>
  );
};

/**
 * Componente de erro
 */
export const ErrorComponent = ({ 
  title = 'Ops! Algo deu errado',
  subtitle = 'Tente novamente em alguns instantes',
  onRetry,
  style 
}) => {
  const theme = useTheme();
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  return (
    <Animated.View 
      style={[
        styles.errorContainer, 
        globalStyles.centerContent,
        { transform: [{ translateX: shakeAnim }] },
        style
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
        <Text style={[styles.iconText, { color: theme.colors.error }]}>
          ⚠️
        </Text>
      </View>
      <Text 
        variant="titleMedium" 
        style={[styles.errorTitle, { color: theme.colors.error }]}
      >
        {title}
      </Text>
      <Text 
        variant="bodyMedium" 
        style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}
      >
        {subtitle}
      </Text>
      {onRetry && (
        <View style={styles.actionContainer}>
          <Button 
            mode="outlined" 
            onPress={onRetry}
            style={styles.retryButton}
          >
            Tentar Novamente
          </Button>
        </View>
      )}
    </Animated.View>
  );
};

/**
 * Componente de sucesso
 */
export const SuccessComponent = ({ 
  title = 'Sucesso!',
  subtitle = 'Operação realizada com sucesso',
  onContinue,
  style 
}) => {
  const theme = useTheme();
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      tension: 100,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [bounceAnim]);

  return (
    <Animated.View 
      style={[
        styles.successContainer, 
        globalStyles.centerContent,
        { transform: [{ scale: bounceAnim }] },
        style
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
        <Text style={[styles.iconText, { color: theme.colors.success }]}>
          ✅
        </Text>
      </View>
      <Text 
        variant="titleMedium" 
        style={[styles.successTitle, { color: theme.colors.success }]}
      >
        {title}
      </Text>
      <Text 
        variant="bodyMedium" 
        style={[styles.successSubtitle, { color: theme.colors.textSecondary }]}
      >
        {subtitle}
      </Text>
      {onContinue && (
        <View style={styles.actionContainer}>
          <Button 
            mode="contained" 
            onPress={onContinue}
            style={styles.continueButton}
          >
            Continuar
          </Button>
        </View>
      )}
    </Animated.View>
  );
};

/**
 * Componente de card animado
 */
export const AnimatedCard = ({ children, delay = 0, style, ...props }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
  },
  indicator: {
    marginBottom: 16,
  },
  text: {
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 32,
  },
  errorContainer: {
    padding: 32,
  },
  successContainer: {
    padding: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  successTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  successSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 200,
  },
  retryButton: {
    borderColor: '#ef4444',
  },
  continueButton: {
    backgroundColor: '#22c55e',
  },
});

export default {
  LoadingComponent,
  EmptyStateComponent,
  ErrorComponent,
  SuccessComponent,
  AnimatedCard,
};

