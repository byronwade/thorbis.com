#!/bin/bash

# Load Compatible Seed Data Script
# Loads seed data that matches the current database schema

set -e  # Exit on any error

echo "🌱 Loading Compatible Seed Data..."

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-54322}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-postgres}

SEEDS_DIR="/Users/byronwade/thorbis-business-os/new-site/supabase/seeds/compatible"

# Function to execute SQL file
execute_sql() {
    local file=$1
    local description=$2
    
    echo "📄 Loading: $description"
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file" > /dev/null 2>&1; then
        echo "✅ Success: $description"
    else
        echo "❌ Failed: $description"
        echo "   File: $file"
        exit 1
    fi
}

# Load seed files in correct order
echo ""
echo "🏢 Loading Core Data..."
execute_sql "$SEEDS_DIR/01-organizations-compatible.sql" "Organizations (10 companies across all industries)"

echo ""
echo "👤 Loading User Data..."
execute_sql "$SEEDS_DIR/02-users-fixed-compatible.sql" "Auth Users & User Profiles (5 users with proper auth)"

echo ""
echo "🔗 Loading Memberships..."
execute_sql "$SEEDS_DIR/03-organization-memberships-fixed.sql" "Organization Memberships (5 memberships)"

echo ""
echo "🏠 Loading Home Services Data..."
execute_sql "$SEEDS_DIR/04-hs-customers-compatible.sql" "HS Customers (10 customers for Lightning & Elite)"
execute_sql "$SEEDS_DIR/05-hs-services-compatible.sql" "HS Services (18 services: plumbing & HVAC)"
execute_sql "$SEEDS_DIR/06-hs-employees-compatible.sql" "HS Employees (15 employees with roles)"

echo ""
echo "🍽️ Loading Restaurant Data..."
execute_sql "$SEEDS_DIR/07-rest-customers-compatible.sql" "Restaurant Customers (12 customers for Casa Bella & Golden Spoon)"
execute_sql "$SEEDS_DIR/08-rest-menu-items-compatible.sql" "Restaurant Menu Items (16 items with dietary info)"
execute_sql "$SEEDS_DIR/09-rest-employees-compatible.sql" "Restaurant Employees (16 employees with roles)"

echo ""
echo "🚗 Loading Auto Services Data..."
execute_sql "$SEEDS_DIR/10-auto-customers-compatible.sql" "Auto Customers (10 customers for Premium Auto & Speedway)"
execute_sql "$SEEDS_DIR/11-auto-vehicles-compatible.sql" "Auto Vehicles (14 vehicles with proper VINs)"
execute_sql "$SEEDS_DIR/12-auto-employees-compatible.sql" "Auto Employees (15 employees with specializations)"

echo ""
echo "🛍️ Loading Retail Data..."
execute_sql "$SEEDS_DIR/13-ret-customers-compatible.sql" "Retail Customers (12 customers with loyalty tiers)"
execute_sql "$SEEDS_DIR/14-ret-products-compatible.sql" "Retail Products (16 products across categories)"
execute_sql "$SEEDS_DIR/15-ret-employees-compatible.sql" "Retail Employees (16 employees with departments)"

echo ""
echo "🎓 Loading Education Data..."
execute_sql "$SEEDS_DIR/16-edu-students-compatible.sql" "Education Students (12 students with enrollment dates)"
execute_sql "$SEEDS_DIR/17-edu-courses-compatible.sql" "Education Courses (12 courses across tech categories)"
execute_sql "$SEEDS_DIR/18-edu-instructors-compatible.sql" "Education Instructors (12 instructors with specializations)"

echo ""
echo "💰 Loading Payroll Data..."
execute_sql "$SEEDS_DIR/19-payroll-clients-compatible.sql" "Payroll Clients (10 client companies)"
execute_sql "$SEEDS_DIR/20-payroll-employees-compatible.sql" "Payroll Employees (20 employees across companies)"

echo ""
echo "📊 Verifying Seed Data..."

