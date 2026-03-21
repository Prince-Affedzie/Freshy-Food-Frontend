// ProductEditPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PencilIcon, CameraIcon, XMarkIcon, CheckCircleIcon,
  ExclamationTriangleIcon, CurrencyDollarIcon, TagIcon,
  InformationCircleIcon, ArrowUpTrayIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProductById, updateProduct } from '../Apis/productApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value:'vegetable', label:'Vegetable' }, { value:'fruit',   label:'Fruit'   },
  { value:'staple',    label:'Staple'    }, { value:'herb',    label:'Herb'    },
  { value:'tuber',     label:'Tuber'     }, { value:'grain',   label:'Grain'   },
  { value:'cereal',    label:'Cereal'    }, { value:'meat',    label:'Meat'    },
  { value:'frozen-food',label:'Frozen Food'},{ value:'poultry',label:'Poultry' },
  { value:'seafood',   label:'Seafood'   }, { value:'spice',   label:'Spice'   },
  { value:'other',     label:'Other'     },
];

const UNITS = [
  { value:'kg',label:'Kilogram (kg)' },{ value:'g',label:'Gram (g)' },
  { value:'piece',label:'Piece' },{ value:'pieces',label:'Pieces' },
  { value:'bunch',label:'Bunch' },{ value:'bag',label:'Bag' },
  { value:'pack',label:'Pack' },{ value:'basket',label:'Basket' },
  { value:'olonka',label:'Olonka' },{ value:'liter',label:'Liter' },
  { value:'ml',label:'ml' },{ value:'box',label:'Box' },
  { value:'tin',label:'Tin' },{ value:'jar',label:'Jar' },
];

const TAG_OPTIONS = [
  { value:'featured',       label:'Featured',        category:'general' },
  { value:'best_selling',   label:'Best Selling',     category:'general' },
  { value:'new_arrival',    label:'New Arrival',      category:'general' },
  { value:'discounted',     label:'Discounted',       category:'general' },
  { value:'popular',        label:'Popular',          category:'general' },
  { value:'seasonal',       label:'Seasonal',         category:'general' },
  { value:'fresh_today',    label:'Fresh Today',      category:'grocery' },
  { value:'farm_fresh',     label:'Farm Fresh',       category:'grocery' },
  { value:'organic',        label:'Organic',          category:'grocery' },
  { value:'locally_sourced',label:'Locally Sourced',  category:'grocery' },
  { value:'ready_to_cook',  label:'Ready to Cook',    category:'grocery' },
  { value:'ready_to_eat',   label:'Ready to Eat',     category:'grocery' },
  { value:'perishable',     label:'Perishable',       category:'grocery' },
  { value:'non_perishable', label:'Non-Perishable',   category:'grocery' },
];

const TAG_COLORS = [
  { bg:'#E6F4FF', color:'#1677FF', border:'#91CAFF' },
  { bg:'#F6FFED', color:'#389E0D', border:'#B7EB8F' },
  { bg:'#F9F0FF', color:'#531DAB', border:'#D3ADF7' },
  { bg:'#FFFBE6', color:'#D48806', border:'#FFE58F' },
  { bg:'#FFF1F0', color:'#CF1322', border:'#FFA39E' },
  { bg:'#E6FFFB', color:'#08979C', border:'#87E8DE' },
];

const genSlug = (n) =>
  n.toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/--+/g,'-').trim();

// ─── Shared field styles ──────────────────────────────────────────────────────
const fieldBase = (err=false, disabled=false) => ({
  width:'100%', padding:'10px 14px', fontSize:13, fontFamily:"'DM Sans',sans-serif",
  border:`1.5px solid ${err?'#FFA39E':'#E8E8E8'}`, borderRadius:9, outline:'none',
  background: disabled?'#F5F5F5':'#FAFAFA', color:'#262626',
  transition:'border-color 0.15s',
});

const Label = ({ children, required }) => (
  <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#595959',
    textTransform:'uppercase', letterSpacing:'0.05em' }}>
    {children}{required && <span style={{ color:'#FF4D4F', marginLeft:3 }}>*</span>}
  </p>
);

const Section = ({ title, icon: Icon, accent='#1677FF', children, style={} }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
    overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', ...style }}>
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'13px 18px',
      borderBottom:'1px solid #F5F5F5', background:'#FAFAFA' }}>
      <div style={{ width:28, height:28, borderRadius:7, background:accent+'18',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon style={{ width:14, height:14, color:accent }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:'#141414' }}>{title}</span>
    </div>
    <div style={{ padding:'18px' }}>{children}</div>
  </div>
);

