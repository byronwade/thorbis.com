// Offline GPS tracking and route optimization manager
// Provides comprehensive location tracking, route planning, and navigation capabilities

import { EventEmitter } from 'events';

export interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  organizationId: string;
  userId: string;
  deviceId: string;
  batteryLevel?: number;
  networkStatus: 'online' | 'offline';
  source: 'gps' | 'network' | 'passive';
}

export interface RoutePoint {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
  type: 'start' | 'waypoint' | 'destination' | 'stop';
  estimatedArrival?: Date;
  actualArrival?: Date;
  duration?: number; // in minutes
  notes?: string;
  workOrderId?: string;
  customerId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface Route {
  id: string;
  name: string;
  organizationId: string;
  userId: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  points: RoutePoint[];
  totalDistance: number; // in meters
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  startTime: Date;
  endTime?: Date;
  optimized: boolean;
  optimizationMethod: 'manual' | 'shortest_distance' | 'fastest_time' | 'balanced';
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'pending' | 'synced' | 'conflict';
  metadata?: Record<string, unknown>;
}

export interface GeofenceArea {
  id: string;
  name: string;
  organizationId: string;
  type: 'circular' | 'polygon';
  center?: { latitude: number; longitude: number };
  radius?: number; // in meters for circular
  coordinates?: { latitude: number; longitude: number }[]; // for polygon
  enabled: boolean;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  workOrderId?: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
}

export interface TrackingSession {
  id: string;
  organizationId: string;
  userId: string;
  routeId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'paused' | 'completed';
  totalDistance: number;
  totalDuration: number; // in minutes
  locationCount: number;
  batteryUsage: number; // percentage
  accuracy: 'high' | 'medium' | 'low';
  interval: number; // tracking interval in seconds
  metadata?: Record<string, unknown>;
}

export interface NavigationInstruction {
  id: string;
  routeId: string;
  sequence: number;
  type: 'turn_left' | 'turn_right' | 'straight' | 'u_turn' | 'arrive' | 'depart';
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: { latitude: number; longitude: number };
  streetName?: string;
  landmark?: string;
}

export interface GPSStatistics {
  totalLocationsTracked: number;
  totalDistanceTraveled: number; // in meters
  totalTrackingTime: number; // in minutes
  averageAccuracy: number;
  routesCompleted: number;
  routesOptimized: number;
  geofenceEvents: number;
  batterySavings: number; // percentage saved through optimization
  offlineTime: number; // time spent offline in minutes
  syncPending: number;
}

export interface GPSSettings {
  trackingEnabled: boolean;
  accuracy: 'high' | 'medium' | 'low';
  interval: number; // in seconds
  backgroundTracking: boolean;
  batteryOptimization: boolean;
  geofenceEnabled: boolean;
  routeOptimization: boolean;
  offlineMapCaching: boolean;
  syncOnWiFiOnly: boolean;
  privacyMode: boolean;
}

export class OfflineGPSManager extends EventEmitter {
  private static instance: OfflineGPSManager | null = null;
  private dbName = 'offline_gps';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  // Tracking state
  private currentSession: TrackingSession | null = null;
  private watchId: number | null = null;
  private activeRoute: Route | null = null;
  private lastKnownLocation: LocationData | null = null;
  
  // Settings and configuration
  private settings: GPSSettings = {
    trackingEnabled: false,
    accuracy: 'medium',
    interval: 30,
    backgroundTracking: false,
    batteryOptimization: true,
    geofenceEnabled: true,
    routeOptimization: true,
    offlineMapCaching: true,
    syncOnWiFiOnly: false,
    privacyMode: false
  };
  
  // Geofences and monitoring
  private geofences: Map<string, GeofenceArea> = new Map();
  private currentGeofences: Set<string> = new Set();
  
  // Route optimization cache
  private routeCache: Map<string, any> = new Map();
  private optimizationWorker: Worker | null = null;
  
  private constructor() {
    super();
    this.initialize();
  }

  static getInstance(): OfflineGPSManager {
    if (!OfflineGPSManager.instance) {
      OfflineGPSManager.instance = new OfflineGPSManager();
    }
    return OfflineGPSManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      await this.initializeDatabase();
      await this.loadSettings();
      await this.loadGeofences();
      this.setupBackgroundSync();
      this.setupGeolocationWatcher();
      
      this.emit('gps_manager_initialized');
    } catch (error) {
      console.error('Failed to initialize GPS manager:', error);
      this.emit('gps_manager_error', { error });
    }
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Location data store
        if (!db.objectStoreNames.contains('locations')) {
          const locationStore = db.createObjectStore('locations', { keyPath: 'id' });
          locationStore.createIndex('timestamp', 'timestamp');
          locationStore.createIndex('userId', 'userId');
          locationStore.createIndex('organizationId', 'organizationId');
          locationStore.createIndex('sessionId', 'sessionId');
        }
        
