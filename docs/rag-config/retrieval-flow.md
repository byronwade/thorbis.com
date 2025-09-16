# Thorbis RAG Retrieval Flow

Intelligent hybrid retrieval system combining keyword search, vector similarity, reranking, and adaptive caching for optimal query response and relevance.

## 🔍 Retrieval Architecture

### Hybrid Search Strategy
```yaml
retrieval_configuration:
  search_methods:
    keyword_search:
      enabled: true
      weight: 0.3
      min_score_threshold: 0.1
      max_results: 50
      
    vector_search:
      enabled: true
      weight: 0.7
      similarity_threshold: 0.75
      max_results: 100
      
    hybrid_fusion:
      method: "reciprocal_rank_fusion"
      alpha: 0.6                    # Vector search bias
      normalization: "min_max"
      
  reranking:
    enabled: true
    model: "cross_encoder"
    max_candidates: 20
    relevance_threshold: 0.8
    
  caching:
    enabled: true
    cache_duration: "1 hour"
    cache_key_strategy: "query_hash_plus_context"
    max_cache_size: "500MB"
    
  filtering:
    tenant_isolation: true
    temporal_filtering: true
    confidence_threshold: 0.6
    age_relevance_decay: true
```

### Retrieval Pipeline Implementation
```typescript
interface RetrievalQuery {
  query_text: string
  tenant_id: string
  user_context: UserContext
  
  // Search parameters
  max_results?: number
  min_relevance_score?: number
  source_types?: string[]
  date_range?: DateRange
  
  // Retrieval options
  enable_reranking?: boolean
  include_entity_context?: boolean
  expand_with_synonyms?: boolean
  
  // Caching
  cache_key?: string
  bypass_cache?: boolean
}

interface RetrievalResult {
  query_id: string
  results: SearchResult[]
  
  // Metadata
  total_candidates: number
  search_time_ms: number
  rerank_time_ms?: number
  cache_hit: boolean
  
  // Search statistics
  keyword_matches: number
  vector_matches: number
  hybrid_fusion_applied: boolean
  reranking_applied: boolean
  
  // Quality metrics
  average_relevance_score: number
  confidence_distribution: number[]
  temporal_distribution: TemporalDistribution
}

interface SearchResult {
  chunk_id: string
  document_id: string
  source_type: string
  
  // Content
  content: string
  title?: string
  context_summary?: string
  
  // Relevance scoring
  relevance_score: number
  keyword_score: number
  vector_score: number
  rerank_score?: number
  
  // Entity information
  entities: EntityReference[]
  entity_back_refs: EntityBackReference[]
  
  // Temporal information
  as_of: Date
  confidence_score: number
  age_score: number
  
  // Source information
  source_metadata: SourceMetadata
}

class HybridRetrievalEngine {
  constructor(
    private vectorStore: VectorStore,
    private keywordIndex: KeywordIndex,
    private reranker: CrossEncoder,
    private cache: RetrievalCache,
    private entityLinker: EntityLinker
  ) {}
  
  async retrieve(query: RetrievalQuery): Promise<RetrievalResult> {
    const queryId = uuidv4()
    const startTime = Date.now()
    
    // Check cache first
    const cacheKey = this.generateCacheKey(query)
    const cachedResult = await this.cache.get(cacheKey)
    
    if (cachedResult && !query.bypass_cache) {
      return {
        ...cachedResult,
        query_id: queryId,
        cache_hit: true,
        search_time_ms: Date.now() - startTime
      }
    }
    
    // Perform hybrid search
    const searchResults = await this.performHybridSearch(query)
    
    // Apply filtering
    const filteredResults = await this.applyFiltering(searchResults, query)
    
    // Rerank if enabled
    let rankedResults = filteredResults
    let rerankTime = 0
    
    if (query.enable_reranking !== false && filteredResults.length > 5) {
      const rerankStart = Date.now()
      rankedResults = await this.rerank(query.query_text, filteredResults)
      rerankTime = Date.now() - rerankStart
    }
    
    // Limit results
    const finalResults = rankedResults.slice(0, query.max_results || 10)
    
    // Enhance with entity context
    const enhancedResults = await this.enhanceWithEntityContext(finalResults, query)
    
    const result: RetrievalResult = {
      query_id: queryId,
      results: enhancedResults,
      
      total_candidates: searchResults.length,
      search_time_ms: Date.now() - startTime - rerankTime,
      rerank_time_ms: rerankTime > 0 ? rerankTime : undefined,
      cache_hit: false,
      
      keyword_matches: searchResults.filter(r => r.keyword_score > 0).length,
      vector_matches: searchResults.filter(r => r.vector_score > 0).length,
      hybrid_fusion_applied: true,
      reranking_applied: rerankTime > 0,
      
      average_relevance_score: this.calculateAverageScore(finalResults),
      confidence_distribution: this.analyzeConfidenceDistribution(finalResults),
      temporal_distribution: this.analyzeTemporalDistribution(finalResults)
    }
    
    // Cache the result
    await this.cache.set(cacheKey, result, query.tenant_id)
    
    return result
  }
  
  private async performHybridSearch(query: RetrievalQuery): Promise<SearchResult[]> {
    // Parallel execution of keyword and vector search
    const [keywordResults, vectorResults] = await Promise.all([
      this.performKeywordSearch(query),
      this.performVectorSearch(query)
    ])
    
    // Apply hybrid fusion
    return this.fuseSearchResults(keywordResults, vectorResults)
  }
}
```

