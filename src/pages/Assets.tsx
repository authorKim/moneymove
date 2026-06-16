import { useState } from 'react';
import { useStore } from '../store';
import { calcTotalAsset, formatKRW } from '../utils/calculations';
import type { NonInvestAssets } from '../types';

export default function Assets() {
  const { nonInvestAssets, updateNonInvestAssets, overseasStocks, domesticStocks, alternativeAssets } = useStore();
  const [form, setForm] = useState<NonInvestAssets>(nonInvestAssets);
  const [saved, setSaved] = useState(false);

  const update = (k: keyof NonInvestAssets, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNonInvestAssets(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalAsset = calcTotalAsset(overseasStocks, domesticStocks, alternativeAssets, form);

  const assetRows = [
    { label: '현금', amount: form.cash, liquidity: '즉시' },
    { label: '보증금', amount: form.deposit, liquidity: '비유동' },
    { label: '적금', amount: form.savings, liquidity: '단기' },
    { label: '청약', amount: form.subscription, liquidity: '비유동' },
    { label: '채권 원가', amount: form.bonds, liquidity: '중기' },
    { label: '채권 평가금', amount: form.bondValue, liquidity: '중기' },
  ].filter((r) => r.amount > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">비투자 자산</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">자산 입력</h3>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">현금</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.cash}
                  onChange={(e) => update('cash', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">보증금</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.deposit}
                  onChange={(e) => update('deposit', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">적금</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.savings}
                  onChange={(e) => update('savings', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">청약</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.subscription}
                  onChange={(e) => update('subscription', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">채권 원가</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.bonds}
                  onChange={(e) => update('bonds', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">채권 평가금</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.bondValue}
                  onChange={(e) => update('bondValue', Number(e.target.value))}
                />
              </div>
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
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saved ? '저장되었습니다!' : '저장'}
            </button>
          </form>
        </div>

        {/* Asset Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">자산 현황</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">자산 종류</th>
                <th className="text-right px-4 py-3 font-medium">금액</th>
                <th className="text-right px-4 py-3 font-medium">비중</th>
                <th className="text-center px-4 py-3 font-medium">유동성</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assetRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    자산을 입력해주세요
                  </td>
                </tr>
              )}
              {assetRows.map((row) => (
                <tr key={row.label} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatKRW(row.amount)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-600">
                    {totalAsset > 0 ? ((row.amount / totalAsset) * 100).toFixed(1) + '%' : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.liquidity === '즉시'
                          ? 'bg-green-100 text-green-700'
                          : row.liquidity === '비유동'
                          ? 'bg-red-100 text-red-700'
                          : row.liquidity === '단기'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
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
  );
}
