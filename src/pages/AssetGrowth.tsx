import { useState, useEffect } from 'react'
import { useSupabaseStore } from '../store/supabase'
import { useAuth } from '../contexts/AuthContext'
import { calcTotalAsset } from '../utils/calculations'
import { formatKRW, formatKRWKorean } from '../utils/format'
import type { GrowthRecord } from '../types'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now()
}

export default function AssetGrowth() {
  const {
    growthRecords, addGrowthRecord, updateGrowthRecord, deleteGrowthRecord,
    overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets, settings,
  } = useSupabaseStore()
  const { user } = useAuth()

  const uid = user?.id ?? ''
  const totalAsset = calcTotalAsset(overseasStocks, domesticStocks, alternativeAssets, nonInvestAssets)
  const progressPct = Math.min((totalAsset / settings.targetAsset) * 100, 100)

  const [showAutoModal, setShowAutoModal] = useState(false)
  const [editItem, setEditItem] = useState<GrowthRecord | null>(null)
  const [form, setForm] = useState<Omit<GrowthRecord, 'id' | 'isAuto'>>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    totalAsset: totalAsset,
    memo: '',
  })
  const [rawAsset, setRawAsset] = useState(String(totalAsset || ''))

  useEffect(() => {
    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth() + 1
    const exists = growthRecords.some((r) => r.year === thisYear && r.month === thisMonth)
    if (!exists && totalAsset > 0) {
      setShowAutoModal(true)
    }
  }, [growthRecords.length])

  const autoSnapshot = () => {
    const now = new Date()
    addGrowthRecord({
      id: genId(),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      totalAsset,
      memo: '자동 스냅샷',
      isAuto: true,
    }, uid)
    setShowAutoModal(false)
  }

  const update = (k: keyof typeof form, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const handleAssetChange = (val: string) => {
    setRawAsset(val)
    const num = parseFloat(val)
    if (!isNaN(num)) update('totalAsset', num)
    else if (val === '' || val === '-') update('totalAsset', 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editItem) {
      updateGrowthRecord({ ...form, id: editItem.id, isAuto: false }, uid)
      setEditItem(null)
    } else {
      addGrowthRecord({ ...form, id: genId(), isAuto: false }, uid)
    }
    setForm({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, totalAsset, memo: '' })
    setRawAsset(String(totalAsset))
  }

  const startEdit = (r: GrowthRecord) => {
    setEditItem(r)
    setForm({ year: r.year, month: r.month, totalAsset: r.totalAsset, memo: r.memo })
    setRawAsset(String(r.totalAsset))
  }

  const sortedRecords = [...growthRecords].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  const yearsLeft = settings.targetYear - new Date().getFullYear()

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">자산증식</h2>

      {/* Auto Snapshot Modal */}
      {showAutoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">이번 달 기록이 없습니다</h3>
            <p className="text-sm text-gray-600 mb-4">
              현재 자산(<span className="font-mono font-semibold">{formatKRW(totalAsset)}</span>)을
              이번 달 자동 스냅샷으로 기록할까요?
            </p>
            <div className="flex gap-2">
              <button onClick={autoSnapshot} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
                기록하기
              </button>
              <button onClick={() => setShowAutoModal(false)} className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200">
                나중에
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">목표 달성 현황</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              목표: {formatKRW(settings.targetAsset)} ({settings.targetYear}년{yearsLeft > 0 ? `, ${yearsLeft}년 후` : ''})
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg md:text-xl font-bold font-mono tabular-nums text-blue-600">{formatKRW(totalAsset)}</div>
            <div className="text-xs text-gray-400">{formatKRWKorean(totalAsset)}</div>
            <div className="text-xs text-gray-500">{progressPct.toFixed(1)}% 달성</div>
          </div>
        </div>
        <div className="h-3 md:h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{editItem ? '기록 수정' : '기록 추가'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">연도</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.year}
                  onChange={(e) => update('year', Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">월</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.month}
                  onChange={(e) => update('month', Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">총 자산</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                value={rawAsset}
                onChange={(e) => handleAssetChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">비고</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.memo}
                onChange={(e) => update('memo', e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
                {editItem ? '수정 저장' : '추가'}
              </button>
              {editItem && (
                <button type="button" onClick={() => { setEditItem(null); setForm({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, totalAsset, memo: '' }); setRawAsset(String(totalAsset)) }}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium">
                  취소
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Records Table */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">월별 자산 기록</h3>
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
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedRecords.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">자산 기록이 없습니다</td></tr>
                )}
                {sortedRecords.map((r, i) => {
                  const prev = sortedRecords[i + 1]
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
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => startEdit(r)} className="text-blue-600 hover:underline text-xs mr-2">수정</button>
                        <button onClick={() => { if (confirm('삭제하시겠습니까?')) deleteGrowthRecord(r.id) }} className="text-red-500 hover:underline text-xs">삭제</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-100">
            {sortedRecords.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">자산 기록이 없습니다</div>
            )}
            {sortedRecords.map((r, i) => {
              const prev = sortedRecords[i + 1]
              const diff = prev ? r.totalAsset - prev.totalAsset : null
              return (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm font-semibold">{r.year}.{String(r.month).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">{r.memo || (r.isAuto ? '자동' : '수동')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{formatKRW(r.totalAsset)}</div>
                    {diff !== null && (
                      <div className={`text-xs font-mono ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {diff >= 0 ? '+' : ''}{formatKRW(diff)}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => startEdit(r)} className="text-xs text-blue-600">수정</button>
                      <button onClick={() => { if (confirm('삭제?')) deleteGrowthRecord(r.id) }} className="text-xs text-red-500">삭제</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
