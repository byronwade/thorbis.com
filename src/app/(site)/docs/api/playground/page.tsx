/**
 * API Playground - Interactive API Testing Interface
 * Allows developers to test API endpoints directly from the documentation
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play,
  Copy,
  Save,
  Download,
  RefreshCw,
  Code,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Home,
  Car,
  Store,
  Utensils,
  Users,
  Wrench,
  Calendar,
  FileText,
  BarChart,
  Zap
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  category: string;
  auth_required: boolean;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: any;
  }[];
  example_request?: any;
  example_response?: any;
}

// Sample endpoints for the playground
const sampleEndpoints: APIEndpoint[] = [
  {
    id: 'hs-customers-list',
    method: 'GET',
    path: '/api/v1/hs/customers',
    description: 'List all customers with pagination',
    category: 'Home Services',
    auth_required: true,
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Page number', example: 1 },
      { name: 'limit', type: 'number', required: false, description: 'Items per page', example: 20 },
      { name: 'search', type: 'string', required: false, description: 'Search query', example: 'John Doe' },
    ],
    example_response: {
      success: true,
      data: [
        {
          id: 'cust_123456789',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          customer_type: 'residential'
        }
      ],
      meta: { pagination: { page: 1, limit: 20, total: 1 } }
    }
  },
  {
    id: 'hs-work-orders-create',
    method: 'POST',
    path: '/api/v1/hs/work-orders',
    description: 'Create a new work order',
    category: 'Home Services',
    auth_required: true,
    parameters: [
      { name: 'customer_id', type: 'string', required: true, description: 'Customer ID', example: 'cust_123456789' },
      { name: 'service_type', type: 'string', required: true, description: 'Service type', example: 'plumbing' },
      { name: 'priority', type: 'string', required: true, description: 'Priority level', example: 'high' },
      { name: 'description', type: 'string', required: true, description: 'Work description', example: 'Kitchen sink repair' },
    ],
    example_request: {
      customer_id: 'cust_123456789',
      service_type: 'plumbing',
      priority: 'high',
      description: 'Kitchen sink leak repair needed urgently'
    },
    example_response: {
      success: true,
      data: {
        id: 'wo_987654321',
        customer_id: 'cust_123456789',
        service_type: 'plumbing',
        status: 'pending',
        created_at: '2024-01-20T14:30:00Z'
      }
    }
  },
  {
    id: 'auth-user',
    method: 'GET',
    path: '/api/v1/auth/user',
    description: 'Get current user information',
    category: 'Authentication',
    auth_required: true,
    parameters: [],
    example_response: {
      success: true,
      data: {
        id: 'user_123456789',
        email: 'user@example.com',
        role: 'admin',
        organization_id: 'org_987654321'
      }
    }
  },
  {
    id: 'auto-vehicles-list',
    method: 'GET',
    path: '/api/v1/auto/vehicles',
    description: 'List customer vehicles',
    category: 'Auto Services',
    auth_required: true,
    parameters: [
      { name: 'customer_id', type: 'string', required: false, description: 'Filter by customer', example: 'cust_123456789' },
      { name: 'status', type: 'string', required: false, description: 'Vehicle status', example: 'active' },
    ],
    example_response: {
      success: true,
      data: [
        {
          id: 'vehicle_123456789',
          customer_id: 'cust_123456789',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          vin: 'JTDKAMFU9K3012345'
        }
      ]
    }
  },
];

const categories = ['All', 'Authentication', 'Home Services', 'Auto Services', 'Restaurant', 'Retail'];

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'PUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Home Services': return <Home className="h-4 w-4" />;
    case 'Auto Services': return <Car className="h-4 w-4" />;
    case 'Restaurant': return <Utensils className="h-4 w-4" />;
    case 'Retail': return <Store className="h-4 w-4" />;
    case 'Authentication': return <Shield className="h-4 w-4" />;
    default: return <Code className="h-4 w-4" />;
  }
};

export default function APIPlaygroundPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [authToken, setAuthToken] = useState(');
  const [requestBody, setRequestBody] = useState(');
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  const filteredEndpoints = selectedCategory === 'All' 
    ? sampleEndpoints 
    : sampleEndpoints.filter(endpoint => endpoint.category === selectedCategory);

  useEffect(() => {
    if (selectedEndpoint) {
      // Reset form when endpoint changes
      setRequestBody(selectedEndpoint.example_request ? JSON.stringify(selectedEndpoint.example_request, null, 2) : ');
      setQueryParams({});
      setResponse(null);
      setResponseTime(null);
      setResponseStatus(null);
    }
  }, [selectedEndpoint]);

  const executeRequest = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Use example response
      setResponse(selectedEndpoint.example_response);
      setResponseStatus(200);
      setResponseTime(Date.now() - startTime);
    } catch (_error) {
      setResponse({
        success: false,
        error: {
          code: 'SIMULATED_ERROR',
          message: 'This is a simulated API playground response'
        }
      });
      setResponseStatus(400);
      setResponseTime(Date.now() - startTime);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    }
  };

  const generateCurlCommand = () => {
    if (!selectedEndpoint) return ';

    const curl = 'curl -X ${selectedEndpoint.method} "https://api.thorbis.com${selectedEndpoint.path}"';
    
    if (selectedEndpoint.auth_required) {
      curl += ' \\\n  -H "Authorization: Bearer YOUR_API_KEY"';
    }
    
    curl += ' \\\n  -H "Content-Type: application/json"';
    
    if (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') {
      if (requestBody.trim()) {
        curl += ' \\\n  -d '${requestBody}'`;
      }
    }

    return curl;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">API Playground</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Test Thorbis API endpoints interactively with live examples and response previews
        </p>
        
        <Alert className="mb-6">
          <Play className="h-4 w-4" />
          <AlertTitle>Interactive Demo Environment</AlertTitle>
          <AlertDescription>
            This playground uses simulated responses for demonstration. In production, use your actual API keys and endpoints.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Endpoint Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Endpoints</CardTitle>
              <CardDescription>
                Select an endpoint to test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          {category}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Endpoint List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredEndpoints.map((endpoint) => (
                  <Button
                    key={endpoint.id}
                    variant={selectedEndpoint?.id === endpoint.id ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setSelectedEndpoint(endpoint)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(endpoint.method)} size="sm">
                          {endpoint.method}
                        </Badge>
                        {endpoint.auth_required && (
                          <Shield className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {endpoint.path}
                      </div>
                      <div className="text-xs">
                        {endpoint.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Request/Response */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEndpoint ? (
            <>
              {/* Request Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Request Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your API request parameters and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Endpoint Info */}
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <Badge className={getMethodColor(selectedEndpoint.method)}>
                      {selectedEndpoint.method}
                    </Badge>
                    <code className="flex-1 font-mono text-sm">
                      {selectedEndpoint.path}
                    </code>
                    {selectedEndpoint.auth_required && (
                      <Badge variant="outline" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Auth Required
                      </Badge>
                    )}
                  </div>

                  {/* Authentication */}
                  {selectedEndpoint.auth_required && (
                    <div>
                      <Label htmlFor="auth-token">Authorization Token</Label>
                      <Input
                        id="auth-token"
                        type="password"
                        placeholder="Enter your API key or token"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Parameters */}
                  {selectedEndpoint.parameters.length > 0 && (
                    <div>
                      <Label>Parameters</Label>
                      <div className="space-y-3 mt-2">
                        {selectedEndpoint.parameters.map((param) => (
                          <div key={param.name} className="grid grid-cols-4 gap-3 items-center">
                            <div className="flex items-center gap-2">
                              <code className="text-sm">{param.name}</code>
                              {param.required && (
                                <Badge variant="destructive" size="sm">Required</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{param.type}</span>
                            <Input
                              placeholder={param.example?.toString() || param.description}
                              value={queryParams[param.name] || ''}
                              onChange={(e) => setQueryParams(prev => ({
                                ...prev,
                                [param.name]: e.target.value
                              }))}
                              className="col-span-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
                    <div>
                      <Label htmlFor="request-body">Request Body (JSON)</Label>
                      <Textarea
                        id="request-body"
                        placeholder="Enter JSON request body"
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}

                  {/* Execute Button */}
                  <Button 
                    onClick={executeRequest} 
                    disabled={loading || (selectedEndpoint.auth_required && !authToken)}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Request
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Response */}
              {response && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Response
                      </div>
                      <div className="flex items-center gap-2">
                        {responseStatus && (
                          <Badge className={responseStatus < 400 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {responseStatus}
                          </Badge>
                        )}
                        {responseTime && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {responseTime}ms
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={copyResponse}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                      <code>{JSON.stringify(response, null, 2)}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Code Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Code Examples
                  </CardTitle>
                  <CardDescription>
                    Copy these examples to integrate into your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="curl">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="node">Node.js</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="curl" className="mt-4">
                      <div className="relative">
                        <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{generateCurlCommand()}</code>
                        </pre>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="absolute top-2 right-2"
                          onClick={() => navigator.clipboard.writeText(generateCurlCommand())}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="javascript" className="mt-4">
                      <div className="relative">
                        <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{'const response = await fetch('${selectedEndpoint.path}', {
  method: '${selectedEndpoint.method}',
  headers: {
    ${selectedEndpoint.auth_required ? "'Authorization': 'Bearer YOUR_API_KEY'," : ""}
    'Content-Type': 'application/json'
  }${requestBody ? ',\n  body: JSON.stringify(${requestBody})' : '}
});

const data = await response.json();
console.log(data);'}</code>
                        </pre>
                        <Button variant="outline" size="sm" className="absolute top-2 right-2">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="python" className="mt-4">
                      <div className="relative">
                        <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{'import requests

headers = {
    ${selectedEndpoint.auth_required ? "'Authorization': 'Bearer YOUR_API_KEY'," : ""}
    'Content-Type': 'application/json'
}

${requestBody ? 'data = ${requestBody}

response = requests.${selectedEndpoint.method.toLowerCase()}('${selectedEndpoint.path}', headers=headers, json=data)' : 'response = requests.${selectedEndpoint.method.toLowerCase()}('${selectedEndpoint.path}', headers=headers)'}
print(response.json())'}</code>
                        </pre>
                        <Button variant="outline" size="sm" className="absolute top-2 right-2">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="node" className="mt-4">
                      <div className="relative">
                        <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{'const axios = require('axios');

const config = {
  method: '${selectedEndpoint.method.toLowerCase()}',
  url: '${selectedEndpoint.path}',
  headers: {
    ${selectedEndpoint.auth_required ? "'Authorization': 'Bearer YOUR_API_KEY'," : ""}
    'Content-Type': 'application/json'
  }${requestBody ? ',\n  data: ${requestBody}' : '}
};

axios(config)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));'}</code>
                        </pre>
                        <Button variant="outline" size="sm" className="absolute top-2 right-2">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select an API Endpoint</h3>
                <p className="text-muted-foreground">
                  Choose an endpoint from the sidebar to start testing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}