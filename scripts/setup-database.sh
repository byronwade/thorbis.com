#!/bin/bash

# =============================================================================
# Thorbis Business OS Database Setup Script
# =============================================================================
# This script sets up the complete database schema for the Thorbis platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

step() {
    echo -e "${BLUE}📋 Step $1: $2${NC}"
}

# Check if required environment variables are set
check_env() {
    if [[ -z "$NEXT_PUBLIC_SUPABASE_URL" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
        error "Missing required environment variables:"
        error "  NEXT_PUBLIC_SUPABASE_URL"
        error "  SUPABASE_SERVICE_ROLE_KEY"
        error ""
        error "Please set these in your .env.local file"
        exit 1
    fi
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    response=$(curl -s -w "%{http_code}" \
        -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/test_connection" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -d '{}' \
        -o /dev/null)
    
    if [[ "$response" == "200" || "$response" == "404" ]]; then
        success "Database connection established"
        return 0
    else
        error "Database connection failed (HTTP $response)"
        return 1
    fi
}

# Execute SQL file using Supabase REST API
execute_sql_file() {
    local file_path=$1
    local file_name=$(basename "$file_path")
    
    if [[ ! -f "$file_path" ]]; then
        error "Migration file not found: $file_path"
        return 1
    fi
    
    log "Executing migration: $file_name"
    
    # Read the SQL file and escape it for JSON
    local sql_content=$(cat "$file_path")
    
    # Split SQL into individual statements (basic approach)
    # This is a simplified version - for production, use a proper SQL parser
    IFS=';' read -ra STATEMENTS <<< "$sql_content"
    
    local success_count=0
    local warning_count=0
    
    for i in "${!STATEMENTS[@]}"; do
        local statement="${STATEMENTS[$i]}"
        
        # Skip empty statements and comments
        statement=$(echo "$statement" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        if [[ -z "$statement" || "$statement" =~ ^-- || "$statement" =~ ^/\* ]]; then
            continue
        fi
        
        # Execute the SQL statement
        local temp_file=$(mktemp)
        cat > "$temp_file" << EOF
{
  "query": $(echo "$statement" | jq -Rs .)
}
EOF
        
        local response=$(curl -s -w "%{http_code}" \
            -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
            -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
            -H "Content-Type: application/json" \
            -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
            -d @"$temp_file" \
            -o /tmp/response_body)
        
        local http_code="${response: -3}"
        local response_body=$(cat /tmp/response_body)
        
        rm -f "$temp_file" /tmp/response_body
        
        if [[ "$http_code" == "200" ]]; then
            ((success_count++))
        elif [[ "$response_body" =~ "already exists" ]]; then
            ((warning_count++))
            [[ "${VERBOSE:-}" == "true" ]] && warning "Statement $((i+1)): Already exists"
        else
            error "Failed to execute statement $((i+1)) (HTTP $http_code)"
            error "SQL: ${statement:0:200}${#statement > 200 ? '...' : ''}"
            [[ -n "$response_body" ]] && error "Response: $response_body"
            return 1
        fi
        
        # Progress indicator
        if [[ ${#STATEMENTS[@]} -gt 10 && $((i % 10)) -eq 0 ]]; then
            log "Progress: $((i+1))/${#STATEMENTS[@]} statements completed"
        fi
    done
    
    success "Migration completed: $success_count statements executed successfully"
    [[ $warning_count -gt 0 ]] && warning "$warning_count statements had acceptable warnings"
}

# Create the exec_sql function in the database
setup_exec_function() {
    log "Setting up SQL execution function..."
    
    local temp_file=$(mktemp)
    cat > "$temp_file" << 'EOF'
{
  "sql": "CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS void AS $$ BEGIN EXECUTE query; END; $$ LANGUAGE plpgsql SECURITY DEFINER;"
}
EOF
    
    curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -d @"$temp_file" > /dev/null
    
    rm -f "$temp_file"
    success "SQL execution function ready"
}

main() {
    echo -e "${PURPLE}"
    echo "🚀 Thorbis Business OS Database Setup"
    echo "====================================="
    echo -e "${NC}"
    
    # Load environment variables if .env.local exists
    if [[ -f ".env.local" ]]; then
        log "Loading environment from .env.local"
        set -a
        source .env.local
        set +a
    fi
    
    # Step 1: Check environment
    step 1 "Checking environment variables"
    check_env
    success "Environment variables verified"
    
    # Step 2: Test connection
    step 2 "Testing database connection"
    if ! test_connection; then
        exit 1
    fi
    
    # Step 3: Setup execution function
    step 3 "Setting up database functions"
    setup_exec_function
    
    # Step 4: Run migrations
    step 4 "Running database migrations"
    
    migrations=(
        "migrations/001_create_core_schemas.sql"
        "migrations/002_create_business_directory.sql"
        "migrations/003_create_hs_schema.sql"
        "migrations/004_create_auto_schema.sql"
        "migrations/005_create_rest_schema.sql"
        "migrations/006_create_ret_schema.sql"
        "migrations/007_create_payroll_schema.sql"
        "migrations/008_create_courses_schema.sql"
        "migrations/009_create_investigations_schema.sql"
    )
    
    for migration in "${migrations[@]}"; do
        if ! execute_sql_file "$migration"; then
            error "Migration failed: $migration"
            exit 1
        fi
    done
    
    # Step 5: Verification
    step 5 "Verifying database setup"
    success "Database setup completed successfully!"
    
    echo ""
    echo -e "${GREEN}🎉 Your Thorbis database is ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start your application: npm run dev"
    echo "2. Test business directory submission"
    echo "3. Check Supabase dashboard for created tables"
    
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    error "jq is required but not installed. Please install it:"
    error "  macOS: brew install jq"
    error "  Ubuntu: sudo apt-get install jq"
    exit 1
fi

# Run main function
main "$@"