# Restaurant Implementation Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Restaurant Operations Team  
> **Review Schedule**: Quarterly  

## Overview

This comprehensive implementation guide provides step-by-step instructions for setting up and configuring the Thorbis Business OS platform specifically for restaurant operations. It covers everything from initial setup to advanced configurations, ensuring optimal performance for point-of-sale operations, kitchen management, and customer service delivery.

## Pre-Implementation Planning

### Restaurant Assessment
```typescript
interface RestaurantAssessment {
  operationType: {
    fullService: 'Traditional dine-in with table service',
    quickService: 'Fast-casual or quick-service restaurant',
    fastCasual: 'Counter service with higher-quality offerings',
    fineDining: 'Upscale restaurant with premium service',
    delivery: 'Delivery-only or ghost kitchen operations',
    catering: 'Catering and event-focused operations'
  },
  
  serviceModel: {
    tableService: 'Traditional waiter/waitress table service',
    counterService: 'Customer orders at counter',
    selfService: 'Self-service kiosks or mobile ordering',
    hybridService: 'Combination of multiple service models',
    deliveryOnly: 'Third-party delivery integration focus'
  },
  
  operationalScope: {
    locations: 'Single location or multi-location chain',
    seatingCapacity: 'Number of seats and table configurations',
    kitchenSetup: 'Kitchen size and equipment configuration',
    staffSize: 'Front of house and back of house staff counts',
    operatingHours: 'Daily operating hours and seasonal variations'
  },
  
  currentSystems: {
    posSystem: 'Existing point-of-sale system',
    kitchenDisplay: 'Kitchen display system or ticket printing',
    inventoryManagement: 'Current inventory tracking system',
    payroll: 'Staff scheduling and payroll system',
    accounting: 'Current accounting and bookkeeping solution'
  }
}
```

### Technical Requirements
```typescript
interface RestaurantTechnicalRequirements {
  hardwareNeeds: {
    posTerminals: 'Number and placement of POS terminals',
    kitchenDisplays: 'Kitchen display screens for order management',
    printers: 'Receipt printers, kitchen ticket printers',
    paymentTerminals: 'Credit card terminals and contactless payment',
    tablets: 'Server tablets for tableside ordering and payment',
    networking: 'Reliable internet and local network infrastructure'
  },
  
  softwareIntegrations: {
    paymentProcessing: 'Credit card processing and payment gateways',
    deliveryPlatforms: 'UberEats, DoorDash, Grubhub integrations',
    inventorySuppliers: 'Food distributor and supplier integrations',
    accounting: 'QuickBooks, Sage, or similar accounting software',
    reservations: 'Table reservation and waitlist management',
    loyalty: 'Customer loyalty and rewards programs'
  },
  
  complianceRequirements: {
    foodSafety: 'Local health department regulations',
    alcohol: 'Liquor license and age verification systems',
    labor: 'Wage and hour compliance tracking',
    accessibility: 'ADA compliance for physical and digital systems',
    dataProtection: 'PCI DSS compliance for payment processing'
  }
}
```

## Phase 1: Initial Setup (Week 1)

