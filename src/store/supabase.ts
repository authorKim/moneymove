import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  OverseasStock,
  DomesticStock,
  AlternativeAsset,
  NonInvestAssets,
  Dividend,
  GrowthRecord,
  Settings,
} from '../types'

export interface SupabaseStoreState {
  overseasStocks: OverseasStock[]
  domesticStocks: DomesticStock[]
  alternativeAssets: AlternativeAsset[]
  nonInvestAssets: NonInvestAssets
  dividends: Dividend[]
  growthRecords: GrowthRecord[]
  settings: Settings
  isLoading: boolean

  loadAll: (userId: string) => Promise<void>

  addOverseasStock: (stock: OverseasStock, userId: string) => Promise<void>
  updateOverseasStock: (stock: OverseasStock, userId: string) => Promise<void>
  deleteOverseasStock: (id: string) => Promise<void>

  addDomesticStock: (stock: DomesticStock, userId: string) => Promise<void>
  updateDomesticStock: (stock: DomesticStock, userId: string) => Promise<void>
  deleteDomesticStock: (id: string) => Promise<void>

  addAlternativeAsset: (asset: AlternativeAsset, userId: string) => Promise<void>
  updateAlternativeAsset: (asset: AlternativeAsset, userId: string) => Promise<void>
  deleteAlternativeAsset: (id: string) => Promise<void>

  updateNonInvestAssets: (assets: NonInvestAssets, userId: string) => Promise<void>

  addDividend: (dividend: Dividend, userId: string) => Promise<void>
  updateDividend: (dividend: Dividend, userId: string) => Promise<void>
  deleteDividend: (id: string) => Promise<void>

  addGrowthRecord: (record: GrowthRecord, userId: string) => Promise<void>
  updateGrowthRecord: (record: GrowthRecord, userId: string) => Promise<void>
  deleteGrowthRecord: (id: string) => Promise<void>

  updateSettings: (settings: Partial<Settings>, userId: string) => Promise<void>
}

const defaultNonInvestAssets: NonInvestAssets = {
  cash: 0, deposit: 0, savings: 0, subscription: 0, bonds: 0, bondValue: 0, memo: '',
}

const defaultSettings: Settings = {
  targetAllocation: {
    core_us: 0.45, core_kr: 0.1, satellite_us: 0.1, satellite_kr: 0.1,
    alternative: 0.05, bonds: 0.05, cash: 0.15,
  },
  targetAsset: 150000000,
  targetYear: 2030,
  exchangeRate: 1380,
  rateUpdatedAt: '',
}

// DB row -> app type converters
function rowToOverseas(row: Record<string, unknown>): OverseasStock {
  return {
    id: row.id as string,
    name: row.name as string,
    buyDate: (row.buy_date as string) ?? '',
    krwCost: Number(row.krw_cost ?? 0),
    krwValue: Number(row.krw_value ?? 0),
    usdCost: Number(row.usd_cost ?? 0),
    usdValue: Number(row.usd_value ?? 0),
    category: (row.category as OverseasStock['category']) ?? 'core_us',
  }
}

function rowToDomestic(row: Record<string, unknown>): DomesticStock {
  return {
    id: row.id as string,
    name: row.name as string,
    buyDate: (row.buy_date as string) ?? '',
    cost: Number(row.cost ?? 0),
    value: Number(row.value ?? 0),
    category: (row.category as DomesticStock['category']) ?? 'core_kr',
  }
}

function rowToAlternative(row: Record<string, unknown>): AlternativeAsset {
  return {
    id: row.id as string,
    name: row.name as string,
    cost: Number(row.cost ?? 0),
    value: Number(row.value ?? 0),
  }
}

function rowToNonInvest(row: Record<string, unknown>): NonInvestAssets {
  return {
    cash: Number(row.cash ?? 0),
    deposit: Number(row.deposit ?? 0),
    savings: Number(row.savings ?? 0),
    subscription: Number(row.subscription ?? 0),
    bonds: Number(row.bonds ?? 0),
    bondValue: Number(row.bond_value ?? 0),
    memo: (row.memo as string) ?? '',
  }
}

function rowToDividend(row: Record<string, unknown>): Dividend {
  return {
    id: row.id as string,
    year: Number(row.year),
    month: Number(row.month),
    stockName: row.stock_name as string,
    amount: Number(row.amount ?? 0),
  }
}

