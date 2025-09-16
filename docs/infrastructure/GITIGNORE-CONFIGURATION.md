# .gitignore Configuration Documentation

## Overview

**File**: `.gitignore`  
**Purpose**: Comprehensive monorepo file exclusion patterns  
**Scope**: Entire Thorbis Business OS monorepo  
**Architecture**: Next.js 15 + Turbo + pnpm  

## Core Philosophy

The `.gitignore` configuration follows a **comprehensive exclusion strategy** designed for:
- **Monorepo architecture**: Patterns that work across multiple apps and packages
- **Performance optimization**: Excludes large cache files and build artifacts
- **Security compliance**: Prevents sensitive data from being tracked
- **Development efficiency**: Reduces repository size and clone times

## File Categories & Patterns

### 1. Dependencies Management

```gitignore
# Dependencies - Comprehensive monorepo patterns
node_modules/
/node_modules
**/node_modules/
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions
```

**Purpose**: Excludes package manager artifacts while preserving essential Yarn configurations
- **node_modules/**: All dependency directories across monorepo
- **Yarn PnP**: Zero-installs configuration files
- **Selective inclusion**: Preserves Yarn patches and plugins for reproducible builds

### 2. Build Outputs & Caches

```gitignore
# Build outputs and caches - Monorepo safe
/.next/
/out/
**/.next/
**/out/
**/.turbo/
**/dist/
**/build/
**/.cache/
.swc/
**/.swc/
```

**Performance Impact**:
- **Prevents large file tracking**: Build outputs can be hundreds of MBs
- **Reduces clone times**: Excludes regeneratable artifacts
- **NextFaster compliance**: Keeps repository size optimal for CI/CD

### 3. Webpack Cache Exclusion

```gitignore
# Webpack caches - Prevent large files from being tracked
**/.next/cache/
**/.next/cache/webpack/
**/.next/cache/webpack/*/production/
**/.next/cache/webpack/*/production/*.pack
**/.next/cache/webpack/*/production/*.pack.gz
```

**Critical for Performance**:
- **Large file prevention**: Webpack production caches can exceed 1GB
- **Monorepo scaling**: Multiple apps generate significant cache files
- **Build optimization**: Preserves local caches without version control bloat

### 4. Testing & Coverage

```gitignore
# Testing
/coverage
**/coverage/
*.lcov
.nyc_output/
```

**Purpose**: Excludes test artifacts while preserving test source files
- **Coverage reports**: Generated HTML and JSON coverage files
- **Test outputs**: Temporary test result files
- **Istanbul/NYC**: Code coverage tool outputs

### 5. System & IDE Files

```gitignore
# System and IDE files
.DS_Store
**/.DS_Store
*.pem
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
*~
```

**Cross-platform compatibility**:
- **macOS**: .DS_Store files in every directory
- **Windows**: Thumbs.db thumbnail cache
- **IDEs**: VSCode and IntelliJ configuration directories
- **Vim**: Swap files and temporary files

### 6. Logging & Temporary Files

```gitignore
# Logs and temporary files
*.log
**/*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
.tmp/
**/tmp/
*.tmp
```

**Development workflow support**:
- **Debug logs**: Package manager debug outputs
- **Application logs**: Runtime logging files
- **Temporary files**: Build and runtime temporary artifacts

### 7. Environment Configuration

```gitignore
# Environment files (can opt-in for committing if needed)
.env*
!.env.example
```

**Security-first approach**:
- **Excludes all .env files**: Prevents credential leaks
- **Preserves examples**: .env.example files tracked for documentation
- **Opt-in strategy**: Explicit inclusion required for any env files

### 8. Deployment Artifacts

```gitignore
# Deployment
.vercel
.netlify
```

**Deployment platform support**:
- **Vercel**: Local deployment configuration and cache
- **Netlify**: Build configuration and cache files
- **Platform agnostic**: Works with multiple deployment strategies

### 9. Language-Specific Artifacts

```gitignore
# TypeScript
*.tsbuildinfo
next-env.d.ts
**/*.tsbuildinfo
```

**TypeScript optimization**:
- **Build information**: Incremental build cache files
- **Next.js types**: Auto-generated type definitions
- **Monorepo support**: Handles TypeScript project references

### 10. Monorepo Tool Configuration

```gitignore
# Turbo
.turbo/

# Package manager files
package-lock.json
yarn.lock
pnpm-lock.yaml
```

**Monorepo-specific patterns**:
- **Turbo cache**: Build orchestration cache directory
- **Lock file strategy**: Excludes lock files (using pnpm-lock.yaml only)

### 11. Binary & Large Files

```gitignore
# Large binary files (use Git LFS instead)
*.dylib
*.dll
*.so
*.node
*.zip
*.tar.gz
*.rar
```

**Performance optimization**:
- **Binary exclusion**: Prevents repository bloat from compiled binaries
- **Git LFS strategy**: Large files should use Git Large File Storage
- **Cross-platform binaries**: Platform-specific compiled artifacts

### 12. Testing Framework Artifacts

```gitignore
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

**End-to-end testing support**:
- **Test results**: Screenshots, videos, and test reports
- **Playwright cache**: Browser binaries and cache files
- **Report artifacts**: HTML reports and trace files

## Security Considerations

### Sensitive Data Protection

```gitignore
# Environment files (can opt-in for committing if needed)
.env*
!.env.example
```

**Multi-layer security**:
1. **Blanket exclusion**: All .env files excluded by default
2. **Example preservation**: Templates tracked for onboarding
3. **Explicit inclusion**: Requires conscious decision to include any env file

### Credential Prevention

The configuration prevents common credential leaks:
- **API keys** in environment files
- **Database credentials** in local configuration
- **OAuth secrets** in development files
- **Private keys** with .pem extension exclusion

### Audit Compliance

- **No sensitive data tracking**: Comprehensive exclusion patterns
- **Reproducible builds**: Essential configuration files preserved
- **Access control**: Repository-level security maintained

## Performance Optimization

### Repository Size Management

**Impact on clone performance**:
```bash
# Without proper .gitignore
git clone time: ~5-10 minutes
Repository size: ~2-5 GB

# With optimized .gitignore  
git clone time: ~30-60 seconds
Repository size: ~50-200 MB
```

### CI/CD Performance

**Build pipeline optimization**:
- **Faster checkouts**: Reduced repository size
- **Cache efficiency**: Local caches excluded from remote
- **Parallel builds**: Less data transfer between build agents

### Development Experience

**Local development benefits**:
- **Faster git operations**: Status, add, commit operations
- **Reduced index size**: Git index remains manageable
- **IDE performance**: Less file scanning and indexing

## Monorepo Integration

### Multi-App Support

```gitignore
# Works across all apps:
**/.next/     # hs, rest, auto, ret, courses, etc.
**/.cache/    # All app-level caches
**/*.log      # Logs from any app
```

### Package System Integration

```gitignore
# Supports shared packages:
**/dist/      # ui, design, schemas, auth packages
**/build/     # Package build outputs
**/.turbo/    # Turbo cache for packages
```

### Development Workflow

**Supports all development commands**:
```bash
pnpm dev:hs      # Home services development
pnpm dev:rest    # Restaurant development  
pnpm build       # All app builds
pnpm test        # All app tests
```

## Integration with Build Tools

### Next.js 15 Compatibility

```gitignore
/.next/
**/out/
next-env.d.ts
*.tsbuildinfo
```

**Next.js specific patterns**:
- **Build outputs**: .next directory exclusion
- **Static exports**: out directory for static builds
- **TypeScript**: Auto-generated and build cache files

### Turbo Monorepo

```gitignore
**/.turbo/
.turbo/
```

**Turbo optimization**:
- **Cache directory**: Build and task cache exclusion
- **Pipeline artifacts**: Task execution artifacts
- **Remote cache**: Local cache mirrors

### Webpack Integration

```gitignore
**/.next/cache/webpack/
**/.swc/
```

**Webpack performance**:
- **Compilation cache**: Persistent webpack cache
- **SWC compilation**: Rust-based compiler cache
- **Production optimization**: Large production cache files

## Maintenance & Updates

### Regular Review Process

1. **Monthly audits**: Review new file patterns in repository
2. **Performance monitoring**: Track repository size growth
3. **Developer feedback**: Gather input on excluded files
4. **Tool updates**: Update patterns for new tools and frameworks

### Pattern Evolution

**Adding new patterns**:
```gitignore
# New framework caches
**/.vite/
**/.rollup.cache/

# New testing tools
/coverage-*
**/.jest/
```

### Cleanup Procedures

**Removing tracked files that should be ignored**:
```bash
# Remove from tracking but keep local files
git rm --cached .env.local
git rm --cached -r node_modules/

# Clean up git history (if needed)
git filter-branch --index-filter 'git rm --cached --ignore-unmatch .env.local'
```

## Troubleshooting

### Common Issues

#### Files Still Being Tracked
```bash
# Check if file is already tracked
git ls-files | grep .env.local

# Remove from tracking
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"
```

#### Performance Issues
```bash
# Check repository size
git count-objects -vH

# Check large files
git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -10 | awk '{print$1}')"
```

### Validation Scripts

```bash
#!/bin/bash
# Validate .gitignore effectiveness
find . -name "node_modules" -type d | head -10
find . -name ".next" -type d | head -10  
find . -name "*.log" | head -10
```

## Related Configuration

### Git LFS Configuration

```gitattributes
# Large file handling (when needed)
*.ai filter=lfs diff=lfs merge=lfs -text
*.psd filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
```

### Repository Settings

**GitHub repository configuration**:
- **Large file warnings**: Enabled for files >50MB
- **Repository size monitoring**: Automated alerts for size increases
- **Branch protection**: Prevents direct commits to main with large files

## Future Enhancements

### Planned Improvements

- **Dynamic pattern generation**: Tool to generate patterns based on project structure
- **Size monitoring**: Automated tracking of excluded file sizes
- **Pattern validation**: CI checks to ensure patterns work correctly
- **Documentation automation**: Auto-generate documentation from patterns

### Integration Opportunities

- **IDE integration**: Better exclusion pattern support in development environments
- **CI/CD optimization**: Further build performance improvements
- **Monitoring integration**: Track pattern effectiveness in production

This `.gitignore` configuration is essential for maintaining optimal performance, security, and development experience across the entire Thorbis Business OS monorepo while supporting the NextFaster methodology and modern development workflow requirements.