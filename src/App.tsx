
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import ProductsPage from './pages/ProductsPage';
import { Navigate } from 'react-router-dom';

// Import buyer pages
import BuyerMessagesPage from './pages/buyer/BuyerMessagesPage';
import BrowsingHistoryPage from './pages/buyer/BrowsingHistoryPage';

// Import seller components directly
import SellerDashboard from './pages/seller/SellerDashboard';
import AddProduct from './pages/seller/AddProduct';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="home" element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="login" element={<Navigate to="/home" replace />} />
              <Route path="register" element={<Navigate to="/home" replace />} />
              <Route path="messages" element={<BuyerMessagesPage />} />
              <Route path="browsing-history" element={<BrowsingHistoryPage />} />
              
              {/* Seller Routes */}
              <Route path="seller/dashboard" element={<SellerDashboard />} />
              <Route path="seller/add-product" element={<AddProduct />} />
              
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
