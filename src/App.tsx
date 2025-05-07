
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import SchemesPage from '@/pages/SchemesPage';
import ProductDetail from '@/pages/buyer/ProductDetail';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFound from '@/pages/NotFound';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ProductApproval from '@/pages/admin/ProductApproval';
import ManageUsers from '@/pages/admin/ManageUsers';
import ViewOrders from '@/pages/admin/ViewOrders';
import ManageSchemes from '@/pages/admin/ManageSchemes';
import AdminMessagesPage from '@/pages/admin/AdminMessagesPage';
import SellerDashboard from '@/pages/seller/SellerDashboard';
import AddProduct from '@/pages/seller/AddProduct';
import BuyerDashboard from '@/pages/buyer/BuyerDashboard';
import CartPage from '@/pages/buyer/CartPage';
import PaymentReceiptPage from '@/pages/buyer/PaymentReceiptPage';
import BrowsingHistoryPage from '@/pages/buyer/BrowsingHistoryPage';
import BuyerMessagesPage from '@/pages/buyer/BuyerMessagesPage';
import SellerMessagesPage from '@/pages/seller/SellerMessagesPage';
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/product-approval" element={<ProductApproval />} />
            <Route path="/admin/manage-users" element={<ManageUsers />} />
            <Route path="/admin/view-orders" element={<ViewOrders />} />
            <Route path="/admin/manage-schemes" element={<ManageSchemes />} />
            <Route path="/admin/messages" element={<AdminMessagesPage />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/seller/add-product" element={<AddProduct />} />
            <Route path="/seller/messages" element={<SellerMessagesPage />} />
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/buyer/receipt/:orderId" element={<PaymentReceiptPage />} />
            <Route path="/buyer/history" element={<BrowsingHistoryPage />} />
            <Route path="/buyer/messages" element={<BuyerMessagesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