        // Routes store
        if (!db.objectStoreNames.contains('routes')) {
          const routeStore = db.createObjectStore('routes', { keyPath: 'id' });
          routeStore.createIndex('status', 'status');
          routeStore.createIndex('userId', 'userId');
          routeStore.createIndex('organizationId', 'organizationId');
          routeStore.createIndex('createdAt', 'createdAt');
        }
        
        // Tracking sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('status', 'status');
          sessionStore.createIndex('userId', 'userId');
          sessionStore.createIndex('startTime', 'startTime');
        }
        
        // Geofences store
        if (!db.objectStoreNames.contains('geofences')) {
          const geofenceStore = db.createObjectStore('geofences', { keyPath: 'id' });
          geofenceStore.createIndex('organizationId', 'organizationId');
          geofenceStore.createIndex('enabled', 'enabled');
        }
        
        // Navigation instructions store
        if (!db.objectStoreNames.contains('navigation')) {
          const navStore = db.createObjectStore('navigation', { keyPath: 'id' });
          navStore.createIndex('routeId', 'routeId');
          navStore.createIndex('sequence', 'sequence');
        }
        
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Location Tracking Methods

  async startTracking(options: {
    accuracy?: 'high' | 'medium' | 'low';
    interval?: number;
    routeId?: string;
  } = {}): Promise<string> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    // Check permissions
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    if (permission.state === 'denied') {
      throw new Error('Geolocation permission denied');
    }

    // Create new tracking session
    const sessionId = 'session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    const session: TrackingSession = {
      id: sessionId,
      organizationId: 'default', // Would come from context
      userId: 'current_user', // Would come from auth
      routeId: options.routeId,
      startTime: new Date(),
      status: 'active',
      totalDistance: 0,
      totalDuration: 0,
      locationCount: 0,
      batteryUsage: 0,
      accuracy: options.accuracy || this.settings.accuracy,
      interval: options.interval || this.settings.interval,
    };

    this.currentSession = session;
    await this.saveSession(session);

    // Configure geolocation options
    const geoOptions: PositionOptions = {
      enableHighAccuracy: session.accuracy === 'high',
      timeout: 10000,
      maximumAge: session.interval * 1000,
    };

    // Start location watching
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.handleLocationError(error),
      geoOptions
    );

    this.emit('tracking_started', { sessionId, session });
    return sessionId;
  }

  async stopTracking(): Promise<void> {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.currentSession) {
      this.currentSession.status = 'completed';
      this.currentSession.endTime = new Date();
      this.currentSession.totalDuration = 
        (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 60000;
      
      await this.saveSession(this.currentSession);
      this.emit('tracking_stopped', { session: this.currentSession });
      this.currentSession = null;
    }
  }

  async pauseTracking(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.status = 'paused';
      await this.saveSession(this.currentSession);
      this.emit('tracking_paused', { session: this.currentSession });
    }
  }

  async resumeTracking(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.status = 'active';
      await this.saveSession(this.currentSession);
      this.emit('tracking_resumed', { session: this.currentSession });
    }
  }

  private async handleLocationUpdate(position: GeolocationPosition): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'active') return;

    const locationData: LocationData = {
      id: 'loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude || undefined,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: new Date(position.timestamp),
      organizationId: this.currentSession.organizationId,
      userId: this.currentSession.userId,
      deviceId: 'current_device', // Would come from device info
      networkStatus: navigator.onLine ? 'online' : 'offline',
      source: position.coords.accuracy < 100 ? 'gps' : 'network',
    };

    // Calculate distance from last location
    if (this.lastKnownLocation) {
      const distance = this.calculateDistance(
        this.lastKnownLocation.latitude,
        this.lastKnownLocation.longitude,
        locationData.latitude,
        locationData.longitude
      );
      
      this.currentSession.totalDistance += distance;
      this.currentSession.locationCount++;
    }

    this.lastKnownLocation = locationData;
    await this.saveLocation(locationData);
    await this.saveSession(this.currentSession);

    // Check geofences
    await this.checkGeofences(locationData);

    // Update route progress if applicable
    if (this.activeRoute) {
      await this.updateRouteProgress(locationData);
    }

    this.emit('location_updated', { location: locationData, session: this.currentSession });
  }

  private handleLocationError(error: GeolocationPositionError): void {
    console.error('Location error:', error);
    this.emit('location_error', { error: error.message, code: error.code });
  }

  // Route Management Methods

  async createRoute(routeData: {
    name: string;
    points: Omit<RoutePoint, 'id'>[];
    optimizationMethod?: 'manual' | 'shortest_distance' | 'fastest_time' | 'balanced`;
  }): Promise<string> {
    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    const points: RoutePoint[] = routeData.points.map((point, index) => ({
      ...point,
      id: 'point_${routeId}_${index}',
    }));

    const route: Route = {
      id: routeId,
      name: routeData.name,
      organizationId: 'default', // Would come from context
      userId: 'current_user', // Would come from auth
      status: 'planned',
      points,
      totalDistance: 0,
      estimatedDuration: 0,
      optimized: false,
      optimizationMethod: routeData.optimizationMethod || 'balanced',
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: new Date(),
      syncStatus: 'pending',
    };

    // Calculate initial route metrics
    await this.calculateRouteMetrics(route);
    
    // Optimize route if requested
    if (route.optimizationMethod !== 'manual') {
      await this.optimizeRoute(route);
    }

    await this.saveRoute(route);
    this.emit('route_created', { route });
    
    return routeId;
  }

  async optimizeRoute(route: Route): Promise<Route> {
    if (route.points.length < 3) {
      return route; // No optimization needed for less than 3 points
    }

    try {
      const optimizedPoints = await this.performRouteOptimization(route.points, route.optimizationMethod);
      route.points = optimizedPoints;
      route.optimized = true;
      route.updatedAt = new Date();
      
      await this.calculateRouteMetrics(route);
      await this.saveRoute(route);
      
      this.emit('route_optimized', { route });
      return route;
    } catch (error) {
      console.error('Route optimization failed:', error);
      this.emit('route_optimization_failed', { route, error });
      return route;
    }
  }

  private async performRouteOptimization(
    points: RoutePoint[],
    method: string
  ): Promise<RoutePoint[]> {
    // Simple optimization implementation
    // In production, this would use more sophisticated algorithms
    
    if (method === 'manual') {
      return points;
    }

    const start = points.find(p => p.type === 'start');
    const destination = points.find(p => p.type === 'destination');
    const waypoints = points.filter(p => p.type === 'waypoint' || p.type === 'stop');

    if (!start || !destination) {
      return points;
    }

    let optimizedWaypoints = [...waypoints];

    switch (method) {
      case 'shortest_distance':
        optimizedWaypoints = this.optimizeByDistance(start, destination, waypoints);
        break;
      case 'fastest_time':
        optimizedWaypoints = this.optimizeByTime(start, destination, waypoints);
        break;
      case 'balanced':
        optimizedWaypoints = this.optimizeBalanced(start, destination, waypoints);
        break;
    }

    return [start, ...optimizedWaypoints, destination];
  }

  private optimizeByDistance(
    start: RoutePoint,
    destination: RoutePoint,
    waypoints: RoutePoint[]
  ): RoutePoint[] {
    // Nearest neighbor algorithm for distance optimization
    const optimized: RoutePoint[] = [];
    const remaining = [...waypoints];
    let current = start;

    while (remaining.length > 0) {
      let nearest = remaining[0];
      let nearestDistance = this.calculateDistance(
        current.latitude, current.longitude,
        nearest.latitude, nearest.longitude
      );

      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistance(
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
  }

  private optimizeByTime(
    start: RoutePoint,
    destination: RoutePoint,
    waypoints: RoutePoint[]
  ): RoutePoint[] {
    // Priority-based optimization considering urgency and estimated time
    return waypoints.sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If same priority, sort by estimated arrival time
      if (a.estimatedArrival && b.estimatedArrival) {
        return a.estimatedArrival.getTime() - b.estimatedArrival.getTime();
      }
      
      return 0;
    });
  }

  private optimizeBalanced(
    start: RoutePoint,
    destination: RoutePoint,
    waypoints: RoutePoint[]
  ): RoutePoint[] {
    // Combine distance and priority optimization
    const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
    
    return waypoints.sort((a, b) => {
      const aDistance = this.calculateDistance(
        start.latitude, start.longitude,
        a.latitude, a.longitude
      );
      const bDistance = this.calculateDistance(
        start.latitude, start.longitude,
        b.latitude, b.longitude
      );
      
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      // Balanced score: priority weight / distance
      const aScore = aPriority / Math.max(aDistance, 0.1);
      const bScore = bPriority / Math.max(bDistance, 0.1);
      
      return bScore - aScore; // Higher score first
    });
  }

  async startRoute(routeId: string): Promise<void> {
    const route = await this.getRoute(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    route.status = 'active';
    route.startTime = new Date();
    route.updatedAt = new Date();
    
    this.activeRoute = route;
    await this.saveRoute(route);
    
    // Start tracking if not already active
    if (!this.currentSession) {
      await this.startTracking({ routeId });
    }

    this.emit('route_started', { route });
  }

  async completeRoute(routeId: string): Promise<void> {
    const route = await this.getRoute(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    route.status = 'completed';
    route.endTime = new Date();
    route.actualDuration = (route.endTime.getTime() - route.startTime.getTime()) / 60000;
    route.updatedAt = new Date();
    
    await this.saveRoute(route);
    
    if (this.activeRoute?.id === routeId) {
      this.activeRoute = null;
    }

    this.emit('route_completed', { route });
  }

  private async updateRouteProgress(location: LocationData): Promise<void> {
    if (!this.activeRoute) return;

    // Check if we've arrived at any route points
    for (const point of this.activeRoute.points) {
      if (point.actualArrival) continue; // Already visited
      
      const distance = this.calculateDistance(
        location.latitude, location.longitude,
        point.latitude, point.longitude
      );
      
      // Consider arrived if within 50 meters
      if (distance <= 50) {
        point.actualArrival = new Date();
        await this.saveRoute(this.activeRoute);
        
        this.emit('route_point_reached', {
          route: this.activeRoute,
          point,
          location
        });
        
        // Generate next navigation instruction
        await this.generateNextInstruction();
      }
    }
  }

  private async generateNextInstruction(): Promise<void> {
    if (!this.activeRoute || !this.lastKnownLocation) return;

    const nextPoint = this.activeRoute.points.find(p => !p.actualArrival);
    if (!nextPoint) {
      this.emit('route_navigation_complete', { route: this.activeRoute });
      return;
    }

    const instruction: NavigationInstruction = {
      id: 'nav_${Date.now()}',
      routeId: this.activeRoute.id,
      sequence: this.activeRoute.points.indexOf(nextPoint),
      type: 'straight', // Simplified - would use actual turn-by-turn
      instruction: 'Head to ${nextPoint.name || 'next destination'}',
      distance: this.calculateDistance(
        this.lastKnownLocation.latitude,
        this.lastKnownLocation.longitude,
        nextPoint.latitude,
        nextPoint.longitude
      ),
      duration: 0, // Would calculate based on speed/traffic
      coordinates: {
        latitude: nextPoint.latitude,
        longitude: nextPoint.longitude
      },
    };

    await this.saveNavigationInstruction(instruction);
    this.emit('navigation_instruction', { instruction });
  }

  // Geofencing Methods

  async createGeofence(geofenceData: Omit<GeofenceArea, 'id'>): Promise<string> {
    const geofenceId = 'geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    const geofence: GeofenceArea = {
      ...geofenceData,
      id: geofenceId,
    };

    this.geofences.set(geofenceId, geofence);
    await this.saveGeofence(geofence);
    
    this.emit('geofence_created', { geofence });
    return geofenceId;
  }

  async updateGeofence(geofenceId: string, updates: Partial<GeofenceArea>): Promise<void> {
    const geofence = this.geofences.get(geofenceId);
    if (!geofence) {
      throw new Error('Geofence not found');
    }

    Object.assign(geofence, updates);
    this.geofences.set(geofenceId, geofence);
    await this.saveGeofence(geofence);
    
    this.emit('geofence_updated', { geofence });
  }

  async deleteGeofence(geofenceId: string): Promise<void> {
    this.geofences.delete(geofenceId);
    await this.removeGeofence(geofenceId);
    
    this.emit('geofence_deleted', { geofenceId });
  }

  private async checkGeofences(location: LocationData): Promise<void> {
    for (const geofence of this.geofences.values()) {
      if (!geofence.enabled) continue;

      const isInside = this.isLocationInGeofence(location, geofence);
      const wasInside = this.currentGeofences.has(geofence.id);

      if (isInside && !wasInside) {
        // Entered geofence
        this.currentGeofences.add(geofence.id);
        if (geofence.alertOnEnter) {
          this.emit('geofence_entered', { geofence, location });
        }
      } else if (!isInside && wasInside) {
        // Exited geofence
        this.currentGeofences.delete(geofence.id);
        if (geofence.alertOnExit) {
          this.emit('geofence_exited', { geofence, location });
        }
      }
    }
  }

  private isLocationInGeofence(location: LocationData, geofence: GeofenceArea): boolean {
    if (geofence.type === 'circular' && geofence.center && geofence.radius) {
      const distance = this.calculateDistance(
        location.latitude, location.longitude,
        geofence.center.latitude, geofence.center.longitude
      );
      return distance <= geofence.radius;
    }

    if (geofence.type === 'polygon' && geofence.coordinates) {
      return this.isPointInPolygon(location, geofence.coordinates);
    }

    return false;
  }

  private isPointInPolygon(
    point: { latitude: number; longitude: number },
    polygon: { latitude: number; longitude: number }[]
  ): boolean {
    // Ray casting algorithm
    let inside = false;
    const x = point.longitude;
    const y = point.latitude;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].longitude;
      const yi = polygon[i].latitude;
      const xj = polygon[j].longitude;
      const yj = polygon[j].latitude;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  // Utility Methods

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula for calculating distance between two points
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async calculateRouteMetrics(route: Route): Promise<void> {
    let totalDistance = 0;
    let estimatedDuration = 0;

    for (let i = 0; i < route.points.length - 1; i++) {
      const current = route.points[i];
      const next = route.points[i + 1];
      
      const distance = this.calculateDistance(
        current.latitude, current.longitude,
        next.latitude, next.longitude
      );
      
      totalDistance += distance;
      
      // Estimate duration (assuming average speed of 50 km/h)
      const avgSpeed = 50000 / 60; // meters per minute
      estimatedDuration += distance / avgSpeed;
      
      // Add stop duration if specified
      if (next.duration) {
        estimatedDuration += next.duration;
      }
    }

    route.totalDistance = totalDistance;
    route.estimatedDuration = estimatedDuration;
  }

  // Database Operations

  private async saveLocation(location: LocationData): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['locations'], 'readwrite');
    const store = transaction.objectStore('locations');
    await store.add(location);
  }

  private async saveRoute(route: Route): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['routes'], 'readwrite');
    const store = transaction.objectStore('routes');
    await store.put(route);
  }

  private async saveSession(session: TrackingSession): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    await store.put(session);
  }

  private async saveGeofence(geofence: GeofenceArea): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['geofences'], 'readwrite');
    const store = transaction.objectStore('geofences');
    await store.put(geofence);
  }

  private async saveNavigationInstruction(instruction: NavigationInstruction): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['navigation'], 'readwrite');
    const store = transaction.objectStore('navigation');
    await store.put(instruction);
  }

  private async removeGeofence(geofenceId: string): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['geofences'], 'readwrite');
    const store = transaction.objectStore('geofences');
    await store.delete(geofenceId);
  }

  // Public Query Methods

  async getRoute(routeId: string): Promise<Route | null> {
    if (!this.db) return null;
    
    const transaction = this.db.transaction(['routes'], 'readonly');
    const store = transaction.objectStore('routes');
    return await store.get(routeId);
  }

  async getRoutes(filter: {
    status?: string;
    userId?: string;
    organizationId?: string;
  } = {}): Promise<Route[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(['routes'], 'readonly');
    const store = transaction.objectStore('routes');
    const routes = await store.getAll();
    
    return routes.filter(route => {
      if (filter.status && route.status !== filter.status) return false;
      if (filter.userId && route.userId !== filter.userId) return false;
      if (filter.organizationId && route.organizationId !== filter.organizationId) return false;
      return true;
    });
  }

  async getLocationHistory(filter: {
    sessionId?: string;
    userId?: string;
    startTime?: Date;
    endTime?: Date;
  } = {}): Promise<LocationData[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(['locations'], 'readonly');
    const store = transaction.objectStore('locations');
    const locations = await store.getAll();
    
    return locations.filter(location => {
      if (filter.userId && location.userId !== filter.userId) return false;
      if (filter.startTime && location.timestamp < filter.startTime) return false;
      if (filter.endTime && location.timestamp > filter.endTime) return false;
      return true;
    });
  }

  async getTrackingSessions(filter: {
    status?: string;
    userId?: string;
  } = {}): Promise<TrackingSession[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    const sessions = await store.getAll();
    
    return sessions.filter(session => {
      if (filter.status && session.status !== filter.status) return false;
      if (filter.userId && session.userId !== filter.userId) return false;
      return true;
    });
  }

  async getGeofences(organizationId?: string): Promise<GeofenceArea[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(['geofences'], 'readonly');
    const store = transaction.objectStore('geofences');
    const geofences = await store.getAll();
    
    if (organizationId) {
      return geofences.filter(g => g.organizationId === organizationId);
    }
    
    return geofences;
  }

  async getStatistics(organizationId?: string): Promise<GPSStatistics> {
    const sessions = await this.getTrackingSessions();
    const locations = await this.getLocationHistory();
    const routes = await this.getRoutes({ organizationId });
    
    const filteredSessions = organizationId 
      ? sessions.filter(s => s.organizationId === organizationId)
      : sessions;
    
    const totalDistance = filteredSessions.reduce((sum, session) => sum + session.totalDistance, 0);
    const totalTime = filteredSessions.reduce((sum, session) => sum + session.totalDuration, 0);
    const averageAccuracy = locations.length > 0 
      ? locations.reduce((sum, loc) => sum + loc.accuracy, 0) / locations.length
      : 0;

    return {
      totalLocationsTracked: locations.length,
      totalDistanceTraveled: totalDistance,
      totalTrackingTime: totalTime,
      averageAccuracy,
      routesCompleted: routes.filter(r => r.status === 'completed').length,
      routesOptimized: routes.filter(r => r.optimized).length,
      geofenceEvents: 0, // Would track from events
      batterySavings: this.settings.batteryOptimization ? 15 : 0,
      offlineTime: 0, // Would calculate from location data
      syncPending: routes.filter(r => r.syncStatus === 'pending').length,
    };
  }

  // Settings Management

  async updateSettings(newSettings: Partial<GPSSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    
    // Restart tracking with new settings if active
    if (this.currentSession && this.currentSession.status === 'active') {
      await this.stopTracking();
      await this.startTracking({
        accuracy: this.settings.accuracy,
        interval: this.settings.interval,
        routeId: this.currentSession.routeId,
      });
    }
    
    this.emit('settings_updated', { settings: this.settings });
  }

  getSettings(): GPSSettings {
    return { ...this.settings };
  }

  private async saveSettings(): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    await store.put({ key: 'gps_settings', value: this.settings });
  }

  private async loadSettings(): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const result = await store.get('gps_settings');
      
      if (result?.value) {
        this.settings = { ...this.settings, ...result.value };
      }
    } catch (error) {
      console.error('Failed to load GPS settings:', error);
    }
  }

  private async loadGeofences(): Promise<void> {
    const geofences = await this.getGeofences();
    this.geofences.clear();
    geofences.forEach(geofence => {
      this.geofences.set(geofence.id, geofence);
    });
  }

  // Background sync and optimization
  private setupBackgroundSync(): void {
    // Set up periodic sync for routes and locations
    setInterval(async () => {
      await this.syncPendingData();
    }, 60000); // Every minute
  }

  private setupGeolocationWatcher(): void {
    // Monitor network status for offline handling
    window.addEventListener('online', () => {
      this.emit('network_status_changed', { status: 'online' });
    });
    
    window.addEventListener('offline', () => {
      this.emit('network_status_changed', { status: 'offline' });
    });
  }

  async syncPendingData(): Promise<void> {
    try {
      const pendingRoutes = await this.getRoutes({ });
      const pendingSyncRoutes = pendingRoutes.filter(r => r.syncStatus === 'pending');
      
      for (const route of pendingSyncRoutes) {
        // In production, this would sync with server
        this.emit('route_sync_needed', { route });
      }
    } catch (error) {
      console.error('Failed to sync GPS data:', error);
    }
  }

  async getPendingSyncData(): Promise<{
    routes: Route[];
    locations: LocationData[];
    sessions: TrackingSession[];
  }> {
    const routes = await this.getRoutes();
    const locations = await this.getLocationHistory();
    const sessions = await this.getTrackingSessions();
    
    return {
      routes: routes.filter(r => r.syncStatus === 'pending'),
      locations: locations.filter(l => l.networkStatus === 'offline'),
      sessions: sessions.filter(s => s.status === 'completed'),
    };
  }

  // Cleanup and destruction
  destroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    if (this.optimizationWorker) {
      this.optimizationWorker.terminate();
      this.optimizationWorker = null;
    }
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    this.removeAllListeners();
  }
}

// React hook for GPS functionality
export function useOfflineGPS() {
  return OfflineGPSManager.getInstance();
}