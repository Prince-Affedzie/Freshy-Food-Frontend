// PaymentsAdminPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon, XMarkIcon, FunnelIcon,
  ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon,
  CurrencyDollarIcon, CheckCircleIcon, ClockIcon,
  XCircleIcon, ArrowPathRoundedSquareIcon, CreditCardIcon,
  ExclamationTriangleIcon, EyeIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getPaymentsOverview, getAllPayments } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `GH₵ ${Number(n || 0).toFixed(2)}`;

const STATUS_CONFIG = {
  pending:    { label:'Pending',    bg:'#FFF8E1', text:'#F57F17', border:'#FFE082', icon:ClockIcon },
  processing: { label:'Processing', bg:'#E3F2FD', text:'#1565C0', border:'#90CAF9', icon:ArrowPathRoundedSquareIcon },
  paid:       { label:'Paid',       bg:'#E8F5E9', text:'#2E7D32', border:'#A5D6A7', icon:CheckCircleIcon },
  refunded:   { label:'Refunded',   bg:'#F3E5F5', text:'#6A1B9A', border:'#CE93D8', icon:ArrowPathIcon },
  failed:     { label:'Failed',     bg:'#FFEBEE', text:'#C62828', border:'#EF9A9A', icon:XCircleIcon },
};

const METHOD_LABELS = {
  mobile_money:'Mobile Money', card:'Card', bank:'Bank Transfer',
  wallet:'Wallet', momo:'MoMo',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
  year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit',
}) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon:Icon, accent, sub, delay }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
    padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
    boxShadow:'0 1px 4px rgba(0,0,0,0.04)', borderTop:`3px solid ${accent}`,
    animation:`fadeUp 0.4s ease ${delay}ms both` }}>
    <div>
      <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#BFBFBF',
        textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
      <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#141414', letterSpacing:'-0.5px' }}>{value}</p>
      {sub && <p style={{ margin:'3px 0 0', fontSize:11, color:'#8C8C8C', fontWeight:500 }}>{sub}</p>}
    </div>
    <div style={{ width:44, height:44, borderRadius:12, background:accent+'18',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Icon style={{ width:22, height:22, color:accent }}/>
    </div>
  </div>
);

const Badge = ({ text, bg, color, border }) => (
  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
    background:bg, color, border:`1px solid ${border}`, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:5 }}>
    {text}
  </span>
);

