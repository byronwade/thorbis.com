"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, Users, UserPlus, Shield, Crown, 
  MoreHorizontal, Mail, Calendar, Trash2, Edit,
  Key, Globe, Eye, Settings, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'

export default function TeamSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Owner',
      status: 'active',
      lastActive: '2024-01-30 14:23',
      avatar: '/api/placeholder/40/40',
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Admin',
      status: 'active',
      lastActive: '2024-01-30 12:45',
      avatar: '/api/placeholder/40/40',
      permissions: ['manage_team', 'view_reports', 'manage_settings']
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'Manager',
      status: 'active',
      lastActive: '2024-01-29 16:30',
      avatar: '/api/placeholder/40/40',
      permissions: ['view_reports', 'manage_work_orders']
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      role: 'Technician',
      status: 'invited',
      lastActive: null,
      avatar: '/api/placeholder/40/40',
      permissions: ['view_work_orders', 'update_work_orders']
    }
  ]

  const pendingInvites = [
    {
      id: 1,
      email: 'new.employee@example.com',
      role: 'Technician',
      invitedBy: 'John Doe',
      sentAt: '2024-01-29',
      expiresAt: '2024-02-05'
    },
    {
      id: 2,
      email: 'contractor@example.com',
      role: 'Manager',
      invitedBy: 'Jane Smith',
      sentAt: '2024-01-28',
      expiresAt: '2024-02-04'
    }
  ]

  const roles = [
    {
      name: 'Owner',
      description: 'Full access to all features and settings',
      permissions: ['All permissions'],
      color: 'bg-yellow-600'
    },
    {
      name: 'Admin',
      description: 'Manage team, settings, and view all data',
      permissions: ['Manage team', 'View reports', 'Manage settings', 'Billing access'],
      color: 'bg-red-600'
    },
    {
      name: 'Manager',
      description: 'Manage operations and view reports',
      permissions: ['View reports', 'Manage work orders', 'Manage customers'],
      color: 'bg-blue-600'
    },
    {
      name: 'Technician',
      description: 'Create and update work orders',
      permissions: ['View work orders', 'Update work orders', 'View customers'],
      color: 'bg-green-600'
    }
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Crown className="w-4 h-4 text-yellow-400" />
      case 'Admin':
        return <Shield className="w-4 h-4 text-red-400" />
      default:
        return <Users className="w-4 h-4 text-blue-400" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'border-yellow-600 text-yellow-400'
      case 'Admin':
        return 'border-red-600 text-red-400'
      case 'Manager':
        return 'border-blue-600 text-blue-400'
      case 'Technician':
        return 'border-green-600 text-green-400'
      default:
        return 'border-neutral-600 text-neutral-400'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboards/settings" className="text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-white">Team & Access</h1>
          </div>
          <p className="text-neutral-400">Manage team members, roles, and permissions</p>
        </div>

        <Tabs defaultValue="team-members" className="space-y-8">
          <TabsList className="bg-neutral-900/50 border border-neutral-800">
            <TabsTrigger value="team-members" className="data-[state=active]:bg-neutral-800">
              Team Members
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-neutral-800">
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="invites" className="data-[state=active]:bg-neutral-800">
              Pending Invites
            </TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="team-members" className="space-y-8">
            {/* Invite New Member */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Invite Team Member</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Add a new member to your team
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white">Role</Label>
                    <Select defaultValue="technician">
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Send Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members List */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-neutral-400" />
                    <div>
                      <CardTitle className="text-white">Team Members</CardTitle>
                      <CardDescription className="text-neutral-400">
                        Manage your team members and their access
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-600 text-blue-400">
                    {teamMembers.length} Members
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-neutral-800 text-neutral-200">
                          {member.name.split(' ').map(n => n[0]).join(')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{member.name}</h4>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                          {member.status === 'invited' && (
                            <Badge variant="outline" className="border-orange-600 text-orange-400">
                              Invited
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-neutral-400">{member.email}</p>
                        {member.lastActive && (
                          <p className="text-xs text-neutral-500">Last active: {member.lastActive}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {member.role !== 'Owner' && (
                        <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="space-y-8">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Roles & Permissions</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Understand what each role can access
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roles.map((role, index) => (
                    <div key={index} className="p-4 border border-neutral-800 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={'w-3 h-3 rounded-full ${role.color}'}></div>
                        <h4 className="text-white font-medium">{role.name}</h4>
                      </div>
                      <p className="text-sm text-neutral-400 mb-4">{role.description}</p>
                      <div className="space-y-2">
                        <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Permissions</p>
                        <div className="space-y-1">
                          {role.permissions.map((permission, permIndex) => (
                            <div key={permIndex} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
                              <span className="text-sm text-neutral-300">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Access Control Settings */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Access Control</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Configure organization-wide access settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-neutral-400">Mandate 2FA for all team members</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">IP Restrictions</Label>
                    <p className="text-sm text-neutral-400">Limit access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Session Timeout</Label>
                    <p className="text-sm text-neutral-400">Automatically log out inactive users</p>
                  </div>
                  <Select defaultValue="8h">
                    <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="4h">4 hours</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Domain Restrictions</Label>
                    <p className="text-sm text-neutral-400">Only allow sign-ups from specific domains</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Invites Tab */}
          <TabsContent value="invites" className="space-y-8">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-neutral-400" />
                    <div>
                      <CardTitle className="text-white">Pending Invitations</CardTitle>
                      <CardDescription className="text-neutral-400">
                        Manage outstanding team invitations
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-orange-600 text-orange-400">
                    {pendingInvites.length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingInvites.length > 0 ? (
                  pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{invite.email}</h4>
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                          <span>Role: {invite.role}</span>
                          <span>Invited by: {invite.invitedBy}</span>
                          <span>Sent: {invite.sentAt}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          <span className="text-xs text-orange-400">Expires: {invite.expiresAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                          Resend
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/20">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No Pending Invitations</h3>
                    <p className="text-neutral-400">All team invitations have been accepted or expired.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}