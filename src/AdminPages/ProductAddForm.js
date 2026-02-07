import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle, Loader2, Tag } from 'lucide-react';
import { createProduct } from '../Apis/productApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const categories = [
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'staple', label: 'Staple' },
  { value: 'herb', label: 'Herb' },
  { value: 'tuber', label: 'Tuber' },
  { value: 'grain', label: 'Grain' },
  { value: 'cereal', label: 'Cereal' },
  { value: 'meat', label: 'Meat' },
  { value: 'frozen-food', label: 'Frozen Food' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'spice', label: 'Spice' },
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
  { value: 'liter', label: 'Liter' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'box', label: 'Box' },
  { value: 'tin', label: 'Tin' },
  { value: 'jar', label: 'Jar' },
];

const tagOptions = [
  // General tags
  { value: 'featured', label: 'Featured', category: 'general' },
  { value: 'best_selling', label: 'Best Selling', category: 'general' },
  { value: 'new_arrival', label: 'New Arrival', category: 'general' },
  { value: 'discounted', label: 'Discounted', category: 'general' },
  { value: 'popular', label: 'Popular', category: 'general' },
  { value: 'seasonal', label: 'Seasonal', category: 'general' },
  
  // Grocery-specific tags
  { value: 'fresh_today', label: 'Fresh Today', category: 'grocery' },
  { value: 'farm_fresh', label: 'Farm Fresh', category: 'grocery' },
  { value: 'organic', label: 'Organic', category: 'grocery' },
  { value: 'locally_sourced', label: 'Locally Sourced', category: 'grocery' },
  { value: 'ready_to_cook', label: 'Ready to Cook', category: 'grocery' },
  { value: 'ready_to_eat', label: 'Ready to Eat', category: 'grocery' },
  { value: 'perishable', label: 'Perishable', category: 'grocery' },
  { value: 'non_perishable', label: 'Non-Perishable', category: 'grocery' },
];

const initialFormState = {
  name: '',
  slug: '',
  category: '',
  image: '',
  price: '',
  unit: '',
  countInStock: '0',
  isAvailable: true,
  description: '',
  brand: '',
  weight: '',
  dimensions: '',
  tags: [],
};

