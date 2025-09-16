"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search,
  AlertTriangle, 
  CheckCircle, 
  Building,
  MapPin,
  Phone,
  Globe,
  Star,
  Upload,
  FileText,
  ArrowLeft,
  ArrowRight,
  Shield,
  Eye,
  Users,
  Clock,
  Flag,
  MessageSquare,
  Camera,
  Loader2
} from 'lucide-react'

const REPORT_CATEGORIES = [
  {
    id: 'false_information',
    title: 'False Information',
    description: 'Incorrect business details, fake reviews, or misleading claims',
    icon: AlertTriangle,
    severity: 'high',
    examples: ['Wrong business hours', 'Fake services offered', 'Misleading photos']
  },
  {
    id: 'inappropriate_content',
    title: 'Inappropriate Content',
    description: 'Offensive, explicit, or unprofessional content',
    icon: Eye,
    severity: 'high',
    examples: ['Offensive images', 'Inappropriate language', 'Adult content']
  },
  {
    id: 'fake_business',
    title: 'Fake Business',
    description: 'Business that doesn\'t exist or is permanently closed',
    icon: Building,
    severity: 'critical',
    examples: ['Non-existent business', 'Permanently closed', 'Duplicate listing']
  },
  {
    id: 'spam_abuse',
    title: 'Spam or Abuse',
    description: 'Spam content, fake reviews, or manipulative practices',
    icon: Shield,
    severity: 'medium',
    examples: ['Fake reviews', 'Spam messages', 'Review manipulation']
  },
  {
    id: 'verification_issue',
    title: 'Verification Issue',
    description: 'Problems with business verification or trust badges',
    icon: CheckCircle,
    severity: 'medium',
    examples: ['Invalid verification', 'Expired documents', 'False credentials']
  },
  {
    id: 'privacy_concern',
    title: 'Privacy Concern',
    description: 'Unauthorized use of personal information or images',
    icon: Users,
    severity: 'high',
    examples: ['Unauthorized photos', 'Personal info misuse', 'Privacy violation']
  },
  {
    id: 'legal_issue',
    title: 'Legal Issue',
    description: 'Copyright infringement, trademark violation, or illegal activity',
    icon: Flag,
    severity: 'critical',
    examples: ['Copyright violation', 'Trademark infringement', 'Illegal services']
  },
  {
    id: 'other',
    title: 'Other Issue',
    description: 'Issues not covered by the above categories',
    icon: MessageSquare,
    severity: 'low',
    examples: ['Technical issues', 'Feature requests', 'General feedback']
  }
]

const SEVERITY_CONFIG = {
  low: { color: 'bg-green-100 text-green-800 border-green-200', priority: 1 },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', priority: 2 },
  high: { color: 'bg-orange-100 text-orange-800 border-orange-200', priority: 3 },
  critical: { color: 'bg-red-100 text-red-800 border-red-200', priority: 4 }
}

const BusinessSearchStep = ({ selectedBusiness, onBusinessSelect, searchTerm, setSearchTerm }) => {
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    setSearched(true)
    try {
      // In production, this would call your business search API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock search results
      const mockResults = [
        {
          id: '1',
          name: searchTerm,
          address: '123 Main St, City, ST 12345',
          phone: '(555) 123-4567',
          website: 'https://example.com',
          rating: 4.2,
          reviewCount: 89,
          category: 'Home Services',
          verified: true,
          trustScore: 85
        },
        {
          id: '2', 
          name: '${searchTerm} Services',
          address: '456 Oak Ave, City, ST 12345',
          phone: '(555) 987-6543',
          website: 'https://example2.com',
          rating: 3.8,
          reviewCount: 45,
          category: 'Professional Services',
          verified: false,
          trustScore: 62
        }
      ]
      
      setSearchResults(mockResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Find Business to Report</span>
        </CardTitle>
        <CardDescription>
          Search for the business you want to report an issue about
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter business name, address, or phone number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Searching businesses...</p>
          </div>
        )}

        {searched && !loading && searchResults.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No businesses found</AlertTitle>
            <AlertDescription>
              Try searching with different keywords or check the spelling.
            </AlertDescription>
          </Alert>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Search Results</h3>
            {searchResults.map((business) => (
              <Card 
                key={business.id}
                className={'cursor-pointer transition-all ${
                  selectedBusiness?.id === business.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-neutral-300'
                }'}
                onClick={() => onBusinessSelect(business)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Building className="h-6 w-6 text-neutral-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{business.name}</h4>
                          <p className="text-sm text-neutral-600">{business.category}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{business.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{business.phone}</span>
                        </div>
                        {business.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>{business.website}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{business.rating}</span>
                        <span className="text-sm text-neutral-500">({business.reviewCount})</span>
                      </div>
                      
                      <div className="space-y-1">
                        {business.verified && (
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <div className="text-xs text-neutral-500">
                          Trust Score: {business.trustScore}/100
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedBusiness && (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Business Selected</AlertTitle>
            <AlertDescription className="text-blue-700">
              You've selected <strong>{selectedBusiness.name}</strong> to report an issue about.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

const ReportDetailsStep = ({ reportData, updateReportData, selectedBusiness }) => {
  const [attachments, setAttachments] = useState([])
  
  const selectedCategory = REPORT_CATEGORIES.find(cat => cat.id === reportData.category)

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Selected Business Summary */}
      {selectedBusiness && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Building className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-orange-900">Reporting Issue For</h4>
                <p className="text-sm text-orange-700">{selectedBusiness.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Report Category</CardTitle>
          <CardDescription>
            Select the type of issue you want to report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={reportData.category} 
            onValueChange={(value) => updateReportData('category', value)}
          >
            {REPORT_CATEGORIES.map((category) => {
              const Icon = category.icon
              const severityConfig = SEVERITY_CONFIG[category.severity]
              
              return (
                <div key={category.id} className="flex space-x-3 p-3 rounded-lg border hover:bg-neutral-50">
                  <RadioGroupItem value={category.id} id={category.id} className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-neutral-600" />
                      <Label htmlFor={category.id} className="font-medium cursor-pointer">
                        {category.title}
                      </Label>
                      <Badge variant="outline" className={severityConfig.color}>
                        {category.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600">{category.description}</p>
                    <div className="text-xs text-neutral-500">
                      Examples: {category.examples.join(', ')}
                    </div>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>
              Provide specific details about the {selectedCategory.title.toLowerCase()} issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder={'Briefly describe the ${selectedCategory.title.toLowerCase()}'}
                value={reportData.title}
                onChange={(e) => updateReportData('title', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Provide as much detail as possible about the issue. Include specific examples, dates, and any relevant context that will help us understand the problem."
                rows={6}
                value={reportData.description}
                onChange={(e) => updateReportData('description', e.target.value)}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Minimum 20 characters required. Be specific and factual.
              </p>
            </div>

            <div>
              <Label>Priority Level</Label>
              <Select 
                value={reportData.priority} 
                onValueChange={(value) => updateReportData('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Low - Minor issue</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span>Medium - Moderate issue</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <span>High - Significant issue</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span>Urgent - Critical issue</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Supporting Evidence</Label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                  <p className="text-sm font-medium">Upload screenshots or documents</p>
                  <p className="text-xs text-neutral-500">
                    Supports images, PDFs, and documents (max 10MB each)
                  </p>
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-2 mt-4">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-3 p-2 bg-neutral-50 rounded">
                      <FileText className="h-4 w-4 text-neutral-600" />
                      <span className="text-sm flex-1">{attachment.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="anonymous"
                checked={reportData.anonymous}
                onCheckedChange={(checked) => updateReportData('anonymous', checked)}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit this report anonymously
              </Label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const ReviewSubmitStep = ({ reportData, selectedBusiness, onSubmit, submitting }) => {
  const selectedCategory = REPORT_CATEGORIES.find(cat => cat.id === reportData.category)
  const severityConfig = SEVERITY_CONFIG[selectedCategory?.severity || 'low']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Report</CardTitle>
          <CardDescription>
            Please review all details before submitting your report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Being Reported */}
          {selectedBusiness && (
            <div>
              <h4 className="font-medium mb-3">Business Being Reported</h4>
              <Card className="bg-neutral-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-8 w-8 text-neutral-600" />
                    <div>
                      <p className="font-medium">{selectedBusiness.name}</p>
                      <p className="text-sm text-neutral-600">{selectedBusiness.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Report Category */}
          <div>
            <h4 className="font-medium mb-3">Report Category</h4>
            <div className="flex items-center space-x-3">
              {selectedCategory && (
                <>
                  <selectedCategory.icon className="h-5 w-5 text-neutral-600" />
                  <span className="font-medium">{selectedCategory.title}</span>
                  <Badge variant="outline" className={severityConfig.color}>
                    {selectedCategory.severity}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Report Details */}
          <div>
            <h4 className="font-medium mb-3">Report Details</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-neutral-600">Title</Label>
                <p className="text-sm">{reportData.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-neutral-600">Description</Label>
                <p className="text-sm whitespace-pre-wrap">{reportData.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-neutral-600">Priority</Label>
                <Badge variant="outline" className="ml-2">
                  {reportData.priority?.toUpperCase()}
                </Badge>
              </div>
              {reportData.anonymous && (
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Anonymous Report
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps Info */}
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>What happens next?</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>1. Your report will be reviewed by our moderation team within 24 hours</p>
              <p>2. We'll investigate the issue and take appropriate action if needed</p>
              <p>3. You'll receive an email update on the resolution (unless submitted anonymously)</p>
              <p>4. The business may be contacted for clarification or correction</p>
            </AlertDescription>
          </Alert>

          <Button 
            onClick={onSubmit} 
            className="w-full" 
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <Flag className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

const ReportSuccessStep = ({ reportId }) => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-8 text-center">
        <div className="space-y-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Report Submitted Successfully</h2>
            <p className="text-green-700">
              Thank you for helping us maintain the quality and accuracy of our business directory.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-600">Report ID:</span>
              <Badge variant="outline" className="text-green-700 border-green-300">
                {reportId}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3 text-left">
            <h3 className="font-medium text-green-900">Next Steps</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Our moderation team will review your report within 24 hours</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>We'll investigate and take appropriate action if necessary</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>You'll receive email updates on the resolution</span>
              </li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Submit Another Report
            </Button>
            <Button asChild>
              <a href="/">Back to Directory</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ReportBusinessPage = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [searchTerm, setSearchTerm] = useState(')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [reportData, setReportData] = useState({
    category: ',
    title: ',
    description: ',
    priority: 'medium',
    anonymous: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [reportId, setReportId] = useState(null)

  const steps = [
    { title: 'Find Business', description: 'Search for the business to report' },
    { title: 'Report Details', description: 'Describe the issue' },
    { title: 'Review & Submit', description: 'Confirm your report' },
    { title: 'Complete', description: 'Report submitted' }
  ]

  const updateReportData = (key, value) => {
    setReportData(prev => ({ ...prev, [key]: value }))
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return selectedBusiness !== null
      case 1: return reportData.category && reportData.title && reportData.description.length >= 20
      case 2: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (canProceedToNext() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/v1/reports/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: selectedBusiness?.id,
          category: reportData.category,
          title: reportData.title,
          description: reportData.description,
          priority: reportData.priority,
          anonymous: reportData.anonymous,
          attachments: [], // In production, handle file uploads
          reporterInfo: reportData.anonymous ? null : {
            firstName: 'Anonymous',
            lastName: 'User',
            email: 'anonymous@example.com' // In production, get from auth
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      if (data.success) {
        setReportId(data.report.reportId)
        setCurrentStep(3)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      // In production, show error to user
      alert('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Report a Business Issue</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Help us maintain the quality and accuracy of our business directory by reporting issues you encounter.
        </p>
      </div>

      {/* Progress Indicator */}
      {currentStep < 3 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Progress</h3>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">{steps[currentStep].title}</span>
            <span className="text-neutral-500">{Math.round(progress)}% complete</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <BusinessSearchStep
            selectedBusiness={selectedBusiness}
            onBusinessSelect={setSelectedBusiness}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
        
        {currentStep === 1 && (
          <ReportDetailsStep
            reportData={reportData}
            updateReportData={updateReportData}
            selectedBusiness={selectedBusiness}
          />
        )}
        
        {currentStep === 2 && (
          <ReviewSubmitStep
            reportData={reportData}
            selectedBusiness={selectedBusiness}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
        
        {currentStep === 3 && (
          <ReportSuccessStep reportId={reportId} />
        )}
      </div>

      {/* Navigation */}
      {currentStep < 3 && (
        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          
          {currentStep < 2 && (
            <Button 
              onClick={handleNext} 
              disabled={!canProceedToNext()}
              className="ml-auto"
            >
              Next: {steps[currentStep + 1]?.title}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ReportBusinessPage