# Restaurant Compliance & Reporting Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Audience**: Restaurant managers, compliance officers, operations teams  

## Overview

This comprehensive guide covers all regulatory compliance requirements and reporting obligations for restaurant operations using the Thorbis Business OS platform. It provides detailed procedures, automated compliance tracking, and reporting capabilities to ensure adherence to health, safety, labor, and financial regulations.

## Table of Contents

1. [Health Department Compliance](#health-department-compliance)
2. [Food Safety and HACCP](#food-safety-and-haccp)
3. [Labor Law Compliance](#labor-law-compliance)
4. [Liquor License Compliance](#liquor-license-compliance)
5. [Tax Reporting and Compliance](#tax-reporting-and-compliance)
6. [Fire Safety and Building Code Compliance](#fire-safety-and-building-code-compliance)
7. [Environmental and Waste Management](#environmental-and-waste-management)
8. [Financial Reporting and Auditing](#financial-reporting-and-auditing)
9. [Data Privacy and Security Compliance](#data-privacy-and-security-compliance)
10. [Automated Compliance Monitoring](#automated-compliance-monitoring)

## Health Department Compliance

### Temperature Monitoring and Logging
```typescript
interface TemperatureCompliance {
  requirements: {
    frequency: 'Every 15 minutes during operating hours',
    equipment: 'Calibrated digital thermometers with data logging',
    locations: ['walk_in_cooler', 'walk_in_freezer', 'reach_in_coolers', 'hot_holding'],
    thresholds: {
      refrigeration: '35-38°F (1.7-3.3°C)',
      freezer: '0-5°F (-17.8--15°C)',
      hotHolding: '140°F+ (60°C+)',
      coolingDown: '135°F to 70°F in 2 hours, then 70°F to 41°F in 4 hours'
    }
  },
  
  alerts: {
    immediateAlert: 'Temperature excursion beyond safe limits',
    managementNotification: 'Repeated temperature violations',
    correctedAction: 'Document corrective actions taken',
    healthDepartment: 'Report critical violations within 24 hours'
  },
  
  recordKeeping: {
    retention: '6 months minimum, 2 years recommended',
    format: 'Electronic logs with timestamps and signatures',
    accessibility: 'Available for health inspection immediately',
    backup: 'Cloud storage with redundant backup systems'
  }
}
```

#### Temperature Monitoring System Setup
```bash
# Automated Temperature Monitoring Setup
setup_temperature_monitoring() {
  echo "Setting up automated temperature monitoring system..."
  
  # Create temperature logging tables
  setup_temperature_tables() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS temperature_readings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        location VARCHAR(100) NOT NULL,
        sensor_id VARCHAR(100) NOT NULL,
        
        -- Temperature data
        temperature_fahrenheit DECIMAL(5,2) NOT NULL,
        temperature_celsius DECIMAL(5,2) NOT NULL,
        humidity_percentage DECIMAL(5,2),
        
        -- Compliance tracking
        is_within_range BOOLEAN NOT NULL,
        min_threshold DECIMAL(5,2) NOT NULL,
        max_threshold DECIMAL(5,2) NOT NULL,
        
        -- Alert information
        alert_level VARCHAR(50) CHECK (alert_level IN ('normal', 'warning', 'critical')),
        alert_sent BOOLEAN DEFAULT false,
        corrective_action TEXT,
        
        -- Timestamps
        reading_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_temperature_business_location ON temperature_readings(business_id, location);
      CREATE INDEX idx_temperature_alerts ON temperature_readings(business_id, alert_level) WHERE alert_level != 'normal';
    "
  }
  
  # Set up temperature thresholds
  configure_temperature_thresholds() {
    supabase exec sql --query "
      INSERT INTO temperature_thresholds (business_id, location, min_temp, max_temp, created_at) VALUES
      ('$BUSINESS_ID', 'walk_in_cooler', 35.0, 38.0, NOW()),
      ('$BUSINESS_ID', 'walk_in_freezer', 0.0, 5.0, NOW()),
      ('$BUSINESS_ID', 'reach_in_cooler_1', 35.0, 38.0, NOW()),
      ('$BUSINESS_ID', 'reach_in_cooler_2', 35.0, 38.0, NOW()),
      ('$BUSINESS_ID', 'hot_holding_unit', 140.0, 180.0, NOW()),
      ('$BUSINESS_ID', 'prep_cooler', 35.0, 38.0, NOW())
      ON CONFLICT (business_id, location) DO UPDATE SET
        min_temp = EXCLUDED.min_temp,
        max_temp = EXCLUDED.max_temp,
        updated_at = NOW();
    "
  }
  
  # Create temperature alert function
  setup_temperature_alerts() {
    supabase exec function create check_temperature_compliance << 'EOF'
CREATE OR REPLACE FUNCTION check_temperature_compliance()
RETURNS TRIGGER AS $$
DECLARE
  threshold_rec RECORD;
  alert_level TEXT := 'normal';
BEGIN
  -- Get threshold for this location
  SELECT min_temp, max_temp INTO threshold_rec
  FROM temperature_thresholds 
  WHERE business_id = NEW.business_id AND location = NEW.location;
  
  IF NOT FOUND THEN
    RAISE WARNING 'No temperature threshold found for location: %', NEW.location;
    RETURN NEW;
  END IF;
  
  -- Determine alert level
  IF NEW.temperature_fahrenheit < threshold_rec.min_temp OR 
     NEW.temperature_fahrenheit > threshold_rec.max_temp THEN
    
    -- Check severity
    IF NEW.temperature_fahrenheit < (threshold_rec.min_temp - 5) OR 
       NEW.temperature_fahrenheit > (threshold_rec.max_temp + 10) THEN
      alert_level := 'critical';
    ELSE
      alert_level := 'warning';
    END IF;
    
    NEW.is_within_range := false;
    NEW.alert_level := alert_level;
    
    -- Insert compliance violation record
    INSERT INTO compliance_violations (
      business_id, violation_type, violation_date, location, description, severity
    ) VALUES (
      NEW.business_id, 'temperature_violation', NOW(), NEW.location,
      format('Temperature %s°F outside safe range (%s°F - %s°F)', 
             NEW.temperature_fahrenheit, threshold_rec.min_temp, threshold_rec.max_temp),
      alert_level
    );
    
  ELSE
    NEW.is_within_range := true;
    NEW.alert_level := 'normal';
  END IF;
  
  NEW.min_threshold := threshold_rec.min_temp;
  NEW.max_threshold := threshold_rec.max_temp;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
EOF
    
    # Create trigger for temperature checking
    supabase exec sql --query "
      CREATE TRIGGER trigger_check_temperature_compliance
        BEFORE INSERT ON temperature_readings
        FOR EACH ROW EXECUTE FUNCTION check_temperature_compliance();
    "
  }
  
  setup_temperature_tables
  configure_temperature_thresholds
  setup_temperature_alerts
}
```

### Health Inspection Preparedness
```typescript
interface HealthInspectionPreparation {
  documentationChecklist: {
    temperatureLogs: 'Complete temperature logs for past 6 months',
    cleaningSchedules: 'Daily, weekly, and monthly cleaning checklists',
    staffCertifications: 'Current food safety certifications for all staff',
    supplierDocuments: 'Approved supplier list and delivery receipts',
    maintenanceRecords: 'Equipment maintenance and repair documentation',
    pestControlRecords: 'Professional pest control service records'
  },
  
  physicalPreparation: {
    equipmentCalibration: 'Ensure all thermometers are calibrated',
    cleanlinessStandards: 'Deep clean all areas including hard-to-reach spaces',
    storageCompliance: 'Verify proper food storage and labeling',
    employeeHygiene: 'Review handwashing stations and uniform standards'
  },
  
  processVerification: {
    hackCompliance: 'Review and verify HACCP plan implementation',
    flowAnalysis: 'Ensure proper food flow and prevent cross-contamination',
    timeTemperatureAbuse: 'Verify all time/temperature control procedures',
    allergenManagement: 'Confirm allergen identification and prevention'
  }
}
```

## Food Safety and HACCP

### HACCP Plan Implementation
```sql
-- HACCP Critical Control Points Management
CREATE TABLE haccp_control_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Control point identification
    ccp_number INTEGER NOT NULL,
    process_step VARCHAR(255) NOT NULL,
    hazard_description TEXT NOT NULL,
    hazard_type VARCHAR(50) CHECK (hazard_type IN ('biological', 'chemical', 'physical')),
    
    -- Critical limits
    critical_limit_description TEXT NOT NULL,
    monitoring_procedure TEXT NOT NULL,
    monitoring_frequency VARCHAR(100) NOT NULL,
    
    -- Corrective actions
    corrective_actions TEXT NOT NULL,
    verification_procedures TEXT NOT NULL,
    record_keeping_procedures TEXT NOT NULL,
    
    -- Status tracking
    is_active BOOLEAN DEFAULT true,
    last_reviewed_date DATE,
    next_review_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_ccp_business UNIQUE (business_id, ccp_number)
);

-- HACCP Monitoring Records
CREATE TABLE haccp_monitoring_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    ccp_id UUID NOT NULL REFERENCES haccp_control_points(id),
    
    -- Monitoring data
    monitoring_date DATE NOT NULL,
    monitoring_time TIME NOT NULL,
    employee_initials VARCHAR(10) NOT NULL,
    
    -- Measurement results
    measured_value VARCHAR(100),
    is_within_limits BOOLEAN NOT NULL,
    observations TEXT,
    
    -- Corrective action (if needed)
    corrective_action_taken TEXT,
    corrective_action_time TIME,
    manager_approval VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample HACCP Critical Control Points for Restaurant
INSERT INTO haccp_control_points (business_id, ccp_number, process_step, hazard_description, hazard_type, critical_limit_description, monitoring_procedure, monitoring_frequency, corrective_actions, verification_procedures, record_keeping_procedures) VALUES

('$BUSINESS_ID', 1, 'Cold Food Storage', 'Bacterial growth in potentially hazardous foods', 'biological', 
'Refrigeration units must maintain temperature at 41°F (5°C) or below', 
'Check and record refrigerator temperatures using calibrated thermometer', 
'Every 4 hours during operating hours',
'1. Adjust thermostat 2. Move food to working refrigerator 3. Discard food held above 41°F for more than 4 hours 4. Repair or replace equipment',
'Daily review of temperature logs by manager, weekly calibration of thermometers',
'Temperature monitoring logs retained for 6 months'),

('$BUSINESS_ID', 2, 'Hot Food Holding', 'Bacterial growth in hot held foods', 'biological',
'Hot holding equipment must maintain food temperature at 140°F (60°C) or above',
'Check and record hot holding temperatures using calibrated thermometer',
'Every 2 hours during service',
'1. Adjust heating element 2. Move food to working hot holding unit 3. Reheat food to 165°F within 2 hours 4. Discard food held below 140°F for more than 2 hours',
'Daily review of temperature logs by manager, monthly equipment calibration',
'Hot holding monitoring logs retained for 6 months'),

('$BUSINESS_ID', 3, 'Cooking Process', 'Survival of pathogenic bacteria', 'biological',
'All potentially hazardous foods must reach minimum internal temperatures: Poultry 165°F, Ground beef 155°F, Beef/Pork 145°F, Fish 145°F',
'Use calibrated probe thermometer to check internal temperature of cooked foods',
'Every batch of cooked food',
'1. Continue cooking until proper temperature is reached 2. Discard food that cannot reach safe temperature 3. Calibrate thermometer if readings are inconsistent',
'Weekly verification of cooking temperatures by manager, monthly thermometer calibration',
'Cooking temperature logs retained for 3 months');
```

### Food Safety Training Management
```bash
# Food Safety Certification Tracking
setup_food_safety_training() {
  echo "Setting up food safety training and certification tracking..."
  
  # Create certification tracking tables
  setup_certification_tables() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS food_safety_certifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        employee_id UUID NOT NULL REFERENCES user_profiles(id),
        
        -- Certification details
        certification_type VARCHAR(100) NOT NULL CHECK (certification_type IN (
          'food_handlers_permit', 'food_protection_manager', 'allergen_awareness', 'haccp_training'
        )),
        certification_number VARCHAR(100),
        issuing_organization VARCHAR(255) NOT NULL,
        
        -- Dates
        issue_date DATE NOT NULL,
        expiration_date DATE NOT NULL,
        renewal_reminder_date DATE,
        
        -- Documentation
        certificate_image_url TEXT,
        verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'expired', 'invalid')),
        
        -- Compliance tracking
        is_current BOOLEAN GENERATED ALWAYS AS (expiration_date > CURRENT_DATE) STORED,
        is_required_for_role BOOLEAN DEFAULT false,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT unique_employee_cert_type UNIQUE (employee_id, certification_type)
      );
      
      CREATE INDEX idx_certifications_expiration ON food_safety_certifications(business_id, expiration_date);
      CREATE INDEX idx_certifications_employee ON food_safety_certifications(employee_id);
    "
  }
  
  # Set up certification requirements by role
  configure_certification_requirements() {
    supabase exec sql --query "
      INSERT INTO certification_requirements (business_id, role_name, required_certifications, created_at) VALUES
      ('$BUSINESS_ID', 'Manager', ARRAY['food_protection_manager', 'allergen_awareness'], NOW()),
      ('$BUSINESS_ID', 'Kitchen Staff', ARRAY['food_handlers_permit', 'allergen_awareness'], NOW()),
      ('$BUSINESS_ID', 'Server', ARRAY['food_handlers_permit', 'allergen_awareness'], NOW()),
      ('$BUSINESS_ID', 'Bartender', ARRAY['food_handlers_permit', 'allergen_awareness'], NOW())
      ON CONFLICT (business_id, role_name) DO UPDATE SET
        required_certifications = EXCLUDED.required_certifications,
        updated_at = NOW();
    "
  }
  
  # Create expiration alert system
  setup_certification_alerts() {
    # Daily check for expiring certifications
    cat > /opt/thorbis/scripts/check_certification_expiry.sql << 'EOF'
-- Check for certifications expiring within 30 days
WITH expiring_certs AS (
  SELECT 
    fsc.*,
    up.first_name,
    up.last_name,
    up.email,
    b.name as business_name
  FROM food_safety_certifications fsc
  JOIN user_profiles up ON fsc.employee_id = up.id
  JOIN businesses b ON fsc.business_id = b.id
  WHERE fsc.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND fsc.verification_status = 'verified'
)
INSERT INTO certification_alerts (business_id, employee_id, certification_type, alert_type, message, created_at)
SELECT 
  business_id,
  employee_id,
  certification_type,
  CASE 
    WHEN expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
    WHEN expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'warning'
  END as alert_type,
  format('%s %s: %s certification expires on %s', 
         first_name, last_name, certification_type, expiration_date) as message,
  NOW()
FROM expiring_certs
ON CONFLICT (business_id, employee_id, certification_type, DATE(created_at)) DO NOTHING;
EOF
    
    # Schedule daily certification check
    echo "0 8 * * * psql $DATABASE_URL -f /opt/thorbis/scripts/check_certification_expiry.sql" | crontab -
  }
  
  setup_certification_tables
  configure_certification_requirements
  setup_certification_alerts
}
```

## Labor Law Compliance

### Wage and Hour Compliance
```typescript
interface WageHourCompliance {
  timeTrackingRequirements: {
    clockInOut: 'Employees must clock in/out for all shifts',
    breakTracking: 'Meal and rest breaks must be tracked and recorded',
    overtimeCalculation: 'Automatic calculation of overtime hours (>40 hours/week)',
    minimumWage: 'Compliance with federal, state, and local minimum wage laws',
    tipReporting: 'Accurate tip reporting and distribution tracking'
  },
  
  breakRequirements: {
    mealBreaks: 'Unpaid meal break of 30+ minutes for shifts over 5 hours',
    restBreaks: 'Paid 10-minute rest break for every 4 hours worked',
    documentation: 'Document when breaks are taken or waived by employee',
    violations: 'Automatic alerts for break requirement violations'
  },
  
  payrollCompliance: {
    payPeriods: 'Regular pay periods (weekly, bi-weekly, or semi-monthly)',
    payStubs: 'Detailed pay stubs with hours, rates, deductions, and tips',
    recordRetention: 'Maintain payroll records for minimum 3 years',
    stateTaxCompliance: 'Compliance with state-specific tax and withholding requirements'
  }
}
```

#### Labor Compliance Monitoring Setup
```bash
# Labor Law Compliance System
setup_labor_compliance_monitoring() {
  echo "Setting up comprehensive labor law compliance monitoring..."
  
  # Create detailed time tracking system
  setup_time_tracking() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS employee_time_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        employee_id UUID NOT NULL REFERENCES user_profiles(id),
        
        -- Shift information
        shift_date DATE NOT NULL,
        clock_in_time TIMESTAMPTZ NOT NULL,
        clock_out_time TIMESTAMPTZ,
        
        -- Break tracking
        meal_break_start TIMESTAMPTZ,
        meal_break_end TIMESTAMPTZ,
        meal_break_waived BOOLEAN DEFAULT false,
        rest_breaks JSONB DEFAULT '[]'::JSONB, -- Array of break periods
        
        -- Hours calculation
        regular_hours DECIMAL(5,2),
        overtime_hours DECIMAL(5,2),
        double_time_hours DECIMAL(5,2),
        total_hours DECIMAL(5,2),
        
        -- Pay information
        hourly_rate DECIMAL(8,2) NOT NULL,
        tips_declared DECIMAL(10,2) DEFAULT 0.00,
        
        -- Compliance flags
        meal_break_compliant BOOLEAN,
        rest_break_compliant BOOLEAN,
        max_hours_compliant BOOLEAN,
        
        -- Status
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'needs_review')),
        manager_approved_by UUID REFERENCES user_profiles(id),
        approved_at TIMESTAMPTZ,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_time_entries_employee_date ON employee_time_entries(employee_id, shift_date);
      CREATE INDEX idx_time_entries_compliance ON employee_time_entries(business_id) WHERE NOT (meal_break_compliant AND rest_break_compliant AND max_hours_compliant);
    "
  }
  
  # Create compliance checking function
  setup_compliance_checking() {
    supabase exec function create check_labor_compliance << 'EOF'
CREATE OR REPLACE FUNCTION check_labor_compliance()
RETURNS TRIGGER AS $$
DECLARE
  shift_hours INTERVAL;
  shift_hours_decimal DECIMAL(5,2);
  break_duration INTERVAL;
  required_rest_breaks INTEGER;
  actual_rest_breaks INTEGER;
BEGIN
  -- Calculate shift duration
  IF NEW.clock_out_time IS NOT NULL THEN
    shift_hours := NEW.clock_out_time - NEW.clock_in_time;
    shift_hours_decimal := EXTRACT(EPOCH FROM shift_hours) / 3600.0;
    
    -- Subtract meal break time if taken
    IF NEW.meal_break_start IS NOT NULL AND NEW.meal_break_end IS NOT NULL THEN
      break_duration := NEW.meal_break_end - NEW.meal_break_start;
      shift_hours := shift_hours - break_duration;
      shift_hours_decimal := EXTRACT(EPOCH FROM shift_hours) / 3600.0;
    END IF;
    
    -- Calculate hours breakdown
    IF shift_hours_decimal <= 8 THEN
      NEW.regular_hours := shift_hours_decimal;
      NEW.overtime_hours := 0;
      NEW.double_time_hours := 0;
    ELSIF shift_hours_decimal <= 12 THEN
      NEW.regular_hours := 8;
      NEW.overtime_hours := shift_hours_decimal - 8;
      NEW.double_time_hours := 0;
    ELSE
      NEW.regular_hours := 8;
      NEW.overtime_hours := 4;
      NEW.double_time_hours := shift_hours_decimal - 12;
    END IF;
    
    NEW.total_hours := shift_hours_decimal;
    
    -- Check meal break compliance (required for shifts > 5 hours)
    IF shift_hours_decimal > 5 THEN
      IF NEW.meal_break_waived = true THEN
        NEW.meal_break_compliant := true; -- Waived by employee
      ELSIF NEW.meal_break_start IS NOT NULL AND NEW.meal_break_end IS NOT NULL THEN
        break_duration := NEW.meal_break_end - NEW.meal_break_start;
        NEW.meal_break_compliant := (EXTRACT(EPOCH FROM break_duration) >= 1800); -- 30+ minutes
      ELSE
        NEW.meal_break_compliant := false;
      END IF;
    ELSE
      NEW.meal_break_compliant := true; -- Not required
    END IF;
    
    -- Check rest break compliance (10 minutes per 4 hours worked)
    required_rest_breaks := FLOOR(shift_hours_decimal / 4.0)::INTEGER;
    actual_rest_breaks := jsonb_array_length(COALESCE(NEW.rest_breaks, '[]'::JSONB));
    NEW.rest_break_compliant := (actual_rest_breaks >= required_rest_breaks);
    
    -- Check maximum hours compliance (no more than 12 hours per day)
    NEW.max_hours_compliant := (shift_hours_decimal <= 12);
    
    -- Create violation records for non-compliance
    IF NOT NEW.meal_break_compliant THEN
      INSERT INTO compliance_violations (business_id, employee_id, violation_type, violation_date, description, severity)
      VALUES (NEW.business_id, NEW.employee_id, 'meal_break_violation', NEW.shift_date, 
              format('Meal break violation: worked %s hours without proper meal break', shift_hours_decimal), 'warning');
    END IF;
    
    IF NOT NEW.rest_break_compliant THEN
      INSERT INTO compliance_violations (business_id, employee_id, violation_type, violation_date, description, severity)
      VALUES (NEW.business_id, NEW.employee_id, 'rest_break_violation', NEW.shift_date,
              format('Rest break violation: %s breaks provided, %s required', actual_rest_breaks, required_rest_breaks), 'warning');
    END IF;
    
    IF NOT NEW.max_hours_compliant THEN
      INSERT INTO compliance_violations (business_id, employee_id, violation_type, violation_date, description, severity)
      VALUES (NEW.business_id, NEW.employee_id, 'max_hours_violation', NEW.shift_date,
              format('Maximum hours violation: worked %s hours in single day', shift_hours_decimal), 'critical');
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
EOF
    
    # Create trigger for compliance checking
    supabase exec sql --query "
      CREATE TRIGGER trigger_check_labor_compliance
        BEFORE INSERT OR UPDATE ON employee_time_entries
        FOR EACH ROW EXECUTE FUNCTION check_labor_compliance();
    "
  }
  
  # Set up weekly overtime calculations
  setup_overtime_calculations() {
    supabase exec function create calculate_weekly_overtime << 'EOF'
CREATE OR REPLACE FUNCTION calculate_weekly_overtime(p_business_id UUID, p_week_start DATE)
RETURNS TABLE (
  employee_id UUID,
  regular_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2),
  total_hours DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_hours AS (
    SELECT 
      ete.employee_id,
      SUM(ete.total_hours) as total_week_hours,
      SUM(CASE WHEN ete.total_hours <= 8 THEN ete.total_hours ELSE 8 END) as daily_regular_total,
      SUM(CASE WHEN ete.total_hours > 8 THEN ete.total_hours - 8 ELSE 0 END) as daily_overtime_total
    FROM employee_time_entries ete
    WHERE ete.business_id = p_business_id
    AND ete.shift_date BETWEEN p_week_start AND p_week_start + INTERVAL '6 days'
    AND ete.status = 'completed'
    GROUP BY ete.employee_id
  )
  SELECT 
    wh.employee_id,
    CASE 
      WHEN wh.total_week_hours <= 40 THEN wh.total_week_hours
      ELSE 40.0
    END as regular_hours,
    CASE
      WHEN wh.total_week_hours > 40 THEN (wh.total_week_hours - 40) + wh.daily_overtime_total
      ELSE wh.daily_overtime_total
    END as overtime_hours,
    wh.total_week_hours as total_hours
  FROM weekly_hours wh;
END;
$$ LANGUAGE plpgsql;
EOF
  }
  
  setup_time_tracking
  setup_compliance_checking
  setup_overtime_calculations
}
```

## Liquor License Compliance

### Age Verification and Service Tracking
```typescript
interface LiquorLicenseCompliance {
  ageVerification: {
    idChecking: 'All customers must present valid ID for alcohol purchases',
    idScanning: 'Electronic ID verification for accuracy and record keeping',
    refusalTracking: 'Document all instances of service refusal',
    serverCertification: 'All servers must have responsible beverage service certification'
  },
  
  serviceRestrictions: {
    operatingHours: 'Alcohol service only during licensed hours',
    intoxicationPrevention: 'Refuse service to visibly intoxicated customers',
    minorProtection: 'Zero tolerance for serving minors',
    overconsumption: 'Monitor and limit customer alcohol consumption'
  },
  
  recordKeeping: {
    salesTracking: 'Detailed records of all alcohol sales',
    staffTraining: 'Documentation of responsible beverage service training',
    incidentReports: 'Complete incident reports for all alcohol-related issues',
    inventoryControl: 'Accurate tracking of alcohol inventory and shrinkage'
  }
}
```

#### Liquor License Compliance System
```bash
# Liquor License Compliance Setup
setup_liquor_compliance() {
  echo "Setting up liquor license compliance monitoring..."
  
  # Create alcohol service tracking
  setup_alcohol_service_tracking() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS alcohol_service_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        
        -- Order information
        order_id UUID REFERENCES restaurant_orders(id),
        customer_id UUID REFERENCES customers(id),
        server_id UUID NOT NULL REFERENCES user_profiles(id),
        
        -- Service details
        service_date DATE NOT NULL,
        service_time TIME NOT NULL,
        alcohol_items JSONB NOT NULL, -- Array of alcohol items served
        total_alcohol_amount DECIMAL(10,2) NOT NULL,
        
        -- Age verification
        id_checked BOOLEAN NOT NULL DEFAULT false,
        id_type VARCHAR(50), -- 'drivers_license', 'passport', 'state_id'
        id_number_hash VARCHAR(64), -- Hashed ID number for privacy
        customer_age INTEGER,
        
        -- Service decisions
        service_approved BOOLEAN NOT NULL,
        refusal_reason TEXT,
        intoxication_assessment VARCHAR(50), -- 'sober', 'slightly_impaired', 'intoxicated'
        
        -- Compliance flags
        age_compliant BOOLEAN GENERATED ALWAYS AS (customer_age >= 21) STORED,
        time_compliant BOOLEAN,
        service_compliant BOOLEAN GENERATED ALWAYS AS (service_approved AND id_checked AND customer_age >= 21) STORED,
        
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_alcohol_service_date ON alcohol_service_records(business_id, service_date);
      CREATE INDEX idx_alcohol_service_compliance ON alcohol_service_records(business_id) WHERE NOT service_compliant;
    "
  }
  
  # Set up age verification function
  setup_age_verification() {
    supabase exec function create verify_alcohol_service_compliance << 'EOF'
CREATE OR REPLACE FUNCTION verify_alcohol_service_compliance()
RETURNS TRIGGER AS $$
DECLARE
  license_hours JSONB;
  current_day TEXT;
  service_start TIME;
  service_end TIME;
BEGIN
  -- Get liquor license operating hours
  SELECT settings->'liquor_license'->'operating_hours' INTO license_hours
  FROM businesses WHERE id = NEW.business_id;
  
  -- Check if service time is within licensed hours
  current_day := TRIM(TO_CHAR(NEW.service_date, 'Day'));
  
  IF license_hours ? current_day THEN
    service_start := (license_hours->current_day->>'start')::TIME;
    service_end := (license_hours->current_day->>'end')::TIME;
    
    NEW.time_compliant := (NEW.service_time BETWEEN service_start AND service_end);
  ELSE
    -- No service allowed on this day
    NEW.time_compliant := false;
  END IF;
  
  -- Create violation record if not compliant
  IF NOT NEW.service_compliant OR NOT NEW.time_compliant THEN
    INSERT INTO compliance_violations (
      business_id, violation_type, violation_date, description, severity, employee_id
    ) VALUES (
      NEW.business_id, 'alcohol_service_violation', NEW.service_date,
      CASE 
        WHEN NOT NEW.age_compliant THEN 'Attempted service to minor'
        WHEN NOT NEW.id_checked THEN 'Failed to check ID before alcohol service'
        WHEN NOT NEW.time_compliant THEN 'Alcohol service outside licensed hours'
        WHEN NEW.refusal_reason IS NOT NULL THEN NEW.refusal_reason
        ELSE 'Alcohol service compliance violation'
      END,
      CASE 
        WHEN NOT NEW.age_compliant THEN 'critical'
        WHEN NOT NEW.time_compliant THEN 'warning'
        ELSE 'minor'
      END,
      NEW.server_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
EOF
    
    # Create trigger for alcohol service compliance
    supabase exec sql --query "
      CREATE TRIGGER trigger_verify_alcohol_service_compliance
        BEFORE INSERT ON alcohol_service_records
        FOR EACH ROW EXECUTE FUNCTION verify_alcohol_service_compliance();
    "
  }
  
  # Configure responsible beverage service tracking
  setup_rbs_certification() {
    supabase exec sql --query "
      INSERT INTO certification_requirements (business_id, role_name, required_certifications, created_at) VALUES
      ('$BUSINESS_ID', 'Bartender', ARRAY['responsible_beverage_service', 'food_handlers_permit'], NOW()),
      ('$BUSINESS_ID', 'Server', ARRAY['responsible_beverage_service', 'food_handlers_permit'], NOW())
      ON CONFLICT (business_id, role_name) DO UPDATE SET
        required_certifications = array_cat(certification_requirements.required_certifications, EXCLUDED.required_certifications),
        updated_at = NOW();
    "
  }
  
  setup_alcohol_service_tracking
  setup_age_verification
  setup_rbs_certification
}
```

## Tax Reporting and Compliance

### Sales Tax Management
```typescript
interface SalesTaxCompliance {
  taxConfiguration: {
    stateTax: 'State sales tax rate configuration',
    localTax: 'City and county tax rate configuration',
    specialTaxes: 'Alcohol tax, prepared food tax, delivery fees',
    exemptions: 'Tax exempt items and customer exemptions',
    taxHolidays: 'Special tax-free periods and rate changes'
  },
  
  reportingRequirements: {
    frequency: 'Monthly, quarterly, or annual reporting based on volume',
    deadlines: 'Automated reminders for tax filing deadlines',
    electronicFiling: 'Direct integration with state tax systems',
    auditTrails: 'Complete audit trail for all tax calculations'
  },
  
  complianceTracking: {
    rateUpdates: 'Automatic tax rate updates from authoritative sources',
    nexusMonitoring: 'Track sales to determine tax nexus obligations',
    exemptionValidation: 'Verify tax exemption certificates',
    backupWithholding: 'Backup withholding for non-compliant vendors'
  }
}
```

#### Sales Tax System Configuration
```bash
# Sales Tax Compliance System
setup_sales_tax_compliance() {
  echo "Setting up comprehensive sales tax compliance system..."
  
  # Create tax configuration tables
  setup_tax_configuration() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS tax_jurisdictions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        
        -- Jurisdiction details
        jurisdiction_name VARCHAR(255) NOT NULL,
        jurisdiction_type VARCHAR(50) CHECK (jurisdiction_type IN ('federal', 'state', 'county', 'city', 'special')),
        tax_authority VARCHAR(255) NOT NULL,
        
        -- Tax rates
        tax_rate DECIMAL(8,4) NOT NULL,
        tax_type VARCHAR(50) NOT NULL, -- 'sales', 'use', 'excise', 'prepared_food', 'alcohol'
        
        -- Applicability
        applies_to_items TEXT[], -- Array of item categories
        exemption_rules JSONB,
        
        -- Dates
        effective_date DATE NOT NULL,
        end_date DATE,
        
        -- Filing requirements
        filing_frequency VARCHAR(50) CHECK (filing_frequency IN ('monthly', 'quarterly', 'annually')),
        filing_deadline_day INTEGER, -- Day of month or quarter when due
        electronic_filing_required BOOLEAN DEFAULT false,
        
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_tax_jurisdictions_business ON tax_jurisdictions(business_id);
      CREATE INDEX idx_tax_jurisdictions_active ON tax_jurisdictions(business_id, is_active);
    "
  }
  
  # Set up tax calculation function
  setup_tax_calculation() {
    supabase exec function create calculate_order_taxes << 'EOF'
CREATE OR REPLACE FUNCTION calculate_order_taxes(p_order_id UUID)
RETURNS TABLE (
  jurisdiction_name TEXT,
  tax_type TEXT,
  tax_rate DECIMAL(8,4),
  taxable_amount DECIMAL(10,2),
  tax_amount DECIMAL(10,2)
) AS $$
DECLARE
  order_rec RECORD;
  jurisdiction_rec RECORD;
  item_rec RECORD;
  taxable_subtotal DECIMAL(10,2) := 0;
  calculated_tax DECIMAL(10,2);
BEGIN
  -- Get order details
  SELECT * INTO order_rec FROM restaurant_orders WHERE id = p_order_id;
  
  -- Loop through applicable tax jurisdictions
  FOR jurisdiction_rec IN 
    SELECT * FROM tax_jurisdictions 
    WHERE business_id = order_rec.business_id 
    AND is_active = true
    AND effective_date <= order_rec.ordered_at::DATE
    AND (end_date IS NULL OR end_date >= order_rec.ordered_at::DATE)
  LOOP
    
    taxable_subtotal := 0;
    
    -- Calculate taxable amount based on jurisdiction rules
    FOR item_rec IN 
      SELECT 
        (item->>'name')::TEXT as item_name,
        (item->>'category')::TEXT as item_category,
        (item->>'price')::DECIMAL(10,2) as item_price,
        (item->>'quantity')::INTEGER as quantity
      FROM jsonb_array_elements(order_rec.order_items) as item
    LOOP
      
      -- Check if item is subject to this tax
      IF jurisdiction_rec.applies_to_items IS NULL OR 
         item_rec.item_category = ANY(jurisdiction_rec.applies_to_items) THEN
        
        -- Check for exemptions
        IF NOT (jurisdiction_rec.exemption_rules ? item_rec.item_category) THEN
          taxable_subtotal := taxable_subtotal + (item_rec.item_price * item_rec.quantity);
        END IF;
      END IF;
      
    END LOOP;
    
    -- Calculate tax amount
    calculated_tax := ROUND(taxable_subtotal * jurisdiction_rec.tax_rate / 100, 2);
    
    -- Return tax calculation
    RETURN QUERY SELECT 
      jurisdiction_rec.jurisdiction_name::TEXT,
      jurisdiction_rec.tax_type::TEXT,
      jurisdiction_rec.tax_rate,
      taxable_subtotal,
      calculated_tax;
      
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;
EOF
  }
  
  # Set up tax filing reminders
  setup_tax_filing_reminders() {
    # Create function to check filing deadlines
    cat > /opt/thorbis/scripts/check_tax_deadlines.sql << 'EOF'
-- Check for upcoming tax filing deadlines
WITH upcoming_deadlines AS (
  SELECT 
    tj.business_id,
    tj.jurisdiction_name,
    tj.tax_type,
    tj.filing_frequency,
    tj.filing_deadline_day,
    CASE tj.filing_frequency
      WHEN 'monthly' THEN 
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' + 
        MAKE_INTERVAL(days => tj.filing_deadline_day - EXTRACT(day FROM LAST_DAY(CURRENT_DATE))::INTEGER)
      WHEN 'quarterly' THEN
        DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '3 months' + 
        MAKE_INTERVAL(days => tj.filing_deadline_day)
      WHEN 'annually' THEN
        DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' + 
        MAKE_INTERVAL(days => tj.filing_deadline_day)
    END as next_deadline
  FROM tax_jurisdictions tj
  WHERE tj.is_active = true
)
INSERT INTO tax_filing_reminders (business_id, jurisdiction_name, tax_type, filing_deadline, reminder_type, created_at)
SELECT 
  business_id,
  jurisdiction_name,
  tax_type,
  next_deadline,
  CASE 
    WHEN next_deadline - CURRENT_DATE <= INTERVAL '7 days' THEN 'urgent'
    WHEN next_deadline - CURRENT_DATE <= INTERVAL '14 days' THEN 'warning'
    ELSE 'notice'
  END as reminder_type,
  NOW()
FROM upcoming_deadlines
WHERE next_deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ON CONFLICT (business_id, jurisdiction_name, tax_type, DATE(filing_deadline)) DO NOTHING;
EOF
    
    # Schedule daily tax deadline checking
    echo "0 9 * * * psql $DATABASE_URL -f /opt/thorbis/scripts/check_tax_deadlines.sql" | crontab -
  }
  
  setup_tax_configuration
  setup_tax_calculation
  setup_tax_filing_reminders
}
```

## Fire Safety and Building Code Compliance

### Fire Safety Systems Monitoring
```typescript
interface FireSafetyCompliance {
  systemMonitoring: {
    smokeDetectors: 'Monthly testing and battery replacement tracking',
    fireExtinguishers: 'Monthly visual inspections and annual professional service',
    sprinklerSystem: 'Quarterly testing and annual inspection by certified technician',
    emergencyLighting: 'Monthly testing of emergency exit lighting',
    fireAlarms: 'Monthly testing of fire alarm system and control panel'
  },
  
  exitSafety: {
    exitRoutes: 'Keep all exit routes clear and properly marked',
    exitDoors: 'Ensure exit doors are unlocked during operating hours',
    occupancyLimits: 'Monitor and enforce maximum occupancy limits',
    emergencyProcedures: 'Posted emergency evacuation procedures'
  },
  
  kitchenSafety: {
    hoodSuppression: 'Monthly inspection of kitchen hood suppression system',
    deepFryerSafety: 'Daily temperature monitoring and safety checks',
    gasSafety: 'Regular inspection of gas lines and connections',
    electricalSafety: 'Annual inspection of electrical systems and equipment'
  }
}
```

#### Fire Safety Compliance Tracking
```bash
# Fire Safety Compliance System
setup_fire_safety_compliance() {
  echo "Setting up fire safety compliance monitoring..."
  
  # Create fire safety inspection tracking
  setup_fire_safety_inspections() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS fire_safety_inspections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        
        -- Inspection details
        inspection_type VARCHAR(100) NOT NULL, -- 'smoke_detector', 'fire_extinguisher', 'sprinkler', 'emergency_lighting'
        equipment_id VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        
        -- Inspection results
        inspection_date DATE NOT NULL,
        inspector_name VARCHAR(255) NOT NULL,
        inspection_passed BOOLEAN NOT NULL,
        deficiencies_found TEXT[],
        corrective_actions TEXT[],
        
        -- Follow-up
        next_inspection_date DATE NOT NULL,
        professional_service_required BOOLEAN DEFAULT false,
        service_provider VARCHAR(255),
        
        -- Documentation
        inspection_photos TEXT[], -- URLs to photos
        certificates TEXT[], -- URLs to certificates
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_fire_safety_next_inspection ON fire_safety_inspections(business_id, next_inspection_date);
      CREATE INDEX idx_fire_safety_failed ON fire_safety_inspections(business_id) WHERE NOT inspection_passed;
    "
  }
  
  # Set up occupancy monitoring
  setup_occupancy_monitoring() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS occupancy_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        
        -- Occupancy details
        tracking_date DATE NOT NULL,
        tracking_time TIME NOT NULL,
        current_occupancy INTEGER NOT NULL,
        maximum_occupancy INTEGER NOT NULL,
        
        -- Compliance
        occupancy_compliant BOOLEAN GENERATED ALWAYS AS (current_occupancy <= maximum_occupancy) STORED,
        
        -- Event information
        event_type VARCHAR(50), -- 'customer_entry', 'customer_exit', 'hourly_count'
        
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_occupancy_tracking_date ON occupancy_tracking(business_id, tracking_date);
      CREATE INDEX idx_occupancy_violations ON occupancy_tracking(business_id) WHERE NOT occupancy_compliant;
    "
  }
  
  # Create inspection reminder system
  setup_inspection_reminders() {
    # Daily check for due inspections
    cat > /opt/thorbis/scripts/check_fire_safety_due.sql << 'EOF'
-- Check for overdue or upcoming fire safety inspections
WITH due_inspections AS (
  SELECT 
    fsi.*,
    b.name as business_name,
    CASE 
      WHEN next_inspection_date < CURRENT_DATE THEN 'overdue'
      WHEN next_inspection_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
      WHEN next_inspection_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'upcoming'
    END as urgency_level
  FROM fire_safety_inspections fsi
  JOIN businesses b ON fsi.business_id = b.id
  WHERE fsi.next_inspection_date <= CURRENT_DATE + INTERVAL '30 days'
  AND fsi.id = (
    SELECT MAX(id) FROM fire_safety_inspections fsi2 
    WHERE fsi2.business_id = fsi.business_id 
    AND fsi2.equipment_id = fsi.equipment_id
  )
)
INSERT INTO fire_safety_alerts (business_id, inspection_type, equipment_id, location, due_date, urgency_level, message, created_at)
SELECT 
  business_id,
  inspection_type,
  equipment_id,
  location,
  next_inspection_date,
  urgency_level,
  format('%s inspection for %s at %s is %s (due: %s)', 
         inspection_type, equipment_id, location, urgency_level, next_inspection_date),
  NOW()
FROM due_inspections
ON CONFLICT (business_id, equipment_id, DATE(due_date)) DO NOTHING;
EOF
    
    # Schedule daily fire safety inspection check
    echo "0 7 * * * psql $DATABASE_URL -f /opt/thorbis/scripts/check_fire_safety_due.sql" | crontab -
  }
  
  setup_fire_safety_inspections
  setup_occupancy_monitoring
  setup_inspection_reminders
}
```

## Environmental and Waste Management

### Waste Reduction and Recycling Compliance
```typescript
interface EnvironmentalCompliance {
  wasteManagement: {
    wasteTracking: 'Track all waste streams including food waste, recyclables, and general waste',
    composting: 'Separate organic waste for composting where required by local ordinances',
    oilDisposal: 'Proper disposal of used cooking oil through certified waste management',
    hazardousWaste: 'Safe disposal of cleaning chemicals and other hazardous materials'
  },
  
  energyEfficiency: {
    energyMonitoring: 'Track energy usage and identify efficiency opportunities',
    equipmentMaintenance: 'Regular maintenance of HVAC and refrigeration for efficiency',
    lightingUpgrades: 'LED lighting and automatic controls for energy savings',
    waterConservation: 'Low-flow fixtures and leak detection systems'
  },
  
  sustainabilityReporting: {
    carbonFootprint: 'Calculate and report carbon footprint from operations',
    wasteReduction: 'Track progress on waste reduction goals',
    sustainableSourcing: 'Document sustainable and local sourcing practices',
    certifications: 'Maintain green certifications and environmental awards'
  }
}
```

#### Environmental Compliance System
```bash
# Environmental Compliance Setup
setup_environmental_compliance() {
  echo "Setting up environmental compliance monitoring..."
  
  # Create waste tracking system
  setup_waste_tracking() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS waste_tracking_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        
        -- Waste details
        tracking_date DATE NOT NULL,
        waste_type VARCHAR(100) NOT NULL, -- 'food_waste', 'recyclables', 'general_waste', 'cooking_oil', 'hazardous'
        waste_category VARCHAR(100), -- 'pre_consumer', 'post_consumer', 'packaging'
        
        -- Measurements
        weight_pounds DECIMAL(8,2),
        volume_cubic_feet DECIMAL(8,2),
        container_count INTEGER,
        
        -- Disposal information
        disposal_method VARCHAR(100) NOT NULL, -- 'landfill', 'compost', 'recycle', 'reuse', 'anaerobic_digestion'
        waste_hauler VARCHAR(255),
        disposal_cost DECIMAL(10,2),
        
        -- Compliance tracking
        disposal_certificate_number VARCHAR(100),
        manifest_number VARCHAR(100), -- For hazardous waste
        
        -- Notes and observations
        notes TEXT,
        reduction_opportunities TEXT,
        
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_waste_tracking_date ON waste_tracking_records(business_id, tracking_date);
      CREATE INDEX idx_waste_tracking_type ON waste_tracking_records(business_id, waste_type);
    "
  }
  
  # Set up energy monitoring
  setup_energy_monitoring() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS energy_usage_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        
        -- Usage period
        usage_date DATE NOT NULL,
        usage_type VARCHAR(50) NOT NULL, -- 'electricity', 'gas', 'water'
        meter_number VARCHAR(100),
        
        -- Consumption data
        consumption_amount DECIMAL(12,2) NOT NULL,
        unit_of_measure VARCHAR(20) NOT NULL, -- 'kwh', 'therms', 'gallons'
        cost_per_unit DECIMAL(8,4),
        total_cost DECIMAL(10,2),
        
        -- Efficiency metrics
        consumption_per_square_foot DECIMAL(8,2),
        consumption_per_customer DECIMAL(8,2),
        
        -- Comparison data
        previous_period_consumption DECIMAL(12,2),
        percentage_change DECIMAL(5,2),
        
        -- Equipment efficiency
        hvac_efficiency_rating VARCHAR(20),
        refrigeration_efficiency_rating VARCHAR(20),
        
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_energy_usage_date ON energy_usage_tracking(business_id, usage_date);
      CREATE INDEX idx_energy_usage_type ON energy_usage_tracking(business_id, usage_type);
    "
  }
  
  # Create sustainability reporting
  setup_sustainability_reporting() {
    # Monthly sustainability summary
    cat > /opt/thorbis/scripts/generate_sustainability_report.sql << 'EOF'
-- Generate monthly sustainability report
WITH monthly_waste AS (
  SELECT 
    business_id,
    DATE_TRUNC('month', tracking_date) as report_month,
    waste_type,
    SUM(weight_pounds) as total_weight_pounds,
    SUM(disposal_cost) as total_disposal_cost,
    COUNT(*) as disposal_events
  FROM waste_tracking_records
  WHERE tracking_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND tracking_date < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY business_id, DATE_TRUNC('month', tracking_date), waste_type
),
monthly_energy AS (
  SELECT
    business_id,
    DATE_TRUNC('month', usage_date) as report_month,
    usage_type,
    SUM(consumption_amount) as total_consumption,
    SUM(total_cost) as total_cost,
    AVG(consumption_per_customer) as avg_consumption_per_customer
  FROM energy_usage_tracking
  WHERE usage_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND usage_date < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY business_id, DATE_TRUNC('month', usage_date), usage_type
)
INSERT INTO sustainability_reports (business_id, report_month, waste_data, energy_data, created_at)
SELECT 
  COALESCE(mw.business_id, me.business_id) as business_id,
  COALESCE(mw.report_month, me.report_month) as report_month,
  json_agg(DISTINCT jsonb_build_object(
    'waste_type', mw.waste_type,
    'total_weight_pounds', mw.total_weight_pounds,
    'total_disposal_cost', mw.total_disposal_cost,
    'disposal_events', mw.disposal_events
  )) FILTER (WHERE mw.waste_type IS NOT NULL) as waste_data,
  json_agg(DISTINCT jsonb_build_object(
    'usage_type', me.usage_type,
    'total_consumption', me.total_consumption,
    'total_cost', me.total_cost,
    'avg_consumption_per_customer', me.avg_consumption_per_customer
  )) FILTER (WHERE me.usage_type IS NOT NULL) as energy_data,
  NOW()
FROM monthly_waste mw
FULL OUTER JOIN monthly_energy me ON mw.business_id = me.business_id AND mw.report_month = me.report_month
GROUP BY COALESCE(mw.business_id, me.business_id), COALESCE(mw.report_month, me.report_month)
ON CONFLICT (business_id, report_month) DO UPDATE SET
  waste_data = EXCLUDED.waste_data,
  energy_data = EXCLUDED.energy_data,
  updated_at = NOW();
EOF
    
    # Schedule monthly sustainability report generation
    echo "0 2 1 * * psql $DATABASE_URL -f /opt/thorbis/scripts/generate_sustainability_report.sql" | crontab -
  }
  
  setup_waste_tracking
  setup_energy_monitoring
  setup_sustainability_reporting
}
```

## Automated Compliance Monitoring

### Comprehensive Compliance Dashboard
```typescript
interface ComplianceMonitoring {
  dashboardMetrics: {
    complianceScore: 'Overall compliance score across all categories',
    riskAreas: 'High-risk compliance areas requiring attention',
    violationTrends: 'Trend analysis of compliance violations over time',
    actionItems: 'Open corrective actions and their due dates'
  },
  
  alertManagement: {
    criticalAlerts: 'Immediate attention required for critical violations',
    warningAlerts: 'Upcoming deadlines and minor violations',
    informationalAlerts: 'Compliance reminders and best practices',
    escalationProtocols: 'Automatic escalation for unresolved issues'
  },
  
  reportingAutomation: {
    regulatoryReports: 'Automated generation of regulatory reports',
    auditPreparation: 'Audit-ready documentation and evidence gathering',
    performanceMetrics: 'Key performance indicators for compliance management',
    continuousImprovement: 'Recommendations for compliance process improvements'
  }
}
```

#### Compliance Dashboard Setup
```bash
# Comprehensive Compliance Monitoring Dashboard
setup_compliance_dashboard() {
  echo "Setting up comprehensive compliance monitoring dashboard..."
  
  # Create compliance scoring system
  setup_compliance_scoring() {
    supabase exec function create calculate_compliance_score << 'EOF'
CREATE OR REPLACE FUNCTION calculate_compliance_score(p_business_id UUID, p_assessment_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  health_score DECIMAL(5,2);
  labor_score DECIMAL(5,2);
  liquor_score DECIMAL(5,2);
  fire_score DECIMAL(5,2);
  tax_score DECIMAL(5,2);
  environmental_score DECIMAL(5,2);
  overall_score DECIMAL(5,2);
  compliance_result JSONB;
BEGIN
  -- Calculate health department compliance score
  SELECT 
    100.0 - (COUNT(*) FILTER (WHERE severity = 'critical') * 15.0) -
            (COUNT(*) FILTER (WHERE severity = 'warning') * 5.0) -
            (COUNT(*) FILTER (WHERE severity = 'minor') * 1.0)
  INTO health_score
  FROM compliance_violations
  WHERE business_id = p_business_id
  AND violation_type IN ('temperature_violation', 'food_safety_violation', 'haccp_violation')
  AND violation_date >= p_assessment_date - INTERVAL '30 days';
  
  -- Calculate labor law compliance score
  SELECT 
    100.0 - (COUNT(*) FILTER (WHERE severity = 'critical') * 20.0) -
            (COUNT(*) FILTER (WHERE severity = 'warning') * 8.0) -
            (COUNT(*) FILTER (WHERE severity = 'minor') * 2.0)
  INTO labor_score
  FROM compliance_violations
  WHERE business_id = p_business_id
  AND violation_type IN ('meal_break_violation', 'rest_break_violation', 'max_hours_violation', 'overtime_violation')
  AND violation_date >= p_assessment_date - INTERVAL '30 days';
  
  -- Calculate liquor license compliance score
  SELECT 
    100.0 - (COUNT(*) FILTER (WHERE severity = 'critical') * 25.0) -
            (COUNT(*) FILTER (WHERE severity = 'warning') * 10.0) -
            (COUNT(*) FILTER (WHERE severity = 'minor') * 3.0)
  INTO liquor_score
  FROM compliance_violations
  WHERE business_id = p_business_id
  AND violation_type IN ('alcohol_service_violation', 'age_verification_violation')
  AND violation_date >= p_assessment_date - INTERVAL '30 days';
  
  -- Calculate fire safety compliance score
  SELECT 
    100.0 - (COUNT(*) * 5.0)
  INTO fire_score
  FROM fire_safety_inspections
  WHERE business_id = p_business_id
  AND inspection_date >= p_assessment_date - INTERVAL '30 days'
  AND NOT inspection_passed;
  
  -- Calculate tax compliance score (simplified)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 100.0
      ELSE GREATEST(0.0, 100.0 - (COUNT(*) * 10.0))
    END
  INTO tax_score
  FROM tax_filing_reminders
  WHERE business_id = p_business_id
  AND filing_deadline < p_assessment_date
  AND reminder_type = 'urgent';
  
  -- Calculate environmental compliance score
  SELECT 
    CASE 
      WHEN COUNT(wtr.*) = 0 THEN 100.0
      ELSE 100.0 - (COUNT(*) FILTER (WHERE wtr.disposal_method = 'landfill') * 2.0)
    END
  INTO environmental_score
  FROM waste_tracking_records wtr
  WHERE wtr.business_id = p_business_id
  AND wtr.tracking_date >= p_assessment_date - INTERVAL '30 days';
  
  -- Ensure scores are within valid range
  health_score := GREATEST(0.0, LEAST(100.0, COALESCE(health_score, 100.0)));
  labor_score := GREATEST(0.0, LEAST(100.0, COALESCE(labor_score, 100.0)));
  liquor_score := GREATEST(0.0, LEAST(100.0, COALESCE(liquor_score, 100.0)));
  fire_score := GREATEST(0.0, LEAST(100.0, COALESCE(fire_score, 100.0)));
  tax_score := GREATEST(0.0, LEAST(100.0, COALESCE(tax_score, 100.0)));
  environmental_score := GREATEST(0.0, LEAST(100.0, COALESCE(environmental_score, 100.0)));
  
  -- Calculate weighted overall score
  overall_score := (health_score * 0.25) + (labor_score * 0.20) + (liquor_score * 0.15) + 
                   (fire_score * 0.15) + (tax_score * 0.15) + (environmental_score * 0.10);
  
  -- Build result JSON
  compliance_result := jsonb_build_object(
    'assessment_date', p_assessment_date,
    'overall_score', ROUND(overall_score, 2),
    'category_scores', jsonb_build_object(
      'health_department', ROUND(health_score, 2),
      'labor_law', ROUND(labor_score, 2),
      'liquor_license', ROUND(liquor_score, 2),
      'fire_safety', ROUND(fire_score, 2),
      'tax_compliance', ROUND(tax_score, 2),
      'environmental', ROUND(environmental_score, 2)
    ),
    'grade', CASE 
      WHEN overall_score >= 95 THEN 'A+'
      WHEN overall_score >= 90 THEN 'A'
      WHEN overall_score >= 85 THEN 'B+'
      WHEN overall_score >= 80 THEN 'B'
      WHEN overall_score >= 75 THEN 'C+'
      WHEN overall_score >= 70 THEN 'C'
      WHEN overall_score >= 65 THEN 'D'
      ELSE 'F'
    END
  );
  
  RETURN compliance_result;
END;
$$ LANGUAGE plpgsql;
EOF
  }
  
  # Set up automated compliance reporting
  setup_automated_reporting() {
    # Daily compliance summary
    cat > /opt/thorbis/scripts/daily_compliance_summary.sql << 'EOF'
-- Generate daily compliance summary
WITH daily_compliance AS (
  SELECT 
    business_id,
    calculate_compliance_score(business_id, CURRENT_DATE) as compliance_data
  FROM businesses
  WHERE industry = 'restaurant'
)
INSERT INTO compliance_summaries (business_id, report_date, compliance_score, category_scores, grade, created_at)
SELECT 
  business_id,
  CURRENT_DATE,
  (compliance_data->>'overall_score')::DECIMAL(5,2),
  compliance_data->'category_scores',
  compliance_data->>'grade',
  NOW()
FROM daily_compliance
ON CONFLICT (business_id, report_date) DO UPDATE SET
  compliance_score = EXCLUDED.compliance_score,
  category_scores = EXCLUDED.category_scores,
  grade = EXCLUDED.grade,
  updated_at = NOW();
EOF
    
    # Schedule daily compliance summary
    echo "0 6 * * * psql $DATABASE_URL -f /opt/thorbis/scripts/daily_compliance_summary.sql" | crontab -
  }
  
  # Set up compliance alert management
  setup_compliance_alerts() {
    supabase exec function create process_compliance_alerts << 'EOF'
CREATE OR REPLACE FUNCTION process_compliance_alerts()
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  business_rec RECORD;
  compliance_data JSONB;
  alert_message TEXT;
BEGIN
  -- Process alerts for each restaurant business
  FOR business_rec IN 
    SELECT id, name FROM businesses WHERE industry = 'restaurant'
  LOOP
    
    -- Get current compliance score
    SELECT calculate_compliance_score(business_rec.id) INTO compliance_data;
    
    -- Check for critical compliance issues
    IF (compliance_data->'category_scores'->>'health_department')::DECIMAL < 70 THEN
      INSERT INTO compliance_alerts (business_id, alert_type, severity, message, created_at)
      VALUES (business_rec.id, 'health_compliance', 'critical',
              format('Health department compliance score is %s%% - immediate attention required',
                     compliance_data->'category_scores'->>'health_department'), NOW());
      alert_count := alert_count + 1;
    END IF;
    
    IF (compliance_data->'category_scores'->>'labor_law')::DECIMAL < 75 THEN
      INSERT INTO compliance_alerts (business_id, alert_type, severity, message, created_at)
      VALUES (business_rec.id, 'labor_compliance', 'warning',
              format('Labor law compliance score is %s%% - review required',
                     compliance_data->'category_scores'->>'labor_law'), NOW());
      alert_count := alert_count + 1;
    END IF;
    
    IF (compliance_data->'category_scores'->>'liquor_license')::DECIMAL < 80 THEN
      INSERT INTO compliance_alerts (business_id, alert_type, severity, message, created_at)
      VALUES (business_rec.id, 'liquor_compliance', 'warning',
              format('Liquor license compliance score is %s%% - training may be needed',
                     compliance_data->'category_scores'->>'liquor_license'), NOW());
      alert_count := alert_count + 1;
    END IF;
    
  END LOOP;
  
  RETURN alert_count;
END;
$$ LANGUAGE plpgsql;
EOF
    
    # Schedule hourly compliance alert processing
    echo "0 * * * * psql $DATABASE_URL -c 'SELECT process_compliance_alerts();'" | crontab -
  }
  
  setup_compliance_scoring
  setup_automated_reporting
  setup_compliance_alerts
}
```

---

*This Restaurant Compliance & Reporting Guide provides comprehensive coverage of all regulatory requirements and automated monitoring systems to ensure full compliance with health, safety, labor, and environmental regulations. Regular updates ensure continued adherence to evolving regulatory requirements.*