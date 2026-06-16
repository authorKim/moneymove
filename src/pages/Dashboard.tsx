import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../store';
import {
  calcTotalAsset,
  calcTotalInvestValue,
  calcTotalInvestCost,
  calcReturn,
  calcProfit,
  formatKRW,
  formatPercent,
} from '../utils/calculations';

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316',
];

export default function Dashboard() {
  const {
    overseasStocks,
    domesticStocks,
    alternativeAssets,
    nonInvestAssets,
    growthRecords,
    settings,
  } = useStore();

  const totalAsset = calcTotalAsset(overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets);
  const totalInvestValue = calcTotalInvestValue(overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets);
  const totalInvestCost = calcTotalInvestCost(overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets);
  const totalProfit = calcProfit(totalInvestCost, totalInvestValue);
  const totalReturn = calcReturn(totalInvestCost, totalInvestValue);

  // Pie chart data
  const overseasValue = overseasStocks.reduce((s, x) => s + x.krwValue, 0);
  const domesticValue = domesticStocks.reduce((s, x) => s + x.value, 0);
  const altValue = alternativeAssets.reduce((s, x) => s + x.value, 0);
  const pieData = [
    { name: '해외주식', value: overseasValue },
    { name: '국내주식', value: domesticValue },
    { name: '대체자산', value: altValue },
    { name: '채권', value: nonInvestAssets.bondValue },
    { name: '현금', value: nonInvestAssets.cash },
    { name: '보증금', value: nonInvestAssets.deposit },
    { name: '적금', value: nonInvestAssets.savings },
    { name: '청약', value: nonInvestAssets.subscription },
  ].filter((d) => d.value > 0);

  // Line chart data
  const sortedGrowth = [...growthRecords].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  const lineData = sortedGrowth.map((r) => ({
    name: `${r.year}.${String(r.month).padStart(2, '0')}`,
    total: r.totalAsset,
    target: settings.targetAsset,
  }));

  // Bar chart: target vs actual
  const { targetAllocation } = settings;
  const allocationLabels: { key: keyof typeof targetAllocation; label: string }[] = [
    { key: 'core_us', label: '미국코어' },
    { key: 'core_kr', label: '한국코어' },
    { key: 'satellite_us', label: '미국위성' },
    { key: 'satellite_kr', label: '한국위성' },
    { key: 'alternative', label: '대체자산' },
    { key: 'bonds', label: '채권' },
    { key: 'cash', label: '현금' },
  ];

  const coreUsVal = overseasStocks.filter(s => s.category === 'core_us').reduce((sum, s) => sum + s.krwValue, 0);
  const coreKrVal = [
    ...overseasStocks.filter(s => s.category === 'core_kr').map(s => s.krwValue),
    ...domesticStocks.filter(s => s.category === 'core_kr').map(s => s.value),
  ].reduce((a, b) => a + b, 0);
  const satUsVal = overseasStocks.filter(s => s.category === 'satellite_us').reduce((sum, s) => sum + s.krwValue, 0);
  const satKrVal = [
    ...overseasStocks.filter(s => s.category === 'satellite_kr').map(s => s.krwValue),
    ...domesticStocks.filter(s => s.category === 'satellite_kr').map(s => s.value),
  ].reduce((a, b) => a + b, 0);

  const actualValues: Record<string, number> = {
    core_us: totalAsset > 0 ? coreUsVal / totalAsset : 0,
    core_kr: totalAsset > 0 ? coreKrVal / totalAsset : 0,
    satellite_us: totalAsset > 0 ? satUsVal / totalAsset : 0,
    satellite_kr: totalAsset > 0 ? satKrVal / totalAsset : 0,
    alternative: totalAsset > 0 ? altValue / totalAsset : 0,
    bonds: totalAsset > 0 ? nonInvestAssets.bondValue / totalAsset : 0,
    cash: totalAsset > 0 ? (nonInvestAssets.cash + nonInvestAssets.deposit + nonInvestAssets.savings + nonInvestAssets.subscription) / totalAsset : 0,
  };

  const barData = allocationLabels.map(({ key, label }) => ({
    name: label,
    목표: Math.round(targetAllocation[key] * 100),
    실제: Math.round(actualValues[key] * 100),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
          환율: <span className="font-mono text-blue-600">₩{settings.exchangeRate.toLocaleString()}</span>
          {settings.rateUpdatedAt && (
            <span className="ml-2 text-gray-400">
              ({new Date(settings.rateUpdatedAt).toLocaleDateString('ko-KR')} 기준)
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">총 자산</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-gray-900">
            {formatKRW(totalAsset)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">투자 원금</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-gray-900">
            {formatKRW(totalInvestCost)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">수익금</p>
          <p className={`text-2xl font-bold font-mono tabular-nums ${totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {totalProfit >= 0 ? '+' : ''}{formatKRW(totalProfit)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">수익률</p>
          <p className={`text-2xl font-bold font-mono tabular-nums ${totalReturn >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {totalReturn >= 0 ? '+' : ''}{formatPercent(totalReturn)}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">자산 배분</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number | string) => typeof v === "number" ? formatKRW(v) : v} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              자산 데이터를 입력해주세요
            </div>
          )}
        </div>

        {/* Target vs Actual Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">목표 vs 실제 비중</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v: number | string) => v + '%'} />
              <Legend />
              <Bar dataKey="목표" fill="#93c5fd" radius={[3, 3, 0, 0]} />
              <Bar dataKey="실제" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Growth Line Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">자산증식 이력</h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${(v / 1e8).toFixed(1)}억`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v: number | string) => typeof v === "number" ? formatKRW(v) : v} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="실제 자산"
              />
              <ReferenceLine
                y={settings.targetAsset}
                stroke="#ef4444"
                strokeDasharray="6 3"
                label={{ value: '목표', position: 'right', fontSize: 11, fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400">
            자산증식 기록이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
