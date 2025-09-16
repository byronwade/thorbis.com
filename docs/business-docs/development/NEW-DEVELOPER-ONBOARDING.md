# New Developer Onboarding Guide

> **Quick-start guide for developers joining the Thorbis Business OS project**
> 
> **Estimated setup time**: 30-45 minutes  
> **Prerequisites check**: 5 minutes  
> **First app running**: 15 minutes

## 🎯 Quick Start Overview

This guide gets you from zero to productive development in under 45 minutes. Follow these steps exactly as written for the fastest onboarding experience.

## ✅ Prerequisites Check

Before starting, verify you have these installed:

```bash
# Check versions (run each command)
node --version     # Should be >= 20.0.0
pnpm --version     # Should be >= 9.0.0
git --version      # Should be >= 2.30.0
docker --version   # Should be >= 20.0.0
```

### Missing Tools? Quick Installation

```bash
# Install Node.js 20 LTS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm@latest

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/
```

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install (5 minutes)

```bash
# Clone the repository
git clone https://github.com/byronwade/Thorbis-Business-OS.git
cd thorbis-business-os

# Install all dependencies (this may take a few minutes)
pnpm install

# Verify installation
pnpm --version
```

**Expected output**: Should complete without errors and show pnpm version.

### Step 2: Environment Configuration (3 minutes)

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment file (minimal required config)
nano .env.local  # or code .env.local
```

**Minimal .env.local configuration**:
```env
# Required for development
NODE_ENV=development
NEXT_PUBLIC_THORBIS_ORIGIN=http://localhost:3000

# Supabase (will set up in next step)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional for full functionality
ANTHROPIC_API_KEY=your_anthropic_key_here
STRIPE_SECRET_KEY=your_stripe_key_here
```

### Step 3: Database Setup (10 minutes)

```bash
# Install Supabase CLI (if not installed)
npm install -g @supabase/supabase

# Start local Supabase instance
supabase start

# This will output connection details - copy them to .env.local
# Look for:
# API URL: http://127.0.0.1:54321
# anon key: [copy this key]
# service_role key: [copy this key]
```

**Update .env.local with Supabase outputs**:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[paste anon key here]
SUPABASE_SERVICE_ROLE_KEY=[paste service role key here]
```

### Step 4: Build Shared Packages (5 minutes)

```bash
# Build shared packages that apps depend on
pnpm build:packages

# Verify packages built successfully
ls packages/ui/dist
ls packages/design/dist
ls packages/schemas/dist
```

**Expected output**: Each package should have a `dist` folder with built files.

### Step 5: Start Your First App (2 minutes)

```bash
# Start the Home Services app (simplest to verify)
pnpm dev:hs

# App will start on http://localhost:3001
# You should see build output and "Ready" message
```

**Expected output**:
```
✓ Ready in 2.1s
○ Local:        http://localhost:3001
○ Network:      http://192.168.1.x:3001
```

### Step 6: Verify Setup (3 minutes)

Open your browser and test:

1. **Home Services App**: http://localhost:3001
   - Should load the dashboard without errors
   - Dark theme should be visible

2. **API Health Check**: http://localhost:3001/api/health
   - Should return `{"status": "ok"}`

3. **Database Connection**: Check browser console for errors
   - No Supabase connection errors should appear

## 🎉 Success Checklist

- [ ] All prerequisites installed and correct versions
- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured
- [ ] Supabase running locally
- [ ] Shared packages built successfully
- [ ] Home Services app running on port 3001
- [ ] App loads in browser without errors
- [ ] API endpoints responding
- [ ] No database connection errors

## 🔧 Development Environment Validation

Run these commands to validate your complete setup:

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Run tests
pnpm test

# Build production version
pnpm build:apps
```

All commands should complete without errors.

## 🚨 Common Setup Issues & Solutions

### Issue: "Module not found" errors
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build:packages
```

### Issue: Supabase connection errors
```bash
# Reset Supabase
supabase stop
supabase start

# Check if ports are available
lsof -i :54321
```

### Issue: Build failures
```bash
# Clean all builds and caches
pnpm clean
pnpm clean:cache
pnpm install
pnpm postinstall
```

### Issue: Port conflicts
```bash
# Check what's using the port
lsof -i :3001

# Kill the process
kill -9 [PID]
```

### Issue: Permission errors (macOS/Linux)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.pnpm
```

## 🏃‍♂️ Next Steps

Once your environment is set up:

1. **Explore the codebase**:
   ```bash
   # Look at app structure
   ls -la apps/hs/src/
   
   # Check shared components
   ls -la packages/ui/src/components/
   ```

2. **Try different industry apps**:
   ```bash
   pnpm dev:rest     # Restaurant app (port 3011)
   pnpm dev:auto     # Auto services (port 3012)
   pnpm dev:ret      # Retail app (port 3013)
   ```

3. **Read the architecture guides**:
   - [Architecture Overview](./02-architecture-overview.md)
   - [Industry App Development Guide](./INDUSTRY-APP-DEVELOPMENT-GUIDE.md)
   - [Shared Package Development Guide](./SHARED-PACKAGE-DEVELOPMENT-GUIDE.md)

4. **Start your first task**:
   - Look for issues labeled `good-first-issue`
   - Try making a simple component change
   - Add a new page to an existing app

## 📚 Essential Commands Reference

### Development
```bash
pnpm dev                    # Start all apps
pnpm dev:hs                # Home Services app
pnpm dev:rest              # Restaurant app
pnpm dev:auto              # Auto services app
pnpm dev:ret               # Retail app
pnpm dev:site              # Marketing site
```

### Quality Checks
```bash
pnpm lint                  # ESLint all code
pnpm type-check            # TypeScript validation
pnpm test                  # Run all tests
pnpm build                 # Production build
```

### Database Operations
```bash
supabase start             # Start local DB
supabase stop              # Stop local DB
pnpm db:generate           # Generate types
pnpm db:push              # Apply migrations
pnpm db:seed              # Seed sample data
```

### Package Management
```bash
pnpm build:packages        # Build shared packages
pnpm clean                 # Clean builds
pnpm clean:cache          # Clean all caches
```

## 🆘 Getting Help

### Internal Support
- **Development Chat**: #dev-help (internal Slack)
- **Code Reviews**: GitHub PR discussions
- **Architecture Questions**: Tag @architecture-team

### Self-Service Resources
- **Documentation**: `/docs/business-docs/development/`
- **Code Examples**: Look at existing industry apps
- **API Reference**: http://localhost:3001/api/docs (when running)

### External Support
- **GitHub Issues**: For bugs and feature requests
- **Community Discord**: Real-time help
- **Stack Overflow**: Tag questions with `thorbis`

## 🎯 Development Goals

After completing this onboarding, you should be able to:

- [ ] Start and stop any industry application
- [ ] Make changes and see them reflected immediately
- [ ] Run quality checks and tests
- [ ] Build production-ready applications
- [ ] Navigate the monorepo structure
- [ ] Understand the shared package system
- [ ] Use the development tools effectively
- [ ] Debug common issues independently

## 🔄 Regular Development Workflow

Once set up, your daily workflow will be:

1. **Start development**:
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Install any new dependencies
   pnpm install
   
   # Start your target app
   pnpm dev:hs  # or whichever app you're working on
   ```

2. **Make changes**:
   - Edit files in `apps/[industry]/src/`
   - Changes automatically reload in browser
   - TypeScript errors show in terminal

3. **Quality checks before commit**:
   ```bash
   pnpm lint
   pnpm type-check
   pnpm test
   ```

4. **Create commits**:
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   git push origin your-branch-name
   ```

---

**Welcome to the Thorbis team!** 🎉

This completes your onboarding setup. You're now ready to contribute to the Thorbis Business OS platform.

*Next: Read the [Industry App Development Guide](./INDUSTRY-APP-DEVELOPMENT-GUIDE.md) to learn how to build new features.*