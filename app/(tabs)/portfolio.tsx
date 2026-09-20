import React, { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader, EmptyState, Screen, SymbolCard } from '@/components';
import { useSettings } from '@/hooks/useSettings';
import { useTransactions } from '@/hooks/useTransactions';
import { spacing } from '@/constants/theme';

export default function PortfolioScreen() {
  const { t } = useSettings();
  const { ledger } = useTransactions();
  const router = useRouter();

  const positions = useMemo(() => {
    return Object.values(ledger.positions).sort((a, b) => {
      // Open positions first, then by absolute realized P&L
      if (a.sharesHeld > 0 && b.sharesHeld <= 0) return -1;
      if (b.sharesHeld > 0 && a.sharesHeld <= 0) return 1;
      return Math.abs(b.realizedPL) - Math.abs(a.realizedPL);
    });
  }, [ledger.positions]);

  return (
    <Screen>
      <AppHeader title={t('portfolioTitle')} />
      {positions.length === 0 ? (
        <EmptyState icon="chart-donut" title={t('portfolioEmpty')} />
      ) : (
        <FlatList
          data={positions}
          keyExtractor={(p) => p.symbol}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxxl }}
          renderItem={({ item }) => (
            <SymbolCard
              position={item}
              onPress={() =>
                router.push({ pathname: '/symbol/[symbol]', params: { symbol: item.symbol } })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        />
      )}
    </Screen>
  );
}
