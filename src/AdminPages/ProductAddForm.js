// ProductAddForm.jsx
import React, { useState, useRef } from 'react';
import {
  Camera, Upload, X, AlertCircle, CheckCircle,
  Loader2, Tag, Package, DollarSign, Layers,
  Info, ChevronDown,
} from 'lucide-react';
import { createProduct } from '../Apis/productApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value:'vegetable',   label:'Vegetable'    },
  { value:'fruit',       label:'Fruit'        },
  { value:'staple',      label:'Staple'       },
  { value:'herb',        label:'Herb'         },
  { value:'tuber',       label:'Tuber'        },
  { value:'grain',       label:'Grain'        },
  { value:'cereal',      label:'Cereal'       },
  { value:'meat',        label:'Meat'         },
  { value:'frozen-food', label:'Frozen Food'  },
  { value:'poultry',     label:'Poultry'      },
  { value:'seafood',     label:'Seafood'      },
  { value:'spice',       label:'Spice'        },
  { value:'other',       label:'Other'        },
];

const UNITS = [
  { value:'kg',      label:'Kilogram (kg)'      },
  { value:'g',       label:'Gram (g)'           },
  { value:'piece',   label:'Piece'              },
  { value:'pieces',  label:'Pieces'             },
  { value:'bunch',   label:'Bunch'              },
  { value:'bag',     label:'Bag'                },
  { value:'pack',    label:'Pack'               },
  { value:'basket',  label:'Basket'             },
  { value:'olonka',  label:'Olonka'             },
  { value:'liter',   label:'Liter'              },
  { value:'ml',      label:'Milliliter (ml)'    },
  { value:'box',     label:'Box'                },
  { value:'tin',     label:'Tin'                },
  { value:'jar',     label:'Jar'                },
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

const INIT = {
  name:'', slug:'', category:'', image:'', price:'', unit:'',
  countInStock:'0', isAvailable:true, description:'', brand:'',
  weight:'', dimensions:'', tags:[],
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const genSlug = (n) =>
  n.toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/--+/g,'-').trim();

// ─── Field primitives ─────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:700, color:'#595959',
    textTransform:'uppercase', letterSpacing:'0.05em' }}>
    {children} {required && <span style={{ color:'#FF4D4F' }}>*</span>}
  </p>
);

const fieldBase = (err, disabled) => ({
  width:'100%', padding:'10px 14px', fontSize:13, fontFamily:"'DM Sans',sans-serif",
  border:`1.5px solid ${err?'#FFA39E':'#E8E8E8'}`, borderRadius:9, outline:'none',
  background: disabled ? '#F5F5F5' : '#FAFAFA', color:'#262626',
  transition:'border-color 0.15s',
});

const ErrMsg = ({ msg }) => msg ? (
  <p style={{ margin:'4px 0 0', fontSize:11, color:'#FF4D4F', display:'flex', alignItems:'center', gap:4 }}>
    <AlertCircle size={11}/> {msg}
  </p>
) : null;

