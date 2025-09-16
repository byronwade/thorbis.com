"use client"

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Building, 
  Award,
  Verified,
  Info,
  ExternalLink,
  Clock
} from 'lucide-react'
import { TrustBadgeValidator } from './trust-badge-validator'
import { ComplianceFramework } from './compliance-framework'
import { supabase } from '@/lib/supabase'

interface BusinessTrustData {
  business_id: string
  business_name: string
  verification_score: number
  trust_level: 'unverified' | 'basic' | 'verified' | 'premium' | 'certified'
  trust_badges: Array<{
    type: string
    level: string
    score: number
    verified_at: string
    expires_at?: string
  }>
  risk_assessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    last_updated: string
  }
  compliance_status: {
    frameworks: string[]
    overall_status: string
    last_checked: string
  }
  verification_date: string
  public_profile_url?: string
}

interface BusinessTrustDisplayProps {
  businessId: string
  showDetailedView?: boolean
  showComplianceInfo?: boolean
  compact?: boolean
  className?: string
}

const TRUST_LEVEL_CONFIG = {
  unverified: {
    color: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    icon: Shield,
    description: 'Business not yet verified'
  },
  basic: {
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: CheckCircle,
    description: 'Basic verification completed'
  },
  verified: {
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: Verified,
    description: 'Verified business with validated credentials'
  },
  premium: {
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: Award,
    description: 'Premium verified business with enhanced validation'
  },
  certified: {
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: Award,
    description: 'Certified business with comprehensive verification'
  }
}

const BADGE_ICONS = {
  contact_verified: Phone,
  location_verified: MapPin,
  business_verified: Building,
  compliance_verified: Shield,
  digital_verified: Globe,
  reputation_verified: Star,
  premium_verified: Award,
  certified_business: Verified
}

