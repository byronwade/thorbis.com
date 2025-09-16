import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp,
  Users,
  Target,
  Mail,
  Phone,
  MessageSquare,
  Star,
  Share2,
  DollarSign,
  Calendar,
  Eye,
  MousePointer,
  UserPlus,
  Award,
  Megaphone,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MapPin,
  Zap,
  Gift,
  Heart,
  ThumbsUp,
  MessageCircle,
  Send
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'

interface MarketingLead {
  id: string
  leadNumber: string
  source: {
    type: 'website' | 'google_ads' | 'facebook' | 'referral' | 'phone' | 'email' | 'social' | 'direct' | 'other'
    channel: string
    campaign?: string
    medium?: string
    content?: string
  }
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
  }
  service: {
    type: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'multiple'
    category: string
    description: string
    urgency: 'low' | 'medium' | 'high' | 'emergency'
    estimatedValue: number
  }
  status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'won' | 'lost' | 'nurturing'
  assignedTo: {
    id: string
    name: string
    role: string
  }
  interactions: Array<{
    id: string
    type: 'call' | 'email' | 'sms' | 'meeting' | 'note'
    timestamp: string
    duration?: number
    outcome: string
    notes: string
    createdBy: string
  }>
  score: {
    total: number
    factors: {
      engagement: number
      budget: number
      timeline: number
      authority: number
      need: number
    }
  }
  timeline: {
    created: string
    firstContact?: string
    qualified?: string
    quoted?: string
    closed?: string
  }
  conversion: {
    probability: number
    estimatedCloseDate?: string
    actualValue?: number
    lostReason?: string
  }
  tags: string[]
  notes: string[]
}

interface MarketingCampaign {
  id: string
  name: string
  type: 'google_ads' | 'facebook_ads' | 'email' | 'sms' | 'direct_mail' | 'referral' | 'organic' | 'other'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  budget: {
    total: number
    spent: number
    dailyBudget?: number
  }
  schedule: {
    startDate: string
    endDate?: string
    timezone: string
  }
  targeting: {
    demographics: {
      ageRange?: string
      gender?: string
      income?: string
    }
    geographic: {
      cities: string[]
      radius: number
      zipCodes: string[]
    }
    interests: string[]
    keywords: string[]
  }
  content: {
    headline: string
    description: string
    callToAction: string
    imageUrl?: string
    landingPageUrl?: string
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    cost: number
    ctr: number
    cpc: number
    cpa: number
    roas: number
  }
  leads: number
  revenue: number
  createdBy: string
  createdAt: string
}

interface ReviewFeedback {
  id: string
  platform: 'google' | 'yelp' | 'facebook' | 'bbb' | 'angie' | 'nextdoor' | 'other'
  customer: {
    name: string
    email?: string
    phone?: string
  }
  job: {
    id: string
    workOrderNumber: string
    serviceDate: string
    technician: string
    service: string
  }
  rating: number
  review: {
    title?: string
    content: string
    photos?: string[]
  }
  response?: {
    content?: string
    respondedBy?: string
    respondedAt?: string
  }
  status: 'pending' | 'published' | 'responded' | 'flagged' | 'removed'
  sentiment: 'positive' | 'neutral' | 'negative'
  keywords: string[]
  createdAt: string
  updatedAt: string
}

