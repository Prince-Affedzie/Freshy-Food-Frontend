import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaApple, FaGooglePlay, FaBars, FaTimes, FaArrowRight, FaStar,
  FaShieldAlt, FaBolt, FaSearch, FaChartLine, FaUsers, FaStore,
  FaHeadphones, FaCheck, FaChevronDown,
  FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaMapMarkerAlt, FaQuoteLeft,
  FaShoppingBag, FaLaptop, FaTshirt, FaHome, FaUtensils,
  FaBook, FaTv, FaMobile, FaCar, FaBaby, FaFire, FaTag,
  FaGraduationCap, FaRocket, FaHeart
} from "react-icons/fa";
import { MdVerified, MdSecurity, MdCloud, MdTrendingUp } from "react-icons/md";

// ─── Store URLs ───────────────────────────────────────────────────────────────
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.freshyfood.factory";
const APP_STORE_URL  = "https://apps.apple.com/us/app/cedimart/id6762318566";

const NAV_LINKS = ["Home", "Features", "Businesses", "About", "Testimonials", "FAQ"];

// ─── Data ─────────────────────────────────────────────────────────────────────
const CAMPUSES = ["University of Ghana", "KNUST", "UCC", "UPSA", "GIMPA", "Ashesi", "UEW", "ATU"];

const TICKER_ITEMS = [
  { text: "Kofi just listed iPhone 14 Pro · KNUST", type: "new" },
  { text: "Ama sold her MacBook in 2 hours · UG", type: "sold" },
  { text: "94 students browsing Electronics right now", type: "live" },
  { text: "Serwaa's Fashion Store just went live · UPSA", type: "new" },
  { text: "Flash sale: Samsung Galaxy Tab · 30% off · UCC", type: "hot" },
  { text: "Kwame just opened a Repairs service · KNUST", type: "new" },
  { text: "500 products listed today across all campuses", type: "live" },
  { text: "Abena found her course textbook for 40% less · UG", type: "sold" },
];

const CATEGORIES = [
  { icon: <FaLaptop size={22}/>,   title: "Electronics",  color: "#6366F1", bg: "#EEF2FF" },
  { icon: <FaTshirt size={22}/>,   title: "Fashion",      color: "#EC4899", bg: "#FDF2F8" },
  { icon: <FaUtensils size={22}/>, title: "Food & Drinks",color: "#F59E0B", bg: "#FFFBEB" },
  { icon: <FaHome size={22}/>,     title: "Hostel Items", color: "#10B981", bg: "#ECFDF5" },
  { icon: <FaMobile size={22}/>,   title: "Phones",       color: "#3B82F6", bg: "#EFF6FF" },
  { icon: <FaBook size={22}/>,     title: "Books",        color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: <FaTv size={22}/>,       title: "Appliances",   color: "#EF4444", bg: "#FEF2F2" },
  { icon: <FaHeadphones size={22}/>,title:"Audio",        color: "#0EA5E9", bg: "#F0F9FF" },
  { icon: <FaShoppingBag size={22}/>,title:"Accessories", color: "#F97316", bg: "#FFF7ED" },
  { icon: <MdTrendingUp size={22}/>,title:"Services",     color: "#16A34A", bg: "#F0FDF4" },
];

const TESTIMONIALS = [
  {
    name: "Akua Mensah",   role: "3rd Year, UG · Buyer",
    quote: "I furnished my whole hostel room through CediMart. Found everything within my campus — no delivery fees, no stress. The app is honestly addictive.",
    avatar: "AM", campus: "UG",
  },
  {
    name: "Kofi Asante",  role: "Phone Seller · KNUST",
    quote: "Started selling refurbished phones 6 months ago. Now I have 200+ regular customers and I pay my own fees. CediMart changed my life.",
    avatar: "KA", campus: "KNUST",
  },
  {
    name: "Ama Serwaa",   role: "Fashion Designer · UPSA",
    quote: "My little clothing business now reaches 3,000 students across 4 campuses. Three months ago I could only sell to my classmates.",
    avatar: "AS", campus: "UPSA",
  },
];

const FAQS = [
  { q: "What is CediMart?",              a: "CediMart is Ghana's campus marketplace — connecting student buyers and sellers at UG, KNUST, UCC, UPSA and more. Think of it as the marketplace built for campus life." },
  { q: "Is it free to use?",             a: "Yes. Download, browse, and create your account for free. Sellers list products at no cost. We only take a small commission on completed sales." },
  { q: "How do I start selling?",        a: "Download the app, set up your shop in under 5 minutes, add products with photos, and you're live. Your first buyer could message you within hours." },
  { q: "Are sellers verified?",          a: "Every vendor goes through identity verification before listing. We check IDs, monitor reviews, and act quickly on reports to keep the community safe." },
  { q: "Which campuses are live?",       a: "UG, KNUST, UCC, UPSA, GIMPA, Ashesi, UEW, and ATU — with new campuses launching every month." },
  { q: "How does meeting sellers work?", a: "You arrange a safe campus meet-up with the seller — a library, SRC building, or campus canteen. We provide a safety guide and incident reporting for every transaction." },
];

const STATS = [
  { value: "10K+",  label: "Students",   icon: <FaUsers size={18}/> },
  { value: "2,500+",label: "Businesses", icon: <FaStore size={18}/> },
  { value: "50K+",  label: "Listings",   icon: <FaShoppingBag size={18}/> },
  { value: "8",     label: "Campuses",   icon: <FaGraduationCap size={18}/> },
];

