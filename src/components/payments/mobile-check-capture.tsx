'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Check, 
  RotateCcw, 
  Zap, 
  ScanLine, 
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  X
} from 'lucide-react';

interface CheckOCRResult {
  routingNumber: string;
  accountNumber: string;
  checkNumber: string;
  amount?: number;
  bankName?: string;
  memo?: string;
  confidence: number;
  rawText: string;
  boundingBoxes: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
}

interface CheckCaptureProps {
  onCheckCaptured: (checkData: CheckOCRResult, image: string) => void;
  onCancel: () => void;
  maxAttempts?: number;
}

export default function MobileCheckCapture({ 
  onCheckCaptured, 
  onCancel, 
  maxAttempts = 3 
}: CheckCaptureProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<CheckOCRResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(');
  const [manualEntry, setManualEntry] = useState(false);

  // Manual entry state
  const [manualRoutingNumber, setManualRoutingNumber] = useState(');
  const [manualAccountNumber, setManualAccountNumber] = useState(');
  const [manualCheckNumber, setManualCheckNumber] = useState(');
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualMemo, setManualMemo] = useState(');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get available camera devices
  useEffect(() => {
    const getCameraDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        
        // Prefer back camera on mobile
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        if (backCamera) {
          setSelectedDeviceId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Failed to enumerate devices:', error);
        setError('Failed to access camera devices');
      }
    };

    getCameraDevices();
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          focusMode: { ideal: 'continuous' },
          exposureMode: { ideal: 'continuous' }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    setCapturing(false);

    // Process the image
    await processCheckImage(imageData);
  }, []);

  const processCheckImage = async (imageData: string) => {
    setProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      // Simulate processing steps
      const steps = [
        'Analyzing image quality...',
        'Detecting text regions...',
        'Extracting MICR line...',
        'Parsing routing number...',
        'Parsing account number...',
        'Extracting check number...',
        'Validating results...'
      ];

      for (const i = 0; i < steps.length; i++) {
        setProcessingProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Simulate OCR processing
      const mockOcrResult: CheckOCRResult = {
        routingNumber: generateMockRoutingNumber(),
        accountNumber: generateMockAccountNumber(),
        checkNumber: generateMockCheckNumber(),
        amount: 0,
        bankName: 'First National Bank',
        memo: ',
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        rawText: 'Mock extracted text from check image',
        boundingBoxes: [
          {
            text: generateMockRoutingNumber(),
            x: 50,
            y: 300,
            width: 200,
            height: 30,
            confidence: 0.95
          },
          {
            text: generateMockAccountNumber(),
            x: 270,
            y: 300,
            width: 250,
            height: 30,
            confidence: 0.92
          }
        ]
      };

      setOcrResult(mockOcrResult);
      setAttempts(prev => prev + 1);

      // If confidence is too low, allow retry
      if (mockOcrResult.confidence < 0.8 && attempts < maxAttempts - 1) {
        setError('Low confidence (${Math.round(mockOcrResult.confidence * 100)}%). Please try again with better lighting.');
      }

    } catch (error) {
      console.error('Failed to process check image:', error);
      setError('Failed to process check image. Please try again.');
    } finally {
      setProcessing(false);
      setProcessingProgress(0);
    }
  };

  const generateMockRoutingNumber = () => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  };

  const generateMockAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const generateMockCheckNumber = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleAcceptResult = () => {
    if (ocrResult && capturedImage) {
      onCheckCaptured(ocrResult, capturedImage);
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setError(null);
    if (attempts >= maxAttempts) {
      setManualEntry(true);
    }
  };

  const handleManualSubmit = () => {
    if (!manualRoutingNumber || !manualAccountNumber || !manualCheckNumber) {
      setError('Please fill in all required fields');
      return;
    }

    const manualResult: CheckOCRResult = {
      routingNumber: manualRoutingNumber,
      accountNumber: manualAccountNumber,
      checkNumber: manualCheckNumber,
      amount: manualAmount,
      memo: manualMemo,
      confidence: 1.0, // Manual entry is 100% accurate
      rawText: 'Manual entry',
      boundingBoxes: []
    };

    onCheckCaptured(manualResult, capturedImage || ');
  };

  const switchCamera = () => {
    const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    setSelectedDeviceId(cameraDevices[nextIndex].deviceId);
    
    if (cameraActive) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Mobile Check Capture</CardTitle>
              <CardDescription>
                {manualEntry 
                  ? 'Enter check information manually'
                  : 'Position the check within the frame and capture`
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!manualEntry && !capturedImage && (
            <div className="space-y-4">
              {/* Camera View */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-80 object-cover"
                    />
                    {/* Check outline overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-blue-500 border-dashed rounded-lg w-4/5 h-2/3 flex items-center justify-center">
                        <div className="text-blue-400 text-center">
                          <ScanLine className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Position check here</p>
                        </div>
                      </div>
                    </div>
                    {/* Camera controls overlay */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                      <Button
                        onClick={captureImage}
                        disabled={capturing || processing}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Camera className="h-5 w-5" />
                      </Button>
                      {cameraDevices.length > 1 && (
                        <Button variant="outline" size="sm" onClick={switchCamera}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                      <p className="text-neutral-400 mb-4">Camera not active</p>
                      <Button onClick={startCamera}>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-neutral-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Capture Tips</h4>
                <ul className="space-y-1 text-sm text-neutral-300">
                  <li>• Ensure good lighting and avoid shadows</li>
                  <li>• Keep the check flat and aligned</li>
                  <li>• Make sure MICR line (bottom) is clearly visible</li>
                  <li>• Hold the device steady when capturing</li>
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  Attempt {attempts + 1} of {maxAttempts}
                </Badge>
                <Button variant="outline" onClick={() => setManualEntry(true)}>
                  Enter Manually
                </Button>
              </div>
            </div>
          )}

          {/* Processing */}
          {processing && (
            <div className="space-y-4">
              <div className="text-center">
                <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-medium text-white mb-2">Processing Check</h3>
                <p className="text-neutral-400">Extracting information using OCR...</p>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          )}

          {/* Captured Image and Results */}
          {capturedImage && !processing && ocrResult && (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Captured check" 
                  className="w-full rounded-lg border border-neutral-700"
                />
                {/* Overlay bounding boxes */}
                {ocrResult.boundingBoxes.map((box, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-green-500"
                    style={{
                      left: `${(box.x / 1920) * 100}%`,
                      top: `${(box.y / 1080) * 100}%`,
                      width: `${(box.width / 1920) * 100}%',
                      height: '${(box.height / 1080) * 100}%'
                    }}
                  />
                ))}
              </div>

              <div className="bg-neutral-800 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Extracted Information</h4>
                  <Badge variant={ocrResult.confidence >= 0.8 ? 'default' : 'secondary'}>
                    {Math.round(ocrResult.confidence * 100)}% confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-neutral-300">Routing Number</Label>
                    <Input
                      value={ocrResult.routingNumber}
                      readOnly
                      className="bg-neutral-700 border-neutral-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-300">Account Number</Label>
                    <Input
                      value={ocrResult.accountNumber}
                      readOnly
                      className="bg-neutral-700 border-neutral-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-300">Check Number</Label>
                    <Input
                      value={ocrResult.checkNumber}
                      readOnly
                      className="bg-neutral-700 border-neutral-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-300">Bank Name</Label>
                    <Input
                      value={ocrResult.bankName || 'Not detected'}
                      readOnly
                      className="bg-neutral-700 border-neutral-600 text-white"
                    />
                  </div>
                </div>

                {ocrResult.confidence >= 0.8 ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Information extracted successfully</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Low confidence - please verify information</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAcceptResult} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept & Continue
                </Button>
                <Button variant="outline" onClick={handleRetry}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Manual Entry */}
          {manualEntry && (
            <div className="space-y-4">
              <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-400 font-medium">Manual Entry Mode</span>
                </div>
                <p className="text-sm text-neutral-400 mt-2">
                  Please enter the check information manually
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="routingNumber" className="text-white">Routing Number *</Label>
                  <Input
                    id="routingNumber"
                    placeholder="123456789"
                    value={manualRoutingNumber}
                    onChange={(e) => setManualRoutingNumber(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber" className="text-white">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890"
                    value={manualAccountNumber}
                    onChange={(e) => setManualAccountNumber(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="checkNumber" className="text-white">Check Number *</Label>
                  <Input
                    id="checkNumber"
                    placeholder="1001"
                    value={manualCheckNumber}
                    onChange={(e) => setManualCheckNumber(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="text-white">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={manualAmount || '`}
                    onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="memo" className="text-white">Memo</Label>
                  <Input
                    id="memo"
                    placeholder="Payment memo"
                    value={manualMemo}
                    onChange={(e) => setManualMemo(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleManualSubmit} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Submit Information
                </Button>
                <Button variant="outline" onClick={() => setManualEntry(false)}>
                  Back to Camera
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-red-400 font-medium">Error</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">{error}</p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
}