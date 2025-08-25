"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { 
  Settings, 
  Home, 
  Users, 
  DollarSign, 
  Camera,
  BarChart3,
  Bell,
  Shield,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Target,
  Building2,
  Star,
  Eye,
  Heart,
  MessageSquare,
  Download,
  Upload,
  Save,
  Check,
  X,
  Lock,
  CreditCard
} from 'lucide-react';

export default function RealEstateSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const settingsTabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'listings', name: 'Listings', icon: Home },
    { id: 'agents', name: 'Agents', icon: Users },
    { id: 'leads', name: 'Leads', icon: Target },
    { id: 'payments', name: 'Payments', icon: DollarSign },
    { id: 'photos', name: 'Photos & Media', icon: Camera },
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
            <Building2 className="w-5 h-5 mr-2" />
            Agency Information
          </CardTitle>
          <CardDescription>
            Basic agency details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Agency Name</label>
              <Input defaultValue="Premier Real Estate" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">License Number</label>
              <Input defaultValue="CA-12345678" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input defaultValue="(555) 123-4567" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue="contact@premierrealestate.com" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input defaultValue="456 Luxury Blvd, Beverly Hills, CA 90210" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Website</label>
              <Input defaultValue="https://premierrealestate.com" className="mt-1" />
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
            Set your agency operating hours
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
            <DollarSign className="w-5 h-5 mr-2" />
            Commission Settings
          </CardTitle>
          <CardDescription>
            Configure commission rates and payment settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Standard Commission Rate (%)</label>
              <Input defaultValue="6.0" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Agent Split (%)</label>
              <Input defaultValue="70" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Minimum Commission</label>
              <Input defaultValue="5000" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Terms (days)</label>
              <Input defaultValue="30" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderListingsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Listing Defaults
          </CardTitle>
          <CardDescription>
            Set default values for new property listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Default Listing Agent</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1">
                <option>Sarah Johnson</option>
                <option>Mike Chen</option>
                <option>Lisa Rodriguez</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Default Listing Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1">
                <option>Active</option>
                <option>Draft</option>
                <option>Pending</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Photo Upload Limit</label>
              <Input defaultValue="25" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Video Upload Limit (MB)</label>
              <Input defaultValue="100" className="mt-1" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-publish" defaultChecked />
              <label htmlFor="auto-publish" className="text-sm">Auto-publish new listings</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="photo-watermark" defaultChecked />
              <label htmlFor="photo-watermark" className="text-sm">Add watermark to photos</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="virtual-tour" />
              <label htmlFor="virtual-tour" className="text-sm">Enable virtual tour integration</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Listing Display Settings
          </CardTitle>
          <CardDescription>
            Configure how listings are displayed to potential buyers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="show-price" defaultChecked />
              <label htmlFor="show-price" className="text-sm">Show listing prices publicly</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="show-agent-contact" defaultChecked />
              <label htmlFor="show-agent-contact" className="text-sm">Show agent contact information</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="enable-favorites" defaultChecked />
              <label htmlFor="enable-favorites" className="text-sm">Enable favorites/bookmarks</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="show-map" defaultChecked />
              <label htmlFor="show-map" className="text-sm">Show property location on map</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Open House Settings
          </CardTitle>
          <CardDescription>
            Configure open house scheduling and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Default Open House Duration (hours)</label>
              <Input defaultValue="2" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Advance Notice (days)</label>
              <Input defaultValue="3" className="mt-1" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-notify" defaultChecked />
              <label htmlFor="auto-notify" className="text-sm">Auto-notify leads about open houses</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="calendar-sync" defaultChecked />
              <label htmlFor="calendar-sync" className="text-sm">Sync with agent calendars</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgentsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Agent Management
          </CardTitle>
          <CardDescription>
            Configure agent settings and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Max Agents per Agency</label>
              <Input defaultValue="50" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Agent Approval Required</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1">
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="agent-profiles" defaultChecked />
              <label htmlFor="agent-profiles" className="text-sm">Enable public agent profiles</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="agent-reviews" defaultChecked />
              <label htmlFor="agent-reviews" className="text-sm">Allow client reviews for agents</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="agent-commission" defaultChecked />
              <label htmlFor="agent-commission" className="text-sm">Track individual agent commissions</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Agent Performance
          </CardTitle>
          <CardDescription>
            Configure agent performance tracking and metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="track-listings" defaultChecked />
              <label htmlFor="track-listings" className="text-sm">Track listings per agent</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="track-sales" defaultChecked />
              <label htmlFor="track-sales" className="text-sm">Track sales performance</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="track-leads" defaultChecked />
              <label htmlFor="track-leads" className="text-sm">Track lead conversion rates</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="performance-reports" defaultChecked />
              <label htmlFor="performance-reports" className="text-sm">Generate performance reports</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLeadsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Lead Management
          </CardTitle>
          <CardDescription>
            Configure lead capture and management settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Lead Response Time (hours)</label>
              <Input defaultValue="2" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Lead Assignment Method</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1">
                <option>Round Robin</option>
                <option>By Location</option>
                <option>By Specialization</option>
                <option>Manual</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-assign" defaultChecked />
              <label htmlFor="auto-assign" className="text-sm">Auto-assign leads to agents</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="lead-notifications" defaultChecked />
              <label htmlFor="lead-notifications" className="text-sm">Send lead notifications</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="lead-scoring" />
              <label htmlFor="lead-scoring" className="text-sm">Enable lead scoring</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Lead Communication
          </CardTitle>
          <CardDescription>
            Configure automated lead communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="welcome-email" defaultChecked />
              <label htmlFor="welcome-email" className="text-sm">Send welcome email to new leads</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="follow-up" defaultChecked />
              <label htmlFor="follow-up" className="text-sm">Send follow-up emails</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="property-updates" defaultChecked />
              <label htmlFor="property-updates" className="text-sm">Send property updates</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="market-reports" />
              <label htmlFor="market-reports" className="text-sm">Send market reports</label>
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
      case 'listings':
        return renderListingsSettings();
      case 'agents':
        return renderAgentsSettings();
      case 'leads':
        return renderLeadsSettings();
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
          <h1 className="text-3xl font-bold text-gray-900">Real Estate Settings</h1>
          <p className="text-gray-600 mt-1">Configure your real estate business settings and preferences</p>
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
