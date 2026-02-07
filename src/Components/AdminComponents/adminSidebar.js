import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Grid,
  Package,
  Gift,
  ShoppingCart,
  Users,
  Archive,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  PlusCircle,
  Folder,
  List,
  Clock,
  CheckCircle,
  User,
  X
} from 'lucide-react';

const AdminSidebar = ({
  isCollapsed,
  isMobile,
  isOpen,
  toggleSidebar
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
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
        { id: 'all-products', title: 'All Products', icon: List, route: '/admin-products' },
        { id: 'add-product', title: 'Add Product', icon: PlusCircle, route: '/admin/add-product' },
        { id: 'categories', title: 'Categories', icon: Folder, route: '/admin/categories' },
      ],
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: ShoppingCart,
      subItems: [
        { id: 'all-orders', title: 'All Orders', icon: List, route: '/admin/orders' },
        { id: 'pending-orders', title: 'Pending Orders', icon: Clock, route: '/admin/orders/pendingorders' },
        { id: 'completed-orders', title: 'Completed Orders', icon: CheckCircle, route: '/admin/orders/delivered' },
      ],
    },
    { id: 'users', title: 'Users', icon: Users, route: '/admin/users' },
    { id: 'payments', title: 'Payments', icon: Users, route: '/admin/payments' }, //
    { id: 'analytics', title: 'Analytics', icon: BarChart2, route: '/admin/analytics' },
    { id: 'settings', title: 'Settings', icon: Settings, route: '/admin/settings' },
  ];

  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems?.some(sub => sub.route === location.pathname)) {
        setExpandedItems(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname]);

  const handleNavigation = (route) => {
    navigate(route);
    if (isMobile) toggleSidebar();
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-white border-r z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobile
          ? isOpen
            ? 'translate-x-0'
            : '-translate-x-full'
          : 'translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b">
        {!isCollapsed && <h2 className="font-bold text-gray-800">Admin Panel</h2>}

        {isMobile ? (
          <button onClick={toggleSidebar}>
            <X size={20} />
          </button>
        ) : (
          <button onClick={toggleSidebar}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive =
            item.route === location.pathname ||
            item.subItems?.some(sub => sub.route === location.pathname);

          if (item.subItems) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg
                    ${isActive ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {!isCollapsed && item.title}
                  </div>
                  {!isCollapsed &&
                    (expandedItems[item.id]
                      ? <ChevronUp size={14} />
                      : <ChevronDown size={14} />)}
                </button>

                {!isCollapsed && expandedItems[item.id] && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map(sub => {
                      const SubIcon = sub.icon;
                      const active = location.pathname === sub.route;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleNavigation(sub.route)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                            ${active ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-50'}
                          `}
                        >
                          <SubIcon size={14} />
                          {sub.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.route)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg
                ${isActive ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50'}
              `}
            >
              <Icon size={18} />
              {!isCollapsed && item.title}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-2">
        <button
          onClick={() => handleNavigation('/admin/profile')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          <User size={18} />
          {!isCollapsed && 'Admin Profile'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
        >
          <Home size={18} />
          {!isCollapsed && 'Back to Site'}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
