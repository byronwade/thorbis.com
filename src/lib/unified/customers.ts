export type CustomerAddress = {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
  state: string
  zipCode: string
  country: string
  isPrimary?: boolean
}

export type CustomerContact = {
  id: string
  name: string
  email?: string
  phone?: string
  role?: string
  isPrimary?: boolean
  department?: string
}

export type CustomerInteraction = {
  id: string
  type: "email" | "phone" | "chat" | "meeting" | "note"
  date: string
  subject: string
  summary: string
  userId: string
  userRole: string
  status: "open" | "closed" | "pending"
  priority: "low" | "medium" | "high"
  tags: string[]
}

export type Invoice = {
  id: string
  number: string
  customerId: string
  date: string
  dueDate: string
  amount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  items: InvoiceItem[]
  notes?: string
  paymentTerms: string
  taxAmount: number
  discountAmount?: number
}

export type InvoiceItem = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxRate?: number
}

export type Estimate = {
  id: string
  number: string
  customerId: string
  date: string
  expiryDate: string
  amount: number
  status: "draft" | "sent" | "accepted" | "declined" | "expired"
  items: InvoiceItem[]
  notes?: string
  validityPeriod: string
  taxAmount: number
  discountAmount?: number
}

export type CustomerProject = {
  id: string
  name: string
  status: "active" | "completed" | "on-hold" | "cancelled"
  startDate: string
  endDate?: string
  value: number
  description: string
  assignedTo: string[]
}

export type Customer = {
  id: string
  name: string
  email?: string
  phone?: string
  org?: string
  since?: string
  plan?: string
  sla?: "Standard (8x5)" | "Premium (24x7)"
  balanceDue?: number
  openInvoices?: number
  lastInvoiceDate?: string
  lastEstimateDate?: string
  lastOrderId?: string
  lastOrderTotal?: number
  tags?: string[]
  stats?: {
    orders?: number
    tickets?: number
    lastSeen?: string
    totalSpent?: number
    avgOrderValue?: number
    lifetimeValue?: number
  }
  addresses?: CustomerAddress[]
  contacts?: CustomerContact[]
  interactions?: CustomerInteraction[]
  invoices?: Invoice[]
  estimates?: Estimate[]
  projects?: CustomerProject[]
  preferences?: {
    communicationMethod: "email" | "phone" | "chat"
    language: string
    timezone: string
    currency: string
  }
  customFields?: Record<string, any>
  creditLimit?: number
  paymentTerms?: string
  taxExempt?: boolean
  industry?: string
  website?: string
  socialMedia?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

const SAMPLE_INTERACTIONS: CustomerInteraction[] = [
  {
    id: "int1",
    type: "email",
    date: "2025-01-10 14:30",
    subject: "Invoice #1041 Payment Inquiry",
    summary: "Customer inquired about payment status for invoice #1041. Provided payment confirmation and receipt.",
    userId: "u1",
    userRole: "Support",
    status: "closed",
    priority: "medium",
    tags: ["billing", "payment"],
  },
  {
    id: "int2",
    type: "phone",
    date: "2025-01-08 10:15",
    subject: "Product Setup Assistance",
    summary: "15-minute call to help customer configure their new subscription. Walked through dashboard setup.",
    userId: "u3",
    userRole: "Success",
    status: "closed",
    priority: "low",
    tags: ["onboarding", "support"],
  },
  {
    id: "int3",
    type: "chat",
    date: "2025-01-05 16:45",
    subject: "Billing Address Update",
    summary: "Customer requested billing address change. Updated in system and confirmed via email.",
    userId: "u4",
    userRole: "Billing",
    status: "closed",
    priority: "low",
    tags: ["billing", "account-update"],
  },
]

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv1",
    number: "INV-2025-001",
    customerId: "cust1",
    date: "2025-01-01",
    dueDate: "2025-01-31",
    amount: 1250.0,
    status: "paid",
    paymentTerms: "Net 30",
    taxAmount: 125.0,
    items: [
      {
        id: "item1",
        description: "Professional Services - Q4 2024",
        quantity: 1,
        unitPrice: 1000.0,
        total: 1000.0,
        taxRate: 0.125,
      },
      {
        id: "item2",
        description: "Additional Support Hours",
        quantity: 5,
        unitPrice: 50.0,
        total: 250.0,
        taxRate: 0.125,
      },
    ],
  },
  {
    id: "inv2",
    number: "INV-2025-015",
    customerId: "cust1",
    date: "2025-01-15",
    dueDate: "2025-02-14",
    amount: 875.0,
    status: "sent",
    paymentTerms: "Net 30",
    taxAmount: 87.5,
    items: [
      {
        id: "item3",
        description: "Monthly Subscription - February 2025",
        quantity: 1,
        unitPrice: 750.0,
        total: 750.0,
        taxRate: 0.125,
      },
      {
        id: "item4",
        description: "Setup Fee",
        quantity: 1,
        unitPrice: 125.0,
        total: 125.0,
        taxRate: 0.125,
      },
    ],
  },
]

