// ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon, PencilIcon, TrashIcon, CheckCircleIcon,
  XCircleIcon, ExclamationTriangleIcon, ArrowPathIcon,
  UserCircleIcon, MapPinIcon, TagIcon, PhoneIcon,
  EyeIcon, HeartIcon, StarIcon, CubeIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProductById, deleteProduct } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Data maps ────────────────────────────────────────────────────────────────
const CAMPUS_LABELS = {
  UG:'University of Ghana', KNUST:'KNUST', UCC:'University of Cape Coast',
  UEW:'University of Education, Winneba', UPSA:'UPSA', GIMPA:'GIMPA',
  ASHESI:'Ashesi University', ATU:'Accra Technical University', OTHER:'Other',
};

const CONDITION_LABELS = {
  'new':{ label:'Brand New', bg:'#E8F5E9', color:'#2E7D32' },
  'like-new':{ label:'Like New', bg:'#E8F5E9', color:'#2E7D32' },
  'excellent':{ label:'Excellent', bg:'#E3F2FD', color:'#1565C0' },
  'good':{ label:'Good', bg:'#FFF8E1', color:'#F57F17' },
  'fair':{ label:'Fair', bg:'#FFF3E0', color:'#E65100' },
  'slightly-used':{ label:'Slightly Used', bg:'#FFF3E0', color:'#E65100' },
  'for-parts':{ label:'For Parts', bg:'#FFEBEE', color:'#C62828' },
};

const CATEGORY_LABELS = {
  'electronics':'Electronics', 'phones and tablets':'Phones & Tablets',
  'computers and laptops':'Computers & Laptops', 'gaming':'Gaming',
  'fashion':'Fashion', 'books-course-materials':'Books & Course Materials',
  'hostel-items':'Hostel Items', 'appliances':'Appliances',
  'furniture':'Furniture', 'beauty and grooming':'Beauty & Grooming',
  'sports and fitness':'Sports & Fitness', 'accessories':'Accessories',
  'food and drinks':'Food & Drinks', 'services':'Services', 'other':'Other',
};

const TAG_LABELS = {
  featured:'Featured', 'urgent-sale':'Urgent Sale', popular:'Popular',
  discounted:'Discounted', 'new-arrival':'New Arrival', 'student-favorite':'Student Favorite',
};

const TAG_COLORS = [
  { bg:'#E6F4FF', color:'#1677FF', border:'#91CAFF' },
  { bg:'#FFF1F0', color:'#CF1322', border:'#FFA39E' },
  { bg:'#F9F0FF', color:'#531DAB', border:'#D3ADF7' },
  { bg:'#FFFBE6', color:'#D48806', border:'#FFE58F' },
  { bg:'#F6FFED', color:'#389E0D', border:'#B7EB8F' },
  { bg:'#E6FFFB', color:'#08979C', border:'#87E8DE' },
];

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/F5F5F5/BDBDBD?text=No+Image';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—';

const fmtPrice = (price) =>
  price != null ? `GH₵ ${Number(price).toFixed(2)}` : '—';

const stockInfo = (n=0) => {
  if (n===0) return { text:'Sold Out', bg:'#FFF1F0', color:'#CF1322', border:'#FFA39E', dot:'#FF4D4F' };
  if (n<=3)  return { text:`Only ${n} left`, bg:'#FFFBE6', color:'#D48806', border:'#FFE58F', dot:'#FAAD14' };
  return       { text:`${n} in stock`, bg:'#F6FFED', color:'#389E0D', border:'#B7EB8F', dot:'#52C41A' };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const MetaRow = ({ label, value }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:3, paddingBottom:12, borderBottom:'1px solid #F5F5F5' }}>
    <span style={{ fontSize:10, fontWeight:700, color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
    <span style={{ fontSize:13, fontWeight:600, color:'#262626' }}>{value||'—'}</span>
  </div>
);

const InfoRow = ({ icon:Icon, label, value, valueColor }) => (
  <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderBottom:'1px solid #F5F5F5' }}>
    {Icon && (
      <div style={{ width:32, height:32, borderRadius:8, background:'#F5F5F5',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon style={{ width:15, height:15, color:'#8C8C8C' }}/>
      </div>
    )}
    <div style={{ flex:1 }}>
      <p style={{ margin:0, fontSize:10, color:'#BFBFBF', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
      <p style={{ margin:'2px 0 0', fontSize:13, fontWeight:600, color:valueColor||'#262626' }}>{value||'—'}</p>
    </div>
  </div>
);

const SectionCard = ({ title, icon:Icon, children, accent='#1677FF', style={} }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
    overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', ...style }}>
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'13px 18px',
      borderBottom:'1px solid #F5F5F5', background:'#FAFAFA' }}>
      {Icon && (
        <div style={{ width:28, height:28, borderRadius:7, background:accent+'18',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon style={{ width:14, height:14, color:accent }}/>
        </div>
      )}
      <span style={{ fontSize:13, fontWeight:700, color:'#141414' }}>{title}</span>
    </div>
    <div style={{ padding:'16px 18px' }}>{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id }  = useParams();
  console.log(id)
  const navigate = useNavigate();

  const [product, setProduct]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeImageIdx, setActiveImageIdx]   = useState(0);
  const [imgErrors, setImgErrors]         = useState({});

  useEffect(() => { fetchProduct(); }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await getProductById(id);
      if (res.data?.success && res.data?.data) {
        const data = res.data.data.product || res.data.data;
        setProduct(data);
      } else throw new Error('Invalid data');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load product');
      navigate('/admin-products');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      navigate('/admin-products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggle = async () => {
    toast.info(`Product ${product.isAvailable ? 'deactivated' : 'activated'}`);
    fetchProduct();
  };

  const handleImgError = (idx) => {
    setImgErrors(prev => ({ ...prev, [idx]: true }));
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <AdminLayout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh',
        fontFamily:"'DM Sans',sans-serif", flexDirection:'column', gap:14 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
          borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }}/>
        <p style={{ fontSize:13, color:'#8C8C8C', margin:0 }}>Loading product…</p>
      </div>
    </AdminLayout>
  );

  if (!product) return (
    <AdminLayout>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        minHeight:'60vh', gap:12, fontFamily:"'DM Sans',sans-serif", textAlign:'center', padding:24 }}>
        <ExclamationTriangleIcon style={{ width:48, height:48, color:'#BFBFBF' }}/>
        <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414' }}>Product Not Found</h2>
        <Link to="/admin-products" style={{ display:'flex', alignItems:'center', gap:6, fontSize:13,
          fontWeight:600, color:'#1677FF', textDecoration:'none' }}>
          <ArrowLeftIcon style={{ width:14, height:14 }}/> Back to Products
        </Link>
      </div>
    </AdminLayout>
  );

  // ── Derived values ──────────────────────────────────────────────────────
  const images = product.images?.length > 0 ? product.images : [product.image || PLACEHOLDER_IMAGE];
  const condition = CONDITION_LABELS[product.condition] || { label:product.condition, bg:'#F5F5F5', color:'#8C8C8C' };
  const sk = stockInfo(product.countInStock);
  const price = fmtPrice(product.price);
  const catLabel = CATEGORY_LABELS[product.category] || product.category || '—';
  const vendor = product.vendor;

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .pd-btn:hover     { filter:brightness(0.93); }
        .thumb:hover      { border-color:#1677FF !important; }

        @media (max-width:768px) {
          .pd-layout    { grid-template-columns:1fr !important; }
          .pd-meta-grid { grid-template-columns:1fr 1fr !important; }
          .pd-hdr       { flex-direction:column !important; align-items:flex-start !important; }
          .pd-actions   { flex-wrap:wrap !important; }
        }
        @media (max-width:480px) {
          .pd-meta-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light" limit={2}/>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* ── Sticky header ── */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="pd-hdr" style={{ maxWidth:1100, margin:'0 auto', padding:'12px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <nav style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#8C8C8C', marginBottom:3 }}>
                <Link to="/admin-products" style={{ color:'#8C8C8C', textDecoration:'none', fontWeight:600 }}>Products</Link>
                <span>/</span>
                <span style={{ color:'#262626', fontWeight:700 }}>{product.name}</span>
              </nav>
              <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>{product.name}</h1>
            </div>

            <div className="pd-actions" style={{ display:'flex', gap:8 }}>
              <Link to={`/admin-product/edit/${id}`} className="pd-btn" style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
                border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13, fontWeight:600,
                color:'#595959', background:'#fff', textDecoration:'none', transition:'filter 0.15s',
              }}>
                <PencilIcon style={{ width:14, height:14 }}/> Edit
              </Link>
              <button onClick={handleToggle} className="pd-btn" style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
                border:`1.5px solid ${product.isAvailable?'#FFE58F':'#B7EB8F'}`,
                borderRadius:9, fontSize:13, fontWeight:600,
                background:product.isAvailable?'#FFFBE6':'#F6FFED',
                color:product.isAvailable?'#D48806':'#389E0D', cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif", transition:'filter 0.15s',
              }}>
                <ArrowPathIcon style={{ width:14, height:14 }}/>
                {product.isAvailable ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={()=>setShowDeleteModal(true)} className="pd-btn" style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
                border:'1.5px solid #FFA39E', borderRadius:9, fontSize:13, fontWeight:600,
                background:'#FFF1F0', color:'#CF1322', cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif", transition:'filter 0.15s',
              }}>
                <TrashIcon style={{ width:14, height:14 }}/> Delete
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px 56px' }}>
          <div className="pd-layout" style={{ display:'grid', gridTemplateColumns:'400px 1fr', gap:20, alignItems:'start' }}>

            {/* ══ LEFT COLUMN ══════════════════════════════════════════════ */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Product image gallery */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
                overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeUp 0.4s ease both' }}>
                {!imgErrors[activeImageIdx] ? (
                  <img
                    src={images[activeImageIdx]}
                    alt={product.name}
                    onError={() => handleImgError(activeImageIdx)}
                    style={{ width:'100%', aspectRatio:'1/1', objectFit:'cover', display:'block' }}
                  />
                ) : (
                  <div style={{ width:'100%', aspectRatio:'1/1', background:'#F5F5F5',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
                    <ExclamationTriangleIcon style={{ width:36, height:36, color:'#BFBFBF' }}/>
                    <p style={{ margin:0, fontSize:12, color:'#BFBFBF' }}>Image unavailable</p>
                  </div>
                )}

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div style={{ display:'flex', gap:8, padding:12, overflowX:'auto', borderTop:'1px solid #F5F5F5' }}>
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="thumb"
                        onClick={() => setActiveImageIdx(i)}
                        style={{
                          width:56, height:56, borderRadius:8, overflow:'hidden',
                          border:`2px solid ${i === activeImageIdx ? '#1677FF' : '#E8E8E8'}`,
                          cursor:'pointer', flexShrink:0, transition:'border-color 0.15s',
                        }}
                      >
                        <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price + status card */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
                padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeUp 0.4s ease 60ms both' }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:14 }}>
                  <span style={{ fontSize:32, fontWeight:800, color:'#141414', letterSpacing:'-1px' }}>{price}</span>
                  {product.negotiable && (
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                      background:'#FFF7E6', color:'#D48806', border:'1px solid #FFD591' }}>Negotiable</span>
                  )}
                </div>

                {/* Stock badge */}
                <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'7px 14px',
                  borderRadius:10, background:sk.bg, border:`1px solid ${sk.border}`, marginBottom:14 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:sk.dot, flexShrink:0, display:'inline-block' }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:sk.color }}>{sk.text}</span>
                </div>

                {/* Available status */}
                <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:12, borderTop:'1px solid #F5F5F5' }}>
                  {product.isAvailable
                    ? <CheckCircleIcon style={{ width:16, height:16, color:'#52C41A' }}/>
                    : <XCircleIcon    style={{ width:16, height:16, color:'#FF4D4F' }}/>}
                  <span style={{ fontSize:13, fontWeight:700, color:product.isAvailable?'#389E0D':'#CF1322' }}>
                    {product.isAvailable ? 'Listed — visible to students' : 'Unlisted — hidden from store'}
                  </span>
                </div>

                {/* Condition badge */}
                <div style={{ marginTop:10 }}>
                  <span style={{ padding:'4px 12px', borderRadius:8, fontSize:11, fontWeight:700,
                    background:condition.bg, color:condition.color }}>
                    {condition.label}
                  </span>
                </div>

                <p style={{ margin:'14px 0 0', fontSize:11, color:'#BFBFBF' }}>
                  Listed {fmtDate(product.createdAt)} · Updated {fmtDate(product.updatedAt)}
                </p>
              </div>
            </div>

            {/* ══ RIGHT COLUMN ═════════════════════════════════════════════ */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Details card */}
              <SectionCard title="Product Details" icon={TagIcon} accent="#1677FF"
                style={{ animation:'fadeUp 0.4s ease 80ms both' }}>
                {/* Description */}
                <div style={{ marginBottom:18, paddingBottom:18, borderBottom:'1px solid #F5F5F5' }}>
                  <p style={{ margin:'0 0 8px', fontSize:10, fontWeight:700, color:'#BFBFBF',
                    textTransform:'uppercase', letterSpacing:'0.06em' }}>Description</p>
                  <p style={{ margin:0, fontSize:13, color:'#595959', lineHeight:1.7 }}>
                    {product.description || 'No description provided.'}
                  </p>
                </div>

                {/* Meta grid */}
                <div className="pd-meta-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:16 }}>
                  <MetaRow label="Category" value={catLabel}/>
                  <MetaRow label="Subcategory" value={product.subcategory?.replace(/-/g, ' ') || '—'}/>
                  <MetaRow label="Condition" value={condition.label}/>
                  <MetaRow label="Campus" value={CAMPUS_LABELS[product.campus] || product.campus}/>
                  <MetaRow label="Area" value={product.location?.campusArea || '—'}/>
                  <MetaRow label="Hostel" value={product.location?.hostel || '—'}/>
                  <MetaRow label="Brand" value={product.brand || '—'}/>
                  <MetaRow label="Views" value={product.views ?? '0'}/>
                  <MetaRow label="Favorites" value={`${product.favorites ?? 0} saves`}/>
                </div>

                {/* Tags */}
                {product.tags?.length > 0 && (
                  <div>
                    <p style={{ margin:'0 0 10px', fontSize:10, fontWeight:700, color:'#BFBFBF',
                      textTransform:'uppercase', letterSpacing:'0.06em' }}>Tags</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                      {product.tags.map((tag,i)=>{
                        const c = TAG_COLORS[i % TAG_COLORS.length];
                        return (
                          <span key={i} style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700,
                            background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>
                            {TAG_LABELS[tag] || tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reviews summary */}
                {product.numReviews > 0 && (
                  <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid #F5F5F5' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <StarIcon style={{ width:18, height:18, color:'#FAAD14' }}/>
                      <span style={{ fontSize:15, fontWeight:800, color:'#141414' }}>{product.rating?.toFixed(1) || '0.0'}</span>
                      <span style={{ fontSize:12, color:'#8C8C8C' }}>({product.numReviews} review{product.numReviews!==1?'s':''})</span>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Vendor Info Card */}
              {vendor && (
                <SectionCard title="Vendor Information" icon={UserCircleIcon} accent="#10B981"
                  style={{ animation:'fadeUp 0.4s ease 120ms both' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                    {/* Vendor avatar */}
                    <div style={{ width:52, height:52, borderRadius:26, background:'#E8F5E9',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:20, fontWeight:800, color:'#2E7D32' }}>
                        {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#141414' }}>{vendor.name || 'Unknown Vendor'}</p>
                      {vendor.phone && (
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:4 }}>
                          <PhoneIcon style={{ width:12, height:12, color:'#8C8C8C' }}/>
                          <span style={{ fontSize:12, color:'#595959', fontWeight:500 }}>{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.rating !== undefined && (
                        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                          <StarIcon style={{ width:13, height:13, color:'#FAAD14' }}/>
                          <span style={{ fontSize:12, fontWeight:700, color:'#141414' }}>{vendor.rating?.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/admin-vendor/${vendor._id}`}
                      style={{
                        display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px',
                        borderRadius:9, background:'#E8F5E9', color:'#2E7D32',
                        fontSize:12, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap',
                        border:'1px solid #C8E6C9', transition:'filter 0.15s',
                      }}
                      className="pd-btn"
                    >
                      View Vendor →
                    </Link>
                  </div>
                </SectionCard>
              )}

              {/* Quick info strip */}
              <div style={{ background:'linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%)',
                borderRadius:14, padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                gap:0, animation:'fadeUp 0.4s ease 140ms both' }}>
                {[
                  { label:'Price',  value: price,          icon:TagIcon },
                  { label:'Campus',value: CAMPUS_LABELS[product.campus]||product.campus, icon:MapPinIcon },
                  { label:'Views', value: product.views ?? '0', icon:EyeIcon },
                ].map((item,i)=>(
                  <div key={i} style={{ textAlign:'center', padding:'0 12px',
                    borderRight: i<2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                    <p style={{ margin:'0 0 4px', fontSize:10, color:'rgba(255,255,255,0.4)',
                      textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>{item.label}</p>
                    <p style={{ margin:0, fontSize:17, fontWeight:800, color:'#fff', letterSpacing:'-0.3px' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Availability card */}
              <SectionCard title="Availability & Status" icon={CheckCircleIcon}
                accent={product.isAvailable?'#10B981':'#FF4D4F'}
                style={{ animation:'fadeUp 0.4s ease 180ms both' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', flexShrink:0,
                      background: product.isAvailable?'#52C41A':'#FF4D4F',
                      boxShadow: `0 0 0 4px ${product.isAvailable?'#F6FFED':'#FFF1F0'}` }}/>
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#141414' }}>
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </p>
                      <p style={{ margin:0, fontSize:11, color:'#8C8C8C' }}>
                        {product.isAvailable ? 'Students can see and purchase this item' : 'Hidden from the marketplace'}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleToggle} style={{
                    padding:'8px 16px', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer',
                    fontFamily:"'DM Sans',sans-serif", transition:'filter 0.15s',
                    border: product.isAvailable?'1.5px solid #FFE58F':'1.5px solid #B7EB8F',
                    background: product.isAvailable?'#FFFBE6':'#F6FFED',
                    color: product.isAvailable?'#D48806':'#389E0D',
                  }}>
                    {product.isAvailable ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete modal ── */}
      {showDeleteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)',
          zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation:'fadeIn 0.2s ease' }}
          onClick={()=>setShowDeleteModal(false)}>
          <div style={{ background:'#fff', borderRadius:16, maxWidth:380, width:'100%',
            padding:'28px 28px 22px', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', animation:'fadeUp 0.25s ease' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ width:46, height:46, borderRadius:12, background:'#FFF1F0',
              display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <TrashIcon style={{ width:22, height:22, color:'#FF4D4F' }}/>
            </div>
            <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:800, color:'#141414' }}>Delete Product?</h3>
            <p style={{ margin:'0 0 22px', fontSize:13, color:'#595959', lineHeight:1.5 }}>
              You're about to permanently delete <strong>{product.name}</strong>. This cannot be undone.
            </p>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={()=>setShowDeleteModal(false)} style={{ padding:'9px 18px', borderRadius:9,
                border:'1.5px solid #E8E8E8', background:'#fff', fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif", color:'#595959' }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding:'9px 18px', borderRadius:9,
                border:'none', background:'#FF4D4F', color:'#fff', fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductDetailPage;