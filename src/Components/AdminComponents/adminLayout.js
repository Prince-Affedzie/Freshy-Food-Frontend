import React, { useState, useEffect } from 'react';
import AdminSidebar from './adminSidebar';
import AdminNavbar from './adminNavbar';

const AdminLayout = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarCollapsed(true);
        setMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={!isMobile && sidebarCollapsed}
        isMobile={isMobile}
        isOpen={mobileSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Layout */}
      <div
        className={`
          flex flex-col min-h-screen transition-all duration-300
          ${!isMobile && (sidebarCollapsed ? 'ml-16' : 'ml-64')}
        `}
      >
        {/* Navbar */}
        <AdminNavbar
          title={title}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Admin Panel v2.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
