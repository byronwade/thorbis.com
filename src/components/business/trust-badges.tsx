'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Shield, 
  ShieldCheck, 
  Award, 
  Clock, 
  Star, 
  Zap,
  CheckCircle,
  Building2,
  CreditCard,
  Users,
  MapPin,
  Phone,
  Globe,
  Verified,
  Lock
} from 'lucide-react';

// Trust badge type definitions
export interface TrustBadgeData {
  id?: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  verification_level: 'basic' | 'verified' | 'premium';
  verification_date: string;
  expiration_date?: string;
  verification_source: string;
  verification_data: Record<string, unknown>;
  is_active: boolean;
  display_order: number;
}

// Badge icon mapping
const getBadgeIcon = (badgeType: string) => {
  const iconMap = {
    verification: Shield,
    licensing: ShieldCheck,
    insurance: Shield,
    service: Clock,
    experience: Award,
    quality: Star,
    emergency: Zap,
    payment: CreditCard,
    location: MapPin,
    contact: Phone,
    professional: Building2,
    premium: Verified,
    security: Lock,
    default: CheckCircle
  };
  
  return iconMap[badgeType as keyof typeof iconMap] || iconMap.default;
};

// Badge color mapping based on verification level
const getBadgeColors = (verificationLevel: string, badgeType: string) => {
  const colorMap = {
    premium: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/50',
    verified: 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 border-green-500/50',
    basic: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/50'
  };
  
  // Special colors for specific badge types
  const specialColors = {
    insurance: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    licensing: 'bg-green-500/20 text-green-400 border-green-500/50',
    emergency: 'bg-red-500/20 text-red-400 border-red-500/50',
    quality: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
  };
  
  return specialColors[badgeType as keyof typeof specialColors] || 
         colorMap[verificationLevel as keyof typeof colorMap] || 
         colorMap.basic;
};

// Individual Trust Badge Component
export const TrustBadge: React.FC<{ badge: TrustBadgeData; variant?: 'default' | 'compact' | 'detailed' }> = ({ 
  badge, 
  variant = 'default' 
}) => {
  const Icon = getBadgeIcon(badge.badge_type);
  const colors = getBadgeColors(badge.verification_level, badge.badge_type);
  
  const badgeContent = (
    <Badge 
      variant="secondary" 
      className={'
        ${colors} 
        ${variant === 'compact' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} 
        border transition-all duration-200 hover:scale-105 cursor-help
      '}
    >
      <Icon className={'${variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} mr-1.5 flex-shrink-0'} />
      <span className="font-medium">{badge.badge_name}</span>
      {badge.verification_level === 'premium' && (
        <Star className="w-3 h-3 ml-1 fill-current" />
      )}
    </Badge>
  );
  
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs bg-neutral-800 border-neutral-700 text-neutral-100">
            <div className="space-y-2">
              <p className="font-medium text-sm">{badge.badge_name}</p>
              <p className="text-xs text-neutral-400">{badge.badge_description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  Verified: {new Date(badge.verification_date).toLocaleDateString()}
                </span>
                <span className={'capitalize font-medium ${
                  badge.verification_level === 'premium' ? 'text-yellow-400' :
                  badge.verification_level === 'verified' ? 'text-green-400' :
                  'text-neutral-400'
                }'}>
                  {badge.verification_level}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (variant === 'detailed`) {
    return (
      <Card className="bg-neutral-800/50 border-neutral-700 p-4">
        <div className="flex items-start space-x-3">
          <div className={'flex h-10 w-10 items-center justify-center rounded-lg border ${colors}'}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-100">{badge.badge_name}</h4>
              <span className={'text-xs px-2 py-1 rounded-full capitalize ${
                badge.verification_level === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                badge.verification_level === 'verified' ? 'bg-green-500/20 text-green-400' :
                'bg-neutral-500/20 text-neutral-400'
              }'}>
                {badge.verification_level}
              </span>
            </div>
            <p className="text-sm text-neutral-400 mb-2">{badge.badge_description}</p>
            <div className="flex items-center text-xs text-neutral-500">
              <span>Verified: {new Date(badge.verification_date).toLocaleDateString()}</span>
              {badge.expiration_date && (
                <>
                  <span className="mx-2">•</span>
                  <span>Expires: {new Date(badge.expiration_date).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-neutral-800 border-neutral-700 text-neutral-100">
          <div className="space-y-2">
            <p className="font-medium text-sm">{badge.badge_name}</p>
            <p className="text-xs text-neutral-400">{badge.badge_description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">
                Verified: {new Date(badge.verification_date).toLocaleDateString()}
              </span>
              <span className={'capitalize font-medium ${
                badge.verification_level === 'premium' ? 'text-yellow-400' :
                badge.verification_level === 'verified' ? 'text-green-400' :
                'text-neutral-400'
              }'}>
                {badge.verification_level}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Trust Badge Collection Component
export const TrustBadgeCollection: React.FC<{
  badges: TrustBadgeData[];
  variant?: 'default' | 'compact' | 'detailed';
  maxVisible?: number;
  showAll?: boolean;
}> = ({ 
  badges, 
  variant = 'default', 
  maxVisible = 6,
  showAll = false 
}) => {
  const activeBadges = badges
    .filter(badge => badge.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  
  const visibleBadges = showAll ? activeBadges : activeBadges.slice(0, maxVisible);
  const hiddenCount = activeBadges.length - visibleBadges.length;
  
  if (activeBadges.length === 0) {
    return null;
  }
  
  if (variant === 'detailed') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-100">Trust & Verification</h3>
          <span className="text-sm text-neutral-400">
            {activeBadges.length} badge{activeBadges.length !== 1 ? 's' : '}
          </span>
        </div>
        <div className="grid gap-3">
          {visibleBadges.map((badge, index) => (
            <TrustBadge key={badge.id || index} badge={badge} variant="detailed" />
          ))}
          {hiddenCount > 0 && (
            <Card className="bg-neutral-800/30 border-neutral-700 border-dashed p-4 text-center">
              <span className="text-sm text-neutral-400">
                +{hiddenCount} more verification{hiddenCount !== 1 ? 's' : '}
              </span>
            </Card>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {visibleBadges.map((badge, index) => (
        <TrustBadge key={badge.id || index} badge={badge} variant={variant} />
      ))}
      {hiddenCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="bg-neutral-500/20 text-neutral-400 border-neutral-500/50 px-3 py-1.5 text-sm cursor-help"
              >
                <Plus className="w-4 h-4 mr-1" />
                {hiddenCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hiddenCount} more verification{hiddenCount !== 1 ? 's' : '}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

// Verification Score Display
export const VerificationScore: React.FC<{
  score: number;
  maxScore?: number;
  showDetails?: boolean;
}> = ({ score, maxScore = 100, showDetails = false }) => {
  const percentage = Math.round((score / maxScore) * 100);
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement`;
  };
  
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-700"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${percentage} 100`}
              className={getScoreColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${getScoreColor(score)}'}>
              {percentage}
            </span>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-neutral-100">Trust Score</div>
          <div className={'text-xs ${getScoreColor(score)}'}>
            {getScoreLabel(score)}
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="text-xs text-neutral-400">
          <div>Verification: {score}/{maxScore}</div>
          <div>Updated recently</div>
        </div>
      )}
    </div>
  );
};

// Business Trust Summary Component
export const BusinessTrustSummary: React.FC<{
  verificationScore: number;
  badges: TrustBadgeData[];
  showScore?: boolean;
  layout?: 'horizontal' | 'vertical';
}> = ({ 
  verificationScore, 
  badges, 
  showScore = true,
  layout = 'horizontal' 
}) => {
  const activeBadges = badges.filter(badge => badge.is_active);
  
  if (layout === 'vertical') {
    return (
      <div className="space-y-4">
        {showScore && (
          <VerificationScore score={verificationScore} showDetails />
        )}
        <TrustBadgeCollection badges={activeBadges} variant="default" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between">
      <TrustBadgeCollection badges={activeBadges} variant="compact" maxVisible={4} />
      {showScore && (
        <VerificationScore score={verificationScore} />
      )}
    </div>
  );
};

// Trust Badge Builder for AI Verification Results
export const buildTrustBadgesFromVerification = (verificationResult: unknown, submissionData: unknown): TrustBadgeData[] => {
  const badges: TrustBadgeData[] = [];
  const displayOrder = 1;
  
  // Directory verification badge
  badges.push({
    badge_type: 'verification',
    badge_name: 'Directory Verified',
    badge_description: 'Business information verified through our comprehensive review process',
    verification_level: verificationResult.score >= 80 ? 'verified' as const : 'basic' as const,
    verification_date: new Date().toISOString(),
    verification_source: 'ai_verification',
    verification_data: { 
      score: verificationResult.score,
      factors: verificationResult.factors?.length || 0 
    },
    is_active: true,
    display_order: displayOrder++
  });
  
  // Professional indicators
  if (submissionData.is_licensed) {
    badges.push({
      badge_type: 'licensing',
      badge_name: 'Licensed Business',
      badge_description: 'Business operates with required professional licenses',
      verification_level: 'verified' as const,
      verification_date: new Date().toISOString(),
      verification_source: 'self_reported',
      verification_data: { licensed: true },
      is_active: true,
      display_order: displayOrder++
    });
  }
  
  if (submissionData.is_insured) {
    badges.push({
      badge_type: 'insurance',
      badge_name: 'Insured Business',
      badge_description: 'Business carries appropriate liability and professional insurance',
      verification_level: 'verified' as const,
      verification_date: new Date().toISOString(),
      verification_source: 'self_reported',
      verification_data: { insured: true },
      is_active: true,
      display_order: displayOrder++
    });
  }
  
  if (submissionData.offers_emergency_service) {
    badges.push({
      badge_type: 'service',
      badge_name: '24/7 Emergency Service',
      badge_description: 'Provides round-the-clock emergency service availability',
      verification_level: 'basic' as const,
      verification_date: new Date().toISOString(),
      verification_source: 'self_reported',
      verification_data: { emergency_service: true },
      is_active: true,
      display_order: displayOrder++
    });
  }
  
  // Experience badge
  if (submissionData.years_in_business && submissionData.years_in_business >= 5) {
    badges.push({
      badge_type: 'experience',
      badge_name: submissionData.years_in_business >= 10 ? 'Established Business' : 'Experienced Business',
      badge_description: '${submissionData.years_in_business}+ years of business experience and service',
      verification_level: 'verified' as const,
      verification_date: new Date().toISOString(),
      verification_source: 'self_reported',
      verification_data: { years: submissionData.years_in_business },
      is_active: true,
      display_order: displayOrder++
    });
  }
  
  // Quality score badge for high performers
  if (verificationResult.score >= 85) {
    badges.push({
      badge_type: 'quality',
      badge_name: 'Premium Listing',
      badge_description: 'High-quality business profile with comprehensive verified information',
      verification_level: 'premium' as const,
      verification_date: new Date().toISOString(),
      verification_source: 'ai_verification',
      verification_data: { quality_score: verificationResult.score },
      is_active: true,
      display_order: displayOrder++
    });
  }
  
  return badges;
};

// Export utility functions
export { getBadgeIcon, getBadgeColors };