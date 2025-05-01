
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, ChevronDown, User, ShoppingCart, LogOut, Settings,
  LayoutDashboard, Package, Users, FileText, Tractor, Home
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from '@/hooks/useCart';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, fetchCartItems } = useCart();
  
  // Fetch cart items when user changes
  React.useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user, fetchCartItems]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out",
        variant: "destructive",
      });
    }
  };

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'seller':
        return '/seller-dashboard';
      case 'buyer':
        return '/buyer-dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-agrigreen-700">AgriConnect</span>
            <span className="text-sm bg-agrigreen-100 text-agrigreen-800 px-2 py-1 rounded ml-2">MART</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-agrigreen-700">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-agrigreen-700">Products</Link>
            <Link to="/schemes" className="text-gray-600 hover:text-agrigreen-700">Schemes</Link>
            
            {/* Show dashboard link if user is logged in */}
            {user && (
              <Link to={getDashboardRoute()} className="text-gray-600 hover:text-agrigreen-700">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-agrigreen-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {cartItems.length}
                      </span>
                    )}
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    
                    {user.role === 'seller' && (
                      <DropdownMenuItem onClick={() => navigate('/seller/add-product')}>
                        <Package className="mr-2 h-4 w-4" /> Add Product
                      </DropdownMenuItem>
                    )}
                    
                    {user.role === 'buyer' && (
                      <DropdownMenuItem onClick={() => navigate('/cart')}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Cart
                      </DropdownMenuItem>
                    )}
                    
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin/product-approval')}>
                          <Package className="mr-2 h-4 w-4" /> Product Approval
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin/manage-users')}>
                          <Users className="mr-2 h-4 w-4" /> Manage Users
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Link to="/cart" className="relative mr-2">
                <Button variant="ghost" size="sm" className="text-gray-600 p-1">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-agrigreen-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            <Button variant="ghost" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 py-4 bg-white border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="px-4 py-2 hover:bg-gray-50" onClick={toggleMenu}>
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2" /> Home
                </div>
              </Link>
              <Link to="/products" className="px-4 py-2 hover:bg-gray-50" onClick={toggleMenu}>
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2" /> Products
                </div>
              </Link>
              <Link to="/schemes" className="px-4 py-2 hover:bg-gray-50" onClick={toggleMenu}>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" /> Schemes
                </div>
              </Link>
              
              {user ? (
                <>
                  <div className="border-t border-gray-200 my-2 px-4"></div>
                  <Link 
                    to={getDashboardRoute()} 
                    className="px-4 py-2 hover:bg-gray-50" 
                    onClick={toggleMenu}
                  >
                    <div className="flex items-center">
                      <LayoutDashboard className="h-5 w-5 mr-2" /> Dashboard
                    </div>
                  </Link>
                  
                  {user.role === 'seller' && (
                    <Link 
                      to="/seller/add-product" 
                      className="px-4 py-2 hover:bg-gray-50" 
                      onClick={toggleMenu}
                    >
                      <div className="flex items-center">
                        <Tractor className="h-5 w-5 mr-2" /> Add Product
                      </div>
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }} 
                    className="px-4 py-2 text-left text-red-600 hover:bg-gray-50 w-full"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-5 w-5 mr-2" /> Logout
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2 px-4"></div>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 hover:bg-gray-50" 
                    onClick={toggleMenu}
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2" /> Login
                    </div>
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 bg-agrigreen-50 text-agrigreen-700 hover:bg-agrigreen-100" 
                    onClick={toggleMenu}
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2" /> Register
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
