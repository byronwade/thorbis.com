"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, DollarSign, RefreshCw, AlertTriangle, Copy } from "lucide-react"

export default function PaymentProcessing() {
  const [paymentAmount, setPaymentAmount] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const [processing, setProcessing] = useState(false)

  const accountBalance = 1247.5
  const lastPayment = { amount: 350.0, date: "2024-01-10", method: "Credit Card" }
  const pendingCharges = 125.0

  const handlePayment = async () => {
    setProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      setPaymentAmount("")
    }, 2000)
  }

  const handleRefund = async () => {
    setProcessing(true)
    // Simulate refund processing
    setTimeout(() => {
      setProcessing(false)
      setRefundAmount("")
    }, 2000)
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg h-full">
      <div className="p-2 border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-neutral-100">Payment Processing</span>
        </div>
      </div>

      <div className="p-2 space-y-3">
        {/* Account Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-400">Current Balance</span>
            <span className="text-sm font-medium text-neutral-100">${accountBalance.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-400">Pending Charges</span>
            <span className="text-sm text-amber-400">${pendingCharges.toFixed(2)}</span>
          </div>

          <Separator className="bg-neutral-700" />

          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-400">Last Payment</span>
            <div className="text-right">
              <div className="text-sm text-green-400">${lastPayment.amount.toFixed(2)}</div>
              <div className="text-xs text-neutral-500">{lastPayment.date}</div>
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        <div className="space-y-2">
          {/* Process Payment */}
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-xs font-medium text-neutral-200">Process Payment</span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="bg-neutral-800 border-neutral-600 text-neutral-100 text-xs h-8"
              />
              <Button
                onClick={handlePayment}
                disabled={!paymentAmount || processing}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
              >
                {processing ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Process"}
              </Button>
            </div>
          </div>

          {/* Process Refund */}
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-medium text-neutral-200">Process Refund</span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Amount"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="bg-neutral-800 border-neutral-600 text-neutral-100 text-xs h-8"
              />
              <Button
                onClick={handleRefund}
                disabled={!refundAmount || processing}
                size="sm"
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white h-8 px-3 text-xs bg-transparent"
              >
                {processing ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Refund"}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 h-8 text-xs bg-transparent"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 h-8 text-xs bg-transparent"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Flag Account
          </Button>
        </div>

        {/* Payment Methods */}
        <div className="p-2">
          <div className="text-xs font-medium text-neutral-200 mb-2">Payment Methods</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">•••• 4532</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-1.5 py-0.5">
                Primary
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">•••• 8901</span>
              <span className="text-xs text-neutral-500">Backup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
