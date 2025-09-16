# CI/CD Pipeline Configuration

This comprehensive guide covers the setup, configuration, and management of continuous integration and continuous deployment (CI/CD) pipelines for Thorbis Business OS using GitHub Actions, automated testing, security scanning, and deployment automation.

## Pipeline Architecture

### CI/CD Pipeline Overview

```mermaid
graph TB
    subgraph "Source Control"
        PR[Pull Request]
        Main[Main Branch]
        Feature[Feature Branch]
    end
    
    subgraph "CI Pipeline"
        Trigger[Trigger Build]
        Install[Install Dependencies]
        Lint[Linting & Formatting]
        TypeCheck[Type Checking]
        UnitTest[Unit Tests]
        Security[Security Scan]
        Build[Build Applications]
    end
    
    subgraph "Quality Gates"
        Coverage[Coverage Check]
        Performance[Performance Tests]
        E2E[E2E Tests]
        Audit[Security Audit]
    end
    
    subgraph "CD Pipeline"
        StagingDeploy[Deploy to Staging]
        SmokeTests[Smoke Tests]
        ProdDeploy[Deploy to Production]
        Monitor[Post-Deploy Monitoring]
    end
    
    PR --> Trigger
    Feature --> Trigger
    Main --> Trigger
    
    Trigger --> Install
    Install --> Lint
    Lint --> TypeCheck
    TypeCheck --> UnitTest
    UnitTest --> Security
    Security --> Build
    
    Build --> Coverage
    Coverage --> Performance
    Performance --> E2E
    E2E --> Audit
    
    Audit --> StagingDeploy
    StagingDeploy --> SmokeTests
    SmokeTests --> ProdDeploy
    ProdDeploy --> Monitor
```

### Pipeline Philosophy

- **Fast Feedback**: Quick failure detection with immediate developer notification
- **Quality Gates**: Progressive quality validation with automatic failure handling
- **Security First**: Security scanning at every stage of the pipeline
- **Automated Testing**: Comprehensive test coverage without manual intervention
- **Safe Deployments**: Blue-green deployments with automatic rollback capabilities
- **Observability**: Complete pipeline visibility and performance tracking

## GitHub Actions Workflows

### Main CI/CD Workflow

#### Complete Pipeline Configuration
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
    
  # Manual trigger for emergency deployments
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production
      skip_tests:
        description: 'Skip tests (emergency only)'
        required: false
        default: false
        type: boolean

env:
  NODE_VERSION: '20'

# Workflow-level concurrency to prevent multiple deployments
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