const WHY_FEATURES = [
  { icon: <MdVerified size={24}/>,  title: "Verified Sellers",   desc: "Every vendor is identity-checked. No fake listings, no scams." },
  { icon: <MdSecurity size={24}/>,  title: "Safe Messaging",     desc: "Chat with sellers inside the app — your number stays private." },
  { icon: <FaSearch size={24}/>,    title: "Campus Search",      desc: "Find listings specific to your campus, area, or hostel." },
  { icon: <FaShieldAlt size={24}/>, title: "Buyer Protection",   desc: "Something goes wrong? Report it. We investigate every case." },
  { icon: <FaChartLine size={24}/>, title: "Seller Analytics",   desc: "See who's viewing your listings, your conversion rate, and more." },
  { icon: <FaBolt size={24}/>,      title: "List in 60 Seconds", desc: "Photo, price, publish. The fastest listing experience in Ghana." },
];

// ─── Magnetic wrapper ─────────────────────────────────────────────────────────
const Magnetic = ({ as = "button", href, children, className = "", style={}, ...props }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.10}px,${(e.clientY-r.top-r.height/2)*.10}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  const Tag   = as;
  const extra = as==="a" ? { href, target:"_blank", rel:"noopener noreferrer" } : {};
  return (
    <Tag ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className={`transition-transform duration-300 ${className}`} style={style} {...extra} {...props}>
      {children}
    </Tag>
  );
};
const MagneticLink   = (p) => <Magnetic as="a"      {...p}/>;
const MagneticButton = (p) => <Magnetic as="button" {...p}/>;

// ─── Scroll reveal ────────────────────────────────────────────────────────────
const useReveal = (threshold = 0.12) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVis(true); },{threshold});
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[]);
  return [ref, vis];
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-white/10 last:border-0">
    <button onClick={onClick} className="w-full flex items-center justify-between py-6 text-left group">
      <span className={`text-sm font-semibold pr-6 leading-snug transition-colors ${isOpen ? "text-[#ADFF6C]" : "text-white/80 group-hover:text-white"}`}>{question}</span>
      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#ADFF6C] text-[#0D1117]" : "border border-white/20 text-white/40"}`}>
        <FaChevronDown size={10} className={`transition-transform duration-300 ${isOpen?"rotate-180":""}`}/>
      </span>
    </button>
    <div className={`overflow-hidden transition-all duration-400 ${isOpen ? "max-h-48 pb-6" : "max-h-0"}`}>
      <p className="text-white/55 leading-relaxed text-sm">{answer}</p>
    </div>
  </div>
);

// ─── Live ticker ──────────────────────────────────────────────────────────────
const TICKER_COLOR = { new:"#ADFF6C", sold:"#FCD34D", live:"#60A5FA", hot:"#F87171" };
const TICKER_LABEL = { new:"NEW", sold:"SOLD", live:"LIVE", hot:"HOT🔥" };
const Ticker = () => (
  <div className="relative overflow-hidden py-3 border-t border-white/10" style={{background:"rgba(13,17,23,0.6)"}}>
    <div className="ticker-track flex gap-10 whitespace-nowrap" style={{animation:"ticker 38s linear infinite"}}>
      {[...TICKER_ITEMS,...TICKER_ITEMS].map((t,i)=>(
        <span key={i} className="flex items-center gap-2 text-xs text-white/60">
          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded" style={{color:TICKER_COLOR[t.type]||"#ADFF6C",background:(TICKER_COLOR[t.type]||"#ADFF6C")+"18"}}>
            {TICKER_LABEL[t.type]||"NEW"}
          </span>
          {t.text}
        </span>
      ))}
    </div>
  </div>
);

