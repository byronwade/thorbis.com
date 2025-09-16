# Thorbis Business OS - Comprehensive Database Schema Overview

> **Last Updated**: January 31, 2025  
> **Version**: 1.0.0  
> **Migration Files**: 9 complete schemas

## Executive Summary

This document provides a comprehensive overview of the Thorbis Business OS database architecture, designed to support multi-tenant, industry-specific business operations with advanced AI integration, trust verification, and blockchain audit trails.

## Schema Architecture Overview

### Core Foundation Schemas

#### 1. **Core Management Schemas** (`001_create_core_schemas.sql`)
- **`sys_mgmt`** - System configuration and settings
- **`tenant_mgmt`** - Organizations and multi-tenancy management  
- **`user_mgmt`** - User authentication, profiles, and organization memberships
- **`audit_mgmt`** - Comprehensive audit logging and compliance tracking
- **`ai_mgmt`** - AI processing queues, verification results, and governance

**Key Features:**
- PostGIS enabled for geographic data
- Multi-tenant isolation with RLS policies
- AI governance and verification framework
- Comprehensive audit trail for all operations

#### 2. **Business Directory System** (`002_create_business_directory.sql`)
- **`directory`** - Public business directory with AI-powered verification
- Business submissions with comprehensive verification scoring
- Trust badges and compliance frameworks
- Geographic search capabilities with PostGIS
- AI-driven risk assessment and approval workflow

**Key Features:**
- 6-factor AI verification system (Contact, Location, Business, Compliance, Digital, Reputation)
- Automated trust badge generation
- Geographic coordinate handling with POINT geometry
- Industry-specific categorization

### Industry-Specific Schemas

#### 3. **Home Services Schema** (`003_create_hs_schema.sql`)
- **`hs`** - Complete home services business management
- Work orders with scheduling and dispatch
- Customer management with service history
- Technician management and scheduling
- Service routing and optimization
- Estimates, invoicing, and payment processing

**Key Entities:** Customers, Technicians, Work Orders, Estimates, Service Areas, Equipment, Scheduling

#### 4. **Auto Services Schema** (`004_create_auto_schema.sql`)  
- **`auto`** - Comprehensive automotive service management
- Vehicle information with VIN tracking and specifications
- Repair orders with detailed diagnostic and labor tracking
- Parts inventory with compatibility and cross-referencing
- Service bays and equipment management
- ASE certification tracking for technicians

**Key Entities:** Customers, Vehicles, Technicians, Repair Orders, Parts Inventory, Service Bays, Service History

#### 5. **Restaurant Schema** (`005_create_rest_schema.sql`)
- **`rest`** - Complete restaurant and food service management  
- Menu management with modifiers and nutritional information
- Table management and reservation system
- Order processing with kitchen timing
- Customer loyalty programs
- Waitlist management with estimated wait times

**Key Entities:** Customers, Menu Items, Tables, Orders, Reservations, Waitlist, Menu Categories

#### 6. **Retail Schema** (`006_create_ret_schema.sql`)
- **`ret`** - Comprehensive retail and e-commerce management
- Product catalog with variants and inventory tracking
- Multi-location inventory management
- Customer management with purchase history
- Point-of-sale integration
- Supplier and purchase order management
- E-commerce order fulfillment

**Key Entities:** Customers, Products, Product Variants, Orders, Inventory, Suppliers, Purchase Orders

#### 7. **Payroll Schema** (`007_create_payroll_schema.sql`)
- **`payroll`** - Complete HR and payroll management system
- Employee management with comprehensive HR data
- Time tracking and attendance management
- Payroll processing with tax calculations
- Benefits administration and enrollment
- Leave management and PTO tracking
- Performance review system

**Key Entities:** Employees, Time Entries, Payroll Runs, Benefit Plans, Leave Requests, Performance Reviews

#### 8. **Courses/LMS Schema** (`008_create_courses_schema.sql`)
- **`courses`** - Full learning management system
- Course catalog with modules and lessons
- Student enrollment and progress tracking
- Assessment system with quizzes and assignments
- Discussion forums and community features
- Certificate generation and verification
- Instructor management and ratings

**Key Entities:** Students, Instructors, Courses, Enrollments, Lessons, Quizzes, Assignments, Certificates

#### 9. **Investigations Schema** (`009_create_investigations_schema.sql`)
- **`investigations`** - Professional investigation and security services
- Case management with detailed tracking
- Evidence collection with chain of custody
- Surveillance activity logging
- Interview documentation and witness management
- Time tracking and billing
- Report generation with confidentiality levels

**Key Entities:** Cases, Evidence, Investigators, Clients, Surveillance Activities, Interviews, Reports

## Common Architectural Patterns

### Multi-Tenancy
- Every table includes `organization_id` for tenant isolation
- Row-Level Security (RLS) policies enforce data separation
- Centralized organization membership management

