'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: string;
  high52Week?: number;
  low52Week?: number;
}

interface StockWidgetProps {
  stock: StockData | null;
  loading?: boolean;
}

export function StockWidget({ stock, loading = false }: StockWidgetProps) {
  if (loading || !stock) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="h-4 bg-neutral-700 rounded w-16 mb-1"></div>
              <div className="h-3 bg-neutral-700 rounded w-24"></div>
            </div>
            <div className="w-8 h-8 bg-neutral-700 rounded"></div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="h-6 bg-neutral-700 rounded w-20"></div>
            <div className="h-4 bg-neutral-700 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 bg-neutral-700 rounded"></div>
            <div className="h-3 bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className={'bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg ${bgColor}'}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white">{stock.symbol}</h3>
            <p className="text-sm text-neutral-400 truncate max-w-[150px]">{stock.name}</p>
          </div>
          <div className={'p-2 rounded-lg ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>`
            <TrendIcon className={`w-5 h-5 ${trendColor}'} />
          </div>
        </div>

        {/* Price and Change */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-white">
            ${stock.price.toFixed(2)}
          </div>
          <div className={'text-right ${trendColor}'}>
            <div className="text-sm font-medium">
              {isPositive ? '+' : '}${stock.change.toFixed(2)}
            </div>
            <div className="text-xs">
              ({isPositive ? '+' : '}{stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1 text-neutral-400">
            <BarChart3 className="w-3 h-3" />
            <span>Volume: {formatNumber(stock.volume)}</span>
          </div>
          {stock.marketCap && (
            <div className="flex items-center gap-1 text-neutral-400">
              <DollarSign className="w-3 h-3" />
              <span>Cap: {stock.marketCap}</span>
            </div>
          )}
        </div>

        {/* 52 Week Range */}
        {stock.high52Week && stock.low52Week && (
          <div className="mt-3 pt-3 border-t border-neutral-800">
            <div className="text-xs text-neutral-400 mb-1">52W Range</div>
            <div className="flex justify-between text-xs">
              <span className="text-red-400">${stock.low52Week.toFixed(2)}</span>
              <span className="text-green-400">${stock.high52Week.toFixed(2)}</span>
            </div>
            <div className="mt-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full"
                style={{
                  width: '${((stock.price - stock.low52Week) / (stock.high52Week - stock.low52Week)) * 100}%'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockWidget;
