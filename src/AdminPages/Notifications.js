import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../Components/AdminComponents/adminLayout";
import {
  getAllNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteBulkNotifications,
} from "../Apis/adminApi"; // adjust path as needed

// ── Icons (inline SVG to avoid extra deps) ──────────────────────────────────
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const CheckAllIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 13 13"/><polyline points="7 11 11 15 3 23"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Type colour mapping ──────────────────────────────────────────────────────
const TYPE_STYLES = {
  alert:   { bg: "#FFF1F0", border: "#FFCCC7", dot: "#FF4D4F", label: "Alert"   },
  info:    { bg: "#E6F4FF", border: "#91CAFF", dot: "#1677FF", label: "Info"    },
  success: { bg: "#F6FFED", border: "#B7EB8F", dot: "#52C41A", label: "Success" },
  warning: { bg: "#FFFBE6", border: "#FFE58F", dot: "#FAAD14", label: "Warning" },
  system:  { bg: "#F9F0FF", border: "#D3ADF7", dot: "#722ED1", label: "System"  },
};
const getTypeStyle = (type = "") =>
  TYPE_STYLES[type.toLowerCase()] ?? { bg: "#F5F5F5", border: "#D9D9D9", dot: "#8C8C8C", label: type || "General" };

// ── Timestamp helper ─────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map((t) => (
      <div key={t.id} style={{
        background: t.type === "error" ? "#FF4D4F" : t.type === "success" ? "#52C41A" : "#1677FF",
        color: "#fff", padding: "10px 16px", borderRadius: 8,
        fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        animation: "slideInRight 0.25s ease",
        maxWidth: 320,
      }}>
        {t.message}
      </div>
    ))}
  </div>
);

// ── Skeleton loader ──────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid #F0F0F0" }}>
    <div style={{ width: 18, height: 18, borderRadius: 4, background: "#F0F0F0" }} />
    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F0F0F0", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ height: 13, width: "40%", borderRadius: 4, background: "#F0F0F0" }} />
      <div style={{ height: 11, width: "70%", borderRadius: 4, background: "#F5F5F5" }} />
    </div>
    <div style={{ height: 22, width: 64, borderRadius: 12, background: "#F0F0F0" }} />
    <div style={{ height: 11, width: 55, borderRadius: 4, background: "#F5F5F5" }} />
    <div style={{ display: "flex", gap: 6 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#F0F0F0" }} />
      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#F0F0F0" }} />
    </div>
  </div>
);

// ── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ filter }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 24px", gap: 12 }}>
    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", color: "#BFBFBF" }}>
      <BellIcon />
    </div>
    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#262626", fontFamily: "'DM Sans', sans-serif" }}>
      {filter === "unread" ? "No unread notifications" : filter === "read" ? "No read notifications" : "No notifications yet"}
    </p>
    <p style={{ margin: 0, fontSize: 13, color: "#8C8C8C", fontFamily: "'DM Sans', sans-serif" }}>
      {filter === "all" ? "Notifications will appear here when they arrive." : "Switch filters to view other notifications."}
    </p>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selected, setSelected]             = useState(new Set());
  const [filter, setFilter]                 = useState("all");   // all | unread | read
  const [typeFilter, setTypeFilter]         = useState("all");
  const [search, setSearch]                 = useState("");
  const [toasts, setToasts]                 = useState([]);
  const [actionLoading, setActionLoading]   = useState(null);    // id or "bulk"
  const [deleteConfirm, setDeleteConfirm]   = useState(null);    // id | "bulk"

  // ── toast helper ──────────────────────────────────────────────────────────
  const pushToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllNotifications();
      const data = res?.data ?? res ?? [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      pushToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── derived lists ──────────────────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (filter === "unread" && n.read)   return false;
    if (filter === "read"   && !n.read)  return false;
    if (typeFilter !== "all" && (n.type ?? "").toLowerCase() !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (n.title ?? "").toLowerCase().includes(q) || (n.message ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const allTypes    = [...new Set(notifications.map((n) => (n.type ?? "").toLowerCase()).filter(Boolean))];

  // ── select helpers ─────────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const allFilteredSelected = filtered.length > 0 && filtered.every((n) => selected.has(n._id));
  const toggleSelectAll = () =>
    setSelected(allFilteredSelected ? new Set() : new Set(filtered.map((n) => n._id)));

  // ── actions ────────────────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    setActionLoading(id);
    try {
      await markNotificationAsRead({ ids: [id] });
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
      pushToast("Marked as read");
    } catch {
      pushToast("Failed to mark as read", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSelectedRead = async () => {
    if (!selected.size) return;
    setActionLoading("bulk");
    try {
      await markNotificationAsRead({ ids: [...selected] });
      setNotifications((prev) => prev.map((n) => selected.has(n._id) ? { ...n, read: true } : n));
      setSelected(new Set());
      pushToast(`${selected.size} notification(s) marked as read`);
    } catch {
      pushToast("Failed to mark as read", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
      pushToast("Notification deleted");
    } catch {
      pushToast("Failed to delete notification", "error");
    } finally {
      setActionLoading(null);
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    setActionLoading("bulk");
    try {
      await deleteBulkNotifications({ ids: [...selected] });
      const removed = new Set(selected);
      setNotifications((prev) => prev.filter((n) => !removed.has(n._id)));
      setSelected(new Set());
      pushToast(`${removed.size} notification(s) deleted`);
    } catch {
      pushToast("Failed to delete notifications", "error");
    } finally {
      setActionLoading(null);
      setDeleteConfirm(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
    if (!unreadIds.length) return;
    setActionLoading("markAll");
    try {
      await markNotificationAsRead({ ids: unreadIds });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      pushToast("All notifications marked as read");
    } catch {
      pushToast("Failed to mark all as read", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── styles ─────────────────────────────────────────────────────────────────
  const s = {
    page:       { fontFamily: "'DM Sans', sans-serif", color: "#262626", minHeight: "100vh", background: "#FAFAFA" },
    container:  { maxWidth: 1100, margin: "0 auto", padding: "32px 20px" },
    header:     { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 },
    h1:         { margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", color: "#141414" },
    subtitle:   { margin: "4px 0 0", fontSize: 13, color: "#8C8C8C" },
    pill:       (active) => ({
      padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid",
      borderColor: active ? "#1677FF" : "#E8E8E8",
      background:  active ? "#E6F4FF" : "#fff",
      color:       active ? "#1677FF" : "#595959",
      transition: "all 0.15s",
    }),
    card:       { background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" },
    toolbar:    { display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #F5F5F5", flexWrap: "wrap" },
    searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "#F5F5F5", borderRadius: 8, padding: "7px 12px", flex: "1 1 180px", minWidth: 0 },
    searchInput:{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#262626", width: "100%", fontFamily: "'DM Sans', sans-serif" },
    iconBtn:    (danger) => ({
      display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
      cursor: "pointer", border: "1.5px solid", transition: "all 0.15s",
      borderColor: danger ? "#FFB8B8" : "#E8E8E8",
      background:  danger ? "#FFF1F0" : "#fff",
      color:       danger ? "#FF4D4F" : "#595959",
    }),
    row:        (read, selected) => ({
      display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
      borderBottom: "1px solid #F5F5F5", cursor: "default",
      background: selected ? "#F0F7FF" : read ? "#fff" : "#FAFCFF",
      transition: "background 0.12s",
    }),
    checkbox:   (checked) => ({
      width: 17, height: 17, borderRadius: 4, border: `2px solid ${checked ? "#1677FF" : "#D9D9D9"}`,
      background: checked ? "#1677FF" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", flexShrink: 0, transition: "all 0.12s",
    }),
    dot:        (color) => ({ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }),
    rowContent: { flex: 1, minWidth: 0 },
    rowTitle:   (read) => ({ margin: 0, fontSize: 14, fontWeight: read ? 400 : 600, color: read ? "#595959" : "#141414", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
    rowMsg:     { margin: "2px 0 0", fontSize: 12, color: "#8C8C8C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    badge:      (bg, border, color) => ({
      padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: bg, border: `1px solid ${border}`, color, flexShrink: 0, whiteSpace: "nowrap",
    }),
    time:       { fontSize: 11, color: "#BFBFBF", whiteSpace: "nowrap", flexShrink: 0, minWidth: 55, textAlign: "right" },
    actionBtn:  (active) => ({
      width: 30, height: 30, borderRadius: 7, border: "1.5px solid #E8E8E8",
      background: active ? "#E6F4FF" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: active ? "#1677FF" : "#8C8C8C", transition: "all 0.15s", flexShrink: 0,
    }),
    deleteBtn:  {
      width: 30, height: 30, borderRadius: 7, border: "1.5px solid #FFB8B8",
      background: "#FFF5F5", display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: "#FF4D4F", transition: "all 0.15s", flexShrink: 0,
    },
    modalOverlay:{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
    modal:      { background: "#fff", borderRadius: 14, padding: "28px 28px 22px", maxWidth: 380, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" },
    modalTitle: { margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#141414" },
    modalDesc:  { margin: "0 0 22px", fontSize: 13, color: "#595959", lineHeight: 1.5 },
    modalBtns:  { display: "flex", gap: 10, justifyContent: "flex-end" },
    btnPrimary: { padding: "9px 20px", borderRadius: 8, border: "none", background: "#FF4D4F", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    btnCancel:  { padding: "9px 20px", borderRadius: 8, border: "1.5px solid #E8E8E8", background: "#fff", color: "#595959", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    statsRow:   { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
    statCard:   (accent) => ({
      flex: "1 1 120px", background: "#fff", borderRadius: 10, border: "1px solid #F0F0F0",
      padding: "14px 18px", borderLeft: `3px solid ${accent}`,
    }),
    statNum:    { margin: 0, fontSize: 22, fontWeight: 700, color: "#141414" },
    statLabel:  { margin: "2px 0 0", fontSize: 12, color: "#8C8C8C" },
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes slideInRight { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .notif-row:hover { background: #F5F9FF !important; }
        .notif-action-btn:hover { border-color: #91CAFF !important; background: #E6F4FF !important; color: #1677FF !important; }
        .notif-delete-btn:hover { background: #FFF1F0 !important; }
      `}</style>

      <div style={s.page}>
        <div style={s.container}>

          {/* Header */}
          <div style={s.header}>
            <div>
              <h1 style={s.h1}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{ marginLeft: 10, display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 24, height: 24, borderRadius: "50%", background: "#FF4D4F", color: "#fff",
                    fontSize: 11, fontWeight: 700, verticalAlign: "middle" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </h1>
              <p style={s.subtitle}>Manage and review all system notifications</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={s.iconBtn()} onClick={fetchNotifications} disabled={loading}>
                <RefreshIcon /> Refresh
              </button>
              {unreadCount > 0 && (
                <button style={s.iconBtn()} onClick={handleMarkAllRead} disabled={actionLoading === "markAll"}>
                  <CheckAllIcon /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={s.statsRow}>
            {[
              { label: "Total",   value: notifications.length,                          accent: "#1677FF" },
              { label: "Unread",  value: notifications.filter(n=>!n.read).length,       accent: "#FF4D4F" },
              { label: "Read",    value: notifications.filter(n=>n.read).length,        accent: "#52C41A" },
              { label: "Types",   value: allTypes.length,                               accent: "#722ED1" },
            ].map((st) => (
              <div key={st.label} style={s.statCard(st.accent)}>
                <p style={s.statNum}>{st.value}</p>
                <p style={s.statLabel}>{st.label}</p>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {["all", "unread", "read"].map((f) => (
              <button key={f} style={s.pill(filter === f)} onClick={() => { setFilter(f); setSelected(new Set()); }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "unread" && unreadCount > 0 && (
                  <span style={{ marginLeft: 6, background: "#FF4D4F", color: "#fff", borderRadius: 10,
                    padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{unreadCount}</span>
                )}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: "#E8E8E8", margin: "0 4px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FilterIcon />
              <span style={{ fontSize: 12, color: "#8C8C8C" }}>Type:</span>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setSelected(new Set()); }}
                style={{ border: "1.5px solid #E8E8E8", borderRadius: 8, padding: "5px 10px", fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif", color: "#262626", background: "#fff", cursor: "pointer", outline: "none" }}>
                <option value="all">All</option>
                {allTypes.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Main card */}
          <div style={s.card}>

            {/* Toolbar */}
            <div style={s.toolbar}>
              {/* Search */}
              <div style={s.searchWrap}>
                <span style={{ color: "#BFBFBF", flexShrink: 0 }}><SearchIcon /></span>
                <input style={s.searchInput} placeholder="Search notifications…" value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && (
                  <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#BFBFBF", display: "flex", padding: 0 }}>
                    <XIcon />
                  </button>
                )}
              </div>

              {/* Bulk actions */}
              {selected.size > 0 && (
                <>
                  <span style={{ fontSize: 12, color: "#1677FF", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {selected.size} selected
                  </span>
                  <button style={s.iconBtn()} onClick={handleMarkSelectedRead} disabled={actionLoading === "bulk"}>
                    <CheckIcon /> Mark read
                  </button>
                  <button style={s.iconBtn(true)} onClick={() => setDeleteConfirm("bulk")} disabled={actionLoading === "bulk"}>
                    <TrashIcon /> Delete
                  </button>
                </>
              )}
            </div>

            {/* Column headers */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", background: "#FAFAFA",
              borderBottom: "1px solid #F0F0F0", fontSize: 11, fontWeight: 700, color: "#8C8C8C", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <div style={{ ...s.checkbox(allFilteredSelected), pointerEvents: filtered.length ? "auto" : "none" }}
                onClick={toggleSelectAll}>
                {allFilteredSelected && <span style={{ color: "#fff", fontSize: 10 }}><CheckIcon /></span>}
              </div>
              <div style={{ width: 9 }} />
              <div style={{ flex: 1 }}>Notification</div>
              <div style={{ width: 80, textAlign: "center" }}>Type</div>
              <div style={{ width: 55, textAlign: "right" }}>Time</div>
              <div style={{ width: 68 }}>Actions</div>
            </div>

            {/* Rows */}
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                {filtered.map((n) => {
                  const ts = getTypeStyle(n.type);
                  const isSel = selected.has(n._id);
                  const isDeleting = actionLoading === n._id;
                  return (
                    <div key={n._id} className="notif-row" style={s.row(n.read, isSel)}>
                      {/* Checkbox */}
                      <div style={s.checkbox(isSel)} onClick={() => toggleSelect(n._id)}>
                        {isSel && <span style={{ color: "#fff", fontSize: 8 }}><CheckIcon /></span>}
                      </div>
                      {/* Unread dot */}
                      <div style={s.dot(n.read ? "#E8E8E8" : "#1677FF")} />
                      {/* Content */}
                      <div style={s.rowContent}>
                        <p style={s.rowTitle(n.read)}>{n.title || "Untitled"}</p>
                        <p style={s.rowMsg}>{n.message}</p>
                      </div>
                      {/* Type badge */}
                      <span style={s.badge(ts.bg, ts.border, ts.dot)}>{ts.label}</span>
                      {/* Time */}
                      <span style={s.time}>{timeAgo(n.createdAt)}</span>
                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6 }}>
                        {!n.read && (
                          <button className="notif-action-btn" title="Mark as read"
                            style={s.actionBtn(actionLoading === n._id)}
                            onClick={() => handleMarkRead(n._id)}
                            disabled={!!actionLoading}>
                            <CheckIcon />
                          </button>
                        )}
                        <button className="notif-delete-btn" title="Delete" style={s.deleteBtn}
                          onClick={() => setDeleteConfirm(n._id)} disabled={isDeleting || !!actionLoading}>
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            {!loading && filtered.length > 0 && (
              <div style={{ padding: "12px 20px", background: "#FAFAFA", borderTop: "1px solid #F0F0F0",
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#8C8C8C" }}>
                  Showing <strong>{filtered.length}</strong> of <strong>{notifications.length}</strong> notification{notifications.length !== 1 ? "s" : ""}
                </span>
                {selected.size > 0 && (
                  <span style={{ fontSize: 12, color: "#1677FF", fontWeight: 600 }}>
                    {selected.size} selected
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={s.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <p style={s.modalTitle}>
              {deleteConfirm === "bulk" ? `Delete ${selected.size} notification(s)?` : "Delete notification?"}
            </p>
            <p style={s.modalDesc}>
              {deleteConfirm === "bulk"
                ? "The selected notifications will be permanently removed. This action cannot be undone."
                : "This notification will be permanently removed. This action cannot be undone."}
            </p>
            <div style={s.modalBtns}>
              <button style={s.btnCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={s.btnPrimary}
                onClick={() => deleteConfirm === "bulk" ? handleBulkDelete() : handleDelete(deleteConfirm)}
                disabled={actionLoading !== null}>
                {actionLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <Toast toasts={toasts} />
    </AdminLayout>
  );
}