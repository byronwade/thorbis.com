// Comprehensive Thorbis Product Catalog - Reorganized
export const allProducts = [
  // ========================================
  // CORE BUSINESS HARDWARE
  // ========================================
  
  // POS & Payment Systems
  {
    id: "thorbis-flippad",
    name: "Thorbis FlipPad",
    description: "Swivel customer display with PIN on glass, flips 180° for signatures",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "New",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 156,
    category: "POS Systems"
  },
  {
    id: "thorbis-pay-brick-mini",
    name: "Thorbis Pay Brick Mini",
    description: "Ultra-compact NFC/EMV dongle that snaps to phones/tablets",
    image: "/placeholder-business.svg",
    price: 149,
    originalPrice: 199,
    badge: "Popular",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 423,
    category: "POS Systems"
  },
  {
    id: "thorbis-splitter",
    name: "Thorbis Splitter",
    description: "Dual-lane card reader: one for staff, one for customer",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Innovation",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 98,
    category: "POS Systems"
  },
  {
    id: "thorbis-cashsafe",
    name: "Thorbis CashSafe",
    description: "Smart cash drawer with coin recycling add-on and tamper telemetry",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Security",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 267,
    category: "POS Systems"
  },
  {
    id: "thorbis-receipt-vault",
    name: "Thorbis Receipt Vault",
    description: "Tiny, silent 58mm printer for kiosks/food trucks with jam-proof chute",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Compact",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 145,
    category: "POS Systems"
  },
  {
    id: "thorbis-tiptop",
    name: "Thorbis TipTop",
    description: "Countertop tip/feedback puck with emoji faceplate and QR/NFC",
    image: "/placeholder-business.svg",
    price: 89,
    originalPrice: 129,
    badge: "New",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 187,
    category: "POS Systems"
  },
  {
    id: "thorbis-queuelight",
    name: "Thorbis QueueLight",
    description: "LED tower that syncs with POS to call next guest",
    image: "/placeholder-business.svg",
    price: 249,
    originalPrice: 299,
    badge: "Efficiency",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 134,
    category: "POS Systems"
  },

  // Self-Service & Kiosks
  {
    id: "thorbis-beacon-mini",
    name: "Thorbis Beacon Mini",
    description: "21.5″ counter kiosk with on-glass PIN + 2D scanner window",
    image: "/placeholder-business.svg",
    price: 1299,
    originalPrice: 1599,
    badge: "Kiosk",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 189,
    category: "Self-Service"
  },
  {
    id: "thorbis-beacon-dual",
    name: "Thorbis Beacon Dual",
    description: "Back-to-back floor kiosk for two users, one spine, one service door",
    image: "/placeholder-business.svg",
    price: 2499,
    originalPrice: 2999,
    badge: "Dual",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 76,
    category: "Self-Service"
  },
  {
    id: "thorbis-orderpad",
    name: "Thorbis OrderPad",
    description: "Wall/rail-mounted 13″ mini-kiosk for small stores and pop-ups",
    image: "/placeholder-business.svg",
    price: 799,
    originalPrice: 999,
    badge: "Compact",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 123,
    category: "Self-Service"
  },
  {
    id: "thorbis-ada-assist-deck",
    name: "Thorbis ADA Assist Deck",
    description: "Retractable tactile keypad + 3.5mm audio for any kiosk",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Accessibility",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 89,
    category: "Self-Service"
  },

  // Kitchen & Back-of-House
  {
    id: "thorbis-kds-lite",
    name: "Thorbis KDS Lite",
    description: "PoE-powered 15.6″ kitchen screen with glove touch and grease-proof lens",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Kitchen",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 312,
    category: "Kitchen Systems"
  },
  {
    id: "thorbis-bumpbar",
    name: "Thorbis BumpBar",
    description: "Stainless, sealed keypad that talks BLE to KDS",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Rugged",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 178,
    category: "Kitchen Systems"
  },
  {
    id: "thorbis-expocam",
    name: "Thorbis ExpoCam",
    description: "Camera that snapshots an order at pass-through for QA/audit trail",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Quality",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 145,
    category: "Kitchen Systems"
  },
  {
    id: "thorbis-heatsense",
    name: "Thorbis HeatSense",
    description: "IR thermal node over fryers/ovens to log temps & alert anomalies",
    image: "/placeholder-business.svg",
    price: 349,
    originalPrice: 449,
    badge: "Safety",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 167,
    category: "Kitchen Systems"
  },
  {
    id: "thorbis-chefmic",
    name: "Thorbis ChefMic",
    description: "Push-to-talk puck for expo ↔ line, logged to order timeline",
    image: "/placeholder-business.svg",
    price: 149,
    originalPrice: 199,
    badge: "Communication",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 234,
    category: "Kitchen Systems"
  },

  // Retail & Inventory Management
  {
    id: "thorbis-smartbin",
    name: "Thorbis SmartBin",
    description: "Weight/vision bin that counts fasteners, PVC fittings, PEX rings",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Inventory",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 198,
    category: "Inventory Management"
  },
  {
    id: "thorbis-shelfeye",
    name: "Thorbis ShelfEye",
    description: "Low-power camera tag that flags out-of-stock and wrong facings",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Vision",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 156,
    category: "Inventory Management"
  },
  {
    id: "thorbis-railscan",
    name: "Thorbis RailScan",
    description: "Sliding scanner arm mounted on gondola rails for nightly cycle counts",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Automation",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 87,
    category: "Inventory Management"
  },
  {
    id: "thorbis-labeljet",
    name: "Thorbis LabelJet",
    description: "Mobile label printer sled for mPOS (57/80mm, linerless)",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Mobile",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 134,
    category: "Inventory Management"
  },
  {
    id: "thorbis-liftscale",
    name: "Thorbis LiftScale",
    description: "Handle-grip with load cell to verify product weight vs SKU at pickup",
    image: "/placeholder-business.svg",
    price: 449,
    originalPrice: 549,
    badge: "Verification",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 112,
    category: "Inventory Management"
  },

  // ========================================
  // FLEET & FIELD OPERATIONS
  // ========================================

  // Fleet Management
  {
    id: "thorbis-aegis-360",
    name: "Thorbis Aegis 360",
    description: "4-cam DVR kit with AI lane + incident marks",
    image: "/placeholder-business.svg",
    price: 1299,
    originalPrice: 1599,
    badge: "Fleet",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 267,
    category: "Fleet Management"
  },
  {
    id: "thorbis-bolt-pro",
    name: "Thorbis Bolt Pro",
    description: "OBD-II + J1939 telematics with CAN pass-through and edge-scripts",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Telematics",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 189,
    category: "Fleet Management"
  },
  {
    id: "thorbis-yard-beacon",
    name: "Thorbis Yard Beacon",
    description: "Solar LoRa/LTE-M gate/beacon for depot geofencing and check-ins",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Solar",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 145,
    category: "Fleet Management"
  },
  {
    id: "thorbis-coldchain",
    name: "Thorbis ColdChain",
    description: "BLE temp loggers for refrigerated vans with DriveHub dashboard",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Temperature",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 178,
    category: "Fleet Management"
  },
  {
    id: "thorbis-towlock",
    name: "Thorbis TowLock",
    description: "Hitch/ladder-rack sensor kit with vibration profile to detect tool theft",
    image: "/placeholder-business.svg",
    price: 349,
    originalPrice: 449,
    badge: "Security",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 123,
    category: "Fleet Management"
  },
  {
    id: "thorbis-fob-plus",
    name: "Thorbis FOB+",
    description: "UWB/BT key fob for Guard/DriveHub auto-arm/disarm with proximity accuracy",
    image: "/placeholder-business.svg",
    price: 149,
    originalPrice: 199,
    badge: "Proximity",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 234,
    category: "Fleet Management"
  },
  {
    id: "thorbis-workmate-tablet",
    name: "Thorbis WorkMate Tablet",
    description: "Rugged 8–10″ Android tablet with pogo-dock and scanner sled",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Rugged",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 156,
    category: "Fleet Management"
  },

  // Warehouse & Logistics
  {
    id: "thorbis-palletcam",
    name: "Thorbis PalletCam",
    description: "Fork-mast camera + display kit with barcode aim assist",
    image: "/placeholder-business.svg",
    price: 799,
    originalPrice: 999,
    badge: "Warehouse",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 134,
    category: "Warehouse Systems"
  },
  {
    id: "thorbis-picktorch",
    name: "Thorbis PickTorch",
    description: "Wearable ring scanner with haptic confirm + AI for part recognition",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Wearable",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 167,
    category: "Warehouse Systems"
  },
  {
    id: "thorbis-dockshield",
    name: "Thorbis DockShield",
    description: "Loading-bay sensor/LED system tied to queue board & yard gate",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Dock",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 98,
    category: "Warehouse Systems"
  },
  {
    id: "thorbis-routebox",
    name: "Thorbis RouteBox",
    description: "Lockable tote with BLE/UWB and temperature/tilt sensors",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Delivery",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 145,
    category: "Warehouse Systems"
  },

  // ========================================
  // SECURITY & MONITORING
  // ========================================

  // Security Systems
  {
    id: "thorbis-doorsense",
    name: "Thorbis DoorSense",
    description: "Adhesive smart contacts with 2-year coin-cell, BLE mesh to store hub",
    image: "/placeholder-business.svg",
    price: 99,
    originalPrice: 149,
    badge: "Security",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 312,
    category: "Security Systems"
  },
  {
    id: "thorbis-camtile",
    name: "Thorbis CamTile",
    description: "Palm-sized PoE camera tile that magnets under shelves for shrink watch",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Covert",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 189,
    category: "Security Systems"
  },
  {
    id: "thorbis-alarm-bridge",
    name: "Thorbis AlarmBridge",
    description: "SIP/VoIP bridge that feeds alarm events to call trees and records calls",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Integration",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 134,
    category: "Security Systems"
  },
  {
    id: "thorbis-platesnap",
    name: "Thorbis PlateSnap",
    description: "LPR camera module at drive-thru or yard gate, privacy-guarded exports",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "LPR",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 167,
    category: "Security Systems"
  },

  // ========================================
  // DISPLAYS & DIGITAL SIGNAGE
  // ========================================

  {
    id: "thorbis-tv-stick",
    name: "Thorbis TV Stick",
    description: "HDMI compute stick with Thorbis Fleet agent for any existing TV",
    image: "/placeholder-business.svg",
    price: 149,
    originalPrice: 199,
    badge: "Display",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 245,
    category: "Digital Signage"
  },
  {
    id: "thorbis-menubar",
    name: "Thorbis MenuBar",
    description: "Ultra-wide 28″/37″ shelf-edge LCD bars for menus/promos",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Menu",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 178,
    category: "Digital Signage"
  },
  {
    id: "thorbis-window-pro",
    name: "Thorbis Window Pro",
    description: "2500-nit outward-facing display with optical bonding for sunny storefronts",
    image: "/placeholder-business.svg",
    price: 2499,
    originalPrice: 2999,
    badge: "Bright",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 89,
    category: "Digital Signage"
  },
  {
    id: "thorbis-cast",
    name: "Thorbis Cast",
    description: "Wireless casting puck (guest-safe VLAN) to TVs for presentations/training",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Wireless",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 156,
    category: "Digital Signage"
  },

  // ========================================
  // IOT & SENSORS
  // ========================================

  {
    id: "thorbis-leaklink",
    name: "Thorbis LeakLink",
    description: "Water leak puck sensors for restrooms/mech rooms with SMS/Slack alerts",
    image: "/placeholder-business.svg",
    price: 149,
    originalPrice: 199,
    badge: "IoT",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 234,
    category: "IoT Sensors"
  },
  {
    id: "thorbis-flowpulse",
    name: "Thorbis FlowPulse",
    description: "Inline flow meter with BLE for job billing & leak detection",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Flow",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 167,
    category: "IoT Sensors"
  },
  {
    id: "thorbis-gasguard",
    name: "Thorbis GasGuard",
    description: "Methane/CO pair with sounder; logs trends for compliance",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Safety",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 145,
    category: "IoT Sensors"
  },
  {
    id: "thorbis-airtagger",
    name: "Thorbis AirTagger",
    description: "IAQ node (PM2.5/CO2/VOC) to nudge HVAC/fresh air settings",
    image: "/placeholder-business.svg",
    price: 249,
    originalPrice: 299,
    badge: "Air Quality",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 198,
    category: "IoT Sensors"
  },
  {
    id: "thorbis-doorbell-pro",
    name: "Thorbis DoorBell Pro",
    description: "Smart bell with camera + counter display pop for pickup windows",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Smart",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 178,
    category: "IoT Sensors"
  },

  // ========================================
  // TRADES & SPECIALIZED HARDWARE
  // ========================================

  // Plumbing & Trades
  {
    id: "thorbis-pipescope",
    name: "Thorbis PipeScope",
    description: "Wi-Fi sewer cam reel with 4K head, auto-level, cloud markups & share links",
    image: "/placeholder-business.svg",
    price: 2499,
    originalPrice: 2999,
    badge: "Plumbing",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 267,
    category: "Trades Equipment"
  },
  {
    id: "thorbis-jetsense",
    name: "Thorbis JetSense",
    description: "Pressure/flow telemetry for jetters with job ticket auto-attach",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Jetting",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 189,
    category: "Trades Equipment"
  },
  {
    id: "thorbis-freezekit",
    name: "Thorbis FreezeKit",
    description: "Pipe freeze rig controller with temp probes + safety lockouts",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Freezing",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 145,
    category: "Trades Equipment"
  },
  {
    id: "thorbis-waterheater-iq",
    name: "Thorbis WaterHeater IQ",
    description: "Retrofit controller for tank/tankless with fleet health + error codes",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Water Heater",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 234,
    category: "Trades Equipment"
  },
  {
    id: "thorbis-septicwatch",
    name: "Thorbis SepticWatch",
    description: "Tank level + pump runtime monitor with SMS for customers",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Septic",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 178,
    category: "Trades Equipment"
  },
  {
    id: "thorbis-meterclip",
    name: "Thorbis MeterClip",
    description: "Ultrasonic clamp-on meter to quote water usage during diagnosis",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Meter",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 156,
    category: "Trades Equipment"
  },
  {
    id: "thorbis-smarttrap",
    name: "Thorbis SmartTrap",
    description: "Floor drain trap monitor that alerts dry traps (stink prevention)",
    image: "/placeholder-business.svg",
    price: 149,
    originalPrice: 199,
    badge: "Trap",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 198,
    category: "Trades Equipment"
  },

  // ========================================
  // POWER & INFRASTRUCTURE
  // ========================================

  {
    id: "thorbis-countermate",
    name: "Thorbis CounterMate",
    description: "Under-counter cable hub with cable raceway and hidden USB/PoE",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Best Seller",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 234,
    category: "Infrastructure"
  },
  {
    id: "thorbis-magdock",
    name: "Thorbis MagDock",
    description: "Magnetic pogo-pin docks for mPOS/scanners with LED charge meters",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Charging",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 234,
    category: "Infrastructure"
  },
  {
    id: "thorbis-powerrail",
    name: "Thorbis PowerRail",
    description: "24V bus bar under counters to power POS, printers, hubs cleanly",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Power",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 167,
    category: "Infrastructure"
  },
  {
    id: "thorbis-solarvan",
    name: "Thorbis SolarVan",
    description: "Compact solar controller + panel kit sized for service vans",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Solar",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 123,
    category: "Infrastructure"
  },
  {
    id: "thorbis-ups-nano",
    name: "Thorbis UPS Nano",
    description: "Slim LiFePO₄ UPS slice for kiosks to finish transactions during blips",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "UPS",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 189,
    category: "Infrastructure"
  },

  // ========================================
  // SAFETY & COMPLIANCE
  // ========================================

  {
    id: "thorbis-tempcheck",
    name: "Thorbis TempCheck",
    description: "HACCP probe kit that pairs to KDS for logged food temps",
    image: "/placeholder-business.svg",
    price: 249,
    originalPrice: 299,
    badge: "HACCP",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 198,
    category: "Safety & Compliance"
  },
  {
    id: "thorbis-slipsensor",
    name: "Thorbis SlipSensor",
    description: "Floor moisture detection strip near beverage stations",
    image: "/placeholder-business.svg",
    price: 149,
    originalPrice: 199,
    badge: "Safety",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 167,
    category: "Safety & Compliance"
  },
  {
    id: "thorbis-aed-beacon",
    name: "Thorbis AED Beacon",
    description: "Small BLE beacon that guides staff/EMS to AED + auto-logs checks",
    image: "/placeholder-business.svg",
    price: 99,
    originalPrice: 149,
    badge: "Emergency",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 234,
    category: "Safety & Compliance"
  },

  // ========================================
  // CUSTOMER EXPERIENCE & MARKETING
  // ========================================

  {
    id: "thorbis-loyalty-tap",
    name: "Thorbis Loyalty Tap",
    description: "NFC kiosk puck for instant loyalty join/redemption with no forms",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Loyalty",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 189,
    category: "Customer Experience"
  },
  {
    id: "thorbis-quizboard",
    name: "Thorbis QuizBoard",
    description: "Quick survey screen at exit that feeds CSAT to dashboards",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Feedback",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 145,
    category: "Customer Experience"
  },
  {
    id: "thorbis-beaconlite",
    name: "Thorbis BeaconLite",
    description: "Tiny BLE beacons for micro-location promos & pick-up pings",
    image: "/placeholder-business.svg",
    price: 49,
    originalPrice: 79,
    badge: "Micro-Location",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 312,
    category: "Customer Experience"
  },

  // ========================================
  // DEVELOPMENT & TESTING
  // ========================================

  {
    id: "thorbis-devkit",
    name: "Thorbis DevKit",
    description: "Reference mainboard (RK3588) with breakouts for rapid prototyping",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Developer",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 89,
    category: "Development Tools"
  },
  {
    id: "thorbis-simlab",
    name: "Thorbis SimLab",
    description: "Payment/test harness that simulates EMV/tap transactions",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Testing",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 67,
    category: "Development Tools"
  },
  {
    id: "thorbis-fleetbench",
    name: "Thorbis FleetBench",
    description: "Desktop app + USB dongle to fuzz/soak-test POS/KDS under load",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Benchmark",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 78,
    category: "Development Tools"
  },

  // ========================================
  // COMPUTER VISION & AI
  // ========================================

  {
    id: "thorbis-shelfvision",
    name: "Thorbis ShelfVision",
    description: "Camera + edge box for small format cashierless aisles",
    image: "/placeholder-business.svg",
    price: 1999,
    originalPrice: 2499,
    badge: "Vision",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 123,
    category: "Computer Vision"
  },
  {
    id: "thorbis-smartgate",
    name: "Thorbis SmartGate",
    description: "Exit gate that validates virtual basket with light feedback",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Exit",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 98,
    category: "Computer Vision"
  },
  {
    id: "thorbis-trolleycam",
    name: "Thorbis TrolleyCam",
    description: "Cart-mounted vision ring to reduce shrink and auto-recognize bulky items",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Cart",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 134,
    category: "Computer Vision"
  },

  // ========================================
  // TRAINING & AR
  // ========================================

  {
    id: "thorbis-ar-assist",
    name: "Thorbis AR Assist",
    description: "Tablet/phone app with anchors in kitchen/van for step-by-step overlays",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "AR",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 167,
    category: "Training & AR"
  },
  {
    id: "thorbis-coachcam",
    name: "Thorbis CoachCam",
    description: "Wearable chest-cam for training shifts, auto-blurred faces",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Training",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 145,
    category: "Training & AR"
  },

  // ========================================
  // SERVICE & CUSTOMER SOLUTIONS
  // ========================================

  {
    id: "thorbis-househub",
    name: "Thorbis HouseHub",
    description: "Homeowner display puck that shows ETA, tech photo, invoices",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Customer",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 234,
    category: "Service Solutions"
  },
  {
    id: "thorbis-smartkey-locker",
    name: "Thorbis SmartKey Locker",
    description: "Small smart locker for keys/parts at customer sites with QR pickup",
    image: "/placeholder-business.svg",
    price: 399,
    originalPrice: 499,
    badge: "Locker",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 123,
    category: "Service Solutions"
  },

  // ========================================
  // OUTDOOR & HEAVY DUTY
  // ========================================

  {
    id: "thorbis-drive-thru-pro",
    name: "Thorbis Drive-Thru Pro",
    description: "Outdoor 2000-nit kiosk head + intercom + heater/defogger",
    image: "/placeholder-business.svg",
    price: 3499,
    originalPrice: 3999,
    badge: "Outdoor",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 89,
    category: "Outdoor Systems"
  },
  {
    id: "thorbis-yardcam",
    name: "Thorbis YardCam",
    description: "PoE camera with plate/vehicle class detection for service depots",
    image: "/placeholder-business.svg",
    price: 499,
    originalPrice: 599,
    badge: "Yard",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 167,
    category: "Outdoor Systems"
  },
  {
    id: "thorbis-fuelguard",
    name: "Thorbis FuelGuard",
    description: "Fleet fuel island controller with POS/Guard integration",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Fuel",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 134,
    category: "Outdoor Systems"
  },

  // ========================================
  // DATA & EDGE COMPUTING
  // ========================================

  {
    id: "thorbis-edgecore",
    name: "Thorbis EdgeCore",
    description: "Tiny Linux edge server (fanless) for stores that want local caches",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Edge",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 98,
    category: "Edge Computing"
  },
  {
    id: "thorbis-meshnode",
    name: "Thorbis MeshNode",
    description: "BLE/wifi mesh repeater to blanket warehouses and yards",
    image: "/placeholder-business.svg",
    price: 199,
    originalPrice: 249,
    badge: "Mesh",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 145,
    category: "Edge Computing"
  },

  // ========================================
  // SUPPLY HOUSE SOLUTIONS
  // ========================================

  {
    id: "thorbis-pipewall",
    name: "Thorbis PipeWall",
    description: "Vertical vision lane that recognizes pipe length/diameter as you roll out",
    image: "/placeholder-business.svg",
    price: 1999,
    originalPrice: 2499,
    badge: "Supply House",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 67,
    category: "Supply House"
  },
  {
    id: "thorbis-fittingmatrix",
    name: "Thorbis FittingMatrix",
    description: "Camera grid over fittings wall that auto-counts restocks/empties",
    image: "/placeholder-business.svg",
    price: 1499,
    originalPrice: 1899,
    badge: "Inventory",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 89,
    category: "Supply House"
  },
  {
    id: "thorbis-probin",
    name: "Thorbis ProBin",
    description: "Pro-account bins with NFC lids that log who took what for chargebacks",
    image: "/placeholder-business.svg",
    price: 299,
    originalPrice: 399,
    badge: "Pro Account",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 123,
    category: "Supply House"
  },
  {
    id: "thorbis-cartpay",
    name: "Thorbis CartPay",
    description: "Cart-mounted reader + small display for self-checkout in trades aisle",
    image: "/placeholder-business.svg",
    price: 599,
    originalPrice: 749,
    badge: "Self-Checkout",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 98,
    category: "Supply House"
  },
  {
    id: "thorbis-will-call-locker",
    name: "Thorbis Will-Call Locker",
    description: "Heated/vented smart lockers for water-heater pickups with QR codes",
    image: "/placeholder-business.svg",
    price: 799,
    originalPrice: 999,
    badge: "Will-Call",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 145,
    category: "Supply House"
  },
  {
    id: "thorbis-deliverydash",
    name: "Thorbis DeliveryDash",
    description: "Driver console that auto-prioritizes routes and provides proof-of-delivery",
    image: "/placeholder-business.svg",
    price: 899,
    originalPrice: 1099,
    badge: "Delivery",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 178,
    category: "Supply House"
  },

  // ========================================
  // MERCHANDISE & BRANDED ITEMS
  // ========================================

  // Clothing & Apparel
  {
    id: "thorbis-tech-tee",
    name: "Thorbis Tech Tee",
    description: "Premium cotton t-shirt with embroidered Thorbis logo, perfect for tech professionals",
    image: "/placeholder-business.svg",
    price: 29,
    originalPrice: 39,
    badge: "Popular",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 234,
    category: "Clothing"
  },
  {
    id: "thorbis-polo-shirt",
    name: "Thorbis Polo Shirt",
    description: "Professional polo shirt with embroidered Thorbis logo, ideal for business meetings",
    image: "/placeholder-business.svg",
    price: 39,
    originalPrice: 49,
    badge: "Professional",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 189,
    category: "Clothing"
  },
  {
    id: "thorbis-hoodie",
    name: "Thorbis Hoodie",
    description: "Comfortable hoodie with embroidered Thorbis logo, perfect for casual wear",
    image: "/placeholder-business.svg",
    price: 49,
    originalPrice: 59,
    badge: "Comfort",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 312,
    category: "Clothing"
  },
  {
    id: "thorbis-baseball-cap",
    name: "Thorbis Baseball Cap",
    description: "Classic baseball cap with embroidered Thorbis logo, adjustable fit",
    image: "/placeholder-business.svg",
    price: 19,
    originalPrice: 24,
    badge: "Classic",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 445,
    category: "Clothing"
  },
  {
    id: "thorbis-trucker-hat",
    name: "Thorbis Trucker Hat",
    description: "Mesh-back trucker hat with embroidered Thorbis logo, breathable design",
    image: "/placeholder-business.svg",
    price: 22,
    originalPrice: 27,
    badge: "Breathable",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 198,
    category: "Clothing"
  },
  {
    id: "thorbis-beanie",
    name: "Thorbis Beanie",
    description: "Warm beanie with embroidered Thorbis logo, perfect for cold weather",
    image: "/placeholder-business.svg",
    price: 24,
    originalPrice: 29,
    badge: "Warm",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 167,
    category: "Clothing"
  },

  // Office & Stationery
  {
    id: "thorbis-lanyard",
    name: "Thorbis Lanyard",
    description: "Durable lanyard with embroidered Thorbis logo, includes ID badge holder",
    image: "/placeholder-business.svg",
    price: 12,
    originalPrice: 15,
    badge: "Essential",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 523,
    category: "Office Supplies"
  },
  {
    id: "thorbis-lanyard-deluxe",
    name: "Thorbis Deluxe Lanyard",
    description: "Premium lanyard with embroidered Thorbis logo, retractable badge reel included",
    image: "/placeholder-business.svg",
    price: 18,
    originalPrice: 22,
    badge: "Premium",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 234,
    category: "Office Supplies"
  },
  {
    id: "thorbis-pen-set",
    name: "Thorbis Pen Set",
    description: "Professional pen set with Thorbis logo, includes 5 retractable pens",
    image: "/placeholder-business.svg",
    price: 12,
    originalPrice: 16,
    badge: "Professional",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 234,
    category: "Office Supplies"
  },
  {
    id: "thorbis-notebook",
    name: "Thorbis Notebook",
    description: "Spiral-bound notebook with Thorbis logo, 100 lined pages",
    image: "/placeholder-business.svg",
    price: 9,
    originalPrice: 13,
    badge: "Notes",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 167,
    category: "Office Supplies"
  },
  {
    id: "thorbis-calendar",
    name: "Thorbis Calendar",
    description: "2024 wall calendar with Thorbis logo, monthly planner",
    image: "/placeholder-business.svg",
    price: 15,
    originalPrice: 20,
    badge: "2024",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 234,
    category: "Office Supplies"
  },
  {
    id: "thorbis-planner",
    name: "Thorbis Planner",
    description: "Daily planner with Thorbis logo, 12-month layout",
    image: "/placeholder-business.svg",
    price: 18,
    originalPrice: 24,
    badge: "12-Month",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 189,
    category: "Office Supplies"
  },

  // Drinkware & Food
  {
    id: "thorbis-coffee-mug",
    name: "Thorbis Coffee Mug",
    description: "Ceramic coffee mug with Thorbis logo, perfect for office or home use",
    image: "/placeholder-business.svg",
    price: 15,
    originalPrice: 19,
    badge: "Daily",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 189,
    category: "Drinkware"
  },
  {
    id: "thorbis-tumbler",
    name: "Thorbis Tumbler",
    description: "Insulated stainless steel tumbler with Thorbis logo, keeps drinks cold for hours",
    image: "/placeholder-business.svg",
    price: 25,
    originalPrice: 32,
    badge: "Insulated",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 267,
    category: "Drinkware"
  },
  {
    id: "thorbis-water-bottle",
    name: "Thorbis Water Bottle",
    description: "BPA-free water bottle with Thorbis logo, 32oz capacity with straw",
    image: "/placeholder-business.svg",
    price: 28,
    originalPrice: 35,
    badge: "Hydration",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 198,
    category: "Drinkware"
  },

  // Bags & Accessories
  {
    id: "thorbis-backpack",
    name: "Thorbis Backpack",
    description: "Durable laptop backpack with Thorbis logo, multiple compartments",
    image: "/placeholder-business.svg",
    price: 45,
    originalPrice: 55,
    badge: "Durable",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 145,
    category: "Bags & Accessories"
  },
  {
    id: "thorbis-tote-bag",
    name: "Thorbis Tote Bag",
    description: "Canvas tote bag with Thorbis logo, perfect for shopping or daily use",
    image: "/placeholder-business.svg",
    price: 18,
    originalPrice: 22,
    badge: "Eco-Friendly",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 234,
    category: "Bags & Accessories"
  },
  {
    id: "thorbis-keychain",
    name: "Thorbis Keychain",
    description: "Durable keychain with Thorbis logo, includes bottle opener",
    image: "/placeholder-business.svg",
    price: 8,
    originalPrice: 11,
    badge: "Utility",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 312,
    category: "Bags & Accessories"
  },
  {
    id: "thorbis-wallet",
    name: "Thorbis Wallet",
    description: "Genuine leather wallet with Thorbis logo, RFID protection",
    image: "/placeholder-business.svg",
    price: 28,
    originalPrice: 35,
    badge: "Leather",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 189,
    category: "Bags & Accessories"
  },

  // Safety & PPE
  {
    id: "thorbis-safety-glasses",
    name: "Thorbis Safety Glasses",
    description: "ANSI-rated safety glasses with Thorbis logo, clear lens",
    image: "/placeholder-business.svg",
    price: 18,
    originalPrice: 22,
    badge: "ANSI-Rated",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 234,
    category: "Safety & PPE"
  },
  {
    id: "thorbis-hard-hat",
    name: "Thorbis Hard Hat",
    description: "ANSI-rated hard hat with Thorbis logo, adjustable suspension",
    image: "/placeholder-business.svg",
    price: 35,
    originalPrice: 42,
    badge: "ANSI-Rated",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 167,
    category: "Safety & PPE"
  },
  {
    id: "thorbis-vest",
    name: "Thorbis Safety Vest",
    description: "High-visibility safety vest with Thorbis logo, ANSI Class 2",
    image: "/placeholder-business.svg",
    price: 28,
    originalPrice: 34,
    badge: "High-Vis",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 145,
    category: "Safety & PPE"
  },
  {
    id: "thorbis-ear-plugs",
    name: "Thorbis Ear Plugs",
    description: "Disposable ear plugs with Thorbis logo, NRR 33dB",
    image: "/placeholder-business.svg",
    price: 8,
    originalPrice: 12,
    badge: "NRR 33dB",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 312,
    category: "Safety & PPE"
  },
  {
    id: "thorbis-face-mask",
    name: "Thorbis Face Mask",
    description: "Reusable face mask with Thorbis logo, 3-layer protection",
    image: "/placeholder-business.svg",
    price: 12,
    originalPrice: 16,
    badge: "3-Layer",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 234,
    category: "Safety & PPE"
  },
  {
    id: "thorbis-hand-sanitizer",
    name: "Thorbis Hand Sanitizer",
    description: "Hand sanitizer with Thorbis logo, 70% alcohol content",
    image: "/placeholder-business.svg",
    price: 6,
    originalPrice: 8,
    badge: "70% Alcohol",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 456,
    category: "Safety & PPE"
  },

  // Tech & Electronics
  {
    id: "thorbis-power-bank",
    name: "Thorbis Power Bank",
    description: "10000mAh power bank with Thorbis logo, fast charging",
    image: "/placeholder-business.svg",
    price: 35,
    originalPrice: 42,
    badge: "10000mAh",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 234,
    category: "Tech & Electronics"
  },
  {
    id: "thorbis-bluetooth-speaker",
    name: "Thorbis Bluetooth Speaker",
    description: "Portable Bluetooth speaker with Thorbis logo, waterproof design",
    image: "/placeholder-business.svg",
    price: 55,
    originalPrice: 65,
    badge: "Waterproof",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 167,
    category: "Tech & Electronics"
  },
  {
    id: "thorbis-wireless-charger",
    name: "Thorbis Wireless Charger",
    description: "10W wireless charger with Thorbis logo, compatible with all phones",
    image: "/placeholder-business.svg",
    price: 32,
    originalPrice: 38,
    badge: "10W",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 198,
    category: "Tech & Electronics"
  },
  {
    id: "thorbis-phone-case",
    name: "Thorbis Phone Case",
    description: "Protective phone case with Thorbis logo, fits iPhone and Samsung models",
    image: "/placeholder-business.svg",
    price: 20,
    originalPrice: 25,
    badge: "Protection",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 198,
    category: "Tech & Electronics"
  },
  {
    id: "thorbis-laptop-sleeve",
    name: "Thorbis Laptop Sleeve",
    description: "Neoprene laptop sleeve with Thorbis logo, fits 13-15 inch laptops",
    image: "/placeholder-business.svg",
    price: 22,
    originalPrice: 28,
    badge: "Protection",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 145,
    category: "Tech & Electronics"
  },

  // Promotional & Marketing
  {
    id: "thorbis-stickers-pack",
    name: "Thorbis Stickers Pack",
    description: "Assorted vinyl stickers with Thorbis logos and slogans, 10 pieces",
    image: "/placeholder-business.svg",
    price: 8,
    originalPrice: 12,
    badge: "Decals",
    brand: "Thorbis",
    rating: 4.8,
    reviewCount: 456,
    category: "Promotional"
  },
  {
    id: "thorbis-magnet-set",
    name: "Thorbis Magnet Set",
    description: "Refrigerator magnets with Thorbis logos, perfect for office or home",
    image: "/placeholder-business.svg",
    price: 10,
    originalPrice: 14,
    badge: "Magnetic",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 189,
    category: "Promotional"
  },
  {
    id: "thorbis-flag",
    name: "Thorbis Flag",
    description: "3x5 foot flag with Thorbis logo, weather-resistant material",
    image: "/placeholder-business.svg",
    price: 35,
    originalPrice: 42,
    badge: "Weather-Resistant",
    brand: "Thorbis",
    rating: 4.7,
    reviewCount: 98,
    category: "Promotional"
  },
  {
    id: "thorbis-banner",
    name: "Thorbis Banner",
    description: "Vinyl banner with Thorbis logo, perfect for trade shows",
    image: "/placeholder-business.svg",
    price: 65,
    originalPrice: 79,
    badge: "Trade Show",
    brand: "Thorbis",
    rating: 4.6,
    reviewCount: 67,
    category: "Promotional"
  },
  {
    id: "thorbis-gift-card",
    name: "Thorbis Gift Card",
    description: "Digital gift card with Thorbis logo, customizable amount",
    image: "/placeholder-business.svg",
    price: 25,
    originalPrice: 25,
    badge: "Digital",
    brand: "Thorbis",
    rating: 4.9,
    reviewCount: 567,
    category: "Promotional"
  }
];

// Featured products (subset of all products)
export const featuredProducts = [
  allProducts.find(p => p.id === "thorbis-flippad"), // POS Systems
  allProducts.find(p => p.id === "thorbis-aegis-360"), // Fleet Management
  allProducts.find(p => p.id === "thorbis-tech-tee"), // Merchandise
].filter(Boolean);

// Get products by category
export const getProductsByCategory = (category) => {
  return allProducts.filter(product => product.category === category);
};

// Get all unique categories
export const getAllCategories = () => {
  const categories = [...new Set(allProducts.map(product => product.category))];
  return categories.sort();
};

// Search products
export const searchProducts = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};
