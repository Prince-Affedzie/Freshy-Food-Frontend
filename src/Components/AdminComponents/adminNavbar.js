import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  PlusCircle, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Home,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Users,
  BarChart2,
  FolderPlus,
  Gift,
  Package,
  Clock,
  CheckCircle,
  X,
  Menu
} from 'lucide-react';

const AdminNavbar = ({ toggleSidebar, title, showSidebarToggle = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVisible, setSearchVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const quickActionsRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    { id: '1', title: 'New Order', message: 'Order #12345 received', time: '2 min ago', read: false, type: 'order' },
    { id: '2', title: 'Low Stock', message: 'Product XYZ is running low', time: '1 hour ago', read: false, type: 'inventory' },
    { id: '3', title: 'Payment Received', message: 'Payment for Order #12344', time: '2 hours ago', read: true, type: 'payment' },
    { id: '4', title: 'New User Registered', message: 'John Doe registered', time: '3 hours ago', read: true, type: 'user' },
  ];

  const quickActions = [
    { id: '1', title: 'Add Product', icon: Package, route: '/admin/add-product' },
    { id: '2', title: 'Create Package', icon: Gift, route: '/admin/add-package' },
    { id: '3', title: 'New Category', icon: FolderPlus, route: '/admin/categories/new' },
    { id: '4', title: 'View Reports', icon: BarChart2, route: '/admin/analytics' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchVisible(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsVisible(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setQuickActionsVisible(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
      setSearchVisible(false);
      setSearchQuery('');
    }
  };

  const handleNotificationClick = (notification) => {
    setNotificationsVisible(false);
    switch (notification.type) {
      case 'order':
        navigate('/admin/orders');
        break;
      case 'inventory':
        navigate('/admin/inventory');
        break;
      default:
        break;
    }
  };

  const handleQuickAction = (action) => {
    setQuickActionsVisible(false);
    navigate(action.route);
  };

  const markAllAsRead = () => {
    // Implement mark all as read functionality
    console.log('Mark all as read');
  };

  const getIconForNotification = (type) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'inventory': return AlertTriangle;
      case 'payment': return DollarSign;
      case 'user': return Users;
      default: return Bell;
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            {showSidebarToggle && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}
            
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">{title || 'Admin Dashboard'}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <span>Dashboard</span>
                <ChevronDown size={16} className="ml-1" />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchVisible(!searchVisible)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Search size={20} />
              </button>
              
              {searchVisible && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
                  <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products, orders, users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                      <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </form>
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Quick Links</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => navigate('/admin/products')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        Products
                      </button>
                      <button
                        onClick={() => navigate('/admin/orders')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => navigate('/admin/users')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        Users
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsVisible(!notificationsVisible)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {notificationsVisible && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => {
                        const Icon = getIconForNotification(notification.type);
                        return (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                notification.type === 'order' ? 'bg-blue-100 text-blue-600' :
                                notification.type === 'inventory' ? 'bg-amber-100 text-amber-600' :
                                notification.type === 'payment' ? 'bg-green-100 text-green-600' :
                                'bg-purple-100 text-purple-600'
                              }`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center">
                        <Bell size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/admin/notifications')}
                      className="w-full py-2 text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="relative" ref={quickActionsRef}>
              <button
                onClick={() => setQuickActionsVisible(!quickActionsVisible)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <PlusCircle size={20} />
              </button>
              
              {quickActionsVisible && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200">
                  <div className="p-3 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                  </div>
                  <div className="p-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Icon size={16} className="text-gray-400" />
                          <span>{action.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownVisible(!profileDropdownVisible)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">A</span>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              
              {profileDropdownVisible && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/admin/profile');
                        setProfileDropdownVisible(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User size={16} className="text-gray-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/admin/settings');
                        setProfileDropdownVisible(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Settings size={16} className="text-gray-400" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        navigate('/');
                        setProfileDropdownVisible(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Home size={16} className="text-gray-400" />
                      <span>Back to Site</span>
                    </button>
                    <button
                      onClick={() => {
                        // Implement logout
                        navigate('/login');
                        setProfileDropdownVisible(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;