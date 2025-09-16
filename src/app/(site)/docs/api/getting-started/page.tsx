/**
 * API Getting Started Guide
 * Comprehensive guide for developers to start using the Thorbis Business OS API
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield,
  Key,
  Globe,
  Code,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  ArrowRight,
  Book,
  Zap,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Getting Started with Thorbis API</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to authenticate and make your first API calls to the Thorbis Business OS platform
        </p>
      </div>

      {/* Quick Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            API Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Globe className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-semibold">REST API</h4>
              <p className="text-sm text-muted-foreground">Standard HTTP methods with JSON responses</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold">Secure</h4>
              <p className="text-sm text-muted-foreground">OAuth 2.0 and API key authentication</p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h4 className="font-semibold">Rate Limited</h4>
              <p className="text-sm text-muted-foreground">5000 requests per hour by default</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step by Step Guide */}
      <div className="space-y-8">
        {/* Step 1: Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">1</div>
              Authentication Setup
            </CardTitle>
            <CardDescription>
              Get your API credentials and learn about authentication methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key Method */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Key className="h-4 w-4" />
                Option 1: API Key Authentication (Recommended for Server-to-Server)
              </h4>
              
              <Alert className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Note</AlertTitle>
                <AlertDescription>
                  Never expose your API key in client-side code. Always use server-side implementation for API key authentication.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">1. Get Your API Key</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Visit your dashboard to generate an API key for your application.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/api-keys">
                      Generate API Key
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div>
                  <h5 className="font-medium mb-2">2. Include in Request Headers</h5>
                  <div className="relative">
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{'curl -X GET "https://api.thorbis.com/v1/auth/user" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"'}</code>
                    </pre>
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* OAuth Method */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Option 2: OAuth 2.0 (For User-Facing Applications)
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">1. Register Your Application</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Register your app to get client credentials for OAuth flow.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/oauth-apps">
                      Register App
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div>
                  <h5 className="font-medium mb-2">2. Authorization Flow</h5>
                  <div className="relative">
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{'// Step 1: Redirect user to authorization URL
const authUrl = "https://api.thorbis.com/oauth/authorize?" +
  "client_id=YOUR_CLIENT_ID&" +
  "redirect_uri=YOUR_REDIRECT_URI&" +
  "response_type=code&" +
  "scope=read write";

// Step 2: Exchange code for access token
const tokenResponse = await fetch('/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    code: 'RECEIVED_CODE',
    grant_type: 'authorization_code`
  })
});`}</code>
                    </pre>
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Making Your First Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center font-bold">2</div>
              Making Your First API Request
            </CardTitle>
            <CardDescription>
              Test your authentication and understand the API response format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="node">Node.js</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl" className="mt-4">
                <div className="space-y-3">
                  <h5 className="font-medium">Get User Information</h5>
                  <div className="relative">
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{'curl -X GET "https://api.thorbis.com/v1/auth/user" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"'}</code>
                    </pre>
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="javascript" className="mt-4">
                <div className="space-y-3">
                  <h5 className="font-medium">Fetch API Example</h5>
                  <div className="relative">
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{'const response = await fetch('https://api.thorbis.com/v1/auth/user', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const userData = await response.json();
console.log(userData);'}</code>
                    </pre>
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="python" className="mt-4">
                <div className="space-y-3">
                  <h5 className="font-medium">Python Requests Example</h5>
                  <div className="relative">
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{'import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.thorbis.com/v1/auth/user', headers=headers)
user_data = response.json()
print(user_data)'}</code>
                    </pre>
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="node" className="mt-4">
                <div className="space-y-3">
                  <h5 className="font-medium">Node.js with Axios</h5>
                  <div className="relative">
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{'const axios = require('axios');

const config = {
  method: 'get',
  url: 'https://api.thorbis.com/v1/auth/user',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json`
  }
};

axios(config)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });`}</code>
                    </pre>
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <h5 className="font-medium mb-3">Expected Response</h5>
              <div className="relative">
                <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`{
  "success": true,
  "data": {
    "id": "user_123456789",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "organization_id": "org_987654321",
    "role": "admin",
    "permissions": ["read", "write", "admin"],
    "created_at": "2024-01-15T10:30:00Z",
    "last_login": "2024-01-20T15:45:00Z"
  },
  "meta": {
    "timestamp": "2024-01-20T16:00:00Z",
    "request_id": "req_abc123def456"
  }
}`}</code>
                </pre>
                <Button variant="outline" size="sm" className="absolute top-2 right-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Understanding Response Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center font-bold">3</div>
              Understanding API Responses
            </CardTitle>
            <CardDescription>
              Learn about our standard response format and error handling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Success Response Format
              </h4>
              <div className="relative">
                <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`{
  "success": true,           // Always true for successful responses
  "data": {                  // Your requested data
    // ... response data
  },
  "meta": {                  // Metadata about the request
    "timestamp": "2024-01-20T16:00:00Z",
    "request_id": "req_abc123def456",
    "pagination": {          // Present for paginated responses
      "page": 1,
      "limit": 20,
      "total": 150,
      "has_next": true,
      "has_previous": false
    }
  }
}'}</code>
                </pre>
                <Button variant="outline" size="sm" className="absolute top-2 right-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Error Response Format
              </h4>
              <div className="relative">
                <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{'{
  "success": false,          // Always false for error responses
  "error": {
    "code": "UNAUTHORIZED",  // Machine-readable error code
    "message": "Invalid API key provided",
    "details": {             // Additional error context
      "field": "authorization",
      "suggestion": "Check your API key in the dashboard"
    }
  },
  "meta": {
    "timestamp": "2024-01-20T16:00:00Z",
    "request_id": "req_abc123def456"
  }
}'}</code>
                </pre>
                <Button variant="outline" size="sm" className="absolute top-2 right-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Common HTTP Status Codes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">200</Badge>
                    <span className="text-sm">OK - Request successful</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">201</Badge>
                    <span className="text-sm">Created - Resource created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">204</Badge>
                    <span className="text-sm">No Content - Successful deletion</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700">400</Badge>
                    <span className="text-sm">Bad Request - Invalid parameters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700">401</Badge>
                    <span className="text-sm">Unauthorized - Authentication failed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700">429</Badge>
                    <span className="text-sm">Rate Limited - Too many requests</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Now that you understand the basics, explore specific API sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                <Link href="/docs/api/hs">
                  <Book className="h-6 w-6" />
                  <span>Home Services API</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                <Link href="/docs/api/playground">
                  <Code className="h-6 w-6" />
                  <span>Try API Playground</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                <Link href="/docs/api/sdks">
                  <Zap className="h-6 w-6" />
                  <span>Download SDKs</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                <Link href="/docs/api/webhooks">
                  <Globe className="h-6 w-6" />
                  <span>Webhook Guide</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}