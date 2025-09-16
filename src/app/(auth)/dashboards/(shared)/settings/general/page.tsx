"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, User, Building2, Globe, Palette, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function GeneralSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboards/settings" className="text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-white">General Settings</h1>
          </div>
          <p className="text-neutral-400">Manage your profile and account preferences</p>
        </div>

        <div className="space-y-8 pb-8">
          {/* Profile Information */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Update your personal profile information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/api/placeholder/80/80" alt="Profile picture" />
                  <AvatarFallback className="bg-neutral-800 text-neutral-200 text-lg">JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                    Change Photo
                  </Button>
                  <p className="text-sm text-neutral-400">JPG, PNG or GIF. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue="John"
                    className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue="Doe"
                    className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization Settings */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Organization</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Manage your organization settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-white">Organization Name</Label>
                <Input
                  id="orgName"
                  defaultValue="Acme Corporation"
                  className="bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-white">Industry</Label>
                  <Select defaultValue="home-services">
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="home-services">Home Services</SelectItem>
                      <SelectItem value="auto">Automotive</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-white">Company Size</Label>
                  <Select defaultValue="10-50">
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="10-50">10-50 employees</SelectItem>
                      <SelectItem value="50-200">50-200 employees</SelectItem>
                      <SelectItem value="200+">200+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Preferences</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Customize your application experience
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-white">Timezone</Label>
                  <Select defaultValue="america/new_york">
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="america/new_york">Eastern Time</SelectItem>
                      <SelectItem value="america/chicago">Central Time</SelectItem>
                      <SelectItem value="america/denver">Mountain Time</SelectItem>
                      <SelectItem value="america/los_angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-white">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Dark Mode</Label>
                  <p className="text-sm text-neutral-400">Use dark theme across the application</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Compact View</Label>
                  <p className="text-sm text-neutral-400">Show more content in less space</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Data Export</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Export your account data and settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Export Account Data</p>
                  <p className="text-sm text-neutral-400">Download a copy of all your account data</p>
                </div>
                <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                  Request Export
                </Button>
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