### System Configuration
```bash
#!/bin/bash
# Restaurant Initial Configuration Script

setup_restaurant_instance() {
  echo "=== RESTAURANT SETUP ==="
  
  # Configure business profile for restaurant
  configure_restaurant_profile() {
    echo "Configuring restaurant business profile..."
    
    # Set restaurant-specific settings
    supabase exec sql --query "
      UPDATE businesses 
      SET 
        industry = 'restaurant',
        settings = jsonb_build_object(
          'operation_type', 'full_service',
          'service_model', 'table_service',
          'seating_capacity', 80,
          'table_count', 20,
          'kitchen_stations', ARRAY['grill', 'salad', 'fry', 'dessert'],
          'operating_hours', jsonb_build_object(
            'monday', jsonb_build_object('open', '11:00', 'close', '22:00'),
            'tuesday', jsonb_build_object('open', '11:00', 'close', '22:00'),
            'wednesday', jsonb_build_object('open', '11:00', 'close', '22:00'),
            'thursday', jsonb_build_object('open', '11:00', 'close', '22:00'),
            'friday', jsonb_build_object('open', '11:00', 'close', '23:00'),
            'saturday', jsonb_build_object('open', '10:00', 'close', '23:00'),
            'sunday', jsonb_build_object('open', '10:00', 'close', '21:00')
          ),
          'payment_methods', ARRAY['cash', 'card', 'mobile_payment'],
          'tax_rates', jsonb_build_object(
            'food_tax', 8.75,
            'alcohol_tax', 10.25,
            'service_charge', 0.00
          ),
          'tipping', jsonb_build_object(
            'enabled', true,
            'suggested_percentages', ARRAY[18, 20, 22, 25],
            'default_percentage', 20
          )
        ),
        updated_at = NOW()
      WHERE id = '$BUSINESS_ID';
    "
  }
  
  # Create restaurant-specific table structure
  setup_restaurant_tables() {
    echo "Setting up restaurant table configuration..."
    
    supabase exec sql --query "
      INSERT INTO restaurant_tables (business_id, table_number, seating_capacity, location_section, status, created_at) VALUES
      ('$BUSINESS_ID', '1', 4, 'Main Dining', 'available', NOW()),
      ('$BUSINESS_ID', '2', 4, 'Main Dining', 'available', NOW()),
      ('$BUSINESS_ID', '3', 2, 'Main Dining', 'available', NOW()),
      ('$BUSINESS_ID', '4', 6, 'Main Dining', 'available', NOW()),
      ('$BUSINESS_ID', '5', 4, 'Main Dining', 'available', NOW()),
      ('$BUSINESS_ID', '6', 8, 'Private Dining', 'available', NOW()),
      ('$BUSINESS_ID', '7', 2, 'Bar Area', 'available', NOW()),
      ('$BUSINESS_ID', '8', 2, 'Bar Area', 'available', NOW()),
      ('$BUSINESS_ID', '9', 4, 'Patio', 'available', NOW()),
      ('$BUSINESS_ID', '10', 6, 'Patio', 'available', NOW()),
      ('$BUSINESS_ID', '11', 4, 'Window Seating', 'available', NOW()),
      ('$BUSINESS_ID', '12', 4, 'Window Seating', 'available', NOW()),
      ('$BUSINESS_ID', '13', 2, 'Counter', 'available', NOW()),
      ('$BUSINESS_ID', '14', 2, 'Counter', 'available', NOW()),
      ('$BUSINESS_ID', '15', 4, 'Main Dining', 'available', NOW())
      ON CONFLICT (business_id, table_number) DO NOTHING;
    "
  }
  
  # Configure menu categories and structure
  setup_menu_structure() {
    echo "Setting up menu structure and categories..."
    
    supabase exec sql --query "
      INSERT INTO menu_categories (business_id, name, description, sort_order, is_active, created_at) VALUES
      ('$BUSINESS_ID', 'Appetizers', 'Starters and small plates', 1, true, NOW()),
      ('$BUSINESS_ID', 'Salads', 'Fresh salads and healthy options', 2, true, NOW()),
      ('$BUSINESS_ID', 'Soups', 'Daily soups and bisques', 3, true, NOW()),
      ('$BUSINESS_ID', 'Entrees', 'Main course selections', 4, true, NOW()),
      ('$BUSINESS_ID', 'Pasta', 'Pasta dishes and Italian specialties', 5, true, NOW()),
      ('$BUSINESS_ID', 'Seafood', 'Fresh fish and seafood selections', 6, true, NOW()),
      ('$BUSINESS_ID', 'Steaks & Chops', 'Premium cuts and grilled meats', 7, true, NOW()),
      ('$BUSINESS_ID', 'Desserts', 'Sweet endings and specialty desserts', 8, true, NOW()),
      ('$BUSINESS_ID', 'Beverages', 'Non-alcoholic beverages', 9, true, NOW()),
      ('$BUSINESS_ID', 'Wine', 'Wine selection by glass and bottle', 10, true, NOW()),
      ('$BUSINESS_ID', 'Beer', 'Draft and bottled beer selection', 11, true, NOW()),
      ('$BUSINESS_ID', 'Cocktails', 'Signature cocktails and mixed drinks', 12, true, NOW()),
      ('$BUSINESS_ID', 'Kids Menu', 'Children\''s menu options', 13, true, NOW())
      ON CONFLICT (business_id, name) DO NOTHING;
    "
  }
  
  # Configure staff roles and permissions
  setup_restaurant_roles() {
    echo "Setting up restaurant staff roles and permissions..."
    
    supabase exec sql --query "
      INSERT INTO user_roles (business_id, name, permissions, created_at) VALUES
      ('$BUSINESS_ID', 'Server', jsonb_build_object(
        'orders', jsonb_build_object('read', true, 'create', true, 'update', true, 'delete', false),
        'tables', jsonb_build_object('read', true, 'update', true, 'create', false, 'delete', false),
        'customers', jsonb_build_object('read', true, 'update', false, 'create', true, 'delete', false),
        'payments', jsonb_build_object('read', true, 'create', true, 'update', false, 'delete', false),
        'menu', jsonb_build_object('read', true, 'update', false, 'create', false, 'delete', false),
        'reports', jsonb_build_object('read', false, 'update', false, 'create', false, 'delete', false)
      ), NOW()),
      ('$BUSINESS_ID', 'Bartender', jsonb_build_object(
        'orders', jsonb_build_object('read', true, 'create', true, 'update', true, 'delete', false),
        'inventory', jsonb_build_object('read', true, 'update', true, 'create', false, 'delete', false),
        'customers', jsonb_build_object('read', true, 'update', false, 'create', true, 'delete', false),
        'payments', jsonb_build_object('read', true, 'create', true, 'update', false, 'delete', false),
        'alcohol_verification', jsonb_build_object('read', true, 'create', true, 'update', true, 'delete', false)
      ), NOW()),
      ('$BUSINESS_ID', 'Kitchen Staff', jsonb_build_object(
        'orders', jsonb_build_object('read', true, 'create', false, 'update', true, 'delete', false),
        'inventory', jsonb_build_object('read', true, 'update', true, 'create', false, 'delete', false),
        'recipes', jsonb_build_object('read', true, 'update', false, 'create', false, 'delete', false),
        'kitchen_display', jsonb_build_object('read', true, 'update', true, 'create', false, 'delete', false)
      ), NOW()),
      ('$BUSINESS_ID', 'Host', jsonb_build_object(
        'reservations', jsonb_build_object('read', true, 'create', true, 'update', true, 'delete', false),
        'tables', jsonb_build_object('read', true, 'update', true, 'create', false, 'delete', false),
        'waitlist', jsonb_build_object('read', true, 'create', true, 'update', true, 'delete', false),
        'customers', jsonb_build_object('read', true, 'update', false, 'create', true, 'delete', false)
      ), NOW()),
      ('$BUSINESS_ID', 'Manager', jsonb_build_object(
        'orders', jsonb_build_object('read', true, 'create', true, 'update', true, 'delete', true),
        'tables', jsonb_build_object('read', true, 'update', true, 'create', true, 'delete', true),
        'menu', jsonb_build_object('read', true, 'update', true, 'create', true, 'delete', true),
        'inventory', jsonb_build_object('read', true, 'update', true, 'create', true, 'delete', true),
        'staff', jsonb_build_object('read', true, 'update', true, 'create', true, 'delete', false),
        'reports', jsonb_build_object('read', true, 'update', false, 'create', false, 'delete', false),
        'settings', jsonb_build_object('read', true, 'update', true, 'create', false, 'delete', false)
      ), NOW())
      ON CONFLICT (business_id, name) DO NOTHING;
    "
  }
  
  # Configure kitchen stations
  setup_kitchen_stations() {
    echo "Setting up kitchen stations and workflow..."
    
    supabase exec sql --query "
      INSERT INTO kitchen_stations (business_id, name, description, station_type, sort_order, is_active, created_at) VALUES
      ('$BUSINESS_ID', 'Cold Station', 'Salads, appetizers, and cold preparations', 'cold', 1, true, NOW()),
      ('$BUSINESS_ID', 'Grill Station', 'Grilled meats, steaks, and charred items', 'hot', 2, true, NOW()),
      ('$BUSINESS_ID', 'Saute Station', 'Pan-fried items and sauce preparations', 'hot', 3, true, NOW()),
      ('$BUSINESS_ID', 'Fry Station', 'Deep-fried appetizers and sides', 'hot', 4, true, NOW()),
      ('$BUSINESS_ID', 'Pasta Station', 'Pasta dishes and Italian preparations', 'hot', 5, true, NOW()),
      ('$BUSINESS_ID', 'Dessert Station', 'Dessert plating and final preparations', 'cold', 6, true, NOW()),
      ('$BUSINESS_ID', 'Expediting', 'Final plating and quality control', 'expo', 7, true, NOW())
      ON CONFLICT (business_id, name) DO NOTHING;
    "
  }
  
  # Run all setup functions
  configure_restaurant_profile
  setup_restaurant_tables
  setup_menu_structure
  setup_restaurant_roles
  setup_kitchen_stations
  
  echo "✅ Restaurant initial setup completed"
}
```

### Hardware Setup and Configuration
```typescript
interface RestaurantHardwareSetup {
  posTerminals: {
    frontOfHouse: {
      serverStations: 'iPad or tablet-based POS systems for servers',
      hostStand: 'Fixed terminal for reservation and seating management',
      barStation: 'Dedicated POS terminal for bartender operations',
      managerStation: 'Administrative terminal with full access rights'
    },
    
    kitchenSystems: {
      kitchenDisplay: 'Large displays for order management and timing',
      expeditiStation: 'Terminal for final order review and service',
      inventoryTerminal: 'Receiving and inventory management station',
      timingSystem: 'Order timing and kitchen performance tracking'
    },
    
    paymentSystems: {
      integrated: 'EMV chip readers integrated with POS terminals',
      contactless: 'NFC readers for contactless and mobile payments',
      tableside: 'Portable card readers for tableside payment',
      cashDrawers: 'Network-connected cash drawers with audit trails'
    }
  },

  networkInfrastructure: {
    wifiConfiguration: {
      guestNetwork: 'Separate guest WiFi with bandwidth limits',
      posNetwork: 'Dedicated network for POS and payment systems',
      kitchenNetwork: 'Kitchen display and equipment network',
      officeNetwork: 'Back-office systems and reporting'
    },
    
    redundancy: {
      primaryInternet: 'High-speed broadband for primary operations',
      backupInternet: 'Cellular backup for payment processing',
      localNetwork: 'Switches and access points for local connectivity',
      powerBackup: 'UPS systems for critical hardware'
    }
  }
}
```

## Phase 2: Menu and Inventory Setup (Week 2)

### Menu Configuration
```sql
-- Restaurant Menu Structure Setup

-- Create comprehensive menu items with restaurant-specific fields
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    category_id UUID NOT NULL REFERENCES menu_categories(id),
    
    -- Basic item information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(100),
    
    -- Pricing structure
    base_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    markup_percentage DECIMAL(5,2),
    
    -- Size and portion options
    portion_sizes JSONB DEFAULT '[]'::JSONB,
    
    -- Kitchen and preparation information
    kitchen_station VARCHAR(100),
    prep_time_minutes INTEGER DEFAULT 15,
    cook_time_minutes INTEGER DEFAULT 10,
    
    -- Dietary and allergen information
    dietary_restrictions TEXT[],
    allergens TEXT[],
    nutritional_info JSONB,
    calories INTEGER,
    
    -- Availability and scheduling
    availability_schedule JSONB,
    is_available BOOLEAN DEFAULT true,
    day_parts TEXT[] DEFAULT ARRAY['lunch', 'dinner'],
    
    -- Inventory and tracking
    track_inventory BOOLEAN DEFAULT false,
    low_stock_threshold INTEGER DEFAULT 5,
    
    -- Menu presentation
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_seasonal BOOLEAN DEFAULT false,
    
    -- Modifiers and customization
    modifiers_allowed BOOLEAN DEFAULT true,
    required_modifiers UUID[],
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_menu_item_business UNIQUE (business_id, name)
);

-- Menu item modifiers (add-ons, substitutions, customizations)
CREATE TABLE menu_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Modifier identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    modifier_type VARCHAR(50) NOT NULL CHECK (modifier_type IN ('addition', 'substitution', 'side', 'preparation')),
    
    -- Pricing
    price_adjustment DECIMAL(10,2) DEFAULT 0.00,
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    
    -- Grouping and display
    modifier_group VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    
    -- Restrictions
    max_selections INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_modifier_business UNIQUE (business_id, name)
);

-- Recipe and ingredient management
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Recipe information
    recipe_name VARCHAR(255) NOT NULL,
    serving_size INTEGER DEFAULT 1,
    yield_amount INTEGER DEFAULT 1,
    
    -- Instructions
    preparation_steps TEXT[],
    cooking_instructions TEXT,
    plating_instructions TEXT,
    
    -- Timing
    total_prep_time INTERVAL,
    active_cook_time INTERVAL,
    
    -- Cost calculation
    total_cost DECIMAL(10,2),
    cost_per_serving DECIMAL(10,2),
    
    -- Quality control
    temperature_requirements TEXT,
    quality_standards TEXT,
    
    -- Metadata
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recipe ingredients with quantities and costs
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES inventory_items(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Quantity information
    quantity DECIMAL(10,3) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    
    -- Cost information
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Preparation notes
    preparation_method VARCHAR(100),
    preparation_notes TEXT,
    
    -- Substitutions
    is_optional BOOLEAN DEFAULT false,
    substitutions TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sample menu data for restaurant
INSERT INTO menu_items (business_id, category_id, name, description, base_price, kitchen_station, prep_time_minutes, cook_time_minutes, dietary_restrictions, allergens)
SELECT 
    '$BUSINESS_ID',
    mc.id,
    item.name,
    item.description,
    item.price,
    item.station,
    item.prep_time,
    item.cook_time,
    item.dietary,
    item.allergens
FROM menu_categories mc
CROSS JOIN (
    VALUES 
    ('Caesar Salad', 'Fresh romaine lettuce, parmesan cheese, croutons, house-made caesar dressing', 12.99, 'Cold Station', 5, 0, ARRAY['vegetarian'], ARRAY['dairy', 'gluten']),
    ('Grilled Salmon', 'Atlantic salmon with lemon herb butter, seasonal vegetables, wild rice pilaf', 28.99, 'Grill Station', 10, 12, ARRAY['gluten-free'], ARRAY['fish']),
    ('Ribeye Steak', '12oz prime ribeye, garlic mashed potatoes, grilled asparagus', 34.99, 'Grill Station', 5, 15, ARRAY['gluten-free'], NULL),
    ('Chicken Parmesan', 'Breaded chicken breast, marinara sauce, mozzarella, angel hair pasta', 22.99, 'Saute Station', 15, 20, NULL, ARRAY['dairy', 'gluten']),
    ('Fish & Chips', 'Beer-battered cod, hand-cut fries, coleslaw, tartar sauce', 18.99, 'Fry Station', 8, 8, NULL, ARRAY['fish', 'gluten']),
    ('Chocolate Lava Cake', 'Warm chocolate cake with molten center, vanilla ice cream, berry coulis', 9.99, 'Dessert Station', 10, 12, 'vegetarian', ARRAY['dairy', 'eggs', 'gluten'])
) AS item(name, description, price, station, prep_time, cook_time, dietary, allergens)
WHERE mc.name = CASE 
    WHEN item.name IN ('Caesar Salad') THEN 'Salads'
    WHEN item.name IN ('Grilled Salmon', 'Ribeye Steak') THEN 'Entrees'
    WHEN item.name IN ('Chicken Parmesan') THEN 'Pasta'
    WHEN item.name IN ('Fish & Chips') THEN 'Entrees'
    WHEN item.name IN ('Chocolate Lava Cake') THEN 'Desserts'
END;
```

### Inventory Management Setup
```sql
-- Restaurant Inventory Management System

-- Inventory categories specific to restaurant operations
INSERT INTO inventory_categories (business_id, name, description, category_type, created_at) VALUES
('$BUSINESS_ID', 'Proteins', 'Meats, fish, and protein sources', 'food', NOW()),
('$BUSINESS_ID', 'Produce', 'Fresh fruits and vegetables', 'food', NOW()),
('$BUSINESS_ID', 'Dairy & Eggs', 'Dairy products and eggs', 'food', NOW()),
('$BUSINESS_ID', 'Dry Goods', 'Rice, pasta, flour, and dry ingredients', 'food', NOW()),
('$BUSINESS_ID', 'Beverages', 'Non-alcoholic beverages and mixers', 'beverage', NOW()),
('$BUSINESS_ID', 'Wine', 'Wine inventory by bottle', 'alcohol', NOW()),
('$BUSINESS_ID', 'Beer', 'Draft and bottled beer inventory', 'alcohol', NOW()),
('$BUSINESS_ID', 'Spirits', 'Liquor and distilled spirits', 'alcohol', NOW()),
('$BUSINESS_ID', 'Paper Goods', 'Napkins, takeout containers, paper products', 'supplies', NOW()),
('$BUSINESS_ID', 'Cleaning Supplies', 'Sanitizers, soaps, and cleaning chemicals', 'supplies', NOW())
ON CONFLICT (business_id, name) DO NOTHING;

-- Restaurant-specific inventory items
INSERT INTO inventory_items (business_id, category_id, name, description, sku, unit_cost, unit_price, reorder_point, unit_of_measure, created_at)
SELECT 
    '$BUSINESS_ID',
    ic.id,
    item.name,
    item.description,
    item.sku,
    item.cost,
    item.price,
    item.reorder,
    item.uom,
    NOW()
FROM inventory_categories ic
CROSS JOIN (
    VALUES 
    -- Proteins
    ('Salmon Fillet', 'Fresh Atlantic salmon, 6oz portions', 'PROT-SALM-6', 8.50, 28.99, 20, 'each'),
    ('Ribeye Steak', 'Prime ribeye, 12oz cuts', 'PROT-RIBE-12', 15.00, 34.99, 15, 'each'),
    ('Chicken Breast', 'Boneless skinless chicken breast', 'PROT-CHIC-BR', 3.25, 22.99, 30, 'pound'),
    ('Ground Beef', '80/20 ground chuck', 'PROT-BEEF-GR', 4.50, 0.00, 25, 'pound'),
    
    -- Produce
    ('Romaine Lettuce', 'Fresh romaine hearts', 'PROD-ROM-LET', 2.50, 0.00, 10, 'each'),
    ('Tomatoes', 'Fresh Roma tomatoes', 'PROD-TOMATO', 3.00, 0.00, 15, 'pound'),
    ('Onions', 'Yellow cooking onions', 'PROD-ONION-Y', 1.25, 0.00, 20, 'pound'),
    ('Asparagus', 'Fresh asparagus spears', 'PROD-ASPAR', 4.75, 0.00, 10, 'pound'),
    
    -- Dairy & Eggs
    ('Heavy Cream', 'Heavy whipping cream', 'DAIRY-CREAM', 3.50, 0.00, 12, 'quart'),
    ('Butter', 'Unsalted butter', 'DAIRY-BUTTER', 4.25, 0.00, 8, 'pound'),
    ('Parmesan Cheese', 'Aged Parmigiano-Reggiano', 'DAIRY-PARM', 12.00, 0.00, 5, 'pound'),
    ('Mozzarella', 'Fresh mozzarella cheese', 'DAIRY-MOZZ', 6.50, 0.00, 8, 'pound'),
    
    -- Beverages
    ('Coffee Beans', 'House blend coffee beans', 'BEV-COFFEE', 8.00, 3.50, 15, 'pound'),
    ('Orange Juice', 'Fresh squeezed orange juice', 'BEV-OJ', 4.50, 4.99, 20, 'quart'),
    ('Sparkling Water', 'Premium sparkling water', 'BEV-SPARK', 1.25, 3.99, 50, 'bottle'),
    
    -- Wine
    ('House Chardonnay', 'California Chardonnay', 'WINE-CHARD', 8.50, 32.00, 24, 'bottle'),
    ('House Cabernet', 'California Cabernet Sauvignon', 'WINE-CAB', 9.00, 35.00, 24, 'bottle'),
    ('Pinot Grigio', 'Italian Pinot Grigio', 'WINE-PINO', 7.50, 28.00, 18, 'bottle')
) AS item(name, description, sku, cost, price, reorder, uom)
WHERE ic.name = CASE 
    WHEN item.name IN ('Salmon Fillet', 'Ribeye Steak', 'Chicken Breast', 'Ground Beef') THEN 'Proteins'
    WHEN item.name IN ('Romaine Lettuce', 'Tomatoes', 'Onions', 'Asparagus') THEN 'Produce'
    WHEN item.name IN ('Heavy Cream', 'Butter', 'Parmesan Cheese', 'Mozzarella') THEN 'Dairy & Eggs'
    WHEN item.name IN ('Coffee Beans', 'Orange Juice', 'Sparkling Water') THEN 'Beverages'
    WHEN item.name IN ('House Chardonnay', 'House Cabernet', 'Pinot Grigio') THEN 'Wine'
END;
```

## Phase 3: POS and Payment Setup (Week 3)

