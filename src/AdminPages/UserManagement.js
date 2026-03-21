// UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Edit, Trash2, Eye, User, UserCheck, UserX, Mail,
  Phone, Calendar, Download, Plus, Shield, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ShoppingCart, Heart, Package, MapPin, Building, X,
} from 'lucide-react';
import { getAllUser, deleteAUser, toggleAdmin } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : 'N/A';

const getFullName = (u) =>
  `${u.firstName||''} ${u.lastName||''}`.trim() || 'Unnamed User';

const getInitials = (u) => {
  const n = getFullName(u);
  if (n === 'Unnamed User') return 'UU';
  return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
};

const ROLE_CFG = {
  customer: { bg:'#E6F4FF', color:'#1677FF', border:'#91CAFF', label:'Customer' },
  vendor:   { bg:'#FFFBE6', color:'#D48806', border:'#FFE58F', label:'Vendor'   },
  staff:    { bg:'#F6FFED', color:'#389E0D', border:'#B7EB8F', label:'Staff'    },
};
const ADMIN_CFG = { bg:'#F9F0FF', color:'#531DAB', border:'#D3ADF7', label:'Admin' };

// ─── Sub-components ───────────────────────────────────────────────────────────
const Badge = ({ text, bg, color, border, icon: Icon }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 9px',
    borderRadius:20, fontSize:11, fontWeight:700, background:bg, color, border:`1px solid ${border}`,
    whiteSpace:'nowrap' }}>
    {Icon && <Icon size={10} />}{text}
  </span>
);

const StatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0',
    padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
    boxShadow:'0 1px 4px rgba(0,0,0,0.04)', borderTop:`3px solid ${accent}`,
    animation:`fadeUp 0.4s ease ${delay}ms both`, flex:'1 1 160px', minWidth:0 }}>
  <div style={{ minWidth:0 }}>
    <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#BFBFBF',
      textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{label}</p>
    <p style={{ margin:0, fontSize:24, fontWeight:800, color:'#141414', letterSpacing:'-0.5px' }}>{value}</p>
  </div>
  <div style={{ width:40, height:40, borderRadius:10, background:accent+'18',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
    <Icon size={18} color={accent} />
  </div>
  </div>
);

const IconBtn = ({ onClick, title, bg, color, border, children }) => (
  <button onClick={onClick} title={title} style={{
    width:30, height:30, borderRadius:7, background:bg, color, border:`1.5px solid ${border}`,
    display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
    transition:'filter 0.15s', flexShrink:0,
  }}>
    {children}
  </button>
);

const Checkbox = ({ checked, indeterminate, onChange }) => (
  <input type="checkbox" checked={checked} onChange={onChange}
    ref={el=>{ if(el) el.indeterminate=!!indeterminate; }}
    style={{ width:15, height:15, cursor:'pointer', accentColor:'#1677FF', flexShrink:0 }} />
);

const SelectBox = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange} style={{
    padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13,
    fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA',
    outline:'none', cursor:'pointer',
  }}>{children}</select>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, desc, onConfirm, onCancel }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)',
    zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation:'fadeIn 0.2s ease' }}
    onClick={onCancel}>
    <div style={{ background:'#fff', borderRadius:16, maxWidth:380, width:'100%', padding:'28px 28px 22px',
      boxShadow:'0 24px 64px rgba(0,0,0,0.18)', animation:'fadeUp 0.25s ease' }}
      onClick={e=>e.stopPropagation()}>
      <div style={{ width:46, height:46, borderRadius:12, background:'#FFF1F0',
        display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
        <Trash2 size={22} color="#FF4D4F" />
      </div>
      <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:800, color:'#141414' }}>{title}</h3>
      <p style={{ margin:'0 0 22px', fontSize:13, color:'#595959', lineHeight:1.5 }}>{desc}</p>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
        <button onClick={onCancel} style={{ padding:'9px 18px', borderRadius:9,
          border:'1.5px solid #E8E8E8', background:'#fff', fontSize:13, fontWeight:700,
          cursor:'pointer', fontFamily:"'DM Sans',sans-serif", color:'#595959' }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding:'9px 18px', borderRadius:9,
          border:'none', background:'#FF4D4F', color:'#fff', fontSize:13, fontWeight:700,
          cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Confirm</button>
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const UserManagement = () => {
  const navigate = useNavigate();

  const [users, setUsers]             = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [selected, setSelected]       = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const [showBulkDelete, setShowBulkDelete]     = useState(false);
  const PER_PAGE = 10;

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let r = users;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u._id?.includes(q) ||
        u.city?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all')        r = r.filter(u => u.role === roleFilter);
    if (adminFilter === 'admin')     r = r.filter(u => u.isAdmin);
    if (adminFilter === 'non-admin') r = r.filter(u => !u.isAdmin);
    setFiltered(r);
    setCurrentPage(1);
    setSelected([]);
  }, [search, roleFilter, adminFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUser();
      const d = res.data.users || [];
      setUsers(d); setFiltered(d); setError('');
    } catch {
      setError('Failed to load users. Please try again.');
      setUsers([]); setFiltered([]);
    } finally { setLoading(false); }
  };

  const totalPages   = Math.ceil(filtered.length / PER_PAGE);
  const pageStart    = (currentPage - 1) * PER_PAGE;
  const currentUsers = filtered.slice(pageStart, pageStart + PER_PAGE);
  const allSelected  = currentUsers.length > 0 && currentUsers.every(u => selected.includes(u._id));
  const someSelected = selected.length > 0 && !allSelected;

  const toggleSelectAll = () =>
    setSelected(allSelected ? [] : currentUsers.map(u => u._id));
  const toggleSelect = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const handleDeleteUser = async () => {
    try { await deleteAUser(deleteTarget._id); setDeleteTarget(null); fetchUsers(); }
    catch { alert('Failed to delete user.'); }
  };

  const handleToggleAdmin = async (id) => {
    try { await toggleAdmin(id); fetchUsers(); }
    catch { alert('Failed to update admin status.'); }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selected) await deleteAUser(id);
      setSelected([]); setShowBulkDelete(false); fetchUsers();
    } catch { alert('Failed to delete some users.'); }
  };

  const handleBulkToggleAdmin = async () => {
    try {
      for (const id of selected) await toggleAdmin(id);
      setSelected([]); fetchUsers();
    } catch { alert('Failed to update admin statuses.'); }
  };

  const hasFilters = search || roleFilter !== 'all' || adminFilter !== 'all';
  const activeToday = users.filter(u =>
    new Date(u.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <AdminLayout title="User Management">
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', minHeight:'60vh', gap:14, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
          borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }} />
        <p style={{ fontSize:13, color:'#8C8C8C', margin:0 }}>Loading users…</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="User Management">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .um-row:hover  { background:#FAFCFF !important; }
        .um-iBtn:hover { filter:brightness(0.9); }

        @media (max-width:640px) {
          .um-stats        { flex-wrap:wrap !important; }
          .um-stats>div    { flex:1 1 calc(50% - 7px) !important; }
          .um-hdr          { flex-direction:column !important; align-items:flex-start !important; }
          .um-toolbar      { flex-direction:column !important; }
          .um-filters      { flex-direction:column !important; width:100% !important; }
          .um-filters>*    { width:100% !important; }
          .um-bulk         { flex-direction:column !important; align-items:flex-start !important; }
          .um-desktop      { display:none !important; }
          .um-mobile       { display:flex !important; }
          .um-pg-footer    { flex-direction:column !important; align-items:flex-start !important; }
          .um-bottom-stats { flex-wrap:wrap !important; }
          .um-bottom-stats>div { flex:1 1 calc(50% - 7px) !important; }
        }
        @media (min-width:641px) {
          .um-mobile { display:none !important; }
        }
      `}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* ── Sticky header ── */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="um-hdr" style={{ maxWidth:1200, margin:'0 auto', padding:'14px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>User Management</h1>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>Manage all users and permissions</p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button onClick={()=>navigate('/admin/users/add')} style={{
                display:'inline-flex', alignItems:'center', gap:7, padding:'9px 16px',
                background:'#1677FF', color:'#fff', borderRadius:9, fontSize:13, fontWeight:700,
                border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                <Plus size={15}/> Add User
              </button>
              <button style={{
                display:'inline-flex', alignItems:'center', gap:7, padding:'9px 14px',
                border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13, fontWeight:600,
                background:'#fff', color:'#595959', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                <Download size={15}/> Export
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* ── Error banner ── */}
          {error && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px',
              background:'#FFF1F0', border:'1px solid #FFA39E', borderRadius:10, marginBottom:18 }}>
              <AlertCircle size={16} color="#FF4D4F" style={{ flexShrink:0, marginTop:1 }} />
              <div style={{ flex:1 }}>
                <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:700, color:'#CF1322' }}>Error Loading Users</p>
                <p style={{ margin:0, fontSize:12, color:'#FF4D4F' }}>{error}</p>
              </div>
              <button onClick={fetchUsers} style={{ fontSize:12, fontWeight:700, color:'#FF4D4F',
                background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Retry</button>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="um-stats" style={{ display:'flex', gap:14, marginBottom:20 }}>
            <StatCard label="Total Users"  value={users.length}                           icon={User}      accent="#1677FF" delay={0}   />
            <StatCard label="Admins"       value={users.filter(u=>u.isAdmin).length}      icon={Shield}    accent="#7C3AED" delay={60}  />
            <StatCard label="With Orders"  value={users.filter(u=>u.orders?.length>0).length} icon={Package} accent="#10B981" delay={120} />
            <StatCard label="Active Today" value={activeToday}                            icon={UserCheck} accent="#F59E0B" delay={180} />
          </div>

          {/* ── Filter bar ── */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0',
            padding:'14px 16px', marginBottom:14, boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
            animation:'fadeUp 0.35s ease 220ms both' }}>
            <div className="um-toolbar" style={{ display:'flex', gap:10, alignItems:'flex-start', flexWrap:'wrap' }}>
              {/* Search */}
              <div style={{ position:'relative', flex:'1 1 200px', minWidth:0 }}>
                <Search size={15} color="#BFBFBF" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }} />
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search name, email, phone, city…"
                  style={{ width:'100%', paddingLeft:34, paddingRight:search?34:12,
                    paddingTop:9, paddingBottom:9, border:'1.5px solid #E8E8E8', borderRadius:9,
                    fontSize:13, fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA', outline:'none' }}
                  onFocus={e=>e.target.style.borderColor='#1677FF'}
                  onBlur={e=>e.target.style.borderColor='#E8E8E8'} />
                {search && (
                  <button onClick={()=>setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#BFBFBF' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="um-filters" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <SelectBox value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="staff">Staff</option>
                </SelectBox>
                <SelectBox value={adminFilter} onChange={e=>setAdminFilter(e.target.value)}>
                  <option value="all">All Users</option>
                  <option value="admin">Admins Only</option>
                  <option value="non-admin">Non-Admins</option>
                </SelectBox>
                {hasFilters && (
                  <button onClick={()=>{ setSearch(''); setRoleFilter('all'); setAdminFilter('all'); }} style={{
                    display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderRadius:9,
                    border:'1.5px solid #FFA39E', background:'#FFF1F0', fontSize:13, fontWeight:600,
                    color:'#FF4D4F', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    <X size={13}/> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Bulk action bar ── */}
          {selected.length > 0 && (
            <div className="um-bulk" style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              flexWrap:'wrap', gap:10, padding:'12px 16px', marginBottom:14,
              background:'#E6F4FF', borderRadius:10, border:'1px solid #91CAFF', animation:'fadeIn 0.2s ease' }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#1677FF' }}>
                {selected.length} user{selected.length>1?'s':''} selected
              </span>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button onClick={handleBulkToggleAdmin} style={{ padding:'7px 14px', borderRadius:8,
                  border:'1.5px solid #D3ADF7', background:'#F9F0FF', fontSize:12, fontWeight:700,
                  color:'#531DAB', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Toggle Admin</button>
                <button onClick={()=>setShowBulkDelete(true)} style={{ padding:'7px 14px', borderRadius:8,
                  border:'1.5px solid #FFA39E', background:'#FFF1F0', fontSize:12, fontWeight:700,
                  color:'#FF4D4F', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Delete Selected</button>
                <button onClick={()=>setSelected([])} style={{ padding:'7px 12px', borderRadius:8,
                  border:'none', background:'none', fontSize:12, fontWeight:700,
                  color:'#8C8C8C', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Clear</button>
              </div>
            </div>
          )}

          {/* ── Table / Cards container ── */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', overflow:'hidden',
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeUp 0.35s ease 260ms both' }}>

            {currentUsers.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 24px' }}>
                <UserX size={44} color="#E0E0E0" style={{ marginBottom:12 }} />
                <h3 style={{ margin:'0 0 6px', fontSize:15, fontWeight:700, color:'#595959' }}>No users found</h3>
                <p style={{ margin:0, fontSize:13, color:'#BFBFBF' }}>
                  {hasFilters ? 'Try adjusting your search or filters.' : 'No users yet.'}
                </p>
              </div>
            ) : (
              <>
                {/* ─ Desktop table ─ */}
                <div className="um-desktop" style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F0F0F0' }}>
                        {['','User','Contact','Location','Role','Activity','Joined','Actions'].map((h,i)=>(
                          <th key={i} style={{ padding:i===0?'12px 16px':'12px 14px', textAlign:'left',
                            fontSize:11, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase',
                            letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                            {i===0 ? <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleSelectAll}/> : h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map(u=>{
                        const sel = selected.includes(u._id);
                        const cfg = u.isAdmin ? ADMIN_CFG : (ROLE_CFG[u.role]??{ bg:'#F5F5F5', color:'#595959', border:'#E8E8E8', label:u.role||'User' });
                        return (
                          <tr key={u._id} className="um-row" style={{ borderBottom:'1px solid #F5F5F5',
                            background:sel?'#F0F7FF':'#fff', transition:'background 0.12s' }}>
                            <td style={{ padding:'14px 16px', width:36 }}>
                              <Checkbox checked={sel} onChange={()=>toggleSelect(u._id)}/>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
                                  background:u.isAdmin?'linear-gradient(135deg,#7C3AED,#1677FF)':'linear-gradient(135deg,#1677FF,#10B981)',
                                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  <span style={{ fontSize:13, fontWeight:800, color:'#fff' }}>{getInitials(u)}</span>
                                </div>
                                <div style={{ minWidth:0 }}>
                                  <p style={{ margin:'0 0 2px', fontWeight:700, color:'#141414', whiteSpace:'nowrap',
                                    overflow:'hidden', textOverflow:'ellipsis', maxWidth:140 }}>{getFullName(u)}</p>
                                  <p style={{ margin:0, fontSize:11, color:'#BFBFBF', fontFamily:'monospace' }}>{u._id?.slice(0,10)}…</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#262626' }}>
                                  <Mail size={12} color="#BFBFBF"/>{u.email||'—'}
                                </span>
                                {u.phone && <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#8C8C8C' }}>
                                  <Phone size={12} color="#BFBFBF"/>{u.phone}
                                </span>}
                              </div>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                {u.city && <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#262626' }}>
                                  <Building size={12} color="#BFBFBF"/>{u.city}
                                </span>}
                                {u.address && <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#8C8C8C' }}>
                                  <MapPin size={11} color="#BFBFBF"/>
                                  <span style={{ maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.address}</span>
                                </span>}
                                {!u.city && !u.address && <span style={{ fontSize:12, color:'#BFBFBF' }}>—</span>}
                              </div>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <Badge text={u.isAdmin?'Admin':cfg.label} bg={cfg.bg} color={cfg.color} border={cfg.border}
                                icon={u.isAdmin?Shield:null}/>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                {[
                                  { icon:ShoppingCart, val:u.cartItems?.length??0, label:'cart'   },
                                  { icon:Heart,        val:u.favorites?.length??0, label:'fav'    },
                                  { icon:Package,      val:u.orders?.length??0,    label:'orders' },
                                ].map(({ icon:Icon, val, label })=>(
                                  <span key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#8C8C8C' }}>
                                    <Icon size={11} color="#BFBFBF"/> {val}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding:'14px', whiteSpace:'nowrap' }}>
                              <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#595959' }}>
                                <Calendar size={12} color="#BFBFBF"/>{fmtDate(u.createdAt)}
                              </span>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <div style={{ display:'flex', gap:5 }}>
                                <IconBtn onClick={()=>navigate(`/admin/users/${u._id}`)} title="View"
                                  bg="#F0F7FF" color="#1677FF" border="#BFDBFE"><Eye size={13}/></IconBtn>
                                <IconBtn onClick={()=>navigate(`/admin/users/edit/${u._id}`)} title="Edit"
                                  bg="#F6FFED" color="#389E0D" border="#B7EB8F"><Edit size={13}/></IconBtn>
                                <IconBtn onClick={()=>handleToggleAdmin(u._id)}
                                  title={u.isAdmin?'Remove Admin':'Make Admin'}
                                  bg={u.isAdmin?'#F9F0FF':'#FAFAFA'} color={u.isAdmin?'#531DAB':'#8C8C8C'}
                                  border={u.isAdmin?'#D3ADF7':'#E8E8E8'}><Shield size={13}/></IconBtn>
                                <IconBtn onClick={()=>setDeleteTarget(u)} title="Delete"
                                  bg="#FFF1F0" color="#FF4D4F" border="#FFA39E"><Trash2 size={13}/></IconBtn>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ─ Mobile cards ─ */}
                <div className="um-mobile" style={{ flexDirection:'column', display:'none' }}>
                  {/* Select-all mobile row */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
                    borderBottom:'1px solid #F5F5F5', background:'#FAFAFA' }}>
                    <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleSelectAll}/>
                    <span style={{ fontSize:12, fontWeight:600, color:'#8C8C8C' }}>
                      {allSelected ? 'Deselect all' : 'Select all on this page'}
                    </span>
                  </div>
                  {currentUsers.map(u=>{
                    const sel = selected.includes(u._id);
                    const cfg = u.isAdmin ? ADMIN_CFG : (ROLE_CFG[u.role]??{ bg:'#F5F5F5', color:'#595959', border:'#E8E8E8', label:u.role||'User' });
                    return (
                      <div key={u._id} style={{ padding:'14px 16px', borderBottom:'1px solid #F5F5F5',
                        background:sel?'#F0F7FF':'#fff', transition:'background 0.12s' }}>
                        {/* Top row */}
                        <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                          <Checkbox checked={sel} onChange={()=>toggleSelect(u._id)}/>
                          <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
                            background:u.isAdmin?'linear-gradient(135deg,#7C3AED,#1677FF)':'linear-gradient(135deg,#1677FF,#10B981)',
                            display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{getInitials(u)}</span>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 }}>
                              <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#141414',
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{getFullName(u)}</p>
                              <Badge text={u.isAdmin?'Admin':cfg.label} bg={cfg.bg} color={cfg.color} border={cfg.border}
                                icon={u.isAdmin?Shield:null}/>
                            </div>
                            <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>{u.email||'—'}</p>
                          </div>
                        </div>
                        {/* Detail pills */}
                        <div style={{ display:'flex', gap:14, flexWrap:'wrap', paddingLeft:60, marginBottom:10 }}>
                          {u.phone && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#8C8C8C' }}>
                            <Phone size={11} color="#BFBFBF"/> {u.phone}
                          </span>}
                          {u.city && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#8C8C8C' }}>
                            <Building size={11} color="#BFBFBF"/> {u.city}
                          </span>}
                          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#8C8C8C' }}>
                            <Calendar size={11} color="#BFBFBF"/> {fmtDate(u.createdAt)}
                          </span>
                        </div>
                        {/* Activity + actions */}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingLeft:60 }}>
                          <div style={{ display:'flex', gap:12 }}>
                            {[
                              { icon:ShoppingCart, val:u.cartItems?.length??0 },
                              { icon:Heart,        val:u.favorites?.length??0 },
                              { icon:Package,      val:u.orders?.length??0    },
                            ].map(({ icon:Icon, val },i)=>(
                              <span key={i} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#8C8C8C' }}>
                                <Icon size={11} color="#BFBFBF"/> {val}
                              </span>
                            ))}
                          </div>
                          <div style={{ display:'flex', gap:5 }}>
                            <IconBtn onClick={()=>navigate(`/admin/users/${u._id}`)} bg="#F0F7FF" color="#1677FF" border="#BFDBFE"><Eye size={12}/></IconBtn>
                            <IconBtn onClick={()=>navigate(`/admin/users/edit/${u._id}`)} bg="#F6FFED" color="#389E0D" border="#B7EB8F"><Edit size={12}/></IconBtn>
                            <IconBtn onClick={()=>handleToggleAdmin(u._id)} bg={u.isAdmin?'#F9F0FF':'#FAFAFA'} color={u.isAdmin?'#531DAB':'#8C8C8C'} border={u.isAdmin?'#D3ADF7':'#E8E8E8'}><Shield size={12}/></IconBtn>
                            <IconBtn onClick={()=>setDeleteTarget(u)} bg="#FFF1F0" color="#FF4D4F" border="#FFA39E"><Trash2 size={12}/></IconBtn>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Pagination ── */}
            {filtered.length > 0 && (
              <div className="um-pg-footer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'14px 20px', borderTop:'1px solid #F5F5F5', gap:10 }}>
                <span style={{ fontSize:12, color:'#8C8C8C' }}>
                  Showing <strong>{pageStart+1}</strong>–<strong>{Math.min(pageStart+PER_PAGE,filtered.length)}</strong> of <strong>{filtered.length}</strong>
                </span>
                <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                  {[
                    { icon:<ChevronsLeft size={13} color="#595959"/>, action:()=>setCurrentPage(1), disabled:currentPage===1 },
                    { icon:<ChevronLeft  size={13} color="#595959"/>, action:()=>setCurrentPage(p=>p-1), disabled:currentPage===1 },
                  ].map((btn,i)=>(
                    <button key={i} onClick={btn.action} disabled={btn.disabled} style={{
                      width:30, height:30, borderRadius:7, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:btn.disabled?'not-allowed':'pointer', opacity:btn.disabled?0.4:1 }}>{btn.icon}</button>
                  ))}
                  {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
                    const pg = Math.max(1,Math.min(currentPage-2,totalPages-4))+i;
                    if(pg<1||pg>totalPages) return null;
                    const active=pg===currentPage;
                    return (
                      <button key={pg} onClick={()=>setCurrentPage(pg)} style={{
                        width:30, height:30, borderRadius:7, fontSize:12, fontWeight:active?700:500,
                        border:active?'1.5px solid #1677FF':'1.5px solid #E8E8E8',
                        background:active?'#E6F4FF':'#fff', color:active?'#1677FF':'#595959', cursor:'pointer' }}>{pg}</button>
                    );
                  })}
                  {[
                    { icon:<ChevronRight  size={13} color="#595959"/>, action:()=>setCurrentPage(p=>p+1), disabled:currentPage===totalPages },
                    { icon:<ChevronsRight size={13} color="#595959"/>, action:()=>setCurrentPage(totalPages), disabled:currentPage===totalPages },
                  ].map((btn,i)=>(
                    <button key={i} onClick={btn.action} disabled={btn.disabled} style={{
                      width:30, height:30, borderRadius:7, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:btn.disabled?'not-allowed':'pointer', opacity:btn.disabled?0.4:1 }}>{btn.icon}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom statistics strip ── */}
          <div className="um-bottom-stats" style={{ display:'flex', gap:14, marginTop:20, flexWrap:'wrap' }}>
            {[
              { label:'Customers',       value:users.filter(u=>u.role==='customer').length, bg:'#E6F4FF', color:'#1677FF' },
              { label:'Admins',          value:users.filter(u=>u.isAdmin).length,           bg:'#F9F0FF', color:'#531DAB' },
              { label:'Placed Orders',   value:users.filter(u=>u.orders?.length>0).length,  bg:'#F6FFED', color:'#389E0D' },
              { label:'With Favourites', value:users.filter(u=>u.favorites?.length>0).length, bg:'#FFFBE6', color:'#D48806' },
            ].map(({ label, value, bg, color })=>(
              <div key={label} style={{ flex:'1 1 120px', textAlign:'center', padding:'16px 12px',
                background:'#fff', borderRadius:12, border:'1px solid #F0F0F0',
                boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <p style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color, letterSpacing:'-0.5px' }}>{value}</p>
                <p style={{ margin:0, fontSize:11, color:'#8C8C8C' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete User?"
          desc={<>You're about to permanently delete <strong>{getFullName(deleteTarget)}</strong>. This cannot be undone.</>}
          onConfirm={handleDeleteUser}
          onCancel={()=>setDeleteTarget(null)} />
      )}
      {showBulkDelete && (
        <ConfirmModal
          title={`Delete ${selected.length} Users?`}
          desc="All selected users will be permanently removed. This action cannot be undone."
          onConfirm={handleBulkDelete}
          onCancel={()=>setShowBulkDelete(false)} />
      )}
    </AdminLayout>
  );
};

export default UserManagement;