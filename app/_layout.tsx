import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AlertProvider } from '@/template';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <SettingsProvider>
          <TransactionsProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="transaction/new"
                  options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                  name="transaction/[id]"
                  options={{ presentation: 'card' }}
                />
                <Stack.Screen
                  name="symbol/[symbol]"
                  options={{ presentation: 'card' }}
                />
              </Stack>
            </GestureHandlerRootView>
          </TransactionsProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
