/**
 * AsyncStorage wrapper for transactions & settings.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from './types';

const KEY_TRANSACTIONS = 'mutadawil::transactions::v1';
const KEY_SETTINGS = 'mutadawil::settings::v1';

export interface AppSettings {
  language: 'ar' | 'en';
  theme: 'dark' | 'light';
  currencyCode: string;
}

export const defaultSettings: AppSettings = {
  language: 'ar',
  theme: 'dark',
  currencyCode: 'EGP',
};

export const storage = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY_TRANSACTIONS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Transaction[]) : [];
    } catch {
      return [];
    }
  },
  async saveTransactions(txs: Transaction[]): Promise<void> {
    await AsyncStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(txs));
  },
  async getSettings(): Promise<AppSettings> {
    try {
      const raw = await AsyncStorage.getItem(KEY_SETTINGS);
      if (!raw) return defaultSettings;
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return defaultSettings;
    }
  },
  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  },
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEY_TRANSACTIONS, KEY_SETTINGS]);
  },
};
