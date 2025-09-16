# Sample Data Setup Guide

This guide helps you load demonstration data into your Thorbis Business OS installation, allowing you to explore features, test workflows, and train your team before entering real business data.

## Why Use Sample Data?

### Benefits of Sample Data
- **Feature Exploration**: Test all platform features safely
- **Workflow Understanding**: See how business processes flow
- **Team Training**: Train staff without affecting real data
- **Configuration Testing**: Validate settings and configurations
- **Performance Baseline**: Understand system performance expectations
- **Demo Preparation**: Prepare demonstrations for stakeholders

### Sample Data Types
Thorbis Business OS provides comprehensive sample datasets:
- **Customer Records**: Realistic customer profiles and contact information
- **Service/Product Data**: Industry-appropriate offerings and pricing
- **Transaction History**: Historical orders, invoices, and payments
- **Staff Records**: Employee profiles with appropriate permissions
- **Inventory Data**: Stock levels and product information
- **Financial Records**: Revenue, expenses, and financial metrics

## Pre-Installation Checklist

### System Requirements
Before loading sample data:
- [ ] Complete basic system configuration
- [ ] Configure your primary industry settings
- [ ] Set up user roles and permissions
- [ ] Configure basic integrations (payment, email)
- [ ] Verify database connectivity and performance

### Data Backup
**Important**: Even though you're adding sample data, create a backup first:
```bash
# Create backup before sample data installation
pnpm db:backup --name "pre-sample-data-backup"

# Or via web interface:
# Settings > Data Management > Create Backup
```

### Clean Installation Verification
Ensure you're starting with a clean configuration:
- No existing customer data (beyond test records)
- No active integrations that might conflict
- No scheduled automated processes that could interfere

## Sample Data Installation

### Method 1: Automated Installation (Recommended)

#### Web Interface Installation
1. **Navigate to Sample Data**: Go to **Settings** > **Data Management** > **Sample Data**

2. **Select Industry Dataset**:
   ```
   Available Sample Datasets:
   ├── Home Services Complete Package
   ├── Restaurant Full Operations
   ├── Automotive Service Center
   ├── Retail Store Chain
   └── Multi-Industry Demo (Limited features from each)
   ```

3. **Choose Installation Options**:
   ```
   Dataset Size:
   ├── Small: 50 customers, 200 transactions (Quick setup)
   ├── Medium: 200 customers, 1000 transactions (Recommended)
   └── Large: 1000 customers, 5000 transactions (Comprehensive testing)

   Time Period:
   ├── Last 3 months: Recent data only
   ├── Last 12 months: Full year of data (Recommended)
   └── Last 24 months: Extended historical data

   Include Options:
   ├── ☑ Customer records with contact information
   ├── ☑ Historical transactions and invoices
   ├── ☑ Staff records and permissions
   ├── ☑ Inventory/parts data
   ├── ☑ Financial metrics and reports
   └── ☐ Integration test data (optional)
   ```

4. **Review and Install**:
   - Review the data summary
   - Confirm installation
   - Monitor installation progress
   - Verify successful completion

#### Command Line Installation
```bash
# Navigate to project directory
cd /path/to/thorbis-business-os

# Install sample data for specific industry
pnpm db:seed --industry=home-services --size=medium --period=12months

# Or use interactive mode
pnpm db:seed --interactive

# Verify installation
pnpm db:verify-sample-data
```

### Method 2: Manual Dataset Import

#### Download Sample Datasets
```bash
# Download sample data packages
curl -O https://samples.thorbis.com/home-services-medium.zip
unzip home-services-medium.zip

# Or download via web interface:
# Settings > Data Management > Download Sample Data
```

#### Import Process
1. **Navigate to Data Import**: **Settings** > **Data Management** > **Import Data**

2. **Select File Type**:
   - CSV files (individual data types)
   - JSON files (complete datasets)
   - SQL dump files (database restore)

