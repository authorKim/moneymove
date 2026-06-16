import { useState } from 'react'
import { useSupabaseStore } from '../store/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatPercent, calcReturn, calcProfit } from '../utils/calculations'
import { formatKRW } from '../utils/format'
import type { OverseasStock, DomesticStock, AlternativeAsset } from '../types'

type Tab = 'overseas' | 'domestic' | 'alternative'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now()
}

const categoryLabels: Record<string, string> = {
  core_us: '미국 코어',
  core_kr: '한국 코어',
  satellite_us: '미국 위성',
  satellite_kr: '한국 위성',
}

// ──────────────── Overseas Modal ────────────────
function OverseasModal({
  initial,
  exchangeRate,
  onSave,
  onClose,
}: {
  initial?: OverseasStock
  exchangeRate: number
  onSave: (s: OverseasStock) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<OverseasStock>(
    initial ?? {
      id: genId(), name: '', buyDate: '',
      krwCost: 0, krwValue: 0, usdCost: 0, usdValue: 0,
      category: 'core_us',
    }
  )

  const [rawValues, setRawValues] = useState({
    krwCost: initial ? String(initial.krwCost) : '',
    krwValue: initial ? String(initial.krwValue) : '',
    usdCost: initial ? String(initial.usdCost) : '',
    usdValue: initial ? String(initial.usdValue) : '',
  })

  const update = (k: keyof OverseasStock, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const handleNumericChange = (field: keyof typeof rawValues, val: string) => {
    setRawValues(r => ({ ...r, [field]: val }))
    const num = parseFloat(val)
    if (!isNaN(num)) update(field as keyof OverseasStock, num)
    else if (val === '' || val === '-') update(field as keyof OverseasStock, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:w-[520px] max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">{initial ? '해외주식 수정' : '해외주식 추가'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">종목명</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">매수일</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.buyDate}
                onChange={(e) => update('buyDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">카테고리</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => update('category', e.target.value as OverseasStock['category'])}
              >
                <option value="core_us">미국 코어</option>
                <option value="core_kr">한국 코어 (해외)</option>
                <option value="satellite_us">미국 위성</option>
                <option value="satellite_kr">한국 위성 (해외)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">매수 원가 (KRW)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawValues.krwCost}
                  onChange={(e) => handleNumericChange('krwCost', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">평가금 (KRW)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawValues.krwValue}
                  onChange={(e) => handleNumericChange('krwValue', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">매수 원가 (USD)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawValues.usdCost}
                  onChange={(e) => handleNumericChange('usdCost', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">평가금 (USD)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawValues.usdValue}
                  onChange={(e) => handleNumericChange('usdValue', e.target.value)}
                />
              </div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
              현재 적용 환율: ₩{exchangeRate.toLocaleString()} / USD
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
                저장
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200">
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ──────────────── Domestic Modal ────────────────
function DomesticModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: DomesticStock
  onSave: (s: DomesticStock) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<DomesticStock>(
    initial ?? { id: genId(), name: '', buyDate: '', cost: 0, value: 0, category: 'core_kr' }
  )
  const [rawValues, setRawValues] = useState({
    cost: initial ? String(initial.cost) : '',
    value: initial ? String(initial.value) : '',
  })

  const update = (k: keyof DomesticStock, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const handleNumericChange = (field: 'cost' | 'value', val: string) => {
    setRawValues(r => ({ ...r, [field]: val }))
    const num = parseFloat(val)
    if (!isNaN(num)) update(field, num)
    else if (val === '' || val === '-') update(field, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:w-[400px]">
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">{initial ? '국내주식 수정' : '국내주식 추가'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">종목명</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">매수일</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.buyDate}
                onChange={(e) => update('buyDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">카테고리</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => update('category', e.target.value as DomesticStock['category'])}
              >
                <option value="core_kr">한국 코어</option>
                <option value="satellite_kr">한국 위성</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">매수 원가</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawValues.cost}
                  onChange={(e) => handleNumericChange('cost', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">평가금</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawValues.value}
                  onChange={(e) => handleNumericChange('value', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
                저장
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200">
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ──────────────── Alternative Modal ────────────────
function AltModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: AlternativeAsset
  onSave: (a: AlternativeAsset) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<AlternativeAsset>(
    initial ?? { id: genId(), name: '', cost: 0, value: 0 }
  )
  const [rawValues, setRawValues] = useState({
    cost: initial ? String(initial.cost) : '',
    value: initial ? String(initial.value) : '',
  })

  const update = (k: keyof AlternativeAsset, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const handleNumericChange = (field: 'cost' | 'value', val: string) => {
    setRawValues(r => ({ ...r, [field]: val }))
    const num = parseFloat(val)
    if (!isNaN(num)) update(field, num)
    else if (val === '' || val === '-') update(field, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:w-[360px]">
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">{initial ? '대체자산 수정' : '대체자산 추가'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">자산명</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">매수 원가</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawValues.cost}
                  onChange={(e) => handleNumericChange('cost', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">평가금</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawValues.value}
                  onChange={(e) => handleNumericChange('value', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
                저장
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200">
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ──────────────── Mobile Card ────────────────
function StockCard({ name, sub, profit, ret, onEdit, onDelete }: {
  name: string; sub: string; profit: number; ret: number
  onEdit: () => void; onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-mono font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {profit >= 0 ? '+' : ''}{profit.toLocaleString()}원
          </div>
          <div className={`text-xs font-mono ${ret >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatPercent(ret)}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onEdit} className="flex-1 text-xs text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50">
          수정
        </button>
        <button onClick={onDelete} className="flex-1 text-xs text-red-500 border border-red-200 rounded-lg py-1.5 hover:bg-red-50">
          삭제
        </button>
      </div>
    </div>
  )
}

// ──────────────── Main Page ────────────────
export default function DirectInvestment() {
  const {
    overseasStocks, domesticStocks, alternativeAssets, settings,
    addOverseasStock, updateOverseasStock, deleteOverseasStock,
    addDomesticStock, updateDomesticStock, deleteDomesticStock,
    addAlternativeAsset, updateAlternativeAsset, deleteAlternativeAsset,
  } = useSupabaseStore()
  const { user } = useAuth()

  const [tab, setTab] = useState<Tab>('overseas')
  const [overseasModal, setOverseasModal] = useState<{ open: boolean; item?: OverseasStock }>({ open: false })
  const [domesticModal, setDomesticModal] = useState<{ open: boolean; item?: DomesticStock }>({ open: false })
  const [altModal, setAltModal] = useState<{ open: boolean; item?: AlternativeAsset }>({ open: false })

  const uid = user?.id ?? ''

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">직접투자</h2>
        <div>
          {tab === 'overseas' && (
            <button onClick={() => setOverseasModal({ open: true })} className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              + 해외주식
            </button>
          )}
          {tab === 'domestic' && (
            <button onClick={() => setDomesticModal({ open: true })} className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              + 국내주식
            </button>
          )}
          {tab === 'alternative' && (
            <button onClick={() => setAltModal({ open: true })} className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              + 대체자산
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['overseas', 'domestic', 'alternative'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 md:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t === 'overseas' ? '해외주식' : t === 'domestic' ? '국내주식' : '대체자산'}
          </button>
        ))}
      </div>

      {/* Overseas Tab */}
      {tab === 'overseas' && (
        <>
          {/* PC Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">종목명</th>
                  <th className="text-left px-4 py-3 font-medium">매수일</th>
                  <th className="text-left px-4 py-3 font-medium">카테고리</th>
                  <th className="text-right px-4 py-3 font-medium">원가 (KRW)</th>
                  <th className="text-right px-4 py-3 font-medium">평가금 (KRW)</th>
                  <th className="text-right px-4 py-3 font-medium">원가 (USD)</th>
                  <th className="text-right px-4 py-3 font-medium">평가금 (USD)</th>
                  <th className="text-right px-4 py-3 font-medium">수익금</th>
                  <th className="text-right px-4 py-3 font-medium">수익률</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {overseasStocks.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-400">해외주식을 추가해주세요</td></tr>
                )}
                {overseasStocks.map((s) => {
                  const profit = calcProfit(s.krwCost, s.krwValue)
                  const ret = calcReturn(s.krwCost, s.krwValue)
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.buyDate}</td>
                      <td className="px-4 py-3 text-gray-500">{categoryLabels[s.category]}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{s.krwCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{s.krwValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">${s.usdCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">${s.usdValue.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-mono tabular-nums ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono tabular-nums ${ret >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatPercent(ret)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setOverseasModal({ open: true, item: s })} className="text-blue-600 hover:underline text-xs mr-2">수정</button>
                        <button onClick={() => { if (confirm('삭제하시겠습니까?')) deleteOverseasStock(s.id) }} className="text-red-500 hover:underline text-xs">삭제</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {overseasStocks.length > 0 && (
                <tfoot className="bg-gray-50 font-semibold text-sm">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-gray-700">합계</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{overseasStocks.reduce((s, x) => s + x.krwCost, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{overseasStocks.reduce((s, x) => s + x.krwValue, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">${overseasStocks.reduce((s, x) => s + x.usdCost, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">${overseasStocks.reduce((s, x) => s + x.usdValue, 0).toLocaleString()}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {overseasStocks.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">해외주식을 추가해주세요</div>
            )}
            {overseasStocks.map((s) => (
              <StockCard
                key={s.id}
                name={s.name}
                sub={`${categoryLabels[s.category]} · ${s.buyDate || '-'} · ${formatKRW(s.krwValue)}`}
                profit={calcProfit(s.krwCost, s.krwValue)}
                ret={calcReturn(s.krwCost, s.krwValue)}
                onEdit={() => setOverseasModal({ open: true, item: s })}
                onDelete={() => { if (confirm('삭제하시겠습니까?')) deleteOverseasStock(s.id) }}
              />
            ))}
          </div>
        </>
      )}

      {/* Domestic Tab */}
      {tab === 'domestic' && (
        <>
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">종목명</th>
                  <th className="text-left px-4 py-3 font-medium">매수일</th>
                  <th className="text-left px-4 py-3 font-medium">카테고리</th>
                  <th className="text-right px-4 py-3 font-medium">매수 원가</th>
                  <th className="text-right px-4 py-3 font-medium">평가금</th>
                  <th className="text-right px-4 py-3 font-medium">수익금</th>
                  <th className="text-right px-4 py-3 font-medium">수익률</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {domesticStocks.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">국내주식을 추가해주세요</td></tr>
                )}
                {domesticStocks.map((s) => {
                  const profit = calcProfit(s.cost, s.value)
                  const ret = calcReturn(s.cost, s.value)
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.buyDate}</td>
                      <td className="px-4 py-3 text-gray-500">{categoryLabels[s.category]}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{s.cost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{s.value.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-mono tabular-nums ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono tabular-nums ${ret >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatPercent(ret)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setDomesticModal({ open: true, item: s })} className="text-blue-600 hover:underline text-xs mr-2">수정</button>
                        <button onClick={() => { if (confirm('삭제하시겠습니까?')) deleteDomesticStock(s.id) }} className="text-red-500 hover:underline text-xs">삭제</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {domesticStocks.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">국내주식을 추가해주세요</div>
            )}
            {domesticStocks.map((s) => (
              <StockCard
                key={s.id}
                name={s.name}
                sub={`${categoryLabels[s.category]} · ${s.buyDate || '-'} · ${formatKRW(s.value)}`}
                profit={calcProfit(s.cost, s.value)}
                ret={calcReturn(s.cost, s.value)}
                onEdit={() => setDomesticModal({ open: true, item: s })}
                onDelete={() => { if (confirm('삭제하시겠습니까?')) deleteDomesticStock(s.id) }}
              />
            ))}
          </div>
        </>
      )}

      {/* Alternative Tab */}
      {tab === 'alternative' && (
        <>
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">자산명</th>
                  <th className="text-right px-4 py-3 font-medium">매수 원가</th>
                  <th className="text-right px-4 py-3 font-medium">평가금</th>
                  <th className="text-right px-4 py-3 font-medium">수익금</th>
                  <th className="text-right px-4 py-3 font-medium">수익률</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {alternativeAssets.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">대체자산을 추가해주세요</td></tr>
                )}
                {alternativeAssets.map((a) => {
                  const profit = calcProfit(a.cost, a.value)
                  const ret = calcReturn(a.cost, a.value)
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{a.cost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{a.value.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-mono tabular-nums ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono tabular-nums ${ret >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatPercent(ret)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setAltModal({ open: true, item: a })} className="text-blue-600 hover:underline text-xs mr-2">수정</button>
                        <button onClick={() => { if (confirm('삭제하시겠습니까?')) deleteAlternativeAsset(a.id) }} className="text-red-500 hover:underline text-xs">삭제</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {alternativeAssets.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">대체자산을 추가해주세요</div>
            )}
            {alternativeAssets.map((a) => (
              <StockCard
                key={a.id}
                name={a.name}
                sub={`대체자산 · ${formatKRW(a.value)}`}
                profit={calcProfit(a.cost, a.value)}
                ret={calcReturn(a.cost, a.value)}
                onEdit={() => setAltModal({ open: true, item: a })}
                onDelete={() => { if (confirm('삭제하시겠습니까?')) deleteAlternativeAsset(a.id) }}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {overseasModal.open && (
        <OverseasModal
          initial={overseasModal.item}
          exchangeRate={settings.exchangeRate}
          onSave={(s) => {
            if (overseasModal.item) updateOverseasStock(s, uid)
            else addOverseasStock(s, uid)
            setOverseasModal({ open: false })
          }}
          onClose={() => setOverseasModal({ open: false })}
        />
      )}
      {domesticModal.open && (
        <DomesticModal
          initial={domesticModal.item}
          onSave={(s) => {
            if (domesticModal.item) updateDomesticStock(s, uid)
            else addDomesticStock(s, uid)
            setDomesticModal({ open: false })
          }}
          onClose={() => setDomesticModal({ open: false })}
        />
      )}
      {altModal.open && (
        <AltModal
          initial={altModal.item}
          onSave={(a) => {
            if (altModal.item) updateAlternativeAsset(a, uid)
            else addAlternativeAsset(a, uid)
            setAltModal({ open: false })
          }}
          onClose={() => setAltModal({ open: false })}
        />
      )}
    </div>
  )
}
