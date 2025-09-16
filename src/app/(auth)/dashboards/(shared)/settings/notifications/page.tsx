"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, Bell, Mail, Smartphone, Monitor, 
  Settings, Volume2, VolumeX, Clock, Users,
  Calendar, DollarSign, AlertTriangle, CheckCircle,
  MessageSquare, Zap, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function NotificationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const notificationCategories = [
    {
      id: 'work_orders',
      title: 'Work Orders',
      description: 'Updates about work order status, assignments, and completions',
      icon: <Settings className="w-5 h-5 text-blue-400" />,
      settings: {
        email: true,
        push: true,
        sms: false,
        desktop: true
      }
    },
    {
      id: 'billing',
      title: 'Billing & Payments',
      description: 'Invoice notifications, payment confirmations, and billing alerts',
      icon: <DollarSign className="w-5 h-5 text-green-400" />,
      settings: {
        email: true,
        push: false,
        sms: true,
        desktop: false
      }
    },
    {
      id: 'team',
      title: 'Team Activity',
      description: 'Team member updates, role changes, and collaboration notifications',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      settings: {
        email: true,
        push: true,
        sms: false,
        desktop: true
      }
    },
    {
      id: 'security',
      title: 'Security & Access',
      description: 'Login attempts, security alerts, and access changes',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      settings: {
        email: true,
        push: true,
        sms: true,
        desktop: true
      }
    },
    {
      id: 'appointments',
      title: 'Appointments & Scheduling',
      description: 'Appointment reminders, cancellations, and schedule changes',
      icon: <Calendar className="w-5 h-5 text-orange-400" />,
      settings: {
        email: true,
        push: true,
        sms: false,
        desktop: false
      }
    },
    {
      id: 'system',
      title: 'System Updates',
      description: 'Maintenance notifications, feature updates, and system alerts',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      settings: {
        email: false,
        push: true,
        sms: false,
        desktop: false
      }
    }
  ]

  const recentNotifications = [
    {
      id: 1,
      type: 'work_order',
      title: 'Work order #WO-2024-001 completed',
      message: 'Plumbing repair at 123 Main St has been marked as completed',
      timestamp: '2024-01-30 14:23',
      read: false,
      channel: 'email'
    },
    {
      id: 2,
      type: 'billing',
      title: 'Invoice payment received',
      message: 'Payment of $450.00 received for Invoice #INV-2024-001',
      timestamp: '2024-01-30 12:45',
      read: true,
      channel: 'push'
    },
    {
      id: 3,
      type: 'team',
      title: 'New team member added',
      message: 'Sarah Wilson has joined your team as a Technician',
      timestamp: '2024-01-29 16:30',
      read: true,
      channel: 'email'
    },
    {
      id: 4,
      type: 'security',
      title: 'New login detected',
      message: 'New login from Chrome on macOS in San Francisco, CA',
      timestamp: '2024-01-29 09:15',
      read: false,
      channel: 'sms'
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'work_order':
        return <Settings className="w-4 h-4 text-blue-400" />
      case 'billing':
        return <DollarSign className="w-4 h-4 text-green-400" />
      case 'team':
        return <Users className="w-4 h-4 text-purple-400" />
      case 'security':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <Bell className="w-4 h-4 text-neutral-400" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-3 h-3 text-neutral-400" />
      case 'push':
        return <Smartphone className="w-3 h-3 text-neutral-400" />
      case 'sms':
        return <MessageSquare className="w-3 h-3 text-neutral-400" />
      case 'desktop':
        return <Monitor className="w-3 h-3 text-neutral-400" />
      default:
        return <Bell className="w-3 h-3 text-neutral-400" />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboards/settings" className="text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-white">Notifications</h1>
          </div>
          <p className="text-neutral-400">Configure your email, push, and alert preferences</p>
        </div>

        <Tabs defaultValue="preferences" className="space-y-8">
          <TabsList className="bg-neutral-900/50 border border-neutral-800">
            <TabsTrigger value="preferences" className="data-[state=active]:bg-neutral-800">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-neutral-800">
              Recent Notifications
            </TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-neutral-800">
              Devices
            </TabsTrigger>
          </TabsList>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-8">
            {/* Global Settings */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Global Settings</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Master controls for all notifications
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-neutral-400" />
                    <div>
                      <Label className="text-white">Enable All Notifications</Label>
                      <p className="text-sm text-neutral-400">Master toggle for all notification types</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-neutral-400" />
                    <div>
                      <Label className="text-white">Quiet Hours</Label>
                      <p className="text-sm text-neutral-400">Pause notifications during specified hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="22:00">
                      <SelectTrigger className="w-20 bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="20:00">8 PM</SelectItem>
                        <SelectItem value="21:00">9 PM</SelectItem>
                        <SelectItem value="22:00">10 PM</SelectItem>
                        <SelectItem value="23:00">11 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-neutral-400">to</span>
                    <Select defaultValue="08:00">
                      <SelectTrigger className="w-20 bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="06:00">6 AM</SelectItem>
                        <SelectItem value="07:00">7 AM</SelectItem>
                        <SelectItem value="08:00">8 AM</SelectItem>
                        <SelectItem value="09:00">9 AM</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Categories */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Notification Categories</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Configure notifications by category and delivery method
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-4 pb-2 border-b border-neutral-800">
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-neutral-300">Category</span>
                  </div>
                  <div className="text-center">
                    <Mail className="w-4 h-4 mx-auto text-neutral-400" />
                    <span className="text-xs text-neutral-500">Email</span>
                  </div>
                  <div className="text-center">
                    <Smartphone className="w-4 h-4 mx-auto text-neutral-400" />
                    <span className="text-xs text-neutral-500">Push</span>
                  </div>
                  <div className="text-center">
                    <MessageSquare className="w-4 h-4 mx-auto text-neutral-400" />
                    <span className="text-xs text-neutral-500">SMS</span>
                  </div>
                  <div className="text-center">
                    <Monitor className="w-4 h-4 mx-auto text-neutral-400" />
                    <span className="text-xs text-neutral-500">Desktop</span>
                  </div>
                </div>

                {/* Notification Rows */}
                {notificationCategories.map((category) => (
                  <div key={category.id} className="grid grid-cols-6 gap-4 items-center">
                    <div className="col-span-2 flex items-center gap-3">
                      {category.icon}
                      <div>
                        <h4 className="text-white font-medium">{category.title}</h4>
                        <p className="text-xs text-neutral-400">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Switch defaultChecked={category.settings.email} />
                    </div>
                    <div className="text-center">
                      <Switch defaultChecked={category.settings.push} />
                    </div>
                    <div className="text-center">
                      <Switch defaultChecked={category.settings.sms} />
                    </div>
                    <div className="text-center">
                      <Switch defaultChecked={category.settings.desktop} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Delivery Settings */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Delivery Settings</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Configure how notifications are delivered
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Email Digest</Label>
                    <p className="text-sm text-neutral-400">Group multiple notifications into daily digest</p>
                  </div>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">High Priority Only</Label>
                    <p className="text-sm text-neutral-400">Only send notifications for critical events</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Sound Notifications</Label>
                    <p className="text-sm text-neutral-400">Play sounds for push and desktop notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Notifications Tab */}
          <TabsContent value="history" className="space-y-8">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-neutral-400" />
                    <div>
                      <CardTitle className="text-white">Recent Notifications</CardTitle>
                      <CardDescription className="text-neutral-400">
                        View your recent notification history
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                    Mark All Read
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={'flex items-start gap-4 p-4 border rounded-lg ${
                      notification.read
                        ? 'border-neutral-800 bg-neutral-900/30'
                        : 'border-blue-700/30 bg-blue-950/10'
                    }'}
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-neutral-800 rounded-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={'font-medium ${notification.read ? 'text-neutral-300' : 'text-white'}'}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(notification.channel)}
                          <span className="text-xs text-neutral-500">{notification.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-400 mt-1">{notification.message}</p>
                      {!notification.read && (
                        <Badge variant="outline" className="border-blue-600 text-blue-400 mt-2 text-xs">
                          Unread
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-8">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Notification Devices</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Manage devices that receive push notifications
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-8 h-8 text-neutral-400" />
                    <div>
                      <h4 className="text-white font-medium">Chrome - MacBook Pro</h4>
                      <p className="text-sm text-neutral-400">Desktop notifications enabled</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-neutral-400" />
                    <div>
                      <h4 className="text-white font-medium">iPhone 14</h4>
                      <p className="text-sm text-neutral-400">Push notifications enabled</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-8 h-8 text-neutral-400" />
                    <div>
                      <h4 className="text-white font-medium">Safari - iPad Air</h4>
                      <p className="text-sm text-neutral-400">Last seen: 2 days ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-neutral-600 text-neutral-400">
                    Inactive
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Changes */}
        <div className="flex justify-end gap-4 pb-8">
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
  )
}