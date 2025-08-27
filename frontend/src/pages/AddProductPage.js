import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, Palette, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ColorDetector from '../components/ColorDetector';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AddProductPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showColorDetector, setShowColorDetector] = useState(false);
  
  const [formData, setFormData] = useState({
    code: searchParams.get('code') || '',
    name: '',
    price: '',
    category: '',
    colorName: '',
    colorHex: '#000000',
    stockQty: '0'
  });

  const [errors, setErrors] = useState({});

  const colorOptions = [
    { value: 'black', label: 'Black', hex: '#000000' },
    { value: 'white', label: 'White', hex: '#FFFFFF' },
    { value: 'grey', label: 'Grey', hex: '#808080' },
    { value: 'light_grey', label: 'Light Grey', hex: '#D3D3D3' },
    { value: 'dark_grey', label: 'Dark Grey', hex: '#404040' },
    { value: 'red', label: 'Red', hex: '#FF0000' },
    { value: 'light_red', label: 'Light Red', hex: '#FFB6C1' },
    { value: 'dark_red', label: 'Dark Red', hex: '#8B0000' },
    { value: 'orange', label: 'Orange', hex: '#FFA500' },
    { value: 'brown', label: 'Brown', hex: '#A52A2A' },
    { value: 'yellow', label: 'Yellow', hex: '#FFFF00' },
    { value: 'light_yellow', label: 'Light Yellow', hex: '#FFFFE0' },
    { value: 'green', label: 'Green', hex: '#008000' },
    { value: 'light_green', label: 'Light Green', hex: '#90EE90' },
    { value: 'dark_green', label: 'Dark Green', hex: '#006400' },
    { value: 'blue', label: 'Blue', hex: '#0000FF' },
    { value: 'light_blue', label: 'Light Blue', hex: '#ADD8E6' },
    { value: 'dark_blue', label: 'Dark Blue', hex: '#000080' },
    { value: 'purple', label: 'Purple', hex: '#800080' },
    { value: 'light_purple', label: 'Light Purple', hex: '#DDA0DD' },
    { value: 'dark_purple', label: 'Dark Purple', hex: '#4B0082' },
    { value: 'pink', label: 'Pink', hex: '#FFC0CB' },
    { value: 'light_pink', label: 'Light Pink', hex: '#FFB6C1' },
    { value: 'maroon', label: 'Maroon', hex: '#800000' },
    { value: 'navy', label: 'Navy', hex: '#000080' },
    { value: 'teal', label: 'Teal', hex: '#008080' },
    { value: 'olive', label: 'Olive', hex: '#808000' },
    { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
    { value: 'cream', label: 'Cream', hex: '#FFFDD0' }
  ];

  const categoryOptions = [
    { value: 'wool', label: 'Wool' },
    { value: 'silk', label: 'Silk' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'cashmere', label: 'Cashmere' },
    { value: 'synthetic', label: 'Synthetic' },
    { value: 'mixed', label: 'Mixed' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleColorSelect = (colorValue) => {
    const selectedColor = colorOptions.find(c => c.value === colorValue);
    if (selectedColor) {
      handleInputChange('colorName', colorValue);
      handleInputChange('colorHex', selectedColor.hex);
    }
  };

  const handleDetectedColor = (detectedColor) => {
    handleInputChange('colorName', detectedColor.name);
    handleInputChange('colorHex', detectedColor.hex);
    setShowColorDetector(false);
    toast.success('Color applied to product!');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.colorName) {
      newErrors.colorName = 'Color is required';
    }

    if (!formData.colorHex.match(/^#[0-9A-Fa-f]{6}$/)) {
      newErrors.colorHex = 'Valid hex color is required';
    }

    if (isNaN(formData.stockQty) || parseInt(formData.stockQty) < 0) {
      newErrors.stockQty = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQty: parseInt(formData.stockQty)
      };

      if (!formData.code.trim()) {
        delete payload.code; // Let backend generate code
      }

      await axios.post(`${API}/products`, payload);
      toast.success('Product added successfully!');
      navigate('/products');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
        setErrors({ code: 'Product code already exists' });
        toast.error('Product code already exists');
      } else {
        toast.error('Error adding product');
      }
      console.error('Add product error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showColorDetector) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowColorDetector(false)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-slate-900">Detect Color</h1>
        </div>
        <ColorDetector onColorDetected={handleDetectedColor} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add Product</h1>
          <p className="text-sm text-slate-600">Create a new shawl product</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Product Code</Label>
              <Input
                id="code"
                placeholder="Leave blank to auto-generate"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category || "default"} onValueChange={(value) => handleInputChange('category', value === "default" ? "" : value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" disabled>Select category</SelectItem>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Stock Quantity */}
            <div className="space-y-2">
              <Label htmlFor="stockQty">Stock Quantity</Label>
              <Input
                id="stockQty"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stockQty}
                onChange={(e) => handleInputChange('stockQty', e.target.value)}
                className={errors.stockQty ? 'border-red-500' : ''}
              />
              {errors.stockQty && <p className="text-sm text-red-500">{errors.stockQty}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Color Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Selection *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Color Display */}
            {formData.colorName && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: formData.colorHex }}
                ></div>
                <div>
                  <p className="font-medium text-slate-900">
                    {colorOptions.find(c => c.value === formData.colorName)?.label || formData.colorName}
                  </p>
                  <p className="text-sm text-slate-600">{formData.colorHex}</p>
                </div>
              </div>
            )}

            {/* Color Methods */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowColorDetector(true)}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Camera className="w-6 h-6 mb-2" />
                <span className="text-sm">Detect Color</span>
              </Button>
              
              <div className="space-y-2">
                <Select value={formData.colorName || "default"} onValueChange={(value) => handleColorSelect(value === "default" ? "" : value)}>
                  <SelectTrigger className={errors.colorName ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Pick color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" disabled>Pick color</SelectItem>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="color"
                  value={formData.colorHex}
                  onChange={(e) => handleInputChange('colorHex', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            
            {errors.colorName && <p className="text-sm text-red-500">{errors.colorName}</p>}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full btn-scan">
          {loading ? (
            <>
              <div className="loading-spinner w-4 h-4 mr-2"></div>
              Adding Product...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Add Product
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddProductPage;