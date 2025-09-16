'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin,
  Navigation,
  Route,
  Play,
  Pause,
  Square,
  Settings,
  Target,
  Clock,
  Zap,
  Battery,
  Wifi,
  WifiOff,
  TrendingUp,
  BarChart3,
  Map,
  Compass,
  Crosshair,
  Globe,
  Layers,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Circle,
  Navigation2,
  Car,
  Users,
  Timer,
  Flag,
  Calendar,
  Activity,
  Satellite,
  Shield,
  Lock
} from 'lucide-react';

import { useOfflineGPS } from '@/lib/offline-gps-manager';
import type { 
  LocationData,
  Route as GPSRoute,
  TrackingSession,
  GeofenceArea,
  GPSStatistics,
  GPSSettings,
  RoutePoint
} from '@/lib/offline-gps-manager';

interface GPSDashboardProps {
  organizationId?: string;
  userId?: string;
  onRouteSelect?: (route: GPSRoute) => void;
  onLocationUpdate?: (location: LocationData) => void;
  showMap?: boolean;
}

export default function GPSDashboard({
  organizationId = 'default',
  userId = 'current_user',
  onRouteSelect,
  onLocationUpdate,
  showMap = true
}: GPSDashboardProps) {
  const [activeTab, setActiveTab] = useState('tracking');
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<TrackingSession | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [routes, setRoutes] = useState<GPSRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState<GPSRoute | null>(null);
  const [geofences, setGeofences] = useState<GeofenceArea[]>([]);
  const [stats, setStats] = useState<GPSStatistics | null>(null);
  const [settings, setSettings] = useState<GPSSettings | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  
  // Route creation
  const [newRoute, setNewRoute] = useState({
    name: ',
    points: [] as Omit<RoutePoint, 'id'>[],
    optimizationMethod: 'balanced' as 'manual' | 'shortest_distance' | 'fastest_time' | 'balanced'
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const gpsManager = useOfflineGPS();

  useEffect(() => {
    loadData();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, [organizationId, userId]);

  const setupEventListeners = () => {
    gpsManager.on('tracking_started', handleTrackingStarted);
    gpsManager.on('tracking_stopped', handleTrackingStopped);
    gpsManager.on('tracking_paused', handleTrackingPaused);
    gpsManager.on('location_updated', handleLocationUpdate);
    gpsManager.on('route_started', handleRouteStarted);
    gpsManager.on('route_completed', handleRouteCompleted);
    gpsManager.on('geofence_entered', handleGeofenceEntered);
    gpsManager.on('geofence_exited', handleGeofenceExited);
    gpsManager.on('network_status_changed', handleNetworkStatusChange);
    gpsManager.on('gps_manager_error', handleGPSError);
  };

  const cleanup = () => {
    gpsManager.off('tracking_started', handleTrackingStarted);
    gpsManager.off('tracking_stopped', handleTrackingStopped);
    gpsManager.off('tracking_paused', handleTrackingPaused);
    gpsManager.off('location_updated', handleLocationUpdate);
    gpsManager.off('route_started', handleRouteStarted);
    gpsManager.off('route_completed', handleRouteCompleted);
    gpsManager.off('geofence_entered', handleGeofenceEntered);
    gpsManager.off('geofence_exited', handleGeofenceExited);
    gpsManager.off('network_status_changed', handleNetworkStatusChange);
    gpsManager.off('gps_manager_error', handleGPSError);
  };

  const handleTrackingStarted = (data: unknown) => {
    setIsTracking(true);
    setCurrentSession(data.session);
  };

  const handleTrackingStopped = (data: unknown) => {
    setIsTracking(false);
    setCurrentSession(null);
  };

  const handleTrackingPaused = (data: unknown) => {
    setCurrentSession(data.session);
  };

  const handleLocationUpdate = (data: unknown) => {
    setCurrentLocation(data.location);
    onLocationUpdate?.(data.location);
  };

  const handleRouteStarted = (data: unknown) => {
    setActiveRoute(data.route);
    onRouteSelect?.(data.route);
  };

  const handleRouteCompleted = (data: unknown) => {
    setActiveRoute(null);
    loadRoutes();
  };

  const handleGeofenceEntered = (data: unknown) => {
    // Show notification or alert
    console.log('Entered geofence:', data.geofence.name);
  };

  const handleGeofenceExited = (data: unknown) => {
    // Show notification or alert
    console.log('Exited geofence:', data.geofence.name);
  };

  const handleNetworkStatusChange = (data: unknown) => {
    setNetworkStatus(data.status);
  };

  const handleGPSError = (data: unknown) => {
    setError(data.error.message || 'GPS error occurred');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [routesData, geofencesData, statsData, settingsData] = await Promise.all([
        gpsManager.getRoutes({ organizationId, userId }),
        gpsManager.getGeofences(organizationId),
        gpsManager.getStatistics(organizationId),
        Promise.resolve(gpsManager.getSettings())
      ]);

      setRoutes(routesData);
      setGeofences(geofencesData);
      setStats(statsData);
      setSettings(settingsData);
    } catch (error) {
      setError('Failed to load GPS data');
      console.error('Failed to load GPS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const routesData = await gpsManager.getRoutes({ organizationId, userId });
      setRoutes(routesData);
    } catch (error) {
      console.error('Failed to load routes:', error);
    }
  };

  // Tracking Controls

  const startTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionId = await gpsManager.startTracking({
        accuracy: settings?.accuracy || 'medium',
        interval: settings?.interval || 30,
        routeId: activeRoute?.id
      });
      
      console.log('Tracking started:', sessionId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start tracking');
    } finally {
      setLoading(false);
    }
  };

  const stopTracking = async () => {
    try {
      await gpsManager.stopTracking();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to stop tracking');
    }
  };

  const pauseTracking = async () => {
    try {
      await gpsManager.pauseTracking();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to pause tracking');
    }
  };

  const resumeTracking = async () => {
    try {
      await gpsManager.resumeTracking();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resume tracking');
    }
  };

  // Route Management

  const createRoute = async () => {
    if (!newRoute.name || newRoute.points.length < 2) {
      setError('Route must have a name and at least 2 points');
      return;
    }

    try {
      setLoading(true);
      const routeId = await gpsManager.createRoute(newRoute);
      
      setNewRoute({
        name: ',
        points: [],
        optimizationMethod: 'balanced'
      });
      setShowCreateRoute(false);
      await loadRoutes();
      
      console.log('Route created:', routeId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  const startRoute = async (routeId: string) => {
    try {
      await gpsManager.startRoute(routeId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start route');
    }
  };

  const optimizeRoute = async (route: GPSRoute) => {
    try {
      setLoading(true);
      await gpsManager.optimizeRoute(route);
      await loadRoutes();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to optimize route');
    } finally {
      setLoading(false);
    }
  };

  // Geofence Management

  const createGeofence = async (geofenceData: Omit<GeofenceArea, 'id'>) => {
    try {
      await gpsManager.createGeofence(geofenceData);
      const geofencesData = await gpsManager.getGeofences(organizationId);
      setGeofences(geofencesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create geofence');
    }
  };

  // Settings Management

  const updateSettings = async (newSettings: Partial<GPSSettings>) => {
    try {
      await gpsManager.updateSettings(newSettings);
      setSettings(gpsManager.getSettings());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    }
  };

  // Utility Functions

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m';
    }
    return '${mins}m';
  };

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRouteStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planned': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 5) return 'text-green-400';
    if (accuracy <= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">GPS Tracking</h2>
          <p className="text-neutral-400">Track location, manage routes, and optimize travel</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={networkStatus === 'online' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}>
            {networkStatus === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {networkStatus}
          </Badge>
          
          {currentLocation && (
            <Badge variant="outline" className={'border-blue-500/30 text-blue-400'}>
              <Target className="h-3 w-3 mr-1" />
              <span className={getAccuracyColor(currentLocation.accuracy)}>
                ±{Math.round(currentLocation.accuracy)}m
              </span>
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Distance</p>
                  <p className="text-2xl font-bold text-white">{formatDistance(stats.totalDistanceTraveled)}</p>
                </div>
                <Route className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Tracking Time</p>
                  <p className="text-2xl font-bold text-white">{formatDuration(stats.totalTrackingTime)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Routes Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.routesCompleted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Average Accuracy</p>
                  <p className="text-2xl font-bold text-white">±{Math.round(stats.averageAccuracy)}m</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-neutral-800 border-neutral-700">
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="geofences">Geofences</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          {/* Tracking Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Tracking Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {!isTracking ? (
                    <Button onClick={startTracking} disabled={loading} className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Start Tracking
                    </Button>
                  ) : (
                    <>
                      {currentSession?.status === 'active' ? (
                        <Button onClick={pauseTracking} variant="outline" className="flex-1">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button onClick={resumeTracking} variant="outline" className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      )}
                      <Button onClick={stopTracking} variant="destructive">
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>

                {currentSession && (
                  <div className="space-y-3 p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Status</span>
                      <Badge variant="outline" className={
                        currentSession.status === 'active' ? 'border-green-500/30 text-green-400' :
                        currentSession.status === 'paused' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-neutral-500/30 text-neutral-400`
                      }>
                        {currentSession.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Distance</span>
                      <span className="text-white">{formatDistance(currentSession.totalDistance)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Duration</span>
                      <span className="text-white">{formatDuration(currentSession.totalDuration)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Points</span>
                      <span className="text-white">{currentSession.locationCount}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentLocation ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Coordinates</span>
                      <span className="text-white font-mono text-sm">
                        {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Accuracy</span>
                      <span className={'font-medium ${getAccuracyColor(currentLocation.accuracy)}'}>
                        ±{Math.round(currentLocation.accuracy)}m
                      </span>
                    </div>
                    {currentLocation.speed !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Speed</span>
                        <span className="text-white">{Math.round(currentLocation.speed * 3.6)} km/h</span>
                      </div>
                    )}
                    {currentLocation.heading !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Heading</span>
                        <span className="text-white">{Math.round(currentLocation.heading)}°</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Last Update</span>
                      <span className="text-white">{formatDateTime(currentLocation.timestamp)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Satellite className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-400">No location data available</p>
                    <p className="text-neutral-500 text-sm">Start tracking to see your current location</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Route Progress */}
          {activeRoute && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Route Progress: {activeRoute.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Total Distance</span>
                    <span className="text-white">{formatDistance(activeRoute.totalDistance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Estimated Duration</span>
                    <span className="text-white">{formatDuration(activeRoute.estimatedDuration)}</span>
                  </div>
                  
                  {/* Route Points Progress */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Route Points</h4>
                    {activeRoute.points.map((point, index) => (
                      <div key={point.id} className="flex items-center gap-3 p-2 bg-neutral-800 rounded">
                        <div className={'w-3 h-3 rounded-full ${
                          point.actualArrival ? 'bg-green-500' : 
                          index === 0 ? 'bg-blue-500' : 'bg-neutral-600`
                        }'} />
                        <div className="flex-1">
                          <p className="text-white text-sm">{point.name || 'Point ${index + 1}'}</p>
                          {point.actualArrival && (
                            <p className="text-green-400 text-xs">
                              Arrived at {formatDateTime(point.actualArrival)}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className={
                          point.priority === 'urgent' ? 'border-red-500/30 text-red-400' :
                          point.priority === 'high' ? 'border-orange-500/30 text-orange-400' :
                          point.priority === 'normal' ? 'border-blue-500/30 text-blue-400' :
                          'border-neutral-500/30 text-neutral-400'
                        }>
                          {point.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Routes</h3>
            <Button onClick={() => setShowCreateRoute(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          </div>

          {/* Routes List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {routes.map((route) => (
              <Card key={route.id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{route.name}</h4>
                      <Badge variant="outline" className={getRouteStatusColor(route.status)}>
                        {route.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-400">Distance:</span>
                        <span className="ml-2 text-white">{formatDistance(route.totalDistance)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Duration:</span>
                        <span className="ml-2 text-white">{formatDuration(route.estimatedDuration)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Points:</span>
                        <span className="ml-2 text-white">{route.points.length}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Optimized:</span>
                        <span className="ml-2 text-white">{route.optimized ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {route.status === 'planned' && (
                        <>
                          <Button size="sm" onClick={() => startRoute(route.id)}>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                          {!route.optimized && (
                            <Button size="sm" variant="outline" onClick={() => optimizeRoute(route)}>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Optimize
                            </Button>
                          )}
                        </>
                      )}
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {routes.length === 0 && !loading && (
            <div className="text-center py-12">
              <Route className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No routes found</h3>
              <p className="text-neutral-400 mb-4">Create your first route to get started</p>
              <Button onClick={() => setShowCreateRoute(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Route
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="geofences" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Geofences</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Geofence
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {geofences.map((geofence) => (
              <Card key={geofence.id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{geofence.name}</h4>
                      <Badge variant="outline" className={
                        geofence.enabled ? 'border-green-500/30 text-green-400' : 'border-neutral-500/30 text-neutral-400'
                      }>
                        {geofence.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Type:</span>
                        <span className="text-white capitalize">{geofence.type}</span>
                      </div>
                      {geofence.type === 'circular' && geofence.radius && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Radius:</span>
                          <span className="text-white">{formatDistance(geofence.radius)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Alerts:</span>
                        <div className="flex gap-1">
                          {geofence.alertOnEnter && <Badge variant="outline" className="text-xs">Enter</Badge>}
                          {geofence.alertOnExit && <Badge variant="outline" className="text-xs">Exit</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {geofences.length === 0 && !loading && (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No geofences set up</h3>
              <p className="text-neutral-400 mb-4">Create geofences to monitor specific areas</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Geofence
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {settings && (
            <div className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Tracking Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-neutral-400">Accuracy</Label>
                      <Select 
                        value={settings.accuracy} 
                        onValueChange={(value: unknown) => updateSettings({ accuracy: value })}
                      >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High (GPS only)</SelectItem>
                          <SelectItem value="medium">Medium (GPS + Network)</SelectItem>
                          <SelectItem value="low">Low (Network only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-neutral-400">Update Interval (seconds)</Label>
                      <Input
                        type="number"
                        value={settings.interval}
                        onChange={(e) => updateSettings({ interval: parseInt(e.target.value) })}
                        min="5"
                        max="300"
                        className="bg-neutral-800 border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-neutral-400">Enable Tracking</Label>
                      <Switch
                        checked={settings.trackingEnabled}
                        onCheckedChange={(checked) => updateSettings({ trackingEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-neutral-400">Background Tracking</Label>
                      <Switch
                        checked={settings.backgroundTracking}
                        onCheckedChange={(checked) => updateSettings({ backgroundTracking: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-neutral-400">Battery Optimization</Label>
                      <Switch
                        checked={settings.batteryOptimization}
                        onCheckedChange={(checked) => updateSettings({ batteryOptimization: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-neutral-400">Geofence Alerts</Label>
                      <Switch
                        checked={settings.geofenceEnabled}
                        onCheckedChange={(checked) => updateSettings({ geofenceEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-neutral-400">Route Optimization</Label>
                      <Switch
                        checked={settings.routeOptimization}
                        onCheckedChange={(checked) => updateSettings({ routeOptimization: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-neutral-400">Privacy Mode</Label>
                      <Switch
                        checked={settings.privacyMode}
                        onCheckedChange={(checked) => updateSettings({ privacyMode: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Sync Pending Data</h4>
                      <p className="text-sm text-neutral-400">Upload offline tracking data when online</p>
                    </div>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Download Offline Maps</h4>
                      <p className="text-sm text-neutral-400">Cache maps for offline navigation</p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Clear Tracking Data</h4>
                      <p className="text-sm text-neutral-400">Remove all stored location history</p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Route Modal */}
      {showCreateRoute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="bg-neutral-900 border-neutral-800 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Create New Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-neutral-400">Route Name</Label>
                <Input
                  value={newRoute.name}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter route name"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div>
                <Label className="text-neutral-400">Optimization Method</Label>
                <Select 
                  value={newRoute.optimizationMethod} 
                  onValueChange={(value: unknown) => setNewRoute(prev => ({ ...prev, optimizationMethod: value }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual (no optimization)</SelectItem>
                    <SelectItem value="shortest_distance">Shortest Distance</SelectItem>
                    <SelectItem value="fastest_time">Fastest Time</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={createRoute} disabled={loading} className="flex-1">
                  Create Route
                </Button>
                <Button variant="outline" onClick={() => setShowCreateRoute(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}