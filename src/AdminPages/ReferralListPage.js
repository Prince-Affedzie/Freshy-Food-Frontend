// ReferralListPage.jsx
import React, { useEffect, useState } from 'react';
import { getAllReferrals, getReferralStats } from '../Apis/adminApi';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon,
  ChevronLeftIcon, ChevronRightIcon,
  LinkIcon, EyeIcon, GiftIcon, UsersIcon,
  CurrencyDollarIcon, ChartBarIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  generated: { label: 'Generated', bg: '#F0F5FF', color: '#2F54EB', border: '#ADC6FF' },
  clicked:   { label: 'Clicked',   bg: '#FFF7E6', color: '#D46B08', border: '#FFD591' },
  ordered:   { label: 'Ordered',   bg: '#FFF0F6', color: '#C41D7F', border: '#FFADD2' },
  confirmed: { label: 'Confirmed', bg: '#E6FFFB', color: '#08979C', border: '#87E8DE' },
  rewarded:  { label: 'Rewarded',  bg: '#F6FFED', color: '#389E0D', border: '#B7EB8F' },
  expired:   { label: 'Expired',   bg: '#FFF1F0', color: '#CF1322', border: '#FFA39E' },
  cancelled: { label: 'Cancelled', bg: '#FAFAFA', color: '#8C8C8C', border: '#D9D9D9' },
};

