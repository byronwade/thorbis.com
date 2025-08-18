#!/bin/bash

# Project Organization Validation Script
# Detects and reports organizational issues in the codebase

set -e

echo "🔍 Project Organization Validation"
echo "=================================="

# Initialize error counter
ERRORS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print errors
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo -e "\n1. Checking for misplaced React components..."

# Find React components in app directory (excluding standard Next.js files)
MISPLACED_COMPONENTS=$(find src/app -name "*.tsx" -o -name "*.jsx" | grep -v -E "(page|layout|loading|error|not-found|route|middleware)\.(tsx|jsx)$" || true)

if [ -n "$MISPLACED_COMPONENTS" ]; then
    print_error "React components found in app directory (should be in src/components/):"
    echo "$MISPLACED_COMPONENTS" | sed 's/^/  - /'
else
    print_success "No misplaced React components found"
fi

echo -e "\n2. Checking for component directories in wrong locations..."

# Find component directories in app structure
MISPLACED_COMPONENT_DIRS=$(find src/app -type d -name "components" || true)

if [ -n "$MISPLACED_COMPONENT_DIRS" ]; then
    print_error "Component directories found in app structure:"
    echo "$MISPLACED_COMPONENT_DIRS" | sed 's/^/  - /'
else
    print_success "No misplaced component directories found"
fi

echo -e "\n3. Checking for backup/example files..."

# Find backup, example, demo files
BACKUP_FILES=$(find src -name "*-backup.*" -o -name "*.backup.*" -o -name "*-example.*" -o -name "*-demo.*" -o -name "*-copy.*" -o -name "*-old.*" || true)

if [ -n "$BACKUP_FILES" ]; then
    print_error "Backup/example files found (should be removed):"
    echo "$BACKUP_FILES" | sed 's/^/  - /'
else
    print_success "No backup/example files found"
fi

echo -e "\n4. Checking for duplicate file extensions..."

# Find potential duplicate extensions
JS_FILES=$(find src -name "*.js" -not -path "*/node_modules/*" | grep -E "(component|Component)" || true)
if [ -n "$JS_FILES" ]; then
    for js_file in $JS_FILES; do
        tsx_file="${js_file%.js}.tsx"
        jsx_file="${js_file%.js}.jsx"
        if [ -f "$tsx_file" ] || [ -f "$jsx_file" ]; then
            print_error "Potential duplicate extension: $js_file (TSX/JSX version may exist)"
        fi
    done
else
    print_success "No duplicate file extensions detected"
fi

echo -e "\n5. Checking for empty directories..."

# Find empty directories
EMPTY_DIRS=$(find src -type d -empty || true)

if [ -n "$EMPTY_DIRS" ]; then
    print_warning "Empty directories found:"
    echo "$EMPTY_DIRS" | sed 's/^/  - /'
    echo "  Run: find src -type d -empty -delete"
else
    print_success "No empty directories found"
fi

echo -e "\n6. Checking import paths..."

# Find imports using app component paths
INVALID_IMPORTS=$(grep -r "from.*app.*components" src/ --include="*.js" --include="*.tsx" --include="*.jsx" || true)

if [ -n "$INVALID_IMPORTS" ]; then
    print_error "Invalid component import paths found:"
    echo "$INVALID_IMPORTS" | sed 's/^/  - /'
else
    print_success "All component imports use correct paths"
fi

echo -e "\n7. Checking for components outside components directory..."

# Find tsx/jsx files outside components directory (excluding standard Next.js files)
EXTERNAL_COMPONENTS=$(find src -name "*.tsx" -o -name "*.jsx" | grep -v "src/components" | grep -v -E "(page|layout|loading|error|not-found|route|middleware)\.(tsx|jsx)$" || true)

if [ -n "$EXTERNAL_COMPONENTS" ]; then
    print_error "React components found outside src/components/:"
    echo "$EXTERNAL_COMPONENTS" | sed 's/^/  - /'
else
    print_success "All React components are properly organized"
fi

echo -e "\n=================================="
echo "🏁 Validation Complete"

if [ $ERRORS -eq 0 ]; then
    print_success "Project organization is clean! ✨"
    exit 0
else
    print_error "Found $ERRORS organizational issues that need to be fixed"
    echo -e "\n${YELLOW}💡 Run the following commands to fix common issues:${NC}"
    echo "  - Remove empty directories: find src -type d -empty -delete"
    echo "  - Move misplaced components: See .cursor/rules/file-organization.mdc"
    echo "  - Remove backup files: find src -name '*-backup.*' -delete"
    exit 1
fi
