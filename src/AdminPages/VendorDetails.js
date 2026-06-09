// VendorDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getVendorById } from '../Apis/vendorApi';
import toast from 'react-hot-toast';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const CAMPUS_LABELS = {
  UG:'University of Ghana', KNUST:'KNUST', UCC:'University of Cape Coast',
  UEW:'University of Education, Winneba', UPSA:'UPSA', GIMPA:'GIMPA',
  ASHESI:'Ashesi University', ATU:'Accra Technical University', OTHER:'Other',
};

const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await getVendorById(id);
        if (res.status === 200) {
          setVendor(res.data.data);
        }
      } catch (err) {
        setError(err?.error || 'Failed to load vendor details.');
        toast.error('Failed to load vendor details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  const isValidImage = (url) => {
    return url && !url.includes('default_banner') && !url.includes('default_profile');
  };

  const getProductImage = (product) => {
    if (product?.images?.length > 0) return product.images[0];
    if (product?.image) return product.image;
    return null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200/80 rounded w-1/3" />
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                <div className="h-48 sm:h-64 bg-gray-200/80" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200/80 rounded w-1/4" />
                  <div className="h-4 bg-gray-200/80 rounded w-1/2" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="h-16 bg-gray-200/80 rounded-xl" />
                    <div className="h-16 bg-gray-200/80 rounded-xl" />
                    <div className="h-16 bg-gray-200/80 rounded-xl" />
                    <div className="h-16 bg-gray-200/80 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error || !vendor) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Vendor Not Found</h3>
            <p className="mt-2 text-gray-500">
              {error || "The vendor you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              to="/admin/vendors"
              className="mt-8 inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Vendors
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const products = vendor.products || [];
  const campusLabel = CAMPUS_LABELS[vendor.campus] || vendor.campus || '—';

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link to="/admin/vendors" className="hover:text-emerald-600 transition-colors font-medium">Vendors</Link>
                <span>/</span>
                <span className="text-gray-900 font-semibold truncate max-w-[200px]">{vendor.name}</span>
              </nav>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent sm:text-4xl">
                {vendor.name}
              </h1>
              {vendor.storeName && (
                <p className="mt-1 text-sm text-gray-500 font-medium">{vendor.storeName}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/vendors"
                className="inline-flex items-center px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 text-sm font-medium rounded-xl hover:bg-white hover:shadow-md transition-all"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All Vendors
              </Link>
              <Link
                to={`/admin/vendor_edit/${vendor._id}`}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-green-700 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Vendor
              </Link>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden transition-shadow hover:shadow-md">
            {/* Banner */}
            <div className="h-48 sm:h-64 relative overflow-hidden bg-gradient-to-r from-emerald-400 to-green-500">
              {isValidImage(vendor.storeBanner) ? (
                <>
                  <img src={vendor.storeBanner} alt={`${vendor.name} banner`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="h-16 w-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
              )}

              {/* Profile Image */}
              <div className="absolute -bottom-10 left-6 sm:left-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/90 ring-4 ring-emerald-500/20 bg-white shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-105">
                  {isValidImage(vendor.profileImage) ? (
                    <img src={vendor.profileImage} alt={`${vendor.name} profile`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                      <span className="text-3xl font-bold text-emerald-700">
                        {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 sm:px-10 pt-16 pb-8">
              {/* Name & Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-900">{vendor.name}</h2>
                    <span className={`sm:hidden inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      vendor.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {vendor.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-sm text-gray-600 font-medium">{campusLabel}</p>
                  </div>
                  {vendor.bio && (
                    <p className="mt-2 text-sm text-gray-500 max-w-lg">{vendor.bio}</p>
                  )}
                </div>
                <div className="hidden sm:block">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                    vendor.isVerified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {vendor.isVerified ? '✓ Verified Vendor' : '⚠ Pending Verification'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{vendor.phone || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Campus Area</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{vendor.location?.campusArea || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Listings</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{vendor.productCount ?? products.length ?? 0}</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{vendor.rating?.toFixed(1) || '0.0'} ({vendor.numReviews || 0})</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {vendor.categories?.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.categories.map(cat => (
                      <span key={cat} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
                        {cat.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Products <span className="text-sm font-medium text-gray-500 ml-1">({products.length})</span>
                  </h3>
                  {products.length > 0 && (
                    <Link
                      to={`/admin-products?campus=${vendor.campus || ''}`}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      View all →
                    </Link>
                  )}
                </div>

                {products.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200/50">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">No products listed yet.</p>
                  </div>
                ) : (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-5 py-3"><span className="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {products.slice(0, 10).map((product) => (
                            <tr key={product._id} className="hover:bg-emerald-50/40 transition-colors group">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden shadow-sm">
                                    {getProductImage(product) ? (
                                      <img src={getProductImage(product)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{product.name || 'Unnamed'}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">
                                {product.category?.replace(/-/g, ' ') || '—'}
                              </td>
                              <td className="px-5 py-3 text-sm font-semibold text-emerald-600 whitespace-nowrap">
                                GH₵ {product.price?.toFixed(2) || '—'}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  product.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {product.isAvailable ? 'Available' : 'Hidden'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <Link
                                  to={`/admin-product/${product._id}`}
                                  className="text-sm font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg transition-colors"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile product cards */}
                    <div className="sm:hidden divide-y divide-gray-100">
                      {products.slice(0, 10).map((product) => (
                        <div key={product._id} className="p-4 hover:bg-emerald-50/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden shadow-sm">
                              {getProductImage(product) ? (
                                <img src={getProductImage(product)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{product.name || 'Unnamed'}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">{product.category?.replace(/-/g, ' ') || '—'}</span>
                                <span className="text-xs font-semibold text-emerald-600">GH₵ {product.price?.toFixed(2) || '—'}</span>
                              </div>
                            </div>
                            <Link
                              to={`/admin-product/${product._id}`}
                              className="text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="mt-8 pt-5 border-t border-gray-200/70">
                <div className="flex flex-col sm:flex-row sm:items-center text-xs font-medium text-gray-500 space-y-2 sm:space-y-0 sm:space-x-6">
                  <p>Created: {new Date(vendor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>Last updated: {new Date(vendor.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VendorDetailsPage;