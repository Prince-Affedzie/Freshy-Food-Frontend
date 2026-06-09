// VendorListPage.jsx
import React, { useEffect, useState } from 'react';
import { getAllVendors, deleteVendor } from '../Apis/vendorApi';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon,
  ChevronLeftIcon, ChevronRightIcon, UserGroupIcon,
  CheckCircleIcon, ChartBarIcon, StarIcon,
  MapPinIcon, PhoneIcon, CubeIcon, EyeIcon,
  PencilIcon, TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminLayout from '../Components/AdminComponents/adminLayout';

const CAMPUS_LABELS = {
  UG:'University of Ghana', KNUST:'KNUST', UCC:'University of Cape Coast',
  UEW:'University of Education, Winneba', UPSA:'UPSA', GIMPA:'GIMPA',
  ASHESI:'Ashesi University', ATU:'Accra Technical University', OTHER:'Other',
};

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

const Badge = ({ text, bg, color, border }) => (
  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
    background:bg, color, border:`1px solid ${border}`, whiteSpace:'nowrap' }}>
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
const VendorListPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        campus: campusFilter.trim() || undefined,
        search: searchQuery.trim() || undefined,
        sortBy,
        order: sortOrder,
        page,
        limit,
      };
      const response = await getAllVendors(params);
      setVendors(response.data.data || []);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Failed to load vendors';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, [page, sortBy, sortOrder]);
  useEffect(() => { setPage(1); }, [searchQuery, campusFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { fetchVendors(); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, campusFilter, page, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const totalPages = Math.ceil(totalCount / limit);
  const handleEdit = (vendor) => navigate(`/admin/vendor_edit/${vendor._id}`);

  const getImageUrl = (url) => {
    if (!url || url === 'default_banner.jpg' || url === 'default_profile.jpg') return null;
    return url;
  };

  const getCampusLabel = (campus) => CAMPUS_LABELS[campus] || campus || '—';

  const handleDelete = async (vendor) => {
    setDeleteConfirm(vendor);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteVendor(deleteConfirm._id);
      toast.success(`Vendor "${deleteConfirm.name}" deleted successfully`);
      setDeleteConfirm(null);
      fetchVendors();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to delete vendor');
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: totalCount,
    verified: vendors.filter(v => v.isVerified).length,
    active: vendors.filter(v => v.isActive).length,
  };

  const hasActiveFilters = searchQuery || campusFilter;

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .vn-row:hover { background:#FAFCFF !important; cursor:pointer; }
        .vn-card:hover { background:#FAFCFF !important; cursor:pointer; }
        .vn-desktop { display:block; }
        .vn-mobile  { display:none; }
        @media (max-width:767px) {
          .vn-desktop { display:none !important; }
          .vn-mobile  { display:block !important; }
          .vn-stats   { grid-template-columns:repeat(2,1fr) !important; }
          .vn-toolbar { flex-direction:column !important; }
          .vn-page-footer { flex-direction:column !important; align-items:flex-start !important; }
          .vn-hdr { flex-direction:column !important; align-items:flex-start !important; }
        }
        @media (max-width:480px) {
          .vn-stats { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* Sticky header */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="vn-hdr" style={{ maxWidth:1200, margin:'0 auto', padding:'14px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                Vendors
              </h1>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>Manage all campus marketplace vendors</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={fetchVendors}
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px',
                  border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:12, fontWeight:600,
                  color:'#595959', background:'#fff', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                <ArrowPathIcon style={{ width:15, height:15 }}/> Refresh
              </button>
              <Link to="/admin/add-vendor"
                style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px',
                  background:'#1677FF', color:'#fff', borderRadius:9, fontSize:13, fontWeight:700,
                  textDecoration:'none', border:'none', fontFamily:"'DM Sans',sans-serif" }}>
                + Add Vendor
              </Link>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* Stats */}
          <div className="vn-stats" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:22 }}>
            <StatCard label="Total Vendors" value={stats.total} icon={UserGroupIcon} accent="#1677FF" delay={0} />
            <StatCard label="Verified" value={stats.verified} icon={CheckCircleIcon} accent="#10B981" delay={60} />
            <StatCard label="Active" value={stats.active} icon={ChartBarIcon} accent="#7C3AED" delay={120} />
          </div>

          {/* Filter bar */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0', padding:'14px 18px',
            marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', animation:'fadeUp 0.35s ease 280ms both' }}>
            <div className="vn-toolbar" style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ position:'relative', flex:'1 1 220px', minWidth:0 }}>
                <MagnifyingGlassIcon style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                  width:15, height:15, color:'#BFBFBF' }}/>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, store..."
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
              <SelectBox value={campusFilter} onChange={e => setCampusFilter(e.target.value)}
                style={{ flex:'0 0 auto', minWidth:160 }}>
                <option value="">All Campuses</option>
                {Object.entries(CAMPUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </SelectBox>
              {hasActiveFilters && (
                <button onClick={() => { setSearchQuery(''); setCampusFilter(''); }} style={{
                  display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderRadius:9,
                  border:'1.5px solid #FFA39E', background:'#FFF1F0', fontSize:13, fontWeight:600,
                  color:'#FF4D4F', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <XMarkIcon style={{ width:14, height:14 }}/> Clear
                </button>
              )}
            </div>
          </div>

          {/* Vendors list */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', overflow:'hidden',
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeUp 0.35s ease 320ms both' }}>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'64px 24px', gap:14 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
                  borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }}/>
                <p style={{ margin:0, fontSize:13, color:'#8C8C8C' }}>Loading vendors…</p>
              </div>
            ) : error && vendors.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 24px' }}>
                <p style={{ color:'#FF4D4F', fontWeight:600, marginBottom:8 }}>Failed to load vendors.</p>
                <button onClick={fetchVendors} style={{ color:'#1677FF', fontWeight:600, fontSize:13, background:'none', border:'none', cursor:'pointer' }}>Retry</button>
              </div>
            ) : vendors.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 24px' }}>
                <UserGroupIcon style={{ width:48, height:48, color:'#E0E0E0', margin:'0 auto 12px' }}/>
                <h3 style={{ margin:'0 0 6px', fontSize:15, fontWeight:700, color:'#595959' }}>No vendors found</h3>
                <p style={{ margin:0, fontSize:13, color:'#BFBFBF' }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="vn-desktop" style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F0F0F0' }}>
                        {[
                          { label:'Vendor', sort:'name' },
                          { label:'Campus', sort:'campus' },
                          { label:'Phone', sort:null },
                          { label:'Listings', sort:null },
                          { label:'Rating', sort:null },
                          { label:'Status', sort:'isVerified' },
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
                      {vendors.map((vendor) => (
                        <tr key={vendor._id} className="vn-row"
                          onClick={() => navigate(`/admin/vendor/${vendor._id}`)}
                          style={{ borderBottom:'1px solid #F5F5F5', background:'#fff', transition:'background 0.12s' }}>
                          <td style={{ padding:'12px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:36, height:36, borderRadius:18, background:'#F0F0F0',
                                overflow:'hidden', flexShrink:0 }}>
                                {getImageUrl(vendor.profileImage) ? (
                                  <img src={vendor.profileImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                                ) : (
                                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                                    justifyContent:'center', background:'#E8F5E9' }}>
                                    <span style={{ fontSize:14, fontWeight:800, color:'#2E7D32' }}>
                                      {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p style={{ margin:0, fontWeight:700, color:'#141414', fontSize:13 }}>{vendor.name}</p>
                                {vendor.storeName && (
                                  <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>{vendor.storeName}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'12px 14px', fontSize:12, color:'#595959' }}>{getCampusLabel(vendor.campus)}</td>
                          <td style={{ padding:'12px 14px', fontSize:12, color:'#595959' }}>{vendor.phone || '—'}</td>
                          <td style={{ padding:'12px 14px', fontSize:12, fontWeight:600, color:'#141414' }}>
                            {vendor.productCount ?? vendor.products?.length ?? 0}
                          </td>
                          <td style={{ padding:'12px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                              <StarIcon style={{ width:14, height:14, color:'#FAAD14' }}/>
                              <span style={{ fontSize:12, fontWeight:600, color:'#141414' }}>{vendor.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                          </td>
                          <td style={{ padding:'12px 14px' }}>
                            <Badge text={vendor.isVerified?'Verified':'Pending'}
                              bg={vendor.isVerified?'#E8F5E9':'#FFF8E1'}
                              color={vendor.isVerified?'#2E7D32':'#F57F17'}
                              border={vendor.isVerified?'#A5D6A7':'#FFE082'} />
                          </td>
                          <td style={{ padding:'12px 14px 12px 0' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/vendor/${vendor._id}`); }}
                                style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 10px',
                                  borderRadius:7, border:'1.5px solid #E8E8E8', background:'#fff', fontSize:11, fontWeight:600,
                                  color:'#595959', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                                <EyeIcon style={{ width:13, height:13 }}/> View
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleEdit(vendor); }}
                                style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 10px',
                                  borderRadius:7, border:'1.5px solid #FFE082', background:'#FFF8E1', fontSize:11, fontWeight:600,
                                  color:'#F57F17', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                                <PencilIcon style={{ width:13, height:13 }}/> Edit
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(vendor); }}
                                style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 10px',
                                  borderRadius:7, border:'1.5px solid #FFA39E', background:'#FFF1F0', fontSize:11, fontWeight:600,
                                  color:'#CF1322', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                                <TrashIcon style={{ width:13, height:13 }}/> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="vn-mobile">
                  {vendors.map((vendor) => (
                    <div key={vendor._id} className="vn-card"
                      onClick={() => navigate(`/admin/vendor/${vendor._id}`)}
                      style={{ padding:'14px 16px', borderBottom:'1px solid #F5F5F5', background:'#fff', transition:'background 0.12s' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                        <div style={{ width:40, height:40, borderRadius:20, background:'#F0F0F0', overflow:'hidden', flexShrink:0 }}>
                          {getImageUrl(vendor.profileImage) ? (
                            <img src={vendor.profileImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          ) : (
                            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                              justifyContent:'center', background:'#E8F5E9' }}>
                              <span style={{ fontSize:16, fontWeight:800, color:'#2E7D32' }}>
                                {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#141414' }}>{vendor.name}</p>
                          <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>{getCampusLabel(vendor.campus)}</p>
                        </div>
                        <Badge text={vendor.isVerified?'Verified':'Pending'}
                          bg={vendor.isVerified?'#E8F5E9':'#FFF8E1'}
                          color={vendor.isVerified?'#2E7D32':'#F57F17'}
                          border={vendor.isVerified?'#A5D6A7':'#FFE082'} />
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                        <div>
                          <p style={{ margin:0, fontSize:10, color:'#BFBFBF', textTransform:'uppercase' }}>Phone</p>
                          <p style={{ margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#595959' }}>{vendor.phone||'—'}</p>
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:10, color:'#BFBFBF', textTransform:'uppercase' }}>Listings</p>
                          <p style={{ margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#141414' }}>
                            {vendor.productCount ?? vendor.products?.length ?? 0} items
                          </p>
                        </div>
                      </div>
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/vendor/${vendor._id}`); }}
                          style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 12px',
                            borderRadius:7, border:'1.5px solid #E8E8E8', background:'#fff', fontSize:11, fontWeight:600,
                            color:'#595959', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                          <EyeIcon style={{ width:13, height:13 }}/> View
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(vendor); }}
                          style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 12px',
                            borderRadius:7, border:'1.5px solid #FFE082', background:'#FFF8E1', fontSize:11, fontWeight:600,
                            color:'#F57F17', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                          <PencilIcon style={{ width:13, height:13 }}/> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(vendor); }}
                          style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 12px',
                            borderRadius:7, border:'1.5px solid #FFA39E', background:'#FFF1F0', fontSize:11, fontWeight:600,
                            color:'#CF1322', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                          <TrashIcon style={{ width:13, height:13 }}/> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="vn-page-footer" style={{ display:'flex', alignItems:'center',
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
                        border: active?'1.5px solid #1677FF':'1.5px solid #E8E8E8',
                        background: active?'#E6F4FF':'#fff', color: active?'#1677FF':'#595959', cursor:'pointer' }}>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)',
          zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
          animation:'fadeIn 0.2s ease' }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:'#fff', borderRadius:16, maxWidth:400, width:'100%',
            padding:'28px 28px 22px', boxShadow:'0 24px 64px rgba(0,0,0,0.18)',
            animation:'fadeUp 0.25s ease' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:46, height:46, borderRadius:12, background:'#FFF1F0',
              display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <TrashIcon style={{ width:22, height:22, color:'#FF4D4F' }}/>
            </div>
            <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:800, color:'#141414' }}>Delete Vendor?</h3>
            <p style={{ margin:'0 0 4px', fontSize:13, color:'#595959', lineHeight:1.5 }}>
              You're about to permanently delete <strong>{deleteConfirm.name}</strong>
              {deleteConfirm.storeName && <span> ({deleteConfirm.storeName})</span>}.
            </p>
            <p style={{ margin:'0 0 22px', fontSize:12, color:'#8C8C8C' }}>
              This action cannot be undone. All associated data will be removed.
            </p>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding:'9px 18px', borderRadius:9,
                border:'1.5px solid #E8E8E8', background:'#fff', fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif", color:'#595959' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} style={{
                padding:'9px 18px', borderRadius:9, border:'none', background: deleting?'#BFBFBF':'#FF4D4F',
                color:'#fff', fontSize:13, fontWeight:700, cursor: deleting?'not-allowed':'pointer',
                fontFamily:"'DM Sans',sans-serif", opacity: deleting?0.7:1 }}>
                {deleting ? 'Deleting…' : 'Delete Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default VendorListPage;