import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLogout } from '@/hooks/useLogout';
import { LogoutModal } from './LogoutModal';
import { Theme } from '@/types/theme';
import { LogOut } from 'lucide-react-native';

interface LogoutButtonProps {
  title?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showIcon?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  clearRememberedPhone?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  title = 'Logout',
  style,
  textStyle,
  showIcon = true,
  variant = 'danger',
  clearRememberedPhone = false,
}) => {
  const { theme } = useTheme();
  const {
    showLogoutModal,
    showLogoutConfirmation,
    hideLogoutConfirmation,
    confirmLogout,
    isLoggingOut,
  } = useLogout();

  const styles = getStyles(theme, variant);

  const handlePress = () => {
    showLogoutConfirmation();
  };

  const handleConfirmLogout = () => {
    confirmLogout(clearRememberedPhone);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handlePress}
        disabled={isLoggingOut}
      >
        {showIcon && (
          <LogOut size={18} color={styles.buttonText.color} />
        )}
        <Text style={[styles.buttonText, textStyle]}>
          {isLoggingOut ? 'Logging out...' : title}
        </Text>
      </TouchableOpacity>

      <LogoutModal
        visible={showLogoutModal}
        onClose={hideLogoutConfirmation}
        onConfirm={handleConfirmLogout}
        loading={isLoggingOut}
      />
    </>
  );
};

const getStyles = (theme: Theme, variant: 'primary' | 'secondary' | 'danger') => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.background,
          textColor: theme.colors.text.primary,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'danger':
      default:
        return {
          backgroundColor: theme.colors.error,
          textColor: '#FFFFFF',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
      ...variantStyles,
    },
    buttonText: {
      color: variantStyles.textColor,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeights.medium as any,
      fontFamily: theme.typography.fontFamily,
    },
  });
};