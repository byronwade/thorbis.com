// Advanced OCR processing for mobile check capture
// Implements image preprocessing, text detection, and MICR line parsing

interface OCRConfig {
  confidence: {
    minimum: number;
    target: number;
  };
  preprocessing: {
    denoise: boolean;
    sharpen: boolean;
    contrast: boolean;
    rotate: boolean;
  };
  micr: {
    patterns: Record<string, RegExp>;
    positions: Record<string, { x: number; y: number; width: number; height: number }>;
  };
  validation: {
    routingNumber: boolean;
    accountNumber: boolean;
    checkNumber: boolean;
  };
}

interface ImageProcessingResult {
  originalImage: string;
  processedImage: string;
  transformations: string[];
  quality: number;
  resolution: { width: number; height: number };
}

interface TextRegion {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'micr' | 'account_number' | 'routing_number' | 'check_number' | 'amount' | 'memo' | 'date' | 'payee';
}

interface CheckOCRResult {
  success: boolean;
  confidence: number;
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
  textRegions: TextRegion[];
  imageProcessing: ImageProcessingResult;
  validationResults: {
    routingNumberValid: boolean;
    accountNumberValid: boolean;
    checkNumberValid: boolean;
    micrLineDetected: boolean;
  };
  errors: string[];
  processingTime: number;
}

export class CheckOCRProcessor {
  private config: OCRConfig;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(config: Partial<OCRConfig> = {}) {
    this.config = {
      confidence: {
        minimum: 0.6,
        target: 0.85,
        ...config.confidence
      },
      preprocessing: {
        denoise: true,
        sharpen: true,
        contrast: true,
        rotate: true,
        ...config.preprocessing
      },
      micr: {
        patterns: {
          routingNumber: /\b\d{9}\b/,
          accountNumber: /\b\d{4,17}\b/,
          checkNumber: /\b\d{3,6}\b/,
          amount: /\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/,
          date: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/
        },
        positions: {
          micrLine: { x: 0, y: 0.8, width: 1, height: 0.2 },
          checkNumber: { x: 0.7, y: 0, width: 0.3, height: 0.3 },
          amount: { x: 0.6, y: 0.3, width: 0.4, height: 0.3 },
          payee: { x: 0, y: 0.3, width: 0.6, height: 0.2 },
          memo: { x: 0, y: 0.6, width: 0.5, height: 0.15 },
          date: { x: 0.6, y: 0, width: 0.4, height: 0.2 }
        },
        ...config.micr
      },
      validation: {
        routingNumber: true,
        accountNumber: true,
        checkNumber: true,
        ...config.validation
      }
    };

    // Initialize canvas for image processing
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
  }

  // Main OCR processing function
  async processCheckImage(imageData: string): Promise<CheckOCRResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Step 1: Load and preprocess image
      const imageProcessing = await this.preprocessImage(imageData);
      
      // Step 2: Detect text regions
      const textRegions = await this.detectTextRegions(imageProcessing.processedImage);
      
      // Step 3: Extract MICR line data
      const micrData = await this.extractMICRData(textRegions, imageProcessing);
      
      // Step 4: Extract other check data
      const checkData = await this.extractCheckData(textRegions);
      
      // Step 5: Validate extracted data
      const validationResults = this.validateExtractedData({
        ...micrData,
        ...checkData
      });

      // Step 6: Calculate overall confidence
      const confidence = this.calculateOverallConfidence(textRegions, validationResults);

      const result: CheckOCRResult = {
        success: confidence >= this.config.confidence.minimum,
        confidence,
        extractedData: {
          ...micrData,
          ...checkData
        },
        textRegions,
        imageProcessing,
        validationResults,
        errors,
        processingTime: Date.now() - startTime
      };

      return result;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown processing error');
      
      return {
        success: false,
        confidence: 0,
        extractedData: {
          routingNumber: ',
          accountNumber: ',
          checkNumber: '
        },
        textRegions: [],
        imageProcessing: {
          originalImage: imageData,
          processedImage: imageData,
          transformations: [],
          quality: 0,
          resolution: { width: 0, height: 0 }
        },
        validationResults: {
          routingNumberValid: false,
          accountNumberValid: false,
          checkNumberValid: false,
          micrLineDetected: false
        },
        errors,
        processingTime: Date.now() - startTime
      };
    }
  }

  // Preprocess image for better OCR accuracy
  private async preprocessImage(imageData: string): Promise<ImageProcessingResult> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const transformations: string[] = [];
        
        // Set canvas size
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        // Draw original image
        this.context.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        // 1. Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          data[i] = data[i + 1] = data[i + 2] = gray;
        }
        transformations.push('grayscale');

        // 2. Enhance contrast
        if (this.config.preprocessing.contrast) {
          const factor = 2.0; // Contrast enhancement factor
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
            data[i + 1] = data[i];
            data[i + 2] = data[i];
          }
          transformations.push('contrast_enhancement');
        }

        // 3. Denoise (simple median filter simulation)
        if (this.config.preprocessing.denoise) {
          const denoised = this.applyMedianFilter(data, this.canvas.width, this.canvas.height);
          for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = denoised[i / 4];
          }
          transformations.push('denoise');
        }

        // 4. Sharpen
        if (this.config.preprocessing.sharpen) {
          this.applySharpenFilter(data, this.canvas.width, this.canvas.height);
          transformations.push('sharpen');
        }

        // 5. Binarization (convert to pure black and white)
        const threshold = 128;
        for (let i = 0; i < data.length; i += 4) {
          const binary = data[i] > threshold ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = binary;
        }
        transformations.push('binarization');

        // Apply processed image data back to canvas
        this.context.putImageData(imageData, 0, 0);
        
        // Calculate quality score (based on text clarity indicators)
        const quality = this.calculateImageQuality(data, this.canvas.width, this.canvas.height);

        resolve({
          originalImage: img.src,
          processedImage: this.canvas.toDataURL(),
          transformations,
          quality,
          resolution: { width: img.width, height: img.height }
        });
      };
      
      img.src = imageData;
    });
  }

  // Detect text regions using pattern matching and contour detection
  private async detectTextRegions(processedImage: string): Promise<TextRegion[]> {
    // In a real implementation, this would use Tesseract.js or similar OCR library
    // For simulation, we'll generate mock text regions based on typical check layout
    
    const regions: TextRegion[] = [];
    
    // Simulate MICR line detection (bottom area of check)
    regions.push({
      text: this.generateMockMICRLine(),
      confidence: 0.92,
      boundingBox: { x: 50, y: 400, width: 500, height: 30 },
      type: 'micr'
    });

    // Simulate check number detection (top right)
    regions.push({
      text: this.generateMockCheckNumber(),
      confidence: 0.88,
      boundingBox: { x: 450, y: 20, width: 100, height: 25 },
      type: 'check_number'
    });

    // Simulate amount detection
    regions.push({
      text: '$' + (Math.random() * 1000 + 10).toFixed(2),
      confidence: 0.85,
      boundingBox: { x: 400, y: 150, width: 120, height: 25 },
      type: 'amount'
    });

    // Simulate payee detection
    regions.push({
      text: 'SAMPLE PAYEE NAME',
      confidence: 0.75,
      boundingBox: { x: 80, y: 120, width: 300, height: 25 },
      type: 'payee'
    });

    // Simulate date detection
    regions.push({
      text: new Date().toLocaleDateString('en-US'),
      confidence: 0.80,
      boundingBox: { x: 400, y: 50, width: 100, height: 20 },
      type: 'date'
    });

    // Simulate memo line detection
    regions.push({
      text: 'Sample memo',
      confidence: 0.70,
      boundingBox: { x: 80, y: 250, width: 200, height: 20 },
      type: 'memo'
    });

    return regions;
  }

  // Extract MICR (Magnetic Ink Character Recognition) line data
  private async extractMICRData(textRegions: TextRegion[], imageProcessing: ImageProcessingResult): Promise<{
    routingNumber: string;
    accountNumber: string;
    checkNumber: string;
  }> {
    const micrRegion = textRegions.find(region => region.type === 'micr');
    
    if (!micrRegion) {
      return {
        routingNumber: ',
        accountNumber: ',
        checkNumber: '
      };
    }

    // Parse MICR line format: :routing_number: :account_number: check_number:
    const micrText = micrRegion.text.replace(/[^\w\s-]/g, ''); // Remove non-digits
    
    // Extract routing number (first 9 digits)
    const routingNumber = micrText.substring(0, 9);
    
    // Extract account number (next 4-17 digits)
    const accountNumber = micrText.substring(9, 9 + Math.min(17, micrText.length - 9 - 4));
    
    // Extract check number (last 3-6 digits)
    const checkNumber = micrText.substring(micrText.length - 4);

    return {
      routingNumber,
      accountNumber,
      checkNumber
    };
  }

  // Extract other check data (amount, payee, etc.)
  private async extractCheckData(textRegions: TextRegion[]): Promise<{
    amount?: number;
    payee?: string;
    memo?: string;
    date?: string;
    bankName?: string;
  }> {
    const result: unknown = {};

    // Extract amount
    const amountRegion = textRegions.find(region => region.type === 'amount');
    if (amountRegion) {
      const amountMatch = amountRegion.text.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      if (amountMatch) {
        result.amount = parseFloat(amountMatch[1].replace(/[^\w\s-]/g, ''));
      }
    }

    // Extract payee
    const payeeRegion = textRegions.find(region => region.type === 'payee');
    if (payeeRegion && payeeRegion.confidence > 0.7) {
      result.payee = payeeRegion.text.trim();
    }

    // Extract memo
    const memoRegion = textRegions.find(region => region.type === 'memo');
    if (memoRegion && memoRegion.confidence > 0.6) {
      result.memo = memoRegion.text.trim();
    }

    // Extract date
    const dateRegion = textRegions.find(region => region.type === 'date');
    if (dateRegion && dateRegion.confidence > 0.7) {
      result.date = dateRegion.text.trim();
    }

    return result;
  }

  // Validate extracted data
  private validateExtractedData(data: unknown): {
    routingNumberValid: boolean;
    accountNumberValid: boolean;
    checkNumberValid: boolean;
    micrLineDetected: boolean;
  } {
    return {
      routingNumberValid: this.validateRoutingNumber(data.routingNumber),
      accountNumberValid: this.validateAccountNumber(data.accountNumber),
      checkNumberValid: this.validateCheckNumber(data.checkNumber),
      micrLineDetected: !!(data.routingNumber && data.accountNumber && data.checkNumber)
    };
  }

  // Validate routing number using ABA checksum
  private validateRoutingNumber(routingNumber: string): boolean {
    if (!routingNumber || routingNumber.length !== 9) {
      return false;
    }

    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += parseInt(routingNumber.charAt(i)) * weights[i];
    }

    return sum % 10 === 0;
  }

  // Validate account number
  private validateAccountNumber(accountNumber: string): boolean {
    return accountNumber && accountNumber.length >= 4 && accountNumber.length <= 17;
  }

  // Validate check number
  private validateCheckNumber(checkNumber: string): boolean {
    return checkNumber && checkNumber.length >= 3 && checkNumber.length <= 6;
  }

  // Calculate overall confidence score
  private calculateOverallConfidence(textRegions: TextRegion[], validationResults: unknown): number {
    const totalConfidence = 0;
    const weightedSum = 0;

    // Weight different regions by importance
    const weights = {
      micr: 0.4,
      routing_number: 0.2,
      account_number: 0.2,
      check_number: 0.1,
      amount: 0.05,
      payee: 0.03,
      date: 0.02
    };

    for (const region of textRegions) {
      const weight = weights[region.type as keyof typeof weights] || 0.01;
      totalConfidence += region.confidence * weight;
      weightedSum += weight;
    }

    // Boost confidence if validation passes
    const validationBonus = 0;
    if (validationResults.routingNumberValid) validationBonus += 0.1;
    if (validationResults.accountNumberValid) validationBonus += 0.05;
    if (validationResults.checkNumberValid) validationBonus += 0.05;
    if (validationResults.micrLineDetected) validationBonus += 0.1;

    const baseConfidence = weightedSum > 0 ? totalConfidence / weightedSum : 0;
    return Math.min(1.0, baseConfidence + validationBonus);
  }

  // Apply median filter for denoising
  private applyMedianFilter(data: Uint8ClampedArray, width: number, height: number): number[] {
    const result = new Array(width * height);
    const kernel = 3; // 3x3 kernel
    const offset = Math.floor(kernel / 2);

    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        const neighbors: number[] = [];
        
        for (let ky = -offset; ky <= offset; ky++) {
          for (let kx = -offset; kx <= offset; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            neighbors.push(data[idx]);
          }
        }
        
        neighbors.sort((a, b) => a - b);
        result[y * width + x] = neighbors[Math.floor(neighbors.length / 2)];
      }
    }

    return result;
  }

  // Apply sharpening filter
  private applySharpenFilter(data: Uint8ClampedArray, width: number, height: number): void {
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];

    const original = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            sum += original[idx] * kernel[ky + 1][kx + 1];
          }
        }
        
        const idx = (y * width + x) * 4;
        const value = Math.min(255, Math.max(0, sum));
        data[idx] = data[idx + 1] = data[idx + 2] = value;
      }
    }
  }

  // Calculate image quality score
  private calculateImageQuality(data: Uint8ClampedArray, width: number, height: number): number {
    const edgeCount = 0;
    const totalPixels = 0;

    // Simple edge detection for quality assessment
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const current = data[(y * width + x) * 4];
        const right = data[(y * width + x + 1) * 4];
        const bottom = data[((y + 1) * width + x) * 4];
        
        const edgeStrength = Math.abs(current - right) + Math.abs(current - bottom);
        if (edgeStrength > 50) { // Threshold for edge detection
          edgeCount++;
        }
        totalPixels++;
      }
    }

    // Quality is based on edge density (more edges = better text clarity)
    return Math.min(1.0, (edgeCount / totalPixels) * 10);
  }

  // Generate mock MICR line for simulation
  private generateMockMICRLine(): string {
    const routing = Math.floor(100000000 + Math.random() * 900000000).toString();
    const account = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const check = Math.floor(1000 + Math.random() * 9000).toString();
    return ':${routing}: :${account}: ${check}:';
  }

  // Generate mock check number
  private generateMockCheckNumber(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}

// Factory function for creating OCR processor
export function createCheckOCRProcessor(config?: Partial<OCRConfig>): CheckOCRProcessor {
  return new CheckOCRProcessor(config);
}

// Utility function to validate check image quality before processing
export function validateImageQuality(imageData: string): Promise<{
  valid: boolean;
  score: number;
  issues: string[];
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const issues: string[] = [];
      const score = 1.0;

      // Check resolution
      if (img.width < 800 || img.height < 400) {
        issues.push('Image resolution too low');
        score -= 0.3;
      }

      // Check aspect ratio (checks are typically ~2.5:1)
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 2.0 || aspectRatio > 3.0) {
        issues.push('Unusual aspect ratio - ensure full check is visible');
        score -= 0.2;
      }

      resolve({
        valid: score >= 0.5,
        score: Math.max(0, score),
        issues
      });
    };

    img.onerror = () => {
      resolve({
        valid: false,
        score: 0,
        issues: ['Invalid image format']
      });
    };

    img.src = imageData;
  });
}