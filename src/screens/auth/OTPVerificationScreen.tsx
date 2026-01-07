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

const { width } = Dimensions.get('window');

interface RouteParams {
    phoneNumber: string;
}

export default function OTPVerificationScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { theme } = useTheme();
    const { signIn } = useAuth();

    const params = route.params as RouteParams;
    const phoneNumber = params?.phoneNumber || '';

    // OTP state - 6 separate digits
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

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
        setLoading(true);

        try {
            // TODO: Replace with actual OTP verification API call
            // Verify OTP with backend first
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // After successful OTP verification, sign in the user
            // The AuthContext will handle navigation to home automatically
            await signIn(phoneNumber, otpToVerify);

            // Navigation to home is handled by AppNavigator observing auth state
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setCanResend(false);
        setResendTimer(30);
        setError('');

        try {
            // TODO: Replace with actual resend OTP API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            // Show success feedback
        } catch (err: any) {
            setError('Failed to resend OTP. Please try again.');
        }
    };

    const handleEdit = () => {
        navigation.goBack();
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
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
                        <TouchableOpacity onPress={handleResend} disabled={loading}>
                            <Text style={styles.resendLink}>Resend SMS</Text>
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
                    <Text style={styles.backToLoginText}>Go back to login methods</Text>
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
