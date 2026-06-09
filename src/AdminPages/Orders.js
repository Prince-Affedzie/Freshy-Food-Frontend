// AdminOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Eye, CheckCircle, Clock, Truck, XCircle, DollarSign, ShoppingCart, User,
  MapPin, Calendar, CreditCard, RefreshCw, AlertTriangle, Package,
  TrendingUp, Download, MoreVertical, X, ChevronDown,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllOrders } from '../Apis/orderApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Status / payment config ──────────────────────────────────────────────────
const STATUS_MAP = {
  Pending:          { bg:'#FFFBE6', color:'#D48806', border:'#FFE58F', dot:'#FAAD14', icon: Clock        },
  Processing:       { bg:'#E6F4FF', color:'#1677FF', border:'#91CAFF', dot:'#1677FF', icon: RefreshCw    },
  'Out for Delivery':{ bg:'#F0F5FF', color:'#2F54EB', border:'#ADC6FF', dot:'#2F54EB', icon: Truck       },
  Delivered:        { bg:'#F6FFED', color:'#389E0D', border:'#B7EB8F', dot:'#52C41A', icon: CheckCircle  },
  Cancelled:        { bg:'#FFF1F0', color:'#CF1322', border:'#FFA39E', dot:'#FF4D4F', icon: XCircle      },
};
const getStatus = (s) => STATUS_MAP[s] ?? { bg:'#F5F5F5', color:'#595959', border:'#E8E8E8', dot:'#8C8C8C', icon: Package };

const PAY_MAP = {
  momo: { label:'Mobile Money', bg:'#F9F0FF', color:'#531DAB', border:'#D3ADF7' },
  card: { label:'Card',         bg:'#E6F4FF', color:'#1677FF', border:'#91CAFF' },
  cash: { label:'Cash',         bg:'#F6FFED', color:'#389E0D', border:'#B7EB8F' },
};
const getPay = (m) => PAY_MAP[m] ?? { label: m||'N/A', bg:'#F5F5F5', color:'#595959', border:'#E8E8E8' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US',{ day:'2-digit', month:'short', year:'numeric' }) : 'N/A';

const fmtCurrency = (n) =>
  (n||0).toLocaleString('en-US',{ style:'currency', currency:'USD' });

// ─── Tiny sub-components ──────────────────────────────────────────────────────
const StatusBadge = ({ status, size='md' }) => {
  const cfg  = getStatus(status);
  const Icon = cfg.icon;
  const pad  = size==='sm' ? '2px 8px' : '4px 11px';
  const fs   = size==='sm' ? 10 : 11;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:pad,
      borderRadius:20, fontSize:fs, fontWeight:700, background:cfg.bg, color:cfg.color,
      border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>
      <Icon size={10}/>{status}
    </span>
  );
};

