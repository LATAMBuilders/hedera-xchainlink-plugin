export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface PriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}
