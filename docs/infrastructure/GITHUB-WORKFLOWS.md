# GitHub Workflows Documentation

## Overview

This document covers the GitHub Actions workflows that power the CI/CD pipeline for Thorbis Business OS, specifically focusing on Claude Code integration for automated code review and development assistance.

## Workflow Files

### 1. Claude Code Review Workflow

**File**: `.github/workflows/claude-code-review.yml`  
**Purpose**: Automated PR Code Review using Claude  
**Trigger**: Pull Request opened/synchronized  
**Model**: Claude Sonnet 4 (default)  

### 2. Claude Code Workflow  

**File**: `.github/workflows/claude.yml`  
**Purpose**: Interactive Claude Code assistance  
**Trigger**: @claude mentions in issues/PRs/comments  
**Model**: Claude Sonnet 4 (default)  

## Claude Code Review Workflow

### Workflow Configuration

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]
    # Optional: Only run on specific file changes
    # paths:
    #   - "src/**/*.ts"
    #   - "src/**/*.tsx"
    #   - "src/**/*.js"
    #   - "src/**/*.jsx"
```

### Security & Permissions

```yaml
runs-on: ubuntu-latest
permissions:
  contents: read
  pull-requests: read
  issues: read
  id-token: write
```

### Review Configuration

#### Direct Prompt Strategy
```yaml
direct_prompt: |
  Please review this pull request and provide feedback on:
  - Code quality and best practices
  - Potential bugs or issues
  - Performance considerations
  - Security concerns
  - Test coverage
  
  Be constructive and helpful in your feedback.
```

#### Key Features
- **No @claude mention required**: Direct automated review
- **Configurable model**: Can switch to Claude Opus 4
- **Sticky comments**: Reuses same comment on subsequent pushes
- **File type awareness**: Can customize reviews based on file extensions

### Advanced Configuration Options

#### Author-Based Reviews
```yaml
# Filter by PR author (commented out by default)
if: |
  github.event.pull_request.user.login == 'external-contributor' ||
  github.event.pull_request.user.login == 'new-developer' ||
  github.event.pull_request.author_association == 'FIRST_TIME_CONTRIBUTOR'
```

#### File Type-Specific Reviews
```yaml
direct_prompt: |
  Review this PR focusing on:
  - For TypeScript files: Type safety and proper interface usage
  - For API endpoints: Security, input validation, and error handling
  - For React components: Performance, accessibility, and best practices
  - For tests: Coverage, edge cases, and test quality
```

#### Conditional Execution
```yaml
if: |
  !contains(github.event.pull_request.title, '[skip-review]') &&
  !contains(github.event.pull_request.title, '[WIP]')
```

## Claude Code Interactive Workflow

### Trigger Conditions

```yaml
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]
  pull_request_review:
    types: [submitted]
