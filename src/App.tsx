
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Layout
import MainLayout from "@/components/layout/MainLayout";

// Public Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProductsPage from "@/pages/ProductsPage";
import SchemesPage from "@/pages/SchemesPage";
import NotFound from "@/pages/NotFound";

// Buyer Pages
import BuyerDashboard from "@/pages/buyer/BuyerDashboard";
import ProductDetail from "@/pages/buyer/ProductDetail";

// Seller Pages
import SellerDashboard from "@/pages/seller/SellerDashboard";
import AddProduct from "@/pages/seller/AddProduct";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/schemes" element={<SchemesPage />} />

              {/* Buyer Routes */}
              <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
              
              {/* Seller Routes */}
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/seller/add-product" element={<AddProduct />} />

              {/* Admin Routes */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
