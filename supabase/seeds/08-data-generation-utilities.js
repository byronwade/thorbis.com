/**
 * =============================================================================
 * THORBIS BUSINESS OS - DATA GENERATION UTILITIES
 * =============================================================================
 * Phase 1: Faker.js utilities for generating realistic business data
 * Created: 2025-01-31
 * Version: 2.0.0
 * 
 * This utility script generates realistic mock data for all industries in the
 * Thorbis Business OS platform. It uses Faker.js to create believable business
 * data across multiple industries and use cases.
 */

const { faker } = require('@faker-js/faker');

/**
 * =============================================================================
 * INDUSTRY-SPECIFIC DATA GENERATORS
 * =============================================================================
 */

/**
 * Home Services Data Generation
 */
class HomeServicesGenerator {
  static serviceCategories = [
    'plumbing', 'hvac', 'electrical', 'roofing', 'landscaping', 
    'pest_control', 'cleaning', 'handyman', 'security', 'solar'
  ];

  static jobTypes = [
    'repair', 'installation', 'maintenance', 'inspection', 
    'emergency', 'consultation', 'upgrade', 'replacement'
  ];

  static generateCustomer() {
    const customerType = faker.helpers.arrayElement(['residential', 'commercial', 'industrial']);
    const isCommercial = customerType !== 'residential';
    
    return {
      id: faker.string.uuid(),
      customer_number: `CUST-${faker.number.int({ min: 100000, max: 999999 })}`,
      type: customerType,
      first_name: isCommercial ? null : faker.person.firstName(),
      last_name: isCommercial ? null : faker.person.lastName(),
      company_name: isCommercial ? faker.company.name() : null,
      email: faker.internet.email(),
      phone: faker.phone.number(),
      billing_address: this.generateAddress(),
      service_address: faker.datatype.boolean() ? this.generateAddress() : null,
      source: faker.helpers.arrayElement(['referral', 'google', 'website', 'social_media', 'yellowpages']),
      lifetime_value: faker.number.float({ min: 500, max: 25000, fractionDigits: 2 }),
      total_jobs: faker.number.int({ min: 1, max: 50 }),
      average_rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
      tags: faker.helpers.arrayElements(['vip', 'frequent', 'commercial', 'emergency_only'], { min: 0, max: 2 }),
      created_at: faker.date.past({ years: 3 }),
      updated_at: faker.date.recent({ days: 30 })
    };
  }

  static generateWorkOrder(customerId, technicianId) {
    const category = faker.helpers.arrayElement(this.serviceCategories);
    const jobType = faker.helpers.arrayElement(this.jobTypes);
    const scheduledStart = faker.date.future({ days: 30 });
    const scheduledEnd = new Date(scheduledStart.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later
    
    return {
      id: faker.string.uuid(),
      work_order_number: `WO-${faker.number.int({ min: 100000, max: 999999 })}`,
      customer_id: customerId,
      assigned_technician_id: technicianId,
      title: `${jobType.charAt(0).toUpperCase() + jobType.slice(1)} - ${category.toUpperCase()}`,
      description: faker.lorem.sentences(2),
      service_category: category,
      job_type: jobType,
      status: faker.helpers.arrayElement(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'emergency']),
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      estimated_duration: faker.number.int({ min: 60, max: 480 }), // 1-8 hours in minutes
      total_amount: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
      special_instructions: faker.lorem.sentence(),
      created_at: faker.date.past({ days: 90 }),
      updated_at: faker.date.recent({ days: 7 })
    };
  }

  static generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'US'
    };
  }

  static generateEquipment() {
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Carrier HVAC Unit', 'Trane Heat Pump', 'Rheem Water Heater',
        'Kohler Toilet', 'Delta Faucet', 'GE Refrigerator'
      ]),
      model: faker.vehicle.model(),
      serial_number: faker.string.alphanumeric(10).toUpperCase(),
      manufacturer: faker.company.name(),
      installation_date: faker.date.past({ years: 10 }),
      warranty_expires: faker.date.future({ years: 2 }),
      last_service_date: faker.date.past({ days: 180 }),
      notes: faker.lorem.sentence()
    };
  }
}

/**
 * Restaurant Data Generation
 */
class RestaurantGenerator {
  static cuisineTypes = [
    'italian', 'mexican', 'chinese', 'indian', 'thai', 'french',
    'american', 'japanese', 'mediterranean', 'seafood', 'steakhouse'
  ];

  static menuCategories = [
    'appetizers', 'soups', 'salads', 'entrees', 'desserts', 'beverages',
    'wines', 'cocktails', 'sides', 'specials'
  ];

  static generateCustomer() {
    return {
      id: faker.string.uuid(),
      customer_number: `GUEST-${faker.number.int({ min: 100000, max: 999999 })}`,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      visit_count: faker.number.int({ min: 1, max: 50 }),
      total_spent: faker.number.float({ min: 25, max: 2500, fractionDigits: 2 }),
      average_party_size: faker.number.int({ min: 1, max: 8 }),
      preferred_time: faker.helpers.arrayElement(['breakfast', 'lunch', 'dinner', 'late_night']),
      dietary_restrictions: faker.helpers.arrayElements(['vegetarian', 'vegan', 'gluten_free', 'dairy_free'], { min: 0, max: 2 }),
      loyalty_points: faker.number.int({ min: 0, max: 5000 }),
      last_visit: faker.date.past({ days: 90 }),
      created_at: faker.date.past({ years: 2 })
    };
  }

  static generateMenuItem() {
    const category = faker.helpers.arrayElement(this.menuCategories);
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Grilled Salmon', 'Caesar Salad', 'Beef Tenderloin', 'Pasta Carbonara',
        'Chocolate Cake', 'House Wine', 'Craft Cocktail', 'Artisan Pizza'
      ]),
      description: faker.lorem.sentence(),
      category: category,
      price: faker.number.float({ min: 8.99, max: 45.99, fractionDigits: 2 }),
      cost: faker.number.float({ min: 2.50, max: 15.00, fractionDigits: 2 }),
      calories: faker.number.int({ min: 200, max: 1200 }),
      prep_time: faker.number.int({ min: 5, max: 30 }),
      allergens: faker.helpers.arrayElements(['nuts', 'dairy', 'gluten', 'shellfish'], { min: 0, max: 2 }),
      available: faker.datatype.boolean(),
      seasonal: faker.datatype.boolean(),
      featured: faker.datatype.boolean()
    };
  }

  static generateOrder(customerId) {
    const orderTime = faker.date.past({ days: 30 });
    return {
      id: faker.string.uuid(),
      order_number: faker.number.int({ min: 1000, max: 9999 }),
      customer_id: customerId,
      table_number: faker.number.int({ min: 1, max: 50 }),
      party_size: faker.number.int({ min: 1, max: 8 }),
      order_type: faker.helpers.arrayElement(['dine_in', 'takeout', 'delivery', 'catering']),
      status: faker.helpers.arrayElement(['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled']),
      subtotal: faker.number.float({ min: 25, max: 300, fractionDigits: 2 }),
      tax_amount: faker.number.float({ min: 2, max: 25, fractionDigits: 2 }),
      tip_amount: faker.number.float({ min: 5, max: 60, fractionDigits: 2 }),
      total_amount: faker.number.float({ min: 32, max: 385, fractionDigits: 2 }),
      payment_method: faker.helpers.arrayElement(['cash', 'credit_card', 'debit_card', 'mobile_pay']),
      special_instructions: faker.lorem.sentence(),
      order_time: orderTime,
      fulfilled_time: new Date(orderTime.getTime() + (45 * 60 * 1000)) // 45 minutes later
    };
  }

  static generateReservation(customerId) {
    const reservationTime = faker.date.future({ days: 60 });
    return {
      id: faker.string.uuid(),
      customer_id: customerId,
      party_size: faker.number.int({ min: 1, max: 12 }),
      reservation_time: reservationTime,
      table_number: faker.number.int({ min: 1, max: 50 }),
      status: faker.helpers.arrayElement(['confirmed', 'seated', 'no_show', 'cancelled']),
      special_requests: faker.lorem.sentence(),
      occasion: faker.helpers.arrayElement(['birthday', 'anniversary', 'business', 'date_night', null]),
      created_at: faker.date.past({ days: 7 })
    };
  }
}

/**
 * Auto Services Data Generation
 */
class AutoGenerator {
  static vehicleMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
    'Audi', 'Lexus', 'Nissan', 'Hyundai', 'Volkswagen', 'Mazda'
  ];

  static serviceTypes = [
    'oil_change', 'brake_service', 'transmission', 'engine_repair',
    'diagnostics', 'tire_service', 'alignment', 'air_conditioning',
    'electrical', 'suspension', 'exhaust', 'cooling_system'
  ];

  static generateCustomer() {
    return {
      id: faker.string.uuid(),
      customer_number: `AUTO-${faker.number.int({ min: 100000, max: 999999 })}`,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: this.generateAddress(),
      vehicle_count: faker.number.int({ min: 1, max: 5 }),
      lifetime_value: faker.number.float({ min: 200, max: 15000, fractionDigits: 2 }),
      preferred_contact: faker.helpers.arrayElement(['phone', 'email', 'text']),
      customer_since: faker.date.past({ years: 5 }),
      last_service: faker.date.past({ days: 180 }),
      loyalty_level: faker.helpers.arrayElement(['bronze', 'silver', 'gold', 'platinum'])
    };
  }

  static generateVehicle(customerId) {
    const make = faker.helpers.arrayElement(this.vehicleMakes);
    const year = faker.date.between({ from: '1990-01-01', to: new Date() }).getFullYear();
    
    return {
      id: faker.string.uuid(),
      customer_id: customerId,
      year: year,
      make: make,
      model: faker.vehicle.model(),
      trim: faker.vehicle.type(),
      vin: faker.vehicle.vin(),
      license_plate: faker.vehicle.vrm(),
      color: faker.vehicle.color(),
      mileage: faker.number.int({ min: 5000, max: 250000 }),
      engine_size: faker.helpers.arrayElement(['1.4L', '1.6L', '2.0L', '2.4L', '3.0L', '3.5L', '4.0L', '5.0L']),
      transmission: faker.helpers.arrayElement(['manual', 'automatic', 'cvt']),
      fuel_type: faker.helpers.arrayElement(['gasoline', 'diesel', 'hybrid', 'electric']),
      purchase_date: faker.date.past({ years: 8 }),
      warranty_expires: faker.date.future({ years: 2 }),
      notes: faker.lorem.sentence()
    };
  }

  static generateServiceRecord(vehicleId, customerId) {
    const serviceType = faker.helpers.arrayElement(this.serviceTypes);
    const serviceDate = faker.date.past({ days: 365 });
    
    return {
      id: faker.string.uuid(),
      service_order_number: `SO-${faker.number.int({ min: 100000, max: 999999 })}`,
      vehicle_id: vehicleId,
      customer_id: customerId,
      service_date: serviceDate,
      service_type: serviceType,
      mileage_at_service: faker.number.int({ min: 10000, max: 200000 }),
      description: faker.lorem.sentences(2),
      parts_used: faker.lorem.words(3),
      labor_hours: faker.number.float({ min: 0.5, max: 8.0, fractionDigits: 1 }),
      parts_cost: faker.number.float({ min: 25, max: 800, fractionDigits: 2 }),
      labor_cost: faker.number.float({ min: 50, max: 600, fractionDigits: 2 }),
      total_cost: faker.number.float({ min: 75, max: 1400, fractionDigits: 2 }),
      technician_name: faker.person.fullName(),
      next_service_due: new Date(serviceDate.getTime() + (90 * 24 * 60 * 60 * 1000)), // 90 days later
      warranty_period: faker.number.int({ min: 30, max: 365 }),
      customer_rating: faker.number.int({ min: 3, max: 5 })
    };
  }

  static generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'US'
    };
  }
}

/**
 * Retail Data Generation
 */
class RetailGenerator {
  static productCategories = [
    'clothing', 'electronics', 'home_garden', 'sports', 'beauty',
    'books', 'toys', 'automotive', 'jewelry', 'health'
  ];

  static generateCustomer() {
    return {
      id: faker.string.uuid(),
      customer_number: `RET-${faker.number.int({ min: 100000, max: 999999 })}`,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      birth_date: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
      address: this.generateAddress(),
      loyalty_number: faker.string.alphanumeric(10).toUpperCase(),
      loyalty_points: faker.number.int({ min: 0, max: 10000 }),
      total_purchases: faker.number.float({ min: 50, max: 5000, fractionDigits: 2 }),
      purchase_count: faker.number.int({ min: 1, max: 50 }),
      average_order_value: faker.number.float({ min: 25, max: 300, fractionDigits: 2 }),
      preferred_categories: faker.helpers.arrayElements(this.productCategories, { min: 1, max: 3 }),
      marketing_opt_in: faker.datatype.boolean(),
      created_at: faker.date.past({ years: 3 })
    };
  }

