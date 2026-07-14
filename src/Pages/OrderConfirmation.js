import React, { useState, useEffect } from "react";
import { FaCheck, FaWhatsapp, FaArrowRight, FaClock, FaBoxOpen, FaShoppingBag } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

// ─── Config ────────────────────────────────────────────────────────────────────
const APP_STORE_URL   = "https://apps.apple.com/us/app/cedimart/id6762318566";
const PLAY_STORE_URL  = "https://play.google.com/store/apps/details?id=com.freshyfood.factory";
const APP_DEEPLINK    = "cedimart://order/confirmation";
const WHATSAPP_URL    = "https://wa.me/233505671577";
const MARKETPLACE_URL = "/"; // adjust to your actual browse/home route

const INK      = "#0A0C0A";
const INK_SOFT = "#5C6259";
const PAPER    = "#FAFAF8";
const LINE     = "#E6E4DD";
const BRAND    = "#0E6B3F";
const BRAND_B  = "#16A35A";
const GOLD     = "#B08A3E";

const STEPS = [
  { label: "Order placed",     icon: <FaShoppingBag size={13}/>, status: "done" },
  { label: "Payment confirmed",icon: <MdVerified size={14}/>,    status: "done" },
  { label: "Seller notified",  icon: <FaClock size={13}/>,       status: "active" },
  { label: "Ready for pickup", icon: <FaBoxOpen size={13}/>,     status: "pending" },
];

// ─── Read common gateway callback params (Paystack, Nalo, custom backend, etc.) ─
const getOrderRef = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("reference") || params.get("trxref") || params.get("orderId") || params.get("order_id") || null;
};

const OrderConfirmationPage = () => {
  const [reference, setReference] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setReference(getOrderRef());
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const openInApp = () => {
    const url = reference ? `${APP_DEEPLINK}?reference=${encodeURIComponent(reference)}` : APP_DEEPLINK;
    window.location.href = url;
    // If the app isn't installed, the deep link silently fails and the person
    // stays on this page — so we don't need an artificial fallback timer here.
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAPER, fontFamily: "'Inter',-apple-system,sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        :focus-visible{outline:2px solid ${BRAND};outline-offset:3px;}

        @keyframes popIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ringPulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.55);opacity:0}}
        @keyframes dotPulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.2);opacity:0}}
        @media (prefers-reduced-motion: reduce){*{animation-duration:.001ms !important;transition-duration:.001ms !important;}}

        .anim-pop{animation:popIn .5s cubic-bezier(.22,1.4,.36,1) forwards;opacity:0}
        .anim-fade-up{animation:fadeUp .6s cubic-bezier(.22,1,.36,1) forwards;opacity:0}
        .d1{animation-delay:.12s} .d2{animation-delay:.22s} .d3{animation-delay:.32s} .d4{animation-delay:.42s}

        .serif-italic{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;}

        .check-ring{position:absolute;inset:0;border-radius:50%;border:1.5px solid ${BRAND};animation:ringPulse 2.2s ease-out infinite;}
        .live-dot{width:7px;height:7px;border-radius:50%;background:${BRAND};display:inline-block;position:relative;flex-shrink:0;}
        .live-dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:${BRAND};animation:dotPulse 1.6s ease-out infinite;}

        .btn-primary{background:${INK};color:#fff;transition:all .25s cubic-bezier(.4,0,.2,1);display:inline-flex;align-items:center;}
        .btn-primary:hover{background:${BRAND};transform:translateY(-1px);box-shadow:0 12px 28px -8px rgba(14,107,63,.45);}
        .btn-outline{background:transparent;border:1px solid ${LINE};color:${INK};transition:all .22s ease;display:inline-flex;align-items:center;}
        .btn-outline:hover{border-color:${INK};background:#fff;}

        .step-line{position:absolute;top:15px;left:15px;right:15px;height:1px;background:${LINE};z-index:0;}
        .step-line-fill{position:absolute;top:0;left:0;height:100%;background:${BRAND};transition:width .8s ease;}
      `}</style>

      {/* ── Minimal header — logo only, no nav, to keep focus ── */}
      <header style={{ padding: "28px 24px" }}>
        <div className="flex items-center gap-2.5" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: INK }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>C</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>CediMart</span>
        </div>
      </header>

      {/* ── Main confirmation card ── */}
      <main className="flex-1 flex items-center justify-center" style={{ padding: "24px 24px 60px" }}>
        <div style={{ maxWidth: 480, width: "100%" }}>

          {/* Check icon */}
          <div className="anim-pop flex justify-center" style={{ marginBottom: 28 }}>
            <div style={{ position: "relative", width: 76, height: 76 }}>
              <div className="check-ring"/>
              <div style={{ width: 76, height: 76, borderRadius: "50%", background: BRAND,
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <FaCheck size={26} color="#fff"/>
              </div>
            </div>
          </div>

          <div className="text-center anim-fade-up d1" style={{ marginBottom: 8 }}>
            <span className="inline-flex items-center gap-2">
              <span className="live-dot"/>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: INK_SOFT }}>
                Order confirmed
              </span>
            </span>
          </div>

          <h1 className="text-center anim-fade-up d1" style={{ fontSize: "clamp(28px,5vw,38px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, margin: "10px 0 14px" }}>
            Thank you — your order<br/>is being <span className="serif-italic" style={{ color: BRAND }}>processed.</span>
          </h1>

          <p className="text-center anim-fade-up d2" style={{ fontSize: 15, color: INK_SOFT, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 28px" }}>
            We've received your payment and let the seller know. You'll get a notification the moment they confirm your order.
          </p>

          {reference && (
            <div className="anim-fade-up d2 flex justify-center" style={{ marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${LINE}`,
                borderRadius: 100, padding: "8px 16px" }}>
                <span style={{ fontSize: 11, color: INK_SOFT, fontWeight: 500 }}>Order ref</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em" }}>{reference}</span>
              </div>
            </div>
          )}

          {/* Status stepper */}
          <div className="anim-fade-up d3" style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 20, padding: "28px 24px", marginBottom: 24 }}>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <div className="step-line">
                <div className="step-line-fill" style={{ width: mounted ? "66%" : "0%" }}/>
              </div>
              <div className="flex justify-between" style={{ position: "relative", zIndex: 1 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: "50%",
                    background: s.status === "pending" ? "#fff" : (s.status === "active" ? "#fff" : BRAND),
                    border: `2px solid ${s.status === "pending" ? LINE : BRAND}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: s.status === "done" ? "#fff" : BRAND }}>
                    {s.status === "done" ? <FaCheck size={11}/> : s.icon}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              {STEPS.map((s, i) => (
                <span key={i} style={{ fontSize: 10.5, fontWeight: s.status === "active" ? 700 : 500,
                  color: s.status === "pending" ? "#B4B8AE" : INK, width: 70, textAlign: i === 0 ? "left" : i === STEPS.length - 1 ? "right" : "center" }}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="anim-fade-up d3 flex flex-col gap-3" style={{ marginBottom: 28 }}>
            <button onClick={openInApp} className="btn-primary justify-center gap-2 px-6 py-4 rounded-2xl font-semibold w-full" style={{ fontSize: 14.5, cursor: "pointer", border: "none" }}>
              Continue in CediMart app <FaArrowRight size={12}/>
            </button>
            <a href={MARKETPLACE_URL} className="btn-outline justify-center gap-2 px-6 py-4 rounded-2xl font-medium w-full" style={{ fontSize: 14 }}>
              Keep browsing
            </a>
          </div>

          {/* Help */}
          <div className="anim-fade-up d4 text-center" style={{ paddingTop: 20, borderTop: `1px solid ${LINE}` }}>
            <p style={{ fontSize: 12.5, color: INK_SOFT, marginBottom: 12 }}>Something doesn't look right?</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: BRAND }}>
              <FaWhatsapp size={14}/> Chat with support
            </a>
          </div>
        </div>
      </main>

      <footer className="text-center" style={{ padding: "24px", color: "#B4B8AE", fontSize: 11.5 }}>
        © {new Date().getFullYear()} CediMart · You can safely close this page.
      </footer>
    </div>
  );
};

export default OrderConfirmationPage;