export default function MarketingPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'campaigns' | 'reviews' | 'referrals'>('overview')
  const [leads, setLeads] = useState<MarketingLead[]>([])
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [reviews, setReviews] = useState<ReviewFeedback[]>([])
  const [filters, setFilters] = useState({
    dateRange: '30d',
    source: 'all',
    status: 'all'
  })

  useEffect(() => {
    fetchMarketingData()
  }, [filters])

  const fetchMarketingData = async () => {
    try {
      // Generate comprehensive marketing and lead data
      const mockLeads: MarketingLead[] = Array.from({ length: 85 }, (_, i) => {
        const leadSources = ['website', 'google_ads', 'facebook', 'referral', 'phone', 'email', 'social', 'direct'] as const
        const serviceTypes = ['hvac', 'plumbing', 'electrical', 'appliance', 'multiple'] as const
        const statuses = ['new', 'contacted', 'qualified', 'quoted', 'won', 'lost', 'nurturing'] as const
        
        const source = leadSources[Math.floor(Math.random() * leadSources.length)]
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const estimatedValue = Math.floor(Math.random() * 2500) + 150
        
        return {
          id: 'lead-${String(i + 1).padStart(3, '0')}',
          leadNumber: 'L-2024-${String(i + 1).padStart(4, '0')}',
          source: {
            type: source,
            channel: source === 'google_ads' ? 'Google Ads' : 
                     source === 'facebook' ? 'Facebook Ads' :
                     source === 'website' ? 'Organic Website' :
                     source === 'referral' ? 'Customer Referral' : 'Direct',
            campaign: source === 'google_ads' ? 'AC Repair Summer 2024' : 
                     source === 'facebook' ? 'HVAC Emergency Campaign' : undefined,
            medium: source === 'google_ads' ? 'cpc' : source === 'facebook' ? 'social' : 'organic'
          },
          contact: {
            firstName: ['John', 'Sarah', 'Mike', 'Jennifer', 'David', 'Amy', 'Robert', 'Lisa'][Math.floor(Math.random() * 8)],
            lastName: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Martinez', 'Anderson', 'Taylor`][Math.floor(Math.random() * 8)],
            email: 'customer${i + 1}@email.com',
            phone: '(217) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}',
            address: {
              street: '${Math.floor(Math.random() * 9999) + 1} ${['Oak', 'Maple', 'Pine', 'Cedar', 'Elm'][Math.floor(Math.random() * 5)]} Street',
              city: 'Springfield',
              state: 'IL',
              zipCode: '627${String(Math.floor(Math.random() * 10)).padStart(2, '0')}'}
            }
          },
          service: {
            type: serviceType,
            category: serviceType === 'hvac' ? ['AC Repair', 'Heating', 'Installation'][Math.floor(Math.random() * 3)] :
                     serviceType === 'plumbing' ? ['Drain Cleaning', 'Leak Repair', 'Installation'][Math.floor(Math.random() * 3)] :
                     serviceType === 'electrical' ? ['Outlet Installation', 'Panel Upgrade', 'Wiring'][Math.floor(Math.random() * 3)] :
                     'Appliance Repair',
            description: 'Customer inquiry about service needs and pricing information.',
            urgency: ['low', 'medium', 'high', 'emergency'][Math.floor(Math.random() * 4)] as any,
            estimatedValue
          },
          status,
          assignedTo: {
            id: 'sales-${Math.floor(Math.random() * 4) + 1}',
            name: ['Alex Thompson', 'Maria Garcia', 'James Wilson', 'Sarah Chen'][Math.floor(Math.random() * 4)],
            role: 'Sales Representative'
          },
          interactions: [],
          score: {
            total: Math.floor(Math.random() * 40) + 60,
            factors: {
              engagement: Math.floor(Math.random() * 20) + 10,
              budget: Math.floor(Math.random() * 20) + 10,
              timeline: Math.floor(Math.random() * 20) + 10,
              authority: Math.floor(Math.random() * 20) + 10,
              need: Math.floor(Math.random() * 20) + 10
            }
          },
          timeline: {
            created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          conversion: {
            probability: Math.floor(Math.random() * 80) + 20,
            estimatedCloseDate: status === 'qualified' || status === 'quoted' ? 
              new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            actualValue: status === 'won' ? estimatedValue + (Math.random() * 200 - 100) : undefined,
            lostReason: status === 'lost' ? ['Price too high', 'Chose competitor', 'Decided not to proceed'][Math.floor(Math.random() * 3)] : undefined
          },
          tags: ['Hot Lead', 'VIP', 'Repeat Customer', 'Price Sensitive'].slice(0, Math.floor(Math.random() * 3)),
          notes: []
        }
      })

      const mockCampaigns: MarketingCampaign[] = [
        {
          id: 'campaign-001',
          name: 'Summer AC Repair Campaign',
          type: 'google_ads',
          status: 'active',
          budget: {
            total: 5000,
            spent: 2847,
            dailyBudget: 150
          },
          schedule: {
            startDate: '2024-06-01',
            endDate: '2024-08-31',
            timezone: 'America/Chicago'
          },
          targeting: {
            demographics: {
              ageRange: '25-65',
              income: '$40,000+'
            },
            geographic: {
              cities: ['Springfield', 'Decatur', 'Champaign'],
              radius: 25,
              zipCodes: ['62701', '62702', '62703', '62704', '62707']
            },
            interests: ['Home Improvement', 'HVAC', 'Energy Efficiency'],
            keywords: ['ac repair', 'air conditioning', 'hvac service', 'cooling']
          },
          content: {
            headline: 'Emergency AC Repair - Same Day Service',
            description: 'Expert HVAC technicians available 24/7. Fast, reliable AC repair with upfront pricing.',
            callToAction: 'Call Now for FREE Estimate',
            landingPageUrl: 'https://company.com/ac-repair'
          },
          metrics: {
            impressions: 45280,
            clicks: 1829,
            conversions: 73,
            cost: 2847,
            ctr: 4.04,
            cpc: 1.56,
            cpa: 39.00,
            roas: 4.2
          },
          leads: 73,
          revenue: 11956,
          createdBy: 'Marketing Team',
          createdAt: '2024-06-01T00:00:00Z'
        },
        {
          id: 'campaign-002',
          name: 'Facebook HVAC Emergency',
          type: 'facebook_ads',
          status: 'active',
          budget: {
            total: 3000,
            spent: 1654,
            dailyBudget: 100
          },
          schedule: {
            startDate: '2024-07-01',
            endDate: '2024-09-30',
            timezone: 'America/Chicago'
          },
          targeting: {
            demographics: {
              ageRange: '30-60',
              income: '$35,000+'
            },
            geographic: {
              cities: ['Springfield'],
              radius: 30,
              zipCodes: []
            },
            interests: ['Home Ownership', 'DIY', 'Home Services'],
            keywords: []
          },
          content: {
            headline: '24/7 HVAC Emergency Service',
            description: 'No overtime charges. Licensed technicians. Financing available.',
            callToAction: 'Get Quote Now',
            imageUrl: '/images/hvac-tech.jpg'
          },
          metrics: {
            impressions: 28450,
            clicks: 892,
            conversions: 34,
            cost: 1654,
            ctr: 3.14,
            cpc: 1.85,
            cpa: 48.65,
            roas: 3.8
          },
          leads: 34,
          revenue: 6287,
          createdBy: 'Marketing Team',
          createdAt: '2024-07-01T00:00:00Z'
        },
        {
          id: 'campaign-003',
          name: 'Plumbing Emergency Email Series',
          type: 'email',
          status: 'active',
          budget: {
            total: 500,
            spent: 156
          },
          schedule: {
            startDate: '2024-08-01',
            timezone: 'America/Chicago'
          },
          targeting: {
            demographics: Record<string, unknown>,
            geographic: {
              cities: ['Springfield', 'Decatur'],
              radius: 0,
              zipCodes: []
            },
            interests: [],
            keywords: []
          },
          content: {
            headline: 'Plumbing Emergency? We\'re Here 24/7','
            description: 'Fast response plumbing services with transparent pricing.',
            callToAction: 'Schedule Service'
          },
          metrics: {
            impressions: 2500,
            clicks: 187,
            conversions: 12,
            cost: 156,
            ctr: 7.48,
            cpc: 0.83,
            cpa: 13.00,
            roas: 5.2
          },
          leads: 12,
          revenue: 811,
          createdBy: 'Marketing Team',
          createdAt: '2024-08-01T00:00:00Z'
        }
      ]

      const mockReviews: ReviewFeedback[] = Array.from({ length: 42 }, (_, i) => {
        const platforms = ['google', 'yelp', 'facebook', 'angie', 'nextdoor'] as const
        const platform = platforms[Math.floor(Math.random() * platforms.length)]
        const rating = Math.random() < 0.8 ? 5 : Math.random() < 0.9 ? 4 : Math.random() < 0.95 ? 3 : Math.random() < 0.98 ? 2 : 1
        const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative'
        
        return {
          id: 'review-${String(i + 1).padStart(3, '0')}',
          platform,
          customer: {
            name: ['John S.', 'Sarah M.', 'Mike R.', 'Jennifer L.', 'David W.`][Math.floor(Math.random() * 5)],
            email: 'customer${i + 1}@email.com'
          },
          job: {
            id: 'job-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}',
            workOrderNumber: 'WO-2024-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}',
            serviceDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            technician: ['Mike Rodriguez', 'Sarah Johnson', 'David Chen', 'Amy Williams'][Math.floor(Math.random() * 4)],
            service: ['AC Repair', 'Plumbing', 'Electrical', 'Appliance Repair'][Math.floor(Math.random() * 4)]
          },
          rating,
          review: {
            title: rating >= 4 ? 'Excellent Service!' : rating === 3 ? 'Good Experience' : 'Could be better',
            content: rating >= 4 ? 
              'Outstanding technician who fixed our AC quickly and professionally. Highly recommend!' :
              rating === 3 ? 
              'Service was adequate and the problem was resolved. Fair pricing.' :
              'Service took longer than expected but the issue was eventually resolved.',
            photos: Math.random() < 0.3 ? ['/images/job-photo.jpg'] : undefined
          },
          response: rating >= 4 ? {
            content: 'Thank you for the wonderful review! We appreciate your business.',
            respondedBy: 'Customer Service Team',
            respondedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          } : undefined,
          status: 'published',
          sentiment,
          keywords: rating >= 4 ? ['professional', 'quick', 'excellent'] : 
                   rating === 3 ? ['adequate', 'fair'] : 
                   ['slow', 'expensive'],
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      setLeads(mockLeads)
      setCampaigns(mockCampaigns)
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error fetching marketing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMarketingStats = () => {
    const totalLeads = leads.length
    const qualifiedLeads = leads.filter(lead => lead.status === 'qualified' || lead.status === 'quoted').length
    const wonLeads = leads.filter(lead => lead.status === 'won').length
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0
    const totalRevenue = leads
      .filter(lead => lead.status === 'won')
      .reduce((sum, lead) => sum + (lead.conversion.actualValue || 0), 0)
    const avgDealSize = wonLeads > 0 ? totalRevenue / wonLeads : 0
    const totalCampaignSpend = campaigns.reduce((sum, campaign) => sum + campaign.budget.spent, 0)
    const totalCampaignRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0)
    const marketingROI = totalCampaignSpend > 0 ? (totalCampaignRevenue / totalCampaignSpend) : 0
    const avgReviewRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

    return {
      totalLeads,
      qualifiedLeads,
      wonLeads,
      conversionRate,
      totalRevenue,
      avgDealSize,
      totalCampaignSpend,
      totalCampaignRevenue,
      marketingROI,
      avgReviewRating,
      totalReviews: reviews.length,
      positiveReviews: reviews.filter(r => r.sentiment === 'positive').length
    }
  }

  const stats = getMarketingStats()

  const leadColumns = [
    {
      accessorKey: 'leadNumber',
      header: 'Lead #',
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-sm text-blue-400">{row.original.leadNumber}</span>
      )
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="font-medium text-white">
            {row.original.contact.firstName} {row.original.contact.lastName}
          </div>
          <div className="text-sm text-neutral-400">{row.original.contact.email}</div>
        </div>
      )
    },
    {
      accessorKey: 'source.channel',
      header: 'Source',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center">
          <div className={'w-3 h-3 rounded-full mr-2 ${
            row.original.source.type === 'google_ads' ? 'bg-blue-500' :
            row.original.source.type === 'facebook' ? 'bg-blue-600' :
            row.original.source.type === 'website' ? 'bg-green-500' :
            row.original.source.type === 'referral' ? 'bg-purple-500' :
            'bg-neutral-500'
              }'}></div>'
          <span className="text-sm text-neutral-300">{row.original.source.channel}</span>
        </div>
      )
    },
    {
      accessorKey: 'service.category',
      header: 'Service',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="text-white">{row.original.service.category}</div>
          <div className={'text-xs px-2 py-1 rounded-full inline-block ${
            row.original.service.urgency === 'emergency' ? 'bg-red-800 text-red-200' :
            row.original.service.urgency === 'high' ? 'bg-orange-800 text-orange-200' :
            row.original.service.urgency === 'medium' ? 'bg-yellow-800 text-yellow-200' :
            'bg-neutral-800 text-neutral-200'
              }'}>'
            {row.original.service.urgency}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => (
        <div className={'px-3 py-1 rounded-full text-sm font-medium ${
          row.original.status === 'won' ? 'bg-green-800 text-green-200' :
          row.original.status === 'qualified' ? 'bg-blue-800 text-blue-200' :
          row.original.status === 'quoted' ? 'bg-purple-800 text-purple-200' :
          row.original.status === 'contacted' ? 'bg-orange-800 text-orange-200' :
          row.original.status === 'lost' ? 'bg-red-800 text-red-200' :
          row.original.status === 'nurturing' ? 'bg-cyan-800 text-cyan-200' :
          'bg-neutral-800 text-neutral-200'
              }'}>'
          {row.original.status.toUpperCase()}
        </div>
      )
    },
    {
      accessorKey: 'service.estimatedValue',
      header: 'Est. Value',
      cell: ({ row }: { row: any }) => (
        <span className="text-green-400 font-medium">
          ${row.original.service.estimatedValue.toLocaleString()}
        </span>
      )
    },
    {
      accessorKey: 'score.total',
      header: 'Score',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center">
          <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            row.original.score.total >= 80 ? 'bg-green-800 text-green-200' :
            row.original.score.total >= 60 ? 'bg-yellow-800 text-yellow-200' :
            'bg-red-800 text-red-200'
              }'}>'
            {row.original.score.total}
          </div>
        </div>
      )
    }
  ]

  const campaignColumns = [
    {
      accessorKey: 'name',
      header: 'Campaign',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="font-medium text-white">{row.original.name}</div>
          <div className="text-sm text-neutral-400">{row.original.type.replace('_', ' ').toUpperCase()}</div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => (
        <div className={'px-3 py-1 rounded-full text-sm font-medium ${
          row.original.status === 'active' ? 'bg-green-800 text-green-200' :
          row.original.status === 'paused' ? 'bg-yellow-800 text-yellow-200' :
          row.original.status === 'completed' ? 'bg-blue-800 text-blue-200' :
          row.original.status === 'cancelled' ? 'bg-red-800 text-red-200' :
          'bg-neutral-800 text-neutral-200'
              }'}>'
          {row.original.status.toUpperCase()}
        </div>
      )
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="text-white">${row.original.budget.spent.toLocaleString()} / ${row.original.budget.total.toLocaleString()}</div>
          <div className="w-full bg-neutral-800 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: '${Math.min((row.original.budget.spent / row.original.budget.total) * 100, 100)}%' }}
            ></div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'metrics.impressions',
      header: 'Impressions',
      cell: ({ row }: { row: any }) => (
        <span className="text-neutral-300">{row.original.metrics.impressions.toLocaleString()}</span>
      )
    },
    {
      accessorKey: 'metrics.clicks',
      header: 'Clicks',
      cell: ({ row }: { row: any }) => (
        <span className="text-neutral-300">{row.original.metrics.clicks.toLocaleString()}</span>
      )
    },
    {
      accessorKey: 'leads',
      header: 'Leads',
      cell: ({ row }: { row: any }) => (
        <span className="text-blue-400 font-medium">{row.original.leads}</span>
      )
    },
    {
      accessorKey: 'metrics.roas',
      header: 'ROAS',
      cell: ({ row }: { row: any }) => (
        <span className={'font-medium ${
          row.original.metrics.roas >= 4 ? 'text-green-400' :
          row.original.metrics.roas >= 2 ? 'text-yellow-400' : 'text-red-400'
              }'}>'
          {row.original.metrics.roas.toFixed(1)}x
        </span>
      )
    },
    {
      accessorKey: 'revenue',
      header: 'Revenue',
      cell: ({ row }: { row: any }) => (
        <span className="text-green-400 font-medium">
          ${row.original.revenue.toLocaleString()}
        </span>
      )
    }
  ]

  const reviewColumns = [
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center">
          <div className={'w-6 h-6 rounded flex items-center justify-center mr-2 ${
            row.original.platform === 'google' ? 'bg-red-600' :
            row.original.platform === 'yelp' ? 'bg-red-500' :
            row.original.platform === 'facebook' ? 'bg-blue-600' :
            'bg-neutral-600'
              }'}>'
            {row.original.platform === 'google' ? 'G' :
             row.original.platform === 'yelp' ? 'Y' :
             row.original.platform === 'facebook' ? 'F' : 'R'}
          </div>
          <span className="text-neutral-300 capitalize">{row.original.platform}</span>
        </div>
      )
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="text-white">{row.original.customer.name}</div>
          <div className="text-sm text-neutral-400">{row.original.job.serviceDate}</div>
        </div>
      )
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={'h-4 w-4 ${
                star <= row.original.rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-neutral-600'
              }'} '
            />
          ))}
          <span className="ml-2 text-sm text-neutral-300">({row.original.rating})</span>
        </div>
      )
    },
    {
      accessorKey: 'sentiment',
      header: 'Sentiment',
      cell: ({ row }: { row: any }) => (
        <div className={'px-2 py-1 rounded text-sm font-medium ${
          row.original.sentiment === 'positive' ? 'bg-green-800 text-green-200' :
          row.original.sentiment === 'neutral' ? 'bg-yellow-800 text-yellow-200' :
          'bg-red-800 text-red-200'
              }'}>'
          {row.original.sentiment.toUpperCase()}
        </div>
      )
    },
    {
      accessorKey: 'review.title',
      header: 'Review',
      cell: ({ row }: { row: any }) => (
        <div className="max-w-xs">
          <div className="text-white font-medium">{row.original.review.title}</div>
          <div className="text-sm text-neutral-400 truncate">{row.original.review.content}</div>
        </div>
      )
    },
    {
      accessorKey: 'response',
      header: 'Response',
      cell: ({ row }: { row: any }) => (
        <div>
          {row.original.response ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          )}
        </div>
      )
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <ArrowUp className="h-4 w-4 mr-1" />
              12.5%
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.totalLeads}</h3>
            <p className="text-sm text-neutral-400">Total Leads</p>
            <p className="text-xs text-neutral-500">{stats.qualifiedLeads} qualified</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-green-400">
              <Target className="h-6 w-6" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <ArrowUp className="h-4 w-4 mr-1" />
              8.3%
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.conversionRate.toFixed(1)}%</h3>
            <p className="text-sm text-neutral-400">Conversion Rate</p>
            <p className="text-xs text-neutral-500">{stats.wonLeads} closed deals</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-purple-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <ArrowUp className="h-4 w-4 mr-1" />
              15.7%
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">${stats.avgDealSize.toFixed(0)}</h3>
            <p className="text-sm text-neutral-400">Avg Deal Size</p>
            <p className="text-xs text-neutral-500">${stats.totalRevenue.toLocaleString()} total</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-yellow-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <ArrowUp className="h-4 w-4 mr-1" />
              24.1%
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.marketingROI.toFixed(1)}x</h3>
            <p className="text-sm text-neutral-400">Marketing ROI</p>
            <p className="text-xs text-neutral-500">${stats.totalCampaignSpend.toLocaleString()} spent</p>
          </div>
        </div>
      </div>

      {/* Lead Sources Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Lead Sources</h3>
            <PieChart className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-neutral-800/50 rounded-lg">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Lead source breakdown</p>
              <p className="text-xs text-neutral-500 mt-1">{stats.totalLeads} total leads</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
            <BarChart3 className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-neutral-800/50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Campaign ROI comparison</p>
              <p className="text-xs text-neutral-500 mt-1">{campaigns.length} active campaigns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Review Summary</h3>
          <Star className="h-5 w-5 text-neutral-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-yellow-400 fill-current" />
              <span className="text-3xl font-bold text-white ml-2">{stats.avgReviewRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-neutral-400">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalReviews}</div>
            <p className="text-sm text-neutral-400">Total Reviews</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {stats.totalReviews > 0 ? ((stats.positiveReviews / stats.totalReviews) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-sm text-neutral-400">Positive Reviews</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'leads':
        return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Lead Management</h3>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <Button variant="outline" className="bg-neutral-800 border-neutral-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            {(DataTable as any)({
              columns: leadColumns,
              data: leads,
              className: "border-0"
            })}
          </div>
        )
      case 'campaigns':
        return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Campaign Management</h3>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </div>
            {(DataTable as any)({
              columns: campaignColumns,
              data: campaigns,
              className: "border-0"
            })}
          </div>
        )
      case 'reviews':
        return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Review Management</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-neutral-800 border-neutral-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4 mr-2" />
                    Request Review
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-neutral-800/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.avgReviewRating.toFixed(1)}</div>
                  <div className="text-sm text-neutral-400">Avg Rating</div>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.positiveReviews}</div>
                  <div className="text-sm text-neutral-400">Positive</div>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {reviews.filter(r => r.sentiment === 'neutral').length}
                  </div>
                  <div className="text-sm text-neutral-400">Neutral</div>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {reviews.filter(r => r.sentiment === 'negative').length}
                  </div>
                  <div className="text-sm text-neutral-400">Negative</div>
                </div>
              </div>
            </div>
            {(DataTable as any)({
              columns: reviewColumns,
              data: reviews,
              className: "border-0"
            })}
          </div>
        )
      case 'referrals':
        return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Referral Program</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-neutral-800/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Program Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Active Referrers</span>
                      <span className="text-white">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Referrals This Month</span>
                      <span className="text-white">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Conversion Rate</span>
                      <span className="text-green-400">73%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Rewards Paid</span>
                      <span className="text-green-400">$1,250</span>
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Top Referrers</h4>
                  <div className="space-y-3">
                    {['Sarah Johnson', 'Mike Davis', 'Jennifer Lee'].map((name, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium mr-3">
                            {name.split(' ').map(n => n[0]).join(')}
                          </div>
                          <span className="text-white">{name}</span>
                        </div>
                        <span className="text-green-400">{5 - i} referrals</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-4">Referral Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-400">Referrer Reward</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 p-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                      defaultValue="$50 Credit"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400">New Customer Discount</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 p-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                      defaultValue="15% Off First Service"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400">Program Duration</label>
                    <select className="w-full mt-1 p-2 bg-neutral-800 border border-neutral-700 rounded text-white">
                      <option>Ongoing</option>
                      <option>30 Days</option>
                      <option>60 Days</option>
                      <option>90 Days</option>
                    </select>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                    Update Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-925">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Marketing & Customer Acquisition</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Lead generation, campaign management, and customer acquisition analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-neutral-800/50 p-1 rounded-lg">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'leads', label: 'Leads', icon: Users },
              { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
              { key: 'reviews', label: 'Reviews', icon: Star },
              { key: 'referrals', label: 'Referrals', icon: Share2 }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className={activeTab === tab.key 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                }
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin" />
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  )
}