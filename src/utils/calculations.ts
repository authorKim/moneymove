import type {
  OverseasStock,
  DomesticStock,
  AlternativeAsset,
  NonInvestAssets,
  TargetAllocation,
  SummaryRow,
} from '../types';

export function calcReturn(cost: number, value: number): number {
  if (cost === 0) return 0;
  return (value - cost) / cost;
}

export function calcProfit(cost: number, value: number): number {
  return value - cost;
}

export function getOverseasByCategory(stocks: OverseasStock[], category: string) {
  return stocks.filter((s) => s.category === category);
}

export function usdToKrw(usd: number, rate: number): number {
  return usd * rate;
}

export function calcTotalInvestValue(
  overseasStocks: OverseasStock[],
  domesticStocks: DomesticStock[],
  alternativeAssets: AlternativeAsset[],
  nonInvestAssets: NonInvestAssets
): number {
  const overseas = overseasStocks.reduce((sum, s) => sum + s.krwValue, 0);
  const domestic = domesticStocks.reduce((sum, s) => sum + s.value, 0);
  const alt = alternativeAssets.reduce((sum, a) => sum + a.value, 0);
  const bonds = nonInvestAssets.bondValue;
  return overseas + domestic + alt + bonds;
}

export function calcTotalInvestCost(
  overseasStocks: OverseasStock[],
  domesticStocks: DomesticStock[],
  alternativeAssets: AlternativeAsset[],
  nonInvestAssets: NonInvestAssets
): number {
  const overseas = overseasStocks.reduce((sum, s) => sum + s.krwCost, 0);
  const domestic = domesticStocks.reduce((sum, s) => sum + s.cost, 0);
  const alt = alternativeAssets.reduce((sum, a) => sum + a.cost, 0);
  const bonds = nonInvestAssets.bonds;
  return overseas + domestic + alt + bonds;
}

export function calcTotalAsset(
  overseasStocks: OverseasStock[],
  domesticStocks: DomesticStock[],
  alternativeAssets: AlternativeAsset[],
  nonInvestAssets: NonInvestAssets
): number {
  const invest = calcTotalInvestValue(overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets);
  return (
    invest +
    nonInvestAssets.cash +
    nonInvestAssets.deposit +
    nonInvestAssets.savings +
    nonInvestAssets.subscription
  );
}

