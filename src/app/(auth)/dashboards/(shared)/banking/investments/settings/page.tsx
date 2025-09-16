'use client'

"use client";

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  User,
  Shield,
  Bell,
  DollarSign,
  Target,
  Activity,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Lock,
  Smartphone,
  Mail,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  X,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';


/**
 * Investment Account Settings & Preferences Page
 * 
 * Features:
 * - Account profile and personal information management
 * - Investment preferences and risk tolerance settings
 * - Trading permissions and account types
 * - Notification preferences and alert management
 * - Security settings and two-factor authentication
 * - Tax preferences and document management
 * - API key management for third-party integrations
 * - Data export and import capabilities
 * - Compliance and regulatory settings
 * - Account linking and external connections
 * 
 * Integration:
 * - Secure data encryption for sensitive information
 * - Compliance with financial regulations
 * - Integration with identity verification services
 * - Automated tax document generation
 */
export default function InvestmentSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [paperTradingEnabled, setPaperTradingEnabled] = useState(false);
  const [marginTradingEnabled, setMarginTradingEnabled] = useState(true);

  // Mock user data - in real implementation, this would come from API
  const userProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-05-15',
    ssn: '***-**-1234',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    employmentStatus: 'employed',
    annualIncome: 150000,
    netWorth: 500000,
    investmentExperience: 'intermediate',
    riskTolerance: 'moderate'
  };

  const accountSettings = {
    accountType: 'margin',
    tradingPermissions: {
      stocks: true,
      options: false,
      futures: false,
      crypto: true,
      international: false
    },
    marginLevel: 'standard',
    dayTradingEnabled: false,
    autoInvesting: false,
    dividendReinvestment: true
  };

  const notificationSettings = {
    priceAlerts: true,
    newsAlerts: true,
    earningsAlerts: true,
    portfolioUpdates: true,
    tradeConfirmations: true,
    marginCalls: true,
    marketHours: false,
    weeklyReports: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  };

  const securitySettings = {
    twoFactorAuth: true,
    biometricLogin: false,
    sessionTimeout: 30,
    ipWhitelist: [],
    apiKeyAccess: true,
    dataEncryption: true
  };

  const taxSettings = {
    taxResidency: 'US',
    taxLotMethod: 'fifo',
    autoTaxDocuments: true,
    scheduleD: true,
    form1099: true,
    taxOptimization: false
  };

  const handleSaveProfile = () => {
    // In real implementation, this would make API call to update profile
    console.log('Saving profile updates');
  };

  const handleExportData = (type: string) => {
    // In real implementation, this would initiate data export
    console.log('Exporting data:', type);
  };

  const handleGenerateApiKey = () => {
    // In real implementation, this would generate new API key
    console.log('Generating new API key');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
            <p className="text-neutral-400">
              Manage your investment account preferences and security settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Profile
          </TabsTrigger>
          <TabsTrigger value="trading" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Trading
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Security
          </TabsTrigger>
          <TabsTrigger value="tax" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Tax
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            API
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                <User className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">First Name</label>
                    <Input
                      value={userProfile.firstName}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">Last Name</label>
                    <Input
                      value={userProfile.lastName}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    value={userProfile.email}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Phone Number</label>
                  <Input
                    type="tel"
                    value={userProfile.phone}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Date of Birth</label>
                  <Input
                    type="date"
                    value={userProfile.dateOfBirth}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">SSN</label>
                  <Input
                    value={userProfile.ssn}
                    disabled
                    className="bg-neutral-800 border-neutral-700 text-neutral-400"
                  />
                </div>
              </div>
            </Card>

            {/* Address Information */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Address</h3>
                <Globe className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Street Address</label>
                  <Input
                    value={userProfile.address.street}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">City</label>
                    <Input
                      value={userProfile.address.city}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">State</label>
                    <Select value={userProfile.address.state}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">ZIP Code</label>
                    <Input
                      value={userProfile.address.zipCode}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">Country</label>
                    <Select value={userProfile.address.country}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Financial Information */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Financial Information</h3>
                <DollarSign className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Employment Status</label>
                  <Select value={userProfile.employmentStatus}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self_employed">Self-Employed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Annual Income</label>
                  <Input
                    type="number"
                    value={userProfile.annualIncome}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Net Worth</label>
                  <Input
                    type="number"
                    value={userProfile.netWorth}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
            </Card>

            {/* Investment Profile */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Investment Profile</h3>
                <Target className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Investment Experience</label>
                  <Select value={userProfile.investmentExperience}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (2-10 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (10+ years)</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Risk Tolerance</label>
                  <Select value={userProfile.riskTolerance}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Trading Settings */}
        <TabsContent value="trading" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Type */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Account Type</h3>
                <Activity className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Account Type</label>
                  <Select value={accountSettings.accountType}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="cash">Cash Account</SelectItem>
                      <SelectItem value="margin">Margin Account</SelectItem>
                      <SelectItem value="retirement">Retirement Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Day Trading</p>
                    <p className="text-xs text-neutral-400">Pattern day trading privileges</p>
                  </div>
                  <Switch
                    checked={accountSettings.dayTradingEnabled}
                    onCheckedChange={setMarginTradingEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Paper Trading</p>
                    <p className="text-xs text-neutral-400">Practice trading with virtual money</p>
                  </div>
                  <Switch
                    checked={paperTradingEnabled}
                    onCheckedChange={setPaperTradingEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Dividend Reinvestment</p>
                    <p className="text-xs text-neutral-400">Automatically reinvest dividends</p>
                  </div>
                  <Switch
                    checked={accountSettings.dividendReinvestment}
                  />
                </div>
              </div>
            </Card>

            {/* Trading Permissions */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Trading Permissions</h3>
                <Shield className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Stocks & ETFs</p>
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                      Approved
                    </Badge>
                  </div>
                  <Switch checked={accountSettings.tradingPermissions.stocks} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Options Trading</p>
                    <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                      Not Approved
                    </Badge>
                  </div>
                  <Switch checked={accountSettings.tradingPermissions.options} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Futures Trading</p>
                    <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                      Not Approved
                    </Badge>
                  </div>
                  <Switch checked={accountSettings.tradingPermissions.futures} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Cryptocurrency</p>
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                      Approved
                    </Badge>
                  </div>
                  <Switch checked={accountSettings.tradingPermissions.crypto} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">International Markets</p>
                    <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                      Not Approved
                    </Badge>
                  </div>
                  <Switch checked={accountSettings.tradingPermissions.international} />
                </div>
              </div>
            </Card>

            {/* Default Order Settings */}
            <Card className="bg-neutral-900 border-neutral-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Default Order Settings</h3>
                <Settings className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Default Order Type</label>
                  <Select defaultValue="market">
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Default Time in Force</label>
                  <Select defaultValue="day">
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="gtc">Good Till Cancelled</SelectItem>
                      <SelectItem value="ioc">Immediate or Cancel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Default Quantity</label>
                  <Input
                    type="number"
                    placeholder="100"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Settings */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Price & Market Alerts</h3>
                <Bell className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Price Alerts</p>
                    <p className="text-xs text-neutral-400">Stock and crypto price movements</p>
                  </div>
                  <Switch checked={notificationSettings.priceAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">News Alerts</p>
                    <p className="text-xs text-neutral-400">Market news and analysis</p>
                  </div>
                  <Switch checked={notificationSettings.newsAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Earnings Alerts</p>
                    <p className="text-xs text-neutral-400">Earnings announcements</p>
                  </div>
                  <Switch checked={notificationSettings.earningsAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Portfolio Updates</p>
                    <p className="text-xs text-neutral-400">Daily portfolio performance</p>
                  </div>
                  <Switch checked={notificationSettings.portfolioUpdates} />
                </div>
              </div>
            </Card>

            {/* Trading Notifications */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Trading Notifications</h3>
                <Activity className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Trade Confirmations</p>
                    <p className="text-xs text-neutral-400">Order fills and executions</p>
                  </div>
                  <Switch checked={notificationSettings.tradeConfirmations} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Margin Calls</p>
                    <p className="text-xs text-neutral-400">Margin requirement alerts</p>
                  </div>
                  <Switch checked={notificationSettings.marginCalls} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Market Hours</p>
                    <p className="text-xs text-neutral-400">Market open/close notifications</p>
                  </div>
                  <Switch checked={notificationSettings.marketHours} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Weekly Reports</p>
                    <p className="text-xs text-neutral-400">Weekly portfolio summary</p>
                  </div>
                  <Switch checked={notificationSettings.weeklyReports} />
                </div>
              </div>
            </Card>

            {/* Notification Channels */}
            <Card className="bg-neutral-900 border-neutral-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Notification Channels</h3>
                <Smartphone className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-2">Email</h4>
                  <Switch checked={notificationSettings.emailNotifications} />
                  <p className="text-xs text-neutral-400 mt-2">{userProfile.email}</p>
                </div>
                <div className="text-center">
                  <Smartphone className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-2">SMS</h4>
                  <Switch checked={notificationSettings.smsNotifications} />
                  <p className="text-xs text-neutral-400 mt-2">{userProfile.phone}</p>
                </div>
                <div className="text-center">
                  <Bell className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-2">Push</h4>
                  <Switch checked={notificationSettings.pushNotifications} />
                  <p className="text-xs text-neutral-400 mt-2">Browser & Mobile</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Authentication */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Authentication</h3>
                <Shield className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-neutral-400">SMS or authenticator app</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                      Enabled
                    </Badge>
                    <Switch 
                      checked={twoFactorEnabled} 
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Biometric Login</p>
                    <p className="text-xs text-neutral-400">Fingerprint or face recognition</p>
                  </div>
                  <Switch checked={securitySettings.biometricLogin} />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Session Timeout (minutes)</label>
                  <Select value={securitySettings.sessionTimeout.toString()}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Access Control */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Access Control</h3>
                <Lock className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">API Key Access</p>
                    <p className="text-xs text-neutral-400">Third-party app integration</p>
                  </div>
                  <Switch checked={securitySettings.apiKeyAccess} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Data Encryption</p>
                    <p className="text-xs text-neutral-400">End-to-end data protection</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                      Active
                    </Badge>
                    <Switch checked={securitySettings.dataEncryption} disabled />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">IP Whitelist</label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Add IP address or range"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                    <Button size="sm" className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add IP
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-neutral-900 border-neutral-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Security Activity</h3>
                <Activity className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-white">Successful login from New York, NY</p>
                      <p className="text-xs text-neutral-400">2 hours ago • Chrome on macOS</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-white">Password changed</p>
                      <p className="text-xs text-neutral-400">1 day ago</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-white">Failed login attempt from unknown location</p>
                      <p className="text-xs text-neutral-400">3 days ago • Blocked</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tax Information */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Tax Information</h3>
                <FileText className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Tax Residency</label>
                  <Select value={taxSettings.taxResidency}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="EU">European Union</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Tax Lot Method</label>
                  <Select value={taxSettings.taxLotMethod}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="fifo">First In, First Out (FIFO)</SelectItem>
                      <SelectItem value="lifo">Last In, First Out (LIFO)</SelectItem>
                      <SelectItem value="highest_cost">Highest Cost</SelectItem>
                      <SelectItem value="lowest_cost">Lowest Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Tax Optimization</p>
                    <p className="text-xs text-neutral-400">Optimize for tax efficiency</p>
                  </div>
                  <Switch checked={taxSettings.taxOptimization} />
                </div>
              </div>
            </Card>

            {/* Tax Documents */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Tax Documents</h3>
                <Download className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Auto-generate Documents</p>
                    <p className="text-xs text-neutral-400">Automatic tax form generation</p>
                  </div>
                  <Switch checked={taxSettings.autoTaxDocuments} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Schedule D</p>
                    <p className="text-xs text-neutral-400">Capital gains/losses</p>
                  </div>
                  <Switch checked={taxSettings.scheduleD} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Form 1099</p>
                    <p className="text-xs text-neutral-400">Dividend and interest reporting</p>
                  </div>
                  <Switch checked={taxSettings.form1099} />
                </div>
                <div className="pt-2">
                  <Button className="w-full bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Download className="w-4 h-4 mr-2" />
                    Download 2024 Tax Documents
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">API Key Management</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="border-neutral-700 text-white hover:bg-neutral-800"
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showApiKeys ? 'Hide' : 'Show'} Keys
                </Button>
                <Button 
                  size="sm" 
                  className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90"
                  onClick={handleGenerateApiKey}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-neutral-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">Production API Key</h4>
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-neutral-300 bg-neutral-700 px-2 py-1 rounded">
                    {showApiKeys ? 'pk_live_1234567890abcdef' : '••••••••••••••••••••'}
                  </code>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-neutral-600 text-white hover:bg-neutral-700">
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
                      Revoke
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-2">Created: Dec 15, 2024 • Last used: 2 hours ago</p>
              </div>

              <div className="p-4 bg-neutral-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">Test API Key</h4>
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                    Test Mode
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-neutral-300 bg-neutral-700 px-2 py-1 rounded">
                    {showApiKeys ? 'pk_test_abcdef1234567890' : '••••••••••••••••••••'}
                  </code>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-neutral-600 text-white hover:bg-neutral-700">
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
                      Revoke
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-2">Created: Nov 20, 2024 • Last used: 1 day ago</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">Important Security Notice</h4>
                  <p className="text-sm text-yellow-300">
                    Keep your API keys secure and never share them publicly. API keys provide full access to your account.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}