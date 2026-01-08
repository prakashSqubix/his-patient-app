import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/theme';
import { Eye, EyeOff, ChevronDown, CheckSquare, Square } from 'lucide-react-native';
import { useLoginMutation } from '@/hooks/useAuth';
import { storageService } from '@/utils/storage';

const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;
  return { width, height, isTablet, isLandscape };
};

// Placeholder for the flag - in a real app use a library or asset
const IndiaFlag = () => (
  <View style={staticStyles.flagPlaceholder}>
    <View style={[staticStyles.flagStrip, { backgroundColor: '#FF9933' }]} />
    <View style={[staticStyles.flagStrip, { backgroundColor: '#FFFFFF' }]} >
      <View style={staticStyles.flagCircle} />
    </View>
    <View style={[staticStyles.flagStrip, { backgroundColor: '#138808' }]} />
  </View>
);

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const loginMutation = useLoginMutation();

  const passwordInputRef = useRef<TextInput>(null);
  const [screenData, setScreenData] = useState(getScreenDimensions());

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const styles = getStyles(theme, screenData);
  const loading = loginMutation.isPending;

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

  // Load remembered phone number
  useEffect(() => {
    const loadRememberedPhone = async () => {
      try {
        const rememberedPhone = await storageService.getPhoneNumber();
        if (rememberedPhone) {
          setPhoneNumber(rememberedPhone);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading remembered phone:', error);
      }
    };

    loadRememberedPhone();
  }, []);

  // Validate phone number (Indian format: 10 digits)
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate password (minimum 6 characters)
  const validatePassword = (pwd: string): boolean => {
    return pwd.length >= 6;
  };

  const handlePhoneChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    const limitedText = numericText.slice(0, 10);
    setPhoneNumber(limitedText);

    // Clear phone error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
    if (error) {
      setError('');
    }
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

  const handleLogin = async () => {
    // Reset errors
    setError('');
    setPhoneError('');
    setPasswordError('');

    // Validate phone number
    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      console.log('Logging in with phone:', phoneNumber);
      
      // Call the login API
      const response = await loginMutation.mutateAsync({
        phone: phoneNumber,
        password: password,
      });

      console.log('Login API Response:', response);

      // Check if login was successful
      if (response.statusCode === 200) {
        // Store the access token and user data
        const { accessToken, _id, phone, status, createdAt, updatedAt } = response.data;
        
        console.log('Login successful:', {
          userId: _id,
          phone: phone,
          status: status,
          tokenReceived: !!accessToken
        });

        // Store token and user data in secure storage
        await storageService.setAccessToken(accessToken);
        await storageService.setUserData({
          _id,
          phone,
          status,
          createdAt,
          updatedAt,
        });

        // Store phone number if remember me is checked
        if (rememberMe) {
          await storageService.setPhoneNumber(phoneNumber);
        }

        // After successful login, sign in the user
        await signIn(phoneNumber, password);
        
        // Navigation to home is handled by AppNavigator observing auth state
      } else {
        // Handle different error status codes
        let errorMessage = response.message || 'Login failed. Please try again.';
        
        switch (response.statusCode) {
          case 400:
            errorMessage = 'Invalid phone number or password format.';
            break;
          case 401:
            errorMessage = 'Invalid phone number or password.';
            break;
          case 404:
            errorMessage = 'Account not found. Please sign up first.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          default:
            errorMessage = response.message || 'Login failed. Please try again.';
        }
        
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Login API Error:', err);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Responsive Background Image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../../assets/images/login_bg.png')}
          style={styles.backgroundImage}
          resizeMode={screenData.isTablet ? "contain" : "cover"}
        />
        {/* Gradient overlay for better text readability */}
        <View style={styles.gradientOverlay} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Handle/Sheet Indicator */}
            <View style={styles.handleBar} />

            <Text style={styles.title}>Log in</Text>
            <Text style={styles.subtitle}>Login With Your Phone Number</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.form}>

              {/* Phone Input Row */}
              <View>
                <View style={[
                  styles.phoneRow,
                  // phoneError ? styles.inputError : null
                ]}>
                  {/* Country Code Picker Visual */}
                  <TouchableOpacity style={[
                    styles.countryPicker,
                    phoneError ? styles.inputErrorBorder : null
                  ]}>
                    <IndiaFlag />
                    {/* <ChevronDown size={16} color={theme.colors.text.secondary} style={{ marginLeft: 4 }} /> */}
                  </TouchableOpacity>

                  {/* Phone Number Input */}
                  <View style={[
                    styles.phoneInputContainer,
                    phoneError ? styles.inputErrorBorder : null
                  ]}>
                    <Text style={styles.phonePrefix}>+91</Text>
                    <TextInput
                      style={styles.phoneInput}
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      placeholder="Mobile Number"
                      placeholderTextColor={theme.colors.text.hint}
                      maxLength={10}
                      editable={!loading}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                  </View>
                </View>
                {/* {phoneError ? <Text style={styles.fieldErrorText}>{phoneError}</Text> : null} */}
              </View>

              {/* Password Input */}
              <View>
                <View style={[
                  styles.inputContainer,
                  passwordError ? styles.inputErrorBorder : null
                ]}>
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Password"
                    placeholderTextColor={theme.colors.text.hint}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={theme.colors.text.primary} />
                    ) : (
                      <Eye size={20} color={theme.colors.text.primary} />
                    )}
                  </TouchableOpacity>
                </View>
                {/* {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null} */}
              </View>

              {/* Options Row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe ? (
                    // <SquareCheck size={20} color={theme.colors.primary} />
                    <CheckSquare size={20} color={theme.colors.primary} />
                  ) : (
                    <Square size={20} color={theme.colors.text.secondary} />
                  )}
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging in...' : 'Log In'}
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupText}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.branding}>
                <Text style={styles.brandingText}>Made by</Text>
                <Text style={styles.brandingLogo}>SQUBIX</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const staticStyles = StyleSheet.create({
  flagPlaceholder: {
    width: 24,
    height: 16,
    borderWidth: 0.5,
    borderColor: '#ddd',
    marginRight: 4,
    flexDirection: 'column',
  },
  flagStrip: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  flagCircle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'navy',
    alignSelf: 'center',
  }
});

const getStyles = (theme: Theme, screenData: ReturnType<typeof getScreenDimensions>) => {
  const { width, height, isTablet, isLandscape } = screenData;
  
  // Calculate responsive dimensions
  const backgroundHeight = isTablet 
    ? (isLandscape ? height * 0.4 : height * 0.45)
    : (isLandscape ? height * 0.35 : height * 0.55);
    
  const cardMinHeight = isTablet
    ? (isLandscape ? height * 0.7 : height * 0.6)
    : (isLandscape ? height * 0.75 : height * 0.55);
    
  const horizontalPadding = isTablet ? width * 0.1 : theme.spacing.lg;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    backgroundContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: backgroundHeight,
      overflow: 'hidden',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
      ...(isTablet && {
        alignSelf: 'center',
        maxWidth: width * 0.8,
      }),
    },
    gradientOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      paddingBottom: 0,
      ...(isLandscape && {
        paddingTop: backgroundHeight * 0.1,
      }),
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl * 2,
      borderTopRightRadius: theme.borderRadius.xl * 2,
      paddingHorizontal: horizontalPadding,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      minHeight: cardMinHeight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 8,
      ...(isTablet && {
        marginHorizontal: width * 0.05,
        borderRadius: theme.borderRadius.xl * 2,
        marginBottom: theme.spacing.lg,
      }),
    },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  },
  subtitle: {
    fontSize: isTablet ? theme.typography.fontSize.lg : theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
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
  phoneRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    height: isTablet ? 64 : 56,
  },
  countryPicker: {
    width: isTablet ? 90 : 80,
    height: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  phoneInputContainer: {
    flex: 1,
    height: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  phonePrefix: {
    fontSize: isTablet ? theme.typography.fontSize.lg : theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium as any,
    marginRight: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  },
  phoneInput: {
    flex: 1,
    fontSize: isTablet ? theme.typography.fontSize.lg : theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    height: '100%',
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
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  inputPrefix: {
    fontSize: isTablet ? theme.typography.fontSize.lg : theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginRight: 4,
    fontFamily: theme.typography.fontFamily,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.semibold as any,
    fontSize: isTablet ? theme.typography.fontSize.md : theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold as any,
    fontSize: isTablet ? theme.typography.fontSize.md : theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    height: isTablet ? 64 : 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? theme.typography.fontSize.xl : theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    fontFamily: theme.typography.fontFamily,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: isTablet ? theme.typography.fontSize.md : theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  },
  signupText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold as any,
    fontSize: isTablet ? theme.typography.fontSize.md : theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  },
  branding: {
    alignItems: 'center',
  },
  brandingText: {
    color: theme.colors.text.secondary,
    fontSize: isTablet ? theme.typography.fontSize.sm : theme.typography.fontSize.xs,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily,
  },
  brandingLogo: {
    color: theme.colors.text.secondary,
    fontSize: isTablet ? theme.typography.fontSize.lg : theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeights.bold as any,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily,
  },
  // Error states
  inputError: {
    // Container style for error state
  },
  inputErrorBorder: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
  },
  fieldErrorText: {
    color: theme.colors.error,
    fontSize: isTablet ? theme.typography.fontSize.sm : theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  },
});
};
