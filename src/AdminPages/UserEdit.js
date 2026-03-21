// UserEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, X, User, Mail, Phone, MapPin,
  Building, Flag, Shield, Loader2, AlertCircle,
  CheckCircle, Eye, EyeOff, Key, Lock, ChevronDown,
} from 'lucide-react';
import { getAUser, updateAUser } from '../Apis/adminApi';
import AdminLayout from '../Components/AdminComponents/adminLayout';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLES = [
  { value:'customer', label:'Customer' },
  { value:'vendor',   label:'Vendor'   },
  { value:'staff',    label:'Staff'    },
];

const INIT = {
  firstName:'', lastName:'', email:'', phone:'', isAdmin:false,
  role:'customer', address:'', city:'', nearestLandmark:'',
  password:'', confirmPassword:'',
};

// ─── Field primitives ─────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#595959',
    textTransform:'uppercase', letterSpacing:'0.05em' }}>
    {children}{required && <span style={{ color:'#FF4D4F', marginLeft:3 }}>*</span>}
  </p>
);

const baseInput = (err, disabled) => ({
  width:'100%', padding:'10px 14px', fontSize:13, fontFamily:"'DM Sans',sans-serif",
  border:`1.5px solid ${err?'#FFA39E':'#E8E8E8'}`, borderRadius:9, outline:'none',
  background:disabled?'#F5F5F5':'#FAFAFA', color:'#262626', transition:'border-color 0.15s',
});

const ErrMsg = ({ msg }) => msg ? (
  <p style={{ margin:'4px 0 0', fontSize:11, color:'#FF4D4F', display:'flex', alignItems:'center', gap:4 }}>
    <AlertCircle size={11}/> {msg}
  </p>
) : null;

const OkMsg = ({ msg }) => msg ? (
  <p style={{ margin:'4px 0 0', fontSize:11, color:'#389E0D', display:'flex', alignItems:'center', gap:4 }}>
    <CheckCircle size={11}/> {msg}
  </p>
) : null;

// Input with left icon
const IconInput = ({ icon: Icon, type='text', name, value, onChange, placeholder, error, disabled, rightEl }) => (
  <div style={{ position:'relative' }}>
    <Icon size={14} color="#BFBFBF" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className="pef-input" style={{ ...baseInput(error, disabled), paddingLeft:34, paddingRight:rightEl?38:14 }}/>
    {rightEl && <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{rightEl}</div>}
  </div>
);

