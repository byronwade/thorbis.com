/**
 * Enhanced Chat API Route - Claude AI with Vercel AI SDK 5 and Widget Tools
 * 
 * Features comprehensive tool calling for weather, stocks, news, and more.
 * Uses AI SDK 5 with proper streaming and tool integration.
 * 
 * Architecture:
 * - Vercel AI SDK 5 streamText for perfect useChat compatibility
 * - Claude 3 Haiku for intelligent responses
 * - Enhanced tool calling for widgets and real-time data
 * 
 * Dependencies:
 * - ai: Vercel AI SDK 5 for streaming and tools
 * - @ai-sdk/anthropic: Anthropic provider
 */

import { streamText, CoreMessage, tool } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

// Environment validation
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey || apiKey === 'sk-ant-api03-your-key-here' || apiKey.length < 50) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required and must be a valid API key')
}

// Request schema for AI SDK 5 format
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    id: z.string().optional(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().optional(), // Legacy format
    parts: z.array(z.object({      // New AI SDK 5 format
      type: z.string(),
      text: z.string(),
    })).optional(),
  })),
  currentIndustry: z.string().optional(),
})

// System prompt for Thorbis AI Assistant
const systemPrompt = 'You are the Thorbis AI Assistant, an intelligent business operations assistant for the Thorbis Business OS platform.

Your capabilities include:
- Business operations guidance and analytics
- Real-time weather information using the getWeather tool
- Stock market data and analysis using the getStockPrice tool  
- Latest news and industry updates using the getNews tool
- General business advice and decision-making support

You have access to powerful tools that can provide real-time data. When users ask about weather, stocks, or news, use the appropriate tools to get current information.

Be helpful, professional, and concise in your responses. Always provide actionable insights when possible.'

