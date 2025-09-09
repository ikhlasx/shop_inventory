import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, Palette, Type, ShoppingCart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import ColorDetector from '../components/ColorDetector';
import OCRScanner from '../components/OCRScanner';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import config from '../config';

const BACKEND_URL = config.BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ScanPage = () => {
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('barcode'); // 'barcode', 'color', 'ocr'
  const [cameraPermission, setCameraPermission] = useState(null);
  
  const scannerRef = useRef(null);
  const html5QrcodeScanner = useRef(null);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
    return () => {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.clear();
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
    } catch (error) {
      setCameraPermission(false);
      console.error('Camera permission denied:', error);
    }
  };

  const startBarcodeScanner = () => {
    if (!cameraPermission) {
      toast.error('Camera permission required for scanning');
      return;
    }

    setScannerActive(true);
    setScanResult(null);
    setProduct(null);

    const config = {
      fps: 10,
      qrbox: { width: 300, height: 200 },
      aspectRatio: 1.0,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };

    html5QrcodeScanner.current = new Html5QrcodeScanner("qr-reader", config, false);
    
    html5QrcodeScanner.current.render(
      (decodedText, decodedResult) => {
        handleScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Silent error handling for continuous scanning
      }
    );
  };

  const handleScanSuccess = async (decodedText) => {
    if (html5QrcodeScanner.current) {
      html5QrcodeScanner.current.clear();
    }
    setScannerActive(false);
    setScanResult(decodedText);
    
    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Audio feedback
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Tyv2seDUKMzd6/2/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Tyv2seDUKMzd6/2/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Tyv2seDUKMzd6/');
      audio.play();
    } catch (e) {
      // Silent fail for audio
    }
    
    // Look up product
    await lookupProduct(decodedText);
  };

  const lookupProduct = async (code) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products/${code}`);
      setProduct(response.data);
      toast.success('Product found!');
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Product not found. Would you like to add it?', {
          action: {
            label: 'Add Product',
            onClick: () => {
              window.location.href = `/products/add?code=${code}`;
            }
          }
        });
      } else {
        toast.error('Error looking up product');
      }
    } finally {
      setLoading(false);
    }
  };

  const recordSale = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      await axios.post(`${API}/sales`, {
        productCode: product.code,
        quantity: 1
      });
      toast.success('Sale recorded successfully!');
      setProduct(null);
      setScanResult(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error recording sale');
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = () => {
    if (html5QrcodeScanner.current) {
      html5QrcodeScanner.current.clear();
    }
    setScannerActive(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Scan Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Select Scan Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={scanMode === 'barcode' ? 'default' : 'outline'}
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setScanMode('barcode')}
            >
              <Square className="w-6 h-6 mb-2" />
              <span className="text-xs">Barcode</span>
            </Button>
            <Button
              variant={scanMode === 'color' ? 'default' : 'outline'}
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setScanMode('color')}
            >
              <Palette className="w-6 h-6 mb-2" />
              <span className="text-xs">Color</span>
            </Button>
            <Button
              variant={scanMode === 'ocr' ? 'default' : 'outline'}
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setScanMode('ocr')}
            >
              <Type className="w-6 h-6 mb-2" />
              <span className="text-xs">Text OCR</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera Permission Alert */}
      {cameraPermission === false && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Camera access is required for scanning. Please enable camera permissions and refresh the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Barcode Scanner */}
      {scanMode === 'barcode' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="w-5 h-5" />
              Barcode Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!scannerActive && (
              <Button 
                onClick={startBarcodeScanner}
                className="w-full"
                disabled={!cameraPermission}
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            )}
            
            {scannerActive && (
              <div className="space-y-4">
                <div id="qr-reader" className="w-full"></div>
                <Button onClick={stopScanner} variant="outline" className="w-full">
                  Stop Scanning
                </Button>
              </div>
            )}
            
            {scanResult && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900">Scanned Code:</p>
                <Badge variant="secondary" className="mt-1">{scanResult}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Color Detector */}
      {scanMode === 'color' && <ColorDetector />}

      {/* OCR Scanner */}
      {scanMode === 'ocr' && <OCRScanner onResult={handleScanSuccess} />}

      {/* Product Card */}
      {product && (
        <ProductCard 
          product={product} 
          onRecordSale={recordSale}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ScanPage;