import { OpenAPIV3 } from 'openapi-types'

/**
 * OpenAPI Specification Generator for Thorbis Business OS APIs
 * 
 * Generates comprehensive OpenAPI/Swagger documentation for all
 * industry-specific endpoints with proper schemas and examples.
 */

export interface ThorbisApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  summary: string
  description: string
  tags: string[]
  parameters?: OpenAPIV3.ParameterObject[]
  requestBody?: OpenAPIV3.RequestBodyObject
  responses: { [statusCode: string]: OpenAPIV3.ResponseObject }
  security?: OpenAPIV3.SecurityRequirementObject[]
}

export interface IndustryApiSpec {
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll' | 'ai'
  name: string
  description: string
  version: string
  endpoints: ThorbisApiEndpoint[]
  schemas: { [schemaName: string]: OpenAPIV3.SchemaObject }
}

// Home Services API Specification
const homeServicesApi: IndustryApiSpec = {
  industry: 'hs',
  name: 'Home Services API',
  description: 'Comprehensive API for home services management including customers, work orders, scheduling, and invoicing',
  version: '1.0.0',
  endpoints: [
    {
      path: '/api/v1/hs/customers',
      method: 'GET',
      summary: 'List customers',
      description: 'Retrieve home services customers with filtering, pagination, and search capabilities',
      tags: ['Home Services', 'Customers'],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: 'Number of results to return (max 100)',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        },
        {
          name: 'offset',
          in: 'query',
          description: 'Number of results to skip for pagination',
          required: false,
          schema: { type: 'integer', minimum: 0, default: 0 }
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by customer status',
          required: false,
          schema: { type: 'string', enum: ['active', 'inactive', 'prospect', 'archived'] }
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search customers by name, email, or phone number',
          required: false,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Successful response with customer list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerListResponse' },
              example: {
                data: [
                  {
                    id: 'cust_hs_001',
                    name: 'John Smith',
                    email: 'john.smith@email.com',
                    phone: '+1-512-555-0123',
                    status: 'active',
                    address: {
                      street: '123 Oak Street',
                      city: 'Austin',
                      state: 'TX',
                      zip: '78701'
                    },
                    lifetime_value: 15420.50,
                    created_at: '2023-06-15T10:30:00Z'
                  }
                ],
                pagination: {
                  limit: 20,
                  offset: 0,
                  total: 156,
                  has_more: true
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - invalid parameters',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '401': {
          description: 'Unauthorized - invalid or missing API key',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      },
      security: [{ ApiKeyAuth: [] }]
    },
    {
      path: '/api/v1/hs/customers',
      method: 'POST',
      summary: 'Create customer',
      description: 'Create a new home services customer with contact information and preferences',
      tags: ['Home Services', 'Customers'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateCustomerRequest' },
            example: {
              name: 'Sarah Wilson',
              email: 'sarah.wilson@email.com',
              phone: '+1-512-555-0167',
              address: {
                street: '456 Pine Avenue',
                city: 'Cedar Park',
                state: 'TX',
                zip: '78613'
              },
              preferences: {
                communication_method: 'email',
                service_reminders: true,
                marketing_opt_in: false
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Customer created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerResponse' }
            }
          }
        },
        '400': {
          description: 'Bad request - validation errors',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      },
      security: [{ ApiKeyAuth: [] }]
    }
  ],
  schemas: {
    Customer: {
      type: 'object',
      required: ['id', 'name', 'status', 'created_at'],
      properties: {
        id: { type: 'string', description: 'Unique customer identifier' },
        name: { type: 'string', description: 'Customer full name' },
        email: { type: 'string', format: 'email', description: 'Customer email address' },
        phone: { type: 'string', description: 'Customer phone number' },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'prospect', 'archived'],
          description: 'Customer account status'
        },
        address: { $ref: '#/components/schemas/Address' },
        preferences: { $ref: '#/components/schemas/CustomerPreferences' },
        lifetime_value: { type: 'number', description: 'Total customer lifetime value' },
        created_at: { type: 'string', format: 'date-time', description: 'Account creation timestamp' },
        updated_at: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
      }
    },
    Address: {
      type: 'object',
      required: ['street', 'city', 'state', 'zip'],
      properties: {
        street: { type: 'string', description: 'Street address' },
        city: { type: 'string', description: 'City name' },
        state: { type: 'string', description: 'State abbreviation' },
        zip: { type: 'string', description: 'ZIP/postal code' },
        country: { type: 'string', default: 'US', description: 'Country code' }
      }
    },
    CustomerPreferences: {
      type: 'object',
      properties: {
        communication_method: { 
          type: 'string', 
          enum: ['email', 'phone', 'sms', 'mail'],
          description: 'Preferred communication method'
        },
        service_reminders: { type: 'boolean', description: 'Enable service reminders' },
        marketing_opt_in: { type: 'boolean', description: 'Opt-in to marketing communications' }
      }
    },
    CustomerListResponse: {
      type: 'object',
      required: ['data', 'pagination'],
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Customer' }
        },
        pagination: { $ref: '#/components/schemas/PaginationInfo' }
      }
    },
    CustomerResponse: {
      type: 'object',
      required: ['data'],
      properties: {
        data: { $ref: '#/components/schemas/Customer' },
        meta: { $ref: '#/components/schemas/ResponseMeta' }
      }
    },
    CreateCustomerRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        address: { $ref: '#/components/schemas/Address' },
        preferences: { $ref: '#/components/schemas/CustomerPreferences' }
      }
    },
    PaginationInfo: {
      type: 'object',
      required: ['limit', 'offset', 'total', 'has_more'],
      properties: {
        limit: { type: 'integer', description: 'Number of items per page' },
        offset: { type: 'integer', description: 'Number of items skipped' },
        total: { type: 'integer', description: 'Total number of items available' },
        has_more: { type: 'boolean', description: 'Whether more items are available' }
      }
    },
    ResponseMeta: {
      type: 'object',
      properties: {
        request_id: { type: 'string', description: 'Unique request identifier' },
        response_time_ms: { type: 'integer', description: 'Response time in milliseconds' },
        api_version: { type: 'string', description: 'API version used' }
      }
    },
    ErrorResponse: {
      type: 'object',
      required: ['error'],
      properties: {
        error: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: { type: 'string', description: 'Error code' },
            message: { type: 'string', description: 'Human-readable error message' },
            details: { type: 'object', description: 'Additional error details' },
            request_id: { type: 'string', description: 'Request identifier for debugging' }
          }
        }
      }
    }
  }
}

