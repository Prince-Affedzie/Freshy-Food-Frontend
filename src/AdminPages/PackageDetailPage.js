// PackageDetailPage.jsx — Fully Responsive & Professional
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CubeIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getPackageById, deletePackage, togglePackageStatus } from '../Apis/packageApi';
import AdminSidebar from '../Components/AdminComponents/adminSidebar';


const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchPackageDetails();
  }, [id]);

  const fetchPackageDetails = async () => {
    setLoading(true);
    try {
      const res = await getPackageById(id);
      setPackageData(res.data);
    } catch (error) {
      toast.error('Failed to load package');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePackage(id);
      toast.success('Package deleted');
      navigate('/admin-packages');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleToggleStatus = async () => {
    try {
      await togglePackageStatus(id);
      toast.success(packageData.isActive ? 'Package deactivated' : 'Package activated');
      fetchPackageDetails();
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  const calculateEstimatedValue = () => {
    if (!packageData?.defaultItems) return 0;
    return packageData.defaultItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  };

  const calculateSavings = () => {
    const value = calculateEstimatedValue();
    if (!value || !packageData?.basePrice) return 0;
    return ((value - packageData.basePrice) / value * 100).toFixed(1);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800">Package Not Found</h3>
          <p className="text-gray-600 mt-2">This package doesn't exist or has been removed.</p>
          <Link to="/admin-packages" className="mt-6 inline-flex items-center gap-2 text-blue-600 font-medium">
            <ArrowLeftIcon className="h-5 w-5" /> Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  const estimatedValue = calculateEstimatedValue();
  const savings = calculateSavings();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/admin-packages" className="p-2 rounded-lg hover:bg-gray-100">
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    {packageData.name}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${packageData.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {packageData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-1">{packageData.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/admin-package/edit/${id}`}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl transition"
                >
                  <PencilIcon className="h-5 w-5" /> Edit
                </Link>
                <button
                  onClick={handleToggleStatus}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition ${packageData.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  {packageData.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-3 rounded-xl transition"
                >
                  <TrashIcon className="h-5 w-5" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Package Image */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 bg-gray-800">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CubeIcon className="h-6 w-6" /> Package Image
                  </h2>
                </div>
                <div className="p-6 bg-gray-50">
                  <div className="mx-auto max-w-md">
                    <div className="relative group rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src={packageData.image}
                        alt={packageData.name}
                        className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="text-white">
                          <p className="text-xl font-bold">{packageData.name}</p>
                          <p className="text-sm opacity-90">₵{packageData.basePrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                  <div className="flex flex-wrap">
                    {[
                      { key: 'details', label: 'Details' },
                      { key: 'default', label: `Default Items (${packageData.defaultItems?.length || 0})` },
                      { key: 'swap', label: `Swap Options (${packageData.swapOptions?.length || 0})` },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 px-4 py-4 text-sm font-medium border-b-2 transition ${activeTab === tab.key ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                        <p className="text-gray-900 leading-relaxed">{packageData.description}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="h-10 w-10 text-blue-600 bg-blue-100 p-2 rounded-lg" />
                          <div>
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="font-medium">{formatDate(packageData.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ClockIcon className="h-10 w-10 text-purple-600 bg-purple-100 p-2 rounded-lg" />
                          <div>
                            <p className="text-sm text-gray-600">Updated</p>
                            <p className="font-medium">{formatDate(packageData.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'default' && (
                    <div className="space-y-4">
                      {packageData.defaultItems?.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">No default items</p>
                      ) : (
                        packageData.defaultItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <img src={item.product?.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="font-medium">{item.product?.name}</p>
                              <p className="text-sm text-gray-600">{item.product?.category} • ₵{item.product?.price} / {item.product?.unit}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{item.quantity} pcs</p>
                              <p className="text-sm text-gray-600">₵{(item.product?.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'swap' && (
                    <div className="space-y-4">
                      {packageData.swapOptions?.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">No swap options</p>
                      ) : (
                        packageData.swapOptions.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <img src={item.product?.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.product?.name}</p>
                                <span className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded-full">Swap</span>
                              </div>
                              <p className="text-sm text-gray-600">{item.product?.category} • ₵{item.product?.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{item.quantity} pcs</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <CurrencyDollarIcon className="h-8 w-8" /> Pricing
                </h3>
                <div className="text-4xl font-extrabold">₵{packageData.basePrice.toFixed(2)}</div>
                <p className="mt-2 opacity-90">Customer Price</p>
                <div className="mt-6 p-4 bg-white/20 rounded-xl">
                  <p className="text-sm opacity-90">Value of Items</p>
                  <p className="text-2xl font-bold">₵{estimatedValue.toFixed(2)}</p>
                </div>
                {savings > 0 && (
                  <div className="mt-4 p-4 bg-green-600 rounded-xl">
                    <p className="text-3xl font-bold text-center">{savings}% OFF</p>
                    <p className="text-center text-sm mt-1">Great deal for customers!</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold mb-4">Package Summary</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Default Items</span><span className="font-medium">{packageData.defaultItems?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Swap Options</span><span className="font-medium">{packageData.swapOptions?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Status</span><span className={packageData.isActive ? 'text-emerald-600' : 'text-red-600'}>{packageData.isActive ? 'Active' : 'Inactive'}</span></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to={`/admin-package/edit/${id}`} className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                    <div className="flex items-center gap-3"><PencilIcon className="h-5 w-5 text-blue-600" /> Edit Package</div>
                    <ChevronRightIcon className="h-5 w-5 text-blue-600" />
                  </Link>
                  <button onClick={handleToggleStatus} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition text-left">
                    <div className="flex items-center gap-3"><ArrowPathIcon className="h-5 w-5 text-gray-700" /> {packageData.isActive ? 'Deactivate' : 'Activate'}</div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition text-left text-red-600">
                    <div className="flex items-center gap-3"><TrashIcon className="h-5 w-5" /> Delete Package</div>
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold">Delete Package?</h3>
              </div>
              <p className="text-gray-600 mb-8">
                Permanently delete <strong>"{packageData.name}"</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowDeleteModal(false)} className="px-6 py-3 border rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700">Delete Package</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PackageDetailPage;