export function BusinessTrustDisplay({ 
  businessId, 
  showDetailedView = false, 
  showComplianceInfo = false,
  compact = false,
  className = ''
}: BusinessTrustDisplayProps) {
  const [trustData, setTrustData] = useState<BusinessTrustData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchTrustData()
  }, [businessId])

  const fetchTrustData = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('directory.business_submissions')
        .select('
          id,
          business_name,
          verification_score,
          trust_badges,
          risk_level,
          compliance_status,
          compliance_frameworks,
          verified_at,
          website_url,
          ai_verification_results
        ')
        .eq('id', businessId)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        const trustLevel = getTrustLevel(data.verification_score || 0)
        
        setTrustData({
          business_id: data.id,
          business_name: data.business_name,
          verification_score: data.verification_score || 0,
          trust_level: trustLevel,
          trust_badges: data.trust_badges || [],
          risk_assessment: {
            level: data.risk_level || 'medium',
            factors: [],
            last_updated: data.verified_at || new Date().toISOString()
          },
          compliance_status: {
            frameworks: data.compliance_frameworks || [],
            overall_status: data.compliance_status || 'pending',
            last_checked: data.verified_at || new Date().toISOString()
          },
          verification_date: data.verified_at || new Date().toISOString(),
          public_profile_url: data.website_url
        })
      }

    } catch (err) {
      console.error('Error fetching trust data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load trust data')
    } finally {
      setLoading(false)
    }
  }

  const getTrustLevel = (score: number): BusinessTrustData['trust_level'] => {
    if (score >= 95) return 'certified'
    if (score >= 85) return 'premium'
    if (score >= 70) return 'verified'
    if (score >= 50) return 'basic'
    return 'unverified'
  }

  const formatBadgeName = (badgeType: string) => {
    return badgeType.replace(/_/g, ' `).replace(/\b\w/g, l => l.toUpperCase())
  }

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false
    const expiry = new Date(expiresAt)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry <= thirtyDaysFromNow
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 p-4 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-neutral-600">Loading trust data...</span>
      </div>
    )
  }

  if (error || !trustData) {
    return (
      <div className={`p-4 bg-neutral-50 rounded-lg border ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-neutral-600" />
          <span className="text-sm text-neutral-700">Trust information unavailable</span>
        </div>
      </div>
    )
  }

  const trustConfig = TRUST_LEVEL_CONFIG[trustData.trust_level]
  const TrustIcon = trustConfig.icon

  // Compact view for embedding in listings
  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <Badge variant="outline" className={`${trustConfig.color} flex items-center space-x-1'}>
          <TrustIcon className="h-3 w-3" />
          <span className="text-xs font-medium">{trustData.trust_level.toUpperCase()}</span>
        </Badge>
        <span className="text-xs text-neutral-600">{trustData.verification_score}/100</span>
        {trustData.trust_badges.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(true)}
            className="h-6 px-2 text-xs"
          >
            <Info className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={'space-y-4 ${className}'}>
      {/* Main Trust Display */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrustIcon className="h-5 w-5 text-blue-600" />
              <span>Trust Verification</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={trustConfig.color}>
                {trustData.trust_level.replace('_', ' ').toUpperCase()}
              </Badge>
              {showDetailedView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-neutral-600">{trustConfig.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trust Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Trust Score</span>
              <span className="text-xl font-bold text-blue-600">
                {trustData.verification_score}/100
              </span>
            </div>
            <Progress value={trustData.verification_score} className="h-2" />
          </div>

          {/* Trust Badges */}
          {trustData.trust_badges.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-700">Verified Credentials</h4>
              <div className="flex flex-wrap gap-2">
                {trustData.trust_badges.slice(0, 4).map((badge, index) => {
                  const IconComponent = BADGE_ICONS[badge.type as keyof typeof BADGE_ICONS] || CheckCircle
                  const isExpiring = isExpiringSoon(badge.expires_at)
                  
                  return (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className={'flex items-center space-x-1 ${isExpiring ? 'border-yellow-500' : 'border-green-500'}'}
                    >
                      <IconComponent className="h-3 w-3" />
                      <span className="text-xs">{formatBadgeName(badge.type)}</span>
                      {isExpiring && <Clock className="h-3 w-3 text-yellow-600 ml-1" />}
                    </Badge>
                  )
                })}
                {trustData.trust_badges.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{trustData.trust_badges.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          <div className="flex items-center justify-between py-2 border-t">
            <span className="text-sm text-neutral-600">Risk Level</span>
            <Badge 
              variant="outline" 
              className={
                trustData.risk_assessment.level === 'low' 
                  ? 'border-green-500 text-green-700' 
                  : trustData.risk_assessment.level === 'medium'
                  ? 'border-yellow-500 text-yellow-700'
                  : 'border-red-500 text-red-700'
              }
            >
              {trustData.risk_assessment.level.toUpperCase()}
            </Badge>
          </div>

          {/* Verification Date */}
          <div className="flex items-center justify-between text-xs text-neutral-500 border-t pt-2">
            <span>Verified on {new Date(trustData.verification_date).toLocaleDateString()}</span>
            {trustData.public_profile_url && (
              <a 
                href={trustData.public_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-blue-600"
              >
                <span>View Profile</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      {showComplianceInfo && trustData.compliance_status.frameworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trustData.compliance_status.frameworks.map((framework) => (
                <Badge key={framework} variant="outline" className="text-xs">
                  {framework.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Last checked: {new Date(trustData.compliance_status.last_checked).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detailed View Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Trust & Compliance Details - {trustData.business_name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="trust" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trust">Trust Verification</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Framework</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trust" className="space-y-4">
              <TrustBadgeValidator 
                businessId={trustData.business_id} 
                showDetails={true}
              />
            </TabsContent>
            
            <TabsContent value="compliance" className="space-y-4">
              <ComplianceFramework 
                businessId={trustData.business_id}
                frameworkTypes={trustData.compliance_status.frameworks.length > 0 
                  ? trustData.compliance_status.frameworks 
                  : ['general']
                }
                showAuditTrail={true}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BusinessTrustDisplay