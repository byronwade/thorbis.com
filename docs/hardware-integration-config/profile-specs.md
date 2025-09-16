# Thorbis Hardware Device Profile Specifications

Detailed hardware specifications and integration profiles for Thorbis Business OS supported devices.

## Device Profile Architecture

### Profile Definition Structure
```typescript
interface HardwareProfile {
  // Identity
  profile_id: string                   // thermal_58mm, thermal_80mm, kds_15inch, etc.
  device_type: HardwareDeviceType
  category: DeviceCategory
  
  // Physical Specifications
  physical_specs: PhysicalSpecs
  
  // Capabilities & Features
  capabilities: DeviceCapability[]
  supported_operations: string[]
  
  // Communication Protocols
  communication: CommunicationSpec[]
  
  // Software Requirements
  drivers: DriverSpec[]
  sdk_requirements: SDKRequirements
  
  // Industry Compatibility
  supported_industries: Industry[]
  use_cases: UseCase[]
  
  // Certification & Compliance
  certifications: string[]
  compliance_standards: string[]
  
  // Integration Details
  api_endpoints: APIEndpoint[]
  webhook_events: WebhookEvent[]
  configuration_schema: JSONSchema
  
  // Testing & Validation
  self_tests: SelfTest[]
  performance_benchmarks: PerformanceBenchmark[]
}

type DeviceCategory = 'printing' | 'display' | 'input' | 'payment' | 'measurement'
type Industry = 'hs' | 'rest' | 'auto' | 'ret'
```

## Thermal Printer Profiles

