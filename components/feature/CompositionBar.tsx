import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '@/hooks/useSettings';
import { useFormat } from '@/hooks/useFormat';
import { font, radius, spacing, weight } from '@/constants/theme';

interface Props {
  cash: number;
  invested: number;
}

export function CompositionBar({ cash, invested }: Props) {
  const { palette, isRTL, t } = useSettings();
  const { money } = useFormat();
  const total = Math.max(cash + invested, 0.0001);
  const cashPct = Math.max(0, Math.min(100, (cash / total) * 100));
  const investedPct = 100 - cashPct;

  return (
    <View style={[styles.wrap, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={{ color: palette.textMuted, fontSize: font.caption, fontWeight: weight.semibold }}>
          {t('compositionTitle')}
        </Text>
        <Text style={{ color: palette.text, fontSize: font.caption, fontWeight: weight.bold }}>
          {money(total)}
        </Text>
      </View>
      <View style={[styles.bar, { backgroundColor: palette.surfaceAlt }]}>
        <View style={{ width: `${investedPct}%`, backgroundColor: palette.primary }} />
        <View style={{ width: `${cashPct}%`, backgroundColor: palette.gold }} />
      </View>
      <View style={[styles.legend, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <LegendItem color={palette.primary} label={t('compositionInvested')} value={money(invested)} palette={palette} />
        <LegendItem color={palette.gold} label={t('compositionCash')} value={money(cash)} palette={palette} />
      </View>
    </View>
  );
}

function LegendItem({
  color,
  label,
  value,
  palette,
}: {
  color: string;
  label: string;
  value: string;
  palette: any;
}) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ color: palette.textSubtle, fontSize: font.micro }}>{label}</Text>
      </View>
      <Text style={{ color: palette.text, fontSize: font.body, fontWeight: weight.bold }}>{value}</Text>
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
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bar: {
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  legend: {
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