// Section card
const Section = ({ title, icon: Icon, accent='#1677FF', children }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #F0F0F0',
    overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'13px 18px',
      borderBottom:'1px solid #F5F5F5', background:'#FAFAFA' }}>
      <div style={{ width:28, height:28, borderRadius:7, background:accent+'18',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={14} color={accent}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:'#141414' }}>{title}</span>
    </div>
    <div style={{ padding:'18px' }}>{children}</div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const UserEditPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [formData, setFormData]   = useState(INIT);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showPw, setShowPw]       = useState(false);
  const [showCPw, setShowCPw]     = useState(false);

  useEffect(() => { if (id) fetchUser(); }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res  = await getAUser(id);
      const user = res.data.user;
      setFormData({
        firstName: user.firstName||'', lastName: user.lastName||'',
        email: user.email||'', phone: user.phone||'',
        isAdmin: user.isAdmin||false, role: user.role||'customer',
        address: user.address||'', city: user.city||'',
        nearestLandmark: user.nearestLandmark||'',
        password:'', confirmPassword:'',
      });
      setError('');
    } catch { setError('Failed to load user. Please try again.'); }
    finally  { setLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email address';
    if (formData.phone && !/^[+]?[\d\s()-]*$/.test(formData.phone)) e.phone = 'Enter a valid phone number';
    if (formData.password) {
      if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type==='checkbox'?checked:value }));
    if (formErrors[name]) setFormErrors(p => ({ ...p, [name]:'' }));
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const payload = {
      firstName: formData.firstName, lastName: formData.lastName,
      email: formData.email||undefined, phone: formData.phone||undefined,
      isAdmin: formData.isAdmin, role: formData.role,
      address: formData.address, city: formData.city,
      nearestLandmark: formData.nearestLandmark,
      ...(formData.password ? { password: formData.password } : {}),
    };

    setSaving(true); setError('');
    try {
      await updateAUser(id, payload);
      setSuccess('User updated successfully!');
      setFormData(p => ({ ...p, password:'', confirmPassword:'' }));
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
    } finally { setSaving(false); }
  };

  const handleCancel = () => navigate(`/admin/users/${id}`);

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Unnamed User';

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <AdminLayout title="Edit User">
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        minHeight:'60vh', gap:14, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #F0F0F0',
          borderTopColor:'#1677FF', animation:'spin 0.7s linear infinite' }}/>
        <p style={{ fontSize:13, color:'#8C8C8C', margin:0 }}>Loading user…</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Edit User">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .pef-input:focus  { border-color:#1677FF !important; background:#fff !important; }
        .pef-input:hover  { border-color:#BFBFBF !important; }
        .pef-cancel:hover { background:#F5F5F5 !important; }
        .pef-submit:hover { filter:brightness(0.92); }
        .pef-tip:hover    { background:#EBF5FF !important; }
        @media (max-width:640px) {
          .pef-grid2    { grid-template-columns:1fr !important; }
          .pef-actions  { flex-direction:column !important; }
          .pef-actions>* { width:100% !important; justify-content:center !important; }
          .pef-hdr      { flex-direction:column !important; align-items:flex-start !important; }
          .pef-avail    { flex-direction:column !important; align-items:flex-start !important; gap:12px !important; }
        }
      `}</style>

      <div style={{ overflow:"hidden", fontFamily:"'DM Sans',sans-serif", background:'#FAFAFA', minHeight:'100vh', color:'#262626' }}>

        {/* ── Sticky header ── */}
        <div style={{ position:'sticky', top:0, zIndex:100, background:'#fff',
          borderBottom:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="pef-hdr" style={{ maxWidth:860, margin:'0 auto', padding:'12px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <button onClick={handleCancel} style={{
                display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600,
                color:'#8C8C8C', background:'none', border:'none', cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif", padding:0, marginBottom:3,
              }}>
                <ArrowLeft size={14}/> Back to User
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:'#141414', letterSpacing:'-0.3px' }}>
                  Edit User
                </h1>
                <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                  background:'#F0F7FF', color:'#1677FF', border:'1px solid #91CAFF' }}>
                  {fullName}
                </span>
              </div>
            </div>
            <div className="pef-actions" style={{ display:'flex', gap:8 }}>
              <button type="button" onClick={handleCancel} disabled={saving}
                className="pef-cancel" style={{
                  display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px',
                  border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:13, fontWeight:600,
                  color:'#595959', background:'#fff', cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                  transition:'background 0.15s', opacity:saving?0.5:1,
                }}>
                <X size={14}/> Cancel
              </button>
              <button type="submit" form="edit-user-form" disabled={saving}
                className="pef-submit" style={{
                  display:'inline-flex', alignItems:'center', gap:7, padding:'9px 20px',
                  background:'#1677FF', color:'#fff', border:'none', borderRadius:9,
                  fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer',
                  fontFamily:"'DM Sans',sans-serif", opacity:saving?0.7:1, transition:'filter 0.15s',
                }}>
                {saving
                  ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }}/> Saving…</>
                  : <><Save size={14}/> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:860, margin:'0 auto', padding:'24px 16px 56px' }}>

          {/* ── Alerts ── */}
          {success && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px',
              background:'#F6FFED', border:'1px solid #B7EB8F', borderRadius:10, marginBottom:16, animation:'fadeIn 0.2s ease' }}>
              <CheckCircle size={15} color="#52C41A"/><span style={{ fontSize:13, fontWeight:600, color:'#389E0D' }}>{success}</span>
            </div>
          )}
          {error && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'13px 16px',
              background:'#FFF1F0', border:'1px solid #FFA39E', borderRadius:10, marginBottom:16, animation:'fadeIn 0.2s ease' }}>
              <AlertCircle size={15} color="#FF4D4F" style={{ flexShrink:0, marginTop:1 }}/>
              <div>
                <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:700, color:'#CF1322' }}>Error</p>
                <p style={{ margin:0, fontSize:12, color:'#FF4D4F' }}>{error}</p>
              </div>
            </div>
          )}

          <form id="edit-user-form" onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* ── Personal Info ── */}
              <div style={{ animation:'fadeUp 0.4s ease both' }}>
                <Section title="Personal Information" icon={User} accent="#1677FF">
                  <div className="pef-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <Label required>First Name</Label>
                      <IconInput icon={User} name="firstName" value={formData.firstName}
                        onChange={handleChange} placeholder="Enter first name"
                        error={formErrors.firstName} disabled={saving}/>
                      <ErrMsg msg={formErrors.firstName}/>
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <IconInput icon={User} name="lastName" value={formData.lastName}
                        onChange={handleChange} placeholder="Enter last name" disabled={saving}/>
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <IconInput icon={Mail} type="email" name="email" value={formData.email}
                        onChange={handleChange} placeholder="user@example.com"
                        error={formErrors.email} disabled={saving}/>
                      <ErrMsg msg={formErrors.email}/>
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <IconInput icon={Phone} type="tel" name="phone" value={formData.phone}
                        onChange={handleChange} placeholder="+233 XX XXX XXXX"
                        error={formErrors.phone} disabled={saving}/>
                      <ErrMsg msg={formErrors.phone}/>
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Location ── */}
              <div style={{ animation:'fadeUp 0.4s ease 60ms both' }}>
                <Section title="Location" icon={MapPin} accent="#10B981">
                  <div className="pef-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <Label>City</Label>
                      <IconInput icon={Building} name="city" value={formData.city}
                        onChange={handleChange} placeholder="e.g. Accra" disabled={saving}/>
                    </div>
                    <div>
                      <Label>Nearest Landmark</Label>
                      <IconInput icon={Flag} name="nearestLandmark" value={formData.nearestLandmark}
                        onChange={handleChange} placeholder="e.g. Near Central Park" disabled={saving}/>
                    </div>
                    <div style={{ gridColumn:'1 / -1' }}>
                      <Label>Full Address</Label>
                      <div style={{ position:'relative' }}>
                        <MapPin size={14} color="#BFBFBF" style={{ position:'absolute', left:12, top:12, pointerEvents:'none' }}/>
                        <textarea name="address" value={formData.address} onChange={handleChange}
                          placeholder="Enter full delivery address…" rows={3} disabled={saving}
                          className="pef-input" style={{ ...baseInput('', saving), paddingLeft:34, resize:'none', lineHeight:1.6 }}/>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Account Settings ── */}
              <div style={{ animation:'fadeUp 0.4s ease 120ms both' }}>
                <Section title="Account Settings" icon={Shield} accent="#7C3AED">
                  <div className="pef-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    {/* Role */}
                    <div>
                      <Label>User Role</Label>
                      <div style={{ position:'relative' }}>
                        <select name="role" value={formData.role} onChange={handleChange} disabled={saving}
                          className="pef-input" style={{ ...baseInput('', saving), appearance:'none', paddingRight:34 }}>
                          {ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <ChevronDown size={13} color="#8C8C8C" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                      </div>
                      <p style={{ margin:'5px 0 0', fontSize:11, color:'#8C8C8C' }}>Determines user permissions and access level</p>
                    </div>

                    {/* Admin toggle */}
                    <div>
                      <Label>Admin Status</Label>
                      <div className="pef-avail" style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'12px 14px', borderRadius:10,
                        border:`1.5px solid ${formData.isAdmin?'#D3ADF7':'#E8E8E8'}`,
                        background:formData.isAdmin?'#F9F0FF':'#FAFAFA', transition:'all 0.2s' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:9, flexShrink:0,
                            background:formData.isAdmin?'#F9F0FF':'#F5F5F5',
                            display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Shield size={15} color={formData.isAdmin?'#7C3AED':'#8C8C8C'}/>
                          </div>
                          <div>
                            <p style={{ margin:0, fontSize:13, fontWeight:700, color:formData.isAdmin?'#531DAB':'#141414' }}>
                              {formData.isAdmin?'Administrator':'Regular User'}
                            </p>
                            <p style={{ margin:0, fontSize:11, color:'#8C8C8C' }}>
                              {formData.isAdmin?'Full system access':'Limited access'}
                            </p>
                          </div>
                        </div>
                        {/* Toggle pill */}
                        <div onClick={()=>!saving&&setFormData(p=>({...p,isAdmin:!p.isAdmin}))} style={{
                          width:42, height:24, borderRadius:12, cursor:saving?'not-allowed':'pointer',
                          background:formData.isAdmin?'#7C3AED':'#D9D9D9', position:'relative', flexShrink:0,
                          transition:'background 0.2s',
                        }}>
                          <div style={{ position:'absolute', top:3, left:formData.isAdmin?20:3,
                            width:18, height:18, borderRadius:'50%', background:'#fff',
                            transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Change Password ── */}
              <div style={{ animation:'fadeUp 0.4s ease 180ms both' }}>
                <Section title="Change Password" icon={Key} accent="#F59E0B">
                  <p style={{ margin:'0 0 14px', fontSize:12, color:'#8C8C8C' }}>
                    Leave both fields empty to keep the current password unchanged.
                  </p>
                  <div className="pef-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    {/* New password */}
                    <div>
                      <Label>New Password</Label>
                      <IconInput icon={Key}
                        type={showPw?'text':'password'} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="Enter new password"
                        error={formErrors.password} disabled={saving}
                        rightEl={
                          <button type="button" onClick={()=>setShowPw(v=>!v)} style={{
                            background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#BFBFBF' }}>
                            {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                          </button>
                        }/>
                      <ErrMsg msg={formErrors.password}/>
                      {formData.password && !formErrors.password && (
                        <OkMsg msg="Password looks good"/>
                      )}
                    </div>
                    {/* Confirm password */}
                    <div>
                      <Label>Confirm Password</Label>
                      <IconInput icon={Lock}
                        type={showCPw?'text':'password'} name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange}
                        placeholder="Re-enter new password"
                        error={formErrors.confirmPassword} disabled={saving}
                        rightEl={
                          <button type="button" onClick={()=>setShowCPw(v=>!v)} style={{
                            background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#BFBFBF' }}>
                            {showCPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                          </button>
                        }/>
                      <ErrMsg msg={formErrors.confirmPassword}/>
                      {formData.confirmPassword && !formErrors.confirmPassword
                        && formData.password===formData.confirmPassword && (
                        <OkMsg msg="Passwords match"/>
                      )}
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Submit row ── */}
              <div className="pef-actions" style={{ display:'flex', justifyContent:'flex-end', gap:10,
                animation:'fadeUp 0.4s ease 240ms both' }}>
                <button type="button" onClick={handleCancel} disabled={saving}
                  className="pef-cancel" style={{
                    display:'inline-flex', alignItems:'center', gap:7, padding:'11px 22px',
                    border:'1.5px solid #E8E8E8', borderRadius:9, fontSize:14, fontWeight:600,
                    color:'#595959', background:'#fff', cursor:'pointer',
                    fontFamily:"'DM Sans',sans-serif", transition:'background 0.15s',
                  }}>
                  <X size={15}/> Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="pef-submit" style={{
                    display:'inline-flex', alignItems:'center', gap:8, padding:'11px 28px',
                    background:'#1677FF', color:'#fff', border:'none', borderRadius:9,
                    fontSize:14, fontWeight:700, cursor:saving?'not-allowed':'pointer',
                    fontFamily:"'DM Sans',sans-serif", opacity:saving?0.7:1, transition:'filter 0.15s',
                  }}>
                  {saving
                    ? <><div style={{ width:16, height:16, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }}/> Saving…</>
                    : <><Save size={15}/> Save Changes</>
                  }
                </button>
              </div>

              {/* ── Tips ── */}
              <div style={{ borderRadius:12, border:'1px solid #E6F4FF', background:'#F0F7FF',
                padding:'16px 18px', animation:'fadeUp 0.4s ease 280ms both' }}>
                <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:700, color:'#1677FF',
                  display:'flex', alignItems:'center', gap:6 }}>
                  <Shield size={14}/> User Management Tips
                </p>
                <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:7 }}>
                  {[
                    ['Email & Phone', 'Optional but recommended for a better user experience'],
                    ['Admin Status', 'Only grant admin access to trusted users who need full system control'],
                    ['Password', 'Leave the password fields empty to keep the current password unchanged'],
                    ['Location', 'Complete address information helps with accurate delivery'],
                  ].map(([bold, rest])=>(
                    <li key={bold} className="pef-tip" style={{ display:'flex', alignItems:'flex-start', gap:8,
                      fontSize:12, color:'#1677FF', padding:'6px 8px', borderRadius:7, transition:'background 0.12s' }}>
                      <span style={{ fontWeight:800, flexShrink:0 }}>·</span>
                      <span><strong>{bold}:</strong> {rest}</span>
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

export default UserEditPage;