const SelectBox = ({ name, value, onChange, children, disabled, err }) => (
  <div style={{ position:'relative' }}>
    <select name={name} value={value} onChange={onChange} disabled={disabled}
      className="pep-input" style={{ ...fieldBase(err, disabled), appearance:'none', paddingRight:34 }}>
      {children}
    </select>
    <ChevronDownIcon style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
      width:13, height:13, color:'#8C8C8C', pointerEvents:'none' }}/>
  </div>
);

const PreviewRow = ({ label, value, valueStyle={} }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'8px 0', borderBottom:'1px solid #F7F7F7' }}>
    <span style={{ fontSize:12, color:'#8C8C8C' }}>{label}</span>
    <span style={{ fontSize:12, fontWeight:700, color:'#141414', ...valueStyle, maxWidth:'55%',
      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{value||'—'}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductEditPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const fileRef      = useRef(null);

  const [formData, setFormData] = useState({
    name:'', category:'', price:'', unit:'', countInStock:'0',
    isAvailable:true, description:'', nutritionalInfo:'', tags:[],
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imgError,     setImgError]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [slugPreview,  setSlugPreview]  = useState('');
  const [tagSearch,    setTagSearch]    = useState('');
  const [showDrop,     setShowDrop]     = useState(false);
  const [dragOver,     setDragOver]     = useState(false);

  useEffect(() => { fetchProduct(); }, [id]);
  useEffect(() => {
    setSlugPreview(formData.name ? genSlug(formData.name) : '');
  }, [formData.name]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await getProductById(id);
      if (res.data?.success && res.data?.data) {
        const p = res.data.data;
        setFormData({
          name: p.name||'', category: p.category||'', price: p.price?.toString()||'',
          unit: p.unit||'', countInStock: p.countInStock?.toString()||'0',
          isAvailable: p.isAvailable??true, description: p.description||'',
          nutritionalInfo: p.nutritionalInfo||'',
          tags: Array.isArray(p.tags) ? p.tags : [],
        });
        setImagePreview(p.image||'');
        setSlugPreview(p.slug||'');
      } else throw new Error();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load product');
      navigate('/admin-products');
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type==='checkbox'?checked:value }));
  };

  const handleTagToggle = (v) =>
    setFormData(p => ({
      ...p,
      tags: p.tags.includes(v) ? p.tags.filter(t=>t!==v) : [...p.tags, v],
    }));

  const processImage = (file) => {
    if (!file) return;
    const valid = ['image/jpeg','image/png','image/jpg','image/gif','image/webp'];
    if (!valid.includes(file.type)) { toast.error('Only JPEG, PNG, GIF, WebP allowed'); return; }
    if (file.size > 5*1024*1024)    { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImgError(false);
    toast.success('Image ready to upload');
  };

  const handleImageChange = (e) => processImage(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processImage(e.dataTransfer.files[0]); };

  const validate = () => {
    if (!formData.name.trim())                    { toast.error('Product name is required'); return false; }
    if (!formData.category)                       { toast.error('Please select a category'); return false; }
    if (!formData.price || parseFloat(formData.price)<=0) { toast.error('Enter a valid price'); return false; }
    if (!formData.unit)                           { toast.error('Please select a unit'); return false; }
    if (parseInt(formData.countInStock) < 0)      { toast.error('Stock cannot be negative'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('category', formData.category);
    fd.append('price', parseFloat(formData.price));
    fd.append('unit', formData.unit);
    fd.append('countInStock', parseInt(formData.countInStock));
    fd.append('isAvailable', formData.isAvailable);
    fd.append('description', formData.description||'');
    fd.append('nutritionalInfo', formData.nutritionalInfo||'');
    formData.tags.forEach(t => fd.append('tags[]', t));
    if (imageFile) fd.append('productImage', imageFile);

    setSaving(true);
    try {
      await updateProduct(id, fd);
      toast.success('Product updated successfully!');
      navigate(`/admin-product/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally { setSaving(false); }
  };

  const resetForm = () => {
    fetchProduct();
    setImageFile(null);
    setTagSearch('');
    setShowDrop(false);
    toast.info('Form reset to original values');
  };

  const filteredTags  = TAG_OPTIONS.filter(t =>
    t.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
    t.value.toLowerCase().includes(tagSearch.toLowerCase())
  );
  const generalTags  = filteredTags.filter(t=>t.category==='general');
  const groceryTags  = filteredTags.filter(t=>t.category==='grocery');

  const stock = parseInt(formData.countInStock)||0;
  const stockColor = stock===0?'#CF1322': stock<=10?'#D48806':'#389E0D';

  if (loading) return (
    <AdminLayout>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', minHeight:'60vh', gap:14, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
          borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }}/>
        <p style={{ fontSize:13, color:'#8C8C8C', margin:0 }}>Loading product…</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .pep-input:focus  { border-color:#1677FF !important; background:#fff !important; }
        .pep-input:hover  { border-color:#BFBFBF !important; }
        .pep-cancel:hover { background:#F5F5F5 !important; }
        .pep-submit:hover { filter:brightness(0.92); }
        .pep-drop-item:hover { background:#F5F9FF !important; }
        .pep-reset:hover  { background:#F5F5F5 !important; }

        @media (max-width:900px) {
          .pep-layout { grid-template-columns:1fr !important; }
          .pep-sidebar { order:-1 !important; }
        }
        @media (max-width:640px) {
          .pep-grid2  { grid-template-columns:1fr !important; }
          .pep-hdr    { flex-direction:column !important; align-items:flex-start !important; }
          .pep-actions-top { flex-wrap:wrap !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light"/>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* ── Sticky header ── */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="pep-hdr" style={{ maxWidth:1100, margin:'0 auto', padding:'12px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <Link to={`/admin-product/${id}`} style={{ display:'flex', alignItems:'center', gap:6,
                fontSize:11, fontWeight:600, color:'#8C8C8C', textDecoration:'none', marginBottom:3 }}>
                ← Back to Product
              </Link>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                  Edit Product
                </h1>
                {formData.name && (
                  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                    background:'#F0F7FF', color:'#1677FF', border:'1px solid #91CAFF',
                    maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {formData.name}
                  </span>
                )}
              </div>
            </div>
            <div className="pep-actions-top" style={{ display:'flex', gap:8 }}>
              <button type="button" onClick={resetForm} className="pep-reset" style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px',
                border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:12, fontWeight:600,
                color:'#595959', background:'#fff', cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                transition:'background 0.15s',
              }}>↺ Reset</button>
              <Link to={`/admin-product/${id}`} className="pep-cancel" style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px',
                border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:12, fontWeight:600,
                color:'#595959', background:'#fff', textDecoration:'none', transition:'background 0.15s',
              }}>Cancel</Link>
              <button type="submit" form="edit-product-form" disabled={saving} className="pep-submit" style={{
                display:'inline-flex', alignItems:'center', gap:7, padding:'9px 20px',
                background:'#1677FF', color:'#fff', border:'none', borderRadius:9,
                fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer',
                fontFamily:"'DM Sans',sans-serif", opacity:saving?0.7:1, transition:'filter 0.15s',
              }}>
                {saving
                  ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }}/> Saving…</>
                  : <><CheckCircleIcon style={{ width:15, height:15 }}/> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px 56px' }}>
          <form id="edit-product-form" onSubmit={handleSubmit}>
            <div className="pep-layout" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:18, alignItems:'start' }}>

              {/* ══ LEFT: main form ══════════════════════════════════════════ */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* Product Info */}
                <div style={{ animation:'fadeUp 0.4s ease both' }}>
                  <Section title="Product Information" icon={InformationCircleIcon} accent="#1677FF">
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {/* Name */}
                      <div>
                        <Label required>Product Name</Label>
                        <input name="name" value={formData.name} onChange={handleChange}
                          placeholder="e.g. Fresh Tomatoes" className="pep-input" style={fieldBase()}/>
                        {slugPreview && (
                          <p style={{ margin:'5px 0 0', fontSize:11, color:'#8C8C8C' }}>
                            Slug: <span style={{ fontWeight:700, color:'#595959', fontFamily:'monospace' }}>/{slugPreview}</span>
                          </p>
                        )}
                      </div>

                      {/* Category + Unit */}
                      <div className="pep-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        <div>
                          <Label required>Category</Label>
                          <SelectBox name="category" value={formData.category} onChange={handleChange}>
                            <option value="">Choose category…</option>
                            {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                          </SelectBox>
                        </div>
                        <div>
                          <Label required>Unit</Label>
                          <SelectBox name="unit" value={formData.unit} onChange={handleChange}>
                            <option value="">Choose unit…</option>
                            {UNITS.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                          </SelectBox>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <Label>Description</Label>
                        <textarea name="description" value={formData.description} onChange={handleChange}
                          rows={3} placeholder="Quality, origin, usage tips…"
                          className="pep-input" style={{ ...fieldBase(), resize:'none', lineHeight:1.6 }}/>
                      </div>

                      {/* Nutritional Info */}
                      <div>
                        <Label>Nutritional Information</Label>
                        <textarea name="nutritionalInfo" value={formData.nutritionalInfo} onChange={handleChange}
                          rows={2} placeholder="e.g. Rich in Vitamin C, fibre…"
                          className="pep-input" style={{ ...fieldBase(), resize:'none', lineHeight:1.6 }}/>
                      </div>
                    </div>
                  </Section>
                </div>

                {/* Tags */}
                <div style={{ animation:'fadeUp 0.4s ease 60ms both' }}>
                  <Section title="Product Tags" icon={TagIcon} accent="#7C3AED">
                    {/* Selected pills */}
                    {formData.tags.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                        {formData.tags.map((v,i)=>{
                          const t = TAG_OPTIONS.find(x=>x.value===v);
                          if (!t) return null;
                          const c = TAG_COLORS[i % TAG_COLORS.length];
                          return (
                            <span key={v} style={{ display:'inline-flex', alignItems:'center', gap:5,
                              padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:700,
                              background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>
                              {t.label}
                              <button type="button" onClick={()=>handleTagToggle(v)} style={{
                                display:'flex', alignItems:'center', background:'none', border:'none',
                                cursor:'pointer', color:c.color, padding:0 }}>
                                <XMarkIcon style={{ width:12, height:12 }}/>
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Tag search */}
                    <div style={{ position:'relative' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px',
                        border:'1.5px solid #E8E8E8', borderRadius:9, background:'#FAFAFA',
                        cursor:'pointer' }} onClick={()=>setShowDrop(true)}>
                        <TagIcon style={{ width:13, height:13, color:'#BFBFBF' }}/>
                        <input value={tagSearch} onChange={e=>setTagSearch(e.target.value)}
                          onFocus={()=>setShowDrop(true)}
                          onBlur={()=>setTimeout(()=>setShowDrop(false),200)}
                          placeholder={formData.tags.length===0?'Search or add tags…':'Add more tags…'}
                          style={{ border:'none', outline:'none', background:'transparent', fontSize:13,
                            fontFamily:"'DM Sans',sans-serif", color:'#262626', flex:1, minWidth:0 }}/>
                        <ChevronDownIcon style={{ width:13, height:13, color:'#BFBFBF' }}/>
                      </div>

                      {showDrop && (
                        <div style={{ position:'absolute', zIndex:200, top:'calc(100% + 6px)', left:0, right:0,
                          background:'#fff', borderRadius:10, border:'1px solid #F0F0F0',
                          boxShadow:'0 8px 32px rgba(0,0,0,0.12)', overflow:'hidden', animation:'fadeIn 0.15s ease' }}>
                          {filteredTags.length===0 ? (
                            <p style={{ margin:0, padding:'14px 16px', fontSize:13, color:'#BFBFBF', textAlign:'center' }}>No matching tags</p>
                          ) : (
                            [['General', generalTags],['Grocery-specific', groceryTags]].map(([group, tags])=>
                              tags.length>0 && (
                                <div key={group}>
                                  <p style={{ margin:0, padding:'10px 16px 6px', fontSize:10, fontWeight:800,
                                    color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.07em' }}>{group}</p>
                                  {tags.map(tag=>{
                                    const sel = formData.tags.includes(tag.value);
                                    return (
                                      <button key={tag.value} type="button"
                                        onMouseDown={e=>{ e.preventDefault(); handleTagToggle(tag.value); }}
                                        className="pep-drop-item" style={{
                                          display:'flex', alignItems:'center', gap:10, width:'100%',
                                          padding:'10px 16px', background:sel?'#F0F7FF':'#fff',
                                          border:'none', cursor:'pointer', textAlign:'left',
                                          fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                                        }}>
                                        <div style={{ width:17, height:17, borderRadius:5, flexShrink:0,
                                          border:`2px solid ${sel?'#1677FF':'#D9D9D9'}`,
                                          background:sel?'#1677FF':'#fff',
                                          display:'flex', alignItems:'center', justifyContent:'center' }}>
                                          {sel && <CheckCircleIcon style={{ width:11, height:11, color:'#fff' }}/>}
                                        </div>
                                        <span style={{ fontSize:13, fontWeight:sel?700:500, color:sel?'#1677FF':'#262626' }}>{tag.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )
                            )
                          )}
                        </div>
                      )}
                    </div>
                    {formData.tags.length>0 && (
                      <p style={{ margin:'8px 0 0', fontSize:11, color:'#8C8C8C' }}>
                        {formData.tags.length} tag{formData.tags.length!==1?'s':''} selected
                      </p>
                    )}
                  </Section>
                </div>

                {/* Pricing & Inventory */}
                <div style={{ animation:'fadeUp 0.4s ease 120ms both' }}>
                  <Section title="Pricing & Inventory" icon={CurrencyDollarIcon} accent="#10B981">
                    <div className="pep-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
                      {/* Price */}
                      <div>
                        <Label required>Price (₵)</Label>
                        <div style={{ position:'relative' }}>
                          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                            fontSize:13, color:'#8C8C8C', fontWeight:700 }}>₵</span>
                          <input type="number" step="0.01" min="0" name="price" value={formData.price}
                            onChange={handleChange} placeholder="0.00"
                            className="pep-input" style={{ ...fieldBase(), paddingLeft:26 }}/>
                        </div>
                      </div>
                      {/* Stock */}
                      <div>
                        <Label>Stock Quantity</Label>
                        <input type="number" min="0" name="countInStock" value={formData.countInStock}
                          onChange={handleChange} placeholder="0"
                          className="pep-input" style={fieldBase()}/>
                        {stock===0 && (
                          <p style={{ margin:'5px 0 0', fontSize:11, color:'#CF1322', display:'flex', alignItems:'center', gap:4 }}>
                            <ExclamationTriangleIcon style={{ width:11, height:11 }}/> Out of stock
                          </p>
                        )}
                        {stock>0 && stock<=10 && (
                          <p style={{ margin:'5px 0 0', fontSize:11, color:'#D48806', display:'flex', alignItems:'center', gap:4 }}>
                            <ExclamationTriangleIcon style={{ width:11, height:11 }}/> Low stock — {stock} left
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Availability toggle */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12,
                      padding:'12px 14px', borderRadius:10,
                      border:`1.5px solid ${formData.isAvailable?'#B7EB8F':'#E8E8E8'}`,
                      background:formData.isAvailable?'#F6FFED':'#FAFAFA', transition:'all 0.2s' }}>
                      <div>
                        <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:700,
                          color:formData.isAvailable?'#389E0D':'#8C8C8C' }}>
                          {formData.isAvailable?'Available for sale':'Hidden from store'}
                        </p>
                        <p style={{ margin:0, fontSize:11, color:'#8C8C8C' }}>
                          {formData.isAvailable?'Customers can see and order this product':'Product is not visible to customers'}
                        </p>
                      </div>
                      <div onClick={()=>setFormData(p=>({...p,isAvailable:!p.isAvailable}))} style={{
                        width:42, height:24, borderRadius:12, cursor:'pointer',
                        background:formData.isAvailable?'#52C41A':'#D9D9D9', position:'relative', flexShrink:0,
                        transition:'background 0.2s',
                      }}>
                        <div style={{ position:'absolute', top:3, left:formData.isAvailable?20:3,
                          width:18, height:18, borderRadius:'50%', background:'#fff',
                          transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                      </div>
                    </div>
                  </Section>
                </div>
              </div>

              {/* ══ RIGHT: sidebar ═══════════════════════════════════════════ */}
              <div className="pep-sidebar" style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* Image */}
                <div style={{ animation:'fadeUp 0.4s ease 80ms both' }}>
                  <Section title="Product Image" icon={CameraIcon} accent="#FF4D4F">
                    {/* Current / new image */}
                    <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid #F0F0F0',
                      marginBottom:14, background:'#F5F5F5', aspectRatio:'1/1', position:'relative' }}>
                      {imagePreview && !imgError ? (
                        <img src={imagePreview} alt="Product" onError={()=>setImgError(true)}
                          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                      ) : (
                        <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
                          alignItems:'center', justifyContent:'center', gap:8 }}>
                          <CameraIcon style={{ width:32, height:32, color:'#BFBFBF' }}/>
                          <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>No image</p>
                        </div>
                      )}
                      {imageFile && (
                        <div style={{ position:'absolute', top:8, right:8, padding:'3px 8px',
                          background:'#52C41A', color:'#fff', borderRadius:20, fontSize:10, fontWeight:800 }}>
                          NEW
                        </div>
                      )}
                    </div>

                    {/* Drop zone */}
                    <div onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
                      onDragLeave={()=>setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={()=>fileRef.current?.click()}
                      style={{ border:`2px dashed ${dragOver?'#1677FF':'#E8E8E8'}`, borderRadius:10,
                        padding:'20px 16px', textAlign:'center', cursor:'pointer',
                        background:dragOver?'#F0F7FF':'#FAFAFA', transition:'all 0.2s', marginBottom: imageFile?12:0 }}>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display:'none' }}/>
                      <ArrowUpTrayIcon style={{ width:22, height:22, color:dragOver?'#1677FF':'#BFBFBF', margin:'0 auto 8px' }}/>
                      <p style={{ margin:'0 0 2px', fontSize:12, fontWeight:700, color:dragOver?'#1677FF':'#262626' }}>
                        {dragOver?'Drop to upload':'Upload New Image'}
                      </p>
                      <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>JPEG, PNG, WebP · max 5MB</p>
                    </div>

                    {imageFile && (
                      <div style={{ padding:'10px 12px', background:'#F6FFED', borderRadius:9,
                        border:'1px solid #B7EB8F', display:'flex', alignItems:'center', gap:8 }}>
                        <CheckCircleIcon style={{ width:14, height:14, color:'#52C41A', flexShrink:0 }}/>
                        <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#389E0D',
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {imageFile.name}
                        </p>
                      </div>
                    )}
                  </Section>
                </div>

                {/* Live preview */}
                <div style={{ animation:'fadeUp 0.4s ease 140ms both' }}>
                  <Section title="Live Preview" icon={InformationCircleIcon} accent="#F59E0B">
                    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                      <PreviewRow label="Name"     value={formData.name}/>
                      <PreviewRow label="Category" value={CATEGORIES.find(c=>c.value===formData.category)?.label}/>
                      <PreviewRow label="Price"    value={formData.price?`₵${parseFloat(formData.price).toFixed(2)}`:null}/>
                      <PreviewRow label="Stock"    value={`${formData.countInStock} units`}
                        valueStyle={{ color: stockColor }}/>
                      <PreviewRow label="Tags"     value={formData.tags.length?`${formData.tags.length} selected`:null}/>
                      <PreviewRow label="Status"   value={formData.isAvailable?'Available':'Hidden'}
                        valueStyle={{ color: formData.isAvailable?'#389E0D':'#CF1322' }}/>
                    </div>

                    {formData.tags.length>0 && (
                      <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #F5F5F5' }}>
                        <p style={{ margin:'0 0 8px', fontSize:10, fontWeight:700, color:'#BFBFBF',
                          textTransform:'uppercase', letterSpacing:'0.06em' }}>Selected Tags</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {formData.tags.map((v,i)=>{
                            const t = TAG_OPTIONS.find(x=>x.value===v);
                            const c = TAG_COLORS[i%TAG_COLORS.length];
                            return t ? (
                              <span key={v} style={{ padding:'2px 9px', borderRadius:20, fontSize:11,
                                fontWeight:700, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>
                                {t.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </Section>
                </div>

                {/* Dark action card */}
                <div style={{ borderRadius:14, overflow:'hidden',
                  background:'linear-gradient(145deg,#0F172A 0%,#1E3A5F 100%)',
                  padding:'18px', display:'flex', flexDirection:'column', gap:10,
                  animation:'fadeUp 0.4s ease 200ms both' }}>
                  <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.7)' }}>Quick Actions</p>
                  <button type="submit" form="edit-product-form" disabled={saving} style={{
                    display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                    padding:'11px 0', borderRadius:9, border:'none', width:'100%',
                    background:'#1677FF', color:'#fff', fontSize:13, fontWeight:700,
                    cursor:saving?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", opacity:saving?0.7:1,
                  }}>
                    {saving
                      ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }}/> Saving…</>
                      : <><CheckCircleIcon style={{ width:15, height:15 }}/> Save Changes</>
                    }
                  </button>
                  <button type="button" onClick={resetForm} style={{
                    display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                    padding:'10px 0', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.12)',
                    width:'100%', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)',
                    fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                  }}>
                    ↺ Reset to Original
                  </button>
                  <Link to={`/admin-product/${id}`} style={{
                    display:'flex', alignItems:'center', justifyContent:'center', padding:'10px 0',
                    borderRadius:9, border:'1.5px solid rgba(255,255,255,0.08)',
                    background:'transparent', color:'rgba(255,255,255,0.4)',
                    fontSize:12, fontWeight:600, textDecoration:'none', fontFamily:"'DM Sans',sans-serif",
                  }}>
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductEditPage;