/**
 * Pure calculation utilities for the trading ledger.
 * All functions are deterministic and side-effect free.
 */

import {
  PortfolioSummary,
  SymbolPosition,
  Transaction,
  WalletState,
} from './types';

const roundNum = (n: number, digits = 4): number => {
  if (!Number.isFinite(n)) return 0;
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
};

/**
 * Compute shares from price/commission/total for a given side.
 */
export const computeShares = (
  type: 'buy' | 'sell',
  price: number,
  commission: number,
  totalAmount: number,
): number => {
  if (!price || price <= 0) return 0;
  if (type === 'buy') {
    return roundNum(Math.max(0, (totalAmount - commission) / price));
  }
  // sell — totalAmount is net proceeds, gross = totalAmount + commission
  return roundNum(Math.max(0, (totalAmount + commission) / price));
};

/**
 * Sort transactions chronologically (by date, then createdAt).
 */
export const sortByDate = (txs: Transaction[]): Transaction[] =>
  [...txs].sort((a, b) => {
    const d = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (d !== 0) return d;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

/**
 * Simulate the ledger from scratch to derive every aggregate accurately.
 * Uses moving-average cost per symbol.
 * Tracks wallet with capital / profit portions.
 */
export interface LedgerSnapshot {
  summary: PortfolioSummary;
  positions: Record<string, SymbolPosition>;
  /**
   * Per-transaction derived metadata (useful for detail screen).
   */
  meta: Record<string, {
    grossValue: number;
    computedShares: number;
    capitalPortion: number;
    profitPortion: number;
    walletUsed: number;
    realizedPL?: number;
    avgCostAtTime?: number;
  }>;
}

export const buildLedger = (txs: Transaction[]): LedgerSnapshot => {
  const positions: Record<string, SymbolPosition> = {};
  const meta: LedgerSnapshot['meta'] = {};

  let grossCapital = 0;
  let totalCommissionBuy = 0;
  let totalCommissionSell = 0;
  let realizedProfit = 0;

  const wallet: WalletState = { cash: 0, capitalPortion: 0, profitPortion: 0 };

  const sorted = sortByDate(txs);

  for (const tx of sorted) {
    const shares = computeShares(tx.type, tx.price, tx.commission, tx.totalAmount);
    const key = tx.symbol.toUpperCase();
    const pos: SymbolPosition = positions[key] ?? {
      symbol: key,
      company: tx.company,
      sharesHeld: 0,
      avgCost: 0,
      totalInvested: 0,
      totalSoldValue: 0,
      realizedPL: 0,
      buyCount: 0,
      sellCount: 0,
      commissions: 0,
      lastPrice: 0,
      unrealizedPL: 0,
    };
    pos.company = tx.company || pos.company;
    pos.lastPrice = tx.price;
    pos.commissions += tx.commission;

    if (tx.type === 'buy') {
      totalCommissionBuy += tx.commission;
      grossCapital += Math.max(0, tx.newCapital);

      const fromWallet = Math.max(0, tx.totalAmount - Math.max(0, tx.newCapital));
      // proportion of wallet used
      let walletCapitalUsed = 0;
      let walletProfitUsed = 0;
      if (fromWallet > 0 && wallet.cash > 0) {
        const ratioCapital = wallet.cash > 0 ? wallet.capitalPortion / wallet.cash : 0;
        const ratioProfit = wallet.cash > 0 ? wallet.profitPortion / wallet.cash : 0;
        walletCapitalUsed = roundNum(Math.min(wallet.capitalPortion, fromWallet * ratioCapital));
        walletProfitUsed = roundNum(Math.min(wallet.profitPortion, fromWallet * ratioProfit));
        const drained = walletCapitalUsed + walletProfitUsed;
        // Fix rounding by ensuring drained <= fromWallet
        const diff = fromWallet - drained;
        if (Math.abs(diff) > 0.001) {
          walletCapitalUsed = roundNum(walletCapitalUsed + diff * ratioCapital);
          walletProfitUsed = roundNum(walletProfitUsed + diff * ratioProfit);
        }
        wallet.cash = roundNum(Math.max(0, wallet.cash - fromWallet));
        wallet.capitalPortion = roundNum(Math.max(0, wallet.capitalPortion - walletCapitalUsed));
        wallet.profitPortion = roundNum(Math.max(0, wallet.profitPortion - walletProfitUsed));
      } else if (fromWallet > 0) {
        // Wallet empty but user still marked wallet portion — treat as forced draw
        wallet.cash = 0;
        wallet.capitalPortion = 0;
        wallet.profitPortion = 0;
      }

      // Add shares at price (moving average)
      const prevShares = pos.sharesHeld;
      const prevAvg = pos.avgCost;
      const newShares = shares;
      const newAvg =
        prevShares + newShares > 0
          ? (prevShares * prevAvg + newShares * tx.price) / (prevShares + newShares)
          : 0;
      pos.avgCost = roundNum(newAvg);
      pos.sharesHeld = roundNum(prevShares + newShares);
      pos.totalInvested = roundNum(pos.totalInvested + newShares * tx.price);
      pos.buyCount += 1;

      meta[tx.id] = {
        grossValue: tx.totalAmount,
        computedShares: shares,
        capitalPortion: walletCapitalUsed + Math.max(0, tx.newCapital),
        profitPortion: walletProfitUsed,
        walletUsed: fromWallet,
      };
    } else {
      // SELL
      totalCommissionSell += tx.commission;
      const sellShares = shares;
      const proceedsNet = tx.totalAmount; // already after commission
      const avgAtTime = pos.avgCost;
      const costBasis = avgAtTime * sellShares;
      // Gross P&L based on price vs avg (excludes commissions)
      const grossPL = (tx.price - avgAtTime) * sellShares;
      // Net P&L subtracts sell commission (buy commission already sunk)
      const netPL = grossPL - tx.commission;

      realizedProfit = roundNum(realizedProfit + netPL);

      // Update position
      pos.sharesHeld = roundNum(pos.sharesHeld - sellShares);
      if (pos.sharesHeld <= 0.0001) {
        pos.sharesHeld = 0;
        pos.avgCost = 0;
        pos.totalInvested = 0;
      } else {
        pos.totalInvested = roundNum(pos.avgCost * pos.sharesHeld);
      }
      pos.totalSoldValue = roundNum(pos.totalSoldValue + proceedsNet);
      pos.realizedPL = roundNum(pos.realizedPL + netPL);
      pos.sellCount += 1;

      // Wallet: cash increases by net proceeds.
      // Portion split: min(costBasis, proceedsNet) is capital return, rest is profit.
      const capitalReturn = roundNum(Math.max(0, Math.min(costBasis, proceedsNet)));
      const profitReturn = roundNum(Math.max(0, proceedsNet - capitalReturn));
      wallet.cash = roundNum(wallet.cash + proceedsNet);
      wallet.capitalPortion = roundNum(wallet.capitalPortion + capitalReturn);
      wallet.profitPortion = roundNum(wallet.profitPortion + profitReturn);

      meta[tx.id] = {
        grossValue: proceedsNet + tx.commission,
        computedShares: shares,
        capitalPortion: 0,
        profitPortion: 0,
        walletUsed: 0,
        realizedPL: netPL,
        avgCostAtTime: avgAtTime,
      };
    }

    positions[key] = pos;
  }

  // Unrealized P&L against last recorded price
  let unrealized = 0;
  let totalInvestedActive = 0;
  let activeSymbols = 0;
  let totalSharesOwned = 0;
  for (const key of Object.keys(positions)) {
    const p = positions[key];
    p.unrealizedPL = roundNum((p.lastPrice - p.avgCost) * p.sharesHeld);
    unrealized += p.unrealizedPL;
    if (p.sharesHeld > 0) {
      activeSymbols += 1;
      totalInvestedActive += p.totalInvested;
      totalSharesOwned += p.sharesHeld;
    }
  }

  const totalCommission = totalCommissionBuy + totalCommissionSell;
  const netCapital = roundNum(grossCapital - totalCommissionBuy);

  const summary: PortfolioSummary = {
    grossCapital: roundNum(grossCapital),
    netCapital,
    totalCommission: roundNum(totalCommission),
    totalCommissionBuy: roundNum(totalCommissionBuy),
    totalCommissionSell: roundNum(totalCommissionSell),
    realizedProfit: roundNum(realizedProfit),
    unrealizedProfit: roundNum(unrealized),
    wallet: {
      cash: roundNum(wallet.cash),
      capitalPortion: roundNum(wallet.capitalPortion),
      profitPortion: roundNum(wallet.profitPortion),
    },
    totalInvestedActive: roundNum(totalInvestedActive),
    activeSymbols,
    totalSharesOwned: roundNum(totalSharesOwned),
  };

  return { summary, positions, meta };
};

/**
 * Validate whether a proposed transaction can be executed against the CURRENT
 * ledger (before that tx is applied). Useful for sell-quantity check.
 */
export interface ValidationResult {
  ok: boolean;
  error?: string;
  currentShares?: number;
}

export const validateSellShares = (
  txs: Transaction[],
  symbol: string,
  proposedShares: number,
  excludingId?: string,
): ValidationResult => {
  const filtered = excludingId ? txs.filter((t) => t.id !== excludingId) : txs;
  const { positions } = buildLedger(filtered);
  const p = positions[symbol.toUpperCase()];
  const holding = p?.sharesHeld ?? 0;
  if (proposedShares > holding + 0.0001) {
    return { ok: false, error: 'errNoShares', currentShares: holding };
  }
  return { ok: true, currentShares: holding };
};

export { roundNum };