function rowToGrowthRecord(row: Record<string, unknown>): GrowthRecord {
  return {
    id: row.id as string,
    year: Number(row.year),
    month: Number(row.month),
    totalAsset: Number(row.total_asset ?? 0),
    memo: (row.memo as string) ?? '',
    isAuto: Boolean(row.is_auto),
  }
}

function rowToSettings(row: Record<string, unknown>): Settings {
  const alloc = (row.target_allocation as Settings['targetAllocation']) ?? defaultSettings.targetAllocation
  return {
    targetAllocation: alloc,
    targetAsset: Number(row.target_asset ?? 150000000),
    targetYear: Number(row.target_year ?? 2030),
    exchangeRate: Number(row.exchange_rate ?? 1380),
    rateUpdatedAt: (row.rate_updated_at as string) ?? '',
  }
}

export const useSupabaseStore = create<SupabaseStoreState>()((set, get) => ({
  overseasStocks: [],
  domesticStocks: [],
  alternativeAssets: [],
  nonInvestAssets: defaultNonInvestAssets,
  dividends: [],
  growthRecords: [],
  settings: defaultSettings,
  isLoading: false,

  loadAll: async (userId: string) => {
    set({ isLoading: true })
    try {
      const [
        { data: overseas },
        { data: domestic },
        { data: alternative },
        { data: nonInvest },
        { data: divs },
        { data: growth },
        { data: settingsData },
      ] = await Promise.all([
        supabase.from('overseas_stocks').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('domestic_stocks').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('alternative_assets').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('non_invest_assets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('dividends').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('growth_records').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
      ])

      set({
        overseasStocks: (overseas ?? []).map(r => rowToOverseas(r as Record<string, unknown>)),
        domesticStocks: (domestic ?? []).map(r => rowToDomestic(r as Record<string, unknown>)),
        alternativeAssets: (alternative ?? []).map(r => rowToAlternative(r as Record<string, unknown>)),
        nonInvestAssets: nonInvest ? rowToNonInvest(nonInvest as Record<string, unknown>) : defaultNonInvestAssets,
        dividends: (divs ?? []).map(r => rowToDividend(r as Record<string, unknown>)),
        growthRecords: (growth ?? []).map(r => rowToGrowthRecord(r as Record<string, unknown>)),
        settings: settingsData ? rowToSettings(settingsData as Record<string, unknown>) : defaultSettings,
        isLoading: false,
      })
    } catch (err) {
      console.error('loadAll error:', err)
      set({ isLoading: false })
    }
  },

  addOverseasStock: async (stock, userId) => {
    const { data, error } = await supabase.from('overseas_stocks').insert({
      user_id: userId, name: stock.name, buy_date: stock.buyDate,
      krw_cost: stock.krwCost, krw_value: stock.krwValue,
      usd_cost: stock.usdCost, usd_value: stock.usdValue, category: stock.category,
    }).select().single()
    if (!error && data) {
      set(s => ({ overseasStocks: [...s.overseasStocks, rowToOverseas(data as Record<string, unknown>)] }))
    }
  },

  updateOverseasStock: async (stock, userId) => {
    const { error } = await supabase.from('overseas_stocks').update({
      name: stock.name, buy_date: stock.buyDate,
      krw_cost: stock.krwCost, krw_value: stock.krwValue,
      usd_cost: stock.usdCost, usd_value: stock.usdValue, category: stock.category,
    }).eq('id', stock.id).eq('user_id', userId)
    if (!error) {
      set(s => ({ overseasStocks: s.overseasStocks.map(x => x.id === stock.id ? stock : x) }))
    }
  },

  deleteOverseasStock: async (id) => {
    await supabase.from('overseas_stocks').delete().eq('id', id)
    set(s => ({ overseasStocks: s.overseasStocks.filter(x => x.id !== id) }))
  },

  addDomesticStock: async (stock, userId) => {
    const { data, error } = await supabase.from('domestic_stocks').insert({
      user_id: userId, name: stock.name, buy_date: stock.buyDate,
      cost: stock.cost, value: stock.value, category: stock.category,
    }).select().single()
    if (!error && data) {
      set(s => ({ domesticStocks: [...s.domesticStocks, rowToDomestic(data as Record<string, unknown>)] }))
    }
  },

  updateDomesticStock: async (stock, userId) => {
    await supabase.from('domestic_stocks').update({
      name: stock.name, buy_date: stock.buyDate,
      cost: stock.cost, value: stock.value, category: stock.category,
    }).eq('id', stock.id).eq('user_id', userId)
    set(s => ({ domesticStocks: s.domesticStocks.map(x => x.id === stock.id ? stock : x) }))
  },

  deleteDomesticStock: async (id) => {
    await supabase.from('domestic_stocks').delete().eq('id', id)
    set(s => ({ domesticStocks: s.domesticStocks.filter(x => x.id !== id) }))
  },

  addAlternativeAsset: async (asset, userId) => {
    const { data, error } = await supabase.from('alternative_assets').insert({
      user_id: userId, name: asset.name, cost: asset.cost, value: asset.value,
    }).select().single()
    if (!error && data) {
      set(s => ({ alternativeAssets: [...s.alternativeAssets, rowToAlternative(data as Record<string, unknown>)] }))
    }
  },

  updateAlternativeAsset: async (asset, userId) => {
    await supabase.from('alternative_assets').update({
      name: asset.name, cost: asset.cost, value: asset.value,
    }).eq('id', asset.id).eq('user_id', userId)
    set(s => ({ alternativeAssets: s.alternativeAssets.map(x => x.id === asset.id ? asset : x) }))
  },

  deleteAlternativeAsset: async (id) => {
    await supabase.from('alternative_assets').delete().eq('id', id)
    set(s => ({ alternativeAssets: s.alternativeAssets.filter(x => x.id !== id) }))
  },

  updateNonInvestAssets: async (assets, userId) => {
    await supabase.from('non_invest_assets').upsert({
      user_id: userId, cash: assets.cash, deposit: assets.deposit,
      savings: assets.savings, subscription: assets.subscription,
      bonds: assets.bonds, bond_value: assets.bondValue, memo: assets.memo,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    set({ nonInvestAssets: assets })
  },

  addDividend: async (dividend, userId) => {
    const { data, error } = await supabase.from('dividends').insert({
      user_id: userId, year: dividend.year, month: dividend.month,
      stock_name: dividend.stockName, amount: dividend.amount,
    }).select().single()
    if (!error && data) {
      set(s => ({ dividends: [...s.dividends, rowToDividend(data as Record<string, unknown>)] }))
    }
  },

  updateDividend: async (dividend, userId) => {
    await supabase.from('dividends').update({
      year: dividend.year, month: dividend.month,
      stock_name: dividend.stockName, amount: dividend.amount,
    }).eq('id', dividend.id).eq('user_id', userId)
    set(s => ({ dividends: s.dividends.map(x => x.id === dividend.id ? dividend : x) }))
  },

  deleteDividend: async (id) => {
    await supabase.from('dividends').delete().eq('id', id)
    set(s => ({ dividends: s.dividends.filter(x => x.id !== id) }))
  },

  addGrowthRecord: async (record, userId) => {
    const { data, error } = await supabase.from('growth_records').insert({
      user_id: userId, year: record.year, month: record.month,
      total_asset: record.totalAsset, memo: record.memo, is_auto: record.isAuto,
    }).select().single()
    if (!error && data) {
      set(s => ({ growthRecords: [...s.growthRecords, rowToGrowthRecord(data as Record<string, unknown>)] }))
    }
  },

  updateGrowthRecord: async (record, userId) => {
    await supabase.from('growth_records').update({
      year: record.year, month: record.month,
      total_asset: record.totalAsset, memo: record.memo, is_auto: record.isAuto,
    }).eq('id', record.id).eq('user_id', userId)
    set(s => ({ growthRecords: s.growthRecords.map(x => x.id === record.id ? record : x) }))
  },

  deleteGrowthRecord: async (id) => {
    await supabase.from('growth_records').delete().eq('id', id)
    set(s => ({ growthRecords: s.growthRecords.filter(x => x.id !== id) }))
  },

  updateSettings: async (partial, userId) => {
    const current = get().settings
    const updated = { ...current, ...partial }
    await supabase.from('user_settings').upsert({
      user_id: userId,
      target_asset: updated.targetAsset,
      target_year: updated.targetYear,
      exchange_rate: updated.exchangeRate,
      rate_updated_at: updated.rateUpdatedAt,
      target_allocation: updated.targetAllocation,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    set({ settings: updated })
  },
}))
