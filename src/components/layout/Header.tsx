
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, User, ShoppingBag, Settings, MessageSquare } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-agrigreen-600">AgriConnect</span>
            <span className="text-xl font-bold text-gray-700">Mart</span>
          </Link>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link
                  to="/"
                  className={`text-sm ${isActive('/') ? 'text-agrigreen-600 font-medium' : 'text-gray-600 hover:text-agrigreen-600'}`}
                >
                  Home
                </Link>
              </li>

              {/* Only show Products tab to logged-in buyers */}
              {isAuthenticated && user?.role === 'buyer' && (
                <li>
                  <Link
                    to="/products"
                    className={`text-sm ${isActive('/products') ? 'text-agrigreen-600 font-medium' : 'text-gray-600 hover:text-agrigreen-600'}`}
                  >
                    Products
                  </Link>
                </li>
              )}
              
              <li>
                <Link
                  to="/schemes"
                  className={`text-sm ${isActive('/schemes') ? 'text-agrigreen-600 font-medium' : 'text-gray-600 hover:text-agrigreen-600'}`}
                >
                  Schemes
                </Link>
              </li>

              {/* Only show Cart to buyers */}
              {isAuthenticated && user?.role === 'buyer' && (
                <li>
                  <Link
                    to="/cart"
                    className={`text-sm ${isActive('/cart') ? 'text-agrigreen-600 font-medium' : 'text-gray-600 hover:text-agrigreen-600'}`}
                  >
                    Cart
                  </Link>
                </li>
              )}
              
              {/* Show Messages tab based on user role */}
              {isAuthenticated && (
                <li>
                  <Link
                    to={user?.role === 'seller' ? '/seller/messages' : 
                        user?.role === 'admin' ? '/admin/messages' : 
                        '/buyer/messages'}
                    className={`text-sm ${
                      isActive('/seller/messages') || 
                      isActive('/admin/messages') || 
                      isActive('/buyer/messages') 
                        ? 'text-agrigreen-600 font-medium' 
                        : 'text-gray-600 hover:text-agrigreen-600'
                    }`}
                  >
                    Messages
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          
          <div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  {user?.role === 'seller' && (
                    <Link to="/seller-dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-sm ${isActive('/seller-dashboard') ? 'text-agrigreen-600 font-medium' : 'text-gray-600 hover:text-agrigreen-600'}`}
                      >
                        Seller Dashboard
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'buyer' && (
                    <Link to="/buyer-dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-sm ${isActive('/buyer-dashboard') ? 'text-agrigreen-600 font-medium' : 'text-gray-600 hover:text-agrigreen-600'}`}
                      >
                        Buyer Dashboard
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin-dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-sm ${isActive('/admin-dashboard') ? 'text-agrigreen-600 font-medium' : 'text-gray-600 hover:text-agrigreen-600'}`}
                      >
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {user?.name || 'User'}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user?.role === 'seller' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/seller-dashboard')}>
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Seller Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/seller/messages')}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'buyer' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/buyer-dashboard')}>
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Buyer Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/buyer/messages')}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin/messages')}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
