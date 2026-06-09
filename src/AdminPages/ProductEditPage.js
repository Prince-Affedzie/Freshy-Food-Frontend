// ProductEditPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PencilIcon, CameraIcon, XMarkIcon, CheckCircleIcon,
  ExclamationTriangleIcon, CurrencyDollarIcon, TagIcon,
  InformationCircleIcon, ArrowUpTrayIcon, ChevronDownIcon,
  MapPinIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProductById, updateProduct } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value:'electronics', label:'Electronics' },
  { value:'phones and tablets', label:'Phones & Tablets' },
  { value:'computers and laptops', label:'Computers & Laptops' },
  { value:'gaming', label:'Gaming' },
  { value:'fashion', label:'Fashion' },
  { value:'books-course-materials', label:'Books & Course Materials' },
  { value:'hostel-items', label:'Hostel Items' },
  { value:'appliances', label:'Appliances' },
  { value:'furniture', label:'Furniture' },
  { value:'beauty and grooming', label:'Beauty & Grooming' },
  { value:'sports and fitness', label:'Sports & Fitness' },
  { value:'accessories', label:'Accessories' },
  { value:'food and drinks', label:'Food & Drinks' },
  { value:'services', label:'Services' },
  { value:'other', label:'Other' },
];

const SUBCATEGORY_MAP = {
  'electronics': [
    { value:'headphones-earbuds', label:'Headphones & Earbuds' },
    { value:'speakers', label:'Speakers' },
    { value:'chargers-cables', label:'Chargers & Cables' },
    { value:'power-banks', label:'Power Banks' },
    { value:'smartwatches', label:'Smartwatches' },
    { value:'cameras', label:'Cameras' },
    { value:'other-electronics', label:'Other Electronics' },
  ],
  'phones and tablets': [
    { value:'smartphones', label:'Smartphones' },
    { value:'tablets', label:'Tablets' },
    { value:'ipads', label:'iPads' },
    { value:'phone-cases', label:'Phone Cases' },
    { value:'screen-protectors', label:'Screen Protectors' },
    { value:'other-phone-accessories', label:'Other' },
  ],
  'computers and laptops': [
    { value:'laptops', label:'Laptops' },
    { value:'desktops', label:'Desktops' },
    { value:'monitors', label:'Monitors' },
    { value:'keyboards', label:'Keyboards' },
    { value:'mouse', label:'Mouse' },
    { value:'laptop-bags', label:'Laptop Bags' },
    { value:'software', label:'Software' },
    { value:'other-computer-accessories', label:'Other' },
  ],
  'gaming': [
    { value:'consoles', label:'Consoles' },
    { value:'games', label:'Games' },
    { value:'controllers', label:'Controllers' },
    { value:'gaming-accessories', label:'Accessories' },
  ],
  'fashion': [
    { value:'men-clothing', label:"Men's Clothing" },
    { value:'women-clothing', label:"Women's Clothing" },
    { value:'unisex-clothing', label:'Unisex' },
    { value:'shoes', label:'Shoes' },
    { value:'bags', label:'Bags' },
    { value:'watches', label:'Watches' },
    { value:'jewelry', label:'Jewelry' },
    { value:'other-fashion', label:'Other' },
  ],
  'books-course-materials': [
    { value:'textbooks', label:'Textbooks' },
    { value:'course-notes', label:'Course Notes' },
    { value:'past-questions', label:'Past Questions' },
    { value:'stationery', label:'Stationery' },
    { value:'novels', label:'Novels' },
    { value:'other-books', label:'Other' },
  ],
  'hostel-items': [
    { value:'bedding', label:'Bedding' },
    { value:'kitchenware', label:'Kitchenware' },
    { value:'cleaning-supplies', label:'Cleaning' },
    { value:'storage', label:'Storage' },
    { value:'lighting', label:'Lighting' },
    { value:'other-hostel', label:'Other' },
  ],
  'appliances': [
    { value:'fans', label:'Fans' },
    { value:'irons', label:'Irons' },
    { value:'kettles', label:'Kettles' },
    { value:'blenders', label:'Blenders' },
    { value:'microwaves', label:'Microwaves' },
    { value:'other-appliances', label:'Other' },
  ],
  'furniture': [
    { value:'chairs', label:'Chairs' },
    { value:'tables-desks', label:'Tables & Desks' },
    { value:'beds-mattresses', label:'Beds & Mattresses' },
    { value:'shelves', label:'Shelves' },
    { value:'other-furniture', label:'Other' },
  ],
  'beauty and grooming': [
    { value:'skincare', label:'Skincare' },
    { value:'makeup', label:'Makeup' },
    { value:'hair-care', label:'Hair Care' },
    { value:'perfumes', label:'Perfumes' },
    { value:'nail-care', label:'Nail Care' },
    { value:'other-beauty', label:'Other' },
  ],
  'sports and fitness': [
    { value:'sports-equipment', label:'Equipment' },
    { value:'gym-gear', label:'Gym Gear' },
    { value:'activewear', label:'Activewear' },
    { value:'other-sports', label:'Other' },
  ],
  'food and drinks': [
    { value:'snacks', label:'Snacks' },
    { value:'drinks', label:'Drinks' },
    { value:'homemade-meals', label:'Homemade Meals' },
    { value:'baked-goods', label:'Baked Goods' },
    { value:'other-food', label:'Other' },
  ],
  'services': [
    { value:'tutoring', label:'Tutoring' },
    { value:'graphic-design', label:'Graphic Design' },
    { value:'photography', label:'Photography' },
    { value:'printing-photocopy', label:'Printing' },
    { value:'laundry', label:'Laundry' },
    { value:'barbering-hairdressing', label:'Barbering/Hair' },
    { value:'tech-repairs', label:'Tech Repairs' },
    { value:'other-services', label:'Other' },
  ],
};

