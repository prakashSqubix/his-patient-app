import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppNavigator } from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { queryClient } from './lib/queryClient';
import { store, persistor } from './store';
import { View, Text, ActivityIndicator } from 'react-native';

// Loading component for PersistGate
const LoadingComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Loading...</Text>
  </View>
);

export default function App() {
    return (
        <SafeAreaProvider>
            <Provider store={store}>
                <PersistGate loading={<LoadingComponent />} persistor={persistor}>
                    <QueryClientProvider client={queryClient}>
                        <AuthProvider>
                            <ThemeProvider>
                                <AppNavigator />
                            </ThemeProvider>
                        </AuthProvider>
                    </QueryClientProvider>
                </PersistGate>
            </Provider>
        </SafeAreaProvider>
    );
}