const SelectBox = ({ value, onChange, children, style={} }) => (
  <select value={value} onChange={onChange} style={{
    padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13,
    fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA',
    outline:'none', cursor:'pointer', ...style }}>
    {children}
  </select>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PaymentsAdminPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ total:0, page:1, pages:1 });

  const [filters, setFilters] = useState({
    status:'', paymentMethod:'', startDate:'', endDate:'', page:1, limit:20,
  });

  const fetchOverview = useCallback(async () => {
    try {
      const res = await getPaymentsOverview();
      if (res.data?.success) setOverview(res.data.data);
    } catch { /* non-critical */ }
  }, []);

  const fetchPayments = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = { ...f };
      if (!params.status) delete params.status;
      if (!params.paymentMethod) delete params.paymentMethod;
      if (!params.startDate) delete params.startDate;
      if (!params.endDate) delete params.endDate;
      delete params.limit;

      const res = await getAllPayments(params);
      if (res.data?.success) {
        setPayments(res.data.data || []);
        setPagination(res.data.pagination || { total:0, page:1, pages:1 });
      }
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { fetchPayments(filters); }, [filters, fetchPayments]);

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]:value, page: key==='page'?value:1 }));
  const clearFilters = () => setFilters({ status:'', paymentMethod:'', startDate:'', endDate:'', page:1, limit:20 });

  const hasActiveFilters = filters.status || filters.paymentMethod || filters.startDate || filters.endDate;

  const overviewData = overview?.summary || [];
  const totalRevenue = overview?.totalRevenue || 0;
  const paidCount = overviewData.find(s => s._id==='paid')?.count || 0;
  const pendingCount = overviewData.find(s => s._id==='pending')?.count || 0;
  const failedCount = overviewData.find(s => s._id==='failed')?.count || 0;

  const handleRowClick = (paymentId) => {
    navigate(`/admin/payment/${paymentId}`);
  };

  return (
    <AdminLayout title="Payments">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .pm-row:hover { background:#FAFCFF !important; cursor:pointer; }
        .pm-card:hover { background:#FAFCFF !important; cursor:pointer; }
        .pm-desktop { display:block; }
        .pm-mobile  { display:none; }
        @media (max-width:767px) {
          .pm-desktop { display:none !important; }
          .pm-mobile  { display:block !important; }
          .pm-stats   { grid-template-columns:repeat(2,1fr) !important; }
          .pm-toolbar { flex-direction:column !important; }
          .pm-filter-grid { grid-template-columns:1fr !important; }
          .pm-page-footer { flex-direction:column !important; align-items:flex-start !important; }
          .pm-hdr { flex-direction:column !important; align-items:flex-start !important; }
        }
        @media (max-width:480px) {
          .pm-stats { grid-template-columns:1fr !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light"/>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* Sticky header */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="pm-hdr" style={{ maxWidth:1200, margin:'0 auto', padding:'14px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                Payments
              </h1>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>Track all transactions & revenue</p>
            </div>
            <button onClick={() => { fetchOverview(); fetchPayments(filters); }}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px',
                border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:12, fontWeight:600,
                color:'#595959', background:'#fff', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              <ArrowPathIcon style={{ width:15, height:15 }}/> Refresh
            </button>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* Stats */}
          <div className="pm-stats" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
            <StatCard label="Total Revenue" value={fmt(totalRevenue)} icon={CurrencyDollarIcon} accent="#1677FF" delay={0} />
            <StatCard label="Paid" value={paidCount} icon={CheckCircleIcon} accent="#10B981" delay={60} sub={`${overviewData.find(s=>s._id==='paid')?.totalAmount?.toFixed(2)||0} GHS`} />
            <StatCard label="Pending" value={pendingCount} icon={ClockIcon} accent="#FAAD14" delay={120} />
            <StatCard label="Failed" value={failedCount} icon={XCircleIcon} accent="#FF4D4F" delay={180} />
          </div>

          {/* Filter bar */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0', padding:'14px 18px',
            marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', animation:'fadeUp 0.35s ease 280ms both' }}>
            <div className="pm-toolbar" style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
              <SelectBox value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </SelectBox>
              <SelectBox value={filters.paymentMethod} onChange={e => setFilter('paymentMethod', e.target.value)}>
                <option value="">All Methods</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="wallet">Wallet</option>
                <option value="momo">MoMo</option>
              </SelectBox>
              <button onClick={() => setShowFilters(v => !v)} style={{
                display:'flex', alignItems:'center', gap:6, padding:'9px 14px',
                border:`1.5px solid ${showFilters?'#1677FF':'#E8E8E8'}`,
                borderRadius:9, background:showFilters?'#E6F4FF':'#fff',
                fontSize:13, fontWeight:600, color:showFilters?'#1677FF':'#595959',
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                <FunnelIcon style={{ width:14, height:14 }}/> Date Range
                {hasActiveFilters && <span style={{ width:7, height:7, borderRadius:'50%', background:'#1677FF', display:'inline-block' }}/>}
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{
                  display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderRadius:9,
                  border:'1.5px solid #FFA39E', background:'#FFF1F0', fontSize:13, fontWeight:600,
                  color:'#FF4D4F', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <XMarkIcon style={{ width:14, height:14 }}/> Clear
                </button>
              )}
            </div>

            {showFilters && (
              <div className="pm-filter-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10,
                paddingTop:14, marginTop:14, borderTop:'1px solid #F5F5F5' }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase', display:'block', marginBottom:6 }}>Start Date</label>
                  <input type="date" value={filters.startDate} onChange={e => setFilter('startDate', e.target.value)}
                    style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13,
                      fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA', outline:'none' }}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase', display:'block', marginBottom:6 }}>End Date</label>
                  <input type="date" value={filters.endDate} onChange={e => setFilter('endDate', e.target.value)}
                    style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13,
                      fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA', outline:'none' }}/>
                </div>
              </div>
            )}
          </div>

          {/* Payments list */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', overflow:'hidden',
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeUp 0.35s ease 320ms both' }}>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'64px 24px', gap:14 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
                  borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }}/>
                <p style={{ margin:0, fontSize:13, color:'#8C8C8C' }}>Loading payments…</p>
              </div>
            ) : payments.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 24px' }}>
                <CreditCardIcon style={{ width:48, height:48, color:'#E0E0E0', margin:'0 auto 12px' }}/>
                <h3 style={{ margin:'0 0 6px', fontSize:15, fontWeight:700, color:'#595959' }}>No payments found</h3>
                <p style={{ margin:0, fontSize:13, color:'#BFBFBF' }}>Try adjusting your filters</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="pm-desktop" style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F0F0F0' }}>
                        {['Transaction Ref','Customer','Amount','Method','Status','Date',''].map((h,i) => (
                          <th key={i} style={{ padding:'12px 14px', textAlign:'left', fontSize:11, fontWeight:700,
                            color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => {
                        const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                        return (
                          <tr key={p._id} className="pm-row" onClick={() => handleRowClick(p._id)}
                            style={{ borderBottom:'1px solid #F5F5F5', background:'#fff', transition:'background 0.12s' }}>
                            <td style={{ padding:'14px' }}>
                              <p style={{ margin:0, fontWeight:700, color:'#141414', fontFamily:'monospace', fontSize:12 }}>
                                {p.transactionRef || '—'}
                              </p>
                              <p style={{ margin:'2px 0 0', fontSize:10, color:'#BFBFBF' }}>
                                {p._id?.slice(-8).toUpperCase()}
                              </p>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <p style={{ margin:'0 0 2px', fontWeight:600, color:'#141414' }}>
                                {p.user?.firstName || 'N/A'} {p.user?.lastName || ''}
                              </p>
                              <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>{p.user?.email || p.user?.phone || ''}</p>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <p style={{ margin:0, fontWeight:800, color:'#141414' }}>{fmt(p.amount)}</p>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <span style={{ fontSize:12, fontWeight:600, color:'#595959' }}>
                                {METHOD_LABELS[p.paymentMethod] || p.paymentMethod}
                              </span>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <Badge text={sc.label} bg={sc.bg} color={sc.text} border={sc.border} />
                            </td>
                            <td style={{ padding:'14px' }}>
                              <p style={{ margin:0, fontSize:12, color:'#8C8C8C', fontWeight:500 }}>{fmtDate(p.createdAt)}</p>
                            </td>
                            <td style={{ padding:'14px 14px 14px 0' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                                <EyeIcon style={{ width:15, height:15, color:'#BFBFBF' }}/>
                                <span style={{ fontSize:11, color:'#BFBFBF', fontWeight:500 }}>View</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="pm-mobile">
                  {payments.map(p => {
                    const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={p._id} className="pm-card" onClick={() => handleRowClick(p._id)}
                        style={{ padding:'14px 16px', borderBottom:'1px solid #F5F5F5',
                          background:'#fff', transition:'background 0.12s' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#141414', fontFamily:'monospace' }}>
                              {p.transactionRef || '—'}
                            </p>
                            <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>
                              {p.user?.firstName || 'N/A'} {p.user?.lastName || ''}
                            </p>
                          </div>
                          <Badge text={sc.label} bg={sc.bg} color={sc.text} border={sc.border} />
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <p style={{ margin:0, fontSize:16, fontWeight:800, color:'#141414' }}>{fmt(p.amount)}</p>
                            <p style={{ margin:'2px 0 0', fontSize:11, color:'#8C8C8C' }}>
                              {METHOD_LABELS[p.paymentMethod] || p.paymentMethod} · {fmtDate(p.createdAt)}
                            </p>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <EyeIcon style={{ width:14, height:14, color:'#BFBFBF' }}/>
                            <span style={{ fontSize:11, color:'#BFBFBF', fontWeight:500 }}>View</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pm-page-footer" style={{ display:'flex', alignItems:'center',
                justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid #F5F5F5', gap:12 }}>
                <span style={{ fontSize:12, color:'#8C8C8C' }}>
                  Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong>
                  {' '}· <strong>{pagination.total}</strong> total
                </span>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <button disabled={pagination.page <= 1}
                    onClick={() => setFilter('page', 1)} style={{
                      width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: pagination.page>1?'pointer':'not-allowed', opacity: pagination.page>1?1:0.4 }}>
                    «
                  </button>
                  <button disabled={pagination.page <= 1}
                    onClick={() => setFilter('page', pagination.page - 1)} style={{
                      width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: pagination.page>1?'pointer':'not-allowed', opacity: pagination.page>1?1:0.4 }}>
                    <ChevronLeftIcon style={{ width:15, height:15, color:'#595959' }}/>
                  </button>

                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pg = Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4)) + i;
                    if (pg < 1 || pg > pagination.pages) return null;
                    const active = pg === pagination.page;
                    return (
                      <button key={pg} onClick={() => setFilter('page', pg)} style={{
                        width:32, height:32, borderRadius:8, fontSize:13, fontWeight: active?700:500,
                        border: active?'1.5px solid #1677FF':'1.5px solid #E8E8E8',
                        background: active?'#E6F4FF':'#fff', color: active?'#1677FF':'#595959', cursor:'pointer' }}>
                        {pg}
                      </button>
                    );
                  })}

                  <button disabled={pagination.page >= pagination.pages}
                    onClick={() => setFilter('page', pagination.page + 1)} style={{
                      width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: pagination.page<pagination.pages?'pointer':'not-allowed', opacity: pagination.page<pagination.pages?1:0.4 }}>
                    <ChevronRightIcon style={{ width:15, height:15, color:'#595959' }}/>
                  </button>
                  <button disabled={pagination.page >= pagination.pages}
                    onClick={() => setFilter('page', pagination.pages)} style={{
                      width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: pagination.page<pagination.pages?'pointer':'not-allowed', opacity: pagination.page<pagination.pages?1:0.4 }}>
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PaymentsAdminPage;