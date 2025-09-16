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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  BookOpen,
  Users,
  Building,
  FileText,
  Send,
  Loader2,
  ExternalLink,
  Search,
  Video,
  Bot,
  MessageSquare
} from 'lucide-react'

const SUPPORT_CATEGORIES = [
  { id: 'verification', label: 'Business Verification', icon: Shield, description: 'Help with the verification process' },
  { id: 'account', label: 'Account Support', icon: Users, description: 'Account management and settings' },
  { id: 'listing', label: 'Business Listing', icon: Building, description: 'Managing your business profile' },
  { id: 'technical', label: 'Technical Issues', icon: AlertTriangle, description: 'Platform bugs and technical problems' },
  { id: 'billing', label: 'Billing & Payments', icon: FileText, description: 'Payment and subscription questions' },
  { id: 'general', label: 'General Inquiry', icon: MessageCircle, description: 'Other questions and feedback' }
]

const FAQ_ITEMS = [
  {
    category: 'verification',
    question: 'How long does business verification take?',
    answer: 'Most business verifications are completed within 24-48 hours. Complex verifications may take up to 5 business days.'
  },
  {
    category: 'verification', 
    question: 'What documents do I need for verification?',
    answer: 'Typically you need: Business license, tax ID/EIN, proof of insurance, and address verification. Requirements may vary by industry.'
  },
  {
    category: 'account',
    question: 'How do I claim my existing business listing?',
    answer: 'Use the "Claim Business" option and provide verification documents. Our team will verify ownership within 24 hours.'
  },
  {
    category: 'technical',
    question: 'Why is my verification score low?',
    answer: 'Verification scores are based on multiple factors including document completeness, business registration status, and digital presence.'
  },
  {
    category: 'billing',
    question: 'What are the subscription options?',
    answer: 'We offer Basic (free), Verified ($29/month), Premium ($79/month), and Enterprise (custom) plans with different features.'
  },
  {
    category: 'general',
    question: 'How do I update my business information?',
    answer: 'Log into your dashboard and navigate to Business Profile. Changes to critical information may require re-verification.'
  }
]