const ProductAddForm = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef(null);

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

  const validateForm = (formData, imageFile) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!imageFile && !formData.image) errors.image = 'Product image is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (formData.countInStock < 0) errors.countInStock = 'Stock cannot be negative';
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'name') {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTagToggle = (tagValue) => {
    setFormData((prev) => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tagValue)) {
        return {
          ...prev,
          tags: currentTags.filter(tag => tag !== tagValue)
        };
      } else {
        return {
          ...prev,
          tags: [...currentTags, tagValue]
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Only JPEG, PNG, GIF, WebP allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, image: file.name }));
    if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData, imageFile);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = key === 'price' || key === 'countInStock' ? Number(formData[key]) : formData[key];
      if (key === 'tags') {
        formData.tags.forEach(tag => {
          submitData.append('tags[]', tag);
        });
      } else {
        submitData.append(key, val);
      }
    });
    if (imageFile) submitData.append('productImage', imageFile);

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createProduct(submitData);
      setSuccessMessage('Product added successfully!');
      resetForm();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImageFile(null);
    setImagePreview('');
    setErrors({});
    setTagSearch('');
    setShowDropdown(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredTags = tagOptions.filter(tag =>
    tag.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
    tag.value.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const InputField = ({ label, name, type = 'text', placeholder, required = false, error, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={loading}
        className={`
          w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
          transition-colors duration-200
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
    </div>
  );

  const SelectField = ({ label, name, options, required = false, error, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        disabled={loading}
        className={`
          w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
          transition-colors duration-200
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
    </div>
  );

  const TextAreaField = ({ label, name, placeholder, rows = 4, required = false, error, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows={rows}
        disabled={loading}
        className={`
          w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
          transition-colors duration-200 resize-none
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
    </div>
  );

  return (
    <AdminLayout title="Add New Product">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="mt-2 text-gray-600">Fill in the details below to add a new product to your store</p>
          </div>

          {/* Alert Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-fade-in">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-800 font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Product Information</h2>
                  <p className="text-emerald-100 text-sm mt-1">All fields marked with * are required</p>
                </div>
                <div className="hidden sm:block">
                  <div className="bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="text-white font-medium">New Product</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Product Name"
                      name="name"
                      placeholder="Enter product name"
                      required
                      error={errors.name}
                    />
                    <InputField
                      label="Slug"
                      name="slug"
                      placeholder="Auto-generated slug"
                      required
                      error={errors.slug}
                    />
                    <SelectField
                      label="Category"
                      name="category"
                      options={categories}
                      required
                      error={errors.category}
                    />
                    <SelectField
                      label="Unit"
                      name="unit"
                      options={units}
                      required
                      error={errors.unit}
                    />
                    <InputField
                      label="Brand (Optional)"
                      name="brand"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                {/* Tags Section - NEW COMPACT VERSION */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Tags</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Select tags to categorize and highlight your product
                    </p>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>

                      <div 
                        className={`
                          min-h-[42px] w-full border rounded-lg px-3 py-2
                          focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500
                          ${errors.tags ? 'border-red-300' : 'border-gray-300'}
                          bg-white transition-colors
                        `}
                      >
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* Selected tags pills */}
                          {formData.tags.map((tagValue) => {
                            const tag = tagOptions.find(t => t.value === tagValue);
                            if (!tag) return null;
                            return (
                              <div
                                key={tag.value}
                                className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 pl-3 pr-2 py-1 rounded-full text-sm"
                              >
                                {tag.label}
                                <button
                                  type="button"
                                  onClick={() => handleTagToggle(tag.value)}
                                  className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded-full hover:bg-emerald-200 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })}

                          {/* Input for search */}
                          <input
                            type="text"
                            placeholder={formData.tags.length === 0 ? "Search or select tags..." : "Add more..."}
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            className="flex-1 min-w-[180px] outline-none bg-transparent text-sm py-1"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Dropdown */}
                      {showDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                          {filteredTags.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 italic">
                              No matching tags found
                            </div>
                          ) : (
                            filteredTags.map((tag) => {
                              const isSelected = formData.tags.includes(tag.value);
                              return (
                                <button
                                  key={tag.value}
                                  type="button"
                                  onClick={() => {
                                    handleTagToggle(tag.value);
                                    // Optional: clear search after pick
                                    // setTagSearch('');
                                  }}
                                  className={`
                                    w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors
                                    ${isSelected ? 'bg-emerald-50' : ''}
                                  `}
                                >
                                  <div className={`
                                    w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                                    ${isSelected 
                                      ? 'bg-emerald-500 border-emerald-500' 
                                      : 'border-gray-300'
                                    }
                                  `}>
                                    {isSelected && <CheckCircle size={14} className="text-white" />}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{tag.label}</div>
                                    <div className="text-xs text-gray-500">
                                      {tag.category === 'general' ? 'General' : 'Grocery-specific'}
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {formData.tags.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <InputField
                        label="Price"
                        name="price"
                        type="number"
                        placeholder="0.00"
                        required
                        error={errors.price}
                        min="0"
                        step="0.01"
                      />
                      <div className="absolute left-3 top-9 text-gray-500">$</div>
                    </div>
                    <InputField
                      label="Stock Quantity"
                      name="countInStock"
                      type="number"
                      placeholder="0"
                      error={errors.countInStock}
                      min="0"
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Availability</label>
                      <div className="flex items-center h-11 px-4 border border-gray-300 rounded-lg bg-white">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isAvailable"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <label htmlFor="isAvailable" className="text-gray-700">
                            Available for sale
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Weight (Optional)"
                      name="weight"
                      placeholder="e.g., 500g, 1kg"
                    />
                    <InputField
                      label="Dimensions (Optional)"
                      name="dimensions"
                      placeholder="e.g., 10x10x10 cm"
                    />
                  </div>
                  <TextAreaField
                    label="Description"
                    name="description"
                    placeholder="Describe your product in detail..."
                    rows={5}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Image</h3>
                  <div className="space-y-4">
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
                    }`}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="p-4 bg-emerald-100 rounded-full">
                            {imagePreview ? (
                              <Upload className="text-emerald-600" size={24} />
                            ) : (
                              <Camera className="text-emerald-600" size={24} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {imagePreview ? 'Change Image' : 'Upload Product Image'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              PNG, JPG, GIF, WebP up to 5MB
                            </p>
                          </div>
                          {errors.image && (
                            <p className="text-sm text-red-600">{errors.image}</p>
                          )}
                        </div>
                      </label>
                    </div>

                    {imagePreview && (
                      <div className="relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{imageFile?.name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {(imageFile?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={loading}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Adding Product...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Add Product
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Form Tips */}
          <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
            <h4 className="font-medium text-emerald-900 mb-3">📝 Tips for better product listings:</h4>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Use high-quality images with good lighting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Provide detailed descriptions including size, weight, and usage
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Use relevant tags to improve discoverability
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Keep stock quantities updated regularly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Use consistent units across similar products
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductAddForm;