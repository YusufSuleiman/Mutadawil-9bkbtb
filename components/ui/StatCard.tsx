import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { useSettings } from '@/hooks/useSettings';
import { font, radius, spacing, weight } from '@/constants/theme';

export type StatTone = 'neutral' | 'gain' | 'loss' | 'gold' | 'primary' | 'info';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  tone?: StatTone;
  compact?: boolean;
  secondary?: { label: string; value: string }[];
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  compact,
  secondary,
}: StatCardProps) {
  const { palette, isRTL } = useSettings();

  const toneColor = (() => {
    switch (tone) {
      case 'gain':
        return palette.gain;
      case 'loss':
        return palette.loss;
      case 'gold':
        return palette.gold;
      case 'primary':
        return palette.primary;
      case 'info':
        return palette.info;
      default:
        return palette.text;
    }
  })();
  const toneSoft = (() => {
    switch (tone) {
      case 'gain':
        return palette.gainSoft;
      case 'loss':
        return palette.lossSoft;
      case 'gold':
        return palette.goldSoft;
      case 'primary':
        return palette.primarySoft;
      case 'info':
        return palette.infoSoft;
      default:
        return palette.surfaceAlt;
    }
  })();

  return (
    <Card style={{ padding: compact ? spacing.sm : spacing.md }}>
      <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {icon ? (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: toneSoft },
            ]}
          >
            <MaterialCommunityIcons name={icon} size={18} color={toneColor} />
          </View>
        ) : null}
        <Text
          style={[
            styles.label,
            { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left', flex: 1 },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.value,
          {
            color: toneColor,
            textAlign: isRTL ? 'right' : 'left',
            fontSize: compact ? font.h3 : font.h2,
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {hint ? (
        <Text
          style={[
            styles.hint,
            { color: palette.textSubtle, textAlign: isRTL ? 'right' : 'left' },
          ]}
          numberOfLines={2}
        >
          {hint}
        </Text>
      ) : null}
      {secondary && secondary.length > 0 ? (
        <View style={[styles.secondaryWrap, { borderTopColor: palette.divider }]}>
          {secondary.map((s, idx) => (
            <View
              key={idx}
              style={[
                styles.secondaryRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={{ color: palette.textSubtle, fontSize: font.caption }}>
                {s.label}
              </Text>
              <Text style={{ color: palette.text, fontSize: font.caption, fontWeight: weight.semibold }}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: font.caption,
    fontWeight: weight.medium,
  },
  value: {
    fontWeight: weight.bold,
    marginTop: 2,
  },
  hint: {
    fontSize: font.micro,
    marginTop: spacing.xxs,
  },
  secondaryWrap: {
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    gap: 4,
  },
  secondaryRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
