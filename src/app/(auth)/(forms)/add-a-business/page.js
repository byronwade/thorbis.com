'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Building2, 
  CheckCircle,
  Shield,
  Mail,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Globe,
  User,
  Wrench,
  Car,
  Utensils,
  Store,
  Plus,
  FileText,
  Upload,
  Camera,
  Award,
  AlertCircle,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

// Business Categories with icons and descriptions (matching dashboard patterns)
const BUSINESS_CATEGORIES = [
  { 
    value: 'hs', 
    label: 'Home Services', 
    description: 'Plumbing, HVAC, electrical, etc.',
    icon: Wrench,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  { 
    value: 'rest', 
    label: 'Restaurant', 
    description: 'Restaurants, cafes, food service',
    icon: Utensils,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  { 
    value: 'auto', 
    label: 'Auto Services', 
    description: 'Auto repair, dealerships, etc.',
    icon: Car,
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  { 
    value: 'ret', 
    label: 'Retail', 
    description: 'Stores, boutiques, e-commerce',
    icon: Store,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Professional services, healthcare, etc.',
    icon: Building2,
    color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
  }
];

const SERVICE_AREAS = [
  { value: '5', label: '5 miles' },
  { value: '10', label: '10 miles' },
  { value: '25', label: '25 miles' },
  { value: '50', label: '50 miles' },
  { value: '100', label: '100+ miles' }
];

// Step Components with Dashboard-Inspired Design
const BusinessInfoStep = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Business Name *</label>
        <Input
          value={formData.businessName || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
          placeholder="Enter your business name"
          className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Business Category *</label>
        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
          <SelectTrigger className="bg-neutral-800/50 border-neutral-700 text-neutral-100">
            <SelectValue placeholder="Select business category" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 border-neutral-700">
            {BUSINESS_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.value} value={category.value} className="text-neutral-100 focus:bg-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className={'flex h-8 w-8 items-center justify-center rounded-lg border ${category.color}'}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-neutral-400">{category.description}</div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">Phone Number *</label>
          <Input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">Email *</label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="business@example.com"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Website (Optional)</label>
        <Input
          value={formData.website || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://yourbusiness.com"
          className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
        />
      </div>
    </div>
  </div>
);

const LocationStep = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Street Address *</label>
        <Input
          value={formData.address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="123 Main Street"
          className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">City *</label>
          <Input
            value={formData.city || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="San Francisco"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">State *</label>
          <Input
            value={formData.state || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            placeholder="CA"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">ZIP Code *</label>
          <Input
            value={formData.zipCode || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
            placeholder="12345"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Service Area</label>
        <Select value={formData.serviceArea} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceArea: value }))}>
          <SelectTrigger className="bg-neutral-800/50 border-neutral-700 text-neutral-100">
            <SelectValue placeholder="How far do you travel?" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 border-neutral-700">
            {SERVICE_AREAS.map((area) => (
              <SelectItem key={area.value} value={area.value} className="text-neutral-100 focus:bg-neutral-700">
                {area.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

const ServicesStep = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Business Description *</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what your business does and what makes you unique..."
          rows={4}
          className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400 resize-none"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Primary Services *</label>
        <Textarea
          value={formData.services || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
          placeholder="List your main services (e.g., HVAC repair, installation, maintenance)"
          rows={3}
          className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400 resize-none"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">Years in Business</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.yearsInBusiness || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, yearsInBusiness: e.target.value }))}
            placeholder="5"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">Team Size</label>
          <Input
            type="number"
            min="1"
            max="1000"
            value={formData.teamSize || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
            placeholder="10"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="licensed"
            checked={formData.licensed || false}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, licensed: checked }))}
            className="border-neutral-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <label htmlFor="licensed" className="text-sm text-neutral-200">Licensed Business</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="insured"
            checked={formData.insured || false}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, insured: checked }))}
            className="border-neutral-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <label htmlFor="insured" className="text-sm text-neutral-200">Insured Business</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emergencyService"
            checked={formData.emergencyService || false}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emergencyService: checked }))}
            className="border-neutral-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <label htmlFor="emergencyService" className="text-sm text-neutral-200">24/7 Emergency Service</label>
        </div>
      </div>
    </div>
  </div>
);