# Simple verification queries
echo "🔍 Data Summary:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 'Organizations' as table_name, COUNT(*) as record_count FROM shared.organizations
UNION ALL SELECT 'User Profiles', COUNT(*) FROM shared.user_profiles
UNION ALL SELECT 'Organization Memberships', COUNT(*) FROM shared.organization_memberships
UNION ALL SELECT 'HS Customers', COUNT(*) FROM hs.customers
UNION ALL SELECT 'HS Services', COUNT(*) FROM hs.services
UNION ALL SELECT 'HS Employees', COUNT(*) FROM hs.employees
UNION ALL SELECT 'Restaurant Customers', COUNT(*) FROM rest.customers
UNION ALL SELECT 'Restaurant Menu Items', COUNT(*) FROM rest.menu_items
UNION ALL SELECT 'Restaurant Employees', COUNT(*) FROM rest.employees
UNION ALL SELECT 'Auto Customers', COUNT(*) FROM auto.customers
UNION ALL SELECT 'Auto Vehicles', COUNT(*) FROM auto.vehicles
UNION ALL SELECT 'Auto Employees', COUNT(*) FROM auto.employees
UNION ALL SELECT 'Retail Customers', COUNT(*) FROM ret.customers
UNION ALL SELECT 'Retail Products', COUNT(*) FROM ret.products
UNION ALL SELECT 'Retail Employees', COUNT(*) FROM ret.employees
UNION ALL SELECT 'Education Students', COUNT(*) FROM edu.students
UNION ALL SELECT 'Education Courses', COUNT(*) FROM edu.courses
UNION ALL SELECT 'Education Instructors', COUNT(*) FROM edu.instructors
UNION ALL SELECT 'Payroll Clients', COUNT(*) FROM payroll.clients
UNION ALL SELECT 'Payroll Employees', COUNT(*) FROM payroll.employees
ORDER BY table_name;
"

echo ""
echo "🎯 Industry Distribution:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    industry,
    COUNT(*) as organizations,
    CASE 
        WHEN industry = 'hs' THEN 
            (SELECT COUNT(*) FROM hs.customers WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'hs')) || ' customers, ' ||
            (SELECT COUNT(*) FROM hs.services WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'hs')) || ' services, ' ||
            (SELECT COUNT(*) FROM hs.employees WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'hs')) || ' employees'
        WHEN industry = 'rest' THEN 
            (SELECT COUNT(*) FROM rest.customers WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'rest')) || ' customers, ' ||
            (SELECT COUNT(*) FROM rest.menu_items WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'rest')) || ' menu items, ' ||
            (SELECT COUNT(*) FROM rest.employees WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'rest')) || ' employees'
        WHEN industry = 'auto' THEN 
            (SELECT COUNT(*) FROM auto.customers WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'auto')) || ' customers, ' ||
            (SELECT COUNT(*) FROM auto.vehicles WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'auto')) || ' vehicles, ' ||
            (SELECT COUNT(*) FROM auto.employees WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'auto')) || ' employees'
        WHEN industry = 'ret' THEN 
            (SELECT COUNT(*) FROM ret.customers WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'ret')) || ' customers, ' ||
            (SELECT COUNT(*) FROM ret.products WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'ret')) || ' products, ' ||
            (SELECT COUNT(*) FROM ret.employees WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'ret')) || ' employees'
        WHEN industry = 'edu' THEN 
            (SELECT COUNT(*) FROM edu.students WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'edu')) || ' students, ' ||
            (SELECT COUNT(*) FROM edu.courses WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'edu')) || ' courses, ' ||
            (SELECT COUNT(*) FROM edu.instructors WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'edu')) || ' instructors'
        WHEN industry = 'payroll' THEN 
            (SELECT COUNT(*) FROM payroll.clients WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'payroll')) || ' clients, ' ||
            (SELECT COUNT(*) FROM payroll.employees WHERE organization_id IN 
             (SELECT id FROM shared.organizations WHERE industry = 'payroll')) || ' employees managed'
        ELSE 'No seed data'
    END as data_summary
FROM shared.organizations 
GROUP BY industry 
ORDER BY industry;
"

echo ""
echo "🎉 Compatible Seed Data Loading Complete!"
echo ""
echo "✨ Summary:"
echo "   • 10 Organizations across 6 industries (hs, rest, auto, ret, edu, payroll)"
echo "   • 5 Authenticated Users with proper profiles"
echo "   • 5 Organization Memberships with correct roles"
echo ""
echo "   🏠 Home Services: 10 customers, 18 services, 15 employees"
echo "   🍽️ Restaurant: 12 customers, 16 menu items, 16 employees"
echo "   🚗 Auto Services: 10 customers, 14 vehicles, 15 employees"
echo "   🛍️ Retail: 12 customers, 16 products, 16 employees"
echo "   🎓 Education: 12 students, 12 courses, 12 instructors"
echo "   💰 Payroll: 10 client companies, 20 employees managed"
echo ""
echo "📊 Total Records Created:"
echo "   • 56 customers/students/clients across all industries"
echo "   • 76 products/services/courses/vehicles"
echo "   • 94 employees/instructors across all industries"
echo "   • 170 total industry-specific records"
echo ""
echo "🚀 Database is now comprehensively seeded with realistic business data!"