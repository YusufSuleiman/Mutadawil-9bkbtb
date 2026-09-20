import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Transaction } from '@/services/types';
import { useSettings } from '@/hooks/useSettings';
import { useFormat } from '@/hooks/useFormat';
import { font, radius, spacing, weight } from '@/constants/theme';

interface Props {
  tx: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ tx, onPress }: Props) {
  const { palette, isRTL, t } = useSettings();
  const { money, number, date } = useFormat();

  const isBuy = tx.type === 'buy';
  const tone = isBuy ? palette.buy : palette.sell;
  const toneSoft = isBuy ? palette.gainSoft : palette.lossSoft;
  const sign = isBuy ? '-' : '+';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          opacity: pressed ? 0.9 : 1,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: toneSoft }]}>
        <MaterialCommunityIcons
          name={isBuy ? 'arrow-bottom-left-thick' : 'arrow-top-right-thick'}
          size={20}
          color={tone}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text
            style={[styles.symbol, { color: palette.text }]}
            numberOfLines={1}
          >
            {tx.symbol}
          </Text>
          <Text
            style={[styles.badge, { color: tone, backgroundColor: toneSoft }]}
          >
            {isBuy ? t('typeBuy') : t('typeSell')}
          </Text>
        </View>
        <Text
          style={[styles.company, { color: palette.textSubtle, textAlign: isRTL ? 'right' : 'left' }]}
          numberOfLines={1}
        >
          {tx.company || tx.symbol} · {date(tx.date)}
        </Text>
      </View>
      <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
        <Text style={{ color: tone, fontSize: font.body, fontWeight: weight.bold }}>
          {sign} {money(tx.totalAmount)}
        </Text>
        <Text style={{ color: palette.textSubtle, fontSize: font.micro, marginTop: 2 }}>
          {number(tx.shares, 2)} × {money(tx.price)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: font.h4,
    fontWeight: weight.bold,
  },
  badge: {
    fontSize: font.micro,
    fontWeight: weight.semibold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  company: {
    fontSize: font.micro,
  },
});
