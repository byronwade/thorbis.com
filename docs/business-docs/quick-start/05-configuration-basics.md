# Configuration Basics

This guide covers the essential system configurations needed to get your Thorbis Business OS installation ready for daily operations.

## System Settings Overview

### Configuration Hierarchy
Thorbis Business OS uses a hierarchical configuration system:
```
Global Settings (Platform-wide)
├── Organization Settings (Your business)
│   ├── Industry Settings (Industry-specific)
│   ├── Location Settings (Multi-location businesses)
│   ├── Department Settings (Operational units)
│   └── User Settings (Individual preferences)
```

### Access Levels
Different configuration areas require different permission levels:
- **Global Settings**: Platform administrators only
- **Organization Settings**: Business owners and managers
- **Department Settings**: Department managers
- **User Settings**: All users for personal preferences

## Essential Configuration Areas

### 1. Business Information

#### Organization Profile
Navigate to **Settings** > **Organization** > **Profile**

**Basic Information**:
```
Business Name: [Your registered business name]
Legal Name: [If different from business name]
Tax ID/EIN: [Federal tax identification number]
Business Type: [Corporation, LLC, Partnership, Sole Proprietorship]
Industry: [Selected during setup, can be changed here]
Founded Date: [Business establishment date]
```

**Contact Information**:
```
Primary Address: [Main business location]
Mailing Address: [If different from primary]
Phone: [Main business phone number]
Fax: [If applicable]
Email: [Primary business email]
Website: [Business website URL]
```

**Business Hours**:
Configure your standard operating hours:
```
Monday:    8:00 AM - 6:00 PM
Tuesday:   8:00 AM - 6:00 PM
Wednesday: 8:00 AM - 6:00 PM
Thursday:  8:00 AM - 6:00 PM
Friday:    8:00 AM - 6:00 PM
Saturday:  9:00 AM - 4:00 PM
Sunday:    Closed

Holiday Schedule: [Configure holiday closures]
Special Hours: [Temporary hour changes]
```

#### Multi-Location Setup
For businesses with multiple locations:

1. **Add Locations**: Navigate to **Settings** > **Locations**
2. **Configure Each Location**:
   ```
   Location Name: Downtown Store
   Address: 123 Main St, City, State 12345
   Phone: (555) 123-4567
   Manager: John Smith
   Operating Hours: [Location-specific hours]
   Tax Rates: [Location-specific tax configuration]
   ```
3. **Set Location Permissions**: Control which users can access which locations

### 2. User Management and Permissions

#### User Roles Configuration
Navigate to **Settings** > **Users & Permissions** > **Roles**

**Default Role Hierarchy**:
```
Owner
├── Full system access
├── Billing and subscription management
├── User management
└── All configuration settings

Manager
├── Operational control
├── Staff management (limited)
├── Configuration settings (department-level)
└── All business data access

Staff
├── Daily operations
├── Assigned area access
├── Customer interaction
└── Basic reporting

Viewer
├── Read-only access
├── Reporting and analytics
├── No data modification
└── No system configuration
```

#### Permission Customization
Create custom roles by combining permissions:
- **Data Access**: Customer, Orders, Inventory, Financial
- **Operational**: Create, Edit, Delete, Export
- **Administrative**: User Management, Settings, Integrations
- **Financial**: Billing, Payments, Financial Reports

#### User Invitation Process
1. Navigate to **Settings** > **Users & Permissions** > **Users**
2. Click **"Invite User"**
3. Configure user details:
   ```
   Email: user@company.com
   Role: [Select from dropdown]
   Departments: [Select accessible departments]
   Locations: [Select accessible locations]
   Start Date: [When access begins]
   ```
4. Customize permissions if needed
5. Send invitation email

### 3. Financial Configuration

#### Currency and Tax Settings
Navigate to **Settings** > **Financial** > **General**

**Currency Configuration**:
```
Primary Currency: USD
Secondary Currencies: [For multi-currency businesses]
Exchange Rate Source: [Automatic/Manual updates]
Decimal Places: 2
Currency Symbol Position: Before amount ($100.00)
```

**Tax Configuration**:
```
Default Tax Rate: 8.5%
Tax Display: Exclusive (show tax separately)

Location-Specific Tax Rates:
├── Downtown Store: 8.5%
├── Suburban Location: 7.25%
└── Online Sales: Variable by customer location

Tax Categories:
├── Standard Rate: 8.5%
├── Reduced Rate: 3.0% (books, food)
├── Zero Rate: 0.0% (services)
└── Exempt: 0.0% (non-profit customers)
```

