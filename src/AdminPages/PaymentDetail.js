// PaymentDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon, CurrencyDollarIcon, UserIcon,
  CalendarIcon, CreditCardIcon, DevicePhoneMobileIcon,
  BuildingLibraryIcon, WalletIcon, CheckCircleIcon,
  XCircleIcon, ClockIcon, ArrowPathIcon,
  ExclamationTriangleIcon, ClipboardIcon, ReceiptRefundIcon,
  ShieldCheckIcon, TagIcon, HashtagIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSinglePayment, updatePaymentStatus } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label:'Pending',    bg:'#FFF8E1', text:'#F57F17', border:'#FFE082', icon:ClockIcon },
  processing: { label:'Processing', bg:'#E3F2FD', text:'#1565C0', border:'#90CAF9', icon:ArrowPathIcon },
  paid:       { label:'Paid',       bg:'#E8F5E9', text:'#2E7D32', border:'#A5D6A7', icon:CheckCircleIcon },
  refunded:   { label:'Refunded',   bg:'#F3E5F5', text:'#6A1B9A', border:'#CE93D8', icon:ReceiptRefundIcon },
  failed:     { label:'Failed',     bg:'#FFEBEE', text:'#C62828', border:'#EF9A9A', icon:XCircleIcon },
};

const METHOD_CONFIG = {
  mobile_money: { label:'Mobile Money', icon:DevicePhoneMobileIcon, color:'#6A1B9A', bg:'#F3E5F5' },
  momo:         { label:'Mobile Money', icon:DevicePhoneMobileIcon, color:'#6A1B9A', bg:'#F3E5F5' },
  card:         { label:'Card Payment', icon:CreditCardIcon,        color:'#1565C0', bg:'#E3F2FD' },
  bank:         { label:'Bank Transfer',icon:BuildingLibraryIcon,   color:'#2E7D32', bg:'#E8F5E9' },
  wallet:       { label:'Wallet',       icon:WalletIcon,           color:'#F57F17', bg:'#FFF8E1' },
};

