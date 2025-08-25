"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useBusinessStore from '@store/use-business-store';
import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  Building,
  Building2,
  ChevronDown,
  Plus,
  Settings,
  Search,
  BarChart3,
  Users,
  FileText,
  Calendar,
  Briefcase,
  Truck,
  Calculator,
  BookOpen,
  Package,
  MessageSquare,
  DollarSign,
  Clock,
  TrendingUp,
  Sparkles,
  Crown,
  Store,
  Check,
  Pin,
  PinOff,
  AlertTriangle,
  Receipt,
  X,
  ArrowRight,
  DollarSign as DollarSignIcon,
  Clock as ClockIcon,
  Target,
  MapPin,
  User,
  Wrench,
  Phone,
  Bell,
  Shield,
  Activity,
  CreditCard,
  Keyboard,
  ChefHat,
  ShoppingCart,
  Home,
  Code,
  Monitor,
  Scissors,
  Tag,
  QrCode,
  Mail,
  Globe,
  Printer,
  Camera,
  Eye,
  Star,
  Heart,
  GitBranch,
  ArrowUpRight,
  Database,
  Pill,
  Car
} from 'lucide-react';

// Types
interface Business {
  id: string;
  name: string;
  industry: string;
  plan?: string;
  logo?: string;
}

interface BusinessSwitcherProps {
  businesses?: Business[];
  onBusinessSwitch: (businessId: string) => void;
}

