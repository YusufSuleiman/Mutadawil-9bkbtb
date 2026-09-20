import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, Card, Screen, Segmented } from '@/components';
import { useSettings } from '@/hooks/useSettings';
import { useTransactions } from '@/hooks/useTransactions';
import { useFormat } from '@/hooks/useFormat';
import { useAlert } from '@/template';
import { computeShares, buildLedger } from '@/services/calculations';
import { font, spacing, weight } from '@/constants/theme';
import { Transaction, TransactionType } from '@/services/types';

const todayISO = () => new Date().toISOString().slice(0, 10);

interface Props {
  existing?: Transaction;
}

export default function TransactionForm({ existing }: Props) {
  const { palette, isRTL, t } = useSettings();
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const { money, number } = useFormat();
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useLocalSearchParams<{ prefillSymbol?: string; prefillType?: string }>();

  const [type, setType] = useState<TransactionType>(existing?.type ?? (params.prefillType === 'sell' ? 'sell' : 'buy'));
  const [symbol, setSymbol] = useState<string>(existing?.symbol ?? (params.prefillSymbol as string) ?? '');
  const [company, setCompany] = useState<string>(existing?.company ?? '');
  const [price, setPrice] = useState<string>(existing ? String(existing.price) : '');
  const [commission, setCommission] = useState<string>(existing ? String(existing.commission) : '');
  const [total, setTotal] = useState<string>(existing ? String(existing.totalAmount) : '');
  const [newCapital, setNewCapital] = useState<string>(existing ? String(existing.newCapital) : '');
  const [notes, setNotes] = useState<string>(existing?.notes ?? '');
  const [date, setDate] = useState<string>(existing?.date?.slice(0, 10) ?? todayISO());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const parsedPrice = parseFloat(price) || 0;
  const parsedCommission = parseFloat(commission) || 0;
  const parsedTotal = parseFloat(total) || 0;
  const parsedNewCapital = parseFloat(newCapital) || 0;

  const shares = computeShares(type, parsedPrice, parsedCommission, parsedTotal);
  const fromWallet = type === 'buy' ? Math.max(0, parsedTotal - parsedNewCapital) : 0;

  // Wallet available (excluding current tx if editing)
  const walletBefore = useMemo(() => {
    const list = existing ? transactions.filter((x) => x.id !== existing.id) : transactions;
    return buildLedger(list).summary.wallet;
  }, [transactions, existing]);

  const setAllNew = () => setNewCapital(String(parsedTotal || 0));
  const setAllWallet = () => setNewCapital('0');
  const setAutoSplit = () => {
    if (parsedTotal <= 0) return;
    const walletUsed = Math.min(parsedTotal, walletBefore.cash);
    const fresh = Math.max(0, parsedTotal - walletUsed);
    setNewCapital(String(Math.round(fresh * 100) / 100));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!symbol.trim()) e.symbol = t('errRequired');
    if (!parsedPrice) e.price = t('errPositive');
    if (!parsedTotal) e.total = t('errPositive');
    if (parsedCommission < 0) e.commission = t('errPositive');
    if (type === 'buy') {
      if (parsedNewCapital < 0) e.newCapital = t('errPositive');
      if (parsedNewCapital > parsedTotal) e.newCapital = t('errFundingMismatch');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    const payload: Omit<Transaction, 'id' | 'createdAt'> = {
      type,
      symbol: symbol.toUpperCase().trim(),
      company: company.trim(),
      price: parsedPrice,
      commission: parsedCommission,
      totalAmount: parsedTotal,
      shares,
      newCapital: type === 'buy' ? parsedNewCapital : 0,
      notes: notes.trim() || undefined,
      date: new Date(date).toISOString(),
    };

    let result;
    if (existing) {
      result = await updateTransaction({ ...existing, ...payload });
    } else {
      result = await addTransaction(payload);
    }

    if (!result.ok) {
      const holding = result.currentShares ?? 0;
      showAlert(t('errNoShares'), `${t('errHoldingIs')} ${number(holding, 2)} ${t('shares')}`);
      return;
    }
    router.back();
  };

  return (
    <Screen edges={['top']}>
      <AppHeader
        title={existing ? t('editTransactionTitle') : t('addTransactionTitle')}
        showBack
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.md }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type */}
          <Card>
            <Text
              style={{
                color: palette.textMuted,
                fontSize: font.caption,
                fontWeight: weight.semibold,
                marginBottom: spacing.xs,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('fieldType')}
            </Text>
            <Segmented<TransactionType>
              value={type}
              onChange={setType}
              options={[
                { value: 'buy', label: t('buy'), tone: 'gain' },
                { value: 'sell', label: t('sell'), tone: 'loss' },
              ]}
            />
          </Card>

          {/* Symbol + Company */}
          <Card>
            <View style={{ gap: spacing.sm }}>
              <AppInput
                label={t('fieldSymbol')}
                value={symbol}
                onChangeText={(v) => setSymbol(v.toUpperCase())}
                placeholder={t('fieldSymbolPlaceholder')}
                autoCapitalize="characters"
                error={errors.symbol}
              />
              <AppInput
                label={t('fieldCompany')}
                value={company}
                onChangeText={setCompany}
                placeholder={t('fieldCompanyPlaceholder')}
                autoCapitalize="sentences"
              />
            </View>
          </Card>

          {/* Amounts */}
          <Card>
            <View style={{ gap: spacing.sm }}>
              <AppInput
                label={t('fieldPrice')}
                value={price}
                onChangeText={setPrice}
                placeholder={t('fieldPricePlaceholder')}
                keyboardType="decimal-pad"
                suffix={t('egp')}
                error={errors.price}
              />
              <AppInput
                label={t('fieldTotalPaid')}
                value={total}
                onChangeText={setTotal}
                placeholder={t('fieldTotalPaidPlaceholder')}
                keyboardType="decimal-pad"
                suffix={t('egp')}
                hint={type === 'buy' ? t('fieldTotalPaidHintBuy') : t('fieldTotalPaidHintSell')}
                error={errors.total}
              />
              <AppInput
                label={t('fieldCommission')}
                value={commission}
                onChangeText={setCommission}
                placeholder={t('fieldCommissionPlaceholder')}
                keyboardType="decimal-pad"
                suffix={t('egp')}
                error={errors.commission}
              />
              <View
                style={[
                  styles.summaryRow,
                  {
                    backgroundColor: palette.surfaceAlt,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Text style={{ color: palette.textMuted, fontSize: font.caption }}>
                  {t('fieldSharesAuto')}
                </Text>
                <Text style={{ color: palette.text, fontSize: font.h4, fontWeight: weight.bold }}>
                  {number(shares, 4)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Funding (buy only) */}
          {type === 'buy' ? (
            <Card>
              <Text
                style={{
                  color: palette.textMuted,
                  fontSize: font.caption,
                  fontWeight: weight.semibold,
                  marginBottom: spacing.xs,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('fieldFundingSource')}
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <AppButton label={t('autoAllNew')} onPress={setAllNew} compact variant="ghost" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton label={t('autoAllWallet')} onPress={setAllWallet} compact variant="ghost" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton label={t('autoSplit')} onPress={setAutoSplit} compact variant="muted" />
                </View>
              </View>
              <AppInput
                label={t('fieldNewCapital')}
                value={newCapital}
                onChangeText={setNewCapital}
                keyboardType="decimal-pad"
                suffix={t('egp')}
                hint={t('fieldNewCapitalHint')}
                error={errors.newCapital}
              />
              <View
                style={[
                  styles.summaryRow,
                  {
                    backgroundColor: palette.surfaceAlt,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    marginTop: spacing.sm,
                  },
                ]}
              >
                <Text style={{ color: palette.textMuted, fontSize: font.caption }}>
                  {t('fieldFromWallet')}
                </Text>
                <Text
                  style={{
                    color:
                      fromWallet > walletBefore.cash + 0.01 ? palette.loss : palette.text,
                    fontSize: font.body,
                    fontWeight: weight.bold,
                  }}
                >
                  {money(fromWallet)}
                </Text>
              </View>
              <Text
                style={{
                  color: palette.textSubtle,
                  fontSize: font.micro,
                  marginTop: 4,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('walletAvailable')}: {money(walletBefore.cash)} · {t('walletProfitPortion')}: {money(walletBefore.profitPortion)}
              </Text>
            </Card>
          ) : null}

          {/* Date + Notes */}
          <Card>
            <View style={{ gap: spacing.sm }}>
              <AppInput
                label={t('fieldDate')}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
              <AppInput
                label={t('fieldNotes')}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('fieldNotesPlaceholder')}
                multiline
                autoCapitalize="sentences"
              />
            </View>
          </Card>

          <AppButton label={t('saveTransaction')} icon="content-save-outline" onPress={onSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    padding: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
