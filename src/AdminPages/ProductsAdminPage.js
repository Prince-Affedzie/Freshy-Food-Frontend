// ProductsAdminPage.jsx — Fully Responsive & Beautiful
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllProducts } from '../Apis/productApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';


const ProductsAdminPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    isAvailable: '',
    sort: 'name',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    averagePrice: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [filters.page, filters.category, filters.sort, filters.isAvailable]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const apiFilters = { ...filters };
      if (apiFilters.search === '') delete apiFilters.search;
      if (apiFilters.minPrice === '') delete apiFilters.minPrice;
      if (apiFilters.maxPrice === '') delete apiFilters.maxPrice;
      if (apiFilters.isAvailable === '') delete apiFilters.isAvailable;

      const response = await getAllProducts(apiFilters);
      const data = response.data;

      setProducts(data.data || []);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        total: data.total || 0,
        hasNextPage: data.pagination?.hasNextPage || false,
        hasPrevPage: data.pagination?.hasPrevPage || false
      });

      if (data.data) {
        const total = data.data.length;
        const inStock = data.data.filter(p => p.countInStock > 0).length;
        const outOfStock = data.data.filter(p => p.countInStock === 0).length;
        const lowStock = data.data.filter(p => p.isLowStock).length;
        const averagePrice = total > 0 ? (data.data.reduce((sum, p) => sum + p.price, 0) / total).toFixed(2) : 0;

        setStats({ total, inStock, outOfStock, lowStock, averagePrice });
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setSelectedProducts(new Set());
  };

  const clearFilters = () => {
    setFilters({
      search: '', category: 'all', minPrice: '', maxPrice: '',
      isAvailable: '', sort: 'name', page: 1, limit: 20
    });
    setSelectedProducts(new Set());
  };

  const handleSelectProduct = (id) => {
    const newSet = new Set(selectedProducts);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedProducts(newSet);
  };

  const handleSelectAll = () => {
    setSelectedProducts(selectedProducts.size === products.length
      ? new Set()
      : new Set(products.map(p => p.id))
    );
  };

  const formatPrice = (price) => `₵${price.toFixed(2)}`;
  const getCategoryDisplay = (c) => ({ vegetable: 'Vegetable', fruit: 'Fruit', staple: 'Staple', herb: 'Herb', tuber: 'Tuber', other: 'Other' }[c] || c);
  const getUnitDisplay = (u) => ({ kg: 'kg', g: 'g', piece: 'pc', pieces: 'pcs', bunch: 'bunch', bag: 'bag', pack: 'pack', basket: 'basket', olonka: 'olonka' }[u] || u);

  const getStockBadge = (p) => {
    if (p.countInStock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    if (p.isLowStock) return { text: `Low (${p.countInStock})`, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { text: `In Stock (${p.countInStock})`, color: 'bg-green-100 text-green-700 border-green-200' };
  };

  return (
    
    <div className="min-h-screen bg-gray-50">
      <AdminLayout title="Products Management">
      
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage inventory, pricing, and availability</p>
            </div>
            <Link
              to="/add-product"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl transition"
            >
              <PlusIcon className="h-5 w-5" /> Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: ArchiveBoxIcon, color: 'blue' },
            { label: 'In Stock', value: stats.inStock, icon: CheckCircleIcon, color: 'green' },
            { label: 'Out of Stock', value: stats.outOfStock, icon: ExclamationCircleIcon, color: 'red' },
            { label: 'Low Stock', value: stats.lowStock, icon: ExclamationTriangleIcon, color: 'yellow' },
            { label: 'Avg. Price', value: `₵${stats.averagePrice}`, icon: CurrencyDollarIcon, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[
                    { v: 'all', l: 'All Categories' },
                    { v: 'vegetable', l: 'Vegetables' },
                    { v: 'fruit', l: 'Fruits' },
                    { v: 'staple', l: 'Staples' },
                    { v: 'herb', l: 'Herbs' },
                    { v: 'tuber', l: 'Tubers' },
                    { v: 'other', l: 'Other' },
                  ].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <select
                  value={filters.isAvailable}
                  onChange={(e) => handleFilterChange('isAvailable', e.target.value)}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Availability</option>
                  <option value="true">Available Only</option>
                  <option value="false">Hidden Only</option>
                </select>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="font-medium text-blue-800">{selectedProducts.size} selected</p>
              <div className="flex gap-2">
                <select className="px-4 py-2 border rounded-lg text-sm">
                  <option>Bulk Actions</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="delete">Delete</option>
                </select>
                <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">Apply</button>
                <button onClick={() => setSelectedProducts(new Set())} className="text-sm text-blue-700">Clear</button>
              </div>
            </div>
          </div>
        )}

        {/* Products List - Card View on Mobile, Table on Desktop */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <ArchiveBoxIcon className="h-16 w-16 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="text-gray-600 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left"><input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.size === products.length} /></th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((p) => {
                      const stock = getStockBadge(p);
                      return (
                        <tr key={p.id} className={`hover:bg-gray-50 ${selectedProducts.has(p.id) ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4"><input type="checkbox" checked={selectedProducts.has(p.id)} onChange={() => handleSelectProduct(p.id)} /></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover border" />
                              <div>
                                <p className="font-medium text-gray-900">{p.name}</p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">{p.description || 'No description'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm px-3 py-1 bg-gray-100 rounded-full">{getCategoryDisplay(p.category)}</span></td>
                          <td className="px-6 py-4"><span className="font-medium">{formatPrice(p.price)}</span><br/><span className="text-sm text-gray-500">per {getUnitDisplay(p.unit)}</span></td>
                          <td className="px-6 py-4"><span className={`text-xs px-3 py-1 rounded-full border font-medium ${stock.color}`}>{stock.text}</span></td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${p.isAvailable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                              {p.isAvailable ? 'Available' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link to={`/admin-product/${p.id}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><EyeIcon className="h-5 w-5" /></Link>
                              <Link to={`/admin-product/edit/${p.id}`} className="text-green-600 hover:bg-green-50 p-2 rounded"><PencilIcon className="h-5 w-5" /></Link>
                              <button className="text-red-600 hover:bg-red-50 p-2 rounded"><TrashIcon className="h-5 w-5" /></button>
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
                {products.map((p) => {
                  const stock = getStockBadge(p);
                  return (
                    <div key={p.id} className={`p-5 border-b last:border-b-0 ${selectedProducts.has(p.id) ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <input type="checkbox" checked={selectedProducts.has(p.id)} onChange={() => handleSelectProduct(p.id)} className="mt-1" />
                        <div className="flex gap-2">
                          <Link to={`/admin-product/${p.id}`} className="text-blue-600"><EyeIcon className="h-5 w-5" /></Link>
                          <Link to={`/admin-product/edit/${p.id}`} className="text-green-600"><PencilIcon className="h-5 w-5" /></Link>
                          <button className="text-red-600"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <img src={p.image} alt="" className="h-20 w-20 rounded-lg object-cover border flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{p.name}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description || 'No description'}</p>
                          <div className="flex flex-wrap gap-2 mt-3 text-sm">
                            <span className="px-2 py-1 bg-gray-100 rounded">{getCategoryDisplay(p.category)}</span>
                            <span className={`px-2 py-1 rounded border font-medium ${stock.color}`}>{stock.text}</span>
                            <span className={`px-2 py-1 rounded border font-medium ${p.isAvailable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                              {p.isAvailable ? 'Available' : 'Hidden'}
                            </span>
                          </div>
                          <p className="mt-2 font-medium text-gray-900">{formatPrice(p.price)} <span className="text-gray-500 text-sm">/ {getUnitDisplay(p.unit)}</span></p>
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
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * filters.limit + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button disabled={!pagination.hasPrevPage} onClick={() => handleFilterChange('page', pagination.currentPage - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
              <button disabled={!pagination.hasNextPage} onClick={() => handleFilterChange('page', pagination.currentPage + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
      </AdminLayout>
    </div>
    
  );
};

export default ProductsAdminPage;