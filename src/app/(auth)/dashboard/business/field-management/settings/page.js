"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { 
  Settings, Wrench, Users, DollarSign, Calendar, Package, Truck, MapPin, 
  Bell, Shield, Database, Globe, Mail, Phone, FileText, Target, Building2, 
  Clock, Receipt, Calculator, TrendingUp, Download, Upload, Save, X,
  CheckCircle, AlertCircle, Info
} from 'lucide-react';

export default function FieldManagementSettings() {
  const [activeTab, setActiveTab] = useState('general');
  
  const settingsTabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'operations', name: 'Operations', icon: Wrench },
    { id: 'scheduling', name: 'Scheduling', icon: Calendar },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'fleet', name: 'Fleet', icon: Truck },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'communication', name: 'Communication', icon: Mail },
    { id: 'safety', name: 'Safety & Compliance', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Globe },
    { id: 'advanced', name: 'Advanced', icon: Database }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Basic company details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <Input defaultValue="Acme Field Services" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Business Type</label>
              <Input defaultValue="Field Service" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input defaultValue="(555) 123-4567" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue="info@acmefield.com" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input defaultValue="123 Service Street, City, State 12345" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
          <CardDescription>Set your operating hours and availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Monday - Friday</label>
              <Input defaultValue="8:00 AM - 6:00 PM" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Saturday</label>
              <Input defaultValue="9:00 AM - 4:00 PM" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Sunday</label>
              <Input defaultValue="Emergency Only" className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="emergency" defaultChecked />
            <label htmlFor="emergency" className="text-sm">24/7 Emergency Service Available</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Service Areas
          </CardTitle>
          <CardDescription>Define your service coverage areas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Primary Service Area</label>
              <Input defaultValue="Metropolitan Area" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Service Radius (miles)</label>
              <Input defaultValue="50" type="number" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Covered ZIP Codes</label>
            <textarea 
              defaultValue="10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10010"
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOperationsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Service Types
          </CardTitle>
          <CardDescription>Configure your service offerings and categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Primary Services</label>
              <div className="mt-2 space-y-2">
                {['Plumbing', 'HVAC', 'Electrical', 'General Maintenance'].map(service => (
                  <div key={service} className="flex items-center gap-2">
                    <input type="checkbox" id={service} defaultChecked />
                    <label htmlFor={service} className="text-sm">{service}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Emergency Services</label>
              <div className="mt-2 space-y-2">
                {['24/7 Emergency Calls', 'Weekend Service', 'Holiday Service'].map(service => (
                  <div key={service} className="flex items-center gap-2">
                    <input type="checkbox" id={service} defaultChecked />
                    <label htmlFor={service} className="text-sm">{service}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
          <CardDescription>Configure team roles and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Technician Roles</label>
              <div className="mt-2 space-y-2">
                {['Lead Technician', 'Technician', 'Apprentice', 'Helper'].map(role => (
                  <div key={role} className="flex items-center gap-2">
                    <input type="checkbox" id={role} defaultChecked />
                    <label htmlFor={role} className="text-sm">{role}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Specializations</label>
              <div className="mt-2 space-y-2">
                {['Plumbing', 'HVAC', 'Electrical', 'General'].map(spec => (
                  <div key={spec} className="flex items-center gap-2">
                    <input type="checkbox" id={spec} defaultChecked />
                    <label htmlFor={spec} className="text-sm">{spec}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Work Order Settings
          </CardTitle>
          <CardDescription>Configure work order templates and workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Default Priority Levels</label>
              <div className="mt-2 space-y-2">
                {['Emergency', 'High', 'Medium', 'Low'].map(priority => (
                  <div key={priority} className="flex items-center gap-2">
                    <input type="checkbox" id={priority} defaultChecked />
                    <label htmlFor={priority} className="text-sm">{priority}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Work Order Status</label>
              <div className="mt-2 space-y-2">
                {['Scheduled', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                  <div key={status} className="flex items-center gap-2">
                    <input type="checkbox" id={status} defaultChecked />
                    <label htmlFor={status} className="text-sm">{status}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSchedulingSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduling Preferences
          </CardTitle>
          <CardDescription>Configure scheduling rules and time slots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Time Slot Duration</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>30 minutes</option>
                <option selected>1 hour</option>
                <option>2 hours</option>
                <option>4 hours</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Buffer Time Between Jobs</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>0 minutes</option>
                <option selected>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Maximum Jobs Per Day</label>
              <Input defaultValue="8" type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Advance Booking (days)</label>
              <Input defaultValue="30" type="number" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Optimization
          </CardTitle>
          <CardDescription>Configure route planning and optimization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Optimization Method</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Distance</option>
                <option>Time</option>
                <option>Fuel Efficiency</option>
                <option>Customer Priority</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Traffic Consideration</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Real-time</option>
                <option>Historical</option>
                <option>None</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="route_optimization" defaultChecked />
            <label htmlFor="route_optimization" className="text-sm">Enable automatic route optimization</label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventorySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Management
          </CardTitle>
          <CardDescription>Configure inventory tracking and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Low Stock Alert Threshold</label>
              <Input defaultValue="5" type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Reorder Point</label>
              <Input defaultValue="3" type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Inventory Update Frequency</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Daily</option>
                <option selected>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Auto-reorder Enabled</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Supplier Management
          </CardTitle>
          <CardDescription>Configure supplier relationships and ordering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Preferred Suppliers</label>
              <div className="mt-2 space-y-2">
                {['ABC Supply Co.', 'XYZ Parts', 'Quality Tools Inc.'].map(supplier => (
                  <div key={supplier} className="flex items-center gap-2">
                    <input type="checkbox" id={supplier} defaultChecked />
                    <label htmlFor={supplier} className="text-sm">{supplier}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Order Lead Time (days)</label>
              <Input defaultValue="3" type="number" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFleetSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Fleet Management
          </CardTitle>
          <CardDescription>Configure vehicle tracking and maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">GPS Tracking</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Maintenance Reminders</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Fuel Tracking</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Vehicle Inspection Schedule</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Monthly</option>
                <option selected>Quarterly</option>
                <option>Semi-annually</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomersSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Management
          </CardTitle>
          <CardDescription>Configure customer communication and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Customer Portal</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Online Booking</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Customer Reviews</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Loyalty Program</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Enabled</option>
                <option selected>Disabled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinancialSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Billing & Pricing
          </CardTitle>
          <CardDescription>Configure billing rates and payment settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Hourly Rate</label>
              <Input defaultValue="85.00" type="number" step="0.01" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Emergency Rate</label>
              <Input defaultValue="125.00" type="number" step="0.01" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Minimum Service Charge</label>
              <Input defaultValue="50.00" type="number" step="0.01" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Travel Fee (per mile)</label>
              <Input defaultValue="2.50" type="number" step="0.01" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice Settings
          </CardTitle>
          <CardDescription>Configure invoice templates and payment terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Payment Terms</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Net 15</option>
                <option selected>Net 30</option>
                <option>Net 60</option>
                <option>Due on Receipt</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Late Fee Percentage</label>
              <Input defaultValue="1.5" type="number" step="0.1" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Auto-invoice Generation</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Invoice Numbering</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Sequential</option>
                <option>Date-based</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunicationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Communication Preferences
          </CardTitle>
          <CardDescription>Configure customer communication settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Appointment Reminders</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>1 hour before</option>
                <option selected>2 hours before</option>
                <option>1 day before</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Follow-up Messages</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">SMS Notifications</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Email Notifications</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSafetySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Safety & Compliance
          </CardTitle>
          <CardDescription>Configure safety protocols and compliance requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Safety Training Required</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Annually</option>
                <option>Semi-annually</option>
                <option>Quarterly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Insurance Expiry Alerts</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>30 days</option>
                <option selected>60 days</option>
                <option>90 days</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">OSHA Compliance</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Incident Reporting</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Required</option>
                <option>Optional</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Third-Party Integrations
          </CardTitle>
          <CardDescription>Connect with external services and platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">QuickBooks Integration</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Connected</option>
                <option>Disconnected</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Stripe Payment Processing</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Connected</option>
                <option>Disconnected</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Google Calendar</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Connected</option>
                <option>Disconnected</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Slack Notifications</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Connected</option>
                <option selected>Disconnected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Advanced data and system settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Data Backup Frequency</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Daily</option>
                <option selected>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Data Retention (years)</label>
              <Input defaultValue="7" type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">API Access</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option selected>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Debug Mode</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Enabled</option>
                <option selected>Disabled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import/Export
          </CardTitle>
          <CardDescription>Data import and export options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'operations':
        return renderOperationsSettings();
      case 'scheduling':
        return renderSchedulingSettings();
      case 'inventory':
        return renderInventorySettings();
      case 'fleet':
        return renderFleetSettings();
      case 'customers':
        return renderCustomersSettings();
      case 'financial':
        return renderFinancialSettings();
      case 'communication':
        return renderCommunicationSettings();
      case 'safety':
        return renderSafetySettings();
      case 'integrations':
        return renderIntegrationsSettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Field Management Settings</h1>
          <p className="text-muted-foreground">Configure your field service business operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8 overflow-x-auto">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
