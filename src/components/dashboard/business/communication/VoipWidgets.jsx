"use client";

import React, { useState } from "react";
import { 
  Phone, User, Clock, FileText, MessageSquare, 
  Calendar, DollarSign, Shield, Users, AlertTriangle,
  CheckCircle, Building, Wrench, Car, UtensilsCrossed,
  ShoppingBag, Cloud, Brain, Eye, Smartphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Progress } from "@components/ui/progress";

/**
 * Quick Actions Widget
 * Common actions agents can take during calls
 */
export function QuickActions({ onAction }) {
  const actions = [
    { id: 'schedule', label: 'Schedule Callback', icon: Calendar, color: 'blue' },
    { id: 'ticket', label: 'Create Ticket', icon: FileText, color: 'green' },
    { id: 'quote', label: 'Generate Quote', icon: DollarSign, color: 'purple' },
    { id: 'dispatch', label: 'Dispatch Tech', icon: Wrench, color: 'orange' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto py-3 px-2 flex flex-col items-center space-y-1"
                onClick={() => onAction?.(action.id)}
              >
                <Icon className={`w-5 h-5 text-${action.color}-600`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Customer History Widget
 * Shows customer's interaction history
 */
export function CustomerHistory({ customer }) {
  const history = [
    {
      id: 1,
      type: 'service',
      title: 'Emergency Plumbing Repair',
      date: '2024-01-15',
      status: 'completed',
      amount: '$350'
    },
    {
      id: 2,
      type: 'call',
      title: 'Follow-up Call',
      date: '2024-01-20',
      status: 'completed',
      duration: '8:32'
    },
    {
      id: 3,
      type: 'quote',
      title: 'Bathroom Renovation Quote',
      date: '2024-02-02',
      status: 'pending',
      amount: '$2,500'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'scheduled': return 'blue';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'service': return Wrench;
      case 'call': return Phone;
      case 'quote': return FileText;
      default: return FileText;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <User className="w-5 h-5 mr-2" />
          Customer History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((item) => {
          const Icon = getTypeIcon(item.type);
          return (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                {item.amount && (
                  <p className="font-semibold text-sm">{item.amount}</p>
                )}
                {item.duration && (
                  <p className="text-xs text-muted-foreground">{item.duration}</p>
                )}
                <Badge variant="outline" className={`text-${getStatusColor(item.status)}-700 bg-${getStatusColor(item.status)}-50`}>
                  {item.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/**
 * Service Intake Form Widget
 * Industry-specific intake forms
 */
export function ServiceIntake({ industry = 'field-service', onSubmit }) {
  const [formData, setFormData] = useState({
    urgency: '',
    serviceType: '',
    description: '',
    location: '',
    preferredTime: ''
  });

  const serviceTypes = {
    'field-service': [
      'Plumbing Repair',
      'Electrical Service', 
      'HVAC Maintenance',
      'General Repair',
      'Emergency Service'
    ],
    'restaurant': [
      'Reservation',
      'Catering Inquiry',
      'Event Booking',
      'Complaint',
      'General Inquiry'
    ],
    'retail': [
      'Product Inquiry',
      'Order Status',
      'Return Request',
      'Technical Support',
      'Store Information'
    ]
  };

  const urgencyLevels = [
    { value: 'low', label: 'Low - Within 1 week', color: 'green' },
    { value: 'medium', label: 'Medium - Within 3 days', color: 'yellow' },
    { value: 'high', label: 'High - Within 24 hours', color: 'orange' },
    { value: 'emergency', label: 'Emergency - ASAP', color: 'red' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Service Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-${level.color}-500`} />
                      <span>{level.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select value={formData.serviceType} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes[industry]?.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the issue or request..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="h-20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Service Location</Label>
          <Input
            id="location"
            placeholder="Enter address or location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>

        <Button onClick={() => onSubmit?.(formData)} className="w-full">
          Create Service Request
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Team Chat Widget
 * Real-time team communication during calls
 */
export function TeamChat({ callId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Sarah (Supervisor)',
      message: 'Customer has history of emergency calls',
      timestamp: '2:34 PM',
      type: 'info'
    },
    {
      id: 2,
      user: 'Mike (Tech)',
      message: 'Available for dispatch if needed',
      timestamp: '2:35 PM',
      type: 'status'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'message'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Team Chat
          <Badge variant="secondary" className="ml-2">3 online</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-48 overflow-y-auto space-y-2 bg-muted/30 rounded-lg p-3">
          {messages.map((message) => (
            <div key={message.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{message.user}</span>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>
              <div className={`text-sm p-2 rounded ${
                message.user === 'You' 
                  ? 'bg-primary text-primary-foreground ml-6' 
                  : 'bg-white dark:bg-gray-800 mr-6'
              }`}>
                {message.message}
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SLA Monitor Widget
 * Tracks service level agreements and response times
 */
export function SLAMonitor({ customerId }) {
  const slaData = {
    responseTime: {
      target: 300, // 5 minutes
      actual: 180, // 3 minutes
      status: 'good'
    },
    resolutionTime: {
      target: 1800, // 30 minutes
      actual: 1200, // 20 minutes  
      status: 'good'
    },
    customerTier: 'Premium',
    escalationTime: 900, // 15 minutes
    timeRemaining: 1320 // 22 minutes
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          SLA Monitor
          <Badge variant={slaData.customerTier === 'Premium' ? 'default' : 'secondary'} className="ml-2">
            {slaData.customerTier}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Response Time</span>
              <span>{formatTime(slaData.responseTime.actual)} / {formatTime(slaData.responseTime.target)}</span>
            </div>
            <Progress 
              value={(slaData.responseTime.actual / slaData.responseTime.target) * 100} 
              className={`h-2 ${slaData.responseTime.status === 'good' ? 'bg-green-100' : 'bg-red-100'}`}
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Resolution Time</span>
              <span>{formatTime(slaData.resolutionTime.actual)} / {formatTime(slaData.resolutionTime.target)}</span>
            </div>
            <Progress 
              value={(slaData.resolutionTime.actual / slaData.resolutionTime.target) * 100} 
              className={`h-2 ${slaData.resolutionTime.status === 'good' ? 'bg-green-100' : 'bg-red-100'}`}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div>
              <p className="text-sm font-medium">Escalation Timer</p>
              <p className="text-xs text-muted-foreground">Auto-escalate in {formatTime(slaData.timeRemaining)}</p>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Weather Forecast Widget  
 * Shows weather for service locations
 */
export function WeatherForecast({ location = "New York, NY" }) {
  const weatherData = {
    current: {
      temp: 72,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 8
    },
    forecast: [
      { time: '2:00 PM', temp: 74, condition: 'sunny' },
      { time: '3:00 PM', temp: 76, condition: 'cloudy' },
      { time: '4:00 PM', temp: 73, condition: 'rainy' },
      { time: '5:00 PM', temp: 70, condition: 'cloudy' }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          Weather Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{weatherData.current.temp}°F</div>
          <div className="text-sm text-muted-foreground">{weatherData.current.condition}</div>
          <div className="text-xs text-muted-foreground">{location}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex justify-between">
            <span>Humidity:</span>
            <span>{weatherData.current.humidity}%</span>
          </div>
          <div className="flex justify-between">
            <span>Wind:</span>
            <span>{weatherData.current.windSpeed} mph</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Next 4 Hours</h4>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {weatherData.forecast.map((hour, index) => (
              <div key={index} className="space-y-1">
                <div>{hour.time}</div>
                <div className="text-lg">☀️</div>
                <div>{hour.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main widget container component
export function VoipWidgets({ 
  industry = 'field-service',
  customerId,
  callId,
  customer,
  onWidgetAction 
}) {
  const [activeWidgets, setActiveWidgets] = useState([
    'quickActions',
    'customerHistory', 
    'serviceIntake',
    'teamChat'
  ]);

  const availableWidgets = {
    quickActions: QuickActions,
    customerHistory: CustomerHistory,
    serviceIntake: ServiceIntake,
    teamChat: TeamChat,
    slaMonitor: SLAMonitor,
    weatherForecast: WeatherForecast
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {activeWidgets.map((widgetId) => {
        const WidgetComponent = availableWidgets[widgetId];
        if (!WidgetComponent) return null;
        
        return (
          <WidgetComponent
            key={widgetId}
            industry={industry}
            customerId={customerId}
            callId={callId}
            customer={customer}
            onAction={onWidgetAction}
            onSubmit={onWidgetAction}
          />
        );
      })}
    </div>
  );
}