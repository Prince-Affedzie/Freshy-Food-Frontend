// ReferralDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReferralDetail } from '../Apis/adminApi';
import {
  ArrowLeftIcon, LinkIcon, UserIcon, ShoppingBagIcon,
  CurrencyDollarIcon, EyeIcon, ClockIcon, CheckCircleIcon,
  XCircleIcon, GiftIcon, BuildingStorefrontIcon,
  DocumentTextIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  generated: { label: 'Generated', bg: '#F0F5FF', color: '#2F54EB', border: '#ADC6FF', icon: LinkIcon },
  clicked:   { label: 'Clicked',   bg: '#FFF7E6', color: '#D46B08', border: '#FFD591', icon: EyeIcon },
  ordered:   { label: 'Ordered',   bg: '#FFF0F6', color: '#C41D7F', border: '#FFADD2', icon: ShoppingBagIcon },
  confirmed: { label: 'Confirmed', bg: '#E6FFFB', color: '#08979C', border: '#87E8DE', icon: CheckCircleIcon },
  rewarded:  { label: 'Rewarded',  bg: '#F6FFED', color: '#389E0D', border: '#B7EB8F', icon: GiftIcon },
  expired:   { label: 'Expired',   bg: '#FFF1F0', color: '#CF1322', border: '#FFA39E', icon: XCircleIcon },
  cancelled: { label: 'Cancelled', bg: '#FAFAFA', color: '#8C8C8C', border: '#D9D9D9', icon: XCircleIcon },
};

