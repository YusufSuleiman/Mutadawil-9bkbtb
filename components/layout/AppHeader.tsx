import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from '@/hooks/useSettings';
import { font, spacing, weight } from '@/constants/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: ReactNode;
}

export function AppHeader({ title, subtitle, showBack, rightSlot }: AppHeaderProps) {
  const { palette, isRTL } = useSettings();
  const router = useRouter();

  return (
    <View
      style={[
        styles.wrap,
        {
          borderBottomColor: palette.divider,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.iconBtn,
            { opacity: pressed ? 0.6 : 1, backgroundColor: palette.surfaceAlt },
          ]}
        >
          <MaterialCommunityIcons
            name={isRTL ? 'chevron-right' : 'chevron-left'}
            size={24}
            color={palette.text}
          />
        </Pressable>
      ) : (
        <View style={{ width: 4 }} />
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.title,
            { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              { color: palette.textSubtle, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: font.h3,
    fontWeight: weight.bold,
  },
  subtitle: {
    fontSize: font.caption,
    marginTop: 2,
  },
});
