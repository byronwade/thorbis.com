'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Clock, TrendingUp, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ServiceMaterial } from '@/types/pricebook'

interface PricingCalculatorProps {
  pricing: {
    basePrice: number
    laborRate: number
    estimatedHours: number
    materialCosts: number
    totalEstimate: number
    markup: number
    profitMargin: number
    lastUpdated: string
  }
  materials: ServiceMaterial[]
  onChange: (pricing: unknown) => void
}

export function PricingCalculator({ pricing, materials, onChange }: PricingCalculatorProps) {
  const [localPricing, setLocalPricing] = useState(pricing)

  // Calculate material costs from materials array
  const calculatedMaterialCosts = materials.reduce((sum, material) => 
    sum + (material.unitPrice * material.quantity * (1 + material.markup / 100)), 0
  )

  // Calculate labor costs
  const laborCosts = localPricing.laborRate * localPricing.estimatedHours

  // Calculate subtotal (before markup)
  const subtotal = localPricing.basePrice + calculatedMaterialCosts + laborCosts

  // Calculate final total with markup
  const totalWithMarkup = subtotal * (1 + localPricing.markup / 100)

  // Calculate profit margin
  const totalCosts = calculatedMaterialCosts + laborCosts
  const profit = totalWithMarkup - totalCosts
  const calculatedProfitMargin = totalCosts > 0 ? (profit / totalWithMarkup) * 100 : 0

  useEffect(() => {
    const updatedPricing = {
      ...localPricing,
      materialCosts: calculatedMaterialCosts,
      totalEstimate: totalWithMarkup,
      profitMargin: calculatedProfitMargin,
      lastUpdated: new Date().toISOString()
    }
    onChange(updatedPricing)
  }, [localPricing, calculatedMaterialCosts])

  const handlePricingChange = (field: string, value: number) => {
    setLocalPricing(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return minutes > 0 ? `${wholeHours}h ${minutes}m' : '${wholeHours}h'
  }

  // Competitive pricing suggestions
  const getSuggestedPricing = () => {
    const baseCost = totalCosts
    return {
      competitive: baseCost * 1.3, // 30% markup
      standard: baseCost * 1.5,    // 50% markup
      premium: baseCost * 1.8      // 80% markup
    }
  }

  const suggestions = getSuggestedPricing()

  return (
    <div className="space-y-6">
      {/* Pricing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-950 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-neutral-300">Base Price</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(localPricing.basePrice)}</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-neutral-300">Labor Cost</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(laborCosts)}</div>
            <div className="text-xs text-neutral-500">{formatHours(localPricing.estimatedHours)} @ ${localPricing.laborRate}/hr</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-neutral-300">Material Cost</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(calculatedMaterialCosts)}</div>
            <div className="text-xs text-neutral-500">{materials.length} item{materials.length !== 1 ? 's' : '}</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-neutral-300">Total Price</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalWithMarkup)}</div>
            <div className="text-xs text-neutral-500">{calculatedProfitMargin.toFixed(1)}% profit margin</div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Labor & Base Pricing */}
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Labor & Base Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-neutral-300">Base Service Price</Label>
              <Input
                type="number"
                step="0.01"
                value={localPricing.basePrice}
                onChange={(e) => handlePricingChange('basePrice', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-neutral-900 border-neutral-700 text-white"
              />
              <p className="text-xs text-neutral-500 mt-1">Fixed price component not including labor or materials</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-neutral-300">Labor Rate ($/hour)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={localPricing.laborRate}
                  onChange={(e) => handlePricingChange('laborRate', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-neutral-300">Estimated Hours</Label>
                <Input
                  type="number"
                  step="0.25"
                  value={localPricing.estimatedHours}
                  onChange={(e) => handlePricingChange('estimatedHours', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                />
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-3">
              <div className="text-sm font-medium text-neutral-300 mb-2">Labor Cost Calculation</div>
              <div className="text-xs text-neutral-500">
                {formatHours(localPricing.estimatedHours)} × ${localPricing.laborRate}/hr = {formatCurrency(laborCosts)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Markup & Margins */}
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Markup & Margins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-neutral-300">Service Markup</Label>
                <span className="text-sm text-neutral-400">{localPricing.markup}%</span>
              </div>
              <Slider
                value={[localPricing.markup]}
                onValueChange={([value]) => handlePricingChange('markup', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Subtotal (before markup)</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Markup ({localPricing.markup}%)</span>
                <span className="text-white">{formatCurrency(totalWithMarkup - subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-neutral-700 pt-2">
                <span className="text-white">Total Price</span>
                <span className="text-white">{formatCurrency(totalWithMarkup)}</span>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-3">
              <div className="text-sm font-medium text-neutral-300 mb-2">Profit Analysis</div>
              <div className="space-y-1 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Total Costs:</span>
                  <span>{formatCurrency(totalCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit:</span>
                  <span className="text-green-400">{formatCurrency(profit)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Profit Margin:</span>
                  <span className="text-green-400">{calculatedProfitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Suggestions */}
      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="h-5 w-5" />
            Competitive Pricing Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-900 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-400 mb-1">Competitive</div>
              <div className="text-xl font-bold text-white">{formatCurrency(suggestions.competitive)}</div>
              <div className="text-xs text-neutral-500">30% markup • Lower margin</div>
              <button
                onClick={() => handlePricingChange('markup', 30)}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Apply this pricing
              </button>
            </div>

            <div className="bg-neutral-900 rounded-lg p-4 border border-blue-600/30">
              <div className="text-sm font-medium text-blue-400 mb-1">Standard</div>
              <div className="text-xl font-bold text-white">{formatCurrency(suggestions.standard)}</div>
              <div className="text-xs text-neutral-500">50% markup • Good margin</div>
              <button
                onClick={() => handlePricingChange('markup', 50)}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Apply this pricing
              </button>
            </div>

            <div className="bg-neutral-900 rounded-lg p-4">
              <div className="text-sm font-medium text-green-400 mb-1">Premium</div>
              <div className="text-xl font-bold text-white">{formatCurrency(suggestions.premium)}</div>
              <div className="text-xs text-neutral-500">80% markup • High margin</div>
              <button
                onClick={() => handlePricingChange('markup', 80)}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Apply this pricing
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Detailed Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span className="text-neutral-400">Base Service Price</span>
              <span className="text-white font-medium">{formatCurrency(localPricing.basePrice)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span className="text-neutral-400">Labor ({formatHours(localPricing.estimatedHours)} @ ${localPricing.laborRate}/hr)</span>
              <span className="text-white font-medium">{formatCurrency(laborCosts)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span className="text-neutral-400">Materials ({materials.length} items)</span>
              <span className="text-white font-medium">{formatCurrency(calculatedMaterialCosts)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span className="text-neutral-400">Markup ({localPricing.markup}%)</span>
              <span className="text-white font-medium">{formatCurrency(totalWithMarkup - subtotal)}</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-semibold">
              <span className="text-white">Total Customer Price</span>
              <span className="text-white">{formatCurrency(totalWithMarkup)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}