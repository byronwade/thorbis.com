"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  MoreVertical,
  CreditCard,
  DollarSign,
  Receipt,
  Download,
  Eye,
  Edit,
  Trash2,
  Archive,
  Star,
  StarOff,
  Info,
  HelpCircle,
  Wrench,
  RotateCcw,
  Play,
  Pause,
  StopCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Circle,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Link,
  Link2,
  Unlink,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  Cpu,
  Memory,
  HardDriveIcon,
  Network,
  Bluetooth,
  BluetoothOff,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Desktop,
  Printer,
  Scanner,
  Fax,
  Projector,
  Speaker,
  Headphones,
  Microphone,
  Webcam,
  Keyboard,
  Mouse,
  Gamepad2,
  Watch,
  Heart,
  Activity as ActivityIcon,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Shield,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock4,
  CalendarDays,
  CreditCard as CreditCardIcon,
  Wallet,
  Banknote,
  Coins,
  PiggyBank,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Percent,
  Minus,
  Plus as PlusIcon,
  Settings,
  Bell,
  BellOff,
  RefreshCw,
  ExternalLink,
  Copy,
  Share,
  Send,
  Save,
  Upload,
  Cloud,
  Database,
  Globe,
  Wifi as WifiIcon,
  Shield as ShieldIcon,
  Key,
  Fingerprint,
  Smartphone as SmartphoneIcon,
  Monitor as MonitorIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Desktop as DesktopIcon,
  Printer as PrinterIcon,
  Scanner as ScannerIcon,
  Fax as FaxIcon,
  Projector as ProjectorIcon,
  Speaker as SpeakerIcon,
  Headphones as HeadphonesIcon,
  Microphone as MicrophoneIcon,
  Webcam as WebcamIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Gamepad2 as Gamepad2Icon,
  Watch as WatchIcon,
  Heart as HeartIcon,
  Activity as ActivityIcon2
} from 'lucide-react';
import { cn } from '@utils';

// Sample data
const INVOICES = [
  {
    id: "INV-2024-001",
    customer: "Acme Corporation",
    amount: 2499.99,
    status: "paid",
    dueDate: "2024-01-15",
    issueDate: "2024-01-01",
    paidDate: "2024-01-10",
    items: [
      { name: "Premium Plan", quantity: 1, price: 1999.99 },
      { name: "Additional Users", quantity: 5, price: 100.00 }
    ],
    paymentMethod: "Credit Card",
    invoiceNumber: "INV-2024-001",
    customerEmail: "billing@acme.com",
    customerPhone: "+1 (555) 123-4567",
    customerAddress: "123 Business St, New York, NY 10001",
    notes: "Thank you for your business!",
    taxRate: 0.08,
    subtotal: 2499.99,
    tax: 199.99,
    total: 2699.98
  },
  {
    id: "INV-2024-002",
    customer: "TechStart Inc",
    amount: 899.99,
    status: "pending",
    dueDate: "2024-01-20",
    issueDate: "2024-01-05",
    paidDate: null,
    items: [
      { name: "Basic Plan", quantity: 1, price: 799.99 },
      { name: "Support Package", quantity: 1, price: 100.00 }
    ],
    paymentMethod: "Bank Transfer",
    invoiceNumber: "INV-2024-002",
    customerEmail: "finance@techstart.com",
    customerPhone: "+1 (555) 234-5678",
    customerAddress: "456 Innovation Ave, San Francisco, CA 94102",
    notes: "Payment due within 15 days",
    taxRate: 0.08,
    subtotal: 899.99,
    tax: 72.00,
    total: 971.99
  },
  {
    id: "INV-2024-003",
    customer: "Global Solutions",
    amount: 3499.99,
    status: "overdue",
    dueDate: "2024-01-10",
    issueDate: "2023-12-25",
    paidDate: null,
    items: [
      { name: "Enterprise Plan", quantity: 1, price: 2999.99 },
      { name: "Custom Integration", quantity: 1, price: 500.00 }
    ],
    paymentMethod: "Check",
    invoiceNumber: "INV-2024-003",
    customerEmail: "accounts@globalsolutions.com",
    customerPhone: "+1 (555) 345-6789",
    customerAddress: "789 Corporate Blvd, Chicago, IL 60601",
    notes: "Please contact us for payment arrangements",
    taxRate: 0.08,
    subtotal: 3499.99,
    tax: 280.00,
    total: 3779.99
  }
];