const formatGHS = (n) => `GH₵ ${Number(n || 0).toFixed(2)}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon:Icon, accent, delay }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
    padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
    boxShadow:'0 1px 4px rgba(0,0,0,0.04)', borderTop:`3px solid ${accent}`,
    animation:`fadeUp 0.4s ease ${delay}ms both` }}>
    <div>
      <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#BFBFBF',
        textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
      <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#141414', letterSpacing:'-0.5px' }}>{value}</p>
    </div>
    <div style={{ width:44, height:44, borderRadius:12, background:accent+'18',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Icon style={{ width:22, height:22, color:accent }}/>
    </div>
  </div>
);

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.generated;
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
      background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>
      {cfg.label}
    </span>
  );
};

const SelectBox = ({ value, onChange, children, style={} }) => (
  <select value={value} onChange={onChange} style={{
    padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13,
    fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA',
    outline:'none', cursor:'pointer', ...style }}>
    {children}
  </select>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReferralListPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        status: statusFilter || undefined,
        search: searchQuery.trim() || undefined,
        sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
        page,
        limit,
      };
      const response = await getAllReferrals(params);
      const data = response.data?.data || response.data;
      setReferrals(data.referrals || []);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to load referrals';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getReferralStats();
      setStats(response.data?.data || null);
    } catch (err) {
      console.error('Failed to load referral stats:', err);
    }
  };

  useEffect(() => { fetchReferrals(); fetchStats(); }, [page, sortBy, sortOrder]);
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { fetchReferrals(); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, page, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const hasActiveFilters = searchQuery || statusFilter;
  const overview = stats?.overview || {};

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .rf-row:hover { background:#FAFCFF !important; cursor:pointer; }
        .rf-card:hover { background:#FAFCFF !important; cursor:pointer; }
        .rf-desktop { display:block; }
        .rf-mobile  { display:none; }
        @media (max-width:767px) {
          .rf-desktop { display:none !important; }
          .rf-mobile  { display:block !important; }
          .rf-stats   { grid-template-columns:repeat(2,1fr) !important; }
          .rf-toolbar { flex-direction:column !important; }
          .rf-page-footer { flex-direction:column !important; align-items:flex-start !important; }
          .rf-hdr { flex-direction:column !important; align-items:flex-start !important; }
        }
        @media (max-width:480px) {
          .rf-stats { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* Sticky header */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="rf-hdr" style={{ maxWidth:1200, margin:'0 auto', padding:'14px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                Referrals
              </h1>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>Track all referral links and rewards</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { fetchReferrals(); fetchStats(); }}
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px',
                  border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:12, fontWeight:600,
                  color:'#595959', background:'#fff', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                <ArrowPathIcon style={{ width:15, height:15 }}/> Refresh
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* Stats */}
          <div className="rf-stats" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
            <StatCard label="Total Referrals" value={overview.totalGenerated || 0} icon={LinkIcon} accent="#2F54EB" delay={0} />
            <StatCard label="Total Clicks" value={overview.totalClicks || 0} icon={EyeIcon} accent="#D46B08" delay={60} />
            <StatCard label="Converted" value={overview.totalConverted || 0} icon={GiftIcon} accent="#389E0D" delay={120} />
            <StatCard label="Total Rewards" value={formatGHS(overview.totalRewardAmount)} icon={CurrencyDollarIcon} accent="#08979C" delay={180} />
            <StatCard label="Pending Rewards" value={formatGHS(overview.totalPendingAmount)} icon={ClockIcon} accent="#C41D7F" delay={240} />
            <StatCard label="Conversion Rate" value={`${(overview.conversionRate || 0).toFixed(1)}%`} icon={ChartBarIcon} accent="#7C3AED" delay={300} />
            <StatCard label="Avg Commission" value={`${(overview.averageCommissionPct || 0).toFixed(1)}%`} icon={ChartBarIcon} accent="#F59E0B" delay={360} />
            <StatCard label="Expired" value={overview.totalExpired || 0} icon={ClockIcon} accent="#CF1322" delay={420} />
          </div>

          {/* Filter bar */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0', padding:'14px 18px',
            marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', animation:'fadeUp 0.35s ease 280ms both' }}>
            <div className="rf-toolbar" style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ position:'relative', flex:'1 1 220px', minWidth:0 }}>
                <MagnifyingGlassIcon style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                  width:15, height:15, color:'#BFBFBF' }}/>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by referral code or product name..."
                  style={{ width:'100%', paddingLeft:36, paddingRight:searchQuery?34:14, paddingTop:9, paddingBottom:9,
                    border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13, outline:'none',
                    fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA' }}/>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ position:'absolute', right:10, top:'50%',
                    transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer',
                    color:'#BFBFBF', display:'flex', padding:0 }}>
                    <XMarkIcon style={{ width:15, height:15 }}/>
                  </button>
                )}
              </div>
              <SelectBox value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ flex:'0 0 auto', minWidth:140 }}>
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </SelectBox>
              {hasActiveFilters && (
                <button onClick={() => { setSearchQuery(''); setStatusFilter(''); }} style={{
                  display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderRadius:9,
                  border:'1.5px solid #FFA39E', background:'#FFF1F0', fontSize:13, fontWeight:600,
                  color:'#FF4D4F', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <XMarkIcon style={{ width:14, height:14 }}/> Clear
                </button>
              )}
            </div>
          </div>

          {/* Referrals list */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', overflow:'hidden',
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeUp 0.35s ease 320ms both' }}>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'64px 24px', gap:14 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
                  borderTopColor:'#2F54EB', animation:'spin 0.7s linear infinite' }}/>
                <p style={{ margin:0, fontSize:13, color:'#8C8C8C' }}>Loading referrals…</p>
              </div>
            ) : error && referrals.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 24px' }}>
                <p style={{ color:'#FF4D4F', fontWeight:600, marginBottom:8 }}>Failed to load referrals.</p>
                <button onClick={fetchReferrals} style={{ color:'#2F54EB', fontWeight:600, fontSize:13, background:'none', border:'none', cursor:'pointer' }}>Retry</button>
              </div>
            ) : referrals.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 24px' }}>
                <LinkIcon style={{ width:48, height:48, color:'#E0E0E0', margin:'0 auto 12px' }}/>
                <h3 style={{ margin:'0 0 6px', fontSize:15, fontWeight:700, color:'#595959' }}>No referrals found</h3>
                <p style={{ margin:0, fontSize:13, color:'#BFBFBF' }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="rf-desktop" style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F0F0F0' }}>
                        {[
                          { label:'Referral Code', sort:'referralCode' },
                          { label:'Sharer', sort:null },
                          { label:'Product', sort:null },
                          { label:'Clicks', sort:'clickCount' },
                          { label:'Status', sort:'status' },
                          { label:'Reward', sort:'rewardAmount' },
                          { label:'Date', sort:'createdAt' },
                          { label:'', sort:null },
                        ].map((h, i) => (
                          <th key={i} onClick={() => h.sort && handleSort(h.sort)}
                            style={{ padding:'12px 14px', textAlign:'left', fontSize:11, fontWeight:700,
                              color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap',
                              cursor: h.sort?'pointer':'default' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                              {h.label}
                              {sortBy === h.sort && (
                                <svg style={{ width:12, height:12 }} viewBox="0 0 20 20" fill="currentColor">
                                  {sortOrder === 'asc' ? (
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  ) : (
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  )}
                                </svg>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral) => (
                        <tr key={referral._id} className="rf-row"
                          onClick={() => navigate(`/admin/referral/${referral._id}`)}
                          style={{ borderBottom:'1px solid #F5F5F5', background:'#fff', transition:'background 0.12s' }}>
                          <td style={{ padding:'12px 14px' }}>
                            <p style={{ margin:0, fontWeight:700, color:'#2F54EB', fontSize:12, fontFamily:'monospace' }}>
                              {referral.referralCode}
                            </p>
                          </td>
                          <td style={{ padding:'12px 14px' }}>
                            <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#141414' }}>
                              {referral.sharerId?.firstName} {referral.sharerId?.lastName}
                            </p>
                            <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>
                              {referral.sharerId?.phone || '—'}
                            </p>
                          </td>
                          <td style={{ padding:'12px 14px', maxWidth:200 }}>
                            <p style={{ margin:0, fontSize:12, color:'#595959', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {referral.productId?.name || 'Product removed'}
                            </p>
                          </td>
                          <td style={{ padding:'12px 14px', fontSize:12, fontWeight:600, color:'#141414' }}>
                            {referral.clickCount || 0}
                          </td>
                          <td style={{ padding:'12px 14px' }}>
                            <Badge status={referral.status} />
                          </td>
                          <td style={{ padding:'12px 14px', fontSize:12, fontWeight:600, color:'#389E0D' }}>
                            {referral.rewardAmount > 0 ? formatGHS(referral.rewardAmount) : '—'}
                          </td>
                          <td style={{ padding:'12px 14px', fontSize:12, color:'#8C8C8C' }}>
                            {formatDate(referral.createdAt)}
                          </td>
                          <td style={{ padding:'12px 14px 12px 0' }}>
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/referral/${referral._id}`); }}
                              style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 10px',
                                borderRadius:7, border:'1.5px solid #E8E8E8', background:'#fff', fontSize:11, fontWeight:600,
                                color:'#595959', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                              <EyeIcon style={{ width:13, height:13 }}/> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="rf-mobile">
                  {referrals.map((referral) => (
                    <div key={referral._id} className="rf-card"
                      onClick={() => navigate(`/admin/referral/${referral._id}`)}
                      style={{ padding:'14px 16px', borderBottom:'1px solid #F5F5F5', background:'#fff', transition:'background 0.12s' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#2F54EB', fontFamily:'monospace' }}>
                            {referral.referralCode}
                          </p>
                          <p style={{ margin:'3px 0 0', fontSize:13, color:'#595959', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {referral.productId?.name || 'Product removed'}
                          </p>
                        </div>
                        <Badge status={referral.status} />
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                        <div>
                          <p style={{ margin:0, fontSize:10, color:'#BFBFBF', textTransform:'uppercase' }}>Sharer</p>
                          <p style={{ margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#141414' }}>
                            {referral.sharerId?.firstName} {referral.sharerId?.lastName}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:10, color:'#BFBFBF', textTransform:'uppercase' }}>Reward</p>
                          <p style={{ margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#389E0D' }}>
                            {referral.rewardAmount > 0 ? formatGHS(referral.rewardAmount) : '—'}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:10, color:'#BFBFBF', textTransform:'uppercase' }}>Clicks</p>
                          <p style={{ margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#141414' }}>{referral.clickCount || 0}</p>
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:10, color:'#BFBFBF', textTransform:'uppercase' }}>Date</p>
                          <p style={{ margin:'2px 0 0', fontSize:12, color:'#8C8C8C' }}>{formatDate(referral.createdAt)}</p>
                        </div>
                      </div>
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/referral/${referral._id}`); }}
                          style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 12px',
                            borderRadius:7, border:'1.5px solid #E8E8E8', background:'#fff', fontSize:11, fontWeight:600,
                            color:'#595959', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                          <EyeIcon style={{ width:13, height:13 }}/> View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="rf-page-footer" style={{ display:'flex', alignItems:'center',
                justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid #F5F5F5', gap:12 }}>
                <span style={{ fontSize:12, color:'#8C8C8C' }}>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                  {' '}· <strong>{totalCount}</strong> total
                </span>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <button disabled={page <= 1} onClick={() => setPage(1)} style={{
                    width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor: page>1?'pointer':'not-allowed', opacity: page>1?1:0.4, fontSize:11, fontWeight:700, color:'#595959' }}>
                    «
                  </button>
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{
                    width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor: page>1?'pointer':'not-allowed', opacity: page>1?1:0.4 }}>
                    <ChevronLeftIcon style={{ width:15, height:15, color:'#595959' }}/>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    if (pg < 1 || pg > totalPages) return null;
                    const active = pg === page;
                    return (
                      <button key={pg} onClick={() => setPage(pg)} style={{
                        width:32, height:32, borderRadius:8, fontSize:13, fontWeight: active?700:500,
                        border: active?'1.5px solid #2F54EB':'1.5px solid #E8E8E8',
                        background: active?'#F0F5FF':'#fff', color: active?'#2F54EB':'#595959', cursor:'pointer' }}>
                        {pg}
                      </button>
                    );
                  })}
                  <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{
                    width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor: page<totalPages?'pointer':'not-allowed', opacity: page<totalPages?1:0.4 }}>
                    <ChevronRightIcon style={{ width:15, height:15, color:'#595959' }}/>
                  </button>
                  <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} style={{
                    width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor: page<totalPages?'pointer':'not-allowed', opacity: page<totalPages?1:0.4, fontSize:11, fontWeight:700, color:'#595959' }}>
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

export default ReferralListPage;