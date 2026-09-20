import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '@/hooks/useSettings';
import { font, radius, spacing, weight } from '@/constants/theme';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  tone?: 'primary' | 'gain' | 'loss' | 'neutral';
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  const { palette, isRTL } = useSettings();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: palette.surfaceAlt,
          borderColor: palette.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        const activeBg = (() => {
          if (!active) return 'transparent';
          switch (opt.tone) {
            case 'gain':
              return palette.gain;
            case 'loss':
              return palette.loss;
            case 'neutral':
              return palette.surface;
            default:
              return palette.primary;
          }
        })();
        const activeColor = active
          ? opt.tone === 'neutral'
            ? palette.text
            : palette.onPrimary
          : palette.textMuted;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: activeBg,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.label, { color: activeColor }]} numberOfLines={1}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 4,
  },
  item: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  label: {
    fontSize: font.caption,
    fontWeight: weight.semibold,
  },
});