const SAMPLE_ESTIMATES: Estimate[] = [
  {
    id: "est1",
    number: "EST-2025-003",
    customerId: "cust1",
    date: "2025-01-12",
    expiryDate: "2025-02-12",
    amount: 2500.0,
    status: "sent",
    validityPeriod: "30 days",
    taxAmount: 250.0,
    items: [
      {
        id: "estitem1",
        description: "Website Redesign Project",
        quantity: 1,
        unitPrice: 2000.0,
        total: 2000.0,
        taxRate: 0.125,
      },
      {
        id: "estitem2",
        description: "SEO Optimization Package",
        quantity: 1,
        unitPrice: 500.0,
        total: 500.0,
        taxRate: 0.125,
      },
    ],
  },
]

const CUSTOMERS: Customer[] = [
  {
    id: "cust1",
    name: "Pat Jones",
    email: "pat@example.com",
    phone: "+1-555-0100",
    org: "Jones & Co",
    since: "2022-03-14",
    plan: "Business",
    sla: "Premium (24x7)",
    balanceDue: 875.0,
    openInvoices: 1,
    lastInvoiceDate: "2025-01-15",
    lastEstimateDate: "2025-01-12",
    lastOrderId: "1041",
    lastOrderTotal: 249.0,
    tags: ["Priority", "Wholesale", "VIP"],
    stats: {
      orders: 18,
      tickets: 6,
      lastSeen: "2025-01-14 15:42",
      totalSpent: 15750.0,
      avgOrderValue: 875.0,
      lifetimeValue: 18500.0,
    },
    addresses: [
      {
        id: "addr1",
        label: "Headquarters",
        line1: "500 Market St",
        line2: "Suite 200",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        country: "USA",
        isPrimary: true,
      },
      {
        id: "addr2",
        label: "Billing",
        line1: "PO Box 12345",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        country: "USA",
      },
    ],
    contacts: [
      {
        id: "contact1",
        name: "Pat Jones",
        email: "pat@example.com",
        phone: "+1-555-0100",
        role: "CEO",
        isPrimary: true,
        department: "Executive",
      },
      {
        id: "contact2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1-555-0101",
        role: "CFO",
        department: "Finance",
      },
      {
        id: "contact3",
        name: "Mike Chen",
        email: "mike@example.com",
        phone: "+1-555-0102",
        role: "IT Director",
        department: "Technology",
      },
    ],
    interactions: SAMPLE_INTERACTIONS,
    invoices: SAMPLE_INVOICES,
    estimates: SAMPLE_ESTIMATES,
    projects: [
      {
        id: "proj1",
        name: "Q1 2025 System Upgrade",
        status: "active",
        startDate: "2025-01-01",
        value: 15000.0,
        description: "Complete system infrastructure upgrade including new servers and software licenses",
        assignedTo: ["u1", "u8"],
      },
    ],
    preferences: {
      communicationMethod: "email",
      language: "en-US",
      timezone: "America/Los_Angeles",
      currency: "USD",
    },
    creditLimit: 25000.0,
    paymentTerms: "Net 30",
    taxExempt: false,
    industry: "Technology Services",
    website: "https://jonesandco.com",
    socialMedia: {
      linkedin: "https://linkedin.com/company/jones-co",
      twitter: "@jonesandco",
    },
  },
]

export function getCustomerById(id: string | undefined | null): Customer | undefined {
  if (!id) return undefined
  return CUSTOMERS.find((c) => c.id === id)
}

export function getCustomerByEmail(email: string | undefined | null): Customer | undefined {
  if (!email) return undefined
  const e = email.toLowerCase()
  return CUSTOMERS.find((c) => (c.email || "").toLowerCase() === e)
}

export function inferCustomerByName(name: string | undefined | null): Customer | undefined {
  if (!name) return undefined
  const n = name.toLowerCase().trim()
  return CUSTOMERS.find((c) => c.name.toLowerCase() === n)
}

export function getAllCustomers(): Customer[] {
  return CUSTOMERS
}

export function getCustomerInvoices(customerId: string): Invoice[] {
  const customer = getCustomerById(customerId)
  return customer?.invoices || []
}

export function getCustomerEstimates(customerId: string): Estimate[] {
  const customer = getCustomerById(customerId)
  return customer?.estimates || []
}

export function getCustomerInteractions(customerId: string): CustomerInteraction[] {
  const customer = getCustomerById(customerId)
  return customer?.interactions || []
}

export function addCustomerInteraction(customerId: string, interaction: Omit<CustomerInteraction, "id">): void {
  const customer = CUSTOMERS.find((c) => c.id === customerId)
  if (customer) {
    const newInteraction: CustomerInteraction = {
      ...interaction,
      id: `int_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    }
    if (!customer.interactions) customer.interactions = []
    customer.interactions.unshift(newInteraction)
  }
}