const PAYMENT_METHODS = [
  {
    id: 1,
    type: "credit_card",
    name: "Visa ending in 4242",
    last4: "4242",
    brand: "visa",
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    isActive: true,
    customerName: "John Doe",
    billingAddress: "123 Main St, New York, NY 10001"
  },
  {
    id: 2,
    type: "credit_card",
    name: "Mastercard ending in 5555",
    last4: "5555",
    brand: "mastercard",
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
    isActive: true,
    customerName: "John Doe",
    billingAddress: "123 Main St, New York, NY 10001"
  },
  {
    id: 3,
    type: "bank_account",
    name: "Bank of America",
    last4: "1234",
    brand: "bank",
    isDefault: false,
    isActive: true,
    customerName: "John Doe",
    routingNumber: "021000021",
    accountNumber: "****1234"
  }
];

const SUBSCRIPTIONS = [
  {
    id: 1,
    name: "Premium Business Plan",
    status: "active",
    amount: 199.99,
    interval: "monthly",
    nextBilling: "2024-02-01",
    startDate: "2024-01-01",
    endDate: null,
    features: ["Unlimited Users", "Advanced Analytics", "Priority Support", "Custom Branding"],
    paymentMethod: "Visa ending in 4242",
    autoRenew: true,
    trialEnds: null
  },
  {
    id: 2,
    name: "Email Marketing Add-on",
    status: "active",
    amount: 49.99,
    interval: "monthly",
    nextBilling: "2024-02-01",
    startDate: "2024-01-15",
    endDate: null,
    features: ["Email Campaigns", "Subscriber Management", "Analytics", "Templates"],
    paymentMethod: "Visa ending in 4242",
    autoRenew: true,
    trialEnds: null
  }
];

const BILLING_HISTORY = [
  {
    id: 1,
    date: "2024-01-01",
    description: "Premium Business Plan",
    amount: 199.99,
    status: "paid",
    invoiceId: "INV-2024-001",
    paymentMethod: "Visa ending in 4242"
  },
  {
    id: 2,
    date: "2024-01-15",
    description: "Email Marketing Add-on",
    amount: 49.99,
    status: "paid",
    invoiceId: "INV-2024-004",
    paymentMethod: "Visa ending in 4242"
  },
  {
    id: 3,
    date: "2023-12-01",
    description: "Premium Business Plan",
    amount: 199.99,
    status: "paid",
    invoiceId: "INV-2023-012",
    paymentMethod: "Visa ending in 4242"
  }
];

