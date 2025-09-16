'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PenTool,
  Save,
  RotateCcw,
  Check,
  X,
  Download,
  Upload,
  Settings,
  User,
  FileText,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Tablet,
  Edit,
  Trash2,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Grid,
  Move,
  Maximize,
  Minimize
} from 'lucide-react';

import { useOfflineSignature } from '@/lib/offline-signature-manager';
import type { 
  SignatureMetadata,
  CustomerSignatureData,
  SignatureData 
} from '@/lib/offline-signature-manager';

interface SignatureCaptureProps {
  formId?: string;
  organizationId: string;
  userId: string;
  purpose?: SignatureMetadata['purpose'];
  documentType?: string;
  workOrderId?: string;
  appointmentId?: string;
  onSignatureCaptured?: (signatureId: string) => void;
  onCancel?: () => void;
  requiresWitness?: boolean;
  prefilledCustomer?: Partial<CustomerSignatureData>;
  showCustomerForm?: boolean;
  fullscreen?: boolean;
  readOnly?: boolean;
}

interface SignatureSettings {
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  smoothing: boolean;
  pressureSensitive: boolean;
  velocityFiltering: boolean;
  dotSize: number;
  maxWidth: number;
  minWidth: number;
  throttle: number;
}

interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  time: number;
}

interface Stroke {
  points: DrawingPoint[];
  color: string;
  width: number;
}

export default function SignatureCapture({
  formId = 'temp_${Date.now()}',
  organizationId,
  userId,
  purpose = 'approval',
  documentType = 'form',
  workOrderId,
  appointmentId,
  onSignatureCaptured,
  onCancel,
  requiresWitness = false,
  prefilledCustomer = {},
  showCustomerForm = true,
  fullscreen = false,
  readOnly = false
}: SignatureCaptureProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [settings, setSettings] = useState<SignatureSettings>({
    strokeColor: '#000000',
    strokeWidth: 2,
    backgroundColor: '#ffffff',
    smoothing: true,
    pressureSensitive: false,
    velocityFiltering: true,
    dotSize: 1,
    maxWidth: 4,
    minWidth: 1,
    throttle: 16
  });

  // Customer data
  const [customerData, setCustomerData] = useState<CustomerSignatureData>({
    name: prefilledCustomer.name || ',
    email: prefilledCustomer.email || ',
    phone: prefilledCustomer.phone || ',
    address: prefilledCustomer.address || ',
    customerId: prefilledCustomer.customerId || ',
    title: prefilledCustomer.title || ',
    company: prefilledCustomer.company || ',
    witnessName: prefilledCustomer.witnessName || ',
    witnessSignature: prefilledCustomer.witnessSignature || '
  });

  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(showCustomerForm);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Device detection
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [touchSupport, setTouchSupport] = useState(false);
  const [penSupport, setPenSupport] = useState(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);
  const lastPointRef = useRef<DrawingPoint | null>(null);

  const signatureManager = useOfflineSignature();

  useEffect(() => {
    // Detect device capabilities
    setTouchSupport('ontouchstart' in window);
    setPenSupport('onpointerdown' in window);
    
    // Detect device type
    const width = window.innerWidth;
    if (width < 768) setDeviceType('mobile');
    else if (width < 1024) setDeviceType('tablet');
    else setDeviceType('desktop');

    // Initialize canvas
    initializeCanvas();
    
    // Setup event listeners
    const canvas = canvasRef.current;
    if (canvas && !readOnly) {
      setupEventListeners(canvas);
    }

    return () => {
      if (canvas) {
        removeEventListeners(canvas);
      }
    };
  }, [readOnly]);

  useEffect(() => {
    if (canvasRef.current) {
      redrawCanvas();
    }
  }, [strokes, settings, zoom, pan, showGrid]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d`);
    if (!ctx) return;

    // Set canvas size
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px';
      canvas.style.height = '${rect.height}px';
      
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // Setup canvas context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const setupEventListeners = (canvas: HTMLCanvasElement) => {
    // Mouse events
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('mouseleave', handlePointerUp);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // Pointer events (for pen support)
    if (penSupport) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
    }

    // Prevent context menu
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  };

  const removeEventListeners = (canvas: HTMLCanvasElement) => {
    canvas.removeEventListener('mousedown', handlePointerDown);
    canvas.removeEventListener('mousemove', handlePointerMove);
    canvas.removeEventListener('mouseup', handlePointerUp);
    canvas.removeEventListener('mouseleave', handlePointerUp);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
    
    if (penSupport) {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    }
  };

  const getPointFromEvent = (e: MouseEvent | TouchEvent | PointerEvent): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, time: Date.now() };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number, pressure = 0.5;

    if (e.type.startsWith('touch')) {
      const touch = (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = (e as MouseEvent | PointerEvent).clientX;
      clientY = (e as MouseEvent | PointerEvent).clientY;
      
      if ('pressure' in e && e.pressure > 0) {
        pressure = e.pressure;
      }
    }

    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
      pressure: settings.pressureSensitive ? pressure : 0.5,
      time: Date.now()
    };
  };

  const handlePointerDown = (e: MouseEvent | PointerEvent) => {
    if (readOnly) return;
    
    e.preventDefault();
    setIsDrawing(true);
    
    const point = getPointFromEvent(e);
    setCurrentStroke([point]);
    lastPointRef.current = point;
    lastTimeRef.current = point.time;
    
    // Draw initial dot
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(pan.x, pan.y);
      ctx.fillStyle = settings.strokeColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, settings.dotSize, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
  };

  const handlePointerMove = (e: MouseEvent | PointerEvent) => {
    if (!isDrawing || readOnly) return;

    e.preventDefault();
    
    const point = getPointFromEvent(e);
    const now = point.time;
    
    // Throttle drawing for performance
    if (now - lastTimeRef.current < settings.throttle) return;
    
    lastTimeRef.current = now;
    
    setCurrentStroke(prev => [...prev, point]);
    
    // Draw stroke segment
    if (lastPointRef.current) {
      drawStrokeSegment(lastPointRef.current, point);
    }
    
    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    if (!isDrawing || readOnly) return;
    
    setIsDrawing(false);
    
    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: settings.strokeColor,
        width: settings.strokeWidth
      };
      
      setStrokes(prev => [...prev, newStroke]);
    }
    
    setCurrentStroke([]);
    lastPointRef.current = null;
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY
    });
    handlePointerDown(mouseEvent);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY
    });
    handlePointerMove(mouseEvent);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    handlePointerUp();
  };

  const drawStrokeSegment = (from: DrawingPoint, to: DrawingPoint) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);
    
    ctx.strokeStyle = settings.strokeColor;
    ctx.lineWidth = calculateStrokeWidth(from, to);
    
    if (settings.smoothing && from && to) {
      // Use quadratic curves for smoothing
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(from.x, from.y, midX, midY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const calculateStrokeWidth = (from: DrawingPoint, to: DrawingPoint): number => {
    if (!settings.pressureSensitive && !settings.velocityFiltering) {
      return settings.strokeWidth;
    }

    let width = settings.strokeWidth;

    if (settings.pressureSensitive && to.pressure !== undefined) {
      width *= to.pressure;
    }

    if (settings.velocityFiltering && from && to) {
      const distance = Math.sqrt(
        Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
      );
      const timeDelta = to.time - from.time;
      const velocity = distance / Math.max(timeDelta, 1);
      
      // Adjust width based on velocity (slower = thicker)
      const velocityFactor = Math.max(0.5, Math.min(2, 10 / Math.max(velocity, 1)));
      width *= velocityFactor;
    }

    return Math.max(settings.minWidth, Math.min(settings.maxWidth, width));
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx);
    }

    // Apply zoom and pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Redraw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length === 0) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();

      if (stroke.points.length === 1) {
        // Single point - draw dot
        const point = stroke.points[0];
        ctx.arc(point.x, point.y, stroke.width / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Multiple points - draw stroke
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        if (settings.smoothing) {
          // Smooth curves
          for (const i = 1; i < stroke.points.length - 1; i++) {
            const current = stroke.points[i];
            const next = stroke.points[i + 1];
            const midX = (current.x + next.x) / 2;
            const midY = (current.y + next.y) / 2;
            ctx.quadraticCurveTo(current.x, current.y, midX, midY);
          }
        } else {
          // Straight lines
          stroke.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
        }
        ctx.stroke();
      }
    });

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gridSize = 20;
    
    ctx.save();
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.5;

    // Vertical lines
    for (const x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (const y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const clearSignature = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setError(null);
    setSuccess(null);
    redrawCanvas();
  };

  const undoLastStroke = () => {
    setStrokes(prev => prev.slice(0, -1));
    setError(null);
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const saveSignature = async () => {
    try {
      setLoading(true);
      setError(null);

      if (strokes.length === 0) {
        setError('Please provide a signature before saving');
        return;
      }

      if (!customerData.name.trim()) {
        setError('Customer name is required');
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        setError('Canvas not available');
        return;
      }

      const metadata: SignatureMetadata = {
        purpose,
        documentType,
        documentId: formId,
        workOrderId,
        appointmentId,
        description: '${purpose} signature for ${documentType}',
        requiresWitness,
        version: '1.0'
      };

      const signatureId = await signatureManager.captureSignature({
        formId,
        organizationId,
        userId,
        customerData,
        metadata,
        canvas,
        requireGPS: purpose === 'authorization'
      });

      setSuccess('Signature captured successfully');
      onSignatureCaptured?.(signatureId);
    } catch (error) {
      console.error('Failed to save signature:', error);
      setError('Failed to save signature. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;

    const link = document.createElement('a`);
    link.download = 'signature_${Date.now()}.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const hasSignature = strokes.length > 0;

  if (readOnly) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-lg">
        <div className="text-center">
          <PenTool className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">Signature view (read-only)</p>
        </div>
      </div>
    );
  }

  return (
    <div className={'flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : '}'}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <PenTool className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Signature Capture</h2>
            <p className="text-sm text-neutral-600">
              {purpose} signature for {documentType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device indicator */}
          <Badge variant="outline" className="gap-1">
            {deviceType === 'mobile' && <Smartphone className="h-3 w-3" />}
            {deviceType === 'tablet' && <Tablet className="h-3 w-3" />}
            {deviceType === 'desktop' && <Monitor className="h-3 w-3" />}
            {deviceType}
          </Badge>

          {/* Touch/Pen support indicators */}
          {touchSupport && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Touch
            </Badge>
          )}
          {penSupport && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Pen
            </Badge>
          )}
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Customer Details Panel */}
        {showCustomerDetails && (
          <div className="w-80 border-r border-neutral-200 p-4 bg-neutral-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-neutral-900">Customer Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomerDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter customer name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={customerData.address}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-sm font-medium">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={customerData.company}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Enter company name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={customerData.title}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter job title"
                    className="mt-1"
                  />
                </div>

                {requiresWitness && (
                  <div className="pt-4 border-t border-neutral-200">
                    <h4 className="font-medium text-neutral-900 mb-3">Witness Information</h4>
                    
                    <div>
                      <Label htmlFor="witnessName" className="text-sm font-medium">
                        Witness Name *
                      </Label>
                      <Input
                        id="witnessName"
                        value={customerData.witnessName}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, witnessName: e.target.value }))}
                        placeholder="Enter witness name"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Signature Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
            <div className="flex items-center gap-2">
              {/* Drawing tools */}
              <Button
                variant="outline"
                size="sm"
                onClick={undoLastStroke}
                disabled={strokes.length === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={!hasSignature}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="h-4 w-px bg-neutral-300" />

              {/* Zoom controls */}
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-neutral-600 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <Move className="h-4 w-4" />
              </Button>

              <div className="h-4 w-px bg-neutral-300" />

              {/* View options */}
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Customer details toggle */}
              {!showCustomerDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomerDetails(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Customer
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={downloadSignature}
                disabled={!hasSignature}
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

              <div className="h-4 w-px bg-neutral-300" />

              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                onClick={saveSignature}
                disabled={!hasSignature || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Signature
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-b border-neutral-200 p-4 bg-neutral-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Stroke Color</Label>
                  <input
                    type="color"
                    value={settings.strokeColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, strokeColor: e.target.value }))}
                    className="mt-1 h-8 w-full rounded border border-neutral-300"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Stroke Width</Label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.strokeWidth}
                    onChange={(e) => setSettings(prev => ({ ...prev, strokeWidth: parseInt(e.target.value) }))}
                    className="mt-1"
                  />
                  <div className="text-xs text-neutral-500 mt-1">{settings.strokeWidth}px</div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Background</Label>
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="mt-1 h-8 w-full rounded border border-neutral-300"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smoothing"
                    checked={settings.smoothing}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smoothing: checked }))}
                  />
                  <Label htmlFor="smoothing" className="text-sm">Smoothing</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pressure"
                    checked={settings.pressureSensitive}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pressureSensitive: checked }))}
                  />
                  <Label htmlFor="pressure" className="text-sm">Pressure Sensitive</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="velocity"
                    checked={settings.velocityFiltering}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, velocityFiltering: checked }))}
                  />
                  <Label htmlFor="velocity" className="text-sm">Velocity Filtering</Label>
                </div>
              </div>
            </div>
          )}

          {/* Signature Canvas */}
          <div 
            ref={containerRef}
            className="flex-1 relative bg-white overflow-hidden"
            style={{ minHeight: '400px' }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-crosshair"
              style={{
                transform: 'scale(${zoom}) translate(${pan.x}px, ${pan.y}px)',
                transformOrigin: '0 0'
              }}
            />

            {/* Empty state */}
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-neutral-400">
                  <PenTool className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">Sign here</p>
                  <p className="text-sm">
                    {touchSupport ? 'Touch and drag' : 'Click and drag'} to create your signature
                  </p>
                </div>
              </div>
            )}

            {/* Signature info overlay */}
            {hasSignature && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Signature captured ({strokes.length} strokes)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}