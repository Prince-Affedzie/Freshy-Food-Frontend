// AdminOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  DollarSign,
  ShoppingCart,
  User,
  MapPin,
  Calendar,
  CreditCard,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  Package,
  TrendingUp,
  Download,
  MoreVertical
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllOrders } from '../Apis/orderApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    paymentMethod: 'all',
    search: '',
    sort: 'newest',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800' },
    { value: 'Pending', label: 'Pending', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { value: 'Processing', label: 'Processing', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
    { value: 'Out for Delivery', label: 'Out for Delivery', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800' },
    { value: 'Delivered', label: 'Delivered', color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'red', bg: 'bg-red-100', text: 'text-red-800' },
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'momo', label: 'Mobile Money' },
    { value: 'card', label: 'Card' },
    { value: 'cash', label: 'Cash on Delivery' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'totalPrice', label: 'Price: Low to High' },
    { value: 'totalPrice-desc', label: 'Price: High to Low' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  useEffect(() => {
    // Calculate active filter count
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.paymentMethod !== 'all') count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.search) count++;
    if (filters.sort !== 'newest') count++;
    setActiveFilterCount(count);
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Clean up filters for API call
      const apiFilters = { ...filters };
      if (apiFilters.status === 'all') delete apiFilters.status;
      if (apiFilters.paymentMethod === 'all') delete apiFilters.paymentMethod;
      if (!apiFilters.search) delete apiFilters.search;
      if (!apiFilters.startDate) delete apiFilters.startDate;
      if (!apiFilters.endDate) delete apiFilters.endDate;

      const response = await getAllOrders(apiFilters);
      
      if (response.data.success) {
        setOrders(response.data.data);
        setStats(response.data.stats);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      startDate: '',
      endDate: '',
      paymentMethod: 'all',
      search: '',
      sort: 'newest',
      page: 1,
      limit: 20,
    });
    toast.info('Filters reset');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return Clock;
      case 'Processing': return RefreshCw;
      case 'Out for Delivery': return Truck;
      case 'Delivered': return CheckCircle;
      case 'Cancelled': return XCircle;
      default: return Package;
    }
  };

  const getStatusBadge = (order) => {
    const statusConfig = statusOptions.find(s => s.value === order.status) || statusOptions[0];
    const Icon = getStatusIcon(order.status);
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon size={14} />
        {order.status}
        {order.status === 'Delivered' && order.isPaid && (
          <CheckCircle className="text-green-500" size={14} />
        )}
      </div>
    );
  };

  const getPaymentBadge = (method, isPaid) => {
    const methods = {
      momo: { label: 'Mobile Money', color: 'bg-purple-100 text-purple-800' },
      card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
      cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    };

    const config = methods[method] || { label: method, color: 'bg-gray-100 text-gray-800' };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.color}`}>
        <CreditCard size={14} />
        {config.label}
        {isPaid && <CheckCircle className="text-green-500" size={14} />}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getOrderItemsCount = (order) => {
    return order.items?.length || order.itemsCount || 0;
  };

  if (loading && orders.length === 0) {
    return (
      <AdminLayout title="Orders Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders Management">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Orders</h2>
            <p className="text-gray-600">Manage and track all customer orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
            >
              <Filter size={18} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={fetchOrders}
              className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
            <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Order Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search Orders</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by Order ID, Customer Name or Phone..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today's Orders */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.todayOrders || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Calendar className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingOrders || 0}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.totalRevenueDisplay || '$0.00'}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.avgOrderValueDisplay || '$0.00'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Orders ({pagination.total || 0})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {orders.length} of {pagination.total || 0} orders
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="border-0 bg-transparent focus:ring-0 outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      {/* Order Details Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="text-gray-400" size={16} />
                            <span className="font-medium text-gray-900">
                              {order.orderNumber || `#${order.id?.substring(0, 8)}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            {order.createdAt}
                          </div>
                          {order.shippingAddress?.city && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin size={14} />
                              {order.shippingAddress.city}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Customer Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <User className="text-emerald-600" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.customer?.firstName || 'Customer'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer?.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Items Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="text-gray-400" size={18} />
                          <span className="font-medium text-gray-900">
                            {getOrderItemsCount(order)} items
                          </span>
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {order.totalPrice?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }) || '$0.00'}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {getStatusBadge(order)}
                          {!order.isPaid && order.status !== 'Cancelled' && (
                            <div className="text-xs text-red-600 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Payment pending
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Payment Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {getPaymentBadge(order.paymentMethod, order.isPaid)}
                          <div className="text-xs text-gray-500">
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/order/${order.id}`)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">No orders found</p>
                        {(filters.search || filters.status !== 'all') && (
                          <button
                            onClick={resetFilters}
                            className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={!pagination.hasPrevPage}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium ${
                            pagination.currentPage === pageNum
                              ? 'bg-emerald-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {stats && orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
              <div className="space-y-3">
                {statusOptions
                  .filter(s => s.value !== 'all')
                  .map((status) => {
                    // Calculate count for each status (this would need actual data from backend)
                    const count = orders.filter(order => order.status === status.value).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    
                    return (
                      <div key={status.value} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${status.bg.replace('100', '500')}`}></div>
                          <span className="text-sm text-gray-700">{status.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <span className="text-sm text-gray-500">{formatDate(new Date())}</span>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          Order #{order.orderNumber || order.id?.substring(0, 8)}
                        </span>
                        {getStatusBadge(order)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.customer?.firstName || 'Customer'} • {formatShortDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="font-bold text-gray-900">
                      {order.totalPrice?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }) || '$0.00'}
                    </div>
                  </div>
                ))}
              </div>
              {orders.length > 3 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    View all orders →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;