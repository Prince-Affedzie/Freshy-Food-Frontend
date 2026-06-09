// EditVendorPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVendorById, updateVendor } from '../Apis/vendorApi';
import toast from 'react-hot-toast';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const CAMPUS_OPTIONS = [
  { value: '', label: 'Select campus...' },
  { value: 'UG', label: 'University of Ghana' },
  { value: 'KNUST', label: 'KNUST' },
  { value: 'UCC', label: 'University of Cape Coast' },
  { value: 'UEW', label: 'University of Education, Winneba' },
  { value: 'UPSA', label: 'UPSA' },
  { value: 'GIMPA', label: 'GIMPA' },
  { value: 'ASHESI', label: 'Ashesi University' },
  { value: 'ATU', label: 'Accra Technical University' },
  { value: 'OTHER', label: 'Other' },
];

const CATEGORY_OPTIONS = [
  'electronics',
  'phones and tablets',
  'computers and laptops',
  'gaming',
  'fashion',
  'books-course-materials',
  'hostel-items',
  'appliances',
  'furniture',
  'beauty and grooming',
  'sports and fitness',
  'accessories',
  'food and drinks',
  'services',
  'other',
];

const EditVendorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    phone: '',
    campus: '',
    campusArea: '',
    hostel: '',
    bio: '',
    isVerified: false,
    isActive: true,
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [existingBanner, setExistingBanner] = useState('');
  const [existingProfile, setExistingProfile] = useState('');
  const [storeBanner, setStoreBanner] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [removeBanner, setRemoveBanner] = useState(false);
  const [removeProfile, setRemoveProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await getVendorById(id);
        if (res.status === 200) {
          const vendor = res.data.data;
          setFormData({
            name: vendor.name || '',
            storeName: vendor.storeName || '',
            phone: vendor.phone || '',
            campus: vendor.campus || '',
            campusArea: vendor.location?.campusArea || '',
            hostel: vendor.location?.hostel || '',
            bio: vendor.bio || '',
            isVerified: vendor.isVerified || false,
            isActive: vendor.isActive !== undefined ? vendor.isActive : true,
          });
          setSelectedCategories(vendor.categories || []);
          setExistingBanner(vendor.storeBanner || '');
          setExistingProfile(vendor.profileImage || '');
          setBannerPreview(vendor.storeBanner || '');
          setProfilePreview(vendor.profileImage || '');
        }
      } catch (error) {
        toast.error('Failed to load vendor data.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'banner') {
      setStoreBanner(file);
      setBannerPreview(URL.createObjectURL(file));
      setRemoveBanner(false);
    } else {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
      setRemoveProfile(false);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'banner') {
      if (storeBanner) {
        setStoreBanner(null);
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview(existingBanner);
      } else if (bannerPreview) {
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

  const validate = () => {
    if (!formData.name.trim()) { toast.error('Vendor name is required.'); return false; }
    if (!formData.phone.trim()) { toast.error('Phone number is required.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    if (formData.storeName.trim()) payload.append('storeName', formData.storeName.trim());
    payload.append('phone', formData.phone.trim());
    if (formData.campus) payload.append('campus', formData.campus);
    if (formData.campusArea.trim()) payload.append('campusArea', formData.campusArea.trim());
    if (formData.hostel.trim()) payload.append('hostel', formData.hostel.trim());
    if (formData.bio.trim()) payload.append('bio', formData.bio.trim());
    payload.append('isVerified', formData.isVerified);
    payload.append('isActive', formData.isActive);

    selectedCategories.forEach(cat => payload.append('categories[]', cat));

    if (storeBanner) payload.append('storeBanner', storeBanner);
    else if (removeBanner) payload.append('removeStoreBanner', 'true');

    if (profileImage) payload.append('profileImage', profileImage);
    else if (removeProfile) payload.append('removeProfileImage', 'true');

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200/80 rounded w-1/3" />
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100/80 rounded-xl" />
                  ))}
                </div>
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
              <p className="mt-1 text-sm text-gray-500 font-medium">Update vendor details for CediMart.</p>
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

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden transition-shadow hover:shadow-md">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              {/* Basic Info */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
                    <input type="text" name="storeName" value={formData.storeName} onChange={handleChange}
                      placeholder="e.g. Kwame's Electronics"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Campus</label>
                    <select name="campus" value={formData.campus} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none">
                      {CAMPUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Campus Area</label>
                    <input type="text" name="campusArea" value={formData.campusArea} onChange={handleChange}
                      placeholder="e.g. Main Campus, North Campus"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hostel / Hall</label>
                    <input type="text" name="hostel" value={formData.hostel} onChange={handleChange}
                      placeholder="e.g. Mensah Sarbah Hall"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                  placeholder="Tell buyers about this vendor..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none" />
              </div>

              {/* Categories */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((category) => (
                    <button key={category} type="button" onClick={() => handleCategoryToggle(category)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                        selectedCategories.includes(category)
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                      }`}>
                      {category.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center p-4 bg-white/60 backdrop-blur rounded-2xl border border-gray-200/50">
                  <input type="checkbox" name="isVerified" checked={formData.isVerified} onChange={handleChange}
                    className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                  <label className="ml-3 block text-sm text-gray-700 font-medium">Verified Vendor</label>
                  <span className="ml-auto text-xs text-gray-500">{formData.isVerified ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center p-4 bg-white/60 backdrop-blur rounded-2xl border border-gray-200/50">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
                    className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                  <label className="ml-3 block text-sm text-gray-700 font-medium">Active Vendor</label>
                  <span className="ml-auto text-xs text-gray-500">{formData.isActive ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-8">
                {/* Store Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Store Banner</label>
                  {!bannerPreview ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors group bg-white/40">
                      <input type="file" accept="image/*" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-3 text-sm font-medium text-gray-700"><span className="text-emerald-600">Click to upload</span></p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                      <img src={bannerPreview} alt="Banner" className="w-full h-40 object-cover" />
                      <button type="button" onClick={() => handleRemoveImage('banner')}
                        className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 text-red-500 shadow-sm hover:text-red-700 transition-all">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 flex items-center justify-between">
                        {storeBanner ? <span className="text-xs font-medium text-white bg-emerald-500 px-2 py-0.5 rounded-full">New</span> :
                         removeBanner ? <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">Will be removed</span> : null}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Image</label>
                  {!profilePreview ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors group bg-white/40">
                      <input type="file" accept="image/*" ref={profileInputRef} onChange={(e) => handleFileChange(e, 'profile')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-700"><span className="text-emerald-600">Click to upload</span></p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 rounded-full border-2 border-gray-200 shadow-sm overflow-hidden group">
                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemoveImage('profile')}
                          className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-red-500 shadow-sm transition-all hover:text-red-700">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-gray-500 font-medium">{profileImage ? profileImage.name : 'Existing photo'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="border-t border-gray-200/70 pt-6 flex justify-end">
                <button type="submit" disabled={submitting}
                  className={`px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 transform active:scale-95 ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200'
                  }`}>
                  {submitting ? 'Saving...' : 'Save Changes'}
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