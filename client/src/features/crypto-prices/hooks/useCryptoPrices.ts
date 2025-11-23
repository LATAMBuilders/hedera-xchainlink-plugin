import { useState, useEffect } from 'react';
import { CryptoPrice } from '../types';
import { fetchCryptoPrices } from '../services/priceService';

export const useCryptoPrices = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getPrices = async () => {
    try {
      const data = await fetchCryptoPrices();
      setPrices(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPrices();
    const interval = setInterval(getPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error, refetch: getPrices };
};