  static generateProduct() {
    const category = faker.helpers.arrayElement(this.productCategories);
    const cost = faker.number.float({ min: 5, max: 200, fractionDigits: 2 });
    const markup = faker.number.float({ min: 1.5, max: 3.0, fractionDigits: 2 });
    
    return {
      id: faker.string.uuid(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      category: category,
      brand: faker.company.name(),
      cost: cost,
      price: parseFloat((cost * markup).toFixed(2)),
      msrp: parseFloat((cost * markup * 1.2).toFixed(2)),
      weight: faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }),
      dimensions: {
        length: faker.number.float({ min: 1, max: 50, fractionDigits: 1 }),
        width: faker.number.float({ min: 1, max: 50, fractionDigits: 1 }),
        height: faker.number.float({ min: 1, max: 50, fractionDigits: 1 })
      },
      color: faker.color.human(),
      size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']),
      stock_quantity: faker.number.int({ min: 0, max: 1000 }),
      reorder_point: faker.number.int({ min: 10, max: 100 }),
      supplier: faker.company.name(),
      barcode: faker.string.numeric(12),
      active: faker.datatype.boolean(),
      featured: faker.datatype.boolean()
    };
  }

  static generateSale(customerId, productIds) {
    const saleDate = faker.date.past({ days: 90 });
    const itemCount = faker.number.int({ min: 1, max: 5 });
    
    return {
      id: faker.string.uuid(),
      transaction_number: faker.number.int({ min: 100000, max: 999999 }),
      customer_id: customerId,
      sale_date: saleDate,
      cashier_id: faker.string.uuid(),
      subtotal: faker.number.float({ min: 25, max: 500, fractionDigits: 2 }),
      tax_amount: faker.number.float({ min: 2, max: 40, fractionDigits: 2 }),
      discount_amount: faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
      total_amount: faker.number.float({ min: 27, max: 540, fractionDigits: 2 }),
      payment_method: faker.helpers.arrayElement(['cash', 'credit', 'debit', 'mobile_pay', 'gift_card']),
      loyalty_points_earned: faker.number.int({ min: 1, max: 50 }),
      loyalty_points_redeemed: faker.number.int({ min: 0, max: 100 }),
      item_count: itemCount,
      return_eligible: faker.datatype.boolean()
    };
  }

  static generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'US'
    };
  }
}

/**
 * Education Data Generation
 */
class EducationGenerator {
  static subjectAreas = [
    'mathematics', 'science', 'english', 'history', 'art', 'music',
    'physical_education', 'computer_science', 'business', 'psychology'
  ];

  static courseLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

  static generateStudent() {
    const birthDate = faker.date.birthdate({ min: 16, max: 65, mode: 'age' });
    
    return {
      id: faker.string.uuid(),
      student_id: faker.string.alphanumeric(8).toUpperCase(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      birth_date: birthDate,
      address: this.generateAddress(),
      emergency_contact: faker.person.fullName(),
      emergency_phone: faker.phone.number(),
      enrollment_date: faker.date.past({ years: 2 }),
      student_status: faker.helpers.arrayElement(['active', 'inactive', 'graduated', 'withdrawn']),
      gpa: faker.number.float({ min: 2.0, max: 4.0, fractionDigits: 2 }),
      credits_earned: faker.number.int({ min: 0, max: 120 }),
      expected_graduation: faker.date.future({ years: 2 }),
      program: faker.helpers.arrayElement([
        'Computer Science', 'Business Administration', 'Engineering',
        'Liberal Arts', 'Nursing', 'Education'
      ]),
      financial_aid: faker.datatype.boolean()
    };
  }

  static generateCourse() {
    const subject = faker.helpers.arrayElement(this.subjectAreas);
    
    return {
      id: faker.string.uuid(),
      course_code: `${subject.substring(0, 3).toUpperCase()}${faker.number.int({ min: 100, max: 499 })}`,
      title: faker.lorem.words(3),
      description: faker.lorem.sentences(3),
      subject_area: subject,
      level: faker.helpers.arrayElement(this.courseLevels),
      credits: faker.number.int({ min: 1, max: 4 }),
      max_enrollment: faker.number.int({ min: 15, max: 100 }),
      current_enrollment: faker.number.int({ min: 5, max: 95 }),
      instructor_id: faker.string.uuid(),
      schedule: {
        days: faker.helpers.arrayElements(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], { min: 1, max: 3 }),
        start_time: faker.helpers.arrayElement(['08:00', '09:30', '11:00', '13:00', '14:30', '16:00']),
        end_time: faker.helpers.arrayElement(['09:20', '10:50', '12:20', '14:20', '15:50', '17:20'])
      },
      classroom: `Room ${faker.number.int({ min: 100, max: 599 })}`,
      prerequisites: faker.lorem.words(2),
      textbook: faker.lorem.words(4),
      active: faker.datatype.boolean()
    };
  }

