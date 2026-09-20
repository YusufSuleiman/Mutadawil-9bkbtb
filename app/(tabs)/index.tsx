import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppHeader, Card, CompositionBar, EmptyState, Screen, StatCard, TransactionRow } from '@/components';
import { useSettings } from '@/hooks/useSettings';
import { useTransactions } from '@/hooks/useTransactions';
import { useFormat } from '@/hooks/useFormat';
import { font, radius, spacing, weight } from '@/constants/theme';

export default function DashboardScreen() {
  const { palette, isRTL, t } = useSettings();
  const { transactions, ledger } = useTransactions();
  const { money, number } = useFormat();
  const router = useRouter();

  const s = ledger.summary;
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Screen>
      <AppHeader
        title={t('appName')}
        subtitle={t('appTagline')}
        rightSlot={
          <Pressable
            onPress={() => router.push('/transaction/new')}
            hitSlop={12}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: palette.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="plus" size={20} color={palette.onPrimary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Card style={{ padding: spacing.lg, backgroundColor: palette.bgElevated }} elevated>
          <Text
            style={{
              color: palette.textSubtle,
              fontSize: font.caption,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('metricWallet')}
          </Text>
          <Text
            style={{
              color: palette.text,
              fontSize: 34,
              fontWeight: weight.bold,
              textAlign: isRTL ? 'right' : 'left',
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {money(s.wallet.cash)}
          </Text>
          <View
            style={[
              styles.heroRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: spacing.sm },
            ]}
          >
            <HeroChip
              icon="trending-up"
              label={t('metricRealized')}
              value={money(s.realizedProfit)}
              tone={s.realizedProfit >= 0 ? palette.gain : palette.loss}
              soft={s.realizedProfit >= 0 ? palette.gainSoft : palette.lossSoft}
            />
            <HeroChip
              icon="chart-line-variant"
              label={t('metricUnrealized')}
              value={money(s.unrealizedProfit)}
              tone={s.unrealizedProfit >= 0 ? palette.gain : palette.loss}
              soft={s.unrealizedProfit >= 0 ? palette.gainSoft : palette.lossSoft}
            />
          </View>
        </Card>

        {/* Composition */}
        <CompositionBar cash={s.wallet.cash} invested={s.totalInvestedActive} />

        {/* Metrics grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatCard
              label={t('metricTotalCapital')}
              value={money(s.grossCapital)}
              hint={t('metricTotalCapitalHint')}
              icon="wallet-plus-outline"
              tone="gold"
            />
          </View>
          <View style={styles.gridItem}>
            <StatCard
              label={t('metricNetCapital')}
              value={money(s.netCapital)}
              hint={t('metricNetCapitalHint')}
              icon="cash-multiple"
              tone="primary"
            />
          </View>
          <View style={styles.gridItem}>
            <StatCard
              label={t('metricCommission')}
              value={money(s.totalCommission)}
              hint={t('metricCommissionHint')}
              icon="receipt-text-outline"
              tone="loss"
              secondary={[
                { label: t('metricCommissionBuy'), value: money(s.totalCommissionBuy) },
                { label: t('metricCommissionSell'), value: money(s.totalCommissionSell) },
              ]}
            />
          </View>
          <View style={styles.gridItem}>
            <StatCard
              label={t('metricSymbols')}
              value={`${s.activeSymbols}`}
              hint={t('metricSymbolsHint')}
              icon="finance"
              tone="info"
              secondary={[
                { label: t('metricSharesOwned'), value: number(s.totalSharesOwned, 2) },
              ]}
            />
          </View>
        </View>

        {/* Wallet composition */}
        <Card>
          <Text
            style={{
              color: palette.textMuted,
              fontSize: font.caption,
              fontWeight: weight.semibold,
              textAlign: isRTL ? 'right' : 'left',
              marginBottom: spacing.xs,
            }}
          >
            {t('walletAvailable')}
          </Text>
          <View
            style={[
              styles.walletRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <MiniLine
              label={t('walletCapitalPortion')}
              value={money(s.wallet.capitalPortion)}
              color={palette.gold}
              palette={palette}
              isRTL={isRTL}
            />
            <MiniLine
              label={t('walletProfitPortion')}
              value={money(s.wallet.profitPortion)}
              color={palette.gain}
              palette={palette}
              isRTL={isRTL}
            />
          </View>
        </Card>

        {/* Recent transactions */}
        <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={{ color: palette.text, fontSize: font.h3, fontWeight: weight.bold }}>
            {t('recentActivity')}
          </Text>
          {transactions.length > 0 ? (
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={{ color: palette.primary, fontSize: font.caption, fontWeight: weight.semibold }}>
                {t('viewAll')}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {recent.length === 0 ? (
          <EmptyState
            icon="chart-timeline-variant"
            title={t('emptyTransactions')}
            subtitle={t('emptyTransactionsHint')}
          />
        ) : (
          <View style={{ gap: spacing.xs }}>
            {recent.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function HeroChip({
  icon,
  label,
  value,
  tone,
  soft,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  tone: string;
  soft: string;
}) {
  const { palette, isRTL } = useSettings();
  return (
    <View
      style={{
        flex: 1,
        padding: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: soft,
        gap: 4,
      }}
    >
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
        <MaterialCommunityIcons name={icon} size={14} color={tone} />
        <Text style={{ color: palette.textMuted, fontSize: font.micro }} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text
        style={{ color: tone, fontSize: font.body, fontWeight: weight.bold, textAlign: isRTL ? 'right' : 'left' }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function MiniLine({
  label,
  value,
  color,
  palette,
  isRTL,
}: {
  label: string;
  value: string;
  color: string;
  palette: any;
  isRTL: boolean;
}) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ color: palette.textSubtle, fontSize: font.micro }} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text
        style={{
          color: palette.text,
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: '48.5%',
    flexGrow: 1,
  },
  walletRow: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
