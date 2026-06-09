// AdminOrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon, PrinterIcon, CheckCircleIcon, XCircleIcon,
  TruckIcon, ClockIcon, CreditCardIcon, UserIcon, PhoneIcon,
  EnvelopeIcon, ShoppingBagIcon, ArrowPathIcon,
  ExclamationTriangleIcon, DocumentTextIcon,
  BuildingStorefrontIcon, MapPinIcon, StarIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminGetOrderById, updateOrderStatus } from '../Apis/orderApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'Pending',         label: 'Pending',         icon: ClockIcon,         bg: '#FFFBE6', border: '#FFE58F', color: '#D48806', dot: '#FAAD14' },
  { value: 'Processing',      label: 'Processing',      icon: ArrowPathIcon,     bg: '#E6F4FF', border: '#91CAFF', color: '#1677FF', dot: '#1677FF' },
  { value: 'Out for Delivery', label: 'Out for Delivery', icon: TruckIcon,       bg: '#F0F5FF', border: '#ADC6FF', color: '#2F54EB', dot: '#2F54EB' },
  { value: 'Delivered',       label: 'Delivered',       icon: CheckCircleIcon,   bg: '#F6FFED', border: '#B7EB8F', color: '#389E0D', dot: '#52C41A' },
  { value: 'Cancelled',       label: 'Cancelled',       icon: XCircleIcon,       bg: '#FFF1F0', border: '#FFA39E', color: '#CF1322', dot: '#FF4D4F' },
];
const getStatusCfg = (v = '') => STATUS_OPTIONS.find(s => s.value === v) ?? STATUS_OPTIONS[0];

const CAMPUS_LABELS = {
  UG:'University of Ghana', KNUST:'KNUST', UCC:'University of Cape Coast',
  UEW:'University of Education, Winneba', UPSA:'UPSA', GIMPA:'GIMPA',
  ASHESI:'Ashesi University', ATU:'Accra Technical University', OTHER:'Other',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : 'Not yet';

const fmtShort = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatusBadge = ({ status, size = 'md' }) => {
  const cfg = getStatusCfg(status);
  const Icon = cfg.icon;
  const p = size === 'sm' ? '2px 9px' : '4px 12px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: p, borderRadius: 20,
      fontSize: fs, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap' }}>
      <Icon style={{ width: 13, height: 13 }} />
      {status}
    </span>
  );
};

const Card = ({ children, style = {}, className = '' }) => (
  <div className={className} style={{
    background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', ...style,
  }}>
    {children}
  </div>
);

const CardHeader = ({ title, icon: Icon, badge }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px',
    borderBottom: '1px solid #F5F5F5' }}>
    {Icon && <Icon style={{ width: 17, height: 17, color: '#BFBFBF' }} />}
    <span style={{ fontSize: 14, fontWeight: 700, color: '#141414' }}>{title}</span>
    {badge != null && (
      <span style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: '#F5F5F5', color: '#8C8C8C' }}>{badge}</span>
    )}
  </div>
);

const Row = ({ label, value, mono = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0',
    borderBottom: '1px solid #F7F7F7' }}>
    <span style={{ fontSize: 12, color: '#8C8C8C' }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 600, color: '#262626', fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right' }}>{value}</span>
  </div>
);

