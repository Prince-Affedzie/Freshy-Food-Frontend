// src/App.jsx
import './App.css'
import './index.css'
import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import HomePage from './Pages/Home';
import PackagesPage from './Pages/Packages';
import CustomizePage from './Pages/CustomizePage';
import CheckoutPage from './Pages/CheckoutPage';
import ContactPage from './Pages/ContactPage';
import OrderSuccess from './Pages/OrderSuccess';
import ScrollToTop from './Components/ScrollToTop';


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

import './styles.css';

function App() {
  const [basket, setBasket] = useState({
    plan: null,
    items: [],
    total: 0
  });

  const updateBasket = (plan, items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setBasket({ plan, items, total });
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
         <ToastContainer position="top-right" autoClose={3000} />
        {/*<Header basket={basket} />*/}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route 
              path="/customize/:packageId" 
              element={<CustomizePage updateBasket={updateBasket} />} 
            />
            <Route 
              path="/checkout" 
              element={<CheckoutPage basket={basket} />} 
            />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/order-success" element={<OrderSuccess />} />


            <Route path="/admin/add-product" element={<ProductAddForm />} />
            <Route path="/add-package" element={<PackageAddForm />} />
            <Route path="/admin-packages" element={<PackagesAdminPage />} />
            <Route path="/admin-package/:id" element={<PackageDetailPage />} />
            <Route path="/admin-package/edit/:id" element={<PackageEditPage />} />
            <Route path="/admin-products" element={<ProductsAdminPage />} />
            <Route path="/admin-product/edit/:id" element={<ProductEditPage />} />
            <Route path="/admin-product/:id" element={< ProductDetailPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage/>} />
            <Route path="/admin/orders/pendingorders" element={<PendingOrdersPage/>} />
             <Route path="/admin/orders/delivered" element={<CompletedOrdersPage/>} />
            <Route path="/admin/order/:id" element={<AdminOrderDetailPage/>} />
            <Route path="/admin/users" element={<UserManagement/>} />
            <Route path="/admin/users/:id" element={<UserDetailPage/>} />
            <Route path="/admin/users/edit/:id" element={<UserEditPage/>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;