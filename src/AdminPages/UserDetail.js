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
  Award
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
    if (id) fetchUser();
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
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      setIsDeleting(true);
      await deleteAUser(id);
      navigate('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAdmin = async () => {
    try {
      await toggleAdmin(id);
      fetchUser();
    } catch (err) {
      console.error('Error toggling admin status:', err);
      alert('Failed to update admin status.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
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
    if (fullName === 'Unnamed User') return 'UU';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  };

  if (loading) {
    return (
      <AdminLayout title="User Details">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
            <p className="mt-5 text-gray-600 font-medium">Loading user profile...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout title="User Details">
        <div className="p-6 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Users
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-red-800 mb-3">User Not Found</h2>
            <p className="text-red-700 mb-6 max-w-md mx-auto">{error || 'The requested user could not be found.'}</p>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors shadow-sm"
            >
              Return to Users List
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Details">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Profile Header + Quick Stats ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 px-6 py-10 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/40 shadow-lg">
                    <span className="text-3xl font-bold text-white tracking-wider">{getInitials()}</span>
                  </div>
                  {user.isAdmin && (
                    <div className="absolute -bottom-2 -right-2 bg-violet-600 p-2 rounded-full border-4 border-white shadow-md">
                      <Shield size={20} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-1.5">{getFullName()}</h1>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-1.5 bg-white/25 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}
                    </span>
                    {user.isAdmin && (
                      <span className="px-4 py-1.5 bg-violet-500/40 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1.5">
                        <Shield size={14} /> Administrator
                      </span>
                    )}
                    <span className="flex items-center gap-2 text-white/90 text-sm font-medium">
                      <Calendar size={15} />
                      Joined {formatDate(user.createdAt).split(',')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-start sm:self-center">
                <button
                  onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-all"
                >
                  <Edit size={17} />
                  Edit Profile
                </button>
                <button className="p-2.5 text-white hover:bg-white/15 rounded-lg transition-colors">
                  <MoreVertical size={22} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-700 mb-1">{user.cartItems?.length || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <ShoppingCart size={16} /> Cart Items
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">{user.favorites?.length || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <Heart size={16} /> Favorites
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-700 mb-1">{user.orders?.length || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <Package size={16} /> Orders
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-700 mb-1">
                {(() => {
                  const diff = Math.floor((Date.now() - new Date(user.updatedAt)) / 86400000);
                  return diff === 0 ? 'Today' : `${diff}d ago`;
                })()}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <Clock size={16} /> Last Active
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs Container ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {['overview', 'orders', 'activity', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 lg:p-8">
            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Personal Information */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2.5">
                    <User size={20} className="text-emerald-600" />
                    Personal Information
                  </h3>
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 md:p-7">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1.5">Full Name</dt>
                        <dd className="text-gray-900 font-medium flex items-center gap-2.5">
                          <User size={16} className="text-gray-400" />
                          {getFullName()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1.5">Email Address</dt>
                        <dd className="text-gray-900 font-medium flex items-center gap-2.5 break-all">
                          <Mail size={16} className="text-gray-400 shrink-0" />
                          {user.email || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1.5">Phone Number</dt>
                        <dd className="text-gray-900 font-medium flex items-center gap-2.5">
                          <Phone size={16} className="text-gray-400" />
                          {user.phone || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1.5">Account Type</dt>
                        <dd className="mt-1">
                          {user.isAdmin ? (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                              <Shield size={14} /> Administrator
                            </span>
                          ) : (
                            <span className="inline-flex px-3.5 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1.5">Member Since</dt>
                        <dd className="text-gray-900 font-medium flex items-center gap-2.5">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(user.createdAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1.5">Last Updated</dt>
                        <dd className="text-gray-900 font-medium flex items-center gap-2.5">
                          <Clock size={16} className="text-gray-400" />
                          {formatDate(user.updatedAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </section>

                {/* Location Information */}
                {(user.address || user.city || user.nearestLandmark) && (
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2.5">
                      <MapPin size={20} className="text-emerald-600" />
                      Location Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 md:p-7">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {user.city && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1.5">City</dt>
                            <dd className="text-gray-900 font-medium flex items-center gap-2.5">
                              <Building size={16} className="text-gray-400" />
                              {user.city}
                            </dd>
                          </div>
                        )}
                        {user.address && (
                          <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-gray-500 mb-1.5">Full Address</dt>
                            <dd className="text-gray-900 font-medium flex items-start gap-2.5 leading-relaxed">
                              <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                              {user.address}
                            </dd>
                          </div>
                        )}
                        {user.nearestLandmark && (
                          <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-gray-500 mb-1.5">Nearest Landmark</dt>
                            <dd className="text-gray-900 font-medium flex items-start gap-2.5 leading-relaxed">
                              <Flag size={16} className="text-gray-400 mt-0.5 shrink-0" />
                              {user.nearestLandmark}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Order History</h3>
                  <span className="text-sm text-gray-600 font-medium">
                    {user.orders?.length || 0} orders total
                  </span>
                </div>

                {user.orders?.length > 0 ? (
                  <div className="space-y-6">
                    {user.orders.map((order, index) => (
                      <div 
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Completed
                              </span>
                              <span className="text-sm text-gray-500">
                                #{order.orderId?.slice(0,8) || '—'}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 text-lg">Grocery Order</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              ₵{Number(order.totalAmount || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {formatDate(order.createdAt).split(',')[0]}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Truck size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Delivery</div>
                              <div className="text-sm text-gray-600">Standard Shipping</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <CreditCard size={20} className="text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Payment</div>
                              <div className="text-sm text-gray-600">Credit Card • Paid</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 rounded-lg">
                              <Package size={20} className="text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Items</div>
                              <div className="text-sm text-gray-600">
                                {order.items?.length || '?'} items
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-6">
                          <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1.5">
                            View Full Order →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
                    <Package size={72} className="mx-auto text-gray-300 mb-6" />
                    <h4 className="text-2xl font-semibold text-gray-700 mb-3">No Orders Yet</h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      This user hasn't placed any orders yet. They might be a new customer or still browsing.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Activity & Settings tabs can be similarly improved if needed */}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetailPage;