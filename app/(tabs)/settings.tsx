import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppHeader, Card, Screen, Segmented } from '@/components';
import { useSettings } from '@/hooks/useSettings';
import { useTransactions } from '@/hooks/useTransactions';
import { useAlert } from '@/template';
import { buildBackup, exportBackup, importBackup } from '@/services/backup';
import { font, radius, spacing, weight } from '@/constants/theme';

export default function SettingsScreen() {
  const { palette, isRTL, t, settings, setLanguage, setTheme, replaceSettings } = useSettings();
  const { transactions, replaceAll, clearAll } = useTransactions();
  const { showAlert } = useAlert();
  const [busy, setBusy] = useState(false);

  const onExport = async () => {
    try {
      setBusy(true);
      const backup = buildBackup(transactions, settings);
      await exportBackup(backup);
      showAlert(t('exportSuccess'));
    } catch (e) {
      showAlert('Error', String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const onImport = async () => {
    try {
      setBusy(true);
      const parsed = await importBackup();
      if (!parsed) return;
      await replaceAll(parsed.transactions);
      if (parsed.settings) await replaceSettings(parsed.settings);
      showAlert(t('importSuccess'));
    } catch (e) {
      showAlert(t('importFail'), String((e as Error)?.message ?? ''));
    } finally {
      setBusy(false);
    }
  };

  const onClear = () => {
    showAlert(t('confirmClearTitle'), t('confirmClearMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          showAlert(t('clearedSuccess'));
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppHeader title={t('settingsTitle')} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SectionTitle title={t('settingsAppearance')} palette={palette} isRTL={isRTL} />
        <Card>
          <SettingRow label={t('settingsLanguage')} palette={palette} isRTL={isRTL}>
            <Segmented
              value={settings.language}
              onChange={(v) => setLanguage(v)}
              options={[
                { value: 'ar', label: 'العربية' },
                { value: 'en', label: 'English' },
              ]}
            />
          </SettingRow>
          <Divider palette={palette} />
          <SettingRow label={t('settingsThemeMode')} palette={palette} isRTL={isRTL}>
            <Segmented
              value={settings.theme}
              onChange={(v) => setTheme(v)}
              options={[
                { value: 'dark', label: t('settingsThemeDark') },
                { value: 'light', label: t('settingsThemeLight') },
              ]}
            />
          </SettingRow>
          <Divider palette={palette} />
          <SettingRow label={t('settingsCurrency')} palette={palette} isRTL={isRTL}>
            <Text style={{ color: palette.text, fontWeight: weight.semibold }}>
              {settings.currencyCode}
            </Text>
          </SettingRow>
        </Card>

        {/* Data */}
        <SectionTitle title={t('settingsData')} palette={palette} isRTL={isRTL} />
        <Card>
          <View style={{ gap: spacing.sm }}>
            <AppButton
              label={t('settingsExport')}
              icon="tray-arrow-up"
              onPress={onExport}
              loading={busy}
              variant="ghost"
            />
            <AppButton
              label={t('settingsImport')}
              icon="tray-arrow-down"
              onPress={onImport}
              loading={busy}
              variant="ghost"
            />
            <AppButton
              label={t('settingsClear')}
              icon="delete-outline"
              onPress={onClear}
              variant="danger"
            />
          </View>
        </Card>

        {/* About */}
        <SectionTitle title={t('settingsAbout')} palette={palette} isRTL={isRTL} />
        <Card>
          <View
            style={[
              styles.aboutRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <MaterialCommunityIcons name="chart-line" size={22} color={palette.primary} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: palette.text,
                  fontSize: font.h4,
                  fontWeight: weight.bold,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('appName')}
              </Text>
              <Text
                style={{
                  color: palette.textSubtle,
                  fontSize: font.caption,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('settingsCredits')}
              </Text>
              <Text
                style={{
                  color: palette.textSubtle,
                  fontSize: font.micro,
                  marginTop: 4,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('settingsVersion')} 1.0.0
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ title, palette, isRTL }: { title: string; palette: any; isRTL: boolean }) {
  return (
    <Text
      style={{
        color: palette.textSubtle,
        fontSize: font.caption,
        fontWeight: weight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        textAlign: isRTL ? 'right' : 'left',
        marginTop: spacing.xs,
      }}
    >
      {title}
    </Text>
  );
}

function SettingRow({
  label,
  palette,
  isRTL,
  children,
}: {
  label: string;
  palette: any;
  isRTL: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 8, paddingVertical: 4 }}>
      <Text
        style={{
          color: palette.textMuted,
          fontSize: font.caption,
          fontWeight: weight.semibold,
          textAlign: isRTL ? 'right' : 'left',
        }}
      >
        {label}
      </Text>
      {children}
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
  aboutRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});