3. **Map Fields**: Match sample data fields to your configuration

4. **Preview and Import**: Review data preview before final import

### Method 3: Custom Sample Data Generation

#### Generate Custom Dataset
For specific testing needs, generate custom sample data:

```bash
# Generate custom sample data
pnpm generate:sample-data --config=custom-config.json

# Example custom configuration:
{
  "customers": 150,
  "timeRange": "6months",
  "industry": "home-services",
  "includeImages": true,
  "languages": ["en", "es"],
  "locations": ["downtown", "suburban"],
  "complexity": "medium"
}
```

## Industry-Specific Sample Data

### Home Services Sample Data

#### Customer Profiles
```
Residential Customers:
├── John & Mary Johnson (123 Main St)
│   ├── Property: Single-family home, built 1995
│   ├── Services: Annual HVAC maintenance, plumbing repairs
│   └── History: 8 service calls over 2 years

├── Robert Chen (456 Oak Ave)
│   ├── Property: Townhouse, built 2010
│   ├── Services: Electrical upgrades, appliance installation
│   └── History: 5 service calls, high-value customer

└── Sarah Williams (789 Pine St)
    ├── Property: Apartment building (landlord)
    ├── Services: Multiple unit maintenance
    └── History: Regular monthly service contracts

Commercial Customers:
├── Downtown Office Complex
├── Retail Shopping Center
└── Manufacturing Facility
```

#### Work Orders and History
```
Sample Work Orders:
├── Emergency plumbing repair (completed)
├── HVAC system installation (in progress)
├── Electrical safety inspection (scheduled)
├── Appliance warranty repair (quoted)
└── Preventive maintenance visit (recurring)

Service History Timeline:
├── 2024: 45 completed jobs, $87,500 revenue
├── 2023: 38 completed jobs, $72,000 revenue
└── Growth metrics and seasonal patterns
```

#### Inventory and Parts
```
Common Parts Inventory:
├── Plumbing: Pipes, fittings, fixtures
├── Electrical: Wires, outlets, breakers
├── HVAC: Filters, thermostats, belts
└── Tools: Diagnostic equipment, hand tools

Stock Levels:
├── High-turnover items: Well-stocked
├── Seasonal items: Variable quantities
├── Emergency supplies: Minimum safety stock
└── Special order items: Zero stock, supplier integration
```

### Restaurant Sample Data

#### Menu and Inventory
```
Sample Menu Structure:
Appetizers:
├── Caesar Salad ($12.95)
├── Buffalo Wings ($10.95)
└── Spinach Artichoke Dip ($9.95)

Entrees:
├── Grilled Salmon ($24.95)
├── Ribeye Steak ($32.95)
├── Chicken Parmesan ($18.95)
└── Vegetarian Pasta ($16.95)

Beverages:
├── House Wine ($8-12/glass)
├── Craft Beer ($5-7)
├── Specialty Cocktails ($12-15)
└── Non-alcoholic ($3-5)

Inventory Items:
├── Fresh ingredients with expiration tracking
├── Alcohol with licensing and age verification
├── Dry goods with supplier information
└── Kitchen supplies and equipment
```

#### Order History and Customer Data
```
Customer Types:
├── Regular Diners: Frequent visitors with preferences
├── Special Occasion: Birthday, anniversary celebrations
├── Business Clients: Corporate lunches and events
└── Tourists: One-time visits, varied preferences

Order Patterns:
├── Peak Hours: 12-1 PM (lunch), 6-8 PM (dinner)
├── Seasonal Variations: Summer patio, winter comfort food
├── Day of Week: Weekend vs. weekday patterns
└── Special Events: Holiday menus, catering orders
```

### Automotive Sample Data