### Point of Sale Configuration
```typescript
interface POSSystemConfiguration {
  terminalSetup: {
    serverStations: {
      count: 4,
      placement: ['Main dining area', 'Bar area', 'Private dining', 'Patio'],
      capabilities: ['Order taking', 'Payment processing', 'Table management', 'Customer lookup'],
      hardware: 'iPad Pro with stand, receipt printer, card reader'
    },
    
    kitchenDisplaySystem: {
      displays: 2,
      placement: ['Hot line', 'Cold station'],
      features: ['Order timing', 'Station assignment', 'Special instructions', 'Order completion'],
      integration: 'Real-time POS synchronization'
    },
    
    managementTerminal: {
      placement: 'Back office',
      capabilities: ['Full administrative access', 'Reporting', 'Menu management', 'Staff management'],
      hardware: 'Desktop computer with dual monitors'
    }
  },

  paymentProcessing: {
    creditCardProcessing: {
      processor: 'Stripe Terminal for in-person payments',
      terminals: 'EMV chip readers with contactless support',
      mobilePayments: 'Apple Pay, Google Pay, Samsung Pay support',
      securityCompliance: 'PCI DSS Level 1 compliance'
    },
    
    tableSidePayment: {
      devices: 'Portable card readers for table service',
      features: ['Split billing', 'Tip calculation', 'Receipt options'],
      integration: 'Synchronized with POS for seamless workflow'
    },
    
    cashManagement: {
      drawers: 'Network-connected cash drawers',
      counting: 'Automated till counting and reconciliation',
      security: 'Audit trail for all cash transactions',
      reporting: 'Daily cash flow and variance reporting'
    }
  }
}
```

### POS Integration Setup
```bash
#!/bin/bash
# POS System Integration and Configuration

setup_pos_integration() {
  echo "=== POS INTEGRATION SETUP ==="
  
  # Configure Stripe Terminal integration
  setup_stripe_terminal() {
    echo "Setting up Stripe Terminal for restaurant POS..."
    
    # Register terminal locations
    curl -X POST "https://api.stripe.com/v1/terminal/locations" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
      -d "display_name=Main Restaurant Floor" \
      -d "address[line1]=$RESTAURANT_ADDRESS" \
      -d "address[city]=$RESTAURANT_CITY" \
      -d "address[state]=$RESTAURANT_STATE" \
      -d "address[postal_code]=$RESTAURANT_ZIP"
    
    # Configure restaurant-specific payment settings
    supabase exec sql --query "
      INSERT INTO payment_settings (business_id, provider, settings, created_at)
      VALUES ('$BUSINESS_ID', 'stripe_terminal', jsonb_build_object(
        'location_id', '$STRIPE_LOCATION_ID',
        'currency', 'usd',
        'capture_method', 'automatic',
        'payment_method_types', ARRAY['card_present', 'interac_present'],
        'tipping', jsonb_build_object(
          'enabled', true,
          'fixed_amounts', ARRAY[200, 300, 400, 500],
          'percentages', ARRAY[15, 18, 20, 22, 25]
        ),
        'receipts', jsonb_build_object(
          'email', true,
          'sms', true,
          'print', true
        )
      ), NOW())
      ON CONFLICT (business_id, provider) DO UPDATE SET
        settings = EXCLUDED.settings,
        updated_at = NOW();
    "
  }
  
  # Configure kitchen display system
  setup_kitchen_display() {
    echo "Configuring kitchen display system..."
    
    # Create kitchen display configuration
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS kitchen_displays (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        display_name VARCHAR(255) NOT NULL,
        station_ids UUID[],
        display_settings JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      INSERT INTO kitchen_displays (business_id, display_name, station_ids, display_settings)
      SELECT 
        '$BUSINESS_ID',
        'Hot Line Display',
        ARRAY(SELECT id FROM kitchen_stations WHERE business_id = '$BUSINESS_ID' AND station_type = 'hot'),
        jsonb_build_object(
          'order_timeout_minutes', 20,
          'show_customer_names', false,
          'show_special_instructions', true,
          'color_coding', true,
          'sound_alerts', true,
          'auto_refresh_seconds', 30
        )
      WHERE NOT EXISTS (
        SELECT 1 FROM kitchen_displays 
        WHERE business_id = '$BUSINESS_ID' AND display_name = 'Hot Line Display'
      );
    "
  }
  
  # Configure table management
  setup_table_management() {
    echo "Setting up table management system..."
    
    supabase exec sql --query "
      -- Table status tracking
      CREATE TABLE IF NOT EXISTS table_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id UUID NOT NULL REFERENCES restaurant_tables(id),
        business_id UUID NOT NULL REFERENCES businesses(id),
        
        -- Session information
        session_start TIMESTAMPTZ DEFAULT NOW(),
        session_end TIMESTAMPTZ,
        party_size INTEGER,
        server_id UUID REFERENCES user_profiles(id),
        
        -- Order tracking
        orders UUID[],
        total_amount DECIMAL(10,2) DEFAULT 0.00,
        
        -- Status
        status VARCHAR(50) DEFAULT 'seated' CHECK (status IN ('seated', 'ordering', 'served', 'paying', 'finished')),
        
        -- Special requirements
        special_requests TEXT,
        dietary_restrictions TEXT[],
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_table_sessions_active 
      ON table_sessions(table_id, business_id) 
      WHERE session_end IS NULL;
    "
  }
  
  # Configure order management
  setup_order_management() {
    echo "Setting up restaurant order management..."
    
    supabase exec sql --query "
      -- Restaurant orders with timing and kitchen workflow
      CREATE TABLE IF NOT EXISTS restaurant_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        
        -- Order identification
        order_number VARCHAR(50) UNIQUE NOT NULL,
        table_session_id UUID REFERENCES table_sessions(id),
        customer_id UUID REFERENCES customers(id),
        
        -- Order details
        order_type VARCHAR(50) DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeout', 'delivery', 'catering')),
        order_items JSONB NOT NULL,
        
        -- Pricing
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) NOT NULL,
        tip_amount DECIMAL(10,2) DEFAULT 0.00,
        total_amount DECIMAL(10,2) NOT NULL,
        
        -- Kitchen timing
        ordered_at TIMESTAMPTZ DEFAULT NOW(),
        kitchen_received_at TIMESTAMPTZ,
        prep_started_at TIMESTAMPTZ,
        ready_at TIMESTAMPTZ,
        served_at TIMESTAMPTZ,
        
        -- Staff assignments
        server_id UUID REFERENCES user_profiles(id),
        kitchen_staff_id UUID REFERENCES user_profiles(id),
        
        -- Status tracking
        status VARCHAR(50) DEFAULT 'ordered' CHECK (status IN (
          'ordered', 'kitchen_received', 'prep_started', 'cooking', 'ready', 'served', 'completed'
        )),
        
        -- Special instructions
        special_instructions TEXT,
        dietary_notes TEXT,
        allergies TEXT[],
        
        -- Payment tracking
        payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'comped')),
        payment_method VARCHAR(50),
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_restaurant_orders_status ON restaurant_orders(status, business_id);
      CREATE INDEX idx_restaurant_orders_kitchen ON restaurant_orders(kitchen_received_at, status) 
      WHERE status IN ('kitchen_received', 'prep_started', 'cooking');
    "
  }
  
  setup_stripe_terminal
  setup_kitchen_display
  setup_table_management
  setup_order_management
  
  echo "✅ POS integration setup completed"
}
```

## Phase 4: Staff Training and Operations (Week 4)

### Staff Training Program
```typescript
interface RestaurantStaffTraining {
  serverTraining: {
    duration: '8 hours hands-on training over 2 days',
    topics: [
      'POS system operation and order entry',
      'Table management and guest seating',
      'Menu knowledge and upselling techniques',
      'Payment processing and tip handling',
      'Customer service and complaint resolution',
      'Food safety and allergen awareness'
    ],
    certification: 'Restaurant Server Operations Certification'
  },
  
  kitchenStaffTraining: {
    duration: '6 hours practical training',
    topics: [
      'Kitchen display system and order workflow',
      'Recipe management and portion control',
      'Food safety and HACCP compliance',
      'Inventory management and waste reduction',
      'Communication with front-of-house staff',
      'Quality control and presentation standards'
    ],
    certification: 'Kitchen Operations Certification'
  },
  
  managementTraining: {
    duration: '12 hours comprehensive training',
    topics: [
      'Full system administration and configuration',
      'Financial reporting and cost management',
      'Staff scheduling and labor cost optimization',
      'Inventory management and supplier relations',
      'Customer analytics and loyalty programs',
      'Compliance and regulatory requirements'
    ],
    certification: 'Restaurant Management Certification'
  }
}
```

## Phase 5: Testing and Go-Live (Week 5)

### System Testing Checklist
```bash
#!/bin/bash
# Restaurant System Testing

restaurant_system_testing() {
  echo "=== RESTAURANT SYSTEM TESTING ==="
  
  # Test POS functionality
  test_pos_operations() {
    echo "Testing POS operations..."
    
    # Test order creation
    echo "Testing order entry and modification..."
    
    # Test payment processing
    echo "Testing payment processing with test cards..."
    stripe_test=$(curl -s -X POST "https://api.stripe.com/v1/payment_intents" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
      -d "amount=1000" \
      -d "currency=usd" \
      -d "payment_method_types[]=card_present" \
      -d "description=Restaurant system test")
    
    if echo "$stripe_test" | jq -e '.id' > /dev/null; then
      echo "✅ Payment processing test successful"
    else
      echo "❌ Payment processing test failed"
      return 1
    fi
    
    # Test kitchen display integration
    echo "Testing kitchen display system..."
    test_kitchen_display
    
    # Test table management
    echo "Testing table assignment and management..."
    test_table_operations
  }
  
  # Test kitchen display functionality
  test_kitchen_display() {
    echo "Verifying kitchen display system..."
    
    # Create test order and verify it appears on kitchen display
    supabase exec sql --query "
      INSERT INTO restaurant_orders (
        business_id, order_number, order_items, subtotal, tax_amount, total_amount, status
      ) VALUES (
        '$BUSINESS_ID', 'TEST-001', 
        '[{\"item\": \"Test Burger\", \"quantity\": 1, \"price\": 12.99, \"station\": \"Grill\"}]',
        12.99, 1.04, 14.03, 'kitchen_received'
      );
    "
    
    # Verify order shows in kitchen queue
    kitchen_orders=$(supabase exec sql --query "
      SELECT COUNT(*) FROM restaurant_orders 
      WHERE business_id = '$BUSINESS_ID' 
      AND status = 'kitchen_received'
      AND order_number = 'TEST-001'
    " --csv | tail -1)
    
    if [ "$kitchen_orders" -eq 1 ]; then
      echo "✅ Kitchen display integration working"
    else
      echo "❌ Kitchen display integration failed"
    fi
    
    # Clean up test data
    supabase exec sql --query "
      DELETE FROM restaurant_orders 
      WHERE business_id = '$BUSINESS_ID' 
      AND order_number = 'TEST-001'
    "
  }
  
  # Test table management
  test_table_operations() {
    echo "Testing table management operations..."
    
    # Test table assignment
    supabase exec sql --query "
      UPDATE restaurant_tables SET status = 'occupied' 
      WHERE business_id = '$BUSINESS_ID' AND table_number = '1'
    "
    
    # Verify table status update
    table_status=$(supabase exec sql --query "
      SELECT status FROM restaurant_tables 
      WHERE business_id = '$BUSINESS_ID' AND table_number = '1'
    " --csv | tail -1)
    
    if [ "$table_status" = "occupied" ]; then
      echo "✅ Table management working correctly"
    else
      echo "❌ Table management failed"
    fi
    
    # Reset table status
    supabase exec sql --query "
      UPDATE restaurant_tables SET status = 'available' 
      WHERE business_id = '$BUSINESS_ID' AND table_number = '1'
    "
  }
  
  # Test menu and pricing
  test_menu_operations() {
    echo "Testing menu management and pricing..."
    
    # Verify menu items are properly configured
    menu_count=$(supabase exec sql --query "
      SELECT COUNT(*) FROM menu_items 
      WHERE business_id = '$BUSINESS_ID' AND is_active = true
    " --csv | tail -1)
    
    echo "Active menu items: $menu_count"
    
    # Test price calculations
    echo "Testing price calculations with modifiers..."
    
    # Verify tax calculations
    echo "Testing tax calculation accuracy..."
  }
  
  # Run all tests
  test_pos_operations
  test_menu_operations
  
  echo "✅ Restaurant system testing completed"
}
```

