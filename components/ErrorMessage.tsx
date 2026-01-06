import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.error + '10',
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          borderColor: theme.colors.error + '40',
          marginBottom: theme.spacing.md,
        },
      ]}
    >
      <AlertCircle size={20} color={theme.colors.error} />
      <Text
        style={[
          styles.text,
          {
            color: theme.colors.error,
            fontSize: theme.typography.fontSize.sm,
            marginLeft: theme.spacing.sm,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  text: {
    flex: 1,
  },
});
