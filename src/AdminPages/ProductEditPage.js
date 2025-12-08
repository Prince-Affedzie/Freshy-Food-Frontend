// ProductEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  CameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CubeIcon,
  TagIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProductById, updateProduct } from '../Apis/productApi';

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit: '',
    countInStock: '0',
    isAvailable: true,
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugPreview, setSlugPreview] = useState('');

  const categories = [
    { value: 'vegetable', label: 'Vegetable' },
    { value: 'fruit', label: 'Fruit' },
    { value: 'staple', label: 'Staple' },
    { value: 'herb', label: 'Herb' },
    { value: 'tuber', label: 'Tuber' },
    { value: 'other', label: 'Other' },
  ];

  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'piece', label: 'Piece' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'bag', label: 'Bag' },
    { value: 'pack', label: 'Pack' },
    { value: 'basket', label: 'Basket' },
    { value: 'olonka', label: 'Olonka' },
  ];

  useEffect(() => {
    fetchProductData();
  }, [id]);

  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
      setSlugPreview(slug);
    } else {
      setSlugPreview('');
    }
  }, [formData.name]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const response = await getProductById(id);
      const product = response.data;

      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        unit: product.unit || '',
        countInStock: product.countInStock?.toString() || '0',
        isAvailable: product.isAvailable ?? true,
        description: product.description || '',
      });

      setImagePreview(product.image || '');
      setSlugPreview(product.slug || '');
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, WebP images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    toast.success('New image selected');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.category) return toast.error('Please select a category');
    if (!formData.price || parseFloat(formData.price) <= 0) return toast.error('Enter a valid price');
    if (!formData.unit) return toast.error('Please select a unit');
    if (parseInt(formData.countInStock) < 0) return toast.error('Stock cannot be negative');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('category', formData.category);
    submitData.append('price', parseFloat(formData.price));
    submitData.append('unit', formData.unit);
    submitData.append('countInStock', parseInt(formData.countInStock));
    submitData.append('isAvailable', formData.isAvailable);
    submitData.append('description', formData.description || '');

    if (imageFile) submitData.append('productImage', imageFile);

    setSaving(true);
    try {
      await updateProduct(id, submitData);
      toast.success('Product updated successfully!');
      navigate(`/admin-product/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    fetchProductData();
    setImageFile(null);
    toast.info('Form reset to original values');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
            <Link
              to={`/admin-product/${id}`}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <PencilIcon className="h-7 w-7 text-blue-600" />
                Edit Product
              </h1>
              <p className="text-sm text-gray-600 mt-1">Update product details and inventory</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Product Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <InformationCircleIcon className="h-6 w-6 text-gray-700" />
                    Product Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. Fresh Tomatoes"
                      />
                      {slugPreview && (
                        <p className="mt-2 text-sm text-gray-500">
                          Slug: <span className="font-medium text-gray-700">/{slugPreview}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Choose category</option>
                          {categories.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Choose unit</option>
                          {units.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="Describe quality, origin, usage tips..."
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-700" />
                    Pricing & Inventory
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₵) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">₵</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        name="countInStock"
                        value={formData.countInStock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="0"
                      />
                      {parseInt(formData.countInStock) === 0 && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          Product is out of stock
                        </p>
                      )}
                      {parseInt(formData.countInStock) > 0 && parseInt(formData.countInStock) <= 10 && (
                        <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          Low stock ({formData.countInStock} left)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="isAvailable" className="text-base font-medium text-gray-800">
                      Product is available for sale
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 ml-9">
                    Uncheck to hide from customers while keeping product in system
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Image Upload */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <CubeIcon className="h-6 w-6 text-gray-700" />
                    Product Image
                  </h2>

                  <div className="space-y-5">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      <img
                        src={imagePreview}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                      {imageFile && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          NEW
                        </div>
                      )}
                    </div>

                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <CameraIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-700">
                          {imageFile ? 'Change Image' : 'Click to Upload New Image'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Max 5MB • JPEG, PNG, WebP</p>
                      </div>
                    </label>

                    {imageFile && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800">
                          Ready to upload: <span className="font-semibold">{imageFile.name}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">Live Preview</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium text-gray-900 truncate max-w-[160px]">
                        {formData.name || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price</span>
                      <span className="font-medium text-gray-900">
                        {formData.price ? `₵${parseFloat(formData.price).toFixed(2)}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock</span>
                      <span className={`font-medium ${
                        formData.countInStock == 0
                          ? 'text-red-600'
                          : parseInt(formData.countInStock) <= 10
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}>
                        {formData.countInStock} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`font-medium ${formData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.isAvailable ? 'Available' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions</h3>
                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md"
                    >
                      {saving ? (
                        'Saving...'
                      ) : (
                        <>
                          <CheckCircleIcon className="h-6 w-6" />
                          Save Changes
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full border border-gray-300 text-gray-700 font-medium py-4 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                      Reset Form
                    </button>

                    <Link
                      to={`/admin-product/${id}`}
                      className="block w-full text-center border border-gray-300 text-gray-700 font-medium py-4 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </Link>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 space-y-2">
                    <p className="flex items-center gap-2">
                      <TagIcon className="h-4 w-4" />
                      Slug auto-updates from name
                    </p>
                    <p className="flex items-center gap-2">
                      <ArchiveBoxIcon className="h-4 w-4" />
                      Images uploaded to Cloudinary
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductEditPage;