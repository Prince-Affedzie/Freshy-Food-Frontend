// ProductsAdminPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon,
  EyeIcon, ArchiveBoxIcon, CurrencyDollarIcon, CheckCircleIcon,
  ExclamationCircleIcon, ExclamationTriangleIcon, AdjustmentsHorizontalIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllProducts } from '../Apis/productApi';
import {deleteProduct } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (p) => `GH₵ ${Number(p).toFixed(2)}`;

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/100x100/F5F5F5/BDBDBD?text=No+Image';

const CATEGORIES = [
  { v:'all', l:'All Categories' },
  { v:'electronics', l:'Electronics' },
  { v:'phones and tablets', l:'Phones & Tablets' },
  { v:'computers and laptops', l:'Computers & Laptops' },
  { v:'gaming', l:'Gaming' },
  { v:'fashion', l:'Fashion' },
  { v:'books-course-materials', l:'Books & Course Materials' },
  { v:'hostel-items', l:'Hostel Items' },
  { v:'appliances', l:'Appliances' },
  { v:'furniture', l:'Furniture' },
  { v:'beauty and grooming', l:'Beauty & Grooming' },
  { v:'sports and fitness', l:'Sports & Fitness' },
  { v:'accessories', l:'Accessories' },
  { v:'food and drinks', l:'Food & Drinks' },
  { v:'services', l:'Services' },
  { v:'other', l:'Other' },
];

const CAT_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.v, c.l]));

const CONDITION_LABELS = {
  'new': { text:'New', bg:'#E8F5E9', color:'#2E7D32', border:'#A5D6A7' },
  'like-new': { text:'Like New', bg:'#E8F5E9', color:'#2E7D32', border:'#A5D6A7' },
  'excellent': { text:'Excellent', bg:'#E3F2FD', color:'#1565C0', border:'#90CAF9' },
  'good': { text:'Good', bg:'#FFF8E1', color:'#F57F17', border:'#FFE082' },
  'fair': { text:'Fair', bg:'#FFF3E0', color:'#E65100', border:'#FFCC80' },
  'slightly-used': { text:'Slightly Used', bg:'#FFF3E0', color:'#E65100', border:'#FFCC80' },
  'for-parts': { text:'For Parts', bg:'#FFEBEE', color:'#C62828', border:'#EF9A9A' },
};

const CAMPUS_OPTIONS = [
  { v:'', l:'All Campuses' },
  { v:'UG', l:'UG' }, { v:'KNUST', l:'KNUST' }, { v:'UCC', l:'UCC' },
  { v:'UEW', l:'UEW' }, { v:'UPSA', l:'UPSA' }, { v:'GIMPA', l:'GIMPA' },
  { v:'ASHESI', l:'Ashesi' }, { v:'ATU', l:'ATU' }, { v:'OTHER', l:'Other' },
];

const stockInfo = (p) => {
  const stock = p.countInStock ?? 0;
  if (!p.isAvailable || stock === 0) return { text:'Sold Out', bg:'#FFF1F0', color:'#CF1322', border:'#FFA39E' };
  if (stock <= 3) return { text:`Only ${stock} left`, bg:'#FFFBE6', color:'#D48806', border:'#FFE58F' };
  return { text:`${stock} in stock`, bg:'#F6FFED', color:'#389E0D', border:'#B7EB8F' };
};

const getProductImage = (product) => {
  if (product.images?.length > 0) return product.images[0];
  if (product.image) return product.image;
  return PLACEHOLDER_IMAGE;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Badge = ({ text, bg, color, border }) => (
  <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700,
    background:bg, color, border:`1px solid ${border}`, whiteSpace:'nowrap' }}>
    {text}
  </span>
);

const StatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0',
    padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
    boxShadow:'0 1px 4px rgba(0,0,0,0.04)', borderTop:`3px solid ${accent}`,
    animation:`fadeUp 0.4s ease ${delay}ms both` }}>
    <div>
      <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#BFBFBF',
        textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
      <p style={{ margin:0, fontSize:24, fontWeight:800, color:'#141414', letterSpacing:'-0.5px' }}>{value}</p>
    </div>
    <div style={{ width:42, height:42, borderRadius:10, background:accent+'18',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Icon style={{ width:20, height:20, color:accent }}/>
    </div>
  </div>
);

const IconBtn = ({ onClick, title, bg, color, border, children, as: As='button', to }) => {
  const s = { width:30, height:30, borderRadius:7, background:bg, color, border:`1.5px solid ${border}`,
    display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
    transition:'filter 0.15s', flexShrink:0, textDecoration:'none' };
  if (As === Link) return <Link to={to} title={title} style={s}>{children}</Link>;
  return <button onClick={onClick} title={title} style={s}>{children}</button>;
};

const SearchInput = ({ value, onChange, placeholder }) => (
  <div style={{ position:'relative', flex:'1 1 200px', minWidth:0 }}>
    <MagnifyingGlassIcon style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
      width:16, height:16, color:'#BFBFBF' }}/>
    <input value={value} onChange={onChange} placeholder={placeholder} style={{
      width:'100%', paddingLeft:36, paddingRight:value ? 34 : 14, paddingTop:9, paddingBottom:9,
      border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13, outline:'none',
      fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA', transition:'border-color 0.15s',
    }}
    onFocus={e => e.target.style.borderColor='#1677FF'}
    onBlur={e  => e.target.style.borderColor='#E8E8E8'}/>
    {value && (
      <button onClick={() => onChange({ target:{ value:'' } })} style={{
        position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
        background:'none', border:'none', cursor:'pointer', color:'#BFBFBF', display:'flex', padding:0 }}>
        <XMarkIcon style={{ width:15, height:15 }}/>
      </button>
    )}
  </div>
);

const SelectBox = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange} style={{
    padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13,
    fontFamily:"'DM Sans',sans-serif", color:'#262626', background:'#FAFAFA',
    outline:'none', cursor:'pointer', minWidth:0 }}>
    {children}
  </select>
);

