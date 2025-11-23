'use client';

import React from 'react';
import { useCryptoPrices } from '../hooks/useCryptoPrices';
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length === 0) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const CryptoGrid = () => {
  const { prices, loading, error, refetch } = useCryptoPrices();

  if (loading && prices.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4 bg-red-500/10 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={refetch}
          className="mt-2 flex items-center gap-2 mx-auto text-sm text-red-400 hover:text-red-300"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prices.map((coin) => {
        const isPositive = coin.price_change_percentage_24h >= 0;
        return (
          <div 
            key={coin.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-blue-500/10 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="font-bold text-slate-100">{coin.name}</h3>
                  <span className="text-sm text-slate-400 uppercase">{coin.symbol}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Price</p>
                <p className="text-2xl font-bold text-white">
                  ${coin.current_price.toLocaleString()}
                </p>
              </div>
              <div className="w-24 h-8 opacity-50 group-hover:opacity-100 transition-opacity">
                {coin.sparkline_in_7d && (
                  <Sparkline 
                    data={coin.sparkline_in_7d.price} 
                    color={isPositive ? '#10b981' : '#ef4444'} 
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
