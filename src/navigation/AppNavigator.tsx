import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { ThemeDemoScreen } from '../screens/ThemeDemoScreen';
import TenantSelectionScreen from '../screens/auth/TenantSelectionScreen';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
    const { session, loading } = useAuth();

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
                {!session ? (
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
