/**
 * SDK Generator for Thorbis Business OS APIs
 * 
 * Generates client SDKs in multiple programming languages based on
 * OpenAPI specifications for easy integration with Thorbis APIs.
 */

export interface SdkConfig {
  language: 'javascript' | 'typescript' | 'python' | 'php' | 'java' | 'csharp' | 'go' | 'ruby' | 'swift' | 'kotlin'
  packageName: string
  packageVersion: string
  apiBaseUrl: string
  industry?: string
  includeExamples: boolean
  includeTypes: boolean
  authType: 'api_key' | 'oauth2' | 'bearer'
}

export interface GeneratedSdk {
  language: string
  files: Array<{
    path: string
    content: string
    description: string
  }>
  packageConfig: any
  installation: string[]
  usage: string
  examples: string[]
}

export class SdkGenerator {
  /**
   * Generate JavaScript/Node.js SDK
   */
  private generateJavaScriptSdk(config: SdkConfig): GeneratedSdk {
    const isTypeScript = config.language === 'typescript'
    const fileExt = isTypeScript ? 'ts' : 'js'
    
    // Main client file
    const clientCode = '${isTypeScript ? '
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ThorbisApiConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
  meta?: {
    request_id: string;
    response_time_ms: number;
    api_version: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'prospect' | 'archived';
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  created_at: string;
  updated_at: string;
}
' : '}
const axios = require('axios');

/**
 * Thorbis Business OS API Client
 * 
 * Official JavaScript/Node.js SDK for Thorbis Business Operating System APIs.
 * Provides easy access to all industry-specific endpoints with built-in
 * authentication, error handling, and response formatting.
 * 
 * @example
 * const client = new ThorbisApi({
 *   apiKey: 'your-api-key-here',
 *   baseURL: 'https://api.thorbis.com'
 * });
 * 
 * const customers = await client.homeServices.customers.list();
 */
class ThorbisApi {
  ${isTypeScript ? '
  private client: AxiosInstance;
  public homeServices: HomeServicesApi;
  public restaurant: RestaurantApi;
  public autoServices: AutoServicesApi;
  public retail: RetailApi;
  public courses: CoursesApi;
  public payroll: PayrollApi;
  public ai: AiServicesApi;
  ' : '}
  
  constructor(config${isTypeScript ? ': ThorbisApiConfig' : '}) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.client = axios.create({
      baseURL: config.baseURL || '${config.apiBaseUrl}',
      timeout: config.timeout || 10000,
      headers: {
        'Authorization': \'Bearer \${config.apiKey}\',
        'Content-Type': 'application/json',
        'User-Agent': '${config.packageName}/\${require('./package.json').version}'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.error) {
          const apiError = new Error(error.response.data.error.message);
          apiError.code = error.response.data.error.code;
          apiError.requestId = error.response.data.error.request_id;
          throw apiError;
        }
        throw error;
      }
    );

    // Initialize service modules
    this.homeServices = new HomeServicesApi(this.client);
    this.restaurant = new RestaurantApi(this.client);
    this.autoServices = new AutoServicesApi(this.client);
    this.retail = new RetailApi(this.client);
    this.courses = new CoursesApi(this.client);
    this.payroll = new PayrollApi(this.client);
    this.ai = new AiServicesApi(this.client);
  }
}

/**
 * Home Services API Module
 */
class HomeServicesApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
    this.customers = new CustomerApi(client);
  }
}

/**
 * Customer Management API
 */
class CustomerApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
  }

  /**
   * List customers with filtering and pagination
   */
  async list(params${isTypeScript ? ': { limit?: number; offset?: number; status?: string; search?: string; } = {}' : ' = {}'})${isTypeScript ? ': Promise<ApiResponse<Customer[]>>' : '} {
    const response = await this.client.get('/v1/hs/customers', { params });
    return response.data;
  }

  /**
   * Get customer by ID
   */
  async get(customerId${isTypeScript ? ': string' : '})${isTypeScript ? ': Promise<ApiResponse<Customer>>' : '} {
    const response = await this.client.get(\'/v1/hs/customers/\${customerId}\');
    return response.data;
  }

  /**
   * Create new customer
   */
  async create(customerData${isTypeScript ? ': Partial<Customer>' : '})${isTypeScript ? ': Promise<ApiResponse<Customer>>' : '} {
    const response = await this.client.post('/v1/hs/customers', customerData);
    return response.data;
  }

  /**
   * Update existing customer
   */
  async update(customerId${isTypeScript ? ': string' : '}, updates${isTypeScript ? ': Partial<Customer>' : '})${isTypeScript ? ': Promise<ApiResponse<Customer>>' : '} {
    const response = await this.client.put(\'/v1/hs/customers/\${customerId}\', updates);
    return response.data;
  }

  /**
   * Delete customer
   */
  async delete(customerId${isTypeScript ? ': string' : '})${isTypeScript ? ': Promise<void>' : '} {
    await this.client.delete(\'/v1/hs/customers/\${customerId}\');
  }
}

// Placeholder classes for other API modules
class RestaurantApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
    this.orders = new OrdersApi(client);
  }
}

class OrdersApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
  }

  async list(params${isTypeScript ? ' = {}' : ' = {}'}) {
    const response = await this.client.get('/v1/rest/orders', { params });
    return response.data;
  }
}

class AutoServicesApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
  }
}

class RetailApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
  }
}

class CoursesApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
  }
}

class PayrollApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
  }
}

class AiServicesApi {
  constructor(client${isTypeScript ? ': AxiosInstance' : '}) {
    this.client = client;
  }
}

${isTypeScript ? 'export default ThorbisApi;' : 'module.exports = ThorbisApi;'}
'

    // Package configuration
    const packageJson = {
      name: config.packageName,
      version: config.packageVersion,
      description: 'Official JavaScript/TypeScript SDK for Thorbis Business OS APIs',
      main: isTypeScript ? 'dist/index.js' : 'index.js',
      types: isTypeScript ? 'dist/index.d.ts' : undefined,
      scripts: isTypeScript ? {
        build: 'tsc',
        prepublishOnly: 'npm run build',
        test: 'jest'
      } : {
        test: 'jest'
      },
      dependencies: {
        axios: '^1.6.0'
      },
      devDependencies: isTypeScript ? {
        '@/types/node': '^20.0.0',
        typescript: '^5.0.0',
        jest: '^29.0.0',
        '@/types/jest': '^29.0.0'
      } : {
        jest: '^29.0.0'
      },
      keywords: [
        'thorbis',
        'business-os',
        'api-client',
        'sdk',
        isTypeScript ? 'typescript' : 'javascript',
        'home-services',
        'restaurant',
        'auto-services',
        'retail'
      ],
      author: 'Thorbis Business OS Team',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/thorbis/business-os-js-sdk'
      }
    }

    // TypeScript configuration
    const tsConfig = isTypeScript ? {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests']
    } : null

    // README content
    const readme = '# ${config.packageName}