const ContactForm = ({ selectedCategory, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: ',
    lastName: ',
    email: ',
    businessName: ',
    category: selectedCategory || ',
    subject: ',
    message: ',
    priority: 'normal',
    businessId: '
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email'
    if (!formData.category) newErrors.category = 'Please select a category'
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/v1/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit support ticket')
      }

      if (data.success) {
        onSubmitSuccess({
          ticketId: data.ticket.ticketId,
          category: data.ticket.category,
          estimatedResponse: data.ticket.estimatedResponseTime,
          status: data.ticket.status,
          nextSteps: data.nextSteps || []
        })
        
        // Reset form
        setFormData({
          firstName: ',
          lastName: ',
          email: ',
          businessName: ',
          category: ',
          subject: ',
          message: ',
          priority: 'normal',
          businessId: '
        })
      }
      
    } catch (error) {
      console.error('Error submitting support ticket:', error)
      // Show error to user
      setErrors({ submit: error.message || 'Failed to submit support ticket. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryResponseTime = (category) => {
    const times = {
      verification: '4-8 hours',
      technical: '2-4 hours', 
      billing: '1-2 hours',
      account: '4-8 hours',
      listing: '8-12 hours',
      general: '24-48 hours'
    }
    return times[category] || '24-48 hours'
  }

  const selectedCategoryData = SUPPORT_CATEGORIES.find(cat => cat.id === formData.category)

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Contact Support</CardTitle>
            <CardDescription>
              Get help with verification, account issues, or general questions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className={errors.firstName ? 'border-red-500' : '}
              />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className={errors.lastName ? 'border-red-500' : '}
              />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={errors.email ? 'border-red-500' : '}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </div>
          </div>

          {/* Support Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Support Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className={errors.category ? 'border-red-500' : '}>
                <SelectValue placeholder="Select a support category" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORT_CATEGORIES.map((category) => {
                  const Icon = category.icon
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-neutral-500">{category.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
            
            {selectedCategoryData && (
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <Clock className="h-4 w-4" />
                <span>Estimated response time: {getCategoryResponseTime(formData.category)}</span>
              </div>
            )}
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Low - General question</span>
                  </div>
                </SelectItem>
                <SelectItem value="normal">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>Normal - Standard support</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span>High - Urgent business issue</span>
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Critical - Service disruption</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Brief description of your issue"
              className={errors.subject ? 'border-red-500' : '}
            />
            {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Please provide detailed information about your question or issue..."
              rows={6}
              className={errors.message ? 'border-red-500' : '}
            />
            {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
            <p className="text-xs text-neutral-500">
              For verification issues, please include your business name and any error messages.
            </p>
          </div>

          {errors.submit && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Submission Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Ticket...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Support Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

const FAQSection = ({ selectedCategory }) => {
  const [searchQuery, setSearchQuery] = useState(')
  
  const filteredFAQs = FAQ_ITEMS.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesSearch = !searchQuery || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search frequently asked questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredFAQs.map((faq, index) => {
          const category = SUPPORT_CATEGORIES.find(cat => cat.id === faq.category)
          const Icon = category?.icon || MessageCircle
          
          return (
            <Card key={index} className="border">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-2">{faq.question}</h3>
                      <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                      <Badge variant="outline" className="mt-3 text-xs">
                        {category?.label || 'General'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No FAQs found</h3>
            <p className="text-neutral-500">Try adjusting your search or contact our support team directly.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const SupportChannels = () => {
  const channels = [
    {
      name: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      availability: 'Mon-Fri, 9 AM - 6 PM PST',
      responseTime: 'Usually within minutes',
      action: 'Start Chat',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      name: 'Video Call',
      description: 'Schedule a screen-sharing session',
      icon: Video,
      availability: 'Mon-Fri, 10 AM - 5 PM PST',
      responseTime: 'Next available slot',
      action: 'Schedule Call',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      name: 'Email Support',
      description: 'Detailed written support',
      icon: Mail,
      availability: '24/7 ticket submission',
      responseTime: '2-24 hours',
      action: 'Send Email',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      name: 'Phone Support',
      description: 'Speak directly with our team',
      icon: Phone,
      availability: 'Mon-Fri, 8 AM - 7 PM PST',
      responseTime: 'Call now: (555) 123-4567',
      action: 'Call Now',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {channels.map((channel) => {
        const Icon = channel.icon
        return (
          <Card key={channel.name} className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={'h-12 w-12 rounded-lg flex items-center justify-center ${channel.color}'}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-1">{channel.name}</h3>
                  <p className="text-sm text-neutral-600 mb-3">{channel.description}</p>
                  
                  <div className="space-y-2 text-xs text-neutral-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{channel.availability}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>{channel.responseTime}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 w-full"
                    onClick={() => {
                      // In production, implement actual channel actions
                      if (channel.name === 'Phone Support') {
                        window.location.href = 'tel:+15551234567'
                      } else {
                        console.log('Opening ${channel.name}')
                      }
                    }}
                  >
                    {channel.action}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

const ContactPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(')
  const [submitted, setSubmitted] = useState(null)
  const [activeTab, setActiveTab] = useState('contact')

  const handleSubmitSuccess = (data) => {
    setSubmitted(data)
    setActiveTab('success')
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">Support Request Submitted</h2>
                <p className="text-green-700">
                  Thank you for contacting us. We've received your support request and will respond soon.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-neutral-600">Ticket ID:</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {submitted.ticketId}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-neutral-600">Category:</span>
                    <span className="text-sm">{SUPPORT_CATEGORIES.find(cat => cat.id === submitted.category)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-neutral-600">Estimated Response:</span>
                    <span className="text-sm">{submitted.estimatedResponse}</span>
                  </div>
                  {submitted.status && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-600">Status:</span>
                      <Badge variant="outline" className={
                        submitted.status === 'urgent' ? 'text-red-700 border-red-300' :
                        submitted.status === 'in_progress' ? 'text-blue-700 border-blue-300' :
                        'text-neutral-700 border-neutral-300'
                      }>
                        {submitted.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {submitted.nextSteps && submitted.nextSteps.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h3 className="font-medium text-green-900 mb-3">Next Steps</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    {submitted.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button onClick={() => setSubmitted(null)} variant="outline">
                  Submit Another Request
                </Button>
                <Button asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Contact & Support</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Get help with business verification, account management, and platform features. 
          Our dedicated support team is here to assist you.
        </p>
      </div>

      {/* Support Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">How can we help you?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORT_CATEGORIES.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            
            return (
              <Card 
                key={category.id}
                className={'cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-2 border-blue-500 bg-blue-50' 
                    : 'border hover:border-neutral-300'
                }'}
                onClick={() => {
                  setSelectedCategory(isSelected ? ' : category.id)
                  setActiveTab('contact')
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={'h-10 w-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-100' : 'bg-neutral-100'
                    }'}>
                      <Icon className={'h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-neutral-600'}'} />
                    </div>
                    <div>
                      <h3 className={'font-medium ${isSelected ? 'text-blue-900' : 'text-neutral-900'}'}>
                        {category.label}
                      </h3>
                      <p className={'text-sm ${isSelected ? 'text-blue-700' : 'text-neutral-600'}'}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact">Contact Form</TabsTrigger>
          <TabsTrigger value="channels">Support Channels</TabsTrigger>
          <TabsTrigger value="faq">FAQ & Help</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-6">
          <ContactForm 
            selectedCategory={selectedCategory} 
            onSubmitSuccess={handleSubmitSuccess}
          />
        </TabsContent>
        
        <TabsContent value="channels" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Multiple Ways to Get Help</h3>
            <p className="text-neutral-600 mb-6">
              Choose the support channel that works best for your situation and urgency level.
            </p>
            <SupportChannels />
          </div>
        </TabsContent>
        
        <TabsContent value="faq" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Frequently Asked Questions</h3>
            <p className="text-neutral-600 mb-6">
              Find quick answers to common questions about business verification and platform features.
            </p>
            <FAQSection selectedCategory={selectedCategory} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


export default ContactPage