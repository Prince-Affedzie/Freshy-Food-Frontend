// src/AdminPages/Payments.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Filter, 
  Download, 
  Eye, 
  Search, 
  Calendar,
  CreditCard,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { getPaymentsOverview, getAllPayments } from '../Apis/adminApi';
//import LoadingSpinner from '../Components/Common/LoadingSpinner';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const Payments = () => {
  // State for overview data
  const [overviewData, setOverviewData] = useState(null);
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState({
    overview: true,
    payments: true
  });
  const [error, setError] = useState({
    overview: null,
    payments: null
  });

  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 20
  });

  // State for pagination
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1
  });

  // Load overview data
  const loadOverviewData = async () => {
    setLoading(prev => ({ ...prev, overview: true }));
    setError(prev => ({ ...prev, overview: null }));

    try {
      const response = await getPaymentsOverview();
      setOverviewData(response.data.data);
    } catch (err) {
      setError(prev => ({ ...prev, overview: 'Failed to load payment overview' }));
      console.error('Overview error:', err);
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  };

  // Load payments data with filters
  const loadPaymentsData = async () => {
    setLoading(prev => ({ ...prev, payments: true }));
    setError(prev => ({ ...prev, payments: null }));

    try {
      const response = await getAllPayments(filters);
      setPaymentsData(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(prev => ({ ...prev, payments: 'Failed to load payments' }));
      console.error('Payments error:', err);
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  };

  // Initial load
  useEffect(() => {
    loadOverviewData();
    loadPaymentsData();
  }, []);

  // Load payments when filters change
  useEffect(() => {
    if (!loading.overview) {
      loadPaymentsData();
    }
  }, [filters.page, filters.status, filters.paymentMethod, filters.startDate, filters.endDate]);

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

  // Get status badge color and icon
  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        iconColor: 'text-yellow-600'
      },
      failed: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
      refunded: {
        color: 'bg-purple-100 text-purple-800',
        icon: RefreshCw,
        iconColor: 'text-purple-600'
      }
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock, iconColor: 'text-gray-600' };
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: CreditCard,
      bank_transfer: Wallet,
      mobile_money: DollarSign,
      cash: DollarSign
    };
    return icons[method] || CreditCard;
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      startDate: '',
      endDate: '',
      search: '',
      page: 1,
      limit: 20
    });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadPaymentsData();
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      handleFilterChange('page', page);
    }
  };

  return (
    <AdminLayout title="Payments">
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Payments Management
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage all payment transactions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  loadOverviewData();
                  loadPaymentsData();
                }}
                disabled={loading.overview || loading.payments}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={18} className={loading.overview || loading.payments ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign size={24} />
              </div>
              <TrendingUp size={24} className="opacity-80" />
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold">
                {loading.overview ? (
                  <div className="h-8 bg-emerald-500/50 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(overviewData?.totalRevenue || 0)
                )}
              </div>
              <div className="text-emerald-100 text-sm">Total Revenue</div>
            </div>
          </div>

          {/* Summary Cards */}
          {loading.overview ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </>
          ) : (
            overviewData?.summary?.map((summaryItem) => {
              const config = getStatusConfig(summaryItem._id);
              const Icon = config.icon;
              
              return (
                <div key={summaryItem._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${config.color.replace('text-', 'bg-').split(' ')[0]}`}>
                      <Icon className={config.iconColor} size={24} />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                      {summaryItem._id.toUpperCase()}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(summaryItem.totalAmount)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {summaryItem.count} transactions
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Avg: {formatCurrency(summaryItem.totalAmount / (summaryItem.count || 1))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">All Methods</option>
                <option value="card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by transaction ID, customer name or email..."
              className="w-full px-4 py-2.5 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <button
              type="submit"
              className="absolute right-3 top-2.5 px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Transactions
              </h3>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {error.payments && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">{error.payments}</div>
              <button
                onClick={loadPaymentsData}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {loading.payments ? (
            <div className="p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : paymentsData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No payments found
              </h3>
              <p className="text-gray-500 mb-6">
                {Object.values(filters).some(val => val) 
                  ? 'Try changing your filters' 
                  : 'No payment transactions yet'}
              </p>
              {Object.values(filters).some(val => val) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentsData.map((payment) => {
                      const statusConfig = getStatusConfig(payment.status);
                      const StatusIcon = statusConfig.icon;
                      const PaymentMethodIcon = getPaymentMethodIcon(payment.paymentMethod);

                      return (
                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.transactionId || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Ref: {payment._id.slice(-8)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {payment.user ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.user.firstName} {payment.user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.user.email}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.user.phone}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Guest</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                            {payment.orderId && (
                              <div className="text-xs text-gray-500">
                                Order: {formatCurrency(payment.orderId.totalPrice)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={statusConfig.iconColor} size={16} />
                              <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                                {payment.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <PaymentMethodIcon size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {payment.paymentMethod?.replace('_', ' ') || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                             onClick={() => window.location.href = `/admin/payments/${payment._id}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(filters.page * filters.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(filters.page - 1)}
                        disabled={filters.page === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      
                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (filters.page <= 3) {
                          pageNum = i + 1;
                        } else if (filters.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = filters.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium ${
                              filters.page === pageNum
                                ? 'bg-emerald-600 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => goToPage(filters.page + 1)}
                        disabled={filters.page === pagination.pages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats Summary */}
        {overviewData && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BarChart3 className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Average Transaction</h4>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(overviewData.totalRevenue / overviewData.summary.reduce((sum, s) => sum + s.count, 0) || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Most Used Method</h4>
                  <div className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const methods = {};
                      paymentsData.forEach(p => {
                        if (p.paymentMethod) {
                          methods[p.paymentMethod] = (methods[p.paymentMethod] || 0) + 1;
                        }
                      });
                      const mostUsed = Object.entries(methods).sort((a, b) => b[1] - a[1])[0];
                      return mostUsed ? mostUsed[0].replace('_', ' ') : 'N/A';
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Success Rate</h4>
                  <div className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const paid = overviewData.summary.find(s => s._id === 'paid')?.count || 0;
                      const total = overviewData.summary.reduce((sum, s) => sum + s.count, 0);
                      return total > 0 ? `${((paid / total) * 100).toFixed(1)}%` : '0%';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Payments;