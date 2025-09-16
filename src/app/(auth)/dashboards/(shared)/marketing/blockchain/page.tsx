"use client";

import { useState } from "react";
;
import { 
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from '@/components/ui';
import {
  Shield,
  Lock,
  Eye,
  Hash,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Activity,
  BarChart3,
  Link,
  Search,
  Download,
  Wallet,
  Key,
  Database,
  ChevronRight,
  Plus,
  Settings,
  Copy,
  ExternalLink
} from "lucide-react";
import { Button } from '@/components/ui/button';


// Mock blockchain attribution data
interface BlockchainTransaction {
  id: string;
  hash: string;
  timestamp: string;
  channel: string;
  touchpoint: string;
  customer_id: string;
  value: number;
  status: 'confirmed' | 'pending' | 'verified';
  block_height: number;
  gas_used: string;
  verification_score: number;
}

interface AttributionPath {
  id: string;
  customer_id: string;
  touchpoints: {
    channel: string;
    timestamp: string;
    value_contribution: number;
    hash: string;
    verified: boolean;
  }[];
  total_value: number;
  conversion_event: string;
  blockchain_proof: string;
  trust_score: number;
}

interface BlockchainNode {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'syncing' | 'offline';
  stake: number;
  uptime: number;
  last_block: number;
}

const mockTransactions: BlockchainTransaction[] = [
  {
    id: "1",
    hash: "0xa1b2c3d4e5f6789012345678901234567890abcd",
    timestamp: "2025-01-03 14:30:00",
    channel: "Google Ads",
    touchpoint: "Display Campaign",
    customer_id: "cust_001",
    value: 156.75,
    status: "confirmed",
    block_height: 12845,
    gas_used: "0.00023 ETH",
    verification_score: 98.5
  },
  {
    id: "2", 
    hash: "0xb2c3d4e5f6789012345678901234567890abcdef",
    timestamp: "2025-01-03 14:28:15",
    channel: "Email",
    touchpoint: "Newsletter Click",
    customer_id: "cust_002",
    value: 89.50,
    status: "verified",
    block_height: 12844,
    gas_used: "0.00019 ETH",
    verification_score: 95.2
  },
  {
    id: "3",
    hash: "0xc3d4e5f6789012345678901234567890abcdef12",
    timestamp: "2025-01-03 14:25:30",
    channel: "Social Media",
    touchpoint: "Instagram Story",
    customer_id: "cust_003",
    value: 234.20,
    status: "pending",
    block_height: 12843,
    gas_used: "0.00031 ETH",
    verification_score: 87.9
  }
];

const mockAttributionPaths: AttributionPath[] = [
  {
    id: "1",
    customer_id: "cust_001",
    touchpoints: [
      {
        channel: "Google Ads",
        timestamp: "2025-01-01 10:00:00",
        value_contribution: 25.5,
        hash: "0x123abc",
        verified: true
      },
      {
        channel: "Email",
        timestamp: "2025-01-02 15:30:00", 
        value_contribution: 45.25,
        hash: "0x456def",
        verified: true
      },
      {
        channel: "Social Media",
        timestamp: "2025-01-03 09:15:00",
        value_contribution: 86.00,
        hash: "0x789ghi",
        verified: true
      }
    ],
    total_value: 156.75,
    conversion_event: "Purchase",
    blockchain_proof: "0xa1b2c3d4e5f6789012345678901234567890abcd",
    trust_score: 98.5
  },
  {
    id: "2",
    customer_id: "cust_002", 
    touchpoints: [
      {
        channel: "SEO",
        timestamp: "2024-12-28 16:45:00",
        value_contribution: 35.80,
        hash: "0xabc123",
        verified: true
      },
      {
        channel: "Email",
        timestamp: "2025-01-03 14:20:00",
        value_contribution: 53.70,
        hash: "0xdef456",
        verified: true
      }
    ],
    total_value: 89.50,
    conversion_event: "Subscription",
    blockchain_proof: "0xb2c3d4e5f6789012345678901234567890abcdef",
    trust_score: 95.2
  }
];

const mockNodes: BlockchainNode[] = [
  {
    id: "1",
    name: "Attribution Node US-East",
    location: "Virginia, USA",
    status: "active",
    stake: 50000,
    uptime: 99.9,
    last_block: 12845
  },
  {
    id: "2",
    name: "Attribution Node EU-West", 
    location: "Ireland, EU",
    status: "active",
    stake: 45000,
    uptime: 99.7,
    last_block: 12845
  },
  {
    id: "3",
    name: "Attribution Node Asia-Pacific",
    location: "Singapore",
    status: "syncing",
    stake: 38000,
    uptime: 98.5,
    last_block: 12843
  }
];

export default function BlockchainAttributionPage() {
  const [activeTab, setActiveTab] = useState("transactions");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'verified':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
      case 'syncing':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "bg-green-400/20 text-green-400 border-green-400/30",
      verified: "bg-blue-400/20 text-blue-400 border-blue-400/30", 
      pending: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      active: "bg-green-400/20 text-green-400 border-green-400/30",
      syncing: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      offline: "bg-red-400/20 text-red-400 border-red-400/30"
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Blockchain Attribution</h1>
          <p className="text-neutral-400 mt-2">
            Transparent, immutable tracking of marketing attribution across all channels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Chain
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Transactions</p>
                <p className="text-2xl font-bold text-white">12,845</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+12% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Verified Attribution</p>
                <p className="text-2xl font-bold text-white">$487,234</p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">98.7% verified</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Nodes</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <Globe className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">99.2% uptime</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Trust Score</p>
                <p className="text-2xl font-bold text-white">96.8%</p>
              </div>
              <Lock className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+0.3% today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="attribution">Attribution Paths</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Blockchain Transactions</CardTitle>
                  <CardDescription>
                    All marketing touchpoints recorded on the blockchain
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div key={tx.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{tx.channel}</p>
                            {getStatusBadge(tx.status)}
                          </div>
                          <p className="text-sm text-neutral-400">{tx.touchpoint}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">${tx.value.toFixed(2)}</p>
                        <p className="text-xs text-neutral-400">{tx.verification_score}% verified</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-neutral-500">Transaction Hash</p>
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3 text-neutral-400" />
                          <span className="text-neutral-300 font-mono">
                            {tx.hash.substring(0, 12)}...
                          </span>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-neutral-500">Block Height</p>
                        <p className="text-neutral-300">#{tx.block_height}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Gas Used</p>
                        <p className="text-neutral-300">{tx.gas_used}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Timestamp</p>
                        <p className="text-neutral-300">{tx.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attribution Paths</CardTitle>
              <CardDescription>
                Customer journey attribution verified on blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockAttributionPaths.map((path) => (
                  <div key={path.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="font-semibold text-white">Customer {path.customer_id}</p>
                          <p className="text-sm text-neutral-400">{path.conversion_event}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white text-lg">${path.total_value}</p>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-green-400">{path.trust_score}% trust</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Attribution Journey:</h4>
                      {path.touchpoints.map((touchpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                              <span className="text-xs text-blue-400 font-medium">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{touchpoint.channel}</p>
                              <p className="text-xs text-neutral-400">{touchpoint.timestamp}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-medium text-white">${touchpoint.value_contribution}</p>
                              <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3 text-neutral-400" />
                                <span className="text-xs text-neutral-400 font-mono">
                                  {touchpoint.hash}
                                </span>
                              </div>
                            </div>
                            {touchpoint.verified && (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">Blockchain Proof:</span>
                        <span className="text-neutral-300 font-mono">{path.blockchain_proof.substring(0, 16)}...</span>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Cryptographically Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Network Status</CardTitle>
              <CardDescription>
                Attribution network nodes and consensus status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockNodes.map((node) => (
                  <div key={node.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <span className="font-medium text-white">{node.name}</span>
                      </div>
                      {getStatusBadge(node.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Location:</span>
                        <span className="text-white">{node.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Stake:</span>
                        <span className="text-white">{node.stake.toLocaleString()} ATTR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Uptime:</span>
                        <span className="text-white">{node.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Last Block:</span>
                        <span className="text-white">#{node.last_block}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Network Consensus</CardTitle>
              <CardDescription>
                Real-time blockchain consensus and validation metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">98.7%</div>
                  <div className="text-sm text-neutral-400">Consensus Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">2.3s</div>
                  <div className="text-sm text-neutral-400">Block Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">24</div>
                  <div className="text-sm text-neutral-400">Active Validators</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Attribution Verification Trends</CardTitle>
                <CardDescription>7-day verification rate trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-neutral-400">
                  <BarChart3 className="h-16 w-16 mb-4" />
                  <div className="text-center">
                    <p>Verification Rate: 98.7%</p>
                    <p className="text-sm">+2.3% from last week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Attribution Distribution</CardTitle>
                <CardDescription>Attribution value by marketing channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { channel: "Google Ads", value: 45.2, verified: 98.1 },
                    { channel: "Email", value: 28.7, verified: 99.4 },
                    { channel: "Social Media", value: 16.3, verified: 96.8 },
                    { channel: "SEO", value: 9.8, verified: 97.2 }
                  ].map((item) => (
                    <div key={item.channel} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{item.channel}</span>
                        <span className="text-neutral-400">{item.value}% • {item.verified}% verified</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: '${item.value}%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blockchain Security Metrics</CardTitle>
              <CardDescription>Network security and integrity monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">100%</div>
                  <div className="text-xs text-neutral-400">Hash Integrity</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Lock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">256-bit</div>
                  <div className="text-xs text-neutral-400">Encryption</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Key className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">24</div>
                  <div className="text-xs text-neutral-400">Validator Keys</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Zap className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-neutral-400">Network Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Configuration</CardTitle>
              <CardDescription>
                Configure blockchain settings and validation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">Network Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Auto-verification</p>
                      <p className="text-sm text-neutral-400">Automatically verify attribution transactions</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Gas Optimization</p>
                      <p className="text-sm text-neutral-400">Optimize gas usage for transactions</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Multi-signature Validation</p>
                      <p className="text-sm text-neutral-400">Require multiple signatures for high-value attributions</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Consensus Threshold</p>
                      <p className="text-sm text-neutral-400">Minimum validator consensus required</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Integration Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">API Access</p>
                      <p className="text-sm text-neutral-400">Manage blockchain API keys and access</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Webhook Notifications</p>
                      <p className="text-sm text-neutral-400">Real-time blockchain event notifications</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}