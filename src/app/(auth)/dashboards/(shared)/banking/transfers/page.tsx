import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'

import { 
  ArrowRightLeft,
  Building2,
  Users,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Send,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function TransfersPage() {
  const recentTransfers = [
    {
      id: 1,
      type: 'Internal',
      from: 'Business Checking',
      to: 'Business Savings',
      amount: 5000.00,
      date: '2024-01-15',
      status: 'Completed',
      reference: 'TXN-001234'
    },
    {
      id: 2,
      type: 'ACH',
      from: 'Business Checking',
      to: 'Vendor Account - ABC Corp',
      amount: 1250.00,
      date: '2024-01-14',
      status: 'Processing',
      reference: 'TXN-001235'
    },
    {
      id: 3,
      type: 'Wire',
      from: 'Business Checking',
      to: 'International Supplier',
      amount: 7500.00,
      date: '2024-01-13',
      status: 'Completed',
      reference: 'TXN-001236'
    },
    {
      id: 4,
      type: 'Internal',
      from: 'Business Savings',
      to: 'Business Checking',
      amount: 2000.00,
      date: '2024-01-12',
      status: 'Completed',
      reference: 'TXN-001237'
    }
  ]

  const transferTypes = [
    {
      id: 1,
      name: 'Internal Transfer',
      description: 'Between your accounts',
      icon: ArrowRightLeft,
      color: 'text-blue-400',
      fee: 'Free',
      time: 'Instant'
    },
    {
      id: 2,
      name: 'ACH Transfer',
      description: 'To external bank accounts',
      icon: Building2,
      color: 'text-green-400',
      fee: '$3.00',
      time: '1-3 business days'
    },
    {
      id: 3,
      name: 'Wire Transfer',
      description: 'Domestic and international',
      icon: Globe,
      color: 'text-purple-400',
      fee: '$25.00',
      time: 'Same day'
    },
    {
      id: 4,
      name: 'P2P Transfer',
      description: 'Person to person payments',
      icon: Users,
      color: 'text-orange-400',
      fee: 'Free',
      time: 'Instant'
    }
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Transfers</h2>
          <p className="text-neutral-400">Transfer money between accounts and to external recipients</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Send className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Transfer Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Today's Transfers</p>'
                <p className="text-2xl font-bold text-white">$8,750.00</p>
                <p className="text-xs text-blue-200">2 transfers</p>
              </div>
              <Send className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold text-white">$15,750.00</p>
                <div className="flex items-center text-xs text-green-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last week
                </div>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Processing</p>
                <p className="text-2xl font-bold text-white">1</p>
                <p className="text-xs text-orange-200">$1,250.00 pending</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Available Balance</p>
                <p className="text-2xl font-bold text-white">$125,430.89</p>
                <p className="text-xs text-purple-200">For transfers</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Transfer */}
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Instant Transfer</CardTitle>
                <p className="text-sm text-neutral-400">Move money between your accounts instantly</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">From Account</label>
              <select className="w-full p-3 bg-gradient-to-r from-neutral-800 to-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-blue-500 transition-colors">
                <option>Business Checking - $125,430.56</option>
                <option>Business Savings - $89,750.25</option>
                <option>Treasury Account - $50,000.00</option>
              </select>
            </div>
            <div className="flex justify-center">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700">
                <ArrowDownRight className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">To Account</label>
              <select className="w-full p-3 bg-gradient-to-r from-neutral-800 to-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-blue-500 transition-colors">
                <option>Business Savings - $89,750.25</option>
                <option>Treasury Account - $50,000.00</option>
                <option>Business Checking - $125,430.56</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <Input 
                  type="number" 
                  placeholder="0.00"
                  className="pl-10 bg-gradient-to-r from-neutral-800 to-neutral-700 border-neutral-600 text-white text-lg font-semibold focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Memo (Optional)</label>
              <Input 
                placeholder="Transfer description"
                className="bg-gradient-to-r from-neutral-800 to-neutral-700 border-neutral-600 text-white focus:border-blue-500"
              />
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg py-3">
              <Zap className="mr-2 h-5 w-5" />
              Transfer Instantly
            </Button>
            <div className="text-center">
              <p className="text-xs text-neutral-400">🔒 Instant • Free • Secure</p>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Types */}
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Transfer Options</CardTitle>
            <p className="text-sm text-neutral-400">Choose the best option for your needs</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {transferTypes.map((type) => (
              <div key={type.id} className="group flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-neutral-800/80 to-neutral-700/80 hover:from-neutral-700/90 hover:to-neutral-600/90 cursor-pointer transition-all hover:scale-[1.02] border border-neutral-700/50">
                <div className="flex items-center space-x-4">
                  <div className={'p-3 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-600 group-hover:from-neutral-600 group-hover:to-neutral-500 transition-all ${type.color}'}>
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-200">{type.name}</p>
                    <p className="text-xs text-neutral-400">{type.description}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={type.fee === 'Free' ? 'bg-green-900 text-green-200 border-green-700' : 'bg-blue-900 text-blue-200 border-blue-700'}>
                    {type.fee}
                  </Badge>
                  <p className="text-xs text-neutral-400">{type.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transfers */}
      <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Transfers</CardTitle>
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransfers.map((transfer, index) => (
              <div key={transfer.id} className={'flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-neutral-800/80 to-neutral-700/80 hover:from-neutral-700/90 hover:to-neutral-600/90 transition-all ${index === 0 ? 'ring-1 ring-blue-500/30' : '
              }'}>'
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-600">
                    {transfer.status === 'Completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : transfer.status === 'Processing' ? (
                      <Clock className="h-5 w-5 text-orange-400 animate-pulse" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {transfer.from} → {transfer.to}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={
                        transfer.type === 'Internal' ? 'bg-blue-900 text-blue-200 border-blue-700' :
                        transfer.type === 'ACH' ? 'bg-green-900 text-green-200 border-green-700' :
                        transfer.type === 'Wire' ? 'bg-purple-900 text-purple-200 border-purple-700' :
                        'bg-orange-900 text-orange-200 border-orange-700'
                      }>
                        {transfer.type}
                      </Badge>
                      <span className="text-xs text-neutral-600">•</span>
                      <p className="text-xs text-neutral-400">
                        {transfer.reference}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">
                      ${transfer.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {transfer.date}
                    </p>
                  </div>
                  <Badge 
                    className={transfer.status === 'Completed' 
                      ? 'bg-green-900 text-green-200 border-green-700' 
                      : transfer.status === 'Processing'
                      ? 'bg-orange-900 text-orange-200 border-orange-700'
                      : 'bg-red-900 text-red-200 border-red-700'
                    }
                  >
                    {transfer.status === 'Completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {transfer.status === 'Processing' && <Clock className="h-3 w-3 mr-1" />}
                    {transfer.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}