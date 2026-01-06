import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import TenantSelectionScreen from '../screens/auth/TenantSelectionScreen';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="TenantSelection" component={TenantSelectionScreen} />
        </Stack.Navigator>
    );
}
