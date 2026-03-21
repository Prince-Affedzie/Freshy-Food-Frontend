// src/AdminPages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, ShoppingBag, Package, DollarSign,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Clock, XCircle, BarChart3, RefreshCw, ShoppingCart,
  Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { fetchDashboardData } from '../Apis/adminApi';
import LoadingSpinner from '../Components/LoadingSpinner';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── tiny helpers ────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_MAP = {
  pending:    { bg: '#FFFBE6', color: '#D48806', border: '#FFE58F' },
  processing: { bg: '#E6F4FF', color: '#1677FF', border: '#91CAFF' },
  shipped:    { bg: '#F0F5FF', color: '#2F54EB', border: '#ADC6FF' },
  delivered:  { bg: '#F6FFED', color: '#389E0D', border: '#B7EB8F' },
  cancelled:  { bg: '#FFF1F0', color: '#CF1322', border: '#FFA39E' },
  paid:       { bg: '#F6FFED', color: '#389E0D', border: '#B7EB8F' },
  failed:     { bg: '#FFF1F0', color: '#CF1322', border: '#FFA39E' },
  refunded:   { bg: '#F9F0FF', color: '#531DAB', border: '#D3ADF7' },
};
const statusStyle = (s = '') => STATUS_MAP[s.toLowerCase()] ?? { bg: '#FAFAFA', color: '#595959', border: '#D9D9D9' };

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skel = ({ w = '100%', h = 16, r = 6 }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#F5F5F5 25%,#EBEBEB 50%,#F5F5F5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, subIcon: SubIcon, accent, delay = 0 }) => (
  <div style={{
    background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0',
    padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    animation: `fadeUp 0.4s ease ${delay}ms both`,
    borderTop: `3px solid ${accent}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={accent} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#141414', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
      {sub && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          {SubIcon && <SubIcon size={13} color={accent} />}
          <span style={{ fontSize: 12, color: '#8C8C8C' }}>{sub}</span>
        </div>
      )}
    </div>
  </div>
);

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, delay = 0 }) => (
  <div style={{
    background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0',
    overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    animation: `fadeUp 0.4s ease ${delay}ms both`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #F5F5F5' }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#141414', fontFamily: "'DM Sans', sans-serif" }}>{title}</span>
      {Icon && <Icon size={17} color="#BFBFBF" />}
    </div>
    <div style={{ padding: '18px 22px' }}>{children}</div>
  </div>
);

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const st = statusStyle(status);
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>{status}</span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [lastUpdated, setLastUpdated]     = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchDashboardData();
      setDashboardData(res.data.data);
      setLastUpdated(new Date());
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const d = dashboardData;

  return (
    <AdminLayout title="Dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp   { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer  { to { background-position: -200% 0 } }
        @keyframes spin     { to { transform: rotate(360deg) } }
        .dash-btn:hover     { background: #F5F5F5 !important; }
        .dash-row:hover     { background: #FAFCFF !important; }
        .dash-prod:hover    { background: #F5F9FF !important; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAFA', minHeight: '100vh', padding: '28px 20px', color: '#262626' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.3s ease both' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#141414', letterSpacing: '-0.5px' }}>Dashboard</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8C8C8C' }}>
                Welcome back! Here's what's happening with your store.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {lastUpdated && (
                <span style={{ fontSize: 11, color: '#BFBFBF' }}>Updated {fmtDate(lastUpdated)}</span>
              )}
              <button className="dash-btn" onClick={load} disabled={loading} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
                border: '1.5px solid #E8E8E8', borderRadius: 9, background: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#595959',
                fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
                opacity: loading ? 0.6 : 1,
              }}>
                <RefreshCw size={15} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#FFF1F0', border: '1px solid #FFA39E', borderRadius: 10, marginBottom: 22, animation: 'fadeUp 0.3s ease both' }}>
              <AlertCircle size={18} color="#FF4D4F" />
              <span style={{ flex: 1, fontSize: 13, color: '#CF1322' }}>{error}</span>
              <button onClick={load} style={{ fontSize: 12, fontWeight: 700, color: '#FF4D4F', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Retry</button>
            </div>
          )}

          {/* ── Loading state ── */}
          {loading && !d ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Skel w={42} h={42} r={10} /><Skel w={80} h={12} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Skel w="60%" h={28} /><Skel w="80%" h={12} /></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ── Stat Cards ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard icon={DollarSign} label="Total Revenue" accent="#10B981"
                  value={d ? fmt(d.overview.totalRevenue) : '$0.00'}
                  sub={d ? `Today: ${fmt(d.overview.todayRevenue)}` : ''}
                  subIcon={ArrowUpRight} delay={0} />
                <StatCard icon={ShoppingBag} label="Total Orders" accent="#1677FF"
                  value={d?.overview.totalOrders ?? 0}
                  sub={d ? `Today: ${d.overview.todayOrders} new` : ''}
                  subIcon={d && d.overview.todayOrders > 0 ? ArrowUpRight : ArrowDownRight}
                  delay={60} />
                <StatCard icon={Users} label="Total Users" accent="#7C3AED"
                  value={d?.overview.totalUsers ?? 0}
                  sub="Registered customers" delay={120} />
                <StatCard icon={Package} label="Total Products" accent="#F59E0B"
                  value={d?.overview.totalProducts ?? 0}
                  sub={d?.products ? `${d.products.outOfStock.length} out of stock` : ''}
                  subIcon={d?.products?.outOfStock.length ? AlertCircle : null}
                  delay={180} />
              </div>

              {/* ── Main grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

                {/* Orders Status – 1 col */}
                <Section title="Order Status" icon={ShoppingCart} delay={220}>
                  {d?.orders?.byStatus?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {d.orders.byStatus.map((s) => {
                        const pct = d.overview.totalOrders ? (s.count / d.overview.totalOrders) * 100 : 0;
                        const st  = statusStyle(s._id);
                        return (
                          <div key={s._id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: st.color, textTransform: 'capitalize' }}>{s._id}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#141414' }}>{s.count}</span>
                            </div>
                            <div style={{ height: 5, borderRadius: 99, background: '#F0F0F0', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: st.color, transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#BFBFBF', fontSize: 13, margin: '24px 0' }}>No order data available</p>
                  )}
                </Section>

                {/* Today's perf – 1 col */}
                <div style={{
                  borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.4s ease 260ms both',
                  background: 'linear-gradient(145deg, #0F172A 0%, #1E3A5F 100%)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                }}>
                  <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Today's Performance</span>
                  </div>
                  <div style={{ padding: '22px' }}>
                    {[
                      { label: "Orders", value: d?.overview.todayOrders ?? 0, accent: '#60A5FA' },
                      { label: "Revenue", value: d ? fmt(d.overview.todayRevenue) : '$0.00', accent: '#34D399' },
                      { label: "Daily avg (÷30)", value: fmt((d?.overview.todayRevenue ?? 0) / 30), accent: '#FBBF24' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.accent }} />
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: item.accent }}>{item.value}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <BarChart3 size={14} color="rgba(255,255,255,0.3)" />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Live data · refreshes on demand</span>
                    </div>
                  </div>
                </div>

                {/* Top Selling – 1 col */}
                <Section title="Top Selling Products" icon={Star} delay={300}>
                  {d?.products?.topSelling?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {d.products.topSelling.map((p, i) => (
                        <div key={i} className="dash-prod" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px', borderRadius: 9, cursor: 'default', transition: 'background 0.12s' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#10B981' }}>{i + 1}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#141414', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: '#8C8C8C' }}>{p.totalSold} units sold</div>
                          </div>
                          <TrendingUp size={14} color="#10B981" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#BFBFBF', fontSize: 13, margin: '24px 0' }}>No sales data</p>
                  )}
                </Section>
              </div>

              {/* ── Recent Orders ── */}
              <div style={{ marginBottom: 24, animation: 'fadeUp 0.4s ease 340ms both' }}>
                <Section title="Recent Orders" icon={Clock} delay={0}>
                  {d?.orders?.recent?.length ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ textAlign: 'left' }}>
                            {['Customer', 'Email', 'Date', 'Amount', 'Status'].map((h) => (
                              <th key={h} style={{ paddingBottom: 12, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#BFBFBF', borderBottom: '1px solid #F0F0F0' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {d.orders.recent.map((order) => (
                            <tr key={order._id} className="dash-row" style={{ borderBottom: '1px solid #F5F5F5', transition: 'background 0.12s' }}>
                              <td style={{ padding: '14px 0', fontWeight: 600, color: '#141414' }}>
                                {order.user?.firstName || 'Unknown'}
                              </td>
                              <td style={{ padding: '14px 10px 14px 0', color: '#8C8C8C', fontSize: 12 }}>
                                {order.user?.email || '—'}
                              </td>
                              <td style={{ padding: '14px 10px 14px 0', color: '#8C8C8C', whiteSpace: 'nowrap', fontSize: 12 }}>
                                {fmtDate(order.createdAt)}
                              </td>
                              <td style={{ padding: '14px 10px 14px 0', fontWeight: 700, color: '#141414' }}>
                                {fmt(order.totalPrice)}
                              </td>
                              <td style={{ padding: '14px 0' }}>
                                <StatusBadge status={order.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#BFBFBF', fontSize: 13, margin: '24px 0' }}>No recent orders</p>
                  )}
                </Section>
              </div>

              {/* ── Bottom row: Stock Alerts + Payment Summary ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

                {/* Stock Alerts */}
                <Section title="Stock Alerts" icon={AlertCircle} delay={380}>
                  {d?.products?.lowStock?.length || d?.products?.outOfStock?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {d.products.lowStock?.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <TrendingDown size={14} color="#FAAD14" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#D48806' }}>Low Stock ({d.products.lowStock.length})</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {d.products.lowStock.slice(0, 3).map((p) => (
                              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FFFBE6', border: '1px solid #FFE58F', borderRadius: 9 }}>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{p.name}</div>
                                  <div style={{ fontSize: 11, color: '#D48806' }}>{p.countInStock} units left</div>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#141414' }}>{fmt(p.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {d.products.outOfStock?.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <XCircle size={14} color="#FF4D4F" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#CF1322' }}>Out of Stock ({d.products.outOfStock.length})</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {d.products.outOfStock.slice(0, 3).map((p) => (
                              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FFF1F0', border: '1px solid #FFA39E', borderRadius: 9 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{p.name}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#CF1322' }}>{fmt(p.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 8 }}>
                      <CheckCircle size={32} color="#52C41A" />
                      <p style={{ margin: 0, color: '#8C8C8C', fontSize: 13 }}>All products are well stocked</p>
                    </div>
                  )}
                </Section>

                {/* Payment Summary */}
                <Section title="Payment Summary" icon={DollarSign} delay={420}>
                  {d?.payments?.summary?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {d.payments.summary.map((pay) => {
                        const st = statusStyle(pay._id);
                        return (
                          <div key={pay._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, border: `1px solid ${st.border}`, background: st.bg }}>
                            <div>
                              <StatusBadge status={pay._id} />
                              <div style={{ fontSize: 11, color: '#8C8C8C', marginTop: 5 }}>{pay.count} transaction{pay.count !== 1 ? 's' : ''} · avg {fmt(pay.total / (pay.count || 1))}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: '#141414' }}>{fmt(pay.total)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#BFBFBF', fontSize: 13, margin: '24px 0' }}>No payment data available</p>
                  )}
                </Section>
              </div>

              {/* ── Footer summary strip ── */}
              <div style={{
                borderRadius: 14, overflow: 'hidden',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                animation: 'fadeUp 0.4s ease 460ms both',
              }}>
                {[
                  { label: 'Total Orders',   value: d?.overview.totalOrders ?? 0,         accent: '#60A5FA' },
                  { label: 'Total Revenue',  value: d ? fmt(d.overview.totalRevenue) : '$0.00', accent: '#34D399' },
                  { label: 'Registered Users', value: d?.overview.totalUsers ?? 0,        accent: '#C084FC' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '24px 28px', textAlign: 'center',
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: item.accent, letterSpacing: '-0.5px' }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;