  static generateEnrollment(studentId, courseId) {
    const enrollmentDate = faker.date.past({ months: 4 });
    
    return {
      id: faker.string.uuid(),
      student_id: studentId,
      course_id: courseId,
      enrollment_date: enrollmentDate,
      semester: faker.helpers.arrayElement(['fall', 'spring', 'summer']),
      year: enrollmentDate.getFullYear(),
      status: faker.helpers.arrayElement(['enrolled', 'completed', 'dropped', 'withdrew']),
      grade: faker.helpers.arrayElement(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']),
      attendance_rate: faker.number.float({ min: 0.7, max: 1.0, fractionDigits: 2 }),
      participation_score: faker.number.int({ min: 70, max: 100 }),
      final_score: faker.number.float({ min: 65, max: 98, fractionDigits: 1 })
    };
  }

  static generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'US'
    };
  }
}

/**
 * Payroll Data Generation
 */
class PayrollGenerator {
  static generateClient() {
    const companySize = faker.helpers.arrayElement(['small', 'medium', 'large', 'enterprise']);
    const employeeCount = this.getEmployeeCountBySize(companySize);
    
    return {
      id: faker.string.uuid(),
      client_number: `PAY-${faker.number.int({ min: 10000, max: 99999 })}`,
      company_name: faker.company.name(),
      industry: faker.helpers.arrayElement([
        'technology', 'healthcare', 'manufacturing', 'retail', 'construction',
        'professional_services', 'hospitality', 'education', 'finance'
      ]),
      tax_id: faker.string.numeric(9),
      address: this.generateAddress(),
      contact_person: faker.person.fullName(),
      contact_email: faker.internet.email(),
      contact_phone: faker.phone.number(),
      employee_count: employeeCount,
      payroll_frequency: faker.helpers.arrayElement(['weekly', 'bi_weekly', 'semi_monthly', 'monthly']),
      pay_date: faker.date.future({ days: 14 }),
      setup_date: faker.date.past({ years: 2 }),
      annual_revenue: faker.number.float({ min: 500000, max: 50000000, fractionDigits: 2 }),
      service_level: faker.helpers.arrayElement(['basic', 'standard', 'premium', 'enterprise']),
      multi_state: faker.datatype.boolean(),
      active: faker.datatype.boolean()
    };
  }

  static generateEmployee(clientId) {
    const hireDate = faker.date.past({ years: 5 });
    const isHourly = faker.datatype.boolean();
    
    return {
      id: faker.string.uuid(),
      employee_id: faker.string.alphanumeric(6).toUpperCase(),
      client_id: clientId,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: this.generateAddress(),
      ssn: faker.string.numeric(9),
      hire_date: hireDate,
      termination_date: faker.datatype.boolean() ? faker.date.between({ from: hireDate, to: new Date() }) : null,
      department: faker.helpers.arrayElement([
        'Administration', 'Sales', 'Marketing', 'IT', 'HR', 'Operations',
        'Customer Service', 'Finance', 'Engineering', 'Production'
      ]),
      position: faker.person.jobTitle(),
      employment_type: faker.helpers.arrayElement(['full_time', 'part_time', 'contractor', 'intern']),
      pay_type: isHourly ? 'hourly' : 'salary',
      pay_rate: isHourly ? 
        faker.number.float({ min: 15, max: 75, fractionDigits: 2 }) : 
        faker.number.int({ min: 35000, max: 150000 }),
      overtime_rate: isHourly ? faker.number.float({ min: 22.50, max: 112.50, fractionDigits: 2 }) : null,
      tax_filing_status: faker.helpers.arrayElement(['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household']),
      federal_allowances: faker.number.int({ min: 0, max: 10 }),
      state: faker.location.state({ abbreviated: true }),
      benefits_eligible: faker.datatype.boolean(),
      direct_deposit: faker.datatype.boolean(),
      active: faker.datatype.boolean()
    };
  }

