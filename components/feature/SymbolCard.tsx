import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SymbolPosition } from '@/services/types';
import { useSettings } from '@/hooks/useSettings';
import { useFormat } from '@/hooks/useFormat';
import { font, radius, spacing, weight } from '@/constants/theme';

interface Props {
  position: SymbolPosition;
  onPress?: () => void;
}

export function SymbolCard({ position, onPress }: Props) {
  const { palette, isRTL, t } = useSettings();
  const { money, number } = useFormat();
  const isOpen = position.sharesHeld > 0;
  const realized = position.realizedPL;
  const tone =
    realized > 0 ? palette.gain : realized < 0 ? palette.loss : palette.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.headerRow,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.symbol,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={1}
          >
            {position.symbol}
          </Text>
          <Text
            style={[
              styles.company,
              { color: palette.textSubtle, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={1}
          >
            {position.company || position.symbol}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isOpen ? palette.primarySoft : palette.surfaceAlt,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={isOpen ? 'trending-up' : 'check-circle-outline'}
            size={14}
            color={isOpen ? palette.primary : palette.textSubtle}
          />
          <Text
            style={{
              color: isOpen ? palette.primary : palette.textSubtle,
              fontSize: font.micro,
              fontWeight: weight.semibold,
            }}
          >
            {isOpen ? t('positionOpen') : t('positionClosed')}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.metricsGrid,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <Metric label={t('heldShares')} value={number(position.sharesHeld, 2)} palette={palette} isRTL={isRTL} />
        <Metric label={t('avgCost')} value={money(position.avgCost)} palette={palette} isRTL={isRTL} />
        <Metric
          label={t('realizedPL')}
          value={money(realized)}
          color={tone}
          palette={palette}
          isRTL={isRTL}
        />
      </View>
    </Pressable>
  );
}

function Metric({
  label,
  value,
  palette,
  isRTL,
  color,
}: {
  label: string;
  value: string;
  palette: any;
  isRTL: boolean;
  color?: string;
}) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text
        style={{
          color: palette.textSubtle,
          fontSize: font.micro,
          textAlign: isRTL ? 'right' : 'left',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={{
          color: color ?? palette.text,
          fontSize: font.body,
          fontWeight: weight.bold,
          textAlign: isRTL ? 'right' : 'left',
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  headerRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  symbol: {
    fontSize: font.h3,
    fontWeight: weight.bold,
  },
  company: {
    fontSize: font.micro,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metricsGrid: {
    gap: spacing.sm,
  },
});
