import React, { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '@/hooks/useSettings';
import { font, radius, spacing, weight } from '@/constants/theme';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'muted';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  fullWidth = true,
  compact = false,
  rightIcon,
}: AppButtonProps) {
  const { palette, isRTL } = useSettings();
  const isDisabled = disabled || loading;

  const bg = (() => {
    switch (variant) {
      case 'primary':
        return palette.primary;
      case 'danger':
        return palette.loss;
      case 'muted':
        return palette.surfaceAlt;
      case 'ghost':
        return 'transparent';
    }
  })();
  const color = (() => {
    switch (variant) {
      case 'primary':
        return palette.onPrimary;
      case 'danger':
        return '#FFFFFF';
      case 'muted':
      case 'ghost':
        return palette.text;
    }
  })();
  const borderColor = variant === 'ghost' ? palette.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
          transform: pressed ? [{ scale: 0.98 }] : undefined,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingVertical: compact ? spacing.xs : spacing.sm,
          paddingHorizontal: compact ? spacing.md : spacing.lg,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={[styles.content, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {icon ? (
            <MaterialCommunityIcons name={icon} size={compact ? 16 : 18} color={color} />
          ) : null}
          <Text style={[styles.label, { color, fontSize: compact ? font.caption : font.body }]}>
            {label}
          </Text>
          {rightIcon ? (
            <MaterialCommunityIcons name={rightIcon} size={compact ? 16 : 18} color={color} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 44,
  },
  content: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontWeight: weight.semibold,
  },
});
