'use client'

"use client";

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  Activity,
  Clock,
  DollarSign,
  Percent,
  Volume2,
  RefreshCw,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';


/**
 * Watchlist Management Page
 * 
 * Features:
 * - Multiple customizable watchlists
 * - Real-time price tracking and alerts
 * - Performance monitoring and analysis
 * - Advanced search and filtering
 * - Custom price alert notifications
 * - Portfolio integration and analysis
 * - Export and sharing capabilities
 * - Technical indicator overlays
 * - News and earnings integration
 * - Mobile-responsive design
 * 
 * Integration:
 * - TradingView real-time data feeds
 * - Alpaca Markets API for stock data
 * - Alpha Vantage API for fundamental data
 * - Push notification system for alerts
 */
export default function WatchlistPage() {
  const [searchQuery, setSearchQuery] = useState(');
  const [selectedWatchlist, setSelectedWatchlist] = useState('default');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState(');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortOrder, setSortOrder] = useState('asc');

  // Mock watchlist data - in real implementation, this would come from API
  const watchlists = [
    { id: 'default', name: 'My Watchlist', count: 12 },
    { id: 'tech', name: 'Technology', count: 8 },
    { id: 'dividend', name: 'Dividend Stocks', count: 15 },
    { id: 'crypto', name: 'Cryptocurrency', count: 6 },
    { id: 'etfs', name: 'ETFs', count: 10 }
  ];

  const watchlistItems = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.25,
      change: 2.15,
      changePercent: 1.24,
      volume: 45234567,
      marketCap: 2800000000000,
      peRatio: 28.5,
      dividendYield: 0.55,
      sector: 'Technology',
      alerts: [
        { type: 'price_above', value: 180.00, active: true },
        { type: 'price_below', value: 170.00, active: false }
      ],
      inPortfolio: true,
      added: '2024-12-15',
      notes: 'Strong Q4 earnings expected'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 335.80,
      change: -1.45,
      changePercent: -0.43,
      volume: 32156789,
      marketCap: 2500000000000,
      peRatio: 32.1,
      dividendYield: 0.81,
      sector: 'Technology',
      alerts: [
        { type: 'earnings', value: '2025-01-24', active: true }
      ],
      inPortfolio: true,
      added: '2024-11-20',
      notes: 'Azure growth driving revenue'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 785.50,
      change: 15.20,
      changePercent: 1.97,
      volume: 55678234,
      marketCap: 1950000000000,
      peRatio: 65.8,
      dividendYield: 0.03,
      sector: 'Technology',
      alerts: [
        { type: 'volume', value: 60000000, active: true },
        { type: 'price_above', value: 800.00, active: true }
      ],
      inPortfolio: false,
      added: '2024-10-10',
      notes: 'AI chip demand catalyst'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 235.80,
      change: -5.20,
      changePercent: -2.16,
      volume: 55678234,
      marketCap: 750000000000,
      peRatio: 45.2,
      dividendYield: 0,
      sector: 'Automotive',
      alerts: [
        { type: 'news', value: 'earnings', active: true }
      ],
      inPortfolio: false,
      added: '2024-09-05',
      notes: 'Cybertruck production ramp'
    },
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      price: 42500.00,
      change: 850.00,
      changePercent: 2.04,
      volume: 28500000000,
      marketCap: 835000000000,
      peRatio: null,
      dividendYield: null,
      sector: 'Cryptocurrency',
      alerts: [
        { type: 'price_above', value: 45000.00, active: true },
        { type: 'price_below', value: 40000.00, active: true }
      ],
      inPortfolio: true,
      added: '2024-08-15',
      notes: 'ETF approval catalyst'
    },
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      price: 445.30,
      change: 3.20,
      changePercent: 0.72,
      volume: 15234567,
      marketCap: 400000000000,
      peRatio: null,
      dividendYield: 1.32,
      sector: 'ETF',
      alerts: [
        { type: 'technical', value: 'RSI_oversold', active: true }
      ],
      inPortfolio: true,
      added: '2024-07-01',
      notes: 'Core holding'
    }
  ];

  const searchSuggestions = [
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
    { symbol: 'ETH-USD', name: 'Ethereum' }
  ];

  const filteredItems = watchlistItems.filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = filteredItems.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'symbol':
        aValue = a.symbol;
        bValue = b.symbol;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'change':
        aValue = a.changePercent;
        bValue = b.changePercent;
        break;
      case 'volume':
        aValue = a.volume;
        bValue = b.volume;
        break;
      case 'marketCap':
        aValue = a.marketCap;
        bValue = b.marketCap;
        break;
      default:
        aValue = a.symbol;
        bValue = b.symbol;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M';
    if (volume >= 1e3) return '${(volume / 1e3).toFixed(1)}K';
    return volume.toString();
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_above':
      case 'price_below':
        return <Target className="w-3 h-3" />;
      case 'earnings':
        return <Calendar className="w-3 h-3" />;
      case 'volume':
        return <Volume2 className="w-3 h-3" />;
      case 'news':
        return <Bell className="w-3 h-3" />;
      case 'technical':
        return <BarChart3 className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getAlertTypeLabel = (alert: unknown) => {
    switch (alert.type) {
      case 'price_above':
        return 'Price above $${alert.value}';
      case 'price_below':
        return 'Price below $${alert.value}';
      case 'earnings':
        return 'Earnings on ${alert.value}';
      case 'volume':
        return 'Volume above ${formatVolume(alert.value)}';
      case 'news':
        return '${alert.value} news';
      case 'technical':
        return 'Technical: ${alert.value}';
      default:
        return 'Custom alert';
    }
  };

  const handleAddToWatchlist = () => {
    if (newSymbol.trim()) {
      // In real implementation, this would make an API call
      console.log('Adding to watchlist:', newSymbol.toUpperCase());'
      setNewSymbol(');
      setShowAddModal(false);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    // In real implementation, this would make an API call
    console.log('Removing from watchlist:', symbol);
  };

  const toggleAlert = (symbol: string, alertIndex: number) => {
    // In real implementation, this would update the alert status via API
    console.log('Toggling alert for', symbol, 'at index', alertIndex);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Investment Watchlist</h1>
            <p className="text-neutral-400">
              Track your favorite assets with real-time prices and custom alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
              <SelectTrigger className="w-48 bg-neutral-800 border-neutral-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                {watchlists.map(list => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name} ({list.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-neutral-900 border-neutral-800 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700">
              <SelectItem value="symbol">Symbol</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="change">Change</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="marketCap">Market Cap</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-neutral-700 text-white hover:bg-neutral-800"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
          <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Watchlist Table */}
      <Card className="bg-neutral-900 border-neutral-800">
        <div className="p-6">
          <div className="space-y-4">
            {sortedItems.map((item, index) => (
              <div key={item.symbol} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Symbol and Company Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{item.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">{item.symbol}</h3>
                        {item.inPortfolio && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                            In Portfolio
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {item.sector}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-400">{item.name}</p>
                      {item.notes && (
                        <p className="text-xs text-neutral-500 mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Price and Change */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center justify-end text-sm">
                      {item.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={item.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {item.change > 0 ? '+' : '}${Math.abs(item.change).toFixed(2)} ({item.changePercent > 0 ? '+' : '}{item.changePercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-neutral-400">Volume</p>
                      <p className="text-white font-medium">{formatVolume(item.volume)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-400">Market Cap</p>
                      <p className="text-white font-medium">{formatMarketCap(item.marketCap)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-400">{item.peRatio ? 'P/E Ratio' : 'Div Yield'}</p>
                      <p className="text-white font-medium">
                        {item.peRatio ? item.peRatio : item.dividendYield ? '${item.dividendYield}%' : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="flex items-center space-x-2">
                    {item.alerts.map((alert, alertIndex) => (
                      <div
                        key={alertIndex}
                        className={'flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                          alert.active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-neutral-700 text-neutral-400'
              }'}
                      >
                        {getAlertTypeIcon(alert.type)}
                        <span>{getAlertTypeLabel(alert)}</span>
                        <button
                          onClick={() => toggleAlert(item.symbol, alertIndex)}
                          className="ml-1 hover:opacity-70"
                        >
                          {alert.active ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="border-neutral-600 text-white hover:bg-neutral-700">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="border-neutral-600 text-white hover:bg-neutral-700">
                      <Bell className="w-4 h-4 mr-1" />
                      Alert
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                      onClick={() => handleRemoveFromWatchlist(item.symbol)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Additional Details Row */}
                <div className="mt-3 pt-3 border-t border-neutral-700">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center space-x-4">
                      <span>Added: {new Date(item.added).toLocaleDateString()}</span>
                      <span>{item.alerts.filter(a => a.active).length} active alerts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>Last updated: Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-neutral-950/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add Asset to Watchlist</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Symbol or Company Name</label>
                  <Input
                    placeholder="e.g., AAPL, Apple Inc."
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddToWatchlist()}
                  />
                </div>

                {newSymbol && (
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Suggestions</h4>
                    <div className="space-y-2">
                      {searchSuggestions
                        .filter(suggestion => 
                          suggestion.symbol.toLowerCase().includes(newSymbol.toLowerCase()) ||
                          suggestion.name.toLowerCase().includes(newSymbol.toLowerCase())
                        )
                        .slice(0, 3)
                        .map(suggestion => (
                          <button
                            key={suggestion.symbol}
                            onClick={() => setNewSymbol(suggestion.symbol)}
                            className="w-full text-left p-2 hover:bg-neutral-700 rounded transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white">{suggestion.symbol}</p>
                                <p className="text-xs text-neutral-400">{suggestion.name}</p>
                              </div>
                              <Plus className="w-4 h-4 text-neutral-400" />
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-neutral-700 text-white hover:bg-neutral-800"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white"
                    onClick={handleAddToWatchlist}
                    disabled={!newSymbol.trim()}
                  >
                    Add to Watchlist
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Watchlist Items</h3>
            <Eye className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-white">{sortedItems.length}</p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Active Alerts</h3>
            <Bell className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-[#1C8BFF]">
            {sortedItems.reduce((total, item) => total + item.alerts.filter(a => a.active).length, 0)}
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">In Portfolio</h3>
            <CheckCircle className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-green-500">
            {sortedItems.filter(item => item.inPortfolio).length}
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Avg Performance</h3>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-green-500">
            +{(sortedItems.reduce((sum, item) => sum + item.changePercent, 0) / sortedItems.length).toFixed(2)}%
          </p>
        </Card>
      </div>
    </div>
  );
}