// UserDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Shield, 
  ShoppingCart, 
  Heart, 
  Package, 
  Calendar, 
  Clock, 
  Building, 
  Flag, 
  CreditCard, 
  Truck,
  AlertCircle,
  Loader2,
  MoreVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Star,
  Award,
  Gift,
  History
} from 'lucide-react';
import { getAUser, deleteAUser, toggleAdmin } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getAUser(id);
      setUser(response.data.user);
      setError('');
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteAUser(id);
        navigate('/admin/users');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user.');
        setIsDeleting(false);
      }
    }
  };

  const handleToggleAdmin = async () => {
    try {
      await toggleAdmin(id);
      fetchUser(); // Refresh user data
    } catch (err) {
      console.error('Error toggling admin status:', err);
      alert('Failed to update admin status.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFullName = () => {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User';
  };

  const getInitials = () => {
    const fullName = getFullName();
    if (!fullName || fullName === 'Unnamed User') return 'UU';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <AdminLayout title="User Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="mt-4 text-gray-600">Loading user details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout title="User Details">
        <div className="p-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Users
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">User Not Found</h3>
            <p className="text-red-600">{error || 'The requested user could not be found.'}</p>
            <button
              onClick={() => navigate('/admin/users')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Users List
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Details">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back to Users
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-2xl font-bold text-white">{getInitials()}</span>
                  </div>
                  {user.isAdmin && (
                    <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-1.5 rounded-full border-2 border-white">
                      <Shield size={16} />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{getFullName()}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Customer'}
                    </span>
                    {user.isAdmin && (
                      <span className="px-3 py-1 bg-purple-500/30 backdrop-blur-sm text-white text-sm rounded-full flex items-center gap-1">
                        <Shield size={12} />
                        Administrator
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-white/90 text-sm">
                      <Calendar size={14} />
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <Edit size={18} />
                  Edit User
                </button>
                <button className="p-2.5 border border-white/30 text-white rounded-lg hover:bg-white/10">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-700">{user.cartItems?.length || 0}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                  <ShoppingCart size={14} />
                  Cart Items
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{user.favorites?.length || 0}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                  <Heart size={14} />
                  Favorites
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{user.orders?.length || 0}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                  <Package size={14} />
                  Total Orders
                </div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">
                  {(() => {
                    const now = new Date();
                    const updated = new Date(user.updatedAt);
                    const diffDays = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
                    return diffDays === 0 ? 'Today' : `${diffDays}d ago`;
                  })()}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                  <Clock size={14} />
                  Last Active
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['overview', 'orders', 'activity', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <div className="flex items-center gap-2 text-gray-900">
                          <User size={16} className="text-gray-400" />
                          {getFullName()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                        <div className="flex items-center gap-2 text-gray-900">
                          <Mail size={16} className="text-gray-400" />
                          {user.email || 'No email provided'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                        <div className="flex items-center gap-2 text-gray-900">
                          <Phone size={16} className="text-gray-400" />
                          {user.phone || 'No phone provided'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                        <div className="flex items-center gap-2">
                          {user.isAdmin ? (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full flex items-center gap-1">
                              <Shield size={14} />
                              Administrator
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Customer'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                        <div className="flex items-center gap-2 text-gray-900">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                        <div className="flex items-center gap-2 text-gray-900">
                          <Clock size={16} className="text-gray-400" />
                          {formatDate(user.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                {(user.address || user.city || user.nearestLandmark) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.city && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                          <div className="flex items-center gap-2 text-gray-900">
                            <Building size={16} className="text-gray-400" />
                            {user.city}
                          </div>
                        </div>
                      )}
                      {user.address && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                          <div className="flex items-start gap-2 text-gray-900">
                            <MapPin size={16} className="text-gray-400 mt-0.5" />
                            {user.address}
                          </div>
                        </div>
                      )}
                      {user.nearestLandmark && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Nearest Landmark</label>
                          <div className="flex items-start gap-2 text-gray-900">
                            <Flag size={16} className="text-gray-400 mt-0.5" />
                            {user.nearestLandmark}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <div className="space-y-3">
                    {user.orders && user.orders.length > 0 ? (
                      user.orders.slice(0, 3).map((order, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <Package size={18} className="text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Order #{order.orderId?.substring(0, 8) || 'N/A'}</p>
                              <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                            </div>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p>No recent orders</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                  <span className="text-sm text-gray-500">
                    {user.orders?.length || 0} total orders
                  </span>
                </div>
                
                {user.orders && user.orders.length > 0 ? (
                  <div className="space-y-4">
                    {user.orders.map((order, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                                Completed
                              </span>
                              <span className="text-sm text-gray-500">
                                Order #{order.orderId?.substring(0, 8) || 'N/A'}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900">Grocery Delivery Order</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">$125.50</p>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Truck size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Delivery</p>
                              <p className="text-sm text-gray-500">Standard Shipping</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <CreditCard size={18} className="text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Payment</p>
                              <p className="text-sm text-gray-500">Credit Card • Paid</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Package size={18} className="text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Items</p>
                              <p className="text-sm text-gray-500">5 items in order</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                          <button className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium">
                            View Full Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      This user hasn't placed any orders yet. They might be new to your store or still exploring products.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">User Activity Timeline</h3>
                
                <div className="space-y-6">
                  <div className="relative pl-8 pb-6">
                    <div className="absolute left-0 top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                    <div className="absolute left-2 top-4 w-0.5 h-full bg-gray-200"></div>
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Account Created</h4>
                        <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                      </div>
                      <p className="text-gray-600">User registered on the platform</p>
                    </div>
                  </div>

                  {user.favorites && user.favorites.length > 0 && (
                    <div className="relative pl-8 pb-6">
                      <div className="absolute left-0 top-0 w-4 h-4 bg-pink-500 rounded-full border-4 border-white"></div>
                      <div className="absolute left-2 top-4 w-0.5 h-full bg-gray-200"></div>
                      <div className="bg-gray-50 p-5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Added to Favorites</h4>
                          <span className="text-sm text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-gray-600">Added {user.favorites.length} item(s) to favorites</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {user.favorites.slice(0, 3).map((fav, index) => (
                            <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
                              Item #{index + 1}
                            </span>
                          ))}
                          {user.favorites.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                              +{user.favorites.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.cartItems && user.cartItems.length > 0 && (
                    <div className="relative pl-8 pb-6">
                      <div className="absolute left-0 top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
                      <div className="absolute left-2 top-4 w-0.5 h-full bg-gray-200"></div>
                      <div className="bg-gray-50 p-5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Cart Activity</h4>
                          <span className="text-sm text-gray-500">Today</span>
                        </div>
                        <p className="text-gray-600">{user.cartItems.length} item(s) in cart</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {user.cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)} total items
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 w-4 h-4 bg-amber-500 rounded-full border-4 border-white"></div>
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Last Active</h4>
                        <span className="text-sm text-gray-500">{formatDate(user.updatedAt)}</span>
                      </div>
                      <p className="text-gray-600">User was last active on the platform</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Account Settings */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Shield size={18} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Administrator Access</p>
                          <p className="text-sm text-gray-500">
                            {user.isAdmin 
                              ? 'User has full administrative privileges' 
                              : 'User has regular user permissions'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleAdmin}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                      >
                        {user.isAdmin ? (
                          <>
                            <ToggleLeft size={20} />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <ToggleRight size={20} />
                            Make Admin
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Star size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Account Status</p>
                          <p className="text-sm text-gray-500">User account is active and accessible</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Award size={18} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Loyalty Status</p>
                          <p className="text-sm text-gray-500">
                            {user.orders?.length >= 5 ? 'Gold Member' : 
                             user.orders?.length >= 2 ? 'Silver Member' : 'New Member'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        user.orders?.length >= 5 ? 'bg-amber-100 text-amber-800' :
                        user.orders?.length >= 2 ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.orders?.length >= 5 ? 'Gold' : 
                         user.orders?.length >= 2 ? 'Silver' : 'New'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                  
                  <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">Delete User Account</h4>
                        <p className="text-red-700 text-sm">
                          Once deleted, the user account cannot be recovered. All associated data including orders and favorites will be permanently removed.
                        </p>
                      </div>
                      <button
                        onClick={handleDeleteUser}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} />
                            Delete User Account
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetailPage;