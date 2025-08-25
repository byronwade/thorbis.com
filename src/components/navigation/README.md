# Enhanced Business Navigation System

## Overview

This enhanced navigation system provides a ServiceTitan-style interface with intelligent navigation, industry-specific modules, and functional sub-headers that act as page-specific toolbars.

## Key Components

### 1. EnhancedBusinessHeader.jsx
**ServiceTitan-style main header with intelligent navigation**

Features:
- Industry selector (Field Service / Restaurant)
- Smart module navigation with dropdowns
- Global search with command palette (⌘K)
- Shared modules dropdown ("More Tools")
- User profile and settings access
- Responsive design with mobile support

```jsx
<EnhancedBusinessHeader
  userId="user_1"
  userRole="OWNER"
  businessId="business_1"
  onSearch={handleSearch}
  onNotificationClick={handleNotifications}
  onHelpClick={handleHelp}
/>
```

### 2. PageSubHeader.jsx
**Page-specific toolbar with breadcrumbs and contextual actions**

Features:
- Intelligent breadcrumb navigation
- Page-specific action buttons
- Industry/module context badges
- Search functionality (optional)
- Responsive action overflow menu

```jsx
<PageSubHeader 
  showBreadcrumbs={true}
  showSearch={false}
  customActions={[
    { label: 'Custom Action', icon: Plus, variant: 'default', onClick: handleAction }
  ]}
  onSearch={handleSearch}
  onActionClick={handleActionClick}
/>
```

### 3. SmartBusinessNavigation.jsx
**Enhanced with new features**

New props:
- `enhanced={true}` - Enables ServiceTitan-style features
- Improved dropdown navigation
- Better icon integration
- Dynamic module loading

## Navigation Structure

### Industry-Specific Navigation
```
Dashboard > Field Service > Schedule > New Job
Dashboard > Restaurant > Kitchen > Orders
```

### Shared Tools Navigation
```
Dashboard > Shared Tools > Inventory > Stock List
Dashboard > Shared Tools > Analytics > Reports
```

## Page-Specific Actions

The sub-header automatically provides contextual actions based on the current page:

### Module Pages (Main)
- **Schedule**: "New Job" button
- **Customers**: "Add Customer" button  
- **Estimates**: "Create Estimate" button
- **Invoices**: "Create Invoice" button
- **Inventory**: "Add Item" + "Import" buttons
- **Menu**: "Add Item" button
- **Reservations**: "New Reservation" button

### List Pages
- Filter button
- Export button
- Search functionality

### Create/Edit Pages
- Save Draft button
- Save & Send button

### Detail/View Pages
- Edit button
- Share button
- Print button (via overflow menu)

## Icon System

### Industry Icons
- **Field Service**: `Wrench`
- **Restaurant**: `Utensils`
- **Shared Tools**: `Settings`

### Module Icons
- **Schedule**: `Calendar`
- **Customers**: `Users`
- **Estimates**: `FileText`
- **Invoices**: `Receipt`
- **Inventory**: `Package`
- **Communication**: `MessageSquare`
- **Analytics**: `BarChart3`
- **Marketing**: `TrendingUp`
- **Accounting**: `Calculator`

### Action Icons
- **Create/Add**: `Plus`
- **Filter**: `Filter`
- **Export**: `Download`
- **Import**: `Upload`
- **Edit**: `Edit`
- **Share**: `Share`
- **Search**: `Search`
- **Settings**: `Settings`
- **Help**: `HelpCircle`

## Responsive Design

### Desktop (≥1024px)
- Full navigation with all modules visible
- Sub-header with all actions
- Breadcrumbs with icons

### Tablet (768px - 1023px)
- Condensed navigation
- Essential actions in sub-header
- Simplified breadcrumbs

### Mobile (≤767px)
- Hamburger menu
- Essential actions only
- Minimal breadcrumbs

## Customization

### Adding New Modules
1. Update `BUSINESS_MODULES` in `industry-presets.js`
2. Add to appropriate industry preset
3. Define subnav items and actions
4. Add icon mapping

### Adding New Actions
1. Update `getPageActions()` in `PageSubHeader.jsx`
2. Add icon and handler
3. Define action conditions

### Styling
- Uses Tailwind CSS classes
- Follows design system tokens
- Dark/light mode support
- Consistent spacing and typography

## Accessibility

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space activation
- Escape to close dropdowns
- ⌘K for global search

### Screen Readers
- Proper ARIA labels
- Semantic HTML structure
- Focus management
- Descriptive button text

### Visual Indicators
- Clear focus states
- High contrast colors
- Icon + text labels
- Loading states

## Performance

### Optimizations
- Lazy loading of dropdown content
- Memoized navigation calculations
- Efficient re-renders
- Minimal bundle impact

### Bundle Size
- Tree-shakeable components
- Optimized icon imports
- Minimal dependencies

## Integration

### With Existing Systems
- Works with current auth system
- Integrates with command palette
- Supports existing routing
- Maintains backward compatibility

### Data Requirements
- User role and permissions
- Business type and settings
- Module availability
- Usage analytics (optional)

## Future Enhancements

### Planned Features
- AI-powered navigation suggestions
- Usage-based module ordering
- Custom action shortcuts
- Advanced search filters
- Notification integration
- Multi-language support

### Extensibility
- Plugin system for custom modules
- Theme customization
- Custom action types
- Advanced breadcrumb logic

## Troubleshooting

### Common Issues
1. **Icons not showing**: Check Lucide React imports
2. **Actions not working**: Verify onClick handlers
3. **Breadcrumbs incorrect**: Check path analysis logic
4. **Responsive issues**: Test breakpoint styles

### Debug Mode
Enable debug logging by setting `DEBUG_NAVIGATION=true` in environment variables.

## Examples

### Basic Implementation
```jsx
import { EnhancedBusinessHeader, PageSubHeader } from '@components/navigation';

function Layout({ children }) {
  return (
    <div>
      <EnhancedBusinessHeader 
        userId={user.id}
        userRole={user.role}
        businessId={business.id}
      />
      <PageSubHeader showBreadcrumbs={true} />
      <main>{children}</main>
    </div>
  );
}
```

### Custom Actions
```jsx
const customActions = [
  {
    label: 'Bulk Import',
    icon: Upload,
    variant: 'outline',
    onClick: () => openImportDialog()
  },
  {
    label: 'Generate Report',
    icon: BarChart3,
    variant: 'default',
    onClick: () => generateReport()
  }
];

<PageSubHeader 
  customActions={customActions}
  onActionClick={handleCustomAction}
/>
```

This enhanced navigation system provides a professional, intuitive, and highly functional interface that scales with your business needs while maintaining excellent user experience across all device types.
