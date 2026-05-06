import React, { useEffect, useState } from 'react';
import { getAllVendors } from '../Apis/vendorApi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const VendorListPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('name'); // name | market_name | is_verified
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  // Fetch vendors with all parameters
  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        market: marketFilter.trim() || undefined,
        search: searchQuery.trim() || undefined,
        sortBy,
        order: sortOrder,
        page,
        limit,
      };
      const response = await getAllVendors(params);
      setVendors(response.data.data || []);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Failed to load vendors';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load & re-fetch on page/sort change
  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortOrder]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, marketFilter]);

  // Debounced re-fetch when search/filter/page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 300); // 300ms debounce for better UX
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, marketFilter, page, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const handleEdit = (vendor) => {
    navigate(`/admin/vendor_edit/${vendor._id}`);
  };

  const getImageUrl = (url) => {
    if (!url || url === 'default_banner.jpg' || url === 'default_profile.jpg') return null;
    return url;
  };

  // Simple statistics from current data
  const stats = {
    total: totalCount,
    verified: vendors.filter(v => v.is_verified).length,
    pending: vendors.filter(v => !v.is_verified).length,
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Premium Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent sm:text-4xl">
                Vendors
              </h1>
              <p className="mt-1 text-sm text-gray-500 font-medium">
                Manage all registered vendors in the system.
              </p>
            </div>
            <Link
              to="/admin/add-vendor"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-green-700 hover:shadow-xl hover:shadow-emerald-300 transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Vendor
            </Link>
          </div>

          {/* Statistics Cards (computed from current data) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-5 flex items-center space-x-4 transition-shadow hover:shadow-md">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-5 flex items-center space-x-4 transition-shadow hover:shadow-md">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-5 flex items-center space-x-4 transition-shadow hover:shadow-md">
              <div className="p-3 bg-amber-100 rounded-xl">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          {/* Advanced Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-4 transition-shadow hover:shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Search Input */}
              <div>
                <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Search vendor
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="searchQuery"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, contact..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50 hover:bg-white"
                  />
                </div>
              </div>
              {/* Market Filter */}
              <div>
                <label htmlFor="marketFilter" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Filter by Market
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <input
                    id="marketFilter"
                    type="text"
                    value={marketFilter}
                    onChange={(e) => setMarketFilter(e.target.value)}
                    placeholder="Enter market name..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50 hover:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vendors Table + Pagination */}
          {loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-8">
              <div className="animate-pulse space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          ) : error && vendors.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Failed to load vendors.</p>
              <button onClick={fetchVendors} className="text-emerald-600 hover:underline text-sm font-medium">Retry</button>
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No vendors found.</p>
              <Link to="/admin/add-vendor" className="mt-6 inline-flex items-center text-emerald-600 font-medium hover:underline text-sm">Add your first vendor</Link>
            </div>
          ) : (
            <>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                {/* Desktop Table with Sorting */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/80">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                        <th
                          scope="col"
                          className="px-6 py-4 text-left cursor-pointer select-none"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Vendor
                            {sortBy === 'name' && (
                              <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                {sortOrder === 'asc' ? (
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                )}
                              </svg>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left cursor-pointer select-none"
                          onClick={() => handleSort('market_name')}
                        >
                          <div className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Market
                            {sortBy === 'market_name' && (
                              <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                {sortOrder === 'asc' ? (
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                )}
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                        <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left cursor-pointer select-none"
                          onClick={() => handleSort('is_verified')}
                        >
                          <div className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                            {sortBy === 'is_verified' && (
                              <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                {sortOrder === 'asc' ? (
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                )}
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {vendors.map((vendor) => (
                        <tr
                          key={vendor._id}
                          className="hover:bg-emerald-50/50 transition-colors duration-150 cursor-pointer group"
                          onClick={() => navigate(`/admin/vendor/${vendor._id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 ring-2 ring-white overflow-hidden shadow-sm">
                                {getImageUrl(vendor.profile_image) ? (
                                  <img src={vendor.profile_image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <svg className="h-full w-full text-gray-400 p-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{vendor.name}</div>
                                <div className="text-xs text-gray-500">ID: {vendor._id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.market_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.contact}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              vendor.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {vendor.is_verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => navigate(`/admin/vendor/${vendor._id}`)}
                              className="text-emerald-600 hover:text-emerald-900 transition-colors font-medium hover:bg-emerald-50 px-3 py-1 rounded-lg"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(vendor); }}
                              className="text-emerald-600 hover:text-emerald-900 transition-colors font-medium hover:bg-emerald-50 px-3 py-1 rounded-lg"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-gray-100">
                  {vendors.map((vendor) => (
                    <div
                      key={vendor._id}
                      className="p-4 hover:bg-emerald-50/30 transition-colors duration-150 active:scale-[0.99]"
                      onClick={() => navigate(`/admin/vendor/${vendor._id}`)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-100 ring-2 ring-white shadow-sm overflow-hidden">
                          {getImageUrl(vendor.profile_image) ? (
                            <img src={vendor.profile_image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <svg className="h-full w-full text-gray-400 p-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{vendor.name}</p>
                          <p className="text-xs text-gray-500 truncate">{vendor.market_name}</p>
                        </div>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          vendor.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vendor.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</span>
                          <p className="truncate">{vendor.contact}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Location</span>
                          <p className="truncate">{vendor.location}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(vendor); }}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{' '}
                        <span className="font-medium">{totalCount}</span> vendors
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pageNum
                                  ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page === totalPages}
                          className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default VendorListPage;