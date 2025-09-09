import React, { useState, useRef, useEffect } from 'react';
import { Camera, Type, Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import Tesseract from 'tesseract.js';

const OCRScanner = ({ onResult }) => {
  const [isActive, setIsActive] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (error) {
      toast.error('Unable to access camera');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  const captureAndOCR = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Define ROI (Region of Interest) - center area where text is expected
    const roiWidth = canvas.width * 0.8;
    const roiHeight = canvas.height * 0.3;
    const roiX = (canvas.width - roiWidth) / 2;
    const roiY = (canvas.height - roiHeight) / 2;

    // Extract ROI
    const roiImageData = ctx.getImageData(roiX, roiY, roiWidth, roiHeight);
    const roiCanvas = document.createElement('canvas');
    roiCanvas.width = roiWidth;
    roiCanvas.height = roiHeight;
    const roiCtx = roiCanvas.getContext('2d');
    roiCtx.putImageData(roiImageData, 0, 0);

    setLoading(true);
    setOcrProgress(0);

    try {
      const { data: { text } } = await Tesseract.recognize(
        roiCanvas,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      // Clean and validate the OCR result
      const cleanedText = text.trim().replace(/[^a-zA-Z0-9-]/g, '');
      
      if (cleanedText.length > 3) {
        setOcrResult(cleanedText);
        setShowConfirmDialog(true);
      } else {
        toast.error('No clear text detected. Please try again with better lighting.');
      }
    } catch (error) {
      toast.error('OCR processing failed');
      console.error('OCR error:', error);
    } finally {
      setLoading(false);
      setOcrProgress(0);
    }
  };

  const confirmOCR = () => {
    setShowConfirmDialog(false);
    onResult(ocrResult);
    stopCamera();
  };

  const rejectOCR = () => {
    setShowConfirmDialog(false);
    setOcrResult('');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            OCR Text Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isActive ? (
            <Button onClick={startCamera} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start OCR Scanning
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="camera-container relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-feed w-full rounded-lg"
                />
                {/* OCR overlay showing scanning area */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4/5 h-1/3 border-2 border-white border-dashed rounded-lg bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      Position text within this area
                    </span>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={captureAndOCR} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Type className="w-4 h-4 mr-2" />
                  )}
                  {loading ? `Processing... ${ocrProgress}%` : 'Scan Text'}
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  Stop
                </Button>
              </div>
              
              {loading && (
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Scanned Text</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 mb-2">
              Is this the correct product code?
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border">
              <code className="text-lg font-mono text-slate-900">{ocrResult}</code>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={rejectOCR} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={confirmOCR}>
              <Check className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OCRScanner;