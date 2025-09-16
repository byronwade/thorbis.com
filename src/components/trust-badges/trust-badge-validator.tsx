"use client"

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Phone, 
  Globe, 
  Building, 
  Award,
  Star,
  Verified,
  Lock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TrustBadge {
  type: string
  level: 'basic' | 'verified' | 'premium' | 'certified'
  score: number
  verified_at: string
  expires_at?: string
  metadata?: Record<string, unknown>
}

interface BusinessVerification {
  business_id: string
  verification_score: number
  trust_badges: TrustBadge[]
  risk_level: 'low' | 'medium' | 'high'
  verification_factors: {
    contact_verification: number
    location_verification: number
    business_verification: number
    compliance_verification: number
    digital_presence_verification: number
    reputation_verification: number
  }
  last_verified: string
  compliance_status: string
}

interface TrustBadgeValidatorProps {
  businessId: string
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
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

const BADGE_COLORS = {
  basic: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  verified: 'bg-blue-100 text-blue-700 border-blue-300',
  premium: 'bg-purple-100 text-purple-700 border-purple-300',
  certified: 'bg-gold-100 text-gold-700 border-gold-300'
}

const RISK_COLORS = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600'
}

export function TrustBadgeValidator({ businessId, showDetails = false, size = 'md' }: TrustBadgeValidatorProps) {
  const [verification, setVerification] = useState<BusinessVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVerificationData()
  }, [businessId])

  const fetchVerificationData = async () => {
    try {
      setLoading(true)
      
      // Fetch business verification data
      const { data, error } = await supabase
        .from('directory.business_submissions')
        .select('
          id,
          verification_score,
          trust_badges,
          risk_level,
          verification_factors,
          verified_at,
          compliance_status,
          ai_verification_results
        ')
        .eq('id', businessId)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setVerification({
          business_id: data.id,
          verification_score: data.verification_score || 0,
          trust_badges: data.trust_badges || [],
          risk_level: data.risk_level || 'medium',
          verification_factors: data.verification_factors || {
            contact_verification: 0,
            location_verification: 0,
            business_verification: 0,
            compliance_verification: 0,
            digital_presence_verification: 0,
            reputation_verification: 0
          },
          last_verified: data.verified_at || new Date().toISOString(),
          compliance_status: data.compliance_status || 'pending'
        })
      }

    } catch (err) {
      console.error('Error fetching verification data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load verification data')
    } finally {
      setLoading(false)
    }
  }

  const getVerificationLevel = (score: number) => {
    if (score >= 90) return 'certified'
    if (score >= 75) return 'premium'
    if (score >= 60) return 'verified'
    return 'basic'
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
      <div className="flex items-center space-x-2 p-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-neutral-600">Loading verification...</span>
      </div>
    )
  }

  if (error || !verification) {
    return (
      <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-700">Unable to verify business credentials</span>
      </div>
    )
  }

  const verificationLevel = getVerificationLevel(verification.verification_score)
  const hasActiveBadges = verification.trust_badges && verification.trust_badges.length > 0

  return (
    <div className="space-y-4">
      {/* Main Trust Score */}
      <Card className="border-2 border-neutral-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Trust Verification</span>
            </CardTitle>
            <Badge variant="outline" className={BADGE_COLORS[verificationLevel]}>
              {verificationLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trust Score Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Trust Score</span>
              <span className="text-lg font-bold text-blue-600">
                {verification.verification_score}/100
              </span>
            </div>
            <Progress 
              value={verification.verification_score} 
              className="h-2"
            />
          </div>

          {/* Risk Assessment */}
          <div className="flex items-center justify-between py-2 border-t">
            <span className="text-sm text-neutral-600">Risk Level</span>
            <span className={'text-sm font-medium ${RISK_COLORS[verification.risk_level]}'}>
              {verification.risk_level.toUpperCase()}
            </span>
          </div>

          {/* Trust Badges */}
          {hasActiveBadges && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-700">Verified Credentials</h4>
              <div className="flex flex-wrap gap-2">
                {verification.trust_badges.map((badge, index) => {
                  const IconComponent = BADGE_ICONS[badge.type as keyof typeof BADGE_ICONS] || CheckCircle
                  const isExpiring = isExpiringSoon(badge.expires_at)
                  
                  return (
                    <div key={index} className="flex items-center">
                      <Badge 
                        variant="outline" 
                        className={'${BADGE_COLORS[badge.level]} flex items-center space-x-1 ${isExpiring ? 'border-yellow-500' : '}'}
                      >
                        <IconComponent className="h-3 w-3" />
                        <span className="text-xs">{formatBadgeName(badge.type)}</span>
                        {isExpiring && (
                          <Clock className="h-3 w-3 text-yellow-600 ml-1" />
                        )}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Last Verified */}
          <div className="flex items-center justify-between text-xs text-neutral-500 border-t pt-2">
            <span>Last verified</span>
            <span>{new Date(verification.last_verified).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Verification Factors */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verification Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(verification.verification_factors).map(([factor, score]) => {
              const factorName = factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              
              return (
                <div key={factor} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700">{factorName}</span>
                    <span className="font-medium">{score}/100</span>
                  </div>
                  <Progress value={score} className="h-1" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Compliance Status */}
      <Card className="bg-neutral-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-neutral-600" />
              <span className="text-sm text-neutral-700">Compliance Status</span>
            </div>
            <Badge 
              variant={verification.compliance_status === 'compliant' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {verification.compliance_status.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TrustBadgeValidator