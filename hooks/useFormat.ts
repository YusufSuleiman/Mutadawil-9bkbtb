import { useCallback } from 'react';
import { useSettings } from './useSettings';

/**
 * Currency + number + date formatters bound to current language / currency.
 */
export function useFormat() {
  const { settings, t } = useSettings();
  const locale = settings.language === 'ar' ? 'ar-EG' : 'en-US';
  const currency = settings.currencyCode || 'EGP';

  const money = useCallback(
    (n: number | null | undefined, opts: { compact?: boolean; sign?: boolean } = {}) => {
      const value = Number.isFinite(n as number) ? (n as number) : 0;
      const sign = opts.sign ? (value > 0 ? '+' : value < 0 ? '' : '') : '';
      try {
        const formatter = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
          notation: opts.compact ? 'compact' : 'standard',
        });
        return sign + formatter.format(value);
      } catch {
        return `${sign}${value.toFixed(2)} ${t('egp')}`;
      }
    },
    [locale, currency, t],
  );

  const number = useCallback(
    (n: number | null | undefined, digits = 2) => {
      const value = Number.isFinite(n as number) ? (n as number) : 0;
      try {
        return new Intl.NumberFormat(locale, {
          maximumFractionDigits: digits,
          minimumFractionDigits: 0,
        }).format(value);
      } catch {
        return value.toFixed(digits);
      }
    },
    [locale],
  );

  const date = useCallback(
    (iso: string) => {
      try {
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }).format(new Date(iso));
      } catch {
        return iso;
      }
    },
    [locale],
  );

  return { money, number, date };
}
