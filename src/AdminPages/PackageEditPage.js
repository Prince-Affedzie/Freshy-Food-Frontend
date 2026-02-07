// PackageEditPage.jsx — Fully Responsive + Real-Time Search
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  CameraIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getPackageById, updatePackage } from '../Apis/packageApi';
import { searchProducts } from '../Apis/productApi';
import AdminSidebar from '../Components/AdminComponents/adminSidebar';


const PackageEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', description: '', basePrice: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [defaultItems, setDefaultItems] = useState([]);
  const [swapOptions, setSwapOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState(0);

  useEffect(() => {
    fetchPackageData();
  }, [id]);

  useEffect(() => {
    const total = defaultItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setEstimatedValue(total);
  }, [defaultItems]);

  // Real-time search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPackageData = async () => {
    setLoading(true);
    try {
      const res = await getPackageById(id);
      const pkg = res.data;

      setFormData({
        name: pkg.name,
        description: pkg.description,
        basePrice: pkg.basePrice,
      });
      setImagePreview(pkg.image);

      setDefaultItems(
        pkg.defaultItems.map(i => ({
          product: i.product,
          quantity: i.quantity,
        }))
      );

      setSwapOptions(
        pkg.swapOptions?.map(i => ({
          product: i.product,
          quantity: i.quantity,
        })) || []
      );
    } catch (error) {
      toast.error('Failed to load package');
      navigate('/admin-packages');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (term) => {
    setSearchLoading(true);
    try {
      const res = await searchProducts(term);
      const existingIds = [
        ...defaultItems.map(i => i.product._id),
        ...swapOptions.map(i => i.product._id),
      ];
      const filtered = res.data.suggestions.filter(p => !existingIds.includes(p._id));
      setSearchResults(filtered);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Invalid image type');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addDefaultItem = (product) => {
    setDefaultItems(prev => [...prev, { product, quantity: 1 }]);
    setSearchTerm('');
    setSearchResults([]);
    toast.success('Added to default items');
  };

  const addSwapOption = (product) => {
    setSwapOptions(prev => [...prev, { product, quantity: 1 }]);
    setSearchTerm('');
    setSearchResults([]);
    toast.success('Added as swap option');
  };

  const updateQuantity = (id, qty, isSwap = false) => {
    const setter = isSwap ? setSwapOptions : setDefaultItems;
    setter(prev => prev.map(item =>
      item.product._id === id ? { ...item, quantity: Math.max(1, qty) } : item
    ));
  };

  const removeProduct = (id, isSwap = false) => {
    const setter = isSwap ? setSwapOptions : setDefaultItems;
    setter(prev => prev.filter(item => item.product._id !== id));
  };

  const calculateSavings = () => {
    if (!formData.basePrice || estimatedValue === 0) return 0;
    return ((estimatedValue - parseFloat(formData.basePrice)) / estimatedValue * 100).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.basePrice || defaultItems.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('basePrice', formData.basePrice);
    data.append('defaultItems', JSON.stringify(defaultItems.map(i => ({ product: i.product._id, quantity: i.quantity }))));
    data.append('swapOptions', JSON.stringify(swapOptions.map(i => ({ product: i.product._id, quantity: i.quantity }))));
    if (imageFile) data.append('image', imageFile);

    setSaving(true);
    try {
      await updatePackage(id, data);
      toast.success('Package updated!');
      navigate(`/admin-package/${id}`);
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center gap-4">
              <Link to={`/admin-package/${id}`} className="p-2 rounded-lg hover:bg-gray-100">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Package</h1>
                <p className="text-sm text-gray-600">Update contents, pricing & image</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Package Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Package Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₵) *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Package Image</label>
                    <div className="flex items-center gap-6">
                      <img src={imagePreview} alt="Package" className="h-32 w-32 rounded-xl object-cover border shadow-md" />
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        <div className="px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition">
                          <CameraIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium">Change Image</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Real-Time Product Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-4">Add Products</h2>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products to add..."
                      className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                    />
                    {searchLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="mt-3 border rounded-xl shadow-lg bg-white max-h-96 overflow-y-auto">
                      {searchResults.map(p => (
                        <div key={p._id} className="p-4 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-sm text-gray-500">₵{p.price} • {p.unit}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => addDefaultItem(p)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                            >
                              Default
                            </button>
                            <button
                              type="button"
                              onClick={() => addSwapOption(p)}
                              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                            >
                              Swap
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Default & Swap Items */}
                {defaultItems.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Default Items ({defaultItems.length})</h3>
                    <div className="space-y-4">
                      {defaultItems.map(item => (
                        <div key={item.product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <img src={item.product.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">₵{item.product.price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="w-10 h-10 rounded-lg border hover:bg-gray-200">-</button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="w-10 h-10 rounded-lg border hover:bg-gray-200">+</button>
                            <button onClick={() => removeProduct(item.product._id)} className="text-red-600 p-2"><TrashIcon className="h-5 w-5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {swapOptions.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-purple-800">Swap Options ({swapOptions.length})</h3>
                    <div className="space-y-4">
                      {swapOptions.map(item => (
                        <div key={item.product._id} className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                          <img src={item.product.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-purple-700">Swap Option</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.product._id, item.quantity - 1, true)} className="w-10 h-10 rounded-lg border hover:bg-purple-100">-</button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product._id, item.quantity + 1, true)} className="w-10 h-10 rounded-lg border hover:bg-purple-100">+</button>
                            <button onClick={() => removeProduct(item.product._id, true)} className="text-red-600 p-2"><TrashIcon className="h-5 w-5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Pricing Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold mb-6">Pricing Summary</h3>
                  <div className="space-y-5">
                    <div className="p-5 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold">₵{estimatedValue.toFixed(2)}</p>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-xl">
                      <p className="text-sm text-gray-700">Your Price</p>
                      <p className="text-3xl font-bold text-blue-600">₵{parseFloat(formData.basePrice || 0).toFixed(2)}</p>
                    </div>
                    {formData.basePrice && estimatedValue > 0 && (
                      <div className={`p-5 rounded-xl ${calculateSavings() > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <p className="text-sm font-medium">{calculateSavings() > 0 ? 'Customer Saves' : 'Premium Price'}</p>
                        <p className={`text-2xl font-bold ${calculateSavings() > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {Math.abs(calculateSavings())}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold mb-6">Actions</h3>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Package'}
                  </button>
                  <Link
                    to={`/admin-package/${id}`}
                    className="block w-full text-center mt-3 py-4 border rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PackageEditPage;