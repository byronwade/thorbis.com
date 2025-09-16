# Documentation Contribution Guidelines

> **Version**: 1.0.0  
> **Last Updated**: 2025-01-31  
> **Owner**: Documentation Team  
> **Scope**: All Thorbis Business OS Documentation

## Overview

This document provides comprehensive guidelines for contributing to the Thorbis Business OS documentation system. Whether you're a developer documenting a new feature, a product manager updating user guides, or a team member fixing a typo, these guidelines ensure consistency, quality, and effectiveness across our 3,200+ pages of documentation.

## Contribution Philosophy

### Core Principles
- **User-First**: Always prioritize user value and clarity over technical completeness
- **Consistency**: Follow established patterns, styles, and structures
- **Accuracy**: Ensure all information is current, tested, and verified
- **Accessibility**: Make content accessible to all users and skill levels
- **Maintainability**: Write content that can be easily updated and maintained
- **Collaboration**: Embrace peer review and collective ownership

### Documentation as Code
Our documentation follows a "docs-as-code" approach:
- Version controlled with Git
- Reviewed through pull requests
- Automatically tested and validated
- Deployed continuously
- Maintained alongside the codebase

## Getting Started

### Prerequisites
Before contributing to documentation, ensure you have:
- [ ] Git and GitHub access to the repository
- [ ] Basic understanding of Markdown syntax
- [ ] Familiarity with the Thorbis Business OS platform
- [ ] Access to development/staging environments for testing

### Development Environment Setup
```bash
# Clone the repository
git clone https://github.com/thorbis/business-os.git
cd business-os

# Install dependencies
pnpm install

# Start local documentation server
cd docs
pnpm dev

# Open browser to http://localhost:3000/docs
```

### Required Tools
Install these tools for an optimal contribution experience:
```bash
# Markdown linter and formatter
npm install -g markdownlint-cli
npm install -g prettier

# Link checker
npm install -g markdown-link-check

# Spell checker
npm install -g cspell
```

## Contribution Workflow

### 1. Planning Your Contribution

#### Issue Creation
Before starting work, create or reference a GitHub issue:
```markdown
## Documentation Request

**Type**: [New Content | Update | Fix | Translation]
**Priority**: [High | Medium | Low]
**Affected Sections**: List relevant documentation sections
**Target Audience**: [Developer | Business User | Admin | All]

### Description
Clear description of what needs to be documented or changed.

### Acceptance Criteria
- [ ] Specific, measurable criteria for completion
- [ ] User value clearly articulated
- [ ] Success metrics defined

### Additional Context
Any relevant background, examples, or references.
```

#### Content Planning
For substantial contributions, complete the content planning template:
```markdown
# Content Planning Template

## Audience Analysis
- **Primary Audience**: Who will use this documentation most?
- **Secondary Audience**: Who else might reference it?
- **Skill Level**: Beginner | Intermediate | Advanced
- **Context**: When and why do they need this information?

## Content Outline
1. Introduction/Overview
2. Prerequisites
3. Main Content (break into logical sections)
4. Examples and Use Cases
5. Troubleshooting
6. Next Steps/Related Topics

## Success Metrics
- How will you measure if this documentation is successful?
- What user actions should this content enable?

## Maintenance Plan
- Who will maintain this content?
- How often should it be reviewed?
- What might cause it to become outdated?
```

### 2. Writing Process

#### Branch Creation
Create a descriptive branch for your work:
```bash
# Feature branches
git checkout -b docs/add-api-authentication-guide
git checkout -b docs/update-deployment-procedures
git checkout -b docs/fix-broken-links-in-getting-started

# Use prefixes: docs/, fix/, update/, feat/
```

#### Writing Guidelines

##### Markdown Standards
Follow these Markdown conventions:
```markdown
# Page Title (H1 - only one per page)

> **Metadata Block** (optional)
> **Version**: 1.0.0  
> **Last Updated**: YYYY-MM-DD  
> **Target Audience**: Specific audience

## Section Title (H2)

### Subsection Title (H3)

#### Detail Section (H4)

##### Minor Detail (H5 - use sparingly)

- Use unordered lists for non-sequential items
1. Use ordered lists for sequential steps
   - Indent sub-items consistently

**Bold text** for emphasis
*Italic text* for subtle emphasis
`Inline code` for technical terms
```

##### Code Examples
All code examples must be:
- **Tested**: Verify they work in the target environment
- **Complete**: Include all necessary imports and setup
- **Commented**: Explain complex logic
- **Secure**: Follow security best practices

```typescript
// Example: API endpoint implementation
import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';

/**
 * Handles work order creation for home services
 * @param request - Next.js API request object
 * @returns JSON response with work order data
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication and permissions
    const user = await validateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createWorkOrderSchema.parse(body);

    // Create work order with tenant isolation
    const workOrder = await createWorkOrder({
      ...validatedData,
      businessId: user.businessId,
      createdBy: user.id
    });

    return NextResponse.json({
      data: workOrder,
      message: 'Work order created successfully'
    });

  } catch (error) {
    console.error('Work order creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

##### Screenshots and Images
For visual content:
- Use descriptive filenames: `work-order-creation-form.png`
- Store in `/docs/images/` with organized subdirectories
- Optimize file sizes (< 500KB for screenshots)
- Include meaningful alt text for accessibility
- Use consistent browser/OS for screenshots

```markdown
![Work order creation form showing customer details, service type selection, and scheduling options](./images/work-orders/creation-form.png)
```

#### Content Structure Standards

##### Page Structure Template
```markdown
# Page Title

> **Metadata Block** (if applicable)

## Overview
Brief description of what this page covers and why it's useful.

## Prerequisites
What users need to know or have before following this guide.

## Main Content
Break into logical sections with clear headings.

### Step-by-Step Instructions
1. Clear, actionable steps
2. One action per step
3. Expected outcomes for each step

### Examples and Use Cases
Practical examples that users can relate to their work.

### Common Issues and Troubleshooting
Anticipated problems and their solutions.

## Next Steps
What users should do after completing this guide.

## Related Documentation
Links to related topics and further reading.
```

##### API Documentation Template
```markdown
# API Endpoint Name

## Overview
Brief description of what this endpoint does.

## Authentication
Required authentication method and permissions.

## Request
### Endpoint
`POST /api/hs/app/v1/work-orders`

### Headers
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
Idempotency-Key: {unique_key}
```

### Request Body
```typescript
interface CreateWorkOrderRequest {
  title: string;
  description: string;
  customerId: string;
  serviceType: HSServiceType;
  priority?: Priority;
  scheduledAt?: Date;
}
```

## Response
### Success Response (201)
```json
{
  "data": {
    "id": "wo_abc123",
    "title": "HVAC Maintenance",
    "status": "created",
    "createdAt": "2024-01-31T10:00:00Z"
  },
  "message": "Work order created successfully"
}
```

### Error Responses
```json
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "field": "title"
  }
}
```

## Examples
Practical examples with context and explanation.

## Rate Limits and Usage Notes
Important considerations for using this endpoint.
```

### 3. Review and Quality Assurance

#### Self-Review Checklist
Before submitting your contribution, verify:

**Content Quality**
- [ ] Information is accurate and up-to-date
- [ ] All code examples are tested and working
- [ ] Screenshots reflect the current UI
- [ ] Links are valid and point to correct destinations
- [ ] Grammar and spelling are correct

**Structure and Style**
- [ ] Follows the established page structure template
- [ ] Uses consistent heading hierarchy (no skipped levels)
- [ ] Maintains consistent terminology throughout
- [ ] Includes appropriate cross-references
- [ ] Has clear, actionable next steps

**Accessibility and Usability**
- [ ] Images have descriptive alt text
- [ ] Content is scannable with clear headings
- [ ] Technical concepts are explained clearly
- [ ] Examples are practical and relatable
- [ ] Prerequisites are clearly stated

**Technical Validation**
- [ ] Code examples compile/run without errors
- [ ] API examples use current endpoint URLs
- [ ] Configuration examples are valid
- [ ] All external links are accessible

#### Automated Validation
Run the automated validation suite before submitting:
```bash
# Run all validations
cd docs/scripts
./master-validation.sh

# Or run individual checks
node validation/link-checker.js
node validation/code-validator.js
node validation/content-analyzer.js
```

### 4. Pull Request Process

#### Pull Request Template
Use this template for all documentation PRs:
```markdown
## Documentation Changes

### Type of Change
- [ ] New documentation
- [ ] Update existing content  
- [ ] Fix errors or broken links
- [ ] Improve content quality
- [ ] Translation

### Description
Brief description of what was changed and why.

### Affected Documentation
List the specific pages or sections modified.

### Target Audience Impact
Who will benefit from these changes and how?

### Testing Performed
- [ ] All links tested and working
- [ ] Code examples tested in development environment
- [ ] Screenshots updated if UI changed
- [ ] Automated validation passed

### Breaking Changes
Any changes that might affect existing links or bookmarks?

### Related Issues
Fixes #123, Addresses #456

### Review Checklist
- [ ] Content follows style guide
- [ ] Information is accurate and current
- [ ] Code examples are tested
- [ ] Images have alt text
- [ ] Cross-references are updated
```

#### Review Process
1. **Automated Review**: CI/CD pipeline runs validation checks
2. **Peer Review**: At least one team member reviews content
3. **Technical Review**: Subject matter expert validates technical accuracy
4. **Editorial Review**: For substantial changes, editorial review for clarity
5. **Final Approval**: Documentation team lead approves for merge

#### Review Criteria
Reviewers should evaluate:
- **Accuracy**: Is all information correct and current?
- **Clarity**: Will the target audience understand this content?
- **Completeness**: Are all necessary details included?
- **Consistency**: Does it follow established patterns and style?
- **Value**: Does this meaningfully help users accomplish their goals?

### 5. Post-Merge Responsibilities
After your contribution is merged:
- Monitor for user feedback and questions
- Be available to address any issues that arise
- Update related documentation if dependencies change
- Consider creating follow-up content based on user needs

## Style Guide

### Writing Style

#### Voice and Tone
- **Active Voice**: Use active voice whenever possible
  - ✅ "Configure the database connection"
  - ❌ "The database connection should be configured"

- **Direct and Clear**: Be concise and specific
  - ✅ "Click Save to store your changes"
  - ❌ "You might want to consider possibly saving your changes"

- **User-Focused**: Write from the user's perspective
  - ✅ "You can create multiple work orders"
  - ❌ "The system allows work order creation"

- **Inclusive Language**: Use gender-neutral, accessible language
  - ✅ "team members", "everyone", "users"
  - ❌ "guys", "blacklist/whitelist"

#### Technical Terms
- **Consistency**: Use the same term throughout all documentation
- **Definition**: Define technical terms on first use
- **Acronyms**: Spell out acronyms on first use: "Application Programming Interface (API)"
- **Capitalization**: Follow product-specific capitalization

#### Common Terms and Preferred Usage
| Preferred | Avoid | Context |
|-----------|-------|---------|
| API | api, Api | Technical documentation |
| JavaScript | Javascript, javascript | Programming references |
| user interface | UI (unless space is limited) | General writing |
| database | DB (unless technical context) | General writing |
| sign in | login (noun), log in (verb) | Authentication |
| set up (verb) | setup (noun only) | Instructions |

### Formatting Standards

#### Headings
```markdown
# Page Title (H1) - Only one per page
## Major Section (H2) - Primary content divisions
### Subsection (H3) - Content subdivisions  
#### Detail Section (H4) - Specific details
##### Minor Detail (H5) - Use sparingly
```

#### Lists
```markdown
<!-- Unordered lists for non-sequential items -->
- First item
- Second item
  - Sub-item (2 space indent)
  - Another sub-item

<!-- Ordered lists for sequential steps -->
1. First step
2. Second step
   a. Sub-step (3 space indent)
   b. Another sub-step
3. Third step
```

#### Code and Technical Content
```markdown
<!-- Inline code for short snippets -->
Use the `createWorkOrder()` function to generate new orders.

<!-- Code blocks with language specification -->
```typescript
interface WorkOrder {
  id: string;
  title: string;
  status: WorkOrderStatus;
}
```

<!-- Command line examples -->
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```
```

#### Links and References
```markdown
<!-- Internal links (relative paths) -->
[Configuration Guide](./configuration/README.md)
[API Reference](../api/README.md)

<!-- External links -->
[Next.js Documentation](https://nextjs.org/docs)

<!-- Reference-style links for repeated URLs -->
[Supabase Documentation][supabase-docs]

[supabase-docs]: https://supabase.com/docs
```

## Content Types and Templates

### 1. Getting Started Guide
```markdown
# Getting Started with [Feature Name]

## Overview
Brief introduction to what users will accomplish.

## Prerequisites
- Required knowledge or setup
- Access requirements
- Software dependencies

## Quick Start (5 minutes)
1. Most essential steps to get basic functionality
2. Immediate value for the user
3. Link to more comprehensive setup

## Complete Setup
Detailed step-by-step instructions for full implementation.

## Verification
How users can confirm everything is working correctly.

## Troubleshooting
Common issues and their solutions.

## Next Steps
- Links to related guides
- Advanced features to explore
- Community resources
```

### 2. Tutorial Template
```markdown
# [Tutorial Name]: [What Users Will Build]

## What You'll Learn
Clear learning objectives and outcomes.

## Prerequisites
What users need to know and have before starting.

## Step 1: [Action-Oriented Title]
Clear instructions with expected outcomes.

## Step 2: [Next Logical Step]
Building on previous steps.

## [Continue with remaining steps]

## Conclusion
Summary of what was accomplished and next steps.

## Full Code Example
Complete, working example they can reference.
```

### 3. Reference Documentation
```markdown
# [API/Feature] Reference

## Overview
Brief description and primary use cases.

## [Function/Endpoint Name]
### Syntax
```language
exact_syntax_here
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1 | string | Yes | Purpose and constraints |

### Returns
Description of return values and types.

### Examples
Practical examples with context.

### Notes
Important considerations or limitations.
```

## Quality Standards

### Content Quality Metrics
All contributions are evaluated against these standards:

**Accuracy** (Target: 98%+)
- Information matches current system behavior
- Code examples execute without errors
- Screenshots reflect current UI state
- External links are accessible and relevant

**Completeness** (Target: 95%+)
- All necessary information included
- Prerequisites clearly stated
- Expected outcomes specified
- Error handling and troubleshooting covered

**Clarity** (Target: 90%+ user satisfaction)
- Content appropriate for target audience
- Technical concepts explained clearly
- Logical information flow
- Scannable structure with clear headings

**Consistency** (Target: 100%)
- Follows established style guide
- Uses consistent terminology
- Matches structural patterns
- Maintains brand voice and tone

### Performance Standards
Documentation must meet these performance criteria:
- Page load time < 3 seconds
- Mobile-friendly responsive design
- Accessibility compliance (WCAG 2.1 AA)
- Search engine optimization best practices

## Common Mistakes to Avoid

### Content Mistakes
❌ **Writing from inside knowledge**
- Don't assume users know internal terminology or processes
- Always explain context and prerequisites

❌ **Including outdated information**
- Verify all information against current system state
- Update version-specific references regularly

❌ **Creating orphaned content**
- Every page should be accessible through navigation
- Include cross-references to related content

❌ **Writing for yourself**
- Consider the user's goals and context
- Focus on practical value over technical completeness

### Technical Mistakes
❌ **Untested code examples**
- All code must be tested in the target environment
- Include necessary imports and setup code

❌ **Broken internal links**
- Verify all internal links work correctly
- Use relative paths for internal content

❌ **Missing alt text for images**
- All images must have descriptive alt text
- Describe the content and purpose of the image

❌ **Inconsistent formatting**
- Follow the established style guide consistently
- Use the same patterns for similar content types

## Community and Collaboration

### Getting Help
- **Documentation Team**: @docs-team in Slack
- **Style Questions**: Check the style guide first, then ask in #docs-questions
- **Technical Issues**: Tag appropriate team members in pull requests
- **Content Planning**: Schedule time with documentation team lead

### Sharing Knowledge
- Document your learnings and share with the team
- Contribute to style guide improvements
- Participate in documentation reviews
- Share user feedback and improvement ideas

### Recognition
Outstanding contributions to documentation are recognized through:
- Monthly team acknowledgments
- Annual documentation awards
- Conference speaking opportunities
- Career development support

## Maintenance Responsibilities

### Content Ownership
- **Author Responsibility**: Original authors are responsible for initial maintenance
- **Team Responsibility**: All team members can contribute improvements
- **SME Review**: Subject matter experts validate technical accuracy
- **Editorial Review**: Documentation team maintains style and quality

### Update Triggers
Content should be updated when:
- Features are added, modified, or deprecated
- User feedback indicates confusion or gaps
- Support tickets suggest documentation issues
- Regular review cycle identifies outdated information

### Maintenance Schedule
- **Daily**: Automated link and code validation
- **Weekly**: Review user feedback and support tickets
- **Monthly**: Content freshness review
- **Quarterly**: Comprehensive audit and strategic review

## Measuring Success

### Documentation Metrics
We track these metrics to ensure documentation effectiveness:

**Usage Metrics**
- Page views and unique visitors
- Time spent on page
- User flow through documentation
- Search queries and success rates

**Quality Metrics**
- User feedback scores
- Task completion rates
- Support ticket reduction
- Content accuracy validation

**Engagement Metrics**
- Community contributions
- Internal team participation
- Content sharing and referrals
- Workshop and training usage

### Continuous Improvement
Based on these metrics, we continuously improve:
- Content that doesn't meet usage thresholds
- Pages with high bounce rates
- Topics generating support tickets
- User journey optimization

## Resources and Tools

### Essential Tools
- **Git**: Version control and collaboration
- **Markdown**: Content formatting and structure  
- **VS Code**: Recommended editor with extensions
- **Automated Validation**: Quality assurance scripts

### Recommended Extensions
VS Code extensions for documentation work:
- **Markdown All in One**: Enhanced Markdown editing
- **Code Spell Checker**: Real-time spell checking
- **Prettier**: Consistent formatting
- **GitLens**: Git integration and history
- **Markdown Preview Enhanced**: Rich preview experience

### Reference Materials
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Plain Language Guidelines](https://www.plainlanguage.gov/guidelines/)

---

## Getting Started Checklist

Ready to contribute? Complete this checklist:

### Setup
- [ ] Repository cloned and development environment configured
- [ ] Required tools installed (Git, Node.js, editors)
- [ ] Documentation server running locally
- [ ] Validation scripts tested and working

### First Contribution
- [ ] Issue created or identified for your contribution
- [ ] Content planned using provided templates
- [ ] Branch created with descriptive name
- [ ] Content written following style guide
- [ ] Self-review completed using checklist
- [ ] Automated validation passed
- [ ] Pull request submitted with complete description

### Integration
- [ ] Team introductions made in relevant channels
- [ ] Documentation workflow understood
- [ ] Review process clarified
- [ ] Maintenance responsibilities accepted

Welcome to the Thorbis documentation community! Your contributions help thousands of users succeed with our platform. 

For questions or support, reach out to the documentation team at docs@thorbis.com or in the #documentation Slack channel.

---

*These contribution guidelines ensure that all documentation contributions maintain the highest standards of quality, consistency, and user value across the Thorbis Business OS documentation system.*