// Restaurant API Specification
const restaurantApi: IndustryApiSpec = {
  industry: 'rest',
  name: 'Restaurant API',
  description: 'Complete restaurant management API including orders, menu, kitchen operations, and customer management',
  version: '1.0.0',
  endpoints: [
    {
      path: '/api/v1/rest/orders',
      method: 'GET',
      summary: 'List orders',
      description: 'Retrieve restaurant orders with filtering by status, type, and kitchen workflow',
      tags: ['Restaurant', 'Orders'],
      parameters: [
        {
          name: 'status',
          in: 'query',
          description: 'Filter by order status',
          required: false,
          schema: { 
            type: 'string', 
            enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'] 
          }
        },
        {
          name: 'type',
          in: 'query',
          description: 'Filter by order type',
          required: false,
          schema: { 
            type: 'string', 
            enum: ['dine_in', 'takeout', 'delivery', 'drive_through'] 
          }
        },
        {
          name: 'kitchen_status',
          in: 'query',
          description: 'Filter by kitchen preparation status',
          required: false,
          schema: { 
            type: 'string', 
            enum: ['pending', 'started', 'cooking', 'ready', 'served'] 
          }
        }
      ],
      responses: {
        '200': {
          description: 'Successful response with order list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderListResponse' }
            }
          }
        }
      },
      security: [{ ApiKeyAuth: [] }]
    }
  ],
  schemas: {
    Order: {
      type: 'object',
      required: ['id', 'order_number', 'status', 'type', 'items', 'total_amount'],
      properties: {
        id: { type: 'string' },
        order_number: { type: 'string' },
        status: { 
          type: 'string', 
          enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'] 
        },
        type: { 
          type: 'string', 
          enum: ['dine_in', 'takeout', 'delivery', 'drive_through'] 
        },
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderItem' }
        },
        total_amount: { type: 'number' },
        kitchen_status: { 
          type: 'string', 
          enum: ['pending', 'started', 'cooking', 'ready', 'served'] 
        }
      }
    },
    OrderItem: {
      type: 'object',
      required: ['id', 'name', 'quantity', 'unit_price'],
      properties: {
        id: { type: 'string' },
        menu_item_id: { type: 'string' },
        name: { type: 'string' },
        quantity: { type: 'integer', minimum: 1 },
        unit_price: { type: 'number' },
        total_price: { type: 'number' },
        modifiers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price: { type: 'number' },
              category: { type: 'string', enum: ['add_on', 'substitution', 'special_request'] }
            }
          }
        }
      }
    },
    OrderListResponse: {
      type: 'object',
      required: ['data'],
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Order' }
        },
        pagination: { $ref: '#/components/schemas/PaginationInfo' }
      }
    }
  }
}