### 58mm Thermal Receipt Printer
```yaml
profile_id: "thermal_58mm"
device_type: "thermal_printer"
category: "printing"

physical_specs:
  paper_width: 58 # millimeters
  max_paper_roll_diameter: 83 # millimeters
  print_width: 512 # dots
  resolution: 203 # DPI
  dimensions:
    width: 150
    height: 195
    depth: 132
    weight: 1600 # grams
  power_consumption:
    standby: 1.2 # watts
    printing: 45 # watts
    sleep: 0.8 # watts
  environmental:
    operating_temperature: "5°C to 45°C"
    storage_temperature: "-20°C to 60°C"
    humidity: "10% to 90% non-condensing"

capabilities:
  - name: "print_receipt"
    description: "Print customer receipts"
    parameters:
      - name: "width"
        type: "number"
        value: 58
        unit: "mm"
  - name: "cut_paper"
    description: "Automatic paper cutting"
    parameters:
      - name: "cut_type"
        type: "enum"
        values: ["full", "partial"]
  - name: "cash_drawer"
    description: "Cash drawer kick control"
    parameters:
      - name: "pulse_duration"
        type: "number"
        min: 50
        max: 500
        unit: "ms"
  - name: "barcode_printing"
    description: "Print barcodes and QR codes"
    parameters:
      - name: "supported_formats"
        type: "array"
        values: ["CODE128", "EAN13", "UPC-A", "QR", "PDF417"]
  - name: "logo_printing"
    description: "Print business logos"
    parameters:
      - name: "max_logo_size"
        type: "dimensions"
        width: 384
        height: 200
        format: "BMP"

supported_operations:
  - "print_text"
  - "print_barcode"
  - "print_qr_code"
  - "print_logo"
  - "cut_paper"
  - "feed_paper"
  - "kick_drawer"
  - "check_status"
  - "set_print_density"
  - "set_print_speed"

communication:
  - protocol: "ethernet"
    interface: "RJ45"
    speed: "10/100 Mbps"
    auto_mdix: true
    dhcp_support: true
    static_ip_support: true
  - protocol: "usb"
    interface: "USB 2.0 Type-B"
    speed: "480 Mbps"
    plug_and_play: true
  - protocol: "wifi"
    interface: "802.11 b/g/n"
    frequency: "2.4 GHz"
    security: ["WPA2", "WPA3"]
    encryption: ["AES"]

drivers:
  - platform: "windows"
    versions: ["10", "11"]
    driver_type: "generic_text"
    download_url: "https://hardware.thorbis.com/drivers/thermal-58mm-windows.zip"
  - platform: "macos"
    versions: ["10.15+"]
    driver_type: "cups"
    download_url: "https://hardware.thorbis.com/drivers/thermal-58mm-macos.dmg"
  - platform: "linux"
    versions: ["ubuntu-20.04+", "debian-10+", "centos-8+"]
    driver_type: "cups"
    package_name: "thorbis-thermal-driver"

sdk_requirements:
  minimum_memory: "256MB"
  storage_space: "50MB"
  network_bandwidth: "100Kbps"
  supported_languages: ["javascript", "python", "java", "go", "csharp"]

supported_industries:
  - industry: "rest"
    use_cases:
      - "customer_receipts"
      - "kitchen_tickets"
      - "order_confirmations"
    templates: ["receipt_standard", "receipt_itemized", "kitchen_ticket"]
  - industry: "ret"
    use_cases:
      - "sales_receipts"
      - "return_receipts"  
      - "gift_receipts"
    templates: ["retail_receipt", "return_receipt", "gift_receipt"]
  - industry: "hs"
    use_cases:
      - "work_order_summaries"
      - "service_receipts"
      - "payment_confirmations"
    templates: ["service_receipt", "work_order_summary", "payment_receipt"]

certifications:
  - "FCC Class B"
  - "CE Mark"
  - "RoHS Compliance"
  - "Energy Star"

compliance_standards:
  - "ISO 14298 (Thermal Printing)"
  - "OPOS (OLE for Retail POS)"
  - "ESC/POS Command Set"
  - "EPSON Advanced Printer Driver (APD)"

api_endpoints:
  - endpoint: "/hardware/thermal-printer/{device_id}/print"
    method: "POST"
    description: "Submit print job"
    parameters:
      - name: "template"
        type: "string"
        required: true
      - name: "data"
        type: "object"
        required: true
      - name: "options"
        type: "object"
        properties:
          cut_paper: { type: "boolean", default: true }
          copies: { type: "number", min: 1, max: 10, default: 1 }
          cash_drawer: { type: "boolean", default: false }
  - endpoint: "/hardware/thermal-printer/{device_id}/status"
    method: "GET"
    description: "Get printer status"
    response_schema:
      type: "object"
      properties:
        connection: { type: "string", enum: ["online", "offline"] }
        paper_status: { type: "string", enum: ["ok", "low", "out", "jam"] }
        temperature: { type: "string", enum: ["normal", "high", "critical"] }

webhook_events:
  - event: "paper_status_changed"
    payload:
      device_id: { type: "string" }
      old_status: { type: "string" }
      new_status: { type: "string" }
      timestamp: { type: "string", format: "iso8601" }
  - event: "print_job_completed"
    payload:
      device_id: { type: "string" }
      job_id: { type: "string" }
      status: { type: "string", enum: ["completed", "failed"] }
      pages_printed: { type: "number" }

self_tests:
  - name: "paper_feed_test"
    description: "Test paper feeding mechanism"
    duration_ms: 3000
    critical: true
  - name: "cutter_test"
    description: "Test paper cutting mechanism"
    duration_ms: 2000
    critical: false
  - name: "print_density_test"
    description: "Test print quality across density settings"
    duration_ms: 5000
    critical: true
  - name: "drawer_kick_test"
    description: "Test cash drawer control"
    duration_ms: 1000
    critical: false

performance_benchmarks:
  - metric: "print_speed"
    value: 200
    unit: "mm/sec"
    test_conditions: "Standard text, normal density"
  - metric: "first_print_time"
    value: 1500
    unit: "ms"
    test_conditions: "From standby to first line printed"
  - metric: "throughput"
    value: 100
    unit: "receipts/hour"
    test_conditions: "Average 10-line receipts with cutting"
```

### 80mm Thermal Receipt Printer
```yaml
profile_id: "thermal_80mm"
device_type: "thermal_printer"
category: "printing"

physical_specs:
  paper_width: 80 # millimeters
  max_paper_roll_diameter: 127 # millimeters
  print_width: 576 # dots
  resolution: 203 # DPI
  dimensions:
    width: 160
    height: 220
    depth: 140
    weight: 2100 # grams
  power_consumption:
    standby: 2.1 # watts
    printing: 65 # watts
    sleep: 1.2 # watts

capabilities:
  - name: "print_receipt"
    description: "Print customer receipts"
    parameters:
      - name: "width"
        type: "number"
        value: 80
        unit: "mm"
  - name: "cut_paper"
    description: "Full and partial paper cutting"
    parameters:
      - name: "cut_type"
        type: "enum"
        values: ["full", "partial", "perforation"]
  - name: "cash_drawer"
    description: "Dual cash drawer support"
    parameters:
      - name: "drawer_ports"
        type: "number"
        value: 2
  - name: "high_resolution_graphics"
    description: "High quality logo and graphics printing"
    parameters:
      - name: "max_image_size"
        type: "dimensions"
        width: 512
        height: 300
        formats: ["BMP", "PNG", "JPG"]
  - name: "two_color_printing"
    description: "Black and red thermal printing"
    parameters:
      - name: "colors"
        type: "array"
        values: ["black", "red"]

supported_operations:
  - "print_text"
  - "print_barcode"
  - "print_qr_code"
  - "print_logo"
  - "print_graphics"
  - "cut_paper"
  - "partial_cut"
  - "feed_paper"
  - "kick_drawer_1"
  - "kick_drawer_2"
  - "check_status"
  - "set_print_density"
  - "set_print_speed"
  - "print_two_color"

communication:
  - protocol: "ethernet"
    interface: "RJ45"
    speed: "10/100/1000 Mbps"
    poe_support: true # Power over Ethernet
  - protocol: "usb"
    interface: "USB 3.0 Type-B"
    speed: "5 Gbps"
  - protocol: "wifi"
    interface: "802.11 a/b/g/n/ac"
    frequency: "2.4/5 GHz"
    security: ["WPA2", "WPA3", "WPA2-Enterprise"]
  - protocol: "bluetooth"
    version: "5.0"
    range: "10m"
    profiles: ["SPP", "HID"]

supported_industries:
  - industry: "rest"
    use_cases:
      - "detailed_receipts"
      - "kitchen_orders"
      - "promotional_receipts"
      - "loyalty_program_receipts"
    templates: ["detailed_receipt", "kitchen_order", "promo_receipt"]
  - industry: "ret" 
    use_cases:
      - "itemized_receipts"
      - "warranty_receipts"
      - "layaway_receipts"
      - "gift_cards"
    templates: ["itemized_receipt", "warranty_receipt", "gift_card"]
  - industry: "auto"
    use_cases:
      - "service_invoices"
      - "parts_receipts"
      - "estimate_printouts"
    templates: ["service_invoice", "parts_receipt", "estimate"]
  - industry: "hs"
    use_cases:
      - "work_orders"
      - "service_agreements"
      - "payment_receipts"
    templates: ["work_order", "service_agreement", "payment_receipt"]

performance_benchmarks:
  - metric: "print_speed"
    value: 300
    unit: "mm/sec"
    test_conditions: "Standard text, normal density"
  - metric: "graphics_print_speed"
    value: 150
    unit: "mm/sec"
    test_conditions: "High resolution graphics"
  - metric: "throughput"
    value: 150
    unit: "receipts/hour"
    test_conditions: "Average 15-line receipts with graphics"
```

## Kitchen Display System (KDS) Profiles

### 15-inch KDS Display
```yaml
profile_id: "kds_15inch"
device_type: "kds_display"
category: "display"

physical_specs:
  screen_size: 15.6 # inches diagonal
  resolution:
    width: 1920
    height: 1080
    pixel_density: 141 # PPI
  display_technology: "IPS LCD"
  brightness: 400 # cd/m²
  contrast_ratio: "1000:1"
  viewing_angle: "178°"
  dimensions:
    width: 384
    height: 286
    depth: 45
    weight: 3200 # grams
  power_consumption:
    active: 35 # watts
    standby: 2 # watts
    sleep: 0.5 # watts
  environmental:
    operating_temperature: "0°C to 50°C"
    humidity: "10% to 80% non-condensing"
    ip_rating: "IP54" # Kitchen environment protection

capabilities:
  - name: "order_display"
    description: "Display kitchen orders and tickets"
    parameters:
      - name: "max_orders_visible"
        type: "number"
        value: 8
      - name: "order_aging_colors"
        type: "boolean"
        value: true
  - name: "touch_interaction"
    description: "Multi-touch screen support"
    parameters:
      - name: "touch_points"
        type: "number"
        value: 10
      - name: "touch_technology"
        type: "string"
        value: "capacitive"
  - name: "audio_alerts"
    description: "Audio notification system"
    parameters:
      - name: "speaker_power"
        type: "number"
        value: 5 # watts
      - name: "volume_levels"
        type: "number"
        value: 10
  - name: "order_management"
    description: "Kitchen workflow management"
    parameters:
      - name: "workflow_states"
        type: "array"
        values: ["new", "preparing", "ready", "served"]
  - name: "split_screen"
    description: "Multiple kitchen station views"
    parameters:
      - name: "max_splits"
        type: "number"
        value: 4

supported_operations:
  - "display_order"
  - "update_order_status"
  - "highlight_order"
  - "set_order_timer"
  - "play_alert_sound"
  - "acknowledge_order"
  - "mark_item_complete"
  - "bump_order"
  - "display_prep_time"
  - "show_special_instructions"
  - "filter_by_station"

communication:
  - protocol: "ethernet"
    interface: "RJ45"
    speed: "10/100/1000 Mbps"
    poe_plus: true # 25.5W power delivery
  - protocol: "wifi"
    interface: "802.11 ac"
    frequency: "5 GHz preferred"
    mimo: "2x2"
    security: ["WPA2-Enterprise", "WPA3"]
  - protocol: "usb"
    interface: "USB-C"
    power_delivery: true
    display_port_alt_mode: true

drivers:
  - platform: "android"
    versions: ["9.0+"]
    app_package: "com.thorbis.kds"
    min_api_level: 28
  - platform: "windows"
    versions: ["10", "11"]
    driver_type: "touch_display"
    hid_compliance: true
  - platform: "linux"
    versions: ["ubuntu-20.04+"]
    display_server: ["wayland", "x11"]
    touch_protocol: "libinput"

supported_industries:
  - industry: "rest"
    use_cases:
      - "kitchen_order_management"
      - "expo_coordination"
      - "prep_station_displays"
      - "drive_thru_coordination"
    workflows:
      - "fine_dining": ["ordered", "fired", "plating", "ready"]
      - "quick_service": ["ordered", "preparing", "ready", "served"]
      - "pizza": ["ordered", "prep", "oven", "cut", "ready"]
  - industry: "ret"
    use_cases:
      - "fulfillment_displays"
      - "pickup_notifications"
      - "inventory_alerts"
    workflows:
      - "online_orders": ["received", "picking", "packed", "ready"]
      - "store_pickup": ["ordered", "locating", "ready", "picked_up"]

api_endpoints:
  - endpoint: "/hardware/kds/{device_id}/display-order"
    method: "POST"
    description: "Display new order on KDS"
    parameters:
      - name: "order_data"
        type: "object"
        required: true
        properties:
          order_id: { type: "string" }
          items: { type: "array" }
          prep_time: { type: "number" }
          priority: { type: "string", enum: ["normal", "rush", "vip"] }
          special_instructions: { type: "string" }
  - endpoint: "/hardware/kds/{device_id}/update-status"
    method: "PATCH"
    description: "Update order status"
    parameters:
      - name: "order_id"
        type: "string"
        required: true
      - name: "status"
        type: "string"
        required: true
      - name: "station_id"
        type: "string"

webhook_events:
  - event: "order_status_changed"
    payload:
      device_id: { type: "string" }
      order_id: { type: "string" }
      old_status: { type: "string" }
      new_status: { type: "string" }
      station_id: { type: "string" }
      timestamp: { type: "string", format: "iso8601" }
  - event: "order_acknowledged"
    payload:
      device_id: { type: "string" }
      order_id: { type: "string" }
      acknowledged_by: { type: "string" }
      timestamp: { type: "string", format: "iso8601" }

self_tests:
  - name: "display_test"
    description: "Test display functionality and dead pixels"
    duration_ms: 10000
    critical: true
  - name: "touch_calibration"
    description: "Calibrate touch screen accuracy"
    duration_ms: 15000
    critical: true
  - name: "audio_test"
    description: "Test speaker and alert sounds"
    duration_ms: 5000
    critical: false
  - name: "network_connectivity"
    description: "Test network connection and API access"
    duration_ms: 3000
    critical: true

performance_benchmarks:
  - metric: "order_display_time"
    value: 500
    unit: "ms"
    test_conditions: "Time from API call to order visible on screen"
  - metric: "touch_response_time"
    value: 50
    unit: "ms"
    test_conditions: "Touch input to system response"
  - metric: "concurrent_orders"
    value: 50
    unit: "orders"
    test_conditions: "Maximum orders displayed simultaneously"
```

