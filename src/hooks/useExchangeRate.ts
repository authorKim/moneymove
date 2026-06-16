import { useEffect } from 'react'
import { useSupabaseStore } from '../store/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useExchangeRate() {
  const { settings, updateSettings } = useSupabaseStore()
  const { user } = useAuth()

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD')
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        const rate = data.rates?.KRW
        if (rate && typeof rate === 'number' && user) {
          await updateSettings({
            exchangeRate: rate,
            rateUpdatedAt: new Date().toISOString(),
          }, user.id)
        }
      } catch {
        // Use stored exchange rate on failure
      }
    }

    // Only fetch if no rate yet or last update was more than 1 hour ago
    const lastUpdate = settings.rateUpdatedAt
      ? new Date(settings.rateUpdatedAt).getTime()
      : 0
    const hourAgo = Date.now() - 60 * 60 * 1000

    if (!settings.rateUpdatedAt || lastUpdate < hourAgo) {
      fetchRate()
    }
  }, [user?.id])

  return {
    rate: settings.exchangeRate,
    updatedAt: settings.rateUpdatedAt,
  }
}
