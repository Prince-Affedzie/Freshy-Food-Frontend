// AdminOrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PrinterIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {AdminGetOrderById, updateOrderStatus } from '../Apis/orderApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = [
    { value: 'Pending', label: 'Pending', color: 'yellow', icon: ClockIcon },
    { value: 'Processing', label: 'Processing', color: 'blue', icon: ArrowPathIcon },
    { value: 'Out for Delivery', label: 'Out for Delivery', color: 'purple', icon: TruckIcon },
    { value: 'Delivered', label: 'Delivered', color: 'green', icon: CheckCircleIcon },
    { value: 'Cancelled', label: 'Cancelled', color: 'red', icon: XCircleIcon },
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await AdminGetOrderById(id);
      if (response.status === 200 && response.data.data) {
        setOrder(response.data.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.response?.data?.message || 'Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    setUpdatingStatus(true);
    try {
      await updateOrderStatus(id, newStatus );
      toast.success(`Order status updated to ${newStatus}`);
      setShowStatusModal(false);
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
      setNewStatus('');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status) || 
                        { color: 'gray', icon: ClockIcon };
    const Icon = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}>
        <Icon className="h-4 w-4" />
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const printOrder = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800">Order Not Found</h3>
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/admin/orders" className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeftIcon className="h-5 w-5" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/*<Link
                  to="/admin/orders"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </Link>*/}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #{order.orderNumber}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    {getStatusBadge(order.status.current)}
                    <span className="text-sm text-gray-600">
                      {formatDate(order.dates.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={printOrder}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <PrinterIcon className="h-5 w-5" />
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(true);
                    setNewStatus(order.status.current);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:p-0 print:border-0 print:shadow-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-700" />
                  Order Items ({order.orderItems.length})
                </h2>

                <div className="space-y-4">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.product?.category || 'Product'} • {item.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{item.price}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.quantity} × {item.price}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            Item total: <span className="font-semibold">{item.totalPrice}</span>
                          </p>
                          {item.product?.id && (
                            <Link
                              to={`/admin-product/${item.product.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Product →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:p-0 print:border-0 print:shadow-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <ClockIcon className="h-6 w-6 text-gray-700" />
                  Order Timeline
                </h2>

                <div className="space-y-6">
                  {order.status.timeline.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircleIcon className="h-6 w-6" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                          )}
                        </div>
                        {index < order.status.timeline.length - 1 && (
                          <div className={`absolute top-10 left-5 w-0.5 h-12 ${
                            step.completed ? 'bg-green-300' : 'bg-gray-200'
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{step.status}</h4>
                          {step.date && (
                            <span className="text-sm text-gray-500">
                              {formatDate(step.date)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Shipping */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:p-0 print:border-0 print:shadow-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <TruckIcon className="h-6 w-6 text-gray-700" />
                  Delivery Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="space-y-2">
                          <p className="text-gray-900">
                            {order.shippingAddress.address}
                          </p>
                          <p className="text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.region}
                          </p>
                          {order.shippingAddress.nearestLandmark && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Landmark:</span> {order.shippingAddress.nearestLandmark}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4" />
                            {order.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Schedule</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="space-y-1">
                          <p className="text-blue-900">
                            <span className="font-medium">Preferred Day:</span> {order.deliverySchedule?.preferredDay || 'Not specified'}
                          </p>
                          <p className="text-blue-900">
                            <span className="font-medium">Preferred Time:</span> {order.deliverySchedule?.preferredTime || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Status</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            {getStatusBadge(order.status.current)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Delivered:</span>
                            <span className={`font-medium ${
                              order.delivery.isDelivered ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {order.delivery.isDelivered ? 'Yes' : 'No'}
                            </span>
                          </div>
                          {order.delivery.deliveredAtDisplay && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Delivered At:</span>
                              <span className="text-gray-900">{order.delivery.deliveredAtDisplay}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {order.delivery.note && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Note</h4>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <p className="text-yellow-800">{order.delivery.note}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Customer Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:p-0 print:border-0 print:shadow-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-700" />
                  Customer Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{order.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{order.user.phone}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/admin/users/${order.user.id}`}
                    className="block w-full text-center py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    View Customer Profile
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:p-0 print:border-0 print:shadow-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <DocumentTextIcon className="h-5 w-5 text-gray-700" />
                  Order Summary
                </h3>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{order.pricing.itemsPriceDisplay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium text-gray-900">{order.pricing.deliveryFeeDisplay}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-gray-900">{order.pricing.totalPriceDisplay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Order Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order ID</span>
                        <span className="font-mono text-gray-900">{order.id.slice(-12)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span className="text-gray-900">{order.dates.createdAtDisplay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated</span>
                        <span className="text-gray-900">{order.dates.updatedAtDisplay}</span>
                      </div>
                      {order.subscriptionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subscription</span>
                          <Link
                            to={`/admin/subscriptions/${order.subscriptionId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:p-0 print:border-0 print:shadow-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <CreditCardIcon className="h-5 w-5 text-gray-700" />
                  Payment Information
                </h3>

                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${
                    order.payment.isPaid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Payment Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.payment.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        Method: <span className="font-medium">{order.payment.method || 'Not specified'}</span>
                      </p>
                      {order.payment.paidAtDisplay && (
                        <p className="text-gray-600">
                          Paid on: <span className="font-medium">{order.payment.paidAtDisplay}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {!order.payment.isPaid && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Payment Pending</p>
                          <p className="text-sm text-red-700 mt-1">
                            This order has not been paid yet. Delivery cannot proceed until payment is confirmed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:hidden">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={printOrder}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    <PrinterIcon className="h-5 w-5" />
                    Print Order
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusModal(true);
                      setNewStatus(order.status.current);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                    Update Status
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    <EnvelopeIcon className="h-5 w-5" />
                    Email Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <ArrowPathIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Update Order Status</h3>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select New Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setNewStatus(status.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        newStatus === status.value
                          ? `border-${status.color}-500 bg-${status.color}-50`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <status.icon className={`h-5 w-5 text-${status.color}-600`} />
                        <div>
                          <p className="font-medium text-gray-900">{status.label}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {status.value === 'Delivered' && 'Mark as delivered'}
                            {status.value === 'Processing' && 'Start processing order'}
                            {status.value === 'Out for Delivery' && 'Dispatch for delivery'}
                            {status.value === 'Cancelled' && 'Cancel this order'}
                            {status.value === 'Pending' && 'Reset to pending'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {newStatus === 'Cancelled' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Cancel Order?</p>
                      <p className="text-sm text-red-700 mt-1">
                        Cancelling this order will notify the customer and mark it as cancelled.
                        This action can only be undone by contacting support.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {newStatus === 'Delivered' && !order.payment.isPaid && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Payment Not Confirmed</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        This order has not been paid. Marking as delivered without payment confirmation is not recommended.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || !newStatus || newStatus === order.status.current}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    newStatus === 'Cancelled'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {updatingStatus ? 'Updating...' : `Update to ${newStatus}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          body {
            background: white !important;
          }
          .grid > div {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;