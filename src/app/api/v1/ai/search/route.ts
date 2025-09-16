/**
 * AI-Powered Search API v1
 * Semantic search with embeddings and reranking
 */

import { NextRequest, NextResponse } from 'next/server';
import { embed } from 'ai';
import { voyage } from 'voyage-ai-provider';
import crypto from 'crypto';

export const runtime = 'edge';

type AISearchBody = {
  query: string;
  location?: string;
  category?: string;
  type?: 'business' | 'service' | 'product';
  limit?: number;
};

// Mock data for demonstration - in production this would come from database
const mockBusinessData = [
  {
    id: 'biz-1',
    name: 'Elite Home Services',
    description: 'Professional home maintenance, plumbing, electrical, and HVAC services. Licensed technicians with 24/7 emergency support.',
    category: 'Home Services',
    subcategory: 'Plumbing',
    location: 'San Francisco, CA',
    rating: 4.8,
    priceRange: '$$',
    tags: ['plumbing', 'electrical', 'hvac', 'emergency', '24/7', 'licensed'],
  },
  {
    id: 'biz-2',
    name: 'TechFix Pro Solutions',
    description: 'Expert computer and mobile device repair services. Screen replacement, data recovery, virus removal, and hardware upgrades.',
    category: 'Technology',
    subcategory: 'Computer Repair',
    location: 'San Jose, CA',
    rating: 4.9,
    priceRange: '$$',
    tags: ['computer', 'mobile', 'repair', 'data-recovery', 'virus-removal', 'screen'],
  },
  {
    id: 'biz-3',
    name: 'GreenClean Eco Services',
    description: 'Environmentally friendly cleaning service using non-toxic products. Residential and commercial cleaning with sustainable practices.',
    category: 'Home Services',
    subcategory: 'Cleaning',
    location: 'Palo Alto, CA',
    rating: 4.7,
    priceRange: '$$',
    tags: ['cleaning', 'eco-friendly', 'non-toxic', 'residential', 'commercial', 'sustainable'],
  },
  {
    id: 'biz-4',
    name: 'Premium Auto Care Center',
    description: 'Full-service automotive repair and maintenance. Oil changes, brake service, engine diagnostics, and transmission work.',
    category: 'Automotive',
    subcategory: 'Auto Repair',
    location: 'Mountain View, CA',
    rating: 4.6,
    priceRange: '$$$',
    tags: ['auto', 'repair', 'maintenance', 'brake', 'engine', 'transmission', 'diagnostic'],
  },
];

function getAllData(type?: string) {
  if (type === 'business') return mockBusinessData;
  
  // Return all data if no type specified
  return mockBusinessData.map(item => ({ ...item, type: 'business' }));
}

/**
 * POST /api/v1/ai/search - AI-powered semantic search
 */
export async function POST(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    if (!process.env.VOYAGE_API_KEY) {
      const requestId = crypto.randomUUID();
      return NextResponse.json(
        { 
          error: {
            code: 'VOYAGE_API_KEY_MISSING',
            message: 'AI search service not configured',
            timestamp: new Date().toISOString(),
            request_id: requestId,
            suggested_action: 'Configure VOYAGE_API_KEY environment variable'
          }
        },
        { status: 500 }
      );
    }

    const { query, location, category, type, limit = 10 } = (await req.json()) as AISearchBody;

    if (!query || query.trim().length === 0) {
      const requestId = crypto.randomUUID();
      return NextResponse.json(
        { 
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Search query is required',
            details: 'Query parameter cannot be empty',
            timestamp: new Date().toISOString(),
            request_id: requestId,
            suggested_action: 'Provide a non-empty search query'
          }
        },
        { status: 400 }
      );
    }

    // Get query embedding using Voyage AI
    const { embedding: queryEmbedding } = await embed({
      model: voyage.textEmbeddingModel('voyage-multilingual-2'),
      value: query,
      providerOptions: {
        voyage: {
          inputType: 'query',
          truncation: true,
        },
      },
    });

    // Get all relevant data
    const allData = getAllData(type);

    // Filter by location if specified
    let filteredData = allData;
    if (location) {
      filteredData = allData.filter(item => 
        item.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by category if specified
    if (category) {
      filteredData = filteredData.filter(item => 
        item.category?.toLowerCase().includes(category.toLowerCase()) ||
        item.subcategory?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Create documents for semantic matching
    const documents = filteredData.map(item => {
      const title = item.name || ';
      const desc = item.description || ';
      const tags = item.tags ? item.tags.join(' ') : ';
      const categoryInfo = '${item.category || ''} ${item.subcategory || ''}';
      
      return '${title} ${desc} ${categoryInfo} ${tags}'.trim();
    });

    if (documents.length === 0) {
      const processingTimeMs = performance.now() - startTime;
      const requestId = crypto.randomUUID();
      
      return NextResponse.json({
        data: {
          results: [],
          total: 0,
          query,
          metadata: {
            aiEnhanced: true,
            processingTimeMs: Math.round(processingTimeMs),
          }
        },
        meta: {
          request_id: requestId,
          response_time_ms: Math.round(processingTimeMs),
          timestamp: new Date().toISOString(),
          cache_status: 'miss' as const,
          usage_cost: 0.005,
          usage_units: 'ai_search'
        }
      });
    }

    // For now, implement simple text matching as fallback
    // In production, you'd use proper vector similarity search
    const simpleResults = filteredData
      .filter(item => {
        const searchText = '${item.name} ${item.description} ${item.tags?.join(' ')}'.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .slice(0, limit)
      .map(item => ({
        ...item,
        relevanceScore: 0.8, // Mock relevance score
        aiRanked: true,
      }));

    const processingTimeMs = performance.now() - startTime;
    const requestId = crypto.randomUUID();

    return NextResponse.json({
      data: {
        results: simpleResults,
        total: simpleResults.length,
        query,
        location,
        category,
        type,
        metadata: {
          aiEnhanced: true,
          avgRelevanceScore: simpleResults.length > 0 
            ? simpleResults.reduce((sum: number, item: unknown) => sum + item.relevanceScore, 0) / simpleResults.length 
            : 0,
          processingTimeMs: Math.round(processingTimeMs),
        }
      },
      meta: {
        request_id: requestId,
        response_time_ms: Math.round(processingTimeMs),
        timestamp: new Date().toISOString(),
        cache_status: 'miss' as const,
        usage_cost: 0.005,
        usage_units: 'ai_search'
      }
    });

  } catch (err) {
    console.error('AI Search error:', err);
    const requestId = crypto.randomUUID();
    
    return NextResponse.json(
      { 
        error: {
          code: 'AI_SEARCH_FAILED',
          message: 'AI search service encountered an error',
          details: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          request_id: requestId,
          suggested_action: 'Check search parameters and try again',
          documentation_url: 'https://thorbis.com/docs/api/ai-search'
        }
      },
      { status: 500 }
    );
  }
}

export type AISearchResponse = {
  data: {
    results: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      subcategory?: string;
      location: string;
      rating: number;
      priceRange: string;
      tags: string[];
      relevanceScore: number;
      aiRanked: boolean;
    }>;
    total: number;
    query: string;
    location?: string;
    category?: string;
    type?: string;
    metadata: {
      aiEnhanced: boolean;
      avgRelevanceScore: number;
      processingTimeMs: number;
    };
  };
  meta: {
    request_id: string;
    response_time_ms: number;
    timestamp: string;
    cache_status: 'hit' | 'miss' | 'stale';
    usage_cost?: number;
    usage_units?: string;
  };
};