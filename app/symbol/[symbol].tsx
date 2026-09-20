import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppHeader, Card, EmptyState, Screen, StatCard, TransactionRow } from '@/components';
import { useSettings } from '@/hooks/useSettings';
import { useTransactions } from '@/hooks/useTransactions';
import { useFormat } from '@/hooks/useFormat';
import { font, radius, spacing, weight } from '@/constants/theme';

export default function SymbolDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const key = (symbol ?? '').toUpperCase();
  const { palette, isRTL, t } = useSettings();
  const { transactions, ledger } = useTransactions();
  const { money, number } = useFormat();
  const router = useRouter();

  const position = ledger.positions[key];
  const list = useMemo(
    () =>
      transactions
        .filter((tx) => tx.symbol === key)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, key],
  );

  if (!position || list.length === 0) {
    return (
      <Screen>
        <AppHeader title={t('symbolTitle')} showBack />
        <EmptyState icon="chart-donut" title={t('portfolioEmpty')} />
      </Screen>
    );
  }

  const isOpen = position.sharesHeld > 0;
  const totalPL = position.realizedPL + position.unrealizedPL;
  const statusColor =
    totalPL > 0 ? palette.gain : totalPL < 0 ? palette.loss : palette.textMuted;
  const statusLabel =
    totalPL > 0 ? t('profitable') : totalPL < 0 ? t('losing') : t('flat');

  return (
    <Screen>
      <AppHeader title={position.symbol} subtitle={position.company} showBack />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status hero */}
        <Card style={{ backgroundColor: palette.bgElevated }} elevated>
          <View
            style={[
              styles.heroRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    totalPL >= 0 ? palette.gainSoft : palette.lossSoft,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={totalPL >= 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={statusColor}
              />
              <Text style={{ color: statusColor, fontWeight: weight.bold, fontSize: font.caption }}>
                {statusLabel}
              </Text>
            </View>
            <Text style={{ color: palette.textSubtle, fontSize: font.micro }}>
              {isOpen ? t('positionOpen') : t('positionClosed')}
            </Text>
          </View>
          <Text
            style={{
              color: statusColor,
              fontSize: 32,
              fontWeight: weight.bold,
              marginTop: spacing.xs,
              textAlign: isRTL ? 'right' : 'left',
            }}
            numberOfLines={1}
          >
            {money(totalPL)}
          </Text>
          <View
            style={[
              styles.smallRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={{ color: palette.textSubtle, fontSize: font.micro }}>
              {t('realizedPL')}: {money(position.realizedPL)}
            </Text>
            <Text style={{ color: palette.textSubtle, fontSize: font.micro }}>
              {t('unrealizedPL')}: {money(position.unrealizedPL)}
            </Text>
          </View>
        </Card>

        {/* Stats grid */}
        <View style={styles.grid}>
          <View style={styles.item}>
            <StatCard
              label={t('heldShares')}
              value={number(position.sharesHeld, 2)}
              icon="chart-box-outline"
              tone="primary"
            />
          </View>
          <View style={styles.item}>
            <StatCard
              label={t('avgCost')}
              value={money(position.avgCost)}
              icon="scale-balance"
              tone="gold"
            />
          </View>
          <View style={styles.item}>
            <StatCard
              label={t('invested')}
              value={money(position.totalInvested)}
              icon="wallet-outline"
              tone="info"
            />
          </View>
          <View style={styles.item}>
            <StatCard
              label={t('lastPrice')}
              value={money(position.lastPrice)}
              icon="ticket-percent-outline"
              tone="neutral"
            />
          </View>
          <View style={styles.item}>
            <StatCard label={t('totalBuys')} value={`${position.buyCount}`} icon="arrow-down" tone="gain" />
          </View>
          <View style={styles.item}>
            <StatCard label={t('totalSells')} value={`${position.sellCount}`} icon="arrow-up" tone="loss" />
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <AppButton
              label={t('buy')}
              icon="plus"
              onPress={() =>
                router.push({
                  pathname: '/transaction/new',
                  params: { prefillSymbol: position.symbol, prefillType: 'buy' },
                })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              label={t('sell')}
              icon="minus"
              variant="danger"
              onPress={() =>
                router.push({
                  pathname: '/transaction/new',
                  params: { prefillSymbol: position.symbol, prefillType: 'sell' },
                })
              }
            />
          </View>
        </View>

        {/* History */}
        <Text
          style={{
            color: palette.text,
            fontSize: font.h3,
            fontWeight: weight.bold,
            textAlign: isRTL ? 'right' : 'left',
            marginTop: spacing.xs,
          }}
        >
          {t('symbolHistory')}
        </Text>
        <View style={{ gap: spacing.xs }}>
          {list.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  smallRow: {
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '48.5%',
    flexGrow: 1,
  },
});