#### Payment Methods
Configure accepted payment methods:
```
Credit/Debit Cards:
├── Visa ✓
├── Mastercard ✓
├── American Express ✓
└── Discover ✓

Digital Payments:
├── Apple Pay ✓
├── Google Pay ✓
├── PayPal ✓
└── Stripe ✓

Traditional Methods:
├── Cash ✓
├── Check ✓
└── Bank Transfer ✓
```

#### Payment Terms
Set default payment terms:
```
Invoice Terms:
├── Due Immediately: 0 days
├── Net 15: 15 days
├── Net 30: 30 days
└── Custom: [Specify days]

Late Fees:
├── Grace Period: 5 days
├── Late Fee: $25 or 1.5% monthly
└── Collection Process: Automated reminders
```

### 4. Communication Settings

#### Email Configuration
Navigate to **Settings** > **Communications** > **Email**

**SMTP Settings** (for custom email):
```
SMTP Server: smtp.yourdomain.com
Port: 587
Security: STARTTLS
Username: [Your email username]
Password: [Your email password]
From Address: noreply@yourbusiness.com
From Name: [Your Business Name]
```

**Email Templates**:
Customize automated email templates:
- **Welcome Emails**: New customer welcome messages
- **Appointment Confirmations**: Service appointment details
- **Invoice Notifications**: Payment due reminders
- **Order Updates**: Status change notifications
- **Marketing Emails**: Promotional communications

#### SMS Configuration
Navigate to **Settings** > **Communications** > **SMS**

```
SMS Provider: [Twilio, AWS SNS, or integrated provider]
Phone Number: [Your business SMS number]
Message Templates:
├── Appointment Reminder: "Hi {customer}, your appointment is tomorrow at {time}"
├── Order Ready: "Your order #{order_number} is ready for pickup"
└── Payment Reminder: "Invoice #{invoice} is due in 3 days"
```

#### Notification Preferences
Configure when and how notifications are sent:
```
Email Notifications:
├── New Orders: Immediate
├── Payment Received: Daily Summary
├── Low Inventory: Weekly
└── System Updates: As Needed

SMS Notifications:
├── Urgent Issues: Immediate
├── Appointment Reminders: 1 day before
└── Status Updates: As they occur

Push Notifications:
├── Mobile App: Enabled
├── Browser: Enabled for critical alerts
└── Desktop: Enabled for managers
```

### 5. Industry-Specific Configuration

#### Home Services Configuration
**Service Types and Pricing**:
```
Service Categories:
├── Emergency Services
│   ├── Rate: $125/hour
│   ├── Minimum: 2 hours
│   └── Availability: 24/7
├── Standard Services
│   ├── Rate: $85/hour
│   ├── Minimum: 1 hour
│   └── Availability: Business hours
└── Installation Services
    ├── Rate: $95/hour
    ├── Minimum: 2 hours
    └── Availability: Business hours
```

**Service Areas**:
```
Primary Zone: 15-mile radius
├── Travel Fee: $0
├── Response Time: 1-2 hours
└── Service Level: Full services

Extended Zone: 25-mile radius
├── Travel Fee: $25
├── Response Time: 2-4 hours
└── Service Level: Limited emergency services
```

#### Restaurant Configuration
**Menu Structure**:
```
Menu Categories:
├── Appetizers ($6-15)
├── Entrees ($18-32)
├── Desserts ($8-12)
└── Beverages ($3-12)

Kitchen Stations:
├── Cold Prep: Salads, appetizers
├── Hot Line: Entrees, sides
├── Grill: Grilled items
└── Dessert: Desserts, coffee
```

**Table Management**:
```
Seating Configuration:
├── Tables 1-10: 2-person tables
├── Tables 11-20: 4-person tables
├── Tables 21-25: 6-person tables
└── Bar: 8 seats

Reservation Settings:
├── Advance Booking: 30 days
├── Minimum Party: 1 person
├── Maximum Party: 12 people
└── Time Slots: 30-minute intervals
```

### 6. Integration Settings

#### Payment Processing
Navigate to **Settings** > **Integrations** > **Payments**

**Stripe Configuration**:
```
Live Keys:
├── Publishable Key: pk_live_[your_key]
├── Secret Key: sk_live_[your_key]
└── Webhook Endpoint: [Auto-configured]

Test Keys:
├── Publishable Key: pk_test_[your_key]
├── Secret Key: sk_test_[your_key]
└── Webhook Endpoint: [Auto-configured]

Settings:
├── Capture Method: Automatic
├── Statement Descriptor: YOUR BUSINESS
└── Receipt Emails: Enabled
```

#### Accounting Integration
**QuickBooks Online**:
```
Connection Status: Connected
Sync Settings:
├── Customers: Bi-directional
├── Items/Services: From QuickBooks to Thorbis
├── Invoices: From Thorbis to QuickBooks
└── Payments: From Thorbis to QuickBooks

Sync Frequency: Every 4 hours
Last Sync: [Timestamp]
```

#### Communication Services
**Email Service (SendGrid)**:
```
API Key: [Your SendGrid API key]
Domain Authentication: Verified
Sender Reputation: Good
Monthly Quota: 100,000 emails
Usage This Month: 2,450 emails (2.45%)
```

### 7. Security Configuration

#### Two-Factor Authentication
Navigate to **Settings** > **Security** > **2FA**

**Organization 2FA Policy**:
```
Requirement Level: Required for all users
Allowed Methods:
├── Authenticator Apps (Google, Microsoft, Authy)
├── SMS Text Messages
└── Hardware Keys (YubiKey, etc.)

Grace Period: 7 days for new users
Backup Codes: 10 codes generated per user
Recovery Process: Admin can reset after identity verification
```

#### Session Management
```
Session Duration:
├── Regular Users: 8 hours
├── Elevated Privileges: 2 hours
└── Admin Actions: 30 minutes

Concurrent Sessions:
├── Maximum per user: 3 devices
├── Mobile App: Separate session limit
└── Auto-logout: After inactivity period

IP Restrictions:
├── Office Network: 192.168.1.0/24 (Always allowed)
├── VPN Access: Required for remote connections
└── Unknown IPs: Challenge with 2FA
```

## Validation and Testing

### Configuration Checklist
Before going live, verify these configurations:

**Basic Settings**:
- [ ] Business information complete and accurate
- [ ] Operating hours configured correctly
- [ ] Tax rates set up for all locations
- [ ] Payment methods enabled and tested
- [ ] User roles and permissions configured

**Communication Settings**:
- [ ] Email templates customized and tested
- [ ] SMS notifications configured (if used)
- [ ] Notification preferences set appropriately
- [ ] Contact information updated in all templates

**Integration Settings**:
- [ ] Payment processing tested with small transaction
- [ ] Accounting integration syncing properly
- [ ] Email delivery working correctly
- [ ] All API keys and connections active

**Security Settings**:
- [ ] Two-factor authentication enabled
- [ ] User access tested for each role
- [ ] Session timeouts appropriate for business
- [ ] Backup and recovery procedures in place

### Testing Procedures

#### End-to-End Testing
1. **Create Test Transaction**:
   - Add test customer
   - Create sample order/work order
   - Process payment
   - Verify all integrations triggered correctly

2. **User Access Testing**:
   - Test each user role's access
   - Verify permissions work as expected
   - Confirm restricted areas are inaccessible

3. **Communication Testing**:
   - Send test emails from each template
   - Verify SMS delivery (if enabled)
   - Check notification preferences

4. **Backup Testing**:
   - Verify automated backups are working
   - Test data export functionality
   - Confirm restore procedures

## Next Steps

After completing basic configuration:

1. **[Sample Data Setup](./06-sample-data-setup.md)**: Load demonstration data for testing
2. **[User Onboarding](./07-user-onboarding.md)**: Add and train your team members
3. **[Integration Quick Start](./08-integration-quickstart.md)**: Set up essential third-party integrations

## Configuration Support

### Getting Help
- **Configuration Wizard**: Guided setup for complex configurations
- **Video Tutorials**: Step-by-step configuration videos
- **Live Chat Support**: Real-time assistance during setup
- **Professional Services**: Paid configuration assistance
- **Community Forum**: Peer advice and configuration tips

### Best Practices
- **Start Simple**: Configure basic settings first, add complexity later
- **Test Thoroughly**: Always test configurations before going live
- **Document Changes**: Keep track of configuration modifications
- **Regular Review**: Review settings quarterly for optimization
- **Backup Configurations**: Export configuration settings regularly

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Industry Selection](./04-industry-selection.md) | Next: [Sample Data Setup](./06-sample-data-setup.md)*