## 🔤 Keyword Search Implementation

### Full-Text Search with Business Context
```typescript
interface KeywordSearchConfig {
  analyzer: 'standard' | 'business_domain' | 'technical'
  boost_fields: FieldBoostConfig[]
  synonym_expansion: boolean
  fuzzy_matching: boolean
  phrase_matching: boolean
  proximity_scoring: boolean
}

interface FieldBoostConfig {
  field_name: string
  boost_factor: number
  match_type: 'exact' | 'partial' | 'fuzzy'
}

class KeywordSearchEngine {
  // Field boost configuration for keyword search relevance
  private readonly field_boosts = {
    'title': 3.0,
    'content': 1.0,
    'entities': 2.5,
    'tags': 2.0,
    'category': 1.5,
    'summary': 1.8
  }
  
  private readonly FIELD_BOOSTS = {
    'title': 3.0,
    'content': 1.0,
    'entities': 2.5,
    'tags': 2.0,
    'category': 1.5,
    'summary': 1.8
  }
  
  async search(query: RetrievalQuery): Promise<SearchResult[]> {
    // Preprocess query
    const processedQuery = await this.preprocessQuery(query.query_text)
    
    // Build search query with field boosts
    const searchQuery = this.buildElasticsearchQuery(processedQuery, query)
    
    // Execute search
    const searchResponse = await this.elasticsearchClient.search({
      index: this.getIndexName(query.tenant_id),
      body: searchQuery,
      size: 50 // Limit initial candidates
    })
    
    // Convert to SearchResult format
    return this.convertToSearchResults(searchResponse.hits.hits, 'keyword')
  }
  
  private async preprocessQuery(queryText: string): Promise<ProcessedQuery> {
    // Extract business entities from query
    const entities = await this.extractQueryEntities(queryText)
    
    // Expand with business-specific synonyms
    const synonymExpansions = await this.expandWithSynonyms(queryText)
    
    // Identify query intent (question, search, command)
    const queryIntent = await this.classifyQueryIntent(queryText)
    
    return {
      original_text: queryText,
      cleaned_text: this.cleanQuery(queryText),
      entities: entities,
      synonyms: synonymExpansions,
      intent: queryIntent,
      search_terms: this.extractSearchTerms(queryText)
    }
  }
  
  private buildElasticsearchQuery(processedQuery: ProcessedQuery, context: RetrievalQuery): any {
    const should_clauses = []
    
    // Main content search with boosting
    should_clauses.push({
      multi_match: {
        query: processedQuery.cleaned_text,
        fields: Object.entries(this.FIELD_BOOSTS).map(([field, boost]) => `${field}^${boost}`),
        type: 'best_fields',
        fuzziness: 'AUTO',
        prefix_length: 2
      }
    })
    
    // Entity-specific boosting
    for (const entity of processedQuery.entities) {
      should_clauses.push({
        nested: {
          path: 'entities',
          query: {
            bool: {
              should: [
                {
                  match: {
                    'entities.entity_name': {
                      query: entity.name,
                      boost: 3.0
                    }
                  }
                },
                {
                  match: {
                    'entities.entity_type': {
                      query: entity.type,
                      boost: 2.0
                    }
                  }
                }
              ]
            }
          }
        }
      })
    }
    
    // Phrase matching for exact queries
    if (processedQuery.search_terms.length > 1) {
      should_clauses.push({
        match_phrase: {
          content: {
            query: processedQuery.cleaned_text,
            boost: 2.5,
            slop: 2
          }
        }
      })
    }
    
    return {
      query: {
        bool: {
          should: should_clauses,
          minimum_should_match: 1,
          filter: this.buildFilterClauses(context)
        }
      },
      _source: [
        'chunk_id', 'document_id', 'source_type', 'content', 'title',
        'entities', 'entity_back_refs', 'as_of', 'confidence_score',
        'age_score', 'source_metadata'
      ],
      highlight: {
        fields: {
          content: {
            fragment_size: 150,
            number_of_fragments: 2
          },
          title: {}
        }
      }
    }
  }
  
  private buildFilterClauses(context: RetrievalQuery): any[] {
    const filters = []
    
    // Tenant isolation (mandatory)
    filters.push({
      term: { tenant_id: context.tenant_id }
    })
    
    // Source type filtering
    if (context.source_types && context.source_types.length > 0) {
      filters.push({
        terms: { source_type: context.source_types }
      })
    }
    
    // Confidence threshold
    if (context.min_relevance_score) {
      filters.push({
        range: {
          confidence_score: {
            gte: context.min_relevance_score
          }
        }
      })
    }
    
    // Date range filtering
    if (context.date_range) {
      filters.push({
        range: {
          as_of: {
            gte: context.date_range.start,
            lte: context.date_range.end
          }
        }
      })
    }
    
    return filters
  }
}
```

## 🧠 Vector Search Implementation

### Semantic Similarity with Voyage Embeddings
```typescript
interface VectorSearchConfig {
  embedding_model: 'voyage-large-2' | 'voyage-code-2' | 'voyage-lite-02-instruct'
  similarity_metric: 'cosine' | 'dot_product' | 'euclidean'
  vector_dimension: number
  search_algorithm: 'hnsw' | 'ivf' | 'flat'
  
  query_expansion: boolean
  contextual_embeddings: boolean
  multi_vector_search: boolean
}

class VectorSearchEngine {
  constructor(
    private voyageClient: VoyageEmbeddingClient,
    private vectorDb: VectorDatabase,
    private config: VectorSearchConfig
  ) {}
  
  async search(query: RetrievalQuery): Promise<SearchResult[]> {
      // Generate query embedding_vector for vector similarity search
  const queryEmbedding = await this.generateQueryEmbedding(query)
  const embedding_vector = queryEmbedding
    
    // Perform vector similarity search
    const vectorResults = await this.vectorDb.search({
      vector: queryEmbedding,
      top_k: 100,
      similarity_threshold: 0.75,
      filters: this.buildVectorFilters(query)
    })
    
    // Convert to SearchResult format
    return this.convertVectorResultsToSearchResults(vectorResults)
  }
  
  private async generateQueryEmbedding(query: RetrievalQuery): Promise<number[]> {
    let queryText = query.query_text
    
    // Enhance query with user context if available
    if (query.user_context) {
      queryText = await this.enhanceQueryWithContext(queryText, query.user_context)
    }
    
    // Generate embedding using Voyage
    const embeddingResponse = await this.voyageClient.embed({
      input: [queryText],
      model: this.config.embedding_model,
      input_type: 'query'
    })
    
    return embeddingResponse.data[0].embedding
  }
  
  private async enhanceQueryWithContext(queryText: string, context: UserContext): Promise<string> {
    // Add business context to improve retrieval relevance
    let enhancedQuery = queryText
    
    if (context.current_business_type) {
      enhancedQuery += ` [Business type: ${context.current_business_type}]`
    }
    
    if (context.active_services && context.active_services.length > 0) {
      enhancedQuery += ` [Services: ${context.active_services.join(', ')}]`
    }
    
    if (context.user_role) {
      enhancedQuery += ` [Role: ${context.user_role}]`
    }
    
    return enhancedQuery
  }
  
  private buildVectorFilters(query: RetrievalQuery): VectorFilters {
    return {
      tenant_id: query.tenant_id,
      source_types: query.source_types,
      confidence_threshold: query.min_relevance_score || 0.6,
      date_range: query.date_range,
      age_score_threshold: 0.3 // Filter out very old content
    }
  }
}
```

