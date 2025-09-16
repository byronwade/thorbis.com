import { BusinessSubmission, supabase, AuditService } from '@/lib/supabase';
import { BusinessVerificationAI, VerificationFactor } from './business-verification';
import { buildTrustBadgesFromVerification } from '@/components/business/trust-badges';

/**
 * Comprehensive AI-powered business verification system
 * Integrates with the database schema and AI management queue
 */
export class ComprehensiveBusinessVerification {
  
  /**
   * Process a business submission through the full AI verification pipeline
   */
  static async processBusinessSubmission(submissionId: string) {
    try {
      // Log the start of AI processing
      await AuditService.logActivity({
        action: 'ai_verification_started',
        resource_type: 'business_submission',
        resource_id: submissionId,
        details: { processor: 'comprehensive_ai_verification' }
      });

      // Fetch the business submission
      const { data: submission, error: fetchError } = await supabase
        .from('directory.business_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (fetchError || !submission) {
        throw new Error('Failed to fetch business submission: ${fetchError?.message || 'Not found'}');
      }

      // Run comprehensive AI verification
      const verificationResult = await BusinessVerificationAI.calculateVerificationScore(submission);
      
      // Generate trust badges based on verification results
      const trustBadges = buildTrustBadgesFromVerification(verificationResult, submission);
      
      // Analyze content for search optimization
      const searchOptimization = await this.optimizeForSearch(submission);
      
      // Determine approval status based on verification score and risk factors
      const approvalStatus = this.determineApprovalStatus(verificationResult);
      
      // Update the business submission with AI results
      const { error: updateError } = await supabase
        .from('directory.business_submissions')
        .update({
          verification_score: verificationResult.score,
          trust_badges: trustBadges.map(badge => badge.badge_type),
          risk_level: verificationResult.riskLevel,
          ai_processing_details: {
            factors: verificationResult.factors,
            recommendations: verificationResult.recommendations,
            processing_time: Date.now(),
            model_version: '1.0.0'
          },
          submission_status: approvalStatus.status,
          review_notes: approvalStatus.notes,
          search_keywords: searchOptimization.keywords,
          ai_processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) {
        throw new Error('Failed to update submission: ${updateError.message}');
      }

      // Create trust badge records in the database
      for (const badge of trustBadges) {
        await this.createTrustBadge(submissionId, badge);
      }

      // Record verification result in AI management system
      await this.recordVerificationResult(submissionId, verificationResult, approvalStatus);

      // Schedule follow-up actions if needed
      await this.scheduleFollowUpActions(submissionId, verificationResult, approvalStatus);

      // Log successful completion
      await AuditService.logActivity({
        action: 'ai_verification_completed',
        resource_type: 'business_submission',
        resource_id: submissionId,
        details: {
          verification_score: verificationResult.score,
          risk_level: verificationResult.riskLevel,
          approval_status: approvalStatus.status,
          trust_badges_count: trustBadges.length
        }
      });

      return {
        success: true,
        verificationScore: verificationResult.score,
        riskLevel: verificationResult.riskLevel,
        approvalStatus: approvalStatus.status,
        trustBadges: trustBadges,
        recommendations: verificationResult.recommendations
      };

    } catch (error) {
      // Log error
      await AuditService.logActivity({
        action: 'ai_verification_failed',
        resource_type: 'business_submission',
        resource_id: submissionId,
        details: {
          error_message: error.message,
          error_stack: error.stack
        }
      });

      // Update submission status to indicate processing failure
      await supabase
        .from('directory.business_submissions')
        .update({
          submission_status: 'needs_info',
          review_notes: 'AI verification failed: ${error.message}',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      throw error;
    }
  }

  /**
   * Optimize business information for search and discovery
   */
  static async optimizeForSearch(submission: BusinessSubmission): Promise<{
    keywords: string[];
    searchScore: number;
    seoRecommendations: string[];
  }> {
    const keywords = new Set<string>();
    const seoRecommendations: string[] = [];
    const searchScore = 0;

    // Extract keywords from business name
    const businessNameWords = submission.business_name.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3);
    businessNameWords.forEach(word => keywords.add(word));
    searchScore += businessNameWords.length * 3;

    // Extract keywords from description
    if (submission.business_description) {
      const descriptionWords = submission.business_description.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 4);
      
      // Take top 15 most relevant words
      descriptionWords.slice(0, 15).forEach(word => keywords.add(word));
      searchScore += Math.min(descriptionWords.length, 15) * 2;
      
      if (submission.business_description.length < 100) {
        seoRecommendations.push('Consider expanding your business description for better search visibility');
      }
    }

    // Extract service keywords
    if (submission.primary_services) {
      const serviceWords = submission.primary_services.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 4);
      
      serviceWords.slice(0, 10).forEach(word => keywords.add(word));
      searchScore += Math.min(serviceWords.length, 10) * 2;
    }

    // Add location keywords
    if (submission.city && submission.state_province) {
      keywords.add(submission.city.toLowerCase());
      keywords.add(submission.state_province.toLowerCase());
      searchScore += 4;
    }

    // Add industry-specific keywords
    const industryKeywords = this.getIndustryKeywords(submission.business_category);
    industryKeywords.forEach(keyword => keywords.add(keyword));
    searchScore += industryKeywords.length;

    // SEO recommendations
    if (keywords.size < 10) {
      seoRecommendations.push('Add more specific service descriptions to improve search discoverability');
    }
    
    if (!submission.website_url) {
      seoRecommendations.push('Consider adding a business website to improve credibility and search ranking');
    }

    return {
      keywords: Array.from(keywords).slice(0, 50), // Limit to 50 keywords
      searchScore: Math.min(searchScore, 100),
      seoRecommendations
    };
  }

  /**
   * Get industry-specific keywords for search optimization
   */
  static getIndustryKeywords(category: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'hs': ['home', 'residential', 'repair', 'maintenance', 'service', 'installation'],
      'auto': ['automotive', 'car', 'vehicle', 'auto', 'repair', 'mechanic'],
      'rest': ['restaurant', 'food', 'dining', 'catering', 'delivery', 'takeout'],
      'ret': ['retail', 'store', 'shop', 'shopping', 'merchandise', 'products'],
      'other': ['professional', 'service', 'business', 'commercial']
    };

    return keywordMap[category] || keywordMap['other'];
  }

  /**
   * Determine approval status based on verification results
   */
  static determineApprovalStatus(verificationResult: {
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    factors: VerificationFactor[];
    recommendations: string[];
  }): { status: string; notes: string } {
    
    // Auto-approve high-quality, low-risk submissions
    if (verificationResult.score >= 85 && verificationResult.riskLevel === 'low') {
      return {
        status: 'approved',
        notes: 'Auto-approved based on high verification score and comprehensive information'
      };
    }

    // Auto-approve good quality submissions with minor issues
    if (verificationResult.score >= 75 && verificationResult.riskLevel === 'low') {
      return {
        status: 'approved',
        notes: 'Approved with verification score of ${verificationResult.score}/100. Minor improvements suggested.'
      };
    }

    // Require manual review for medium-risk submissions
    if (verificationResult.riskLevel === 'medium' && verificationResult.score >= 60) {
      return {
        status: 'pending_review',
        notes: 'Manual review required. Verification score: ${verificationResult.score}/100. Review flagged items and recommendations.'
      };
    }

    // Request more information for low-quality or high-risk submissions
    if (verificationResult.score < 60 || verificationResult.riskLevel === 'high') {
      const missingInfo = verificationResult.recommendations.slice(0, 3);
      return {
        status: 'needs_info',
        notes: 'Additional information required. Please address: ${missingInfo.join('; ')}'
      };
    }

    // Default to manual review
    return {
      status: 'pending_review',
      notes: 'Manual review required for verification score of ${verificationResult.score}/100'
    };
  }

  /**
   * Create trust badge records in the database
   */
  static async createTrustBadge(businessId: string, badgeData: unknown) {
    try {
      const { error } = await supabase
        .from('directory.trust_badges')
        .insert({
          business_id: businessId,
          badge_type: badgeData.badge_type,
          badge_name: badgeData.badge_name,
          badge_description: badgeData.badge_description,
          verification_level: badgeData.verification_level,
          verification_date: badgeData.verification_date || new Date().toISOString(),
          expiration_date: badgeData.expiration_date,
          verification_source: badgeData.verification_source || 'ai_verification',
          verification_data: badgeData.verification_data || {},
          is_active: badgeData.is_active !== false,
          display_order: badgeData.display_order || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to create trust badge:', error);
      }
    } catch (error) {
      console.error('Error creating trust badge:', error);
    }
  }

  /**
   * Record verification results in AI management system
   */
  static async recordVerificationResult(
    submissionId: string, verificationResult: unknown,
    approvalStatus: { status: string; notes: string }
  ) {
    try {
      await supabase
        .from('ai_mgmt.verification_results')
        .insert({
          resource_type: 'business_submission',
          resource_id: submissionId,
          verification_type: 'comprehensive_business_verification',
          score: verificationResult.score,
          confidence: 95, // High confidence in our AI system
          details: {
            factors: verificationResult.factors,
            recommendations: verificationResult.recommendations,
            risk_level: verificationResult.riskLevel,
            approval_status: approvalStatus.status
          },
          flags: verificationResult.riskLevel === 'high' ? ['high_risk'] : [],
          model_used: 'comprehensive_business_verifier_v1.0',
          processing_time_ms: Date.now() % 10000, // Simplified timing
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to record verification result:', error);
    }
  }

  /**
   * Schedule follow-up actions based on verification results
   */
  static async scheduleFollowUpActions(
    submissionId: string, verificationResult: unknown,
    approvalStatus: { status: string; notes: string }
  ) {
    try {
      const followUpActions = [];

      // Schedule quality check for approved businesses
      if (approvalStatus.status === 'approved') {
        followUpActions.push({
          queue_type: 'business_quality_check',
          priority: 5,
          payload: {
            submission_id: submissionId,
            check_type: 'post_approval_quality',
            scheduled_days: 7
          },
          scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Schedule re-verification for high-risk businesses
      if (verificationResult.riskLevel === 'high') {
        followUpActions.push({
          queue_type: 'business_re_verification',
          priority: 3,
          payload: {
            submission_id: submissionId,
            verification_type: 'enhanced_verification',
            previous_score: verificationResult.score
          },
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Schedule customer outreach for businesses needing info
      if (approvalStatus.status === 'needs_info') {
        followUpActions.push({
          queue_type: 'customer_communication',
          priority: 4,
          payload: {
            submission_id: submissionId,
            communication_type: 'info_request',
            recommendations: verificationResult.recommendations.slice(0, 5)
          },
          scheduled_for: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        });
      }

      // Insert follow-up actions into the processing queue
      for (const action of followUpActions) {
        await supabase
          .from('ai_mgmt.processing_queue')
          .insert({
            ...action,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

    } catch (error) {
      console.error('Failed to schedule follow-up actions:', error);
    }
  }

  /**
   * Process pending submissions from the AI review queue
   */
  static async processReviewQueue(batchSize: number = 10) {
    try {
      // Fetch pending review items
      const { data: pendingReviews, error } = await supabase
        .from('ai_mgmt.review_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: true })
        .limit(batchSize);

      if (error) {
        throw new Error('Failed to fetch pending reviews: ${error.message}');
      }

      if (!pendingReviews || pendingReviews.length === 0) {
        console.log('No pending reviews to process');
        return { processed: 0, successful: 0, failed: 0 };
      }

      const successful = 0;
      const failed = 0;

      for (const review of pendingReviews) {
        try {
          // Mark as processing
          await supabase
            .from('ai_mgmt.review_queue')
            .update({
              status: 'processing',
              started_at: new Date().toISOString(),
              processor_id: 'comprehensive_ai_verifier',
              updated_at: new Date().toISOString()
            })
            .eq('id', review.id);

          // Process the submission
          const result = await this.processBusinessSubmission(review.submission_id);

          // Mark as completed
          await supabase
            .from('ai_mgmt.review_queue')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              review_results: result,
              updated_at: new Date().toISOString()
            })
            .eq('id', review.id);

          successful++;

        } catch (error) {
          // Mark as failed and increment retry count
          await supabase
            .from('ai_mgmt.review_queue')
            .update({
              status: 'failed',
              error_message: error.message,
              retry_count: (review.retry_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id`, review.id);

          failed++;
          console.error(`Failed to process review ${review.id}:', error);
        }
      }

      console.log('Processed ${pendingReviews.length} reviews: ${successful} successful, ${failed} failed');
      
      return {
        processed: pendingReviews.length,
        successful,
        failed
      };

    } catch (error) {
      console.error('Error processing review queue:', error);
      throw error;
    }
  }
}

/**
 * AI Review Queue Processor - can be run as a scheduled job
 */
export class AIReviewQueueProcessor {
  
  static async runScheduledProcessing() {
    try {
      console.log('Starting scheduled AI review queue processing...');
      
      const result = await ComprehensiveBusinessVerification.processReviewQueue(20);
      
      // Log processing results
      await AuditService.logActivity({
        action: 'ai_queue_processing_completed',
        resource_type: 'ai_processing_queue',
        details: {
          processed: result.processed,
          successful: result.successful,
          failed: result.failed,
          timestamp: new Date().toISOString()
        }
      });

      console.log('Scheduled AI processing completed:', result);
      
      return result;
      
    } catch (error) {
      console.error('Scheduled AI processing failed:', error);
      
      await AuditService.logActivity({
        action: 'ai_queue_processing_failed',
        resource_type: 'ai_processing_queue',
        details: {
          error_message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      
      throw error;
    }
  }
}