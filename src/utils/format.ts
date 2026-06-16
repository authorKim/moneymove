/**
 * 원화 포맷 유틸리티
 */

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(amount)) + '원'
}

export function formatKRWKorean(amount: number): string {
  const n = Math.round(amount)
  if (n === 0) return '0원'

  const eok = Math.floor(n / 100000000)
  const rem = n % 100000000
  const cheon = Math.floor(rem / 10000000)
  const baek = Math.floor((rem % 10000000) / 1000000)

  // 1억 이상
  if (eok >= 1) {
    if (cheon > 0) {
      return `${eok}억 ${cheon}천만원`
    }
    return `${eok}억원`
  }

  // 1천만 이상
  if (cheon >= 1) {
    if (baek > 0) {
      return `${cheon}천 ${baek}백만원`
    }
    return `${cheon}천만원`
  }

  // 100만 이상
  const totalMan = Math.floor(n / 10000)
  if (totalMan >= 100) {
    const b = Math.floor(totalMan / 100)
    return `${b * 100}만원`
  }

  // 1만 이상
  if (totalMan >= 1) {
    const r = Math.floor((n % 10000) / 1000)
    if (r > 0) {
      return `${totalMan}만 ${r}천원`
    }
    return `${totalMan}만원`
  }

  return `${n.toLocaleString()}원`
}

export function formatPercent(rate: number): string {
  const sign = rate >= 0 ? '+' : ''
  return sign + (rate * 100).toFixed(2) + '%'
}
