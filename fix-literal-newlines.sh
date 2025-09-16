#!/bin/bash

echo "🔧 Fixing literal \\n characters in TypeScript files..."

# Find all TypeScript files and fix literal \n characters
find ./src -name "*.tsx" -o -name "*.ts" | while read file; do
    if [ -f "$file" ]; then
        # Create backup
        cp "$file" "$file.backup"
        
        # Replace literal \n with actual newlines
        sed 's/\\n/\
/g' "$file.backup" > "$file"
        
        echo "Fixed: $file"
        rm "$file.backup"
    fi
done

echo "✅ Fixed literal \\n characters in all TypeScript files"
echo "🔍 Running TypeScript check..."

# Run TypeScript check to see if we fixed the issues
pnpm type-check