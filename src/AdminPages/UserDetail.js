// UserDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Mail, Phone, MapPin, User, Shield,
  ShoppingCart, Heart, Package, Calendar, Clock, Building,
  Flag, CreditCard, Truck, AlertCircle, Loader2,
  Trash2, ToggleLeft, ToggleRight, Star, Award, MoreVertical
} from 'lucide-react';
import { getAUser, deleteAUser, toggleAdmin } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

const fmtShort = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

const lastActive = (d) => {
  if (!d) return '—';
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  return diff === 0 ? 'Today' : `${diff}d ago`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, span = false }) => (
  <div style={{ gridColumn: span ? '1 / -1' : 'auto', paddingBottom: 16, borderBottom: '1px solid #F5F5F5' }}>
    <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <Icon size={14} color="#BFBFBF" style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#262626', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  </div>
);

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '12px 18px', fontSize: 13, fontWeight: active ? 700 : 500,
    color: active ? '#1677FF' : '#8C8C8C', background: 'none', border: 'none',
    borderBottom: `2px solid ${active ? '#1677FF' : 'transparent'}`,
    cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
  }}>
    {label}
  </button>
);

const StatBlock = ({ value, label, icon: Icon, color }) => (
  <div style={{ textAlign: 'center', padding: '18px 8px', flex: '1 1 0', minWidth: 0, borderRight: '1px solid #F0F0F0' }}>
    <div style={{ fontSize: 24, fontWeight: 800, color, marginBottom: 4, lineHeight: 1 }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, color: '#8C8C8C' }}>
      <Icon size={13} /> {label}
    </div>
  </div>
);

