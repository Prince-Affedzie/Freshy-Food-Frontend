// AdminOrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon, PrinterIcon, CheckCircleIcon, XCircleIcon,
  TruckIcon, ClockIcon, CreditCardIcon, UserIcon, PhoneIcon,
  EnvelopeIcon, ShoppingBagIcon, ArrowPathIcon,
  ExclamationTriangleIcon, DocumentTextIcon,
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

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
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

const CardHeader = ({ title, icon: Icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px',
    borderBottom: '1px solid #F5F5F5' }}>
    {Icon && <Icon style={{ width: 17, height: 17, color: '#BFBFBF' }} />}
    <span style={{ fontSize: 14, fontWeight: 700, color: '#141414' }}>{title}</span>
  </div>
);

const Row = ({ label, value, mono = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0',
    borderBottom: '1px solid #F7F7F7' }}>
    <span style={{ fontSize: 12, color: '#8C8C8C' }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 600, color: '#262626', fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right' }}>{value}</span>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F5', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon style={{ width: 15, height: 15, color: '#8C8C8C' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: '#BFBFBF', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#141414', wordBreak: 'break-word' }}>{value}</div>
    </div>
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
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [order, setOrder]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus]       = useState('');

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

  // ── Loading ──────────────────────────────────────────────────────────────
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

  // ── Not found ────────────────────────────────────────────────────────────
  if (!order) return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 12, fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: '24px 16px' }}>
        <ExclamationTriangleIcon style={{ width: 56, height: 56, color: '#BFBFBF' }} />
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#141414' }}>Order Not Found</h3>
        <p style={{ margin: 0, fontSize: 13, color: '#8C8C8C', maxWidth: 340 }}>
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          fontWeight: 600, color: '#1677FF', textDecoration: 'none', marginTop: 8 }}>
          <ArrowLeftIcon style={{ width: 15, height: 15 }} /> Back to Orders
        </Link>
      </div>
    </AdminLayout>
  );

  const statusCfg = getStatusCfg(order.status.current);

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
        @media print {
          .no-print { display: none !important; }
          body      { background: #fff !important; }
        }
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .responsive-header { flex-direction: column !important; align-items: flex-start !important; }
          .responsive-actions { width: 100% !important; justify-content: space-between !important; }
          .responsive-grid { grid-template-columns: 1fr !important; }
          .responsive-items-grid { grid-template-columns: 1fr !important; }
          .responsive-delivery-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .responsive-modal-grid { grid-template-columns: 1fr !important; }
          .responsive-timeline { padding-left: 0 !important; }
          .responsive-order-item { flex-wrap: wrap !important; }
          .responsive-item-details { width: 100% !important; margin-top: 8px !important; }
          .responsive-status-buttons { flex-wrap: wrap !important; }
        }
        @media (max-width: 480px) {
          .card-padding { padding: 16px !important; }
          .status-modal { margin: 0 12px !important; width: calc(100% - 24px) !important; }
          .order-number { font-size: 14px !important; }
          .action-btn-text { display: none !important; }
          .action-btn-icon-only { margin: 0 !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div style={{ overflow:"hidden",fontFamily: "'DM Sans', sans-serif", background: '#FAFAFA', minHeight: '100vh', color: '#262626' }}>

        {/* ── Sticky Header (Responsive) ── */}
        <div className="no-print" style={{
          position: 'sticky', top: 0, zIndex: 100, background: '#fff',
          borderBottom: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
            className="responsive-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minWidth: 0 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 'clamp(16px, 5vw, 18px)', fontWeight: 800, color: '#141414', letterSpacing: '-0.3px', wordBreak: 'break-word' }}>
                    Order <span style={{ color: '#1677FF' }}>#{order.orderNumber}</span>
                  </h1>
                  <StatusBadge status={order.status.current} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#BFBFBF' }}>{fmtDate(order.dates.createdAt)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="responsive-actions">
              <ActionBtn onClick={() => window.print()} variant="default">
                <PrinterIcon style={{ width: 15, height: 15 }} />
                <span className="action-btn-text" style={{ marginLeft: 4 }}>Print</span>
              </ActionBtn>
              <ActionBtn onClick={() => { setShowStatusModal(true); setNewStatus(order.status.current); }} variant="primary">
                <ArrowPathIcon style={{ width: 15, height: 15 }} />
                <span className="action-btn-text" style={{ marginLeft: 4 }}>Update</span>
              </ActionBtn>
            </div>
          </div>
        </div>

        {/* ── Body (Responsive Grid) ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}
            className="responsive-grid">

            {/* ══ LEFT COLUMN ══════════════════════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Order Items - Responsive */}
              <Card style={{ animation: 'fadeUp 0.35s ease both' }}>
                <CardHeader title={`Order Items (${order.orderItems.length})`} icon={ShoppingBagIcon} />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="od-item responsive-order-item" style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                      borderRadius: 10, border: '1px solid #F0F0F0', transition: 'background 0.12s',
                      flexWrap: 'wrap',
                    }}>
                      <img src={item.image} alt={item.name} style={{
                        width: 'clamp(56px, 15vw, 68px)', height: 'clamp(56px, 15vw, 68px)', borderRadius: 9, objectFit: 'cover', flexShrink: 0,
                        border: '1px solid #F0F0F0',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414',
                              wordBreak: 'break-word' }}>{item.name}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#BFBFBF' }}>
                              {item.product?.category || 'Product'} · {item.unit}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#141414' }}>{item.totalPrice}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8C8C8C' }}>{item.quantity} × {item.price}</p>
                          </div>
                        </div>
                        {item.product?.id && (
                          <Link to={`/admin-product/${item.product.id}`} style={{ display: 'inline-block', marginTop: 8,
                            fontSize: 11, fontWeight: 600, color: '#1677FF', textDecoration: 'none' }}>
                            View Product →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Order Timeline - Responsive */}
              <Card style={{ animation: 'fadeUp 0.35s ease 60ms both' }}>
                <CardHeader title="Order Timeline" icon={ClockIcon} />
                <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {order.status.timeline.map((step, i) => {
                    const isLast = i === order.status.timeline.length - 1;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: isLast ? 0 : 24, position: 'relative' }}>
                        {/* Line */}
                        {!isLast && (
                          <div style={{
                            position: 'absolute', left: 15, top: 32, width: 2, height: 'calc(100% - 12px)',
                            background: step.completed ? '#B7EB8F' : '#F0F0F0',
                          }} />
                        )}
                        {/* Dot */}
                        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                          background: step.completed ? '#F6FFED' : '#F5F5F5',
                          border: `2px solid ${step.completed ? '#52C41A' : '#E8E8E8'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {step.completed
                            ? <CheckCircleIcon style={{ width: 16, height: 16, color: '#52C41A' }} />
                            : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D9D9D9' }} />
                          }
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, paddingTop: 4, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: step.completed ? '#141414' : '#BFBFBF', wordBreak: 'break-word' }}>{step.status}</span>
                            {step.date && <span style={{ fontSize: 11, color: '#BFBFBF', whiteSpace: 'nowrap' }}>{fmtShort(step.date)}</span>}
                          </div>
                          {step.description && (
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8C8C8C' }}>{step.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Delivery Information - Responsive Grid */}
              <Card style={{ animation: 'fadeUp 0.35s ease 120ms both' }}>
                <CardHeader title="Delivery Information" icon={TruckIcon} />
                <div style={{ padding: '20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
                  className="responsive-delivery-grid">
                  {/* Shipping address */}
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipping Address</p>
                    <div style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 10, padding: '12px 14px', wordBreak: 'break-word' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#141414' }}>{order.shippingAddress.address}</p>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#595959' }}>{order.shippingAddress.city}, {order.shippingAddress.region}</p>
                      {order.shippingAddress.nearestLandmark && (
                        <p style={{ margin: '0 0 4px', fontSize: 11, color: '#8C8C8C' }}>📍 {order.shippingAddress.nearestLandmark}</p>
                      )}
                      <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <PhoneIcon style={{ width: 12, height: 12, flexShrink: 0 }} /> {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>

                  {/* Delivery schedule */}
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Schedule</p>
                    <div style={{ background: '#E6F4FF', border: '1px solid #91CAFF', borderRadius: 10, padding: '12px 14px', wordBreak: 'break-word' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#1677FF' }}>
                        <strong>Day:</strong> {order.deliverySchedule?.preferredDay || 'Not specified'}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: '#1677FF' }}>
                        <strong>Time:</strong> {order.deliverySchedule?.preferredTime || 'Not specified'}
                      </p>
                    </div>

                    {/* Delivery status */}
                    <p style={{ margin: '16px 0 8px', fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Status</p>
                    <div style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 10, padding: '10px 14px' }}>
                      <Row label="Current Status" value={<StatusBadge status={order.status.current} size="sm" />} />
                      <Row label="Delivered" value={order.delivery.isDelivered ? '✅ Yes' : '⏳ No'} />
                      {order.delivery.deliveredAtDisplay && (
                        <Row label="Delivered At" value={order.delivery.deliveredAtDisplay} />
                      )}
                    </div>
                  </div>

                  {/* Delivery note full-width */}
                  {order.delivery.note && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Note</p>
                      <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#D48806', wordBreak: 'break-word' }}>
                        {order.delivery.note}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* ══ RIGHT SIDEBAR (Responsive) ════════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Customer */}
              <Card style={{ animation: 'fadeUp 0.35s ease 80ms both' }}>
                <CardHeader title="Customer" icon={UserIcon} />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Avatar row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: '#F5F9FF', borderRadius: 10, border: '1px solid #E6F4FF', flexWrap: 'wrap' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1677FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                        {(order.user.name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414', wordBreak: 'break-word' }}>{order.user.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C' }}>Customer</p>
                    </div>
                  </div>
                  <InfoItem icon={EnvelopeIcon} label="Email" value={order.user.email} />
                  <InfoItem icon={PhoneIcon}   label="Phone" value={order.user.phone} />
                  <Link to={`/admin/users/${order.user.id}`} style={{
                    display: 'block', textAlign: 'center', padding: '9px 0', borderRadius: 9,
                    border: '1.5px solid #E8E8E8', fontSize: 13, fontWeight: 600, color: '#595959',
                    textDecoration: 'none', marginTop: 4,
                  }}>
                    View Customer Profile
                  </Link>
                </div>
              </Card>

              {/* Order Summary */}
              <Card style={{ animation: 'fadeUp 0.35s ease 120ms both' }}>
                <CardHeader title="Order Summary" icon={DocumentTextIcon} />
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 14 }}>
                    <Row label="Subtotal"    value={order.pricing.itemsPriceDisplay} />
                    <Row label="Delivery Fee" value={order.pricing.deliveryFeeDisplay} />
                  </div>
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F5F9FF',
                    border: '1px solid #E6F4FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#595959' }}>Total</span>
                    <span style={{ fontSize: 'clamp(18px, 5vw, 20px)', fontWeight: 800, color: '#141414' }}>{order.pricing.totalPriceDisplay}</span>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #F5F5F5' }}>
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</p>
                    <Row label="Order ID"    value={order.id.slice(-12)} mono />
                    <Row label="Created"     value={order.dates.createdAtDisplay} />
                    <Row label="Last Updated" value={order.dates.updatedAtDisplay} />
                    {order.subscriptionId && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#8C8C8C' }}>Subscription</span>
                        <Link to={`/admin/subscriptions/${order.subscriptionId}`} style={{ fontSize: 12, fontWeight: 600, color: '#1677FF', textDecoration: 'none' }}>View →</Link>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Payment */}
              <Card style={{ animation: 'fadeUp 0.35s ease 160ms both' }}>
                <CardHeader title="Payment" icon={CreditCardIcon} />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: order.payment.isPaid ? '#F6FFED' : '#FFFBE6',
                    border: `1px solid ${order.payment.isPaid ? '#B7EB8F' : '#FFE58F'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#141414' }}>Payment Status</span>
                      <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: order.payment.isPaid ? '#D9F7BE' : '#FFF1B8',
                        color: order.payment.isPaid ? '#389E0D' : '#D46B08',
                      }}>{order.payment.isPaid ? 'Paid' : 'Pending'}</span>
                    </div>
                    <p style={{ margin: '0 0 2px', fontSize: 12, color: '#595959', wordBreak: 'break-word' }}>Method: <strong>{order.payment.method || 'Not specified'}</strong></p>
                    {order.payment.paidAtDisplay && (
                      <p style={{ margin: 0, fontSize: 12, color: '#595959' }}>Paid on: <strong>{order.payment.paidAtDisplay}</strong></p>
                    )}
                  </div>

                  {!order.payment.isPaid && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                      background: '#FFF1F0', border: '1px solid #FFA39E', borderRadius: 10 }}>
                      <ExclamationTriangleIcon style={{ width: 16, height: 16, color: '#FF4D4F', flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#CF1322' }}>Payment Pending</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#FF4D4F', lineHeight: 1.5 }}>
                          Delivery cannot proceed until payment is confirmed.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="no-print" style={{ animation: 'fadeUp 0.35s ease 200ms both' }}>
                <CardHeader title="Quick Actions" />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ActionBtn onClick={() => window.print()} variant="ghost" fullWidth>
                    <PrinterIcon style={{ width: 15, height: 15 }} /> Print Order
                  </ActionBtn>
                  <ActionBtn onClick={() => { setShowStatusModal(true); setNewStatus(order.status.current); }} variant="primary" fullWidth>
                    <ArrowPathIcon style={{ width: 15, height: 15 }} /> Update Status
                  </ActionBtn>
                  <ActionBtn variant="default" fullWidth>
                    <EnvelopeIcon style={{ width: 15, height: 15 }} /> Email Customer
                  </ActionBtn>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>

      {/* ── Status Modal (Responsive) ── */}
      {showStatusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460,
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeUp 0.25s ease', margin: '0 16px' }}
            className="status-modal">

            {/* Modal header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#E6F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowPathIcon style={{ width: 18, height: 18, color: '#1677FF' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#141414' }}>Update Order Status</h3>
                <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C', wordBreak: 'break-word' }}>Order #{order.orderNumber}</p>
              </div>
            </div>

            {/* Status grid */}
            <div style={{ padding: '18px 20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#8C8C8C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select new status</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}
                className="responsive-modal-grid">
                {STATUS_OPTIONS.map((s) => {
                  const Icon     = s.icon;
                  const selected = newStatus === s.value;
                  return (
                    <button key={s.value} className="od-statopt" onClick={() => setNewStatus(s.value)} style={{
                      padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${selected ? s.color : '#F0F0F0'}`,
                      background: selected ? s.bg : '#fff',
                      transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Icon style={{ width: 14, height: 14, color: s.color }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: selected ? s.color : '#262626' }}>{s.label}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 10, color: '#8C8C8C', lineHeight: 1.4 }}>
                        {s.value === 'Delivered'        && 'Mark as delivered'}
                        {s.value === 'Processing'       && 'Start processing'}
                        {s.value === 'Out for Delivery' && 'Dispatch for delivery'}
                        {s.value === 'Cancelled'        && 'Cancel this order'}
                        {s.value === 'Pending'          && 'Reset to pending'}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Warnings */}
              {newStatus === 'Cancelled' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14, padding: '12px 14px',
                  background: '#FFF1F0', border: '1px solid #FFA39E', borderRadius: 10 }}>
                  <ExclamationTriangleIcon style={{ width: 16, height: 16, color: '#FF4D4F', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#CF1322' }}>Cancel Order?</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#FF4D4F', lineHeight: 1.5 }}>
                      This will notify the customer and mark the order as cancelled.
                    </p>
                  </div>
                </div>
              )}
              {newStatus === 'Delivered' && !order.payment.isPaid && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14, padding: '12px 14px',
                  background: '#FFFBE6', border: '1px solid #FFE58F', borderRadius: 10 }}>
                  <ExclamationTriangleIcon style={{ width: 16, height: 16, color: '#FAAD14', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#D48806' }}>Payment Not Confirmed</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#D48806', lineHeight: 1.5 }}>
                      Marking as delivered without payment is not recommended.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F5F5', display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
              <ActionBtn onClick={() => setShowStatusModal(false)} variant="default">Cancel</ActionBtn>
              <ActionBtn
                onClick={handleStatusUpdate}
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