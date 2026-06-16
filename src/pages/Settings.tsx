import { useState } from 'react'
import { useSupabaseStore } from '../store/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatKRWKorean } from '../utils/format'
import type { TargetAllocation } from '../types'

const allocationKeys: { key: keyof TargetAllocation; label: string }[] = [
  { key: 'core_us', label: '미국 코어' },
  { key: 'core_kr', label: '한국 코어' },
  { key: 'satellite_us', label: '미국 위성' },
  { key: 'satellite_kr', label: '한국 위성' },
  { key: 'alternative', label: '대체자산' },
  { key: 'bonds', label: '채권' },
  { key: 'cash', label: '현금성 자산' },
]

export default function Settings() {
  const { settings, updateSettings } = useSupabaseStore()
  const { user } = useAuth()
  const uid = user?.id ?? ''

  const [alloc, setAlloc] = useState<TargetAllocation>({ ...settings.targetAllocation })
  const [targetAsset, setTargetAsset] = useState(settings.targetAsset)
  const [rawTargetAsset, setRawTargetAsset] = useState(String(settings.targetAsset))
  const [targetYear, setTargetYear] = useState(settings.targetYear)
  const [manualRate, setManualRate] = useState(settings.exchangeRate)
  const [rawRate, setRawRate] = useState(String(settings.exchangeRate))
  const [savedAlloc, setSavedAlloc] = useState(false)
  const [savedMain, setSavedMain] = useState(false)
  const [rateFetching, setRateFetching] = useState(false)

  const totalAlloc = Object.values(alloc).reduce((s, v) => s + v, 0)
  const isAllocValid = Math.abs(totalAlloc - 1) < 0.001

  const updateAlloc = (key: keyof TargetAllocation, val: number) => {
    setAlloc((a) => ({ ...a, [key]: val / 100 }))
  }

  const saveAlloc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAllocValid) return
    await updateSettings({ targetAllocation: alloc }, uid)
    setSavedAlloc(true)
    setTimeout(() => setSavedAlloc(false), 2000)
  }

  const saveMain = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings({ targetAsset, targetYear }, uid)
    setSavedMain(true)
    setTimeout(() => setSavedMain(false), 2000)
  }

  const saveRate = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings({ exchangeRate: manualRate, rateUpdatedAt: new Date().toISOString() }, uid)
  }

  const fetchRate = async () => {
    setRateFetching(true)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD')
      if (!res.ok) throw new Error('')
      const data = await res.json()
      const rate = data.rates?.KRW
      if (rate) {
        setManualRate(rate)
        setRawRate(String(rate))
        await updateSettings({ exchangeRate: rate, rateUpdatedAt: new Date().toISOString() }, uid)
        alert(`환율 갱신 완료: ₩${rate.toLocaleString()}`)
      }
    } catch {
      alert('환율 조회에 실패했습니다. 수동으로 입력해주세요.')
    } finally {
      setRateFetching(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">설정</h2>
      {user && (
        <div className="text-xs text-gray-400 bg-white px-3 py-2 rounded-lg border border-gray-100 inline-block">
          로그인: {user.email}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Target Allocation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">목표 자산 배분</h3>
          <form onSubmit={saveAlloc} className="space-y-3">
            {allocationKeys.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-24 text-sm text-gray-700 shrink-0">{label}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono"
                  value={(alloc[key] * 100).toFixed(1)}
                  onChange={(e) => updateAlloc(key, Number(e.target.value))}
                />
                <span className="text-sm text-gray-500 w-4">%</span>
              </div>
            ))}
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
              isAllocValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}>
              <span>합계</span>
              <span className="font-mono">{(totalAlloc * 100).toFixed(1)}%</span>
            </div>
            {!isAllocValid && (
              <p className="text-xs text-red-500">합계가 100%여야 합니다 (현재: {(totalAlloc * 100).toFixed(1)}%)</p>
            )}
            <button
              type="submit"
              disabled={!isAllocValid}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                savedAlloc ? 'bg-green-600 text-white'
                : isAllocValid ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {savedAlloc ? '저장되었습니다!' : '목표 배분 저장'}
            </button>
          </form>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Target Asset */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">목표 자산</h3>
            <form onSubmit={saveMain} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">목표 금액 (원)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawTargetAsset}
                  onChange={(e) => {
                    setRawTargetAsset(e.target.value)
                    const num = parseFloat(e.target.value)
                    if (!isNaN(num)) setTargetAsset(num)
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">{formatKRWKorean(targetAsset)}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">목표 연도</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                />
              </div>
              <button
                type="submit"
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  savedMain ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {savedMain ? '저장되었습니다!' : '저장'}
              </button>
            </form>
          </div>

          {/* Exchange Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-1">환율 설정</h3>
            {settings.rateUpdatedAt && (
              <p className="text-xs text-gray-400 mb-3">
                마지막 갱신: {new Date(settings.rateUpdatedAt).toLocaleString('ko-KR')}
              </p>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold font-mono text-blue-600">
                ₩{settings.exchangeRate.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">/ USD</span>
            </div>
            <form onSubmit={saveRate} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={rawRate}
                  onChange={(e) => {
                    setRawRate(e.target.value)
                    const num = parseFloat(e.target.value)
                    if (!isNaN(num)) setManualRate(num)
                  }}
                />
                <button type="submit" className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  수동 설정
                </button>
              </div>
              <button
                type="button"
                onClick={fetchRate}
                disabled={rateFetching}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {rateFetching ? '조회 중...' : '실시간 환율 갱신'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
