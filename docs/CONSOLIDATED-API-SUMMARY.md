# Thorbis Business OS - Consolidated API Implementation

## Overview

This document outlines the implementation of the consolidated API system for Thorbis Business OS. The system centralizes all API endpoints under a single service while maintaining industry separation and following established patterns.

## Architecture

### Centralized API Location
- **Base Path**: `apps/site/src/app/api/v2/`
- **Documentation**: `apps/site/src/app/api/v2/docs/`
- **Middleware**: `apps/site/src/lib/api-middleware.ts`

### Industry-Separated Endpoints
All APIs follow the pattern: `/api/v2/{industry}/{resource}`

- **Home Services**: `/api/v2/hs/` - HVAC, plumbing, electrical services
- **Restaurant**: `/api/v2/rest/` - Orders, menus, reservations, kitchen operations  
- **Auto Services**: `/api/v2/auto/` - Repair orders, parts, vehicle management
- **Retail**: `/api/v2/ret/` - Products, inventory, customers, sales
- **Courses**: `/api/v2/courses/` - Learning management, enrollment, progress
- **Payroll**: `/api/v2/payroll/` - Employee management, timesheets, benefits

## Implemented Endpoints

### Home Services (`/api/v2/hs/`)
- ✅ `GET|POST /work-orders` - Work order management
- 🔄 Individual work order operations (planned)
- 🔄 Customer management (planned)
- 🔄 Technician management (planned)

### Restaurant (`/api/v2/rest/`)
- ✅ `GET|POST /orders` - Restaurant order management
- 🔄 Menu management (planned)
- 🔄 Table management (planned)
- 🔄 Reservation system (planned)

### Auto Services (`/api/v2/auto/`)
- ✅ `GET|POST /repair-orders` - Auto repair order management
- 🔄 Parts inventory (planned)
- 🔄 Vehicle management (planned)
- 🔄 Service bay scheduling (planned)

### Retail (`/api/v2/ret/`)
- ✅ `GET|POST /products` - Product management with variants
- 🔄 Inventory tracking (planned)
- 🔄 Customer management (planned)
- 🔄 Sales orders (planned)

### Courses (`/api/v2/courses/`)
- ✅ `GET|POST /courses` - Course management with enrollment
- 🔄 Lesson management (planned)
- 🔄 Progress tracking (planned)
- 🔄 Certification system (planned)

## Core Features

### Security & Authentication
- **JWT-based authentication** via Supabase Auth
- **Role-based permissions** system
- **Row Level Security (RLS)** enforcement
- **Rate limiting** with configurable windows
- **Input validation** using Zod schemas
- **PII redaction** based on user roles
- **Audit logging** for all operations

### Performance & Reliability
- **Sub-300ms response times** target
- **Idempotency support** for write operations
- **Caching** with stale-while-revalidate
- **Compression** and optimization
- **Request/Response monitoring** with metrics
- **Error handling** with structured responses

### API Standards
- **OpenAPI 3.0.3** documentation
- **RESTful conventions** with proper HTTP methods
- **Consistent error formats** across all endpoints
- **Pagination** for list endpoints (limit/offset)
- **Sorting and filtering** capabilities
- **Standard headers** for metadata and debugging

### Middleware Features
The consolidated middleware (`api-middleware.ts`) provides:

1. **Authentication & Authorization**
   - JWT token validation
   - Business context extraction
   - Permission checking
   - Multi-tenant isolation

2. **Rate Limiting**
   - Per-user and per-endpoint limits
   - Configurable windows and thresholds
   - Proper HTTP headers for client handling

3. **Input Validation**
   - Request body validation with Zod
   - Query parameter validation
   - File upload validation

4. **Idempotency**
   - Duplicate request prevention
   - Result caching for write operations
   - Proper HTTP status codes

5. **Monitoring & Logging**
   - Request/response timing
   - Error tracking and alerting
   - Security event logging
   - Usage metrics for billing

6. **Performance Optimization**
   - Response caching
   - Compression
   - Optimistic caching headers

## API Management Agent

### Agent Configuration
- **Location**: `.cursor/agents/api-management-agent.yml`
- **Purpose**: Automated API maintenance and updates
- **Triggers**: File changes in app directories

### Automated Capabilities
1. **Feature Detection**: Scans for new features in individual apps
2. **Endpoint Generation**: Creates corresponding API endpoints
3. **Schema Updates**: Updates existing endpoints when schemas change
4. **Documentation**: Maintains OpenAPI specifications
5. **Validation**: Ensures security and performance standards
6. **Cleanup**: Manages deprecated endpoint removal

