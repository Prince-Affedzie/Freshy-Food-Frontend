import React, { useState, useRef } from 'react';
import { createVendor } from '../Apis/vendorApi';
import toast from 'react-hot-toast';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const AddVendorPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    market_name: '',
    contact: '',
    location: '',
  });

  const [storeBanner, setStoreBanner] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'banner') {
      setStoreBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    } else {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = (type) => {
    if (type === 'banner') {
      setStoreBanner(null);
      setBannerPreview('');
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    } else {
      setProfileImage(null);
      setProfilePreview('');
      if (profileInputRef.current) profileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const { name, market_name, contact, location } = formData;
    if (!name.trim() || !market_name.trim() || !contact.trim() || !location.trim()) {
      toast.error('Please fill in all required fields.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('market_name', formData.market_name.trim());
    payload.append('contact', formData.contact.trim());
    payload.append('location', formData.location.trim());

    if (storeBanner) payload.append('store_banner', storeBanner);
    if (profileImage) payload.append('profile_image', profileImage);

    setLoading(true);
    try {
      const res = await createVendor(payload);
      if (res?.status === 201) {
        toast.success('Vendor created successfully!');
        setFormData({ name: '', market_name: '', contact: '', location: '' });
        setStoreBanner(null);
        setProfileImage(null);
        setBannerPreview('');
        setProfilePreview('');
        if (bannerInputRef.current) bannerInputRef.current.value = '';
        if (profileInputRef.current) profileInputRef.current.value = '';
        console.log('Created vendor:', res.data);
      }
    } catch (error) {
      const message = error?.message || 'Something went wrong.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Vendor</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below to onboard a new vendor to your fresh market.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Text fields grid */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 mb-8">
              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Mama's Fresh Veggies"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  required
                />
              </div>

              {/* Market Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="market_name"
                  value={formData.market_name}
                  onChange={handleChange}
                  placeholder="Downtown Farmers Market"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  required
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+123 456 7890"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Stall 12, Main Hall"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  required
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-8">
              {/* Store Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Banner
                </label>
                {!bannerPreview ? (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-400 transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      ref={bannerInputRef}
                      onChange={(e) => handleFileChange(e, 'banner')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <svg
                      className="mx-auto h-10 w-10 text-gray-400 group-hover:text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium text-emerald-600 group-hover:text-emerald-700">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('banner')}
                      className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">Recommended: 1000 × 300 px</p>
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                {!profilePreview ? (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-400 transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      ref={profileInputRef}
                      onChange={(e) => handleFileChange(e, 'profile')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-gray-400 group-hover:text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      <span className="font-medium text-emerald-600 group-hover:text-emerald-700">
                        Click to upload
                      </span>{' '}
                      a profile photo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG – 500×500 px recommended</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full border-2 border-gray-200 overflow-hidden group">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('profile')}
                        className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Profile photo preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 transform active:scale-98 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200 hover:shadow-emerald-300'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating Vendor...
                  </span>
                ) : (
                  'Create Vendor'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AddVendorPage;