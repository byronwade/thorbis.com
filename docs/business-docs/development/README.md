# Development Documentation

Welcome to the Thorbis Business OS development documentation. This directory contains comprehensive guides for developers, technical architects, and DevOps engineers working with the platform.

## 🛠️ Development Overview

Thorbis Business OS is built on modern web technologies with a focus on performance, security, and scalability:

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Node.js, RESTful APIs
- **AI Integration**: Anthropic Claude, Model Context Protocol (MCP)
- **Performance**: NextFaster doctrine (sub-300ms navigation, 170KB budget)
- **Design System**: Odixe dark-first components with electric blue accents
- **Security**: Zero-trust architecture with blockchain verification

## 📚 Development Guides

### Essential Development Resources

1. **[Local Development Setup](./01-local-development-setup.md)**
   - Development environment configuration
   - Required tools and dependencies
   - Database setup and seeding
   - Local development workflows

2. **[Architecture Overview](./02-architecture-overview.md)**
   - System architecture and design patterns
   - Monorepo structure and organization
   - Industry-separated applications
   - Component architecture and reuse

3. **[API Development](./03-api-development.md)**
   - RESTful API design and implementation
   - Industry-specific API namespaces
   - Authentication and authorization
   - Rate limiting and security

4. **[Frontend Development](./04-frontend-development.md)**
   - Next.js 15 App Router patterns
   - Component development with Odixe design system
   - Performance optimization (NextFaster)
   - State management and data fetching

5. **[Database Development](./05-database-development.md)**
   - PostgreSQL schema design
   - Row Level Security (RLS) policies
   - Migration strategies
   - Multi-tenant architecture

6. **[Testing Strategy](./06-testing-strategy.md)**
   - Unit testing with Vitest
   - Integration testing patterns
   - End-to-end testing with Playwright
   - Security testing and RLS validation

7. **[Performance Optimization](./07-performance-optimization.md)**
   - NextFaster implementation
   - Bundle optimization and code splitting
   - Database query optimization
   - Caching strategies

8. **[Deployment Guide](./08-deployment-guide.md)**
   - Production deployment workflows
   - CI/CD pipeline configuration
   - Environment management
   - Monitoring and observability

## 🏗️ Architecture Principles

### NextFaster Performance Doctrine
- **Sub-300ms navigation** with aggressive prefetching
- **170KB JavaScript budget** per route
- **Server-first rendering** minimizing client hydration
- **No loading spinners** using stale-while-revalidate
- **Progressive enhancement** ensuring core functionality without JavaScript

