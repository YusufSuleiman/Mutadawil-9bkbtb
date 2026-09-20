import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '@/hooks/useSettings';
import { font, radius, spacing, weight } from '@/constants/theme';

interface Props {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'inbox-outline', title, subtitle }: Props) {
  const { palette } = useSettings();
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={36} color={palette.textMuted} />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sub, { color: palette.textSubtle }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: font.h3,
    fontWeight: weight.bold,
    textAlign: 'center',
  },
  sub: {
    fontSize: font.caption,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
