
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, PackageOpen, ShoppingBag, DollarSign, ArrowUpRight, 
  Clock, Check, X, BarChart4, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

const SellerDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0, 
    pending: 0,
    rejected: 0
  });
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!isLoading && isAuthenticated && user?.role !== 'seller') {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Fetch seller's products
  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!user?.id) return;
      
      setLoadingProducts(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Format products
        const formattedProducts: Product[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          images: item.images || [],
          category: item.category,
          sellerId: item.seller_id,
          sellerName: user.name || 'You',
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        setProducts(formattedProducts);
        
        // Calculate stats
        const approved = data.filter(p => p.status === 'approved').length;
        const pending = data.filter(p => p.status === 'pending').length;
        const rejected = data.filter(p => p.status === 'rejected').length;
        
        setStats({
          total: data.length,
          approved,
          pending,
          rejected
        });
      } catch (error) {
        console.error('Error fetching seller products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchSellerProducts();
    }
  }, [isAuthenticated, user]);

  // Get status badge for product
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-green-700">Approved</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-amber-700">Pending Review</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-red-700">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-gray-700">Unknown</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-agrigreen-900">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your agricultural products</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-agrigreen-600 hover:bg-agrigreen-700" asChild>
          <Link to="/seller/add-product">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Products</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <X className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your listings</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-md"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <PackageOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-gray-500 mb-3">No products yet</h3>
                  <Button asChild>
                    <Link to="/seller/add-product">
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Product
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center p-3 border rounded-md hover:bg-gray-50">
                      <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden mr-4 shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <PackageOpen className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-medium text-agrigreen-900 truncate">{product.name}</h3>
                          <div className="text-sm">{getStatusBadge(product.status)}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row text-sm text-gray-500 mt-1 sm:items-center">
                          <span className="mr-3">₹{product.price}</span>
                          <span className="mr-3">{product.category}</span>
                          <span>
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" asChild className="shrink-0 ml-2">
                        <Link to={`/seller/product/${product.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {products.length > 0 && (
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button variant="outline" size="sm">View All Products</Button>
              </CardFooter>
            )}
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Analytics</CardTitle>
              <CardDescription>Your product performance</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart4 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-gray-500 mb-2">Analytics coming soon</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Detailed analytics about your product views, sales, and performance will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-gray-500 mb-2">No sales yet</h3>
              <p className="text-sm text-gray-400 text-center max-w-xs">
                When buyers purchase your products, your sales information will appear here.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tips for Sellers</CardTitle>
              <CardDescription>Maximize your success</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-blue-50 rounded-md">
                  <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Complete your profile</h4>
                    <p className="text-sm text-blue-700">
                      Buyers are more likely to purchase from sellers with complete profiles.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-green-50 rounded-md">
                  <AlertCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">High-quality photos</h4>
                    <p className="text-sm text-green-700">
                      Clear, well-lit product photos can increase sales by up to 40%.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-amber-50 rounded-md">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">Detailed descriptions</h4>
                    <p className="text-sm text-amber-700">
                      Include information on farming methods, freshness, and product benefits.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
