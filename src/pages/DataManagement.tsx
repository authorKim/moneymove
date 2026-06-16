import { useRef, useState } from 'react'
import { useSupabaseStore } from '../store/supabase'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  exportOverseasStocks,
  exportDomesticStocks,
  exportAlternativeAssets,
  exportDividends,
  exportGrowthRecords,
  exportNonInvestAssets,
  parseCSV,
} from '../utils/csv'
import type { OverseasStock, DomesticStock, AlternativeAsset, Dividend, GrowthRecord } from '../types'

type ImportSection = 'overseas' | 'domestic' | 'alternative' | 'dividends' | 'growth'

const sectionLabels: Record<ImportSection, string> = {
  overseas: '해외주식', domestic: '국내주식', alternative: '대체자산',
  dividends: '배당 내역', growth: '자산증식',
}

export default function DataManagement() {
  const store = useSupabaseStore()
  const { user } = useAuth()
  const uid = user?.id ?? ''
  const fileRef = useRef<HTMLInputElement>(null)
  const [importSection, setImportSection] = useState<ImportSection>('overseas')
  const [preview, setPreview] = useState<object[] | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    try {
      const data = await parseCSV<object>(file)
      setPreview(data.slice(0, 5))
    } catch {
      setPreview(null)
    }
  }

  const handleImport = async () => {
    if (!importFile) return
    try {
      const data = await parseCSV<Record<string, unknown>>(importFile)

      if (importSection === 'overseas') {
        const stocks = data as unknown as OverseasStock[]
        for (const s of stocks) await store.addOverseasStock(s, uid)
      } else if (importSection === 'domestic') {
        const stocks = data as unknown as DomesticStock[]
        for (const s of stocks) await store.addDomesticStock(s, uid)
      } else if (importSection === 'alternative') {
        const assets = data as unknown as AlternativeAsset[]
        for (const a of assets) await store.addAlternativeAsset(a, uid)
      } else if (importSection === 'dividends') {
        const divs = data as unknown as Dividend[]
        for (const d of divs) await store.addDividend(d, uid)
      } else if (importSection === 'growth') {
        const records = data as unknown as GrowthRecord[]
        for (const r of records) await store.addGrowthRecord(r, uid)
      }

      alert('가져오기 완료!')
      setPreview(null)
      setImportFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      alert('가져오기 실패. CSV 형식을 확인해주세요.')
    }
  }

  const handleReset = async () => {
    // Delete all data from Supabase
    if (!uid) return
    await Promise.all([
      supabase.from('overseas_stocks').delete().eq('user_id', uid),
      supabase.from('domestic_stocks').delete().eq('user_id', uid),
      supabase.from('alternative_assets').delete().eq('user_id', uid),
      supabase.from('dividends').delete().eq('user_id', uid),
      supabase.from('growth_records').delete().eq('user_id', uid),
    ])
    await store.loadAll(uid)
    setShowResetConfirm(false)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">데이터 관리</h2>

      {/* Export */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">CSV 내보내기</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '해외주식', fn: () => exportOverseasStocks(store.overseasStocks) },
            { label: '국내주식', fn: () => exportDomesticStocks(store.domesticStocks) },
            { label: '대체자산', fn: () => exportAlternativeAssets(store.alternativeAssets) },
            { label: '비투자자산', fn: () => exportNonInvestAssets(store.nonInvestAssets) },
            { label: '배당 내역', fn: () => exportDividends(store.dividends) },
            { label: '자산증식', fn: () => exportGrowthRecords(store.growthRecords) },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 border border-blue-200"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Import */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">CSV 가져오기</h3>
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 mb-4">
          가져오기는 기존 데이터에 병합(추가)됩니다. Supabase에 직접 저장됩니다.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">섹션 선택</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={importSection}
              onChange={(e) => setImportSection(e.target.value as ImportSection)}
            >
              {(Object.keys(sectionLabels) as ImportSection[]).map((k) => (
                <option key={k} value={k}>{sectionLabels[k]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">CSV 파일 선택</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-200 file:rounded-lg file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </div>

          {preview && preview.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">미리보기 (최대 5행)</p>
              <div className="overflow-x-auto">
                <table className="text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((k) => (
                        <th key={k} className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {Object.values(row as Record<string, unknown>).map((v, j) => (
                          <td key={j} className="px-3 py-1.5 font-mono">{String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!importFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            가져오기 실행
          </button>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-4 md:p-6">
        <h3 className="font-semibold text-red-700 mb-2">전체 데이터 초기화</h3>
        <p className="text-sm text-gray-600 mb-4">
          Supabase에서 모든 투자, 자산, 배당, 자산증식 데이터가 삭제됩니다. 설정은 유지됩니다.
        </p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 border border-red-200"
          >
            초기화 버튼 표시
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-red-700">정말 초기화하시겠습니까?</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              확인 (초기화)
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
