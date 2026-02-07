// ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getProductById, deleteProduct } from '../Apis/productApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

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
      const res = await getProductById(id);
      if (res.data?.success && res.data?.data) {
        setProduct(res.data.data);
      } else {
        throw new Error('Invalid product data');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load product');
      navigate('/admin-products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      navigate('/admin-products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleAvailability = async () => {
    // await toggleProductStatus(id);   // implement when ready
    toast.info(`Product ${product.isAvailable ? 'deactivated' : 'activated'}`);
    fetchProductDetails();
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : '—';

  const getCategoryDisplay = (cat) =>
    product?.categoryDisplay ||
    ({
      vegetable: 'Vegetables',
      fruit: 'Fruits',
      staple: 'Staples',
      herb: 'Herbs',
      tuber: 'Tubers',
      other: 'Other',
    }[cat] || cat || '—');

  const getUnitDisplay = (unit) =>
    product?.unitDisplay ||
    ({
      kg: 'kg',
      g: 'g',
      piece: 'pc',
      pieces: 'pcs',
      bunch: 'bunch',
      bag: 'bag',
      pack: 'pack',
      basket: 'basket',
      olonka: 'Olonka',
    }[unit] || unit || '—');

  const getStockInfo = (stock = 0) => {
    if (stock === 0) return { text: 'Out of stock', color: 'text-red-600 bg-red-50' };
    if (stock <= 10) return { text: `Low stock (${stock})`, color: 'text-amber-600 bg-amber-50' };
    return { text: `In stock (${stock})`, color: 'text-emerald-600 bg-emerald-50' };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Product not found</h2>
            <Link
              to="/admin-products"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to products
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stockInfo = getStockInfo(product.countInStock);

  return (
    <AdminLayout>
      <ToastContainer position="top-right" autoClose={3000} theme="light" limit={2} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb + Title + Admin Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <nav className="flex text-sm text-gray-500">
              <Link to="/admin-products" className="hover:text-gray-700">Products</Link>
              <span className="mx-2">/</span>
              <span className="font-medium text-gray-900">{product.name}</span>
            </nav>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/admin-product/edit/${id}`}
              className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Link>

            <button
              onClick={handleToggleAvailability}
              className={`inline-flex items-center gap-1.5 rounded border px-4 py-2 text-sm font-medium ${
                product.isAvailable
                  ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <ArrowPathIcon className="h-4 w-4" />
              {product.isAvailable ? 'Deactivate' : 'Activate'}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left - Image + Description */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg border bg-white">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-contain"
              />
            </div>

            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Description</h2>
              <p className="text-gray-700">{product.description || 'No description provided.'}</p>
            </div>

            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Details</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-medium">{getCategoryDisplay(product.category)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Unit</dt>
                  <dd className="font-medium">{getUnitDisplay(product.unit)}</dd>
                </div>
                {product.shelfLifeDays && (
                  <div>
                    <dt className="text-gray-500">Shelf life</dt>
                    <dd className="font-medium">{product.shelfLifeDays} days</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Right - Price, Stock, Status, Quick actions */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-emerald-600">
                  {product.priceDisplay || `₵${Number(product.price || 0).toFixed(2)}`}
                </span>
                <span className="text-gray-500">/ {getUnitDisplay(product.unit)}</span>
              </div>

              <div className="mb-4 flex items-center gap-2">
                {product.isAvailable ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${product.isAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                  {product.isAvailable ? 'Active' : 'Inactive'}
                </span>

                {product.isInSeason && (
                  <span className="ml-3 rounded bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                    In season
                  </span>
                )}
              </div>

              <div className={`mb-6 rounded px-4 py-2 text-center font-medium ${stockInfo.color}`}>
                {stockInfo.text}
              </div>

              <div className="text-sm text-gray-500">
                Added {formatDate(product.createdAt)} • Updated {formatDate(product.updatedAt)}
              </div>
            </div>

            {/* More info cards if needed */}
            {product.nutritionalInfo && (
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Nutrition</h2>
                <p className="text-gray-700">{product.nutritionalInfo}</p>
              </div>
            )}

            {product.storageTips && (
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Storage</h2>
                <p className="text-gray-700">{product.storageTips}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Delete product?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete <strong>{product.name}</strong>? This cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductDetailPage;