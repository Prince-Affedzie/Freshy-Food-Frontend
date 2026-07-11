import React, { useState, useEffect, useRef } from "react";
import {
  FaApple, FaGooglePlay, FaBars, FaTimes, FaArrowRight, FaStar,
  FaShieldAlt, FaBolt, FaCheck, FaChevronDown, FaChevronLeft, FaChevronRight,
  FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaQuoteLeft,
  FaShoppingBag, FaRocket, FaWhatsapp, FaEnvelope, FaMapMarkerAlt,
} from "react-icons/fa";
import { MdVerified, MdSecurity, MdStorefront } from "react-icons/md";

// ─── Store / contact URLs ──────────────────────────────────────────────────────
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.freshyfood.factory";
const APP_STORE_URL  = "https://apps.apple.com/us/app/cedimart/id6762318566";
const WHATSAPP_URL   = "https://wa.me/233505671577";
const SUPPORT_EMAIL  = "mailto:support@cedimart.app";

const NAV_LINKS = ["How it works", "For sellers", "Campuses", "FAQ"];

// ─── CediMart Brand Colors ──────────────────────────────────────────────────
const INK     = "#0B3D2E";      // Deep green-black
const INK_SOFT= "#5A7D6A";      // Muted green-gray
const PAPER   = "#FAFCF9";      // Soft warm white with green tint
const LINE    = "#D4E5D9";      // Green-tinted border
const BRAND   = "#16A34A";      // CediMart primary green (#16A34A)
const BRAND_B = "#22C55E";      // Lighter accent green
const GOLD    = "#D4A024";      // CediMart gold accent
const SURFACE  = "#FFFFFF";

const CAMPUSES = [
  { code: "UG",     name: "University of Ghana",         area: "Legon, Accra" },
  { code: "KNUST",  name: "KNUST",                        area: "Kumasi" },
  { code: "UCC",    name: "University of Cape Coast",     area: "Cape Coast" },
  { code: "UPSA",   name: "UPSA",                          area: "Accra" },
  { code: "GIMPA",  name: "GIMPA",                         area: "Accra" },
  { code: "ASHESI", name: "Ashesi University",             area: "Berekuso" },
  { code: "UEW",    name: "University of Education",       area: "Winneba" },
  { code: "ATU",    name: "Accra Technical University",    area: "Accra" },
];

const TRUST_STRIP = [
  { icon: <MdVerified size={26}/>, title: "Verified sellers", sub: "Every vendor is ID-checked before their first listing." },
  { icon: <FaShieldAlt size={26}/>, title: "Buyer protection", sub: "Report an issue and we investigate every case." },
  { icon: <FaBolt size={26}/>, title: "Zero listing fees", sub: "List as many products as you want, for free." },
  { icon: <FaStar size={26}/>, title: "10,000+ students", sub: "Already buying and selling across 8 campuses." },
];

const TIERS = [
  { tag: "For Buyers", title: "Browse & buy", stat: "50K+ listings",
    desc: "Course materials, electronics, fashion, and hostel items — all listed by verified students on your own campus.",
    img: "https://res.cloudinary.com/duv3qvvjz/image/upload/v1781101245/fashion_banner_ibwmaz.png" },
  { tag: "For Sellers", title: "List & sell", stat: "60-second listing",
    desc: "Photo, price, publish. Chat with buyers, negotiate, and manage every sale from one clean inbox.",
    img: "https://res.cloudinary.com/duv3qvvjz/image/upload/v1780782982/flyer13_1_fyp0xj.png" },
  { tag: "For Businesses", title: "Open a shop", stat: "2,500+ shops live",
    desc: "Run a real campus business — analytics, repeat customers, and a verified badge that earns instant trust.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80" },
];

const FEATURED_QUOTE = {
  quote: "I furnished my whole hostel room through CediMart. Found everything within my campus — no delivery fees, no stress. It's genuinely the first app that's made buying and selling on campus feel effortless.",
  name: "Akua Mensah", role: "3rd Year, University of Ghana",
};

