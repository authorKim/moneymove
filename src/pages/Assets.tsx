import { useState } from 'react'
import { useSupabaseStore } from '../store/supabase'
import { useAuth } from '../contexts/AuthContext'
import { calcTotalAsset } from '../utils/calculations'
import { formatKRW, formatKRWKorean } from '../utils/format'
import type { NonInvestAssets } from '../types'

export default function Assets() {
  const { nonInvestAssets, updateNonInvestAssets, overseasStocks, domesticStocks, alternativeAssets } = useSupabaseStore()
  const { user } = useAuth()
  const [form, setForm] = useState<NonInvestAssets>(nonInvestAssets)
  const [saved, setSaved] = useState(false)

  const [rawValues, setRawValues] = useState({
    cash: String(nonInvestAssets.cash || ''),
    deposit: String(nonInvestAssets.deposit || ''),
    savings: String(nonInvestAssets.savings || ''),
    subscription: String(nonInvestAssets.subscription || ''),
    bonds: String(nonInvestAssets.bonds || ''),
    bondValue: String(nonInvestAssets.bondValue || ''),
  })

  const update = (k: keyof NonInvestAssets, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const handleNumericChange = (field: keyof typeof rawValues, val: string) => {
    setRawValues(r => ({ ...r, [field]: val }))
    const num = parseFloat(val)
    if (!isNaN(num)) update(field as keyof NonInvestAssets, num)
    else if (val === '' || val === '-') update(field as keyof NonInvestAssets, 0)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      updateNonInvestAssets(form, user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const totalAsset = calcTotalAsset(overseasStocks, domesticStocks, alternativeAssets, form)

  const assetRows = [
    { label: '현금', amount: form.cash, liquidity: '즉시' },
    { label: '보증금', amount: form.deposit, liquidity: '비유동' },
    { label: '적금', amount: form.savings, liquidity: '단기' },
    { label: '청약', amount: form.subscription, liquidity: '비유동' },
    { label: '채권 원가', amount: form.bonds, liquidity: '중기' },
    { label: '채권 평가금', amount: form.bondValue, liquidity: '중기' },
  ].filter((r) => r.amount > 0)

  const inputFields = [
    { key: 'cash' as const, label: '현금' },
    { key: 'deposit' as const, label: '보증금' },
    { key: 'savings' as const, label: '적금' },
    { key: 'subscription' as const, label: '청약' },
    { key: 'bonds' as const, label: '채권 원가' },
    { key: 'bondValue' as const, label: '채권 평가금' },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">비투자 자산</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">자산 입력</h3>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {inputFields.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                    value={rawValues[key]}
                    placeholder="0"
                    onChange={(e) => handleNumericChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">메모</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                rows={2}
                value={form.memo}
                onChange={(e) => update('memo', e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saved ? '저장되었습니다!' : '저장'}
            </button>
          </form>
        </div>

        {/* Asset Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">자산 현황</h3>
            <div>
              <p className="text-sm text-gray-500">{formatKRW(totalAsset)}</p>
              <p className="text-xs text-gray-400">{formatKRWKorean(totalAsset)}</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">자산 종류</th>
                <th className="text-right px-4 py-3 font-medium">금액</th>
                <th className="text-right px-4 py-3 font-medium">비중</th>
                <th className="text-center px-4 py-3 font-medium hidden md:table-cell">유동성</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assetRows.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">자산을 입력해주세요</td></tr>
              )}
              {assetRows.map((row) => (
                <tr key={row.label} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    <div>{formatKRW(row.amount)}</div>
                    <div className="text-xs text-gray-400">{formatKRWKorean(row.amount)}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-600">
                    {totalAsset > 0 ? ((row.amount / totalAsset) * 100).toFixed(1) + '%' : '-'}
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      row.liquidity === '즉시' ? 'bg-green-100 text-green-700'
                      : row.liquidity === '비유동' ? 'bg-red-100 text-red-700'
                      : row.liquidity === '단기' ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {row.liquidity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {form.memo && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 bg-gray-50">
                    메모: {form.memo}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