const Btn = ({ onClick, children, variant = 'default', disabled = false, danger = false }) => {
  const v = {
    default: { bg: '#fff',    color: '#595959', border: '1.5px solid #E8E8E8' },
    primary: { bg: '#1677FF', color: '#fff',    border: '1.5px solid #1677FF' },
    ghost:   { bg: '#F5F5F5', color: '#595959', border: '1.5px solid #F5F5F5' },
    danger:  { bg: '#FFF1F0', color: '#FF4D4F', border: '1.5px solid #FFA39E' },
  }[variant] ?? {};
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px',
      borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, fontFamily: "'DM Sans', sans-serif",
      transition: 'filter 0.15s', ...v,
    }}>
      {children}
    </button>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const UserDetailPage = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();

  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { if (id) fetchUser(); }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getAUser(id);
      setUser(res.data.user);
      setError('');
    } catch {
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      await deleteAUser(id);
      navigate('/admin/users');
    } catch {
      alert('Failed to delete user.');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleToggleAdmin = async () => {
    try {
      await toggleAdmin(id);
      fetchUser();
    } catch {
      alert('Failed to update admin status.');
    }
  };

  const getFullName = () => {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User';
  };

  const getInitials = () => {
    const n = getFullName();
    if (n === 'Unnamed User') return 'UU';
    return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <AdminLayout title="User Details">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 14, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid #F0F0F0', borderTopColor: '#1677FF', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#8C8C8C', margin: 0 }}>Loading user profile…</p>
      </div>
    </AdminLayout>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !user) return (
    <AdminLayout title="User Details">
      <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 20px', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
        <AlertCircle size={52} color="#BFBFBF" style={{ marginBottom: 14 }} />
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#141414' }}>User Not Found</h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#8C8C8C' }}>{error || 'The requested user could not be found.'}</p>
        <Btn onClick={() => navigate('/admin/users')} variant="primary">
          <ArrowLeft size={14} /> Back to Users
        </Btn>
      </div>
    </AdminLayout>
  );

  const tabs = ['overview', 'orders', 'activity', 'settings'];

  return (
    <AdminLayout title="User Details">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .ud-order:hover   { border-color: #91CAFF !important; background: #FAFCFF !important; }
        .ud-btn:hover     { filter: brightness(0.94); }
        .ud-menu-item:hover { background: #F5F5F5 !important; }

        @media (max-width: 640px) {
          .ud-header-row   { flex-direction: column !important; align-items: flex-start !important; }
          .ud-stats-row    { flex-wrap: wrap !important; }
          .ud-stats-row > div { flex: 1 1 50% !important; border-right: none !important; border-bottom: 1px solid #F0F0F0 !important; }
          .ud-info-grid    { grid-template-columns: 1fr !important; }
          .ud-order-meta   { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .ud-order-grid   { grid-template-columns: 1fr !important; }
          .ud-action-row   { flex-direction: column !important; gap: 8px !important; }
          .ud-tabs         { gap: 0 !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAFA', minHeight: '100vh', color: '#262626' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 56px' }}>

          {/* ── Top nav bar ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, animation: 'fadeUp 0.3s ease both' }}>
            <button onClick={() => navigate('/admin/users')} style={{
              display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600,
              color: '#595959', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <ArrowLeft size={16} /> Back to Users
            </button>
            {/* Action row */}
            <div className="ud-action-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Btn onClick={() => navigate(`/admin/users/edit/${user._id}`)} variant="default">
                <Edit size={14} /> Edit
              </Btn>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(v => !v)} style={{
                  width: 36, height: 36, borderRadius: 8, border: '1.5px solid #E8E8E8',
                  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <MoreVertical size={16} color="#595959" />
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 42, zIndex: 200, background: '#fff',
                    borderRadius: 10, border: '1px solid #F0F0F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    minWidth: 180, overflow: 'hidden', animation: 'fadeIn 0.15s ease',
                  }}>
                    <button className="ud-menu-item" onClick={() => { handleToggleAdmin(); setMenuOpen(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      color: '#262626', fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {user.isAdmin ? <ToggleLeft size={15} color="#8C8C8C" /> : <ToggleRight size={15} color="#1677FF" />}
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button className="ud-menu-item" onClick={() => { setConfirmDelete(true); setMenuOpen(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      color: '#FF4D4F', fontFamily: "'DM Sans', sans-serif",
                    }}>
                      <Trash2 size={15} /> Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Profile hero card ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', animation: 'fadeUp 0.35s ease 40ms both' }}>
            {/* Dark header */}
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', padding: '28px 24px 24px' }}>
              <div className="ud-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1677FF, #6B21A8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{getInitials()}</span>
                    </div>
                    {user.isAdmin && (
                      <div style={{
                        position: 'absolute', bottom: -3, right: -3, width: 22, height: 22,
                        borderRadius: '50%', background: '#7C3AED', border: '2px solid #0F172A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Shield size={11} color="#fff" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{getFullName()}</h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <span style={{ padding: '3px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}
                      </span>
                      {user.isAdmin && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 12px', borderRadius: 20, background: 'rgba(124,58,237,0.35)', fontSize: 11, fontWeight: 700, color: '#C4B5FD', letterSpacing: '0.04em' }}>
                          <Shield size={10} /> Admin
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                        <Calendar size={11} /> Joined {fmtShort(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="ud-stats-row" style={{ display: 'flex', borderTop: '1px solid #F0F0F0' }}>
              <StatBlock value={user.cartItems?.length ?? 0}  label="Cart Items"  icon={ShoppingCart} color="#1677FF" />
              <StatBlock value={user.favorites?.length ?? 0}  label="Favourites"  icon={Heart}        color="#F43F5E" />
              <StatBlock value={user.orders?.length ?? 0}     label="Orders"      icon={Package}      color="#7C3AED" />
              <StatBlock value={lastActive(user.updatedAt)}   label="Last Active" icon={Clock}        color="#D97706"
                style={{ borderRight: 'none' }} />
            </div>
          </div>

          {/* ── Tab container ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', animation: 'fadeUp 0.35s ease 80ms both' }}>
            {/* Tab bar */}
            <div className="ud-tabs" style={{ display: 'flex', gap: 0, borderBottom: '1px solid #F0F0F0', overflowX: 'auto', paddingLeft: 8 }}>
              {tabs.map(t => (
                <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={activeTab === t} onClick={() => setActiveTab(t)} />
              ))}
            </div>

            {/* Tab body */}
            <div style={{ padding: '24px 20px' }}>

              {/* ══ OVERVIEW ════════════════════════════════════════════════ */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Personal info */}
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <User size={15} color="#1677FF" />
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414' }}>Personal Information</h3>
                    </div>
                    <div className="ud-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                      <InfoRow icon={User}     label="Full Name"     value={getFullName()} />
                      <InfoRow icon={Mail}     label="Email"         value={user.email} />
                      <InfoRow icon={Phone}    label="Phone"         value={user.phone} />
                      <InfoRow icon={Shield}   label="Account Type"  value={user.isAdmin ? '👑 Administrator' : (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer')} />
                      <InfoRow icon={Calendar} label="Member Since"  value={fmtDate(user.createdAt)} />
                      <InfoRow icon={Clock}    label="Last Updated"  value={fmtDate(user.updatedAt)} />
                    </div>
                  </section>

                  {/* Location */}
                  {(user.address || user.city || user.nearestLandmark) && (
                    <section>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingTop: 8, borderTop: '1px solid #F5F5F5' }}>
                        <MapPin size={15} color="#1677FF" />
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414' }}>Location</h3>
                      </div>
                      <div className="ud-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                        {user.city           && <InfoRow icon={Building} label="City"              value={user.city} />}
                        {user.address        && <InfoRow icon={MapPin}   label="Full Address"      value={user.address} span />}
                        {user.nearestLandmark && <InfoRow icon={Flag}    label="Nearest Landmark"  value={user.nearestLandmark} span />}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* ══ ORDERS ══════════════════════════════════════════════════ */}
              {activeTab === 'orders' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414' }}>Order History</h3>
                    <span style={{ fontSize: 12, color: '#8C8C8C', fontWeight: 600 }}>{user.orders?.length || 0} orders</span>
                  </div>

                  {user.orders?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {user.orders.map((order, i) => (
                        <div key={i} className="ud-order" style={{
                          borderRadius: 12, border: '1.5px solid #F0F0F0', padding: '16px 18px',
                          cursor: 'default', transition: 'all 0.15s',
                        }}>
                          {/* Order top row */}
                          <div className="ud-order-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ padding: '2px 10px', borderRadius: 20, background: '#F6FFED', border: '1px solid #B7EB8F', fontSize: 11, fontWeight: 700, color: '#389E0D' }}>Completed</span>
                                <span style={{ fontSize: 11, color: '#BFBFBF', fontFamily: 'monospace' }}>#{order.orderId?.slice(0, 8) || '—'}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#141414' }}>Grocery Order</p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 800, color: '#141414' }}>₵{Number(order.totalAmount || 0).toFixed(2)}</p>
                              <p style={{ margin: 0, fontSize: 11, color: '#BFBFBF' }}>{fmtShort(order.createdAt)}</p>
                            </div>
                          </div>

                          {/* Meta chips */}
                          <div className="ud-order-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 14, borderTop: '1px solid #F5F5F5' }}>
                            {[
                              { icon: Truck,      label: 'Delivery', sub: 'Standard Shipping', bg: '#E6F4FF', color: '#1677FF' },
                              { icon: CreditCard, label: 'Payment',  sub: 'Credit Card · Paid', bg: '#F9F0FF', color: '#7C3AED' },
                              { icon: Package,    label: 'Items',    sub: `${order.items?.length || '?'} items`, bg: '#F6FFED', color: '#389E0D' },
                            ].map(({ icon: Icon, label, sub, bg, color }) => (
                              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Icon size={16} color={color} />
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#141414' }}>{label}</p>
                                  <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C' }}>{sub}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                            <button style={{ fontSize: 12, fontWeight: 700, color: '#1677FF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                              View Full Order →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '48px 24px', background: '#FAFAFA', borderRadius: 12, border: '1px solid #F0F0F0' }}>
                      <Package size={48} color="#E0E0E0" style={{ marginBottom: 12 }} />
                      <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#595959' }}>No Orders Yet</h4>
                      <p style={{ margin: 0, fontSize: 13, color: '#BFBFBF', maxWidth: 280, marginInline: 'auto' }}>
                        This user hasn't placed any orders yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ══ ACTIVITY ════════════════════════════════════════════════ */}
              {activeTab === 'activity' && (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <Clock size={40} color="#E0E0E0" style={{ marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: 13, color: '#BFBFBF' }}>Activity log coming soon.</p>
                </div>
              )}

              {/* ══ SETTINGS ════════════════════════════════════════════════ */}
              {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#141414' }}>Account Settings</h3>

                  {/* Toggle admin */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, border: '1px solid #F0F0F0', background: '#FAFAFA' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#141414' }}>Admin Privileges</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C' }}>Grant or revoke admin access for this user</p>
                    </div>
                    <button onClick={handleToggleAdmin} style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      background: user.isAdmin ? '#FFF1F0' : '#F6FFED',
                      color:      user.isAdmin ? '#FF4D4F' : '#389E0D',
                      border:     user.isAdmin ? '1.5px solid #FFA39E' : '1.5px solid #B7EB8F',
                    }}>
                      {user.isAdmin ? <><ToggleLeft size={14} /> Remove Admin</> : <><ToggleRight size={14} /> Make Admin</>}
                    </button>
                  </div>

                  {/* Edit profile */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, border: '1px solid #F0F0F0', background: '#FAFAFA' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#141414' }}>Edit Profile</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#8C8C8C' }}>Update user's personal information</p>
                    </div>
                    <Btn onClick={() => navigate(`/admin/users/edit/${user._id}`)} variant="default">
                      <Edit size={13} /> Edit
                    </Btn>
                  </div>

                  {/* Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, border: '1.5px solid #FFA39E', background: '#FFF5F5' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#CF1322' }}>Delete Account</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#FF7875' }}>Permanently remove this user from the system</p>
                    </div>
                    <Btn onClick={() => setConfirmDelete(true)} variant="danger">
                      <Trash2 size={13} /> Delete
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.2s ease' }}
          onClick={() => setConfirmDelete(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, padding: '28px 28px 22px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeUp 0.25s ease' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FFF1F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Trash2 size={22} color="#FF4D4F" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#141414' }}>Delete User?</h3>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#595959', lineHeight: 1.5 }}>
              You are about to permanently delete <strong>{getFullName()}</strong>. This action cannot be undone and will remove all their data.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn onClick={() => setConfirmDelete(false)} variant="default">Cancel</Btn>
              <button onClick={handleDeleteUser} disabled={isDeleting} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer',
                background: '#FF4D4F', color: '#fff', border: 'none', opacity: isDeleting ? 0.6 : 1,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {isDeleting ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserDetailPage;