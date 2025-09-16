'use client'

import { useState } from 'react'
import { useTrustSystem } from './trust-system-provider'
import { Sparkles, Shield, Zap, Award } from 'lucide-react'

interface AITrustBadgeProps {
  variant?: 'compact' | 'detailed' | 'minimal'
  showVerification?: boolean
  showInsights?: boolean
}

export function AITrustBadge({ 
  variant = 'detailed', 
  showVerification = true,
  showInsights = true 
}: AITrustBadgeProps) {
  const { trustData, loading, verifyBlockchainCredentials } = useTrustSystem()
  const [verifying, setVerifying] = useState(false)

  if (loading || !trustData) {
    return (
      <div className="animate-pulse bg-muted rounded-xl p-4 h-32">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted-foreground/20 rounded w-1/2 mb-2" />
        <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
      </div>
    )
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      await verifyBlockchainCredentials()
    } finally {
      setVerifying(false)
    }
  }

  if (variant === 'minimal') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-md text-sm font-medium border border-primary/30">
        {trustData.blockchainVerification.verified ? (
          <Shield className="w-3 h-3" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        AI Verified • {trustData.trustScore.toFixed(1)}★
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-success/10 border border-primary/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">AI Trust Score</div>
              <div className="text-xs text-muted-foreground">Blockchain Verified</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{trustData.trustScore.toFixed(1)}</div>
            <div className="text-xs text-success font-medium">Excellent</div>
          </div>
        </div>
        
        {showVerification && (
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-all border border-primary/20"
          >
            {verifying ? 'Verifying...' : 'Re-verify Credentials'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 via-success/5 to-warning/5 border border-primary/20 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/30">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">AI Trust Analysis</div>
            <div className="font-bold text-lg flex items-center gap-2">
              <span className="text-foreground">{trustData.trustScore.toFixed(1)}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={'w-4 h-4 ${
                      i < Math.floor(trustData.trustScore) 
                        ? 'text-warning fill-warning' 
                        : 'text-muted-foreground'
                    }'}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Verification Status */}
        {trustData.blockchainVerification.verified && (
          <div className="flex items-center gap-1 px-2 py-1 bg-success/10 border border-success/30 rounded-lg">
            <Shield className="w-3 h-3 text-success" />
            <span className="text-xs font-medium text-success">Blockchain Verified</span>
          </div>
        )}
      </div>

      {/* Trust Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Response Rate</span>
          <span className="text-success font-medium">98%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Jobs Completed</span>
          <span className="font-medium text-foreground">{trustData.trustMetrics.jobsCompleted}+</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Avg Response</span>
          <span className="text-success font-medium">{trustData.trustMetrics.responseTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Experience</span>
          <span className="font-medium text-foreground">{trustData.trustMetrics.experienceYears}+ years</span>
        </div>
      </div>

      {/* AI Insights */}
      {showInsights && trustData.aiInsights && trustData.aiInsights.length > 0 && (
        <div className="border-t border-border/50 pt-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-foreground">AI Insights</span>
          </div>
          <div className="space-y-2">
            {trustData.aiInsights.slice(0, 2).map((insight, index) => (
              <div key={index} className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
                <div className="font-medium text-foreground mb-1">{insight.title}</div>
                <div className="text-xs leading-relaxed">{insight.description}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{insight.dataSource}</span>
                  <div className="flex items-center gap-1">
                    <div className={'w-2 h-2 rounded-full ${
                      insight.confidence > 0.9 ? 'bg-success' : 
                      insight.confidence > 0.7 ? 'bg-warning' : 'bg-muted-foreground'
                    }'} />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(insight.confidence * 100)}% confident
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockchain Verification */}
      {showVerification && (
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Blockchain Credentials</span>
            </div>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 px-2 py-1 rounded transition-all"
            >
              {verifying ? 'Verifying...' : 'Verify Now'}
            </button>
          </div>
          
          {trustData.blockchainVerification.attestations && (
            <div className="mt-2 text-xs text-muted-foreground">
              {trustData.blockchainVerification.attestations.length} verified credentials • 
              Last updated {trustData.blockchainVerification.lastVerification?.toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}