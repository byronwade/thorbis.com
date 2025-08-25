"use client";

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useBusinessStore } from '@store/business';
import { dashboardBusinesses } from '@data/dashboard-businesses';
import { getValidRoutesForIndustry } from '@lib/routing/intelligent-business-router';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3, 
  ShoppingCart, 
  Utensils, 
  Car, 
  Scissors, 
  Building2,
  BookOpen,
  Code,
  Factory,
  Briefcase,
  Wrench,
  ClipboardList,
  CreditCard,
  Truck,
  ChefHat,
  Store,
  Stethoscope,
  Gavel,
  GraduationCap,
  Monitor,
  Package,
  MessageSquare
} from 'lucide-react';

/**
 * Smart Business Navigation Component
 * Dynamically shows navigation items based on the current business industry
 */
export default function SmartBusinessNavigation() {
  const pathname = usePathname();
  const { activeBusinessId } = useBusinessStore();
  
  const currentBusiness = useMemo(() => {
    return dashboardBusinesses.find(b => b.id === activeBusinessId) || null;
  }, [activeBusinessId]);

  const navigationItems = useMemo(() => {
    if (!currentBusiness) {
      return getDefaultNavigation();
    }

    switch (currentBusiness.industry) {
      case 'restaurant':
        return getRestaurantNavigation();
      case 'field_service':
        return getFieldServiceNavigation();
      case 'retail':
        return getRetailNavigation();
      case 'healthcare':
        return getHealthcareNavigation();
      case 'automotive':
        return getAutomotiveNavigation();
      case 'beauty':
        return getBeautyNavigation();
      case 'legal':
        return getLegalNavigation();
      case 'real_estate':
        return getRealEstateNavigation();
      case 'education':
        return getEducationNavigation();
      case 'technology':
        return getTechnologyNavigation();
      case 'manufacturing':
        return getManufacturingNavigation();
      case 'consulting':
        return getConsultingNavigation();
      default:
        return getDefaultNavigation();
    }
  }, [currentBusiness]);

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive(item.href)
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

// Industry-specific navigation configurations
function getRestaurantNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/restaurants', icon: Home },
    { label: 'POS System', href: '/dashboard/business/restaurants/pos', icon: CreditCard },
    { label: 'Menu Management', href: '/dashboard/business/restaurants/menu', icon: Utensils },
    { label: 'Kitchen Display', href: '/dashboard/business/restaurants/kitchen', icon: ChefHat },
    { label: 'Delivery', href: '/dashboard/business/restaurants/delivery', icon: Truck },
    { label: 'Customers', href: '/dashboard/business/restaurants/customers', icon: Users },
    { label: 'Inventory', href: '/dashboard/business/restaurants/inventory', icon: Package },
    { label: 'Staff', href: '/dashboard/business/restaurants/staff', icon: Users },
    { label: 'Analytics', href: '/dashboard/business/restaurants/analytics', icon: BarChart3 },
    { label: 'Reservations', href: '/dashboard/business/restaurants/reservations', icon: Calendar },
    { label: 'Settings', href: '/dashboard/business/restaurants/settings', icon: Settings },
  ];
}

function getFieldServiceNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/field-management', icon: Home },
    { label: 'Jobs', href: '/dashboard/business/field-management/jobs', icon: ClipboardList },
    { label: 'Schedule', href: '/dashboard/business/field-management/schedule', icon: Calendar },
    { label: 'Technicians', href: '/dashboard/business/field-management/technicians', icon: Users },
    { label: 'Customers', href: '/dashboard/business/field-management/customers', icon: Users },
    { label: 'Equipment', href: '/dashboard/business/field-management/equipment', icon: Wrench },
    { label: 'Analytics', href: '/dashboard/business/field-management/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/field-management/settings', icon: Settings },
  ];
}

function getRetailNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/retail', icon: Home },
    { label: 'POS System', href: '/dashboard/business/retail/pos', icon: CreditCard },
    { label: 'Inventory', href: '/dashboard/business/retail/inventory', icon: Package },
    { label: 'Customers', href: '/dashboard/business/retail/customers', icon: Users },
    { label: 'Sales', href: '/dashboard/business/retail/sales', icon: ShoppingCart },
    { label: 'Analytics', href: '/dashboard/business/retail/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/retail/settings', icon: Settings },
  ];
}

function getHealthcareNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/healthcare', icon: Home },
    { label: 'Appointments', href: '/dashboard/business/healthcare/appointments', icon: Calendar },
    { label: 'Patients', href: '/dashboard/business/healthcare/patients', icon: Users },
    { label: 'Medical Records', href: '/dashboard/business/healthcare/records', icon: ClipboardList },
    { label: 'Staff', href: '/dashboard/business/healthcare/staff', icon: Users },
    { label: 'Analytics', href: '/dashboard/business/healthcare/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/healthcare/settings', icon: Settings },
  ];
}

function getAutomotiveNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/automotive', icon: Home },
    { label: 'Service Orders', href: '/dashboard/business/automotive/service', icon: Wrench },
    { label: 'Parts Inventory', href: '/dashboard/business/automotive/parts', icon: Package },
    { label: 'Customers', href: '/dashboard/business/automotive/customers', icon: Users },
    { label: 'Technicians', href: '/dashboard/business/automotive/technicians', icon: Users },
    { label: 'Analytics', href: '/dashboard/business/automotive/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/automotive/settings', icon: Settings },
  ];
}

function getBeautyNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/beauty', icon: Home },
    { label: 'Appointments', href: '/dashboard/business/beauty/appointments', icon: Calendar },
    { label: 'Clients', href: '/dashboard/business/beauty/clients', icon: Users },
    { label: 'Services', href: '/dashboard/business/beauty/services', icon: Scissors },
    { label: 'Staff', href: '/dashboard/business/beauty/staff', icon: Users },
    { label: 'Analytics', href: '/dashboard/business/beauty/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/beauty/settings', icon: Settings },
  ];
}

function getLegalNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/legal', icon: Home },
    { label: 'Cases', href: '/dashboard/business/legal/cases', icon: Gavel },
    { label: 'Clients', href: '/dashboard/business/legal/clients', icon: Users },
    { label: 'Documents', href: '/dashboard/business/legal/documents', icon: ClipboardList },
    { label: 'Calendar', href: '/dashboard/business/legal/calendar', icon: Calendar },
    { label: 'Analytics', href: '/dashboard/business/legal/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/legal/settings', icon: Settings },
  ];
}

function getRealEstateNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/real-estate', icon: Home },
    { label: 'Listings', href: '/dashboard/business/real-estate/listings', icon: Building2 },
    { label: 'Clients', href: '/dashboard/business/real-estate/clients', icon: Users },
    { label: 'Appointments', href: '/dashboard/business/real-estate/appointments', icon: Calendar },
    { label: 'Analytics', href: '/dashboard/business/real-estate/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/real-estate/settings', icon: Settings },
  ];
}

function getEducationNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/education', icon: Home },
    { label: 'Courses', href: '/dashboard/business/education/courses', icon: BookOpen },
    { label: 'Students', href: '/dashboard/business/education/students', icon: Users },
    { label: 'Schedule', href: '/dashboard/business/education/schedule', icon: Calendar },
    { label: 'Analytics', href: '/dashboard/business/education/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/education/settings', icon: Settings },
  ];
}

function getTechnologyNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/technology', icon: Home },
    { label: 'Projects', href: '/dashboard/business/technology/projects', icon: Code },
    { label: 'Clients', href: '/dashboard/business/technology/clients', icon: Users },
    { label: 'Team', href: '/dashboard/business/technology/team', icon: Users },
    { label: 'Analytics', href: '/dashboard/business/technology/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/technology/settings', icon: Settings },
  ];
}

function getManufacturingNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/manufacturing', icon: Home },
    { label: 'Production', href: '/dashboard/business/manufacturing/production', icon: Factory },
    { label: 'Inventory', href: '/dashboard/business/manufacturing/inventory', icon: Package },
    { label: 'Quality Control', href: '/dashboard/business/manufacturing/quality', icon: ClipboardList },
    { label: 'Analytics', href: '/dashboard/business/manufacturing/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/manufacturing/settings', icon: Settings },
  ];
}

function getConsultingNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/consulting', icon: Home },
    { label: 'Projects', href: '/dashboard/business/consulting/projects', icon: Briefcase },
    { label: 'Clients', href: '/dashboard/business/consulting/clients', icon: Users },
    { label: 'Calendar', href: '/dashboard/business/consulting/calendar', icon: Calendar },
    { label: 'Analytics', href: '/dashboard/business/consulting/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/business/consulting/settings', icon: Settings },
  ];
}

function getDefaultNavigation() {
  return [
    { label: 'Dashboard', href: '/dashboard/business/profile', icon: Home },
    { label: 'Settings', href: '/dashboard/business/settings', icon: Settings },
  ];
}
