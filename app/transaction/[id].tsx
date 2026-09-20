import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppHeader, Card, Screen } from '@/components';
import { useSettings } from '@/hooks/useSettings';
import { useTransactions } from '@/hooks/useTransactions';
import { useFormat } from '@/hooks/useFormat';
import { useAlert } from '@/template';
import { font, radius, spacing, weight } from '@/constants/theme';
import TransactionForm from './_form';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { palette, isRTL, t } = useSettings();
  const { transactions, ledger, deleteTransaction } = useTransactions();
  const { money, number, date } = useFormat();
  const { showAlert } = useAlert();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const tx = transactions.find((x) => x.id === id);
  if (!tx) {
    return (
      <Screen>
        <AppHeader title={t('detailTitle')} showBack />
        <View style={{ padding: spacing.md }}>
          <Text style={{ color: palette.textMuted }}>—</Text>
        </View>
      </Screen>
    );
  }

  if (editing) {
    return <TransactionForm existing={tx} />;
  }

  const meta = ledger.meta[tx.id];
  const isBuy = tx.type === 'buy';
  const tone = isBuy ? palette.buy : palette.sell;
  const toneSoft = isBuy ? palette.gainSoft : palette.lossSoft;

  const onDelete = () => {
    showAlert(t('confirmDeleteTitle'), t('confirmDeleteMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(tx.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppHeader title={t('detailTitle')} showBack />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Card style={{ backgroundColor: palette.bgElevated }} elevated>
          <View style={[styles.heroRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: toneSoft },
              ]}
            >
              <MaterialCommunityIcons
                name={isBuy ? 'arrow-bottom-left-thick' : 'arrow-top-right-thick'}
                size={22}
                color={tone}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: palette.text,
                  fontSize: font.h2,
                  fontWeight: weight.bold,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {tx.symbol}
              </Text>
              <Text
                style={{
                  color: palette.textSubtle,
                  fontSize: font.caption,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {tx.company || tx.symbol}
              </Text>
            </View>
            <Text
              style={{
                color: tone,
                fontSize: font.h3,
                fontWeight: weight.bold,
              }}
            >
              {isBuy ? '-' : '+'} {money(tx.totalAmount)}
            </Text>
          </View>
          <Text
            style={{
              color: palette.textSubtle,
              fontSize: font.caption,
              marginTop: spacing.xs,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {date(tx.date)}
          </Text>
        </Card>

        {/* Breakdown */}
        <Card>
          <Row label={t('fieldPrice')} value={money(tx.price)} palette={palette} isRTL={isRTL} />
          <Row label={t('detailComputedShares')} value={`${number(tx.shares, 4)}`} palette={palette} isRTL={isRTL} />
          <Row label={t('fieldCommission')} value={money(tx.commission)} palette={palette} isRTL={isRTL} />
          <Row
            label={t('detailNet')}
            value={money(isBuy ? tx.totalAmount - tx.commission : tx.totalAmount)}
            palette={palette}
            isRTL={isRTL}
          />
          {isBuy ? (
            <>
              <Divider palette={palette} />
              <Text
                style={{
                  color: palette.textMuted,
                  fontSize: font.caption,
                  fontWeight: weight.semibold,
                  marginBottom: spacing.xs,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('fundingBreakdown')}
              </Text>
              <Row label={t('fieldNewCapital')} value={money(tx.newCapital)} palette={palette} isRTL={isRTL} />
              <Row
                label={t('fieldFromWallet')}
                value={money(Math.max(0, tx.totalAmount - tx.newCapital))}
                palette={palette}
                isRTL={isRTL}
              />
              {meta ? (
                <>
                  <Row
                    label={t('fundingCapitalPart')}
                    value={money(meta.capitalPortion)}
                    palette={palette}
                    isRTL={isRTL}
                    color={palette.gold}
                  />
                  <Row
                    label={t('fundingProfitPart')}
                    value={money(meta.profitPortion)}
                    palette={palette}
                    isRTL={isRTL}
                    color={palette.gain}
                  />
                </>
              ) : null}
            </>
          ) : meta ? (
            <>
              <Divider palette={palette} />
              <Row
                label={t('realizedPL')}
                value={money(meta.realizedPL ?? 0)}
                palette={palette}
                isRTL={isRTL}
                color={(meta.realizedPL ?? 0) >= 0 ? palette.gain : palette.loss}
              />
              <Row
                label={t('avgCost')}
                value={money(meta.avgCostAtTime ?? 0)}
                palette={palette}
                isRTL={isRTL}
              />
            </>
          ) : null}
        </Card>

        {tx.notes ? (
          <Card>
            <Text
              style={{
                color: palette.textMuted,
                fontSize: font.caption,
                fontWeight: weight.semibold,
                marginBottom: 4,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('fieldNotes')}
            </Text>
            <Text
              style={{
                color: palette.text,
                fontSize: font.body,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {tx.notes}
            </Text>
          </Card>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          <AppButton label={t('edit')} icon="pencil-outline" onPress={() => setEditing(true)} variant="muted" />
          <AppButton label={t('delete')} icon="delete-outline" onPress={onDelete} variant="danger" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({
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
    <View
      style={[
        styles.row,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
      ]}
    >
      <Text style={{ color: palette.textSubtle, fontSize: font.caption }}>{label}</Text>
      <Text style={{ color: color ?? palette.text, fontSize: font.body, fontWeight: weight.semibold }}>
        {value}
      </Text>
    </View>
  );
}

function Divider({ palette }: { palette: any }) {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: palette.divider,
        marginVertical: spacing.sm,
      }}
    />
  );
}

const styles = StyleSheet.create({
  heroRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
});
