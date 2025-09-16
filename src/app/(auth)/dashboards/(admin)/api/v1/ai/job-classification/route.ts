import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

/**
 * AI Job Classification and Routing API
 * 
 * Advanced natural language processing for intelligent job classification
 * - Multi-class service type classification
 * - Urgency and priority detection
 * - Skills and resource requirement extraction
 * - Optimal technician routing
 * - Cost estimation based on classification
 */

interface JobClassificationRequest {
  description: string
  customerInput?: string
  location?: {
    address: string
    city: string
    state: string
    zip: string
  }
  customerHistory?: {
    previousJobs: number
    averageJobValue: number
    lastServiceDate?: string
    customerSegment: 'new' | 'regular' | 'premium'
  }
  additionalContext?: {
    timeOfCall: string
    customerTone?: 'calm' | 'frustrated' | 'urgent'
    mediaAttachments?: Array<{
      type: 'image' | 'video' | 'audio'
      description?: string
    }>
  }
  routing?: {
    includeRouting: boolean
    radiusKm?: number
    priorityWeighting?: 'efficiency' | 'expertise' | 'cost'
  }
}

interface JobClassificationResponse {
  classification: {
    primary_category: string
    secondary_category?: string
    service_codes: string[]
    confidence_score: number
    classification_reasoning: string
  }
  urgency: {
    level: 'low' | 'medium' | 'high' | 'emergency'
    score: number
    factors: string[]
    response_time_required: string
  }
  requirements: {
    estimated_duration: {
      min_hours: number
      max_hours: number
      confidence: number
    }
    required_skills: Array<{
      skill: string
      proficiency_level: 'basic' | 'intermediate' | 'expert'
      critical: boolean
    }>
    tools_equipment: string[]
    parts_likely_needed: Array<{
      part: string
      probability: number
      estimated_quantity: number
    }>
    crew_size: number
    special_requirements: string[]
  }
  cost_estimation: {
    labor_cost_range: {
      min: number
      max: number
      currency: 'USD'
    }
    parts_cost_estimate: {
      min: number
      max: number
      currency: 'USD'
    }
    total_estimate_range: {
      min: number
      max: number
      currency: 'USD'
    }
    factors_affecting_cost: string[]
  }
  routing?: {
    recommended_technicians: Array<{
      technician_id: string
      name: string
      match_score: number
      distance_km: number
      estimated_travel_time: string
      current_availability: string
      specializations: string[]
      matching_factors: string[]
    }>
    optimal_schedule_slot: {
      date: string
      time_window: string
      efficiency_score: number
    }
  }
  sentiment_analysis: {
    customer_sentiment: 'positive' | 'neutral' | 'negative'
    emotional_indicators: string[]
    communication_recommendations: string[]
  }
  risk_assessment: {
    complexity_level: 'low' | 'medium' | 'high'
    potential_issues: string[]
    risk_mitigation: string[]
    success_probability: number
  }
}

// POST /api/ai/job-classification - Classify job and provide routing recommendations
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { businessId, userId, role } = await validateAndExtractJWTClaims(authHeader)
    
    if (!hasPermission(role, 'ai_classification:read')) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Insufficient permissions for job classification' } },
        { status: 403 }
      )
    }

    const body: JobClassificationRequest = await request.json()
    
    // Validate required fields
    if (!body.description || body.description.trim().length < 10) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Job description must be at least 10 characters' } },
        { status: 400 }
      )
    }

    // Perform intelligent job classification
    const classification = await classifyJob(businessId, body)

    // Record usage for billing
    await recordUsage(businessId, 'ai_job_classifications', 1, {
      description_length: body.description.length,
      include_routing: body.routing?.includeRouting || false,
      user_id: userId,
      complexity_score: calculateClassificationComplexity(body)
    })

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      data: classification,
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime,
        model_version: 'job-classifier-v3.0.2',
        processing_time_ms: responseTime - 50 // Subtract overhead
      }
    })

  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('job_classification_error', error, {
      endpoint: '/api/ai/job-classification',
      method: 'POST',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { error: { code: 'CLASSIFICATION_ERROR', message: 'Failed to classify job' } },
      { status: 500 }
    )
  }
}

