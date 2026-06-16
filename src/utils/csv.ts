import Papa from 'papaparse';
import type {
  OverseasStock,
  DomesticStock,
  AlternativeAsset,
  Dividend,
  GrowthRecord,
  NonInvestAssets,
} from '../types';

export function exportCSV(data: object[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportOverseasStocks(stocks: OverseasStock[]) {
  exportCSV(stocks, 'overseas_stocks.csv');
}

export function exportDomesticStocks(stocks: DomesticStock[]) {
  exportCSV(stocks, 'domestic_stocks.csv');
}

export function exportAlternativeAssets(assets: AlternativeAsset[]) {
  exportCSV(assets, 'alternative_assets.csv');
}

export function exportDividends(dividends: Dividend[]) {
  exportCSV(dividends, 'dividends.csv');
}

export function exportGrowthRecords(records: GrowthRecord[]) {
  exportCSV(records, 'growth_records.csv');
}

export function exportNonInvestAssets(assets: NonInvestAssets) {
  exportCSV([assets], 'non_invest_assets.csv');
}

export function parseCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}
