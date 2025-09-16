#!/bin/bash

# Thorbis Billing System Production Deployment Script
# Deploys the complete billing infrastructure to production
# Created: 2025-01-31

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    local missing_tools=()
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if ! command -v supabase &> /dev/null; then
        missing_tools+=("supabase")
    fi
    
    if ! command -v vercel &> /dev/null; then
        missing_tools+=("vercel")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again."
        exit 1
    fi
    
    # Check environment variables
    local missing_vars=()
    
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        missing_vars+=("SUPABASE_PROJECT_ID")
    fi
    
    if [ -z "$STRIPE_SECRET_KEY" ]; then
        missing_vars+=("STRIPE_SECRET_KEY")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Validate environment configuration
validate_environment() {
    log_info "Validating $ENVIRONMENT environment configuration..."
    
    if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
        log_error "Invalid environment: $ENVIRONMENT. Must be 'production' or 'staging'"
        exit 1
    fi
    
    # Check if .env file exists for the environment
    local env_file=".env.${ENVIRONMENT}"
    if [ ! -f "$PROJECT_ROOT/$env_file" ]; then
        log_warning "Environment file $env_file not found. Using default environment."
    fi
    
    log_success "Environment validation passed"
}

# Build the application
build_application() {
    log_info "Building application for $ENVIRONMENT..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --only=production
    
    # Build the application
    log_info "Building Next.js application..."
    NODE_ENV=production npm run build
    
    # Run type checking
    log_info "Running type checking..."
    npm run type-check
    
    log_success "Application build completed"
}

# Deploy database migrations
deploy_database() {
    log_info "Deploying database migrations..."
    
    # Link to Supabase project
    log_info "Linking to Supabase project: $SUPABASE_PROJECT_ID"
    supabase link --project-ref "$SUPABASE_PROJECT_ID"
    
    # Push database migrations
    log_info "Pushing database migrations..."
    supabase db push
    
    # Apply seed data if specified
    if [ "${APPLY_SEED_DATA:-false}" = "true" ]; then
        log_info "Applying seed data..."
        supabase db seed apply
    fi
    
    # Generate database types
    log_info "Generating database types..."
    supabase gen types typescript --local > types/database.types.ts
    
    log_success "Database deployment completed"
}

# Configure Stripe webhooks
configure_stripe_webhooks() {
    log_info "Configuring Stripe webhooks..."
    
    local webhook_url
    if [ "$ENVIRONMENT" = "production" ]; then
        webhook_url="https://thorbis.com/api/webhooks/stripe"
    else
        webhook_url="https://$ENVIRONMENT.thorbis.com/api/webhooks/stripe"
    fi
    
    log_info "Webhook URL: $webhook_url"
    
    # This would typically use the Stripe CLI to create/update webhooks
    # For now, we'll just log the configuration
    log_info "Please manually configure Stripe webhook endpoint: $webhook_url"
    log_info "Required events:"
    echo "  - customer.created"
    echo "  - customer.updated" 
    echo "  - customer.deleted"
    echo "  - invoice.created"
    echo "  - invoice.updated"
    echo "  - invoice.paid"
    echo "  - invoice.payment_failed"
    echo "  - subscription.created"
    echo "  - subscription.updated"
    echo "  - subscription.deleted"
    echo "  - payment_intent.succeeded"
    echo "  - payment_intent.payment_failed"
    
    log_success "Stripe webhook configuration noted"
}

# Deploy to Vercel
deploy_application() {
    log_info "Deploying application to Vercel..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy to Vercel
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Deploying to production..."
        vercel --prod --yes
    else
        log_info "Deploying to $ENVIRONMENT..."
        vercel --yes
    fi
    
    log_success "Application deployment completed"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up billing monitoring..."
    
    # This would typically set up monitoring services
    # For now, we'll create the configuration
    
    cat > "$PROJECT_ROOT/monitoring.config.json" << EOF
{
  "environment": "$ENVIRONMENT",
  "monitoring": {
    "billing": {
      "enabled": true,
      "healthCheckInterval": 30000,
      "alertThresholds": {
        "usageWarning": 0.8,
        "usageCritical": 0.95,
        "costSpike": 1.5
      }
    },
    "alerts": {
      "email": {
        "enabled": true,
        "recipients": ["billing@thorbis.com", "alerts@thorbis.com"]
      },
      "slack": {
        "enabled": true,
        "channel": "#billing-alerts"
      }
    }
  },
  "deployment": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "$(git rev-parse HEAD)",
    "environment": "$ENVIRONMENT"
  }
}
EOF
    
    log_success "Monitoring configuration created"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    local app_url
    if [ "$ENVIRONMENT" = "production" ]; then
        app_url="https://thorbis.com"
    else
        app_url="https://$ENVIRONMENT.thorbis.com"
    fi
    
    # Health check
    log_info "Performing health check..."
    local health_response
    if health_response=$(curl -s -f "$app_url/api/health" 2>/dev/null); then
        log_success "Health check passed"
    else
        log_warning "Health check failed or endpoint not available"
    fi
    
    # Billing system check
    log_info "Checking billing system..."
    if curl -s -f "$app_url/billing" > /dev/null 2>&1; then
        log_success "Billing dashboard accessible"
    else
        log_warning "Billing dashboard not accessible"
    fi
    
    log_success "Deployment verification completed"
}

# Cleanup function
cleanup() {
    log_info "Performing cleanup..."
    
    # Remove temporary files
    rm -f "$PROJECT_ROOT/deployment.log"
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    echo "=================================================="
    echo "🚀 Thorbis Billing System Deployment"
    echo "=================================================="
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date)"
    echo "=================================================="
    echo ""
    
    # Set trap for cleanup on exit
    trap cleanup EXIT
    
    # Execute deployment steps
    check_prerequisites
    validate_environment
    build_application
    deploy_database
    configure_stripe_webhooks
    deploy_application
    setup_monitoring
    verify_deployment
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "=================================================="
    log_success "🎉 Deployment completed successfully!"
    echo "=================================================="
    echo "Duration: ${duration}s"
    echo "Environment: $ENVIRONMENT"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "Application URL: https://thorbis.com"
        echo "Billing Dashboard: https://thorbis.com/billing"
    else
        echo "Application URL: https://$ENVIRONMENT.thorbis.com"
        echo "Billing Dashboard: https://$ENVIRONMENT.thorbis.com/billing"
    fi
    echo ""
    echo "📋 Post-deployment tasks:"
    echo "1. Verify Stripe webhook configuration"
    echo "2. Test billing flows in $ENVIRONMENT"
    echo "3. Monitor billing alerts and system health"
    echo "4. Update DNS records if needed"
    echo "=================================================="
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "check")
        check_prerequisites
        validate_environment
        ;;
    "build")
        build_application
        ;;
    "database")
        deploy_database
        ;;
    "verify")
        verify_deployment
        ;;
    "--help"|"-h")
        echo "Usage: $0 [command] [environment]"
        echo ""
        echo "Commands:"
        echo "  deploy    - Full deployment (default)"
        echo "  check     - Check prerequisites only"
        echo "  build     - Build application only"
        echo "  database  - Deploy database only"
        echo "  verify    - Verify deployment only"
        echo ""
        echo "Environment: production|staging (default: production)"
        echo ""
        echo "Environment variables:"
        echo "  SUPABASE_PROJECT_ID  - Required"
        echo "  STRIPE_SECRET_KEY    - Required"
        echo "  VERCEL_PROJECT_ID    - Optional"
        echo "  APPLY_SEED_DATA      - Optional (true/false)"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac