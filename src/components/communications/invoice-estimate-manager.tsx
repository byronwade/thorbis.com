"use client"

import * as React from "react"
import { Card, CardContent } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Badge } from "@components/ui/badge"
import { ScrollArea } from "@components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { cn } from "@lib/utils"
import {
  FileText,
  DollarSign,
  Search,
  Plus,
  Download,
  Send,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import type { Invoice, Estimate } from "@lib/unified/customers"
import { getCustomerById } from "@lib/unified/customers"

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
    case "accepted":
      return "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20"
    case "sent":
    case "draft":
      return "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20"
    case "overdue":
    case "declined":
      return "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
    case "cancelled":
    case "expired":
      return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
    default:
      return "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20"
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
    case "accepted":
      return <CheckCircle className="h-4 w-4" />
    case "overdue":
    case "declined":
      return <XCircle className="h-4 w-4" />
    case "sent":
      return <Clock className="h-4 w-4" />
    case "expired":
      return <AlertCircle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

// Sample data - in real app this would come from API
const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv1",
    number: "INV-2025-001",
    customerId: "cust1",
    date: "2025-01-01",
    dueDate: "2025-01-31",
    amount: 1250.0,
    status: "paid",
    paymentTerms: "Net 30",
    taxAmount: 125.0,
    items: [
      {
        id: "item1",
        description: "Professional Services - Q4 2024",
        quantity: 1,
        unitPrice: 1000.0,
        total: 1000.0,
        taxRate: 0.125,
      },
      {
        id: "item2",
        description: "Additional Support Hours",
        quantity: 5,
        unitPrice: 50.0,
        total: 250.0,
        taxRate: 0.125,
      },
    ],
  },
  {
    id: "inv2",
    number: "INV-2025-015",
    customerId: "cust1",
    date: "2025-01-15",
    dueDate: "2025-02-14",
    amount: 875.0,
    status: "sent",
    paymentTerms: "Net 30",
    taxAmount: 87.5,
    items: [
      {
        id: "item3",
        description: "Monthly Subscription - February 2025",
        quantity: 1,
        unitPrice: 750.0,
        total: 750.0,
        taxRate: 0.125,
      },
    ],
  },
  {
    id: "inv3",
    number: "INV-2025-008",
    customerId: "cust2",
    date: "2024-12-15",
    dueDate: "2025-01-14",
    amount: 2100.0,
    status: "overdue",
    paymentTerms: "Net 30",
    taxAmount: 210.0,
    items: [
      {
        id: "item4",
        description: "Website Development",
        quantity: 1,
        unitPrice: 1800.0,
        total: 1800.0,
        taxRate: 0.125,
      },
      {
        id: "item5",
        description: "Domain & Hosting Setup",
        quantity: 1,
        unitPrice: 300.0,
        total: 300.0,
        taxRate: 0.125,
      },
    ],
  },
]

const SAMPLE_ESTIMATES: Estimate[] = [
  {
    id: "est1",
    number: "EST-2025-003",
    customerId: "cust1",
    date: "2025-01-12",
    expiryDate: "2025-02-12",
    amount: 2500.0,
    status: "sent",
    validityPeriod: "30 days",
    taxAmount: 250.0,
    items: [
      {
        id: "estitem1",
        description: "Website Redesign Project",
        quantity: 1,
        unitPrice: 2000.0,
        total: 2000.0,
        taxRate: 0.125,
      },
      {
        id: "estitem2",
        description: "SEO Optimization Package",
        quantity: 1,
        unitPrice: 500.0,
        total: 500.0,
        taxRate: 0.125,
      },
    ],
  },
  {
    id: "est2",
    number: "EST-2025-007",
    customerId: "cust2",
    date: "2025-01-10",
    expiryDate: "2025-02-10",
    amount: 3200.0,
    status: "accepted",
    validityPeriod: "30 days",
    taxAmount: 320.0,
    items: [
      {
        id: "estitem3",
        description: "E-commerce Platform Development",
        quantity: 1,
        unitPrice: 2800.0,
        total: 2800.0,
        taxRate: 0.125,
      },
      {
        id: "estitem4",
        description: "Payment Gateway Integration",
        quantity: 1,
        unitPrice: 400.0,
        total: 400.0,
        taxRate: 0.125,
      },
    ],
  },
]

