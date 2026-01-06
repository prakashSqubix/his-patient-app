import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ThemeProvider>
                    <AppNavigator />
                </ThemeProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