```

### Activation Logic

```yaml
if: |
  (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
  (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
  (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@claude')) ||
  (github.event_name == 'issues' && (contains(github.event.issue.body, '@claude') || contains(github.event.issue.title, '@claude')))
```

### Enhanced Permissions

```yaml
permissions:
  contents: read
  pull-requests: read
  issues: read
  id-token: write
  actions: read # Required for Claude to read CI results on PRs
```

### Configuration Options

#### Custom Trigger Phrase
```yaml
# Optional: Customize the trigger phrase (default: @claude)
# trigger_phrase: "/claude"
```

#### Assignee-Based Triggering
```yaml
# Optional: Trigger when specific user is assigned to an issue
# assignee_trigger: "claude-bot"
```

#### Tool Execution
```yaml
# Optional: Allow Claude to run specific commands
# allowed_tools: "Bash(npm install),Bash(npm run build),Bash(npm run test:*),Bash(npm run lint:*)"
```

#### Custom Instructions
```yaml
# Optional: Add custom instructions for Claude
# custom_instructions: |
#   Follow our coding standards
#   Ensure all new code has tests
#   Use TypeScript for new files
```

## Integration Points

### Monorepo Architecture
- **Multi-App Support**: Works across all Thorbis apps (hs, rest, auto, ret, etc.)
- **Shared Package Analysis**: Reviews changes to shared components and utilities
- **Monorepo-Aware**: Understands project structure and dependencies

### NextFaster Performance
- **Bundle Analysis**: Can analyze bundle size impacts
- **Performance Review**: Evaluates performance implications of changes
- **Optimization Suggestions**: Provides NextFaster-compliant recommendations

### Security Integration
- **Security Reviews**: Identifies potential security vulnerabilities
- **Authentication Changes**: Reviews auth-related code modifications
- **API Security**: Validates API endpoint security practices

## Performance Optimizations

### Selective Execution
- **Path-based filtering**: Only runs on relevant file changes
- **Author-based filtering**: Can skip reviews for trusted contributors
- **Title-based filtering**: Supports skip flags and WIP detection

### Resource Management
- **Fetch depth optimization**: `fetch-depth: 1` for faster checkouts
- **Conditional execution**: Avoids unnecessary runs
- **Efficient permissions**: Minimal required permissions

### Caching Strategy
- **No build caching needed**: Analysis works on source code
- **Repository caching**: GitHub's built-in repository caching
- **Action result caching**: Reuses results where appropriate

## Security Considerations

### Token Management
```yaml
claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

**Security Requirements**:
- Token stored as GitHub repository secret
- Limited scope to repository access
- Regular token rotation recommended
- Audit trail of all Claude interactions

### Permission Model
- **Read-only access**: No write permissions to repository
- **Issue/PR access**: Can read and comment on issues/PRs
- **CI result access**: Can read workflow results for context
- **No sensitive data access**: Cannot access secrets or environment variables

### Data Privacy
- **Code analysis only**: No persistent storage of code
- **Ephemeral processing**: Analysis occurs in workflow runtime only
- **No data retention**: Claude doesn't retain conversation history
- **Audit compliance**: All interactions logged in GitHub

## Error Handling & Recovery

### Workflow Failures
```yaml
- name: Run Claude Code Review
  id: claude-review
  uses: anthropics/claude-code-action@beta
  with:
    claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
  # Error handling implicit in action
```

### Common Issues
1. **Token expiration**: Automated notifications to repository admins
2. **API rate limits**: Built-in retry logic with exponential backoff
3. **Large PRs**: Automatic chunking for large code reviews
4. **Network issues**: Workflow retry mechanism

### Monitoring & Alerting
- **Workflow status**: GitHub Actions status badges
- **Failure notifications**: Integrated with GitHub notifications
- **Usage tracking**: Available in GitHub Actions usage metrics

## Usage Examples

### Basic PR Review
1. Create pull request
2. Claude automatically reviews within 2-3 minutes
3. Review comments appear as PR comments
4. Subsequent pushes update existing review

### Interactive Development
```markdown
@claude Can you help me optimize this React component for performance?

@claude Review the security implications of this API endpoint

@claude Suggest improvements to this database query
```

### Issue Assignment
```markdown
# In issue description or title
@claude Please analyze this bug report and suggest debugging steps
```

## Customization Options

### Review Scope Configuration
```yaml
# File type filtering
paths:
  - "apps/**/*.ts"
  - "apps/**/*.tsx"
  - "packages/**/*.ts"
  - "!**/*.test.ts"
```

### Custom Review Prompts
```yaml
direct_prompt: |
  As a senior developer familiar with Next.js 15 and the Thorbis Business OS architecture:
  
  1. Evaluate code quality and adherence to project standards
  2. Check for NextFaster performance compliance (170KB budget)
  3. Validate security practices, especially for business data
  4. Ensure proper error handling and type safety
  5. Suggest optimizations for the monorepo structure
```

### Environment-Specific Configuration
```yaml
# Different prompts for different environments
direct_prompt: |
  ${{ github.base_ref == 'main' && 
  'Perform thorough production-readiness review' ||
  'Focus on development best practices and code quality' }}
```

## Maintenance Requirements

### Regular Updates
- **Action version updates**: Monitor for new versions of claude-code-action
- **Token rotation**: Regular rotation of OAuth tokens
- **Permission audits**: Review and validate workflow permissions

### Performance Monitoring
- **Workflow duration**: Track review completion times
- **API usage**: Monitor Claude API usage and costs
- **Review quality**: Assess effectiveness of automated reviews

### Configuration Management
- **Template updates**: Update review prompts as project evolves
- **Scope adjustments**: Modify file filters as codebase grows
- **Integration testing**: Validate workflow changes in staging

## Related Documentation

- [Bundle Analysis Script](./BUNDLE-ANALYSIS-SCRIPT.md)
- [NextFaster Optimizations](./NEXTFASTER-OPTIMIZATIONS-SCRIPT.md)
- [Environment Configuration](./ENVIRONMENT-CONFIGURATION.md)
- GitHub Actions documentation
- Claude Code action documentation

## Future Enhancements

### Planned Features
- **Performance benchmarking**: Automated performance impact analysis
- **Security scanning integration**: Enhanced security review capabilities
- **Multi-model support**: Option to use different Claude models for different review types
- **Custom review templates**: Industry-specific review templates

### Integration Opportunities
- **Bundle size tracking**: Integration with bundle analysis script
- **Performance monitoring**: Connection to performance monitoring services
- **Code coverage**: Integration with test coverage reporting
- **Deployment automation**: Connection to deployment workflows

These workflows provide comprehensive AI-powered code review and development assistance, ensuring code quality and performance standards across the entire Thorbis Business OS monorepo.