export interface OverseasStock {
  id: string;
  name: string;
  buyDate: string;
  krwCost: number;
  krwValue: number;
  usdCost: number;
  usdValue: number;
  category: 'core_us' | 'core_kr' | 'satellite_us' | 'satellite_kr';
}

export interface DomesticStock {
  id: string;
  name: string;
  buyDate: string;
  cost: number;
  value: number;
  category: 'core_kr' | 'satellite_kr';
}

export interface AlternativeAsset {
  id: string;
  name: string;
  cost: number;
  value: number;
}

export interface NonInvestAssets {
  cash: number;
  deposit: number;
  savings: number;
  subscription: number;
  bonds: number;
  bondValue: number;
  memo: string;
}

export interface Dividend {
  id: string;
  year: number;
  month: number;
  stockName: string;
  amount: number;
}

export interface GrowthRecord {
  id: string;
  year: number;
  month: number;
  totalAsset: number;
  memo: string;
  isAuto: boolean;
}

export interface TargetAllocation {
  core_us: number;
  core_kr: number;
  satellite_us: number;
  satellite_kr: number;
  alternative: number;
  bonds: number;
  cash: number;
}

export interface Settings {
  targetAllocation: TargetAllocation;
  targetAsset: number;
  targetYear: number;
  exchangeRate: number;
  rateUpdatedAt: string;
}

export interface SummaryRow {
  label: string;
  key: string;
  targetRatio: number;
  targetAmount: number;
  actualRatio: number;
  cost: number;
  value: number;
  profit: number;
  returnRate: number;
}
