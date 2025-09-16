/**
 * Investment Platform API Documentation Generator
 * 
 * This module provides comprehensive API documentation generation
 * for the investment platform's RESTful APIs using OpenAPI 3.0 specification.'
 * 
 * Features:
 * - Complete OpenAPI 3.0 schema definitions
 * - Interactive Swagger UI integration
 * - Comprehensive endpoint documentation
 * - Request/response examples
 * - Authentication documentation
 * - Error response specifications
 * - Type-safe schema validation
 * - Auto-generated client SDKs
 * 
 * API Coverage:
 * - Portfolio management APIs
 * - Trading execution APIs (stocks/crypto)
 * - Market data streaming APIs
 * - Rebalancing automation APIs
 * - Risk assessment APIs
 * - Transaction history APIs
 * - Account management APIs
 */

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact: {
      name: string;
      url: string;
      email: string;
    };
    license: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, unknown>;
    responses: Record<string, unknown>;
    parameters: Record<string, unknown>;
    examples: Record<string, unknown>;
    requestBodies: Record<string, unknown>;
    headers: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
    links: Record<string, unknown>;
    callbacks: Record<string, unknown>;
  };
  security: Array<Record<string, string[]>>;
  tags: Array<{
    name: string;
    description: string;
    externalDocs?: {
      description: string;
      url: string;
    };
  }>;
  externalDocs: {
    description: string;
    url: string;
  };
}

/**
 * Generate complete OpenAPI 3.0 specification for Investment Platform APIs
 */
