import React, { useState, useEffect } from 'react';
import { DollarSign, Package, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('Error loading dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      purple: "text-purple-600 bg-purple-100",
      orange: "text-orange-600 bg-orange-100"
    };

    return (
      <Card className="stats-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {change && (
                  <Badge variant={change.type === 'increase' ? 'default' : 'secondary'}>
                    {change.text}
                  </Badge>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Sales overview and analytics</p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats?.totalRevenue?.today || 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats?.totalRevenue?.month || 0)}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Total Units Sold"
          value={stats?.totalUnits?.allTime || 0}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Products Sold Today"
          value={stats?.distinctProducts?.today || 0}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Period Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Today</span>
                <span className="font-semibold">
                  {formatCurrency(stats?.totalRevenue?.today || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">This Month</span>
                <span className="font-semibold">
                  {formatCurrency(stats?.totalRevenue?.month || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm text-slate-600">All Time</span>
                <span className="font-bold text-lg">
                  {formatCurrency(stats?.totalRevenue?.allTime || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Units Sold</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Today</span>
                <span className="font-semibold">{stats?.totalUnits?.today || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">This Month</span>
                <span className="font-semibold">{stats?.totalUnits?.month || 0}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm text-slate-600">All Time</span>
                <span className="font-bold text-lg">{stats?.totalUnits?.allTime || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Diversity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Today</span>
                <span className="font-semibold">{stats?.distinctProducts?.today || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">This Month</span>
                <span className="font-semibold">{stats?.distinctProducts?.month || 0}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm text-slate-600">All Time</span>
                <span className="font-bold text-lg">{stats?.distinctProducts?.allTime || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Sellers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topSellers?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Sales Yet</h3>
              <p className="text-slate-600">Start scanning products to see sales data here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {stats?.topSellers?.slice(0, 10).map((product, index) => (
                  <div 
                    key={product.productCode}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{product.productName}</h4>
                        <p className="text-sm text-slate-600">{product.productCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(product.totalRevenue)}
                      </p>
                      <p className="text-sm text-slate-600">{product.totalUnits} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;