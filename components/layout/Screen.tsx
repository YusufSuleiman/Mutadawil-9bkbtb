import React, { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/hooks/useSettings';

interface ScreenProps {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  const { palette } = useSettings();
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: palette.bg }, style]}
    >
      <StatusBar style={palette.mode === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
