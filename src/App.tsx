import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailsPage from './pages/SchemeDetailsPage';
import ProfilePage from './pages/ProfilePage';
import BuyerOrdersPage from './pages/buyer/BuyerOrdersPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSchemesPage from './pages/admin/AdminSchemesPage';
import WeatherPage from './pages/WeatherPage';
import PricePredictionPage from './pages/PricePredictionPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import BuyerMessagesPage from './pages/buyer/BuyerMessagesPage';
import SellerMessagesPage from './pages/seller/SellerMessagesPage';
import InteractionsPage from './pages/seller/InteractionsPage';
import ReceiptPage from './pages/seller/ReceiptPage';
import BrowsingHistoryPage from './pages/buyer/BrowsingHistoryPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="home" element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:productId" element={<ProductDetailsPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="schemes" element={<SchemesPage />} />
              <Route path="schemes/:schemeId" element={<SchemeDetailsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<BuyerOrdersPage />} />
              <Route path="messages" element={<BuyerMessagesPage />} />
              <Route path="browsing-history" element={<BrowsingHistoryPage />} />
              
              {/* Seller Routes */}
              <Route path="seller/dashboard" element={<SellerDashboardPage />} />
              <Route path="seller/add-product" element={<AddProductPage />} />
              <Route path="seller/edit-product/:productId" element={<EditProductPage />} />
              <Route path="seller/orders" element={<SellerOrdersPage />} />
              <Route path="seller/messages" element={<SellerMessagesPage />} />
              <Route path="seller/interactions/:productId" element={<InteractionsPage />} />
              <Route path="seller/receipt/:productId" element={<ReceiptPage />} />

              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/products" element={<AdminProductsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/schemes" element={<AdminSchemesPage />} />

              <Route path="weather" element={<WeatherPage />} />
              <Route path="price-prediction" element={<PricePredictionPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
