// src/App.jsx
import './App.css'
import './index.css'
import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';


import VendorAppPage from './Pages/AppVendorPage'
import ProductAppPage from "./Pages/AppProductPage";

//
import HomePage from './Pages/Home';
import ScrollToTop from './Components/ScrollToTop'
import ContactPage from './Pages/ContactPage'
import OrderConfirmationPage from './Pages/OrderConfirmation'


import ProductAddForm from './AdminPages/ProductAddForm'
import PackageAddForm from './AdminPages/PackageAddForm'
import PackagesAdminPage from './AdminPages/PackagesPage'
import PackageDetailPage from './AdminPages/PackageDetailPage'
import PackageEditPage from './AdminPages/PackageEditPage'
import ProductsAdminPage from './AdminPages/ProductsAdminPage'
import ProductEditPage from './AdminPages/ProductEditPage'
import ProductDetailPage from './AdminPages/ProductDetailPage'
import AdminOrdersPage from './AdminPages/Orders'
import AdminOrderDetailPage from './AdminPages/OrderDetails'
import PendingOrdersPage from './AdminPages/PendingOrders'
import CompletedOrdersPage from './AdminPages/CompletedOrders';
import UserManagement from './AdminPages/UserManagement'
import UserDetailPage from './AdminPages/UserDetail'
import UserEditPage from './AdminPages/UserEdit'
import AdminLogin from './AdminPages/LoginPage'
import AdminLayout from './Components/AdminComponents/adminLayout';
import UnauthorizedPage from './AdminPages/UnauthorizedPage';
import Dashboard from './AdminPages/Dashboard'
import Payments from './AdminPages/Payments'
import NotificationsPage from './AdminPages/Notifications'
import PaymentDetail from './AdminPages/PaymentDetail';
import AddVendorPage from './AdminPages/AddVendor'
import VendorListPage from './AdminPages/Vendors'
import EditVendorPage from './AdminPages/EditVendor'
import VendorDetailsPage from './AdminPages/VendorDetails'
import LoadingSpinner from './Components/LoadingSpinner';

import './styles.css';

// Custom hook to check authentication status
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');
        
        if (!token || !userStr) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setIsAdmin(user.role === 'admin');
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (in case of logout from another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isAuthenticated, isAdmin, loading };
};

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Admin Layout Wrapper Component
const AdminRoute = ({ children, title = 'Admin Dashboard' }) => {
  return (
    <ProtectedRoute requireAdmin={true}>
      
        {children}
      
    </ProtectedRoute>
  );
};

// Public Layout Component (for non-admin pages)
const PublicLayout = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
};

// Main App Component
function App() {

 

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
      <ScrollToTop />
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            
              <HomePage />
            
          } />

         

          
          <Route path="/product/:productId" element={
            <PublicLayout>
              <ProductAppPage/>
            </PublicLayout>
          } />
          <Route path="/g/product/:productId" element={
            <PublicLayout>
              <ProductAppPage/>
            </PublicLayout>
          } />
          <Route path="/vendor/:vendorId" element={
            <PublicLayout>
              <VendorAppPage/>
            </PublicLayout>
          } />
          
          
          
          
          
          
          
          <Route path="/contact" element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          } />

          <Route path="/order-confirmed" element={
            <PublicLayout>
              < OrderConfirmationPage />
            </PublicLayout>
          } />
          
          
          {/* Authentication Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Admin Routes */}

          <Route path="/admin/dashboard" element={
            <AdminRoute >
              <Dashboard />
            </AdminRoute>
           
          } />
          <Route path="/admin/add-product" element={
               <AdminRoute>
              <ProductAddForm />
              </AdminRoute>
           
          } />

          <Route path="/admin/add-vendor" element={
               <AdminRoute>
              <AddVendorPage />
              </AdminRoute>
           
          } />

          <Route path="/admin/vendors" element={
               <AdminRoute>
              <VendorListPage />
              </AdminRoute>
           
          } />

          <Route path="/admin/vendor_edit/:id" element={
               <AdminRoute>
              <EditVendorPage />
              </AdminRoute>
           
          } />

           <Route path="/admin/vendor/:id" element={
               <AdminRoute>
              <VendorDetailsPage />
              </AdminRoute>
           
          } />

          
          
          
          <Route path="/add-package" element={
              <AdminRoute>
              <PackageAddForm />
              </AdminRoute>
           
          } />
          
          <Route path="/admin-packages" element={
               <AdminRoute>
              <PackagesAdminPage />
              </AdminRoute>
            
          } />
          
          <Route path="/admin-package/:id" element={
              <AdminRoute>
              <PackageDetailPage />
              </AdminRoute>
           
          } />
          
          <Route path="/admin-package/edit/:id" element={
            <AdminRoute>
              <PackageEditPage />
            </AdminRoute>
            
          } />
          
          <Route path="/admin-products" element={
            <AdminRoute>
              <ProductsAdminPage />
              </AdminRoute>
            
          } />
          
          <Route path="/admin-product/edit/:id" element={
             <AdminRoute>
              <ProductEditPage />
              </AdminRoute>
            
          } />
          
          <Route path="/admin-product/:id" element={
             <AdminRoute>
              <ProductDetailPage />
              </AdminRoute>
            
          } />
          
          <Route path="/admin/orders" element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
           
          } />
          
          <Route path="/admin/orders/pendingorders" element={
            <AdminRoute>
              <PendingOrdersPage />
              </AdminRoute>
            
          } />
          
          <Route path="/admin/orders/delivered" element={
              <AdminRoute>
              <CompletedOrdersPage />
              </AdminRoute>
            
          } />
          
          <Route path="/admin/order/:id" element={
             <AdminRoute>
              <AdminOrderDetailPage />
              </AdminRoute>
            
          } />
          
          <Route path="/admin/users" element={
             <AdminRoute>
              <UserManagement />
              </AdminRoute>
            
          } />

          <Route path="/admin/payments" element={
             <AdminRoute>
              <Payments/>
              </AdminRoute>
            
          } />

          <Route path="/admin/payment/:id" element={
          <AdminRoute >
             <PaymentDetail />
         </AdminRoute>
         } />
          
          <Route path="/admin/users/:id" element={
              <AdminRoute>
              <UserDetailPage />
              </AdminRoute>
           
          } />
          
          <Route path="/admin/users/edit/:id" element={
            <AdminRoute>
              <UserEditPage />
            </AdminRoute>
           
          } />

          <Route path="/admin/notifications" element={
            <AdminRoute>
              <NotificationsPage/>
            </AdminRoute>
           
          } />

          {/* Fallback Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;