const ActionBtn = ({ onClick, children, variant = 'default', disabled = false, fullWidth = false }) => {
  const styles = {
    default:  { background: '#fff',       color: '#595959', border: '1.5px solid #E8E8E8' },
    primary:  { background: '#1677FF',    color: '#fff',    border: '1.5px solid #1677FF' },
    danger:   { background: '#FF4D4F',    color: '#fff',    border: '1.5px solid #FF4D4F' },
    ghost:    { background: '#F5F5F5',    color: '#595959', border: '1.5px solid #F5F5F5' },
  };
  const v = styles[variant] ?? styles.default;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.15s, filter 0.15s',
      width: fullWidth ? '100%' : 'auto',
      ...v,
    }}>
      {children}
    </button>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { fetchOrderDetails(); }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await AdminGetOrderById(id);
      if (res.status === 200 && res.data.data) setOrder(res.data.data);
      else throw new Error('Invalid response');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load order details');
      navigate('/admin/orders');
    } finally { setLoading(false); }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) { toast.error('Please select a status'); return; }
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setShowStatusModal(false);
      fetchOrderDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally { setUpdatingStatus(false); setNewStatus(''); }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 16, fontFamily: "'DM Sans', sans-serif", padding: '0 16px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%',
          border: '3px solid #F0F0F0', borderTopColor: '#1677FF', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ color: '#8C8C8C', fontSize: 14 }}>Loading order details…</p>
      </div>
    </AdminLayout>
  );

  if (!order) return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 12, fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: '24px 16px' }}>
        <ExclamationTriangleIcon style={{ width: 56, height: 56, color: '#BFBFBF' }} />
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#141414' }}>Order Not Found</h3>
        <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          fontWeight: 600, color: '#1677FF', textDecoration: 'none', marginTop: 8 }}>
          <ArrowLeftIcon style={{ width: 15, height: 15 }} /> Back to Orders
        </Link>
      </div>
    </AdminLayout>
  );

  const subOrders = order.subOrders || [];

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        .od-item:hover     { background: #FAFCFF !important; }
        .od-statopt:hover  { border-color: #91CAFF !important; }
        .od-btn:hover      { filter: brightness(0.94); }
        .od-vendor:hover   { background: #FAFCFF !important; }
        @media print {
          .no-print { display: none !important; }
          body      { background: #fff !important; }
        }
        @media (max-width: 768px) {
          .responsive-header { flex-direction: column !important; align-items: flex-start !important; }
          .responsive-grid { grid-template-columns: 1fr !important; }
          .responsive-delivery-grid { grid-template-columns: 1fr !important; }
          .responsive-suborder-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAFA', minHeight: '100vh', color: '#262626' }}>

        {/* Sticky Header */}
        <div className="no-print" style={{
          position: 'sticky', top: 0, zIndex: 100, background: '#fff',
          borderBottom: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div className="responsive-header" style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minWidth: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#141414', letterSpacing: '-0.3px' }}>
                    Order <span style={{ color: '#1677FF' }}>#{order.orderNumber}</span>
                  </h1>
                  <StatusBadge status={order.status.current} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#BFBFBF' }}>{fmtDate(order.dates.createdAt)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ActionBtn onClick={() => window.print()} variant="default">
                <PrinterIcon style={{ width: 15, height: 15 }} /> Print
              </ActionBtn>
              <ActionBtn onClick={() => { setShowStatusModal(true); setNewStatus(order.status.current); }} variant="primary">
                <ArrowPathIcon style={{ width: 15, height: 15 }} /> Update Status
              </ActionBtn>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 40px' }}>
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Order Items */}
              <Card style={{ animation: 'fadeUp 0.35s ease both' }}>
                <CardHeader title={`Order Items (${order.orderItems.length})`} icon={ShoppingBagIcon} />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="od-item" style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                      borderRadius: 10, border: '1px solid #F0F0F0', transition: 'background 0.12s',
                    }}>
                      <img src={item.image || 'https://via.placeholder.com/68'} alt={item.name} style={{
                        width: 64, height: 64, borderRadius: 9, objectFit: 'cover', flexShrink: 0,
                        border: '1px solid #F0F0F0',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414' }}>{item.name}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#BFBFBF' }}>
                          {item.product?.category || 'Product'} · {item.unit}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8C8C8C' }}>{item.quantity} × {item.priceDisplay}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#141414' }}>{item.totalPriceDisplay}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Sub-Orders / Vendor Breakdown */}
              {subOrders.length > 0 && (
                <Card style={{ animation: 'fadeUp 0.35s ease 40ms both' }}>
                  <CardHeader title="Vendor Breakdown" icon={BuildingStorefrontIcon} badge={`${subOrders.length} vendor${subOrders.length !== 1 ? 's' : ''}`} />
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {subOrders.map((sub, idx) => (
                      <div key={sub.id || idx} className="od-vendor" style={{
                        padding: '16px', borderRadius: 12, border: '1px solid #F0F0F0',
                        background: '#FAFAFA', transition: 'background 0.12s',
                      }}>
                        {/* Vendor Info */}
                        {sub.vendor ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F0F0F0' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 20, background: '#E8F5E9',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {sub.vendor.profileImage && !sub.vendor.profileImage.includes('default') ? (
                                <img src={sub.vendor.profileImage} alt="" style={{ width: '100%', height: '100%', borderRadius: 20, objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#2E7D32' }}>
                                  {sub.vendor.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414' }}>{sub.vendor.name}</p>
                                {sub.vendor.storeName && (
                                  <span style={{ fontSize: 11, color: '#8C8C8C' }}>({sub.vendor.storeName})</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                                {sub.vendor.campus && (
                                  <span style={{ fontSize: 11, color: '#595959', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <MapPinIcon style={{ width: 11, height: 11, color: '#BFBFBF' }} />
                                    {CAMPUS_LABELS[sub.vendor.campus] || sub.vendor.campus}
                                  </span>
                                )}
                                {sub.vendor.phone && (
                                  <span style={{ fontSize: 11, color: '#595959', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <PhoneIcon style={{ width: 11, height: 11, color: '#BFBFBF' }} />
                                    {sub.vendor.phone}
                                  </span>
                                )}
                                {sub.vendor.rating > 0 && (
                                  <span style={{ fontSize: 11, color: '#595959', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <StarIcon style={{ width: 11, height: 11, color: '#FAAD14' }} />
                                    {sub.vendor.rating?.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link to={`/admin/vendor/${sub.vendor.id}`}
                              style={{ fontSize: 11, fontWeight: 600, color: '#1677FF', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              View Vendor →
                            </Link>
                          </div>
                        ) : (
                          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F0F0F0' }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#8C8C8C', fontStyle: 'italic' }}>Vendor information not available</p>
                          </div>
                        )}

                        {/* Sub-order items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {sub.items?.map((si, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                {si.product?.image && (
                                  <img src={si.product.image} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                )}
                                <span style={{ color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {si.product?.name || 'Item'} × {si.quantity}
                                </span>
                              </div>
                              <span style={{ fontWeight: 600, color: '#141414', flexShrink: 0 }}>{si.totalPriceDisplay}</span>
                            </div>
                          ))}
                        </div>

                        {/* Subtotal */}
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #F0F0F0',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#8C8C8C' }}>
                            {sub.itemCount} item{sub.itemCount !== 1 ? 's' : ''}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#2E7D32' }}>{sub.subtotalDisplay}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Order Timeline */}
              <Card style={{ animation: 'fadeUp 0.35s ease 80ms both' }}>
                <CardHeader title="Order Timeline" icon={ClockIcon} />
                <div style={{ padding: '20px 20px' }}>
                  {order.status.timeline.map((step, i) => {
                    const isLast = i === order.status.timeline.length - 1;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: isLast ? 0 : 24, position: 'relative' }}>
                        {!isLast && (
                          <div style={{ position: 'absolute', left: 15, top: 32, width: 2, height: 'calc(100% - 12px)',
                            background: step.completed ? '#B7EB8F' : '#F0F0F0' }} />
                        )}
                        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                          background: step.completed ? '#F6FFED' : '#F5F5F5',
                          border: `2px solid ${step.completed ? '#52C41A' : '#E8E8E8'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {step.completed
                            ? <CheckCircleIcon style={{ width: 16, height: 16, color: '#52C41A' }} />
                            : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D9D9D9' }} />
                          }
                        </div>
                        <div style={{ flex: 1, paddingTop: 4, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: step.completed ? '#141414' : '#BFBFBF' }}>{step.status}</span>
                            {step.date && <span style={{ fontSize: 11, color: '#BFBFBF', whiteSpace: 'nowrap' }}>{fmtShort(step.date)}</span>}
                          </div>
                          {step.description && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8C8C8C' }}>{step.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Delivery Information */}
              <Card style={{ animation: 'fadeUp 0.35s ease 120ms both' }}>
                <CardHeader title="Delivery Information" icon={TruckIcon} />
                <div className="responsive-delivery-grid" style={{ padding: '20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase' }}>Shipping Address</p>
                    <div style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#141414' }}>{order.shippingAddress.address}</p>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#595959' }}>{order.shippingAddress.city}, {order.shippingAddress.region}</p>
                      {order.shippingAddress.nearestLandmark && (
                        <p style={{ margin: '0 0 4px', fontSize: 11, color: '#8C8C8C' }}>📍 {order.shippingAddress.nearestLandmark}</p>
                      )}
                      <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PhoneIcon style={{ width: 12, height: 12 }} /> {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase' }}>Delivery Schedule</p>
                    <div style={{ background: '#E6F4FF', border: '1px solid #91CAFF', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#1677FF' }}>
                        <strong>Day:</strong> {order.deliverySchedule?.preferredDay || 'N/A'}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: '#1677FF' }}>
                        <strong>Time:</strong> {order.deliverySchedule?.preferredTime || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card style={{ animation: 'fadeUp 0.35s ease 80ms both' }}>
                <CardHeader title="Customer" icon={UserIcon} />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: '#F5F9FF', borderRadius: 10, border: '1px solid #E6F4FF' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1677FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                        {(order.user.name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414' }}>{order.user.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C' }}>Customer</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <EnvelopeIcon style={{ width: 15, height: 15, color: '#BFBFBF', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: '#595959' }}>{order.user.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <PhoneIcon style={{ width: 15, height: 15, color: '#BFBFBF', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: '#595959' }}>{order.user.phone}</span>
                  </div>
                </div>
              </Card>

              <Card style={{ animation: 'fadeUp 0.35s ease 120ms both' }}>
                <CardHeader title="Order Summary" icon={DocumentTextIcon} />
                <div style={{ padding: '16px 20px' }}>
                  <Row label="Subtotal" value={order.pricing.itemsPriceDisplay} />
                  <Row label="Delivery Fee" value={order.pricing.deliveryFeeDisplay} />
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F5F9FF',
                    border: '1px solid #E6F4FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#595959' }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#141414' }}>{order.pricing.totalPriceDisplay}</span>
                  </div>
                </div>
              </Card>

              <Card style={{ animation: 'fadeUp 0.35s ease 160ms both' }}>
                <CardHeader title="Payment" icon={CreditCardIcon} />
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ padding: '14px 16px', borderRadius: 10,
                    background: order.payment.isPaid ? '#F6FFED' : '#FFFBE6',
                    border: `1px solid ${order.payment.isPaid ? '#B7EB8F' : '#FFE58F'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#141414' }}>Payment Status</span>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: order.payment.isPaid ? '#D9F7BE' : '#FFF1B8',
                        color: order.payment.isPaid ? '#389E0D' : '#D46B08' }}>
                        {order.payment.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    {order.payment.reference && (
                      <p style={{ margin: '0 0 2px', fontSize: 11, color: '#8C8C8C', fontFamily: 'monospace' }}>
                        Ref: {order.payment.reference}
                      </p>
                    )}
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#595959' }}>
                      Method: <strong>{order.payment.method || 'N/A'}</strong>
                    </p>
                    {order.payment.paidAtDisplay && (
                      <p style={{ margin: 0, fontSize: 12, color: '#595959' }}>Paid on: <strong>{order.payment.paidAtDisplay}</strong></p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal (unchanged) */}
      {showStatusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460,
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#E6F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowPathIcon style={{ width: 18, height: 18, color: '#1677FF' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#141414' }}>Update Order Status</h3>
                <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C' }}>Order #{order.orderNumber}</p>
              </div>
            </div>
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                {STATUS_OPTIONS.map((s) => {
                  const Icon = s.icon;
                  const selected = newStatus === s.value;
                  return (
                    <button key={s.value} className="od-statopt" onClick={() => setNewStatus(s.value)} style={{
                      padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${selected ? s.color : '#F0F0F0'}`,
                      background: selected ? s.bg : '#fff', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Icon style={{ width: 14, height: 14, color: s.color }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: selected ? s.color : '#262626' }}>{s.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F5F5', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <ActionBtn onClick={() => setShowStatusModal(false)} variant="default">Cancel</ActionBtn>
              <ActionBtn onClick={handleStatusUpdate}
                variant={newStatus === 'Cancelled' ? 'danger' : 'primary'}
                disabled={updatingStatus || !newStatus || newStatus === order.status.current}>
                {updatingStatus ? 'Updating…' : `Set to ${newStatus || '—'}`}
              </ActionBtn>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;