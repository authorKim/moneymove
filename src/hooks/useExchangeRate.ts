import { useEffect } from 'react';
import { useStore } from '../store';

export function useExchangeRate() {
  const { settings, updateSettings } = useStore();

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        const rate = data.rates?.KRW;
        if (rate && typeof rate === 'number') {
          updateSettings({
            exchangeRate: rate,
            rateUpdatedAt: new Date().toISOString(),
          });
        }
      } catch {
        // Use stored exchange rate on failure
      }
    };

    // Only fetch if no rate yet or last update was more than 1 hour ago
    const lastUpdate = settings.rateUpdatedAt
      ? new Date(settings.rateUpdatedAt).getTime()
      : 0;
    const hourAgo = Date.now() - 60 * 60 * 1000;

    if (!settings.rateUpdatedAt || lastUpdate < hourAgo) {
      fetchRate();
    }
  }, []);

  return {
    rate: settings.exchangeRate,
    updatedAt: settings.rateUpdatedAt,
  };
}