export function generateOpenAPISpec(): OpenAPISpec {
  return {
    openapi: "3.0.3",
    info: {
      title: "Thorbis Investment Platform API",
      description: `
        # Thorbis Investment Platform API
        
        A comprehensive financial investment platform providing:
        - **Portfolio Management**: Create, manage, and monitor investment portfolios
        - **Trading Execution**: Execute trades for stocks, ETFs, and cryptocurrencies
        - **Market Data**: Real-time streaming market data and analytics
        - **Automated Rebalancing**: AI-powered portfolio rebalancing strategies
        - **Risk Management**: Advanced risk assessment and compliance monitoring
        - **Reporting**: Comprehensive investment reporting and tax documentation
        
        ## Authentication
        
        The API uses JSON Web Tokens (JWT) for authentication. Include your token in the Authorization header:
        
        \`\`\`
        Authorization: Bearer <your-jwt-token>
        \`\'\'
        
        ## Rate Limiting
        
        API requests are rate-limited to ensure fair usage:
        - **Standard endpoints**: 1000 requests per hour
        - **Trading endpoints**: 500 requests per hour  
        - **Market data**: 10,000 requests per hour
        
        ## Error Handling
        
        All API endpoints return standardized error responses with appropriate HTTP status codes and detailed error messages.
        
        ## Data Formats
        
        - All timestamps are in ISO 8601 format (UTC)
        - All monetary amounts are in USD unless specified
        - All decimal numbers use up to 8 decimal places for precision
        
        ## Webhook Support
        
        Real-time events are delivered via webhooks for:
        - Order fills and trade executions
        - Portfolio rebalancing completions
        - Price alerts and notifications
        - Risk threshold breaches
      ',
      version: "1.0.0",
      contact: {
        name: "Thorbis API Support",
        url: "https://thorbis.com/support",
        email: "api-support@thorbis.com"
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: "https://api.thorbis.com/v1",
        description: "Production server"
      },
      {
        url: "https://sandbox-api.thorbis.com/v1",
        description: "Sandbox server for testing"
      },
      {
        url: "http://localhost:3000/api",
        description: "Local development server"
      }
    ],
    paths: generateAPIPaths(),
    components: {
      schemas: generateSchemas(),
      responses: generateResponses(),
      parameters: generateParameters(),
      examples: generateExamples(),
      requestBodies: generateRequestBodies(),
      headers: generateHeaders(),
      securitySchemes: generateSecuritySchemes(),
      links: Record<string, unknown>,
      callbacks: generateCallbacks()
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    tags: [
      {
        name: "Portfolio",
        description: "Portfolio management operations",
        externalDocs: {
          description: "Portfolio Management Guide",
          url: "https://docs.thorbis.com/portfolio-management"
        }
      },
      {
        name: "Trading",
        description: "Trade execution and order management",
        externalDocs: {
          description: "Trading Guide",
          url: "https://docs.thorbis.com/trading"
        }
      },
      {
        name: "Market Data",
        description: "Real-time and historical market data",
        externalDocs: {
          description: "Market Data Guide",
          url: "https://docs.thorbis.com/market-data"
        }
      },
      {
        name: "Rebalancing",
        description: "Automated portfolio rebalancing",
        externalDocs: {
          description: "Rebalancing Guide",
          url: "https://docs.thorbis.com/rebalancing"
        }
      },
      {
        name: "Analytics",
        description: "Investment analytics and reporting",
        externalDocs: {
          description: "Analytics Guide",
          url: "https://docs.thorbis.com/analytics"
        }
      },
      {
        name: "Account",
        description: "Account management and settings",
        externalDocs: {
          description: "Account Management Guide",
          url: "https://docs.thorbis.com/account-management"
        }
      }
    ],
    externalDocs: {
      description: "Complete API Documentation",
      url: "https://docs.thorbis.com/api"
    }
  };
}

/**
 * Generate API path definitions
 */
function generateAPIPaths(): Record<string, unknown> {
  return {
    // Portfolio Management APIs
    "/investments/portfolio": {
      get: {
        tags: ["Portfolio"],
        summary: "Get portfolio information",
        description: "Retrieve comprehensive portfolio information including positions, allocations, and performance metrics",
        operationId: "getPortfolio",
        parameters: [
          { $ref: "#/components/parameters/PortfolioId" },
          { $ref: "#/components/parameters/IncludePositions" },
          { $ref: "#/components/parameters/IncludeMetrics" }
        ],
        responses: {
          "200": { $ref: "#/components/responses/PortfolioResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      },
      post: {
        tags: ["Portfolio"],
        summary: "Create new portfolio",
        description: "Create a new investment portfolio with specified allocation strategy",
        operationId: "createPortfolio",
        requestBody: { $ref: "#/components/requestBodies/CreatePortfolioRequest" },
        responses: {
          "201": { $ref: "#/components/responses/PortfolioCreatedResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      }
    },

    // Trading APIs
    "/investments/trading/stocks": {
      get: {
        tags: ["Trading"],
        summary: "Get stock market data",
        description: "Retrieve real-time stock quotes, market data, and trading information",
        operationId: "getStockData",
        parameters: [
          { $ref: "#/components/parameters/Symbols" },
          { $ref: "#/components/parameters/DataType" }
        ],
        responses: {
          "200": { $ref: "#/components/responses/StockDataResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      },
      post: {
        tags: ["Trading"],
        summary: "Execute stock trade",
        description: "Place a buy or sell order for stocks or ETFs",
        operationId: "executeStockTrade",
        requestBody: { $ref: "#/components/requestBodies/StockTradeRequest" },
        responses: {
          "201": { $ref: "#/components/responses/TradeExecutedResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "402": { $ref: "#/components/responses/InsufficientFunds" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      }
    },

    "/investments/trading/crypto": {
      get: {
        tags: ["Trading"],
        summary: "Get cryptocurrency data",
        description: "Retrieve real-time cryptocurrency prices and market data",
        operationId: "getCryptoData",
        parameters: [
          { $ref: "#/components/parameters/CryptoSymbols" },
          { $ref: "#/components/parameters/Currency" }
        ],
        responses: {
          "200": { $ref: "#/components/responses/CryptoDataResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      },
      post: {
        tags: ["Trading"],
        summary: "Execute cryptocurrency trade",
        description: "Place a buy or sell order for cryptocurrencies",
        operationId: "executeCryptoTrade",
        requestBody: { $ref: "#/components/requestBodies/CryptoTradeRequest" },
        responses: {
          "201": { $ref: "#/components/responses/TradeExecutedResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "402": { $ref: "#/components/responses/InsufficientFunds" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      }
    },

    // Real-time Market Data APIs
    "/investments/realtime-data": {
      get: {
        tags: ["Market Data"],
        summary: "Get real-time connection status",
        description: "Get WebSocket connection status and active subscriptions",
        operationId: "getRealtimeStatus",
        parameters: [
          { $ref: "#/components/parameters/InfoType" }
        ],
        responses: {
          "200": { $ref: "#/components/responses/RealtimeStatusResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      },
      post: {
        tags: ["Market Data"],
        summary: "Subscribe to real-time data",
        description: "Subscribe to real-time market data streams (quotes, trades, depth, indicators)",
        operationId: "subscribeRealtimeData",
        requestBody: { $ref: "#/components/requestBodies/SubscribeDataRequest" },
        responses: {
          "201": { $ref: "#/components/responses/SubscriptionCreatedResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      },
      delete: {
        tags: ["Market Data"],
        summary: "Unsubscribe from real-time data",
        description: "Unsubscribe from specific real-time data streams",
        operationId: "unsubscribeRealtimeData",
        requestBody: { $ref: "#/components/requestBodies/UnsubscribeDataRequest" },
        responses: {
          "200": { $ref: "#/components/responses/UnsubscribeSuccessResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      }
    },

    // Portfolio Rebalancing APIs
    "/investments/portfolio-rebalance": {
      get: {
        tags: ["Rebalancing"],
        summary: "Get rebalancing analysis",
        description: "Analyze portfolio and get rebalancing recommendations",
        operationId: "getRebalanceAnalysis",
        parameters: [
          { $ref: "#/components/parameters/PortfolioId" },
          { $ref: "#/components/parameters/RebalanceAction" },
          { $ref: "#/components/parameters/StrategyId" },
          { $ref: "#/components/parameters/UrgencyFilter" }
        ],
        responses: {
          "200": { $ref: "#/components/responses/RebalanceAnalysisResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      },
      post: {
        tags: ["Rebalancing"],
        summary: "Execute portfolio rebalancing",
        description: "Execute automatic portfolio rebalancing based on recommendations",
        operationId: "executeRebalancing",
        requestBody: { $ref: "#/components/requestBodies/ExecuteRebalanceRequest" },
        responses: {
          "201": { $ref: "#/components/responses/RebalanceExecutedResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "402": { $ref: "#/components/responses/InsufficientFunds" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      }
    },

    // Alpaca Account Management
    "/investments/alpaca-account": {
      get: {
        tags: ["Account"],
        summary: "Get Alpaca account information",
        description: "Retrieve Alpaca trading account information, positions, and orders",
        operationId: "getAlpacaAccount",
        parameters: [
          { $ref: "#/components/parameters/AlpacaDataType" },
          { $ref: "#/components/parameters/OrderStatus" }
        ],
        responses: {
          "200": { $ref: "#/components/responses/AlpacaAccountResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      },
      post: {
        tags: ["Account"],
        summary: "Execute account operations",
        description: "Perform account operations like closing positions or canceling orders",
        operationId: "executeAccountOperation",
        requestBody: { $ref: "#/components/requestBodies/AccountOperationRequest" },
        responses: {
          "200": { $ref: "#/components/responses/AccountOperationResponse" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        },
        security: [{ BearerAuth: [] }]
      }
    }
  };
}

/**
 * Generate component schemas
 */
function generateSchemas(): Record<string, unknown> {
  return {
    // Core Portfolio Schemas
    Portfolio: {
      type: "object",
      required: ["id", "userId", "name", "totalValue", "allocations"],
      properties: {
        id: {
          type: "string",
          description: "Unique portfolio identifier",
          example: "portfolio_123456789"
        },
        userId: {
          type: "string",
          description: "User ID who owns the portfolio",
          example: "user_987654321"
        },
        name: {
          type: "string",
          description: "Portfolio name",
          example: "Balanced Growth Portfolio"
        },
        totalValue: {
          type: "number",
          format: "float",
          description: "Total portfolio value in USD",
          example: 100000.00,
          minimum: 0
        },
        cashBalance: {
          type: "number",
          format: "float",
          description: "Available cash balance",
          example: 5000.00,
          minimum: 0
        },
        allocations: {
          type: "array",
          description: "Asset allocations in the portfolio",
          items: { $ref: "#/components/schemas/AssetAllocation" }
        },
        targetRisk: {
          type: "number",
          format: "float",
          description: "Target risk level (0.0-1.0)",
          example: 0.12,
          minimum: 0,
          maximum: 1
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Portfolio creation timestamp",
          example: "2024-01-15T10:30:00Z"
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          description: "Last update timestamp",
          example: "2024-01-20T14:45:00Z"
        }
      }
    },

    AssetAllocation: {
      type: "object",
      required: ["symbol", "targetPercent", "currentPercent", "currentValue", "category"],
      properties: {
        symbol: {
          type: "string",
          description: "Asset symbol (e.g., AAPL, BTC)",
          example: "AAPL"
        },
        targetPercent: {
          type: "number",
          format: "float",
          description: "Target allocation percentage",
          example: 25.0,
          minimum: 0,
          maximum: 100
        },
        currentPercent: {
          type: "number",
          format: "float",
          description: "Current allocation percentage",
          example: 27.5,
          minimum: 0,
          maximum: 100
        },
        currentValue: {
          type: "number",
          format: "float",
          description: "Current value in USD",
          example: 27500.00,
          minimum: 0
        },
        drift: {
          type: "number",
          format: "float",
          description: "Allocation drift percentage",
          example: 2.5
        },
        category: {
          type: "string",
          enum: ["equity", "fixed_income", "alternatives", "cash", "crypto"],
          description: "Asset category",
          example: "equity"
        },
        subCategory: {
          type: "string",
          description: "Asset subcategory",
          example: "large_cap"
        }
      }
    },

    // Trading Schemas
    TradeOrder: {
      type: "object",
      required: ["symbol", "side", "orderType"],
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol",
          example: "AAPL"
        },
        side: {
          type: "string",
          enum: ["buy", "sell"],
          description: "Order side",
          example: "buy"
        },
        orderType: {
          type: "string",
          enum: ["market", "limit", "stop", "stop_limit"],
          description: "Order type",
          example: "market"
        },
        qty: {
          type: "number",
          format: "float",
          description: "Quantity of shares",
          example: 10,
          minimum: 0
        },
        notional: {
          type: "number",
          format: "float",
          description: "Dollar amount for fractional shares",
          example: 1000.00,
          minimum: 0
        },
        limitPrice: {
          type: "number",
          format: "float",
          description: "Limit price (for limit orders)",
          example: 150.00,
          minimum: 0
        },
        stopPrice: {
          type: "number",
          format: "float",
          description: "Stop price (for stop orders)",
          example: 145.00,
          minimum: 0
        },
        timeInForce: {
          type: "string",
          enum: ["day", "gtc", "ioc", "fok"],
          description: "Time in force",
          example: "day"
        },
        extendedHours: {
          type: "boolean",
          description: "Allow extended hours trading",
          example: false
        }
      }
    },

    TradeExecution: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Order ID",
          example: "order_123456789"
        },
        status: {
          type: "string",
          enum: ["pending", "filled", "partial", "cancelled", "failed"],
          description: "Execution status",
          example: "filled"
        },
        symbol: {
          type: "string",
          description: "Trading symbol",
          example: "AAPL"
        },
        side: {
          type: "string",
          enum: ["buy", "sell"],
          description: "Order side",
          example: "buy"
        },
        qty: {
          type: "number",
          format: "float",
          description: "Requested quantity",
          example: 10
        },
        filledQty: {
          type: "number",
          format: "float",
          description: "Filled quantity",
          example: 10
        },
        avgPrice: {
          type: "number",
          format: "float",
          description: "Average execution price",
          example: 150.25
        },
        totalCost: {
          type: "number",
          format: "float",
          description: "Total execution cost",
          example: 1502.50
        },
        timestamp: {
          type: "string",
          format: "date-time",
          description: "Execution timestamp",
          example: "2024-01-20T09:30:00Z"
        }
      }
    },

    // Market Data Schemas
    QuoteData: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol",
          example: "AAPL"
        },
        bid: {
          type: "number",
          format: "float",
          description: "Best bid price",
          example: 149.95
        },
        ask: {
          type: "number",
          format: "float",
          description: "Best ask price",
          example: 150.05
        },
        last: {
          type: "number",
          format: "float",
          description: "Last trade price",
          example: 150.00
        },
        volume: {
          type: "integer",
          description: "Trading volume",
          example: 1000000
        },
        change: {
          type: "number",
          format: "float",
          description: "Price change",
          example: 1.25
        },
        changePercent: {
          type: "number",
          format: "float",
          description: "Price change percentage",
          example: 0.84
        },
        high: {
          type: "number",
          format: "float",
          description: "Day high",
          example: 152.00
        },
        low: {
          type: "number",
          format: "float",
          description: "Day low",
          example: 148.50
        },
        timestamp: {
          type: "integer",
          format: "int64",
          description: "Quote timestamp (Unix milliseconds)",
          example: 1674201000000
        }
      }
    },

    // Rebalancing Schemas
    RebalanceRecommendation: {
      type: "object",
      properties: {
        portfolioId: {
          type: "string",
          description: "Portfolio identifier",
          example: "portfolio_123456789"
        },
        strategy: {
          type: "string",
          description: "Rebalancing strategy name",
          example: "Threshold Rebalancing"
        },
        reason: {
          type: "string",
          description: "Reason for rebalancing",
          example: "2 positions exceed 5% drift threshold (max drift: 7.2%)"
        },
        urgency: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Rebalancing urgency",
          example: "medium"
        },
        trades: {
          type: "array",
          description: "Recommended trades",
          items: { $ref: "#/components/schemas/TradeRecommendation" }
        },
        totalTradeValue: {
          type: "number",
          format: "float",
          description: "Total value of recommended trades",
          example: 5000.00
        },
        estimatedImpact: {
          type: "object",
          properties: {
            expectedReturn: {
              type: "number",
              format: "float",
              description: "Expected return improvement",
              example: 0.02
            },
            riskReduction: {
              type: "number",
              format: "float",
              description: "Risk reduction percentage",
              example: 0.01
            },
            tradingCosts: {
              type: "number",
              format: "float",
              description: "Estimated trading costs",
              example: 5.00
            }
          }
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Recommendation timestamp",
          example: "2024-01-20T14:30:00Z"
        }
      }
    },

    TradeRecommendation: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol",
          example: "AAPL"
        },
        action: {
          type: "string",
          enum: ["buy", "sell"],
          description: "Recommended action",
          example: "buy"
        },
        shares: {
          type: "number",
          format: "float",
          description: "Number of shares",
          example: 10
        },
        notionalAmount: {
          type: "number",
          format: "float",
          description: "Dollar amount",
          example: 1500.00
        },
        currentPrice: {
          type: "number",
          format: "float",
          description: "Current market price",
          example: 150.00
        },
        targetPercent: {
          type: "number",
          format: "float",
          description: "Target allocation percentage",
          example: 25.0
        },
        currentPercent: {
          type: "number",
          format: "float",
          description: "Current allocation percentage",
          example: 27.5
        },
        reason: {
          type: "string",
          description: "Reason for trade recommendation",
          example: "Drift of 2.5% exceeds 2% threshold"
        },
        priority: {
          type: "number",
          format: "int32",
          description: "Trade priority (higher = more important)",
          example: 1
        }
      }
    },

    // Standard API Response Schemas
    SuccessResponse: {
      type: "object",
      required: ["success", "data"],
      properties: {
        success: {
          type: "boolean",
          description: "Operation success status",
          example: true
        },
        data: {
          type: "object",
          description: "Response data"
        },
        message: {
          type: "string",
          description: "Optional success message",
          example: "Operation completed successfully"
        },
        metadata: {
          type: "object",
          description: "Additional metadata",
          properties: {
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2024-01-20T14:30:00Z"
            },
            requestId: {
              type: "string",
              example: "req_123456789"
            }
          }
        }
      }
    },

    ErrorResponse: {
      type: "object",
      required: ["success", "error"],
      properties: {
        success: {
          type: "boolean",
          description: "Operation success status",
          example: false
        },
        error: {
          type: "string",
          description: "Error message",
          example: "Invalid request parameters"
        },
        details: {
          oneOf: [
            { type: "string" },
            { type: "array", items: { type: "object" } }
          ],
          description: "Detailed error information"
        },
        code: {
          type: "string",
          description: "Error code",
          example: "VALIDATION_ERROR"
        },
        requestId: {
          type: "string",
          description: "Request identifier for support",
          example: "req_123456789"
        }
      }
    }
  };
}

/**
 * Generate response definitions
 */
function generateResponses(): Record<string, unknown> {
  return {
    // Success Responses
    PortfolioResponse: {
      description: "Portfolio information retrieved successfully",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: "#/components/schemas/SuccessResponse" },
              {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/Portfolio" }
                }
              }
            ]
          },
          examples: {
            basic: { $ref: "#/components/examples/PortfolioResponseExample" }
          }
        }
      }
    },

    StockDataResponse: {
      description: "Stock market data retrieved successfully",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: "#/components/schemas/SuccessResponse" },
              {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      quotes: {
                        type: "array",
                        items: { $ref: "#/components/schemas/QuoteData" }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    },

    RebalanceAnalysisResponse: {
      description: "Portfolio rebalancing analysis completed",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: "#/components/schemas/SuccessResponse" },
              {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      recommendations: {
                        type: "array",
                        items: { $ref: "#/components/schemas/RebalanceRecommendation" }
                      },
                      summary: {
                        type: "object",
                        properties: {
                          totalRecommendations: { type: "integer" },
                          highUrgencyCount: { type: "integer" },
                          totalTradeValue: { type: "number" }
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    },

    // Error Responses
    BadRequest: {
      description: "Bad request - Invalid parameters",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ErrorResponse" },
          examples: {
            validation: {
              summary: "Validation Error",
              value: {
                success: false,
                error: "Validation error",
                details: [
                  {
                    field: "symbol",
                    message: "Symbol is required"
                  }
                ],
                code: "VALIDATION_ERROR"
              }
            }
          }
        }
      }
    },

    Unauthorized: {
      description: "Unauthorized - Invalid or missing authentication",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ErrorResponse" },
          examples: {
            missing_token: {
              summary: "Missing Token",
              value: {
                success: false,
                error: "Authentication token required",
                code: "MISSING_TOKEN"
              }
            },
            invalid_token: {
              summary: "Invalid Token",
              value: {
                success: false,
                error: "Invalid authentication token",
                code: "INVALID_TOKEN"
              }
            }
          }
        }
      }
    },

    NotFound: {
      description: "Resource not found",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ErrorResponse" },
          examples: {
            portfolio_not_found: {
              summary: "Portfolio Not Found",
              value: {
                success: false,
                error: "Portfolio not found",
                code: "RESOURCE_NOT_FOUND"
              }
            }
          }
        }
      }
    },

    InsufficientFunds: {
      description: "Insufficient funds for trade execution",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ErrorResponse" },
          examples: {
            insufficient_balance: {
              summary: "Insufficient Balance",
              value: {
                success: false,
                error: "Insufficient buying power",
                details: "Required: $1000.00, Available: $500.00",
                code: "INSUFFICIENT_FUNDS"
              }
            }
          }
        }
      }
    },

    InternalServerError: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ErrorResponse" },
          examples: {
            server_error: {
              summary: "Server Error",
              value: {
                success: false,
                error: "Internal server error",
                code: "INTERNAL_ERROR"
              }
            }
          }
        }
      }
    }
  };
}

/**
 * Generate parameter definitions
 */
function generateParameters(): Record<string, unknown> {
  return {
    PortfolioId: {
      name: "portfolioId",
      in: "query",
      required: true,
      description: "Portfolio identifier",
      schema: {
        type: "string",
        example: "portfolio_123456789"
      }
    },

    Symbols: {
      name: "symbols",
      in: "query",
      required: true,
      description: "Comma-separated list of trading symbols",
      schema: {
        type: "string",
        example: "AAPL,GOOGL,MSFT"
      }
    },

    DataType: {
      name: "type",
      in: "query",
      required: false,
      description: "Type of market data to retrieve",
      schema: {
        type: "string",
        enum: ["quotes", "trades", "bars", "snapshots"],
        default: "quotes"
      }
    },

    IncludePositions: {
      name: "include_positions",
      in: "query",
      required: false,
      description: "Include detailed position information",
      schema: {
        type: "boolean",
        default: true
      }
    },

    IncludeMetrics: {
      name: "include_metrics",
      in: "query",
      required: false,
      description: "Include performance metrics",
      schema: {
        type: "boolean",
        default: false
      }
    }
  };
}

/**
 * Generate example definitions
 */
function generateExamples(): Record<string, unknown> {
  return {
    PortfolioResponseExample: {
      summary: "Basic Portfolio Response",
      value: {
        success: true,
        data: {
          id: "portfolio_123456789",
          userId: "user_987654321",
          name: "Balanced Growth Portfolio",
          totalValue: 100000.00,
          cashBalance: 5000.00,
          allocations: [
            {
              symbol: "AAPL",
              targetPercent: 25.0,
              currentPercent: 27.5,
              currentValue: 27500.00,
              drift: 2.5,
              category: "equity",
              subCategory: "large_cap"
            }
          ],
          targetRisk: 0.12,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-20T14:45:00Z"
        },
        metadata: {
          timestamp: "2024-01-20T14:30:00Z"
        }
      }
    }
  };
}

/**
 * Generate request body definitions
 */
function generateRequestBodies(): Record<string, unknown> {
  return {
    CreatePortfolioRequest: {
      description: "Portfolio creation request",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "allocations"],
            properties: {
              name: {
                type: "string",
                description: "Portfolio name",
                example: "My Investment Portfolio"
              },
              allocations: {
                type: "array",
                description: "Initial asset allocations",
                items: {
                  type: "object",
                  required: ["symbol", "targetPercent", "category"],
                  properties: {
                    symbol: { type: "string", example: "AAPL" },
                    targetPercent: { type: "number", example: 25.0 },
                    category: { type: "string", example: "equity" }
                  }
                }
              },
              initialDeposit: {
                type: "number",
                format: "float",
                description: "Initial cash deposit",
                example: 10000.00
              }
            }
          }
        }
      }
    },

    StockTradeRequest: {
      description: "Stock trade execution request",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/TradeOrder" },
          examples: {
            market_buy: {
              summary: "Market Buy Order",
              value: {
                symbol: "AAPL",
                side: "buy",
                orderType: "market",
                qty: 10,
                timeInForce: "day"
              }
            },
            limit_sell: {
              summary: "Limit Sell Order",
              value: {
                symbol: "AAPL",
                side: "sell",
                orderType: "limit",
                qty: 10,
                limitPrice: 155.00,
                timeInForce: "gtc"
              }
            }
          }
        }
      }
    }
  };
}

/**
 * Generate header definitions
 */
function generateHeaders(): Record<string, unknown> {
  return {
    "X-Rate-Limit-Remaining": {
      description: "Number of requests remaining in current window",
      schema: {
        type: "integer",
        example: 999
      }
    },
    "X-Rate-Limit-Reset": {
      description: "Time when rate limit resets (Unix timestamp)",
      schema: {
        type: "integer",
        example: 1674205200
      }
    }
  };
}

/**
 * Generate security scheme definitions
 */
function generateSecuritySchemes(): Record<string, unknown> {
  return {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "JWT token obtained from authentication endpoint"
    }
  };
}

/**
 * Generate callback definitions
 */
function generateCallbacks(): Record<string, unknown> {
  return {
    portfolioRebalanceComplete: {
      "{$request.body#/webhookUrl}": {
        post: {
          requestBody: {
            description: "Portfolio rebalancing completion notification",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    eventType: {
                      type: "string",
                      example: "portfolio.rebalance.completed"
                    },
                    portfolioId: {
                      type: "string",
                      example: "portfolio_123456789"
                    },
                    executionId: {
                      type: "string",
                      example: "exec_987654321"
                    },
                    status: {
                      type: "string",
                      example: "completed"
                    },
                    tradesExecuted: {
                      type: "integer",
                      example: 3
                    },
                    totalValue: {
                      type: "number",
                      example: 5000.00
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                      example: "2024-01-20T15:30:00Z"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Webhook received successfully"
            }
          }
        }
      }
    }
  };
}