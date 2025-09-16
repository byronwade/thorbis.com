import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Bell, 
  Shield, 
  Clock, 
  Globe, 
  AlertCircle, 
  Save,
  RefreshCw,
  Key,
  Database,
  Zap
} from 'lucide-react'

interface SettingsPageProps {
  searchParams: { from?: string }
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  const fromIndustry = searchParams.from

  const handleSaveSettings = () => {
    console.log('Saving integration settings...')
    // Implement settings save logic
  }

  const handleResetSettings = () => {
    console.log('Resetting settings to defaults...')
    // Implement settings reset logic
  }

  const handleTestNotifications = () => {
    console.log('Testing notification settings...')
    // Implement notification test
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Settings</h1>
          <p className="text-neutral-500">
            Configure global settings and preferences for all integrations
            {fromIndustry && (
              <span className="ml-2 px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-md">
                From {fromIndustry.toUpperCase()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic integration behavior and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-timeout">Default API Timeout (seconds)</Label>
              <Input 
                id="default-timeout"
                type="number"
                placeholder="30"
                defaultValue="30"
              />
              <p className="text-xs text-neutral-500">
                Maximum time to wait for API responses before timing out
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retry-attempts">Retry Attempts</Label>
              <Select defaultValue="3">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 attempt</SelectItem>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                Number of retry attempts for failed API calls
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-size">Batch Processing Size</Label>
              <Select defaultValue="100">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 records</SelectItem>
                  <SelectItem value="100">100 records</SelectItem>
                  <SelectItem value="250">250 records</SelectItem>
                  <SelectItem value="500">500 records</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                Number of records to process in each batch operation
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Debug Logging</Label>
                <p className="text-xs text-neutral-500">
                  Log detailed information for troubleshooting
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-retry Failed Jobs</Label>
                <p className="text-xs text-neutral-500">
                  Automatically retry failed sync jobs
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure alerts and notifications for integration events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Integration Failures</Label>
                  <p className="text-xs text-neutral-500">
                    Alert when integrations fail or disconnect
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rate Limit Warnings</Label>
                  <p className="text-xs text-neutral-500">
                    Warn when approaching API rate limits
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sync Completion</Label>
                  <p className="text-xs text-neutral-500">
                    Notify when large data syncs complete
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Summary</Label>
                  <p className="text-xs text-neutral-500">
                    Send weekly integration performance reports
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="notification-email">Notification Email</Label>
              <Input 
                id="notification-email"
                type="email"
                placeholder="admin@company.com"
                defaultValue="admin@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input 
                id="slack-webhook"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>

            <Button variant="outline" size="sm" onClick={handleTestNotifications}>
              Test Notifications
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security policies and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="encryption">Data Encryption</Label>
              <Select defaultValue="aes256">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aes128">AES-128</SelectItem>
                  <SelectItem value="aes256">AES-256</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-rotation">API Key Rotation</Label>
              <Select defaultValue="90">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                Automatically rotate API keys for enhanced security
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require 2FA for Configuration</Label>
                <p className="text-xs text-neutral-500">
                  Require two-factor authentication for sensitive operations
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>IP Whitelist</Label>
                <p className="text-xs text-neutral-500">
                  Restrict API access to specific IP addresses
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
              <Textarea 
                id="allowed-ips"
                placeholder="192.168.1.1&#10;10.0.0.0/8"
                className="min-h-[80px]"
                disabled
              />
              <p className="text-xs text-neutral-500">
                One IP address or CIDR block per line
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Settings
            </CardTitle>
            <CardDescription>
              Optimize integration performance and resource usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="concurrent-jobs">Concurrent Jobs</Label>
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 job</SelectItem>
                  <SelectItem value="3">3 jobs</SelectItem>
                  <SelectItem value="5">5 jobs</SelectItem>
                  <SelectItem value="10">10 jobs</SelectItem>
                  <SelectItem value="20">20 jobs</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                Maximum number of sync jobs to run simultaneously
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cache-duration">Cache Duration</Label>
              <Select defaultValue="300">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="900">15 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                How long to cache API responses
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Request Compression</Label>
                <p className="text-xs text-neutral-500">
                  Compress API requests to reduce bandwidth
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Optimize for Low Latency</Label>
                <p className="text-xs text-neutral-500">
                  Prioritize speed over bandwidth usage
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory-limit">Memory Limit (MB)</Label>
              <Input 
                id="memory-limit"
                type="number"
                placeholder="512"
                defaultValue="512"
              />
              <p className="text-xs text-neutral-500">
                Maximum memory usage per integration job
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Configure data retention and cleanup policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="log-retention">Log Retention Period</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                How long to keep integration logs and audit trails
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-cleanup Failed Jobs</Label>
                <p className="text-xs text-neutral-500">
                  Automatically remove old failed job records
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compress Historical Data</Label>
                <p className="text-xs text-neutral-500">
                  Compress old data to save storage space
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </CardContent>
        </Card>

        {/* Monitoring & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Monitoring & Alerts
            </CardTitle>
            <CardDescription>
              Configure system monitoring and alert thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="error-threshold">Error Rate Threshold (%)</Label>
              <Input 
                id="error-threshold"
                type="number"
                placeholder="5"
                defaultValue="5"
                min="0"
                max="100"
              />
              <p className="text-xs text-neutral-500">
                Alert when error rate exceeds this percentage
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response-threshold">Response Time Threshold (ms)</Label>
              <Input 
                id="response-threshold"
                type="number"
                placeholder="5000"
                defaultValue="5000"
              />
              <p className="text-xs text-neutral-500">
                Alert when average response time exceeds this value
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage-threshold">Usage Threshold (%)</Label>
              <Input 
                id="usage-threshold"
                type="number"
                placeholder="80"
                defaultValue="80"
                min="0"
                max="100"
              />
              <p className="text-xs text-neutral-500">
                Alert when approaching API rate limits
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Health Check Monitoring</Label>
                <p className="text-xs text-neutral-500">
                  Continuously monitor integration health
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-interval">Health Check Interval</Label>
              <Select defaultValue="300">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Clock className="h-4 w-4" />
              Last updated: Never
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleResetSettings}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSaveSettings}>
                Save All Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}