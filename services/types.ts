/**
 * Core domain types.
 */

export type TransactionType = 'buy' | 'sell';

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Uppercase symbol used to group operations for the same company */
  symbol: string;
  /** Human-readable company name */
  company: string;
  /** Price per share */
  price: number;
  /** Commission fee (positive number) */
  commission: number;
  /**
   * For buy: total money paid out of pocket (includes commission).
   * For sell: net proceeds actually received (commission already deducted).
   */
  totalAmount: number;
  /**
   * Auto-computed shares based on price/commission/totalAmount.
   * Buy:  shares = (totalAmount - commission) / price
   * Sell: shares = (totalAmount + commission) / price
   */
  shares: number;
  /**
   * For buy: how much of totalAmount is FRESH capital (outside money).
   * The remainder (totalAmount - newCapital) is pulled from the wallet.
   * For sell: always 0 (funding source is the market).
   */
  newCapital: number;
  /** ISO date string */
  date: string;
  notes?: string;
  /** Insertion time for stable sorting */
  createdAt: string;
}

export interface SymbolPosition {
  symbol: string;
  company: string;
  sharesHeld: number;
  avgCost: number;
  totalInvested: number;
  totalSoldValue: number;
  realizedPL: number;
  buyCount: number;
  sellCount: number;
  commissions: number;
  lastPrice: number;
  unrealizedPL: number;
}

export interface WalletState {
  /** Total liquid cash currently sitting in the wallet */
  cash: number;
  /** How much of that cash is "capital" (original invested money returned) */
  capitalPortion: number;
  /** How much of that cash is realized profit */
  profitPortion: number;
}

export interface PortfolioSummary {
  grossCapital: number;
  netCapital: number;
  totalCommission: number;
  totalCommissionBuy: number;
  totalCommissionSell: number;
  realizedProfit: number;
  unrealizedProfit: number;
  wallet: WalletState;
  totalInvestedActive: number;
  activeSymbols: number;
  totalSharesOwned: number;
}