### Go-Live Preparation
```bash
#!/bin/bash
# Restaurant Go-Live Preparation

prepare_restaurant_go_live() {
  echo "=== RESTAURANT GO-LIVE PREPARATION ==="
  
  # Final system verification
  final_system_check() {
    echo "Performing final system verification..."
    
    # Check all hardware connectivity
    echo "Verifying hardware connections..."
    
    # Verify payment processing
    payment_status=$(curl -s "https://api.stripe.com/v1/account" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" | jq -r '.charges_enabled')
    
    echo "Payment processing enabled: $payment_status"
    
    # Check database integrity
    db_integrity=$(supabase exec sql --query "
      SELECT 
        COUNT(*) as total_tables,
        COUNT(*) FILTER (WHERE is_active) as active_tables
      FROM restaurant_tables WHERE business_id = '$BUSINESS_ID'
    " --csv | tail -1)
    
    echo "Database integrity check: $db_integrity"
    
    # Verify menu completeness
    menu_status=$(supabase exec sql --query "
      SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE is_available) as available_items
      FROM menu_items WHERE business_id = '$BUSINESS_ID'
    " --csv | tail -1)
    
    echo "Menu status: $menu_status"
  }
  
  # Enable production features
  enable_production_mode() {
    echo "Enabling production features..."
    
    supabase exec sql --query "
      UPDATE businesses SET
        settings = settings || jsonb_build_object(
          'production_mode', true,
          'live_orders', true,
          'payment_processing', true,
          'kitchen_display', true,
          'table_management', true,
          'inventory_tracking', true
        )
      WHERE id = '$BUSINESS_ID';
    "
    
    echo "Production mode enabled"
  }
  
  # Create go-live backup
  create_go_live_backup() {
    echo "Creating go-live backup..."
    
    timestamp=$(date +%Y%m%d-%H%M%S)
    backup_file="restaurant-go-live-backup-$timestamp.sql"
    
    pg_dump "$DATABASE_URL" \
      --verbose \
      --format=custom \
      --file="$backup_file" \
      --schema=public \
      --table=businesses \
      --table=restaurant_* \
      --table=menu_*
    
    echo "✅ Backup created: $backup_file"
  }
  
  # Staff final briefing
  staff_final_briefing() {
    echo "Conducting staff final briefing..."
    
    cat << 'EOF'
=== RESTAURANT GO-LIVE CHECKLIST ===

Front of House:
☐ All servers logged into POS systems
☐ Payment terminals tested and working
☐ Table assignments confirmed
☐ Menu items and prices verified
☐ Special dietary/allergen procedures reviewed

Kitchen:
☐ Kitchen display systems operational
☐ All stations properly set up
☐ Recipe cards and prep lists ready
☐ Inventory levels verified
☐ Food safety procedures confirmed

Management:
☐ Manager override codes set
☐ Daily reports accessible
☐ Emergency contacts available
☐ Backup procedures tested
☐ Support contact information posted

Customer Experience:
☐ Reservation system active
☐ Payment options tested
☐ Receipt printing verified
☐ Customer WiFi configured
☐ Loyalty program ready

EOF
  }
  
  final_system_check
  enable_production_mode
  create_go_live_backup
  staff_final_briefing
  
  echo "✅ Restaurant ready for go-live!"
}
```

This comprehensive restaurant implementation guide ensures successful deployment of the Thorbis Business OS platform specifically tailored for restaurant operations, providing a foundation for efficient service delivery, kitchen management, and customer satisfaction.