const PayBadge = ({ method, isPaid }) => {
  const cfg = getPay(method);
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px',
      borderRadius:20, fontSize:11, fontWeight:700, background:cfg.bg, color:cfg.color,
      border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>
      <CreditCard size={10}/>{cfg.label}
      {isPaid && <CheckCircle size={9} color="#52C41A"/>}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0',
    padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between',
    boxShadow:'0 1px 4px rgba(0,0,0,0.04)', borderTop:`3px solid ${accent}`,
    animation:`fadeUp 0.4s ease ${delay}ms both`, flex:'1 1 150px', minWidth:0 }}>
  <div style={{ minWidth:0 }}>
    <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#BFBFBF',
      textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{label}</p>
    <p style={{ margin:0, fontSize:20, fontWeight:800, color:'#141414', letterSpacing:'-0.5px',
      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</p>
  </div>
  <div style={{ width:38, height:38, borderRadius:10, background:accent+'18',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:8 }}>
    <Icon size={17} color={accent}/>
  </div>
  </div>
);

const IconBtn = ({ onClick, title, bg, color, border, children }) => (
  <button onClick={onClick} title={title} style={{
    width:30, height:30, borderRadius:7, background:bg||'#fff', color, border:`1.5px solid ${border||'#E8E8E8'}`,
    display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'filter 0.15s',
  }}>
    {children}
  </button>
);

const SelectBox = ({ value, onChange, children, style={} }) => (
  <div style={{ position:'relative', ...style }}>
    <select value={value} onChange={onChange} style={{
      width:'100%', padding:'9px 32px 9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9,
      fontSize:13, fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA',
      outline:'none', cursor:'pointer', appearance:'none',
    }}>{children}</select>
    <ChevronDown size={13} color="#8C8C8C" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]   = useState({
    status:'all', startDate:'', endDate:'', paymentMethod:'all',
    search:'', sort:'newest', page:1, limit:20,
  });
  const [pagination, setPagination] = useState({
    currentPage:1, totalPages:1, total:0, hasNextPage:false, hasPrevPage:false,
  });

  const activeFilterCount = [
    filters.status !== 'all', filters.paymentMethod !== 'all',
    filters.startDate, filters.endDate, filters.search, filters.sort !== 'newest',
  ].filter(Boolean).length;

  useEffect(() => { fetchOrders(); }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const f = { ...filters };
      if (f.status === 'all')        delete f.status;
      if (f.paymentMethod === 'all') delete f.paymentMethod;
      if (!f.search)     delete f.search;
      if (!f.startDate)  delete f.startDate;
      if (!f.endDate)    delete f.endDate;
      const res = await getAllOrders(f);
      if (res.data.success) {
        setOrders(res.data.data);
        setStats(res.data.stats);
        setPagination(res.data.pagination);
      } else throw new Error();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load orders');
    } finally { setLoading(false); }
  };

  const setFilter  = (k, v) => setFilters(p=>({...p,[k]:v,page:1}));
  const changePage = (n) => { if (n>=1 && n<=pagination.totalPages) setFilters(p=>({...p,page:n})); };
  const resetFilters = () => {
    setFilters({ status:'all', startDate:'', endDate:'', paymentMethod:'all', search:'', sort:'newest', page:1, limit:20 });
    toast.info('Filters reset');
  };

  const itemCount = (o) => o.items?.length || o.itemsCount || 0;

  return (
    <AdminLayout title="Orders Management">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .ao-row:hover   { background:#FAFCFF !important; }
        .ao-card:hover  { border-color:#91CAFF !important; }
        .ao-iBtn:hover  { filter:brightness(0.9); }

        @media (max-width:640px) {
          .ao-stats     { flex-wrap:wrap !important; }
          .ao-stats>div { flex:1 1 calc(50% - 7px) !important; }
          .ao-hdr       { flex-direction:column !important; align-items:flex-start !important; }
          .ao-hdr-btns  { width:100% !important; justify-content:flex-end !important; }
          .ao-filter-grid { grid-template-columns:1fr !important; }
          .ao-filter-g2   { grid-template-columns:1fr !important; }
          .ao-desktop   { display:none !important; }
          .ao-mobile    { display:flex !important; }
          .ao-pg-footer { flex-direction:column !important; align-items:flex-start !important; }
          .ao-bottom    { flex-direction:column !important; }
          .ao-status-dist { margin-bottom:0 !important; }
        }
        @media (min-width:641px) {
          .ao-mobile { display:none !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light"/>

      <div style={{ overflow:"hidden", fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* ── Sticky header ── */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="ao-hdr" style={{ maxWidth:1200, margin:'0 auto', padding:'14px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>Customer Orders</h1>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>Manage and track all customer orders</p>
            </div>
            <div className="ao-hdr-btns" style={{ display:'flex', alignItems:'center', gap:8 }}>
              {/* Filter toggle */}
              <button onClick={()=>setShowFilters(v=>!v)} style={{
                display:'flex', alignItems:'center', gap:7, padding:'9px 14px',
                border:`1.5px solid ${showFilters?'#1677FF':'#E8E8E8'}`,
                borderRadius:9, fontSize:13, fontWeight:600,
                background:showFilters?'#E6F4FF':'#fff', color:showFilters?'#1677FF':'#595959',
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif", position:'relative',
              }}>
                <Filter size={14}/> Filters
                {activeFilterCount > 0 && (
                  <span style={{ position:'absolute', top:-6, right:-6, width:18, height:18,
                    borderRadius:'50%', background:'#FF4D4F', color:'#fff',
                    fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid #fff' }}>{activeFilterCount}</span>
                )}
              </button>
              <IconBtn onClick={fetchOrders} title="Refresh" bg="#F6FFED" color="#389E0D" border="#B7EB8F">
                <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }}/>
              </IconBtn>
              <IconBtn title="Export" bg="#fff" color="#595959" border="#E8E8E8">
                <Download size={14}/>
              </IconBtn>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* ── Filter panel ── */}
          {showFilters && (
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0',
              padding:'18px 20px', marginBottom:18, boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
              animation:'fadeIn 0.2s ease' }}>
              <div className="ao-filter-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:14 }}>
                <div>
                  <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#8C8C8C', textTransform:'uppercase', letterSpacing:'0.05em' }}>Status</p>
                  <SelectBox value={filters.status} onChange={e=>setFilter('status',e.target.value)}>
                    <option value="all">All Status</option>
                    {Object.keys(STATUS_MAP).map(s=><option key={s} value={s}>{s}</option>)}
                  </SelectBox>
                </div>
                <div>
                  <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#8C8C8C', textTransform:'uppercase', letterSpacing:'0.05em' }}>Payment Method</p>
                  <SelectBox value={filters.paymentMethod} onChange={e=>setFilter('paymentMethod',e.target.value)}>
                    <option value="all">All Methods</option>
                    <option value="momo">Mobile Money</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash on Delivery</option>
                  </SelectBox>
                </div>
                <div>
                  <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#8C8C8C', textTransform:'uppercase', letterSpacing:'0.05em' }}>Start Date</p>
                  <input type="date" value={filters.startDate} onChange={e=>setFilter('startDate',e.target.value)}
                    style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9,
                      fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', color:'#262626', background:'#FAFAFA' }}/>
                </div>
                <div>
                  <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#8C8C8C', textTransform:'uppercase', letterSpacing:'0.05em' }}>End Date</p>
                  <input type="date" value={filters.endDate} onChange={e=>setFilter('endDate',e.target.value)}
                    style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9,
                      fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', color:'#262626', background:'#FAFAFA' }}/>
                </div>
              </div>
              <div className="ao-filter-g2" style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:12, alignItems:'flex-end' }}>
                {/* Search */}
                <div>
                  <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#8C8C8C', textTransform:'uppercase', letterSpacing:'0.05em' }}>Search</p>
                  <div style={{ position:'relative' }}>
                    <Search size={14} color="#BFBFBF" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }}/>
                    <input value={filters.search} onChange={e=>setFilter('search',e.target.value)}
                      placeholder="Order ID, customer name or phone…"
                      style={{ width:'100%', paddingLeft:32, paddingRight:filters.search?32:12, paddingTop:9, paddingBottom:9,
                        border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13, fontFamily:"'DM Sans',sans-serif",
                        outline:'none', color:'#262626', background:'#FAFAFA' }}/>
                    {filters.search && (
                      <button onClick={()=>setFilter('search','')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                        background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#BFBFBF' }}>
                        <X size={13}/>
                      </button>
                    )}
                  </div>
                </div>
                {/* Sort */}
                <SelectBox value={filters.sort} onChange={e=>setFilter('sort',e.target.value)} style={{ minWidth:160 }}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="totalPrice">Price: Low → High</option>
                  <option value="totalPrice-desc">Price: High → Low</option>
                </SelectBox>
                {/* Reset */}
                <button onClick={resetFilters} style={{
                  padding:'9px 16px', border:'1.5px solid #FFA39E', borderRadius:9,
                  fontSize:13, fontWeight:600, color:'#FF4D4F', background:'#FFF1F0',
                  cursor:'pointer', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap',
                }}>Reset</button>
              </div>
            </div>
          )}

          {/* ── Stats ── */}
          {stats && (
            <div className="ao-stats" style={{ display:'flex', gap:14, marginBottom:20 }}>
              <StatCard label="Today's Orders"  value={stats.todayOrders??0}              icon={Calendar}   accent="#1677FF" delay={0}  />
              <StatCard label="Pending"          value={stats.pendingOrders??0}            icon={Clock}       accent="#FAAD14" delay={60} />
              <StatCard label="Total Revenue"    value={stats.totalRevenueDisplay||'₵0.00'} icon={DollarSign} accent="#10B981" delay={120}/>
              <StatCard label="Avg Order Value"  value={stats.avgOrderValueDisplay||'₵0.00'} icon={TrendingUp} accent="#7C3AED" delay={180}/>
            </div>
          )}

          {/* ── Table card ── */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', overflow:'hidden',
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeUp 0.35s ease 220ms both' }}>

            {/* Table header bar */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 20px', borderBottom:'1px solid #F5F5F5', background:'#FAFAFA', flexWrap:'wrap', gap:10 }}>
              <div>
                <span style={{ fontSize:14, fontWeight:700, color:'#141414' }}>
                  Orders <span style={{ color:'#BFBFBF', fontWeight:500 }}>({pagination.total||0})</span>
                </span>
                <span style={{ fontSize:12, color:'#8C8C8C', marginLeft:10 }}>
                  Showing {orders.length} of {pagination.total||0}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, color:'#8C8C8C' }}>Rows:</span>
                <SelectBox value={filters.limit} onChange={e=>setFilter('limit',parseInt(e.target.value))} style={{ minWidth:70 }}>
                  {[10,20,50,100].map(n=><option key={n} value={n}>{n}</option>)}
                </SelectBox>
              </div>
            </div>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'64px 24px', gap:14 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
                  borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }}/>
                <p style={{ margin:0, fontSize:13, color:'#8C8C8C' }}>Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 24px' }}>
                <ShoppingCart size={44} color="#E0E0E0" style={{ marginBottom:12 }}/>
                <h3 style={{ margin:'0 0 6px', fontSize:15, fontWeight:700, color:'#595959' }}>No orders found</h3>
                <p style={{ margin:0, fontSize:13, color:'#BFBFBF' }}>Try adjusting your filters</p>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} style={{ marginTop:12, fontSize:13, fontWeight:700,
                    color:'#1677FF', background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ── Desktop table ── */}
                <div className="ao-desktop" style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F0F0F0' }}>
                        {['Order','Customer','Items','Amount','Status','Payment','Actions'].map(h=>(
                          <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11,
                            fontWeight:700, color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order=>(
                        <tr key={order.id} className="ao-row" style={{ borderBottom:'1px solid #F5F5F5', background:'#fff', transition:'background 0.12s' }}>
                          {/* Order */}
                          <td style={{ padding:'14px 16px' }}>
                            <p style={{ margin:'0 0 3px', fontWeight:700, color:'#141414', fontSize:13 }}>
                              {order.orderNumber || `#${order.id?.slice(0,8)}`}
                            </p>
                            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#BFBFBF' }}>
                              <Calendar size={10}/>{order.createdAt}
                            </span>
                            {order.shippingAddress?.city && (
                              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#BFBFBF', marginTop:2 }}>
                                <MapPin size={10}/>{order.shippingAddress.city}
                              </span>
                            )}
                          </td>
                          {/* Customer */}
                          <td style={{ padding:'14px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                              <div style={{ width:32, height:32, borderRadius:9, flexShrink:0,
                                background:'linear-gradient(135deg,#1677FF,#10B981)',
                                display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <span style={{ fontSize:12, fontWeight:800, color:'#fff' }}>
                                  {(order.customer?.firstName||'C')[0].toUpperCase()}
                                </span>
                              </div>
                              <div style={{ minWidth:0 }}>
                                <p style={{ margin:'0 0 2px', fontWeight:700, color:'#141414', whiteSpace:'nowrap',
                                  overflow:'hidden', textOverflow:'ellipsis', maxWidth:120 }}>
                                  {order.customer?.firstName||'Customer'}
                                </p>
                                <p style={{ margin:0, fontSize:11, color:'#8C8C8C' }}>{order.customer?.phone||'—'}</p>
                              </div>
                            </div>
                          </td>
                          {/* Items */}
                          <td style={{ padding:'14px 16px' }}>
                            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600, color:'#262626' }}>
                              <Package size={13} color="#BFBFBF"/>{itemCount(order)} item{itemCount(order)!==1?'s':''}
                            </span>
                          </td>
                          {/* Amount */}
                          <td style={{ padding:'14px 16px' }}>
                            <p style={{ margin:0, fontWeight:800, color:'#141414', fontSize:14 }}>{fmtCurrency(order.totalPrice)}</p>
                          </td>
                          {/* Status */}
                          <td style={{ padding:'14px 16px' }}>
                            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                              <StatusBadge status={order.status}/>
                              {!order.isPaid && order.status!=='Cancelled' && (
                                <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#FF4D4F', fontWeight:600 }}>
                                  <AlertTriangle size={10}/> Payment pending
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Payment */}
                          <td style={{ padding:'14px 16px' }}>
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              <PayBadge method={order.paymentMethod} isPaid={order.isPaid}/>
                              <span style={{ fontSize:10, color:'#BFBFBF', fontWeight:600 }}>
                                {order.isPaid?'✓ Paid':'✗ Unpaid'}
                              </span>
                            </div>
                          </td>
                          {/* Actions */}
                          <td style={{ padding:'14px 16px' }}>
                            <div style={{ display:'flex', gap:5 }}>
                              <IconBtn onClick={()=>navigate(`/admin/order/${order.id}`)} title="View"
                                bg="#F0F7FF" color="#1677FF" border="#BFDBFE">
                                <Eye size={13}/>
                              </IconBtn>
                              <IconBtn title="More" bg="#FAFAFA" color="#8C8C8C" border="#E8E8E8">
                                <MoreVertical size={13}/>
                              </IconBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile cards ── */}
                <div className="ao-mobile" style={{ flexDirection:'column', display:'none' }}>
                  {orders.map(order=>{
                    const sc = getStatus(order.status);
                    return (
                      <div key={order.id} className="ao-card" style={{ padding:'14px 16px',
                        borderBottom:'1px solid #F5F5F5', transition:'border-color 0.15s' }}>
                        {/* Top row */}
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:10 }}>
                          <div>
                            <p style={{ margin:'0 0 3px', fontSize:14, fontWeight:800, color:'#141414' }}>
                              {order.orderNumber||`#${order.id?.slice(0,8)}`}
                            </p>
                            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#BFBFBF' }}>
                              <Calendar size={10}/>{order.createdAt}
                            </span>
                          </div>
                          <StatusBadge status={order.status} size="sm"/>
                        </div>

                        {/* Customer row */}
                        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
                          <div style={{ width:32, height:32, borderRadius:9, flexShrink:0,
                            background:'linear-gradient(135deg,#1677FF,#10B981)',
                            display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ fontSize:12, fontWeight:800, color:'#fff' }}>
                              {(order.customer?.firstName||'C')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#141414' }}>
                              {order.customer?.firstName||'Customer'}
                            </p>
                            <p style={{ margin:0, fontSize:11, color:'#8C8C8C' }}>{order.customer?.phone||'—'}</p>
                          </div>
                        </div>

                        {/* Detail grid */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10,
                          padding:'10px 12px', background:'#FAFAFA', borderRadius:10 }}>
                          <div>
                            <p style={{ margin:'0 0 2px', fontSize:10, color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700 }}>Amount</p>
                            <p style={{ margin:0, fontSize:15, fontWeight:800, color:'#141414' }}>{fmtCurrency(order.totalPrice)}</p>
                          </div>
                          <div>
                            <p style={{ margin:'0 0 2px', fontSize:10, color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700 }}>Items</p>
                            <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#262626' }}>{itemCount(order)} item{itemCount(order)!==1?'s':''}</p>
                          </div>
                          <div>
                            <p style={{ margin:'0 0 4px', fontSize:10, color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700 }}>Payment</p>
                            <PayBadge method={order.paymentMethod} isPaid={order.isPaid}/>
                          </div>
                          {order.shippingAddress?.city && (
                            <div>
                              <p style={{ margin:'0 0 2px', fontSize:10, color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700 }}>Location</p>
                              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#595959' }}>
                                <MapPin size={11} color="#BFBFBF"/>{order.shippingAddress.city}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Payment warning */}
                        {!order.isPaid && order.status!=='Cancelled' && (
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#FF4D4F',
                            fontWeight:600, padding:'6px 10px', background:'#FFF1F0', borderRadius:8, marginBottom:10 }}>
                            <AlertTriangle size={11}/> Payment pending for this order
                          </div>
                        )}

                        {/* CTA */}
                        <button onClick={()=>navigate(`/admin/order/${order.id}`)} style={{
                          display:'flex', alignItems:'center', justifyContent:'center', gap:7, width:'100%',
                          padding:'9px', borderRadius:9, background:'#F0F7FF', color:'#1677FF',
                          border:'1.5px solid #BFDBFE', fontSize:13, fontWeight:700, cursor:'pointer',
                          fontFamily:"'DM Sans',sans-serif",
                        }}>
                          <Eye size={14}/> View Order Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Pagination ── */}
            {pagination.totalPages > 1 && (
              <div className="ao-pg-footer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'14px 20px', borderTop:'1px solid #F5F5F5', background:'#FAFAFA', gap:10 }}>
                <span style={{ fontSize:12, color:'#8C8C8C' }}>
                  Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                </span>
                <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                  {[
                    { icon:<ChevronsLeft size={13}/>, action:()=>changePage(1), disabled:!pagination.hasPrevPage },
                    { icon:<ChevronLeft  size={13}/>, action:()=>changePage(pagination.currentPage-1), disabled:!pagination.hasPrevPage },
                  ].map((b,i)=>(
                    <button key={i} onClick={b.action} disabled={b.disabled} style={{
                      width:30, height:30, borderRadius:7, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center', color:'#595959',
                      cursor:b.disabled?'not-allowed':'pointer', opacity:b.disabled?0.4:1 }}>{b.icon}</button>
                  ))}
                  {Array.from({length:Math.min(5,pagination.totalPages)},(_,i)=>{
                    const pg = Math.max(1,Math.min(pagination.currentPage-2,pagination.totalPages-4))+i;
                    if(pg<1||pg>pagination.totalPages) return null;
                    const active=pg===pagination.currentPage;
                    return (
                      <button key={pg} onClick={()=>changePage(pg)} style={{
                        width:30, height:30, borderRadius:7, fontSize:12, fontWeight:active?700:500,
                        border:active?'1.5px solid #1677FF':'1.5px solid #E8E8E8',
                        background:active?'#E6F4FF':'#fff', color:active?'#1677FF':'#595959', cursor:'pointer' }}>{pg}</button>
                    );
                  })}
                  {[
                    { icon:<ChevronRight  size={13}/>, action:()=>changePage(pagination.currentPage+1), disabled:!pagination.hasNextPage },
                    { icon:<ChevronsRight size={13}/>, action:()=>changePage(pagination.totalPages),    disabled:!pagination.hasNextPage },
                  ].map((b,i)=>(
                    <button key={i} onClick={b.action} disabled={b.disabled} style={{
                      width:30, height:30, borderRadius:7, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center', color:'#595959',
                      cursor:b.disabled?'not-allowed':'pointer', opacity:b.disabled?0.4:1 }}>{b.icon}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom analytics row ── */}
          {stats && orders.length > 0 && (
            <div className="ao-bottom" style={{ display:'flex', gap:16, marginTop:18 }}>

              {/* Status distribution */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'18px 20px',
                boxShadow:'0 1px 4px rgba(0,0,0,0.04)', flex:'0 0 260px', animation:'fadeUp 0.4s ease 300ms both' }}
                className="ao-status-dist">
                <p style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#141414' }}>Status Distribution</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {Object.entries(STATUS_MAP).map(([label,cfg])=>{
                    const count = orders.filter(o=>o.status===label).length;
                    const pct   = orders.length ? (count/orders.length)*100 : 0;
                    return (
                      <div key={label}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#262626' }}>
                            <span style={{ width:8, height:8, borderRadius:'50%', background:cfg.dot, flexShrink:0, display:'inline-block' }}/>
                            {label}
                          </span>
                          <span style={{ fontSize:12, fontWeight:700, color:'#141414' }}>{count}</span>
                        </div>
                        <div style={{ height:4, borderRadius:99, background:'#F0F0F0', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background:cfg.dot, transition:'width 0.5s ease' }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent activity */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'18px 20px',
                boxShadow:'0 1px 4px rgba(0,0,0,0.04)', flex:1, minWidth:0,
                animation:'fadeUp 0.4s ease 360ms both' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#141414' }}>Recent Activity</p>
                  <span style={{ fontSize:11, color:'#BFBFBF' }}>{fmtDate(new Date())}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {orders.slice(0,10).map((order,i)=>(
                    <div key={order.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'12px 0', borderBottom: i<4 ? '1px solid #F5F5F5' : 'none', gap:12 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                          <span style={{ fontSize:13, fontWeight:700, color:'#141414' }}>
                            {order.orderNumber||`#${order.id?.slice(0,8)}`}
                          </span>
                          <StatusBadge status={order.status} size="sm"/>
                        </div>
                        <span style={{ fontSize:11, color:'#8C8C8C' }}>
                          {order.customer?.firstName||'Customer'} · {order.createdAt}
                        </span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                        <span style={{ fontSize:14, fontWeight:800, color:'#141414' }}>{fmtCurrency(order.totalPrice)}</span>
                        <button onClick={()=>navigate(`/admin/order/${order.id}`)} style={{
                          width:28, height:28, borderRadius:7, background:'#F0F7FF', color:'#1677FF',
                          border:'1.5px solid #BFDBFE', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                        }}>
                          <Eye size={12}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;