## 🔀 Hybrid Fusion & Ranking

### Reciprocal Rank Fusion Implementation
```typescript
interface FusionConfig {
  method: 'reciprocal_rank_fusion' | 'weighted_sum' | 'linear_combination'
  keyword_weight: number
  vector_weight: number
  rank_constant: number        // K value for RRF
  score_normalization: 'min_max' | 'z_score' | 'none'
}

class HybridFusionEngine {
  constructor(private config: FusionConfig) {}
  
  fuseSearchResults(
    keywordResults: SearchResult[],
    vectorResults: SearchResult[]
  ): SearchResult[] {
    
    switch (this.config.method) {
      case 'reciprocal_rank_fusion':
        return this.reciprocalRankFusion(keywordResults, vectorResults)
      case 'weighted_sum':
        return this.weightedSum(keywordResults, vectorResults)
      case 'linear_combination':
        return this.linearCombination(keywordResults, vectorResults)
      default:
        return this.reciprocalRankFusion(keywordResults, vectorResults)
    }
  }
  
  private reciprocalRankFusion(
    keywordResults: SearchResult[],
    vectorResults: SearchResult[]
  ): SearchResult[] {
    const K = this.config.rank_constant || 60
    const fusedScores = new Map<string, FusedResult>()
    
    // Process keyword results
    keywordResults.forEach((result, rank) => {
      const rrfScore = 1.0 / (K + rank + 1)
      fusedScores.set(result.chunk_id, {
        result: result,
        keyword_rank: rank + 1,
        keyword_rrf: rrfScore,
        vector_rank: null,
        vector_rrf: 0,
        combined_score: rrfScore * this.config.keyword_weight
      })
    })
    
    // Process vector results
    vectorResults.forEach((result, rank) => {
      const rrfScore = 1.0 / (K + rank + 1)
      const existing = fusedScores.get(result.chunk_id)
      
      if (existing) {
        // Result appears in both searches
        existing.vector_rank = rank + 1
        existing.vector_rrf = rrfScore
        existing.combined_score += rrfScore * this.config.vector_weight
        
        // Boost score for results appearing in both searches
        existing.combined_score *= 1.2
      } else {
        // Vector-only result
        fusedScores.set(result.chunk_id, {
          result: result,
          keyword_rank: null,
          keyword_rrf: 0,
          vector_rank: rank + 1,
          vector_rrf: rrfScore,
          combined_score: rrfScore * this.config.vector_weight
        })
      }
    })
    
    // Sort by combined score and convert back to SearchResult
    return Array.from(fusedScores.values())
      .sort((a, b) => b.combined_score - a.combined_score)
      .map(fused => ({
        ...fused.result,
        relevance_score: fused.combined_score,
        keyword_score: fused.keyword_rrf,
        vector_score: fused.vector_rrf
      }))
  }
  
  private linearCombination(
    keywordResults: SearchResult[],
    vectorResults: SearchResult[]
  ): SearchResult[] {
    // Normalize scores first
    const normalizedKeyword = this.normalizeScores(keywordResults, 'keyword_score')
    const normalizedVector = this.normalizeScores(vectorResults, 'vector_score')
    
    const combinedResults = new Map<string, SearchResult>()
    
    // Combine results with weighted scores
    [...normalizedKeyword, ...normalizedVector].forEach(result => {
      const existing = combinedResults.get(result.chunk_id)
      
      if (existing) {
        // Combine scores
        existing.relevance_score = 
          (existing.keyword_score * this.config.keyword_weight) +
          (result.vector_score * this.config.vector_weight)
      } else {
        combinedResults.set(result.chunk_id, {
          ...result,
          relevance_score: 
            (result.keyword_score * this.config.keyword_weight) +
            (result.vector_score * this.config.vector_weight)
        })
      }
    })
    
    return Array.from(combinedResults.values())
      .sort((a, b) => b.relevance_score - a.relevance_score)
  }
}
```

