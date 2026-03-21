// AdminNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, PlusCircle, ChevronDown, User, Settings,
  LogOut, Home, ShoppingCart, AlertTriangle, DollarSign,
  Users, BarChart2, FolderPlus, Package, X, Menu,
} from 'lucide-react';

// ─── Static data ──────────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id:'1', title:'New Order',          message:'Order #12345 received',          time:'2 min ago',   read:false, type:'order'     },
  { id:'2', title:'Low Stock Alert',    message:'Product XYZ is running low',     time:'1 hour ago',  read:false, type:'inventory' },
  { id:'3', title:'Payment Received',   message:'Payment for Order #12344',       time:'2 hours ago', read:true,  type:'payment'   },
  { id:'4', title:'New User Registered',message:'John Doe just registered',       time:'3 hours ago', read:true,  type:'user'      },
];

const QUICK_ACTIONS = [
  { id:'1', title:'Add Product',    icon:Package,   route:'/admin/add-product'      },
  { id:'2', title:'New Category',   icon:FolderPlus,route:'/admin/categories/new'  },
  { id:'3', title:'View Reports',   icon:BarChart2, route:'/admin/analytics'        },
  { id:'4', title:'All Orders',     icon:ShoppingCart,route:'/admin/orders'        },
];

const NOTIF_CFG = {
  order:     { bg:'#E6F4FF', color:'#1677FF', icon:ShoppingCart },
  inventory: { bg:'#FFFBE6', color:'#D48806', icon:AlertTriangle },
  payment:   { bg:'#F6FFED', color:'#389E0D', icon:DollarSign    },
  user:      { bg:'#F9F0FF', color:'#531DAB', icon:Users          },
};
const getNotifCfg = (t) => NOTIF_CFG[t] ?? { bg:'#F5F5F5', color:'#595959', icon:Bell };

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

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminNavbar = ({ toggleSidebar, title, showSidebarToggle = true }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [searchOpen,   setSearchOpen]   = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [actionsOpen,  setActionsOpen]  = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const actionsRef = useRef(null);
  const profileRef = useRef(null);

  // Close all dropdowns on outside click
  useOutsideClose([searchRef],  () => setSearchOpen(false));
  useOutsideClose([notifRef],   () => setNotifOpen(false));
  useOutsideClose([actionsRef], () => setActionsOpen(false));
  useOutsideClose([profileRef], () => setProfileOpen(false));

  const unread = notifs.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { setSearchOpen(false); setSearchQuery(''); }
  };

  const handleNotifClick = (n) => {
    setNotifs(prev => prev.map(x => x.id===n.id ? {...x, read:true} : x));
    setNotifOpen(false);
    if (n.type==='order')     navigate('/admin/orders');
    if (n.type==='inventory') navigate('/admin-products');
    if (n.type==='user')      navigate('/admin/users');
  };

  const markAllRead = () => setNotifs(prev => prev.map(n => ({...n, read:true})));

  const closeProfile = () => setProfileOpen(false);

  // Breadcrumb label from pathname
  const crumb = location.pathname.split('/').filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g,' ')).join(' › ');

  return (
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
      `}</style>

      <div style={{ maxWidth:'100%', padding:'0 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>

          {/* ── Left ── */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Mobile menu toggle */}
            {showSidebarToggle && (
              <button onClick={toggleSidebar} style={{
                width:36, height:36, borderRadius:9, border:'1.5px solid #F0F0F0',
                background:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', display:'flex',
              }}>
                <Menu size={16} color="#595959"/>
              </button>
            )}

            {/* Title + breadcrumb */}
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

            {/* ── Search ── */}
            <div ref={searchRef} style={{ position:'relative' }}>
              <NavIconBtn onClick={()=>setSearchOpen(v=>!v)} active={searchOpen}>
                <Search size={15} color={searchOpen?'#1677FF':'#8C8C8C'}/>
              </NavIconBtn>

              {searchOpen && (
                <Dropdown style={{ width:360, right:-8 }}>
                  <div style={{ padding:'12px 14px', borderBottom:'1px solid #F5F5F5' }}>
                    <form onSubmit={handleSearch} style={{ position:'relative' }}>
                      <Search size={14} color="#BFBFBF" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }}/>
                      <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                        placeholder="Search products, orders, users…"
                        style={{ width:'100%', paddingLeft:34, paddingRight:searchQuery?34:12,
                          paddingTop:9, paddingBottom:9, border:'1.5px solid #E8E8E8', borderRadius:9,
                          fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', color:'#262626', background:'#FAFAFA' }}/>
                      {searchQuery && (
                        <button type="button" onClick={()=>setSearchQuery('')} style={{
                          position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                          background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#BFBFBF' }}>
                          <X size={13}/>
                        </button>
                      )}
                    </form>
                  </div>
                  <div style={{ padding:'10px 14px' }}>
                    <p style={{ margin:'0 0 8px', fontSize:10, fontWeight:700, color:'#BFBFBF',
                      textTransform:'uppercase', letterSpacing:'0.07em' }}>Quick Links</p>
                    {[
                      { label:'Products', route:'/admin-products' },
                      { label:'Orders',   route:'/admin/orders'   },
                      { label:'Users',    route:'/admin/users'    },
                      { label:'Analytics',route:'/admin/analytics'},
                    ].map(l=>(
                      <button key={l.label} className="an-item" onClick={()=>{ navigate(l.route); setSearchOpen(false); }} style={{
                        width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8,
                        border:'none', background:'none', fontSize:13, fontWeight:500,
                        color:'#595959', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                      }}>{l.label}</button>
                    ))}
                  </div>
                </Dropdown>
              )}
            </div>

            {/* ── Notifications ── */}
            <div ref={notifRef} style={{ position:'relative' }}>
              <NavIconBtn onClick={()=>setNotifOpen(v=>!v)} badge={unread} active={notifOpen}>
                <Bell size={15} color={notifOpen?'#1677FF':'#8C8C8C'}/>
              </NavIconBtn>

              {notifOpen && (
                <Dropdown style={{ width:320, right:-8 }}>
                  <DropHeader title="Notifications" action={
                    unread>0 && (
                      <button onClick={markAllRead} style={{ fontSize:12, fontWeight:700, color:'#1677FF',
                        background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                        Mark all read
                      </button>
                    )
                  }/>

                  <div style={{ maxHeight:320, overflowY:'auto', scrollbarWidth:'none' }}>
                    {notifs.map(n => {
                      const cfg  = getNotifCfg(n.type);
                      const Icon = cfg.icon;
                      return (
                        <button key={n.id} className="an-notif" onClick={()=>handleNotifClick(n)} style={{
                          width:'100%', textAlign:'left', padding:'12px 14px',
                          borderBottom:'1px solid #F5F5F5', background:n.read?'#fff':'#F8FBFF',
                          border:'none', cursor:'pointer', display:'flex', alignItems:'flex-start', gap:10,
                          fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                        }}>
                          {/* Icon */}
                          <div style={{ width:34, height:34, borderRadius:9, flexShrink:0,
                            background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Icon size={15} color={cfg.color}/>
                          </div>
                          {/* Text */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:n.read?500:700, color:'#141414' }}>{n.title}</p>
                            <p style={{ margin:'0 0 4px', fontSize:11, color:'#8C8C8C', overflow:'hidden',
                              textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.message}</p>
                            <p style={{ margin:0, fontSize:10, color:'#BFBFBF', fontWeight:500 }}>{n.time}</p>
                          </div>
                          {/* Unread dot */}
                          {!n.read && (
                            <div style={{ width:7, height:7, borderRadius:'50%', background:'#1677FF',
                              flexShrink:0, marginTop:4 }}/>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ padding:'10px 14px', borderTop:'1px solid #F5F5F5' }}>
                    <button onClick={()=>{ navigate('/admin/notifications'); setNotifOpen(false); }} style={{
                      width:'100%', padding:'8px 0', textAlign:'center', fontSize:13, fontWeight:700,
                      color:'#1677FF', background:'none', border:'none', cursor:'pointer',
                      fontFamily:"'DM Sans',sans-serif",
                    }}>
                      View all notifications →
                    </button>
                  </div>
                </Dropdown>
              )}
            </div>

            {/* ── Quick actions ── 
            <div ref={actionsRef} style={{ position:'relative' }}>
              <NavIconBtn onClick={()=>setActionsOpen(v=>!v)} active={actionsOpen}>
                <PlusCircle size={15} color={actionsOpen?'#1677FF':'#8C8C8C'}/>
              </NavIconBtn>

              {actionsOpen && (
                <Dropdown style={{ width:210, right:-8 }}>
                  <DropHeader title="Quick Actions"/>
                  <div style={{ padding:'6px 8px 10px' }}>
                    {QUICK_ACTIONS.map(a=>(
                      <button key={a.id} className="an-quick" onClick={()=>{ navigate(a.route); setActionsOpen(false); }} style={{
                        width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
                        borderRadius:9, border:'none', cursor:'pointer', background:'none',
                        fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                      }}>
                        <div style={{ width:30, height:30, borderRadius:8, background:'#F0F7FF',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <a.icon size={14} color="#1677FF"/>
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:'#262626' }}>{a.title}</span>
                      </button>
                    ))}
                  </div>
                </Dropdown>
              )}
            </div>*/}

            {/* ── Profile 
            <div ref={profileRef} style={{ position:'relative' }}>
              <button onClick={()=>setProfileOpen(v=>!v)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'5px 10px 5px 5px',
                borderRadius:10, border:'1.5px solid #F0F0F0', background:'#fff', cursor:'pointer',
                transition:'border-color 0.15s',
              }}>
                
                <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg,#1677FF,#7C3AED)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:12, fontWeight:800, color:'#fff' }}>A</span>
                </div>
                
                <div style={{ textAlign:'left' }} className="an-profile-name">
                  <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#141414', whiteSpace:'nowrap' }}>Admin User</p>
                  <p style={{ margin:0, fontSize:10, color:'#BFBFBF' }}>Administrator</p>
                </div>
                <ChevronDown size={13} color="#BFBFBF"
                  style={{ transform:profileOpen?'rotate(180deg)':'rotate(0)', transition:'transform 0.2s' }}/>
              </button>

              {profileOpen && (
                <Dropdown style={{ width:210, right:0 }}>
                 
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                    borderBottom:'1px solid #F5F5F5' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%',
                      background:'linear-gradient(135deg,#1677FF,#7C3AED)',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:13, fontWeight:800, color:'#fff' }}>A</span>
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#141414' }}>Admin User</p>
                      <p style={{ margin:0, fontSize:10, color:'#8C8C8C' }}>Administrator</p>
                    </div>
                  </div>

                  
                  <div style={{ padding:'6px 8px' }}>
                    {[
                      { icon:User,     label:'My Profile', route:'/admin/profile', red:false },
                      { icon:Settings, label:'Settings',   route:'/admin/settings', red:false },
                    ].map(item=>(
                      <button key={item.label} className="an-profile-btn" onClick={()=>{ navigate(item.route); closeProfile(); }} style={{
                        width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
                        borderRadius:9, border:'none', cursor:'pointer', background:'none',
                        fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                      }}>
                        <div style={{ width:28, height:28, borderRadius:7, background:'#F5F5F5',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <item.icon size={13} color="#8C8C8C"/>
                        </div>
                        <span style={{ fontSize:13, fontWeight:500, color:'#262626' }}>{item.label}</span>
                      </button>
                    ))}

                    <div style={{ height:1, background:'#F5F5F5', margin:'6px 0' }}/>

                    <button className="an-profile-btn" onClick={()=>{ navigate('/'); closeProfile(); }} style={{
                      width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
                      borderRadius:9, border:'none', cursor:'pointer', background:'none',
                      fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                    }}>
                      <div style={{ width:28, height:28, borderRadius:7, background:'#F5F5F5',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Home size={13} color="#8C8C8C"/>
                      </div>
                      <span style={{ fontSize:13, fontWeight:500, color:'#262626' }}>Back to Site</span>
                    </button>

                    <button className="an-red" onClick={()=>{ navigate('/login'); closeProfile(); }} style={{
                      width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
                      borderRadius:9, border:'none', cursor:'pointer', background:'none',
                      fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                    }}>
                      <div style={{ width:28, height:28, borderRadius:7, background:'#FFF1F0',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <LogOut size={13} color="#FF4D4F"/>
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:'#FF4D4F' }}>Logout</span>
                    </button>
                  </div>
                </Dropdown>
              )}
            </div>*/}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;