const REVIEW_QUOTES = [
  { quote: "Started selling refurbished phones six months ago. Now I have two hundred regular customers and I pay my own fees.", name: "Kofi Asante", role: "Phone Seller, KNUST" },
  { quote: "My little clothing business now reaches three thousand students across four campuses.", name: "Ama Serwaa", role: "Fashion Designer, UPSA" },
  { quote: "Chat, negotiate, and meet up safely — all inside one app. I stopped using WhatsApp groups completely.", name: "Kwame Owusu", role: "Buyer, UCC" },
];

const STORIES = [
  { img: "https://res.cloudinary.com/duv3qvvjz/image/upload/v1782494417/cedimart_web_image_1_i4q8m9.png", tag: "Electronics", quote: "Sold my old laptop in a day. Met the buyer at the library, done." },
  { img: "https://res.cloudinary.com/duv3qvvjz/image/upload/v1782495541/cedimar_web_image_2_ghcppr.png", tag: "Fashion", quote: "My shop went from zero to 40 orders a week in one semester." },
  { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80", tag: "Services", quote: "I list my tutoring sessions and repairs — steady income every week." },
];

const FAQS = [
  { q: "What is CediMart?", a: "CediMart is Ghana's campus marketplace — a place for verified students to buy, sell, and discover products and services without leaving their own campus. No shipping, no strangers from across the country, no WhatsApp groups to keep track of." },
  { q: "Is it free to use?", a: "Yes, completely. Browsing is free, creating an account is free, and listing products as a seller is free — we only take a small commission on completed sales, so you only pay when you actually earn." },
  { q: "How do I start selling?", a: "Download the app, verify your student details, and set up your shop in under five minutes. Add your first listing with photos and a price, and you're live — your first buyer could message you within hours." },
  { q: "Are sellers really verified?", a: "Every vendor goes through identity verification before their first listing goes live. We check IDs, monitor buyer reviews, and act quickly on any reports to keep the marketplace safe for everyone." },
  { q: "Which campuses are live right now?", a: "UG, KNUST, UCC, UPSA, GIMPA, Ashesi, UEW, and ATU are all live today, with new campuses launching every month. Your listings and search results are automatically scoped to your own campus." },
  { q: "How do meet-ups work?", a: "You arrange a safe, on-campus meet-up directly with the seller — a library, the SRC building, or a canteen. We provide a safety guide for every transaction and an easy way to report anything that feels wrong." },
];

// ─── Shared components ──────────────────────────────────────────────────────
const Magnetic = ({ as = "button", href, children, className = "", style = {}, ...props }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .10}px,${(e.clientY - r.top - r.height / 2) * .10}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  const Tag = as;
  const extra = as === "a" ? { href, target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Tag ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className={`transition-transform duration-300 ${className}`} style={style} {...extra} {...props}>
      {children}
    </Tag>
  );
};
const MagneticLink = (p) => <Magnetic as="a" {...p} />;

const SpotlightCard = ({ className = "", style = {}, children }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return <div ref={ref} onMouseMove={onMove} className={`spotlight-card ${className}`} style={style}>{children}</div>;
};

const useReveal = (threshold = 0.12) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
};