// Enhanced AI Tools for widget functionality
const tools = {
  getWeather: tool({
    description: 'Get current weather information for a specific location with detailed forecast',
    inputSchema: z.object({
      location: z.string().describe('The city and state/country to get weather for'),
      unit: z.enum(['celsius', 'fahrenheit']).optional().describe('Temperature unit preference'),
    }),
    execute: async ({ location, unit = 'fahrenheit' }) => {
      try {
        console.log('🌤️ Fetching real weather data for:', location)
        
        // Using OpenWeatherMap API (free tier)
        const API_KEY = process.env.OPENWEATHER_API_KEY
        if (!API_KEY || API_KEY === 'your-api-key-here') {
          throw new Error('OpenWeatherMap API key not configured')
        }
        
        const units = unit === 'celsius' ? 'metric' : 'imperial`
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=${units}`
        )
        
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}')
        }
        
        const data = await response.json()
        
        return {
          location: '${data.name}, ${data.sys.country}',
          temperature: Math.round(data.main.temp),
          unit: unit === 'celsius' ? 'C' : 'F',
          condition: data.weather[0].main.toLowerCase(),
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
          visibility: 10, // Default visibility
          feelsLike: Math.round(data.main.feels_like),
          weeklyForecast: [
            { day: 'Today', high: Math.round(data.main.temp_max), low: Math.round(data.main.temp_min), condition: data.weather[0].main.toLowerCase() }
          ],
          realData: true
        }
      } catch (error) {
        console.error('❌ Weather API error:', error)
        // Fallback to demo data
        const weatherConditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy', 'overcast', 'windy'];
        const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const baseTemp = unit === 'celsius' ? 22 : 72;
        const tempVariation = Math.floor(Math.random() * 30) - 15;
        const temperature = baseTemp + tempVariation;
        
        return {
          location,
          temperature,
          unit: unit === 'celsius' ? 'C' : 'F',
          condition,
          description: '${condition} skies',
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 15) + 5,
          visibility: Math.floor(Math.random() * 5) + 5,
          feelsLike: temperature + Math.floor(Math.random() * 6) - 3,
          weeklyForecast: [
            { day: 'Today', high: temperature + 2, low: temperature - 8, condition }
          ],
          realData: false,
          note: 'Demo data - configure OPENWEATHER_API_KEY for real weather'
        };
      }
    },
  }),

  getStockPrice: tool({
    description: 'Get current stock price and comprehensive market information for a company',
    inputSchema: z.object({
      symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, GOOGL, TSLA)'),
    }),
    execute: async ({ symbol }) => {
      try {
        console.log('📈 Fetching real stock data for:', symbol)
        
        // Using Alpha Vantage API (free tier)
        const API_KEY = process.env.ALPHA_VANTAGE_API_KEY
        if (!API_KEY || API_KEY === 'your-api-key-here') {
          throw new Error('Alpha Vantage API key not configured`)
        }
        
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}'
        )
        
        if (!response.ok) {
          throw new Error('Stock API error: ${response.status}')
        }
        
        const data = await response.json()
        const quote = data['Global Quote']
        
        if (!quote || Object.keys(quote).length === 0) {
          throw new Error('Invalid stock symbol or API limit reached')
        }
        
        return {
          symbol: quote['01. symbol'],
          name: '${quote['01. symbol']} Corporation', // API doesn't provide company name'
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          marketCap: 'N/A', // Not provided by this API endpoint
          high52Week: parseFloat(quote['03. high']),
          low52Week: parseFloat(quote['04. low']),
          latestTradingDay: quote['07. latest trading day'],
          realData: true
        }
      } catch (error) {
        console.error('❌ Stock API error:', error)
        // Fallback to demo data
        const companies = {
          'AAPL': 'Apple Inc.',
          'GOOGL': 'Alphabet Inc.',
          'TSLA': 'Tesla, Inc.',
          'MSFT': 'Microsoft Corporation',
          'AMZN': 'Amazon.com Inc.',
          'NVDA': 'NVIDIA Corporation',
          'META': 'Meta Platforms Inc.`,
        };
        
        const name = companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Corporation';
        const basePrice = Math.random() * 300 + 50;
        const change = (Math.random() - 0.5) * 20;
        const price = basePrice + change;
        const changePercent = (change / basePrice) * 100;
        
        return {
          symbol: symbol.toUpperCase(),
          name,
          price,
          change,
          changePercent,
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: '${Math.floor(Math.random() * 2000 + 100)}B',
          high52Week: price + Math.random() * 50 + 10,
          low52Week: price - Math.random() * 50 - 10,
          realData: false,
          note: 'Demo data - configure ALPHA_VANTAGE_API_KEY for real stock data'
        };
      }
    },
  }),

  getNews: tool({
    description: 'Get latest news articles on a specific topic or general news with rich content',
    inputSchema: z.object({
      topic: z.string().optional().describe('News topic or keyword to search for'),
      category: z.enum(['business', 'technology', 'sports', 'entertainment', 'health', 'general']).optional(),
      limit: z.number().optional().describe('Number of articles to return (default: 5)'),
    }),
    execute: async ({ topic, category = 'general', limit = 5 }) => {
      try {
        console.log('📰 Fetching real news data for:', topic)
        
        // Using NewsAPI (free tier)
        const API_KEY = process.env.NEWS_API_KEY
        if (!API_KEY || API_KEY === 'your-api-key-here') {
          throw new Error('NewsAPI key not configured`)
        }
        
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&pageSize=${limit}&apiKey=${API_KEY}'
        )
        
        if (!response.ok) {
          throw new Error('News API error: ${response.status}')
        }
        
        const data = await response.json()
        
        if (!data.articles || data.articles.length === 0) {
          throw new Error('No articles found for this topic')
        }
    
    return {
          topic,
          category,
          articles: data.articles.slice(0, limit).map((article: unknown) => ({
            title: article.title,
            summary: article.description || 'No summary available',
            url: article.url,
            source: article.source.name,
            publishedAt: article.publishedAt,
            author: article.author || 'Unknown',
            imageUrl: article.urlToImage || 'https://via.placeholder.com/300x200/1f2937/ffffff?text=News'
          })),
          totalResults: data.totalResults,
          realData: true
    }
  } catch (error) {
        console.error('❌ News API error:`, error)
        // Fallback to demo data
        const sampleArticles = [
          {
            title: `Latest ${topic} News - Demo Article',
            summary: 'This is a demo news article about ${topic}. Configure NEWS_API_KEY for real news data.',
            url: 'https://example.com/demo-article',
            source: 'Demo News',
            publishedAt: new Date().toISOString(),
            author: 'Demo Author',
            imageUrl: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Demo+News'
          },
          {
            title: 'Breakthrough in Renewable Energy Storage Technology',
            summary: 'Scientists develop new battery technology that could revolutionize renewable energy storage and electric vehicles.',
            url: 'https://example.com/battery-tech',
            source: 'Energy Report',
            publishedAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
            author: 'Lisa Thompson',
            imageUrl: 'https://via.placeholder.com/300x200/059669/ffffff?text=Energy+News'
          }
        ];
        
        return {
          topic: topic || 'general',
          category,
          articles: sampleArticles.slice(0, limit),
          totalResults: sampleArticles.length,
          realData: false,
          note: 'Demo data - configure NEWS_API_KEY for real news'
        };
      }
    },
  }),
}


export async function POST(request: Request) {
  try {
    console.log('🚀 API Route: Starting request processing...')
    console.log('🔧 AI SDK Version: 5.0 (using streamText with tools)')
    console.log('🌐 Request URL:', request.url)
    console.log('📝 Request method:', request.method)
    console.log('🔑 Request headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    console.log('✅ API Route: Request body parsed successfully')
    console.log('📦 Request body:', JSON.stringify(body, null, 2))
    
    const { messages, currentIndustry } = ChatRequestSchema.parse(body)
    console.log('✅ API Route: Schema validation passed')
    console.log('📊 Messages count:', messages.length)
    console.log('🏭 Current industry:', currentIndustry)
    console.log('💬 Messages:', JSON.stringify(messages, null, 2))

    console.log('🤖 Calling Anthropic Claude AI with tools...')
    
    // System prompt for Thorbis Business OS context
    const systemPrompt = 'You are an AI assistant for the Thorbis Business OS platform, a comprehensive business management system that serves multiple industries:

**Industries Supported:**
- Home Services (HS): Work orders, technician dispatch, estimates, invoices
- Restaurants (REST): POS, kitchen display, checks, menu management  
- Auto Services (AUTO): Repair orders, parts inventory, bay management
- Retail (RET): Inventory, sales, customer management, loyalty programs

**Current Industry Context:** ${currentIndustry || 'General'}

**Your Role:**
- Provide helpful, accurate information about business operations
- Guide users through Thorbis platform features and workflows
- Offer industry-specific best practices and insights
- Help with scheduling, customer management, reporting, and analytics
- Support decision-making with data-driven recommendations
- Use available tools (weather, stock, news) when relevant to business operations

**Available Tools:**
- Weather: Get current weather for business planning (outdoor work, deliveries, etc.)
- Stock prices: Get market data for business insights and investment decisions
- News: Get latest news for industry trends and business intelligence

**Communication Style:**
- Professional yet friendly and approachable
- Clear, actionable guidance
- Industry-specific terminology when appropriate
- Focus on practical solutions and efficiency

Always consider the current industry context when providing responses and tailor your advice accordingly. Use tools when they would be helpful for the user's request.'

    // Convert messages to CoreMessage format for AI SDK 5
    const coreMessages: CoreMessage[] = messages.map(msg => {
      // Handle both AI SDK 5 format (parts) and legacy format (content)
      let content: string
      if (msg.parts && msg.parts.length > 0) {
        // AI SDK 5 format - extract text from parts
        content = msg.parts
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join(')
      } else if (msg.content) {
        // Legacy format
        content = msg.content
      } else {
        throw new Error('Message must have either content or parts')
      }
      
      return {
        role: msg.role as 'user' | 'assistant' | 'system',
        content
      }
    })
    
    console.log('📤 Sending request to Claude with', coreMessages.length, 'messages and tools')
    
        // Use AI SDK 5 streamText with proper UI message stream response
    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: systemPrompt,
      messages: coreMessages,
          tools,
          maxTokens: 1000,
      temperature: 0.7,
    })

        console.log('✅ Claude streaming with tools initialized')
        console.log('🎉 Returning AI SDK 5 UI message stream response...')
        
        // Use the correct AI SDK 5 method for useChat compatibility
        return result.toUIMessageStreamResponse()
    
  } catch (error) {
    console.error('❌ API Route Error occurred!')
    console.error('🔥 Error type:', error?.constructor?.name || 'Unknown')
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('📍 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('🔍 Error details:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      type: error?.constructor?.name || 'Unknown'
    }), { 
      status: 500,
    headers: {
        'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
  }
}