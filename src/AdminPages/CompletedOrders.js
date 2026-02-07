// CompletedOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  RefreshCw,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  Calendar,
  Truck,
  Loader2,
  Download,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getAllOrders } from '../Apis/orderApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const CompletedOrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders]         = useState([]);
  const [stats, setStats]           = useState({
    todayOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalRevenueDisplay: '₵0.00',
    avgOrderValue: 0,
    avgOrderValueDisplay: '₵0.00',
    totalOrders: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters]       = useState({
    search: '',
    sort: 'newest',
    page: 1,
    limit: 20,
  });

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = {
        ...filters,
        status: 'Delivered', // ← adjust if your backend uses 'Completed' or multiple values
      };

      const res = await getAllOrders(query);
      if (!res.data?.success) throw new Error('Failed response');

      const { data, stats: backendStats, pagination: pg } = res.data;

      setOrders(data || []);
      setStats({
        ...backendStats,
        completedOrders: backendStats?.completedOrders || data.length,
      });
      setPagination(pg || {
        currentPage: 1,
        totalPages: 1,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load completed orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    handleFilterChange('page', page);
  };

  const toggleSelectAll = (e) => {
    setSelectedOrders(e.target.checked ? orders.map(o => o.id) : []);
  };

  const toggleSelect = (id) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading && orders.length === 0) {
    return (
      <AdminLayout title="Completed Orders">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
            <p className="mt-4 text-gray-600">Loading completed orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Completed Orders">
      <ToastContainer position="top-right" autoClose={3000} limit={2} theme="light" />

      <div className="space-y-6 pb-10">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="mb-1 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={16} />
              All Orders
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Completed Orders</h1>
            <p className="mt-1 text-gray-600">Successfully delivered and finalized orders</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Row – adapted for completed focus */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Completed"
            value={stats.completedOrders || orders.length}
            icon={<CheckCircle size={20} />}
            color="emerald"
            sub="Today " 
          />
          <StatCard
            title="Today's Completed"
            value={stats.todayOrders || 0}
            icon={<Calendar size={20} />}
            color="emerald"
          />
          <StatCard
            title="Revenue from Completed"
            value={stats.totalRevenueDisplay}
            icon={<DollarSign size={20} />}
            color="emerald"
            sub={`Avg: ${stats.avgOrderValueDisplay}`}
          />
          <StatCard
            title="All Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart size={20} />}
            color="gray"
          />
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-white">
          <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search order #, name, phone..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filters.sort}
              onChange={e => handleFilterChange('sort', e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="totalPrice">Amount ↑</option>
              <option value="totalPrice-desc">Amount ↓</option>
            </select>

            <select
              value={filters.limit}
              onChange={e => handleFilterChange('limit', Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-10 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Delivered
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <CheckCircle className="mx-auto h-12 w-12 text-emerald-300" />
                      <p className="mt-3 text-gray-600">No completed orders yet</p>
                      <p className="mt-1 text-sm text-gray-500">Orders will appear here once delivered</p>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelect(order.id)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium">{order.customer.name || '—'}</div>
                        <div className="mt-0.5 text-sm text-gray-600">{order.customer.phone || '—'}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-emerald-700">{order.totalPrice}</div>
                        {order.isPaid && (
                          <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle size={12} />
                            Paid
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <Truck size={14} />
                          <span className="font-medium">{getTimeAgo(order.updatedAt || order.createdAt)}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {order.deliveryDate ? `Delivered: ${new Date(order.deliveryDate).toLocaleDateString()}` : '—'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/order/${order.id}`)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-emerald-700"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1}–
                {Math.min(pagination.currentPage * pagination.limit, orders.length)} of {stats.completedOrders || orders.length}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage}
                  className="rounded border p-2 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="rounded border p-2 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-8 w-8 rounded text-sm font-medium ${
                        pagination.currentPage === page
                          ? 'bg-emerald-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="rounded border p-2 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  className="rounded border p-2 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

function StatCard({ title, value, icon, color = 'gray', sub }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700',
    gray:    'bg-gray-50 text-gray-700',
  };

  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-600">{sub}</p>}
        </div>
        <div className={`rounded-lg p-3 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default CompletedOrdersPage;