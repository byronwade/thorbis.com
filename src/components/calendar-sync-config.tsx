'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Sync,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Plus,
  Clock,
  Shield,
  Key
} from 'lucide-react';

import { useOfflineAppointments } from '@/lib/offline-appointment-manager';
import type { 
  CalendarSync,
  CalendarSyncConflict
} from '@/lib/offline-appointment-manager';

interface CalendarSyncConfigProps {
  organizationId?: string;
  onConfigUpdated?: () => void;
}

export default function CalendarSyncConfig({
  organizationId = 'default',
  onConfigUpdated
}: CalendarSyncConfigProps) {
  const [syncConfigs, setSyncConfigs] = useState<CalendarSync[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState<Partial<CalendarSync>>({
    providerType: 'google',
    enabled: true,
    syncDirection: 'bidirectional'
  });
  const [showNewConfigForm, setShowNewConfigForm] = useState(false);

  const appointmentManager = useOfflineAppointments();

  useEffect(() => {
    loadSyncConfigs();
  }, [organizationId]);

  const loadSyncConfigs = async () => {
    setLoading(true);
    try {
      // Implementation would load sync configs from appointment manager
      // For now, we'll simulate with stored data
      const stored = localStorage.getItem('calendar_sync_${organizationId}');
      const configs = stored ? JSON.parse(stored) : [];
      setSyncConfigs(configs);
    } catch (_error) {
      setError('Failed to load calendar sync configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!newConfig.providerType || !newConfig.providerId) return;

    setLoading(true);
    try {
      const syncConfig: CalendarSync = {
        providerId: newConfig.providerId!,
        providerType: newConfig.providerType,
        enabled: newConfig.enabled || true,
        syncDirection: newConfig.syncDirection || 'bidirectional',
        calendarId: newConfig.calendarId,
        accessToken: newConfig.accessToken,
        refreshToken: newConfig.refreshToken,
        syncConflicts: []
      };

      await appointmentManager.setupCalendarSync(syncConfig);
      
      const updatedConfigs = [...syncConfigs, syncConfig];
      setSyncConfigs(updatedConfigs);
      localStorage.setItem('calendar_sync_${organizationId}', JSON.stringify(updatedConfigs));

      setNewConfig({
        providerType: 'google',
        enabled: true,
        syncDirection: 'bidirectional'
      });
      setShowNewConfigForm(false);
      onConfigUpdated?.();
    } catch (_error) {
      setError('Failed to save calendar sync configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSync = async (providerId: string, enabled: boolean) => {
    const updatedConfigs = syncConfigs.map(config =>
      config.providerId === providerId ? { ...config, enabled } : config
    );
    setSyncConfigs(updatedConfigs);
    localStorage.setItem('calendar_sync_${organizationId}', JSON.stringify(updatedConfigs));
  };

  const handleDeleteConfig = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this calendar sync configuration?`)) return;

    const updatedConfigs = syncConfigs.filter(config => config.providerId !== providerId);
    setSyncConfigs(updatedConfigs);
    localStorage.setItem(`calendar_sync_${organizationId}', JSON.stringify(updatedConfigs));
  };

  const handleManualSync = async (providerId: string) => {
    setLoading(true);
    try {
      await appointmentManager.syncWithExternalCalendar(providerId);
      // Update last sync time
      const updatedConfigs = syncConfigs.map(config =>
        config.providerId === providerId ? { ...config, lastSync: new Date() } : config
      );
      setSyncConfigs(updatedConfigs);
      localStorage.setItem('calendar_sync_${organizationId}', JSON.stringify(updatedConfigs));
    } catch (_error) {
      setError('Failed to sync with external calendar');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (providerType: CalendarSync['providerType']) => {
    switch (providerType) {
      case 'google': return '📅';
      case 'outlook': return '📅';
      case 'apple': return '🍎';
      case 'ical': return '📋';
      case 'exchange': return '📧';
      default: return '📅';
    }
  };

  const getProviderName = (providerType: CalendarSync['providerType']) => {
    switch (providerType) {
      case 'google': return 'Google Calendar';
      case 'outlook': return 'Outlook Calendar';
      case 'apple': return 'Apple Calendar';
      case 'ical': return 'iCal';
      case 'exchange': return 'Exchange';
      default: return 'Unknown';
    }
  };

  const getSyncDirectionIcon = (direction: CalendarSync['syncDirection']) => {
    switch (direction) {
      case 'import': return '📥';
      case 'export': return '📤';
      case 'bidirectional': return '🔄';
      default: return '🔄';
    }
  };

  const getSyncDirectionLabel = (direction: CalendarSync['syncDirection']) => {
    switch (direction) {
      case 'import': return 'Import Only';
      case 'export': return 'Export Only';
      case 'bidirectional': return 'Two-way Sync';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (config: CalendarSync) => {
    if (!config.enabled) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    if (config.syncConflicts.length > 0) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getStatusLabel = (config: CalendarSync) => {
    if (!config.enabled) return 'Disabled';
    if (config.syncConflicts.length > 0) return 'Conflicts';
    return 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Calendar Sync Configuration</h3>
          <p className="text-neutral-400">Connect external calendars to sync appointments</p>
        </div>
        
        <Button onClick={() => setShowNewConfigForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Calendar
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Existing Configurations */}
      <div className="space-y-4">
        {syncConfigs.length === 0 ? (
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 mb-2">No calendar sync configured</p>
              <p className="text-neutral-500 text-sm">Connect external calendars to automatically sync appointments</p>
            </CardContent>
          </Card>
        ) : (
          syncConfigs.map((config) => (
            <Card key={config.providerId} className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Provider Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{getProviderIcon(config.providerType)}</span>
                      <div>
                        <h4 className="text-white font-medium">{getProviderName(config.providerType)}</h4>
                        <p className="text-neutral-400 text-sm">{config.providerId}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(config)}>
                        {getStatusLabel(config)}
                      </Badge>
                    </div>

                    {/* Configuration Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Sync className="h-4 w-4 text-neutral-400" />
                        <span className="text-neutral-400 text-sm">Direction:</span>
                        <span className="text-white text-sm flex items-center gap-1">
                          {getSyncDirectionIcon(config.syncDirection)}
                          {getSyncDirectionLabel(config.syncDirection)}
                        </span>
                      </div>

                      {config.calendarId && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neutral-400" />
                          <span className="text-neutral-400 text-sm">Calendar:</span>
                          <span className="text-white text-sm truncate">{config.calendarId}</span>
                        </div>
                      )}

                      {config.lastSync && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          <span className="text-neutral-400 text-sm">Last Sync:</span>
                          <span className="text-white text-sm">
                            {config.lastSync.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Sync Conflicts */}
                    {config.syncConflicts.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">
                            {config.syncConflicts.length} Sync Conflict{config.syncConflicts.length !== 1 ? 's' : '}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {config.syncConflicts.slice(0, 3).map((conflict) => (
                            <p key={conflict.id} className="text-yellow-400 text-sm">
                              • {conflict.conflictType.replace('_', ' ')}: {conflict.appointmentId}
                            </p>
                          ))}
                          {config.syncConflicts.length > 3 && (
                            <p className="text-yellow-400 text-sm">
                              • And {config.syncConflicts.length - 3} more...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Security Info */}
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>Encrypted Connection</span>
                      </div>
                      {config.accessToken && (
                        <div className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          <span>Token Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-neutral-400 text-sm">Enabled</Label>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleToggleSync(config.providerId, enabled)}
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManualSync(config.providerId)}
                      disabled={!config.enabled || loading}
                    >
                      <RefreshCw className={'h-4 w-4 ${loading ? 'animate-spin' : '}'} />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConfig(config.providerId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add New Configuration Form */}
      {showNewConfigForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Calendar Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Type */}
              <div>
                <Label htmlFor="providerType" className="text-neutral-400">Calendar Provider</Label>
                <Select 
                  value={newConfig.providerType} 
                  onValueChange={(value) => setNewConfig(prev => ({ ...prev, providerType: value as any }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        Google Calendar
                      </div>
                    </SelectItem>
                    <SelectItem value="outlook">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        Outlook Calendar
                      </div>
                    </SelectItem>
                    <SelectItem value="apple">
                      <div className="flex items-center gap-2">
                        <span>🍎</span>
                        Apple Calendar
                      </div>
                    </SelectItem>
                    <SelectItem value="ical">
                      <div className="flex items-center gap-2">
                        <span>📋</span>
                        iCal
                      </div>
                    </SelectItem>
                    <SelectItem value="exchange">
                      <div className="flex items-center gap-2">
                        <span>📧</span>
                        Exchange
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Provider ID */}
              <div>
                <Label htmlFor="providerId" className="text-neutral-400">Provider ID / Email</Label>
                <Input
                  id="providerId"
                  value={newConfig.providerId || ''}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, providerId: e.target.value }))}
                  placeholder="your-email@example.com"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              {/* Calendar ID */}
              <div>
                <Label htmlFor="calendarId" className="text-neutral-400">Calendar ID (Optional)</Label>
                <Input
                  id="calendarId"
                  value={newConfig.calendarId || '`}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, calendarId: e.target.value }))}
                  placeholder="primary or specific calendar ID"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              {/* Sync Direction */}
              <div>
                <Label htmlFor="syncDirection" className="text-neutral-400">Sync Direction</Label>
                <Select 
                  value={newConfig.syncDirection} 
                  onValueChange={(value) => setNewConfig(prev => ({ ...prev, syncDirection: value as any }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="import">
                      <div className="flex items-center gap-2">
                        <span>📥</span>
                        Import Only
                      </div>
                    </SelectItem>
                    <SelectItem value="export">
                      <div className="flex items-center gap-2">
                        <span>📤</span>
                        Export Only
                      </div>
                    </SelectItem>
                    <SelectItem value="bidirectional">
                      <div className="flex items-center gap-2">
                        <span>🔄</span>
                        Two-way Sync
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* OAuth Tokens (for production implementation) */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-400 text-sm">Authentication</span>
              </div>
              <p className="text-neutral-500 text-xs">
                In production, this would initiate OAuth flow for secure calendar access.
                For demo purposes, sync will be simulated.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewConfigForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveConfig}
                disabled={!newConfig.providerType || !newConfig.providerId || loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Instructions */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sync Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Import</h4>
              <ul className="text-neutral-400 text-sm space-y-1">
                <li>• Appointments from external calendar are imported</li>
                <li>• Creates appointments in Thorbis system</li>
                <li>• Useful for existing calendar users</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">Export</h4>
              <ul className="text-neutral-400 text-sm space-y-1">
                <li>• Thorbis appointments are exported to external calendar</li>
                <li>• External calendar shows Thorbis appointments</li>
                <li>• Useful for staff calendar integration</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">Two-way Sync</h4>
              <ul className="text-neutral-400 text-sm space-y-1">
                <li>• Changes sync in both directions</li>
                <li>• Most comprehensive integration</li>
                <li>• May require conflict resolution</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">Conflict Resolution</h4>
              <ul className="text-neutral-400 text-sm space-y-1">
                <li>• Automatic resolution where possible</li>
                <li>• Manual review for complex conflicts</li>
                <li>• Preference for Thorbis data by default</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}