const CONDITION_OPTIONS = [
  { value:'new', label:'Brand New' },
  { value:'like-new', label:'Like New' },
  { value:'excellent', label:'Excellent' },
  { value:'good', label:'Good' },
  { value:'fair', label:'Fair' },
  { value:'slightly-used', label:'Slightly Used' },
  { value:'for-parts', label:'For Parts' },
];

const CAMPUS_OPTIONS = [
  { value:'', label:'Select campus (optional)' },
  { value:'UG', label:'University of Ghana' },
  { value:'KNUST', label:'KNUST' },
  { value:'UCC', label:'University of Cape Coast' },
  { value:'UEW', label:'University of Education, Winneba' },
  { value:'UPSA', label:'UPSA' },
  { value:'GIMPA', label:'GIMPA' },
  { value:'ASHESI', label:'Ashesi University' },
  { value:'ATU', label:'Accra Technical University' },
  { value:'OTHER', label:'Other' },
];

const TAG_OPTIONS = [
  { value:'featured', label:'Featured' },
  { value:'urgent-sale', label:'Urgent Sale' },
  { value:'popular', label:'Popular' },
  { value:'discounted', label:'Discounted' },
  { value:'new-arrival', label:'New Arrival' },
  { value:'student-favorite', label:'Student Favorite' },
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
    boxShadow:'0 1px 4px rgba(0,0,0,0.05)', ...style }}>
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'13px 18px',
      borderBottom:'1px solid #F5F5F5', background:'#FAFAFA', borderRadius:'14px 14px 0 0' }}>
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
    name:'', category:'', subcategory:'', brand:'', price:'',
    negotiable:false, condition:'good', countInStock:'1',
    isAvailable:true, description:'', campus:'',
    campusArea:'', hostel:'', tags:[],
  });
  const [imageFiles,   setImageFiles]   = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
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
        const p = res.data.data.product || res.data.data;
        setFormData({
          name: p.name||'', category: p.category||'', subcategory: p.subcategory||'',
          brand: p.brand||'', price: p.price?.toString()||'',
          negotiable: p.negotiable||false, condition: p.condition||'good',
          countInStock: p.countInStock?.toString()||'1',
          isAvailable: p.isAvailable??true, description: p.description||'',
          campus: p.campus||'', campusArea: p.location?.campusArea||'',
          hostel: p.location?.hostel||'',
          tags: Array.isArray(p.tags) ? p.tags : [],
        });
        setExistingImages(p.images || []);
        setImagePreviews(p.images || []);
        setSlugPreview(p.slug||'');
      } else throw new Error();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load product');
      navigate('/admin-products');
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({
      ...p,
      [name]: type==='checkbox'?checked:value,
      // Reset subcategory when category changes
      ...(name==='category' ? { subcategory:'' } : {}),
    }));
  };

  const handleTagToggle = (v) =>
    setFormData(p => ({
      ...p,
      tags: p.tags.includes(v) ? p.tags.filter(t=>t!==v) : [...p.tags, v],
    }));

  const processImages = (files) => {
    const valid = ['image/jpeg','image/png','image/jpg','image/gif','image/webp'];
    const newFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!valid.includes(file.type)) { toast.error(`${file.name}: Only JPEG, PNG, GIF, WebP allowed`); continue; }
      if (file.size > 5*1024*1024)    { toast.error(`${file.name}: Must be under 5MB`); continue; }
      const totalImages = existingImages.length - removedImages.length + imageFiles.length + newFiles.length;
      if (totalImages >= 10) { toast.error('Maximum 10 images allowed'); break; }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (newFiles.length > 0) {
      setImageFiles(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleImageChange = (e) => processImages(Array.from(e.target.files));
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processImages(Array.from(e.dataTransfer.files)); };

  const removeExistingImage = (url) => {
    setRemovedImages(prev => [...prev, url]);
    setExistingImages(prev => prev.filter(img => img !== url));
    setImagePreviews(prev => prev.filter(img => img !== url));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[existingImages.length + index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== (existingImages.length + index)));
  };

  const validate = () => {
    if (!formData.name.trim())          { toast.error('Product name is required'); return false; }
    if (!formData.category)             { toast.error('Please select a category'); return false; }
    if (!formData.price || parseFloat(formData.price)<0) { toast.error('Enter a valid price'); return false; }
    if (parseInt(formData.countInStock) < 0) { toast.error('Stock cannot be negative'); return false; }
    if (existingImages.length + imageFiles.length === 0) { toast.error('At least one image is required'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('name', formData.name.trim());
    fd.append('category', formData.category);
    if (formData.subcategory) fd.append('subcategory', formData.subcategory);
    if (formData.brand) fd.append('brand', formData.brand.trim());
    fd.append('price', parseFloat(formData.price));
    fd.append('negotiable', formData.negotiable);
    fd.append('condition', formData.condition);
    fd.append('countInStock', parseInt(formData.countInStock));
    fd.append('isAvailable', formData.isAvailable);
    if (formData.description) fd.append('description', formData.description.trim());
    if (formData.campus) fd.append('campus', formData.campus);
    if (formData.campusArea) fd.append('location[campusArea]', formData.campusArea.trim());
    if (formData.hostel) fd.append('location[hostel]', formData.hostel.trim());
    formData.tags.forEach(t => fd.append('tags[]', t));

    // Append removed image URLs
    removedImages.forEach(url => fd.append('removedImages[]', url));

    // Append new image files
    imageFiles.forEach(file => fd.append('productImages', file));

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
    setImageFiles([]);
    setRemovedImages([]);
    setTagSearch('');
    setShowDrop(false);
    toast.info('Form reset to original values');
  };

  const filteredTags = TAG_OPTIONS.filter(t =>
    t.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
    t.value.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const stock = parseInt(formData.countInStock)||0;
  const stockColor = !formData.isAvailable || stock===0 ? '#CF1322' : stock<=3 ? '#D48806' : '#389E0D';

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

  const subcategories = SUBCATEGORY_MAP[formData.category] || [];

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
          .pep-grid3  { grid-template-columns:1fr !important; }
          .pep-hdr    { flex-direction:column !important; align-items:flex-start !important; }
          .pep-actions-top { flex-wrap:wrap !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light"/>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* Sticky header */}
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
                    maxWidth:200, textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
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
              }}>↺ Reset</button>
              <Link to={`/admin-product/${id}`} className="pep-cancel" style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px',
                border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:12, fontWeight:600,
                color:'#595959', background:'#fff', textDecoration:'none',
              }}>Cancel</Link>
              <button type="submit" form="edit-product-form" disabled={saving} className="pep-submit" style={{
                display:'inline-flex', alignItems:'center', gap:7, padding:'9px 20px',
                background:'#1677FF', color:'#fff', border:'none', borderRadius:9,
                fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer',
                fontFamily:"'DM Sans',sans-serif", opacity:saving?0.7:1,
              }}>
                {saving
                  ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }}/> Saving…</>
                  : <><CheckCircleIcon style={{ width:15, height:15 }}/> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px 56px' }}>
          <form id="edit-product-form" onSubmit={handleSubmit}>
            <div className="pep-layout" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:18, alignItems:'start' }}>

              {/* LEFT: main form */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* Basic Info */}
                <div style={{ animation:'fadeUp 0.4s ease both' }}>
                  <Section title="Basic Information" icon={InformationCircleIcon} accent="#1677FF">
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      <div>
                        <Label required>Product Name</Label>
                        <input name="name" value={formData.name} onChange={handleChange}
                          placeholder="e.g. iPhone 13 Pro Max 256GB" className="pep-input" style={fieldBase()}/>
                        {slugPreview && (
                          <p style={{ margin:'5px 0 0', fontSize:11, color:'#8C8C8C' }}>
                            Slug: <span style={{ fontWeight:700, color:'#595959', fontFamily:'monospace' }}>/{slugPreview}</span>
                          </p>
                        )}
                      </div>

                      <div className="pep-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        <div>
                          <Label required>Category</Label>
                          <SelectBox name="category" value={formData.category} onChange={handleChange}>
                            <option value="">Choose category…</option>
                            {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                          </SelectBox>
                        </div>
                        <div>
                          <Label>Subcategory</Label>
                          <SelectBox name="subcategory" value={formData.subcategory} onChange={handleChange}
                            disabled={!formData.category || subcategories.length===0}>
                            <option value="">
                              {!formData.category ? 'Select category first' :
                               subcategories.length===0 ? 'No subcategories' : 'Choose subcategory…'}
                            </option>
                            {subcategories.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                          </SelectBox>
                        </div>
                      </div>

                      <div>
                        <Label>Brand</Label>
                        <input name="brand" value={formData.brand} onChange={handleChange}
                          placeholder="e.g. Apple, Samsung, Nike" className="pep-input" style={fieldBase()}/>
                      </div>

                      <div className="pep-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        <div>
                          <Label required>Condition</Label>
                          <SelectBox name="condition" value={formData.condition} onChange={handleChange}>
                            {CONDITION_OPTIONS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                          </SelectBox>
                        </div>
                        <div>
                          <Label>Campus</Label>
                          <SelectBox name="campus" value={formData.campus} onChange={handleChange}>
                            {CAMPUS_OPTIONS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                          </SelectBox>
                        </div>
                      </div>

                      <div className="pep-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        <div>
                          <Label>Campus Area</Label>
                          <input name="campusArea" value={formData.campusArea} onChange={handleChange}
                            placeholder="e.g. Main Campus" className="pep-input" style={fieldBase()}/>
                        </div>
                        <div>
                          <Label>Hostel / Hall</Label>
                          <input name="hostel" value={formData.hostel} onChange={handleChange}
                            placeholder="e.g. Mensah Sarbah Hall" className="pep-input" style={fieldBase()}/>
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <textarea name="description" value={formData.description} onChange={handleChange}
                          rows={3} placeholder="Describe the item, reason for selling, etc."
                          className="pep-input" style={{ ...fieldBase(), resize:'none', lineHeight:1.6 }}/>
                      </div>
                    </div>
                  </Section>
                </div>

                {/* Tags */}
                <div style={{ animation:'fadeUp 0.4s ease 60ms both', position:'relative', zIndex:50 }}>
                  <Section title="Product Tags" icon={TagIcon} accent="#7C3AED">
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

                    <div style={{ position:'relative' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px',
                        border:'1.5px solid #E8E8E8', borderRadius:9, background:'#FAFAFA', cursor:'pointer' }}
                        onClick={()=>setShowDrop(true)}>
                        <TagIcon style={{ width:13, height:13, color:'#BFBFBF' }}/>
                        <input value={tagSearch} onChange={e=>setTagSearch(e.target.value)}
                          onFocus={()=>setShowDrop(true)}
                          onBlur={() => setTimeout(() =>setShowDrop(false), 150)}
                          placeholder={formData.tags.length===0?'Search or pick tags…':'Add more tags…'}
                          style={{ border:'none', outline:'none', background:'transparent', fontSize:13,
                            fontFamily:"'DM Sans',sans-serif", color:'#262626', flex:1, minWidth:0 }}/>
                        <ChevronDownIcon style={{ width:13, height:13, color:'#BFBFBF' }}/>
                      </div>

                      {showDrop && (
                        <div style={{ position:'absolute', zIndex:9999, top:'calc(100% + 6px)', left:0, right:0,
                          background:'#fff', borderRadius:10, border:'1px solid #F0F0F0',
                          boxShadow:'0 8px 32px rgba(0,0,0,0.14)', overflow:'hidden',
                          maxHeight:280, overflowY:'auto', animation:'fadeIn 0.15s ease' }}>
                          {filteredTags.length===0 ? (
                            <p style={{ margin:0, padding:'14px 16px', fontSize:13, color:'#BFBFBF', textAlign:'center' }}>No matching tags</p>
                          ) : (
                            filteredTags.map(tag => {
                              const sel = formData.tags.includes(tag.value);
                              return (
                                <button key={tag.value} type="button"
                                  onMouseDown={e => { e.preventDefault(); handleTagToggle(tag.value); }}
                                  className="paf-drop-item"
                                  style={{ display:'flex', alignItems:'center', gap:12, width:'100%',
                                    padding:'10px 16px', background:sel?'#F0F7FF':'#fff',
                                    border:'none', cursor:'pointer', textAlign:'left',
                                    fontFamily:"'DM Sans',sans-serif", transition:'background 0.12s' }}>
                                  <div style={{ width:17, height:17, borderRadius:5, flexShrink:0,
                                    border:`2px solid ${sel?'#1677FF':'#D9D9D9'}`,
                                    background:sel?'#1677FF':'#fff',
                                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    {sel && <CheckCircleIcon size={11} color="#fff"/>}
                                  </div>
                                  <span style={{ fontSize:13, fontWeight:sel?700:500, color:sel?'#1677FF':'#262626' }}>
                                    {tag.label}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </Section>
                </div>

                {/* Pricing */}
                <div style={{ animation:'fadeUp 0.4s ease 120ms both' }}>
                  <Section title="Pricing & Inventory" icon={CurrencyDollarIcon} accent="#10B981">
                    <div className="pep-grid3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:16 }}>
                      <div>
                        <Label required>Price (GH₵)</Label>
                        <input type="number" step="0.01" min="0" name="price" value={formData.price}
                          onChange={handleChange} placeholder="0.00"
                          className="pep-input" style={fieldBase()}/>
                      </div>
                      <div>
                        <Label>Stock</Label>
                        <input type="number" min="0" name="countInStock" value={formData.countInStock}
                          onChange={handleChange} placeholder="1"
                          className="pep-input" style={fieldBase()}/>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', paddingTop:24 }}>
                        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                          <input type="checkbox" name="negotiable" checked={formData.negotiable}
                            onChange={handleChange} style={{ width:16, height:16, accentColor:'#1677FF' }}/>
                          <span style={{ fontSize:13, fontWeight:600, color:'#262626' }}>Negotiable</span>
                        </label>
                      </div>
                    </div>

                    {(!formData.isAvailable || stock===0) && (
                      <p style={{ margin:'5px 0 12px', fontSize:11, color:'#CF1322', display:'flex', alignItems:'center', gap:4 }}>
                        <ExclamationTriangleIcon style={{ width:11, height:11 }}/>
                        {!formData.isAvailable ? 'Product is hidden' : 'Out of stock'}
                      </p>
                    )}
                    {formData.isAvailable && stock>0 && stock<=3 && (
                      <p style={{ margin:'5px 0 12px', fontSize:11, color:'#D48806', display:'flex', alignItems:'center', gap:4 }}>
                        <ExclamationTriangleIcon style={{ width:11, height:11 }}/> Low stock — {stock} left
                      </p>
                    )}

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
                          {formData.isAvailable?'Visible to students on the marketplace':'Not visible to anyone'}
                        </p>
                      </div>
                      <div onClick={()=>setFormData(p=>({...p,isAvailable:!p.isAvailable}))} style={{
                        width:42, height:24, borderRadius:12, cursor:'pointer',
                        background:formData.isAvailable?'#52C41A':'#D9D9D9', position:'relative', flexShrink:0,
                      }}>
                        <div style={{ position:'absolute', top:3, left:formData.isAvailable?20:3,
                          width:18, height:18, borderRadius:'50%', background:'#fff',
                          transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                      </div>
                    </div>
                  </Section>
                </div>
              </div>

              {/* RIGHT: sidebar */}
              <div className="pep-sidebar" style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* Images */}
                <div style={{ animation:'fadeUp 0.4s ease 80ms both' }}>
                  <Section title="Product Images" icon={CameraIcon} accent="#FF4D4F">
                    {/* Image grid */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                      {/* Existing images */}
                      {existingImages.map((url, i) => (
                        <div key={`existing-${i}`} style={{ position:'relative', borderRadius:8, overflow:'hidden', aspectRatio:'1/1' }}>
                          <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          <button type="button" onClick={() => removeExistingImage(url)}
                            style={{ position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%',
                              background:'rgba(0,0,0,0.6)', border:'none', cursor:'pointer',
                              display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <XMarkIcon style={{ width:11, height:11, color:'#fff' }}/>
                          </button>
                          {i===0 && (
                            <span style={{ position:'absolute', bottom:4, left:4, padding:'2px 6px',
                              background:'rgba(0,0,0,0.6)', color:'#fff', fontSize:9, fontWeight:700, borderRadius:4 }}>
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                      {/* New images */}
                      {imageFiles.map((_, i) => {
                        const previewIdx = existingImages.length + i;
                        return (
                          <div key={`new-${i}`} style={{ position:'relative', borderRadius:8, overflow:'hidden', aspectRatio:'1/1' }}>
                            <img src={imagePreviews[previewIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                            <button type="button" onClick={() => removeNewImage(i)}
                              style={{ position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%',
                                background:'rgba(0,0,0,0.6)', border:'none', cursor:'pointer',
                                display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <XMarkIcon style={{ width:11, height:11, color:'#fff' }}/>
                            </button>
                            <span style={{ position:'absolute', bottom:4, left:4, padding:'2px 6px',
                              background:'#52C41A', color:'#fff', fontSize:9, fontWeight:700, borderRadius:4 }}>
                              New
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Upload zone */}
                    <div onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
                      onDragLeave={()=>setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={()=>fileRef.current?.click()}
                      style={{ border:`2px dashed ${dragOver?'#1677FF':'#E8E8E8'}`, borderRadius:10,
                        padding:'16px', textAlign:'center', cursor:'pointer',
                        background:dragOver?'#F0F7FF':'#FAFAFA', transition:'all 0.2s' }}>
                      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display:'none' }}/>
                      <ArrowUpTrayIcon style={{ width:20, height:20, color:dragOver?'#1677FF':'#BFBFBF', margin:'0 auto 6px' }}/>
                      <p style={{ margin:'0 0 2px', fontSize:12, fontWeight:700, color:dragOver?'#1677FF':'#262626' }}>
                        {dragOver?'Drop images here':'Upload Images'}
                      </p>
                      <p style={{ margin:0, fontSize:11, color:'#BFBFBF' }}>
                        {existingImages.length + imageFiles.length}/10 · JPEG, PNG, WebP
                      </p>
                    </div>
                  </Section>
                </div>

                {/* Live preview */}
                <div style={{ animation:'fadeUp 0.4s ease 140ms both' }}>
                  <Section title="Live Preview" icon={InformationCircleIcon} accent="#F59E0B">
                    <PreviewRow label="Name" value={formData.name}/>
                    <PreviewRow label="Category" value={CATEGORIES.find(c=>c.value===formData.category)?.label}/>
                    <PreviewRow label="Condition" value={CONDITION_OPTIONS.find(c=>c.value===formData.condition)?.label}/>
                    <PreviewRow label="Price" value={formData.price?`GH₵ ${parseFloat(formData.price).toFixed(2)}`:null}/>
                    <PreviewRow label="Stock" value={`${formData.countInStock} available`} valueStyle={{ color: stockColor }}/>
                    <PreviewRow label="Campus" value={CAMPUS_OPTIONS.find(c=>c.value===formData.campus)?.label}/>
                    <PreviewRow label="Tags" value={formData.tags.length?`${formData.tags.length} selected`:null}/>
                    <PreviewRow label="Status" value={formData.isAvailable?'Available':'Hidden'}
                      valueStyle={{ color: formData.isAvailable?'#389E0D':'#CF1322' }}/>
                  </Section>
                </div>

                {/* Quick actions */}
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
                  }}>↺ Reset to Original</button>
                  <Link to={`/admin-product/${id}`} style={{
                    display:'flex', alignItems:'center', justifyContent:'center', padding:'10px 0',
                    borderRadius:9, border:'1.5px solid rgba(255,255,255,0.08)',
                    background:'transparent', color:'rgba(255,255,255,0.4)',
                    fontSize:12, fontWeight:600, textDecoration:'none', fontFamily:"'DM Sans',sans-serif",
                  }}>Cancel</Link>
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