#### Customer Vehicles and Service History
```
Vehicle Fleet:
├── 2019 Honda Accord (Sarah Johnson)
│   ├── Service History: Oil changes, brake pads, inspection
│   ├── Upcoming: 60K mile service
│   └── Warranty: Powertrain until 2029

├── 2015 Ford F-150 (Mike's Construction)
│   ├── Service History: Heavy-duty maintenance, repairs
│   ├── Fleet Account: Volume discount pricing
│   └── Service Plan: Monthly maintenance agreement

└── 2021 Tesla Model 3 (Tech Startup)
    ├── Service History: Software updates, tire rotation
    ├── Specialty: Electric vehicle certified technician
    └── Parts: Direct from Tesla, longer lead times
```

#### Service Types and Pricing
```
Service Menu:
Basic Maintenance:
├── Oil Change: $35-65 (depending on oil type)
├── Tire Rotation: $25
├── Multi-point Inspection: $50
└── Air Filter Replacement: $30

Major Services:
├── Brake Service: $200-800 (depending on work needed)
├── Transmission Service: $150-400
├── Engine Diagnostics: $120/hour
└── A/C Service: $100-300

Specialty Services:
├── Hybrid/Electric Vehicle: Premium rates
├── Diesel Engine: Specialized equipment required
├── Performance Modifications: Custom pricing
└── Fleet Services: Volume discounts
```

### Retail Sample Data

#### Product Catalog
```
Electronics Department:
├── Smartphones
│   ├── iPhone 15 Pro ($999-1199)
│   ├── Samsung Galaxy S24 ($799-999)
│   └── Google Pixel 8 ($699-899)

├── Computers
│   ├── MacBook Air ($1099-1499)
│   ├── Dell XPS 13 ($899-1299)
│   └── Gaming Laptops ($1200-2500)

└── Accessories
    ├── Cases and Screen Protectors ($15-75)
    ├── Chargers and Cables ($20-50)
    └── Headphones and Speakers ($50-400)

Inventory Levels:
├── Fast-moving items: High stock levels
├── Seasonal products: Variable based on time of year
├── High-value items: Lower quantities, security measures
└── Clearance items: Limited stock, discount pricing
```

#### Customer Purchase Patterns
```
Customer Segments:
├── Tech Enthusiasts: Early adopters, premium products
├── Budget Conscious: Value seekers, promotional buyers
├── Business Customers: Bulk purchases, B2B pricing
└── Casual Users: Basic needs, staff assistance required

Purchase Behavior:
├── Average Order Value: $150-200
├── Repeat Customers: 35% of total sales
├── Seasonal Peaks: Back-to-school, holidays
└── Payment Methods: 60% card, 25% digital, 15% cash
```

## Data Exploration and Training

### Initial Data Review

#### Dashboard Overview
After sample data installation:
1. **Review Dashboard Metrics**: Understand key performance indicators
2. **Explore Navigation**: Familiarize yourself with data organization
3. **Check Data Quality**: Verify sample data looks realistic and complete
4. **Test Search Functions**: Use search to find specific records

#### Industry-Specific Exploration

**Home Services Walkthrough**:
1. **Work Orders**: Review pending, in-progress, and completed jobs
2. **Customer Management**: Explore customer profiles and service history
3. **Scheduling**: See how appointments are organized and managed
4. **Invoicing**: Review billing processes and payment tracking

**Restaurant Walkthrough**:
1. **Menu Management**: Explore menu items and pricing
2. **Order Processing**: See how orders flow through the system
3. **Inventory**: Review ingredient tracking and supplier management
4. **Table Management**: Understand reservation and seating systems

### Training Scenarios

#### Scenario-Based Learning
Use sample data to practice common business scenarios:

**New Customer Onboarding**:
1. Find an existing customer in the sample data
2. Review their profile and service history
3. Practice adding notes and updating information
4. Create a new service appointment

**Order Processing**:
1. Process a new order using sample products/services
2. Follow the order through completion
3. Generate and send invoice
4. Record payment and close transaction

**Inventory Management**:
1. Review current inventory levels
2. Practice reordering supplies
3. Receive shipment and update stock
4. Generate inventory reports

### Team Training Activities

#### Role-Based Training
Assign team members to practice with sample data based on their roles:

**Managers**:
- Review performance dashboards
- Practice staff scheduling
- Generate financial reports
- Configure system settings

**Staff**:
- Process customer orders/service requests
- Update job/order status
- Handle customer communications
- Use mobile applications (if applicable)

**Administrative**:
- Manage customer database
- Process invoices and payments
- Handle support inquiries
- Maintain system data quality

## Data Cleanup and Reset

### Cleaning Sample Data

#### Selective Cleanup
Remove only specific types of sample data:
```bash
# Remove sample customers but keep configuration
pnpm db:cleanup --type=customers --sample-only

# Remove sample transactions
pnpm db:cleanup --type=transactions --sample-only

# Remove all sample data but keep system configuration
pnpm db:cleanup --sample-data-only
```

#### Web Interface Cleanup
1. Navigate to **Settings** > **Data Management** > **Sample Data**
2. Select **"Remove Sample Data"**
3. Choose what to remove:
   ```
   Remove Options:
   ├── ☑ Sample customers (keeps real customers)
   ├── ☑ Sample transactions (keeps real transactions)
   ├── ☐ Sample staff records (keep if using for training)
   ├── ☑ Sample inventory (keeps real inventory)
   └── ☐ System configuration (usually keep)
   ```
4. Confirm removal and monitor progress

### Complete Reset
For a fresh start after training:
```bash
# Complete database reset (removes ALL data)
pnpm db:reset --confirm

# Restore from backup made before sample data
pnpm db:restore --backup="pre-sample-data-backup"
```

## Transitioning to Live Data

### Migration Strategy

#### Gradual Transition
Recommended approach for most businesses:
1. **Keep sample data initially** for reference and training
2. **Start adding real data** alongside sample data
3. **Clearly mark or categorize** sample vs. real data
4. **Remove sample data** once comfortable with live operations

#### Clean Start
For businesses preferring a clean slate:
1. **Complete training** with sample data
2. **Document all configurations** and customizations
3. **Remove all sample data** cleanly
4. **Import real data** or start fresh with live operations

#### Hybrid Approach
For businesses wanting to keep some sample data:
1. **Keep sample data** in separate test environment
2. **Start fresh** in production environment
3. **Use sample environment** for ongoing training and testing
4. **Synchronize configurations** between environments

### Data Validation

#### Quality Checks
Before going live with real data:
- [ ] Verify all integrations work correctly
- [ ] Test payment processing thoroughly
- [ ] Confirm email/SMS notifications are working
- [ ] Validate reporting and analytics functions
- [ ] Check user permissions and access controls

#### Performance Testing
With sample data loaded:
- Monitor system performance under load
- Test search and filtering functions
- Verify backup and restore procedures
- Check mobile app functionality
- Test offline capabilities (if applicable)

## Next Steps

After setting up and exploring sample data:

1. **[User Onboarding](./07-user-onboarding.md)**: Train your team using the sample data
2. **[Integration Quick Start](./08-integration-quickstart.md)**: Set up essential third-party integrations
3. **[Troubleshooting](./09-troubleshooting.md)**: Learn how to diagnose and resolve common issues

## Sample Data Support

### Additional Resources
- **Sample Data Gallery**: Browse additional sample datasets
- **Custom Data Generation**: Request custom sample data for specific needs
- **Training Videos**: Guided tours using sample data
- **Best Practices**: Tips for effective sample data usage
- **Community Examples**: Sample data shared by other users

### Getting Help
- **Live Chat Support**: Real-time assistance with sample data issues
- **Documentation**: Detailed guides for each industry's sample data
- **Video Tutorials**: Step-by-step sample data exploration
- **Community Forum**: Share experiences and tips with other users

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Configuration Basics](./05-configuration-basics.md) | Next: [User Onboarding](./07-user-onboarding.md)*