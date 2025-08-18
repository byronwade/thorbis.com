'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { 
  Building2, 
  MapPin, 
  Clock, 
  Users, 
  Wrench, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Star,
  Shield,
  Calendar,
  DollarSign
} from "lucide-react";
import { useAuthStore } from '@store/use-auth-store';

/**
 * Business Setup Onboarding for Thorbis Platform
 * Multi-step onboarding process for field service businesses
 */
export default function BusinessSetupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    businessName: '',
    businessType: '',
    description: '',
    
    // Location
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceRadius: '',
    
    // Contact
    phone: '',
    email: '',
    website: '',
    
    // Services
    primaryServices: [],
    serviceCategories: [],
    hourlyRate: '',
    emergencyService: false,
    
    // Operations
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: true }
    },
    teamSize: '',
    equipmentList: [],
    
    // Verification
    businessLicense: null,
    insurance: null,
    certifications: [],
    
    // Platform Features
    enableBooking: true,
    enableQuotes: true,
    enablePayments: true,
    enableScheduling: true
  });

  const businessTypes = [
    'Plumbing', 'Electrical', 'HVAC', 'Handyman', 'Cleaning',
    'Landscaping', 'Roofing', 'Painting', 'Flooring', 'Kitchen & Bath',
    'Pest Control', 'Security Systems', 'Appliance Repair', 'Other'
  ];

  const serviceCategories = [
    'Emergency Services', 'Residential', 'Commercial', 'New Construction',
    'Repairs & Maintenance', 'Installations', 'Inspections', 'Consultations'
  ];

  const steps = [
    { number: 1, title: 'Basic Information', icon: Building2 },
    { number: 2, title: 'Location & Service Area', icon: MapPin },
    { number: 3, title: 'Services & Pricing', icon: Wrench },
    { number: 4, title: 'Operations Setup', icon: Clock },
    { number: 5, title: 'Verification', icon: Shield },
    { number: 6, title: 'Platform Features', icon: Star }
  ];

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Submit business setup data
      const response = await fetch('/api/business/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard/field-management');
      } else {
        console.error('Failed to setup business');
      }
    } catch (error) {
      console.error('Error setting up business:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tell us about your business</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Business Name *</label>
            <Input
              value={formData.businessName}
              onChange={(e) => updateFormData({ businessName: e.target.value })}
              placeholder="Enter your business name"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Business Type *</label>
            <Select value={formData.businessType} onValueChange={(value) => updateFormData({ businessType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Business Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Describe your services and what makes your business unique"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Location & Service Area</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Business Address *</label>
            <Input
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="Street address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">City *</label>
              <Input
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">State *</label>
              <Input
                value={formData.state}
                onChange={(e) => updateFormData({ state: e.target.value })}
                placeholder="State"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ZIP Code *</label>
              <Input
                value={formData.zipCode}
                onChange={(e) => updateFormData({ zipCode: e.target.value })}
                placeholder="ZIP code"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Service Radius (miles)</label>
              <Select value={formData.serviceRadius} onValueChange={(value) => updateFormData({ serviceRadius: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100+ miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Phone *</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="business@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => updateFormData({ website: e.target.value })}
                placeholder="www.yourbusiness.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Services & Pricing</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Service Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {serviceCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={formData.serviceCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData({ 
                          serviceCategories: [...formData.serviceCategories, category]
                        });
                      } else {
                        updateFormData({ 
                          serviceCategories: formData.serviceCategories.filter(c => c !== category)
                        });
                      }
                    }}
                  />
                  <label htmlFor={category} className="text-sm">{category}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Starting Hourly Rate</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => updateFormData({ hourlyRate: e.target.value })}
                  placeholder="75"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="emergency"
                checked={formData.emergencyService}
                onCheckedChange={(checked) => updateFormData({ emergencyService: checked })}
              />
              <label htmlFor="emergency" className="text-sm">24/7 Emergency Service</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Operations Setup</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Business Hours</label>
            <div className="space-y-2">
              {Object.entries(formData.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium capitalize">{day}</div>
                  <Checkbox
                    checked={!hours.closed}
                    onCheckedChange={(checked) => {
                      updateFormData({
                        businessHours: {
                          ...formData.businessHours,
                          [day]: { ...hours, closed: !checked }
                        }
                      });
                    }}
                  />
                  {!hours.closed && (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => {
                          updateFormData({
                            businessHours: {
                              ...formData.businessHours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          });
                        }}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => {
                          updateFormData({
                            businessHours: {
                              ...formData.businessHours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          });
                        }}
                        className="w-32"
                      />
                    </>
                  )}
                  {hours.closed && <span className="text-muted-foreground">Closed</span>}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Team Size</label>
            <Select value={formData.teamSize} onValueChange={(value) => updateFormData({ teamSize: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Just me</SelectItem>
                <SelectItem value="2-5">2-5 employees</SelectItem>
                <SelectItem value="6-10">6-10 employees</SelectItem>
                <SelectItem value="11-25">11-25 employees</SelectItem>
                <SelectItem value="25+">25+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Business Verification</h3>
                    <p className="text-muted-foreground mb-6">Upload your business documents to get verified and build customer trust</p>
        
        <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Business License</p>
            <Button variant="outline" size="sm">Upload License</Button>
          </div>
          
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Insurance Certificate</p>
            <Button variant="outline" size="sm">Upload Insurance</Button>
          </div>
          
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Professional Certifications</p>
            <Button variant="outline" size="sm">Upload Certifications</Button>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Why verify your business?</p>
              <p className="text-sm text-blue-700 mt-1">
                Verified businesses get a trust badge, appear higher in search results, and customers are 3x more likely to book verified providers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Platform Features</h3>
                    <p className="text-muted-foreground mb-6">Choose which Thorbis features to enable for your business</p>
        
        <div className="space-y-4">
          <Card className={formData.enableBooking ? "border-blue-500 bg-blue-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Online Booking</h4>
                    <p className="text-sm text-muted-foreground">Let customers book services directly</p>
                  </div>
                </div>
                <Checkbox
                  checked={formData.enableBooking}
                  onCheckedChange={(checked) => updateFormData({ enableBooking: checked })}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className={formData.enableQuotes ? "border-blue-500 bg-blue-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Digital Quotes</h4>
                    <p className="text-sm text-muted-foreground">Send professional quotes instantly</p>
                  </div>
                </div>
                <Checkbox
                  checked={formData.enableQuotes}
                  onCheckedChange={(checked) => updateFormData({ enableQuotes: checked })}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className={formData.enablePayments ? "border-blue-500 bg-blue-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Payment Processing</h4>
                    <p className="text-sm text-muted-foreground">Accept payments online securely</p>
                  </div>
                </div>
                <Checkbox
                  checked={formData.enablePayments}
                  onCheckedChange={(checked) => updateFormData({ enablePayments: checked })}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className={formData.enableScheduling ? "border-blue-500 bg-blue-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium">Team Scheduling</h4>
                    <p className="text-sm text-muted-foreground">Manage team schedules and dispatch</p>
                  </div>
                </div>
                <Checkbox
                  checked={formData.enableScheduling}
                  onCheckedChange={(checked) => updateFormData({ enableScheduling: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.businessType;
      case 2:
        return formData.address && formData.city && formData.state && formData.zipCode && formData.phone && formData.email;
      case 3:
        return formData.serviceCategories.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Set Up Your Business</h1>
            <Badge variant="secondary">Step {currentStep} of {steps.length}</Badge>
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-border bg-card text-muted-foreground'}
                  `}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`ml-4 w-8 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {currentStep === steps.length ? 'Complete Setup' : 'Next'}
            {currentStep < steps.length && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
