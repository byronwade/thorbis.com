# Database Setup Guide
**Quick setup guide for Thorbis Business OS database infrastructure**

## Prerequisites

### Required Software
- **PostgreSQL 14+** (recommended: PostgreSQL 17+)
- **psql client** (PostgreSQL command-line client)
- **Bash** (for running setup scripts)

### Installation

#### macOS (using Homebrew)
```bash
brew install postgresql@17
brew services start postgresql@17
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql-17 postgresql-client-17
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Docker (Alternative)
```bash
docker run --name thorbis-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=thorbis_dev \
  -p 5432:5432 \
  -d postgres:17-alpine
```

## Quick Setup

### 1. Automated Setup (Recommended)
```bash
# Run the automated setup script
./scripts/setup-database.sh

# Or with custom parameters
./scripts/setup-database.sh \
  --host localhost \
  --port 5432 \
  --user thorbis_user \
  --password your_secure_password \
  --database thorbis_dev
```

### 2. Manual Setup
```bash
# Create database
createdb thorbis_dev

# Set environment variable
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thorbis_dev"

# Run migrations
./scripts/run-migrations.sh
```

## Environment Configuration

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thorbis_dev"

# Application Configuration
NODE_ENV=development
PORT=3000

# Optional: Supabase Integration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Migration Management

### Running Migrations
```bash
# Check migration status
./scripts/run-migrations.sh --status

# Run all pending migrations
./scripts/run-migrations.sh

# Dry run (see what would be executed)
./scripts/run-migrations.sh --dry-run

# Verbose output
./scripts/run-migrations.sh --verbose
```

### Migration Files
Migrations are located in `/migrations/` directory:
- `001_create_core_schemas.sql` - Core system setup
- `002_create_tenant_management.sql` - Multi-tenant infrastructure  
- `003_create_user_management.sql` - User authentication & RBAC
- Additional migrations for industry-specific schemas

## Verification

### Check Database Setup
```sql
-- Connect to database
psql "postgresql://postgres:postgres@localhost:5432/thorbis_dev"

-- List schemas
\dn

-- Check system configuration
SELECT * FROM system_core.system_config;

-- Check demo tenants
SELECT name, slug, industry, status FROM tenant_mgmt.tenants;

-- Check demo users
SELECT email, first_name, last_name, status FROM user_mgmt.users;
```

### Expected Output
After successful setup, you should see:
- **8 core schemas**: system_core, tenant_mgmt, user_mgmt, security_mgmt, etc.
- **8 industry schemas**: hs, auto, rest, banking, ret, courses, payroll, investigations
- **3 demo tenants**: demo-hs, demo-auto, demo-rest
- **4 demo users**: Including system admin and tenant-specific users

## Development Data

The setup automatically creates demo data for development:

### Demo Tenants
| Name | Slug | Industry | Domain |
|------|------|----------|--------|
| Demo Home Services | demo-hs | HOME_SERVICES | demo-hs.thorbis.local |
| Demo Auto Shop | demo-auto | AUTOMOTIVE | demo-auto.thorbis.local |
| Demo Restaurant | demo-rest | RESTAURANT | demo-rest.thorbis.local |

### Demo Users
| Email | Role | Tenant | Purpose |
|-------|------|--------|---------|
| admin@thorbis.com | super_admin | System | System administration |
| demo-hs@thorbis.com | tenant_admin | demo-hs | Home services demo |
| demo-auto@thorbis.com | tenant_admin | demo-auto | Auto services demo |
| demo-rest@thorbis.com | tenant_admin | demo-rest | Restaurant demo |

## Database Features

### Multi-Tenancy
- **Tenant Isolation**: Row-level security (RLS) policies
- **Industry Separation**: Dedicated schemas per industry
- **Subscription Management**: Built-in billing and plan management

### Security
- **RBAC**: Role-based access control with fine-grained permissions
- **Audit Logging**: Comprehensive event tracking
- **Encryption**: Column-level encryption for sensitive data
- **Authentication**: Session management with security tracking

### Performance
- **Optimized Indexes**: Composite and partial indexes
- **Partitioning**: Date-based partitioning for large tables
- **Caching Strategy**: Materialized views and Redis integration
- **Query Optimization**: Performance monitoring and optimization

## Troubleshooting

### Common Issues

#### Connection Failed
```bash
# Check PostgreSQL status
brew services list | grep postgresql
# or
sudo systemctl status postgresql

# Test connection
psql -h localhost -p 5432 -U postgres -d postgres
```

#### Permission Denied
```bash
# Fix PostgreSQL permissions (macOS)
sudo mkdir -p /usr/local/var/postgres
sudo chown $(whoami) /usr/local/var/postgres

# Create user (if needed)
createuser --interactive --pwprompt thorbis_user
```

#### Migration Failures
```bash
# Check migration status
./scripts/run-migrations.sh --status

# Reset database (CAUTION: destroys data)
dropdb thorbis_dev
./scripts/setup-database.sh
```

### Getting Help
```bash
# Show migration script help
./scripts/run-migrations.sh --help

# Show setup script help
./scripts/setup-database.sh --help
```

## Next Steps

After database setup:

1. **Start Development Server**
   ```bash
   pnpm dev
   ```

2. **Access Applications**
   - Home Services: http://localhost:3001
   - Auto Services: http://localhost:3012
   - Restaurant: http://localhost:3011

3. **API Testing**
   ```bash
   # Test system health
   curl http://localhost:3000/api/health
   
   # Test tenant data
   curl http://localhost:3000/api/tenants
   ```

4. **Database Management**
   - Use pgAdmin, TablePlus, or similar for GUI management
   - Monitor performance with built-in monitoring schema
   - Set up automated backups for production

## Production Considerations

### Security
- Change all default passwords
- Enable SSL/TLS connections
- Configure firewall rules
- Set up VPN access
- Enable audit logging

### Performance
- Tune PostgreSQL configuration
- Set up connection pooling (PgBouncer)
- Configure monitoring (Prometheus/Grafana)
- Implement backup strategies
- Set up read replicas if needed

### Monitoring
- Database performance metrics
- Query performance analysis
- Storage usage tracking
- Connection monitoring
- Error rate tracking

For production deployment, refer to the comprehensive database documentation in `/docs/business-docs/database/`.