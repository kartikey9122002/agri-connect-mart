
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

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

// Protected route wrapper component
const ProtectedRoute = ({ 
  element, 
  requiredRole,
}: { 
  element: JSX.Element,
  requiredRole?: 'buyer' | 'seller' | 'admin'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading or return to login if not authenticated
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If role is required, check if user has the role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

const AppRoutes = () => {
  return (
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
          <Route path="/buyer-dashboard" element={
            <ProtectedRoute element={<BuyerDashboard />} requiredRole="buyer" />
          } />
          
          {/* Seller Routes */}
          <Route path="/seller-dashboard" element={
            <ProtectedRoute element={<SellerDashboard />} requiredRole="seller" />
          } />
          <Route path="/seller/add-product" element={
            <ProtectedRoute element={<AddProduct />} requiredRole="seller" />
          } />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