### Workflow
1. **Change Detection**: Monitors app directories for modifications
2. **Analysis**: Determines what API changes are needed
3. **Implementation**: Generates/updates endpoints with proper patterns
4. **Validation**: Tests and validates new implementations
5. **Documentation**: Updates OpenAPI specs and examples
6. **Notification**: Reports changes and migration requirements

## Development Workflow

### Adding New Endpoints
1. **Implement feature** in individual app
2. **Agent automatically detects** changes
3. **API endpoint generated** in consolidated structure
4. **Documentation updated** automatically
5. **Tests run** to validate implementation
6. **Migration guide created** if needed

### API Standards Enforcement
- All endpoints use the `apiMiddleware` wrapper
- Consistent error handling and response formats
- Industry-specific namespacing maintained
- Security patterns applied uniformly
- Performance requirements enforced

### Testing Strategy
- Unit tests for middleware functionality
- Integration tests for endpoint behavior
- Performance tests for response times
- Security tests for authentication/authorization
- Load tests for rate limiting validation

## Documentation

### Interactive Documentation
- **Swagger UI**: Available at `/api/v2/docs?format=html`
- **JSON Spec**: Available at `/api/v2/docs`
- **Examples**: Comprehensive request/response examples
- **Try It Out**: Interactive API testing interface

### Schema Documentation
- Complete OpenAPI 3.0.3 specification
- Detailed parameter descriptions
- Error response documentation
- Authentication requirements
- Rate limiting information

## Migration Plan

### Phase 1: Core Implementation ✅
- [x] Consolidated API middleware
- [x] Industry-separated endpoints
- [x] Basic CRUD operations for each industry
- [x] OpenAPI documentation
- [x] API management agent

### Phase 2: Enhanced Features (Next Steps)
- [ ] Individual resource operations (GET/PUT/DELETE by ID)
- [ ] Advanced filtering and search capabilities
- [ ] Real-time subscriptions via WebSockets
- [ ] File upload handling
- [ ] Webhook system for integrations

### Phase 3: Migration & Cleanup
- [ ] Update individual apps to use consolidated APIs
- [ ] Add deprecation warnings to old endpoints
- [ ] Create migration guides for external integrations
- [ ] Remove old API routes from individual apps
- [ ] Performance optimization based on usage patterns

## Usage Examples

### Authentication
```bash
curl -H "Authorization: Bearer <jwt-token>" \
     -H "Content-Type: application/json" \
     https://thorbis.com/api/v2/hs/work-orders
```

### Creating Resources with Idempotency
```bash
curl -X POST \
     -H "Authorization: Bearer <jwt-token>" \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: req_20240201_abc123" \
     -d '{"customer_id":"cust_123","title":"HVAC Repair","services":[...]}' \
     https://thorbis.com/api/v2/hs/work-orders
```

### Filtering and Pagination
```bash
curl -H "Authorization: Bearer <jwt-token>" \
     "https://thorbis.com/api/v2/ret/products?category=Electronics&in_stock=true&limit=50&offset=0"
```

## Benefits

### For Developers
- **Single API surface** to maintain and document
- **Consistent patterns** across all industries
- **Automated maintenance** via the management agent
- **Comprehensive tooling** for testing and debugging
- **Clear migration path** from individual APIs

### For Operations
- **Centralized monitoring** and alerting
- **Unified security policies** and compliance
- **Better performance optimization** opportunities
- **Simpler deployment** and scaling strategies
- **Consolidated error handling** and logging

### For Users
- **Consistent developer experience** across industries
- **Single authentication** flow for all APIs
- **Unified documentation** and examples
- **Better performance** through optimization
- **Reliable idempotency** and error handling

## Next Steps

1. **Complete Phase 2 implementation** - Individual resource operations
2. **Performance testing** and optimization
3. **Security audit** and penetration testing
4. **Load testing** with production-like traffic
5. **Beta testing** with select customers
6. **Migration planning** for existing integrations
7. **Production rollout** with gradual traffic shifting

## Support & Maintenance

The API management agent ensures the consolidated API stays in sync with feature development across all apps. Manual intervention is only required for:
- Breaking changes requiring migration planning
- Performance optimization based on usage patterns  
- Security updates and compliance requirements
- New industry verticals or major architectural changes

For questions or issues, refer to:
- **API Documentation**: `/api/v2/docs?format=html`
- **Agent Configuration**: `.cursor/agents/api-management-agent.yml`
- **Middleware Code**: `apps/site/src/lib/api-middleware.ts`
- **Project Status**: `PROJECT-STATUS.md`