### 21-inch KDS Display (Large Kitchen)
```yaml
profile_id: "kds_21inch"
device_type: "kds_display"
category: "display"

physical_specs:
  screen_size: 21.5 # inches diagonal
  resolution:
    width: 1920
    height: 1080
    pixel_density: 102 # PPI
  display_technology: "VA LCD"
  brightness: 500 # cd/m²
  contrast_ratio: "3000:1"
  viewing_angle: "178°"
  dimensions:
    width: 510
    height: 320
    depth: 55
    weight: 4800 # grams

capabilities:
  - name: "high_volume_display"
    description: "Handle high-volume kitchen operations"
    parameters:
      - name: "max_orders_visible"
        type: "number"
        value: 16
      - name: "auto_scroll"
        type: "boolean"
        value: true
  - name: "multi_station_view"
    description: "Display multiple kitchen stations"
    parameters:
      - name: "station_panels"
        type: "number"
        value: 6
      - name: "station_filtering"
        type: "boolean"
        value: true

supported_industries:
  - industry: "rest"
    use_cases:
      - "high_volume_kitchens"
      - "multi_station_coordination"
      - "central_expo_displays"
    workflows:
      - "chain_restaurant": ["fired", "prep", "cook", "plate", "ready"]
      - "food_court": ["ordered", "station_1", "station_2", "assembly", "ready"]

performance_benchmarks:
  - metric: "concurrent_orders"
    value: 100
    unit: "orders"
    test_conditions: "Maximum orders with smooth scrolling"
```

## Barcode Scanner Profiles

### Handheld 2D Barcode Scanner
```yaml
profile_id: "scanner_2d_handheld"
device_type: "barcode_scanner"
category: "input"

physical_specs:
  form_factor: "handheld"
  dimensions:
    length: 160
    width: 70
    height: 95
    weight: 145 # grams
  scan_engine: "CMOS 2D Imager"
  light_source: "LED Array"
  battery:
    type: "Li-ion"
    capacity: 2200 # mAh
    life: "12 hours continuous"
    charging_time: "3 hours"
  environmental:
    drop_rating: "1.8m to concrete"
    ip_rating: "IP54"
    operating_temperature: "-10°C to 50°C"

capabilities:
  - name: "barcode_scanning"
    description: "Comprehensive barcode format support"
    parameters:
      - name: "supported_1d_codes"
        type: "array"
        values: ["UPC-A", "UPC-E", "EAN-8", "EAN-13", "CODE128", "CODE39", "ITF", "Codabar"]
      - name: "supported_2d_codes"
        type: "array"
        values: ["QR Code", "Data Matrix", "PDF417", "Aztec", "MaxiCode"]
      - name: "scan_rate"
        type: "number"
        value: 60 # scans per second
  - name: "wireless_communication"
    description: "Wireless connectivity options"
    parameters:
      - name: "wireless_protocols"
        type: "array"
        values: ["Bluetooth 5.0", "2.4GHz Proprietary", "WiFi 802.11 b/g/n"]
      - name: "range"
        type: "object"
        bluetooth: "10m"
        proprietary_2_4ghz: "100m"
        wifi: "Network dependent"
  - name: "data_storage"
    description: "Offline scanning capability"
    parameters:
      - name: "storage_capacity"
        type: "number"
        value: 100000 # scanned codes
      - name: "batch_upload"
        type: "boolean"
        value: true

supported_operations:
  - "scan_barcode"
  - "scan_qr_code"
  - "batch_scan_mode"
  - "inventory_scan_mode"
  - "price_check_scan"
  - "lookup_product_info"
  - "add_to_cart_scan"
  - "quantity_scan_mode"
  - "continuous_scan_mode"

communication:
  - protocol: "bluetooth"
    version: "5.0"
    profiles: ["HID", "SPP"]
    encryption: "AES-128"
    pairing_mode: "simple_pairing"
  - protocol: "usb"
    interface: "USB 2.0 Type-C"
    hid_compliance: true
    charging_support: true
  - protocol: "wifi"
    interface: "802.11 b/g/n"
    frequency: "2.4 GHz"
    security: ["WPA2", "WPA3"]

supported_industries:
  - industry: "ret"
    use_cases:
      - "product_scanning"
      - "inventory_management"
      - "price_checking"
      - "checkout_assistance"
    scanning_modes:
      - "pos_integration": "Real-time product lookup and pricing"
      - "inventory_audit": "Batch scanning with offline storage"
      - "receiving": "Verify incoming shipments"
      - "cycle_counting": "Periodic inventory verification"
  - industry: "hs"
    use_cases:
      - "parts_identification"
      - "inventory_tracking"
      - "work_order_tracking"
    scanning_modes:
      - "parts_lookup": "Identify replacement parts"
      - "job_tracking": "Scan work order QR codes"
      - "tool_checkout": "Track tool usage"
  - industry: "auto"
    use_cases:
      - "parts_catalog_lookup"
      - "vin_scanning"
      - "inventory_management"
    scanning_modes:
      - "parts_identification": "Scan part numbers for lookup"
      - "vin_decode": "Extract vehicle information"
      - "warranty_lookup": "Scan warranty codes"

api_endpoints:
  - endpoint: "/hardware/scanner/{device_id}/scan"
    method: "POST"
    description: "Process scanned data"
    parameters:
      - name: "scan_data"
        type: "object"
        required: true
        properties:
          code: { type: "string" }
          format: { type: "string" }
          timestamp: { type: "string", format: "iso8601" }
          scan_quality: { type: "number", min: 0, max: 100 }
  - endpoint: "/hardware/scanner/{device_id}/batch-upload"
    method: "POST"
    description: "Upload batch of offline scans"
    parameters:
      - name: "scans"
        type: "array"
        items:
          type: "object"
          properties:
            code: { type: "string" }
            format: { type: "string" }
            timestamp: { type: "string", format: "iso8601" }

webhook_events:
  - event: "barcode_scanned"
    payload:
      device_id: { type: "string" }
      code: { type: "string" }
      format: { type: "string" }
      scan_quality: { type: "number" }
      timestamp: { type: "string", format: "iso8601" }
  - event: "batch_upload_completed"
    payload:
      device_id: { type: "string" }
      scan_count: { type: "number" }
      upload_timestamp: { type: "string", format: "iso8601" }

self_tests:
  - name: "scan_engine_test"
    description: "Test barcode scanning functionality"
    duration_ms: 5000
    critical: true
  - name: "battery_test"
    description: "Check battery level and charging"
    duration_ms: 2000
    critical: false
  - name: "wireless_connectivity_test"
    description: "Test wireless connection stability"
    duration_ms: 10000
    critical: true
  - name: "decode_accuracy_test"
    description: "Test scanning accuracy with sample barcodes"
    duration_ms: 15000
    critical: true

performance_benchmarks:
  - metric: "scan_speed"
    value: 100
    unit: "scans/minute"
    test_conditions: "Mixed 1D and 2D codes at optimal distance"
  - metric: "first_read_rate"
    value: 99.5
    unit: "percent"
    test_conditions: "Well-printed codes at 15cm distance"
  - metric: "battery_life"
    value: 12
    unit: "hours"
    test_conditions: "Continuous scanning mode"
  - metric: "wireless_range"
    value: 100
    unit: "meters"
    test_conditions: "Clear line of sight, 2.4GHz proprietary mode"
```

### Fixed-Mount Presentation Scanner
```yaml
profile_id: "scanner_presentation_fixed"
device_type: "barcode_scanner"
category: "input"

physical_specs:
  form_factor: "presentation"
  dimensions:
    width: 115
    height: 84
    depth: 160
    weight: 340 # grams
  scan_engine: "Linear CCD"
  light_source: "LED"
  scan_window: "Crystal glass"
  mounting_options: ["countertop", "in-counter", "wall_mount"]

capabilities:
  - name: "omnidirectional_scanning"
    description: "360-degree barcode reading"
    parameters:
      - name: "scan_angles"
        type: "array"
        values: ["0°", "45°", "90°", "135°", "180°", "225°", "270°", "315°"]
  - name: "presentation_mode"
    description: "Automatic scanning when barcode presented"
    parameters:
      - name: "auto_sense"
        type: "boolean"
        value: true
      - name: "trigger_modes"
        type: "array"
        values: ["auto", "manual", "continuous"]

supported_operations:
  - "auto_scan_mode"
  - "manual_trigger_scan"
  - "continuous_scan_mode"
  - "sleep_wake_control"
  - "laser_control"
  - "beep_control"

supported_industries:
  - industry: "ret"
    use_cases:
      - "pos_checkout"
      - "self_service_kiosks"
      - "customer_facing_scanning"
    configurations:
      - "checkout_counter": "Fixed position for cashier use"
      - "self_checkout": "Customer-facing presentation mode"
      - "kiosk_integration": "Embedded in self-service terminals"

performance_benchmarks:
  - metric: "scan_speed"
    value: 1500
    unit: "scans/second"
    test_conditions: "Optimal presentation angle"
  - metric: "depth_of_field"
    value: "5-35"
    unit: "cm"
    test_conditions: "13 mil UPC barcode"
```

