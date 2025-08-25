'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, Filter, CreditCard, DollarSign, Calendar, User,
  CheckCircle, Clock, XCircle, AlertTriangle, TrendingUp, BarChart3,
  Download, Eye, RefreshCw, Building
} from 'lucide-react';

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const payments = [
    {
      id: 'PAY-001', invoiceId: 'INV-001', customer: 'Johnson Manufacturing',
      amount: '$2,500.00', method: 'ACH Transfer', status: 'completed',
      date: '2024-08-24', dueDate: '2024-08-15', processor: 'Stripe',
      fee: '$12.50', netAmount: '$2,487.50', reference: 'ch_3NyZ2rA1b2c3d4e5'
    },
    {
      id: 'PAY-002', invoiceId: 'INV-002', customer: 'Thompson Properties',
      amount: '$850.00', method: 'Credit Card', status: 'pending',
      date: '2024-08-25', dueDate: '2024-08-25', processor: 'Square',
      fee: '$25.50', netAmount: '$824.50', reference: 'sq_1ABC123DEF456'
    },
    {
      id: 'PAY-003', invoiceId: 'INV-003', customer: 'Davis Electric',
      amount: '$1,200.00', method: 'Check', status: 'failed',
      date: '2024-08-22', dueDate: '2024-08-20', processor: 'Manual',
      fee: '$0.00', netAmount: '$1,200.00', reference: 'CHK-7856'
    }
  ];

  const stats = {
    total: payments.reduce((sum, p) => sum + parseFloat(p.amount.replace('$', '').replace(',', '')), 0),
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and process customer payments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button><Plus className="h-4 w-4 mr-2" />Process Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Payments', value: `$${stats.total.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-600' },
          { label: 'Success Rate', value: `${Math.round((stats.completed / payments.length) * 100)}%`, icon: TrendingUp, color: 'text-blue-600' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{payment.customer}</h3>
                    <Badge className={
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {payment.status}
                    </Badge>
                    <span className="text-2xl font-bold text-green-600">{payment.amount}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Method: {payment.method}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date: {payment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Processor: {payment.processor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Net: {payment.netAmount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Details</Button>
                  {payment.status === 'failed' && (
                    <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" />Retry</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