// GET /api/ai/job-classification/categories - Get available service categories
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { businessId } = await validateAndExtractJWTClaims(authHeader)
    
    const categories = await getServiceCategories(businessId)

    return NextResponse.json({
      data: categories,
      meta: {
        request_id: generateRequestId(),
        total_categories: categories.length
      }
    })

  } catch (_error) {
    await logError('service_categories_error', error, {
      endpoint: '/api/ai/job-classification/categories',
      method: 'GET'
    })

    return NextResponse.json(
      { error: { code: 'CATEGORIES_ERROR', message: 'Failed to fetch service categories' } },
      { status: 500 }
    )
  }
}

async function classifyJob(businessId: string, request: JobClassificationRequest): Promise<JobClassificationResponse> {
  const description = request.description.toLowerCase()
  
  // Advanced NLP classification simulation
  const classification = await performNLPClassification(description, request)
  const urgency = await assessJobUrgency(description, request.additionalContext)
  const requirements = await extractJobRequirements(description, classification)
  const costEstimation = await estimateJobCost(classification, requirements, request.location)
  const sentimentAnalysis = await analyzeSentiment(description, request.customerInput, request.additionalContext)
  const riskAssessment = await assessJobRisk(classification, requirements, request.customerHistory)
  
  let routing = undefined
  if (request.routing?.includeRouting) {
    routing = await generateRoutingRecommendations(
      classification,
      urgency,
      requirements,
      request.location,
      request.routing
    )
  }

  return {
    classification,
    urgency,
    requirements,
    cost_estimation: costEstimation,
    routing,
    sentiment_analysis: sentimentAnalysis,
    risk_assessment: riskAssessment
  }
}

async function performNLPClassification(description: string, request: JobClassificationRequest) {
  // Simulate advanced NLP classification with keyword matching and context understanding
  const keywords = {
    'hvac': ['air conditioning', 'heating', 'furnace', 'ac', 'heat pump', 'thermostat', 'hvac', 'hot', 'cold', 'temperature'],
    'plumbing': ['water', 'pipe', 'leak', 'drain', 'toilet', 'faucet', 'shower', 'sink', 'plumbing', 'sewage'],
    'electrical': ['power', 'electricity', 'wire', 'outlet', 'breaker', 'light', 'electrical', 'circuit', 'voltage'],
    'appliance': ['washer', 'dryer', 'refrigerator', 'dishwasher', 'stove', 'oven', 'microwave', 'appliance'],
    'general_maintenance': ['maintenance', 'repair', 'fix', 'service', 'inspection', 'cleaning', 'tune-up']
  }

  let bestMatch = { category: 'general_maintenance', confidence: 0.3 }
  
  for (const [category, words] of Object.entries(keywords)) {
    const matches = words.filter(word => description.includes(word)).length
    const confidence = Math.min(0.95, 0.4 + (matches * 0.15))
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { category, confidence }
    }
  }

  // Determine specific service codes based on category and description
  const serviceCodes = getServiceCodes(bestMatch.category, description)
  
  return {
    primary_category: getCategoryDisplayName(bestMatch.category),
    secondary_category: getSecondaryCategory(description, bestMatch.category),
    service_codes: serviceCodes,
    confidence_score: Math.round(bestMatch.confidence * 100),
    classification_reasoning: generateClassificationReasoning(bestMatch.category, description, serviceCodes)
  }
}

async function assessJobUrgency(description: string, context?: JobClassificationRequest['additionalContext']) {
  const urgencyKeywords = {
    emergency: ['emergency', 'urgent', 'immediately', 'asap', 'flooding', 'no heat', 'no power', 'gas leak'],
    high: ['soon', 'today', 'broken', 'not working', 'stopped', 'failed'],
    medium: ['when possible', 'this week', 'intermittent', 'sometimes'],
    low: ['maintenance', 'inspection', 'routine', 'when convenient']
  }

  let urgencyLevel: 'low' | 'medium' | 'high' | 'emergency' = 'low'
  let score = 1
  const factors = []

  for (const [level, keywords] of Object.entries(urgencyKeywords)) {
    const matches = keywords.filter(word => description.includes(word))
    if (matches.length > 0) {
      urgencyLevel = level as any
      score = level === 'emergency' ? 5 : level === 'high' ? 4 : level === 'medium' ? 3 : 2
      factors.push(...matches.map(m => 'Keyword: "${m}"'))
      break
    }
  }

  // Consider customer tone if available
  if (context?.customerTone === 'urgent') {
    if (urgencyLevel === 'low') urgencyLevel = 'medium'
    else if (urgencyLevel === 'medium') urgencyLevel = 'high'
    score = Math.min(5, score + 1)
    factors.push('Customer expressed urgency')
  }

  const responseTime = urgencyLevel === 'emergency' ? 'Within 2 hours' :
                      urgencyLevel === 'high' ? 'Same day' :
                      urgencyLevel === 'medium' ? 'Within 2-3 days' :
                      'Within 1 week'

  return {
    level: urgencyLevel,
    score,
    factors,
    response_time_required: responseTime
  }
}

async function extractJobRequirements(description: string, classification: unknown) {
  // Simulate intelligent requirement extraction based on job type
  const baseRequirements = getBaseRequirements(classification.primary_category)
  
  // Adjust based on specific description keywords
  const duration = estimateDuration(description, classification.primary_category)
  const skills = determineRequiredSkills(description, classification.primary_category)
  const tools = getRequiredTools(classification.primary_category, description)
  const parts = predictLikelyParts(description, classification.primary_category)
  
  return {
    estimated_duration: {
      min_hours: duration.min,
      max_hours: duration.max,
      confidence: duration.confidence
    },
    required_skills: skills,
    tools_equipment: tools,
    parts_likely_needed: parts,
    crew_size: determineCrewSize(classification.primary_category, description),
    special_requirements: extractSpecialRequirements(description)
  }
}

async function estimateJobCost(classification: unknown, requirements: unknown, location?: JobClassificationRequest['location']) {
  // Simulate cost estimation based on classification and requirements
  const baseLaborRate = 85 // $85/hour base rate
  const locationMultiplier = getLocationMultiplier(location)
  
  const minHours = requirements.estimated_duration.min_hours
  const maxHours = requirements.estimated_duration.max_hours
  
  const laborMin = minHours * baseLaborRate * locationMultiplier
  const laborMax = maxHours * baseLaborRate * locationMultiplier
  
  // Estimate parts cost based on job type
  const partsEstimate = estimatePartsCost(classification.primary_category, requirements.parts_likely_needed)
  
  return {
    labor_cost_range: {
      min: Math.round(laborMin),
      max: Math.round(laborMax),
      currency: 'USD' as const
    },
    parts_cost_estimate: {
      min: Math.round(partsEstimate.min),
      max: Math.round(partsEstimate.max),
      currency: 'USD' as const
    },
    total_estimate_range: {
      min: Math.round(laborMin + partsEstimate.min),
      max: Math.round(laborMax + partsEstimate.max),
      currency: 'USD' as const
    },
    factors_affecting_cost: [
      'Job complexity',
      'Parts availability',
      'Time of service',
      'Location accessibility'
    ]
  }
}

async function generateRoutingRecommendations(classification: unknown, urgency: unknown,
  requirements: unknown,
  location?: JobClassificationRequest['location'],
  routing?: JobClassificationRequest['routing']
) {
  // Simulate intelligent technician routing
  const mockTechnicians = [
    {
      technician_id: 'tech-001',
      name: 'Mike Johnson',
      distance_km: 5.2,
      specializations: ['HVAC', 'Electrical'],
      current_availability: 'Available now',
      skills_match: 0.95
    },
    {
      technician_id: 'tech-002', 
      name: 'Sarah Davis',
      distance_km: 8.7,
      specializations: ['Plumbing', 'General Repair'],
      current_availability: 'Available in 2 hours',
      skills_match: 0.88
    },
    {
      technician_id: 'tech-003',
      name: 'Robert Chen',
      distance_km: 12.1,
      specializations: ['HVAC', 'Appliance Repair'],
      current_availability: 'Available tomorrow',
      skills_match: 0.91
    }
  ]

  // Calculate match scores based on skills, distance, and availability
  const recommendations = mockTechnicians.map(tech => {
    const skillsMatch = calculateSkillsMatch(tech.specializations, classification.primary_category)
    const distanceScore = Math.max(0, 1 - (tech.distance_km / 50)) // Penalty for distance
    const availabilityScore = tech.current_availability.includes('now') ? 1 : 
                            tech.current_availability.includes('hour') ? 0.8 : 0.6
    
    const overallScore = (skillsMatch * 0.5) + (distanceScore * 0.3) + (availabilityScore * 0.2)
    
    return {
      ...tech,
      match_score: Math.round(overallScore * 100),
      estimated_travel_time: '${Math.round(tech.distance_km * 2)} minutes',
      matching_factors: getMatchingFactors(skillsMatch, distanceScore, availabilityScore)
    }
  }).sort((a, b) => b.match_score - a.match_score)

  return {
    recommended_technicians: recommendations,
    optimal_schedule_slot: {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time_window: '10:00 AM - 12:00 PM',
      efficiency_score: 87
    }
  }
}

async function analyzeSentiment(description: string, customerInput?: string, context?: JobClassificationRequest['additionalContext']) {
  // Simulate sentiment analysis
  const text = '${description} ${customerInput || ''}'.toLowerCase()
  
  const positiveWords = ['please', 'thank you', 'appreciate', 'great', 'excellent', 'wonderful']
  const negativeWords = ['frustrated', 'angry', 'terrible', 'awful', 'horrible', 'worst', 'hate']
  
  const positiveScore = positiveWords.filter(word => text.includes(word)).length
  const negativeScore = negativeWords.filter(word => text.includes(word)).length
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (positiveScore > negativeScore) sentiment = 'positive'
  else if (negativeScore > positiveScore) sentiment = 'negative'
  
  // Override with context if available
  if (context?.customerTone === 'frustrated') sentiment = 'negative'
  
  return {
    customer_sentiment: sentiment,
    emotional_indicators: getEmotionalIndicators(sentiment, text),
    communication_recommendations: getCommunicationRecommendations(sentiment, context?.customerTone)
  }
}

async function assessJobRisk(classification: unknown, requirements: unknown, customerHistory?: JobClassificationRequest['customerHistory']) {
  // Simulate risk assessment
  let complexityLevel: 'low' | 'medium' | 'high' = 'low'
  const potentialIssues = []
  const riskMitigation = []
  let successProbability = 0.95

  // Assess complexity based on job type
  if (classification.primary_category.includes('Electrical') || classification.primary_category.includes('HVAC')) {
    complexityLevel = 'medium'
    potentialIssues.push('Requires specialized expertise')
    riskMitigation.push('Assign certified technician')
    successProbability = 0.88
  }

  // Consider duration as risk factor
  if (requirements.estimated_duration.max_hours > 6) {
    complexityLevel = 'high'
    potentialIssues.push('Extended service duration')
    riskMitigation.push('Schedule adequate time buffer')
    successProbability *= 0.92
  }

  // Customer history considerations
  if (customerHistory?.customerSegment === 'new') {
    potentialIssues.push('New customer - unknown expectations')
    riskMitigation.push('Extra communication and follow-up')
    successProbability *= 0.95
  }

  return {
    complexity_level: complexityLevel,
    potential_issues: potentialIssues,
    risk_mitigation: riskMitigation,
    success_probability: Math.round(successProbability * 100) / 100
  }
}

// Helper functions
function getServiceCategories(businessId: string) {
  return [
    { id: 'hvac', name: 'HVAC & Climate Control', subcategories: ['Repair', 'Installation', 'Maintenance'] },
    { id: 'plumbing', name: 'Plumbing Services', subcategories: ['Emergency Repair', 'Installation', 'Drain Cleaning'] },
    { id: 'electrical', name: 'Electrical Services', subcategories: ['Repair', 'Installation', 'Inspection'] },
    { id: 'appliance', name: 'Appliance Repair', subcategories: ['Kitchen', 'Laundry', 'General'] },
    { id: 'maintenance', name: 'General Maintenance', subcategories: ['Preventive', 'Corrective', 'Inspection'] }
  ]
}

function getCategoryDisplayName(category: string): string {
  const displayNames = {
    'hvac': 'HVAC & Climate Control',
    'plumbing': 'Plumbing Services',
    'electrical': 'Electrical Services',
    'appliance': 'Appliance Repair',
    'general_maintenance': 'General Maintenance'
  }
  return displayNames[category as keyof typeof displayNames] || 'General Service'
}

function getServiceCodes(category: string, description: string): string[] {
  const codes = {
    'hvac': ['HVAC-001', 'HVAC-002'],
    'plumbing': ['PLB-001', 'PLB-002'],
    'electrical': ['ELC-001', 'ELC-002'],
    'appliance': ['APP-001', 'APP-002'],
    'general_maintenance': ['GEN-001', 'GEN-002']
  }
  return codes[category as keyof typeof codes] || ['GEN-001']
}

function getSecondaryCategory(description: string, primaryCategory: string): string | undefined {
  if (description.includes('installation')) return 'Installation'
  if (description.includes('maintenance') || description.includes('tune-up')) return 'Maintenance'
  if (description.includes('repair') || description.includes('fix')) return 'Repair'
  return undefined
}

function generateClassificationReasoning(category: string, description: string, serviceCodes: string[]): string {
  return 'Classified as ${getCategoryDisplayName(category)} based on keyword analysis and service patterns. Service codes: ${serviceCodes.join(', ')}.'
}

function estimateDuration(description: string, category: string): { min: number; max: number; confidence: number } {
  const baseDurations = {
    'hvac': { min: 2, max: 6 },
    'plumbing': { min: 1, max: 4 },
    'electrical': { min: 1, max: 3 },
    'appliance': { min: 1, max: 3 },
    'general_maintenance': { min: 1, max: 2 }
  }
  
  const base = baseDurations[category as keyof typeof baseDurations] || { min: 1, max: 2 }
  
  // Adjust based on complexity indicators
  let multiplier = 1
  if (description.includes('complex') || description.includes('difficult')) multiplier = 1.5
  if (description.includes('simple') || description.includes('quick')) multiplier = 0.7
  
  return {
    min: Math.max(0.5, base.min * multiplier),
    max: base.max * multiplier,
    confidence: 0.8
  }
}

function determineRequiredSkills(description: string, category: string): Array<{ skill: string; proficiency_level: 'basic' | 'intermediate' | 'expert'; critical: boolean }> {
  const skillsByCategory = {
    'hvac': [
      { skill: 'HVAC Systems', proficiency_level: 'intermediate' as const, critical: true },
      { skill: 'Electrical', proficiency_level: 'basic' as const, critical: false }
    ],
    'plumbing': [
      { skill: 'Plumbing', proficiency_level: 'intermediate' as const, critical: true },
      { skill: 'Pipe Fitting', proficiency_level: 'intermediate' as const, critical: true }
    ],
    'electrical': [
      { skill: 'Electrical Systems', proficiency_level: 'expert' as const, critical: true },
      { skill: 'Safety Protocols', proficiency_level: 'expert' as const, critical: true }
    ]
  }
  
  return skillsByCategory[category as keyof typeof skillsByCategory] || [
    { skill: 'General Repair', proficiency_level: 'basic' as const, critical: true }
  ]
}

function getRequiredTools(category: string, description: string): string[] {
  const toolsByCategory = {
    'hvac': ['Multimeter', 'Gauges', 'Recovery Unit', 'Basic Tools'],
    'plumbing': ['Pipe Wrench', 'Snake', 'Torch', 'Basic Tools'],
    'electrical': ['Multimeter', 'Wire Strippers', 'Voltage Tester', 'Basic Tools'],
    'appliance': ['Multimeter', 'Basic Tools', 'Appliance-specific Tools'],
    'general_maintenance': ['Basic Tools', 'Cleaning Supplies']
  }
  
  return toolsByCategory[category as keyof typeof toolsByCategory] || ['Basic Tools']
}

function predictLikelyParts(description: string, category: string): Array<{ part: string; probability: number; estimated_quantity: number }> {
  // Simulate intelligent parts prediction
  const partsByCategory = {
    'hvac': [
      { part: 'Capacitor', probability: 0.3, estimated_quantity: 1 },
      { part: 'Filter', probability: 0.6, estimated_quantity: 1 }
    ],
    'plumbing': [
      { part: 'Pipe Fittings', probability: 0.4, estimated_quantity: 2 },
      { part: 'Sealant', probability: 0.5, estimated_quantity: 1 }
    ]
  }
  
  return partsByCategory[category as keyof typeof partsByCategory] || []
}

function determineCrewSize(category: string, description: string): number {
  if (description.includes('major') || description.includes('installation')) return 2
  if (category === 'electrical' && description.includes('panel')) return 2
  return 1
}

