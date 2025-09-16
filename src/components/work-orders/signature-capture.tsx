'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Pen,
  Eraser,
  RotateCcw,
  Save,
  Download,
  Upload,
  User,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';

interface SignatureCaptureProps {
  onSave: (signatureData: SignatureData) => void;
  onCancel?: () => void;
  initialSignature?: SignatureData;
  title?: string;
  signerName?: string;
  required?: boolean;
  showMetadata?: boolean;
  width?: number;
  height?: number;
}

export interface SignatureData {
  id: string;
  signatureDataUrl: string;
  signerName: string;
  signerTitle?: string;
  timestamp: Date;
  ipAddress?: string;
  deviceInfo?: string;
  workOrderId?: string;
  documentId?: string;
}

export default function SignatureCapture({
  onSave,
  onCancel,
  initialSignature,
  title = 'Digital Signature',
  signerName = ',
  required = true,
  showMetadata = true,
  width = 600,
  height = 200
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerNameInput, setSignerNameInput] = useState(signerName);
  const [signerTitle, setSignerTitle] = useState(');
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
        setupCanvas(ctx, canvas);
        
        // Load initial signature if provided
        if (initialSignature) {
          loadSignature(initialSignature.signatureDataUrl);
          setSignerNameInput(initialSignature.signerName);
          setSignerTitle(initialSignature.signerTitle || ');
        }
      }
    }
  }, [initialSignature]);

  const setupCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add signature line
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 30);
    ctx.lineTo(canvas.width - 50, canvas.height - 30);
    ctx.stroke();
    
    // Add "Sign here" text
    ctx.fillStyle = '#999999';
    ctx.font = '14px sans-serif';
    ctx.fillText('Sign here', 50, canvas.height - 10);
    
    // Reset drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
  };

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const position = getPosition(e);
    setLastPosition(position);
    
    if (context) {
      context.beginPath();
      context.moveTo(position.x, position.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !context) return;

    const position = getPosition(e);
    context.lineTo(position.x, position.y);
    context.stroke();
    
    setLastPosition(position);
    setHasSignature(true);
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && context) {
      setupCanvas(context, canvas);
      setHasSignature(false);
    }
  };

  const loadSignature = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (canvas && context) {
      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = dataUrl;
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    if (required && !signerNameInput.trim()) {
      alert('Please enter the signer name');
      return;
    }

    const signatureDataUrl = canvas.toDataURL('image/png');
    
    const signatureData: SignatureData = {
      id: 'signature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      signatureDataUrl,
      signerName: signerNameInput.trim(),
      signerTitle: signerTitle.trim(),
      timestamp: new Date(),
      deviceInfo: navigator.userAgent,
    };

    onSave(signatureData);
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const link = document.createElement('a');
    link.download = 'signature_${signerNameInput || 'unsigned'}_${new Date().toISOString().split('T')[0]}.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Pen className="h-5 w-5" />
          {title}
        </CardTitle>
        {required && (
          <p className="text-neutral-400 text-sm">* Required for completion</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Signer Information */}
        {showMetadata && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signerName" className="text-neutral-400">
                Signer Name {required && '*'}
              </Label>
              <Input
                id="signerName"
                value={signerNameInput}
                onChange={(e) => setSignerNameInput(e.target.value)}
                placeholder="Enter full name"
                className="bg-neutral-800 border-neutral-700"
                required={required}
              />
            </div>
            <div>
              <Label htmlFor="signerTitle" className="text-neutral-400">
                Title/Position
              </Label>
              <Input
                id="signerTitle"
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                placeholder="e.g., Manager, Technician"
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>
        )}

        {/* Signature Canvas */}
        <div className="space-y-2">
          <Label className="text-neutral-400">Signature</Label>
          <div className="relative border-2 border-neutral-700 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="block cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ 
                width: '100%', 
                height: 'auto`,
                maxWidth: `${width}px',
                aspectRatio: '${width}/${height}'
              }}
            />
            
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-neutral-400 text-lg">Sign here with your finger or mouse</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSignature}
            disabled={!hasSignature}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Signature Status */}
        {hasSignature && (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Signature captured</span>
          </div>
        )}

        {/* Metadata Display */}
        {showMetadata && (
          <div className="text-xs text-neutral-500 space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Timestamp: {new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>Device: {navigator.platform}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-neutral-800">
          <Button
            onClick={saveSignature}
            disabled={!hasSignature || (required && !signerNameInput.trim())}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Signature
          </Button>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}