## 🎯 Cross-Encoder Reranking

### Relevance Reranking Implementation
```typescript
interface RerankerConfig {
  model_name: 'ms-marco-MiniLM-L-6-v2' | 'cross-encoder/ms-marco-TinyBERT-L-2-v2'
  batch_size: number
  max_length: number
  relevance_threshold: number
}

class CrossEncoderReranker {
  constructor(private config: RerankerConfig) {}
  
  async rerank(query: string, candidates: SearchResult[]): Promise<SearchResult[]> {
    if (candidates.length === 0) return candidates
    
    // Prepare query-document pairs for reranking
    const pairs = candidates.map(result => ({
      query: query,
      document: this.prepareDocumentText(result),
      original_result: result
    }))
    
    // Batch rerank for efficiency
    const rerankedPairs = []
    for (let i = 0; i < pairs.length; i += this.config.batch_size) {
      const batch = pairs.slice(i, i + this.config.batch_size)
      const batchScores = await this.computeRelevanceScores(batch)
      rerankedPairs.push(...batchScores)
    }
    
    // Filter by relevance threshold and sort
    return rerankedPairs
      .filter(pair => pair.rerank_score >= this.config.relevance_threshold)
      .sort((a, b) => b.rerank_score - a.rerank_score)
      .map(pair => ({
        ...pair.original_result,
        rerank_score: pair.rerank_score,
        relevance_score: this.combineScores(
          pair.original_result.relevance_score,
          pair.rerank_score
        )
      }))
  }
  
  private prepareDocumentText(result: SearchResult): string {
    let documentText = ''
    
    // Include title if available
    if (result.title) {
      documentText += `${result.title}\n\n`
    }
    
    // Main content
    documentText += result.content
    
    // Add entity context
    if (result.entities.length > 0) {
      const entityNames = result.entities.map(e => e.entity_name).join(', ')
      documentText += `\n\nEntities: ${entityNames}`
    }
    
    // Add source metadata context
    if (result.source_metadata) {
      documentText += `\n\nSource: ${result.source_type}`
    }
    
    // Truncate if too long
    if (documentText.length > this.config.max_length) {
      documentText = documentText.substring(0, this.config.max_length) + '...'
    }
    
    return documentText
  }
  
  private async computeRelevanceScores(pairs: QueryDocumentPair[]): Promise<RerankedPair[]> {
    // This would use a cross-encoder model like Hugging Face transformers
    // For now, we'll simulate with a scoring function
    return pairs.map(pair => ({
      ...pair,
      rerank_score: this.simulateRelevanceScore(pair.query, pair.document)
    }))
  }
  
  private combineScores(originalScore: number, rerankScore: number): number {
    // Combine original hybrid score with reranker score
    return (originalScore * 0.3) + (rerankScore * 0.7)
  }
}
```

## 💾 Adaptive Caching System

