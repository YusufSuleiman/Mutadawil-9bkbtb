import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { storage } from '@/services/storage';
import { buildLedger, LedgerSnapshot, validateSellShares } from '@/services/calculations';
import { Transaction } from '@/services/types';

export interface TransactionsContextValue {
  ready: boolean;
  transactions: Transaction[];
  ledger: LedgerSnapshot;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<{ ok: boolean; error?: string; currentShares?: number; id?: string }>;
  updateTransaction: (tx: Transaction) => Promise<{ ok: boolean; error?: string; currentShares?: number }>;
  deleteTransaction: (id: string) => Promise<void>;
  replaceAll: (txs: Transaction[]) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

const genId = () =>
  `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await storage.getTransactions();
      setTransactions(list);
      setReady(true);
    })();
  }, []);

  const persist = useCallback(async (next: Transaction[]) => {
    setTransactions(next);
    await storage.saveTransactions(next);
  }, []);

  const addTransaction = useCallback(
    async (partial: Omit<Transaction, 'id' | 'createdAt'>) => {
      if (partial.type === 'sell') {
        const shares =
          partial.price > 0
            ? (partial.totalAmount + partial.commission) / partial.price
            : 0;
        const check = validateSellShares(transactions, partial.symbol, shares);
        if (!check.ok) {
          return { ok: false, error: check.error, currentShares: check.currentShares };
        }
      }
      const tx: Transaction = {
        ...partial,
        symbol: partial.symbol.toUpperCase().trim(),
        id: genId(),
        createdAt: new Date().toISOString(),
      };
      await persist([...transactions, tx]);
      return { ok: true, id: tx.id };
    },
    [transactions, persist],
  );

  const updateTransaction = useCallback(
    async (tx: Transaction) => {
      if (tx.type === 'sell') {
        const shares =
          tx.price > 0 ? (tx.totalAmount + tx.commission) / tx.price : 0;
        const check = validateSellShares(transactions, tx.symbol, shares, tx.id);
        if (!check.ok) {
          return { ok: false, error: check.error, currentShares: check.currentShares };
        }
      }
      const next = transactions.map((t) =>
        t.id === tx.id ? { ...tx, symbol: tx.symbol.toUpperCase().trim() } : t,
      );
      await persist(next);
      return { ok: true };
    },
    [transactions, persist],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await persist(transactions.filter((t) => t.id !== id));
    },
    [transactions, persist],
  );

  const replaceAll = useCallback(
    async (txs: Transaction[]) => {
      await persist(txs);
    },
    [persist],
  );

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const ledger = useMemo(() => buildLedger(transactions), [transactions]);

  const value = useMemo<TransactionsContextValue>(
    () => ({
      ready,
      transactions,
      ledger,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      replaceAll,
      clearAll,
    }),
    [ready, transactions, ledger, addTransaction, updateTransaction, deleteTransaction, replaceAll, clearAll],
  );

  return (
    <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
  );
}
