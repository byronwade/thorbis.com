# MCP Server Configuration Guide for Thorbis Agents

## Overview
All Thorbis Claude Code agents have been enhanced with MCP (Model Context Protocol) server integrations to provide real-time documentation, browser testing, and data persistence capabilities.

## Required MCP Servers

### 1. Context7 - Documentation & Code Examples
Provides up-to-date documentation and code examples for all libraries.

**Installation:**
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["@context7/mcp@latest", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

**Usage in prompts:**
- Add "use context7" to any prompt requiring library documentation
- Use specific library IDs: "use library /vercel/next.js"
- Request topics: "React hooks patterns use context7"

**Common Library IDs:**
- `/vercel/next.js` - Next.js documentation
- `/facebook/react` - React documentation
- `/shadcn/ui` - shadcn/ui components
- `/tailwindcss/tailwindcss` - Tailwind CSS
- `/radix-ui/primitives` - Radix UI
- `/supabase/supabase` - Supabase
- `/react-hook-form/react-hook-form` - React Hook Form
- `/tanstack/table` - TanStack Table

### 2. Playwright MCP - Browser Testing & Validation
Provides browser automation for testing responsiveness, accessibility, and design compliance.

**Installation:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",           // Run in headless mode
        "--caps", "vision,pdf", // Enable vision and PDF capabilities
        "--viewport-size", "1920,1080",
        "--ignore-https-errors" // For local development
      ]
    }
  }
}
```

**Key Functions:**
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Get accessibility tree
- `mcp__playwright__browser_resize` - Test responsive designs
- `mcp__playwright__browser_take_screenshot` - Visual validation
- `mcp__playwright__browser_console_messages` - Check for errors
- `mcp__playwright__browser_evaluate` - Run JavaScript in page context
- `mcp__playwright__browser_network_requests` - Analyze network performance

### 3. Supabase MCP - Data Persistence & Analytics
Provides database operations for storing audit results and configurations.

**Installation:**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp@latest"]
    }
  }
}
```

**Key Functions:**
- `mcp__supabase__execute_sql` - Run SQL queries
- `mcp__supabase__apply_migration` - Apply schema changes
- `mcp__supabase__list_tables` - Discover database structure
- `mcp__supabase__get_logs` - Debug issues
- `mcp__supabase__get_advisors` - Security/performance recommendations

## Complete Configuration

Add this to your MCP client configuration file:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["@context7/mcp@latest", "--api-key", "YOUR_CONTEXT7_API_KEY"]
    },
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--caps", "vision,pdf",
        "--viewport-size", "1920,1080",
        "--ignore-https-errors",
        "--no-sandbox"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp@latest"]
    }
  }
}
```

## Agent-Specific Usage Patterns

### Accessibility Agent
```javascript
// Test WCAG compliance
await mcp__playwright__browser_navigate({ url })
const a11yTree = await mcp__playwright__browser_snapshot()
const wcagDocs = "WCAG 2.1 AA requirements use context7"
```

### Design System Agent
```javascript
// Validate design tokens
const tailwindDocs = "Tailwind dark mode use library /tailwindcss/tailwindcss"
await mcp__playwright__browser_take_screenshot({ fullPage: true })
```

### Performance Agent
```javascript
// Measure Core Web Vitals
const nextDocs = "Next.js performance use library /vercel/next.js"
const metrics = await mcp__playwright__browser_evaluate({
  function: "() => performance.timing"
})
```

### Component Reuse Agent
```javascript
// Discover reusable patterns
const reactPatterns = "composition patterns use library /facebook/react"
const shadcnComponents = "DataTable use library /shadcn/ui"
```

## Environment Variables

Set these environment variables for enhanced functionality:

```bash
# Context7 API Key (get from context7.com/dashboard)
CONTEXT7_API_KEY=your_api_key_here

# Supabase credentials
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key

# Playwright options
PLAYWRIGHT_BROWSER=chromium
PLAYWRIGHT_HEADLESS=true
```

## Troubleshooting

### Context7 Issues
- Ensure API key is valid
- Check rate limits (higher limits with API key)
- Verify library IDs are correct

### Playwright Issues
- Install browser: `npx playwright install chromium`
- For Docker: Use `--no-sandbox` flag
- For CI/CD: Use headless mode

### Supabase Issues
- Verify project_id is correct
- Check RLS policies for tables
- Ensure proper permissions for operations

## Best Practices

1. **Always use Context7** for latest documentation
2. **Test across viewports** with Playwright resize
3. **Store audit results** in Supabase for tracking
4. **Batch operations** when possible for efficiency
5. **Use specific library IDs** for faster results

## Example Workflow

```javascript
async function completeAudit(url, projectId) {
  // 1. Get documentation
  const docs = await getLibraryDocs({
    context7CompatibleLibraryID: '/vercel/next.js',
    topic: 'performance optimization'
  })
  
  // 2. Run browser tests
  await mcp__playwright__browser_navigate({ url })
  const snapshot = await mcp__playwright__browser_snapshot()
  const metrics = await measurePerformance()
  
  // 3. Store results
  await mcp__supabase__execute_sql({
    project_id: projectId,
    query: "INSERT INTO audits (url, metrics) VALUES ($1, $2)",
    params: [url, metrics]
  })
  
  return { docs, snapshot, metrics }
}
```

## Verification

Run this command to verify all MCP servers are configured:

```bash
# Test Context7
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'

# Test Playwright
npx @playwright/mcp@latest --help

# Test Supabase
npx @supabase/mcp@latest --version
```