export default function BillingManager() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  const filteredInvoices = useMemo(() => {
    return INVOICES.filter(invoice => {
      const matchesSearch = invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "overdue": return "bg-red-500";
      case "cancelled": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      case "cancelled": return "outline";
      default: return "outline";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalRevenue = () => {
    return INVOICES.reduce((total, invoice) => {
      if (invoice.status === 'paid') {
        return total + invoice.total;
      }
      return total;
    }, 0);
  };

  const getOutstandingAmount = () => {
    return INVOICES.reduce((total, invoice) => {
      if (invoice.status === 'pending' || invoice.status === 'overdue') {
        return total + invoice.total;
      }
      return total;
    }, 0);
  };

  if (selectedInvoice) {
    return (
      <div className="flex h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
        {/* Invoice List */}
        <div className="w-96 border-r bg-muted/30">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Invoices</h2>
              <Button size="sm" onClick={() => setShowCreateInvoice(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    selectedInvoice?.id === invoice.id
                      ? "bg-background border shadow-sm"
                      : "hover:bg-background/50"
                  )}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{invoice.customer}</p>
                      <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{formatDate(invoice.dueDate)}</span>
                    <span className="font-medium">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Invoice Details */}
        <div className="flex-1 flex flex-col">
          {/* Invoice Header */}
          <div className="flex-shrink-0 p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Receipt className="h-6 w-6 text-blue-600" />
                  <div>
                    <h1 className="text-xl font-semibold">{selectedInvoice.invoiceNumber}</h1>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.customer}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">Due: {formatDate(selectedInvoice.dueDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <p className="font-medium">{formatCurrency(selectedInvoice.total)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Issue Date:</span>
                <p className="font-medium">{formatDate(selectedInvoice.issueDate)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Method:</span>
                <p className="font-medium">{selectedInvoice.paymentMethod}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium capitalize">{selectedInvoice.status}</p>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Invoice Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoice Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax ({(selectedInvoice.taxRate * 100).toFixed(0)}%)</span>
                          <span>{formatCurrency(selectedInvoice.tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatCurrency(selectedInvoice.total)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status</span>
                          <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>
                            {selectedInvoice.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Due Date</span>
                          <span className="font-medium">{formatDate(selectedInvoice.dueDate)}</span>
                        </div>
                        {selectedInvoice.paidDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Paid Date</span>
                            <span className="font-medium">{formatDate(selectedInvoice.paidDate)}</span>
                          </div>
                        )}
                        {selectedInvoice.status === 'pending' && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Days Until Due</span>
                            <span className={cn("font-medium", getDaysUntilDue(selectedInvoice.dueDate) < 0 ? "text-red-600" : "text-yellow-600")}>
                              {getDaysUntilDue(selectedInvoice.dueDate)} days
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="items" className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Invoice Items</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {selectedInvoice.items.map((item, index) => (
                          <div key={index} className="p-4 flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(item.price)}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="customer" className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Customer Name</span>
                        <p className="font-medium">{selectedInvoice.customer}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Email</span>
                        <p className="font-medium">{selectedInvoice.customerEmail}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Phone</span>
                        <p className="font-medium">{selectedInvoice.customerPhone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Address</span>
                        <p className="font-medium">{selectedInvoice.customerAddress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Payment Method</span>
                        <p className="font-medium">{selectedInvoice.paymentMethod}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Invoice Number</span>
                        <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Issue Date</span>
                        <p className="font-medium">{formatDate(selectedInvoice.issueDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Due Date</span>
                        <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Billing</h1>
            <p className="text-muted-foreground">Manage invoices, payments, and subscriptions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateInvoice(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("paid")}>Paid</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>Overdue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 pt-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <TabsContent value={activeTab} className="h-full">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
                      <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(getOutstandingAmount())}</div>
                      <p className="text-xs text-muted-foreground">3 invoices pending</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{SUBSCRIPTIONS.length}</div>
                      <p className="text-xs text-muted-foreground">+2 new this month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{PAYMENT_METHODS.length}</div>
                      <p className="text-xs text-muted-foreground">2 credit cards, 1 bank account</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Invoices */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {INVOICES.slice(0, 3).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                          <div className="flex items-center gap-4">
                            <div className={cn("w-3 h-3 rounded-full", getStatusColor(invoice.status))} />
                            <div>
                              <p className="font-medium">{invoice.customer}</p>
                              <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(invoice.total)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(invoice.dueDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-3 h-3 rounded-full", getStatusColor(invoice.status))} />
                          <div>
                            <p className="font-medium">{invoice.customer}</p>
                            <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(invoice.total)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(invoice.dueDate)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredInvoices.length === 0 && (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Try adjusting your search criteria." : "Create your first invoice to get started."}
                    </p>
                    <Button onClick={() => setShowCreateInvoice(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "subscriptions" && (
              <div className="space-y-4">
                {SUBSCRIPTIONS.map((subscription) => (
                  <Card key={subscription.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{subscription.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(subscription.amount)}/{subscription.interval}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                            {subscription.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground">Next: {formatDate(subscription.nextBilling)}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "payment-methods" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Payment Methods</h3>
                  <Button onClick={() => setShowAddPaymentMethod(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
                {PAYMENT_METHODS.map((method) => (
                  <Card key={method.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">Expires {method.expiryMonth}/{method.expiryYear}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault && <Badge className="text-xs">Default</Badge>}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                Set as Default
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
