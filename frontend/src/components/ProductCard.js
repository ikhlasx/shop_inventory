import React from 'react';
import { ShoppingCart, Package, Palette, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const ProductCard = ({ product, onRecordSale, loading = false }) => {
  const getColorDisplayName = (colorName) => {
    return colorName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryColor = (category) => {
    const colors = {
      wool: 'bg-orange-100 text-orange-800',
      silk: 'bg-purple-100 text-purple-800',
      cotton: 'bg-green-100 text-green-800',
      cashmere: 'bg-red-100 text-red-800',
      synthetic: 'bg-blue-100 text-blue-800',
      mixed: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  return (
    <Card className="success-glow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Found
          </span>
          <Badge variant="secondary">{product.code}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Details */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">{product.name}</h3>
            <p className="text-sm text-slate-600">Product Code: {product.code}</p>
          </div>

          {/* Color Display */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div 
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: product.colorHex }}
            ></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-900">
                  {getColorDisplayName(product.colorName)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{product.colorHex}</p>
            </div>
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Price</p>
                <p className="font-semibold text-slate-900">${product.price}</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-sm text-slate-600">Category</p>
              <Badge className={getCategoryColor(product.category)}>
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <span className="text-sm text-slate-600">Stock Available</span>
            <Badge variant={product.stockQty > 0 ? "default" : "destructive"}>
              {product.stockQty} units
            </Badge>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onRecordSale}
          disabled={loading || product.stockQty === 0}
          className="w-full btn-scan"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Recording Sale...
            </>
          ) : product.stockQty === 0 ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Record Sale
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;