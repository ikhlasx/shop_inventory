import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PrintLabelPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [barcodeDataUrl, setBarcodeDataUrl] = useState('');
  const qrCanvasRef = useRef(null);
  const barcodeCanvasRef = useRef(null);

  useEffect(() => {
    if (code) {
      fetchProduct();
    }
  }, [code]);

  useEffect(() => {
    if (product) {
      generateCodes();
    }
  }, [product]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products/${code}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const generateCodes = async () => {
    if (!product) return;

    try {
      // Generate QR Code
      const qrCanvas = qrCanvasRef.current;
      await QRCode.toCanvas(qrCanvas, product.code, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(qrCanvas.toDataURL());

      // Generate Barcode (Code128)
      const barcodeCanvas = barcodeCanvasRef.current;
      JsBarcode(barcodeCanvas, product.code, {
        format: 'CODE128',
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        textMargin: 5,
        margin: 10
      });
      setBarcodeDataUrl(barcodeCanvas.toDataURL());
    } catch (error) {
      console.error('Error generating codes:', error);
      toast.error('Error generating barcodes');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadLabel = () => {
    // Create a temporary canvas to combine QR and barcode
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 400;
    canvas.height = 600;
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add product info
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, canvas.width / 2, 40);
    
    ctx.font = '18px Arial';
    ctx.fillText(`Code: ${product.code}`, canvas.width / 2, 70);
    ctx.fillText(`Price: $${product.price}`, canvas.width / 2, 100);
    
    // Draw QR code
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, (canvas.width - 200) / 2, 120, 200, 200);
      
      // Draw barcode
      const barcodeImage = new Image();
      barcodeImage.onload = () => {
        const barcodeWidth = 300;
        const barcodeHeight = 120;
        ctx.drawImage(barcodeImage, (canvas.width - barcodeWidth) / 2, 340, barcodeWidth, barcodeHeight);
        
        // Download
        const link = document.createElement('a');
        link.download = `label_${product.code}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        toast.success('Label downloaded successfully');
      };
      barcodeImage.src = barcodeDataUrl;
    };
    qrImage.src = qrDataUrl;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 no-print">
        <Button variant="outline" size="icon" onClick={() => navigate('/products')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Print Label</h1>
          <p className="text-sm text-slate-600">Generate printable labels for {product.name}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 no-print">
        <Button onClick={handlePrint} className="flex-1">
          <Printer className="w-4 h-4 mr-2" />
          Print Label
        </Button>
        <Button onClick={downloadLabel} variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      {/* Label Preview */}
      <Card className="label-container">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-2xl">{product.name}</CardTitle>
          <div className="space-y-1">
            <p className="text-lg font-semibold">Code: {product.code}</p>
            <p className="text-lg">Price: ${product.price}</p>
            <p className="text-sm text-slate-600">
              {product.colorName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {/* QR Code */}
          <div>
            <h3 className="text-lg font-semibold mb-3">QR Code</h3>
            <div className="flex justify-center">
              <canvas 
                ref={qrCanvasRef}
                className="border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Barcode */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Barcode</h3>
            <div className="flex justify-center">
              <canvas 
                ref={barcodeCanvasRef}
                className="border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Product Color */}
          <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-lg">
            <div 
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: product.colorHex }}
            ></div>
            <span className="font-medium">
              {product.colorName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="text-slate-600">{product.colorHex}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintLabelPage;