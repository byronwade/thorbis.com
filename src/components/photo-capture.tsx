'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Camera,
  Video,
  RotateCcw,
  FlipHorizontal,
  Zap,
  ZapOff,
  Grid,
  Settings,
  Check,
  X,
  Download,
  Share2,
  Tag,
  MapPin,
  Clock,
  Maximize,
  Minimize,
  Focus,
  Sun,
  Moon,
  Timer,
  Repeat
} from 'lucide-react';

import { useOfflineMedia } from '@/lib/offline-media-manager';
import type { MediaCategory } from '@/lib/offline-media-manager';

interface PhotoCaptureProps {
  onCapture?: (mediaId: string) => void;
  onCancel?: () => void;
  category?: MediaCategory;
  workOrderId?: string;
  customerId?: string;
  autoUpload?: boolean;
  showControls?: boolean;
}

interface CaptureSettings {
  quality: number;
  resolution: 'low' | 'medium' | 'high';
  format: 'jpeg' | 'png' | 'webp';
  location: boolean;
  timestamp: boolean;
  compression: boolean;
  flash: 'auto' | 'on' | 'off';
  facing: 'user' | 'environment';
  timer: 0 | 3 | 5 | 10;
}

export default function PhotoCapture({
  onCapture,
  onCancel,
  category = 'work_order_photo',
  workOrderId,
  customerId,
  autoUpload = true,
  showControls = true
}: PhotoCaptureProps) {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Camera settings
  const [settings, setSettings] = useState<CaptureSettings>({
    quality: 85,
    resolution: 'high',
    format: 'jpeg',
    location: true,
    timestamp: true,
    compression: true,
    flash: 'auto',
    facing: 'environment',
    timer: 0
  });
  
  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [flashEnabled, setFlashEnabled] = useState(false);
  
  // Device capabilities
  const [capabilities, setCapabilities] = useState<{
    hasFlash: boolean;
    hasZoom: boolean;
    hasFocus: boolean;
    facingModes: string[];
    resolutions: { width: number; height: number }[];
  }>({
    hasFlash: false,
    hasZoom: false,
    hasFocus: false,
    facingModes: [],
    resolutions: []
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const photoPreviewRef = useRef<HTMLImageElement>(null);
  
  const mediaManager = useOfflineMedia();

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isActive, settings.facing]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && settings.timer > 0) {
      // Timer finished, take photo
      capturePhoto();
    }
  }, [countdown]);

  const startCamera = async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: settings.facing,
          width: { ideal: getResolutionWidth() },
          height: { ideal: getResolutionHeight() }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCurrentStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Get camera capabilities
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const caps = videoTrack.getCapabilities?.();
        if (caps) {
          setCapabilities({
            hasFlash: 'torch' in caps,
            hasZoom: 'zoom' in caps,
            hasFocus: 'focusDistance' in caps,
            facingModes: caps.facingMode || [],
            resolutions: caps.width && caps.height ? [
              { width: caps.width.max || 1920, height: caps.height.max || 1080 }
            ] : []
          });
        }
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const getResolutionWidth = (): number => {
    switch (settings.resolution) {
      case 'low': return 640;
      case 'medium': return 1280;
      case 'high': return 1920;
      default: return 1280;
    }
  };

  const getResolutionHeight = (): number => {
    switch (settings.resolution) {
      case 'low': return 480;
      case 'medium': return 720;
      case 'high': return 1080;
      default: return 720;
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Flash effect
      if (flashEnabled || settings.flash === 'on') {
        const flashOverlay = document.createElement('div');
        flashOverlay.style.position = 'fixed';
        flashOverlay.style.top = '0';
        flashOverlay.style.left = '0';
        flashOverlay.style.width = '100%';
        flashOverlay.style.height = '100%';
        flashOverlay.style.backgroundColor = 'white';
        flashOverlay.style.zIndex = '9999';
        flashOverlay.style.pointerEvents = 'none';
        document.body.appendChild(flashOverlay);
        
        setTimeout(() => {
          document.body.removeChild(flashOverlay);
        }, 100);
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas context not available');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add overlay information if enabled
      if (settings.timestamp || settings.location) {
        await addOverlayInfo(context, canvas.width, canvas.height);
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to capture photo'));
            }
          },
          'image/${settings.format}',
          settings.quality / 100
        );
      });

      // Create file from blob
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = 'photo_${timestamp}.${settings.format}';
      const file = new File([blob], fileName, { type: blob.type });

      // Get location if enabled
      let location: { latitude: number; longitude: number } | undefined;
      if (settings.location) {
        location = await getCurrentLocation();
      }

      // Upload file if auto-upload is enabled
      if (autoUpload) {
        const mediaId = await mediaManager.uploadFile(file, {
          category,
          compress: settings.compression,
          generateThumbnail: true,
          generatePreview: true,
          location,
          associatedId: workOrderId || customerId,
          associatedType: workOrderId ? 'work_order' : customerId ? 'customer' : undefined,
          tags: [category, 'camera_capture']
        });

        setCapturedMedia(prev => [...prev, mediaId]);
        onCapture?.(mediaId);
      } else {
        // Just preview the photo
        const url = URL.createObjectURL(blob);
        if (photoPreviewRef.current) {
          photoPreviewRef.current.src = url;
        }
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      setError('Failed to capture photo');
    } finally {
      setLoading(false);
    }
  };

  const startVideoRecording = async () => {
    if (!currentStream) return;

    try {
      const mediaRecorder = new MediaRecorder(currentStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = 'video_${timestamp}.webm';
        const file = new File([blob], fileName, { type: blob.type });

        if (autoUpload) {
          const mediaId = await mediaManager.uploadFile(file, {
            category: 'video',
            compress: settings.compression,
            generateThumbnail: true,
            associatedId: workOrderId || customerId,
            associatedType: workOrderId ? 'work_order' : customerId ? 'customer' : undefined,
            tags: ['video_capture', category]
          });

          setCapturedMedia(prev => [...prev, mediaId]);
          onCapture?.(mediaId);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start video recording:', error);
      setError('Failed to start video recording');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addOverlayInfo = async (
    context: CanvasRenderingContext2D,
    width: number,
    height: number
  ): Promise<void> => {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.font = '16px sans-serif';
    context.fillStyle = 'white';

    const y = height - 20;

    if (settings.timestamp) {
      const timestamp = new Date().toLocaleString();
      context.fillText(timestamp, 10, y);
      y -= 25;
    }

    if (settings.location) {
      try {
        const location = await getCurrentLocation();
        if (location) {
          const locationText = '${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}';
          context.fillText(locationText, 10, y);
        }
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    }
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const switchCamera = async () => {
    const newFacing = settings.facing === 'user' ? 'environment' : 'user';
    setSettings(prev => ({ ...prev, facing: newFacing }));
  };

  const toggleFlash = async () => {
    if (currentStream && capabilities.hasFlash) {
      const videoTrack = currentStream.getVideoTracks()[0];
      try {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any]
        });
        setFlashEnabled(!flashEnabled);
      } catch (error) {
        console.error('Failed to toggle flash:', error);
      }
    }
  };

  const startTimer = () => {
    if (settings.timer > 0) {
      setCountdown(settings.timer);
    } else {
      capturePhoto();
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!isActive) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6 text-center">
          <Camera className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Camera</h3>
          <p className="text-neutral-400 mb-4">
            Capture photos and videos for your work orders
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setIsActive(true)}>
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={'flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : '}'}>
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 m-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Camera View */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Grid overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/30"></div>
              ))}
            </div>
          </div>
        )}

        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-6xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Flash indicator */}
        {flashEnabled && (
          <div className="absolute top-4 left-4">
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Zap className="h-3 w-3 mr-1" />
              Flash
            </Badge>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
              Recording
            </Badge>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-black/50 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="bg-black/50 backdrop-blur-sm"
          >
            <Grid className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-black/50 backdrop-blur-sm"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>

        {/* Bottom Controls */}
        {showControls && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-6">
              {/* Flash toggle */}
              {capabilities.hasFlash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFlash}
                  className={'rounded-full w-12 h-12 ${
                    flashEnabled ? 'bg-yellow-500/20 text-yellow-400' : 'bg-black/50 backdrop-blur-sm'
                  }'}
                >
                  {flashEnabled ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
                </Button>
              )}

              {/* Capture button */}
              <Button
                onClick={startTimer}
                disabled={loading || countdown > 0}
                className="rounded-full w-16 h-16 bg-white text-black hover:bg-neutral-200"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-8 w-8" />
                )}
              </Button>

              {/* Video record button */}
              <Button
                onClick={isRecording ? stopVideoRecording : startVideoRecording}
                className={'rounded-full w-12 h-12 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-black/50 backdrop-blur-sm text-white'
                }'}
              >
                {isRecording ? (
                  <div className="w-4 h-4 bg-white rounded-sm" />
                ) : (
                  <Video className="h-5 w-5" />
                )}
              </Button>

              {/* Camera switch */}
              {capabilities.facingModes.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchCamera}
                  className="rounded-full w-12 h-12 bg-black/50 backdrop-blur-sm"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Close button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsActive(false);
              onCancel?.();
            }}
            className="bg-black/50 backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="m-4 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Camera Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-neutral-400">Quality</Label>
                <Input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    quality: parseInt(e.target.value) 
                  }))}
                  className="bg-neutral-800 border-neutral-700"
                />
                <span className="text-sm text-neutral-400">{settings.quality}%</span>
              </div>

              <div>
                <Label className="text-neutral-400">Resolution</Label>
                <Select 
                  value={settings.resolution} 
                  onValueChange={(value: unknown) => setSettings(prev => ({ 
                    ...prev, 
                    resolution: value 
                  }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (640x480)</SelectItem>
                    <SelectItem value="medium">Medium (1280x720)</SelectItem>
                    <SelectItem value="high">High (1920x1080)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-neutral-400">Format</Label>
                <Select 
                  value={settings.format} 
                  onValueChange={(value: unknown) => setSettings(prev => ({ 
                    ...prev, 
                    format: value 
                  }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-neutral-400">Timer</Label>
                <Select 
                  value={settings.timer.toString()} 
                  onValueChange={(value) => setSettings(prev => ({ 
                    ...prev, 
                    timer: parseInt(value) as any
                  }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Timer</SelectItem>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-neutral-400">Add timestamp</Label>
                <Switch
                  checked={settings.timestamp}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    timestamp: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-neutral-400">Add location</Label>
                <Switch
                  checked={settings.location}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    location: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-neutral-400">Compress images</Label>
                <Switch
                  checked={settings.compression}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    compression: checked 
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Captured Media Preview */}
      {capturedMedia.length > 0 && (
        <Card className="m-4 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">
              Captured Media ({capturedMedia.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto">
              {capturedMedia.map((mediaId) => (
                <div key={mediaId} className="flex-shrink-0 w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden photo preview */}
      <img ref={photoPreviewRef} className="hidden" alt="Photo preview" />
    </div>
  );
}