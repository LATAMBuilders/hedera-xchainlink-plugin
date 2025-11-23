import { CryptoPrice } from '../types';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export const fetchCryptoPrices = async (): Promise<CryptoPrice[]> => {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,tether,binancecoin&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    throw error;
  }
};
