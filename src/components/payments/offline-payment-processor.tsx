'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Camera, 
  Check, 
  Nfc,
  Wallet,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Loader2,
  WifiOff,
  Bitcoin,
  Banknote
} from 'lucide-react';
import { useOfflinePayments, useOffline } from '@/hooks/use-offline';
import { MobileCheckCapture, SignatureCapture } from '@/lib/offline-utils';

interface PaymentData {
  amount: number;
  currency: string;
  paymentMethod: string;
  customerId?: string;
  organizationId: string;
  metadata?: Record<string, unknown>;
}

interface CheckData {
  routingNumber: string;
  accountNumber: string;
  checkNumber: string;
  amount: number;
  bankName?: string;
  memo?: string;
}

export default function OfflinePaymentProcessor() {
  const [activeTab, setActiveTab] = useState('card');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [customerId, setCustomerId] = useState(');
  const [processing, setProcessing] = useState(false);
  const [checkData, setCheckData] = useState<CheckData | null>(null);
  const [capturedSignature, setCapturedSignature] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<unknown>(null);

  // Card payment state
  const [cardNumber, setCardNumber] = useState(');
  const [expiryDate, setExpiryDate] = useState(');
  const [cvv, setCvv] = useState(');
  const [cardholderName, setCardholderName] = useState(');

  // Cash payment state
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [cashTotal, setCashTotal] = useState<number>(0);

  // Check capture state
  const [showCheckCapture, setShowCheckCapture] = useState(false);
  const [checkImage, setCheckImage] = useState<string | null>(null);

  // Crypto payment state
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [walletAddress, setWalletAddress] = useState(');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  const { processPayment, loading, error } = useOfflinePayments();
  const { isOnline } = useOffline();

  const handleCardPayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName || amount <= 0) {
      return;
    }

    setProcessing(true);
    try {
      const paymentData: PaymentData = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        paymentMethod: 'card',
        customerId: customerId || undefined,
        organizationId: 'org_12345',
        metadata: {
          cardLast4: cardNumber.slice(-4),
          cardholderName,
          expiryDate,
          paymentType: 'card_present',
          offline: !isOnline,
          capturedAt: new Date().toISOString()
        }
      };

      const result = await processPayment(paymentData);
      setPaymentResult(result);
      
      // Clear form
      setCardNumber(');
      setExpiryDate(');
      setCvv(');
      setCardholderName(');
      setAmount(0);
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    if (amount <= 0 || amountTendered < amount) {
      return;
    }

    setProcessing(true);
    try {
      const change = amountTendered - amount;
      
      const paymentData: PaymentData = {
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        paymentMethod: 'cash',
        customerId: customerId || undefined,
        organizationId: 'org_12345',
        metadata: {
          amountTendered: Math.round(amountTendered * 100),
          change: Math.round(change * 100),
          paymentType: 'cash',
          offline: !isOnline,
          capturedAt: new Date().toISOString()
        }
      };

      const result = await processPayment(paymentData);
      setPaymentResult(result);
      
      // Clear form
      setAmount(0);
      setAmountTendered(0);
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!checkData || amount <= 0 || !capturedSignature) {
      return;
    }

    setProcessing(true);
    try {
      const paymentData: PaymentData = {
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        paymentMethod: 'check',
        customerId: customerId || undefined,
        organizationId: 'org_12345',
        metadata: {
          ...checkData,
          checkImage,
          signature: capturedSignature,
          paymentType: 'check',
          offline: !isOnline,
          capturedAt: new Date().toISOString()
        }
      };

      const result = await processPayment(paymentData);
      setPaymentResult(result);
      
      // Clear form
      setAmount(0);
      setCheckData(null);
      setCheckImage(null);
      setCapturedSignature(null);
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCryptoPayment = async () => {
    if (!walletAddress || amount <= 0) {
      return;
    }

    setProcessing(true);
    try {
      const paymentData: PaymentData = {
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        paymentMethod: 'crypto',
        customerId: customerId || undefined,
        organizationId: 'org_12345',
        metadata: {
          cryptoCurrency,
          walletAddress,
          paymentType: 'crypto',
          offline: !isOnline,
          capturedAt: new Date().toISOString()
        }
      };

      const result = await processPayment(paymentData);
      setPaymentResult(result);
      
      // Clear form
      setAmount(0);
      setWalletAddress(');
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const startCheckCapture = async () => {
    try {
      const checkCapture = new MobileCheckCapture();
      const stream = await checkCapture.startCamera();
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCheckCapture(true);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  const captureCheck = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const checkCapture = new MobileCheckCapture();
    const result = await checkCapture.captureCheck(videoRef.current);
    
    setCheckImage(result.image);
    setCheckData(result.processedData);
    setShowCheckCapture(false);
    
    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      checkCapture.stopCamera(stream);
    }
  };

  const initSignatureCapture = useCallback(() => {
    if (signatureCanvasRef.current) {
      const signatureCapture = new SignatureCapture(signatureCanvasRef.current);
      return signatureCapture;
    }
    return null;
  }, []);

  const captureSignature = () => {
    const signatureCapture = initSignatureCapture();
    if (signatureCapture) {
      const signatureData = signatureCapture.getSignatureData();
      setCapturedSignature(signatureData);
    }
  };

  const clearSignature = () => {
    const signatureCapture = initSignatureCapture();
    if (signatureCapture) {
      signatureCapture.clear();
      setCapturedSignature(null);
    }
  };

  const calculateChange = () => {
    return amountTendered > amount ? amountTendered - amount : 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Processing</h1>
          <p className="text-neutral-400">Accept payments offline and online</p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline Mode
            </Badge>
          )}
          <Badge variant="outline">
            Total: {formatCurrency(amount)}
          </Badge>
        </div>
      </div>

      {/* Payment Result */}
      {paymentResult && (
        <Card className="bg-green-900/20 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400 font-medium">
                Payment {paymentResult.offline ? 'Stored Offline' : 'Processed Successfully'}
              </span>
            </div>
            {paymentResult.offline && (
              <p className="text-sm text-neutral-400 mt-2">
                Payment will be processed when connection is restored
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-400 font-medium">Payment Failed</span>
            </div>
            <p className="text-sm text-neutral-400 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Amount and Customer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="amount" className="text-white">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>
        <div>
          <Label htmlFor="currency" className="text-white">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="customer" className="text-white">Customer ID (Optional)</Label>
          <Input
            id="customer"
            placeholder="Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>
      </div>

      {/* Payment Methods */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Payment Methods</CardTitle>
          <CardDescription>Choose your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card
              </TabsTrigger>
              <TabsTrigger value="cash" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Cash
              </TabsTrigger>
              <TabsTrigger value="check" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Check
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
            </TabsList>

            {/* Card Payment */}
            <TabsContent value="card" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cardholderName" className="text-white">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate" className="text-white">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-white">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCardPayment}
                disabled={processing || loading || amount <= 0}
                className="w-full"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Process Card Payment
              </Button>
            </TabsContent>

            {/* Cash Payment */}
            <TabsContent value="cash" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amountTendered" className="text-white">Amount Tendered</Label>
                  <Input
                    id="amountTendered"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountTendered || ''}
                    onChange={(e) => setAmountTendered(parseFloat(e.target.value) || 0)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Change Due</Label>
                  <div className="h-10 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md flex items-center">
                    <span className="text-green-400 font-medium">
                      {formatCurrency(calculateChange())}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleCashPayment}
                disabled={processing || loading || amount <= 0 || amountTendered < amount}
                className="w-full"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-2" />
                )}
                Process Cash Payment
              </Button>
            </TabsContent>

            {/* Check Payment */}
            <TabsContent value="check" className="space-y-4">
              {!showCheckCapture && !checkData && (
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Capture Check</h3>
                  <p className="text-neutral-400 mb-4">
                    Use your device camera to capture check information
                  </p>
                  <Button onClick={startCheckCapture}>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Check Capture
                  </Button>
                </div>
              )}

              {showCheckCapture && (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-blue-500 border-dashed m-8 rounded-lg pointer-events-none" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={captureCheck} className="flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      Capture Check
                    </Button>
                    <Button variant="outline" onClick={() => setShowCheckCapture(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {checkData && (
                <div className="space-y-4">
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Check Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-neutral-400">Routing Number:</span>
                        <span className="text-white ml-2">{checkData.routingNumber}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Account Number:</span>
                        <span className="text-white ml-2">{checkData.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Check Number:</span>
                        <span className="text-white ml-2">{checkData.checkNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signature Capture */}
                  <div>
                    <Label className="text-white">Customer Signature</Label>
                    <div className="bg-white rounded-lg p-2 mt-2">
                      <canvas
                        ref={signatureCanvasRef}
                        width={400}
                        height={150}
                        className="border border-neutral-300 rounded cursor-crosshair w-full"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={captureSignature}>
                        Save Signature
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSignature}>
                        Clear
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckPayment}
                    disabled={processing || loading || amount <= 0 || !capturedSignature}
                    className="w-full"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Process Check Payment
                  </Button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </TabsContent>

            {/* Mobile Payment */}
            <TabsContent value="mobile" className="space-y-4">
              <div className="text-center py-8">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-neutral-800 border-neutral-700 p-4">
                    <Nfc className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-medium text-white">NFC/Tap to Pay</h3>
                    <p className="text-sm text-neutral-400">Contactless payment</p>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700 p-4">
                    <QrCode className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="font-medium text-white">QR Code</h3>
                    <p className="text-sm text-neutral-400">Scan to pay</p>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700 p-4">
                    <Wallet className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-medium text-white">Digital Wallet</h3>
                    <p className="text-sm text-neutral-400">Apple Pay, Google Pay</p>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700 p-4">
                    <Smartphone className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                    <h3 className="font-medium text-white">Mobile App</h3>
                    <p className="text-sm text-neutral-400">Customer app payment</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Crypto Payment */}
            <TabsContent value="crypto" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cryptoCurrency" className="text-white">Cryptocurrency</Label>
                  <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="walletAddress" className="text-white">Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCryptoPayment}
                disabled={processing || loading || amount <= 0 || !walletAddress}
                className="w-full"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bitcoin className="h-4 w-4 mr-2" />
                )}
                Process Crypto Payment
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}