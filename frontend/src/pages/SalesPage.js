import React, { useState, useEffect } from 'react';
import { Search, Calendar, Download, RefreshCw, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      
      const response = await axios.get(`${API}/sales`, { params });
      setSales(response.data);
    } catch (error) {
      toast.error('Error loading sales');
      console.error('Fetch sales error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSales();
  };

  const exportToCSV = () => {
    if (sales.length === 0) {
      toast.error('No sales data to export');
      return;
    }

    const headers = ['Date', 'Product Code', 'Product Name', 'Price', 'Color', 'Quantity', 'Total'];
    const rows = sales.map(sale => [
      new Date(sale.timestamp).toLocaleDateString(),
      sale.productCode,
      sale.productName,
      `$${sale.priceAtSale}`,
      sale.colorAtSale,
      sale.quantity,
      `$${(sale.priceAtSale * sale.quantity).toFixed(2)}`
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Sales data exported successfully');
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales History</h1>
          <p className="text-slate-600">Track all product sales and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSales} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by product name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sales.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Sales Found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : 'Start scanning products to see sales here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Card key={sale.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Sale Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-slate-900">{sale.productName}</h3>
                      <Badge variant="secondary">{sale.productCode}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(sale.timestamp)}
                      </span>
                      <span>Color: {sale.colorAtSale}</span>
                      <span>Qty: {sale.quantity}</span>
                    </div>
                  </div>

                  {/* Sale Amount */}
                  <div className="text-right space-y-1">
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(sale.priceAtSale * sale.quantity)}
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatCurrency(sale.priceAtSale)} × {sale.quantity}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesPage;