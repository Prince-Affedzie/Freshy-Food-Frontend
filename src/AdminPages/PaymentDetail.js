// src/AdminPages/PaymentDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  DollarSign,
  User,
  Package,
  Calendar,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Edit,
  Save,
  Loader2,
  Copy,
  ExternalLink,
  Receipt,
  Shield,
  History
} from 'lucide-react';
import { getSinglePayment, updatePaymentStatus } from '../Apis/adminApi';
import LoadingSpinner from '../Components/LoadingSpinner';
import AdminLayout from '../Components/AdminComponents/adminLayout';
import { toast } from 'react-toastify';

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'refunded', label: 'Refunded', color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
  ];

  const paymentMethods = {
    mobile_money: { label: 'Mobile Money', icon: Smartphone, color: 'bg-purple-100 text-purple-800' },
    momo: { label: 'Mobile Money', icon: Smartphone, color: 'bg-purple-100 text-purple-800' },
    card: { label: 'Credit Card', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
    bank: { label: 'Bank Transfer', icon: Building, color: 'bg-emerald-100 text-emerald-800' },
    wallet: { label: 'Wallet', icon: Wallet, color: 'bg-amber-100 text-amber-800' },
  };

  const loadPaymentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSinglePayment(id);
      setPayment(response.data.data);
    } catch (err) {
      setError('Failed to load payment details. Please try again.');
      console.error('Payment detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === payment?.status) {
      setShowStatusModal(false);
      return;
    }

    setUpdating(true);
    try {
      await updatePaymentStatus(id, newStatus);
      
      // Update local state
      setPayment(prev => ({
        ...prev,
        status: newStatus
      }));
      
      toast.success('Payment status updated successfully!');
      setShowStatusModal(false);
      setNewStatus('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
      console.error('Status update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatCurrency = (amount, currency = 'GHS') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const getPaymentMethodConfig = (method) => {
    return paymentMethods[method] || { label: 'Unknown', icon: CreditCard, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <AdminLayout title="Payment Details">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="Loading payment details..." />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Payment Details">
        <div className="min-h-screen bg-gray-50 p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Payments
          </button>
          
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
            <p className="text-gray-500 mb-6">The payment you're looking for might not exist or you don't have permission to view it.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={loadPaymentData}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/admin/payments')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Payments
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;
  const paymentMethodConfig = getPaymentMethodConfig(payment.paymentMethod);
  const PaymentMethodIcon = paymentMethodConfig.icon;

  return (
    <AdminLayout title="Payment Details">
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/payments')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Payments
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Payment Details
              </h1>
              <p className="text-gray-600 mt-1">
                Transaction ID: <span className="font-mono">{payment._id.slice(-8)}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit size={18} />
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
                <p className="text-gray-600 text-sm mt-1">Select the new status for this payment</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {statusOptions.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setNewStatus(option.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                          newStatus === option.value 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${option.color.split(' ')[0]}`}>
                          <OptionIcon className={option.color.split(' ')[1]} size={20} />
                        </div>
                        <span className="font-medium">{option.label}</span>
                        {payment.status === option.value && (
                          <span className="ml-auto text-sm text-gray-500">Current</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setNewStatus('');
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating || !newStatus || newStatus === payment.status}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment Overview</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <DollarSign className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <div className="text-sm text-gray-500">{payment.currency}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${statusConfig.color.split(' ')[0]}`}>
                        <StatusIcon className={statusConfig.color.split(' ')[1]} size={24} />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {statusConfig.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last updated: {payment.updatedAt ? formatDate(payment.updatedAt) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${paymentMethodConfig.color.split(' ')[0]}`}>
                        <PaymentMethodIcon className={paymentMethodConfig.color.split(' ')[1]} size={24} />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {paymentMethodConfig.label}
                        </div>
                        {payment.paymentChannel && (
                          <div className="text-sm text-gray-500">
                            Channel: {payment.paymentChannel}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Timestamps</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span>Created: {formatDate(payment.createdAt)}</span>
                      </div>
                      {payment.updatedAt !== payment.createdAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <History size={16} className="text-gray-400" />
                          <span>Updated: {formatDate(payment.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transaction Reference */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Transaction Reference</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {payment.transactionRef || 'Not provided'}
                      </code>
                      {payment.transactionRef && (
                        <button
                          onClick={() => copyToClipboard(payment.transactionRef)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <Copy size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Payment ID</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {payment._id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(payment._id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Copy to clipboard"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Money Details */}
                  {payment.mobileMoneyNumber && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Mobile Money Number</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Smartphone className="text-gray-400" size={20} />
                        <span className="font-medium">{payment.mobileMoneyNumber}</span>
                      </div>
                    </div>
                  )}

                  {/* Currency */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Currency</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium">{payment.currency}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            {payment.orderId && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
                    <button
                      onClick={() => navigate(`/admin/order/${payment.orderId._id}`)}
                      className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      View Order
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Order ID</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {payment.orderId._id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(payment.orderId._id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Order Status</label>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusConfig(payment.orderId.status).color}`}>
                        <StatusIcon size={16} />
                        <span className="text-sm font-medium">
                          {payment.orderId.status.charAt(0).toUpperCase() + payment.orderId.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Order Total</label>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(payment.orderId.totalPrice, payment.currency)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Payment Status</label>
                      <div className="flex items-center gap-2">
                        <Shield size={18} className={
                          payment.orderId.isPaid ? 'text-green-500' : 'text-yellow-500'
                        } />
                        <span className="font-medium">
                          {payment.orderId.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Customer Info & Actions */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {payment.user?.firstName} {payment.user?.lastName}
                    </h3>
                    <p className="text-gray-500">Customer</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        {payment.user?.email || 'N/A'}
                      </div>
                      {payment.user?.email && (
                        <button
                          onClick={() => copyToClipboard(payment.user.email)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        {payment.user?.phone || 'N/A'}
                      </div>
                      {payment.user?.phone && (
                        <button
                          onClick={() => copyToClipboard(payment.user.phone)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      Customer ID
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        {payment.user?._id || 'N/A'}
                      </code>
                      {payment.user?._id && (
                        <button
                          onClick={() => copyToClipboard(payment.user._id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate(`/admin/users/${payment.user?._id}`)}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User size={18} />
                  View Customer Profile
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              
              <div className="p-6 space-y-3">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Edit className="text-blue-600" size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Update Status</div>
                      <div className="text-sm text-gray-500">Change payment status</div>
                    </div>
                  </div>
                </button>

                {payment.orderId && (
                  <button
                    onClick={() => navigate(`/admin/order/${payment.orderId._id}`)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                        <Package className="text-emerald-600" size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">View Order</div>
                        <div className="text-sm text-gray-500">See order details</div>
                      </div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => navigate(`/admin/users/${payment.user?._id}`)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <User className="text-purple-600" size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">View Customer</div>
                      <div className="text-sm text-gray-500">Customer profile</div>
                    </div>
                  </div>
                </button>

                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                      <Receipt className="text-amber-600" size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Generate Receipt</div>
                      <div className="text-sm text-gray-500">Download PDF receipt</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Status History (Placeholder) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-green-100 rounded-full">
                      <CheckCircle className="text-green-600" size={14} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Payment created</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {payment.updatedAt !== payment.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <RefreshCw className="text-blue-600" size={14} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Last updated</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(payment.updatedAt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => navigate('/admin/payments')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Payments
            </button>
            <button
              onClick={() => {
                toast.info('Print functionality coming soon!');
              }}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PaymentDetail;