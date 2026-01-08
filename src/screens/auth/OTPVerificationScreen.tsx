import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Theme } from '@/types/theme';
import { ArrowLeft } from 'lucide-react-native';
import { useSignupMutation, useVerifyOtpMutation } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

interface RouteParams {
    phoneNumber: string;
    isSignup?: boolean;
    otp?: string;
}

export default function OTPVerificationScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { theme } = useTheme();
    const { signIn } = useAuth();
    const signupMutation = useSignupMutation();
    const verifyOtpMutation = useVerifyOtpMutation();

    const params = route.params as RouteParams;
    const phoneNumber = params?.phoneNumber || '';
    const isSignup = params?.isSignup || false;
    const receivedOtp = params?.otp || '';

    // OTP state - 6 separate digits
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // Loading state from mutations
    const loading = verifyOtpMutation.isPending;

    // Refs for each input
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const styles = getStyles(theme);

    // Countdown timer effect
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Auto-fill OTP effect
    useEffect(() => {
        if (receivedOtp && receivedOtp.length === 6) {
            console.log('Auto-filling OTP:', receivedOtp);
            const otpArray = receivedOtp.split('');
            setOtp(otpArray);
            // Auto-verify after a short delay to show the filled OTP
            setTimeout(() => {
                handleVerify(receivedOtp);
            }, 500);
        }
    }, [receivedOtp]);

    const handleOtpChange = (value: string, index: number) => {
        // Only allow single digit
        const digit = value.replace(/[^0-9]/g, '').slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Clear error when user types
        if (error) {
            setError('');
        }

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits entered
        if (index === 5 && digit) {
            const fullOtp = [...newOtp.slice(0, 5), digit].join('');
            if (fullOtp.length === 6) {
                handleVerify(fullOtp);
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (otpCode?: string) => {
        const otpToVerify = otpCode || otp.join('');

        if (otpToVerify.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setError('');

        try {
            console.log('Verifying OTP:', { phone: phoneNumber, otp: otpToVerify });
            
            // Call the OTP verification API
            const response = await verifyOtpMutation.mutateAsync({
                phone: phoneNumber,
                otp: otpToVerify,
            });

            console.log('OTP Verification Response:', response);

            // Check if verification was successful based on statusCode
            if (response.statusCode === 200) {
                if (isSignup) {
                    // For signup flow, navigate to password setup after OTP verification
                    navigation.navigate('SetPassword', {
                        phoneNumber: phoneNumber,
                        otpVerified: true,
                    });
                } else {
                    // For login flow, sign in the user
                    await signIn(phoneNumber, otpToVerify);
                }
            } else {
                // Handle different error status codes
                let errorMessage = response.message || 'OTP verification failed. Please try again.';
                
                switch (response.statusCode) {
                    case 400:
                        errorMessage = 'Invalid OTP format. Please check and try again.';
                        break;
                    case 401:
                        errorMessage = 'Invalid or expired OTP. Please try again.';
                        break;
                    case 429:
                        errorMessage = 'Too many attempts. Please wait before trying again.';
                        break;
                    default:
                        errorMessage = response.message || 'OTP verification failed. Please try again.';
                }
                
                setError(errorMessage);
            }
        } catch (err: any) {
            console.error('OTP Verification Error:', err);
            setError(err.message || 'Invalid OTP. Please try again.');
        }
    };

    const handleResend = async () => {
        if (!canResend || signupMutation.isPending) return;

        setCanResend(false);
        setResendTimer(30);
        setError('');

        try {
            console.log('Resending OTP for phone:', phoneNumber);
            const response = await signupMutation.mutateAsync({
                phone: phoneNumber,
            });

            console.log('Resend OTP Response:', response);

            // Check if resend was successful
            if (response.statusCode === 200) {
                // Auto-fill the new OTP
                if (response.data.otp && response.data.otp.length === 6) {
                    const otpArray = response.data.otp.split('');
                    setOtp(otpArray);
                    console.log('Auto-filled new OTP:', response.data.otp);
                }
            } else {
                setError(response.message || 'Failed to resend OTP. Please try again.');
                // Reset timer on error so user can try again
                setCanResend(true);
                setResendTimer(0);
            }
        } catch (err: any) {
            console.error('Resend OTP Error:', err);
            setError(err.message || 'Failed to resend OTP. Please try again.');
            // Reset timer on error so user can try again
            setCanResend(true);
            setResendTimer(0);
        }
    };

    const handleEdit = () => {
        navigation.goBack();
    };

    const handleBackToLogin = () => {
        if (isSignup) {
            navigation.navigate('Signup');
        } else {
            navigation.navigate('Login');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <ArrowLeft size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>OTP Verification</Text>
                    <View style={styles.subtitleContainer}>
                        <Text style={styles.subtitle}>we have sent a 6 digit OTP to</Text>
                    </View>
                    <View style={styles.phoneContainer}>
                        <Text style={styles.phoneNumber}>+91-{phoneNumber}</Text>
                        <TouchableOpacity onPress={handleEdit} disabled={loading}>
                            <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* OTP Input Boxes */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[
                                styles.otpInput,
                                digit ? styles.otpInputFilled : null,
                                error ? styles.otpInputError : null,
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            editable={!loading}
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                {/* Error Message */}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Resend Section */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive the OTP? </Text>
                    {canResend ? (
                        <TouchableOpacity onPress={handleResend} disabled={loading || signupMutation.isPending}>
                            <Text style={styles.resendLink}>
                                {signupMutation.isPending ? 'Sending...' : 'Resend SMS'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.resendTimer}>Resend SMS in {resendTimer}s</Text>
                    )}
                </View>

                {/* Back to Login Link */}
                <TouchableOpacity
                    onPress={handleBackToLogin}
                    style={styles.backToLoginContainer}
                    disabled={loading}
                >
                    <Text style={styles.backToLoginText}>
                        {isSignup ? 'Go back to signup' : 'Go back to login methods'}
                    </Text>
                </TouchableOpacity>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[
                        styles.verifyButton,
                        loading && styles.verifyButtonDisabled,
                    ]}
                    onPress={() => handleVerify()}
                    disabled={loading || otp.join('').length !== 6}
                >
                    <Text style={styles.verifyButtonText}>
                        {loading ? 'Verifying...' : 'Verify'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    header: {
        marginBottom: theme.spacing.xxl,
    },
    title: {
        fontSize: 28,
        fontWeight: theme.typography.fontWeights.bold as any,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        fontFamily: theme.typography.fontFamily,
    },
    subtitleContainer: {
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fontFamily,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    phoneNumber: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeights.semibold as any,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily,
    },
    editLink: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeights.semibold as any,
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fontFamily,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    otpInput: {
        flex: 1,
        height: 56,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.lg,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: theme.typography.fontWeights.semibold as any,
        color: theme.colors.text.primary,
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily,
    },
    otpInputFilled: {
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
    },
    otpInputError: {
        borderColor: theme.colors.error,
        borderWidth: 1.5,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: theme.typography.fontSize.sm,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
        fontFamily: theme.typography.fontFamily,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    resendText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fontFamily,
    },
    resendLink: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeights.semibold as any,
        fontFamily: theme.typography.fontFamily,
    },
    resendTimer: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fontFamily,
    },
    backToLoginContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    backToLoginText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeights.semibold as any,
        fontFamily: theme.typography.fontFamily,
    },
    verifyButton: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    verifyButtonDisabled: {
        opacity: 0.6,
    },
    verifyButtonText: {
        color: theme.colors.text.white,
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeights.bold as any,
        fontFamily: theme.typography.fontFamily,
    },
});
