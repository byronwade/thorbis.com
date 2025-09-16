/**
 * AI Embedding API v1
 * Generate embeddings using Voyage AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { embed, embedMany } from 'ai';
import { voyage } from 'voyage-ai-provider';

export const runtime = 'edge';

type EmbedBody = {
  input: string | string[];
  model?: string; // e.g. 'voyage-multilingual-2', 'voyage-3.5-lite'
  inputType?: 'query' | 'document' | null;
  outputDimension?: number; // 256|512|1024|2048 depending on model
  outputDtype?: 'float' | 'int8' | 'uint8' | 'binary' | 'ubinary';
  truncation?: boolean;
};

/**
 * POST /api/v1/ai/embed - Generate AI embeddings
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.VOYAGE_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'VOYAGE_API_KEY_MISSING',
          message: 'AI embedding service not configured' 
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as EmbedBody;

    const {
      input,
      model = 'voyage-multilingual-2',
      inputType = 'document',
      outputDimension,
      outputDtype,
      truncation = true,
    } = body;

    if (!input || (Array.isArray(input) && input.length === 0) || (typeof input === 'string' && input.trim().length === 0)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'INVALID_INPUT',
          message: 'Input text is required' 
        },
        { status: 400 }
      );
    }

    // Build provider options exactly as supported by the Voyage provider
    const providerOptions = {
      voyage: {
        inputType,
        outputDimension,
        outputDtype,
        truncation,
      },
    };

    const startTime = Date.now();

    if (Array.isArray(input)) {
      const { embeddings } = await embedMany({
        model: voyage.textEmbeddingModel(model),
        values: input,
        providerOptions,
      });
      
      const processingTime = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        data: {
          count: embeddings.length,
          dimensions: embeddings[0]?.length ?? null,
          embeddings,
          model,
          inputType,
        },
        meta: {
          processingTimeMs: processingTime,
          tokensUsed: input.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0), // Rough estimate
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      const { embedding } = await embed({
        model: voyage.textEmbeddingModel(model),
        value: input,
        providerOptions,
      });
      
      const processingTime = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        data: {
          dimensions: embedding.length,
          embedding,
          model,
          inputType,
        },
        meta: {
          processingTimeMs: processingTime,
          tokensUsed: Math.ceil(input.length / 4), // Rough estimate
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Embedding error:', err);
    return NextResponse.json(
      { 
        success: false,
        error: 'EMBEDDING_FAILED', 
        message: 'Failed to generate embeddings',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export type EmbedResponse = {
  success: true;
  data: {
    dimensions: number;
    embedding: number[];
    model: string;
    inputType: string;
  } | {
    count: number;
    dimensions: number | null;
    embeddings: number[][];
    model: string;
    inputType: string;
  };
  meta: {
    processingTimeMs: number;
    tokensUsed: number;
  };
  timestamp: string;
};