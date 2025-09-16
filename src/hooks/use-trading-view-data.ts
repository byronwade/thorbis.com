import { useState, useEffect } from 'react';

interface TradingData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function useTradingViewData(symbols: string[] = []) {
  const [data, setData] = useState<TradingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock trading data for now
    const mockData: TradingData[] = symbols.map(symbol => ({
      symbol,
      price: Math.random() * 1000 + 100,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
    }));

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);

    return () => {
      setError(null);
    };
  }, [symbols]);

  return { data, loading, error };
}