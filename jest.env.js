// Environment variables for Jest testing
process.env.NODE_ENV = 'test'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_APP_ENV = 'test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock API endpoints
process.env.API_BASE_URL = 'http://localhost:3000/api'

// Suppress console warnings in tests
process.env.SUPPRESS_CONSOLE_WARNINGS = 'true'