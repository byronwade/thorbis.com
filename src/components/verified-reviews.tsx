'use client'

import { useState, useEffect } from 'react'
import { useTrustSystem } from '@/components/trust/trust-system-provider'
import { Shield, Star, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'

interface BlockchainProofOfService {
  transactionHash: string
  blockNumber: number
  contractAddress: string
  serviceDate: Date
  verificationStatus: 'verified' | 'pending' | 'failed'
  gasUsed?: number
}

interface VerifiedReview {
  id: string
  customerId: string
  customerName: string
  customerDid?: string
  rating: number
  title: string
  content: string
  serviceDate: Date
  reviewDate: Date
  verified: boolean
  proofOfService?: BlockchainProofOfService
  serviceType: string
  verificationScore: number
  helpfulCount: number
  photos?: string[]
}

interface VerifiedReviewsProps {
  businessId: string
  maxReviews?: number
  showFilters?: boolean
}

export function VerifiedReviews({ 
  businessId, 
  maxReviews = 10,
  showFilters = true 
}: VerifiedReviewsProps) {
  const { trustData } = useTrustSystem()
  const [reviews, setReviews] = useState<VerifiedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'verified' | 'recent'>('all')
  const [verifyingReview, setVerifyingReview] = useState<string | null>(null)

  useEffect(() => {
    loadReviews()
  }, [businessId, filter])

  const loadReviews = async () => {
    setLoading(true)
    try {
      // Mock reviews with blockchain proof-of-service
      const mockReviews = await getMockReviews(businessId, filter, maxReviews)
      setReviews(mockReviews)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyReview = async (reviewId: string) => {
    setVerifyingReview(reviewId)
    try {
      // Simulate blockchain verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, verified: true, verificationScore: 0.95 }
          : review
      ))
    } catch (error) {
      console.error('Review verification failed:', error)
    } finally {
      setVerifyingReview(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={'w-4 h-4 ${
              i < rating 
                ? 'text-warning fill-warning' 
                : 'text-muted-foreground'
            }'}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted-foreground/20 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-muted-foreground/20 rounded w-32 mb-2" />
                <div className="h-3 bg-muted-foreground/20 rounded w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted-foreground/20 rounded w-full" />
              <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Trust Score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(Math.floor(trustData?.trustScore || 0))}
              <span className="text-lg font-semibold text-foreground">
                {trustData?.trustScore?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-success">
              <Shield className="w-4 h-4" />
              <span>{reviews.filter(r => r.verified).length} blockchain verified</span>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="flex items-center gap-2">
            {['all', 'verified', 'recent'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as typeof filter)}
                className={'px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  filter === filterOption
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary'
                }'}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={'border rounded-xl p-6 transition-all ${
              review.verified 
                ? 'bg-success/5 border-success/30' 
                : 'bg-background border-border'
            }'}
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {review.customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {review.customerName}
                    </span>
                    {review.verified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-success/10 border border-success/30 rounded text-xs text-success">
                        <CheckCircle className="w-3 h-3" />
                        Verified Customer
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Service on {review.serviceDate.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Reviewed {review.reviewDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {renderStars(review.rating)}
                <div className="text-xs text-muted-foreground mt-1">
                  {review.serviceType}
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-4">
              <h4 className="font-medium text-foreground mb-2">
                {review.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {review.content}
              </p>
            </div>

            {/* Blockchain Proof of Service */}
            {review.proofOfService && (
              <div className="border-t border-border/50 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Blockchain Proof of Service
                  </span>
                  <div className={'w-2 h-2 rounded-full ${
                    review.proofOfService.verificationStatus === 'verified' 
                      ? 'bg-success' 
                      : review.proofOfService.verificationStatus === 'pending'
                      ? 'bg-warning'
                      : 'bg-destructive'
                  }'} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Transaction Hash:</span>
                    <div className="font-mono text-foreground mt-1">
                      {review.proofOfService.transactionHash.slice(0, 10)}...
                      {review.proofOfService.transactionHash.slice(-8)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Block Number:</span>
                    <div className="font-mono text-foreground mt-1">
                      #{review.proofOfService.blockNumber.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Actions */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  Helpful ({review.helpfulCount})
                </button>
                {review.photos && review.photos.length > 0 && (
                  <span className="text-muted-foreground">
                    {review.photos.length} photos
                  </span>
                )}
              </div>
              
              {!review.verified && (
                <button
                  onClick={() => verifyReview(review.id)}
                  disabled={verifyingReview === review.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded border border-primary/20 transition-all disabled:opacity-50"
                >
                  {verifyingReview === review.id ? (
                    <>
                      <AlertTriangle className="w-3 h-3 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3" />
                      Verify Review
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {reviews.length === maxReviews && (
        <div className="text-center">
          <button className="px-6 py-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 border border-primary/20 rounded-lg transition-all">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  )
}

// Mock data function - replace with actual API calls
async function getMockReviews(
  businessId: string, 
  filter: string, 
  maxReviews: number
): Promise<VerifiedReview[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const mockReviews: VerifiedReview[] = [
    {
      id: 'review_001',
      customerId: 'customer_001',
      customerName: 'Sarah Johnson',
      customerDid: 'did:thorbis:customer:sarah-johnson',
      rating: 5,
      title: 'Outstanding service and professionalism',
      content: 'The team arrived on time, completed the work efficiently, and left everything spotless. Their attention to detail was impressive, and they went above and beyond to ensure everything was perfect. I would definitely recommend their services to anyone looking for quality work.',
      serviceDate: new Date('2024-01-15'),
      reviewDate: new Date('2024-01-17'),
      verified: true,
      proofOfService: {
        transactionHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef123456789012345678901234',
        blockNumber: 18756432,
        contractAddress: '0x742d35cc6635c0532925a3b8d1c5b3c4c5d5e5f5',
        serviceDate: new Date('2024-01-15'),
        verificationStatus: 'verified',
        gasUsed: 45230
      },
      serviceType: 'Residential Repair',
      verificationScore: 0.98,
      helpfulCount: 12,
      photos: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'
      ]
    },
    {
      id: 'review_002',
      customerId: 'customer_002',
      customerName: 'Michael Chen',
      rating: 4,
      title: 'Great work, minor delay',
      content: 'The quality of work was excellent and the team was very professional. There was a slight delay due to parts availability, but they communicated well throughout the process. Overall very satisfied with the results.',
      serviceDate: new Date('2024-01-10'),
      reviewDate: new Date('2024-01-12'),
      verified: true,
      proofOfService: {
        transactionHash: '0xb2c3d4e5f6789012345678901234567890abcdef123456789012345678901234a',
        blockNumber: 18754891,
        contractAddress: '0x742d35cc6635c0532925a3b8d1c5b3c4c5d5e5f5',
        serviceDate: new Date('2024-01-10'),
        verificationStatus: 'verified',
        gasUsed: 42180
      },
      serviceType: 'Commercial Installation',
      verificationScore: 0.94,
      helpfulCount: 8
    },
    {
      id: 'review_003',
      customerId: 'customer_003',
      customerName: 'Emily Rodriguez',
      rating: 5,
      title: 'Exceeded expectations',
      content: 'From the initial consultation to project completion, everything was handled professionally. The team was knowledgeable, courteous, and delivered results that exceeded our expectations. Highly recommended!',
      serviceDate: new Date('2024-01-08'),
      reviewDate: new Date('2024-01-09'),
      verified: false,
      serviceType: 'Emergency Service',
      verificationScore: 0.76,
      helpfulCount: 5
    }
  ]

  let filteredReviews = mockReviews

  if (filter === 'verified') {
    filteredReviews = mockReviews.filter(review => review.verified)
  } else if (filter === 'recent') {
    filteredReviews = mockReviews.sort((a, b) => 
      b.reviewDate.getTime() - a.reviewDate.getTime()
    )
  }

  return filteredReviews.slice(0, maxReviews)
}