### Audit and Compliance
- Comprehensive `audit_mgmt` schema tracks all changes
- AI verification and governance system
- Blockchain integration for immutable audit trails
- GDPR and compliance-ready data handling

### AI Integration
- AI processing queues for automated workflows
- Verification scoring and risk assessment
- Trust badge generation and validation
- Performance optimization through AI insights

### Geographic Capabilities
- PostGIS extension for location-based services
- Geographic search and routing optimization
- Coordinate storage with spatial indexing
- Location-based service area management

### Security and Privacy
- End-to-end encryption for sensitive data
- Role-based access control (RBAC)
- Industry-specific confidentiality levels
- Secure file storage and chain of custody

## Performance Optimizations

### Indexing Strategy
- Industry-specific indexes for common queries
- GIN indexes for array and JSONB columns
- Spatial indexes for geographic data
- Composite indexes for multi-column searches

### Caching and Optimization
- NextFaster performance integration
- Aggressive caching strategies
- Optimized query patterns
- Real-time performance monitoring

## Database Statistics

| Schema | Tables | Key Features | Business Focus |
|--------|--------|--------------|----------------|
| Core | 15+ | Multi-tenancy, AI, Audit | Foundation |
| Directory | 5+ | Public listings, Verification | Discovery |
| Home Services | 10+ | Work orders, Scheduling | Field Services |
| Auto Services | 12+ | Vehicle tracking, Parts | Automotive |
| Restaurant | 8+ | Menu, Orders, Tables | Food Service |
| Retail | 12+ | Inventory, POS, E-commerce | Retail Sales |
| Payroll | 11+ | HR, Payroll, Benefits | Human Resources |
| Courses | 15+ | Learning, Assessment | Education |
| Investigations | 9+ | Cases, Evidence, Security | Professional Services |
| **Total** | **95+** | **Complete Business OS** | **All Industries** |

## Integration Points

### External Systems
- **Supabase** - Database hosting and authentication
- **Stripe** - Payment processing and billing
- **SendGrid** - Email notifications and marketing
- **Twilio** - SMS and phone verification
- **Google Maps** - Geographic services and routing
- **Blockchain** - Immutable audit trails and verification

### API Architecture
- Industry-separated namespaces (`/api/v1/hs/`, `/api/v1/auto/`, etc.)
- RESTful endpoints with GraphQL support
- Real-time subscriptions for live updates
- Webhook integration for external services

## Security Implementation

### Data Protection
- **Encryption at Rest** - All sensitive data encrypted
- **Encryption in Transit** - TLS 1.3 for all connections
- **Field-Level Encryption** - PII and financial data
- **Key Management** - Secure key rotation and storage

### Access Control
- **Row-Level Security** - Database-enforced tenant isolation
- **Role-Based Access** - Granular permission system
- **API Authentication** - JWT tokens with refresh mechanism
- **Audit Logging** - Complete access and change tracking

## Deployment and Migration

### Migration System
- **Sequential Migrations** - Numbered migration files
- **Rollback Support** - Safe rollback procedures
- **Environment Promotion** - Dev → Staging → Production
- **Zero-Downtime** - Online schema changes

### Setup Process
```bash
# Run all migrations
./scripts/setup-database.sh

# Verify installation
npm run db:verify

# Seed demo data
npm run db:seed
```

## Development Guidelines

### Schema Evolution
- Never modify existing migrations
- Create new migrations for schema changes
- Maintain backward compatibility
- Document breaking changes

### Performance Best Practices
- Use appropriate indexes for query patterns
- Monitor query performance with EXPLAIN ANALYZE
- Implement proper pagination for large datasets
- Cache frequently accessed data

### Testing Strategy
- Unit tests for database functions
- Integration tests for complex workflows
- Performance tests for scale validation
- Security tests for access control

## Future Enhancements

### Planned Features
- Advanced AI analytics and insights
- Blockchain-based smart contracts
- Real-time collaboration features
- Mobile-first responsive design
- Advanced reporting and dashboards

### Scalability Roadmap
- Horizontal database sharding
- Read replica optimization  
- CDC (Change Data Capture) implementation
- Event-driven architecture expansion

---

## Quick Reference

### Connection Information
- **Primary Database**: Supabase PostgreSQL with PostGIS
- **Authentication**: Row-Level Security (RLS) with Supabase Auth
- **Caching**: Redis for session and application data
- **File Storage**: Supabase Storage with CDN

### Key Commands
```bash
# Setup database
./scripts/setup-database.sh

# Run migrations
pnpm db:migrate

# Generate types
pnpm db:types

# Verify setup
pnpm db:verify
```

This comprehensive database schema provides the foundation for a scalable, secure, and industry-specific business operating system with advanced AI integration and compliance capabilities.