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
import { ChevronLeft } from 'lucide-react-native';
import { useSignupMutation } from '@/hooks/useAuth';

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

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const signupMutation = useSignupMutation();

  const phoneInputRef = useRef<TextInput>(null);
  const [screenData, setScreenData] = useState(getScreenDimensions());

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const styles = getStyles(theme, screenData);
  const loading = signupMutation.isPending;

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

  // Validate phone number (Indian format: 10 digits)
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
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

  const handleSendOTP = async () => {
    // Reset errors
    setError('');
    setPhoneError('');

    // Validate phone number
    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const response = await signupMutation.mutateAsync({
        phone: phoneNumber,
      });

      console.log('Signup API Response:', response);

      // Check if signup was successful based on statusCode
      if (response.statusCode === 200) {
        // Navigate to OTP verification screen with the received OTP for auto-fill
        navigation.navigate('OTPVerification', {
          phoneNumber: phoneNumber,
          otp: response.data.otp, // Pass the OTP from data object for auto-fill
          isSignup: true,
        });
      } else {
        // Handle different error status codes
        let errorMessage = response.message || 'Failed to send OTP. Please try again.';
        
        switch (response.statusCode) {
          case 400:
            errorMessage = 'Invalid phone number format. Please check and try again.';
            break;
          case 409:
            errorMessage = 'Phone number already registered. Please try logging in.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait before trying again.';
            break;
          default:
            errorMessage = response.message || 'Failed to send OTP. Please try again.';
        }
        
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Signup API Error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
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

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
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
          <View style={styles.card}>
            {/* Handle/Sheet Indicator */}
            <View style={styles.handleBar} />

            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.subtitle}>We'll send a OTP to verify your number</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.form}>
              {/* Phone Input Row */}
              <View>
                <View style={[
                  styles.phoneRow,
                  phoneError ? styles.inputError : null
                ]}>
                  {/* Country Code Picker Visual */}
                  <TouchableOpacity style={[
                    styles.countryPicker,
                    phoneError ? styles.inputErrorBorder : null
                  ]}>
                    <IndiaFlag />
                  </TouchableOpacity>

                  {/* Phone Number Input */}
                  <View style={[
                    styles.phoneInputContainer,
                    phoneError ? styles.inputErrorBorder : null
                  ]}>
                    <Text style={styles.phonePrefix}>+91</Text>
                    <TextInput
                      ref={phoneInputRef}
                      style={styles.phoneInput}
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      placeholder="Mobile Number"
                      placeholderTextColor={theme.colors.text.hint}
                      maxLength={10}
                      editable={!loading}
                      returnKeyType="go"
                      onSubmitEditing={handleSendOTP}
                    />
                  </View>
                </View>
                {phoneError ? <Text style={styles.fieldErrorText}>{phoneError}</Text> : null}
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity
                style={styles.sendOTPButton}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.sendOTPButtonText}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginText}>Log In</Text>
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
    backButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 30,
      left: theme.spacing.lg,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
      marginBottom: theme.spacing.xl,
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
    sendOTPButton: {
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
    sendOTPButtonText: {
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
    loginText: {
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