export function InvoiceEstimateManager({
  open,
  onOpenChange,
  customerId,
  defaultTab = "invoices",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId?: string
  defaultTab?: "invoices" | "estimates"
}) {
  const [activeTab, setActiveTab] = React.useState(defaultTab)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)
  const [selectedEstimate, setSelectedEstimate] = React.useState<Estimate | null>(null)

  // Filter invoices
  const filteredInvoices = React.useMemo(() => {
    let filtered = SAMPLE_INVOICES

    if (customerId) {
      filtered = filtered.filter((inv) => inv.customerId === customerId)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (inv) =>
          inv.number.toLowerCase().includes(query) ||
          inv.items.some((item) => item.description.toLowerCase().includes(query)),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [customerId, searchQuery, statusFilter])

  // Filter estimates
  const filteredEstimates = React.useMemo(() => {
    let filtered = SAMPLE_ESTIMATES

    if (customerId) {
      filtered = filtered.filter((est) => est.customerId === customerId)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (est) =>
          est.number.toLowerCase().includes(query) ||
          est.items.some((item) => item.description.toLowerCase().includes(query)),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((est) => est.status === statusFilter)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [customerId, searchQuery, statusFilter])

  // Calculate summary stats
  const invoiceStats = React.useMemo(() => {
    const total = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const paid = filteredInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
    const overdue = filteredInvoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0)
    const pending = filteredInvoices.filter((inv) => inv.status === "sent").reduce((sum, inv) => sum + inv.amount, 0)

    return { total, paid, overdue, pending }
  }, [filteredInvoices])

  const estimateStats = React.useMemo(() => {
    const total = filteredEstimates.reduce((sum, est) => sum + est.amount, 0)
    const accepted = filteredEstimates
      .filter((est) => est.status === "accepted")
      .reduce((sum, est) => sum + est.amount, 0)
    const pending = filteredEstimates.filter((est) => est.status === "sent").reduce((sum, est) => sum + est.amount, 0)

    return { total, accepted, pending }
  }, [filteredEstimates])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-6xl p-0">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Invoice & Estimate Manager</SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices and estimates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </div>
            </SheetHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="estimates">Estimates</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="invoices" className="h-full m-0">
                  <div className="p-4">
                    {/* Invoice Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground">Total</div>
                          </div>
                          <div className="text-lg font-bold">{formatCurrency(invoiceStats.total)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <div className="text-xs text-muted-foreground">Paid</div>
                          </div>
                          <div className="text-lg font-bold text-emerald-600">{formatCurrency(invoiceStats.paid)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <div className="text-xs text-muted-foreground">Pending</div>
                          </div>
                          <div className="text-lg font-bold text-blue-600">{formatCurrency(invoiceStats.pending)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <div className="text-xs text-muted-foreground">Overdue</div>
                          </div>
                          <div className="text-lg font-bold text-red-600">{formatCurrency(invoiceStats.overdue)}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Invoice List */}
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-3">
                        {filteredInvoices.map((invoice) => {
                          const customer = getCustomerById(invoice.customerId)
                          return (
                            <Card
                              key={invoice.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{invoice.number}</h4>
                                    <Badge className={cn("text-xs", getStatusColor(invoice.status))}>
                                      {getStatusIcon(invoice.status)}
                                      {invoice.status}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">{formatCurrency(invoice.amount)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Due {formatDate(invoice.dueDate)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                  <span>{customer?.name || "Unknown Customer"}</span>
                                  <span>Issued {formatDate(invoice.date)}</span>
                                </div>
                                <div className="space-y-1">
                                  {invoice.items.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex justify-between text-xs">
                                      <span className="truncate">{item.description}</span>
                                      <span>{formatCurrency(item.total)}</span>
                                    </div>
                                  ))}
                                  {invoice.items.length > 2 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{invoice.items.length - 2} more items
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                    <Send className="h-3 w-3" />
                                    Send
                                  </Button>
                                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                    <Download className="h-3 w-3" />
                                    PDF
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="estimates" className="h-full m-0">
                  <div className="p-4">
                    {/* Estimate Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground">Total Value</div>
                          </div>
                          <div className="text-lg font-bold">{formatCurrency(estimateStats.total)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <div className="text-xs text-muted-foreground">Accepted</div>
                          </div>
                          <div className="text-lg font-bold text-emerald-600">
                            {formatCurrency(estimateStats.accepted)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <div className="text-xs text-muted-foreground">Pending</div>
                          </div>
                          <div className="text-lg font-bold text-blue-600">{formatCurrency(estimateStats.pending)}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Estimate List */}
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-3">
                        {filteredEstimates.map((estimate) => {
                          const customer = getCustomerById(estimate.customerId)
                          return (
                            <Card
                              key={estimate.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setSelectedEstimate(estimate)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{estimate.number}</h4>
                                    <Badge className={cn("text-xs", getStatusColor(estimate.status))}>
                                      {getStatusIcon(estimate.status)}
                                      {estimate.status}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">{formatCurrency(estimate.amount)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Expires {formatDate(estimate.expiryDate)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                  <span>{customer?.name || "Unknown Customer"}</span>
                                  <span>Created {formatDate(estimate.date)}</span>
                                </div>
                                <div className="space-y-1">
                                  {estimate.items.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex justify-between text-xs">
                                      <span className="truncate">{item.description}</span>
                                      <span>{formatCurrency(item.total)}</span>
                                    </div>
                                  ))}
                                  {estimate.items.length > 2 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{estimate.items.length - 2} more items
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                    <Send className="h-3 w-3" />
                                    Send
                                  </Button>
                                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                    <Copy className="h-3 w-3" />
                                    Convert to Invoice
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
