#!/bin/bash

# =============================================================================
# SUPABASE SEED DATA LOADER
# =============================================================================
# Comprehensive seed data loading script for Thorbis Business OS
# Loads mock data in proper dependency order across all industries
# Created: 2025-01-31
# Version: 1.0.0

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database connection details
DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"
SEEDS_DIR="./seeds"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to execute SQL file
execute_sql_file() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    log "Loading seed file: $file_name"
    
    if [[ ! -f "$file_path" ]]; then
        error "File not found: $file_path"
        return 1
    fi
    
    # Execute the SQL file
    if psql "$DB_URL" -f "$file_path" > /dev/null 2>&1; then
        success "✓ $file_name loaded successfully"
        return 0
    else
        error "✗ Failed to load $file_name"
        return 1
    fi
}

# Function to check if Supabase is running
check_supabase() {
    log "Checking Supabase status..."
    if ! pnpm supabase status > /dev/null 2>&1; then
        error "Supabase is not running. Please start it with: pnpm supabase start"
        exit 1
    fi
    success "Supabase is running"
}

# Function to verify database connection
verify_connection() {
    log "Verifying database connection..."
    if psql "$DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
        success "Database connection verified"
    else
        error "Cannot connect to database. Please check Supabase status."
        exit 1
    fi
}

# Main seed loading function
load_seeds() {
    log "Starting comprehensive seed data loading..."
    
    # Define seed files in dependency order
    local seed_files=(
        # Phase 1: Foundation Data
        "01-organizations.sql"
        "02-organizations-restaurant.sql" 
        "03-organizations-auto.sql"
        "04-organizations-retail.sql"
        "05-organizations-remaining.sql"
        "06-comprehensive-users.sql"
        "07-organization-memberships.sql"
        
        # Phase 2: Customer Data (5,000+ customers per industry)
        "09-customers-home-services.sql"
        "10-customers-restaurant.sql"
        "11-customers-auto-services.sql"
        "12-customers-retail.sql"
        "13-customers-education.sql"
        
        # Phase 3: Service/Product Catalogs
        "14-services-home-services.sql"
        "15-services-restaurant.sql"
        "16-services-auto-services.sql"
        "17-services-retail.sql"
        
        # Phase 4: Employee/Team Data
        "18-employees-home-services.sql"
        "19-employees-restaurant.sql"
        "20-employees-auto-services.sql"
        "21-employees-retail.sql"
        "22-employees-education.sql"
        
        # Phase 5: Financial Transactions (50,000+ transactions)
        "23-transactions-home-services.sql"
        "24-transactions-restaurant.sql"
        "25-transactions-auto-services.sql"
        "26-transactions-retail.sql"
        "27-transactions-education.sql"
        
        # Phase 6: Service/Order Management
        "28-service-orders-home-services.sql"
        "29-service-orders-restaurant.sql"
        "30-service-orders-auto-services.sql"
        "31-service-orders-retail.sql"
        "32-service-orders-education.sql"
        
        # Phase 7: Inventory & Supply Chain
        "33-inventory-supply-chain-home-services.sql"
        "34-inventory-supply-chain-restaurant.sql"
        "35-inventory-supply-chain-auto-services.sql"
        "36-inventory-supply-chain-retail.sql"
        "37-inventory-supply-chain-education.sql"
        
        # Phase 8: Analytics & Intelligence
        "38-analytics-intelligence-home-services.sql"
        "39-analytics-intelligence-restaurant.sql"
        "40-analytics-intelligence-auto-services.sql"
        "41-analytics-intelligence-retail.sql"
        "42-analytics-intelligence-education.sql"
        
        # Phase 9: Performance Metrics & KPIs
        "43-performance-metrics-home-services.sql"
        "44-performance-metrics-restaurant.sql"
        "45-performance-metrics-auto-services.sql"
        "46-performance-metrics-retail.sql"
        "47-performance-metrics-education.sql"
        "48-performance-metrics-payroll.sql"
        
        # Phase 10: Stripe Billing & Subscription Data
        "49-stripe-billing-seed-data.sql"
    )
    
    local total_files=${#seed_files[@]}
    local completed=0
    local failed=0
    
    log "Found $total_files seed files to process"
    echo ""
    
    # Process each seed file
    for seed_file in "${seed_files[@]}"; do
        local file_path="$SEEDS_DIR/$seed_file"
        
        if execute_sql_file "$file_path"; then
            ((completed++))
        else
            ((failed++))
            warning "Continuing with next file..."
        fi
        
        # Progress indicator
        local progress=$((completed * 100 / total_files))
        echo -e "${BLUE}Progress: $progress% ($completed/$total_files completed, $failed failed)${NC}"
        echo ""
    done
    
    # Final summary
    echo "==============================================="
    log "Seed loading completed!"
    success "Successfully loaded: $completed files"
    
    if [[ $failed -gt 0 ]]; then
        warning "Failed to load: $failed files"
    fi
    
    echo "==============================================="
    
    # Display data summary
    show_data_summary
}

# Function to show loaded data summary
show_data_summary() {
    log "Generating data summary..."
    
    # Count records in key tables (if they exist)
    local tables=(
        "shared.organizations"
        "shared.user_profiles" 
        "hs.customers"
        "rest.customers"
        "auto.customers"
        "ret.customers"
        "edu.students"
        "shared.subscription_plans"
        "shared.subscriptions"
        "shared.api_usage_meters"
    )
    
    echo ""
    echo "=== DATA SUMMARY ==="
    
    for table in "${tables[@]}"; do
        local count=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "0")
        count=$(echo "$count" | tr -d ' ')
        printf "%-25s: %s records\n" "$table" "$count"
    done
    
    echo "===================="
}

# Function to reset database (optional)
reset_database() {
    warning "This will reset the entire database. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log "Resetting database..."
        pnpm supabase db reset
        success "Database reset completed"
    else
        log "Database reset cancelled"
    fi
}

# Function to show help
show_help() {
    echo "Supabase Seed Data Loader"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -r, --reset    Reset database before loading seeds"
    echo "  -s, --summary  Show data summary only (no loading)"
    echo ""
    echo "Examples:"
    echo "  $0                 Load all seed data"
    echo "  $0 --reset         Reset database and load all seed data"
    echo "  $0 --summary       Show current data summary"
}

# Main script execution
main() {
    local reset_db=false
    local summary_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -r|--reset)
                reset_db=true
                shift
                ;;
            -s|--summary)
                summary_only=true
                shift
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_supabase
    verify_connection
    
    if [[ "$summary_only" == true ]]; then
        show_data_summary
        exit 0
    fi
    
    if [[ "$reset_db" == true ]]; then
        reset_database
    fi
    
    # Load seed data
    load_seeds
}

# Execute main function with all arguments
main "$@"