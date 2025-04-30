
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
import SellerDashboard from '@/pages/seller/SellerDashboard';
import AddProduct from '@/pages/seller/AddProduct';
import BuyerDashboard from '@/pages/buyer/BuyerDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import useStorageSetup from '@/hooks/useStorageSetup';

function App() {
  // Initialize storage buckets
  useStorageSetup();
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/product-approval" element={<ProductApproval />} />
            <Route path="/admin/manage-users" element={<ManageUsers />} />
            <Route path="/admin/view-orders" element={<ViewOrders />} />
            <Route path="/admin/manage-schemes" element={<ManageSchemes />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/seller/add-product" element={<AddProduct />} />
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