const formatGHS = (n) => `GH₵ ${Number(n || 0).toFixed(2)}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
const formatShortDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon:Icon, mono }) => (
  <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 0', borderBottom:'1px solid #F5F5F5' }}>
    <div style={{ width:36, height:36, borderRadius:9, background:'#F0F5FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon style={{ width:16, height:16, color:'#2F54EB' }}/>
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ margin:'0 0 2px', fontSize:10, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
      <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#141414', fontFamily: mono?'monospace':'inherit', wordBreak:'break-all' }}>
        {value || '—'}
      </p>
    </div>
  </div>
);

const TimelineItem = ({ label, date, active, isLast }) => (
  <div style={{ display:'flex', gap:12, minHeight: isLast?40:60 }}>
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
      <div style={{ width:10, height:10, borderRadius:'50%', background: active?'#2F54EB':'#E8E8E8', marginTop:4, border: active?'2px solid #ADC6FF':'2px solid #F0F0F0' }}/>
      {!isLast && <div style={{ width:1, flex:1, background:'#F0F0F0', margin:'4px 0' }}/>}
    </div>
    <div style={{ flex:1, paddingBottom: isLast?0:16 }}>
      <p style={{ margin:0, fontSize:13, fontWeight: active?700:500, color: active?'#141414':'#8C8C8C' }}>{label}</p>
      {date && <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>{formatDate(date)}</p>}
    </div>
  </div>
);

const TransactionRow = ({ transaction }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #F5F5F5', gap:12 }}>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#141414' }}>{transaction.description}</p>
      <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>{formatDate(transaction.createdAt)}</p>
    </div>
    <div style={{ textAlign:'right', flexShrink:0 }}>
      <p style={{ margin:0, fontSize:13, fontWeight:700, color: transaction.amount>0?'#389E0D':'#CF1322' }}>
        {transaction.amount > 0 ? '+' : ''}{formatGHS(transaction.amount)}
      </p>
      <span style={{ padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:600,
        background: transaction.status==='completed'?'#F6FFED':'#FFF7E6',
        color: transaction.status==='completed'?'#389E0D':'#D46B08' }}>
        {transaction.status}
      </span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReferralDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [sharerStats, setSharerStats] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [clickHistory, setClickHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReferralDetail(id);
      const data = response.data?.data || response.data;
      setReferral(data.referral);
      setSharerStats(data.sharerStats);
      setWalletTransactions(data.walletTransactions || []);
      setClickHistory(data.clickHistory || []);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to load referral details';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:14 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #F0F0F0', borderTopColor:'#2F54EB', animation:'spin 0.7s linear infinite' }}/>
          <p style={{ margin:0, fontSize:13, color:'#8C8C8C' }}>Loading referral details…</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !referral) {
    return (
      <AdminLayout>
        <div style={{ textAlign:'center', padding:'64px 24px' }}>
          <p style={{ color:'#FF4D4F', fontWeight:600, marginBottom:8 }}>{error || 'Referral not found'}</p>
          <button onClick={fetchDetail} style={{ color:'#2F54EB', fontWeight:600, fontSize:13, background:'none', border:'none', cursor:'pointer' }}>Retry</button>
        </div>
      </AdminLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[referral.status] || STATUS_CONFIG.generated;
  const StatusIcon = statusCfg.icon;

  const timeline = [
    { label:'Link Generated', date: referral.createdAt, active: true },
    ...(referral.clickCount > 0 ? [{ label:`Clicked (${referral.clickCount}x)`, date: referral.firstClickedAt || referral.updatedAt, active: true }] : [{ label:'Clicked', date: null, active: false }]),
    ...(referral.convertedOrderId ? [{ label:'Order Placed', date: referral.convertedAt, active: true }] : [{ label:'Order Placed', date: null, active: false }]),
    ...(referral.status === 'confirmed' || referral.status === 'rewarded' ? [{ label:'Confirmed', date: referral.confirmedAt, active: true }] : [{ label:'Confirmed', date: null, active: false }]),
    ...(referral.status === 'rewarded' ? [{ label:'Rewarded', date: referral.rewardedAt, active: true }] : [{ label:'Rewarded', date: null, active: false }]),
  ];

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .rd-card { animation: fadeUp 0.35s ease both; }
        @media (max-width:767px) {
          .rd-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* Header */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'14px 20px',
            display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <button onClick={() => navigate('/admin/referrals')}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 12px',
                borderRadius:9, border:'1.5px solid #E8E8E8', background:'#fff', fontSize:12, fontWeight:600,
                color:'#595959', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              <ArrowLeftIcon style={{ width:15, height:15 }}/> Back
            </button>
            <div style={{ flex:1 }}>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                Referral Detail
              </h1>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>View full referral information and history</p>
            </div>
            <button onClick={fetchDetail}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px',
                border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:12, fontWeight:600,
                color:'#595959', background:'#fff', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              <ArrowPathIcon style={{ width:15, height:15 }}/> Refresh
            </button>
          </div>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* Status banner */}
          <div className="rd-card" style={{ background:statusCfg.bg, borderRadius:14, border:`1px solid ${statusCfg.border}`,
            padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <StatusIcon style={{ width:24, height:24, color:statusCfg.color }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:11, fontWeight:700, color:statusCfg.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>Status</p>
              <p style={{ margin:'3px 0 0', fontSize:20, fontWeight:800, color:statusCfg.color }}>{statusCfg.label}</p>
            </div>
            {referral.rewardAmount > 0 && (
              <div style={{ textAlign:'right' }}>
                <p style={{ margin:0, fontSize:11, fontWeight:700, color:statusCfg.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>Reward Amount</p>
                <p style={{ margin:'3px 0 0', fontSize:22, fontWeight:800, color:statusCfg.color, fontFamily:'monospace' }}>{formatGHS(referral.rewardAmount)}</p>
              </div>
            )}
          </div>

          {/* Main grid */}
          <div className="rd-grid" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20 }}>

            {/* Left column */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Referral Info Card */}
              <div className="rd-card" style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#141414', display:'flex', alignItems:'center', gap:8 }}>
                  <LinkIcon style={{ width:18, height:18, color:'#2F54EB' }}/> Referral Information
                </h3>
                <InfoRow label="Referral Code" value={referral.referralCode} icon={LinkIcon} mono />
                <InfoRow label="Commission Rate" value={`${referral.commissionPct}%`} icon={CurrencyDollarIcon} />
                <InfoRow label="Click Count" value={referral.clickCount || 0} icon={EyeIcon} />
                <InfoRow label="Created" value={formatDate(referral.createdAt)} icon={ClockIcon} />
                <InfoRow label="Expires" value={referral.expiresAt ? formatDate(referral.expiresAt) : 'No expiry'} icon={ClockIcon} />
                <InfoRow label="Share URL" value={`${window.location.origin}/product/${referral.productId?._id}?ref=${referral.referralCode}`} icon={LinkIcon} mono />
              </div>

              {/* Product Card */}
              {referral.productId && (
                <div className="rd-card" style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#141414', display:'flex', alignItems:'center', gap:8 }}>
                    <ShoppingBagIcon style={{ width:18, height:18, color:'#D46B08' }}/> Product
                  </h3>
                  <Link to={`/admin/product/${referral.productId._id}`} style={{ display:'flex', gap:14, textDecoration:'none', color:'inherit', padding:12, borderRadius:10, border:'1px solid #F0F0F0', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FAFCFF'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{ width:64, height:64, borderRadius:10, background:'#F5F5F5', overflow:'hidden', flexShrink:0 }}>
                      {referral.productId.images?.[0] ? (
                        <img src={referral.productId.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      ) : (
                        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0F5FF' }}>
                          <ShoppingBagIcon style={{ width:24, height:24, color:'#ADC6FF' }}/>
                        </div>
                      )}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#141414' }}>{referral.productId.name}</p>
                      <p style={{ margin:'4px 0 0', fontSize:16, fontWeight:800, color:'#D46B08', fontFamily:'monospace' }}>{formatGHS(referral.productId.price)}</p>
                      <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>{referral.productId.category} · {referral.productId.condition}</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Order Card */}
              {referral.convertedOrderId && (
                <div className="rd-card" style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#141414', display:'flex', alignItems:'center', gap:8 }}>
                    <DocumentTextIcon style={{ width:18, height:18, color:'#C41D7F' }}/> Order
                  </h3>
                  <InfoRow label="Order Number" value={referral.convertedOrderId.orderNumber || referral.convertedOrderId._id} icon={DocumentTextIcon} mono />
                  <InfoRow label="Order Total" value={formatGHS(referral.convertedOrderId.totalPrice)} icon={CurrencyDollarIcon} />
                  <InfoRow label="Order Status" value={referral.convertedOrderId.status} icon={CheckCircleIcon} />
                  <InfoRow label="Payment Status" value={referral.convertedOrderId.paymentStatus} icon={CurrencyDollarIcon} />
                  <InfoRow label="Order Date" value={formatDate(referral.convertedOrderId.createdAt)} icon={ClockIcon} />
                </div>
              )}

              {/* Wallet Transactions */}
              {walletTransactions.length > 0 && (
                <div className="rd-card" style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#141414', display:'flex', alignItems:'center', gap:8 }}>
                    <CurrencyDollarIcon style={{ width:18, height:18, color:'#389E0D' }}/> Wallet Transactions
                  </h3>
                  {walletTransactions.map((txn, i) => (
                    <TransactionRow key={txn._id || i} transaction={txn} />
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Sharer Card */}
              {referral.sharerId && (
                <div className="rd-card" style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#141414', display:'flex', alignItems:'center', gap:8 }}>
                    <UserIcon style={{ width:18, height:18, color:'#2F54EB' }}/> Sharer
                  </h3>
                  <div style={{ textAlign:'center', marginBottom:16 }}>
                    <div style={{ width:56, height:56, borderRadius:'50%', background:'#F0F5FF', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', border:'2px solid #ADC6FF' }}>
                      <span style={{ fontSize:20, fontWeight:800, color:'#2F54EB' }}>
                        {referral.sharerId.firstName?.charAt(0)}{referral.sharerId.lastName?.charAt(0)}
                      </span>
                    </div>
                    <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#141414' }}>
                      {referral.sharerId.firstName} {referral.sharerId.lastName}
                    </p>
                    <p style={{ margin:'3px 0 0', fontSize:12, color:'#8C8C8C' }}>{referral.sharerId.phone}</p>
                    <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>{referral.sharerId.email}</p>
                  </div>
                  {sharerStats && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:12, background:'#FAFAFA', borderRadius:10 }}>
                      <div style={{ textAlign:'center' }}>
                        <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#2F54EB' }}>{sharerStats.totalReferrals || 0}</p>
                        <p style={{ margin:'2px 0 0', fontSize:10, color:'#BFBFBF', textTransform:'uppercase' }}>Total Referrals</p>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#389E0D', fontFamily:'monospace' }}>{formatGHS(sharerStats.lifetimeEarnings)}</p>
                        <p style={{ margin:'2px 0 0', fontSize:10, color:'#BFBFBF', textTransform:'uppercase' }}>Lifetime Earnings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vendor Card */}
              {referral.vendorId && (
                <div className="rd-card" style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#141414', display:'flex', alignItems:'center', gap:8 }}>
                    <BuildingStorefrontIcon style={{ width:18, height:18, color:'#D46B08' }}/> Vendor
                  </h3>
                  <InfoRow label="Store Name" value={referral.vendorId.storeName} icon={BuildingStorefrontIcon} />
                  <InfoRow label="Phone" value={referral.vendorId.phone} icon={UserIcon} />
                  <InfoRow label="Campus Area" value={referral.vendorId.campusArea} icon={BuildingStorefrontIcon} />
                </div>
              )}

              {/* Timeline */}
              <div className="rd-card" style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#141414', display:'flex', alignItems:'center', gap:8 }}>
                  <ClockIcon style={{ width:18, height:18, color:'#7C3AED' }}/> Timeline
                </h3>
                {timeline.map((item, i) => (
                  <TimelineItem key={i} {...item} isLast={i === timeline.length - 1} />
                ))}
              </div>

              {/* Click History */}
              {clickHistory.length > 0 && (
                <div className="rd-card" style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#141414', display:'flex', alignItems:'center', gap:8 }}>
                    <EyeIcon style={{ width:18, height:18, color:'#D46B08' }}/> Click History
                  </h3>
                  {clickHistory.map((click, i) => (
                    <div key={i} style={{ padding:'10px 0', borderBottom:i<clickHistory.length-1?'1px solid #F5F5F5':'none' }}>
                      <p style={{ margin:0, fontSize:12, color:'#8C8C8C' }}>{formatDate(click.timestamp)}</p>
                      <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF', wordBreak:'break-all' }}>{click.userAgent || 'Unknown device'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReferralDetailPage;