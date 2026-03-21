// AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Grid, Package, ShoppingCart, Users, BarChart2, Settings,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Home, PlusCircle, Folder, List, Clock, CheckCircle,
  User, Bell, X, CreditCard,
} from 'lucide-react';

// ─── Menu definition ──────────────────────────────────────────────────────────
const MENU = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: Grid,
    route: '/admin/dashboard',
  },
  {
    id: 'products',
    title: 'Products',
    icon: Package,
    subItems: [
      { id: 'all-products',  title: 'All Products', icon: List,       route: '/admin-products'      },
      { id: 'add-product',   title: 'Add Product',  icon: PlusCircle, route: '/admin/add-product'   },
      { id: 'categories',    title: 'Categories',   icon: Folder,     route: '/admin/categories'    },
    ],
  },
  {
    id: 'orders',
    title: 'Orders',
    icon: ShoppingCart,
    subItems: [
      { id: 'all-orders',       title: 'All Orders',       icon: List,        route: '/admin/orders'                  },
      { id: 'pending-orders',   title: 'Pending',          icon: Clock,       route: '/admin/orders/pendingorders'    },
      { id: 'completed-orders', title: 'Completed',        icon: CheckCircle, route: '/admin/orders/delivered'        },
    ],
  },
  { id: 'users',         title: 'Users',         icon: Users,    route: '/admin/users'         },
  { id: 'payments',      title: 'Payments',      icon: CreditCard, route: '/admin/payments'    },
  { id: 'analytics',     title: 'Analytics',     icon: BarChart2, route: '/admin/analytics'   },
  { id: 'notifications', title: 'Notifications', icon: Bell,     route: '/admin/notifications' },
  { id: 'settings',      title: 'Settings',      icon: Settings, route: '/admin/settings'      },
];

// ─── Accent colours per nav id ────────────────────────────────────────────────
const ACCENTS = {
  dashboard:     '#1677FF',
  products:      '#10B981',
  orders:        '#F59E0B',
  users:         '#7C3AED',
  payments:      '#0EA5E9',
  analytics:     '#EC4899',
  notifications: '#FF4D4F',
  settings:      '#8C8C8C',
};
const accent = (id) => ACCENTS[id] ?? '#1677FF';

// ─── Sub-components ───────────────────────────────────────────────────────────
const Tooltip = ({ label, visible }) =>
  visible ? (
    <div style={{
      position: 'absolute', left: 54, top: '50%', transform: 'translateY(-50%)',
      background: '#141414', color: '#fff', fontSize: 12, fontWeight: 600,
      padding: '5px 10px', borderRadius: 7, whiteSpace: 'nowrap', zIndex: 9999,
      pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      {label}
      <div style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)',
        width: 8, height: 8, background: '#141414', rotate: '45deg' }}/>
    </div>
  ) : null;

