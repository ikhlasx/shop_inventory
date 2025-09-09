import React, { useState, useRef, useEffect } from 'react';
import { Camera, Palette, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ColorDetector = () => {
  const [isActive, setIsActive] = useState(false);
  const [detectedColor, setDetectedColor] = useState(null);
  const [loading, setLoading] = useState(false);
  
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

  const captureColor = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Sample a 40x40 area from the center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const sampleSize = 40;
    
    const imageData = ctx.getImageData(
      centerX - sampleSize / 2,
      centerY - sampleSize / 2,
      sampleSize,
      sampleSize
    );

    // Calculate average color
    let r = 0, g = 0, b = 0;
    const pixels = imageData.data;
    const totalPixels = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
    }

    r = Math.round(r / totalPixels);
    g = Math.round(g / totalPixels);
    b = Math.round(b / totalPixels);

    setLoading(true);
    try {
      const response = await axios.post(`${API}/detect-color`, { r, g, b });
      setDetectedColor(response.data);
      toast.success('Color detected!');
      
      // Vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (error) {
      toast.error('Error detecting color');
      console.error('Color detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorDisplayName = (colorName) => {
    return colorName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <Button onClick={startCamera} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Start Color Detection
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
              <div className="color-reticle"></div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={captureColor} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Palette className="w-4 h-4 mr-2" />
                )}
                Detect Color
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Stop
              </Button>
            </div>
          </div>
        )}

        {detectedColor && (
          <div className="fade-in space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div 
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: detectedColor.hex }}
              ></div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">
                  {getColorDisplayName(detectedColor.name)}
                </h3>
                <p className="text-sm text-slate-600">{detectedColor.hex}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-medium text-slate-900">RGB</div>
                <div className="text-slate-600">
                  {detectedColor.rgb.r}, {detectedColor.rgb.g}, {detectedColor.rgb.b}
                </div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-medium text-slate-900">HSV</div>
                <div className="text-slate-600">
                  {Math.round(detectedColor.hsv.h)}°, {Math.round(detectedColor.hsv.s * 100)}%, {Math.round(detectedColor.hsv.v * 100)}%
                </div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-medium text-slate-900">Confidence</div>
                <div className="text-slate-600">
                  {Math.round(detectedColor.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorDetector;