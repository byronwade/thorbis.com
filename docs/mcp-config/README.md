# Thorbis Truth Layer MCP Configuration

Model Context Protocol (MCP) configuration for Claude to safely interact with the Thorbis Truth Layer API. This configuration provides structured tools with built-in guardrails for local commerce operations.

## 🎯 Overview

This MCP configuration enables Claude to:
- **Read** verified business data (profiles, availability, pricing, reviews)
- **Create** booking holds, estimate drafts, and payment links safely
- **Never write directly** - all mutations require confirmation URLs
- **Handle errors gracefully** with comprehensive recovery guidance

## 📁 Files

- **`tools.json`** - Complete MCP tool definitions with JSON schemas
- **`tools-to-openapi.md`** - Mapping documentation to OpenAPI endpoints
- **`validate-tools.js`** - Validation script for schemas and examples
- **`README.md`** - This documentation

## 🛠️ Tool Categories

### Read Tools (4 tools)
Safe, rate-limited access to verified business data:

1. **`getBusinessBySlug`** - Get business profile with verification badges
2. **`getAvailability`** - Get Now/Next scheduling windows  
3. **`getPriceBands`** - Get market pricing percentiles (p50/p75/p90)
4. **`getReviews`** - Get invoice-verified reviews and ratings

### Action Tools (3 tools)  
Confirm-flow operations that never write directly:

1. **`createBookingHold`** - Create temporary booking hold with customer confirmation
2. **`createEstimateDraft`** - Create estimate draft for business review
3. **`createPaymentLink`** - Create secure payment link for business approval

## 🔒 Built-in Guardrails

### Confirmation Requirements
```json
{
  "guardrails": {
    "needsConfirmation": true,        // Claude must ask before calling
    "requiresIdempotencyKey": true,   // Prevents duplicate operations
    "destructive": false              // Never directly modifies data
  }
}
```

### Safety Features
- **Never Write on Open**: All mutations return confirmation URLs
- **Idempotency Keys**: Required UUIDs prevent duplicate operations
- **Rate Limiting**: Per-tool budgets prevent abuse
- **Error Recovery**: Comprehensive guidance for every error code
- **Type Safety**: Strict JSON schemas prevent invalid requests

## 📋 Usage Examples

### Reading Business Data
```json
{
  "tool": "getBusinessBySlug",
  "parameters": {
    "slug": "smith-plumbing-co"
  }
}
```

Response includes verification badges, licenses, insurance, and contact info.

### Checking Availability
```json
{
  "tool": "getAvailability", 
  "parameters": {
    "service_code": "plumbing",
    "zip": "78701",
    "duration_minutes": 120
  }
}
```

Returns immediate availability and future scheduling windows.

### Creating Booking Hold
```json
{
  "tool": "createBookingHold",
  "parameters": {
    "business_slug": "smith-plumbing-co",
    "service_code": "plumbing",
    "requested_time": "2024-02-16T10:00:00Z",
    "customer_info": {
      "name": "John Smith",
      "phone": "+1-512-555-0200",
      "email": "john.smith@email.com"
    },
    "job_details": {
      "description": "Kitchen sink not draining properly",
      "priority": "normal"
    },
    "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Important**: This requires `needsConfirmation: true` - Claude must ask the user before executing.

Response includes `confirm_url` that customer must click to complete booking.

## 🚦 Rate Limits & Budgets

| Tool Category | Cost/Call | Requests/Min | Requests/Hour |
|--------------|-----------|--------------|---------------|
| Read Tools   | $0.001-0.002 | 20-60 | 200-1000 |
| Action Tools | $0.05-0.10   | 3-5   | 20-50    |

Action tools have higher costs and stricter limits due to their business impact.

## ❌ Error Handling

All tools return standardized error codes with recovery guidance:

### Common Errors
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "field": "phone",
    "details": "Phone must match pattern +1-XXX-XXX-XXXX"
  }
}
```

### Error Codes & Recovery
- **`VALIDATION_ERROR`** → Check required fields and format constraints
- **`AUTH_ERROR`** → Ensure valid Bearer token in Authorization header
- **`NOT_FOUND`** → Verify resource exists or search for alternatives  
- **`CONFLICT`** → Resource conflict (e.g., time slot no longer available)
- **`RATE_LIMIT`** → Wait for reset or upgrade API tier
- **`INSUFFICIENT_DATA`** → Not enough data for reliable results

## 🔧 Setup & Configuration

### 1. Install Dependencies
```bash
cd mcp-config
bun install
```

