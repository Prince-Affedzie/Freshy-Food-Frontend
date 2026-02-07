// PackagesAdminPage.jsx — Fully Responsive & Professional
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getAllPackages,
  deletePackage,
  togglePackageStatus,
  updatePackage,
} from '../Apis/packageApi';
import AdminSidebar from '../Components/AdminComponents/adminSidebar';


const PackagesAdminPage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', basePrice: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPackages();
  }, [currentPage, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => searchTerm && fetchPackages(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
      };
      const response = await getAllPackages(params);
      setPackages(response.data.data || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async () => {
    if (!selectedPackage) return;
    try {
      await deletePackage(selectedPackage.id);
      toast.success('Package deleted');
      fetchPackages();
      setShowDeleteModal(false);
      setSelectedPackage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const calculateEstimatedValue = (pkg) => {
    if (!pkg.defaultItems?.length) return 0;
    return pkg.defaultItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getValueStatus = (price, value) => {
    if (price > value * 1.3) return { text: 'High', color: 'text-red-600' };
    if (price > value * 1.1) return { text: 'Fair', color: 'text-yellow-600' };
    return { text: 'Good', color: 'text-green-600' };
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-gray-50 overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
                <p className="text-sm text-gray-600 mt-1">Create and manage basket packages</p>
              </div>
              <Link
                to="/add-package"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl transition"
              >
                <PlusIcon className="h-5 w-5" /> New Package
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Total Packages', value: packages.length, icon: ShoppingBagIcon, color: 'blue' },
              { label: 'Active', value: packages.filter(p => p.isActive).length, icon: CheckIcon, color: 'green' },
              { label: 'Avg. Value', value: `₵${(packages.reduce((a, p) => a + calculateEstimatedValue(p), 0) / Math.max(packages.length, 1)).toFixed(0)}`, icon: CurrencyDollarIcon, color: 'purple' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 text-${stat.color}-600`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                    <stat.icon className={`h-7 w-7 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="basePrice-desc">Price High to Low</option>
                  <option value="basePrice-asc">Price Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Packages List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading packages...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="p-12 text-center">
                <ArchiveBoxIcon className="h-16 w-16 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No packages found</h3>
                <p className="text-gray-600 mt-2">Create your first package</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Package</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Items</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Price & Value</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Created</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {packages.map((pkg) => {
                        const estValue = calculateEstimatedValue(pkg);
                        const valueStatus = getValueStatus(pkg.basePrice, estValue);
                        return (
                          <tr key={pkg._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <img src={pkg.image} alt="" className="h-14 w-14 rounded-xl object-cover border" />
                                <div>
                                  <p className="font-medium text-gray-900">{pkg.name}</p>
                                  <p className="text-sm text-gray-500 line-clamp-2 max-w-md">{pkg.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div>{pkg.defaultItems?.length || 0} items</div>
                              <div className="text-gray-500">{pkg.swapOptions?.length || 0} swaps</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium">₵{pkg.basePrice.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">Value: ₵{estValue.toFixed(2)}</div>
                              <div className={`text-xs font-medium ${valueStatus.color}`}>{valueStatus.text} deal</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${pkg.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                {pkg.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(pkg.createdAt)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <button onClick={() => navigate(`/admin-package/${pkg.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><EyeIcon className="h-5 w-5" /></button>
                                <button onClick={() => navigate(`/admin-package/edit/${pkg.id}`)} className="text-green-600 hover:bg-green-50 p-2 rounded"><PencilIcon className="h-5 w-5" /></button>
                                <button onClick={() => { setSelectedPackage(pkg); setShowDeleteModal(true); }} className="text-red-600 hover:bg-red-50 p-2 rounded"><TrashIcon className="h-5 w-5" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                  {packages.map((pkg) => {
                    const estValue = calculateEstimatedValue(pkg);
                    const valueStatus = getValueStatus(pkg.basePrice, estValue);
                    return (
                      <div key={pkg._id} className="p-5 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex gap-4">
                          <img src={pkg.image} alt="" className="h-24 w-24 rounded-xl object-cover border flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pkg.description}</p>
                            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                              <div>
                                <p className="text-gray-500">Items</p>
                                <p className="font-medium">{pkg.defaultItems?.length || 0} + {pkg.swapOptions?.length || 0} swaps</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Price</p>
                                <p className="font-medium">₵{pkg.basePrice.toFixed(2)}</p>
                                <p className={`text-xs ${valueStatus.color}`}>Value: ₵{estValue.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${pkg.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                {pkg.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <div className="flex gap-3">
                                <button onClick={() => navigate(`/admin-package/${pkg._id}`)} className="text-blue-600"><EyeIcon className="h-5 w-5" /></button>
                                <button onClick={() => navigate(`/admin-package/edit/${pkg._id}`)} className="text-green-600"><PencilIcon className="h-5 w-5" /></button>
                                <button onClick={() => { setSelectedPackage(pkg); setShowDeleteModal(true); }} className="text-red-600"><TrashIcon className="h-5 w-5" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && selectedPackage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full"><ExclamationTriangleIcon className="h-6 w-6 text-red-600" /></div>
                <h3 className="text-xl font-bold">Delete Package?</h3>
              </div>
              <p className="text-gray-600">Permanently delete <strong>"{selectedPackage.name}"</strong>? This cannot be undone.</p>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setShowDeleteModal(false); setSelectedPackage(null); }} className="px-5 py-2 border rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleDeletePackage} className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PackagesAdminPage;