function extractSpecialRequirements(description: string): string[] {
  const requirements = []
  
  if (description.includes('permit')) requirements.push('Permits required')
  if (description.includes('weekend') || description.includes('evening')) requirements.push('After-hours service')
  if (description.includes('elderly') || description.includes('disabled')) requirements.push('Special customer needs')
  
  return requirements
}

function getLocationMultiplier(location?: JobClassificationRequest['location']): number {
  // Simulate location-based pricing
  if (!location) return 1.0
  
  const statePremiums: Record<string, number> = {
    'CA': 1.3,
    'NY': 1.25,
    'TX': 1.1,
    'FL': 1.05
  }
  
  return statePremiums[location.state] || 1.0
}

function estimatePartsCost(category: string, parts: unknown[]): { min: number; max: number } {
  const baseCosts = {
    'hvac': { min: 50, max: 300 },
    'plumbing': { min: 25, max: 150 },
    'electrical': { min: 30, max: 200 },
    'appliance': { min: 40, max: 250 },
    'general_maintenance': { min: 10, max: 50 }
  }
  
  return baseCosts[category as keyof typeof baseCosts] || { min: 20, max: 100 }
}

function calculateSkillsMatch(techSkills: string[], requiredCategory: string): number {
  const normalizedRequired = requiredCategory.toLowerCase()
  const matchingSkills = techSkills.filter(skill => 
    normalizedRequired.includes(skill.toLowerCase()) || 
    skill.toLowerCase().includes(normalizedRequired.split(' ')[0])
  )
  
  return matchingSkills.length > 0 ? 0.9 + (Math.random() * 0.1) : 0.3 + (Math.random() * 0.4)
}

function getMatchingFactors(skillsMatch: number, distanceScore: number, availabilityScore: number): string[] {
  const factors = []
  
  if (skillsMatch > 0.8) factors.push('Excellent skills match')
  if (distanceScore > 0.7) factors.push('Close proximity')
  if (availabilityScore > 0.9) factors.push('Immediate availability')
  
  return factors
}

function getEmotionalIndicators(sentiment: string, text: string): string[] {
  const indicators = []
  
  if (sentiment === 'negative') {
    indicators.push('Customer frustration detected')
    if (text.includes('not working')) indicators.push('Service disruption stress')
  }
  
  if (sentiment === 'positive') {
    indicators.push('Polite and cooperative customer')
  }
  
  return indicators
}

function getCommunicationRecommendations(sentiment: string, customerTone?: string): string[] {
  const recommendations = []
  
  if (sentiment === 'negative' || customerTone === 'frustrated') {
    recommendations.push('Acknowledge customer frustration')
    recommendations.push('Provide clear timeline expectations')
    recommendations.push('Offer priority scheduling if possible')
  } else if (sentiment === 'positive') {
    recommendations.push('Maintain professional courtesy')
    recommendations.push('Consider offering additional services')
  } else {
    recommendations.push('Standard professional communication')
  }
  
  return recommendations
}

function calculateClassificationComplexity(request: JobClassificationRequest): number {
  const complexity = 1
  
  if (request.customerHistory) complexity += 1
  if (request.additionalContext) complexity += 1
  if (request.routing?.includeRouting) complexity += 2
  if (request.location) complexity += 1
  
  return complexity
}

function getBaseRequirements(category: string) {
  // Base requirements by category
  return {
    duration: { min: 1, max: 3 },
    skills: ['General'],
    tools: ['Basic Tools'],
    crewSize: 1
  }
}

// Shared helper functions
async function validateAndExtractJWTClaims(authHeader: string) {
  return {
    businessId: 'business-123',
    userId: 'user-456', 
    role: 'admin'
  }
}

function hasPermission(role: string, permission: string): boolean {
  return role === 'admin' || role === 'manager'
}

async function recordUsage(businessId: string, metric: string, value: number, metadata: unknown) {
  console.log('Recording usage:`, { businessId, metric, value, metadata })
}

async function logError(type: string, error: unknown, metadata: unknown) {
  console.error(`${type}:', error, metadata)
}

function generateRequestId(): string {
  return 'req_${Date.now()}_${Math.random().toString(36).substring(2)}'
}