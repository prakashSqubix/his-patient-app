import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { ThemeDemoScreen } from '../screens/ThemeDemoScreen';
import TenantSelectionScreen from '../screens/auth/TenantSelectionScreen';
import { useAuth } from '../contexts/AuthContext';
import { useReduxAuth } from '../hooks/useReduxAuth';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
    const { session, loading: contextLoading } = useAuth(); // Keep for backward compatibility
    const reduxAuth = useReduxAuth();

    // Use Redux auth state as primary, fallback to context
    const isAuthenticated = reduxAuth.isAuthenticated || !!session;
    const loading = reduxAuth.isLoading || contextLoading;

    console.log('AppNavigator - Auth State:', {
        reduxAuthenticated: reduxAuth.isAuthenticated,
        reduxUser: !!reduxAuth.user,
        reduxToken: !!reduxAuth.accessToken,
        contextSession: !!session,
        isAuthenticated,
        loading,
    });

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen name="TenantSwitch" component={TenantSelectionScreen} />
                    </>
                )}
                <Stack.Screen name="ThemeDemo" component={ThemeDemoScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