const Kicker = ({ children, style = {} }) => <span className="kicker" style={style}>{children}</span>;

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b" style={{ borderColor: LINE }}>
    <button onClick={onClick} className="w-full flex items-center justify-between py-7 text-left group">
      <span className="text-[16px] font-medium pr-6 leading-snug transition-colors" style={{ color: isOpen ? BRAND : INK }}>{question}</span>
      <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
        style={{ background: isOpen ? BRAND : "transparent", border: `1px solid ${isOpen ? BRAND : LINE}`, color: isOpen ? "#fff" : INK_SOFT }}>
        <FaChevronDown size={10} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}/>
      </span>
    </button>
    <div className={`overflow-hidden transition-all duration-400 ${isOpen ? "max-h-64 pb-7" : "max-h-0"}`}>
      <p style={{ color: INK_SOFT, lineHeight: 1.75, fontSize: 15, maxWidth: 620 }}>{answer}</p>
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
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);

  const [trustRef, trustVis]   = useReveal();
  const [tierRef, tierVis]     = useReveal();
  const [statRef, statVis]     = useReveal();
  const [payRef, payVis]       = useReveal();
  const [storyRef, storyVis]   = useReveal();
  const [reviewRef, reviewVis] = useReveal();
  const [campusRef, campusVis] = useReveal();
  const [supportRef, supportVis] = useReveal();
  const [ctaRef, ctaVis]       = useReveal();

  const r = REVIEW_QUOTES[activeReview];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: PAPER, fontFamily: "'Inter',-apple-system,sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        :focus-visible{outline:2px solid ${BRAND};outline-offset:3px;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotPulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.2);opacity:0}}
        @media (prefers-reduced-motion: reduce){*{animation-duration:0.001ms !important;transition-duration:0.001ms !important;}}

        .anim-fade-up{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) forwards;opacity:0}
        .anim-d1{animation-delay:.08s} .anim-d2{animation-delay:.16s} .anim-d3{animation-delay:.26s}

        .nav-glass{background:rgba(250,252,249,0.86);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border-bottom:1px solid ${LINE};}
        .serif-italic{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;}

        .btn-primary{background:${BRAND};color:#fff;transition:all .25s cubic-bezier(.4,0,.2,1);display:inline-flex;align-items:center;}
        .btn-primary:hover{background:${INK};transform:translateY(-1px);box-shadow:0 12px 28px -8px rgba(22,163,74,.45);}
        .btn-dark{background:${INK};color:#fff;transition:all .25s cubic-bezier(.4,0,.2,1);display:inline-flex;align-items:center;}
        .btn-dark:hover{background:${BRAND};transform:translateY(-1px);box-shadow:0 12px 28px -8px rgba(22,163,74,.45);}
        .btn-white{background:#fff;color:${INK};transition:all .25s ease;display:inline-flex;align-items:center;}
        .btn-white:hover{transform:translateY(-1px);box-shadow:0 12px 28px -8px rgba(0,0,0,.3);}
        .btn-outline{background:transparent;border:1px solid ${LINE};color:${INK};transition:all .22s ease;display:inline-flex;align-items:center;}
        .btn-outline:hover{border-color:${INK};background:#fff;}

        .kicker{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${INK_SOFT};display:inline-flex;align-items:center;gap:8px;}
        .kicker::before{content:'';width:14px;height:1px;background:${BRAND};display:inline-block;}

        .spotlight-card{position:relative;overflow:hidden;background:${SURFACE};border:1px solid ${LINE};transition:border-color .3s ease, transform .3s ease, box-shadow .3s ease;}
        .spotlight-card::before{content:'';position:absolute;inset:0;background:radial-gradient(480px circle at var(--x,50%) var(--y,50%), rgba(22,163,74,0.08), transparent 60%);opacity:0;transition:opacity .35s ease;pointer-events:none;}
        .spotlight-card:hover{border-color:${BRAND};transform:translateY(-3px);box-shadow:0 18px 40px -18px rgba(11,61,46,.25);}
        .spotlight-card:hover::before{opacity:1;}

        .live-dot{width:6px;height:6px;border-radius:50%;background:${BRAND};display:inline-block;position:relative;}
        .live-dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:${BRAND};animation:dotPulse 1.6s ease-out infinite;}

        .reveal{transition:opacity .8s ease, transform .8s cubic-bezier(.22,1,.36,1)}
        .reveal.hidden{opacity:0;transform:translateY(26px)}
        .reveal.shown{opacity:1;transform:translateY(0)}

        .pay-chip{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:100px;border:1px solid ${LINE};background:${SURFACE};font-size:13px;font-weight:600;color:${INK};}

        .story-card{scroll-snap-align:start;flex:0 0 300px;}
        .story-scroll{scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
        .story-scroll::-webkit-scrollbar{display:none;}

        .cta-row{display:flex;flex-direction:row;gap:12px;flex-wrap:nowrap;}
        @media (max-width: 400px) {
          .cta-row{flex-direction:row;gap:10px;}
          .cta-row .cta-btn{flex:1;min-width:0;justify-content:center;padding-left:12px;padding-right:12px;}
        }
      `}</style>

      {/* ════════════════════════ ANNOUNCEMENT BAR ════════════════════════ */}
      <div style={{ background: INK, color: "#fff", padding: "9px 20px", textAlign: "center" }}>
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 500, color: "#fff", textDecoration: "none" }}>
          Now live at 8 campuses across Ghana — <span style={{ color: BRAND_B, fontWeight: 700 }}>download free →</span>
        </a>
      </div>

      {/* ════════════════════════ NAVBAR ════════════════════════ */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "nav-glass" : "bg-transparent"}`}>
        <div style={{ maxWidth: 1280 }} className="mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between" style={{ height: 68 }}>
            <a href="#home" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: BRAND }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>C</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: INK, letterSpacing: "-0.3px" }}>CediMart</span>
            </a>

            <div className="hidden lg:flex items-center gap-9">
              {NAV_LINKS.map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{ fontSize: 13.5, fontWeight: 500, color: INK_SOFT, transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = INK}
                  onMouseLeave={e => e.target.style.color = INK_SOFT}>{l}</a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <MagneticLink href={APP_STORE_URL} className="hidden lg:inline-flex btn-primary gap-2 px-5 py-2.5 rounded-full text-sm font-semibold z-10">
                Get the app <FaArrowRight size={11}/>
              </MagneticLink>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2" style={{ color: INK }}>
                {mobileOpen ? <FaTimes size={19}/> : <FaBars size={19}/>}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden mx-4 mt-2 rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${LINE}`, boxShadow: "0 20px 44px -16px rgba(10,12,10,.2)" }}>
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMobileOpen(false)}
                className="block px-6 py-4 text-sm font-medium" style={{ color: INK, borderBottom: `1px solid ${LINE}` }}>{l}</a>
            ))}
            <div className="p-4">
              <a href={APP_STORE_URL} onClick={() => setMobileOpen(false)} className="btn-primary block w-full py-3.5 rounded-xl text-sm font-semibold text-center">Get the app</a>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section id="home" className="relative" style={{ minHeight: "88vh", display: "flex", alignItems: "flex-end" }}>
        <img src="https://res.cloudinary.com/duv3qvvjz/image/upload/v1783763724/cedimart_hero_image_1_lsoulz.png" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(11,61,46,0.82) 0%, rgba(11,61,46,0.25) 55%, rgba(11,61,46,0.05) 100%)", zIndex: 1 }}/>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px 72px", width: "100%", position: "relative", zIndex: 2 }}>
          <div className="anim-fade-up mb-6">
            <span className="inline-flex items-center gap-2.5">
              <span className="live-dot"/>
              <Kicker style={{ color: "rgba(255,255,255,0.7)" }}>Live across 8 campuses</Kicker>
            </span>
          </div>
          <h1 className="anim-fade-up anim-d1" style={{ fontSize: "clamp(38px,5.6vw,72px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-2px", color: "#fff", maxWidth: 720, margin: "0 0 22px" }}>
            The marketplace <span className="serif-italic" style={{ color: BRAND_B }}>built</span> for campus life.
          </h1>
          <p className="anim-fade-up anim-d2" style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
            Buy, sell, and discover from verified students at your own campus. No shipping. No strangers. No WhatsApp groups.
          </p>
          {/* ✅ FIXED: Both CTAs on same row on all screen sizes */}
          <div className="anim-fade-up anim-d3 cta-row">
            <MagneticLink href={PLAY_STORE_URL} className="cta-btn btn-white gap-2 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-semibold z-10" style={{ fontSize: 13 }}>
              <FaGooglePlay size={16}/>
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div style={{ fontSize: 8, opacity: .55, letterSpacing: "0.1em", textTransform: "uppercase" }}>Get it on</div>
                <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>Google Play</div>
              </div>
            </MagneticLink>
            <MagneticLink href={APP_STORE_URL} className="cta-btn gap-2 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-medium z-10"
              style={{ fontSize: 13, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", display: "inline-flex", alignItems: "center" }}>
              <FaApple size={18}/>
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div style={{ fontSize: 8, opacity: .6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Download on the</div>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>App Store</div>
              </div>
            </MagneticLink>
          </div>
        </div>
      </section>

      {/* ════════════════════════ SECONDARY PROMO BANNER ════════════════════════ */}
      <section style={{ padding: "56px 48px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 220 }}>
            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1400&q=80" alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(11,61,46,0.85) 0%, rgba(11,61,46,0.35) 60%, transparent 100%)" }}/>
            <div className="relative flex flex-col justify-center h-full" style={{ padding: "44px 44px", zIndex: 1, minHeight: 220 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>New this month</span>
              <h3 style={{ fontSize: "clamp(22px,2.8vw,32px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: "0 0 16px", maxWidth: 440 }}>
                Verified Business badges for top campus sellers.
              </h3>
              <a href="#for-sellers" className="inline-flex items-center gap-2 font-semibold" style={{ color: "#fff", fontSize: 14, width: "fit-content" }}>
                See what's new <FaArrowRight size={12}/>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ TRUST STRIP ════════════════════════ */}
      <section ref={trustRef} style={{ padding: "24px 48px 90px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 reveal ${trustVis ? "shown" : "hidden"}`}>
            {TRUST_STRIP.map((f, i) => (
              <div key={i} className="text-center" style={{ transitionDelay: `${i * 60}ms` }}>
                <div style={{ color: BRAND, marginBottom: 14, display: "flex", justifyContent: "center" }}>{f.icon}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 5 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.5, maxWidth: 180, margin: "0 auto" }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ MISSION ════════════════════════ */}
      <section id="how-it-works" className="relative" style={{ minHeight: 460, display: "flex", alignItems: "center" }}>
        <img src="https://res.cloudinary.com/duv3qvvjz/image/upload/v1783766399/mission2_u79lil.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
        <div style={{ position: "absolute", inset: 0, background: "rgba(11,61,46,0.6)" }}/>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 48px", position: "relative", zIndex: 1, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-1.2px", marginBottom: 20 }}>
            Discover the <span className="serif-italic" style={{ color: BRAND_B }}>CediMart</span> difference.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, marginBottom: 32 }}>
            We built CediMart because buying a textbook or selling your old laptop shouldn't require WhatsApp groups, random Facebook posts, or a flyer on the notice board.
          </p>
          <a href="#for-sellers" className="btn-white inline-flex px-7 py-4 rounded-2xl font-semibold" style={{ fontSize: 14 }}>
            See how it works <FaArrowRight size={12} style={{ marginLeft: 8 }}/>
          </a>
        </div>
      </section>

      {/* ════════════════════════ TIERED COMPARISON ════════════════════════ */}
      <section id="for-sellers" ref={tierRef} style={{ padding: "110px 48px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className={`text-center reveal ${tierVis ? "shown" : "hidden"}`} style={{ maxWidth: 620, margin: "0 auto 56px" }}>
            <Kicker style={{ justifyContent: "center" }}>There's a CediMart for everyone</Kicker>
            <h2 style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.4px", margin: "18px 0 0" }}>
              Tired of hunting for a <span className="serif-italic" style={{ color: BRAND }}>good deal</span> on campus?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <SpotlightCard key={i} className={`overflow-hidden rounded-2xl reveal ${tierVis ? "shown" : "hidden"}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div style={{ height: 200, overflow: "hidden" }}>
                  <img src={tier.img} alt={tier.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                </div>
                <div style={{ padding: "26px 26px 30px" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 600, color: BRAND, letterSpacing: "0.1em", textTransform: "uppercase" }}>{tier.tag}</span>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: "10px 0 12px", letterSpacing: "-0.4px" }}>{tier.title}</h3>
                  <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.65, marginBottom: 18 }}>{tier.desc}</p>
                  <div className="flex items-center justify-between" style={{ paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{tier.stat}</span>
                    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ color: INK, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
                      Explore <FaArrowRight size={10}/>
                    </a>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ BIG STAT + TESTIMONIAL ════════════════════════ */}
      <section ref={statRef} style={{ padding: "0 48px 110px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }} className={`reveal ${statVis ? "shown" : "hidden"}`}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(48px,8vw,96px)", fontWeight: 700, color: INK, letterSpacing: "-2px", lineHeight: 1 }}>10,000+</div>
          <p style={{ fontSize: 15, color: INK_SOFT, fontWeight: 500, marginBottom: 44 }}>students already buying and selling on CediMart</p>

          <FaQuoteLeft size={26} style={{ color: `${BRAND}35`, marginBottom: 20 }}/>
          <p style={{ fontSize: "clamp(19px,2.6vw,27px)", color: INK, lineHeight: 1.55, fontWeight: 500, letterSpacing: "-0.3px", maxWidth: 700, margin: "0 auto 24px" }}>
            "{FEATURED_QUOTE.quote}"
          </p>
          <p style={{ fontSize: 13.5, fontWeight: 700 }}>{FEATURED_QUOTE.name} <span style={{ fontWeight: 500, color: INK_SOFT }}>— {FEATURED_QUOTE.role}</span></p>
        </div>
      </section>

      {/* ════════════════════════ PAYMENT METHODS ════════════════════════ */}
      <section ref={payRef} style={{ padding: "0 48px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }} className={`reveal ${payVis ? "shown" : "hidden"}`}>
          <Kicker style={{ justifyContent: "center", marginBottom: 18 }}>Get paid your way</Kicker>
          <h3 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 28 }}>
            However students pay near you, CediMart supports it.
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Mobile Money", "Bank Transfer", "Cash on Meet-up"].map(m => (
              <span key={m} className="pay-chip"><FaCheck size={10} style={{ color: BRAND }}/>{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ STORY CAROUSEL ════════════════════════ */}
      <section id="stories" ref={storyRef} style={{ padding: "0 0 110px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }} className={`reveal ${storyVis ? "shown" : "hidden"}`}>
          <div style={{ marginBottom: 36 }}>
            <Kicker>Real listings, real students</Kicker>
            <h2 style={{ fontSize: "clamp(26px,3.4vw,40px)", fontWeight: 800, letterSpacing: "-1px", margin: "16px 0 0" }}>Your story is our story.</h2>
          </div>
        </div>
        <div className="story-scroll flex gap-5 overflow-x-auto px-12" style={{ maxWidth: 1280, margin: "0 auto" }}>
          {STORIES.map((s, i) => (
            <div key={i} className="story-card">
              <div style={{ borderRadius: 20, overflow: "hidden", height: 320, marginBottom: 16 }}>
                <img src={s.img} alt={s.tag} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.tag}</span>
              <p style={{ fontSize: 14.5, color: INK, lineHeight: 1.55, marginTop: 8, fontWeight: 500 }}>"{s.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════ REVIEW CAROUSEL ════════════════════════ */}
      <section ref={reviewRef} style={{ padding: "0 48px 110px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }} className={`reveal ${reviewVis ? "shown" : "hidden"}`}>
          <div className="text-center mb-10">
            <Kicker style={{ justifyContent: "center" }}>What students are saying</Kicker>
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 20, padding: "40px 44px", textAlign: "center" }}>
            <p key={activeReview} className="anim-fade-up" style={{ fontSize: 17, color: INK, lineHeight: 1.7, fontWeight: 500, marginBottom: 22 }}>"{r.quote}"</p>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>{r.name} <span style={{ fontWeight: 500, color: INK_SOFT }}>— {r.role}</span></p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setActiveReview(p => (p - 1 + REVIEW_QUOTES.length) % REVIEW_QUOTES.length)}
                style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${LINE}`, background: SURFACE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <FaChevronLeft size={10}/>
              </button>
              {REVIEW_QUOTES.map((_, i) => (
                <button key={i} onClick={() => setActiveReview(i)}
                  style={{ width: i === activeReview ? 20 : 6, height: 6, borderRadius: 4, background: i === activeReview ? BRAND : LINE, border: "none", cursor: "pointer", transition: "all .3s ease" }}/>
              ))}
              <button onClick={() => setActiveReview(p => (p + 1) % REVIEW_QUOTES.length)}
                style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${LINE}`, background: SURFACE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <FaChevronRight size={10}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ CAMPUS LOCATOR ════════════════════════ */}
      <section id="campuses" ref={campusRef} style={{ padding: "0 48px 110px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className={`text-center reveal ${campusVis ? "shown" : "hidden"}`} style={{ maxWidth: 560, margin: "0 auto 44px" }}>
            <Kicker style={{ justifyContent: "center" }}>Find CediMart on your campus</Kicker>
            <h2 style={{ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.15, margin: "18px 0 0" }}>
              Live on 8 campuses. Growing every month.
            </h2>
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-px reveal ${campusVis ? "shown" : "hidden"}`} style={{ background: LINE, border: `1px solid ${LINE}` }}>
            {CAMPUSES.map((c, i) => (
              <div key={c.code} className="spotlight-card p-6" style={{ transitionDelay: `${i * 30}ms` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="live-dot"/>
                  <FaMapMarkerAlt size={11} style={{ color: INK_SOFT }}/>
                </div>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>{c.code}</h3>
                <p style={{ fontSize: 11.5, color: INK_SOFT }}>{c.area}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ SUPPORT CTA ════════════════════════ */}
      <section ref={supportRef} style={{ padding: "0 48px 110px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }} className={`reveal ${supportVis ? "shown" : "hidden"}`}>
          <div className="grid md:grid-cols-2 gap-5">
            <SpotlightCard className="rounded-2xl p-10">
              <MdStorefront size={26} style={{ color: BRAND, marginBottom: 16 }}/>
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>Talk to our team</h3>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.65, marginBottom: 22, maxWidth: 340 }}>
                Questions about selling, verification, or a specific campus? We reply fast.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary gap-2 px-5 py-3 rounded-xl text-sm font-semibold">
                  <FaWhatsapp size={15}/> WhatsApp us
                </a>
                <a href={SUPPORT_EMAIL} className="btn-outline gap-2 px-5 py-3 rounded-xl text-sm font-medium">
                  <FaEnvelope size={13}/> Email us
                </a>
              </div>
            </SpotlightCard>
            <SpotlightCard className="rounded-2xl p-10">
              <FaShoppingBag size={24} style={{ color: BRAND, marginBottom: 16 }}/>
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>Not sure where to start?</h3>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.65, marginBottom: 22, maxWidth: 340 }}>
                Download the app, pick your campus, and see what's already trending near you.
              </p>
              <MagneticLink href={APP_STORE_URL} className="btn-primary gap-2 px-5 py-3 rounded-xl text-sm font-semibold z-10">
                <FaRocket size={12}/> Find your campus
              </MagneticLink>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FAQ ════════════════════════ */}
      <section id="faq" style={{ padding: "0 48px 110px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <Kicker>Frequently asked questions</Kicker>
            <h2 style={{ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.12, margin: "18px 0 0" }}>
              Questions, <span className="serif-italic" style={{ color: BRAND }}>answered.</span>
            </h2>
          </div>
          <div>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} isOpen={openFAQ === i} onClick={() => setOpenFAQ(openFAQ === i ? null : i)}/>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ CTA + FOOTER ════════════════════════ */}
      <div id="download" ref={ctaRef} style={{ background: INK, position: "relative", overflow: "hidden" }}>
        <section style={{ padding: "100px 48px 80px", position: "relative", zIndex: 1 }}>
          <div className={`reveal ${ctaVis ? "shown" : "hidden"}`} style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
            <Kicker style={{ justifyContent: "center", color: "rgba(255,255,255,0.55)" }}>Get started today</Kicker>
            <h2 style={{ fontSize: "clamp(34px,5vw,60px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, letterSpacing: "-1.8px", margin: "20px 0 20px" }}>
              Your campus marketplace is <span className="serif-italic" style={{ color: BRAND_B }}>waiting.</span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 460, margin: "0 auto 40px", lineHeight: 1.65 }}>
              Join 10,000+ students already buying and selling on CediMart. Free forever. No hidden fees.
            </p>
            {/* ✅ FIXED: Both CTAs on same row on all screen sizes */}
            <div className="cta-row justify-center mb-10">
              <MagneticLink href={APP_STORE_URL} className="cta-btn btn-white inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3.5 sm:py-5 rounded-2xl font-semibold z-10" style={{ fontSize: 13 }}>
                <FaApple size={20}/>
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: 8, opacity: .5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Download on the</div>
                  <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>App Store</div>
                </div>
              </MagneticLink>
              <MagneticLink href={PLAY_STORE_URL} className="cta-btn inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3.5 sm:py-5 rounded-2xl font-semibold z-10"
                style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.16)", fontSize: 13 }}>
                <FaGooglePlay size={18}/>
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: 8, opacity: .6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Get it on</div>
                  <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>Google Play</div>
                </div>
              </MagneticLink>
            </div>
          </div>
        </section>

        <footer style={{ padding: "56px 48px 36px", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {/* ... footer content (unchanged) ... */}
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10" style={{ marginBottom: 48 }}>
              <div style={{ gridColumn: "span 2" }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: BRAND, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>C</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>CediMart</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.75, maxWidth: 280, marginBottom: 20, color: "rgba(255,255,255,0.45)" }}>
                  Ghana's campus marketplace. Buy, sell, and discover from verified student sellers across the country.
                </p>
                <div className="flex gap-2.5">
                  {[FaTwitter, FaInstagram, FaLinkedin, FaYoutube].map((Icon, i) => (
                    <a key={i} href="#" style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(255,255,255,0.55)", transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = BRAND; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                      <Icon size={13}/>
                    </a>
                  ))}
                </div>
              </div>
              {[
                { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
                { title: "Support", links: ["Help Center", "Contact", "Safety", "Community"] },
                { title: "Campuses", links: ["UG", "KNUST", "UCC", "See all 8 →"] },
                { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
              ].map(col => (
                <div key={col.title}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>{col.title}</h4>
                  <div className="flex flex-col gap-3">
                    {col.links.map(l => (
                      <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", transition: "color .2s", textDecoration: "none" }}
                        onMouseEnter={e => e.target.style.color = "#fff"}
                        onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>{l}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32, marginBottom: 32 }}>
              <div style={{ maxWidth: 400 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Stay in the loop</h4>
                <p style={{ fontSize: 12, marginBottom: 14, color: "rgba(255,255,255,0.45)" }}>New campus launches, features, and deals.</p>
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                    style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "Inter,sans-serif" }}/>
                  <button onClick={() => { setEmailSent(true); setTimeout(() => setEmailSent(false), 3000); }}
                    style={{ background: "#fff", color: INK, fontWeight: 700, padding: "12px 18px", borderRadius: 12, fontSize: 13, border: "none", cursor: "pointer", flexShrink: 0 }}>
                    {emailSent ? "✓" : "Subscribe"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}>
              <p style={{ fontSize: 12, margin: 0, color: "rgba(255,255,255,0.4)" }}>© {new Date().getFullYear()} CediMart. All rights reserved.</p>
              <div className="flex gap-5">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
                  <a key={l} href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}>{l}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;