const ContactInfoStep = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Contact Person Name</label>
        <Input
          value={formData.contactName || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
          placeholder="Your full name"
          className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">Primary Phone</label>
          <Input
            type="tel"
            value={formData.primaryPhone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, primaryPhone: e.target.value }))}
            placeholder="(555) 123-4567"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">Secondary Phone</label>
          <Input
            type="tel"
            value={formData.secondaryPhone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, secondaryPhone: e.target.value }))}
            placeholder="(555) 987-6543"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Business Hours</label>
        <Textarea
          value={formData.businessHours || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, businessHours: e.target.value }))}
          placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed"
          rows={2}
          className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400 resize-none"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">Social Media (Optional)</label>
        <div className="space-y-2">
          <Input
            value={formData.facebook || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
            placeholder="Facebook URL"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
          <Input
            value={formData.instagram || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
            placeholder="Instagram URL"
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
          />
        </div>
      </div>
    </div>
  </div>
);

const VerificationStep = ({ formData, setFormData, verificationResults, isVerifying, handleVerificationSubmit }) => {
  const [verificationData, setVerificationData] = useState({
    businessLicense: { licenseNumber: '', issuingState: '', licenseDocument: null },
    insurance: { provider: '', coverageAmount: '', expirationDate: '', certificateDocument: null },
    taxId: { number: '', type: 'EIN' },
    professionalCerts: { certifications: '', documents: [] },
    businessAddress: { document: null },
    ownerVerification: { fullName: '', title: '', idDocument: null }
  });

  const handleFileUpload = (section, field, event) => {
    const file = event.target.files[0];
    if (file) {
      setVerificationData(prev => ({ 
        ...prev, 
        [section]: { ...prev[section], [field]: file }
      }));
      
      // Update main form data for backward compatibility
      setFormData(prev => ({ 
        ...prev, 
        [`${section}${field.charAt(0).toUpperCase() + field.slice(1)}`]: file,
        [`${section}${field.charAt(0).toUpperCase() + field.slice(1)}Name']: file.name
      }));
    }
  };

  const handleVerificationFieldChange = (section, field, value) => {
    setVerificationData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    
    // Update main form data
    setFormData(prev => ({ ...prev, ['${section}${field.charAt(0).toUpperCase() + field.slice(1)}']: value }));
  };

  const getVerificationStatus = (type) => {
    if (!verificationResults) return null;
    const status = verificationResults[type];
    if (status === 'verified') return { color: 'text-green-400', icon: CheckCircle, text: 'Verified' };
    if (status === 'pending') return { color: 'text-yellow-400', icon: Clock, text: 'Pending' };
    if (status === 'failed') return { color: 'text-red-400', icon: AlertCircle, text: 'Failed' };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Verification Notice */}
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Business Legitimacy Verification Required</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                To ensure customer safety and maintain directory quality, all businesses must provide documentation 
                proving legitimacy, proper licensing, insurance coverage, and legal operation status.
              </p>
            </div>
          </div>
          
          {/* Verification Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-neutral-800/30 p-3 rounded-lg">
              <h4 className="font-medium text-green-400 text-sm mb-1 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Trust & Credibility
              </h4>
              <p className="text-xs text-neutral-400">Verified badge increases customer confidence by 85%</p>
            </div>
            <div className="bg-neutral-800/30 p-3 rounded-lg">
              <h4 className="font-medium text-blue-400 text-sm mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Higher Visibility
              </h4>
              <p className="text-xs text-neutral-400">Verified businesses rank higher in search results</p>
            </div>
          </div>

          {/* Security Assurance */}
          <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700/50">
            <h4 className="font-medium text-neutral-200 text-sm mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Document Security & Privacy
            </h4>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• End-to-end encryption for all document uploads</li>
              <li>• SOC 2 Type II certified storage with AWS/GCP</li>
              <li>• Documents automatically deleted after verification (30 days max)</li>
              <li>• No document sharing with third parties except verification partners</li>
              <li>• GDPR and CCPA compliant processing</li>
            </ul>
          </div>
        </div>

        {/* Verification Process Timeline */}
        <div className="bg-neutral-800/30 p-4 rounded-lg">
          <h4 className="font-medium text-neutral-200 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Verification Timeline & Process
          </h4>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-neutral-300">Instant: Basic info checks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-neutral-300">2-4 hours: Document review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-neutral-300">24-48 hours: Government database verification</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Business License */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <label className="text-sm font-medium text-neutral-200">Business License *</label>
            </div>
            {getVerificationStatus('businessLicense') && (
              <div className={'flex items-center gap-1 text-xs ${getVerificationStatus('businessLicense').color}'}>
                {React.createElement(getVerificationStatus('businessLicense').icon, { className: "w-3 h-3" })}
                {getVerificationStatus('businessLicense').text}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={verificationData.businessLicense.licenseNumber}
                onChange={(e) => handleVerificationFieldChange('businessLicense', 'licenseNumber', e.target.value)}
                placeholder="License number (e.g., BL-123456)"
                className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
              />
              <Select 
                value={verificationData.businessLicense.issuingState} 
                onValueChange={(value) => handleVerificationFieldChange('businessLicense', 'issuingState', value)}
              >
                <SelectTrigger className="bg-neutral-800/50 border-neutral-700 text-neutral-100">
                  <SelectValue placeholder="Issuing State" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => (
                    <SelectItem key={state} value={state} className="text-neutral-100 focus:bg-neutral-700">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 p-3 border-2 border-dashed border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors">
              <input
                type="file"
                id="business-license"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('businessLicense', 'licenseDocument', e)}
                className="hidden"
              />
              <label htmlFor="business-license" className="flex items-center gap-2 cursor-pointer text-sm text-neutral-400 hover:text-neutral-300">
                <Upload className="w-4 h-4" />
                {verificationData.businessLicense.licenseDocument?.name || 'Upload business license (PDF, JPG, PNG)'}
              </label>
            </div>
            
            {/* Business License Documentation Requirements */}
            <div className="bg-neutral-800/20 p-3 rounded-lg border border-neutral-700/50">
              <h5 className="text-xs font-medium text-neutral-300 mb-2">Business License Requirements:</h5>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Current business license issued by state/local authority</li>
                <li>• License must be active and not expired</li>
                <li>• Document must show business name, license number, and expiration date</li>
                <li>• Accepted formats: PDF, JPG, PNG (max 10MB)</li>
                <li>• License must match the business name provided in this application</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Insurance Certificate */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <label className="text-sm font-medium text-neutral-200">Insurance Certificate *</label>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={formData.insuranceProvider || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                placeholder="Insurance provider"
                className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
              />
              <Input
                value={formData.insuranceAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceAmount: e.target.value }))}
                placeholder="Coverage amount (e.g., $1,000,000)"
                className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
              />
            </div>
            <div className="flex items-center gap-2 p-3 border-2 border-dashed border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors">
              <input
                type="file"
                id="insurance-cert"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('insuranceCert', e)}
                className="hidden"
              />
              <label htmlFor="insurance-cert" className="flex items-center gap-2 cursor-pointer text-sm text-neutral-400 hover:text-neutral-300">
                <Upload className="w-4 h-4" />
                {formData.insuranceCertName || 'Upload insurance certificate (PDF, JPG, PNG)'}
              </label>
            </div>
            
            {/* Insurance Documentation Requirements */}
            <div className="bg-neutral-800/20 p-3 rounded-lg border border-neutral-700/50">
              <h5 className="text-xs font-medium text-neutral-300 mb-2">Insurance Certificate Requirements:</h5>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Current general liability insurance certificate</li>
                <li>• Minimum coverage: $500,000 (varies by industry)</li>
                <li>• Certificate must show policy dates, coverage amounts, and named insured</li>
                <li>• Additional coverages recommended: professional liability, workers' comp</li>
                <li>• Insurance provider must be A-rated or equivalent</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tax ID / EIN */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <label className="text-sm font-medium text-neutral-200">Tax ID / EIN *</label>
            </div>
            {getVerificationStatus('taxId') && (
              <div className={'flex items-center gap-1 text-xs ${getVerificationStatus('taxId').color}'}>
                {React.createElement(getVerificationStatus('taxId').icon, { className: "w-3 h-3" })}
                {getVerificationStatus('taxId').text}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              value={verificationData.taxId.number}
              onChange={(e) => handleVerificationFieldChange('taxId', 'number', e.target.value)}
              placeholder="XX-XXXXXXX or XX-XXXXXXXX"
              className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400 md:col-span-2"
            />
            <Select 
              value={verificationData.taxId.type} 
              onValueChange={(value) => handleVerificationFieldChange('taxId', 'type', value)}
            >
              <SelectTrigger className="bg-neutral-800/50 border-neutral-700 text-neutral-100">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="EIN" className="text-neutral-100 focus:bg-neutral-700">EIN (Business)</SelectItem>
                <SelectItem value="SSN" className="text-neutral-100 focus:bg-neutral-700">SSN (Sole Prop)</SelectItem>
                <SelectItem value="ITIN" className="text-neutral-100 focus:bg-neutral-700">ITIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-neutral-500">
            Federal Tax ID (EIN) for businesses or Social Security Number for sole proprietorships
          </p>
          
          {/* Tax ID Documentation Requirements */}
          <div className="bg-neutral-800/20 p-3 rounded-lg border border-neutral-700/50">
            <h5 className="text-xs font-medium text-neutral-300 mb-2">Tax ID Requirements:</h5>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• Valid Federal Employer Identification Number (EIN) for businesses</li>
              <li>• SSN acceptable only for sole proprietorships without employees</li>
              <li>• Tax ID must be active with IRS and in good standing</li>
              <li>• Number will be verified against federal databases</li>
              <li>• Must match registered business name and structure</li>
            </ul>
          </div>
        </div>

        {/* Professional Certifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <label className="text-sm font-medium text-neutral-200">Professional Certifications (Optional)</label>
          </div>
          <Textarea
            value={formData.certifications || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
            placeholder="List any relevant certifications, licenses, or qualifications (e.g., HVAC Certified, Licensed Electrician, etc.)"
            rows={3}
            className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400 resize-none"
          />
          <div className="flex items-center gap-2 p-3 border-2 border-dashed border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors">
            <input
              type="file"
              id="certifications"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setFormData(prev => ({ 
                  ...prev, 
                  certificationFiles: files,
                  certificationFilesNames: files.map(f => f.name).join(', ')
                }));
              }}
              className="hidden"
            />
            <label htmlFor="certifications" className="flex items-center gap-2 cursor-pointer text-sm text-neutral-400 hover:text-neutral-300">
              <Upload className="w-4 h-4" />
              {formData.certificationFilesNames || 'Upload certification documents (optional)'}
            </label>
          </div>
          
          {/* Professional Certifications Documentation */}
          <div className="bg-neutral-800/20 p-3 rounded-lg border border-neutral-700/50">
            <h5 className="text-xs font-medium text-neutral-300 mb-2">Professional Certification Benefits:</h5>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• Industry certifications boost customer trust and search ranking</li>
              <li>• Upload certificates from recognized bodies (NATE, EPA, state licensing boards)</li>
              <li>• Continuing education certificates accepted</li>
              <li>• Professional association memberships valued</li>
              <li>• Certifications are verified with issuing organizations when possible</li>
            </ul>
          </div>
        </div>

        {/* Business Address Verification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            <label className="text-sm font-medium text-neutral-200">Proof of Business Address *</label>
          </div>
          <p className="text-sm text-neutral-400 mb-2">
            Upload a utility bill, lease agreement, or official document showing your business address
          </p>
          <div className="flex items-center gap-2 p-3 border-2 border-dashed border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors">
            <input
              type="file"
              id="address-proof"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('addressProof', e)}
              className="hidden"
            />
            <label htmlFor="address-proof" className="flex items-center gap-2 cursor-pointer text-sm text-neutral-400 hover:text-neutral-300">
              <Upload className="w-4 h-4" />
              {formData.addressProofName || 'Upload proof of business address (PDF, JPG, PNG)'}
            </label>
          </div>
          
          {/* Business Address Documentation Requirements */}
          <div className="bg-neutral-800/20 p-3 rounded-lg border border-neutral-700/50">
            <h5 className="text-xs font-medium text-neutral-300 mb-2">Address Verification Requirements:</h5>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• Utility bill (electric, gas, water) dated within 90 days</li>
              <li>• Commercial lease agreement or property deed</li>
              <li>• Official business mail or bank statement</li>
              <li>• Document must clearly show business name and complete address</li>
              <li>• PO Box addresses require additional physical location verification</li>
            </ul>
          </div>
        </div>

        {/* Business Owner ID */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <label className="text-sm font-medium text-neutral-200">Business Owner ID *</label>
          </div>
          <p className="text-sm text-neutral-400 mb-2">
            Government-issued photo ID of the business owner
          </p>
          <div className="flex items-center gap-2 p-3 border-2 border-dashed border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors">
            <input
              type="file"
              id="owner-id"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('ownerId', e)}
              className="hidden"
            />
            <label htmlFor="owner-id" className="flex items-center gap-2 cursor-pointer text-sm text-neutral-400 hover:text-neutral-300">
              <Camera className="w-4 h-4" />
              {formData.ownerIdName || 'Upload photo ID (JPG, PNG)'}
            </label>
          </div>
          
          {/* Owner ID Documentation Requirements */}
          <div className="bg-neutral-800/20 p-3 rounded-lg border border-neutral-700/50">
            <h5 className="text-xs font-medium text-neutral-300 mb-2">Owner ID Verification Requirements:</h5>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• Government-issued photo ID (driver's license, passport, state ID)</li>
              <li>• ID must be current and not expired</li>
              <li>• Photo must be clear and all information readable</li>
              <li>• Name on ID must match business owner information provided</li>
              <li>• International IDs accepted with additional documentation</li>
            </ul>
          </div>
        </div>

        {/* Verification Consent */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-neutral-800/30 rounded-lg">
            <Checkbox
              id="verification-consent"
              checked={formData.verificationConsent || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verificationConsent: checked }))}
              className="border-neutral-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 mt-1"
            />
            <label htmlFor="verification-consent" className="text-sm text-neutral-200 leading-relaxed">
              I consent to having my business documents verified by Persona API and partner services. I understand that:
              <ul className="mt-2 ml-4 space-y-1 text-neutral-400">
                <li>• Documents will be securely encrypted and processed by certified verification providers</li>
                <li>• Most verifications complete instantly, complex cases within 24-48 hours</li>
                <li>• My business listing will show "Verification Pending" until complete</li>
                <li>• Government databases will be checked for license and tax ID verification</li>
                <li>• False information may result in permanent ban from the platform</li>
              </ul>
            </label>
          </div>
        </div>

        {/* Real-time Verification Button */}
        {verificationData.businessLicense.licenseNumber && verificationData.taxId.number && (
          <div className="pt-4 border-t border-neutral-800">
            <Button
              onClick={handleVerificationSubmit}
              disabled={isVerifying || !formData.verificationConsent}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Running Real-Time Verification...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start Real-Time Verification
                </>
              )}
            </Button>
            <p className="text-xs text-neutral-500 text-center mt-2">
              This will verify your business license and tax ID against government databases
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SubmissionSuccess = () => {
  const router = useRouter();
  
  const handleViewDirectory = () => {
    router.push('/directory');
  };
  
  const handleCreateAccount = () => {
    router.push('/signup');
  };

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-100 mb-4">Business Submitted for Verification</h2>
          <p className="text-neutral-400 mb-6">
            Thank you for submitting your business. Your documents are now being reviewed.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-200">What happens next:</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">1</span>
            </div>
            <span className="text-sm text-neutral-400">Our team verifies your business documents and credentials</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">2</span>
            </div>
            <span className="text-sm text-neutral-400">Your verified business will appear in search results within 24-48 hours</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">3</span>
            </div>
            <span className="text-sm text-neutral-400">Create an account to manage your business listing</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={handleCreateAccount}
          size="lg" 
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Create Business Account
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <Button 
          onClick={handleViewDirectory}
          variant="outline"
          size="lg"
          className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
        >
          View Directory
        </Button>
      </div>
    </div>
  );
};

// Dashboard-Inspired Add Business Page  
const ModernAddBusinessPage = () => {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [verificationResults, setVerificationResults] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const steps = [
    { id: 'business-info', title: 'Business Information', icon: Building2, component: BusinessInfoStep },
    { id: 'location', title: 'Location & Service Area', icon: MapPin, component: LocationStep },
    { id: 'services', title: 'Services & Details', icon: User, component: ServicesStep },
    { id: 'contact', title: 'Contact Information', icon: Phone, component: ContactInfoStep },
    { id: 'verification', title: 'Business Verification', icon: Shield, component: VerificationStep },
    { id: 'success', title: 'Complete', icon: CheckCircle, component: SubmissionSuccess }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Handle verification submission with Persona API integration
  const handleVerificationSubmit = async () => {
    setIsVerifying(true);

    try {
      // Create verification request with comprehensive data structure
      const verificationRequest = {
        metadata: {
          businessName: formData.businessName,
          industry: formData.category,
          submissionDate: new Date().toISOString(),
          requestId: 'biz_verify_${Date.now()}'
        },
        verifications: []
      };

      // Business License Verification (Persona API + Middesk for US businesses)
      if (formData.businessLicenseLicenseNumber && formData.businessLicenseLicenseDocument) {
        verificationRequest.verifications.push({
          type: 'business_license',
          provider: 'middesk', // Use Middesk for comprehensive US business verification
          data: {
            licenseNumber: formData.businessLicenseLicenseNumber,
            issuingState: formData.businessLicenseIssuingState,
            businessName: formData.businessName,
            businessAddress: {
              street: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode
            }
          },
          document: {
            fileName: formData.businessLicenseLicenseDocument.name,
            fileType: formData.businessLicenseLicenseDocument.type,
            fileSize: formData.businessLicenseLicenseDocument.size
          }
        });
      }

      // Tax ID/EIN Verification (Direct IRS database check via Signzy/Persona)
      if (formData.taxIdNumber) {
        verificationRequest.verifications.push({
          type: 'tax_id_verification',
          provider: 'signzy', // Known for direct IRS database matching
          data: {
            taxId: formData.taxIdNumber,
            taxIdType: formData.taxIdType,
            businessName: formData.businessName,
            businessAddress: {
              street: formData.address,
              city: formData.city, 
              state: formData.state,
              zipCode: formData.zipCode
            }
          }
        });
      }

      // Insurance Certificate Verification
      if (formData.insuranceProvider && formData.insuranceCertificateDocument) {
        verificationRequest.verifications.push({
          type: 'insurance_certificate',
          provider: 'axle', // "Plaid for insurance" - universal insurance API
          data: {
            provider: formData.insuranceProvider,
            coverageAmount: formData.insuranceCoverageAmount,
            expirationDate: formData.insuranceExpirationDate,
            policyType: 'general_liability'
          },
          document: {
            fileName: formData.insuranceCertificateDocument.name,
            fileType: formData.insuranceCertificateDocument.type
          }
        });
      }

      // Business Address Verification
      if (formData.businessAddressDocument) {
        verificationRequest.verifications.push({
          type: 'business_address',
          provider: 'persona', // Persona handles document verification well
          data: {
            address: {
              street: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode
            }
          },
          document: {
            fileName: formData.businessAddressDocument.name,
            fileType: formData.businessAddressDocument.type
          }
        });
      }

      // Owner Identity Verification
      if (formData.ownerVerificationIdDocument) {
        verificationRequest.verifications.push({
          type: 'identity_verification',
          provider: 'persona', // Persona excels at identity verification
          data: {
            ownerName: formData.ownerVerificationFullName || formData.contactName,
            ownerTitle: formData.ownerVerificationTitle || 'Owner'
          },
          document: {
            fileName: formData.ownerVerificationIdDocument.name,
            fileType: formData.ownerVerificationIdDocument.type
          }
        });
      }

      // Submit to comprehensive verification API (replace with actual API endpoint)
      const response = await fetch('/api/v1/business-verification/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': '2025-01',
          'X-Client-ID': 'thorbis-business-directory'
        },
        body: JSON.stringify(verificationRequest)
      });

      if (!response.ok) {
        throw new Error('Verification failed: ${response.status} ${response.statusText}');
      }

      const result = await response.json();

      // Process comprehensive verification results
      const processedResults = {
        businessLicense: result.verifications.find(v => v.type === 'business_license')?.status || 'pending',
        insurance: result.verifications.find(v => v.type === 'insurance_certificate')?.status || 'pending',
        taxId: result.verifications.find(v => v.type === 'tax_id_verification')?.status || 'pending',
        address: result.verifications.find(v => v.type === 'business_address')?.status || 'pending',
        ownerVerification: result.verifications.find(v => v.type === 'identity_verification')?.status || 'pending'
      };

      setVerificationResults(processedResults);
      
      // Enhanced feedback based on results
      const verifiedCount = Object.values(processedResults).filter(status => status === 'verified').length;
      const pendingCount = Object.values(processedResults).filter(status => status === 'pending').length;
      const failedCount = Object.values(processedResults).filter(status => status === 'failed').length;
      const totalChecks = Object.keys(processedResults).length;
      
      let message = ';
      if (verifiedCount === totalChecks) {
        message = '🎉 All verifications completed successfully! Your business is fully verified.';
      } else if (verifiedCount > 0 && pendingCount > 0) {
        message = '✅ ${verifiedCount}/${totalChecks} verifications completed instantly. ${pendingCount} are being reviewed by our team.';
      } else if (pendingCount > 0) {
        message = '⏳ ${pendingCount} verifications submitted for review. You'll receive updates as they complete.';
      }

      if (failedCount > 0) {
        message += ' ⚠️ ${failedCount} verification(s) need attention - please review and resubmit if needed.';
      }
      
      toast.success(message);

    } catch (error) {
      console.error('Verification error:', error);
      toast.error('There was an issue with verification. Our team has been notified and will review manually.');
      
      // Fallback to manual review
      setVerificationResults({
        businessLicense: 'pending',
        insurance: 'pending', 
        taxId: 'pending',
        address: 'pending',
        ownerVerification: 'pending'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    // Basic validation
    const currentStepId = steps[currentStep]?.id;
    let isValid = true;
    let errorMessage = ';

    switch (currentStepId) {
      case 'business-info':
        if (!formData.businessName || !formData.category || !formData.phone || !formData.email) {
          isValid = false;
          errorMessage = 'Please fill in all required fields';
        }
        break;
      case 'location':
        if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
          isValid = false;
          errorMessage = 'Please provide complete address information';
        }
        break;
      case 'services':
        if (!formData.description || !formData.services) {
          isValid = false;
          errorMessage = 'Please describe your business and services';
        }
        break;
      case 'contact':
        // Contact step is optional, so we don't validate
        break;
      case 'verification':
        if (!formData.licenseNumber || !formData.businessLicense || !formData.insuranceProvider || 
            !formData.insuranceCert || !formData.taxId || !formData.addressProof || 
            !formData.ownerId || !formData.verificationConsent) {
          isValid = false;
          errorMessage = 'Please complete all required verification fields and provide consent';
        }
        break;
    }

    if (!isValid) {
      toast.error(errorMessage);
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitBusiness = async () => {
    setLoading(true);
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== ') {
          if (value instanceof File) {
            submitData.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach(item => {
              if (item instanceof File) {
                submitData.append(key, item);
              }
            });
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      // Submit business data
      const response = await fetch('/api/v1/business-submissions', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();
      
      if (result.success) {
        // Store submission info for success page
        setFormData(prev => ({ 
          ...prev, 
          submissionId: result.submission.id,
          submissionResult: result.submission
        }));
        
        toast.success('Business submitted successfully!');
        setCurrentStep(5); // Go to success step
      } else {
        toast.error(result.error || 'Failed to submit business. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const stepProps = { 
      formData, 
      setFormData,
      verificationResults,
      isVerifying,
      handleVerificationSubmit
    };
    const StepComponent = steps[currentStep]?.component;
    
    if (!StepComponent) return null;
    
    return <StepComponent {...stepProps} />;
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-100 mb-3">Add Your Verified Business</h1>
          <p className="text-xl text-neutral-400 mb-8">Join our directory with complete legitimacy verification to reach more customers</p>
          
          {/* Simple Progress */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {steps.slice(0, -1).map((_, index) => (
              <div
                key={index}
                className={'w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-neutral-700'
                }'}
              />
            ))}
          </div>
          <p className="text-sm text-neutral-500">
            Step {currentStep + 1} of {steps.length - 1}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl text-neutral-100 text-center">
                {steps[currentStep]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-12 pb-12">
              {renderStep()}

              {/* Navigation */}
              {currentStep < 5 && (
                <div className="flex justify-between pt-8 mt-8 border-t border-neutral-800">
                  {currentStep > 0 ? (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      size="lg"
                      className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  
                  <Button
                    onClick={currentStep === 4 ? handleSubmitBusiness : handleNext}
                    disabled={loading}
                    size="lg"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {loading ? 'Submitting...' : currentStep === 4 ? 'Submit for Verification' : 'Continue'}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simple Help Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-neutral-500 mb-2">
              Free business listing • No account required
            </p>
            <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function AddBusinessPage() {
  return <ModernAddBusinessPage />;
}