### 2. Validate Configuration
```bash
node validate-tools.js
```

Should output: `🎉 All validations passed! MCP tools configuration is ready.`

### 3. Configure Claude
Add to Claude's MCP configuration:

```json
{
  "mcpServers": {
    "thorbis-truth-layer": {
      "command": "node",
      "args": ["path/to/mcp-server.js"],
      "env": {
        "THORBIS_API_KEY": "your-api-key-here",
        "THORBIS_API_URL": "https://api.thorbis.com/v1"
      }
    }
  }
}
```

### 4. Environment Variables
```bash
THORBIS_API_KEY=your-api-key-here
THORBIS_API_URL=https://api.thorbis.com/v1  # Optional, defaults to production
```

## 🔄 SDK Integration

Tools use the Thorbis Truth Layer SDK internally:

```javascript
import ThorbisTruthLayerSDK, { withIdempotencyKey } from '@thorbis/truth-layer-sdk'

const sdk = new ThorbisTruthLayerSDK({
  apiKey: process.env.THORBIS_API_KEY,
  baseURL: process.env.THORBIS_API_URL
})

// Example: Execute booking hold tool
async function executeBookingHold(params) {
  const response = await sdk.createBookingHold(
    {
      business_slug: params.business_slug,
      service_code: params.service_code,
      requested_time: params.requested_time,
      customer_info: params.customer_info,
      job_details: params.job_details
    },
    withIdempotencyKey(params.idempotency_key)
  )
  
  if (response.error) {
    return {
      success: false,
      error: response.error
    }
  }
  
  return {
    success: true,
    data: response.data
  }
}
```

## 🧪 Testing

### Validate Schemas
```bash
# Validates all JSON schemas and examples
node validate-tools.js
```

### Test with SDK
```bash
# Test examples against actual API (requires valid API key)
node test-examples.js
```

## 📚 Documentation

- **OpenAPI Mapping**: See `tools-to-openapi.md` for endpoint correspondence
- **Truth Layer API**: Full OpenAPI spec in `../thorbis-openapi.yaml`  
- **TypeScript SDK**: Complete SDK in `../thorbis-truth-layer-sdk/`
- **Error Codes**: Comprehensive error handling in each tool definition

## 🔐 Security

### Authentication
All tools require Bearer JWT tokens:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Tenant Isolation
All operations are scoped to authenticated business context.

### Audit Logging
All tool calls are logged with:
- User context and session ID
- Input parameters (sanitized)
- Execution results and timing
- Error details and recovery actions

### Rate Limiting
- Per-tool budget enforcement
- Global API rate limits
- Automatic exponential backoff on errors

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Production API endpoint
export THORBIS_API_URL=https://api.thorbis.com/v1

# API key with appropriate scopes
export THORBIS_API_KEY=prod_key_with_agent_role

# Optional: Custom timeouts and retries
export THORBIS_TIMEOUT_MS=30000
export THORBIS_MAX_RETRIES=3
```

### 2. Monitoring & Alerts
Monitor these metrics:
- Tool execution success rates
- Rate limit violations
- API response times
- Error code frequencies
- Confirmation URL completion rates

### 3. Budget Management
- Set spending alerts for high-cost tools
- Monitor per-business usage patterns  
- Implement circuit breakers for cascading failures
- Track ROI on AI-assisted operations

## 💡 Best Practices

### For Claude Integration
1. **Always confirm actions**: Use confirmation prompts for write operations
2. **Provide context**: Include relevant business and customer details
3. **Handle errors gracefully**: Present recovery options to users
4. **Respect rate limits**: Space out operations and batch when possible
5. **Validate inputs**: Check parameters before tool calls

### For Business Users
1. **Review confirmation URLs**: Always verify details before clicking confirm
2. **Monitor tool usage**: Track costs and success rates
3. **Set appropriate limits**: Configure budgets based on business needs
4. **Train on workflows**: Understand the confirm-flow safety pattern

## 🔄 Version History

- **v1.0.0** - Initial MCP configuration with 7 tools
- Complete OpenAPI 3.0.3 compliance
- Built-in guardrails and safety features
- Comprehensive error handling and recovery
- Production-ready with monitoring support

## 📞 Support

- **Documentation**: https://docs.thorbis.com/mcp-tools
- **Issues**: Create issues in the Thorbis GitHub repository
- **API Support**: api-support@thorbis.com
- **Business Support**: For business account questions

---

**Ready to use**: This MCP configuration is production-ready and fully tested against the Thorbis Truth Layer API.