const NavItem = ({ item, isCollapsed, location, onNav, expandedItems, onToggle }) => {
  const [hovered, setHovered] = useState(false);
  const ac = accent(item.id);
  const isActive =
    item.route === location.pathname ||
    item.subItems?.some(s => s.route === location.pathname);
  const isExpanded = expandedItems[item.id];

  if (item.subItems) {
    return (
      <div>
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onToggle(item.id)}
          style={{
            position: 'relative', width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '10px 0' : '9px 12px',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: isActive ? ac + '12' : 'none',
            transition: 'background 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : 10 }}>
            {/* Icon container */}
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? ac + '18' : 'transparent',
              transition: 'background 0.15s',
            }}>
              <item.icon size={17} color={isActive ? ac : '#8C8C8C'} />
            </div>
            {!isCollapsed && (
              <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500,
                color: isActive ? ac : '#595959', fontFamily: "'DM Sans',sans-serif" }}>
                {item.title}
              </span>
            )}
          </div>
          {!isCollapsed && (
            isExpanded
              ? <ChevronUp size={13} color="#BFBFBF" />
              : <ChevronDown size={13} color="#BFBFBF" />
          )}
          {/* Active indicator */}
          {isActive && !isCollapsed && (
            <div style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: 3,
              borderRadius: '0 3px 3px 0', background: ac }} />
          )}
          {isCollapsed && <Tooltip label={item.title} visible={hovered} />}
        </button>

        {/* Sub-items */}
        {!isCollapsed && isExpanded && (
          <div style={{ marginTop: 2, marginBottom: 4, paddingLeft: 44,
            display: 'flex', flexDirection: 'column', gap: 2 }}>
            {item.subItems.map(sub => {
              const subActive = location.pathname === sub.route;
              return (
                <button
                  key={sub.id}
                  onClick={() => onNav(sub.route)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    background: subActive ? ac + '12' : 'transparent',
                    transition: 'background 0.15s', fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  <sub.icon size={13} color={subActive ? ac : '#BFBFBF'} />
                  <span style={{ fontSize: 12, fontWeight: subActive ? 700 : 500,
                    color: subActive ? ac : '#8C8C8C' }}>
                    {sub.title}
                  </span>
                  {subActive && (
                    <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: ac }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Simple item
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNav(item.route)}
      style={{
        position: 'relative', width: '100%', display: 'flex', alignItems: 'center',
        gap: isCollapsed ? 0 : 10, padding: isCollapsed ? '10px 0' : '9px 12px',
        borderRadius: 10, border: 'none', cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start',
        background: isActive ? ac + '12' : 'transparent', transition: 'background 0.15s',
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? ac + '18' : 'transparent', transition: 'background 0.15s',
      }}>
        <item.icon size={17} color={isActive ? ac : '#8C8C8C'} />
      </div>
      {!isCollapsed && (
        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500,
          color: isActive ? ac : '#595959' }}>
          {item.title}
        </span>
      )}
      {isActive && !isCollapsed && (
        <div style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: 3,
          borderRadius: '0 3px 3px 0', background: ac }} />
      )}
      {isCollapsed && <Tooltip label={item.title} visible={hovered} />}
    </button>
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
const AdminSidebar = ({ isCollapsed, isMobile, isOpen, toggleSidebar }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  // Auto-expand parent of active sub-item
  useEffect(() => {
    MENU.forEach(item => {
      if (item.subItems?.some(s => s.route === location.pathname)) {
        setExpandedItems(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname]);

  const handleNav = (route) => {
    navigate(route);
    if (isMobile) toggleSidebar();
  };

  const toggleExpand = (id) =>
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));

  const w = isCollapsed ? 68 : 240;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={toggleSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            zIndex: 39, backdropFilter: 'blur(2px)', transition: 'opacity 0.2s' }}
        />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh',
        width: w, zIndex: 40, fontFamily: "'DM Sans',sans-serif",
        background: '#fff', borderRight: '1px solid #F0F0F0',
        boxShadow: isMobile && isOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none',
        display: 'flex', flexDirection: 'column',
        transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'width 0.25s ease, transform 0.25s ease',
        overflow: 'hidden',
      }}>

        {/* ── Logo / Header ── */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0 10px' : '0 16px',
          borderBottom: '1px solid #F0F0F0', flexShrink: 0,
        }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg,#1677FF,#10B981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Grid size={15} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#141414', letterSpacing: '-0.3px' }}>
                  Admin
                </p>
                <p style={{ margin: 0, fontSize: 10, color: '#BFBFBF', fontWeight: 500 }}>
                  Control Panel
                </p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div style={{ width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg,#1677FF,#10B981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Grid size={15} color="#fff" />
            </div>
          )}

          {isMobile ? (
            <button onClick={toggleSidebar} style={{
              width: 28, height: 28, borderRadius: 7, border: '1.5px solid #F0F0F0',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}>
              <X size={14} color="#8C8C8C" />
            </button>
          ) : (
            <button onClick={toggleSidebar} style={{
              width: 28, height: 28, borderRadius: 7, border: '1.5px solid #F0F0F0',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}>
              {isCollapsed
                ? <ChevronRight size={14} color="#8C8C8C" />
                : <ChevronLeft  size={14} color="#8C8C8C" />}
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: isCollapsed ? '12px 8px' : '12px 10px',
          display: 'flex', flexDirection: 'column', gap: 2,
          scrollbarWidth: 'none',
        }}>
          {/* Section label */}
          {!isCollapsed && (
            <p style={{ margin: '0 0 8px 4px', fontSize: 10, fontWeight: 700, color: '#BFBFBF',
              textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Navigation
            </p>
          )}
          {MENU.map(item => (
            <NavItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              location={location}
              onNav={handleNav}
              expandedItems={expandedItems}
              onToggle={toggleExpand}
            />
          ))}
        </nav>

        {/* ── Footer ── */}
        <div style={{
          padding: isCollapsed ? '10px 8px' : '10px',
          borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0,
        }}>
          {/* Admin profile */}
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              marginBottom: 4, background: '#F5F9FF', borderRadius: 10, border: '1px solid #E6F4FF' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#1677FF,#7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>A</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#141414',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin</p>
                <p style={{ margin: 0, fontSize: 10, color: '#8C8C8C' }}>Administrator</p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,#1677FF,#7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>A</span>
              </div>
            </div>
          )}

          {/* Profile link */}
          <FooterBtn
            icon={User}
            label="Admin Profile"
            isCollapsed={isCollapsed}
            onClick={() => handleNav('/admin/profile')}
            color="#595959"
            bg="transparent"
            hoverBg="#F5F5F5"
          />

          {/* Back to site */}
          <FooterBtn
            icon={Home}
            label="Back to Site"
            isCollapsed={isCollapsed}
            onClick={() => navigate('/')}
            color="#FF4D4F"
            bg="transparent"
            hoverBg="#FFF1F0"
          />
        </div>
      </aside>
    </>
  );
};

// ─── Footer button helper ─────────────────────────────────────────────────────
const FooterBtn = ({ icon: Icon, label, isCollapsed, onClick, color, hoverBg }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isCollapsed ? label : ''}
      style={{
        position: 'relative', width: '100%', display: 'flex', alignItems: 'center',
        gap: isCollapsed ? 0 : 10, padding: isCollapsed ? '9px 0' : '9px 12px',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        borderRadius: 9, border: 'none', cursor: 'pointer',
        background: hovered ? hoverBg : 'transparent',
        transition: 'background 0.15s', fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: hovered ? color + '18' : 'transparent', transition: 'background 0.15s' }}>
        <Icon size={16} color={color} />
      </div>
      {!isCollapsed && (
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
      )}
      {isCollapsed && <Tooltip label={label} visible={hovered} />}
    </button>
  );
};

export default AdminSidebar;