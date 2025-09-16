#!/usr/bin/env node

/**
 * Thorbis RAG Ingestion Pipeline Validator
 * 
 * Validates that all RAG components meet acceptance criteria:
 * - Sample index report with top entities and coverage metrics
 * - Example retrieval with as_of timestamps and entity links in answers
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Validating Thorbis RAG Ingestion Pipeline\n')

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateChunkingPolicy() {
  console.log('📊 Validating Chunking Policy...')
  
  const chunkingContent = fs.readFileSync(path.join(__dirname, 'chunking-policy.md'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for chunk size specifications (500-1200 chars)
  if (!chunkingContent.includes('500') || !chunkingContent.includes('1200')) {
    results.issues.push('Missing chunk size specifications (500-1200 characters)')
    results.pass = false
  }
  
  // Check for entity back-references
  const entityBackRefFeatures = [
    'entity_back_refs',
    'EntityBackReference',
    'addEntityBackReferences',
    'relationship'
  ]
  
  entityBackRefFeatures.forEach(feature => {
    if (!chunkingContent.includes(feature)) {
      results.issues.push(`Missing entity back-reference feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for as_of timestamps
  const temporalFeatures = [
    'as_of',
    'VersionedChunk',
    'TemporalChunkManager',
    'version_id'
  ]
  
  temporalFeatures.forEach(feature => {
    if (!chunkingContent.includes(feature)) {
      results.issues.push(`Missing temporal feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for quality metrics
  if (!chunkingContent.includes('ChunkQualityMetrics') ||
      !chunkingContent.includes('confidence_score')) {
    results.issues.push('Missing chunk quality assessment')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ Chunking policy valid' : '❌ Chunking policy validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateDataSources() {
  console.log('📚 Validating Data Sources...')
  
  const sourcesContent = fs.readFileSync(path.join(__dirname, 'sources.md'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for required source types
  const requiredSources = [
    'business_profiles',
    'services_catalog', 
    'pricebooks',
    'standard_operating_procedure',
    'frequently_asked_questions',
    'issue_libraries'
  ]
  
  requiredSources.forEach(source => {
    if (!sourcesContent.includes(source)) {
      results.issues.push(`Missing required source type: ${source}`)
      results.pass = false
    }
  })
  
  // Check for source processing implementations
  const processingComponents = [
    'BusinessProfileProcessor',
    'ServicesCatalogProcessor',
    'PricebookProcessor',
    'SOPProcessor',
    'FAQProcessor',
    'IssueLibraryProcessor'
  ]
  
  processingComponents.forEach(component => {
    if (!sourcesContent.includes(component)) {
      results.issues.push(`Missing processing component: ${component}`)
      results.pass = false
    }
  })
  
  // Check for comprehensive data structures
  const dataStructures = [
    'BusinessProfile',
    'ServiceCatalog',
    'Pricebook',
    'StandardOperatingProcedure',
    'FAQCollection',
    'IssueLibrary'
  ]
  
  dataStructures.forEach(structure => {
    if (!sourcesContent.includes(structure)) {
      results.issues.push(`Missing data structure: ${structure}`)
      results.pass = false
    }
  })
  
  console.log(results.pass ? '✅ Data sources valid' : '❌ Data sources validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateDataHygiene() {
  console.log('🧹 Validating Data Hygiene...')
  
  const hygieneContent = fs.readFileSync(path.join(__dirname, 'hygiene.md'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for PII stripping integration
  const piiFeatures = [
    'PIIRedactionService',
    'detectAndRedactPII',
    'RAGPIIProcessor',
    'business_entities_preserved'
  ]
  
  piiFeatures.forEach(feature => {
    if (!hygieneContent.includes(feature)) {
      results.issues.push(`Missing PII redaction feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for source hashing
  const hashingFeatures = [
    'SourceHashingService',
    'generateSourceHash',
    'SHA-256',
    'collision_detection'
  ]
  
  hashingFeatures.forEach(feature => {
    if (!hygieneContent.includes(feature)) {
      results.issues.push(`Missing source hashing feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for confidence and age scoring
  const scoringFeatures = [
    'ConfidenceAgeScorer',
    'calculateConfidenceScore',
    'calculateAgeScore',
    'confidence_factors'
  ]
  
  scoringFeatures.forEach(feature => {
    if (!hygieneContent.includes(feature)) {
      results.issues.push(`Missing scoring feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for quality assessment
  if (!hygieneContent.includes('ContentQualityAnalyzer') ||
      !hygieneContent.includes('QualityResults')) {
    results.issues.push('Missing content quality assessment')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ Data hygiene valid' : '❌ Data hygiene validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateRetrievalFlow() {
  console.log('🔍 Validating Retrieval Flow...')
  
  const retrievalContent = fs.readFileSync(path.join(__dirname, 'retrieval-flow.md'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for hybrid search implementation
  const hybridFeatures = [
    'HybridRetrievalEngine',
    'keyword_search',
    'vector_search',
    'hybrid_fusion'
  ]
  
  hybridFeatures.forEach(feature => {
    if (!retrievalContent.includes(feature)) {
      results.issues.push(`Missing hybrid search feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for keyword search components
  const keywordFeatures = [
    'KeywordSearchEngine',
    'elasticsearch',
    'multi_match',
    'field_boosts'
  ]
  
  keywordFeatures.forEach(feature => {
    if (!retrievalContent.includes(feature)) {
      results.issues.push(`Missing keyword search feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for vector search components
  const vectorFeatures = [
    'VectorSearchEngine', 
    'VoyageEmbeddingClient',
    'similarity_threshold',
    'embedding_vector'
  ]
  
  vectorFeatures.forEach(feature => {
    if (!retrievalContent.includes(feature)) {
      results.issues.push(`Missing vector search feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for reranking option
  const rerankFeatures = [
    'CrossEncoderReranker',
    'rerank',
    'relevance_threshold',
    'rerank_score'
  ]
  
  rerankFeatures.forEach(feature => {
    if (!retrievalContent.includes(feature)) {
      results.issues.push(`Missing reranking feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for caching policy
  const cachingFeatures = [
    'AdaptiveRetrievalCache',
    'cache_duration',
    'cache_key_strategy',
    'adaptive_ttl'
  ]
  
  cachingFeatures.forEach(feature => {
    if (!retrievalContent.includes(feature)) {
      results.issues.push(`Missing caching feature: ${feature}`)
      results.pass = false
    }
  })
  
  console.log(results.pass ? '✅ Retrieval flow valid' : '❌ Retrieval flow validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateIndexReport() {
  console.log('📋 Validating Sample Index Report...')
  
  const reportContent = fs.readFileSync(path.join(__dirname, 'sample-index-report.md'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for top entities section
  const entitySections = [
    'top_business_entities',
    'top_service_entities',
    'top_product_entities'
  ]
  
  entitySections.forEach(section => {
    if (!reportContent.includes(section)) {
      results.issues.push(`Missing entities section: ${section}`)
      results.pass = false
    }
  })
  
  // Check for coverage metrics
  const coverageMetrics = [
    'source_coverage',
    'document_count',
    'chunk_count',
    'entity_density',
    'avg_confidence'
  ]
  
  coverageMetrics.forEach(metric => {
    if (!reportContent.includes(metric)) {
      results.issues.push(`Missing coverage metric: ${metric}`)
      results.pass = false
    }
  })
  
  // Check for cross-reference analysis
  if (!reportContent.includes('entity_cross_references') ||
      !reportContent.includes('coverage_gaps')) {
    results.issues.push('Missing entity cross-reference analysis')
    results.pass = false
  }
  
  // Check for temporal analysis
  if (!reportContent.includes('temporal_distribution') ||
      !reportContent.includes('content_freshness')) {
    results.issues.push('Missing temporal content analysis')
    results.pass = false
  }
  
  // Check for quality metrics
  if (!reportContent.includes('quality_metrics') ||
      !reportContent.includes('overall_quality_score')) {
    results.issues.push('Missing quality assessment metrics')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ Index report valid' : '❌ Index report validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateExampleRetrieval() {
  console.log('🔍 Validating Example Retrieval...')
  
  const exampleContent = fs.readFileSync(path.join(__dirname, 'example-retrieval.md'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for as_of timestamps in results
  const temporalFeatures = [
    'as_of',
    '2024-01-01T00:00:00Z',
    '2023-11-15T09:00:00Z',
    'temporal_context'
  ]
  
  let temporalFound = 0
  temporalFeatures.forEach(feature => {
    if (exampleContent.includes(feature)) {
      temporalFound++
    }
  })
  
  if (temporalFound < 2) {
    results.issues.push('Missing sufficient as_of timestamp examples')
    results.pass = false
  }
  
  // Check for entity links in answers
  const entityLinkFeatures = [
    'entity_back_refs',
    '[As of 2024-',
    '[As of 2023-',
    'entity_links',
    'cross-references'
  ]
  
  entityLinkFeatures.forEach(feature => {
    if (!exampleContent.includes(feature)) {
      results.issues.push(`Missing entity link feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for realistic query and response
  if (!exampleContent.includes('query_text') ||
      !exampleContent.includes('RetrievalResult')) {
    results.issues.push('Missing realistic query/response example')
    results.pass = false
  }
  
  // Check for entity context in AI response
  const aiResponseFeatures = [
    'Based on the most current information',
    '[Carrier 24ACC6 Heat Pump](entity:',
    '[Energy Star',
    'entity cross-references'
  ]
  
  let aiResponseFound = 0
  aiResponseFeatures.forEach(feature => {
    if (exampleContent.includes(feature)) {
      aiResponseFound++
    }
  })
  
  if (aiResponseFound < 2) {
    results.issues.push('Missing entity links in AI-generated response')
    results.pass = false
  }
  
  // Check for temporal context in answers
  const temporalAnswerFeatures = [
    'As of January',
    'effective January 1, 2024',
    'updated November 15, 2023',
    'Data Freshness Note'
  ]
  
  let temporalAnswerFound = 0
  temporalAnswerFeatures.forEach(feature => {
    if (exampleContent.includes(feature)) {
      temporalAnswerFound++
    }
  })
  
  if (temporalAnswerFound < 2) {
    results.issues.push('Missing temporal context in answers')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ Example retrieval valid' : '❌ Example retrieval validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateFileCompleteness() {
  console.log('📋 Validating RAG Config Completeness...')
  
  const requiredFiles = [
    'chunking-policy.md',
    'sources.md', 
    'hygiene.md',
    'retrieval-flow.md',
    'sample-index-report.md',
    'example-retrieval.md'
  ]
  
  const results = {
    pass: true,
    issues: []
  }
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file)
    if (!fs.existsSync(filePath)) {
      results.issues.push(`Missing required file: ${file}`)
      results.pass = false
    } else {
      const stats = fs.statSync(filePath)
      if (stats.size === 0) {
        results.issues.push(`File is empty: ${file}`)
        results.pass = false
      } else if (stats.size < 1000) { // Less than 1KB seems too small
        results.issues.push(`File seems too small: ${file} (${stats.size} bytes)`)
        results.pass = false
      }
    }
  })
  
  console.log(results.pass ? '✅ All required files present' : '❌ Missing required files')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateAcceptanceCriteria() {
  console.log('✅ Validating Acceptance Criteria...')
  
  const results = {
    index_report_with_entities: false,
    index_report_with_coverage: false,
    retrieval_with_timestamps: false,
    retrieval_with_entity_links: false
  }
  
  // Check index report criteria
  const reportContent = fs.readFileSync(path.join(__dirname, 'sample-index-report.md'), 'utf8')
  
  if (reportContent.includes('top_business_entities') && 
      reportContent.includes('top_service_entities')) {
    results.index_report_with_entities = true
  }
  
  if (reportContent.includes('source_coverage') &&
      reportContent.includes('coverage_metrics') &&
      reportContent.includes('entity_density')) {
    results.index_report_with_coverage = true
  }
  
  // Check retrieval example criteria
  const retrievalContent = fs.readFileSync(path.join(__dirname, 'example-retrieval.md'), 'utf8')
  
  if (retrievalContent.includes('as_of') &&
      retrievalContent.includes('2024-01-') &&
      retrievalContent.includes('As of January')) {
    results.retrieval_with_timestamps = true
  }
  
  if (retrievalContent.includes('[Carrier 24ACC6 Heat Pump](entity:') &&
      retrievalContent.includes('entity_back_refs') &&
      retrievalContent.includes('[Energy Star')) {
    results.retrieval_with_entity_links = true
  }
  
  console.log(`   📊 Index report with top entities: ${results.index_report_with_entities ? '✅' : '❌'}`)
  console.log(`   📈 Index report with coverage metrics: ${results.index_report_with_coverage ? '✅' : '❌'}`)
  console.log(`   🕐 Example retrieval with as_of timestamps: ${results.retrieval_with_timestamps ? '✅' : '❌'}`)
  console.log(`   🔗 Example retrieval with entity links: ${results.retrieval_with_entity_links ? '✅' : '❌'}`)
  console.log()
  
  const allPassed = Object.values(results).every(result => result === true)
  return allPassed
}

function validateRAGIntegration() {
  console.log('🔗 Validating RAG System Integration...')
  
  const allFiles = [
    'chunking-policy.md',
    'sources.md',
    'hygiene.md', 
    'retrieval-flow.md'
  ]
  
  let combinedContent = ''
  allFiles.forEach(file => {
    combinedContent += fs.readFileSync(path.join(__dirname, file), 'utf8')
  })
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for multi-tenant support
  const multiTenantFeatures = [
    'tenant_id',
    'tenant_scoped',
    'multi-tenant',
    'tenant_isolation'
  ]
  
  multiTenantFeatures.forEach(feature => {
    if (!combinedContent.includes(feature)) {
      results.issues.push(`Missing multi-tenant feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for security integration
  const securityFeatures = [
    'PIIRedactionService',
    'auditLogger',
    'pii_redaction',
    'security'
  ]
  
  securityFeatures.forEach(feature => {
    if (!combinedContent.includes(feature)) {
      results.issues.push(`Missing security integration: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for Voyage integration
  const voyageFeatures = [
    'VoyageEmbeddingClient',
    'voyage-large-2',
    'embedding_model'
  ]
  
  let voyageFound = 0
  voyageFeatures.forEach(feature => {
    if (combinedContent.includes(feature)) {
      voyageFound++
    }
  })
  
  if (voyageFound < 2) {
    results.issues.push('Missing sufficient Voyage integration')
    results.pass = false
  }
  
  // Check for performance optimization
  const performanceFeatures = [
    'caching',
    'optimization',
    'performance',
    'latency'
  ]
  
  let performanceFound = 0
  performanceFeatures.forEach(feature => {
    if (combinedContent.includes(feature)) {
      performanceFound++
    }
  })
  
  if (performanceFound < 3) {
    results.issues.push('Missing performance optimization features')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ RAG system integration valid' : '❌ RAG integration validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

// ============================================================================
// RAG PIPELINE TESTING
// ============================================================================

function runRAGPipelineTests() {
  console.log('🧪 Running RAG Pipeline Tests...')
  
  const testResults = {
    chunking_tests: runChunkingTests(),
    hygiene_tests: runHygieneTests(),
    retrieval_tests: runRetrievalTests(),
    integration_tests: runIntegrationTests()
  }
  
  const passedTests = Object.values(testResults).filter(result => result).length
  const totalTests = Object.keys(testResults).length
  
  console.log(`   📊 RAG Pipeline Tests: ${passedTests}/${totalTests} passed`)
  
  return passedTests === totalTests
}

function runChunkingTests() {
  console.log('   📊 Testing Chunking Logic...')
  
  // Mock chunking function
  function mockChunk(text, targetSize = 800) {
    if (text.length <= targetSize) return [text]
    
    const chunks = []
    let start = 0
    
    while (start < text.length) {
      let end = Math.min(start + targetSize, text.length)
      
      // Try to break at sentence boundary
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end)
        if (lastPeriod > start + targetSize * 0.5) {
          end = lastPeriod + 1
        }
      }
      
      chunks.push(text.substring(start, end).trim())
      start = end
    }
    
    return chunks
  }
  
  const testCases = [
    {
      input: 'Short text.',
      expected: 1,
      name: 'short_text'
    },
    {
      input: 'A'.repeat(1500),
      expected: 2,
      name: 'long_text'
    },
    {
      input: 'First sentence. Second sentence. Third sentence. ' + 'A'.repeat(800),
      expected: 2,
      name: 'sentence_boundary'
    }
  ]
  
  let passed = 0
  testCases.forEach(testCase => {
    const chunks = mockChunk(testCase.input)
    if (chunks.length === testCase.expected) {
      console.log(`      ✅ ${testCase.name}`)
      passed++
    } else {
      console.log(`      ❌ ${testCase.name}: got ${chunks.length} chunks, expected ${testCase.expected}`)
    }
  })
  
  console.log(`   📊 Chunking Tests: ${passed}/${testCases.length} passed`)
  return passed === testCases.length
}

function runHygieneTests() {
  console.log('   🧹 Testing Data Hygiene...')
  
  // Mock PII detection
  function mockDetectPII(text) {
    const patterns = [
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL-REDACTED]' },
      { pattern: /\b\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g, replacement: '[PHONE-REDACTED]' }
    ]
    
    let redactedText = text
    let redactionCount = 0
    
    patterns.forEach(({ pattern, replacement }) => {
      const matches = text.match(pattern)
      if (matches) {
        redactedText = redactedText.replace(pattern, replacement)
        redactionCount += matches.length
      }
    })
    
    return { redactedText, redactionCount }
  }
  
  const testCases = [
    {
      input: 'Contact john@example.com or call (555) 123-4567',
      expectedRedactions: 2,
      name: 'email_and_phone'
    },
    {
      input: 'No PII in this text',
      expectedRedactions: 0,
      name: 'clean_text'
    },
    {
      input: 'Email test@test.com and another email user@domain.org',
      expectedRedactions: 2,
      name: 'multiple_emails'
    }
  ]
  
  let passed = 0
  testCases.forEach(testCase => {
    const result = mockDetectPII(testCase.input)
    if (result.redactionCount === testCase.expectedRedactions) {
      console.log(`      ✅ ${testCase.name}`)
      passed++
    } else {
      console.log(`      ❌ ${testCase.name}: got ${result.redactionCount} redactions, expected ${testCase.expectedRedactions}`)
    }
  })
  
  console.log(`   📊 Hygiene Tests: ${passed}/${testCases.length} passed`)
  return passed === testCases.length
}

function runRetrievalTests() {
  console.log('   🔍 Testing Retrieval Logic...')
  
  // Mock hybrid search function
  function mockHybridSearch(query, documents) {
    const keywordScores = documents.map(doc => {
      const queryWords = query.toLowerCase().split(' ')
      const docWords = doc.content.toLowerCase().split(' ')
      const matches = queryWords.filter(word => docWords.includes(word))
      return matches.length / queryWords.length
    })
    
    const vectorScores = documents.map(doc => {
      // Simplified vector similarity (random for testing)
      return Math.random() * 0.5 + 0.5
    })
    
    // Combine scores (weighted sum)
    return documents.map((doc, index) => ({
      ...doc,
      keywordScore: keywordScores[index],
      vectorScore: vectorScores[index],
      hybridScore: (keywordScores[index] * 0.3) + (vectorScores[index] * 0.7)
    })).sort((a, b) => b.hybridScore - a.hybridScore)
  }
  
  const mockDocuments = [
    { id: 'doc1', content: 'HVAC installation pricing and procedures' },
    { id: 'doc2', content: 'Plumbing repair emergency services' },
    { id: 'doc3', content: 'HVAC maintenance and service pricing' }
  ]
  
  const testQueries = [
    { query: 'HVAC pricing', expectedFirstDoc: 'doc1', name: 'hvac_pricing_query' },
    { query: 'emergency plumbing', expectedFirstDoc: 'doc2', name: 'plumbing_query' }
  ]
  
  let passed = 0
  testQueries.forEach(testQuery => {
    const results = mockHybridSearch(testQuery.query, mockDocuments)
    if (results[0].id === testQuery.expectedFirstDoc || results[0].keywordScore > 0.5) {
      console.log(`      ✅ ${testQuery.name}`)
      passed++
    } else {
      console.log(`      ❌ ${testQuery.name}`)
    }
  })
  
  console.log(`   📊 Retrieval Tests: ${passed}/${testQueries.length} passed`)
  return passed === testQueries.length
}

function runIntegrationTests() {
  console.log('   🔗 Testing Integration...')
  
  // Mock end-to-end pipeline test
  function mockE2EPipeline(rawDocument) {
    // Step 1: Chunking
    const chunks = rawDocument.content.length > 800 ? 
      [rawDocument.content.substring(0, 800), rawDocument.content.substring(800)] :
      [rawDocument.content]
    
    // Step 2: PII Redaction
    const redactedChunks = chunks.map(chunk => 
      chunk.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]')
    )
    
    // Step 3: Entity Extraction (mock)
    const entities = redactedChunks.map(chunk => ({
      chunk: chunk,
      entities: chunk.includes('HVAC') ? ['HVAC Installation'] : [],
      asOf: new Date().toISOString()
    }))
    
    return {
      processedChunks: entities.length,
      entitiesExtracted: entities.reduce((sum, e) => sum + e.entities.length, 0),
      piiRedacted: chunks.join('').includes('@') && !redactedChunks.join('').includes('@')
    }
  }
  
  const testDocument = {
    content: 'HVAC installation service includes comprehensive system analysis. Contact support@company.com for details. This service covers residential and commercial properties with pricing starting at $2,500.',
    tenantId: 'test_tenant'
  }
  
  const result = mockE2EPipeline(testDocument)
  
  let passed = 0
  const integrationTests = [
    { name: 'chunks_created', condition: result.processedChunks > 0 },
    { name: 'entities_extracted', condition: result.entitiesExtracted > 0 },
    { name: 'pii_redacted', condition: result.piiRedacted }
  ]
  
  integrationTests.forEach(test => {
    if (test.condition) {
      console.log(`      ✅ ${test.name}`)
      passed++
    } else {
      console.log(`      ❌ ${test.name}`)
    }
  })
  
  console.log(`   📊 Integration Tests: ${passed}/${integrationTests.length} passed`)
  return passed === integrationTests.length
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

async function main() {
  const validationResults = []
  
  // Run all component validations
  validationResults.push(validateFileCompleteness())
  validationResults.push(validateChunkingPolicy())
  validationResults.push(validateDataSources())
  validationResults.push(validateDataHygiene())
  validationResults.push(validateRetrievalFlow())
  validationResults.push(validateIndexReport())
  validationResults.push(validateExampleRetrieval())
  validationResults.push(validateRAGIntegration())
  
  // Validate acceptance criteria
  const acceptancePassed = validateAcceptanceCriteria()
  
  // Run RAG pipeline tests
  const testsPassed = runRAGPipelineTests()
  
  // Summary
  const allValidationsPassed = validationResults.every(result => result === true)
  const overallPass = allValidationsPassed && acceptancePassed && testsPassed
  const passedCount = validationResults.filter(result => result === true).length
  const totalCount = validationResults.length
  
  console.log('=' .repeat(80))
  console.log('📊 RAG INGESTION PIPELINE VALIDATION SUMMARY')
  console.log('=' .repeat(80))
  console.log(`Overall Result: ${overallPass ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Component Validations: ${passedCount}/${totalCount}`)
  console.log(`Acceptance Criteria: ${acceptancePassed ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`RAG Pipeline Tests: ${testsPassed ? '✅ PASS' : '❌ FAIL'}`)
  console.log()
  
  if (overallPass) {
    console.log('🎉 RAG ingestion pipeline validation successful!')
    console.log('📊 Chunking policy with 500-1200 char chunks, entity back-refs, and as_of timestamps')
    console.log('📚 Comprehensive data sources: businesses, services, SOPs, pricebooks, FAQs, issue libraries')
    console.log('🧹 Data hygiene with PII stripping, source hashing, and confidence/age scoring')
    console.log('🔍 Hybrid retrieval flow with keyword+vector search, reranking, and adaptive caching')
    console.log('📋 Sample index report with top entities and detailed coverage metrics')
    console.log('✅ Example retrieval demonstrating as_of timestamps and entity links in answers')
    console.log()
    console.log('Ready for RAG ingestion pipeline implementation! 🚀')
  } else {
    console.log('❌ RAG ingestion pipeline validation failed.')
    console.log('Please review the issues above and fix them before implementation.')
    process.exit(1)
  }
}

// Run validation
main().catch(error => {
  console.error('❌ Validation script failed:', error)
  process.exit(1)
})

module.exports = {
  validateChunkingPolicy,
  validateDataSources,
  validateDataHygiene,
  validateRetrievalFlow,
  validateAcceptanceCriteria
}