const Checkbox = ({ checked, onChange, indeterminate=false }) => (
  <input type="checkbox" checked={checked} onChange={onChange}
    ref={el => { if (el) el.indeterminate = indeterminate; }}
    style={{ width:15, height:15, cursor:'pointer', accentColor:'#1677FF', flexShrink:0 }}/>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const ProductsAdminPage = () => {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showFilters, setShowFilters]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selected, setSelected]           = useState(new Set());
  const [pagination, setPagination]       = useState({
    currentPage:1, totalPages:1, total:0, hasNextPage:false, hasPrevPage:false,
  });
  const [stats, setStats] = useState({ total:0, available:0, soldOut:0, lowStock:0, averagePrice:0 });

  const [filters, setFilters] = useState({
    search:'', category:'all', minPrice:'', maxPrice:'',
    campus:'', isAvailable:'', sort:'newest', page:1, limit:20,
  });

  const fetchProducts = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const f = { ...currentFilters };
      if (!f.search)       delete f.search;
      if (!f.minPrice)     delete f.minPrice;
      if (!f.maxPrice)     delete f.maxPrice;
      if (!f.campus)       delete f.campus;
      if (!f.isAvailable)  delete f.isAvailable;
      if (f.category === 'all') delete f.category;

      const res  = await getAllProducts(f);
      const data = res.data;
      const rows = data.data || [];

      setProducts(rows);
      setPagination({
        currentPage:  data.pagination?.currentPage  || 1,
        totalPages:   data.pagination?.totalPages   || 1,
        total:        data.total                    || 0,
        hasNextPage:  data.pagination?.hasNextPage  || false,
        hasPrevPage:  data.pagination?.hasPrevPage  || false,
      });

      const total = rows.length;
      const available = rows.filter(p => p.isAvailable && (p.countInStock ?? 0) > 0);
      setStats({
        total,
        available:    available.length,
        soldOut:      rows.filter(p => !p.isAvailable || (p.countInStock ?? 0) === 0).length,
        lowStock:     rows.filter(p => p.isAvailable && (p.countInStock ?? 0) > 0 && (p.countInStock ?? 0) <= 3).length,
        averagePrice: total ? (rows.reduce((s, p) => s + (p.price || 0), 0) / total).toFixed(2) : 0,
      });
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const setFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]:  value,
      page: key === 'page' ? value : 1,
    }));
    if (key !== 'page') setSelected(new Set());
  };

  const clearFilters = () => {
    setFilters({ search:'', category:'all', minPrice:'', maxPrice:'', campus:'', isAvailable:'', sort:'newest', page:1, limit:20 });
    setSelected(new Set());
  };

  const toggleSelect = (id) => setSelected(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });
  const allSelected  = products.length > 0 && products.every(p => selected.has(p._id));
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => setSelected(allSelected ? new Set() : new Set(products.map(p => p._id)));

  const hasActiveFilters = filters.search || filters.category !== 'all'
    || filters.minPrice || filters.maxPrice || filters.campus || filters.isAvailable;

  const handleDelete = async (id) => {
    try {
      
      const res = await deleteProduct(id);
      if(res.status ===200){
      toast.success('Product deleted');
      setDeleteConfirm(null);
      fetchProducts(filters);
      }
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout title="Products Management">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes spin   { to   { transform:rotate(360deg) } }
        .pd-row:hover  { background:#FAFCFF !important; }
        .pd-card:hover { background:#FAFCFF !important; }
        .pd-desktop { display: block; }
        .pd-mobile  { display: none;  }
        @media (max-width: 767px) {
          .pd-desktop     { display: none  !important; }
          .pd-mobile      { display: block !important; }
          .pd-stats       { grid-template-columns: repeat(2,1fr) !important; }
          .pd-toolbar     { flex-direction: column !important; }
          .pd-filter-grid { grid-template-columns: 1fr !important; }
          .pd-page-footer { flex-direction: column !important; align-items: flex-start !important; }
          .pd-hdr         { flex-direction: column !important; align-items: flex-start !important; }
          .pd-bulk        { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light"/>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* Sticky header */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="pd-hdr" style={{ maxWidth:1200, margin:'0 auto', padding:'14px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                Product Management
              </h1>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>Manage campus marketplace listings</p>
            </div>
            <Link to="/admin/add-product" style={{
              display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px',
              background:'#1677FF', color:'#fff', borderRadius:9, fontSize:13, fontWeight:700,
              textDecoration:'none', border:'none' }}>
              <PlusIcon style={{ width:16, height:16 }}/> Add Product
            </Link>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* Stats */}
          <div className="pd-stats" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:22 }}>
            <StatCard label="Total"        value={stats.total}              icon={ArchiveBoxIcon}          accent="#1677FF" delay={0}  />
            <StatCard label="Available"    value={stats.available}          icon={CheckCircleIcon}         accent="#10B981" delay={60} />
            <StatCard label="Sold Out"     value={stats.soldOut}            icon={ExclamationCircleIcon}   accent="#FF4D4F" delay={120}/>
            <StatCard label="Low Stock"    value={stats.lowStock}           icon={ExclamationTriangleIcon} accent="#FAAD14" delay={180}/>
            <StatCard label="Avg. Price"   value={`GH₵ ${stats.averagePrice}`} icon={CurrencyDollarIcon}  accent="#7C3AED" delay={240}/>
          </div>

          {/* Filter bar */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #F0F0F0', padding:'14px 18px',
            marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', animation:'fadeUp 0.35s ease 280ms both' }}>
            <div className="pd-toolbar" style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
              <SearchInput value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                placeholder="Search products…"/>
              <SelectBox value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
              </SelectBox>
              <SelectBox value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="popular">Most Viewed</option>
              </SelectBox>
              <button onClick={() => setShowFilters(v => !v)} style={{
                display:'flex', alignItems:'center', gap:6, padding:'9px 14px',
                border:`1.5px solid ${showFilters ? '#1677FF' : '#E8E8E8'}`,
                borderRadius:9, background:showFilters ? '#E6F4FF' : '#fff',
                fontSize:13, fontWeight:600, color:showFilters ? '#1677FF' : '#595959',
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                <AdjustmentsHorizontalIcon style={{ width:16, height:16 }}/> Filters
                {hasActiveFilters && (
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#1677FF', display:'inline-block' }}/>
                )}
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
              <div className="pd-filter-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10,
                paddingTop:14, marginTop:14, borderTop:'1px solid #F5F5F5' }}>
                <SelectBox value={filters.campus} onChange={e => setFilter('campus', e.target.value)}>
                  {CAMPUS_OPTIONS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                </SelectBox>
                <SelectBox value={filters.isAvailable} onChange={e => setFilter('isAvailable', e.target.value)}>
                  <option value="">All Availability</option>
                  <option value="true">Available Only</option>
                  <option value="false">Sold Out / Hidden</option>
                </SelectBox>
                <input type="number" placeholder="Min Price (GH₵)" value={filters.minPrice}
                  onChange={e => setFilter('minPrice', e.target.value)} style={{
                    padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13,
                    fontFamily:"'DM Sans',sans-serif", outline:'none', color:'#262626', background:'#FAFAFA' }}/>
                <input type="number" placeholder="Max Price (GH₵)" value={filters.maxPrice}
                  onChange={e => setFilter('maxPrice', e.target.value)} style={{
                    padding:'9px 12px', border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13,
                    fontFamily:"'DM Sans',sans-serif", outline:'none', color:'#262626', background:'#FAFAFA' }}/>
              </div>
            )}
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="pd-bulk" style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              flexWrap:'wrap', gap:10, padding:'12px 16px', marginBottom:14,
              background:'#E6F4FF', borderRadius:10, border:'1px solid #91CAFF', animation:'fadeIn 0.2s ease' }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#1677FF' }}>
                {selected.size} product{selected.size > 1 ? 's' : ''} selected
              </span>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <SelectBox value="">
                  <option value="">Bulk Action</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="delete">Delete</option>
                </SelectBox>
                <button style={{ padding:'7px 14px', borderRadius:8, border:'1.5px solid #91CAFF', background:'#fff',
                  fontSize:12, fontWeight:700, color:'#1677FF', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  Apply
                </button>
                <button onClick={() => setSelected(new Set())} style={{ padding:'7px 14px', borderRadius:8, border:'none',
                  background:'none', fontSize:12, fontWeight:700, color:'#8C8C8C', cursor:'pointer',
                  fontFamily:"'DM Sans',sans-serif" }}>
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Product list */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0', overflow:'hidden',
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeUp 0.35s ease 320ms both' }}>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', padding:'64px 24px', gap:14 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
                  borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }}/>
                <p style={{ margin:0, fontSize:13, color:'#8C8C8C' }}>Loading products…</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 24px' }}>
                <ArchiveBoxIcon style={{ width:48, height:48, color:'#E0E0E0', margin:'0 auto 12px' }}/>
                <h3 style={{ margin:'0 0 6px', fontSize:15, fontWeight:700, color:'#595959' }}>No products found</h3>
                <p style={{ margin:0, fontSize:13, color:'#BFBFBF' }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="pd-desktop" style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F0F0F0' }}>
                        {['','','Product','Category','Campus','Price','Stock','Condition','Status','Actions'].map((h,i) => (
                          <th key={i} style={{ padding:i===0?'12px 16px':'12px 14px', textAlign:'left',
                            fontSize:11, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase',
                            letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                            {i === 0 ? <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll}/> : h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const sk  = stockInfo(p);
                        const sel = selected.has(p._id);
                        const img = getProductImage(p);
                        const cond = CONDITION_LABELS[p.condition] || { text:p.condition, bg:'#F5F5F5', color:'#8C8C8C', border:'#E8E8E8' };
                        return (
                          <tr key={p._id} className="pd-row" style={{ borderBottom:'1px solid #F5F5F5',
                            background:sel ? '#F0F7FF' : '#fff', transition:'background 0.12s' }}>
                            <td style={{ padding:'14px 16px', width:36 }}>
                              <Checkbox checked={sel} onChange={() => toggleSelect(p._id)}/>
                            </td>
                            <td style={{ padding:'14px 0 14px 4px', width:52 }}>
                              <img src={img} alt={p.name} style={{ width:44, height:44, borderRadius:9,
                                objectFit:'cover', border:'1px solid #F0F0F0', display:'block' }}
                                onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}/>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <p style={{ margin:'0 0 2px', fontWeight:700, color:'#141414', whiteSpace:'nowrap',
                                overflow:'hidden', textOverflow:'ellipsis', maxWidth:180 }}>{p.name}</p>
                              <p style={{ margin:0, fontSize:11, color:'#BFBFBF', whiteSpace:'nowrap',
                                overflow:'hidden', textOverflow:'ellipsis', maxWidth:180 }}>
                                {p.brand || p.description?.substring(0, 40) || '—'}
                              </p>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                                background:'#F5F5F5', color:'#595959', border:'1px solid #E8E8E8' }}>
                                {CAT_LABEL[p.category] || p.category}
                              </span>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <span style={{ fontSize:12, fontWeight:600, color:'#595959' }}>{p.campus || '—'}</span>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <p style={{ margin:'0 0 2px', fontWeight:800, color:'#141414' }}>{fmt(p.price)}</p>
                              {p.negotiable && (
                                <p style={{ margin:0, fontSize:10, color:'#E65100', fontWeight:700 }}>Negotiable</p>
                              )}
                            </td>
                            <td style={{ padding:'14px' }}>
                              <Badge text={sk.text} bg={sk.bg} color={sk.color} border={sk.border}/>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <Badge text={cond.text} bg={cond.bg} color={cond.color} border={cond.border}/>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <Badge text={p.isAvailable ? 'Available' : 'Hidden'}
                                bg={p.isAvailable ? '#F6FFED' : '#F5F5F5'}
                                color={p.isAvailable ? '#389E0D' : '#8C8C8C'}
                                border={p.isAvailable ? '#B7EB8F' : '#E8E8E8'}/>
                            </td>
                            <td style={{ padding:'14px' }}>
                              <div style={{ display:'flex', gap:6 }}>
                                <IconBtn as={Link} to={`/admin-product/${p._id}`} title="View"
                                  bg="#F0F7FF" color="#1677FF" border="#BFDBFE">
                                  <EyeIcon style={{ width:14, height:14 }}/>
                                </IconBtn>
                                <IconBtn as={Link} to={`/admin-product/edit/${p._id}`} title="Edit"
                                  bg="#FFF8E1" color="#F57F17" border="#FFE082">
                                  <PencilIcon style={{ width:14, height:14 }}/>
                                </IconBtn>
                                <IconBtn onClick={() => setDeleteConfirm(p._id)} title="Delete"
                                  bg="#FFF1F0" color="#FF4D4F" border="#FFA39E">
                                  <TrashIcon style={{ width:14, height:14 }}/>
                                </IconBtn>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="pd-mobile">
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px',
                    borderBottom:'1px solid #F5F5F5', background:'#FAFAFA' }}>
                    <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll}/>
                    <span style={{ fontSize:12, fontWeight:600, color:'#8C8C8C' }}>
                      {allSelected ? 'Deselect all' : 'Select all on this page'}
                    </span>
                  </div>

                  {products.map(p => {
                    const sk  = stockInfo(p);
                    const sel = selected.has(p._id);
                    const img = getProductImage(p);
                    const cond = CONDITION_LABELS[p.condition] || { text:p.condition, bg:'#F5F5F5', color:'#8C8C8C', border:'#E8E8E8' };
                    return (
                      <div key={p._id} className="pd-card" style={{
                        padding:'14px 16px', borderBottom:'1px solid #F5F5F5',
                        background:sel ? '#F0F7FF' : '#fff', transition:'background 0.12s' }}>
                        <div style={{ display:'flex', gap:12 }}>
                          <div style={{ paddingTop:3 }}>
                            <Checkbox checked={sel} onChange={() => toggleSelect(p._id)}/>
                          </div>
                          <img src={img} alt={p.name} style={{ width:60, height:60, borderRadius:10,
                            objectFit:'cover', border:'1px solid #F0F0F0', flexShrink:0 }}
                            onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'flex-start', gap:8, marginBottom:6 }}>
                              <div style={{ minWidth:0 }}>
                                <p style={{ margin:'0 0 2px', fontSize:14, fontWeight:700, color:'#141414',
                                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                                <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>
                                  {p.campus || ''}{p.brand ? ` · ${p.brand}` : ''}
                                </p>
                              </div>
                              <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                                <IconBtn as={Link} to={`/admin-product/${p._id}`}
                                  bg="#F0F7FF" color="#1677FF" border="#BFDBFE">
                                  <EyeIcon style={{ width:13, height:13 }}/>
                                </IconBtn>
                                <IconBtn as={Link} to={`/admin-product/edit/${p._id}`}
                                  bg="#FFF8E1" color="#F57F17" border="#FFE082">
                                  <PencilIcon style={{ width:13, height:13 }}/>
                                </IconBtn>
                                <IconBtn onClick={() => setDeleteConfirm(p._id)}
                                  bg="#FFF1F0" color="#FF4D4F" border="#FFA39E">
                                  <TrashIcon style={{ width:13, height:13 }}/>
                                </IconBtn>
                              </div>
                            </div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                              <span style={{ padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:600,
                                background:'#F5F5F5', color:'#595959', border:'1px solid #E8E8E8' }}>
                                {CAT_LABEL[p.category] || p.category}
                              </span>
                              <Badge text={sk.text} bg={sk.bg} color={sk.color} border={sk.border}/>
                              <Badge text={cond.text} bg={cond.bg} color={cond.color} border={cond.border}/>
                            </div>
                            <p style={{ margin:'8px 0 0', fontSize:14, fontWeight:800, color:'#141414' }}>
                              {fmt(p.price)}
                              {p.negotiable && (
                                <span style={{ fontSize:10, color:'#E65100', fontWeight:700, marginLeft:6 }}>Negotiable</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pd-page-footer" style={{ display:'flex', alignItems:'center',
                justifyContent:'space-between', padding:'14px 20px',
                borderTop:'1px solid #F5F5F5', gap:12 }}>
                <span style={{ fontSize:12, color:'#8C8C8C' }}>
                  Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                  {' '}· <strong>{pagination.total}</strong> total
                </span>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <button disabled={!pagination.hasPrevPage}
                    onClick={() => setFilter('page', 1)} style={{
                      width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                      opacity: pagination.hasPrevPage ? 1 : 0.4, fontSize:11, fontWeight:700, color:'#595959' }}>
                    «
                  </button>
                  <button disabled={!pagination.hasPrevPage}
                    onClick={() => setFilter('page', pagination.currentPage - 1)} style={{
                      width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                      opacity: pagination.hasPrevPage ? 1 : 0.4 }}>
                    <ChevronLeftIcon style={{ width:15, height:15, color:'#595959' }}/>
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pg = Math.max(1, Math.min(pagination.currentPage - 2, pagination.totalPages - 4)) + i;
                    if (pg < 1 || pg > pagination.totalPages) return null;
                    const active = pg === pagination.currentPage;
                    return (
                      <button key={pg} onClick={() => setFilter('page', pg)} style={{
                        width:32, height:32, borderRadius:8, fontSize:13, fontWeight: active ? 700 : 500,
                        border: active ? '1.5px solid #1677FF' : '1.5px solid #E8E8E8',
                        background: active ? '#E6F4FF' : '#fff',
                        color: active ? '#1677FF' : '#595959', cursor:'pointer' }}>
                        {pg}
                      </button>
                    );
                  })}
                  <button disabled={!pagination.hasNextPage}
                    onClick={() => setFilter('page', pagination.currentPage + 1)} style={{
                      width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                      opacity: pagination.hasNextPage ? 1 : 0.4 }}>
                    <ChevronRightIcon style={{ width:15, height:15, color:'#595959' }}/>
                  </button>
                  <button disabled={!pagination.hasNextPage}
                    onClick={() => setFilter('page', pagination.totalPages)} style={{
                      width:32, height:32, borderRadius:8, border:'1.5px solid #E8E8E8', background:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                      opacity: pagination.hasNextPage ? 1 : 0.4, fontSize:11, fontWeight:700, color:'#595959' }}>
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)',
          zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center',
          padding:20, animation:'fadeIn 0.2s ease' }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:'#fff', borderRadius:16, maxWidth:380, width:'100%',
            padding:'28px 28px 22px', boxShadow:'0 24px 64px rgba(0,0,0,0.18)',
            animation:'fadeUp 0.25s ease' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:46, height:46, borderRadius:12, background:'#FFF1F0',
              display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <TrashIcon style={{ width:22, height:22, color:'#FF4D4F' }}/>
            </div>
            <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:800, color:'#141414' }}>Delete Product?</h3>
            <p style={{ margin:'0 0 22px', fontSize:13, color:'#595959', lineHeight:1.5 }}>
              This product will be permanently removed from the marketplace. This cannot be undone.
            </p>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding:'9px 18px', borderRadius:9,
                border:'1.5px solid #E8E8E8', background:'#fff', fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif", color:'#595959' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{
                padding:'9px 18px', borderRadius:9, border:'none', background:'#FF4D4F',
                color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsAdminPage;