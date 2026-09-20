import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSettings } from '@/hooks/useSettings';
import { radius, shadows, spacing } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ children, style, padded = true, elevated = false }: CardProps) {
  const { palette } = useSettings();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? palette.bgElevated : palette.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: palette.border,
          padding: padded ? spacing.md : 0,
          ...(elevated ? shadows(palette).card : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
