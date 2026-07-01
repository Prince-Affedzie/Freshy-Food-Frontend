// AdminNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, PlusCircle, ChevronDown, User, Settings,
  LogOut, Home, ShoppingCart, AlertTriangle, DollarSign,
  Users, BarChart2, FolderPlus, Package, X, Menu,
  Megaphone, Send, UserCheck, Globe,
} from 'lucide-react';

import { notifyUsersByRole, broadCastNotification } from "../../Apis/adminApi";

// ─── Hook: close on outside click ────────────────────────────────────────────
function useOutsideClose(refs, cb) {
  useEffect(() => {
    const handler = (e) => {
      if (refs.every(r => r.current && !r.current.contains(e.target))) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
}

// ─── Dropdown wrapper ─────────────────────────────────────────────────────────
const Dropdown = ({ children, style = {} }) => (
  <div style={{
    position:'absolute', right:0, top:'calc(100% + 8px)', zIndex:500,
    background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
    boxShadow:'0 12px 40px rgba(0,0,0,0.12)', overflow:'hidden',
    animation:'navDropIn 0.18s ease',
    ...style,
  }}>
    {children}
  </div>
);

const DropHeader = ({ title, action }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'13px 16px', borderBottom:'1px solid #F5F5F5' }}>
    <span style={{ fontSize:13, fontWeight:700, color:'#141414' }}>{title}</span>
    {action}
  </div>
);

// ─── Icon button ──────────────────────────────────────────────────────────────
const NavIconBtn = React.forwardRef(({ onClick, children, badge, active }, ref) => (
  <button ref={ref} onClick={onClick} style={{
    width:36, height:36, borderRadius:9, border:`1.5px solid ${active?'#91CAFF':'#F0F0F0'}`,
    background:active?'#E6F4FF':'#fff', display:'flex', alignItems:'center',
    justifyContent:'center', cursor:'pointer', position:'relative', transition:'all 0.15s',
  }}>
    {children}
    {badge > 0 && (
      <span style={{ position:'absolute', top:-5, right:-5, width:17, height:17,
        borderRadius:'50%', background:'#FF4D4F', color:'#fff', fontSize:9, fontWeight:800,
        display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff',
        fontFamily:"'DM Sans',sans-serif" }}>{badge}</span>
    )}
  </button>
));

// ─── Notification Modal ───────────────────────────────────────────────────────
const NotificationModal = ({ isOpen, onClose, onSubmit, title, loading }) => {
  const [notifTitle, setNotifTitle] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('all'); // 'all', 'customer', 'vendor'

  useEffect(() => {
    if (isOpen) {
      setNotifTitle('');
      setMessage('');
      setRole('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !message.trim()) return;
    onSubmit({ title: notifTitle.trim(), message: message.trim(), role });
  };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background:'#fff', borderRadius:16, padding:24, width:'100%',
        maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
        animation:'navDropIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'#E6F4FF',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Megaphone size={20} color="#1677FF" />
            </div>
            <div>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#141414' }}>
                {title || 'Send Notification'}
              </h3>
              <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>
                This will be sent as a push notification
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:8, border:'none', background:'#F5F5F5',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <X size={14} color="#8C8C8C" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Role selector (only for role-based notification) */}
          {title?.includes('Role') && (
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#595959', marginBottom:6, display:'block' }}>
                Target Role
              </label>
              <div style={{ display:'flex', gap:8 }}>
                {[
                  { value: 'all', label: 'All Users', icon: <Globe size={14} /> },
                  { value: 'customer', label: 'Customers', icon: <User size={14} /> },
                  { value: 'vendor', label: 'Vendors', icon: <ShoppingCart size={14} /> },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      padding:'8px 12px', borderRadius:10, border:`1.5px solid ${role === opt.value ? '#1677FF' : '#E8E8E8'}`,
                      background: role === opt.value ? '#E6F4FF' : '#FAFAFA',
                      cursor:'pointer', fontSize:12, fontWeight:600,
                      color: role === opt.value ? '#1677FF' : '#8C8C8C',
                      fontFamily:"'DM Sans',sans-serif",
                    }}>
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#595959', marginBottom:6, display:'block' }}>
              Notification Title
            </label>
            <input
              value={notifTitle}
              onChange={e => setNotifTitle(e.target.value)}
              placeholder="e.g. New Feature Available!"
              maxLength={100}
              required
              style={{
                width:'100%', padding:'10px 14px', border:'1.5px solid #E8E8E8',
                borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif",
                outline:'none', color:'#262626', background:'#FAFAFA',
              }}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#595959', marginBottom:6, display:'block' }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter your notification message here…"
              maxLength={500}
              rows={4}
              required
              style={{
                width:'100%', padding:'10px 14px', border:'1.5px solid #E8E8E8',
                borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif",
                outline:'none', color:'#262626', background:'#FAFAFA',
                resize:'vertical', minHeight:80,
              }}
            />
            <span style={{ fontSize:10, color:'#BFBFBF', marginTop:4, display:'block', textAlign:'right' }}>
              {message.length}/500
            </span>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button type="button" onClick={onClose} style={{
              padding:'10px 20px', borderRadius:10, border:'1.5px solid #E8E8E8',
              background:'#fff', fontSize:13, fontWeight:600, color:'#595959',
              cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !notifTitle.trim() || !message.trim()} style={{
              padding:'10px 20px', borderRadius:10, border:'none',
              background: loading ? '#91CAFF' : '#1677FF',
              fontSize:13, fontWeight:600, color:'#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:"'DM Sans',sans-serif",
              display:'flex', alignItems:'center', gap:6,
            }}>
              <Send size={14} />
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminNavbar = ({ toggleSidebar, title, showSidebarToggle = true }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [searchOpen,   setSearchOpen]   = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [actionsOpen,  setActionsOpen]  = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  
  // ── Notification state ──────────────────────────────────────────────────
  const [notifModalOpen,    setNotifModalOpen]    = useState(false);
  const [notifModalType,    setNotifModalType]    = useState('broadcast'); // 'broadcast' | 'role'
  const [notifLoading,      setNotifLoading]      = useState(false);
  const [notifSuccess,      setNotifSuccess]      = useState(false);

  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const actionsRef = useRef(null);
  const profileRef = useRef(null);

  // Close all dropdowns on outside click
  useOutsideClose([searchRef],  () => setSearchOpen(false));
  useOutsideClose([notifRef],   () => setNotifOpen(false));
  useOutsideClose([actionsRef], () => setActionsOpen(false));
  useOutsideClose([profileRef], () => setProfileOpen(false));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { setSearchOpen(false); setSearchQuery(''); }
  };

  // ── Notification handlers ──────────────────────────────────────────────
  const openBroadcastModal = () => {
    setNotifModalType('broadcast');
    setNotifModalOpen(true);
    setNotifOpen(false);
  };

  const openRoleModal = () => {
    setNotifModalType('role');
    setNotifModalOpen(true);
    setNotifOpen(false);
  };

  const handleSendNotification = async (data) => {
    setNotifLoading(true);
    setNotifSuccess(false);
    
    try {
      let response;
      
      if (notifModalType === 'broadcast') {
        response = await broadCastNotification({
          title: data.title,
          message: data.message,
        });
      } else {
        response = await notifyUsersByRole({
          role: data.role,
          title: data.title,
          message: data.message,
        });
      }

      if (response?.data?.success) {
        setNotifSuccess(true);
        setTimeout(() => {
          setNotifModalOpen(false);
          setNotifSuccess(false);
        }, 1500);
      } else {
        alert(response?.data?.message || 'Failed to send notification.');
      }
    } catch (error) {
      console.error('Notification error:', error);
      alert(error?.response?.data?.message || 'Failed to send notification. Please try again.');
    } finally {
      setNotifLoading(false);
    }
  };

  const closeProfile = () => setProfileOpen(false);

  // Breadcrumb label from pathname
  const crumb = location.pathname.split('/').filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g,' ')).join(' › ');

  return (
    <>
      <nav style={{
        position:'sticky', top:0, zIndex:30, background:'#fff',
        borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          @keyframes navDropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
          .an-item:hover { background:#F5F9FF !important; }
          .an-red:hover  { background:#FFF1F0 !important; }
          .an-notif:hover { background:#FAFCFF !important; }
          .an-quick:hover { background:#F5F9FF !important; }
          .an-profile-btn:hover { background:#F5F5F5 !important; }
          .an-notif-item:hover { background:#FAFCFF !important; }
        `}</style>

        <div style={{ maxWidth:'100%', padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>

            {/* ── Left ── */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {showSidebarToggle && (
                <button onClick={toggleSidebar} style={{
                  width:36, height:36, borderRadius:9, border:'1.5px solid #F0F0F0',
                  background:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer',
                }}>
                  <Menu size={16} color="#595959"/>
                </button>
              )}

              <div>
                <h1 style={{ margin:0, fontSize:16, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                  {title || 'Admin Dashboard'}
                </h1>
                {crumb && (
                  <p style={{ margin:0, fontSize:10, color:'#BFBFBF', fontWeight:500, letterSpacing:'0.02em' }}>
                    {crumb}
                  </p>
                )}
              </div>
            </div>

            {/* ── Right ── */}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>

              {/* ── Notification Bell with dropdown ── */}
              <div ref={notifRef} style={{ position:'relative' }}>
                <NavIconBtn onClick={() => setNotifOpen(v => !v)} active={notifOpen}>
                  <Bell size={15} color={notifOpen ? '#1677FF' : '#8C8C8C'} />
                </NavIconBtn>

                {notifOpen && (
                  <Dropdown style={{ width:300, right:-8 }}>
                    <DropHeader title="Send Notifications" />
                    
                    <div style={{ padding:'6px' }}>
                      {/* Broadcast to all */}
                      <button
                        className="an-notif-item"
                        onClick={openBroadcastModal}
                        style={{
                          width:'100%', textAlign:'left', padding:'12px 12px', borderRadius:10,
                          border:'none', background:'none', cursor:'pointer',
                          display:'flex', alignItems:'center', gap:12,
                          fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                        }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'#E6F4FF',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Globe size={16} color="#1677FF" />
                        </div>
                        <div style={{ flex:1, textAlign:'left' }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#141414' }}>
                            Broadcast to All
                          </p>
                          <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>
                            Send to every user on the platform
                          </p>
                        </div>
                      </button>

                      {/* By Role */}
                      <button
                        className="an-notif-item"
                        onClick={openRoleModal}
                        style={{
                          width:'100%', textAlign:'left', padding:'12px 12px', borderRadius:10,
                          border:'none', background:'none', cursor:'pointer',
                          display:'flex', alignItems:'center', gap:12,
                          fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                        }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'#FFF7E6',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <UserCheck size={16} color="#FA8C16" />
                        </div>
                        <div style={{ flex:1, textAlign:'left' }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#141414' }}>
                            Notify by Role
                          </p>
                          <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>
                            Target customers or vendors only
                          </p>
                        </div>
                      </button>
                    </div>
                  </Dropdown>
                )}
              </div>

              {/* ── Search ── */}
              <div ref={searchRef} style={{ position:'relative' }}>
                <NavIconBtn onClick={() => setSearchOpen(v => !v)} active={searchOpen}>
                  <Search size={15} color={searchOpen ? '#1677FF' : '#8C8C8C'} />
                </NavIconBtn>

                {searchOpen && (
                  <Dropdown style={{ width:360, right:-8 }}>
                    <div style={{ padding:'12px 14px', borderBottom:'1px solid #F5F5F5' }}>
                      <form onSubmit={handleSearch} style={{ position:'relative' }}>
                        <Search size={14} color="#BFBFBF" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }} />
                        <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search products, orders, users…"
                          style={{ width:'100%', paddingLeft:34, paddingRight:searchQuery ? 34 : 12,
                            paddingTop:9, paddingBottom:9, border:'1.5px solid #E8E8E8', borderRadius:9,
                            fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', color:'#262626', background:'#FAFAFA' }} />
                        {searchQuery && (
                          <button type="button" onClick={() => setSearchQuery('')} style={{
                            position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                            background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#BFBFBF' }}>
                            <X size={13} />
                          </button>
                        )}
                      </form>
                    </div>
                    <div style={{ padding:'10px 14px' }}>
                      <p style={{ margin:'0 0 8px', fontSize:10, fontWeight:700, color:'#BFBFBF',
                        textTransform:'uppercase', letterSpacing:'0.07em' }}>Quick Links</p>
                      {[
                        { label:'Products', route:'/admin/products' },
                        { label:'Orders',   route:'/admin/orders'   },
                        { label:'Users',    route:'/admin/users'    },
                      ].map(l => (
                        <button key={l.label} className="an-item" onClick={() => { navigate(l.route); setSearchOpen(false); }} style={{
                          width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8,
                          border:'none', background:'none', fontSize:13, fontWeight:500,
                          color:'#595959', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                        }}>{l.label}</button>
                      ))}
                    </div>
                  </Dropdown>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Notification Modal ── */}
      <NotificationModal
        isOpen={notifModalOpen}
        onClose={() => { setNotifModalOpen(false); setNotifSuccess(false); }}
        onSubmit={handleSendNotification}
        title={notifModalType === 'broadcast' ? 'Broadcast Notification' : 'Notify by Role'}
        loading={notifLoading}
      />

      {/* ── Success Toast ── */}
      {notifSuccess && (
        <div style={{
          position:'fixed', bottom:30, left:'50%', transform:'translateX(-50%)', zIndex:2000,
          background:'#141414', color:'#fff', padding:'12px 24px', borderRadius:30,
          fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif",
          display:'flex', alignItems:'center', gap:8,
          boxShadow:'0 8px 30px rgba(0,0,0,0.2)', animation:'navDropIn 0.2s ease',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Notification sent successfully!
        </div>
      )}
    </>
  );
};

export default AdminNavbar;