## Payment Terminal Profile

### EMV Chip & PIN Terminal
```yaml
profile_id: "payment_emv_terminal"
device_type: "payment_terminal"
category: "payment"

physical_specs:
  form_factor: "countertop"
  dimensions:
    width: 85
    height: 180
    depth: 65
    weight: 350 # grams
  display:
    size: "2.8 inch"
    resolution: "240x320"
    technology: "Color TFT"
    touchscreen: true
  keypad: "Physical PIN pad with tactile feedback"
  card_readers:
    - "Chip reader (EMV)"
    - "Magnetic stripe reader"
    - "Contactless (NFC/RFID)"

capabilities:
  - name: "payment_processing"
    description: "Process various payment methods"
    parameters:
      - name: "supported_cards"
        type: "array"
        values: ["Visa", "Mastercard", "American Express", "Discover", "Debit"]
      - name: "payment_methods"
        type: "array"
        values: ["chip", "swipe", "tap", "contactless_mobile"]
  - name: "security_compliance"
    description: "Payment industry security standards"
    parameters:
      - name: "certifications"
        type: "array"
        values: ["PCI-PTS", "EMV Level 1", "EMV Level 2"]
      - name: "encryption"
        type: "array"
        values: ["3DES", "AES", "RSA"]

supported_operations:
  - "process_chip_card"
  - "process_magnetic_stripe"
  - "process_contactless"
  - "process_mobile_wallet"
  - "capture_pin"
  - "capture_signature"
  - "print_receipt"
  - "process_refund"

communication:
  - protocol: "ethernet"
    interface: "RJ45"
    encryption: "TLS 1.3"
    certificate_based: true
  - protocol: "wifi"
    interface: "802.11 ac"
    security: ["WPA2-Enterprise", "WPA3"]
    certificate_based: true

supported_industries:
  - industry: "ret"
    use_cases:
      - "pos_payment_processing"
      - "mobile_payment_acceptance"
      - "integrated_checkout"
  - industry: "rest"
    use_cases:
      - "tableside_payments"
      - "quick_service_payments"
      - "delivery_payments"
  - industry: "hs"
    use_cases:
      - "field_payment_collection"
      - "service_completion_payments"
  - industry: "auto"
    use_cases:
      - "service_payments"
      - "parts_payments"
      - "estimate_deposits"

api_endpoints:
  - endpoint: "/hardware/payment/{device_id}/process"
    method: "POST"
    description: "Process payment transaction"
    parameters:
      - name: "amount"
        type: "number"
        required: true
      - name: "currency"
        type: "string"
        required: true
      - name: "payment_method"
        type: "string"
        enum: ["chip", "swipe", "tap", "contactless"]

security_features:
  - "End-to-end encryption"
  - "Point-to-point encryption (P2PE)"
  - "Tamper detection"
  - "Secure key management"
  - "PCI compliance"

self_tests:
  - name: "card_reader_test"
    description: "Test all card reading mechanisms"
    duration_ms: 10000
    critical: true
  - name: "display_test"
    description: "Test display and touchscreen"
    duration_ms: 5000
    critical: true
  - name: "security_test"
    description: "Verify encryption and security features"
    duration_ms: 15000
    critical: true
  - name: "network_security_test"
    description: "Test secure communication channels"
    duration_ms: 8000
    critical: true

performance_benchmarks:
  - metric: "transaction_time"
    value: 3
    unit: "seconds"
    test_conditions: "EMV chip card transaction"
  - metric: "contactless_speed"
    value: 1
    unit: "seconds"  
    test_conditions: "NFC contactless payment"
```

## Device Configuration Schemas

### Thermal Printer Configuration
```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "type": "object",
  "properties": {
    "device_id": {
      "type": "string",
      "pattern": "^hw_device_[a-z0-9_]+$"
    },
    "print_settings": {
      "type": "object",
      "properties": {
        "paper_width": {
          "type": "number",
          "enum": [58, 80]
        },
        "print_density": {
          "type": "number",
          "minimum": 1,
          "maximum": 8,
          "default": 4
        },
        "print_speed": {
          "type": "number",
          "minimum": 50,
          "maximum": 300,
          "default": 200,
          "description": "Print speed in mm/sec"
        },
        "cut_behavior": {
          "type": "string",
          "enum": ["auto", "manual", "none"],
          "default": "auto"
        },
        "cash_drawer": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": false
            },
            "pulse_duration": {
              "type": "number",
              "minimum": 50,
              "maximum": 500,
              "default": 120,
              "description": "Pulse duration in milliseconds"
            }
          }
        }
      },
      "required": ["paper_width"]
    },
    "business_settings": {
      "type": "object", 
      "properties": {
        "logo_enabled": {
          "type": "boolean",
          "default": true
        },
        "logo_base64": {
          "type": "string",
          "contentEncoding": "base64",
          "maxLength": 65536
        },
        "header_text": {
          "type": "string",
          "maxLength": 200
        },
        "footer_text": {
          "type": "string", 
          "maxLength": 200
        }
      }
    }
  },
  "required": ["device_id", "print_settings"]
}
```

### KDS Display Configuration
```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "type": "object",
  "properties": {
    "device_id": {
      "type": "string",
      "pattern": "^hw_device_[a-z0-9_]+$"
    },
    "display_settings": {
      "type": "object",
      "properties": {
        "brightness": {
          "type": "number",
          "minimum": 1,
          "maximum": 100,
          "default": 80
        },
        "orientation": {
          "type": "string",
          "enum": ["portrait", "landscape"],
          "default": "landscape"
        },
        "screen_timeout": {
          "type": "number",
          "minimum": 30,
          "maximum": 3600,
          "default": 300,
          "description": "Screen timeout in seconds"
        }
      }
    },
    "kitchen_settings": {
      "type": "object",
      "properties": {
        "station_filter": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Kitchen stations to display"
        },
        "order_aging": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "warning_time": {
              "type": "number",
              "minimum": 60,
              "default": 300,
              "description": "Warning threshold in seconds"
            },
            "critical_time": {
              "type": "number", 
              "minimum": 120,
              "default": 600,
              "description": "Critical threshold in seconds"
            }
          }
        },
        "audio_alerts": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "volume": {
              "type": "number",
              "minimum": 0,
              "maximum": 10,
              "default": 7
            },
            "new_order_sound": {
              "type": "string",
              "enum": ["chime", "bell", "beep", "custom"],
              "default": "chime"
            }
          }
        }
      }
    }
  },
  "required": ["device_id", "display_settings"]
}
```

### Barcode Scanner Configuration
```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "type": "object", 
  "properties": {
    "device_id": {
      "type": "string",
      "pattern": "^hw_device_[a-z0-9_]+$"
    },
    "scan_settings": {
      "type": "object",
      "properties": {
        "scan_mode": {
          "type": "string",
          "enum": ["auto", "manual", "continuous"],
          "default": "auto"
        },
        "supported_codes": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["UPC-A", "UPC-E", "EAN-8", "EAN-13", "CODE128", "CODE39", "QR", "DATA_MATRIX"]
          },
          "default": ["UPC-A", "UPC-E", "EAN-13", "QR"]
        },
        "beep_enabled": {
          "type": "boolean",
          "default": true
        },
        "scan_timeout": {
          "type": "number",
          "minimum": 1,
          "maximum": 30,
          "default": 5,
          "description": "Scan timeout in seconds"
        }
      }
    },
    "data_handling": {
      "type": "object",
      "properties": {
        "batch_mode": {
          "type": "boolean",
          "default": false
        },
        "offline_storage": {
          "type": "boolean", 
          "default": true
        },
        "auto_upload": {
          "type": "boolean",
          "default": true
        },
        "duplicate_filtering": {
          "type": "boolean",
          "default": true
        }
      }
    }
  },
  "required": ["device_id", "scan_settings"]
}
```

## Integration Testing Requirements

### Hardware Profile Validation
Each hardware profile must pass comprehensive validation testing:

1. **Physical Compatibility Tests**
   - Verify specified dimensions and weight
   - Test power consumption measurements
   - Validate environmental operating conditions

2. **Communication Protocol Tests**
   - Test all listed communication protocols
   - Verify security implementations
   - Validate data transmission rates

3. **Capability Verification Tests**
   - Test all claimed device capabilities
   - Verify performance benchmarks
   - Validate self-test implementations

4. **Industry Use Case Tests**
   - Test industry-specific workflows
   - Validate template compatibility
   - Verify API endpoint functionality

5. **Configuration Schema Tests**
   - Validate JSON schema compliance
   - Test configuration parameter ranges
   - Verify default value handling

This comprehensive hardware profile specification ensures Thorbis can support a wide range of hardware devices with consistent, reliable integration across all supported industries.
