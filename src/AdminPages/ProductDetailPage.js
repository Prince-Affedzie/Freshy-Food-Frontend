// ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  TagIcon,
  CubeIcon,
  ArchiveBoxIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProductById, deleteProduct } from '../Apis/productApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await getProductById(id);
      setProduct(response.data);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin-products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      navigate('/admin-products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleToggleStatus = async () => {
    toast.success(`Product ${product.isAvailable ? 'deactivated' : 'activated'}`);
    // await toggleProductStatus(id);
    fetchProductDetails();
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getCategoryDisplay = (cat) => ({
    vegetable: 'Vegetable', fruit: 'Fruit', staple: 'Staple',
    herb: 'Herb', tuber: 'Tuber', other: 'Other'
  }[cat] || cat);

  const getUnitDisplay = (unit) => ({
    kg: 'Kilogram (kg)', g: 'Gram (g)', piece: 'Piece', pieces: 'Pieces',
    bunch: 'Bunch', bag: 'Bag', pack: 'Pack', basket: 'Basket', olonka: 'Olonka'
  }[unit] || unit);

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    if (stock <= 10) return { text: `Low Stock (${stock})`, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { text: `In Stock (${stock})`, color: 'bg-green-100 text-green-700 border-green-200' };
  };

  const stockInfo = product && getStockStatus(product.countInStock);
  const stockPercentage = product ? Math.min((product.countInStock / 100) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800">Product Not Found</h3>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
          <Link to="/admin-products" className="mt-6 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium">
            <ArrowLeftIcon className="h-5 w-5" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  to="/admin-products"
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    {product.name}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      product.isAvailable
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.isAvailable ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                      {product.isAvailable ? 'Active' : 'Inactive'}
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-1 max-w-2xl">{product.description || 'No description provided'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/admin-product/edit/${id}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-5 py-3 rounded-xl shadow-md transition-all duration-300"
                >
                  <PencilIcon className="h-5 w-5" /> Edit Product
                </Link>
                <button
                  onClick={handleToggleStatus}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-md ${
                    product.isAvailable
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  {product.isAvailable ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-5 py-3 rounded-xl shadow-md transition-all duration-300"
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
              {/* Product Image */}
              {/* Product Image - Clean & Professional */}
<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
  <div className="p-5 bg-gray-800">
    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
      <CubeIcon className="h-5 w-5" />
      Product Image
    </h2>
  </div>

  <div className="p-6 bg-gray-50">
    <div className="mx-auto max-w-md">
      <div className="relative group rounded-xl overflow-hidden shadow-xl bg-white">
        {/* Main Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-5 text-white">
            <p className="text-lg font-semibold">{product.name}</p>
            <p className="text-sm opacity-90">
              {getCategoryDisplay(product.category)} • {getUnitDisplay(product.unit)}
            </p>
          </div>
        </div>

        {/* Optional: Zoom Indicator */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
          Hover to zoom
        </div>
      </div>

      {/* Image Info Below */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>High-quality product image</p>
        <p className="text-xs text-gray-500 mt-1">
          Uploaded {formatDate(product.createdAt)}
        </p>
      </div>
    </div>
  </div>
</div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    {['details', 'inventory', 'analytics'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-5 px-6 text-sm font-semibold capitalize transition-all duration-300 border-b-2 ${
                          activeTab === tab
                            ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {tab === 'details' ? 'Product Details' : tab === 'inventory' ? 'Inventory' : 'Analytics'}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-8">
                  {activeTab === 'details' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                        <p className="text-gray-600 leading-relaxed">{product.description || 'No description provided'}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-5">
                          <h4 className="text-sm font-medium text-gray-500">Category</h4>
                          <p className="mt-2 text-lg font-semibold text-gray-900">{getCategoryDisplay(product.category)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5">
                          <h4 className="text-sm font-medium text-gray-500">Unit</h4>
                          <p className="mt-2 text-lg font-semibold text-gray-900">{getUnitDisplay(product.unit)}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Product URL</h4>
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono bg-white px-3 py-2 rounded-lg border">
                            /products/{product.slug}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`);
                              toast.success('URL copied!');
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="h-10 w-10 text-emerald-600 bg-emerald-100 p-2 rounded-lg" />
                          <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="font-medium">{formatDate(product.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ClockIcon className="h-10 w-10 text-purple-600 bg-purple-100 p-2 rounded-lg" />
                          <div>
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="font-medium">{formatDate(product.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'inventory' && (
                    <div className="text-center py-12">
                      <ArchiveBoxIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700">Inventory History Coming Soon</h3>
                      <p className="text-gray-500 mt-2">Track stock movements, restocks, and alerts</p>
                    </div>
                  )}

                  {activeTab === 'analytics' && (
                    <div className="text-center py-12">
                      <ChartBarIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700">Analytics Coming Soon</h3>
                      <p className="text-gray-500 mt-2">Sales performance, views, and customer insights</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
                  <CurrencyDollarIcon className="h-8 w-8" /> Pricing
                </h3>
                <div className="text-4xl font-extrabold">₵{product.price?.toFixed(2)}</div>
                <p className="text-emerald-100 mt-1">per {getUnitDisplay(product.unit)}</p>
              </div>

              {/* Stock Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <ArchiveBoxIcon className="h-7 w-7 text-emerald-600" /> Inventory
                </h3>
                <div className="text-3xl font-bold text-gray-900">{product.countInStock} units</div>
                <div className={`mt-3 px-4 py-2 rounded-full text-sm font-semibold inline-block ${stockInfo.color}`}>
                  {stockInfo.text}
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        product.countInStock === 0 ? 'bg-red-500' :
                        product.countInStock <= 10 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>
                </div>
                {product.countInStock <= 10 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800 font-medium">
                      {product.countInStock === 0 ? 'Out of stock!' : 'Running low on stock!'} Restock recommended.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-mono">{product._id?.slice(-8)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium">{getCategoryDisplay(product.category)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Unit</span><span className="font-medium">{getUnitDisplay(product.unit)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={product.isAvailable ? 'text-emerald-600' : 'text-red-600'}>{product.isAvailable ? 'Active' : 'Inactive'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Delete Product?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Permanently delete <span className="font-bold text-gray-900">"{product.name}"</span>? This action <strong>cannot be undone</strong>.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
                <ul className="space-y-1">
                  <li>→ Removed from all listings</li>
                  <li>→ Image deleted from Cloudinary</li>
                  <li>→ Sales history preserved</li>
                </ul>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition shadow-lg"
                >
                  Yes, Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;