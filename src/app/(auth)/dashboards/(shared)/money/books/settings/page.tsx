'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  Building, 
  User, 
  Bell,
  Lock,
  CreditCard,
  Globe,
  Mail,
  Smartphone,
  Shield,
  Download,
  Upload,
  Trash,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Palette,
  Languages
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'account' | 'billing' | 'security' | 'notifications' | 'integrations' | 'preferences'>('company')
  const [showPassword, setShowPassword] = useState(false)

  // Mock settings data
  const mockSettings = {
    company: {
      name: 'Acme Corporation',
      legal_name: 'Acme Corporation Inc.',
      tax_id: 'TAX123456789',
      phone: '(555) 123-4567',
      email: 'contact@acme.com',
      website: 'https://acme.com',
      address: {
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'United States'
      },
      fiscal_year_start: 'January',
      currency: 'USD',
      timezone: 'America/New_York'
    },
    account: {
      name: 'John Smith',
      email: 'john@acme.com',
      role: 'Administrator',
      last_login: '2024-01-25T14:30:00Z',
      two_factor_enabled: true,
      api_access: true
    },
    billing: {
      plan: 'Professional',
      price: 49,
      billing_cycle: 'monthly',
      next_billing: '2024-02-25',
      payment_method: '**** 1234',
      usage: {
        invoices_sent: 125,
        limit: 500
      }
    },
    integrations: [
      { name: 'QuickBooks', status: 'connected', last_sync: '2024-01-25T10:00:00Z' },
      { name: 'Stripe', status: 'connected', last_sync: '2024-01-25T09:30:00Z' },
      { name: 'PayPal', status: 'disconnected', last_sync: null },
      { name: 'Xero', status: 'error', last_sync: '2024-01-24T15:20:00Z' }
    ],
    notifications: {
      invoice_sent: true,
      payment_received: true,
      overdue_reminders: true,
      weekly_reports: false,
      security_alerts: true,
      marketing_emails: false
    }
  }

  const tabs = [
    { id: 'company', label: 'Company', icon: Building },
    { id: 'account', label: 'Account', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ]

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'disconnected': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getIntegrationStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'disconnected': return <Clock className="w-4 h-4 text-neutral-600" />
      default: return <Clock className="w-4 h-4 text-neutral-600" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Settings className="mr-3 h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex items-center whitespace-nowrap"
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Company Settings */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input defaultValue={mockSettings.company.name} />
              </div>
              <div>
                <label className="text-sm font-medium">Legal Name</label>
                <Input defaultValue={mockSettings.company.legal_name} />
              </div>
              <div>
                <label className="text-sm font-medium">Tax ID</label>
                <Input defaultValue={mockSettings.company.tax_id} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue={mockSettings.company.phone} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={mockSettings.company.email} />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input defaultValue={mockSettings.company.website} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Street Address</label>
                <Input defaultValue={mockSettings.company.address.street} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input defaultValue={mockSettings.company.address.city} />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input defaultValue={mockSettings.company.address.state} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ZIP Code</label>
                  <Input defaultValue={mockSettings.company.address.zip_code} />
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input defaultValue={mockSettings.company.address.country} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Fiscal Year Start</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="January">January</option>
                  <option value="April">April</option>
                  <option value="July">July</option>
                  <option value="October">October</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Default Currency</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Timezone</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue={mockSettings.account.name} />
              </div>
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input defaultValue={mockSettings.account.email} type="email" />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Input defaultValue={mockSettings.account.role} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Last Login</label>
                <Input defaultValue={new Date(mockSettings.account.last_login).toLocaleString()} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Enter current password" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button className="w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">2FA Status</div>
                  <div className="text-sm text-muted-foreground">
                    {mockSettings.account.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <Badge className={mockSettings.account.two_factor_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {mockSettings.account.two_factor_enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                <Smartphone className="w-4 h-4 mr-2" />
                Configure 2FA
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">API Access</div>
                  <div className="text-sm text-muted-foreground">
                    {mockSettings.account.api_access ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <Badge className={mockSettings.account.api_access ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}>
                  {mockSettings.account.api_access ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate API Key
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Settings */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{mockSettings.billing.plan}</div>
                  <div className="text-muted-foreground">
                    ${mockSettings.billing.price}/{mockSettings.billing.billing_cycle}
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Current</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Invoices Sent</span>
                  <span>{mockSettings.billing.usage.invoices_sent} / {mockSettings.billing.usage.limit}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: '${(mockSettings.billing.usage.invoices_sent / mockSettings.billing.usage.limit) * 100}%' }}
                  />
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="font-medium">{mockSettings.billing.payment_method}</div>
                  <div className="text-sm text-muted-foreground">Expires 12/26</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next Billing Date</span>
                  <span>{new Date(mockSettings.billing.next_billing).toLocaleDateString()}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">January 2025</div>
                    <div className="text-sm text-muted-foreground">Professional Plan</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold">$49.00</span>
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">December 2024</div>
                    <div className="text-sm text-muted-foreground">Professional Plan</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold">$49.00</span>
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockSettings.integrations.map((integration) => (
            <Card key={integration.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getIntegrationStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    {getIntegrationStatusIcon(integration.status)}
                  </div>
                </div>
                
                {integration.last_sync && (
                  <div className="text-sm text-muted-foreground mb-4">
                    Last sync: {new Date(integration.last_sync).toLocaleString()}
                  </div>
                )}

                <div className="flex space-x-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Sync
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1">
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(mockSettings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Get notified about {key.replace(/_/g, ' ').toLowerCase()}
                    </div>
                  </div>
                  <Button
                    variant={value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      // Toggle notification setting
                      console.log('Toggle ${key}:', !value)
                    }}
                  >
                    {value ? 'On' : 'Off'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date Format</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Number Format</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="1,234.56">1,234.56</option>
                  <option value="1.234,56">1.234,56</option>
                  <option value="1 234,56">1 234,56</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Time Zone</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Delete Account</span>
                </div>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. This action cannot be undone.
                </p>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}