jobs:
  # Pre-flight checks
  pre-flight:
    name: Pre-flight Checks
    runs-on: ubuntu-latest
    outputs:
      should-deploy: ${{ steps.check.outputs.should-deploy }}
      deploy-environment: ${{ steps.check.outputs.deploy-environment }}
      
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for conventional commits
      
      - name: Check deployment conditions
        id: check
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "should-deploy=true" >> $GITHUB_OUTPUT
            echo "deploy-environment=production" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
            echo "should-deploy=true" >> $GITHUB_OUTPUT
            echo "deploy-environment=staging" >> $GITHUB_OUTPUT
          else
            echo "should-deploy=false" >> $GITHUB_OUTPUT
            echo "deploy-environment=none" >> $GITHUB_OUTPUT
          fi
      
      - name: Validate commit messages
        uses: wagoid/commitlint-github-action@v5
        if: github.event_name == 'pull_request'

  # Install and cache dependencies
  install:
    name: Install Dependencies
    runs-on: ubuntu-latest
    needs: pre-flight
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Cache build artifacts
        uses: actions/cache@v3
        with:
          path: |
            ~/.npm
            **/node_modules
            **/.next/cache
          key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-npm-

  # Code quality checks
  lint-and-format:
    name: Linting and Formatting
    runs-on: ubuntu-latest
    needs: install
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check formatting
        run: npm run format:check
      
      - name: Validate package.json
        run: npm run validate:package

  # Type checking
  type-check:
    name: Type Checking
    runs-on: ubuntu-latest
    needs: install
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check application
        run: npm run type-check
      
      - name: Generate TypeScript build info
        run: npm run build:types

  # Unit and integration tests
  test:
    name: Unit and Integration Tests
    runs-on: ubuntu-latest
    needs: install
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Setup test database
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        run: |
          npm run supabase start
          npm run db:push --environment=test
          npm run db:seed --environment=test
      
      - name: Run unit tests
        run: npm run test --coverage --maxWorkers=2
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:54322/postgres
          REDIS_URL: redis://localhost:6379
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:54322/postgres
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: true

  # Security scanning
  security:
    name: Security Scanning
    runs-on: ubuntu-latest
    needs: install
    
    permissions:
      security-events: write
      contents: read
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Run npm audit
        run: npm run audit --audit-level high
        continue-on-error: true
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          command: test
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
      
      - name: Run Semgrep security scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/nodejs
            p/typescript
        env:
          SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}

  # Build applications
  build:
    name: Build Applications
    runs-on: ubuntu-latest
    needs: [lint-and-format, type-check, test]
    
    strategy:
      matrix:
        app: [hs, rest, auto, ret, site, courses, payroll]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          NEXT_PUBLIC_APP_ENV: ${{ needs.pre-flight.outputs.deploy-environment }}
      
      - name: Check bundle size
        run: npm run bundle-size --app=${{ matrix.app }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-${{ matrix.app }}
          path: apps/${{ matrix.app }}/.next
          retention-days: 1

  # Performance testing
  performance:
    name: Performance Testing
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-hs
          path: apps/hs/.next
      
      - name: Install Playwright browsers
        run: npm run playwright install --with-deps chromium
      
      - name: Start applications
        run: |
          npm run start:hs &
          sleep 30
        env:
          NODE_ENV: production
      
      - name: Run Lighthouse CI
        run: npm run lighthouse:ci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Run performance tests
        run: npm run test:performance --reporter=github-actions
      
      - name: Upload performance reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: performance-reports
          path: performance-reports/

  # End-to-end testing
  e2e:
    name: E2E Testing
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
    
    strategy:
      matrix:
        browser: [chromium, firefox]
        shard: [1, 2, 3, 4]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Download all build artifacts
        uses: actions/download-artifact@v3
        with:
          path: build-artifacts
      
      - name: Restore build artifacts
        run: |
          mkdir -p apps/hs/.next && cp -r build-artifacts/build-hs/* apps/hs/.next/
          mkdir -p apps/rest/.next && cp -r build-artifacts/build-rest/* apps/rest/.next/
          mkdir -p apps/auto/.next && cp -r build-artifacts/build-auto/* apps/auto/.next/
          mkdir -p apps/ret/.next && cp -r build-artifacts/build-ret/* apps/ret/.next/
      
      - name: Install Playwright browsers
        run: npm run playwright install --with-deps ${{ matrix.browser }}
      
      - name: Start services
        run: |
          npm run supabase start
          npm run db:push --environment=e2e
          npm run db:seed --environment=e2e
          npm run start:all &
          sleep 45
        env:
          NODE_ENV: production
          DATABASE_URL: postgresql://postgres:postgres@localhost:54322/postgres
      
      - name: Run E2E tests
        run: npm run test:e2e --project=${{ matrix.browser }} --shard=${{ matrix.shard }}/4
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 7

  # Deploy to staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [pre-flight, security, performance, e2e]
    if: needs.pre-flight.outputs.should-deploy == 'true' && contains(needs.pre-flight.outputs.deploy-environment, 'staging')
    
    environment:
      name: staging
      url: https://staging.thorbis.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        id: vercel-deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: |
            staging.thorbis.com
            staging-hs.thorbis.com
            staging-rest.thorbis.com
      
      - name: Update deployment status
        uses: bobheadxi/deployments@v1
        with:
          step: finish
          token: ${{ secrets.GITHUB_TOKEN }}
          status: ${{ job.status }}
          env: staging
          deployment_id: ${{ steps.vercel-deploy.outputs.deployment-id }}
          env_url: https://staging.thorbis.com

  # Smoke tests on staging
  staging-smoke-tests:
    name: Staging Smoke Tests
    runs-on: ubuntu-latest
    needs: deploy-staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Wait for deployment propagation
        run: sleep 60
      
      - name: Install Playwright browsers
        run: npm run playwright install --with-deps chromium
      
      - name: Run staging smoke tests
        run: npm run test:e2e:smoke --baseURL=https://staging.thorbis.com
        env:
          STAGING_TEST_USER: ${{ secrets.STAGING_TEST_USER }}
          STAGING_TEST_PASSWORD: ${{ secrets.STAGING_TEST_PASSWORD }}
      
      - name: Run API health checks
        run: |
          curl -f https://staging.thorbis.com/api/health
          curl -f https://staging.thorbis.com/api/hs/health
          curl -f https://staging.thorbis.com/api/rest/health

  # Deploy to production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [pre-flight, staging-smoke-tests]
    if: needs.pre-flight.outputs.deploy-environment == 'production'
    
    environment:
      name: production
      url: https://thorbis.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Run database migrations
        run: npm run db:migrate --environment=production
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.PRODUCTION_SUPABASE_SERVICE_KEY }}
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        id: vercel-deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: |
            thorbis.com
            www.thorbis.com
      
      - name: Update deployment status
        uses: bobheadxi/deployments@v1
        with:
          step: finish
          token: ${{ secrets.GITHUB_TOKEN }}
          status: ${{ job.status }}
          env: production
          deployment_id: ${{ steps.vercel-deploy.outputs.deployment-id }}
          env_url: https://thorbis.com

  # Post-deployment monitoring
  post-deploy-monitoring:
    name: Post-Deployment Monitoring
    runs-on: ubuntu-latest
    needs: deploy-production
    if: always() && needs.deploy-production.result == 'success'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Wait for deployment propagation
        run: sleep 120
      
      - name: Run production health checks
        run: |
          curl -f https://thorbis.com/api/health
          curl -f https://thorbis.com/api/hs/health
          curl -f https://thorbis.com/api/rest/health
          curl -f https://thorbis.com/api/auto/health
          curl -f https://thorbis.com/api/ret/health
      
      - name: Monitor Core Web Vitals
        run: |
          lighthouse --chrome-flags="--headless" https://thorbis.com \
            --output json --output-path lighthouse-production.json
          
          # Extract performance score
          PERFORMANCE_SCORE=$(cat lighthouse-production.json | jq '.categories.performance.score * 100')
          echo "Performance Score: $PERFORMANCE_SCORE"
          
          # Alert if performance degrades
          if (( $(echo "$PERFORMANCE_SCORE < 90" | bc -l) )); then
            echo "::warning::Performance score below threshold: $PERFORMANCE_SCORE"
          fi
      
      - name: Create deployment summary
        run: |
          echo "## 🚀 Deployment Summary" >> $GITHUB_STEP_SUMMARY
          echo "- **Environment**: Production" >> $GITHUB_STEP_SUMMARY
          echo "- **URL**: https://thorbis.com" >> $GITHUB_STEP_SUMMARY
          echo "- **Commit**: ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Performance Score**: $PERFORMANCE_SCORE" >> $GITHUB_STEP_SUMMARY
          echo "- **Deployed At**: $(date -u)" >> $GITHUB_STEP_SUMMARY

  # Notification and cleanup
  notify:
    name: Notify Team
    runs-on: ubuntu-latest
    needs: [deploy-production, post-deploy-monitoring]
    if: always()
    
    steps:
      - name: Notify Slack on success
        if: needs.deploy-production.result == 'success'
        uses: 8398a7/action-slack@v3
        with:
          status: success
          custom_payload: |
            {
              channel: '#deployments',
              username: 'GitHub Actions',
              icon_emoji: ':rocket:',
              attachments: [{
                color: 'good',
                fields: [{
                  title: 'Deployment Successful',
                  value: 'Thorbis Business OS deployed to production\n<https://thorbis.com|View Site>',
                  short: false
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify Slack on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          custom_payload: |
            {
              channel: '#deployments',
              username: 'GitHub Actions',
              icon_emoji: ':x:',
              attachments: [{
                color: 'danger',
                fields: [{
                  title: 'Deployment Failed',
                  value: 'Thorbis Business OS deployment to production failed\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Logs>',
                  short: false
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Reusable Actions

#### Setup Node Action
```yaml
# .github/actions/setup-node/action.yml
name: 'Setup Node.js'
description: 'Setup Node.js with npm and restore caches'

inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '20'

runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
    
    - name: Get npm cache directory
      shell: bash
      run: echo "CACHE_PATH=$(npm config get cache)" >> $GITHUB_ENV
    
    - name: Setup npm cache
      uses: actions/cache@v3
      with:
        path: ${{ env.CACHE_PATH }}
        key: ${{ runner.os }}-npm-cache-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-npm-cache-
    
    - name: Install dependencies
      shell: bash
      run: npm ci
```

## Quality Gates and Testing

### Automated Quality Checks

#### Code Quality Pipeline
```yaml
# .github/workflows/quality-checks.yml
name: Quality Checks

on:
  pull_request:
    branches: [main, develop]
  
  # Run nightly quality checks
  schedule:
    - cron: '0 2 * * *'

jobs:
  code-quality:
    name: Code Quality Analysis
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Run SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=thorbis-business-os
            -Dsonar.organization=thorbis
            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            -Dsonar.coverage.exclusions="**/*.test.ts,**/*.test.tsx,**/*.spec.ts"
            -Dsonar.cpd.exclusions="**/*.test.ts,**/*.test.tsx"
      
      - name: Run Madge circular dependency check
        run: npm run madge --circular --extensions ts,tsx src/
      
      - name: Check bundle dependencies
        run: npm run depcheck
      
      - name: Validate package architecture
        run: npm run validate:architecture

  accessibility-testing:
    name: Accessibility Testing
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Build applications
        run: npm run build
      
      - name: Install Playwright
        run: npm run playwright install --with-deps chromium
      
      - name: Start applications
        run: |
          npm run start:all &
          sleep 30
      
      - name: Run axe-core accessibility tests
        run: npm run test:a11y
      
      - name: Upload accessibility reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: a11y-reports
          path: a11y-reports/

  dependency-security:
    name: Dependency Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-node
      
      - name: Run npm audit
        run: |
          npm run audit --audit-level=moderate --json > audit-report.json
          npm run audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run OSV Scanner
        uses: google/osv-scanner-action@v1
        with:
          scan-args: |-
            -r
            --skip-git
            .
      
      - name: Upload security reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: security-reports
          path: |
            audit-report.json
            osv-scan-results.json
```

### Performance Budgets

#### Performance Budget Configuration
```typescript
// performance/budgets.config.ts
export interface PerformanceBudget {
  app: string
  budgets: {
    javascript: number
    css: number
    images: number
    total: number
  }
  metrics: {
    firstContentfulPaint: number
    largestContentfulPaint: number
    timeToInteractive: number
    cumulativeLayoutShift: number
  }
}

export const performanceBudgets: PerformanceBudget[] = [
  {
    app: 'hs',
    budgets: {
      javascript: 170 * 1024, // 170KB
      css: 50 * 1024, // 50KB
      images: 500 * 1024, // 500KB per page
      total: 1 * 1024 * 1024 // 1MB total
    },
    metrics: {
      firstContentfulPaint: 1800, // 1.8s
      largestContentfulPaint: 1800, // 1.8s
      timeToInteractive: 300, // 300ms
      cumulativeLayoutShift: 0.1
    }
  },
  
  {
    app: 'rest',
    budgets: {
      javascript: 170 * 1024,
      css: 50 * 1024,
      images: 500 * 1024,
      total: 1 * 1024 * 1024
    },
    metrics: {
      firstContentfulPaint: 1800,
      largestContentfulPaint: 1800,
      timeToInteractive: 300,
      cumulativeLayoutShift: 0.1
    }
  }
]

// Performance budget validation
export class PerformanceBudgetValidator {
  async validateBudgets(app: string, buildPath: string): Promise<ValidationResult> {
    const budget = performanceBudgets.find(b => b.app === app)
    if (!budget) {
      throw new Error(`No performance budget defined for app: ${app}`)
    }
    
    const buildAnalysis = await this.analyzeBuild(buildPath)
    const violations: string[] = []
    
    // Check bundle sizes
    if (buildAnalysis.javascript > budget.budgets.javascript) {
      violations.push(
        `JavaScript budget exceeded: ${buildAnalysis.javascript} > ${budget.budgets.javascript}`
      )
    }
    
    if (buildAnalysis.css > budget.budgets.css) {
      violations.push(
        `CSS budget exceeded: ${buildAnalysis.css} > ${budget.budgets.css}`
      )
    }
    
    // Check performance metrics (would be integrated with Lighthouse)
    const metricsViolations = await this.validateMetrics(app, budget.metrics)
    violations.push(...metricsViolations)
    
    return {
      passed: violations.length === 0,
      violations,
      analysis: buildAnalysis
    }
  }
}
```

## Branch Protection and Deployment Gates

### Branch Protection Rules

#### GitHub Branch Protection Configuration
```typescript
// scripts/configure-branch-protection.ts
const branchProtectionRules = {
  main: {
    required_status_checks: {
      strict: true,
      contexts: [
        'Pre-flight Checks',
        'Linting and Formatting',
        'Type Checking', 
        'Unit and Integration Tests',
        'Security Scanning',
        'Build Applications',
        'Performance Testing',
        'E2E Testing'
      ]
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      required_approving_review_count: 2,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true,
      require_last_push_approval: true
    },
    restrictions: {
      users: [],
      teams: ['senior-developers', 'tech-leads']
    },
    required_linear_history: true,
    allow_force_pushes: false,
    allow_deletions: false
  },
  
  develop: {
    required_status_checks: {
      strict: true,
      contexts: [
        'Linting and Formatting',
        'Type Checking',
        'Unit and Integration Tests',
        'Build Applications'
      ]
    },
    enforce_admins: false,
    required_pull_request_reviews: {
      required_approving_review_count: 1,
      dismiss_stale_reviews: true
    },
    allow_force_pushes: false
  }
}

async function configureBranchProtection() {
  const { Octokit } = await import('@octokit/rest')
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
  
  for (const [branch, rules] of Object.entries(branchProtectionRules)) {
    try {
      await octokit.repos.updateBranchProtection({
        owner: 'thorbisinc',
        repo: 'thorbis-business-os',
        branch,
        ...rules
      })
      
      console.log(`✅ Branch protection configured for ${branch}`)
    } catch (error) {
      console.error(`❌ Failed to configure ${branch}:`, error.message)
    }
  }
}

configureBranchProtection()
```

### Deployment Gates

#### Automated Deployment Approval
```yaml
# .github/workflows/deployment-gates.yml
name: Deployment Gates

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      app-name:
        required: true
        type: string

jobs:
  pre-deployment-checks:
    name: Pre-deployment Validation
    runs-on: ubuntu-latest
    
    steps:
      - name: Validate deployment readiness
        run: |
          echo "Validating deployment to ${{ inputs.environment }} for ${{ inputs.app-name }}"
          
          # Check if there are any critical issues
          CRITICAL_ISSUES=$(gh api repos/${{ github.repository }}/issues \
            --jq '.[] | select(.labels[].name == "critical" and .state == "open") | .number' \
            | wc -l)
          
          if [ $CRITICAL_ISSUES -gt 0 ]; then
            echo "❌ Cannot deploy: $CRITICAL_ISSUES critical issues open"
            exit 1
          fi
          
          echo "✅ No critical issues found"
      
      - name: Check deployment window
        run: |
          # Prevent deployments during maintenance windows
          CURRENT_HOUR=$(date +%H)
          CURRENT_DAY=$(date +%u)
          
          # Block deployments on weekends for production
          if [[ "${{ inputs.environment }}" == "production" && $CURRENT_DAY -gt 5 ]]; then
            echo "❌ Production deployments blocked on weekends"
            exit 1
          fi
          
          # Block deployments during business hours for production
          if [[ "${{ inputs.environment }}" == "production" && $CURRENT_HOUR -ge 9 && $CURRENT_HOUR -le 17 ]]; then
            echo "⚠️ Production deployment during business hours requires manual approval"
            echo "deployment-warning=true" >> $GITHUB_OUTPUT
          fi
      
      - name: Validate performance regression
        run: |
          # Compare current performance metrics with baseline
          npm run test:performance:regression --baseline=main --threshold=5%
          
          if [ $? -ne 0 ]; then
            echo "❌ Performance regression detected"
            exit 1
          fi
          
          echo "✅ No performance regression detected"

  security-validation:
    name: Security Validation
    runs-on: ubuntu-latest
    
    steps:
      - name: Check for security vulnerabilities
        run: |
          # Run security scan
          npm run audit --audit-level=high
          
          # Check for exposed secrets
          truffleHog filesystem . --json | jq 'select(.Verified == true)' | wc -l | \
            { read count; [ $count -eq 0 ] || { echo "❌ Secrets detected"; exit 1; } }
          
          echo "✅ No security issues found"
      
      - name: Validate compliance requirements
        run: |
          # Ensure compliance checks pass
          npm run test:compliance
          
          # Validate data handling procedures
          npm run validate:data-handling
          
          echo "✅ Compliance validation passed"
```

## Monitoring and Observability

### Pipeline Monitoring

#### Workflow Performance Tracking
```typescript
// scripts/monitor-pipeline-performance.ts
interface PipelineMetrics {
  workflowId: string
  runId: string
  duration: number
  jobs: JobMetrics[]
  status: 'success' | 'failure' | 'cancelled'
  timestamp: string
}

class PipelineMonitor {
  async collectMetrics(workflowRun: WorkflowRun): Promise<PipelineMetrics> {
    const jobs = await this.getJobMetrics(workflowRun.id)
    
    return {
      workflowId: workflowRun.workflow_id.toString(),
      runId: workflowRun.id.toString(),
      duration: this.calculateDuration(workflowRun.created_at, workflowRun.updated_at),
      jobs,
      status: workflowRun.conclusion as PipelineMetrics['status'],
      timestamp: workflowRun.created_at
    }
  }
  
  async analyzePerformanceTrends(): Promise<PerformanceAnalysis> {
    const recentRuns = await this.getRecentWorkflowRuns(30) // Last 30 runs
    const metrics = await Promise.all(
      recentRuns.map(run => this.collectMetrics(run))
    )
    
    return {
      averageDuration: this.calculateAverage(metrics.map(m => m.duration)),
      successRate: metrics.filter(m => m.status === 'success').length / metrics.length,
      bottlenecks: this.identifyBottlenecks(metrics),
      trends: this.analyzeTrends(metrics)
    }
  }
  
  async alertOnPerformanceRegression(threshold: number = 0.2): Promise<void> {
    const analysis = await this.analyzePerformanceTrends()
    
    if (analysis.trends.durationTrend > threshold) {
      await this.sendAlert({
        type: 'performance_regression',
        message: `Pipeline duration increased by ${Math.round(analysis.trends.durationTrend * 100)}%`,
        severity: 'warning',
        data: analysis
      })
    }
    
    if (analysis.successRate < 0.9) {
      await this.sendAlert({
        type: 'success_rate_low',
        message: `Pipeline success rate dropped to ${Math.round(analysis.successRate * 100)}%`,
        severity: 'critical',
        data: analysis
      })
    }
  }
}
```

### Deployment Tracking

#### Deployment Analytics Dashboard
```typescript
// dashboards/deployment-analytics.ts
export class DeploymentAnalytics {
  async generateDeploymentReport(timeRange: TimeRange): Promise<DeploymentReport> {
    const deployments = await this.getDeployments(timeRange)
    
    return {
      totalDeployments: deployments.length,
      successRate: this.calculateSuccessRate(deployments),
      averageDeploymentTime: this.calculateAverageTime(deployments),
      frequencyByEnvironment: this.groupByEnvironment(deployments),
      topFailureReasons: this.analyzeFailures(deployments),
      performanceImpact: await this.analyzePerformanceImpact(deployments),
      rollbackFrequency: this.calculateRollbackFrequency(deployments)
    }
  }
  
  async trackDeploymentMetrics(deployment: Deployment): Promise<void> {
    // Track key deployment metrics
    await Promise.all([
      this.trackDeploymentDuration(deployment),
      this.trackBundleSizes(deployment),
      this.trackPerformanceMetrics(deployment),
      this.trackErrorRates(deployment)
    ])
  }
  
  async generatePerformanceDashboard(): Promise<Dashboard> {
    const data = await this.getPerformanceData()
    
    return {
      charts: [
        {
          type: 'line',
          title: 'Deployment Frequency',
          data: data.deploymentFrequency
        },
        {
          type: 'bar',
          title: 'Success Rate by Environment',
          data: data.successRateByEnvironment
        },
        {
          type: 'gauge',
          title: 'Current Pipeline Health',
          data: data.pipelineHealth
        }
      ],
      alerts: await this.getActiveAlerts(),
      recommendations: await this.generateRecommendations()
    }
  }
}
```

## Troubleshooting and Optimization

### Common Pipeline Issues

#### Pipeline Failure Diagnostics
```bash
#!/bin/bash
# scripts/diagnose-pipeline-failure.sh

WORKFLOW_RUN_ID=$1

if [ -z "$WORKFLOW_RUN_ID" ]; then
  echo "Usage: $0 <workflow-run-id>"
  exit 1
fi

echo "🔍 Diagnosing pipeline failure for run: $WORKFLOW_RUN_ID"

# Get workflow run details
WORKFLOW_DATA=$(gh api repos/thorbisinc/thorbis-business-os/actions/runs/$WORKFLOW_RUN_ID)
WORKFLOW_STATUS=$(echo $WORKFLOW_DATA | jq -r '.conclusion')

echo "Workflow Status: $WORKFLOW_STATUS"

# Get failed jobs
FAILED_JOBS=$(gh api repos/thorbisinc/thorbis-business-os/actions/runs/$WORKFLOW_RUN_ID/jobs \
  --jq '.jobs[] | select(.conclusion == "failure") | {name: .name, id: .id}')

if [ -z "$FAILED_JOBS" ]; then
  echo "✅ No failed jobs found"
  exit 0
fi

echo "❌ Failed Jobs:"
echo "$FAILED_JOBS" | jq -r '.name'

# Analyze failure patterns
echo ""
echo "🔍 Analyzing failure patterns..."

# Check for common failure reasons
FAILURE_REASONS=()

# Test failures
if echo "$FAILED_JOBS" | grep -q "test"; then
  FAILURE_REASONS+=("Test failures - Check test results and fix failing tests")
fi

# Build failures
if echo "$FAILED_JOBS" | grep -q "build"; then
  FAILURE_REASONS+=("Build failures - Check TypeScript errors and build configuration")
fi

# Security failures
if echo "$FAILED_JOBS" | grep -q "security"; then
  FAILURE_REASONS+=("Security issues - Check for vulnerabilities and fix them")
fi

# Deployment failures
if echo "$FAILED_JOBS" | grep -q "deploy"; then
  FAILURE_REASONS+=("Deployment failures - Check deployment configuration and environment")
fi

if [ ${#FAILURE_REASONS[@]} -eq 0 ]; then
  echo "⚠️ No common failure patterns detected. Manual investigation required."
else
  echo "Potential issues:"
  printf ' - %s\n' "${FAILURE_REASONS[@]}"
fi

# Generate recommendations
echo ""
echo "💡 Recommendations:"
echo " - Review the workflow logs for detailed error messages"
echo " - Check for recent changes that might have caused the failure"
echo " - Ensure all required secrets and environment variables are set"
echo " - Verify that external dependencies are available"

# Quick fix suggestions
echo ""
echo "🔧 Quick fixes to try:"
echo " - Re-run failed jobs if the issue might be transient"
echo " - Update dependencies if there are version conflicts"
echo " - Check for service outages in external dependencies"
echo " - Ensure sufficient resources are available"
```

### Pipeline Optimization

#### Performance Optimization Strategies
```typescript
// Performance optimization for CI/CD pipeline
const optimizationStrategies = {
  // Parallel job execution
  parallelization: {
    description: 'Run independent jobs in parallel',
    implementation: {
      'test-jobs': 'Split tests by test type and run in parallel',
      'build-jobs': 'Build different apps simultaneously',
      'lint-jobs': 'Run linting for different packages in parallel'
    },
    expectedImprovement: '40-60% reduction in total pipeline time'
  },
  
  // Intelligent caching
  caching: {
    description: 'Cache dependencies and build artifacts',
    implementation: {
      'dependency-cache': 'Cache node_modules using npm cache',
      'build-cache': 'Cache build artifacts between runs',
      'test-cache': 'Cache test results for unchanged files'
    },
    expectedImprovement: '20-30% reduction in build time'
  },
  
  // Incremental builds
  incrementalBuilds: {
    description: 'Build only changed packages',
    implementation: {
      'next-build-cache': 'Use Next.js built-in build caching',
      'change-detection': 'Detect changed files and build only affected packages',
      'smart-testing': 'Run tests only for changed code'
    },
    expectedImprovement: '50-70% reduction for incremental changes'
  },
  
  // Resource optimization
  resourceOptimization: {
    description: 'Optimize resource usage',
    implementation: {
      'runner-selection': 'Use appropriate runner sizes for different jobs',
      'concurrent-limits': 'Limit concurrent jobs to prevent resource exhaustion',
      'cleanup-jobs': 'Clean up artifacts and caches regularly'
    },
    expectedImprovement: '10-20% cost reduction'
  }
}

// Implementation of optimizations
export class PipelineOptimizer {
  async optimizePipeline(config: PipelineConfig): Promise<OptimizedPipeline> {
    // Analyze current pipeline performance
    const analysis = await this.analyzePipelinePerformance()
    
    // Apply optimizations based on analysis
    const optimizations = this.selectOptimizations(analysis)
    
    // Generate optimized configuration
    return this.generateOptimizedConfig(config, optimizations)
  }
  
  private async analyzePipelinePerformance(): Promise<PipelineAnalysis> {
    const recentRuns = await this.getRecentPipelineRuns(50)
    
    return {
      averageDuration: this.calculateAverageDuration(recentRuns),
      bottleneckJobs: this.identifyBottlenecks(recentRuns),
      resourceUsage: this.analyzeResourceUsage(recentRuns),
      failurePatterns: this.analyzeFailurePatterns(recentRuns),
      cacheHitRates: await this.analyzeCachePerformance()
    }
  }
  
  private selectOptimizations(analysis: PipelineAnalysis): Optimization[] {
    const optimizations: Optimization[] = []
    
    // If builds are slow, suggest parallelization
    if (analysis.averageDuration.build > 600) { // 10 minutes
      optimizations.push({
        type: 'parallelization',
        target: 'build-jobs',
        expectedImprovement: 0.4
      })
    }
    
    // If cache hit rate is low, suggest cache optimization
    if (analysis.cacheHitRates.dependencies < 0.8) {
      optimizations.push({
        type: 'caching',
        target: 'dependency-cache',
        expectedImprovement: 0.3
      })
    }
    
    // If test execution is slow, suggest test optimization
    if (analysis.averageDuration.test > 900) { // 15 minutes
      optimizations.push({
        type: 'test-optimization',
        target: 'parallel-testing',
        expectedImprovement: 0.5
      })
    }
    
    return optimizations
  }
}
```

## Next Steps

After configuring CI/CD pipelines:

1. **[Infrastructure Provisioning](./03-infrastructure-provisioning.md)**: Set up supporting infrastructure
2. **[Application Deployment](./04-application-deployment.md)**: Deploy applications using the CI/CD pipeline
3. **[Monitoring and Observability](./07-monitoring-observability.md)**: Set up comprehensive monitoring
4. **Pipeline Optimization**: Continuously improve pipeline performance and reliability

## CI/CD Resources

### Tools and Integrations
- **GitHub Actions**: Primary CI/CD platform with comprehensive workflow support
- **Vercel Integration**: Seamless deployment to Vercel platform
- **Testing Frameworks**: Vitest, Playwright, Lighthouse for comprehensive testing
- **Security Tools**: Snyk, CodeQL, Semgrep for security scanning

### External Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Performance Testing Best Practices](https://web.dev/lighthouse-ci/)

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Environment Setup](./01-environment-setup.md) | Next: [Infrastructure Provisioning](./03-infrastructure-provisioning.md)*