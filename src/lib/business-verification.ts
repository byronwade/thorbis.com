import { BusinessSubmission, TrustBadge, supabase } from '@/lib/supabase';
import { buildTrustBadgesFromVerification } from '@/components/business/trust-badges';

// AI-powered business verification system
export class BusinessVerificationAI {
  
  /**
   * Comprehensive AI verification scoring system
   * Analyzes multiple data points to generate a trust score
   */
  static async calculateVerificationScore(submission: Partial<BusinessSubmission>): Promise<{
    score: number;
    factors: VerificationFactor[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const factors: VerificationFactor[] = [];
    const totalScore = 0;

    // 1. Contact Information Verification (25 points max)
    const contactScore = await this.verifyContactInformation(submission);
    factors.push(contactScore);
    totalScore += contactScore.score;

    // 2. Business Information Completeness (20 points max)
    const completenessScore = this.analyzeCompleteness(submission);
    factors.push(completenessScore);
    totalScore += completenessScore.score;

    // 3. Professional Indicators (20 points max)
    const professionalScore = this.analyzeProfessionalIndicators(submission);
    factors.push(professionalScore);
    totalScore += professionalScore.score;

    // 4. Content Quality Analysis (15 points max)
    const contentScore = await this.analyzeContentQuality(submission);
    factors.push(contentScore);
    totalScore += contentScore.score;

    // 5. Geographical Consistency (10 points max)
    const geoScore = await this.verifyGeographicalConsistency(submission);
    factors.push(geoScore);
    totalScore += geoScore.score;

    // 6. Industry Classification Accuracy (10 points max)
    const industryScore = this.verifyIndustryClassification(submission);
    factors.push(industryScore);
    totalScore += industryScore.score;

    const finalScore = Math.min(totalScore, 100);
    const riskLevel = this.calculateRiskLevel(finalScore);
    const recommendations = this.generateRecommendations(factors);

    return {
      score: finalScore,
      factors,
      recommendations,
      riskLevel
    };
  }

  /**
   * Verify contact information consistency and validity
   */
  private static async verifyContactInformation(submission: Partial<BusinessSubmission>): Promise<VerificationFactor> {
    let score = 0;
    const details: string[] = [];

    // Email verification
    if (submission.primary_email) {
      score += 5; // Basic email presence
      
      // Domain consistency with business name
      if (submission.website_url && submission.business_name) {
        const emailDomain = submission.primary_email.split('@')[1];
        const websiteDomain = submission.website_url.replace(/https?:\/\//, ').split('/')[0];
        
        if (emailDomain === websiteDomain) {
          score += 8;
          details.push('Email domain matches website');
        } else if (submission.business_name.toLowerCase().replace(/[^\w\s-]/g, '').includes(emailDomain.split('.')[0])) {
          score += 5;
          details.push('Email domain relates to business name');
        }
      }
      
      // Check for generic email providers
      const genericProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const emailDomain = submission.primary_email.split('@')[1];
      if (!genericProviders.includes(emailDomain)) {
        score += 3;
        details.push('Professional email domain');
      }
    }

    // Phone number verification
    if (submission.primary_phone) {
      score += 5; // Basic phone presence
      
      // Format validation (basic US format check)
      const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
      if (phoneRegex.test(submission.primary_phone)) {
        score += 4;
        details.push('Valid phone format');
      }
    }

    return {
      category: 'Contact Information',
      score: Math.min(score, 25),
      maxScore: 25,
      details,
      passed: score >= 15
    };
  }

  /**
   * Analyze information completeness
   */
  private static analyzeCompleteness(submission: Partial<BusinessSubmission>): VerificationFactor {
    let score = 0;
    const details: string[] = [];

    const requiredFields = [
      'business_name', 'business_category', 'primary_phone', 
      'primary_email', 'address_line_1', 'city', 'state_province', 
      'postal_code', 'business_description', 'primary_services'
    ];

    const optionalHighValueFields = [
      'website_url', 'years_in_business', 'team_size', 
      'service_area', 'is_licensed', 'is_insured'
    ];

    // Required fields (12 points)
    const filledRequired = requiredFields.filter(field => 
      submission[field as keyof BusinessSubmission] !== null && 
      submission[field as keyof BusinessSubmission] !== undefined &&
      String(submission[field as keyof BusinessSubmission]).trim() !== ''
    );
    
    score += (filledRequired.length / requiredFields.length) * 12;
    details.push('${filledRequired.length}/${requiredFields.length} required fields completed');

    // Optional high-value fields (8 points)
    const filledOptional = optionalHighValueFields.filter(field => 
      submission[field as keyof BusinessSubmission] !== null && 
      submission[field as keyof BusinessSubmission] !== undefined &&
      String(submission[field as keyof BusinessSubmission]).trim() !== '`
    );
    
    score += (filledOptional.length / optionalHighValueFields.length) * 8;
    details.push('${filledOptional.length}/${optionalHighValueFields.length} optional fields completed');

    return {
      category: 'Information Completeness',
      score: Math.min(score, 20),
      maxScore: 20,
      details,
      passed: score >= 14
    };
  }

  /**
   * Analyze professional business indicators
   */
  private static analyzeProfessionalIndicators(submission: Partial<BusinessSubmission>): VerificationFactor {
    let score = 0;
    const details: string[] = [];

    // Business website (5 points)
    if (submission.website_url && submission.website_url.startsWith('http')) {
      score += 5;
      details.push('Professional website provided');
    }

    // Licensed business (5 points)
    if (submission.is_licensed) {
      score += 5;
      details.push('Licensed business');
    }

    // Insured business (5 points)
    if (submission.is_insured) {
      score += 5;
      details.push('Insured business`);
    }

    // Years in business (up to 5 points)
    if (submission.years_in_business) {
      if (submission.years_in_business >= 10) {
        score += 5;
        details.push(`Established business (${submission.years_in_business}+ years)`);
      } else if (submission.years_in_business >= 5) {
        score += 3;
        details.push(`Experienced business (${submission.years_in_business} years)');
      } else if (submission.years_in_business >= 1) {
        score += 1;
        details.push('New business (${submission.years_in_business} years)');
      }
    }

    return {
      category: 'Professional Indicators',
      score: Math.min(score, 20),
      maxScore: 20,
      details,
      passed: score >= 10
    };
  }

  /**
   * AI-powered content quality analysis
   */
  private static async analyzeContentQuality(submission: Partial<BusinessSubmission>): Promise<VerificationFactor> {
    let score = 0;
    const details: string[] = [];

    // Description quality analysis
    if (submission.business_description) {
      const description = submission.business_description;
      
      // Length check
      if (description.length >= 100) {
        score += 3;
        details.push('Comprehensive business description');
      } else if (description.length >= 50) {
        score += 2;
        details.push('Adequate business description');
      }

      // Professional language indicators
      const professionalKeywords = [
        'professional', 'certified', 'licensed', 'experienced', 'quality',
        'service', 'expertise', 'specialist', 'established', 'reliable'
      ];
      
      const foundKeywords = professionalKeywords.filter(keyword => 
        description.toLowerCase().includes(keyword)
      );
      
      if (foundKeywords.length >= 3) {
        score += 4;
        details.push('Professional language used');
      } else if (foundKeywords.length >= 1) {
        score += 2;
        details.push('Some professional language');
      }

      // Grammar and spelling check (simplified)
      const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgWordsPerSentence = description.split(/\s+/).length / sentences.length;
      
      if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) {
        score += 2;
        details.push('Well-structured sentences');
      }
    }

    // Services description quality
    if (submission.primary_services) {
      const services = submission.primary_services;
      
      if (services.length >= 50) {
        score += 3;
        details.push('Detailed service descriptions');
      } else if (services.length >= 20) {
        score += 2;
        details.push('Basic service descriptions');
      }

      // Service specificity (check for specific vs generic terms)
      const specificTerms = ['repair', 'installation', 'maintenance', 'inspection', 
                           'consultation', 'emergency', '24/7', 'warranty'];
      const foundTerms = specificTerms.filter(term => 
        services.toLowerCase().includes(term)
      );
      
      if (foundTerms.length >= 2) {
        score += 3;
        details.push('Specific service offerings');
      }
    }

    return {
      category: 'Content Quality',
      score: Math.min(score, 15),
      maxScore: 15,
      details,
      passed: score >= 8
    };
  }

  /**
   * Verify geographical consistency
   */
  private static async verifyGeographicalConsistency(submission: Partial<BusinessSubmission>): Promise<VerificationFactor> {
    let score = 5; // Base score for having location info
    const details: string[] = ['Location information provided'];

    // Additional verification could include:
    // - ZIP code validation against city/state
    // - Service area reasonableness
    // - Address format validation

    if (submission.postal_code && submission.state_province) {
      // Basic ZIP code format validation
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (zipRegex.test(submission.postal_code)) {
        score += 3;
        details.push('Valid ZIP code format');
      }
    }

    if (submission.service_area) {
      score += 2;
      details.push('Service area specified');
    }

    return {
      category: 'Geographic Consistency',
      score: Math.min(score, 10),
      maxScore: 10,
      details,
      passed: score >= 5
    };
  }

  /**
   * Verify industry classification accuracy
   */
  private static verifyIndustryClassification(submission: Partial<BusinessSubmission>): VerificationFactor {
    let score = 0;
    const details: string[] = [];

    if (!submission.business_category || !submission.business_description) {
      return {
        category: 'Industry Classification',
        score: 0,
        maxScore: 10,
        details: ['Insufficient information for classification'],
        passed: false
      };
    }

    // Industry-specific keyword matching
    const industryKeywords = {
      'hs': ['plumbing', 'hvac', 'electrical', 'heating', 'cooling', 'repair', 'maintenance', 'home', 'residential'],
      'auto': ['automotive', 'car', 'vehicle', 'repair', 'mechanic', 'tire', 'brake', 'engine', 'transmission'],
      'rest': ['restaurant', 'food', 'dining', 'catering', 'menu', 'kitchen', 'chef', 'bar', 'cafe'],
      'ret': ['retail', 'store', 'shop', 'merchandise', 'sales', 'boutique', 'clothing', 'goods'],
      'other': ['professional', 'consulting', 'service', 'business', 'office', 'commercial']
    };

    const category = submission.business_category;
    const description = submission.business_description.toLowerCase();
    const services = submission.primary_services?.toLowerCase() || `;
    
    if (industryKeywords[category as keyof typeof industryKeywords]) {
      const relevantKeywords = industryKeywords[category as keyof typeof industryKeywords];
      const matchedKeywords = relevantKeywords.filter(keyword => 
        description.includes(keyword) || services.includes(keyword)
      );

      if (matchedKeywords.length >= 3) {
        score = 10;
        details.push(`Strong industry alignment (${matchedKeywords.length} matching keywords)');
      } else if (matchedKeywords.length >= 1) {
        score = 6;
        details.push('Moderate industry alignment (${matchedKeywords.length} matching keywords)');
      } else {
        score = 2;
        details.push('Weak industry alignment');
      }
    }

    return {
      category: 'Industry Classification',
      score,
      maxScore: 10,
      details,
      passed: score >= 6
    };
  }

  /**
   * Calculate risk level based on verification score
   */
  private static calculateRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    return 'high';
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(factors: VerificationFactor[]): string[] {
    const recommendations: string[] = [];

    factors.forEach(factor => {
      if (!factor.passed) {
        switch (factor.category) {
          case 'Contact Information':
            recommendations.push('Consider using a professional email domain and ensure contact information is complete');
            break;
          case 'Information Completeness':
            recommendations.push('Complete all required fields and provide additional business details');
            break;
          case 'Professional Indicators':
            recommendations.push('Add professional credentials, licensing information, and business website');
            break;
          case 'Content Quality':
            recommendations.push('Improve business and service descriptions with more detailed, professional language');
            break;
          case 'Geographic Consistency':
            recommendations.push('Verify location information and provide complete address details');
            break;
          case 'Industry Classification':
            recommendations.push('Ensure business description aligns with selected category');
            break;
        }
      }
    });

    return recommendations;
  }

  /**
   * Generate trust badges based on verification results
   */
  static generateTrustBadges(submission: Partial<BusinessSubmission>, verificationScore: number): TrustBadgeData[] {
    const badges: TrustBadgeData[] = [];

    // Basic verification badge
    badges.push({
      badge_type: 'verification',
      badge_name: 'Directory Verified',
      badge_description: 'Business information verified through our directory submission process',
      verification_level: verificationScore >= 80 ? 'verified' : 'basic',
      verification_source: 'ai_verification',
      verification_data: { score: verificationScore }
    });

    // Professional indicators
    if (submission.is_licensed) {
      badges.push({
        badge_type: 'licensing',
        badge_name: 'Licensed Business',
        badge_description: 'Business operates with required licenses',
        verification_level: 'verified',
        verification_source: 'self_reported',
        verification_data: { licensed: true }
      });
    }

    if (submission.is_insured) {
      badges.push({
        badge_type: 'insurance',
        badge_name: 'Insured Business',
        badge_description: 'Business carries appropriate insurance coverage',
        verification_level: 'verified',
        verification_source: 'self_reported',
        verification_data: { insured: true }
      });
    }

    if (submission.offers_emergency_service) {
      badges.push({
        badge_type: 'service',
        badge_name: '24/7 Emergency Service',
        badge_description: 'Provides emergency service availability',
        verification_level: 'basic',
        verification_source: 'self_reported',
        verification_data: { emergency_service: true }
      });
    }

    // Experience badge
    if (submission.years_in_business && submission.years_in_business >= 5) {
      badges.push({
        badge_type: 'experience',
        badge_name: submission.years_in_business >= 10 ? 'Established Business' : 'Experienced Business',
        badge_description: '${submission.years_in_business}+ years in business',
        verification_level: 'verified',
        verification_source: 'self_reported',
        verification_data: { years: submission.years_in_business }
      });
    }

    // Quality score badge
    if (verificationScore >= 85) {
      badges.push({
        badge_type: 'quality',
        badge_name: 'Premium Listing',
        badge_description: 'High-quality business listing with comprehensive information',
        verification_level: 'premium',
        verification_source: 'ai_verification',
        verification_data: { quality_score: verificationScore }
      });
    }

    return badges;
  }
}

// Type definitions
export interface VerificationFactor {
  category: string;
  score: number;
  maxScore: number;
  details: string[];
  passed: boolean;
}

export interface TrustBadgeData {
  badge_type: string;
  badge_name: string;
  badge_description: string;
  verification_level: 'basic' | 'verified' | 'premium';
  verification_source: string;
  verification_data: Record<string, unknown>;
}

// AI Review Queue Processor
export class AIReviewProcessor {
  
  /**
   * Process pending business reviews from the queue
   */
  static async processReviewQueue() {
    try {
      // In a real implementation, this would:
      // 1. Fetch pending reviews from the database
      // 2. Process each review with the AI verification system
      // 3. Update business status based on results
      // 4. Generate notifications and communications
      
      console.log('AI Review Queue processing would happen here');
      
    } catch (error) {
      console.error('Error processing review queue:`, error);
    }
  }
  
  /**
   * Generate automated review report
   */
  static generateReviewReport(verificationResult: unknown, submission: Partial<BusinessSubmission>): string {
    const { score, factors, recommendations, riskLevel } = verificationResult;
    
    const report = `## AI Verification Report\n\n`;
    report += `**Business Name:** ${submission.business_name}\n`;
    report += `**Verification Score:** ${score}/100\n`;
    report += `**Risk Level:** ${riskLevel.toUpperCase()}\n\n`;
    
    report += '### Verification Factors:\n';
    factors.forEach((factor: VerificationFactor) => {
      report += '- **${factor.category}:** ${factor.score}/${factor.maxScore} ${factor.passed ? '✓' : '✗'}\n`;
      factor.details.forEach(detail => {
        report += `  - ${detail}\n`;
      });
    });
    
    if (recommendations.length > 0) {
      report += `\n### Recommendations:\n';
      recommendations.forEach(rec => {
        report += '- ${rec}\n';
      });
    }
    
    return report;
  }
}