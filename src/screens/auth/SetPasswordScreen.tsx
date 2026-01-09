import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/theme';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { useCreatePasswordMutation } from '@/hooks/useAuth';
import { storageService } from '@/utils/storage';
import { useReduxAuth } from '@/hooks/useReduxAuth';

const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;
  return { width, height, isTablet, isLandscape };
};

interface RouteParams {
  phoneNumber: string;
  otpVerified?: boolean;
}

export default function SetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { theme } = useTheme();
  const { signIn } = useAuth(); // Keep for compatibility
  const createPasswordMutation = useCreatePasswordMutation();
  const reduxAuth = useReduxAuth();

  const params = route.params as RouteParams;
  const phoneNumber = params?.phoneNumber || '';
  const otpVerified = params?.otpVerified || false;

  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [screenData, setScreenData] = useState(getScreenDimensions());

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const styles = getStyles(theme, screenData);
  const loading = createPasswordMutation.isPending;

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newScreenData = {
        width: window.width,
        height: window.height,
        isTablet: window.width >= 768,
        isLandscape: window.width > window.height,
      };
      setScreenData(newScreenData);
    });

    return () => subscription?.remove();
  }, []);

  // Validate password (minimum 8 characters, could add more rules)
  const validatePassword = (pwd: string): boolean => {
    // Basic validation - at least 8 characters
    if (pwd.length < 8) return false;
    
    // You can add more validation rules here based on API requirements
    // For example: uppercase, lowercase, numbers, special characters
    // const hasUpperCase = /[A-Z]/.test(pwd);
    // const hasLowerCase = /[a-z]/.test(pwd);
    // const hasNumbers = /\d/.test(pwd);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    return true;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);

    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
    if (error) {
      setError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);

    // Clear confirm password error when user starts typing
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
    if (error) {
      setError('');
    }
  };

  const handleSetPassword = async () => {
    // Reset errors
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    try {
      console.log('Creating password for phone:', phoneNumber);
      
      // Call the create password API
      const response = await createPasswordMutation.mutateAsync({
        phone: phoneNumber,
        password: password,
      });

      console.log('Create Password Response:', response);

      // Check if password creation was successful
      if (response.statusCode === 200) {
        // After successful password creation, sign in the user using Redux
        const loginResult = await reduxAuth.signIn(phoneNumber, password, false);
        
        if (loginResult.success) {
          console.log('Signup completed and user signed in via Redux');
          // Navigation to home is handled by AppNavigator observing auth state
        } else {
          setError(loginResult.error || 'Password created but login failed. Please try logging in manually.');
        }
      } else {
        // Handle different error status codes
        let errorMessage = response.message || 'Failed to create password. Please try again.';
        
        switch (response.statusCode) {
          case 400:
            errorMessage = 'Invalid password format. Please check and try again.';
            break;
          case 409:
            errorMessage = 'Password already exists for this account.';
            break;
          case 422:
            errorMessage = 'Password does not meet security requirements.';
            break;
          default:
            errorMessage = response.message || 'Failed to create password. Please try again.';
        }
        
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Create Password Error:', err);
      setError(err.message || 'Failed to complete signup. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('OTPVerification', { phoneNumber, isSignup: true })}
      >
        <ChevronLeft size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Set password</Text>
              <Text style={styles.subtitle}>Set a new password to continue</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.form}>
              {/* New Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New password</Text>
                <View style={[
                  styles.inputContainer,
                  passwordError ? styles.inputErrorBorder : null
                ]}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.text.hint}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={theme.colors.text.secondary} />
                    ) : (
                      <Eye size={20} color={theme.colors.text.secondary} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>Password must be at least 8 characters.</Text>
                {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <View style={[
                  styles.inputContainer,
                  confirmPasswordError ? styles.inputErrorBorder : null
                ]}>
                  <TextInput
                    ref={confirmPasswordInputRef}
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    placeholder="Re-enter your password"
                    placeholderTextColor={theme.colors.text.hint}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    returnKeyType="go"
                    onSubmitEditing={handleSetPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={theme.colors.text.secondary} />
                    ) : (
                      <Eye size={20} color={theme.colors.text.secondary} />
                    )}
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text> : null}
              </View>
            </View>
          </View>

          {/* Set Password Button - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.setPasswordButton}
              onPress={handleSetPassword}
              disabled={loading}
            >
              <Text style={styles.setPasswordButtonText}>
                {loading ? 'Creating Password...' : 'Complete Signup'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: Theme, screenData: ReturnType<typeof getScreenDimensions>) => {
  const { width, height, isTablet, isLandscape } = screenData;
  
  const horizontalPadding = isTablet ? width * 0.1 : theme.spacing.lg;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 30,
      left: theme.spacing.lg,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: Platform.OS === 'ios' ? 100 : 80,
      paddingHorizontal: horizontalPadding,
    },
    content: {
      flex: 1,
    },
    header: {
      marginBottom: theme.spacing.xl * 2,
    },
    title: {
      fontSize: isTablet ? 32 : 28,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily,
    },
    subtitle: {
      fontSize: isTablet ? theme.typography.fontSize.lg : theme.typography.fontSize.md,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fontFamily,
      fontSize: isTablet ? theme.typography.fontSize.md : theme.typography.fontSize.sm,
    },
    form: {
      width: '100%',
      maxWidth: isTablet ? 400 : '100%',
      alignSelf: 'center',
    },
    inputGroup: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: isTablet ? theme.typography.fontSize.lg : theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeights.medium as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: isTablet ? 64 : 56,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    input: {
      flex: 1,
      fontSize: isTablet ? theme.typography.fontSize.lg : theme.typography.fontSize.md,
      color: theme.colors.text.primary,
      height: '100%',
      fontFamily: theme.typography.fontFamily,
    },
    eyeIcon: {
      padding: 4,
    },
    helperText: {
      fontSize: isTablet ? theme.typography.fontSize.sm : theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily,
    },
    fieldErrorText: {
      color: theme.colors.error,
      fontSize: isTablet ? theme.typography.fontSize.sm : theme.typography.fontSize.xs,
      marginTop: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily,
    },
    buttonContainer: {
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
    },
    setPasswordButton: {
      backgroundColor: theme.colors.primary,
      height: isTablet ? 64 : 56,
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    setPasswordButtonText: {
      color: '#FFFFFF',
      fontSize: isTablet ? theme.typography.fontSize.xl : theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeights.bold as any,
      fontFamily: theme.typography.fontFamily,
    },
    // Error states
    inputErrorBorder: {
      borderColor: theme.colors.error,
      borderWidth: 1.5,
    },
  });
};