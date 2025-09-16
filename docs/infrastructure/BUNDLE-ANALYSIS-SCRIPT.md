# Bundle Analysis Script Documentation

## Overview

**File**: `/scripts/bundle-analysis.js`  
**Purpose**: NextFaster Performance Compliance Enforcement  
**Bundle Budget**: 170KB JavaScript, 50KB CSS per route  
**Last Updated**: 2025-01-31  

## Core Functionality

The bundle analysis script is a critical performance monitoring tool that enforces NextFaster compliance across all Thorbis Business OS applications. It analyzes webpack build outputs to ensure each app meets the strict 170KB JavaScript budget required for sub-300ms navigation.

### Primary Functions

1. **Bundle Size Analysis**
   - Scans `.next/static/js` and `.next/static/css` directories
   - Calculates total bundle sizes for each application
   - Identifies individual file sizes and largest contributors
   - Reports violations against NextFaster budget limits

2. **Performance Compliance Enforcement**
   - Validates against 170KB JS and 50KB CSS limits
   - Provides optimization recommendations for violations
   - Can exit with error code for CI/CD pipeline enforcement
   - Generates comprehensive performance reports

3. **Multi-App Monitoring**
   - Supports all monorepo applications: `ai`, `auto`, `books`, `courses`, `hs`, `investigations`, `lom`, `payroll`, `rest`, `ret`, `site`
   - Batch analysis across entire monorepo
   - Individual app-specific analysis capability

## Usage Examples

### Basic Analysis (All Apps)
```bash
node scripts/bundle-analysis.js
```

### Single App Analysis
```bash
node scripts/bundle-analysis.js --app=hs
node scripts/bundle-analysis.js --app=rest
```

### CI/CD Enforcement Mode
```bash
node scripts/bundle-analysis.js --enforce
# Exits with code 1 if any violations found
```

## Integration Points

### Next.js Build System
- Requires completed Next.js builds (`.next` directory)
- Automatically triggers builds for missing build artifacts
- Integrates with webpack bundle analysis

### CI/CD Pipeline
- Used in GitHub Actions for performance validation
- Enforces bundle budgets before deployment
- Provides actionable feedback for optimization

### Development Workflow
- Invoked via `pnpm bundle:check` scripts
- Integration with webpack bundle analyzer
- Real-time performance monitoring during development

## Performance Optimization Strategies

### Bundle Size Analysis
- **Static Asset Scanning**: Examines webpack output in `.next/static/`
- **Chunk Identification**: Identifies main, vendor, and route-specific chunks
- **Size Calculation**: Accurate byte-level size reporting with KB conversion
- **Largest File Detection**: Highlights top contributors to bundle size

### Optimization Recommendations
When violations are detected, the script provides specific guidance:
- Dynamic imports for heavy components
- Unused dependency removal
- Tree shaking enablement
- Server Components over Client Components preference

### Performance Metrics
- Total JavaScript bundle size per app
- Total CSS bundle size per app
- Individual file size breakdown
- Compliance status reporting

## Architecture Integration

### NextFaster Compliance
The script directly enforces the NextFaster methodology:
- **170KB JavaScript Budget**: Hard limit for optimal performance
- **50KB CSS Budget**: Ensures fast stylesheet loading
- **Sub-300ms Navigation**: Bundle sizes calculated for this target

### Monorepo Structure
- Operates across entire `apps/` directory structure
- Understands Thorbis Business OS app organization
- Handles diverse app types (POS, admin panels, documentation sites)

### Build System Integration
- Works with Next.js 15 App Router builds
- Compatible with Turbo monorepo build orchestration
- Integrates with webpack optimization configurations

## Security Considerations

### Build Artifact Validation
- Only analyzes build outputs, never source code
- No exposure of sensitive environment variables
- Safe for CI/CD pipeline execution

### File System Access
- Limited to read-only operations on build directories
- No modification of source files or configurations
- Operates within safe build artifact boundaries

## Error Handling & Recovery

### Missing Build Detection
```javascript
if (!fs.existsSync(buildPath)) {
  console.log(`⚠️  No build found for ${appName}. Building now...`);
  execSync(`cd ${appPath} && pnpm build`, { stdio: 'pipe' });
}
```

### Build Failure Handling
- Graceful degradation for build failures
- Continues analysis of other apps if one fails
- Clear error reporting for debugging

### File System Errors
- Handles missing directories gracefully
- Provides informative warnings for missing assets
- Continues processing despite individual file errors

## Reporting & Output

### Console Output Format
```
📊 Analyzing hs app bundle...
  JavaScript: 156KB ✅
  CSS: 38KB ✅
  Largest JS files:
    - main-2a3b4c5d.js: 89KB
    - vendors-6e7f8g9h.js: 45KB
    - chunk-1i2j3k4l.js: 22KB
```

### Summary Report
```
📊 Bundle Size Summary:
App        | JS Size | CSS Size | Status
-----------|---------|----------|--------
hs         | 156KB   | 38KB     | ✅ PASS
rest       | 189KB   | 42KB     | ❌ FAIL
```

### Violation Details
- Excess size calculations (e.g., "19KB over limit")
- Specific optimization recommendations
- File-by-file breakdown for problem areas

## Maintenance Requirements

### Regular Updates
- Monitor new apps added to monorepo
- Update app list when new applications are created
- Adjust limits if NextFaster guidelines change

### Performance Monitoring
- Track bundle size trends over time
- Identify apps approaching limits
- Proactive optimization before violations

### CI/CD Integration
- Ensure script remains compatible with build pipeline
- Update for new Next.js versions or webpack changes
- Maintain performance budget enforcement

## CLI Interface

### Command Line Arguments
- `--app=<name>`: Analyze specific application
- `--enforce`: Exit with error on violations
- Support for future flags (e.g., `--format=json`)

### Exit Codes
- `0`: All apps compliant or analysis completed
- `1`: Violations found (when `--enforce` used)

## Troubleshooting

### Common Issues
1. **Missing Build**: Script auto-builds if `.next` not found
2. **Build Failures**: Check app-specific build logs
3. **Incorrect Sizes**: Ensure production build mode

### Debug Information
- Verbose logging for file discovery
- Size calculation transparency
- Clear violation reporting

## Future Enhancements

### Planned Features
- JSON output format for programmatic consumption
- Historical tracking of bundle size trends
- Integration with performance monitoring services
- Automated optimization suggestions

### Extensibility
- Plugin system for custom analyzers
- Integration with bundle optimization tools
- Support for additional performance metrics

## Related Files

- `/scripts/apply-nextfaster-optimizations.js` - Applies optimizations
- `/scripts/fix-nextjs15-configs.js` - Configuration compatibility
- Next.js configs with webpack optimization settings
- Package.json performance scripts

This script is essential for maintaining NextFaster compliance across the entire Thorbis Business OS monorepo and ensuring optimal performance for all industry-specific applications.