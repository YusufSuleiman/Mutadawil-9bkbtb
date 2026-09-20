/**
 * Import / export backup as JSON files.
 * Uses expo-file-system + expo-sharing on native, and Blob download on web.
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { AppSettings } from './storage';
import { Transaction } from './types';

export interface BackupFile {
  app: 'mutadawil';
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  transactions: Transaction[];
}

export const buildBackup = (
  transactions: Transaction[],
  settings: AppSettings,
): BackupFile => ({
  app: 'mutadawil',
  version: 1,
  exportedAt: new Date().toISOString(),
  settings,
  transactions,
});

export const exportBackup = async (backup: BackupFile): Promise<void> => {
  const json = JSON.stringify(backup, null, 2);
  const filename = `mutadawil-backup-${new Date().toISOString().slice(0, 10)}.json`;

  if (Platform.OS === 'web') {
    // Web: trigger download using Blob URL
    try {
      // @ts-ignore - web only globals
      const blob = new Blob([json], { type: 'application/json' });
      // @ts-ignore
      const url = URL.createObjectURL(blob);
      // @ts-ignore
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      // @ts-ignore
      document.body.appendChild(a);
      a.click();
      // @ts-ignore
      document.body.removeChild(a);
      // @ts-ignore
      URL.revokeObjectURL(url);
    } catch (e) {
      throw new Error('Web export failed');
    }
    return;
  }

  const uri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Mutadawil backup',
      UTI: 'public.json',
    });
  }
};

export const importBackup = async (): Promise<BackupFile | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset) return null;

  let content = '';
  if (Platform.OS === 'web') {
    // @ts-ignore
    const response = await fetch(asset.uri);
    content = await response.text();
  } else {
    content = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  }

  const parsed = JSON.parse(content);
  if (
    !parsed ||
    parsed.app !== 'mutadawil' ||
    !Array.isArray(parsed.transactions)
  ) {
    throw new Error('Invalid backup file');
  }
  return parsed as BackupFile;
};