Official ${isTypeScript ? 'TypeScript' : 'JavaScript`} SDK for Thorbis Business OS APIs.

## Installation

\`\`\`bash
npm install ${config.packageName}
\`\`\`

## Quick Start

\'\'\'${isTypeScript ? 'typescript' : 'javascript'}'
const ThorbisApi = require('${config.packageName}');

const client = new ThorbisApi({
  apiKey: 'your-api-key-here',
  baseURL: '${config.apiBaseUrl}'
});

// List customers
const customers = await client.homeServices.customers.list({
  limit: 50,
  status: 'active'
});

// Create a new customer
const newCustomer = await client.homeServices.customers.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1-555-123-4567'
});

// List restaurant orders
const orders = await client.restaurant.orders.list({
  status: 'pending`
});
\`\`\'

## API Coverage

- **Home Services**: Customer management, work orders, scheduling
- **Restaurant**: Orders, menu management, kitchen operations
- **Auto Services**: Repair orders, diagnostics, parts management
- **Retail**: Products, inventory, sales management
- **Courses**: Learning management, student progress
- **Payroll**: Employee management, payroll processing
- **AI Services**: Natural language processing, automation

## Documentation

For complete API documentation, visit: [https://thorbis.com/docs](https://thorbis.com/docs)

## Support

- GitHub Issues: [https://github.com/thorbis/business-os-js-sdk/issues](https://github.com/thorbis/business-os-js-sdk/issues)
- Email: api-support@thorbis.com
- Documentation: [https://thorbis.com/docs](https://thorbis.com/docs)

## License

MIT
'

    const files = [
      {
        path: '${isTypeScript ? 'src/' : '}index.${fileExt}',
        content: clientCode,
        description: 'Main SDK client with all API modules'
      },
      {
        path: 'package.json',
        content: JSON.stringify(packageJson, null, 2),
        description: 'Package configuration and dependencies'
      },
      {
        path: 'README.md',
        content: readme,
        description: 'Installation and usage documentation'
      }
    ]

    if (tsConfig) {
      files.push({
        path: 'tsconfig.json',
        content: JSON.stringify(tsConfig, null, 2),
        description: 'TypeScript compilation configuration`
      })
    }

    return {
      language: config.language,
      files,
      packageConfig: packageJson,
      installation: ['npm install ${config.packageName}'],
      usage: 'const client = new ThorbisApi({ apiKey: 'your-api-key' });',
      examples: [
        'await client.homeServices.customers.list()',
        'await client.restaurant.orders.create(orderData)',
        'await client.autoServices.repairOrders.get(orderId)'
      ]
    }
  }

  /**
   * Generate Python SDK
   */
  private generatePythonSdk(config: SdkConfig): GeneratedSdk {
    const clientCode = '"""'
Thorbis Business OS API Python SDK

Official Python client library for Thorbis Business Operating System APIs.
Provides easy access to all industry-specific endpoints with built-in
authentication, error handling, and response parsing.

Usage:
    from thorbis_api import ThorbisApi
    
    client = ThorbisApi(api_key='your-api-key-here')
    customers = client.home_services.customers.list()
""""

import requests
from typing import Dict, List, Optional, Any, Union
from urllib.parse import urljoin
import json

class ThorbisApiError(Exception):
    """Custom exception for Thorbis API errors"""
    
    def __init__(self, message: str, code: str = None, request_id: str = None):
        super().__init__(message)
        self.code = code
        self.request_id = request_id

class ThorbisApi:
    """Main Thorbis API client"""
    
    def __init__(self, api_key: str, base_url: str = '${config.apiBaseUrl}', timeout: int = 30):
        """"
        Initialize the Thorbis API client
        
        Args:
            api_key: Your Thorbis API key
            base_url: API base URL (default: ${config.apiBaseUrl})
            timeout: Request timeout in seconds (default: 30)
        """"
        if not api_key:
            raise ValueError("API key is required")
            
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': f'${config.packageName}/{config.packageVersion} (Python)'
        })
        
        # Initialize service modules
        self.home_services = HomeServicesApi(self)
        self.restaurant = RestaurantApi(self)
        self.auto_services = AutoServicesApi(self)
        self.retail = RetailApi(self)
        self.courses = CoursesApi(self)
        self.payroll = PayrollApi(self)
        self.ai = AiServicesApi(self)
    
    def _request(self, method: str, endpoint: str, params: Dict = None, data: Dict = None) -> Dict:
        """Make HTTP request to API"""
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                json=data,
                timeout=self.timeout
            )
            
            # Handle API errors
            if not response.ok:
                error_data = response.json().get('error', {}) if response.headers.get('content-type', ').startswith('application/json') else {}
                raise ThorbisApiError(
                    message=error_data.get('message', f'HTTP {response.status_code}'),
                    code=error_data.get('code'),
                    request_id=error_data.get('request_id')
                )
            
            return response.json()
            
        except requests.RequestException as e:
            raise ThorbisApiError(f"Request failed: {str(e)}")

class BaseApiModule:
    """Base class for API modules"""
    
    def __init__(self, client: ThorbisApi):
        self.client = client

class HomeServicesApi(BaseApiModule):
    """Home Services API module"""
    
    def __init__(self, client: ThorbisApi):
        super().__init__(client)
        self.customers = CustomerApi(client)

class CustomerApi(BaseApiModule):
    """Customer management API"""
    
    def list(self, limit: int = 20, offset: int = 0, status: str = None, search: str = None) -> Dict:
        """"
        List customers with filtering and pagination
        
        Args:
            limit: Number of results to return (max 100)
            offset: Number of results to skip
            status: Filter by customer status
            search: Search by name, email, or phone
            
        Returns:
            API response with customer list and pagination info
        """"
        params =  {limit': limit, 'offset': offset}
        if status:
            params['status'] = status
        if search:
            params['search'] = search
            
        return self.client._request('GET', '/v1/hs/customers', params=params)
    
    def get(self, customer_id: str) -> Dict:
        """Get customer by ID"""
        return self.client._request('GET', f'/v1/hs/customers/{customer_id}')
    
    def create(self, customer_data: Dict) -> Dict:
        """Create new customer"""
        return self.client._request('POST', '/v1/hs/customers', data=customer_data)
    
    def update(self, customer_id: str, updates: Dict) -> Dict:
        """Update existing customer"""
        return self.client._request('PUT', f'/v1/hs/customers/{customer_id}', data=updates)
    
    def delete(self, customer_id: str) -> None:
        """Delete customer"""
        self.client._request('DELETE', f'/v1/hs/customers/{customer_id}')

class RestaurantApi(BaseApiModule):
    """Restaurant API module"""
    
    def __init__(self, client: ThorbisApi):
        super().__init__(client)
        self.orders = OrdersApi(client)

class OrdersApi(BaseApiModule):
    """Restaurant orders API"""
    
    def list(self, **params) -> Dict:
        """List restaurant orders"""
        return self.client._request('GET', '/v1/rest/orders`, params=params)

# Placeholder classes for other API modules
class AutoServicesApi(BaseApiModule):
    """Auto Services API module"""
    pass

class RetailApi(BaseApiModule):
    """Retail API module"""
    pass

class CoursesApi(BaseApiModule):
    """Courses API module"""
    pass

class PayrollApi(BaseApiModule):
    """Payroll API module"""
    pass

class AiServicesApi(BaseApiModule):
    """AI Services API module"""
    pass
`

    const setupPy = `from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="${config.packageName}",
    version="${config.packageVersion}",
    author="Thorbis Business OS Team",
    author_email="api-support@thorbis.com",
    description="Official Python SDK for Thorbis Business OS APIs",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/thorbis/business-os-python-sdk",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.7",
    install_requires=[
        "requests>=2.28.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=22.0.0",
            "flake8>=5.0.0",
            "mypy>=1.0.0",
        ],
    },
    keywords="thorbis business-os api-client sdk python home-services restaurant auto-services retail",
)
`

    const readme = `# ${config.packageName}

Official Python SDK for Thorbis Business OS APIs.

## Installation

\`\`\`bash
pip install ${config.packageName}
\`\`\`

## Quick Start

\'\'\'python
from thorbis_api import ThorbisApi

client = ThorbisApi(api_key='your-api-key-here')

# List customers
customers = client.home_services.customers.list(
    limit=50,
    status='active'
)

# Create a new customer
new_customer = client.home_services.customers.create({
    'name': 'John Doe',
    'email': 'john@example.com',
    'phone': '+1-555-123-4567'
})

# List restaurant orders
orders = client.restaurant.orders.list(status='pending`)
\`\'\'

## API Coverage

- **Home Services**: Customer management, work orders, scheduling
- **Restaurant**: Orders, menu management, kitchen operations  
- **Auto Services**: Repair orders, diagnostics, parts management
- **Retail**: Products, inventory, sales management
- **Courses**: Learning management, student progress
- **Payroll**: Employee management, payroll processing
- **AI Services**: Natural language processing, automation

## Documentation

For complete API documentation, visit: [https://thorbis.com/docs](https://thorbis.com/docs)

## Support

- GitHub Issues: [https://github.com/thorbis/business-os-python-sdk/issues](https://github.com/thorbis/business-os-python-sdk/issues)
- Email: api-support@thorbis.com

## License

MIT
'

    return {
      language: config.language,
      files: [
        {
          path: 'thorbis_api/__init__.py',
          content: clientCode,
          description: 'Main SDK module with all API classes'
        },
        {
          path: 'setup.py',
          content: setupPy,
          description: 'Package setup and configuration'
        },
        {
          path: 'README.md',
          content: readme,
          description: 'Installation and usage documentation'
        },
        {
          path: 'requirements.txt',
          content: 'requests>=2.28.0
',
          description: 'Package dependencies`
        }
      ],
      packageConfig: { name: config.packageName, version: config.packageVersion },
      installation: ['pip install ${config.packageName}'],
      usage: 'client = ThorbisApi(api_key='your-api-key')',
      examples: [
        'client.home_services.customers.list()',
        'client.restaurant.orders.create(order_data)',
        'client.auto_services.repair_orders.get(order_id)'
      ]
    }
  }

  /**
   * Generate SDK for specified language and configuration
   */
  generateSdk(config: SdkConfig): GeneratedSdk {
    switch (config.language) {
      case 'javascript':
      case 'typescript':
        return this.generateJavaScriptSdk(config)
      case 'python':
        return this.generatePythonSdk(config)
      default:
        throw new Error('Unsupported language: ${config.language}')
    }
  }

  /**
   * Get available SDK languages
   */
  getSupportedLanguages(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'javascript',
        label: 'JavaScript',
        description: 'Node.js SDK with axios HTTP client'
      },
      {
        value: 'typescript',
        label: 'TypeScript',
        description: 'Strongly typed Node.js SDK'
      },
      {
        value: 'python',
        label: 'Python',
        description: 'Python 3.7+ SDK with requests'
      },
      {
        value: 'php',
        label: 'PHP',
        description: 'PHP SDK with Guzzle HTTP client'
      },
      {
        value: 'java',
        label: 'Java',
        description: 'Java SDK with OkHttp client'
      },
      {
        value: 'csharp',
        label: 'C#',
        description: '.NET SDK with HttpClient'
      },
      {
        value: 'go',
        label: 'Go',
        description: 'Go SDK with native HTTP client'
      },
      {
        value: 'ruby',
        label: 'Ruby',
        description: 'Ruby gem with net/http'
      }
    ]
  }

  /**
   * Generate SDK package as ZIP archive
   */
  async generateZipPackage(config: SdkConfig): Promise<Blob> {
    const sdk = this.generateSdk(config)
    
    // In a real implementation, would use a ZIP library like JSZip
    // For now, return a mock blob
    const mockZipContent = sdk.files.map(file => 
      '--- ${file.path} ---
${file.content}

'
    ).join(')
    
    return new Blob([mockZipContent], { type: 'application/zip' })
  }
}

export const sdkGenerator = new SdkGenerator()