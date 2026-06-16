import { useSupabaseStore } from '../store/supabase'
import { calcInvestmentSummary, calcTotalAsset } from '../utils/calculations'
import { formatKRW, formatKRWKorean, formatPercent } from '../utils/format'

export default function InvestmentSummary() {
  const {
    overseasStocks, domesticStocks, alternativeAssets,
    nonInvestAssets, growthRecords, settings,
  } = useSupabaseStore()

  const totalAsset = calcTotalAsset(overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets)
  const rows = calcInvestmentSummary(
    overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets, settings.targetAllocation
  )

  const sortedGrowth = [...growthRecords].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">투자 종합</h2>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">대분류별 집계</h3>
          <div>
            <p className="text-sm text-gray-500 mt-0.5">{formatKRW(totalAsset)}</p>
            <p className="text-xs text-gray-400">{formatKRWKorean(totalAsset)}</p>
          </div>
        </div>
        {/* PC Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">분류</th>
                <th className="text-right px-4 py-3 font-medium">목표비중</th>
                <th className="text-right px-4 py-3 font-medium">목표금액</th>
                <th className="text-right px-4 py-3 font-medium">실제비중</th>
                <th className="text-right px-4 py-3 font-medium">투자원금</th>
                <th className="text-right px-4 py-3 font-medium">평가금액</th>
                <th className="text-right px-4 py-3 font-medium">수익금</th>
                <th className="text-right px-4 py-3 font-medium">수익률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row) => (
                <tr key={row.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-600">
                    {formatPercent(row.targetRatio)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-600">
                    {formatKRW(row.targetAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      Math.abs(row.actualRatio - row.targetRatio) < 0.02
                        ? 'bg-green-100 text-green-700'
                        : row.actualRatio > row.targetRatio
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {formatPercent(row.actualRatio)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatKRW(row.cost)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatKRW(row.value)}</td>
                  <td className={`px-4 py-3 text-right font-mono tabular-nums ${row.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.profit >= 0 ? '+' : ''}{formatKRW(row.profit)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono tabular-nums ${row.returnRate >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.returnRate !== 0 ? formatPercent(row.returnRate) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold text-sm border-t border-gray-200">
              <tr>
                <td className="px-4 py-3 text-gray-700">합계</td>
                <td className="px-4 py-3 text-right font-mono">{formatPercent(rows.reduce((s, r) => s + r.targetRatio, 0))}</td>
                <td className="px-4 py-3 text-right font-mono">{formatKRW(rows.reduce((s, r) => s + r.targetAmount, 0))}</td>
                <td className="px-4 py-3 text-right font-mono">{formatPercent(rows.reduce((s, r) => s + r.actualRatio, 0))}</td>
                <td className="px-4 py-3 text-right font-mono">{formatKRW(rows.reduce((s, r) => s + r.cost, 0))}</td>
                <td className="px-4 py-3 text-right font-mono">{formatKRW(rows.reduce((s, r) => s + r.value, 0))}</td>
                <td className="px-4 py-3 text-right font-mono text-green-600">{formatKRW(rows.reduce((s, r) => s + r.profit, 0))}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {rows.map((row) => (
            <div key={row.key} className="p-4">
              <div className="flex justify-between items-start">
                <div className="font-medium text-gray-900">{row.label}</div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  Math.abs(row.actualRatio - row.targetRatio) < 0.02
                    ? 'bg-green-100 text-green-700'
                    : row.actualRatio > row.targetRatio
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  실제 {formatPercent(row.actualRatio)} / 목표 {formatPercent(row.targetRatio)}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>평가금: <span className="font-mono text-gray-800">{formatKRW(row.value)}</span></div>
                <div>수익금: <span className={`font-mono font-semibold ${row.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {row.profit >= 0 ? '+' : ''}{formatKRW(row.profit)}
                </span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">월별 자산 이력</h3>
        </div>
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">연월</th>
                <th className="text-right px-4 py-3 font-medium">총 자산</th>
                <th className="text-right px-4 py-3 font-medium">전월대비</th>
                <th className="text-left px-4 py-3 font-medium">비고</th>
                <th className="text-center px-4 py-3 font-medium">유형</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedGrowth.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">자산증식 기록이 없습니다</td></tr>
              )}
              {sortedGrowth.map((r, i) => {
                const prev = sortedGrowth[i + 1]
                const diff = prev ? r.totalAsset - prev.totalAsset : null
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono tabular-nums">{r.year}.{String(r.month).padStart(2, '0')}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatKRW(r.totalAsset)}</td>
                    <td className={`px-4 py-3 text-right font-mono tabular-nums ${diff === null ? '' : diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {diff === null ? '-' : `${diff >= 0 ? '+' : ''}${formatKRW(diff)}`}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.memo}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.isAuto ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {r.isAuto ? '자동' : '수동'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-100">
          {sortedGrowth.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">자산증식 기록이 없습니다</div>
          )}
          {sortedGrowth.map((r, i) => {
            const prev = sortedGrowth[i + 1]
            const diff = prev ? r.totalAsset - prev.totalAsset : null
            return (
              <div key={r.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-mono text-sm font-semibold">{r.year}.{String(r.month).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{r.memo || (r.isAuto ? '자동 기록' : '')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">{formatKRW(r.totalAsset)}</div>
                  {diff !== null && (
                    <div className={`text-xs font-mono ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {diff >= 0 ? '+' : ''}{formatKRW(diff)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
