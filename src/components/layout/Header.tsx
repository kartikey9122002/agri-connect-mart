
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Menu, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-agrigreen-500 text-white p-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span className="font-bold text-xl text-agrigreen-800">AgriConnect Mart</span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/products" className="text-agrigreen-700 hover:text-agrigreen-900">Products</Link>
          <Link to="/schemes" className="text-agrigreen-700 hover:text-agrigreen-900">Gov. Schemes</Link>
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-agrigreen-500 text-agrigreen-500">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-agrigreen-500 hover:bg-agrigreen-600">Register</Button>
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === 'buyer' && (
            <Link to="/cart" className="text-agrigreen-700 hover:text-agrigreen-900">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          )}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to={`/${user?.role}-dashboard`} className="w-full flex">
                    {user?.role === 'seller' && 'Seller Dashboard'}
                    {user?.role === 'buyer' && 'My Orders'}
                    {user?.role === 'admin' && 'Admin Dashboard'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/profile" className="w-full flex">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>
                <Link to="/products" className="w-full">Products</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/schemes" className="w-full">Government Schemes</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isAuthenticated && (
                <>
                  <DropdownMenuItem>
                    <Link to="/login" className="w-full">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/register" className="w-full">Register</Link>
                  </DropdownMenuItem>
                </>
              )}
              {isAuthenticated && (
                <>
                  {user?.role === 'buyer' && (
                    <DropdownMenuItem>
                      <Link to="/cart" className="w-full">My Cart</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Link to={`/${user?.role}-dashboard`} className="w-full">
                      {user?.role === 'seller' && 'Seller Dashboard'}
                      {user?.role === 'buyer' && 'My Orders'}
                      {user?.role === 'admin' && 'Admin Dashboard'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
