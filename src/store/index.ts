import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  OverseasStock,
  DomesticStock,
  AlternativeAsset,
  NonInvestAssets,
  Dividend,
  GrowthRecord,
  Settings,
} from '../types';

export interface StoreState {
  overseasStocks: OverseasStock[];
  domesticStocks: DomesticStock[];
  alternativeAssets: AlternativeAsset[];
  nonInvestAssets: NonInvestAssets;
  dividends: Dividend[];
  growthRecords: GrowthRecord[];
  settings: Settings;

  addOverseasStock: (stock: OverseasStock) => void;
  updateOverseasStock: (stock: OverseasStock) => void;
  deleteOverseasStock: (id: string) => void;

  addDomesticStock: (stock: DomesticStock) => void;
  updateDomesticStock: (stock: DomesticStock) => void;
  deleteDomesticStock: (id: string) => void;

  addAlternativeAsset: (asset: AlternativeAsset) => void;
  updateAlternativeAsset: (asset: AlternativeAsset) => void;
  deleteAlternativeAsset: (id: string) => void;

  updateNonInvestAssets: (assets: NonInvestAssets) => void;

  addDividend: (dividend: Dividend) => void;
  updateDividend: (dividend: Dividend) => void;
  deleteDividend: (id: string) => void;

  addGrowthRecord: (record: GrowthRecord) => void;
  updateGrowthRecord: (record: GrowthRecord) => void;
  deleteGrowthRecord: (id: string) => void;

  updateSettings: (settings: Partial<Settings>) => void;

  importAll: (data: Partial<StoreState>) => void;
}

const defaultNonInvestAssets: NonInvestAssets = {
  cash: 0,
  deposit: 0,
  savings: 0,
  subscription: 0,
  bonds: 0,
  bondValue: 0,
  memo: '',
};

const defaultSettings: Settings = {
  targetAllocation: {
    core_us: 0.45,
    core_kr: 0.1,
    satellite_us: 0.1,
    satellite_kr: 0.1,
    alternative: 0.05,
    bonds: 0.05,
    cash: 0.15,
  },
  targetAsset: 150000000,
  targetYear: 2030,
  exchangeRate: 1380,
  rateUpdatedAt: '',
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      overseasStocks: [],
      domesticStocks: [],
      alternativeAssets: [],
      nonInvestAssets: defaultNonInvestAssets,
      dividends: [],
      growthRecords: [],
      settings: defaultSettings,

      addOverseasStock: (stock) =>
        set((s) => ({ overseasStocks: [...s.overseasStocks, stock] })),
      updateOverseasStock: (stock) =>
        set((s) => ({
          overseasStocks: s.overseasStocks.map((x) => (x.id === stock.id ? stock : x)),
        })),
      deleteOverseasStock: (id) =>
        set((s) => ({ overseasStocks: s.overseasStocks.filter((x) => x.id !== id) })),

      addDomesticStock: (stock) =>
        set((s) => ({ domesticStocks: [...s.domesticStocks, stock] })),
      updateDomesticStock: (stock) =>
        set((s) => ({
          domesticStocks: s.domesticStocks.map((x) => (x.id === stock.id ? stock : x)),
        })),
      deleteDomesticStock: (id) =>
        set((s) => ({ domesticStocks: s.domesticStocks.filter((x) => x.id !== id) })),

      addAlternativeAsset: (asset) =>
        set((s) => ({ alternativeAssets: [...s.alternativeAssets, asset] })),
      updateAlternativeAsset: (asset) =>
        set((s) => ({
          alternativeAssets: s.alternativeAssets.map((x) => (x.id === asset.id ? asset : x)),
        })),
      deleteAlternativeAsset: (id) =>
        set((s) => ({ alternativeAssets: s.alternativeAssets.filter((x) => x.id !== id) })),

      updateNonInvestAssets: (assets) => set({ nonInvestAssets: assets }),

      addDividend: (dividend) =>
        set((s) => ({ dividends: [...s.dividends, dividend] })),
      updateDividend: (dividend) =>
        set((s) => ({
          dividends: s.dividends.map((x) => (x.id === dividend.id ? dividend : x)),
        })),
      deleteDividend: (id) =>
        set((s) => ({ dividends: s.dividends.filter((x) => x.id !== id) })),

      addGrowthRecord: (record) =>
        set((s) => ({ growthRecords: [...s.growthRecords, record] })),
      updateGrowthRecord: (record) =>
        set((s) => ({
          growthRecords: s.growthRecords.map((x) => (x.id === record.id ? record : x)),
        })),
      deleteGrowthRecord: (id) =>
        set((s) => ({ growthRecords: s.growthRecords.filter((x) => x.id !== id) })),

      updateSettings: (settings) =>
        set((s) => ({ settings: { ...s.settings, ...settings } })),

      importAll: (data) =>
        set((s) => ({ ...s, ...data })),
    }),
    {
      name: 'moneymove-store',
    }
  )
);