// ─── Phone mockup ─────────────────────────────────────────────────────────────
const PhoneMockup = ({ src, alt="", className="", style={} }) => (
  <div className={`phone-frame ${className}`} style={style}>
    <div className="phone-screen">
      <div className="phone-notch"><div className="phone-notch-bar"/></div>
      <img src={src} alt={alt} className="w-full block" style={{height:380,objectFit:"cover"}}/>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [openFAQ, setOpenFAQ]       = useState(null);
  const [email, setEmail]           = useState("");
  const [emailSent, setEmailSent]   = useState(false);
  const [activeWord, setActiveWord] = useState(0);

  const HERO_WORDS = ["Buy.", "Sell.", "Thrive."];

  useEffect(()=>{
    const s = ()=>setScrolled(window.scrollY>60);
    window.addEventListener("scroll",s);
    return ()=>window.removeEventListener("scroll",s);
  },[]);

  // Cycle hero words
  useEffect(()=>{
    const t = setInterval(()=>setActiveWord(w=>(w+1)%HERO_WORDS.length), 2000);
    return ()=>clearInterval(t);
  },[]);

  const [heroRef, heroVis]         = useReveal(0.05);
  const [storyRef, storyVis]       = useReveal();
  const [featRef, featVis]         = useReveal();
  const [catRef, catVis]           = useReveal();
  const [whyRef, whyVis]           = useReveal();
  const [statsRef, statsVis]       = useReveal();
  const [ctaRef, ctaVis]           = useReveal();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{background:"#0D1117",fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *,*::before,*::after{box-sizing:border-box;}
        html{scroll-behavior:smooth;}

        /* ── Keyframes ── */
        @keyframes fadeUp    {from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn    {from{opacity:0}to{opacity:1}}
        @keyframes floatA    {0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(1.2deg)}}
        @keyframes floatB    {0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(-0.8deg)}}
        @keyframes ticker    {from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes wordIn    {from{opacity:0;transform:translateY(20px) skewY(4deg)}to{opacity:1;transform:translateY(0) skewY(0deg)}}
        @keyframes wordOut   {from{opacity:1;transform:translateY(0) skewY(0deg)}to{opacity:0;transform:translateY(-20px) skewY(-4deg)}}
        @keyframes pulse     {0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes shimmer   {0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes gradMove  {0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes dotPulse  {0%{transform:scale(1);opacity:1}100%{transform:scale(2.5);opacity:0}}

        .anim-fade-up  {animation:fadeUp .8s cubic-bezier(.22,1,.36,1) forwards;opacity:0}
        .anim-d1       {animation-delay:.08s}
        .anim-d2       {animation-delay:.18s}
        .anim-d3       {animation-delay:.30s}
        .anim-d4       {animation-delay:.42s}
        .anim-d5       {animation-delay:.56s}
        .float-a       {animation:floatA 7s ease-in-out infinite}
        .float-b       {animation:floatB 9s ease-in-out infinite;animation-delay:-4s}

        .word-in       {animation:wordIn  .5s cubic-bezier(.22,1,.36,1) forwards}
        .word-out      {animation:wordOut .4s cubic-bezier(.22,1,.36,1) forwards}

        /* Nav glass */
        .nav-glass{
          background:rgba(13,17,23,0.8);
          backdrop-filter:blur(24px) saturate(180%);
          -webkit-backdrop-filter:blur(24px) saturate(180%);
          border-bottom:1px solid rgba(255,255,255,0.06);
        }

        /* Cards */
        .card-lift{
          transition:transform .35s cubic-bezier(.4,0,.2,1),box-shadow .35s cubic-bezier(.4,0,.2,1);
        }
        .card-lift:hover{
          transform:translateY(-6px);
          box-shadow:0 20px 48px -8px rgba(22,163,74,0.18);
        }

        /* Buttons */
        .btn-green{
          background:linear-gradient(135deg,#16A34A,#22C55E);
          color:#fff;
          transition:all .25s ease;
          display:inline-flex;
          align-items:center;
        }
        .btn-green:hover{
          box-shadow:0 8px 30px rgba(22,163,74,.4);
          transform:translateY(-1px);
          filter:brightness(1.08);
        }

        .btn-lime{
          background:#ADFF6C;
          color:#0D1117;
          font-weight:800;
          transition:all .25s ease;
          display:inline-flex;
          align-items:center;
        }
        .btn-lime:hover{
          box-shadow:0 8px 30px rgba(173,255,108,.35);
          transform:translateY(-1px);
          filter:brightness(1.06);
        }

        .btn-outline{
          background:transparent;
          border:1.5px solid rgba(255,255,255,0.18);
          color:rgba(255,255,255,0.8);
          transition:all .25s ease;
          display:inline-flex;
          align-items:center;
        }
        .btn-outline:hover{
          border-color:#ADFF6C;
          color:#ADFF6C;
          background:rgba(173,255,108,.06);
        }

        /* Phone */
        .phone-frame{
          background:linear-gradient(145deg,#1E2028,#161820);
          border-radius:2.8rem;
          padding:9px;
          box-shadow:0 40px 80px -20px rgba(0,0,0,.7),
                     0 0 0 1px rgba(255,255,255,.06) inset,
                     0 0 60px rgba(22,163,74,.15);
        }
        .phone-screen{
          border-radius:2.4rem;
          overflow:hidden;
          background:#111;
        }
        .phone-notch{
          height:20px;background:#111;
          display:flex;align-items:center;justify-content:center;
        }
        .phone-notch-bar{width:56px;height:4px;background:#2a2a2a;border-radius:2px;}

        /* Section label */
        .chip{
          display:inline-flex;align-items:center;gap:6px;
          font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
          color:#ADFF6C;
          padding:5px 12px;border-radius:100px;
          background:rgba(173,255,108,.08);
          border:1px solid rgba(173,255,108,.2);
        }

        /* Gradient text */
        .text-grad-green{
          background:linear-gradient(135deg,#22C55E,#ADFF6C);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;
        }

        /* Live dot */
        .live-dot{
          width:7px;height:7px;border-radius:50%;
          background:#22C55E;display:inline-block;position:relative;
        }
        .live-dot::after{
          content:'';position:absolute;inset:-3px;border-radius:50%;
          background:#22C55E;animation:dotPulse 1.5s ease-out infinite;
        }

        /* Animated gradient CTA bg */
        .cta-gradient{
          background:linear-gradient(135deg,#16A34A,#0F6B30,#22C55E,#15803D);
          background-size:300% 300%;
          animation:gradMove 8s ease infinite;
        }

        /* Ticker */
        .ticker-track{display:flex;gap:2.5rem;white-space:nowrap}

        /* Scrollbar */
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0D1117}
        ::-webkit-scrollbar-thumb{background:#16A34A;border-radius:2px}

        /* Section transitions */
        .reveal{transition:opacity .7s ease, transform .7s cubic-bezier(.22,1,.36,1)}
        .reveal.hidden{opacity:0;transform:translateY(28px)}
        .reveal.shown{opacity:1;transform:translateY(0)}

        /* Grid noise overlay */
        .noise::before{
          content:'';position:absolute;inset:0;
          background-image:url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.025'/%3E%3C/svg%3E");
          pointer-events:none;z-index:0;
        }

        /* Dark cards */
        .dark-card{
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:20px;
          transition:all .3s ease;
        }
        .dark-card:hover{
          background:rgba(255,255,255,0.055);
          border-color:rgba(173,255,108,0.2);
          transform:translateY(-4px);
          box-shadow:0 16px 40px rgba(0,0,0,.3);
        }

        /* Feature table row */
        .feat-row{
          display:flex;align-items:center;gap:14px;
          padding:14px 0;
          border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .feat-row:last-child{border-bottom:none;}
      `}</style>

      {/* ════════════════════════ NAVBAR ════════════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled?"nav-glass":"bg-transparent"}`}>
        <div style={{maxWidth:1280}} className="mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between" style={{height:68}}>

            {/* Logo */}
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#16A34A,#22C55E)"}}>
                <span style={{color:"#fff",fontWeight:900,fontSize:15,fontFamily:"Inter,sans-serif"}}>C</span>
              </div>
              <span style={{fontWeight:800,fontSize:17,color:"#fff",letterSpacing:"-0.3px"}}>
                Cedi<span style={{color:"#ADFF6C"}}>Mart</span>
              </span>
            </a>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map(l=>(
                <a key={l} href={`#${l.toLowerCase()}`}
                  style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.55)",transition:"color .2s"}}
                  onMouseEnter={e=>e.target.style.color="#fff"}
                  onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.55)"}>
                  {l}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <MagneticLink href={APP_STORE_URL}
                className="hidden lg:inline-flex btn-lime gap-2 px-5 py-2.5 rounded-full text-sm font-bold z-10">
                Download App <FaArrowRight size={11}/>
              </MagneticLink>
              <button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden p-2" style={{color:"#fff"}}>
                {mobileOpen ? <FaTimes size={20}/> : <FaBars size={20}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden mx-4 mt-2 rounded-2xl overflow-hidden" style={{background:"#161B22",border:"1px solid rgba(255,255,255,0.08)"}}>
            {NAV_LINKS.map(l=>(
              <a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMobileOpen(false)}
                className="block px-6 py-4 text-sm font-medium" style={{color:"rgba(255,255,255,0.65)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {l}
              </a>
            ))}
            <div className="p-4">
              <a href="#download" onClick={()=>setMobileOpen(false)}
                className="btn-lime block w-full py-3.5 rounded-xl text-sm font-bold text-center">
                Download App
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section id="home" className="relative overflow-hidden noise" ref={heroRef}
        style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",
          background:"linear-gradient(160deg,#0D1117 60%,#0A1F12 100%)"}}>

        {/* Glows */}
        <div style={{position:"absolute",top:"10%",left:"55%",width:600,height:600,
          background:"radial-gradient(circle,rgba(22,163,74,0.12) 0%,transparent 70%)",
          filter:"blur(40px)",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",bottom:"0%",left:"-5%",width:500,height:500,
          background:"radial-gradient(circle,rgba(173,255,108,0.06) 0%,transparent 70%)",
          filter:"blur(60px)",pointerEvents:"none",zIndex:0}}/>

        {/* Grid lines */}
        <div style={{position:"absolute",inset:0,
          backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",
          backgroundSize:"80px 80px",pointerEvents:"none",zIndex:0}}/>

        <div style={{maxWidth:1280,margin:"0 auto",padding:"100px 48px 0",width:"100%",position:"relative",zIndex:1}}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              {/* Live pill */}
              <div className={`anim-fade-up mb-6 flex items-center gap-3`}>
                <span className="chip">
                  <span className="live-dot"/>
                  Live across 8 campuses
                </span>
              </div>

              {/* Headline */}
              <div className="anim-fade-up anim-d1 mb-6">
                {/* Cycling word */}
                <div style={{fontSize:"clamp(42px,6vw,76px)",fontWeight:900,lineHeight:1.0,letterSpacing:"-2px",marginBottom:4}}>
                  <div style={{height:"1.1em",overflow:"hidden",position:"relative"}}>
                    {HERO_WORDS.map((w,i)=>(
                      <span key={w} className={activeWord===i?"word-in":""}
                        style={{
                          position:"absolute",top:0,left:0,
                          display:"block",
                          color: i===0?"#ADFF6C" : i===1?"#22C55E" : "#fff",
                          opacity: activeWord===i ? 1 : 0,
                          fontFamily:"Inter,sans-serif",
                          transition: activeWord===i ? "none" : "opacity 0.1s",
                        }}>
                        {w}
                      </span>
                    ))}
                  </div>
                  <span style={{color:"#fff",display:"block",marginTop:8}}>
                    Campus
                  </span>
                  <span className="text-grad-green" style={{display:"block"}}>
                    Marketplace.
                  </span>
                </div>
              </div>

              <p className="anim-fade-up anim-d2 mb-10"
                style={{fontSize:17,color:"rgba(255,255,255,0.5)",lineHeight:1.7,maxWidth:420,fontWeight:400}}>
                Ghana's first marketplace built for student life — buy, sell, and discover products from verified sellers on your campus.
              </p>

              {/* CTAs */}
              <div className="anim-fade-up anim-d3 flex flex-wrap gap-3 mb-10">
                <MagneticLink href={PLAY_STORE_URL}
                  className="btn-lime gap-3 px-6 py-4 rounded-2xl font-bold z-10"
                  style={{fontSize:14}}>
                  <FaGooglePlay size={18}/>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:9,opacity:.6,letterSpacing:"0.12em",textTransform:"uppercase"}}>Get it on</div>
                    <div style={{fontWeight:800}}>Google Play</div>
                  </div>
                </MagneticLink>
                <MagneticLink href={APP_STORE_URL}
                  className="btn-outline gap-3 px-6 py-4 rounded-2xl font-semibold z-10"
                  style={{fontSize:14}}>
                  <FaApple size={20}/>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:9,opacity:.6,letterSpacing:"0.12em",textTransform:"uppercase"}}>Download on the</div>
                    <div style={{fontWeight:700}}>App Store</div>
                  </div>
                </MagneticLink>
              </div>

              {/* Social proof */}
              <div className="anim-fade-up anim-d4 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">{[...Array(5)].map((_,i)=><FaStar key={i} size={12} style={{color:"#FCD34D"}}/>)}</div>
                  <span style={{fontWeight:700,color:"#fff",fontSize:13}}>4.9</span>
                  <span style={{color:"rgba(255,255,255,0.3)",fontSize:13}}>· 10K+ students</span>
                </div>
                <div style={{width:1,height:20,background:"rgba(255,255,255,0.1)"}}/>
                <div className="flex items-center gap-2">
                  {CAMPUSES.slice(0,4).map(c=>(
                    <span key={c} style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.4)",
                      background:"rgba(255,255,255,0.05)",borderRadius:20,padding:"3px 9px",
                      border:"1px solid rgba(255,255,255,0.08)"}}>
                      {c.split(" ")[0] === "University" ? "UG" : c.split(",")[0].split(" ")[0]}
                    </span>
                  ))}
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>+4 more</span>
                </div>
              </div>
            </div>

            {/* Right — phones */}
            <div className="flex lg:flex justify-end items-center relative" style={{ height: 560 }}>
            <div className="float-b absolute left-0 top-10 z-0 opacity-70">
              <img 
                src="https://res.cloudinary.com/duv3qvvjz/image/upload/v1782494417/cedimart_web_image_1_i4q8m9.png" 
                alt="App home" 
                className="w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px] xl:w-[420px] h-auto rounded-2xl shadow-xl"
              />
            </div>
            <div className="float-a absolute right-0 top-0 z-10">
              <img 
                src="https://res.cloudinary.com/duv3qvvjz/image/upload/v1782495541/cedimar_web_image_2_ghcppr.png" 
                alt="App browse" 
                className="w-[280px] sm:w-[320px] md:w-[380px] lg:w-[440px] xl:w-[520px] h-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
          </div>
        </div>

       
      </section>

      {/* ════════════════════════ STATS BAR ════════════════════════ */}
      <div style={{background:"#111318",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"28px 48px"}}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s,i)=>(
              <div key={i} ref={statsRef} className={`text-center reveal ${statsVis?"shown":"hidden"}`} style={{transitionDelay:`${i*80}ms`}}>
                <div style={{fontSize:"clamp(32px,4vw,48px)",fontWeight:900,color:"#fff",letterSpacing:"-1px",lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:6}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════ VIDEO SECTION ════════════════════════ */}
      <section style={{padding:"80px 48px",background:"#0D1117"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{borderRadius:28,overflow:"hidden",aspectRatio:"16/9",position:"relative",
            boxShadow:"0 40px 80px rgba(0,0,0,.6)",cursor:"pointer"}}
            className="group">
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280&q=80"
              alt="CediMart" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            <div style={{position:"absolute",inset:0,background:"rgba(13,17,23,0.65)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
              <div style={{width:72,height:72,borderRadius:"50%",
                background:"rgba(173,255,108,0.12)",border:"1.5px solid rgba(173,255,108,0.35)",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .3s",cursor:"pointer",backdropFilter:"blur(8px)"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#ADFF6C";e.currentTarget.style.border="1.5px solid #ADFF6C";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(173,255,108,0.12)";e.currentTarget.style.border="1.5px solid rgba(173,255,108,0.35)";}}>
                <div style={{width:0,height:0,borderLeft:"22px solid #fff",
                  borderTop:"13px solid transparent",borderBottom:"13px solid transparent",marginLeft:4}}/>
              </div>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:500,letterSpacing:"0.05em"}}>
                Watch CediMart in action
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ BRAND STORY ════════════════════════ */}
      <section id="about" ref={storyRef} style={{padding:"96px 48px",background:"#111318"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>

          {/* Header */}
          <div className={`reveal ${storyVis?"shown":"hidden"}`} style={{maxWidth:640,marginBottom:64}}>
            <span className="chip mb-5" style={{display:"inline-flex"}}>Our Mission</span>
            <h2 style={{fontSize:"clamp(36px,5vw,60px)",fontWeight:900,color:"#fff",lineHeight:1.05,
              letterSpacing:"-1.5px",margin:"16px 0 20px"}}>
              Campus commerce,{" "}
              <span className="text-grad-green">finally easy.</span>
            </h2>
            <p style={{fontSize:17,color:"rgba(255,255,255,0.45)",lineHeight:1.75,margin:0}}>
              We built CediMart because buying a textbook, selling your old laptop, or finding a trusted food vendor on campus shouldn't require WhatsApp groups, random Facebook posts, or hoping someone puts a flyer on the notice board.
            </p>
          </div>

          {/* Three cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { num:"01", icon:<FaShoppingBag size={20}/>, title:"Buying is effortless",
                desc:"Find exactly what you need — from course materials to electronics — listed by students on your own campus. No shipping. No strangers.",
                img:"https://res.cloudinary.com/duv3qvvjz/image/upload/v1781101245/fashion_banner_ibwmaz.png",
                color:"#22C55E" },
              { num:"02", icon:<FaRocket size={20}/>, title:"Selling is instant",
                desc:"List a product in 60 seconds, reach thousands of buyers. Manage orders, messages, and reviews all from one clean dashboard.",
                img:"https://res.cloudinary.com/duv3qvvjz/image/upload/v1780782982/flyer13_1_fyp0xj.png",
                color:"#ADFF6C" },
              { num:"03", icon:<FaChartLine size={20}/>, title:"Businesses grow fast",
                desc:"Your campus business deserves real tools — analytics, repeat customers, and a verified badge that builds trust instantly.",
                img:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
                color:"#60A5FA" },
            ].map((card,i)=>(
              <div key={i}
                className={`dark-card overflow-hidden reveal ${storyVis?"shown":"hidden"}`}
                style={{transitionDelay:`${i*100+200}ms`}}>
                <div style={{height:180,overflow:"hidden",position:"relative"}}>
                  <img src={card.img} alt={card.title}
                    style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .5s ease"}}
                    onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                    onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,17,23,.9),transparent)"}}/>
                </div>
                <div style={{padding:"24px 24px 28px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{width:36,height:36,borderRadius:10,background:card.color+"18",
                      display:"flex",alignItems:"center",justifyContent:"center",color:card.color}}>
                      {card.icon}
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:card.color,letterSpacing:"0.14em"}}>{card.num}</span>
                  </div>
                  <h3 style={{fontSize:18,fontWeight:800,color:"#fff",margin:"0 0 10px",letterSpacing:"-0.3px"}}>{card.title}</h3>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.65,margin:0}}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ FEATURES SPLIT ════════════════════════ */}
      <section id="features" ref={featRef} style={{padding:"96px 48px",background:"#0D1117"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Phone */}
            <div className={`flex justify-center reveal ${featVis ? "visible" : ""}`}>
              <div className="float-a w-[280px] sm:w-[340px] md:w-[400px] lg:w-[480px] xl:w-[560px]">
                <img 
                  src="https://res.cloudinary.com/duv3qvvjz/image/upload/v1782495541/cedimar_web_image_2_ghcppr.png" 
                  alt="Marketplace"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Content */}
            <div className={`reveal ${featVis?"shown":"hidden"}`} style={{transitionDelay:"150ms"}}>
              <span className="chip mb-5" style={{display:"inline-flex"}}>The Marketplace</span>
              <h2 style={{fontSize:"clamp(32px,4.5vw,54px)",fontWeight:900,color:"#fff",lineHeight:1.05,
                letterSpacing:"-1px",margin:"14px 0 18px"}}>
                Everything campus life needs.
                <br/><span className="text-grad-green">One app.</span>
              </h2>
              <p style={{fontSize:15,color:"rgba(255,255,255,0.45)",lineHeight:1.7,marginBottom:28}}>
                From the textbook you need before Monday's lecture to the laptop you want to sell before exams — it's all here.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-10">
                {["Electronics","Fashion","Food & Drinks","Hostel Items","Course Materials","Phones & Tablets","Beauty","Services","Furniture","And more…"].map(item=>(
                  <div key={item} className="flex items-center gap-2.5" style={{color:"rgba(255,255,255,0.55)",fontSize:13}}>
                    <FaCheck size={10} style={{color:"#22C55E",flexShrink:0}}/>
                    {item}
                  </div>
                ))}
              </div>

              <MagneticLink href={PLAY_STORE_URL}
                className="btn-green gap-2.5 px-7 py-4 rounded-2xl font-bold z-10" style={{fontSize:14}}>
                Start Shopping Free <FaArrowRight size={13}/>
              </MagneticLink>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ BUSINESS GROWTH ════════════════════════ */}
      <section id="businesses" style={{padding:"96px 48px",background:"#111318"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            <div>
              <span className="chip mb-5" style={{display:"inline-flex",color:"#60A5FA",background:"rgba(96,165,250,0.08)",borderColor:"rgba(96,165,250,0.2)"}}>
                For Student Entrepreneurs
              </span>
              <h2 style={{fontSize:"clamp(32px,4.5vw,54px)",fontWeight:900,color:"#fff",lineHeight:1.05,
                letterSpacing:"-1px",margin:"14px 0 18px"}}>
                Your campus business
                <br/><span style={{background:"linear-gradient(135deg,#60A5FA,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>deserves to grow.</span>
              </h2>
              <p style={{fontSize:15,color:"rgba(255,255,255,0.45)",lineHeight:1.7,marginBottom:32}}>
                Whether you're selling phone accessories out of your dorm or running a food delivery service across campus — CediMart gives you the tools to reach more students, earn more, and build something real.
              </p>

              <div style={{marginBottom:36}}>
                {[
                  { icon:<FaUsers size={15}/>, text:"Reach 10,000+ active campus buyers from day one" },
                  { icon:<FaBolt size={15}/>, text:"List your first product in under 60 seconds" },
                  { icon:<FaChartLine size={15}/>, text:"Track views, sales, and favourites in real-time" },
                  { icon:<FaHeart size={15}/>, text:"Build loyal repeat customers through the app" },
                  { icon:<MdVerified size={15}/>, text:"Get a Verified badge that earns instant trust" },
                ].map((item,i)=>(
                  <div key={i} className="feat-row">
                    <div style={{width:34,height:34,borderRadius:10,background:"rgba(96,165,250,0.1)",
                      display:"flex",alignItems:"center",justifyContent:"center",color:"#60A5FA",flexShrink:0}}>
                      {item.icon}
                    </div>
                    <span style={{fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{item.text}</span>
                  </div>
                ))}
              </div>

              <MagneticLink href={PLAY_STORE_URL}
                className="btn-green gap-2.5 px-7 py-4 rounded-2xl font-bold z-10" style={{fontSize:14}}>
                Open Your Shop Free <FaArrowRight size={13}/>
              </MagneticLink>
            </div>

            {/* Dashboard image */}
            <div style={{borderRadius:24,overflow:"hidden",
              boxShadow:"0 30px 60px rgba(0,0,0,.5)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                alt="Analytics" style={{width:"100%",height:420,objectFit:"cover",display:"block"}}/>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ CATEGORIES ════════════════════════ */}
      <section ref={catRef} style={{padding:"96px 48px",background:"#0D1117"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>

          <div className={`reveal ${catVis?"shown":"hidden"}`} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:56,flexWrap:"wrap",gap:16}}>
            <div>
              <span className="chip mb-4" style={{display:"inline-flex"}}>Browse</span>
              <h2 style={{fontSize:"clamp(32px,4vw,52px)",fontWeight:900,color:"#fff",
                letterSpacing:"-1px",lineHeight:1.05,margin:"12px 0 0"}}>
                What will you
                <br/><span className="text-grad-green">find today?</span>
              </h2>
            </div>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",maxWidth:280,textAlign:"right",lineHeight:1.6}}>
              Thousands of products listed daily by students at your campus.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat,i)=>(
              <div key={i}
                className={`dark-card p-5 cursor-pointer group reveal ${catVis?"shown":"hidden"}`}
                style={{transitionDelay:`${i*40}ms`}}>
                <div style={{width:44,height:44,borderRadius:14,
                  background:cat.bg+"18",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:cat.color,marginBottom:14,
                  transition:"background .3s"}}>
                  {cat.icon}
                </div>
                <h3 style={{fontSize:13,fontWeight:700,color:"#fff",margin:"0 0 4px"}}>{cat.title}</h3>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>{cat.color}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ WHY CEDIMART ════════════════════════ */}
      <section ref={whyRef} style={{padding:"96px 48px",background:"#111318"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div className={`text-center reveal ${whyVis?"shown":"hidden"}`} style={{maxWidth:560,margin:"0 auto 64px"}}>
            <span className="chip mb-5" style={{display:"inline-flex",margin:"0 auto 20px"}}>Why Us</span>
            <h2 style={{fontSize:"clamp(32px,4.5vw,52px)",fontWeight:900,color:"#fff",lineHeight:1.05,letterSpacing:"-1px"}}>
              Built different.
              <br/><span className="text-grad-green">For campus life.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_FEATURES.map((f,i)=>(
              <div key={i}
                className={`dark-card p-7 group reveal ${whyVis?"shown":"hidden"}`}
                style={{transitionDelay:`${i*60}ms`}}>
                <div style={{width:46,height:46,borderRadius:14,background:"rgba(22,163,74,0.1)",
                  display:"flex",alignItems:"center",justifyContent:"center",color:"#22C55E",
                  marginBottom:18,transition:"background .3s, color .3s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#22C55E";e.currentTarget.style.color="#fff";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(22,163,74,0.1)";e.currentTarget.style.color="#22C55E";}}>
                  {f.icon}
                </div>
                <h3 style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.65,margin:0}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ TESTIMONIALS ════════════════════════ */}
      <section id="testimonials" style={{padding:"96px 48px",background:"#0D1117"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div className="text-center" style={{maxWidth:520,margin:"0 auto 64px"}}>
            <span className="chip mb-5" style={{display:"inline-flex",margin:"0 auto 20px"}}>Stories</span>
            <h2 style={{fontSize:"clamp(32px,4.5vw,52px)",fontWeight:900,color:"#fff",lineHeight:1.05,letterSpacing:"-1px"}}>
              Real students.
              <br/><span className="text-grad-green">Real results.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="dark-card" style={{padding:32,display:"flex",flexDirection:"column"}}>
                <div style={{display:"flex",gap:2,marginBottom:16}}>
                  {[...Array(5)].map((_,j)=><FaStar key={j} size={13} style={{color:"#FCD34D"}}/>)}
                </div>
                <FaQuoteLeft size={22} style={{color:"rgba(173,255,108,0.4)",marginBottom:16}}/>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.55)",lineHeight:1.75,flex:1,marginBottom:24}}>
                  "{t.quote}"
                </p>
                <div style={{display:"flex",alignItems:"center",gap:12,
                  paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#16A34A,#22C55E)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"#fff",fontWeight:800,fontSize:14,flexShrink:0}}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{fontWeight:700,color:"#fff",fontSize:13,margin:"0 0 2px"}}>{t.name}</p>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>{t.role}</p>
                  </div>
                  <span style={{marginLeft:"auto",fontSize:10,fontWeight:700,color:"#ADFF6C",
                    background:"rgba(173,255,108,0.1)",borderRadius:20,padding:"3px 9px",
                    border:"1px solid rgba(173,255,108,0.2)"}}>
                    {t.campus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ FAQ ════════════════════════ */}
      <section id="faq" style={{padding:"96px 48px",background:"#111318"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{marginBottom:48}}>
            <span className="chip mb-5" style={{display:"inline-flex"}}>FAQ</span>
            <h2 style={{fontSize:"clamp(32px,4vw,52px)",fontWeight:900,color:"#fff",
              letterSpacing:"-1px",lineHeight:1.05,margin:"14px 0 0"}}>
              Got questions?
              <br/><span className="text-grad-green">We have answers.</span>
            </h2>
          </div>
          <div style={{borderRadius:20,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)"}}>
            <div style={{padding:"0 28px"}}>
              {FAQS.map((faq,i)=>(
                <FAQItem key={i} question={faq.q} answer={faq.a}
                  isOpen={openFAQ===i} onClick={()=>setOpenFAQ(openFAQ===i?null:i)}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ CTA ════════════════════════ */}
      <section id="download" ref={ctaRef} style={{padding:"80px 48px",background:"#0D1117"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div className={`cta-gradient reveal ${ctaVis?"shown":"hidden"}`}
            style={{borderRadius:36,padding:"72px 64px",textAlign:"center",position:"relative",overflow:"hidden"}}>

            {/* Noise texture */}
            <div style={{position:"absolute",inset:0,
              backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")",
              pointerEvents:"none"}}/>

            {/* Dots */}
            <div style={{position:"absolute",inset:0,opacity:0.05,
              backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)",
              backgroundSize:"32px 32px",pointerEvents:"none"}}/>

            <div style={{position:"relative",zIndex:1}}>
              <span className="chip mb-6" style={{display:"inline-flex",
                color:"rgba(255,255,255,0.9)",background:"rgba(255,255,255,0.15)",borderColor:"rgba(255,255,255,0.25)"}}>
                <FaRocket size={10}/> Get Started Today
              </span>
              <h2 style={{fontSize:"clamp(36px,5vw,68px)",fontWeight:900,color:"#fff",
                lineHeight:1.0,letterSpacing:"-2px",margin:"16px 0 18px"}}>
                Your campus marketplace<br/>is waiting.
              </h2>
              <p style={{fontSize:17,color:"rgba(255,255,255,0.7)",marginBottom:44,
                maxWidth:480,margin:"0 auto 44px",lineHeight:1.65}}>
                Join 10,000+ students already buying and selling on CediMart. Free forever. No hidden fees.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                <MagneticLink href={APP_STORE_URL}
                  className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl font-semibold z-10"
                  style={{background:"#fff",color:"#0D1117",fontSize:14,boxShadow:"0 8px 32px rgba(0,0,0,.2)"}}>
                  <FaApple size={22}/>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:9,opacity:.45,letterSpacing:"0.12em",textTransform:"uppercase"}}>Download on the</div>
                    <div style={{fontWeight:800,fontSize:15}}>App Store</div>
                  </div>
                </MagneticLink>
                <MagneticLink href={PLAY_STORE_URL}
                  className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl font-semibold z-10"
                  style={{background:"rgba(255,255,255,0.12)",color:"#fff",border:"1.5px solid rgba(255,255,255,0.2)",fontSize:14}}>
                  <FaGooglePlay size={20}/>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:9,opacity:.55,letterSpacing:"0.12em",textTransform:"uppercase"}}>Get it on</div>
                    <div style={{fontWeight:800,fontSize:15}}>Google Play</div>
                  </div>
                </MagneticLink>
              </div>

              <div className="flex items-center justify-center gap-6 flex-wrap" style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>
                {["Free to download","No hidden fees","10,000+ students","8 campuses"].map((item,i)=>(
                  <span key={i} className="flex items-center gap-1.5">
                    <FaCheck size={9} style={{color:"rgba(255,255,255,0.8)"}}/>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer style={{background:"#060A0E",borderTop:"1px solid rgba(255,255,255,0.05)",
        padding:"72px 48px 40px",color:"rgba(255,255,255,0.35)",fontFamily:"Inter,sans-serif"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10" style={{marginBottom:60}}>

            {/* Brand */}
            <div style={{gridColumn:"span 2"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#16A34A,#22C55E)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"#fff",fontWeight:900,fontSize:15}}>C</span>
                </div>
                <span style={{fontWeight:800,fontSize:17,color:"#fff"}}>
                  CediMart<span style={{color:"#ADFF6C"}}>.</span>
                </span>
              </div>
              <p style={{fontSize:13,lineHeight:1.75,maxWidth:280,marginBottom:20,color:"rgba(255,255,255,0.3)"}}>
                Ghana's campus marketplace. Buy, sell, and discover from verified student sellers across the country.
              </p>
              <div style={{display:"flex",gap:10}}>
                {[FaTwitter,FaInstagram,FaLinkedin,FaYoutube].map((Icon,i)=>(
                  <a key={i} href="#"
                    style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.04)",
                      border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",
                      justifyContent:"center",color:"rgba(255,255,255,0.4)",transition:"all .2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="#ADFF6C";e.currentTarget.style.color="#0D1117";e.currentTarget.style.borderColor="#ADFF6C";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(255,255,255,0.4)";e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>
                    <Icon size={13}/>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title:"Company", links:["About","Careers","Blog","Press"] },
              { title:"Support", links:["Help Center","Contact","Safety","Community"] },
              { title:"Legal",   links:["Privacy","Terms","Cookies","Licenses"] },
            ].map(col=>(
              <div key={col.title}>
                <h4 style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)",
                  letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:18}}>{col.title}</h4>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {col.links.map(l=>(
                    <a key={l} href="#" style={{fontSize:13,color:"rgba(255,255,255,0.3)",transition:"color .2s",textDecoration:"none"}}
                      onMouseEnter={e=>e.target.style.color="#ADFF6C"}
                      onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:40,marginBottom:40}}>
            <div style={{maxWidth:400}}>
              <h4 style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.6)",marginBottom:6}}>Stay in the loop</h4>
              <p style={{fontSize:12,marginBottom:14}}>New campus launches, features, and deals.</p>
              <div style={{display:"flex",gap:8}}>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{flex:1,padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:13,outline:"none",
                    fontFamily:"Inter,sans-serif"}}/>
                <button onClick={()=>{setEmailSent(true);setTimeout(()=>setEmailSent(false),3000);}}
                  style={{background:"#ADFF6C",color:"#0D1117",fontWeight:800,padding:"12px 18px",
                    borderRadius:12,fontSize:13,border:"none",cursor:"pointer",flexShrink:0}}>
                  {emailSent?"✓":"Subscribe"}
                </button>
              </div>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12,borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:28}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:16,justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:12,margin:0}}>© {new Date().getFullYear()} CediMart. All rights reserved.</p>
              <div style={{display:"flex",gap:20}}>
                {["Privacy Policy","Terms of Service","Cookie Policy"].map(l=>(
                  <a key={l} href="#" style={{fontSize:11,color:"rgba(255,255,255,0.2)",textDecoration:"none",transition:"color .2s"}}
                    onMouseEnter={e=>e.target.style.color="#ADFF6C"}
                    onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.2)"}>
                    {l}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;