const STATUS_OPTIONS = ['pending','processing','paid','refunded','failed'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `GH₵ ${Number(n||0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
  year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit',
}) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────
const InfoCard = ({ icon:Icon, label, value, accent='#1677FF', children, mono }) => (
  <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 0',
    borderBottom:'1px solid #F5F5F5' }}>
    <div style={{ width:36, height:36, borderRadius:10, background:accent+'18',
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon style={{ width:17, height:17, color:accent }}/>
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ margin:'0 0 2px', fontSize:10, fontWeight:700, color:'#BFBFBF',
        textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
      {mono ? (
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <code style={{ fontSize:12, fontWeight:600, color:'#595959', fontFamily:'monospace',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value||'—'}</code>
          {value && (
            <button onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!'); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#BFBFBF', padding:2, display:'flex' }}>
              <ClipboardIcon style={{ width:13, height:13 }}/>
            </button>
          )}
        </div>
      ) : (
        <p style={{ margin:0, fontSize:14, fontWeight:600, color:'#141414' }}>{value||'—'}</p>
      )}
      {children}
    </div>
  </div>
);

const Badge = ({ text, bg, color, border }) => (
  <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700,
    background:bg, color, border:`1px solid ${border}`, whiteSpace:'nowrap',
    display:'inline-flex', alignItems:'center', gap:5 }}>
    {text}
  </span>
);

const Section = ({ title, icon:Icon, accent='#1677FF', children }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
    overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', marginBottom:16 }}>
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'13px 18px',
      borderBottom:'1px solid #F5F5F5', background:'#FAFAFA' }}>
      <div style={{ width:28, height:28, borderRadius:7, background:accent+'18',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon style={{ width:14, height:14, color:accent }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:'#141414' }}>{title}</span>
    </div>
    <div style={{ padding:'16px 18px' }}>{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSinglePayment(id);
      if (res.data?.success) setPayment(res.data.data);
      else throw new Error('Failed to load');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayment(); }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === payment?.status) {
      setShowStatusModal(false);
      return;
    }
    setUpdating(true);
    try {
      await updatePaymentStatus(id, newStatus);
      setPayment(prev => ({ ...prev, status: newStatus }));
      toast.success('Status updated successfully!');
      setShowStatusModal(false);
      setNewStatus('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', minHeight:'60vh', gap:14, fontFamily:"'DM Sans',sans-serif" }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
            borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }}/>
          <p style={{ fontSize:13, color:'#8C8C8C', margin:0 }}>Loading payment…</p>
        </div>
      </AdminLayout>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !payment) {
    return (
      <AdminLayout>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', minHeight:'60vh', gap:12, padding:24, fontFamily:"'DM Sans',sans-serif" }}>
          <div style={{ width:56, height:56, borderRadius:28, background:'#FFEBEE',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ExclamationTriangleIcon style={{ width:28, height:28, color:'#FF4D4F' }}/>
          </div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414' }}>Payment Not Found</h2>
          <p style={{ margin:0, fontSize:13, color:'#8C8C8C' }}>{error}</p>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <button onClick={loadPayment} style={{ padding:'9px 18px', borderRadius:9,
              border:'1.5px solid #E8E8E8', background:'#fff', fontSize:13, fontWeight:700,
              cursor:'pointer', fontFamily:"'DM Sans',sans-serif", color:'#595959' }}>Retry</button>
            <Link to="/admin-payments" style={{ padding:'9px 18px', borderRadius:9,
              background:'#1677FF', color:'#fff', fontSize:13, fontWeight:700,
              textDecoration:'none', fontFamily:"'DM Sans',sans-serif" }}>All Payments</Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const sc = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
  const SIcon = sc.icon;
  const mc = METHOD_CONFIG[payment.paymentMethod] || METHOD_CONFIG.card;
  const MIcon = mc.icon;

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .pd-btn:hover { filter:brightness(0.93); }
        @media (max-width:768px) {
          .pd-layout { grid-template-columns:1fr !important; }
          .pd-hdr { flex-direction:column !important; align-items:flex-start !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light"/>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* Sticky header */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="pd-hdr" style={{ maxWidth:1100, margin:'0 auto', padding:'12px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <nav style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#8C8C8C', marginBottom:3 }}>
                <Link to="/admin-payments" style={{ color:'#8C8C8C', textDecoration:'none', fontWeight:600 }}>Payments</Link>
                <span>/</span>
                <span style={{ color:'#262626', fontWeight:700 }}>Payment Details</span>
              </nav>
              <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                Transaction #{payment.transactionRef || payment._id?.slice(-8).toUpperCase()}
              </h1>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowStatusModal(true)} className="pd-btn" style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
                border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13, fontWeight:600,
                color:'#595959', background:'#fff', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                <ArrowPathIcon style={{ width:14, height:14 }}/> Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px 56px' }}>
          <div className="pd-layout" style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:16, alignItems:'start' }}>

            {/* LEFT: Main Info */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Payment Overview */}
              <Section title="Payment Overview" icon={CurrencyDollarIcon} accent="#10B981" style={{ animation:'fadeUp 0.4s ease both' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
                  <div style={{ textAlign:'center', padding:'16px', background:'#FAFAFA', borderRadius:12, border:'1px solid #F0F0F0' }}>
                    <p style={{ margin:'0 0 4px', fontSize:10, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase' }}>Amount</p>
                    <p style={{ margin:0, fontSize:26, fontWeight:800, color:'#141414' }}>{fmt(payment.amount)}</p>
                    <p style={{ margin:'2px 0 0', fontSize:11, color:'#8C8C8C' }}>{payment.currency}</p>
                  </div>
                  <div style={{ textAlign:'center', padding:'16px', background:sc.bg, borderRadius:12, border:`1px solid ${sc.border}` }}>
                    <p style={{ margin:'0 0 4px', fontSize:10, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase' }}>Status</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      <SIcon style={{ width:20, height:20, color:sc.text }}/>
                      <p style={{ margin:0, fontSize:18, fontWeight:700, color:sc.text }}>{sc.label}</p>
                    </div>
                  </div>
                  <div style={{ textAlign:'center', padding:'16px', background:mc.bg, borderRadius:12, border:'1px solid #E8E8E8' }}>
                    <p style={{ margin:'0 0 4px', fontSize:10, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase' }}>Method</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      <MIcon style={{ width:18, height:18, color:mc.color }}/>
                      <p style={{ margin:0, fontSize:15, fontWeight:700, color:mc.color }}>{mc.label}</p>
                    </div>
                    {payment.paymentChannel && (
                      <p style={{ margin:'4px 0 0', fontSize:11, color:'#8C8C8C' }}>{payment.paymentChannel}</p>
                    )}
                  </div>
                </div>
              </Section>

              {/* Transaction Details */}
              <Section title="Transaction Details" icon={HashtagIcon} accent="#1677FF" style={{ animation:'fadeUp 0.4s ease 60ms both' }}>
                <InfoCard icon={TagIcon} label="Transaction Reference" value={payment.transactionRef} accent="#1677FF" mono />
                <InfoCard icon={HashtagIcon} label="Payment ID" value={payment._id} accent="#595959" mono />
                {payment.mobileMoneyNumber && (
                  <InfoCard icon={DevicePhoneMobileIcon} label="Mobile Money Number" value={payment.mobileMoneyNumber} accent="#6A1B9A" />
                )}
                <InfoCard icon={CalendarIcon} label="Created" value={fmtDate(payment.createdAt)} accent="#8C8C8C" />
                {payment.updatedAt !== payment.createdAt && (
                  <InfoCard icon={ArrowPathIcon} label="Last Updated" value={fmtDate(payment.updatedAt)} accent="#8C8C8C" />
                )}
              </Section>
            </div>

            {/* RIGHT: Customer & Actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Customer */}
              <Section title="Customer" icon={UserIcon} accent="#7C3AED" style={{ animation:'fadeUp 0.4s ease 80ms both' }}>
                {payment.user ? (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <div style={{ width:44, height:44, borderRadius:22, background:'#EDE9FE',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:18, fontWeight:800, color:'#7C3AED' }}>
                          {payment.user.firstName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#141414' }}>
                          {payment.user.firstName} {payment.user.lastName}
                        </p>
                        <p style={{ margin:'2px 0 0', fontSize:11, color:'#8C8C8C' }}>Customer</p>
                      </div>
                    </div>
                    <InfoCard icon={DevicePhoneMobileIcon} label="Phone" value={payment.user.phone} accent="#6A1B9A" />
                    {payment.user.email && (
                      <InfoCard icon={CreditCardIcon} label="Email" value={payment.user.email} accent="#1565C0" />
                    )}
                  </>
                ) : (
                  <p style={{ fontSize:13, color:'#8C8C8C', textAlign:'center', padding:'16px 0' }}>No customer data</p>
                )}
              </Section>

              {/* Quick Actions */}
              <Section title="Quick Actions" icon={ArrowPathIcon} accent="#F59E0B" style={{ animation:'fadeUp 0.4s ease 120ms both' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <button onClick={() => setShowStatusModal(true)} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                    borderRadius:10, border:'1.5px solid #E8E8E8', background:'#fff',
                    fontSize:13, fontWeight:600, color:'#595959', cursor:'pointer',
                    fontFamily:"'DM Sans',sans-serif", textAlign:'left', width:'100%' }}>
                    <ArrowPathIcon style={{ width:16, height:16, color:'#1677FF' }}/>
                    Update Payment Status
                  </button>
                  <Link to="/admin-payments" style={{
                    display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                    borderRadius:10, border:'1.5px solid #E8E8E8', background:'#fff',
                    fontSize:13, fontWeight:600, color:'#595959', textDecoration:'none',
                    fontFamily:"'DM Sans',sans-serif" }}>
                    <ArrowLeftIcon style={{ width:16, height:16, color:'#8C8C8C' }}/>
                    All Payments
                  </Link>
                </div>
              </Section>

              {/* Activity */}
              <Section title="Activity Log" icon={ClockIcon} accent="#8C8C8C" style={{ animation:'fadeUp 0.4s ease 160ms both' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#52C41A', flexShrink:0 }}/>
                    <span style={{ color:'#595959' }}>Payment created</span>
                    <span style={{ color:'#BFBFBF', marginLeft:'auto' }}>{fmtDate(payment.createdAt)}</span>
                  </div>
                  {payment.updatedAt !== payment.createdAt && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:'#1677FF', flexShrink:0 }}/>
                      <span style={{ color:'#595959' }}>Status updated to <strong>{sc.label}</strong></span>
                      <span style={{ color:'#BFBFBF', marginLeft:'auto' }}>{fmtDate(payment.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)',
          zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
          animation:'fadeIn 0.2s ease' }} onClick={() => setShowStatusModal(false)}>
          <div style={{ background:'#fff', borderRadius:16, maxWidth:400, width:'100%',
            padding:'28px 28px 22px', boxShadow:'0 24px 64px rgba(0,0,0,0.18)',
            animation:'fadeUp 0.25s ease' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:800, color:'#141414' }}>Update Status</h3>
            <p style={{ margin:'0 0 20px', fontSize:13, color:'#8C8C8C' }}>
              Current: <Badge text={sc.label} bg={sc.bg} color={sc.text} border={sc.border} />
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
              {STATUS_OPTIONS.map(s => {
                const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
                const CIcon = cfg.icon;
                const active = newStatus === s;
                const isCurrent = payment.status === s;
                return (
                  <button key={s} onClick={() => setNewStatus(s)} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                    borderRadius:10, border: active?`1.5px solid ${cfg.text}`:'1.5px solid #E8E8E8',
                    background: active?cfg.bg:'#fff', cursor:'pointer',
                    fontFamily:"'DM Sans',sans-serif", textAlign:'left', width:'100%',
                    transition:'all 0.15s',
                  }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:cfg.bg,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <CIcon style={{ width:16, height:16, color:cfg.text }}/>
                    </div>
                    <span style={{ flex:1, fontSize:14, fontWeight:600, color:'#141414' }}>{cfg.label}</span>
                    {isCurrent && <span style={{ fontSize:11, color:'#8C8C8C', fontWeight:600 }}>Current</span>}
                    {active && <CheckCircleIcon style={{ width:18, height:18, color:cfg.text }}/>}
                  </button>
                );
              })}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => { setShowStatusModal(false); setNewStatus(''); }} style={{
                padding:'9px 18px', borderRadius:9, border:'1.5px solid #E8E8E8', background:'#fff',
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", color:'#595959' }}>
                Cancel
              </button>
              <button onClick={handleStatusUpdate} disabled={updating || !newStatus || newStatus===payment.status} style={{
                padding:'9px 18px', borderRadius:9, border:'none', background: updating?'#BFBFBF':'#1677FF',
                color:'#fff', fontSize:13, fontWeight:700, cursor: updating?'not-allowed':'pointer',
                fontFamily:"'DM Sans',sans-serif", opacity: updating?0.7:1 }}>
                {updating ? 'Updating…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PaymentDetail;