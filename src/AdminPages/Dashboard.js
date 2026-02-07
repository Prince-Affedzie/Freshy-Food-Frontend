// src/AdminPages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  RefreshCw,
  ShoppingCart,
  Star,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { fetchDashboardData } from '../Apis/adminApi';
import LoadingSpinner from '../Components/LoadingSpinner';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchDashboardData();
      setDashboardData(response.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate percentage change
  const calculateChange = (today, total, type) => {
    if (total === 0) return { value: 0, direction: 'neutral' };
    const percentage = ((today / total) * 100).toFixed(1);
    return {
      value: percentage,
      direction: percentage > 20 ? 'up' : percentage > 5 ? 'neutral' : 'down'
    };
  };

  if (loading && !dashboardData) {
    return (
      <AdminLayout title="Dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="Loading dashboard data..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back! Here's what's happening with your store today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {formatDate(lastUpdated)}
                </div>
              )}
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
            <button
              onClick={loadDashboardData}
              className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatCurrency(dashboardData.overview.totalRevenue) : '$0.00'}
              </div>
              {dashboardData && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="text-sm text-gray-600">Today:</div>
                  <div className="text-sm font-medium text-green-600">
                    {formatCurrency(dashboardData.overview.todayRevenue)}
                  </div>
                  <ArrowUpRight className="text-green-500" size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview.totalOrders || 0}
              </div>
              {dashboardData && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="text-sm text-gray-600">Today:</div>
                  <div className="text-sm font-medium text-blue-600">
                    {dashboardData.overview.todayOrders}
                  </div>
                  {calculateChange(
                    dashboardData.overview.todayOrders,
                    dashboardData.overview.totalOrders,
                    'orders'
                  ).direction === 'up' ? (
                    <ArrowUpRight className="text-blue-500" size={16} />
                  ) : (
                    <ArrowDownRight className="text-red-500" size={16} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Total Users Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.overview.totalUsers || 0}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Registered customers
            </div>
          </div>

          {/* Total Products Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Package className="text-amber-600" size={24} />
              </div>
              <div className="text-sm text-gray-500">Total Products</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.overview.totalProducts || 0}
            </div>
            {dashboardData && dashboardData.products && (
              <div className="flex items-center gap-2 mt-2">
                <div className="text-sm text-red-600 font-medium">
                  {dashboardData.products.outOfStock.length} out of stock
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Orders & Payments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Orders Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Orders Status</h2>
                <ShoppingCart size={20} className="text-gray-400" />
              </div>
              
              {dashboardData?.orders?.byStatus ? (
                <div className="space-y-4">
                  {dashboardData.orders.byStatus.map((status) => (
                    <div key={status._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status._id)}`}>
                          {status._id.charAt(0).toUpperCase() + status._id.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ 
                              width: `${(status.count / dashboardData.overview.totalOrders) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="font-medium">{status.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No order data available
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Clock size={20} className="text-gray-400" />
              </div>
              
              {dashboardData?.orders?.recent?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500 border-b">
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.orders.recent.map((order) => (
                        <tr key={order._id} className="border-b last:border-0">
                          <td className="py-4">
                            <div>
                              <div className="font-medium">
                                {order.user?.firstName || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.user?.email || 'No email'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-gray-600">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-4 font-medium">
                            {formatCurrency(order.totalPrice)}
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent orders
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Products & Alerts */}
          <div className="space-y-6">
            {/* Stock Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Stock Alerts</h2>
                <AlertCircle size={20} className="text-amber-500" />
              </div>
              
              <div className="space-y-4">
                {/* Low Stock */}
                {dashboardData?.products?.lowStock?.length ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-amber-700">Low Stock ({dashboardData.products.lowStock.length})</h3>
                      <TrendingDown size={16} className="text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      {dashboardData.products.lowStock.slice(0, 3).map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-amber-700">
                              {product.countInStock} units left
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Out of Stock */}
                {dashboardData?.products?.outOfStock?.length ? (
                  <div>
                    <div className="flex items-center justify-between mb-2 mt-4">
                      <h3 className="font-medium text-red-700">Out of Stock ({dashboardData.products.outOfStock.length})</h3>
                      <XCircle size={16} className="text-red-500" />
                    </div>
                    <div className="space-y-2">
                      {dashboardData.products.outOfStock.slice(0, 3).map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="font-medium">{product.name}</div>
                          <div className="font-medium text-red-700">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(!dashboardData?.products?.lowStock?.length && !dashboardData?.products?.outOfStock?.length) && (
                  <div className="text-center py-4">
                    <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                    <p className="text-gray-500">All products are well stocked</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
                <Star size={20} className="text-amber-400" />
              </div>
              
              {dashboardData?.products?.topSelling?.length ? (
                <div className="space-y-4">
                  {dashboardData.products.topSelling.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <span className="font-medium text-emerald-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.totalSold} sold
                          </div>
                        </div>
                      </div>
                      <TrendingUp size={18} className="text-green-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sales data available
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">Today's Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Orders</span>
                  <span className="font-bold">{dashboardData?.overview.todayOrders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Revenue</span>
                  <span className="font-bold">
                    {dashboardData ? formatCurrency(dashboardData.overview.todayRevenue) : '$0.00'}
                  </span>
                </div>
                <div className="pt-4 border-t border-emerald-500">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} />
                    <span className="text-sm">Daily average: {formatCurrency((dashboardData?.overview.todayRevenue || 0) / 30)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        {dashboardData?.payments?.summary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>
              <DollarSign size={20} className="text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardData.payments.summary.map((payment) => (
                <div key={payment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment._id)}`}>
                      {payment._id.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{payment.count} transactions</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payment.total)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Average: {formatCurrency(payment.total / (payment.count || 1))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="bg-gray-900 text-white rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {dashboardData?.overview.totalOrders || 0}
              </div>
              <div className="text-gray-300">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {dashboardData ? formatCurrency(dashboardData.overview.totalRevenue) : '$0.00'}
              </div>
              <div className="text-gray-300">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {dashboardData?.overview.totalUsers || 0}
              </div>
              <div className="text-gray-300">Registered Users</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;