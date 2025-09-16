'use client'

"use client";

import React, { useState, useEffect } from 'react';

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
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  DollarSign,
  Calculator,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Activity,
  BarChart3,
  Eye,
  Settings,
  Shield,
  Zap,
  Bell,
  Info,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';


/**
 * Trade Execution Interface
 * 
 * Features:
 * - Advanced order entry with multiple order types
 * - Real-time quote and order book data
 * - Position sizing calculator and risk management
 * - Order preview and confirmation system
 * - Trade history and order status tracking
 * - Portfolio impact analysis
 * - Multi-asset trading (stocks, ETFs, crypto)
 * - Advanced order conditions and triggers
 * - Bracket orders and stop-loss management
 * - Paper trading simulation mode
 * 
 * Integration:
 * - Alpaca Markets API for order execution
 * - TradingView real-time data feeds
 * - Risk management and compliance checks
 * - Real-time portfolio updates
 */
export default function TradeExecutionPage() {
  const [selectedAsset, setSelectedAsset] = useState('AAPL');
  const [orderType, setOrderType] = useState('market');
  const [orderSide, setOrderSide] = useState('buy');
  const [quantity, setQuantity] = useState(');
  const [price, setPrice] = useState(');
  const [stopPrice, setStopPrice] = useState(');
  const [timeInForce, setTimeInForce] = useState('day');
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [tradingMode, setTradingMode] = useState('live'); // 'live' or 'paper'
  const [searchQuery, setSearchQuery] = useState(');

  // Mock data - in real implementation, this would come from APIs
  const portfolioData = {
    totalValue: 145250.75,
    cashBalance: 12500.00,
    buyingPower: 25000.00,
    dayTradingPower: 50000.00,
    marginUsed: 8750.00,
    maintenanceMargin: 3200.00
  };

  const currentQuote = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    bid: 175.20,
    ask: 175.25,
    last: 175.22,
    change: 2.15,
    changePercent: 1.24,
    volume: 45234567,
    avgVolume: 52000000,
    high: 176.45,
    low: 172.85,
    open: 173.10,
    prevClose: 173.07
  };

  const recentTrades = [
    {
      id: '1',
      symbol: 'AAPL',
      side: 'buy',
      quantity: 100,
      price: 174.85,
      timestamp: '2025-01-31T15:45:00Z',
      status: 'filled',
      orderType: 'market'
    },
    {
      id: '2',
      symbol: 'MSFT',
      side: 'sell',
      quantity: 50,
      price: 336.20,
      timestamp: '2025-01-31T14:30:00Z',
      status: 'filled',
      orderType: 'limit'
    },
    {
      id: '3',
      symbol: 'TSLA',
      side: 'buy',
      quantity: 25,
      price: 238.50,
      timestamp: '2025-01-31T13:15:00Z',
      status: 'cancelled',
      orderType: 'stop_limit'
    }
  ];

  const openOrders = [
    {
      id: '4',
      symbol: 'GOOGL',
      side: 'buy',
      quantity: 30,
      orderType: 'limit',
      limitPrice: 140.00,
      timeInForce: 'gtc',
      timestamp: '2025-01-31T09:30:00Z',
      status: 'pending'
    },
    {
      id: '5',
      symbol: 'NVDA',
      side: 'sell',
      quantity: 15,
      orderType: 'stop_loss',
      stopPrice: 780.00,
      timeInForce: 'day',
      timestamp: '2025-01-31T10:45:00Z',
      status: 'pending'
    }
  ];

  const positions = [
    {
      symbol: 'AAPL',
      quantity: 150,
      avgCost: 172.30,
      currentPrice: 175.25,
      marketValue: 26287.50,
      unrealizedPnL: 442.50,
      unrealizedPnLPercent: 1.71,
      dayPnL: 322.50,
      dayPnLPercent: 1.24
    },
    {
      symbol: 'MSFT',
      quantity: 75,
      avgCost: 340.20,
      currentPrice: 335.80,
      marketValue: 25185.00,
      unrealizedPnL: -330.00,
      unrealizedPnLPercent: -1.29,
      dayPnL: -108.75,
      dayPnLPercent: -0.43
    }
  ];

  const calculateOrderValue = () => {
    const qty = parseFloat(quantity) || 0;
    const orderPrice = orderType === 'market' ? currentQuote.ask : parseFloat(price) || 0;
    return qty * orderPrice;
  };

  const calculateBuyingPowerImpact = () => {
    const orderValue = calculateOrderValue();
    if (orderSide === 'buy') {
      return portfolioData.buyingPower - orderValue;
    }
    return portfolioData.buyingPower; // No impact for sell orders
  };

  const getOrderTypeDescription = () => {
    switch (orderType) {
      case 'market':
        return 'Execute immediately at the best available price';
      case 'limit':
        return 'Execute only at the specified price or better';
      case 'stop':
        return 'Convert to market order when stop price is reached';
      case 'stop_limit':
        return 'Convert to limit order when stop price is reached';
      case 'trailing_stop':
        return 'Stop price trails the market price by specified amount';
      default:
        return ';
    }
  };

  const validateOrder = () => {
    const errors = [];
    
    if (!quantity || parseFloat(quantity) <= 0) {
      errors.push('Invalid quantity');
    }
    
    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
      errors.push('Invalid limit price');
    }
    
    if (['stop', 'stop_limit', 'trailing_stop'].includes(orderType) && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      errors.push('Invalid stop price');
    }
    
    if (orderSide === 'buy' && calculateOrderValue() > portfolioData.buyingPower) {
      errors.push('Insufficient buying power');
    }
    
    return errors;
  };

  const handlePlaceOrder = () => {
    const errors = validateOrder();
    if (errors.length > 0) {
      alert('Order validation errors: ' + errors.join(', '));
      return;
    }
    
    setShowOrderPreview(true);
  };

  const confirmOrder = () => {
    // In real implementation, this would make API call to place order
    console.log('Placing order:', {'
      symbol: selectedAsset,
      side: orderSide,
      quantity: parseFloat(quantity),
      orderType,
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      stopPrice: ['stop', 'stop_limit', 'trailing_stop'].includes(orderType) ? parseFloat(stopPrice) : undefined,
      timeInForce,
      tradingMode
    });
    
    setShowOrderPreview(false);
    // Reset form
    setQuantity(');
    setPrice(');
    setStopPrice(');
  };

  const cancelOrder = (orderId: string) => {
    // In real implementation, this would make API call to cancel order
    console.log('Cancelling order:', orderId);
  };

  // TradingView Level 2 Data Widget
  const TradingViewDepthWidget = () => {
    useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          ['${selectedAsset}']
        ],
        "chartOnly": false,
        "width": "100%",
        "height": 300,
        "locale": "en",
        "colorTheme": "dark",
        "autosize": true,
        "showVolume": false,
        "showMA": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "fontSize": "10",
        "noTimeScale": false,
        "valuesTracking": "1",
        "changeMode": "price-and-percent",
        "chartType": "area",
        "maLineColor": "#2962FF",
        "maLineWidth": 1,
        "maLength": 9,
        "headerFontSize": "medium",
        "lineWidth": 2,
        "lineType": 0,
        "dateRanges": [
          "1d|1",
          "1m|30",
          "3m|60",
          "12m|1D",
          "60m|1W",
          "all|1M"
        ]
      });
      
      const widgetContainer = document.getElementById('tradingview_depth_widget');
      if (widgetContainer) {
        widgetContainer.appendChild(script);
      }

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }, [selectedAsset]);

    return (
      <div className="w-full h-[300px] bg-neutral-900 rounded-lg overflow-hidden">
        <div id="tradingview_depth_widget" className="w-full h-full" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trade Execution</h1>
            <p className="text-neutral-400">
              Advanced order entry and portfolio management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={tradingMode === 'live' ? 'default' : 'secondary'} className="text-xs">
                {tradingMode === 'live' ? '🔴 LIVE' : '📝 PAPER'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTradingMode(tradingMode === 'live' ? 'paper' : 'live')}
                className="border-neutral-700 text-white hover:bg-neutral-800"
              >
                Switch to {tradingMode === 'live' ? 'Paper' : 'Live'}
              </Button>
            </div>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Eye className="w-4 h-4 mr-2" />
              Positions
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Portfolio Value</h3>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${portfolioData.totalValue.toLocaleString()}
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Cash Balance</h3>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-green-500">
            ${portfolioData.cashBalance.toLocaleString()}
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Buying Power</h3>
            <Target className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-[#1C8BFF]">
            ${portfolioData.buyingPower.toLocaleString()}
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Day Trading Power</h3>
            <Zap className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-orange-500">
            ${portfolioData.dayTradingPower.toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Entry Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Asset Search */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Select Asset</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search symbol or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
              />
            </div>
            <div className="p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{currentQuote.symbol}</h4>
                  <p className="text-sm text-neutral-400">{currentQuote.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${currentQuote.last}</p>
                  <div className="flex items-center text-sm">
                    {currentQuote.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={currentQuote.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {currentQuote.change > 0 ? '+' : '}${currentQuote.change} ({currentQuote.changePercent > 0 ? '+' : '}{currentQuote.changePercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Entry Form */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>
            <div className="space-y-4">
              {/* Order Side */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={orderSide === 'buy' ? 'default' : 'outline'}
                  onClick={() => setOrderSide('buy')}
                  className={orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'border-neutral-700'}
                >
                  Buy
                </Button>
                <Button
                  variant={orderSide === 'sell' ? 'default' : 'outline'}
                  onClick={() => setOrderSide('sell')}
                  className={orderSide === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'border-neutral-700'}
                >
                  Sell
                </Button>
              </div>

              {/* Order Type */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Order Type</label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                    <SelectItem value="stop_limit">Stop Limit</SelectItem>
                    <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500 mt-1">{getOrderTypeDescription()}</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Quantity</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              {/* Price (for limit orders) */}
              {orderType !== 'market' && (
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">
                    {orderType === 'limit' || orderType === 'stop_limit' ? 'Limit Price' : 'Price'}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              )}

              {/* Stop Price */}
              {(['stop', 'stop_limit', 'trailing_stop'].includes(orderType)) && (
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Stop Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              )}

              {/* Time in Force */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Time in Force</label>
                <Select value={timeInForce} onValueChange={setTimeInForce}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="day">Day Order</SelectItem>
                    <SelectItem value="gtc">Good Till Cancelled</SelectItem>
                    <SelectItem value="ioc">Immediate or Cancel</SelectItem>
                    <SelectItem value="fok">Fill or Kill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Value and Impact */}
              {quantity && (
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Estimated Total</span>
                      <span className="text-white font-medium">
                        ${calculateOrderValue().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Buying Power After</span>
                      <span className={'font-medium ${calculateBuyingPowerImpact() >= 0 ? 'text-green-500' : 'text-red-500'
              }'}>'
                        ${calculateBuyingPowerImpact().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <Button
                className={'w-full ${
                  orderSide === 'buy' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
              }'}
                onClick={handlePlaceOrder}
                disabled={!quantity || validateOrder().length > 0}
              >
                <Target className="w-4 h-4 mr-2" />
                Preview {orderSide === 'buy' ? 'Buy' : 'Sell'} Order
              </Button>
            </div>
          </Card>
        </div>

        {/* Market Data and Order Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote and Chart */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Level II Data & Chart</h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400">Real-time</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-700 text-white hover:bg-neutral-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Current Quote */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-neutral-800 rounded-lg">
                <p className="text-xs text-neutral-400">Bid</p>
                <p className="text-lg font-bold text-red-500">${currentQuote.bid}</p>
              </div>
              <div className="text-center p-3 bg-neutral-800 rounded-lg">
                <p className="text-xs text-neutral-400">Ask</p>
                <p className="text-lg font-bold text-green-500">${currentQuote.ask}</p>
              </div>
              <div className="text-center p-3 bg-neutral-800 rounded-lg">
                <p className="text-xs text-neutral-400">Volume</p>
                <p className="text-lg font-bold text-white">{(currentQuote.volume / 1e6).toFixed(1)}M</p>
              </div>
              <div className="text-center p-3 bg-neutral-800 rounded-lg">
                <p className="text-xs text-neutral-400">Avg Volume</p>
                <p className="text-lg font-bold text-neutral-300">{(currentQuote.avgVolume / 1e6).toFixed(1)}M</p>
              </div>
            </div>

            <TradingViewDepthWidget />
          </Card>

          {/* Orders and Positions Tabs */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-neutral-900 border-neutral-800">
              <TabsTrigger value="orders" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
                Open Orders ({openOrders.length})
              </TabsTrigger>
              <TabsTrigger value="positions" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
                Positions ({positions.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
                Trade History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  {openOrders.length > 0 ? (
                    <div className="space-y-4">
                      {openOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-medium text-white">{order.symbol}</h4>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className={'text-xs ${
                                    order.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }'}
                                >
                                  {order.side.toUpperCase()}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {order.orderType.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-neutral-400">Quantity</p>
                            <p className="text-white font-medium">{order.quantity}</p>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-neutral-400">Price</p>
                            <p className="text-white font-medium">
                              ${order.limitPrice || order.stopPrice || 'Market'}
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-neutral-400">Status</p>
                            <Badge variant="secondary" className="text-xs">
                              {order.status}
                            </Badge>
                          </div>

                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                            onClick={() => cancelOrder(order.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                      <p className="text-neutral-400">No open orders</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="positions" className="mt-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  <div className="space-y-4">
                    {positions.map((position) => (
                      <div key={position.symbol} className="p-4 bg-neutral-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{position.symbol}</h4>
                            <p className="text-sm text-neutral-400">{position.quantity} shares</p>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-xs text-neutral-400">Avg Cost</p>
                              <p className="text-sm text-white">${position.avgCost}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">Current</p>
                              <p className="text-sm text-white">${position.currentPrice}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">P&L</p>
                              <p className={'text-sm ${position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'
              }'}>'
                                ${Math.abs(position.unrealizedPnL).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">Day P&L</p>
                              <p className={'text-sm ${position.dayPnL >= 0 ? 'text-green-500' : 'text-red-500'
              }'}>'
                                ${Math.abs(position.dayPnL).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Buy More
                            </Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              Sell
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  <div className="space-y-4">
                    {recentTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium text-white">{trade.symbol}</h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={'text-xs ${
                                  trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }'}
                              >
                                {trade.side.toUpperCase()}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {trade.orderType.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-white">{trade.quantity} @ ${trade.price}</p>
                          <p className="text-xs text-neutral-400">
                            {new Date(trade.timestamp).toLocaleString()}
                          </p>
                        </div>

                        <Badge 
                          variant="secondary" 
                          className={'text-xs ${
                            trade.status === 'filled' ? 'bg-green-500/20 text-green-400' :
                            trade.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
              }'}
                        >
                          {trade.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Preview Modal */}
      {showOrderPreview && (
        <div className="fixed inset-0 bg-neutral-950/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-800 w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Order Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrderPreview(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Symbol</span>
                      <span className="text-white font-medium">{selectedAsset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Side</span>
                      <Badge className={orderSide === 'buy' ? 'bg-green-600' : 'bg-red-600'}>
                        {orderSide.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Quantity</span>
                      <span className="text-white font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Order Type</span>
                      <span className="text-white font-medium">{orderType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    {orderType !== 'market' && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Price</span>
                        <span className="text-white font-medium">${price}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-neutral-700 pt-2">
                      <span className="text-neutral-400">Estimated Total</span>
                      <span className="text-white font-bold">${calculateOrderValue().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <p className="text-sm text-yellow-400">
                    Please review your order carefully before confirming.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-neutral-700 text-white hover:bg-neutral-800"
                    onClick={() => setShowOrderPreview(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={'flex-1 ${
                      orderSide === 'buy' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
              }'}
                    onClick={confirmOrder}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Order
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Declare TradingView global for TypeScript
declare global {
  interface Window {
    TradingView: any;
  }
}