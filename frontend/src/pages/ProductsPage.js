import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Edit, Trash2, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(undefined);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      toast.error('Error loading products');
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const deleteProduct = async (productCode) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(`${API}/products/${productCode}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Error deleting product');
      console.error('Delete product error:', error);
    }
  };

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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600">Manage your shawl inventory</p>
        </div>
        <Link to="/products/add">
          <Button className="btn-scan">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? undefined : value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="wool">Wool</SelectItem>
                <SelectItem value="silk">Silk</SelectItem>
                <SelectItem value="cotton">Cotton</SelectItem>
                <SelectItem value="cashmere">Cashmere</SelectItem>
                <SelectItem value="synthetic">Synthetic</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Products Found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || categoryFilter ? 'Try adjusting your search criteria' : 'Start by adding your first product'}
            </p>
            <Link to="/products/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <Card key={product.code} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="secondary">{product.code}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: product.colorHex }}
                  ></div>
                  <span className="text-sm font-medium text-slate-700">
                    {getColorDisplayName(product.colorName)}
                  </span>
                </div>

                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-900">
                    ${product.price}
                  </span>
                  <Badge variant={product.stockQty > 0 ? "default" : "destructive"}>
                    {product.stockQty} in stock
                  </Badge>
                </div>

                {/* Category */}
                <Badge className={getCategoryColor(product.category)}>
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Badge>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link to={`/products/print/${product.code}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <QrCode className="w-4 h-4 mr-2" />
                      Print Label
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toast.info('Edit feature coming soon!')}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteProduct(product.code)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;