### Intelligent Query Result Caching
```typescript
interface CacheConfig {
  cache_duration_default: number        // Default TTL in seconds
  cache_size_limit: number             // Max cache size in bytes
  cache_key_strategy: 'simple' | 'contextual' | 'semantic'
  
  adaptive_ttl: boolean                // Adjust TTL based on query patterns
  cache_warming: boolean               // Pre-populate cache with common queries
  cache_invalidation: 'time_based' | 'event_based' | 'hybrid'
}

interface CacheEntry {
  cache_key: string
  query_hash: string
  result: RetrievalResult
  
  // Cache metadata
  cached_at: Date
  expires_at: Date
  access_count: number
  last_accessed: Date
  
  // Cache optimization
  cache_score: number                  // How valuable this cache entry is
  invalidation_triggers: string[]     // Events that should invalidate this cache
  
  // Context
  tenant_id: string
  user_context_hash?: string
  query_context: QueryContext
}

class AdaptiveRetrievalCache {
  private cache: Map<string, CacheEntry> = new Map()
  private accessPatterns: Map<string, QueryPattern> = new Map()
  
  constructor(private config: CacheConfig) {
    this.startCacheMaintenanceLoop()
  }
  
  async get(query: RetrievalQuery): Promise<RetrievalResult | null> {
    const cacheKey = this.generateCacheKey(query)
    const entry = this.cache.get(cacheKey)
    
    if (!entry) return null
    
    // Check if entry is expired
    if (entry.expires_at < new Date()) {
      this.cache.delete(cacheKey)
      return null
    }
    
    // Update access statistics
    entry.access_count++
    entry.last_accessed = new Date()
    
    // Track access pattern for adaptive TTL
    this.recordAccess(cacheKey, query)
    
    return entry.result
  }
  
  async set(
    query: RetrievalQuery, 
    result: RetrievalResult, 
    customTtl?: number
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(query)
    
    // Calculate adaptive TTL
    const ttl = customTtl || this.calculateAdaptiveTTL(query, result)
    
    const entry: CacheEntry = {
      cache_key: cacheKey,
      query_hash: this.hashQuery(query.query_text),
      result: result,
      
      cached_at: new Date(),
      expires_at: new Date(Date.now() + (ttl * 1000)),
      access_count: 0,
      last_accessed: new Date(),
      
      cache_score: this.calculateCacheScore(query, result),
      invalidation_triggers: this.determineInvalidationTriggers(query),
      
      tenant_id: query.tenant_id,
      user_context_hash: query.user_context ? this.hashContext(query.user_context) : undefined,
      query_context: {
        source_types: query.source_types || [],
        date_range: query.date_range,
        user_role: query.user_context?.user_role
      }
    }
    
    // Check cache size limits
    await this.ensureCacheSize()
    
    this.cache.set(cacheKey, entry)
  }
  
  private generateCacheKey(query: RetrievalQuery): string {
    const keyComponents = [
      query.tenant_id,
      this.hashQuery(query.query_text)
    ]
    
    // Include context in cache key based on strategy
    if (this.config.cache_key_strategy === 'contextual') {
      keyComponents.push(
        (query.source_types || []).sort().join(','),
        query.min_relevance_score?.toString() || '',
        query.user_context?.user_role || ''
      )
    } else if (this.config.cache_key_strategy === 'semantic') {
      // Include semantic context
      keyComponents.push(
        this.generateSemanticContext(query)
      )
    }
    
    return crypto
      .createHash('sha256')
      .update(keyComponents.join('|'))
      .digest('hex')
  }
  
  private calculateAdaptiveTTL(query: RetrievalQuery, result: RetrievalResult): number {
    let baseTtl = this.config.cache_duration_default
    
    // Longer TTL for high-confidence results
    if (result.average_relevance_score > 0.9) {
      baseTtl *= 1.5
    }
    
    // Shorter TTL for dynamic content types
    const dynamicSources = ['pricebook', 'faq', 'issue_library']
    if (query.source_types?.some(type => dynamicSources.includes(type))) {
      baseTtl *= 0.5
    }
    
    // Adjust based on historical access patterns
    const queryPattern = this.getQueryPattern(query.query_text)
    if (queryPattern && queryPattern.access_frequency > 10) {
      baseTtl *= 1.3 // Longer TTL for frequently accessed queries
    }
    
    // Adjust based on result age
    const avgAge = this.calculateAverageResultAge(result)
    if (avgAge > 180) { // Results older than 6 months
      baseTtl *= 0.7
    }
    
    return Math.min(baseTtl, 24 * 60 * 60) // Max 24 hours
  }
  
  private calculateCacheScore(query: RetrievalQuery, result: RetrievalResult): number {
    let score = 0.5 // Base score
    
    // Higher score for better results
    score += result.average_relevance_score * 0.3
    
    // Higher score for faster queries
    if (result.search_time_ms < 500) {
      score += 0.1
    }
    
    // Higher score for queries with many good results
    if (result.results.length >= 5 && result.average_relevance_score > 0.8) {
      score += 0.2
    }
    
    // Lower score for very specific queries (less likely to be reused)
    const querySpecificity = this.calculateQuerySpecificity(query.query_text)
    score -= querySpecificity * 0.1
    
    return Math.min(1.0, Math.max(0.1, score))
  }
  
  async invalidateByTrigger(trigger: string, context?: any): Promise<number> {
    let invalidatedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.invalidation_triggers.includes(trigger)) {
        // Check if context matches for more precise invalidation
        if (this.shouldInvalidate(entry, trigger, context)) {
          this.cache.delete(key)
          invalidatedCount++
        }
      }
    }
    
    return invalidatedCount
  }
  
  private startCacheMaintenanceLoop(): void {
    setInterval(() => {
      this.performCacheMaintenance()
    }, 5 * 60 * 1000) // Every 5 minutes
  }
  
  private performCacheMaintenance(): void {
    const now = new Date()
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires_at < now) {
        this.cache.delete(key)
      }
    }
    
    // Evict low-value entries if cache is too large
    this.evictLowValueEntries()
    
    // Update access patterns
    this.updateAccessPatterns()
  }
  
  private evictLowValueEntries(): void {
    if (this.getCacheSize() <= this.config.cache_size_limit) {
      return
    }
    
    // Sort entries by cache score (ascending)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.cache_score - b.cache_score)
    
    // Evict bottom 20% of entries
    const evictCount = Math.ceil(entries.length * 0.2)
    for (let i = 0; i < evictCount; i++) {
      this.cache.delete(entries[i][0])
    }
  }
}
```

## 📊 Retrieval Performance Optimization

### Query Optimization & Analytics
```typescript
interface RetrievalAnalytics {
  query_performance: QueryPerformanceMetrics
  cache_efficiency: CacheEfficiencyMetrics
  relevance_quality: RelevanceQualityMetrics
  user_satisfaction: UserSatisfactionMetrics
}

class RetrievalOptimizer {
  async optimizeRetrievalPipeline(): Promise<OptimizationReport> {
    const analytics = await this.gatherAnalytics()
    const optimizations: Optimization[] = []
    
    // Analyze query performance
    if (analytics.query_performance.average_latency > 1000) {
      optimizations.push({
        type: 'performance',
        priority: 'high',
        suggestion: 'Implement query result caching',
        expected_improvement: '50% latency reduction'
      })
    }
    
    // Analyze cache efficiency
    if (analytics.cache_efficiency.hit_rate < 0.6) {
      optimizations.push({
        type: 'caching',
        priority: 'medium', 
        suggestion: 'Improve cache key strategy and TTL tuning',
        expected_improvement: '30% cache hit rate increase'
      })
    }
    
    // Analyze relevance quality
    if (analytics.relevance_quality.average_score < 0.75) {
      optimizations.push({
        type: 'relevance',
        priority: 'high',
        suggestion: 'Retune hybrid search weights and enable reranking',
        expected_improvement: '20% relevance improvement'
      })
    }
    
    return {
      current_performance: analytics,
      optimizations: optimizations,
      estimated_impact: this.calculateEstimatedImpact(optimizations)
    }
  }
  
  async tunehybridsearchweights(queries: RetrievalQuery[]): Promise<OptimalWeights> {
    // A/B test different weight combinations
    const weightCombinations = [
      { keyword: 0.3, vector: 0.7 },
      { keyword: 0.4, vector: 0.6 },
      { keyword: 0.2, vector: 0.8 },
      { keyword: 0.5, vector: 0.5 }
    ]
    
    const results = await Promise.all(
      weightCombinations.map(async (weights) => {
        const scores = await this.testWeights(weights, queries)
        return {
          weights: weights,
          average_relevance: scores.average_relevance,
          average_latency: scores.average_latency,
          user_satisfaction: scores.user_satisfaction
        }
      })
    )
    
    // Find optimal weights based on combined score
    return results.reduce((best, current) => {
      const bestScore = this.calculateCombinedScore(best)
      const currentScore = this.calculateCombinedScore(current)
      return currentScore > bestScore ? current : best
    })
  }
}
```

This comprehensive retrieval flow provides intelligent hybrid search with sophisticated caching, reranking, and continuous optimization for the Thorbis RAG system.
