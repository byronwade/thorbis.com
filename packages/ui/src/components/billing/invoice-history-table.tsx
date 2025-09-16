/**
 * Invoice History Table Component
 * Displays invoice history with download and payment status
 * Dark-first design with comprehensive invoice management
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Download,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { useState } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'paid' | 'open' | 'draft' | 'void' | 'uncollectible';
  amount: number; // in cents
  currency: string;
  issueDate: Date;
  dueDate?: Date;
  paidAt?: Date;
  description?: string;
  downloadUrl?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
}

interface InvoiceHistoryTableProps {
  invoices: Invoice[];
  onDownloadInvoice: (invoiceId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
  onPayInvoice?: (invoiceId: string) => void;
  isLoading?: boolean;
}

const statusConfig = {
  paid: {
    label: 'Paid',
    color: 'bg-emerald-600',
    textColor: 'text-emerald-400',
    icon: CheckCircle2,
  },
  open: {
    label: 'Open',
    color: 'bg-blue-600',
    textColor: 'text-blue-400',
    icon: Clock,
  },
  draft: {
    label: 'Draft',
    color: 'bg-neutral-600',
    textColor: 'text-neutral-400',
    icon: FileText,
  },
  void: {
    label: 'Void',
    color: 'bg-red-600',
    textColor: 'text-red-400',
    icon: XCircle,
  },
  uncollectible: {
    label: 'Uncollectible',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-400',
    icon: AlertTriangle,
  },
} as const;

export function InvoiceHistoryTable({
  invoices,
  onDownloadInvoice,
  onViewInvoice,
  onPayInvoice,
  isLoading = false,
}: InvoiceHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (cents: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const filteredAndSortedInvoices = invoices
    .filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.description && invoice.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = a.issueDate.getTime();
          bValue = b.issueDate.getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.issueDate.getTime();
          bValue = b.issueDate.getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalAmount = filteredAndSortedInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = filteredAndSortedInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-neutral-100">
              Invoice History
            </CardTitle>
            <CardDescription className="text-neutral-400">
              View and manage all your billing invoices
            </CardDescription>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-sm text-neutral-400">Total</div>
              <div className="text-lg font-semibold text-neutral-200">
                {formatCurrency(totalAmount)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-sm text-neutral-400">Paid</div>
              <div className="text-lg font-semibold text-emerald-400">
                {formatCurrency(paidAmount)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-sm text-neutral-400">Outstanding</div>
              <div className="text-lg font-semibold text-orange-400">
                {formatCurrency(unpaidAmount)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-800 border-neutral-700 text-neutral-300"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-neutral-800 border-neutral-700">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="void">Void</SelectItem>
              <SelectItem value="uncollectible">Uncollectible</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}>
            <SelectTrigger className="w-[140px] bg-neutral-800 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700">
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
              <SelectItem value="status-asc">Status A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoice Table */}
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-neutral-800">
              <TableRow className="border-neutral-700 hover:bg-neutral-800">
                <TableHead className="text-neutral-300">Invoice</TableHead>
                <TableHead className="text-neutral-300">Status</TableHead>
                <TableHead className="text-neutral-300">Amount</TableHead>
                <TableHead className="text-neutral-300">Issue Date</TableHead>
                <TableHead className="text-neutral-300">Due Date</TableHead>
                <TableHead className="text-neutral-300">Paid Date</TableHead>
                <TableHead className="text-neutral-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {filteredAndSortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-neutral-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No invoices match your filters'
                        : 'No invoices found'
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedInvoices.map((invoice) => {
                  const statusInfo = statusConfig[invoice.status];
                  const StatusIcon = statusInfo.icon;
                  const isOverdue = invoice.dueDate && invoice.status === 'open' && new Date() > invoice.dueDate;
                  
                  return (
                    <TableRow 
                      key={invoice.id}
                      className="border-neutral-800 hover:bg-neutral-800/50"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-neutral-200">
                            {invoice.invoiceNumber}
                          </div>
                          {invoice.description && (
                            <div className="text-sm text-neutral-500 truncate max-w-48">
                              {invoice.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${statusInfo.textColor}`} />
                          <Badge className={`${statusInfo.color} text-white border-0`}>
                            {statusInfo.label}
                          </Badge>
                          {isOverdue && (
                            <Badge className="bg-red-600 text-white border-0 ml-1">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-medium text-neutral-200">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-neutral-300">
                          {formatDate(invoice.issueDate)}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        {invoice.dueDate ? (
                          <span className={`${isOverdue ? 'text-red-400' : 'text-neutral-300'}`}>
                            {formatDate(invoice.dueDate)}
                          </span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {invoice.paidAt ? (
                          <span className="text-emerald-400">
                            {formatDate(invoice.paidAt)}
                          </span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => onViewInvoice(invoice.id)}
                            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => onDownloadInvoice(invoice.id)}
                            disabled={!invoice.downloadUrl}
                            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          
                          {invoice.status === 'open' && onPayInvoice && (
                            <Button 
                              size="sm"
                              onClick={() => onPayInvoice(invoice.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>
            Showing {filteredAndSortedInvoices.length} of {invoices.length} invoices
          </span>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>All amounts in USD</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InvoiceHistoryTable;