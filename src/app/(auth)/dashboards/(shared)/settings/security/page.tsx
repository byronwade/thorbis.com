"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, Shield, Key, Smartphone, Eye, AlertTriangle, 
  Clock, MapPin, Monitor, Download, Trash2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

export default function SecuritySettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const recentSessions = [
    { id: 1, device: 'MacBook Pro', location: 'San Francisco, CA', ip: '192.168.1.1', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'iPhone 14', location: 'San Francisco, CA', ip: '192.168.1.2', lastActive: '1 hour ago', current: false },
    { id: 3, device: 'Chrome Browser', location: 'New York, NY', ip: '203.0.113.1', lastActive: '2 days ago', current: false },
  ]

  const apiKeys = [
    { id: 1, name: 'Production API', key: 'pk_live_••••••••••••1234', created: '2024-01-15', lastUsed: '2024-01-30' },
    { id: 2, name: 'Development API', key: 'pk_test_••••••••••••5678', created: '2024-01-10', lastUsed: '2024-01-29' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboards/settings" className="text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-white">Authentication & Security</h1>
          </div>
          <p className="text-neutral-400">Manage your password, two-factor authentication, and access logs</p>
        </div>

        <div className="space-y-8 pb-8">
          {/* Password */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Password</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Change your account password
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Add an extra layer of security to your account
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-400">
                  Enabled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Authenticator App</h4>
                  <p className="text-sm text-neutral-400">Use an app to get verification codes</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">SMS Authentication</h4>
                  <p className="text-sm text-neutral-400">Get codes via text message</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium">Recovery Codes</h4>
                <p className="text-sm text-neutral-400">
                  Save these recovery codes in a safe place. You can use them to access your account if you lose your device.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                    <Download className="w-4 h-4 mr-2" />
                    Download Codes
                  </Button>
                  <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Active Sessions</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Manage devices that are currently signed in to your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-neutral-800 rounded-lg">
                      <Monitor className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{session.device}</h4>
                        {session.current && (
                          <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.lastActive}
                        </span>
                        <span>IP: {session.ip}</span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">API Keys</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Manage your API keys for programmatic access
                    </CardDescription>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{key.name}</h4>
                    <p className="text-sm text-neutral-400 font-mono">{key.key}</p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500 mt-1">
                      <span>Created: {key.created}</span>
                      <span>Last used: {key.lastUsed}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Security Alerts</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Configure how we notify you about security events
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">New Login Alerts</Label>
                  <p className="text-sm text-neutral-400">Get notified when someone signs in to your account</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Suspicious Activity</Label>
                  <p className="text-sm text-neutral-400">Get alerted about unusual account activity</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Password Changes</Label>
                  <p className="text-sm text-neutral-400">Get notified when your password is changed</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Save Changes */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}