import { useState } from 'react';
import { useStore } from '../store';
import type { Dividend } from '../types';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now();
}

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export default function Dividends() {
  const { dividends, addDividend, updateDividend, deleteDividend } = useStore();
  const [editItem, setEditItem] = useState<Dividend | null>(null);
  const [form, setForm] = useState<Omit<Dividend, 'id'>>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    stockName: '',
    amount: 0,
  });

  const update = (k: keyof typeof form, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateDividend({ ...form, id: editItem.id });
      setEditItem(null);
    } else {
      addDividend({ ...form, id: genId() });
    }
    setForm({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      stockName: '',
      amount: 0,
    });
  };

  const startEdit = (d: Dividend) => {
    setEditItem(d);
    setForm({ year: d.year, month: d.month, stockName: d.stockName, amount: d.amount });
  };

  const cancelEdit = () => {
    setEditItem(null);
    setForm({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      stockName: '',
      amount: 0,
    });
  };

  // Sort by year desc, month desc
  const sorted = [...dividends].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  // Monthly summary
  const years = Array.from(new Set(dividends.map((d) => d.year))).sort((a, b) => b - a);

  const monthlyByYear = years.map((year) => {
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const total = dividends
        .filter((d) => d.year === year && d.month === m)
        .reduce((s, d) => s + d.amount, 0);
      return { month: m, total };
    });
    const annual = monthly.reduce((s, m) => s + m.total, 0);
    return { year, monthly, annual };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">배당 내역</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editItem ? '배당 수정' : '배당 입력'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">연도</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  value={form.year}
                  onChange={(e) => update('year', Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">월</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.month}
                  onChange={(e) => update('month', Number(e.target.value))}
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">종목명</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.stockName}
                onChange={(e) => update('stockName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">배당금 (세후, 원)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                value={form.amount}
                onChange={(e) => update('amount', Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
              >
                {editItem ? '수정 저장' : '추가'}
              </button>
              {editItem && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Dividend List */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">배당 목록</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">연도</th>
                <th className="text-left px-4 py-3 font-medium">월</th>
                <th className="text-left px-4 py-3 font-medium">종목명</th>
                <th className="text-right px-4 py-3 font-medium">배당금</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    배당 내역을 입력해주세요
                  </td>
                </tr>
              )}
              {sorted.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono tabular-nums">{d.year}</td>
                  <td className="px-4 py-3">{d.month}월</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{d.stockName}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-green-600">
                    +{d.amount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(d)}
                      className="text-blue-600 hover:underline text-xs mr-2"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('삭제하시겠습니까?')) deleteDividend(d.id);
                      }}
                      className="text-red-500 hover:underline text-xs"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly/Annual Summary */}
      {monthlyByYear.length > 0 && (
        <div className="space-y-4">
          {monthlyByYear.map(({ year, monthly, annual }) => (
            <div key={year} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">{year}년 배당 요약</h3>
                <span className="text-sm font-mono text-green-600 font-semibold">
                  연간 합계: +{annual.toLocaleString()}원
                </span>
              </div>
              <div className="grid grid-cols-12 divide-x divide-gray-100 text-center">
                {monthly.map(({ month, total }) => (
                  <div key={month} className="py-3">
                    <div className="text-xs text-gray-500 mb-1">{month}월</div>
                    <div className={`text-xs font-mono ${total > 0 ? 'text-green-600 font-semibold' : 'text-gray-300'}`}>
                      {total > 0 ? total.toLocaleString() : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
