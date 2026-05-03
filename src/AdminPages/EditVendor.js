import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVendorById, updateVendor } from '../Apis/vendorApi';
import toast from 'react-hot-toast';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const EditVendorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    market_name: '',
    contact: '',
    location: '',
    is_verified: false,
  });

  // Existing images (URLs from server)
  const [existingBanner, setExistingBanner] = useState('');
  const [existingProfile, setExistingProfile] = useState('');

  // New file states
  const [storeBanner, setStoreBanner] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Previews (either existing URL or new local blob)
  const [bannerPreview, setBannerPreview] = useState('');
  const [profilePreview, setProfilePreview] = useState('');

  // Track if the user explicitly removed an existing image
  const [removeBanner, setRemoveBanner] = useState(false);
  const [removeProfile, setRemoveProfile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // Fetch vendor data
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await getVendorById(id);
        if (res.status === 200) {
          const vendor = res.data.data;
          setFormData({
            name: vendor.name || '',
            market_name: vendor.market_name || '',
            contact: vendor.contact || '',
            location: vendor.location || '',
            is_verified: vendor.is_verified || false,
          });
          setExistingBanner(vendor.store_banner || '');
          setExistingProfile(vendor.profile_image || '');
          setBannerPreview(vendor.store_banner || '');
          setProfilePreview(vendor.profile_image || '');
        }
      } catch (error) {
        toast.error('Failed to load vendor data.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle new file selection
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'banner') {
      setStoreBanner(file);
      setBannerPreview(URL.createObjectURL(file));
      setRemoveBanner(false); // new file selected, so don't remove
    } else {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
      setRemoveProfile(false);
    }
  };

  // Remove current image (new upload or existing)
  const handleRemoveImage = (type) => {
    if (type === 'banner') {
      if (storeBanner) {
        // Just clear the newly selected file, revert to existing (if any)
        setStoreBanner(null);
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview(existingBanner);
      } else if (bannerPreview) {
        // Removing an existing image – mark for deletion, clear preview
        setRemoveBanner(true);
        setBannerPreview('');
      }
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    } else {
      if (profileImage) {
        setProfileImage(null);
        URL.revokeObjectURL(profilePreview);
        setProfilePreview(existingProfile);
      } else if (profilePreview) {
        setRemoveProfile(true);
        setProfilePreview('');
      }
      if (profileInputRef.current) profileInputRef.current.value = '';
    }
  };

  // Validation
  const validate = () => {
    const { name, market_name, contact, location } = formData;
    if (!name.trim() || !market_name.trim() || !contact.trim() || !location.trim()) {
      toast.error('Please fill in all required fields.');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('market_name', formData.market_name.trim());
    payload.append('contact', formData.contact.trim());
    payload.append('location', formData.location.trim());
    payload.append('is_verified', formData.is_verified);

    if (storeBanner) payload.append('store_banner', storeBanner);
    if (profileImage) payload.append('profile_image', profileImage);

    // Indicate which images to remove
    if (removeBanner) payload.append('remove_store_banner', 'true');
    if (removeProfile) payload.append('remove_profile_image', 'true');

    setSubmitting(true);
    try {
      const res = await updateVendor(payload, id);
      if (res.status === 200) {
        toast.success('Vendor updated successfully!');
        navigate('/admin/vendors');
      } else {
        toast.error(res.error || 'Update failed');
      }
    } catch (error) {
      const message = error?.error || error.message || 'Something went wrong.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200/80 rounded w-1/3" />
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-14 bg-gray-100/80 rounded-xl" />
                  <div className="h-14 bg-gray-100/80 rounded-xl" />
                  <div className="h-14 bg-gray-100/80 rounded-xl" />
                  <div className="h-14 bg-gray-100/80 rounded-xl" />
                </div>
                <div className="h-32 bg-gray-100/80 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent sm:text-4xl">
                Edit Vendor
              </h1>
              <p className="mt-1 text-sm text-gray-500 font-medium">Update vendor details below.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/vendors')}
              className="inline-flex items-center px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 text-sm font-medium rounded-xl hover:bg-white hover:shadow-md transition-all"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Vendors
            </button>
          </div>

          {/* Form Card – Premium Glassmorphism */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden transition-shadow hover:shadow-md">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              {/* Text inputs */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 mb-8">
                {/* Vendor Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Fresh Farms"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                {/* Market Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Market Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="market_name"
                    value={formData.market_name}
                    onChange={handleChange}
                    placeholder="Ex: Central Market"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Phone or email"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Verified toggle */}
              <div className="mb-8 flex items-center p-4 bg-white/60 backdrop-blur rounded-2xl border border-gray-200/50">
                <input
                  type="checkbox"
                  name="is_verified"
                  checked={formData.is_verified}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_verified" className="ml-3 block text-sm text-gray-700 font-medium">
                  Verified Vendor
                </label>
                <span className="ml-auto text-xs text-gray-500">
                  {formData.is_verified ? 'This vendor is verified and visible to customers.' : 'Vendor is pending verification.'}
                </span>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-8">
                {/* Store Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Store Banner</label>
                  {!bannerPreview ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors group bg-white/40">
                      <input
                        type="file"
                        accept="image/*"
                        ref={bannerInputRef}
                        onChange={(e) => handleFileChange(e, 'banner')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-3 text-sm font-medium text-gray-700">
                        <span className="text-emerald-600 group-hover:text-emerald-700">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('banner')}
                        className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-all shadow-sm"
                        title={removeBanner ? 'Image already marked for removal' : 'Remove image'}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {/* Indicators */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 flex items-center justify-between">
                        {storeBanner ? (
                          <span className="text-xs font-medium text-white bg-emerald-500 px-2 py-0.5 rounded-full">
                            New image
                          </span>
                        ) : removeBanner ? (
                          <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">
                            Will be removed
                          </span>
                        ) : null}
                        <span className="text-xs text-white font-medium ml-auto">
                          {storeBanner ? storeBanner.name : 'Existing image'}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">Recommended: 1200 × 400 px</p>
                </div>

                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Image</label>
                  {!profilePreview ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors group bg-white/40">
                      <input
                        type="file"
                        accept="image/*"
                        ref={profileInputRef}
                        onChange={(e) => handleFileChange(e, 'profile')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-700">
                        <span className="text-emerald-600 group-hover:text-emerald-700">Click to upload</span> a profile photo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG – 500×500 px</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 rounded-full border-2 border-gray-200 shadow-sm overflow-hidden group">
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('profile')}
                          className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-all shadow-sm"
                          title={removeProfile ? 'Image already marked for removal' : 'Remove image'}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {profileImage && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                            New
                          </div>
                        )}
                        {removeProfile && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Remove
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-xs text-gray-500 font-medium">
                        {profileImage ? profileImage.name : 'Existing photo'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="border-t border-gray-200/70 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 transform active:scale-95 ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
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

export default EditVendorPage;