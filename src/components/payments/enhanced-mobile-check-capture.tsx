'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Crop,
  Scan,
  Upload,
  Download,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Building2,
  Hash,
  FileText,
  X
} from 'lucide-react';

import { createCheckOCRProcessor, validateImageQuality, type CheckOCRResult } from '@/lib/ocr/check-processor';
import { useOfflinePayments } from '@/hooks/use-offline';

interface CaptureState {
  stage: 'camera' | 'preview' | 'processing' | 'results' | 'error';
  imageData: string | null;
  ocrResult: CheckOCRResult | null;
  error: string | null;
  processing: boolean;
}

interface CheckValidation {
  isValid: boolean;
  confidence: number;
  issues: string[];
  extractedData: {
    routingNumber: string;
    accountNumber: string;
    checkNumber: string;
    amount?: number;
    payee?: string;
    memo?: string;
    date?: string;
    bankName?: string;
  };
}

export default function EnhancedMobileCheckCapture() {
  const [captureState, setCaptureState] = useState<CaptureState>({
    stage: 'camera',
    imageData: null,
    ocrResult: null,
    error: null,
    processing: false
  });

  const [ocrProcessor] = useState(() => createCheckOCRProcessor({
    confidence: { minimum: 0.7, target: 0.9 },
    preprocessing: { denoise: true, sharpen: true, contrast: true, rotate: true }
  }));

  const [checkValidation, setCheckValidation] = useState<CheckValidation | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { processPayment, isOnline } = useOfflinePayments();

  // Initialize camera stream
  useEffect(() => {
    if (captureState.stage === 'camera') {
      initializeCamera();
    }

    return () => {
      cleanupCamera();
    };
  }, [captureState.stage]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment' // Back camera preferred
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (_error) {
      setCaptureState(prev => ({
        ...prev,
        error: 'Failed to access camera. Please ensure camera permissions are granted.',
        stage: 'error'
      }));
    }
  };

  const cleanupCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.95);

    setCaptureState(prev => ({
      ...prev,
      imageData,
      stage: 'preview'
    }));

    cleanupCamera();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCaptureState(prev => ({
        ...prev,
        imageData,
        stage: 'preview'
      }));
    };
    reader.readAsDataURL(file);
  };

  const processCheckImage = async () => {
    if (!captureState.imageData) return;

    setCaptureState(prev => ({ ...prev, processing: true, stage: 'processing' }));

    try {
      // Validate image quality first
      const qualityCheck = await validateImageQuality(captureState.imageData);
      setQualityScore(qualityCheck.score);

      if (!qualityCheck.valid) {
        throw new Error('Image quality issues: ${qualityCheck.issues.join(', ')}');
      }

      // Process with OCR
      const ocrResult = await ocrProcessor.processCheckImage(captureState.imageData);

      if (!ocrResult.success) {
        throw new Error('OCR processing failed: ${ocrResult.errors.join(', ')}');
      }

      // Validate extracted data
      const validation = validateExtractedCheckData(ocrResult);
      setCheckValidation(validation);

      setCaptureState(prev => ({
        ...prev,
        ocrResult,
        processing: false,
        stage: 'results'
      }));
    } catch (error) {
      setCaptureState(prev => ({
        ...prev,
        processing: false,
        error: error instanceof Error ? error.message : 'Processing failed',
        stage: 'error'
      }));
    }
  };

  const validateExtractedCheckData = (ocrResult: CheckOCRResult): CheckValidation => {
    const { extractedData, validationResults, confidence } = ocrResult;
    const issues: string[] = [];

    // Check required fields
    if (!extractedData.routingNumber) issues.push('Routing number not detected');
    if (!extractedData.accountNumber) issues.push('Account number not detected');
    if (!extractedData.checkNumber) issues.push('Check number not detected');

    // Check validation results
    if (!validationResults.routingNumberValid) issues.push('Invalid routing number');
    if (!validationResults.accountNumberValid) issues.push('Invalid account number');
    if (!validationResults.checkNumberValid) issues.push('Invalid check number');
    if (!validationResults.micrLineDetected) issues.push('MICR line not clearly detected');

    // Check confidence levels
    if (confidence < 0.8) issues.push('Low confidence in OCR results');

    return {
      isValid: issues.length === 0 && confidence >= 0.7,
      confidence,
      issues,
      extractedData
    };
  };

  const processCheckPayment = async () => {
    if (!checkValidation?.isValid || !checkValidation.extractedData.amount) return;

    try {
      const result = await processPayment({
        amount: Math.round(checkValidation.extractedData.amount * 100),
        currency: 'USD',
        paymentMethod: 'check',
        organizationId: 'org_test',
        metadata: {
          check_number: checkValidation.extractedData.checkNumber,
          routing_number: checkValidation.extractedData.routingNumber,
          account_number: checkValidation.extractedData.accountNumber,
          payee: checkValidation.extractedData.payee,
          memo: checkValidation.extractedData.memo,
          bank_name: checkValidation.extractedData.bankName,
          ocr_confidence: checkValidation.confidence,
          processing_method: 'mobile_capture'
        }
      });

      // Show success message
      setCaptureState(prev => ({
        ...prev,
        stage: 'results'
      }));
    } catch (error) {
      setCaptureState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        stage: 'error'
      }));
    }
  };

  const retryCapture = () => {
    setCaptureState({
      stage: 'camera',
      imageData: null,
      ocrResult: null,
      error: null,
      processing: false
    });
    setCheckValidation(null);
    setQualityScore(0);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    return '****' + accountNumber.slice(-4);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mobile Check Capture</h1>
          <p className="text-neutral-400">Capture and process checks with OCR technology</p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Offline Mode
            </Badge>
          )}
          {qualityScore > 0 && (
            <Badge variant={qualityScore >= 0.7 ? "default" : "secondary"}>
              Quality: {Math.round(qualityScore * 100)}%
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Check Processing</CardTitle>
              <CardDescription>
                {captureState.stage === 'camera' && 'Position the check within the frame'}
                {captureState.stage === 'preview' && 'Review captured image before processing'}
                {captureState.stage === 'processing' && 'Extracting check data with OCR...'}
                {captureState.stage === 'results' && 'Check data extracted successfully'}
                {captureState.stage === 'error' && 'An error occurred during processing'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={retryCapture}
              disabled={captureState.processing}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Capture
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Camera Stage */}
          {captureState.stage === 'camera' && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-2xl mx-auto rounded-lg bg-neutral-800"
                  style={{ aspectRatio: '16/9' }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Capture Overlay */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-80 h-40 border-2 border-dashed border-white rounded-lg flex items-center justify-center">
                      <p className="text-white text-sm">Position check here</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={capturePhoto} size="lg">
                  <Camera className="h-5 w-5 mr-2" />
                  Capture Check
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Image
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Preview Stage */}
          {captureState.stage === 'preview' && captureState.imageData && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={captureState.imageData}
                  alt="Captured check"
                  className="w-full max-w-2xl mx-auto rounded-lg border border-neutral-700"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-neutral-400">Review the captured image. Ensure the check is clearly visible and well-lit.</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={processCheckImage} size="lg">
                    <Scan className="h-5 w-5 mr-2" />
                    Process Check
                  </Button>
                  <Button variant="outline" onClick={retryCapture}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Processing Stage */}
          {captureState.stage === 'processing' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 text-blue-500 mx-auto animate-spin" />
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Processing Check</h3>
                <p className="text-neutral-400">
                  Using advanced OCR to extract check information...
                </p>
              </div>
              <Progress value={75} className="w-full max-w-md mx-auto" />
            </div>
          )}

          {/* Results Stage */}
          {captureState.stage === 'results' && checkValidation && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={'p-4 rounded-lg border ${
                checkValidation.isValid 
                  ? 'bg-green-900/20 border-green-500/20' 
                  : 'bg-yellow-900/20 border-yellow-500/20'
              }'}>
                <div className="flex items-center gap-2">
                  {checkValidation.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className={'font-medium ${
                    checkValidation.isValid ? 'text-green-400' : 'text-yellow-400'
                  }'}>
                    {checkValidation.isValid ? 'Check Data Validated' : 'Validation Issues Found'}
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    Confidence: {Math.round(checkValidation.confidence * 100)}%
                  </Badge>
                </div>
                
                {checkValidation.issues.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-neutral-400">Issues:</p>
                    <ul className="text-sm text-neutral-400 mt-1">
                      {checkValidation.issues.map((issue, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Extracted Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Bank Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Routing Number:</span>
                      <span className="text-white font-mono">
                        {checkValidation.extractedData.routingNumber || 'Not detected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono">
                          {showSensitiveData 
                            ? checkValidation.extractedData.accountNumber 
                            : maskAccountNumber(checkValidation.extractedData.accountNumber)
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSensitiveData(!showSensitiveData)}
                        >
                          {showSensitiveData ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    {checkValidation.extractedData.bankName && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Bank Name:</span>
                        <span className="text-white">{checkValidation.extractedData.bankName}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Check Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Check Number:</span>
                      <span className="text-white font-mono">
                        {checkValidation.extractedData.checkNumber || 'Not detected'}
                      </span>
                    </div>
                    {checkValidation.extractedData.amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Amount:</span>
                        <span className="text-green-400 font-medium">
                          {formatCurrency(checkValidation.extractedData.amount)}
                        </span>
                      </div>
                    )}
                    {checkValidation.extractedData.date && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Date:</span>
                        <span className="text-white">{checkValidation.extractedData.date}</span>
                      </div>
                    )}
                    {checkValidation.extractedData.payee && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Payee:</span>
                        <span className="text-white">{checkValidation.extractedData.payee}</span>
                      </div>
                    )}
                    {checkValidation.extractedData.memo && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Memo:</span>
                        <span className="text-white">{checkValidation.extractedData.memo}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {checkValidation.isValid && checkValidation.extractedData.amount && (
                  <Button onClick={processCheckPayment} className="flex-1" size="lg">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Process Payment - {formatCurrency(checkValidation.extractedData.amount)}
                  </Button>
                )}
                <Button variant="outline" onClick={retryCapture}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Another
                </Button>
              </div>
            </div>
          )}

          {/* Error Stage */}
          {captureState.stage === 'error' && (
            <div className="text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Processing Error</h3>
                <p className="text-neutral-400">{captureState.error}</p>
              </div>
              <Button onClick={retryCapture} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Information */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Check Processing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-white font-medium">Secure Processing</p>
                <p className="text-neutral-400">Bank-grade encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-white font-medium">Processing Time</p>
                <p className="text-neutral-400">1-2 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Scan className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-white font-medium">OCR Technology</p>
                <p className="text-neutral-400">Advanced text recognition</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}