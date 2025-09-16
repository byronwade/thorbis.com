"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  User, Shield, CreditCard, Webhook, Users, Bell, 
  ChevronLeft, Home, Settings, ChevronRight, 
  Clock, Globe, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { settingsNavigationConfig } from './navigation.config'

export default function SettingsPage() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboards" className="text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
              <p className="text-neutral-400">Manage your account and application preferences</p>
            </div>
          </div>
          
          {/* Settings Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <Card className="bg-neutral-900/30 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/20">
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Settings Categories</p>
                    <p className="text-lg font-semibold text-white">{settingsNavigationConfig.sections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-neutral-900/30 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600/20">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Security Status</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 text-white text-xs">Secure</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-neutral-900/30 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-600/20">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Team Members</p>
                    <p className="text-lg font-semibold text-white">4 Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Settings Categories Grid */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Settings Categories</h2>
            <p className="text-neutral-400">Configure your account, organization, and application settings</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {settingsNavigationConfig.sections.map((section) => (
              <div key={section.title} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{section.title}</h3>
                  <p className="text-sm text-neutral-500">
                    {section.title === 'Account' && 'Personal profile and account preferences'}
                    {section.title === 'Organization' && 'Team management and billing settings'}
                    {section.title === 'Configuration' && 'API access and notification preferences'}
                  </p>
                </div>
                <div className="space-y-4">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href} className="block group">
                        <Card className="bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all duration-200 cursor-pointer">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 group-hover:bg-neutral-700 transition-colors">
                                  <Icon className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                                    {item.name}
                                  </h4>
                                  <p className="text-sm text-neutral-400 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Quick Actions</h2>
            <p className="text-neutral-400">Common tasks and navigation shortcuts</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboards">
              <Button variant="outline" className="w-full justify-start h-auto p-5 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-all group">
                <Home className="w-5 h-5 mr-4 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                <div className="text-left">
                  <div className="font-medium text-white group-hover:text-blue-400 transition-colors">Back to Dashboard</div>
                  <div className="text-sm text-neutral-400">Return to main dashboard</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/dashboards/settings/general">
              <Button variant="outline" className="w-full justify-start h-auto p-5 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-all group">
                <User className="w-5 h-5 mr-4 text-neutral-400 group-hover:text-green-400 transition-colors" />
                <div className="text-left">
                  <div className="font-medium text-white group-hover:text-green-400 transition-colors">Profile Settings</div>
                  <div className="text-sm text-neutral-400">Update your profile info</div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboards/settings/security">
              <Button variant="outline" className="w-full justify-start h-auto p-5 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-all group">
                <Shield className="w-5 h-5 mr-4 text-neutral-400 group-hover:text-red-400 transition-colors" />
                <div className="text-left">
                  <div className="font-medium text-white group-hover:text-red-400 transition-colors">Security Center</div>
                  <div className="text-sm text-neutral-400">Manage security settings</div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboards/settings/integrations">
              <Button variant="outline" className="w-full justify-start h-auto p-5 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-all group">
                <Webhook className="w-5 h-5 mr-4 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                <div className="text-left">
                  <div className="font-medium text-white group-hover:text-purple-400 transition-colors">API & Integrations</div>
                  <div className="text-sm text-neutral-400">Manage API access</div>
                </div>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Recent Activity</h2>
            <p className="text-neutral-400">Your latest settings and account changes</p>
          </div>
          
          <Card className="bg-neutral-900/30 border-neutral-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-white">Profile information updated</span>
                    <span className="text-neutral-500 ml-2">• 2 hours ago</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600/20">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-white">Two-factor authentication enabled</span>
                    <span className="text-neutral-500 ml-2">• 1 day ago</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/20">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-white">New team member invited</span>
                    <span className="text-neutral-500 ml-2">• 3 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}