### Odixe Design System
- **Dark-first VIP aesthetic** with minimal color usage
- **Electric blue accents** (#1C8BFF) for focus and CTAs
- **No overlay policy** - use inline panels and dedicated pages
- **Consistent typography** with Inter font and standardized scale
- **Responsive design** optimized for all screen sizes

### Security-First Development
- **Zero-trust architecture** with verification at every layer
- **Row Level Security** for complete multi-tenant isolation
- **AI safety frameworks** with confirmation workflows
- **Blockchain verification** for critical operations
- **GDPR/CCPA compliance** built into data handling

## 🔧 Development Tools

### Required Tools
```bash
# Core Development Stack
Node.js >= 18.17.0 (recommend 20.x LTS)
pnpm >= 8.0.0 (package manager)
Docker >= 20.0.0 (containerization)
Git >= 2.30.0 (version control)

# Database and Backend
PostgreSQL >= 15.0
Supabase CLI >= 1.100.0
Redis >= 6.0 (caching and sessions)

# Frontend Development  
Next.js 15 (React framework)
TypeScript >= 5.0 (type safety)
Tailwind CSS >= 3.3 (styling)
Vite/Vitest (testing)

# Development Environment
VS Code (recommended editor)
Docker Compose (local services)
Playwright (E2E testing)
ESLint + Prettier (code quality)
```

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "supabase.supabase-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

## 🚀 Quick Development Start

### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/thorbisinc/thorbis-business-os.git
cd thorbis-business-os

# Install dependencies
pnpm install

# Start local services
docker-compose up -d

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 2. Database Setup
```bash
# Start Supabase locally
supabase start

# Apply migrations
pnpm db:push

# Seed with sample data
pnpm db:seed --industry=home-services --size=medium
```

### 3. Development Server
```bash
# Start all applications
pnpm dev

# Or start specific applications
pnpm dev:hs      # Home Services (port 3001)
pnpm dev:rest    # Restaurant (port 3011)
pnpm dev:auto    # Automotive (port 3012)
pnpm dev:ret     # Retail (port 3013)
pnpm dev:site    # Marketing site (port 3000)
```

### 4. Verification
```bash
# Run tests
pnpm test

# Check types
pnpm type-check

# Lint code
pnpm lint

# Build for production
pnpm build
```

## 📁 Project Structure

### Monorepo Organization
```
thorbis-business-os/
├── apps/                    # Industry-specific applications
│   ├── hs/                 # Home Services (/hs/ route)
│   ├── rest/               # Restaurant (/rest/ route)
│   ├── auto/               # Automotive (/auto/ route)
│   ├── ret/                # Retail (/ret/ route)
│   ├── site/               # Marketing website (root)
│   └── ai/                 # AI chat interface
├── packages/               # Shared libraries
│   ├── ui/                 # Odixe design system components
│   ├── design/             # Design tokens and themes
│   ├── schemas/            # Zod schemas and validation
│   ├── auth/               # Authentication utilities
│   ├── agent/              # MCP tools and AI integration
│   └── billing/            # Stripe integration
├── docs/                   # Documentation
├── database/               # Supabase migrations and functions
└── tools/                  # Development and build tools
```

### Application Structure (Next.js 15)
```
apps/[industry]/
├── src/
│   ├── app/                # App Router pages and layouts
│   │   ├── (dashboard)/    # Dashboard routes
│   │   ├── api/            # API routes
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/             # Odixe UI components
│   │   └── forms/          # Form components
│   ├── lib/                # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🧪 Development Workflow

### Branch Strategy
```
main                        # Production-ready code
├── develop                 # Integration branch
│   ├── feature/            # Feature development
│   ├── bugfix/             # Bug fixes
│   └── hotfix/             # Critical production fixes
└── release/                # Release preparation
```

### Code Quality Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks
- **Conventional Commits**: Standardized commit messages

### Testing Requirements
- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: All API endpoints tested
- **E2E Tests**: Critical user journeys covered
- **Security Tests**: RLS policies validated
- **Performance Tests**: NextFaster compliance verified

## 🔄 Development Processes

### Feature Development Process
1. **Planning**: Create GitHub issue with acceptance criteria
2. **Design**: Create figma designs following Odixe system
3. **Development**: Implement feature with tests
4. **Code Review**: Peer review and approval required
5. **Testing**: Automated and manual testing
6. **Deployment**: Staged rollout through environments

### Code Review Guidelines
- **Security**: Check for vulnerabilities and data exposure
- **Performance**: Ensure NextFaster compliance
- **Design**: Verify Odixe design system usage
- **Testing**: Adequate test coverage
- **Documentation**: Update relevant documentation

### Release Process
1. **Feature Freeze**: No new features after cutoff
2. **Testing**: Comprehensive testing cycle
3. **Documentation**: Update user and developer docs
4. **Deployment**: Staged production release
5. **Monitoring**: Post-release health checks

## 🎯 Performance Targets

### NextFaster Metrics
- **First Contentful Paint (FCP)**: ≤ 1.8s
- **Largest Contentful Paint (LCP)**: ≤ 2.5s
- **Cumulative Layout Shift (CLS)**: ≤ 0.1
- **First Input Delay (FID)**: ≤ 100ms
- **Time to Interactive (TTI)**: ≤ 3.8s

### Bundle Size Targets
- **JavaScript Budget**: ≤ 170KB per route
- **CSS Budget**: ≤ 50KB per route
- **Image Optimization**: AVIF/WebP with proper sizing
- **Font Loading**: Subset fonts with swap strategy

## 🔒 Security Guidelines

### Development Security
- **Environment Variables**: Never commit secrets
- **SQL Injection**: Use parameterized queries only
- **XSS Protection**: Validate and sanitize all inputs
- **CSRF Protection**: Use built-in Next.js protection
- **Authentication**: Implement proper session management

### AI Safety in Development
- **Tool Validation**: All AI tools must be idempotent
- **Confirmation Flows**: Destructive actions require approval
- **Audit Trails**: Log all AI interactions
- **Rate Limiting**: Implement usage budgets
- **Prompt Injection**: Validate AI inputs and outputs

## 📖 Learning Resources

### Internal Training
- **Architecture Deep Dive**: System design and patterns
- **NextFaster Workshop**: Performance optimization techniques
- **Odixe Design System**: Component development
- **Security Training**: Threat modeling and mitigation
- **AI Integration**: MCP tool development

### External Resources
- **Next.js Documentation**: Official framework docs
- **Supabase Guides**: Database and backend patterns
- **Tailwind CSS Docs**: Styling and design system
- **TypeScript Handbook**: Type system mastery
- **React Patterns**: Component design patterns

## 🆘 Getting Help

### Development Support
- **Internal Chat**: #dev-help Slack channel
- **Code Review**: GitHub pull request reviews
- **Architecture Decisions**: Technical design discussions
- **Performance Issues**: NextFaster optimization help
- **Security Questions**: Security team consultations

### External Support
- **Community Forum**: developer.thorbis.com
- **GitHub Issues**: Bug reports and feature requests
- **Stack Overflow**: Technical questions (tag: thorbis)
- **Discord**: Real-time community chat
- **Email**: developers@thorbis.com

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  

## Next Steps

Choose the development guide that matches your needs:

- **New to the project?** Start with [Local Development Setup](./01-local-development-setup.md)
- **Building APIs?** Go to [API Development](./03-api-development.md)  
- **Creating UIs?** Check [Frontend Development](./04-frontend-development.md)
- **Working with data?** See [Database Development](./05-database-development.md)
- **Optimizing performance?** Review [Performance Optimization](./07-performance-optimization.md)