export function calcInvestmentSummary(
  overseasStocks: OverseasStock[],
  domesticStocks: DomesticStock[],
  alternativeAssets: AlternativeAsset[],
  nonInvestAssets: NonInvestAssets,
  targetAllocation: TargetAllocation
): SummaryRow[] {
  const totalAsset = calcTotalAsset(overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets);

  const coreUsStocks = overseasStocks.filter((s) => s.category === 'core_us');
  const coreKrStocks = [
    ...overseasStocks.filter((s) => s.category === 'core_kr'),
    ...domesticStocks.filter((s) => s.category === 'core_kr'),
  ];
  const satelliteUsStocks = overseasStocks.filter((s) => s.category === 'satellite_us');
  const satelliteKrStocks = [
    ...overseasStocks.filter((s) => s.category === 'satellite_kr'),
    ...domesticStocks.filter((s) => s.category === 'satellite_kr'),
  ];

  const coreUsCost = coreUsStocks.reduce((sum, s) => sum + s.krwCost, 0);
  const coreUsValue = coreUsStocks.reduce((sum, s) => sum + s.krwValue, 0);

  const coreKrCost = coreKrStocks.reduce((sum, s) => {
    if ('krwCost' in s) return sum + (s as OverseasStock).krwCost;
    return sum + (s as DomesticStock).cost;
  }, 0);
  const coreKrValue = coreKrStocks.reduce((sum, s) => {
    if ('krwValue' in s) return sum + (s as OverseasStock).krwValue;
    return sum + (s as DomesticStock).value;
  }, 0);

  const satUsCost = satelliteUsStocks.reduce((sum, s) => sum + s.krwCost, 0);
  const satUsValue = satelliteUsStocks.reduce((sum, s) => sum + s.krwValue, 0);

  const satKrCost = satelliteKrStocks.reduce((sum, s) => {
    if ('krwCost' in s) return sum + (s as OverseasStock).krwCost;
    return sum + (s as DomesticStock).cost;
  }, 0);
  const satKrValue = satelliteKrStocks.reduce((sum, s) => {
    if ('krwValue' in s) return sum + (s as OverseasStock).krwValue;
    return sum + (s as DomesticStock).value;
  }, 0);

  const altCost = alternativeAssets.reduce((sum, a) => sum + a.cost, 0);
  const altValue = alternativeAssets.reduce((sum, a) => sum + a.value, 0);

  const bondCost = nonInvestAssets.bonds;
  const bondValue = nonInvestAssets.bondValue;

  const cashValue =
    nonInvestAssets.cash +
    nonInvestAssets.deposit +
    nonInvestAssets.savings +
    nonInvestAssets.subscription;

  const rows: SummaryRow[] = [
    {
      label: '미국 코어',
      key: 'core_us',
      targetRatio: targetAllocation.core_us,
      targetAmount: totalAsset * targetAllocation.core_us,
      actualRatio: totalAsset > 0 ? coreUsValue / totalAsset : 0,
      cost: coreUsCost,
      value: coreUsValue,
      profit: calcProfit(coreUsCost, coreUsValue),
      returnRate: calcReturn(coreUsCost, coreUsValue),
    },
    {
      label: '한국 코어',
      key: 'core_kr',
      targetRatio: targetAllocation.core_kr,
      targetAmount: totalAsset * targetAllocation.core_kr,
      actualRatio: totalAsset > 0 ? coreKrValue / totalAsset : 0,
      cost: coreKrCost,
      value: coreKrValue,
      profit: calcProfit(coreKrCost, coreKrValue),
      returnRate: calcReturn(coreKrCost, coreKrValue),
    },
    {
      label: '미국 위성',
      key: 'satellite_us',
      targetRatio: targetAllocation.satellite_us,
      targetAmount: totalAsset * targetAllocation.satellite_us,
      actualRatio: totalAsset > 0 ? satUsValue / totalAsset : 0,
      cost: satUsCost,
      value: satUsValue,
      profit: calcProfit(satUsCost, satUsValue),
      returnRate: calcReturn(satUsCost, satUsValue),
    },
    {
      label: '한국 위성',
      key: 'satellite_kr',
      targetRatio: targetAllocation.satellite_kr,
      targetAmount: totalAsset * targetAllocation.satellite_kr,
      actualRatio: totalAsset > 0 ? satKrValue / totalAsset : 0,
      cost: satKrCost,
      value: satKrValue,
      profit: calcProfit(satKrCost, satKrValue),
      returnRate: calcReturn(satKrCost, satKrValue),
    },
    {
      label: '대체자산',
      key: 'alternative',
      targetRatio: targetAllocation.alternative,
      targetAmount: totalAsset * targetAllocation.alternative,
      actualRatio: totalAsset > 0 ? altValue / totalAsset : 0,
      cost: altCost,
      value: altValue,
      profit: calcProfit(altCost, altValue),
      returnRate: calcReturn(altCost, altValue),
    },
    {
      label: '채권',
      key: 'bonds',
      targetRatio: targetAllocation.bonds,
      targetAmount: totalAsset * targetAllocation.bonds,
      actualRatio: totalAsset > 0 ? bondValue / totalAsset : 0,
      cost: bondCost,
      value: bondValue,
      profit: calcProfit(bondCost, bondValue),
      returnRate: calcReturn(bondCost, bondValue),
    },
    {
      label: '현금성 자산',
      key: 'cash',
      targetRatio: targetAllocation.cash,
      targetAmount: totalAsset * targetAllocation.cash,
      actualRatio: totalAsset > 0 ? cashValue / totalAsset : 0,
      cost: cashValue,
      value: cashValue,
      profit: 0,
      returnRate: 0,
    },
  ];

  return rows;
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(amount)) + '원';
}

export function formatPercent(rate: number): string {
  return (rate * 100).toFixed(2) + '%';
}