// Section card
const Section = ({ title, icon: Icon, children, accent = '#1677FF' }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
    overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px',
      borderBottom:'1px solid #F5F5F5', background:'#FAFAFA' }}>
      <div style={{ width:30, height:30, borderRadius:8, background:accent+'18',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={15} color={accent}/>
      </div>
      <span style={{ fontSize:14, fontWeight:700, color:'#141414' }}>{title}</span>
    </div>
    <div style={{ padding:'20px' }}>{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductAddForm = () => {
  const [formData, setFormData]       = useState(INIT);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');
  const [errorMsg, setErrorMsg]       = useState('');
  const [tagSearch, setTagSearch]     = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const fileInputRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.name.trim())                    e.name         = 'Product name is required';
    if (!formData.slug.trim())                    e.slug         = 'Slug is required';
    if (!formData.category)                       e.category     = 'Category is required';
    if (!imageFile && !formData.image)            e.image        = 'Product image is required';
    if (!formData.price || Number(formData.price) <= 0) e.price  = 'Valid price is required';
    if (!formData.unit)                           e.unit         = 'Unit is required';
    if (Number(formData.countInStock) < 0)        e.countInStock = 'Stock cannot be negative';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(p => ({ ...p, [name]: val, ...(name==='name'?{slug:genSlug(value)}:{}) }));
    if (errors[name]) setErrors(p => ({ ...p, [name]:'' }));
  };

  const handleTagToggle = (v) =>
    setFormData(p => ({
      ...p,
      tags: p.tags.includes(v) ? p.tags.filter(t=>t!==v) : [...p.tags, v],
    }));

  const processImage = (file) => {
    if (!file) return;
    const valid = ['image/jpeg','image/png','image/jpg','image/gif','image/webp'];
    if (!valid.includes(file.type)) { setErrors(p=>({...p,image:'Only JPEG, PNG, GIF, WebP allowed'})); return; }
    if (file.size > 5*1024*1024)    { setErrors(p=>({...p,image:'Image must be less than 5MB'})); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData(p=>({...p,image:file.name}));
    setErrors(p=>({...p,image:''}));
  };

  const handleImageChange = (e) => processImage(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processImage(e.dataTransfer.files[0]); };

  const removeImage = () => {
    setImageFile(null); setImagePreview('');
    setFormData(p=>({...p,image:''}));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.keys(formData).forEach(k => {
      if (k === 'tags') formData.tags.forEach(t => fd.append('tags[]', t));
      else fd.append(k, k==='price'||k==='countInStock' ? Number(formData[k]) : formData[k]);
    });
    if (imageFile) fd.append('productImage', imageFile);

    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await createProduct(fd);
      setSuccessMsg('Product added successfully!');
      resetForm();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add product. Please try again.');
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData(INIT); setImageFile(null); setImagePreview('');
    setErrors({}); setTagSearch(''); setShowDropdown(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredTags = TAG_OPTIONS.filter(t =>
    t.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
    t.value.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const generalTags  = filteredTags.filter(t=>t.category==='general');
  const groceryTags  = filteredTags.filter(t=>t.category==='grocery');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="Add New Product">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .paf-input:focus  { border-color:#1677FF !important; background:#fff !important; }
        .paf-input:hover  { border-color:#BFBFBF !important; }
        .paf-reset:hover  { background:#F5F5F5 !important; }
        .paf-submit:hover { filter:brightness(0.92); }
        .paf-tag:hover    { background:#E6F4FF !important; }
        .paf-drop-item:hover { background:#F5F9FF !important; }
        .paf-tip:hover    { background:#F0F7FF !important; }
        @media (max-width:640px) {
          .paf-grid2 { grid-template-columns:1fr !important; }
          .paf-grid3 { grid-template-columns:1fr !important; }
          .paf-actions { flex-direction:column !important; }
          .paf-actions>button { width:100% !important; justify-content:center !important; }
          .paf-tag-grid { grid-template-columns:repeat(2,1fr) !important; }
          .paf-avail-row { flex-direction:column !important; gap:10px !important; }
        }
      `}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* ── Sticky header ── */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ maxWidth:960, margin:'0 auto', padding:'14px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>Add New Product</h1>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#BFBFBF' }}>Fill in the details to add a product to your store</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="button" onClick={resetForm} disabled={loading}
                className="paf-reset" style={{
                  padding:'9px 16px', border:'1.5px solid #E8E8E8', borderRadius:9,
                  fontSize:13, fontWeight:600, color:'#595959', background:'#fff',
                  cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'background 0.15s',
                }}>Reset</button>
              <button type="submit" form="product-form" disabled={loading}
                className="paf-submit" style={{
                  display:'inline-flex', alignItems:'center', gap:7, padding:'9px 20px',
                  background:'#1677FF', color:'#fff', border:'none', borderRadius:9,
                  fontSize:13, fontWeight:700, cursor:loading?'not-allowed':'pointer',
                  fontFamily:"'DM Sans',sans-serif", opacity:loading?0.7:1, transition:'filter 0.15s',
                }}>
                {loading
                  ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }}/> Saving…</>
                  : <><CheckCircle size={15}/> Add Product</>
                }
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:960, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* ── Alerts ── */}
          {successMsg && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px',
              background:'#F6FFED', border:'1px solid #B7EB8F', borderRadius:10, marginBottom:18, animation:'fadeIn 0.2s ease' }}>
              <CheckCircle size={16} color="#52C41A"/><span style={{ fontSize:13, fontWeight:600, color:'#389E0D' }}>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px',
              background:'#FFF1F0', border:'1px solid #FFA39E', borderRadius:10, marginBottom:18, animation:'fadeIn 0.2s ease' }}>
              <AlertCircle size={16} color="#FF4D4F"/><span style={{ fontSize:13, fontWeight:600, color:'#CF1322' }}>{errorMsg}</span>
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* ── 1. Basic Information ── */}
              <div style={{ animation:'fadeUp 0.4s ease both' }}>
                <Section title="Basic Information" icon={Package} accent="#1677FF">
                  <div className="paf-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {/* Name */}
                    <div>
                      <Label required>Product Name</Label>
                      <input name="name" value={formData.name} onChange={handleChange}
                        placeholder="e.g. Organic Tomatoes" disabled={loading}
                        className="paf-input" style={fieldBase(errors.name, loading)} />
                      <ErrMsg msg={errors.name}/>
                    </div>
                    {/* Slug */}
                    <div>
                      <Label required>Slug</Label>
                      <input name="slug" value={formData.slug} onChange={handleChange}
                        placeholder="auto-generated-slug" disabled={loading}
                        className="paf-input" style={fieldBase(errors.slug, loading)} />
                      <ErrMsg msg={errors.slug}/>
                    </div>
                    {/* Category */}
                    <div>
                      <Label required>Category</Label>
                      <div style={{ position:'relative' }}>
                        <select name="category" value={formData.category} onChange={handleChange} disabled={loading}
                          className="paf-input" style={{ ...fieldBase(errors.category, loading), appearance:'none', paddingRight:34 }}>
                          <option value="">Select category…</option>
                          {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <ChevronDown size={14} color="#8C8C8C" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                      </div>
                      <ErrMsg msg={errors.category}/>
                    </div>
                    {/* Unit */}
                    <div>
                      <Label required>Unit</Label>
                      <div style={{ position:'relative' }}>
                        <select name="unit" value={formData.unit} onChange={handleChange} disabled={loading}
                          className="paf-input" style={{ ...fieldBase(errors.unit, loading), appearance:'none', paddingRight:34 }}>
                          <option value="">Select unit…</option>
                          {UNITS.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                        <ChevronDown size={14} color="#8C8C8C" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                      </div>
                      <ErrMsg msg={errors.unit}/>
                    </div>
                    {/* Brand */}
                    <div>
                      <Label>Brand</Label>
                      <input name="brand" value={formData.brand} onChange={handleChange}
                        placeholder="Optional brand name" disabled={loading}
                        className="paf-input" style={fieldBase('', loading)} />
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── 2. Pricing & Inventory ── */}
              <div style={{ animation:'fadeUp 0.4s ease 60ms both' }}>
                <Section title="Pricing & Inventory" icon={DollarSign} accent="#10B981">
                  <div className="paf-avail-row" style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                    {/* Price */}
                    <div style={{ flex:'1 1 140px', minWidth:0 }}>
                      <Label required>Price (₵)</Label>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#8C8C8C', fontWeight:700 }}>₵</span>
                        <input name="price" type="number" value={formData.price} onChange={handleChange}
                          placeholder="0.00" min="0" step="0.01" disabled={loading}
                          className="paf-input" style={{ ...fieldBase(errors.price, loading), paddingLeft:28 }} />
                      </div>
                      <ErrMsg msg={errors.price}/>
                    </div>
                    {/* Stock */}
                    <div style={{ flex:'1 1 140px', minWidth:0 }}>
                      <Label>Stock Quantity</Label>
                      <input name="countInStock" type="number" value={formData.countInStock} onChange={handleChange}
                        placeholder="0" min="0" disabled={loading}
                        className="paf-input" style={fieldBase(errors.countInStock, loading)} />
                      <ErrMsg msg={errors.countInStock}/>
                    </div>
                    {/* Availability toggle */}
                    <div style={{ flex:'1 1 200px', minWidth:0 }}>
                      <Label>Availability</Label>
                      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                        border:`1.5px solid ${formData.isAvailable?'#B7EB8F':'#E8E8E8'}`,
                        borderRadius:9, background:formData.isAvailable?'#F6FFED':'#FAFAFA',
                        transition:'all 0.2s', cursor:'pointer' }}
                        onClick={()=>!loading && setFormData(p=>({...p,isAvailable:!p.isAvailable}))}>
                        {/* Toggle pill */}
                        <div style={{ width:38, height:22, borderRadius:11, transition:'background 0.2s',
                          background:formData.isAvailable?'#52C41A':'#D9D9D9', position:'relative', flexShrink:0 }}>
                          <div style={{ position:'absolute', top:3, left:formData.isAvailable?18:3,
                            width:16, height:16, borderRadius:'50%', background:'#fff',
                            transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:formData.isAvailable?'#389E0D':'#8C8C8C' }}>
                          {formData.isAvailable ? 'Available for sale' : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── 3. Tags ── */}
              <div style={{ animation:'fadeUp 0.4s ease 120ms both' }}>
                <Section title="Product Tags" icon={Tag} accent="#7C3AED">
                  {/* Selected pills */}
                  {formData.tags.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:14 }}>
                      {formData.tags.map(v=>{
                        const t = TAG_OPTIONS.find(x=>x.value===v);
                        if (!t) return null;
                        return (
                          <span key={v} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px',
                            borderRadius:20, background:'#F0F7FF', border:'1px solid #91CAFF',
                            fontSize:12, fontWeight:600, color:'#1677FF' }}>
                            {t.label}
                            <button type="button" onClick={()=>handleTagToggle(v)} style={{
                              display:'flex', alignItems:'center', background:'none', border:'none',
                              cursor:'pointer', color:'#1677FF', padding:0, lineHeight:1 }}>
                              <X size={12}/>
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Tag search + dropdown */}
                  <div style={{ position:'relative' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px',
                      border:'1.5px solid #E8E8E8', borderRadius:9, background:'#FAFAFA',
                      transition:'border-color 0.15s' }}
                      onClick={()=>setShowDropdown(true)}>
                      <Tag size={14} color="#BFBFBF"/>
                      <input value={tagSearch} onChange={e=>setTagSearch(e.target.value)}
                        onFocus={()=>setShowDropdown(true)}
                        onBlur={()=>setTimeout(()=>setShowDropdown(false),200)}
                        placeholder={formData.tags.length===0 ? "Search or pick tags…" : "Add more tags…"}
                        style={{ border:'none', outline:'none', background:'transparent', fontSize:13,
                          fontFamily:"'DM Sans',sans-serif", color:'#262626', flex:1, minWidth:0 }}
                        disabled={loading}/>
                      <ChevronDown size={14} color="#BFBFBF"/>
                    </div>

                    {showDropdown && (
                      <div style={{ position:'absolute', zIndex:200, top:'calc(100% + 6px)', left:0, right:0,
                        background:'#fff', borderRadius:10, border:'1px solid #F0F0F0',
                        boxShadow:'0 8px 32px rgba(0,0,0,0.12)', overflow:'hidden', animation:'fadeIn 0.15s ease' }}>
                        {filteredTags.length === 0 ? (
                          <p style={{ margin:0, padding:'14px 16px', fontSize:13, color:'#BFBFBF', textAlign:'center' }}>No matching tags</p>
                        ) : (
                          <>
                            {[['General', generalTags], ['Grocery-specific', groceryTags]].map(([groupLabel, group])=>
                              group.length > 0 && (
                                <div key={groupLabel}>
                                  <p style={{ margin:0, padding:'10px 16px 6px', fontSize:10, fontWeight:800,
                                    color:'#BFBFBF', textTransform:'uppercase', letterSpacing:'0.07em' }}>{groupLabel}</p>
                                  {group.map(tag=>{
                                    const sel = formData.tags.includes(tag.value);
                                    return (
                                      <button key={tag.value} type="button" onClick={()=>handleTagToggle(tag.value)}
                                        className="paf-drop-item" style={{
                                          display:'flex', alignItems:'center', gap:12, width:'100%',
                                          padding:'10px 16px', background:sel?'#F0F7FF':'#fff',
                                          border:'none', cursor:'pointer', textAlign:'left',
                                          fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s',
                                        }}>
                                        <div style={{ width:17, height:17, borderRadius:5, flexShrink:0,
                                          border:`2px solid ${sel?'#1677FF':'#D9D9D9'}`,
                                          background:sel?'#1677FF':'#fff',
                                          display:'flex', alignItems:'center', justifyContent:'center' }}>
                                          {sel && <CheckCircle size={11} color="#fff"/>}
                                        </div>
                                        <span style={{ fontSize:13, fontWeight:sel?700:500, color:sel?'#1677FF':'#262626' }}>{tag.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.tags.length > 0 && (
                    <p style={{ margin:'8px 0 0', fontSize:11, color:'#8C8C8C' }}>
                      {formData.tags.length} tag{formData.tags.length!==1?'s':''} selected
                    </p>
                  )}
                </Section>
              </div>

              {/* ── 4. Description & Details ── */}
              <div style={{ animation:'fadeUp 0.4s ease 180ms both' }}>
                <Section title="Description & Details" icon={Info} accent="#F59E0B">
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {/* Description */}
                    <div>
                      <Label>Description</Label>
                      <textarea name="description" value={formData.description} onChange={handleChange}
                        placeholder="Describe your product — freshness, origin, usage tips…"
                        rows={4} disabled={loading}
                        className="paf-input" style={{ ...fieldBase('', loading), resize:'none', lineHeight:1.6 }}/>
                    </div>
                    <div className="paf-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <div>
                        <Label>Weight</Label>
                        <input name="weight" value={formData.weight} onChange={handleChange}
                          placeholder="e.g. 500g, 1kg" disabled={loading}
                          className="paf-input" style={fieldBase('', loading)}/>
                      </div>
                      <div>
                        <Label>Dimensions</Label>
                        <input name="dimensions" value={formData.dimensions} onChange={handleChange}
                          placeholder="e.g. 10×10×10 cm" disabled={loading}
                          className="paf-input" style={fieldBase('', loading)}/>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── 5. Image Upload ── */}
              <div style={{ animation:'fadeUp 0.4s ease 240ms both' }}>
                <Section title="Product Image" icon={Camera} accent="#FF4D4F">
                  {!imagePreview ? (
                    <div
                      onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
                      onDragLeave={()=>setDragOver(false)}
                      onDrop={handleDrop}
                      style={{ border:`2px dashed ${dragOver?'#1677FF':errors.image?'#FFA39E':'#E8E8E8'}`,
                        borderRadius:12, padding:'40px 24px', textAlign:'center', cursor:'pointer',
                        background:dragOver?'#F0F7FF':errors.image?'#FFF5F5':'#FAFAFA',
                        transition:'all 0.2s' }}
                      onClick={()=>fileInputRef.current?.click()}>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange}
                        style={{ display:'none' }} id="img-upload"/>
                      <div style={{ width:52, height:52, borderRadius:'50%', background:dragOver?'#E6F4FF':'#F0F0F0',
                        display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                        <Camera size={22} color={dragOver?'#1677FF':'#8C8C8C'}/>
                      </div>
                      <p style={{ margin:'0 0 4px', fontSize:14, fontWeight:700, color:'#262626' }}>
                        {dragOver ? 'Drop to upload' : 'Upload Product Image'}
                      </p>
                      <p style={{ margin:'0 0 4px', fontSize:12, color:'#8C8C8C' }}>Click to browse or drag & drop</p>
                      <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>PNG, JPG, GIF, WebP · max 5MB</p>
                      {errors.image && <p style={{ margin:'10px 0 0', fontSize:12, color:'#FF4D4F', fontWeight:600 }}>{errors.image}</p>}
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'flex-start', gap:16, padding:'16px',
                      background:'#FAFAFA', borderRadius:12, border:'1px solid #F0F0F0', flexWrap:'wrap' }}>
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <img src={imagePreview} alt="Preview" style={{ width:100, height:100, borderRadius:10,
                          objectFit:'cover', border:'1px solid #F0F0F0', display:'block' }}/>
                        <button type="button" onClick={removeImage} style={{
                          position:'absolute', top:-8, right:-8, width:24, height:24, borderRadius:'50%',
                          background:'#FF4D4F', color:'#fff', border:'2px solid #fff',
                          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          <X size={12}/>
                        </button>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:700, color:'#141414',
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{imageFile?.name}</p>
                        <p style={{ margin:'0 0 12px', fontSize:12, color:'#8C8C8C' }}>
                          {(imageFile?.size/1024/1024).toFixed(2)} MB
                        </p>
                        <button type="button" onClick={()=>fileInputRef.current?.click()} style={{
                          display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px',
                          border:'1.5px solid #E8E8E8', borderRadius:8, background:'#fff',
                          fontSize:12, fontWeight:600, color:'#595959', cursor:'pointer',
                          fontFamily:"'DM Sans',sans-serif" }}>
                          <Upload size={13}/> Change Image
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display:'none' }}/>
                      </div>
                    </div>
                  )}
                </Section>
              </div>

              {/* ── Submit row ── */}
              <div className="paf-actions" style={{ display:'flex', justifyContent:'flex-end', gap:10,
                animation:'fadeUp 0.4s ease 300ms both' }}>
                <button type="button" onClick={resetForm} disabled={loading}
                  className="paf-reset" style={{
                    padding:'11px 24px', border:'1.5px solid #E8E8E8', borderRadius:9,
                    fontSize:14, fontWeight:600, color:'#595959', background:'#fff',
                    cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'background 0.15s',
                  }}>Reset Form</button>
                <button type="submit" disabled={loading}
                  className="paf-submit" style={{
                    display:'inline-flex', alignItems:'center', gap:8, padding:'11px 28px',
                    background:'#1677FF', color:'#fff', border:'none', borderRadius:9,
                    fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer',
                    fontFamily:"'DM Sans',sans-serif", opacity:loading?0.7:1, transition:'filter 0.15s',
                  }}>
                  {loading
                    ? <><div style={{ width:16, height:16, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }}/> Saving…</>
                    : <><CheckCircle size={16}/> Add Product</>
                  }
                </button>
              </div>

              {/* ── Tips card ── */}
              <div style={{ borderRadius:12, border:'1px solid #E6F4FF', background:'#F0F7FF',
                padding:'16px 20px', animation:'fadeUp 0.4s ease 340ms both' }}>
                <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:700, color:'#1677FF', display:'flex', alignItems:'center', gap:6 }}>
                  <Info size={14}/> Tips for better product listings
                </p>
                <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:7 }}>
                  {[
                    'Use high-quality images with good, even lighting',
                    'Write detailed descriptions: freshness, origin, serving suggestions',
                    'Add relevant tags to improve product discoverability',
                    'Keep stock quantities updated regularly',
                    'Use consistent units across similar products',
                  ].map((tip,i)=>(
                    <li key={i} className="paf-tip" style={{ display:'flex', alignItems:'flex-start', gap:8,
                      fontSize:12, color:'#1677FF', padding:'6px 8px', borderRadius:7, transition:'background 0.12s' }}>
                      <span style={{ color:'#1677FF', fontWeight:800, flexShrink:0 }}>·</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductAddForm;