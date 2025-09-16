# Back Button Navigation Implementation Guide

This guide explains how to configure and use the back button functionality in the Thorbis unified navigation system.

## Overview

The back button feature allows specific pages to display a back button instead of the sidebar toggle button, providing an app-like navigation experience for pages that function more like detailed views or forms.

## Configuration

### 1. Navigation Config Setup

Back button pages are configured in the navigation configuration for each industry. Add the `backButtonPages` array to your industry's config:

```typescript
// In packages/ui/src/configs/navigation-configs.ts

export const navigationConfigs: Record<Industry, NavigationConfig> = {
  hs: {
    appName: 'Home Services',
    icon: Wrench,
    primaryColor: '#1C8BFF',
    backButtonPages: [
      {
        path: '/estimates/create',
        backTo: '/estimates',
        label: 'Back to Estimates',
        description: 'Return to estimates list'
      },
      {
        path: '/work-orders/create',
        backTo: '/work-orders',
        label: 'Back to Work Orders',
        description: 'Return to work orders list'
      }
    ],
    sections: [
      // ... regular navigation sections
    ]
  }
}
```

### 2. PageBackButtonConfig Interface

Each back button configuration uses the following interface:

```typescript
interface PageBackButtonConfig {
  /** The exact pathname that should show a back button */
  path: string
  /** The URL to navigate to when back button is clicked */
  backTo: string
  /** Custom back button label (defaults to "Back") */
  label?: string
  /** Description for accessibility */
  description?: string
}
```

## Usage Examples

### Basic Configuration

```typescript
{
  path: '/customers/create',
  backTo: '/customers',
  label: 'Back to Customers',
  description: 'Return to customer list'
}
```

### Dynamic Routes

For dynamic routes, use the exact path pattern:

```typescript
{
  path: '/customers/[id]/edit',
  backTo: '/customers',
  label: 'Back to Customers',
  description: 'Return to customer list'
}
```

### Nested Navigation

For deeply nested pages:

```typescript
{
  path: '/estimates/[id]/items/create',
  backTo: '/estimates/[id]',
  label: 'Back to Estimate',
  description: 'Return to estimate details'
}
```

## Helper Functions

### getBackButtonConfig

Check if a path should show a back button:

```typescript
import { getBackButtonConfig } from '@thorbis/ui/configs/navigation-configs'

const backButtonConfig = getBackButtonConfig('hs', '/estimates/create')
if (backButtonConfig) {
  // Page should show back button
  console.log(backButtonConfig.backTo) // '/estimates'
}
```

### addBackButtonPage

Dynamically add back button configuration:

```typescript
import { addBackButtonPage } from '@thorbis/ui/configs/navigation-configs'

addBackButtonPage('hs', {
  path: '/new-feature/create',
  backTo: '/new-feature',
  label: 'Back to New Feature',
  description: 'Return to new feature list'
})
```

## Component Usage

The UnifiedNavigation component automatically detects and displays the back button based on the current pathname:

```typescript
import { UnifiedNavigation } from '@thorbis/ui/components/unified-navigation'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <UnifiedNavigation
        industry="hs"
        layout="sidebar"
        showLogo={true}
        // ... other props
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
```

## Behavior

### Sidebar Layout
- When a configured path is visited, the sidebar toggle button is replaced with a back button
- The back button shows the configured label (or "Back" as default)
- Clicking the back button navigates to the configured `backTo` URL

### Header Layout
- On mobile devices, the hamburger menu button is replaced with the back button
- The back button label is hidden on very small screens but shows on larger mobile screens

### Responsive Design
- Desktop: Back button appears in the sidebar header
- Mobile: Back button replaces the menu toggle in the header
- Tablet: Follows mobile behavior for overlay-free navigation

## Best Practices

### 1. Use for App-like Pages
Configure back buttons for pages that feel like detailed views or forms:
- Create/Edit forms
- Detail views
- Settings pages
- Wizard steps

### 2. Clear Labeling
Use descriptive labels that indicate where the user will return:
- "Back to Estimates" instead of just "Back"
- "Back to Customer" for specific customer details
- "Back to Dashboard" for settings pages

### 3. Consistent Patterns
Follow consistent patterns within your app:
- All create forms go back to their respective list pages
- All edit forms go back to detail pages or list pages
- All settings sub-pages go back to main settings

### 4. Accessibility
- Always provide meaningful `description` values
- Use clear, descriptive labels
- Test with screen readers

## Examples by Industry

### Home Services (HS)
```typescript
backButtonPages: [
  {
    path: '/estimates/create',
    backTo: '/estimates',
    label: 'Back to Estimates'
  },
  {
    path: '/work-orders/create',
    backTo: '/work-orders',
    label: 'Back to Work Orders'
  },
  {
    path: '/customers/create',
    backTo: '/customers',
    label: 'Back to Customers'
  }
]
```

### Books/Accounting
```typescript
backButtonPages: [
  {
    path: '/invoices/create',
    backTo: '/invoices',
    label: 'Back to Invoices'
  },
  {
    path: '/transactions/create',
    backTo: '/transactions',
    label: 'Back to Transactions'
  },
  {
    path: '/customers/create',
    backTo: '/customers',
    label: 'Back to Customers'
  }
]
```

## Testing

To test the back button implementation:

1. Configure back button pages in your navigation config
2. Navigate to a configured path
3. Verify the back button appears instead of the sidebar toggle
4. Verify the back button navigates to the correct destination
5. Test on different screen sizes for responsive behavior

## Troubleshooting

### Back Button Not Appearing
- Ensure the exact path matches the configuration
- Check that the pathname is being properly detected
- Verify the navigation config is properly exported

### Back Button Not Working
- Check that the `backTo` URL is valid
- Ensure proper routing setup in your Next.js app
- Verify Link component is functioning correctly

### Styling Issues
- Check CSS classes are properly applied
- Verify theme colors are configured
- Test across different screen sizes