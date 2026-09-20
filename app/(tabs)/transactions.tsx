import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppHeader, EmptyState, Screen, Segmented, TransactionRow } from '@/components';
import { useSettings } from '@/hooks/useSettings';
import { useTransactions } from '@/hooks/useTransactions';
import { font, radius, spacing, weight } from '@/constants/theme';

type Filter = 'all' | 'buy' | 'sell';

export default function TransactionsScreen() {
  const { palette, isRTL, t } = useSettings();
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const router = useRouter();

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((tx) => (filter === 'all' ? true : tx.type === filter))
      .filter((tx) =>
        q.trim() === '' ? true : tx.symbol.toLowerCase().includes(q.trim().toLowerCase()),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, q]);

  return (
    <Screen>
      <AppHeader
        title={t('transactionsTitle')}
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

      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <MaterialCommunityIcons name="magnify" size={18} color={palette.textSubtle} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('searchSymbol')}
            placeholderTextColor={palette.textSubtle}
            autoCapitalize="characters"
            autoCorrect={false}
            style={{
              flex: 1,
              color: palette.text,
              fontSize: font.body,
              paddingVertical: 8,
              textAlign: isRTL ? 'right' : 'left',
              includeFontPadding: false,
            }}
          />
        </View>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('filterAll'), tone: 'neutral' },
            { value: 'buy', label: t('filterBuy'), tone: 'gain' },
            { value: 'sell', label: t('filterSell'), tone: 'loss' },
          ]}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="swap-horizontal"
          title={t('emptyTransactions')}
          subtitle={t('emptyTransactionsHint')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(tx) => tx.id}
          contentContainerStyle={{ padding: spacing.md, paddingTop: 0, gap: spacing.xs, paddingBottom: spacing.xxxl }}
          renderItem={({ item }) => (
            <TransactionRow
              tx={item}
              onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}
    </Screen>
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
  searchWrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
});