export class OpenApiGenerator {
  private industries: IndustryApiSpec[] = [homeServicesApi, restaurantApi]

  /**
   * Generate complete OpenAPI specification for all industries
   */
  generateCompleteSpec(): OpenAPIV3.Document {
    const spec: OpenAPIV3.Document = {
      openapi: '3.0.3',
      info: {
        title: 'Thorbis Business OS API',
        description: 'Comprehensive API documentation for Thorbis Business Operating System covering all industry verticals including Home Services, Restaurants, Auto Services, Retail, Education, Payroll, and AI services.',
        version: '1.0.0',
        contact: {
          name: 'Thorbis API Support',
          url: 'https://thorbis.com/support',
          email: 'api-support@thorbis.com'
        },
        license: {
          name: 'Proprietary',
          url: 'https://thorbis.com/license'
        },
        termsOfService: 'https://thorbis.com/terms'
      },
      externalDocs: {
        description: 'Complete API Documentation',
        url: 'https://thorbis.com/docs'
      },
      servers: [
        {
          url: 'https://api.thorbis.com',
          description: 'Production API Server'
        },
        {
          url: 'https://staging-api.thorbis.com',
          description: 'Staging API Server'
        },
        {
          url: 'http://localhost:3000',
          description: 'Local Development Server'
        }
      ],
      security: [
        { ApiKeyAuth: [] }
      ],
      paths: Record<string, unknown>,
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'API key authentication. Use "Bearer YOUR_API_KEY" format.'
          },
          OAuth2: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://auth.thorbis.com/oauth2/authorize',
                tokenUrl: 'https://auth.thorbis.com/oauth2/token',
                scopes: {
                  'read:customers': 'Read customer data',
                  'write:customers': 'Create and update customers',
                  'read:orders': 'Read order data',
                  'write:orders': 'Create and update orders',
                  'admin:all': 'Full administrative access'
                }
              }
            }
          }
        },
        schemas: Record<string, unknown>,
        parameters: {
          LimitParam: {
            name: 'limit',
            in: 'query',
            description: 'Number of results to return (max 100)',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
          },
          OffsetParam: {
            name: 'offset',
            in: 'query',
            description: 'Number of results to skip for pagination',
            required: false,
            schema: { type: 'integer', minimum: 0, default: 0 }
          }
        },
        responses: {
          BadRequest: {
            description: 'Bad Request - Invalid parameters or request body',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string' },
                        message: { type: 'string' },
                        validation_errors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              field: { type: 'string' },
                              message: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          Unauthorized: {
            description: 'Unauthorized - Invalid or missing authentication',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'Invalid or missing API key' }
                      }
                    }
                  }
                }
              }
            }
          },
          InternalServerError: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'INTERNAL_ERROR' },
                        message: { type: 'string', example: 'An internal server error occurred' },
                        request_id: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      tags: [
        {
          name: 'Home Services',
          description: 'APIs for home services management including customers, work orders, and scheduling'
        },
        {
          name: 'Restaurant',
          description: 'Restaurant management APIs including orders, menu, kitchen operations, and POS integration'
        },
        {
          name: 'Auto Services',
          description: 'Automotive service APIs for repair orders, diagnostics, parts, and vehicle management'
        },
        {
          name: 'Retail',
          description: 'Retail management APIs including products, inventory, sales, and customer management'
        },
        {
          name: 'Education',
          description: 'Learning management system APIs for courses, students, and progress tracking'
        },
        {
          name: 'Payroll',
          description: 'Payroll processing APIs including employees, timesheets, and tax calculations'
        },
        {
          name: 'AI Services',
          description: 'AI-powered APIs for natural language processing, automation, and intelligent insights'
        }
      ]
    }

    // Merge all industry specifications
    this.industries.forEach(industry => {
      // Add industry-specific paths
      industry.endpoints.forEach(endpoint => {
        if (!spec.paths[endpoint.path]) {
          spec.paths[endpoint.path] = {}
        }
        
        const method = endpoint.method.toLowerCase() as keyof OpenAPIV3.PathItemObject
        spec.paths[endpoint.path][method] = {
          summary: endpoint.summary,
          description: endpoint.description,
          tags: endpoint.tags,
          parameters: endpoint.parameters,
          requestBody: endpoint.requestBody,
          responses: endpoint.responses,
          security: endpoint.security
        }
      })

      // Add industry-specific schemas
      Object.entries(industry.schemas).forEach(([schemaName, schema]) => {
        const prefixedName = '${industry.industry.toUpperCase()}_${schemaName}'
        if (spec.components?.schemas) {
          spec.components.schemas[prefixedName] = schema
        }
      })
    })

    return spec
  }

  /**
   * Generate OpenAPI specification for a specific industry
   */
  generateIndustrySpec(industry: string): OpenAPIV3.Document | null {
    const industrySpec = this.industries.find(i => i.industry === industry)
    if (!industrySpec) return null

    const spec: OpenAPIV3.Document = {
      openapi: '3.0.3',
      info: {
        title: '${industrySpec.name} - Thorbis Business OS',
        description: industrySpec.description,
        version: industrySpec.version
      },
      servers: [
        {
          url: 'https://api.thorbis.com',
          description: 'Production API Server'
        }
      ],
      paths: Record<string, unknown>,
      components: {
        schemas: industrySpec.schemas,
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization'
          }
        }
      }
    }

    // Add industry-specific endpoints
    industrySpec.endpoints.forEach(endpoint => {
      if (!spec.paths[endpoint.path]) {
        spec.paths[endpoint.path] = {}
      }
      
      const method = endpoint.method.toLowerCase() as keyof OpenAPIV3.PathItemObject
      spec.paths[endpoint.path][method] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters,
        requestBody: endpoint.requestBody,
        responses: endpoint.responses,
        security: endpoint.security
      }
    })

    return spec
  }

  /**
   * Export OpenAPI spec as JSON
   */
  exportJson(industryFilter?: string): string {
    const spec = industryFilter 
      ? this.generateIndustrySpec(industryFilter)
      : this.generateCompleteSpec()
    
    return JSON.stringify(spec, null, 2)
  }

  /**
   * Export OpenAPI spec as YAML
   */
  exportYaml(industryFilter?: string): string {
    // Would use a YAML library in production
    const spec = industryFilter 
      ? this.generateIndustrySpec(industryFilter)
      : this.generateCompleteSpec()
    
    // Simplified YAML export (would use js-yaml in production)
    return '# OpenAPI specification would be in YAML format
# This is a placeholder - implement with js-yaml library
openapi: "3.0.3"
info:
  title: "${spec?.info.title}"
  version: "${spec?.info.version}"
'
  }
}

export const openApiGenerator = new OpenApiGenerator()