export default function BusinessSwitcher({ businesses = [], onBusinessSwitch }: BusinessSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [switchingBusiness, setSwitchingBusiness] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const router = useRouter();
  
  // Use global business store for real-time updates
  const { activeBusinessId } = useBusinessStore();
  
  // Get current business from the businesses array using global store ID
  const currentBusiness = businesses.find(b => b.id === (activeBusinessId || "1")) || null;
  


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset dropdown state when business changes
  useEffect(() => {
    if (switchingBusiness) {
      // Reset switching state after navigation
      const timer = setTimeout(() => {
        setSwitchingBusiness(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [switchingBusiness]);

  // Reset dropdown open state when business changes
  useEffect(() => {
    setIsOpen(false);
  }, [activeBusinessId]);

  // Keyboard navigation handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          e.preventDefault();
          const quickIndex = parseInt(e.key) - 1;
          const quickActions = getQuickActions();
          if (quickActions[quickIndex]) {
            router.push(quickActions[quickIndex].href);
            setIsOpen(false);
          }
          break;
        case 'h':
        case 'H':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            router.push('/dashboard/business/settings');
            setIsOpen(false);
          }
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showKeyboardHelp, router]);

  // Return loading state if no current business is selected
  if (!currentBusiness) {
    return (
      <Button variant="ghost" className="flex items-center space-x-2 text-white hover:text-primary hover:bg-neutral-800/50 transition-colors" disabled>
        <Building2 className="w-4 h-4" />
        <span className="hidden sm:inline">Loading...</span>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </Button>
    );
  }

  const handleBusinessSwitch = (businessId: string) => {
    setSwitchingBusiness(true);
    setIsOpen(false);
    onBusinessSwitch(businessId);
  };

  const getIndustryLabel = (industry: string) => {
    const labels = {
      'field_service': 'Field Service',
      'plumbing': 'Plumbing',
      'hvac': 'HVAC',
      'construction': 'Construction',
      'restaurant': 'Restaurant',
      'retail': 'Retail',
      'healthcare': 'Healthcare',
      'automotive': 'Automotive',
      'beauty': 'Beauty & Wellness',
      'legal': 'Legal Services',
      'real_estate': 'Real Estate',
      'education': 'Education',
      'technology': 'Technology',
      'manufacturing': 'Manufacturing',
      'consulting': 'Consulting',
      'other': 'Other'
    };
    return labels[industry as keyof typeof labels] || 'Business';
  };

  const getBusinessIcon = (industry: string) => {
    const icons = {
      'field_service': Building2,
      'plumbing': Building2,
      'hvac': Building2,
      'construction': Building2,
      'restaurant': Store,
      'retail': Store,
      'healthcare': Store,
      'automotive': Store,
      'beauty': Store,
      'legal': Store,
      'real_estate': Store,
      'education': Store,
      'technology': Store,
      'manufacturing': Store,
      'consulting': Store,
      'other': Store
    };
    return icons[industry as keyof typeof icons] || Building2;
  };

  const getIndustryRoute = (industry: string) => {
    const routeMap: { [key: string]: string } = {
      'real_estate': 'real-estate',
      'field_service': 'field-management',
      'plumbing': 'field-management',
      'hvac': 'field-management', 
      'construction': 'field-management'
    };
    return routeMap[industry] || industry;
  };

  const planColors = {
    'free': 'text-gray-400',
    'basic': 'text-blue-400',
    'pro': 'text-purple-400',
    'enterprise': 'text-yellow-400'
  };

  const planIcons = {
    'free': Crown,
    'basic': Crown,
    'pro': Crown,
    'enterprise': Crown
  };

  const getBusinessPlanIcon = (plan: string) => {
    return planIcons[plan as keyof typeof planIcons] || Crown;
  };

  // Color system with proper Tailwind classes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      hover: 'hover:bg-blue-500/20'
    },
    green: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      hover: 'hover:bg-green-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      hover: 'hover:bg-purple-500/20'
    },
    orange: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      hover: 'hover:bg-orange-500/20'
    },
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      hover: 'hover:bg-primary/20'
    }
  };

  // Smart navigation structure - optimized for mobile
  const getQuickActions = () => {
    if (!currentBusiness || !currentBusiness.industry) {
      return [];
    }
    
    if (currentBusiness.industry === 'field_service' || currentBusiness.industry === 'plumbing' || currentBusiness.industry === 'hvac' || currentBusiness.industry === 'construction') {
      return [
        { name: 'Schedule', icon: Calendar, href: '/dashboard/business/field-management/schedule', color: 'blue', priority: true },
        { name: 'Jobs', icon: Briefcase, href: '/dashboard/business/field-management/jobs', color: 'green', priority: true },
        { name: 'Customers', icon: Users, href: '/dashboard/business/field-management/customers', color: 'purple', priority: false },
        { name: 'Invoices', icon: FileText, href: '/dashboard/business/field-management/invoices', color: 'orange', priority: false }
      ];
    } else if (currentBusiness.industry === 'restaurant') {
      return [
        { name: 'POS System', icon: Store, href: '/dashboard/business/restaurants/pos', color: 'blue', priority: true },
        { name: 'Menu Management', icon: BookOpen, href: '/dashboard/business/restaurants/menu', color: 'green', priority: true },
        { name: 'Kitchen Display', icon: ChefHat, href: '/dashboard/business/restaurants/kitchen', color: 'purple', priority: false },
        { name: 'Delivery', icon: Truck, href: '/dashboard/business/restaurants/delivery', color: 'orange', priority: false }
      ];
    } else if (currentBusiness.industry === 'retail') {
      return [
        { name: 'POS System', icon: ShoppingCart, href: '/dashboard/business/retail/pos', color: 'blue', priority: true },
        { name: 'Inventory', icon: Package, href: '/dashboard/business/retail/inventory', color: 'green', priority: true },
        { name: 'Customers', icon: Users, href: '/dashboard/business/retail/customers', color: 'purple', priority: false },
        { name: 'Analytics', icon: BarChart3, href: '/dashboard/business/retail/analytics', color: 'orange', priority: false },
        { name: 'Settings', icon: Settings, href: '/dashboard/business/retail/settings', color: 'primary', priority: false }
      ];
    } else if (currentBusiness.industry === 'real_estate') {
      return [
        { name: 'Listings', icon: Home, href: '/dashboard/business/real-estate/listings', color: 'blue', priority: true },
        { name: 'Leads', icon: Target, href: '/dashboard/business/real-estate/leads', color: 'green', priority: true },
        { name: 'Agents', icon: Users, href: '/dashboard/business/real-estate/agents', color: 'purple', priority: false },
        { name: 'Analytics', icon: BarChart3, href: '/dashboard/business/real-estate/analytics', color: 'orange', priority: false },
        { name: 'Settings', icon: Settings, href: '/dashboard/business/real-estate/settings', color: 'primary', priority: false }
      ];
    } else if (currentBusiness.industry === 'technology') {
      return [
        { name: 'Projects', icon: Code, href: '/dashboard/business/technology/projects', color: 'blue', priority: true },
        { name: 'Clients', icon: Users, href: '/dashboard/business/technology/clients', color: 'green', priority: true },
        { name: 'Monitoring', icon: Monitor, href: '/dashboard/business/technology/monitoring', color: 'purple', priority: false },
        { name: 'Analytics', icon: BarChart3, href: '/dashboard/business/technology/analytics', color: 'orange', priority: false },
        { name: 'Settings', icon: Settings, href: '/dashboard/business/technology/settings', color: 'primary', priority: false }
      ];
    } else if (currentBusiness.industry === 'beauty') {
      return [
        { name: 'Appointments', icon: Calendar, href: '/dashboard/business/beauty/appointments', color: 'blue', priority: true },
        { name: 'Clients', icon: Users, href: '/dashboard/business/beauty/clients', color: 'green', priority: true },
        { name: 'Services', icon: Scissors, href: '/dashboard/business/beauty/services', color: 'purple', priority: false },
        { name: 'Analytics', icon: BarChart3, href: '/dashboard/business/beauty/analytics', color: 'orange', priority: false },
        { name: 'Settings', icon: Settings, href: '/dashboard/business/beauty/settings', color: 'primary', priority: false }
      ];
    } else if (currentBusiness.industry === 'healthcare') {
      return [
        { name: 'Appointments', icon: Calendar, href: '/dashboard/business/healthcare/appointments', color: 'blue', priority: true },
        { name: 'Patients', icon: Users, href: '/dashboard/business/healthcare/patients', color: 'green', priority: true },
        { name: 'Records', icon: FileText, href: '/dashboard/business/healthcare/records', color: 'purple', priority: false },
        { name: 'Analytics', icon: BarChart3, href: '/dashboard/business/healthcare/analytics', color: 'orange', priority: false },
        { name: 'Settings', icon: Settings, href: '/dashboard/business/healthcare/settings', color: 'primary', priority: false }
      ];
    } else if (currentBusiness.industry === 'automotive') {
      return [
        { name: 'Service Orders', icon: Wrench, href: '/dashboard/business/automotive/service', color: 'blue', priority: true },
        { name: 'Parts Inventory', icon: Package, href: '/dashboard/business/automotive/parts', color: 'green', priority: true },
        { name: 'Customers', icon: Users, href: '/dashboard/business/automotive/customers', color: 'purple', priority: false },
        { name: 'Analytics', icon: BarChart3, href: '/dashboard/business/automotive/analytics', color: 'orange', priority: false },
        { name: 'Settings', icon: Settings, href: '/dashboard/business/automotive/settings', color: 'primary', priority: false }
      ];
    } else {
      return [
        { name: 'Dashboard', icon: BarChart3, href: '/dashboard/business/profile', color: 'blue', priority: true },
        { name: 'Customers', icon: Users, href: '/dashboard/business/customers', color: 'green', priority: true },
        { name: 'Inventory', icon: Package, href: '/dashboard/business/inventory', color: 'purple', priority: false },
        { name: 'Reports', icon: TrendingUp, href: '/dashboard/business/reports', color: 'orange', priority: false }
      ];
    }
  };

  const getMainSections = () => {
    if (!currentBusiness || !currentBusiness.industry) {
      return [];
    }
    
    if (currentBusiness.industry === 'field_service' || currentBusiness.industry === 'plumbing' || currentBusiness.industry === 'hvac' || currentBusiness.industry === 'construction') {
      return [
        {
          title: 'Field Operations',
          items: [
            { name: 'Schedule', icon: Calendar, href: '/dashboard/business/field-management/schedule' },
            { name: 'Dispatch', icon: Target, href: '/dashboard/business/field-management/dispatch' },
            { name: 'Jobs', icon: Briefcase, href: '/dashboard/business/field-management/jobs' },
            { name: 'Fleet', icon: Truck, href: '/dashboard/business/field-management/fleet' },
            { name: 'Routes', icon: MapPin, href: '/dashboard/business/field-management/routes' },
            { name: 'Equipment', icon: Package, href: '/dashboard/business/field-management/equipment' },
            { name: 'Technicians', icon: User, href: '/dashboard/business/field-management/technicians' },
            { name: 'Work Orders', icon: Wrench, href: '/dashboard/business/field-management/work-orders' }
          ]
        },
        {
          title: 'Sales & Customer Management',
          items: [
            { name: 'Customers', icon: Users, href: '/dashboard/business/field-management/customers' },
            { name: 'Leads', icon: Target, href: '/dashboard/business/field-management/leads' },
            { name: 'Estimates', icon: Calculator, href: '/dashboard/business/field-management/estimates' },
            { name: 'Proposals', icon: FileText, href: '/dashboard/business/field-management/proposals' },
            { name: 'Contracts', icon: FileText, href: '/dashboard/business/field-management/contracts' },
            { name: 'Recurring Services', icon: Clock, href: '/dashboard/business/field-management/recurring-services' }
          ]
        },
        {
          title: 'Inventory & Parts',
          items: [
            { name: 'Inventory', icon: Package, href: '/dashboard/business/field-management/inventory' },
            { name: 'Parts', icon: Package, href: '/dashboard/business/field-management/parts' },
            { name: 'Suppliers', icon: Building2, href: '/dashboard/business/field-management/suppliers' },
            { name: 'Purchase Orders', icon: Receipt, href: '/dashboard/business/field-management/purchase-orders' },
            { name: 'Warehouse', icon: Package, href: '/dashboard/business/field-management/warehouse' }
          ]
        },
        {
          title: 'Financial Management',
          items: [
            { name: 'Invoices', icon: FileText, href: '/dashboard/business/field-management/invoices' },
            { name: 'Payments', icon: CreditCard, href: '/dashboard/business/field-management/payments' },
            { name: 'Billing', icon: Receipt, href: '/dashboard/business/field-management/billing' },
            { name: 'Pricing', icon: DollarSign, href: '/dashboard/business/field-management/pricing' },
            { name: 'Cost Tracking', icon: Calculator, href: '/dashboard/business/field-management/cost-tracking' },
            { name: 'Profitability', icon: TrendingUp, href: '/dashboard/business/field-management/profitability' }
          ]
        },
        {
          title: 'Communication & Business',
          items: [
            { name: 'Communication', icon: MessageSquare, href: '/dashboard/business/field-management/communication' },
            { name: 'Service Calls', icon: Phone, href: '/dashboard/business/field-management/service-calls' },
            { name: 'Notifications', icon: Bell, href: '/dashboard/business/field-management/notifications' },
            { name: 'Team', icon: Users, href: '/dashboard/shared/employees' },
            { name: 'Training', icon: BookOpen, href: '/dashboard/business/field-management/training' },
            { name: 'Compliance', icon: Shield, href: '/dashboard/business/field-management/compliance' }
          ]
        },
        {
          title: 'Reporting & Analytics',
          items: [
            { name: 'Reports', icon: BarChart3, href: '/dashboard/business/field-management/reports' },
            { name: 'KPIs', icon: Target, href: '/dashboard/business/field-management/kpis' },
            { name: 'Performance', icon: Activity, href: '/dashboard/business/field-management/performance' },
            { name: 'Analytics', icon: TrendingUp, href: '/dashboard/shared/analytics' },
            { name: 'Forecasting', icon: TrendingUp, href: '/dashboard/business/field-management/forecasting' }
          ]
        }
      ];
    } else if (currentBusiness.industry === 'restaurant') {
      return [
        {
          title: 'Point of Sale',
          items: [
            { name: 'POS System', icon: Store, href: '/dashboard/business/restaurants/pos' },
            { name: 'Orders', icon: Package, href: '/dashboard/business/restaurants/orders' },
            { name: 'Payments', icon: CreditCard, href: '/dashboard/business/restaurants/payments' },
            { name: 'Refunds', icon: Receipt, href: '/dashboard/business/restaurants/refunds' }
          ]
        },
        {
          title: 'Menu & Kitchen',
          items: [
            { name: 'Menu Management', icon: BookOpen, href: '/dashboard/business/restaurants/menu' },
            { name: 'Kitchen Display', icon: ChefHat, href: '/dashboard/business/restaurants/kitchen' },
            { name: 'Recipe Management', icon: BookOpen, href: '/dashboard/business/restaurants/recipes' },
            { name: 'Food Costing', icon: Calculator, href: '/dashboard/business/restaurants/food-costing' }
          ]
        },
        {
          title: 'Customer Service',
          items: [
            { name: 'Customers', icon: Users, href: '/dashboard/business/restaurants/customers' },
            { name: 'Reservations', icon: Calendar, href: '/dashboard/business/restaurants/reservations' },
            { name: 'Loyalty Program', icon: Crown, href: '/dashboard/business/restaurants/loyalty' },
            { name: 'Reviews', icon: MessageSquare, href: '/dashboard/business/restaurants/reviews' }
          ]
        },
        {
          title: 'Delivery & Takeout',
          items: [
            { name: 'Delivery Management', icon: Truck, href: '/dashboard/business/restaurants/delivery' },
            { name: 'Takeout Orders', icon: Package, href: '/dashboard/business/restaurants/takeout' },
            { name: 'Third-party Apps', icon: Store, href: '/dashboard/business/restaurants/third-party' },
            { name: 'Delivery Zones', icon: MapPin, href: '/dashboard/business/restaurants/delivery-zones' }
          ]
        },
        {
          title: 'Inventory & Supplies',
          items: [
            { name: 'Inventory Management', icon: Package, href: '/dashboard/business/restaurants/inventory' },
            { name: 'Suppliers', icon: Building2, href: '/dashboard/business/restaurants/suppliers' },
            { name: 'Purchase Orders', icon: Receipt, href: '/dashboard/business/restaurants/purchase-orders' },
            { name: 'Stock Alerts', icon: Bell, href: '/dashboard/business/restaurants/stock-alerts' }
          ]
        },
        {
          title: 'Staff Management',
          items: [
            { name: 'Staff', icon: Users, href: '/dashboard/business/restaurants/staff' },
            { name: 'Scheduling', icon: Calendar, href: '/dashboard/business/restaurants/scheduling' },
            { name: 'Time Tracking', icon: Clock, href: '/dashboard/business/restaurants/time-tracking' },
            { name: 'Payroll', icon: DollarSign, href: '/dashboard/business/restaurants/payroll' }
          ]
        },
        {
          title: 'Analytics & Reports',
          items: [
            { name: 'Sales Reports', icon: BarChart3, href: '/dashboard/business/restaurants/sales-reports' },
            { name: 'Performance Analytics', icon: TrendingUp, href: '/dashboard/business/restaurants/analytics' },
            { name: 'Financial Reports', icon: DollarSign, href: '/dashboard/business/restaurants/financial-reports' },
            { name: 'Customer Insights', icon: Users, href: '/dashboard/business/restaurants/customer-insights' }
          ]
        },
        {
          title: 'Settings & Configuration',
          items: [
            { name: 'Restaurant Settings', icon: Settings, href: '/dashboard/business/restaurants/settings' },
            { name: 'Tax Configuration', icon: Calculator, href: '/dashboard/business/restaurants/tax-settings' },
            { name: 'Printer Setup', icon: Receipt, href: '/dashboard/business/restaurants/printer-setup' },
            { name: 'Integrations', icon: Settings, href: '/dashboard/business/restaurants/integrations' }
          ]
        }
      ];
    } else if (currentBusiness.industry === 'retail') {
      return [
        {
          title: 'Point of Sale & Sales',
          items: [
            { name: 'POS System', icon: ShoppingCart, href: '/dashboard/business/retail/pos' },
            { name: 'Sales Transactions', icon: CreditCard, href: '/dashboard/business/retail/sales' },
            { name: 'Returns & Refunds', icon: Receipt, href: '/dashboard/business/retail/returns' },
            { name: 'Gift Cards', icon: Tag, href: '/dashboard/business/retail/gift-cards' },
            { name: 'Loyalty Program', icon: Crown, href: '/dashboard/business/retail/loyalty' },
            { name: 'Promotions', icon: Sparkles, href: '/dashboard/business/retail/promotions' },
            { name: 'Discounts', icon: DollarSign, href: '/dashboard/business/retail/discounts' },
            { name: 'Sales Reports', icon: BarChart3, href: '/dashboard/business/retail/sales-reports' }
          ]
        },
        {
          title: 'Inventory Management',
          items: [
            { name: 'Product Catalog', icon: Package, href: '/dashboard/business/retail/inventory' },
            { name: 'Stock Management', icon: Package, href: '/dashboard/business/retail/stock' },
            { name: 'Purchase Orders', icon: Receipt, href: '/dashboard/business/retail/purchase-orders' },
            { name: 'Suppliers', icon: Building2, href: '/dashboard/business/retail/suppliers' },
            { name: 'Stock Alerts', icon: Bell, href: '/dashboard/business/retail/stock-alerts' },
            { name: 'Inventory Reports', icon: BarChart3, href: '/dashboard/business/retail/inventory-reports' },
            { name: 'Barcode Management', icon: QrCode, href: '/dashboard/business/retail/barcodes' },
            { name: 'Product Categories', icon: Tag, href: '/dashboard/business/retail/categories' }
          ]
        },
        {
          title: 'Customer Management',
          items: [
            { name: 'Customer Database', icon: Users, href: '/dashboard/business/retail/customers' },
            { name: 'Customer Profiles', icon: User, href: '/dashboard/business/retail/customer-profiles' },
            { name: 'Purchase History', icon: Clock, href: '/dashboard/business/retail/purchase-history' },
            { name: 'Customer Reviews', icon: MessageSquare, href: '/dashboard/business/retail/reviews' },
            { name: 'Email Marketing', icon: Mail, href: '/dashboard/business/retail/email-marketing' },
            { name: 'SMS Marketing', icon: Phone, href: '/dashboard/business/retail/sms-marketing' },
            { name: 'Customer Analytics', icon: BarChart3, href: '/dashboard/business/retail/customer-analytics' },
            { name: 'Customer Support', icon: MessageSquare, href: '/dashboard/business/retail/support' }
          ]
        },
        {
          title: 'Staff & Operations',
          items: [
            { name: 'Staff Management', icon: Users, href: '/dashboard/business/retail/staff' },
            { name: 'Employee Scheduling', icon: Calendar, href: '/dashboard/business/retail/scheduling' },
            { name: 'Time Tracking', icon: Clock, href: '/dashboard/business/retail/time-tracking' },
            { name: 'Payroll', icon: DollarSign, href: '/dashboard/business/retail/payroll' },
            { name: 'Performance Tracking', icon: Activity, href: '/dashboard/business/retail/performance' },
            { name: 'Training', icon: BookOpen, href: '/dashboard/business/retail/training' },
            { name: 'Shift Management', icon: Calendar, href: '/dashboard/business/retail/shifts' },
            { name: 'Employee Portal', icon: User, href: '/dashboard/business/retail/employee-portal' }
          ]
        },
        {
          title: 'Financial Management',
          items: [
            { name: 'Sales Analytics', icon: BarChart3, href: '/dashboard/business/retail/analytics' },
            { name: 'Revenue Reports', icon: DollarSign, href: '/dashboard/business/retail/revenue' },
            { name: 'Profit Margins', icon: TrendingUp, href: '/dashboard/business/retail/margins' },
            { name: 'Tax Management', icon: Calculator, href: '/dashboard/business/retail/tax' },
            { name: 'Expense Tracking', icon: Receipt, href: '/dashboard/business/retail/expenses' },
            { name: 'Cash Flow', icon: DollarSign, href: '/dashboard/business/retail/cash-flow' },
            { name: 'Financial Reports', icon: FileText, href: '/dashboard/business/retail/financial-reports' },
            { name: 'Budget Planning', icon: Target, href: '/dashboard/business/retail/budget' }
          ]
        },
        {
          title: 'Marketing & Promotions',
          items: [
            { name: 'Marketing Campaigns', icon: Target, href: '/dashboard/business/retail/marketing' },
            { name: 'Social Media', icon: Globe, href: '/dashboard/business/retail/social-media' },
            { name: 'Email Campaigns', icon: Mail, href: '/dashboard/business/retail/email-campaigns' },
            { name: 'SMS Campaigns', icon: Phone, href: '/dashboard/business/retail/sms-campaigns' },
            { name: 'Coupon Management', icon: Tag, href: '/dashboard/business/retail/coupons' },
            { name: 'Seasonal Promotions', icon: Sparkles, href: '/dashboard/business/retail/seasonal' },
            { name: 'Referral Program', icon: Users, href: '/dashboard/business/retail/referrals' },
            { name: 'Marketing Analytics', icon: BarChart3, href: '/dashboard/business/retail/marketing-analytics' }
          ]
        },
        {
          title: 'Settings & Configuration',
          items: [
            { name: 'Retail Settings', icon: Settings, href: '/dashboard/business/retail/settings' },
            { name: 'POS Configuration', icon: CreditCard, href: '/dashboard/business/retail/pos-settings' },
            { name: 'Inventory Settings', icon: Package, href: '/dashboard/business/retail/inventory-settings' },
            { name: 'Customer Settings', icon: Users, href: '/dashboard/business/retail/customer-settings' },
            { name: 'Payment Settings', icon: DollarSign, href: '/dashboard/business/retail/payment-settings' },
            { name: 'Tax Configuration', icon: Calculator, href: '/dashboard/business/retail/tax-settings' },
            { name: 'Printer Setup', icon: Printer, href: '/dashboard/business/retail/printer-setup' },
            { name: 'Integrations', icon: Globe, href: '/dashboard/business/retail/integrations' }
          ]
        }
      ];
    } else if (currentBusiness.industry === 'real_estate') {
      return [
        {
          title: 'Property Listings',
          items: [
            { name: 'Active Listings', icon: Home, href: '/dashboard/business/real-estate/listings' },
            { name: 'Listing Management', icon: Building2, href: '/dashboard/business/real-estate/listing-management' },
            { name: 'Property Photos', icon: Camera, href: '/dashboard/business/real-estate/photos' },
            { name: 'Virtual Tours', icon: Eye, href: '/dashboard/business/real-estate/virtual-tours' },
            { name: 'Property Details', icon: FileText, href: '/dashboard/business/real-estate/property-details' },
            { name: 'Market Analysis', icon: BarChart3, href: '/dashboard/business/real-estate/market-analysis' },
            { name: 'Comparable Sales', icon: TrendingUp, href: '/dashboard/business/real-estate/comps' },
            { name: 'Listing Reports', icon: FileText, href: '/dashboard/business/real-estate/listing-reports' }
          ]
        },
        {
          title: 'Lead Management',
          items: [
            { name: 'Lead Database', icon: Target, href: '/dashboard/business/real-estate/leads' },
            { name: 'Lead Capture', icon: Target, href: '/dashboard/business/real-estate/lead-capture' },
            { name: 'Lead Scoring', icon: Star, href: '/dashboard/business/real-estate/lead-scoring' },
            { name: 'Lead Nurturing', icon: Heart, href: '/dashboard/business/real-estate/lead-nurturing' },
            { name: 'Lead Assignment', icon: Users, href: '/dashboard/business/real-estate/lead-assignment' },
            { name: 'Lead Tracking', icon: Activity, href: '/dashboard/business/real-estate/lead-tracking' },
            { name: 'Lead Analytics', icon: BarChart3, href: '/dashboard/business/real-estate/lead-analytics' },
            { name: 'Lead Communication', icon: MessageSquare, href: '/dashboard/business/real-estate/lead-communication' }
          ]
        },
        {
          title: 'Agent Management',
          items: [
            { name: 'Agent Directory', icon: Users, href: '/dashboard/business/real-estate/agents' },
            { name: 'Agent Profiles', icon: User, href: '/dashboard/business/real-estate/agent-profiles' },
            { name: 'Performance Tracking', icon: Activity, href: '/dashboard/business/real-estate/agent-performance' },
            { name: 'Commission Tracking', icon: DollarSign, href: '/dashboard/business/real-estate/commissions' },
            { name: 'Agent Training', icon: BookOpen, href: '/dashboard/business/real-estate/agent-training' },
            { name: 'Agent Scheduling', icon: Calendar, href: '/dashboard/business/real-estate/agent-scheduling' },
            { name: 'Agent Reviews', icon: Star, href: '/dashboard/business/real-estate/agent-reviews' },
            { name: 'Agent Analytics', icon: BarChart3, href: '/dashboard/business/real-estate/agent-analytics' }
          ]
        },
        {
          title: 'Client Management',
          items: [
            { name: 'Client Database', icon: Users, href: '/dashboard/business/real-estate/clients' },
            { name: 'Client Profiles', icon: User, href: '/dashboard/business/real-estate/client-profiles' },
            { name: 'Client Communication', icon: MessageSquare, href: '/dashboard/business/real-estate/client-communication' },
            { name: 'Client Preferences', icon: Heart, href: '/dashboard/business/real-estate/client-preferences' },
            { name: 'Client History', icon: Clock, href: '/dashboard/business/real-estate/client-history' },
            { name: 'Client Reviews', icon: Star, href: '/dashboard/business/real-estate/client-reviews' },
            { name: 'Client Referrals', icon: Users, href: '/dashboard/business/real-estate/client-referrals' },
            { name: 'Client Analytics', icon: BarChart3, href: '/dashboard/business/real-estate/client-analytics' }
          ]
        },
        {
          title: 'Transaction Management',
          items: [
            { name: 'Sales Transactions', icon: DollarSign, href: '/dashboard/business/real-estate/transactions' },
            { name: 'Purchase Agreements', icon: FileText, href: '/dashboard/business/real-estate/purchase-agreements' },
            { name: 'Closing Management', icon: Check, href: '/dashboard/business/real-estate/closings' },
            { name: 'Title & Escrow', icon: Shield, href: '/dashboard/business/real-estate/title-escrow' },
            { name: 'Document Management', icon: FileText, href: '/dashboard/business/real-estate/documents' },
            { name: 'Contract Templates', icon: FileText, href: '/dashboard/business/real-estate/contracts' },
            { name: 'Transaction Timeline', icon: Calendar, href: '/dashboard/business/real-estate/timeline' },
            { name: 'Transaction Reports', icon: BarChart3, href: '/dashboard/business/real-estate/transaction-reports' }
          ]
        },
        {
          title: 'Marketing & Advertising',
          items: [
            { name: 'Marketing Campaigns', icon: Target, href: '/dashboard/business/real-estate/marketing' },
            { name: 'Social Media', icon: Globe, href: '/dashboard/business/real-estate/social-media' },
            { name: 'Email Marketing', icon: Mail, href: '/dashboard/business/real-estate/email-marketing' },
            { name: 'Print Advertising', icon: Printer, href: '/dashboard/business/real-estate/print-ads' },
            { name: 'Open Houses', icon: Calendar, href: '/dashboard/business/real-estate/open-houses' },
            { name: 'Property Showings', icon: Eye, href: '/dashboard/business/real-estate/showings' },
            { name: 'Marketing Analytics', icon: BarChart3, href: '/dashboard/business/real-estate/marketing-analytics' },
            { name: 'ROI Tracking', icon: TrendingUp, href: '/dashboard/business/real-estate/roi-tracking' }
          ]
        },
        {
          title: 'Financial Management',
          items: [
            { name: 'Revenue Analytics', icon: BarChart3, href: '/dashboard/business/real-estate/analytics' },
            { name: 'Commission Reports', icon: DollarSign, href: '/dashboard/business/real-estate/commission-reports' },
            { name: 'Expense Tracking', icon: Receipt, href: '/dashboard/business/real-estate/expenses' },
            { name: 'Profit Margins', icon: TrendingUp, href: '/dashboard/business/real-estate/margins' },
            { name: 'Tax Management', icon: Calculator, href: '/dashboard/business/real-estate/tax' },
            { name: 'Financial Reports', icon: FileText, href: '/dashboard/business/real-estate/financial-reports' },
            { name: 'Budget Planning', icon: Target, href: '/dashboard/business/real-estate/budget' },
            { name: 'Cash Flow', icon: DollarSign, href: '/dashboard/business/real-estate/cash-flow' }
          ]
        },
        {
          title: 'Settings & Configuration',
          items: [
            { name: 'Real Estate Settings', icon: Settings, href: '/dashboard/business/real-estate/settings' },
            { name: 'Listing Settings', icon: Home, href: '/dashboard/business/real-estate/listing-settings' },
            { name: 'Agent Settings', icon: Users, href: '/dashboard/business/real-estate/agent-settings' },
            { name: 'Lead Settings', icon: Target, href: '/dashboard/business/real-estate/lead-settings' },
            { name: 'Commission Settings', icon: DollarSign, href: '/dashboard/business/real-estate/commission-settings' },
            { name: 'Marketing Settings', icon: Target, href: '/dashboard/business/real-estate/marketing-settings' },
            { name: 'Document Settings', icon: FileText, href: '/dashboard/business/real-estate/document-settings' },
            { name: 'Integrations', icon: Globe, href: '/dashboard/business/real-estate/integrations' }
          ]
        }
      ];
    } else if (currentBusiness.industry === 'technology') {
      return [
        {
          title: 'Project Management',
          items: [
            { name: 'Active Projects', icon: Code, href: '/dashboard/business/technology/projects' },
            { name: 'Project Planning', icon: Target, href: '/dashboard/business/technology/project-planning' },
            { name: 'Task Management', icon: Check, href: '/dashboard/business/technology/tasks' },
            { name: 'Time Tracking', icon: Clock, href: '/dashboard/business/technology/time-tracking' },
            { name: 'Resource Allocation', icon: Users, href: '/dashboard/business/technology/resources' },
            { name: 'Project Timeline', icon: Calendar, href: '/dashboard/business/technology/timeline' },
            { name: 'Project Reports', icon: BarChart3, href: '/dashboard/business/technology/project-reports' },
            { name: 'Project Templates', icon: FileText, href: '/dashboard/business/technology/templates' }
          ]
        },
        {
          title: 'Client Management',
          items: [
            { name: 'Client Database', icon: Users, href: '/dashboard/business/technology/clients' },
            { name: 'Client Profiles', icon: User, href: '/dashboard/business/technology/client-profiles' },
            { name: 'Client Communication', icon: MessageSquare, href: '/dashboard/business/technology/client-communication' },
            { name: 'Client Projects', icon: Code, href: '/dashboard/business/technology/client-projects' },
            { name: 'Client Billing', icon: DollarSign, href: '/dashboard/business/technology/client-billing' },
            { name: 'Client Support', icon: MessageSquare, href: '/dashboard/business/technology/client-support' },
            { name: 'Client Analytics', icon: BarChart3, href: '/dashboard/business/technology/client-analytics' },
            { name: 'Client Reviews', icon: Star, href: '/dashboard/business/technology/client-reviews' }
          ]
        },
        {
          title: 'Development & Engineering',
          items: [
            { name: 'Code Repository', icon: Code, href: '/dashboard/business/technology/code-repo' },
            { name: 'Version Control', icon: GitBranch, href: '/dashboard/business/technology/version-control' },
            { name: 'Code Reviews', icon: Eye, href: '/dashboard/business/technology/code-reviews' },
            { name: 'Testing & QA', icon: Check, href: '/dashboard/business/technology/testing' },
            { name: 'Deployment', icon: ArrowUpRight, href: '/dashboard/business/technology/deployment' },
            { name: 'API Management', icon: Globe, href: '/dashboard/business/technology/api-management' },
            { name: 'Database Management', icon: Database, href: '/dashboard/business/technology/database' },
            { name: 'Development Tools', icon: Wrench, href: '/dashboard/business/technology/dev-tools' }
          ]
        },
        {
          title: 'System Monitoring',
          items: [
            { name: 'System Health', icon: Monitor, href: '/dashboard/business/technology/monitoring' },
            { name: 'Performance Metrics', icon: Activity, href: '/dashboard/business/technology/performance' },
            { name: 'Error Tracking', icon: AlertTriangle, href: '/dashboard/business/technology/errors' },
            { name: 'Uptime Monitoring', icon: Clock, href: '/dashboard/business/technology/uptime' },
            { name: 'Security Monitoring', icon: Shield, href: '/dashboard/business/technology/security' },
            { name: 'Log Management', icon: FileText, href: '/dashboard/business/technology/logs' },
            { name: 'Alert Management', icon: Bell, href: '/dashboard/business/technology/alerts' },
            { name: 'System Analytics', icon: BarChart3, href: '/dashboard/business/technology/system-analytics' }
          ]
        },
        {
          title: 'Team Management',
          items: [
            { name: 'Team Directory', icon: Users, href: '/dashboard/business/technology/team' },
            { name: 'Developer Profiles', icon: User, href: '/dashboard/business/technology/developer-profiles' },
            { name: 'Skill Matrix', icon: Target, href: '/dashboard/business/technology/skills' },
            { name: 'Team Scheduling', icon: Calendar, href: '/dashboard/business/technology/team-scheduling' },
            { name: 'Performance Reviews', icon: Star, href: '/dashboard/business/technology/performance-reviews' },
            { name: 'Training & Development', icon: BookOpen, href: '/dashboard/business/technology/training' },
            { name: 'Team Analytics', icon: BarChart3, href: '/dashboard/business/technology/team-analytics' },
            { name: 'Collaboration Tools', icon: MessageSquare, href: '/dashboard/business/technology/collaboration' }
          ]
        },
        {
          title: 'Financial Management',
          items: [
            { name: 'Project Billing', icon: DollarSign, href: '/dashboard/business/technology/project-billing' },
            { name: 'Revenue Analytics', icon: BarChart3, href: '/dashboard/business/technology/analytics' },
            { name: 'Cost Tracking', icon: Calculator, href: '/dashboard/business/technology/cost-tracking' },
            { name: 'Profit Margins', icon: TrendingUp, href: '/dashboard/business/technology/margins' },
            { name: 'Expense Management', icon: Receipt, href: '/dashboard/business/technology/expenses' },
            { name: 'Budget Planning', icon: Target, href: '/dashboard/business/technology/budget' },
            { name: 'Financial Reports', icon: FileText, href: '/dashboard/business/technology/financial-reports' },
            { name: 'Cash Flow', icon: DollarSign, href: '/dashboard/business/technology/cash-flow' }
          ]
        },
        {
          title: 'Settings & Configuration',
          items: [
            { name: 'Technology Settings', icon: Settings, href: '/dashboard/business/technology/settings' },
            { name: 'Project Settings', icon: Code, href: '/dashboard/business/technology/project-settings' },
            { name: 'Client Settings', icon: Users, href: '/dashboard/business/technology/client-settings' },
            { name: 'System Settings', icon: Monitor, href: '/dashboard/business/technology/system-settings' },
            { name: 'Development Settings', icon: Code, href: '/dashboard/business/technology/dev-settings' },
            { name: 'Monitoring Settings', icon: Activity, href: '/dashboard/business/technology/monitoring-settings' },
            { name: 'Security Settings', icon: Shield, href: '/dashboard/business/technology/security-settings' },
            { name: 'Integrations', icon: Globe, href: '/dashboard/business/technology/integrations' }
          ]
        }
      ];
    } else if (currentBusiness.industry === 'beauty') {
      return [
        {
          title: 'Appointment Management',
          items: [
            { name: 'Appointment Calendar', icon: Calendar, href: '/dashboard/business/beauty/appointments' },
            { name: 'Booking System', icon: Calendar, href: '/dashboard/business/beauty/booking' },
            { name: 'Appointment Scheduling', icon: Clock, href: '/dashboard/business/beauty/scheduling' },
            { name: 'Reservations', icon: Calendar, href: '/dashboard/business/beauty/reservations' },
            { name: 'Appointment Reminders', icon: Bell, href: '/dashboard/business/beauty/reminders' },
            { name: 'Cancellation Management', icon: X, href: '/dashboard/business/beauty/cancellations' },
            { name: 'Appointment Reports', icon: BarChart3, href: '/dashboard/business/beauty/appointment-reports' },
            { name: 'Calendar Sync', icon: Calendar, href: '/dashboard/business/beauty/calendar-sync' }
          ]
        },
        {
          title: 'Client Management',
          items: [
            { name: 'Client Database', icon: Users, href: '/dashboard/business/beauty/clients' },
            { name: 'Client Profiles', icon: User, href: '/dashboard/business/beauty/client-profiles' },
            { name: 'Client History', icon: Clock, href: '/dashboard/business/beauty/client-history' },
            { name: 'Client Preferences', icon: Heart, href: '/dashboard/business/beauty/client-preferences' },
            { name: 'Client Communication', icon: MessageSquare, href: '/dashboard/business/beauty/client-communication' },
            { name: 'Client Reviews', icon: Star, href: '/dashboard/business/beauty/client-reviews' },
            { name: 'Client Loyalty', icon: Crown, href: '/dashboard/business/beauty/client-loyalty' },
            { name: 'Client Analytics', icon: BarChart3, href: '/dashboard/business/beauty/client-analytics' }
          ]
        },
        {
          title: 'Service Management',
          items: [
            { name: 'Service Catalog', icon: Scissors, href: '/dashboard/business/beauty/services' },
            { name: 'Service Categories', icon: Tag, href: '/dashboard/business/beauty/service-categories' },
            { name: 'Service Pricing', icon: DollarSign, href: '/dashboard/business/beauty/service-pricing' },
            { name: 'Service Packages', icon: Package, href: '/dashboard/business/beauty/service-packages' },
            { name: 'Service Duration', icon: Clock, href: '/dashboard/business/beauty/service-duration' },
            { name: 'Service Requirements', icon: FileText, href: '/dashboard/business/beauty/service-requirements' },
            { name: 'Service Analytics', icon: BarChart3, href: '/dashboard/business/beauty/service-analytics' },
            { name: 'Service Templates', icon: FileText, href: '/dashboard/business/beauty/service-templates' }
          ]
        },
        {
          title: 'Staff Management',
          items: [
            { name: 'Staff Directory', icon: Users, href: '/dashboard/business/beauty/staff' },
            { name: 'Staff Profiles', icon: User, href: '/dashboard/business/beauty/staff-profiles' },
            { name: 'Staff Scheduling', icon: Calendar, href: '/dashboard/business/beauty/staff-scheduling' },
            { name: 'Staff Performance', icon: Activity, href: '/dashboard/business/beauty/staff-performance' },
            { name: 'Staff Training', icon: BookOpen, href: '/dashboard/business/beauty/staff-training' },
            { name: 'Staff Reviews', icon: Star, href: '/dashboard/business/beauty/staff-reviews' },
            { name: 'Commission Tracking', icon: DollarSign, href: '/dashboard/business/beauty/commissions' },
            { name: 'Staff Analytics', icon: BarChart3, href: '/dashboard/business/beauty/staff-analytics' }
          ]
        },
        {
          title: 'Inventory & Products',
          items: [
            { name: 'Product Inventory', icon: Package, href: '/dashboard/business/beauty/inventory' },
            { name: 'Product Catalog', icon: Package, href: '/dashboard/business/beauty/products' },
            { name: 'Stock Management', icon: Package, href: '/dashboard/business/beauty/stock' },
            { name: 'Product Suppliers', icon: Building2, href: '/dashboard/business/beauty/suppliers' },
            { name: 'Purchase Orders', icon: Receipt, href: '/dashboard/business/beauty/purchase-orders' },
            { name: 'Product Usage', icon: Activity, href: '/dashboard/business/beauty/product-usage' },
            { name: 'Inventory Reports', icon: BarChart3, href: '/dashboard/business/beauty/inventory-reports' },
            { name: 'Product Analytics', icon: BarChart3, href: '/dashboard/business/beauty/product-analytics' }
          ]
        },
        {
          title: 'Marketing & Promotions',
          items: [
            { name: 'Marketing Campaigns', icon: Target, href: '/dashboard/business/beauty/marketing' },
            { name: 'Email Marketing', icon: Mail, href: '/dashboard/business/beauty/email-marketing' },
            { name: 'SMS Marketing', icon: Phone, href: '/dashboard/business/beauty/sms-marketing' },
            { name: 'Social Media', icon: Globe, href: '/dashboard/business/beauty/social-media' },
            { name: 'Promotional Offers', icon: Sparkles, href: '/dashboard/business/beauty/promotions' },
            { name: 'Referral Program', icon: Users, href: '/dashboard/business/beauty/referrals' },
            { name: 'Loyalty Programs', icon: Crown, href: '/dashboard/business/beauty/loyalty' },
            { name: 'Marketing Analytics', icon: BarChart3, href: '/dashboard/business/beauty/marketing-analytics' }
          ]
        },
        {
          title: 'Financial Management',
          items: [
            { name: 'Revenue Analytics', icon: BarChart3, href: '/dashboard/business/beauty/analytics' },
            { name: 'Sales Reports', icon: DollarSign, href: '/dashboard/business/beauty/sales-reports' },
            { name: 'Service Revenue', icon: DollarSign, href: '/dashboard/business/beauty/service-revenue' },
            { name: 'Product Sales', icon: Package, href: '/dashboard/business/beauty/product-sales' },
            { name: 'Expense Tracking', icon: Receipt, href: '/dashboard/business/beauty/expenses' },
            { name: 'Profit Margins', icon: TrendingUp, href: '/dashboard/business/beauty/margins' },
            { name: 'Financial Reports', icon: FileText, href: '/dashboard/business/beauty/financial-reports' },
            { name: 'Cash Flow', icon: DollarSign, href: '/dashboard/business/beauty/cash-flow' }
          ]
        },
        {
          title: 'Settings & Configuration',
          items: [
            { name: 'Beauty Settings', icon: Settings, href: '/dashboard/business/beauty/settings' },
            { name: 'Appointment Settings', icon: Calendar, href: '/dashboard/business/beauty/appointment-settings' },
            { name: 'Service Settings', icon: Scissors, href: '/dashboard/business/beauty/service-settings' },
            { name: 'Client Settings', icon: Users, href: '/dashboard/business/beauty/client-settings' },
            { name: 'Staff Settings', icon: Users, href: '/dashboard/business/beauty/staff-settings' },
            { name: 'Inventory Settings', icon: Package, href: '/dashboard/business/beauty/inventory-settings' },
            { name: 'Marketing Settings', icon: Target, href: '/dashboard/business/beauty/marketing-settings' },
            { name: 'Integrations', icon: Globe, href: '/dashboard/business/beauty/integrations' }
          ]
        }
      ];
    } else if (currentBusiness.industry === 'healthcare') {
      return [
        {
          title: 'Patient Management',
          items: [
            { name: 'Patient Database', icon: Users, href: '/dashboard/business/healthcare/patients' },
            { name: 'Patient Profiles', icon: User, href: '/dashboard/business/healthcare/patient-profiles' },
            { name: 'Patient History', icon: Clock, href: '/dashboard/business/healthcare/patient-history' },
            { name: 'Patient Records', icon: FileText, href: '/dashboard/business/healthcare/records' },
            { name: 'Patient Communication', icon: MessageSquare, href: '/dashboard/business/healthcare/patient-communication' },
            { name: 'Patient Portal', icon: Globe, href: '/dashboard/business/healthcare/patient-portal' },
            { name: 'Patient Analytics', icon: BarChart3, href: '/dashboard/business/healthcare/patient-analytics' },
            { name: 'Patient Reviews', icon: Star, href: '/dashboard/business/healthcare/patient-reviews' }
          ]
        },
        {
          title: 'Appointment Management',
          items: [
            { name: 'Appointment Calendar', icon: Calendar, href: '/dashboard/business/healthcare/appointments' },
            { name: 'Appointment Scheduling', icon: Clock, href: '/dashboard/business/healthcare/scheduling' },
            { name: 'Appointment Reminders', icon: Bell, href: '/dashboard/business/healthcare/reminders' },
            { name: 'Cancellation Management', icon: X, href: '/dashboard/business/healthcare/cancellations' },
            { name: 'Waitlist Management', icon: Clock, href: '/dashboard/business/healthcare/waitlist' },
            { name: 'Appointment Reports', icon: BarChart3, href: '/dashboard/business/healthcare/appointment-reports' },
            { name: 'Calendar Sync', icon: Calendar, href: '/dashboard/business/healthcare/calendar-sync' },
            { name: 'Telemedicine', icon: Phone, href: '/dashboard/business/healthcare/telemedicine' }
          ]
        },
        {
          title: 'Medical Records',
          items: [
            { name: 'Electronic Health Records', icon: FileText, href: '/dashboard/business/healthcare/records' },
            { name: 'Medical History', icon: Clock, href: '/dashboard/business/healthcare/medical-history' },
            { name: 'Treatment Plans', icon: FileText, href: '/dashboard/business/healthcare/treatment-plans' },
            { name: 'Prescriptions', icon: Pill, href: '/dashboard/business/healthcare/prescriptions' },
            { name: 'Lab Results', icon: Activity, href: '/dashboard/business/healthcare/lab-results' },
            { name: 'Imaging Records', icon: Camera, href: '/dashboard/business/healthcare/imaging' },
            { name: 'Document Management', icon: FileText, href: '/dashboard/business/healthcare/documents' },
            { name: 'Records Analytics', icon: BarChart3, href: '/dashboard/business/healthcare/records-analytics' }
          ]
        },
        {
          title: 'Staff Management',
          items: [
            { name: 'Staff Directory', icon: Users, href: '/dashboard/business/healthcare/staff' },
            { name: 'Staff Profiles', icon: User, href: '/dashboard/business/healthcare/staff-profiles' },
            { name: 'Staff Scheduling', icon: Calendar, href: '/dashboard/business/healthcare/staff-scheduling' },
            { name: 'Staff Performance', icon: Activity, href: '/dashboard/business/healthcare/staff-performance' },
            { name: 'Staff Training', icon: BookOpen, href: '/dashboard/business/healthcare/staff-training' },
            { name: 'Staff Reviews', icon: Star, href: '/dashboard/business/healthcare/staff-reviews' },
            { name: 'Credentialing', icon: Shield, href: '/dashboard/business/healthcare/credentialing' },
            { name: 'Staff Analytics', icon: BarChart3, href: '/dashboard/business/healthcare/staff-analytics' }
          ]
        },
        {
          title: 'Clinical Operations',
          items: [
            { name: 'Clinical Protocols', icon: FileText, href: '/dashboard/business/healthcare/protocols' },
            { name: 'Quality Assurance', icon: Shield, href: '/dashboard/business/healthcare/quality-assurance' },
            { name: 'Compliance Management', icon: Shield, href: '/dashboard/business/healthcare/compliance' },
            { name: 'Risk Management', icon: AlertTriangle, href: '/dashboard/business/healthcare/risk-management' },
            { name: 'Clinical Analytics', icon: BarChart3, href: '/dashboard/business/healthcare/clinical-analytics' },
            { name: 'Outcome Tracking', icon: Target, href: '/dashboard/business/healthcare/outcomes' },
            { name: 'Clinical Reports', icon: FileText, href: '/dashboard/business/healthcare/clinical-reports' },
            { name: 'Performance Metrics', icon: Activity, href: '/dashboard/business/healthcare/performance-metrics' }
          ]
        },
        {
          title: 'Inventory & Supplies',
          items: [
            { name: 'Medical Inventory', icon: Package, href: '/dashboard/business/healthcare/inventory' },
            { name: 'Medical Supplies', icon: Package, href: '/dashboard/business/healthcare/supplies' },
            { name: 'Equipment Management', icon: Wrench, href: '/dashboard/business/healthcare/equipment' },
            { name: 'Vendor Management', icon: Building2, href: '/dashboard/business/healthcare/vendors' },
            { name: 'Purchase Orders', icon: Receipt, href: '/dashboard/business/healthcare/purchase-orders' },
            { name: 'Stock Alerts', icon: Bell, href: '/dashboard/business/healthcare/stock-alerts' },
            { name: 'Inventory Reports', icon: BarChart3, href: '/dashboard/business/healthcare/inventory-reports' },
            { name: 'Supply Analytics', icon: BarChart3, href: '/dashboard/business/healthcare/supply-analytics' }
          ]
        },
        {
          title: 'Financial Management',
          items: [
            { name: 'Revenue Analytics', icon: BarChart3, href: '/dashboard/business/healthcare/analytics' },
            { name: 'Billing Management', icon: DollarSign, href: '/dashboard/business/healthcare/billing' },
            { name: 'Insurance Claims', icon: FileText, href: '/dashboard/business/healthcare/insurance' },
            { name: 'Payment Processing', icon: CreditCard, href: '/dashboard/business/healthcare/payments' },
            { name: 'Expense Tracking', icon: Receipt, href: '/dashboard/business/healthcare/expenses' },
            { name: 'Financial Reports', icon: FileText, href: '/dashboard/business/healthcare/financial-reports' },
            { name: 'Budget Planning', icon: Target, href: '/dashboard/business/healthcare/budget' },
            { name: 'Cash Flow', icon: DollarSign, href: '/dashboard/business/healthcare/cash-flow' }
          ]
        },
        {
          title: 'Settings & Configuration',
          items: [
            { name: 'Healthcare Settings', icon: Settings, href: '/dashboard/business/healthcare/settings' },
            { name: 'Patient Settings', icon: Users, href: '/dashboard/business/healthcare/patient-settings' },
            { name: 'Appointment Settings', icon: Calendar, href: '/dashboard/business/healthcare/appointment-settings' },
            { name: 'Medical Settings', icon: FileText, href: '/dashboard/business/healthcare/medical-settings' },
            { name: 'Staff Settings', icon: Users, href: '/dashboard/business/healthcare/staff-settings' },
            { name: 'Clinical Settings', icon: Shield, href: '/dashboard/business/healthcare/clinical-settings' },
            { name: 'Compliance Settings', icon: Shield, href: '/dashboard/business/healthcare/compliance-settings' },
            { name: 'Integrations', icon: Globe, href: '/dashboard/business/healthcare/integrations' }
          ]
        }
      ];
    } else if (currentBusiness.industry === 'automotive') {
      return [
        {
          title: 'Service Management',
          items: [
            { name: 'Service Orders', icon: Wrench, href: '/dashboard/business/automotive/service' },
            { name: 'Service Scheduling', icon: Calendar, href: '/dashboard/business/automotive/scheduling' },
            { name: 'Work Orders', icon: FileText, href: '/dashboard/business/automotive/work-orders' },
            { name: 'Service History', icon: Clock, href: '/dashboard/business/automotive/service-history' },
            { name: 'Service Templates', icon: FileText, href: '/dashboard/business/automotive/service-templates' },
            { name: 'Service Reports', icon: BarChart3, href: '/dashboard/business/automotive/service-reports' },
            { name: 'Warranty Claims', icon: Shield, href: '/dashboard/business/automotive/warranty' },
            { name: 'Service Analytics', icon: Activity, href: '/dashboard/business/automotive/service-analytics' }
          ]
        },
        {
          title: 'Parts & Inventory',
          items: [
            { name: 'Parts Inventory', icon: Package, href: '/dashboard/business/automotive/parts' },
            { name: 'Parts Catalog', icon: Package, href: '/dashboard/business/automotive/parts-catalog' },
            { name: 'Stock Management', icon: Package, href: '/dashboard/business/automotive/stock' },
            { name: 'Parts Suppliers', icon: Building2, href: '/dashboard/business/automotive/suppliers' },
            { name: 'Purchase Orders', icon: Receipt, href: '/dashboard/business/automotive/purchase-orders' },
            { name: 'Parts Usage', icon: Activity, href: '/dashboard/business/automotive/parts-usage' },
            { name: 'Inventory Reports', icon: BarChart3, href: '/dashboard/business/automotive/inventory-reports' },
            { name: 'Parts Analytics', icon: BarChart3, href: '/dashboard/business/automotive/parts-analytics' }
          ]
        },
        {
          title: 'Customer Management',
          items: [
            { name: 'Customer Database', icon: Users, href: '/dashboard/business/automotive/customers' },
            { name: 'Customer Profiles', icon: User, href: '/dashboard/business/automotive/customer-profiles' },
            { name: 'Vehicle Information', icon: Car, href: '/dashboard/business/automotive/vehicles' },
            { name: 'Service History', icon: Clock, href: '/dashboard/business/automotive/customer-service-history' },
            { name: 'Customer Communication', icon: MessageSquare, href: '/dashboard/business/automotive/customer-communication' },
            { name: 'Customer Reviews', icon: Star, href: '/dashboard/business/automotive/customer-reviews' },
            { name: 'Customer Analytics', icon: BarChart3, href: '/dashboard/business/automotive/customer-analytics' },
            { name: 'Customer Portal', icon: Globe, href: '/dashboard/business/automotive/customer-portal' }
          ]
        },
        {
          title: 'Staff Management',
          items: [
            { name: 'Staff Directory', icon: Users, href: '/dashboard/business/automotive/staff' },
            { name: 'Technician Profiles', icon: User, href: '/dashboard/business/automotive/technicians' },
            { name: 'Staff Scheduling', icon: Calendar, href: '/dashboard/business/automotive/staff-scheduling' },
            { name: 'Performance Tracking', icon: Activity, href: '/dashboard/business/automotive/staff-performance' },
            { name: 'Staff Training', icon: BookOpen, href: '/dashboard/business/automotive/staff-training' },
            { name: 'Staff Reviews', icon: Star, href: '/dashboard/business/automotive/staff-reviews' },
            { name: 'Commission Tracking', icon: DollarSign, href: '/dashboard/business/automotive/commissions' },
            { name: 'Staff Analytics', icon: BarChart3, href: '/dashboard/business/automotive/staff-analytics' }
          ]
        },
        {
          title: 'Vehicle Management',
          items: [
            { name: 'Vehicle Database', icon: Car, href: '/dashboard/business/automotive/vehicles' },
            { name: 'Vehicle Information', icon: FileText, href: '/dashboard/business/automotive/vehicle-info' },
            { name: 'Service Records', icon: Clock, href: '/dashboard/business/automotive/vehicle-service-records' },
            { name: 'Maintenance Schedules', icon: Calendar, href: '/dashboard/business/automotive/maintenance' },
            { name: 'Warranty Information', icon: Shield, href: '/dashboard/business/automotive/warranty-info' },
            { name: 'Vehicle Analytics', icon: BarChart3, href: '/dashboard/business/automotive/vehicle-analytics' },
            { name: 'Vehicle Reports', icon: FileText, href: '/dashboard/business/automotive/vehicle-reports' },
            { name: 'Vehicle Tracking', icon: MapPin, href: '/dashboard/business/automotive/vehicle-tracking' }
          ]
        },
        {
          title: 'Financial Management',
          items: [
            { name: 'Revenue Analytics', icon: BarChart3, href: '/dashboard/business/automotive/analytics' },
            { name: 'Service Revenue', icon: DollarSign, href: '/dashboard/business/automotive/service-revenue' },
            { name: 'Parts Sales', icon: Package, href: '/dashboard/business/automotive/parts-sales' },
            { name: 'Expense Tracking', icon: Receipt, href: '/dashboard/business/automotive/expenses' },
            { name: 'Profit Margins', icon: TrendingUp, href: '/dashboard/business/automotive/margins' },
            { name: 'Financial Reports', icon: FileText, href: '/dashboard/business/automotive/financial-reports' },
            { name: 'Budget Planning', icon: Target, href: '/dashboard/business/automotive/budget' },
            { name: 'Cash Flow', icon: DollarSign, href: '/dashboard/business/automotive/cash-flow' }
          ]
        },
        {
          title: 'Marketing & Communication',
          items: [
            { name: 'Marketing Campaigns', icon: Target, href: '/dashboard/business/automotive/marketing' },
            { name: 'Email Marketing', icon: Mail, href: '/dashboard/business/automotive/email-marketing' },
            { name: 'SMS Marketing', icon: Phone, href: '/dashboard/business/automotive/sms-marketing' },
            { name: 'Social Media', icon: Globe, href: '/dashboard/business/automotive/social-media' },
            { name: 'Customer Communication', icon: MessageSquare, href: '/dashboard/business/automotive/communication' },
            { name: 'Service Reminders', icon: Bell, href: '/dashboard/business/automotive/reminders' },
            { name: 'Marketing Analytics', icon: BarChart3, href: '/dashboard/business/automotive/marketing-analytics' },
            { name: 'ROI Tracking', icon: TrendingUp, href: '/dashboard/business/automotive/roi-tracking' }
          ]
        },
        {
          title: 'Settings & Configuration',
          items: [
            { name: 'Automotive Settings', icon: Settings, href: '/dashboard/business/automotive/settings' },
            { name: 'Service Settings', icon: Wrench, href: '/dashboard/business/automotive/service-settings' },
            { name: 'Parts Settings', icon: Package, href: '/dashboard/business/automotive/parts-settings' },
            { name: 'Customer Settings', icon: Users, href: '/dashboard/business/automotive/customer-settings' },
            { name: 'Staff Settings', icon: Users, href: '/dashboard/business/automotive/staff-settings' },
            { name: 'Vehicle Settings', icon: Car, href: '/dashboard/business/automotive/vehicle-settings' },
            { name: 'Financial Settings', icon: DollarSign, href: '/dashboard/business/automotive/financial-settings' },
            { name: 'Integrations', icon: Globe, href: '/dashboard/business/automotive/integrations' }
          ]
        }
      ];
    } else {
      return [
        {
          title: 'Core',
          items: [
            { name: 'Dashboard', icon: BarChart3, href: '/dashboard/business/profile' },
            { name: 'Customers', icon: Users, href: '/dashboard/business/customers' },
            { name: 'Schedule', icon: Calendar, href: '/dashboard/business/schedule' },
            { name: 'Reports', icon: TrendingUp, href: '/dashboard/business/reports' }
          ]
        }
      ];
    }
  };

  const quickActions = getQuickActions();
  const mainSections = getMainSections();
  const priorityActions = quickActions.filter(action => action.priority);
  const allActions = quickActions;

  // Safety check: ensure current business exists in businesses array
  const businessExists = businesses.some(business => business.id === currentBusiness.id);
  if (!businessExists && businesses.length > 0) {
    // Current business not found in list, could be a data sync issue
    console.warn('Current business not found in businesses list');
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 text-white hover:text-primary hover:bg-neutral-800/50 transition-colors">
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentBusiness.logo || "/placeholder-logo.png"} alt={currentBusiness.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
              {currentBusiness.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline font-medium">{currentBusiness.name}</span>
          <ChevronDown className="w-4 h-4 transition-transform" data-state={isOpen ? 'open' : 'closed'} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className={`${
          isMobile ? 'w-screen h-screen max-h-screen inset-0 fixed rounded-none border-none' : 'w-80 max-h-[85vh] rounded-lg'
        } bg-background border border-border overflow-y-auto shadow-lg`}
        align={isMobile ? "center" : "start"}
        sideOffset={isMobile ? 0 : 4}
        style={isMobile ? { 
          width: '100vw', 
          height: '100vh', 
          maxWidth: '100vw', 
          left: 0, 
          top: 0,
          borderRadius: 0,
          border: 'none'
        } : {}}
      >
        {/* Mobile Header - Enhanced Polaris Style */}
        {isMobile && (
          <div className="sticky top-0 z-20 bg-background border-b border-border shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Business Center</h2>
                  <p className="text-muted-foreground text-sm">Manage your operations</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                  className="h-8 w-8 p-0"
                  title="Keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Current Business - Compact & Minimalistic */}
        <div className="p-4 border-b border-border">
          {switchingBusiness && (
            <div className="mb-3 px-3 py-2 bg-primary/10 rounded-md text-xs text-primary text-center animate-pulse">
              ✓ Switched to {getIndustryLabel(currentBusiness.industry)} • Redirecting...
            </div>
          )}
          
          {/* Business Info & Settings Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentBusiness.logo || "/placeholder-logo.png"} alt={currentBusiness.name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs">
                  {currentBusiness.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {currentBusiness.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {getIndustryLabel(currentBusiness.industry)}
                  </span>
                  {currentBusiness.plan && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {currentBusiness.plan}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Settings Button - Separate from dropdown */}
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="h-8 w-8 p-0 hover:bg-muted/50"
            >
              <Link href={`/dashboard/business/${getIndustryRoute(currentBusiness.industry)}/settings`} title="Settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {/* Business Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-between text-xs"
              >
                <span>Switch Business</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className={`${
                isMobile ? 'w-full max-w-none' : 'w-56'
              } p-2 bg-background border border-border rounded-lg shadow-lg`}
              align={isMobile ? "center" : "start"}
              side={isMobile ? "bottom" : "right"}
              sideOffset={isMobile ? 8 : 4}
            >
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
                Available Businesses
              </DropdownMenuLabel>
              
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {businesses.length > 0 ? businesses.map((business: Business) => {
                  const isCurrentBusiness = business.id === currentBusiness.id;
                  
                  return (
                    <DropdownMenuItem
                      key={business.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        isCurrentBusiness 
                          ? 'bg-muted' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        if (!isCurrentBusiness) {
                          handleBusinessSwitch(business.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <div className={`h-5 w-5 rounded flex items-center justify-center text-xs font-medium ${
                          isCurrentBusiness 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {business.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <p className="text-xs font-medium text-foreground truncate">
                              {business.name}
                            </p>
                            {isCurrentBusiness && <Check className="h-3 w-3 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {getIndustryLabel(business.industry)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                }) : (
                  <div className="p-2 text-center text-muted-foreground text-xs">
                    No businesses found
                  </div>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link 
                    href="/dashboard/business/new"
                    className="flex items-center space-x-2 w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Plus className="h-3 w-3" />
                    <span className="text-xs">Add business</span>
                  </Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Sections - Polaris Style */}
        <div className={`p-4 space-y-4 transition-opacity ${switchingBusiness ? 'opacity-60' : ''}`}>
          {mainSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">
                  {section.title}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {section.items.length}
                </span>
              </div>
              
              <div className="space-y-1">
                {section.items.slice(0, isMobile ? 6 : 8).map((item) => (
                  <DropdownMenuItem key={item.name} asChild className="p-0">
                    <Link 
                      href={item.href} 
                      className="flex items-center space-x-2 p-2 rounded hover:bg-muted transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground truncate">
                        {item.name}
                      </span>
                      {isMobile && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
                
                {section.items.length > (isMobile ? 6 : 8) && (
                  <button className="w-full p-2 text-left text-sm text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
                    View {section.items.length - (isMobile ? 6 : 8)} more...
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Keyboard Help - Polaris Style */}
        {showKeyboardHelp && (
          <div className="border-t border-border bg-muted/30">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-foreground">Keyboard shortcuts</h5>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardHelp(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quick actions</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4].map(num => (
                      <kbd key={num} className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-foreground">
                        {num}
                      </kbd>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Close</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-foreground">
                    Esc
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Help</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-foreground">
                    ?
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Settings</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-foreground">
                    ⌘H
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile More Menu - Consolidated Icons */}
        {isMobile && (
          <div className="border-t border-border bg-muted/20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-foreground">Quick Access</h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
                  className="h-6 w-6 p-0"
                >
                  {showMobileMoreMenu ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                </Button>
              </div>
              
              {showMobileMoreMenu && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex flex-col items-center p-2 h-auto">
                    <Search className="h-4 w-4 mb-1" />
                    <span className="text-xs">Search</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex flex-col items-center p-2 h-auto">
                    <Bell className="h-4 w-4 mb-1" />
                    <span className="text-xs">Notifications</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex flex-col items-center p-2 h-auto">
                    <MessageSquare className="h-4 w-4 mb-1" />
                    <span className="text-xs">Messages</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex flex-col items-center p-2 h-auto">
                    <Calendar className="h-4 w-4 mb-1" />
                    <span className="text-xs">Calendar</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex flex-col items-center p-2 h-auto">
                    <Users className="h-4 w-4 mb-1" />
                    <span className="text-xs">Team</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex flex-col items-center p-2 h-auto">
                    <BarChart3 className="h-4 w-4 mb-1" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer - Polaris Style */}
        <div className="border-t border-border bg-muted/20">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">
                  {mainSections.reduce((total, section) => total + section.items.length, 0)} features available
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                className="h-6 w-6 p-0"
                title="Keyboard shortcuts"
              >
                <Keyboard className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
