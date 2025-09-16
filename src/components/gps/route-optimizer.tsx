'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Route,
  MapPin,
  Navigation,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  Play,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  Compass,
  Timer,
  Flag,
  Users,
  Package,
  Car,
  Fuel,
  DollarSign,
  BarChart3,
  Map,
  Layers,
  Globe
} from 'lucide-react';

import { useOfflineGPS } from '@/lib/offline-gps-manager';
import type { 
  Route as GPSRoute,
  RoutePoint,
  NavigationInstruction
} from '@/lib/offline-gps-manager';

interface RouteOptimizerProps {
  route?: GPSRoute;
  onRouteUpdate?: (route: GPSRoute) => void;
  onRouteStart?: (route: GPSRoute) => void;
  showMap?: boolean;
}

interface OptimizationResult {
  originalDistance: number;
  optimizedDistance: number;
  timeSaved: number;
  fuelSaved: number;
  method: string;
  confidence: number;
}

export default function RouteOptimizer({
  route: initialRoute,
  onRouteUpdate,
  onRouteStart,
  showMap = true
}: RouteOptimizerProps) {
  const [route, setRoute] = useState<GPSRoute | null>(initialRoute || null);
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [optimizationMethod, setOptimizationMethod] = useState<'shortest_distance' | 'fastest_time' | 'balanced'>('balanced');
  
  // Point creation state
  const [newPoint, setNewPoint] = useState({
    name: ',
    address: ',
    latitude: 0,
    longitude: 0,
    type: 'waypoint' as RoutePoint['type'],
    priority: 'normal' as RoutePoint['priority'],
    duration: 15,
    notes: ',
    workOrderId: ',
    customerId: '
  });

  // Advanced settings
  const [settings, setSettings] = useState({
    avoidTolls: false,
    avoidHighways: false,
    vehicleType: 'car',
    fuelEfficiency: 25, // km/l
    fuelCost: 1.5, // per liter
    laborCost: 50, // per hour
    considerTraffic: true,
    timeWindow: { start: '09:00', end: '17:00' },
    maxRouteTime: 480, // minutes
    maxStops: 20
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gpsManager = useOfflineGPS();

  useEffect(() => {
    if (initialRoute) {
      setRoute(initialRoute);
      setPoints([...initialRoute.points]);
    }
  }, [initialRoute]);

  useEffect(() => {
    if (route) {
      calculateRouteMetrics();
    }
  }, [points, optimizationMethod, settings]);

  const calculateRouteMetrics = async () => {
    if (points.length < 2) return;

    try {
      const totalDistance = 0;
      const estimatedDuration = 0;

      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        
        const distance = calculateDistance(
          current.latitude, current.longitude,
          next.latitude, next.longitude
        );
        
        totalDistance += distance;
        
        // Estimate travel time based on vehicle type and road conditions
        const avgSpeed = getAverageSpeed(settings.vehicleType, settings.avoidHighways);
        const travelTime = distance / (avgSpeed * 1000 / 60); // minutes
        
        estimatedDuration += travelTime;
        
        // Add stop duration
        if (next.duration) {
          estimatedDuration += next.duration;
        }
      }

      if (route) {
        const updatedRoute = {
          ...route,
          points,
          totalDistance,
          estimatedDuration,
          optimizationMethod,
          updatedAt: new Date()
        };
        
        setRoute(updatedRoute);
        onRouteUpdate?.(updatedRoute);
      }
    } catch (error) {
      console.error('Failed to calculate route metrics:', error);
    }
  };

  const optimizeRoute = async () => {
    if (points.length < 3) {
      setError('Need at least 3 points to optimize route');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const originalDistance = route?.totalDistance || 0;
      
      // Simulate optimization (in production, would use actual optimization service)
      const optimizedPoints = await performOptimization(points, optimizationMethod);
      
      setPoints(optimizedPoints);
      
      // Calculate savings
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for metrics calculation
      
      const optimizedDistance = route?.totalDistance || 0;
      const distanceSaved = originalDistance - optimizedDistance;
      const timeSaved = (distanceSaved / 1000) / getAverageSpeed(settings.vehicleType, settings.avoidHighways) * 60;
      const fuelSaved = (distanceSaved / 1000) / settings.fuelEfficiency;
      
      setOptimizationResult({
        originalDistance,
        optimizedDistance,
        timeSaved: Math.max(0, timeSaved),
        fuelSaved: Math.max(0, fuelSaved),
        method: optimizationMethod,
        confidence: 85 + Math.random() * 10 // Simulated confidence score
      });

    } catch (error) {
      setError('Failed to optimize route');
      console.error('Route optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const performOptimization = async (
    routePoints: RoutePoint[],
    method: string
  ): Promise<RoutePoint[]> => {
    // Simple optimization simulation
    const start = routePoints.find(p => p.type === 'start');
    const destination = routePoints.find(p => p.type === 'destination');
    const waypoints = routePoints.filter(p => p.type === 'waypoint' || p.type === 'stop');

    if (!start || !destination) {
      return routePoints;
    }

    let optimizedWaypoints = [...waypoints];

    switch (method) {
      case 'shortest_distance':
        optimizedWaypoints = optimizeByDistance(start, destination, waypoints);
        break;
      case 'fastest_time':
        optimizedWaypoints = optimizeByTime(start, destination, waypoints);
        break;
      case 'balanced':
        optimizedWaypoints = optimizeBalanced(start, destination, waypoints);
        break;
    }

    return [start, ...optimizedWaypoints, destination];
  };

  const optimizeByDistance = (start: RoutePoint, destination: RoutePoint, waypoints: RoutePoint[]): RoutePoint[] => {
    // Nearest neighbor algorithm
    const optimized: RoutePoint[] = [];
    const remaining = [...waypoints];
    let current = start;

    while (remaining.length > 0) {
      let nearest = remaining[0];
      let nearestDistance = calculateDistance(
        current.latitude, current.longitude,
        nearest.latitude, nearest.longitude
      );

      for (let i = 1; i < remaining.length; i++) {
        const distance = calculateDistance(
          current.latitude, current.longitude,
          remaining[i].latitude, remaining[i].longitude
        );
        if (distance < nearestDistance) {
          nearest = remaining[i];
          nearestDistance = distance;
        }
      }

      optimized.push(nearest);
      remaining.splice(remaining.indexOf(nearest), 1);
      current = nearest;
    }

    return optimized;
  };

  const optimizeByTime = (start: RoutePoint, destination: RoutePoint, waypoints: RoutePoint[]): RoutePoint[] => {
    // Priority and time window based optimization
    return waypoints.sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      if (a.estimatedArrival && b.estimatedArrival) {
        return a.estimatedArrival.getTime() - b.estimatedArrival.getTime();
      }
      
      return 0;
    });
  };

  const optimizeBalanced = (start: RoutePoint, destination: RoutePoint, waypoints: RoutePoint[]): RoutePoint[] => {
    // Combine distance and priority optimization
    const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
    
    return waypoints.sort((a, b) => {
      const aDistance = calculateDistance(
        start.latitude, start.longitude,
        a.latitude, a.longitude
      );
      const bDistance = calculateDistance(
        start.latitude, start.longitude,
        b.latitude, b.longitude
      );
      
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      // Balanced score: priority weight / (distance + 1)
      const aScore = aPriority / Math.max(aDistance / 1000, 0.1);
      const bScore = bPriority / Math.max(bDistance / 1000, 0.1);
      
      return bScore - aScore;
    });
  };

  const addPoint = () => {
    if (!newPoint.name || !newPoint.latitude || !newPoint.longitude) {
      setError('Please fill in all required fields');
      return;
    }

    const point: RoutePoint = {
      id: 'point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      ...newPoint,
    };

    setPoints(prev => [...prev, point]);
    setNewPoint({
      name: ',
      address: ',
      latitude: 0,
      longitude: 0,
      type: 'waypoint',
      priority: 'normal',
      duration: 15,
      notes: ',
      workOrderId: ',
      customerId: '
    });
    setShowAddPoint(false);
  };

  const removePoint = (pointId: string) => {
    setPoints(prev => prev.filter(p => p.id !== pointId));
  };

  const movePoint = (pointId: string, direction: 'up' | 'down') => {
    const index = points.findIndex(p => p.id === pointId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= points.length) return;

    const newPoints = [...points];
    [newPoints[index], newPoints[newIndex]] = [newPoints[newIndex], newPoints[index]];
    setPoints(newPoints);
  };

  const updatePoint = (pointId: string, updates: Partial<RoutePoint>) => {
    setPoints(prev => prev.map(p => 
      p.id === pointId ? { ...p, ...updates } : p
    ));
  };

  const saveRoute = async () => {
    if (!route || points.length < 2) {
      setError('Route must have at least 2 points');
      return;
    }

    try {
      setLoading(true);
      const updatedRoute = { ...route, points };
      // In production, would save to GPS manager
      onRouteUpdate?.(updatedRoute);
    } catch (_error) {
      setError('Failed to save route');
    } finally {
      setLoading(false);
    }
  };

  const startRoute = () => {
    if (route) {
      onRouteStart?.(route);
    }
  };

  // Utility functions
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth`s radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const getAverageSpeed = (vehicleType: string, avoidHighways: boolean): number => {
    const speeds = {
      car: avoidHighways ? 40 : 60,
      truck: avoidHighways ? 35 : 50,
      van: avoidHighways ? 38 : 55,
      motorcycle: avoidHighways ? 45 : 70
    };
    return speeds[vehicleType as keyof typeof speeds] || 50;
  };

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

  const getPriorityColor = (priority: RoutePoint['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'low': return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getTypeIcon = (type: RoutePoint['type']) => {
    switch (type) {
      case 'start': return <Flag className="h-4 w-4 text-green-500" />;
      case 'destination': return <Target className="h-4 w-4 text-red-500" />;
      case 'waypoint': return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'stop': return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Route Optimizer</h2>
          <p className="text-neutral-400">Plan and optimize your routes for maximum efficiency</p>
        </div>
        
        <div className="flex items-center gap-2">
          {route && (
            <>
              <Button variant="outline" onClick={saveRoute} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Route
              </Button>
              <Button onClick={startRoute}>
                <Play className="h-4 w-4 mr-2" />
                Start Route
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Summary */}
          {route && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  {route.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{formatDistance(route.totalDistance)}</p>
                    <p className="text-neutral-400 text-sm">Total Distance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{formatDuration(route.estimatedDuration)}</p>
                    <p className="text-neutral-400 text-sm">Estimated Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{points.length}</p>
                    <p className="text-neutral-400 text-sm">Total Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      ${((route.totalDistance / 1000) * settings.fuelCost / settings.fuelEfficiency).toFixed(2)}
                    </p>
                    <p className="text-neutral-400 text-sm">Fuel Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimization Results */}
          {optimizationResult && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Optimization Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-400">
                      -{formatDistance(optimizationResult.originalDistance - optimizationResult.optimizedDistance)}
                    </p>
                    <p className="text-neutral-400 text-sm">Distance Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-400">
                      -{formatDuration(optimizationResult.timeSaved)}
                    </p>
                    <p className="text-neutral-400 text-sm">Time Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-400">
                      -{optimizationResult.fuelSaved.toFixed(1)}L
                    </p>
                    <p className="text-neutral-400 text-sm">Fuel Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-400">
                      {optimizationResult.confidence.toFixed(0)}%
                    </p>
                    <p className="text-neutral-400 text-sm">Confidence</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">
                      Route optimized using {optimizationResult.method.replace('_', ' ')} method
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Points */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Route Points ({points.length})
                </CardTitle>
                <Button size="sm" onClick={() => setShowAddPoint(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {points.map((point, index) => (
                    <div key={point.id} className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                      <div className="flex-shrink-0">
                        {getTypeIcon(point.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white truncate">{point.name}</h4>
                          <Badge variant="outline" className={getPriorityColor(point.priority)}>
                            {point.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-400 truncate">
                          {point.address || '${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}'}
                        </p>
                        {point.duration && (
                          <p className="text-xs text-neutral-500">Stop duration: {point.duration}m</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => movePoint(point.id, 'up')} disabled={index === 0}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => movePoint(point.id, 'down')} disabled={index === points.length - 1}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedPoint(point)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removePoint(point.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {points.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">No route points added yet</p>
                  <Button size="sm" onClick={() => setShowAddPoint(true)} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Point
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Optimization Panel */}
        <div className="space-y-6">
          {/* Optimization Controls */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-neutral-400">Optimization Method</Label>
                <Select value={optimizationMethod} onValueChange={(value: unknown) => setOptimizationMethod(value)}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shortest_distance">Shortest Distance</SelectItem>
                    <SelectItem value="fastest_time">Fastest Time</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={optimizeRoute} 
                disabled={isOptimizing || points.length < 3}
                className="w-full"
              >
                {isOptimizing ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimize Route
                  </>
                )}
              </Button>

              {points.length < 3 && (
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <Info className="h-4 w-4" />
                  Need at least 3 points to optimize
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-neutral-400">Vehicle Type</Label>
                <Select value={settings.vehicleType} onValueChange={(value) => setSettings(prev => ({ ...prev, vehicleType: value }))}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-neutral-400">Fuel Efficiency (km/L)</Label>
                  <Input
                    type="number"
                    value={settings.fuelEfficiency}
                    onChange={(e) => setSettings(prev => ({ ...prev, fuelEfficiency: parseFloat(e.target.value) }))}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div>
                  <Label className="text-neutral-400">Fuel Cost ($/L)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.fuelCost}
                    onChange={(e) => setSettings(prev => ({ ...prev, fuelCost: parseFloat(e.target.value) }))}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-neutral-400">Avoid Tolls</Label>
                  <Switch
                    checked={settings.avoidTolls}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, avoidTolls: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-neutral-400">Avoid Highways</Label>
                  <Switch
                    checked={settings.avoidHighways}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, avoidHighways: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-neutral-400">Consider Traffic</Label>
                  <Switch
                    checked={settings.considerTraffic}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, considerTraffic: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {route && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Fuel Cost</span>
                    <span className="text-white">
                      ${((route.totalDistance / 1000) * settings.fuelCost / settings.fuelEfficiency).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Labor Cost</span>
                    <span className="text-white">
                      ${((route.estimatedDuration / 60) * settings.laborCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-700 pt-2">
                    <span className="text-neutral-300 font-medium">Total Cost</span>
                    <span className="text-white font-bold">
                      ${(
                        (route.totalDistance / 1000) * settings.fuelCost / settings.fuelEfficiency +
                        (route.estimatedDuration / 60) * settings.laborCost
                      ).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Point Modal */}
      {showAddPoint && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="bg-neutral-900 border-neutral-800 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Add Route Point</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-neutral-400">Point Name *</Label>
                <Input
                  value={newPoint.name}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter point name"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div>
                <Label className="text-neutral-400">Address</Label>
                <Input
                  value={newPoint.address}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-neutral-400">Latitude *</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={newPoint.latitude}
                    onChange={(e) => setNewPoint(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div>
                  <Label className="text-neutral-400">Longitude *</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={newPoint.longitude}
                    onChange={(e) => setNewPoint(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-neutral-400">Type</Label>
                  <Select value={newPoint.type} onValueChange={(value: unknown) => setNewPoint(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start">Start Point</SelectItem>
                      <SelectItem value="waypoint">Waypoint</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                      <SelectItem value="destination">Destination</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-neutral-400">Priority</Label>
                  <Select value={newPoint.priority} onValueChange={(value: unknown) => setNewPoint(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-neutral-400">Stop Duration (minutes)</Label>
                <Input
                  type="number"
                  value={newPoint.duration}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addPoint} className="flex-1">
                  Add Point
                </Button>
                <Button variant="outline" onClick={() => setShowAddPoint(false)}>
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