  static generatePayroll(clientId, employeeIds) {
    const payPeriodStart = faker.date.past({ days: 14 });
    const payPeriodEnd = new Date(payPeriodStart.getTime() + (13 * 24 * 60 * 60 * 1000)); // 14 days later
    const payDate = new Date(payPeriodEnd.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days after period end
    
    return {
      id: faker.string.uuid(),
      payroll_number: `PR-${faker.number.int({ min: 100000, max: 999999 })}`,
      client_id: clientId,
      pay_period_start: payPeriodStart,
      pay_period_end: payPeriodEnd,
      pay_date: payDate,
      status: faker.helpers.arrayElement(['processing', 'approved', 'paid', 'cancelled']),
      employee_count: employeeIds.length,
      gross_pay: faker.number.float({ min: 25000, max: 500000, fractionDigits: 2 }),
      net_pay: faker.number.float({ min: 18000, max: 375000, fractionDigits: 2 }),
      total_taxes: faker.number.float({ min: 5000, max: 100000, fractionDigits: 2 }),
      total_deductions: faker.number.float({ min: 2000, max: 25000, fractionDigits: 2 }),
      processed_by: faker.person.fullName(),
      processed_date: faker.date.recent({ days: 3 }),
      approved_by: faker.person.fullName(),
      approved_date: faker.date.recent({ days: 2 })
    };
  }

  static getEmployeeCountBySize(size) {
    switch (size) {
      case 'small': return faker.number.int({ min: 1, max: 25 });
      case 'medium': return faker.number.int({ min: 26, max: 100 });
      case 'large': return faker.number.int({ min: 101, max: 500 });
      case 'enterprise': return faker.number.int({ min: 501, max: 5000 });
      default: return faker.number.int({ min: 1, max: 50 });
    }
  }

  static generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'US'
    };
  }
}

/**
 * AI Data Generation
 */
class AIGenerator {
  static modelTypes = [
    'neural_network', 'decision_tree', 'random_forest', 'svm',
    'linear_regression', 'logistic_regression', 'kmeans', 'transformer'
  ];

  static datasetTypes = [
    'image', 'text', 'audio', 'video', 'tabular', 'time_series',
    'graph', 'sensor', 'financial', 'medical'
  ];

  static generateProject() {
    return {
      id: faker.string.uuid(),
      project_name: faker.lorem.words(3),
      description: faker.lorem.sentences(2),
      client_id: faker.string.uuid(),
      project_type: faker.helpers.arrayElement([
        'classification', 'regression', 'clustering', 'anomaly_detection',
        'natural_language_processing', 'computer_vision', 'time_series_forecasting'
      ]),
      industry: faker.helpers.arrayElement([
        'healthcare', 'finance', 'retail', 'manufacturing', 'automotive',
        'telecommunications', 'energy', 'agriculture'
      ]),
      status: faker.helpers.arrayElement(['planning', 'development', 'testing', 'deployed', 'maintenance']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
      budget: faker.number.float({ min: 10000, max: 500000, fractionDigits: 2 }),
      start_date: faker.date.past({ months: 6 }),
      end_date: faker.date.future({ months: 6 }),
      team_size: faker.number.int({ min: 2, max: 15 }),
      accuracy_target: faker.number.float({ min: 0.8, max: 0.99, fractionDigits: 3 }),
      current_accuracy: faker.number.float({ min: 0.7, max: 0.98, fractionDigits: 3 })
    };
  }

  static generateModel(projectId) {
    return {
      id: faker.string.uuid(),
      project_id: projectId,
      model_name: faker.lorem.words(2),
      model_type: faker.helpers.arrayElement(this.modelTypes),
      version: `v${faker.number.int({ min: 1, max: 10 })}.${faker.number.int({ min: 0, max: 9 })}`,
      framework: faker.helpers.arrayElement(['tensorflow', 'pytorch', 'scikit-learn', 'xgboost', 'keras']),
      training_data_size: faker.number.int({ min: 1000, max: 1000000 }),
      validation_accuracy: faker.number.float({ min: 0.75, max: 0.98, fractionDigits: 3 }),
      test_accuracy: faker.number.float({ min: 0.70, max: 0.95, fractionDigits: 3 }),
      training_time_hours: faker.number.float({ min: 0.5, max: 48, fractionDigits: 1 }),
      model_size_mb: faker.number.float({ min: 1, max: 500, fractionDigits: 1 }),
      inference_time_ms: faker.number.float({ min: 1, max: 1000, fractionDigits: 1 }),
      created_date: faker.date.past({ days: 90 }),
      deployed: faker.datatype.boolean(),
      deployment_date: faker.date.past({ days: 30 })
    };
  }

  static generateDataset() {
    return {
      id: faker.string.uuid(),
      dataset_name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      dataset_type: faker.helpers.arrayElement(this.datasetTypes),
      size_gb: faker.number.float({ min: 0.1, max: 1000, fractionDigits: 2 }),
      record_count: faker.number.int({ min: 100, max: 10000000 }),
      feature_count: faker.number.int({ min: 5, max: 500 }),
      quality_score: faker.number.float({ min: 0.6, max: 1.0, fractionDigits: 2 }),
      privacy_level: faker.helpers.arrayElement(['public', 'internal', 'confidential', 'restricted']),
      source: faker.helpers.arrayElement(['internal', 'partner', 'vendor', 'open_source', 'synthetic']),
      created_date: faker.date.past({ years: 1 }),
      last_updated: faker.date.recent({ days: 30 }),
      version: `v${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
      active: faker.datatype.boolean()
    };
  }
}

/**
 * =============================================================================
 * UNIVERSAL DATA GENERATORS
 * =============================================================================
 */

/**
 * Financial Transaction Generator
 */
class FinancialGenerator {
  static transactionTypes = [
    'sale', 'refund', 'payment', 'invoice', 'expense', 'transfer',
    'adjustment', 'fee', 'tax', 'discount', 'commission'
  ];

  static generateTransaction(organizationId) {
    const amount = faker.number.float({ min: 10, max: 5000, fractionDigits: 2 });
    const transactionDate = faker.date.past({ days: 365 });
    
    return {
      id: faker.string.uuid(),
      organization_id: organizationId,
      transaction_number: `TXN-${faker.number.int({ min: 1000000, max: 9999999 })}`,
      type: faker.helpers.arrayElement(this.transactionTypes),
      amount: amount,
      currency: 'USD',
      description: faker.finance.transactionDescription(),
      category: faker.helpers.arrayElement([
        'revenue', 'cost_of_goods', 'operating_expenses', 'administrative',
        'marketing', 'equipment', 'utilities', 'insurance', 'taxes'
      ]),
      account: faker.finance.accountName(),
      reference_id: faker.string.uuid(),
      customer_id: faker.datatype.boolean() ? faker.string.uuid() : null,
      vendor_id: faker.datatype.boolean() ? faker.string.uuid() : null,
      payment_method: faker.helpers.arrayElement(['cash', 'check', 'credit_card', 'bank_transfer', 'other']),
      status: faker.helpers.arrayElement(['pending', 'completed', 'failed', 'cancelled']),
      transaction_date: transactionDate,
      created_at: transactionDate,
      updated_at: faker.date.between({ from: transactionDate, to: new Date() })
    };
  }

  static generateInvoice(organizationId, customerId) {
    const issueDate = faker.date.past({ days: 90 });
    const dueDate = new Date(issueDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days later
    const subtotal = faker.number.float({ min: 100, max: 5000, fractionDigits: 2 });
    const taxRate = 0.0875; // 8.75% tax rate
    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    
    return {
      id: faker.string.uuid(),
      organization_id: organizationId,
      customer_id: customerId,
      invoice_number: `INV-${faker.number.int({ min: 100000, max: 999999 })}`,
      issue_date: issueDate,
      due_date: dueDate,
      subtotal: subtotal,
      tax_amount: taxAmount,
      discount_amount: faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
      total_amount: parseFloat((subtotal + taxAmount).toFixed(2)),
      amount_paid: faker.number.float({ min: 0, max: subtotal + taxAmount, fractionDigits: 2 }),
      status: faker.helpers.arrayElement(['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled']),
      payment_terms: faker.helpers.arrayElement(['net_15', 'net_30', 'net_60', 'due_on_receipt']),
      notes: faker.lorem.sentence(),
      created_at: issueDate,
      updated_at: faker.date.between({ from: issueDate, to: new Date() })
    };
  }
}

/**
 * Performance Metrics Generator
 */
class MetricsGenerator {
  static generateKPIData(organizationId, industry) {
    const date = faker.date.past({ days: 30 });
    const baseMetrics = this.getBaseMetricsByIndustry(industry);
    
    return {
      id: faker.string.uuid(),
      organization_id: organizationId,
      metric_date: date,
      industry: industry,
      revenue: faker.number.float({ min: baseMetrics.revenue.min, max: baseMetrics.revenue.max, fractionDigits: 2 }),
      profit_margin: faker.number.float({ min: 0.05, max: 0.35, fractionDigits: 3 }),
      customer_count: faker.number.int({ min: baseMetrics.customers.min, max: baseMetrics.customers.max }),
      customer_satisfaction: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
      employee_utilization: faker.number.float({ min: 0.65, max: 0.95, fractionDigits: 2 }),
      average_order_value: faker.number.float({ min: baseMetrics.aov.min, max: baseMetrics.aov.max, fractionDigits: 2 }),
      conversion_rate: faker.number.float({ min: 0.02, max: 0.15, fractionDigits: 3 }),
      repeat_customer_rate: faker.number.float({ min: 0.15, max: 0.65, fractionDigits: 2 }),
      cost_per_acquisition: faker.number.float({ min: 25, max: 200, fractionDigits: 2 }),
      lifetime_value: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 })
    };
  }

  static getBaseMetricsByIndustry(industry) {
    const metrics = {
      'hs': {
        revenue: { min: 10000, max: 100000 },
        customers: { min: 50, max: 500 },
        aov: { min: 200, max: 2000 }
      },
      'rest': {
        revenue: { min: 15000, max: 150000 },
        customers: { min: 100, max: 1000 },
        aov: { min: 25, max: 150 }
      },
      'auto': {
        revenue: { min: 20000, max: 200000 },
        customers: { min: 30, max: 300 },
        aov: { min: 300, max: 3000 }
      },
      'ret': {
        revenue: { min: 8000, max: 80000 },
        customers: { min: 200, max: 2000 },
        aov: { min: 40, max: 400 }
      },
      'edu': {
        revenue: { min: 50000, max: 500000 },
        customers: { min: 100, max: 5000 },
        aov: { min: 500, max: 5000 }
      },
      'payroll': {
        revenue: { min: 25000, max: 250000 },
        customers: { min: 20, max: 200 },
        aov: { min: 1000, max: 10000 }
      },
      'ai': {
        revenue: { min: 100000, max: 1000000 },
        customers: { min: 10, max: 100 },
        aov: { min: 10000, max: 100000 }
      }
    };
    
    return metrics[industry] || metrics['hs']; // Default to home services
  }
}

/**
 * =============================================================================
 * EXPORT ALL GENERATORS
 * =============================================================================
 */

module.exports = {
  HomeServicesGenerator,
  RestaurantGenerator,
  AutoGenerator,
  RetailGenerator,
  EducationGenerator,
  PayrollGenerator,
  AIGenerator,
  FinancialGenerator,
  MetricsGenerator,
  faker
};

/**
 * Usage Examples:
 * 
 * // Generate 100 home services customers
 * const customers = Array.from({ length: 100 }, () => HomeServicesGenerator.generateCustomer());
 * 
 * // Generate restaurant menu items
 * const menuItems = Array.from({ length: 50 }, () => RestaurantGenerator.generateMenuItem());
 * 
 * // Generate auto service records
 * const serviceRecords = Array.from({ length: 200 }, () => 
 *   AutoGenerator.generateServiceRecord(vehicleId, customerId)
 * );
 * 
 * // Generate financial transactions
 * const transactions = Array.from({ length: 1000 }, () => 
 *   FinancialGenerator.generateTransaction(organizationId)
 * );
 */