#!/bin/bash

# =============================================================================
# Thorbis Git Large File Prevention Script
# =============================================================================
# This script helps prevent large files from being committed to GitHub
# Run this before commits to catch potential issues early

set -e

echo "🔍 Thorbis Git Large File Check Starting..."
echo "==============================================="

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_FILE_SIZE_MB=10
MAX_FILE_SIZE_BYTES=$((MAX_FILE_SIZE_MB * 1024 * 1024))
ISSUES_FOUND=0

echo "📊 Checking for files larger than ${MAX_FILE_SIZE_MB}MB..."

# Check staged files for large files
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    # Repository has commits
    STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM) || STAGED_FILES=""
else
    # Initial commit
    STAGED_FILES=$(git diff --cached --name-only) || STAGED_FILES=""
fi

if [ -n "$STAGED_FILES" ]; then
    echo "🔎 Checking staged files..."
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            
            if [ "$FILE_SIZE" -gt "$MAX_FILE_SIZE_BYTES" ]; then
                FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
                echo -e "${RED}❌ LARGE FILE: $file (${FILE_SIZE_MB}MB)${NC}"
                ISSUES_FOUND=$((ISSUES_FOUND + 1))
            fi
        fi
    done <<< "$STAGED_FILES"
else
    echo "ℹ️  No staged files to check"
fi

# Check for problematic file patterns in working directory
echo ""
echo "🔍 Checking for problematic file patterns..."

# Build files that might be large
PROBLEMATIC_PATTERNS=(
    "*.tsbuildinfo"
    "*.backup"
    "*.dump" 
    "*/node_modules/*"
    "*/.next/cache/*"
    "*/.turbo/*"
    "*/build/*"
    "*/dist/*"
    "*.log"
    "bun.lock"
    "*.sqlite"
    "*.db"
    "*.heapsnapshot"
    "*.cpuprofile"
)

for pattern in "${PROBLEMATIC_PATTERNS[@]}"; do
    FILES=$(find . -name "$pattern" -type f -not -path "./.git/*" 2>/dev/null || echo "")
    
    if [ -n "$FILES" ]; then
        echo -e "${YELLOW}⚠️  Found files matching pattern: $pattern${NC}"
        echo "$FILES" | while read -r file; do
            if [ -f "$file" ]; then
                # Check if file is tracked by git
                if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
                    FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
                    FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
                    echo -e "  ${RED}🚨 TRACKED: $file (${FILE_SIZE_MB}MB) - Should be in .gitignore!${NC}"
                    ISSUES_FOUND=$((ISSUES_FOUND + 1))
                else
                    FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
                    if [ "$FILE_SIZE" -gt "$MAX_FILE_SIZE_BYTES" ]; then
                        FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
                        echo -e "  ${BLUE}ℹ️  IGNORED: $file (${FILE_SIZE_MB}MB) - Properly ignored${NC}"
                    fi
                fi
            fi
        done
    fi
done

# Check repository size
echo ""
echo "📈 Repository size analysis..."
REPO_SIZE=$(du -sh .git 2>/dev/null | cut -f1)
echo "Git repository size: $REPO_SIZE"

# Check for large objects in git history
echo ""
echo "🔍 Checking for large objects in git history..."
git rev-list --objects --all | \
git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
awk '/^blob/ {if($3 > 1048576) print substr($0, 6)}' | \
sort -k3 -n -r | \
head -10 | \
while read -r line; do
    SIZE=$(echo "$line" | awk '{print $2}')
    FILE=$(echo "$line" | awk '{print $3}')
    SIZE_MB=$((SIZE / 1024 / 1024))
    echo -e "${YELLOW}📦 Large object in history: $FILE (${SIZE_MB}MB)${NC}"
done

# Summary
echo ""
echo "==============================================="
if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo -e "${GREEN}✅ No large file issues found!${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES_FOUND large file issues!${NC}"
    echo ""
    echo "🔧 Recommended actions:"
    echo "1. Add problematic patterns to .gitignore"
    echo "2. Remove large files from staging: git reset HEAD <file>"
    echo "3. For tracked files that shouldn't be: git rm --cached <file>"
    echo "4. Consider using Git LFS for necessary large files"
    echo ""
    echo "To clean up git history from large files:"
    echo "git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch <file>' --prune-empty --tag-name-filter cat -- --all"
    echo ""
    exit 1
fi
