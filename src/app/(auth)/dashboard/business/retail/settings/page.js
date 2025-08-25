"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { 
  Settings, 
  Store, 
  CreditCard, 
  Users, 
  Package, 
  BarChart3,
  Bell,
  Shield,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Receipt,
  Truck,
  Tag,
  QrCode,
  Printer,
  Camera,
  FileText,
  Download,
  Upload,
  Save,
  Check,
  X
} from 'lucide-react';

export default function RetailSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const settingsTabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'pos', name: 'POS System', icon: CreditCard },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'payments', name: 'Payments', icon: DollarSign },
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Globe },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'backup', name: 'Backup & Export', icon: Database }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="w-5 h-5 mr-2" />
            Store Information
          </CardTitle>
          <CardDescription>
            Basic store details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Store Name</label>
              <Input defaultValue="Urban Retail Hub" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Store ID</label>
              <Input defaultValue="URH-001" className="mt-1" disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input defaultValue="(555) 123-4567" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue="contact@urbanretail.com" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input defaultValue="123 Main Street, Downtown, CA 90210" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Business Hours
          </CardTitle>
          <CardDescription>
            Set your store operating hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24">
                  <span className="text-sm font-medium">{day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input type="time" defaultValue="09:00" className="w-24" />
                  <span className="text-sm">to</span>
                  <Input type="time" defaultValue="18:00" className="w-24" />
                </div>
                <Button variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Tax Settings
          </CardTitle>
          <CardDescription>
            Configure tax rates and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Default Tax Rate (%)</label>
              <Input defaultValue="8.25" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Tax ID</label>
              <Input defaultValue="12-3456789" className="mt-1" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="tax-inclusive" defaultChecked />
            <label htmlFor="tax-inclusive" className="text-sm">Prices include tax</label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPOSSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Configure accepted payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { name: 'Credit Cards', enabled: true, icon: CreditCard },
              { name: 'Cash', enabled: true, icon: DollarSign },
              { name: 'Mobile Payments', enabled: true, icon: QrCode },
              { name: 'Gift Cards', enabled: false, icon: Tag },
              { name: 'Store Credit', enabled: true, icon: Receipt }
            ].map((method) => (
              <div key={method.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <method.icon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{method.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Configure</Button>
                  <input type="checkbox" defaultChecked={method.enabled} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            Receipt Settings
          </CardTitle>
          <CardDescription>
            Customize receipt printing and formatting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Receipt Header</label>
              <Input defaultValue="Urban Retail Hub" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Receipt Footer</label>
              <Input defaultValue="Thank you for shopping with us!" className="mt-1" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="print-receipt" defaultChecked />
              <label htmlFor="print-receipt" className="text-sm">Auto-print receipts</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-receipt" defaultChecked />
              <label htmlFor="email-receipt" className="text-sm">Email receipts to customers</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="show-tax" defaultChecked />
              <label htmlFor="show-tax" className="text-sm">Show tax breakdown</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            Barcode & Scanner Settings
          </CardTitle>
          <CardDescription>
            Configure barcode scanning and product lookup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-add" defaultChecked />
              <label htmlFor="auto-add" className="text-sm">Auto-add items on scan</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="sound-feedback" defaultChecked />
              <label htmlFor="sound-feedback" className="text-sm">Sound feedback on scan</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="vibrate" defaultChecked />
              <label htmlFor="vibrate" className="text-sm">Vibrate on successful scan</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventorySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Stock Management
          </CardTitle>
          <CardDescription>
            Configure inventory tracking and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Low Stock Threshold</label>
              <Input defaultValue="10" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Out of Stock Threshold</label>
              <Input defaultValue="0" className="mt-1" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-reorder" defaultChecked />
              <label htmlFor="auto-reorder" className="text-sm">Enable auto-reorder suggestions</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="track-expiry" />
              <label htmlFor="track-expiry" className="text-sm">Track product expiry dates</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="serial-numbers" />
              <label htmlFor="serial-numbers" className="text-sm">Track serial numbers</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Import/Export
          </CardTitle>
          <CardDescription>
            Manage product data import and export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-sm">Import Products</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              <span className="text-sm">Export Products</span>
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Supported formats: CSV, Excel, JSON
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomerSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Customer Management
          </CardTitle>
          <CardDescription>
            Configure customer data and loyalty settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Loyalty Points Rate</label>
              <Input defaultValue="1" className="mt-1" />
              <p className="text-xs text-gray-600 mt-1">Points per dollar spent</p>
            </div>
            <div>
              <label className="text-sm font-medium">Points Value</label>
              <Input defaultValue="0.01" className="mt-1" />
              <p className="text-xs text-gray-600 mt-1">Dollar value per point</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-enroll" defaultChecked />
              <label htmlFor="auto-enroll" className="text-sm">Auto-enroll new customers in loyalty program</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="birthday-rewards" defaultChecked />
              <label htmlFor="birthday-rewards" className="text-sm">Send birthday rewards</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-marketing" defaultChecked />
              <label htmlFor="email-marketing" className="text-sm">Enable email marketing</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Communication Settings
          </CardTitle>
          <CardDescription>
            Configure customer communication preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="welcome-email" defaultChecked />
              <label htmlFor="welcome-email" className="text-sm">Send welcome email to new customers</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="order-confirmation" defaultChecked />
              <label htmlFor="order-confirmation" className="text-sm">Send order confirmation emails</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="shipping-updates" defaultChecked />
              <label htmlFor="shipping-updates" className="text-sm">Send shipping updates</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="review-requests" />
              <label htmlFor="review-requests" className="text-sm">Request customer reviews</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'pos':
        return renderPOSSettings();
      case 'inventory':
        return renderInventorySettings();
      case 'customers':
        return renderCustomerSettings();
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Settings for {activeTab} will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Retail Settings</h1>
          <p className="text-gray-600 mt-1">Configure your retail business settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex overflow-x-auto">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Content */}
      {renderTabContent()}
    </div>
  );
}
