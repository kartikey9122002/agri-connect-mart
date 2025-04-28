
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';

const SellerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchSellerProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id);

        if (error) {
          throw error;
        }

        // Process the data to match our Product type
        const formattedProducts = await Promise.all(
          data.map(async (item) => {
            // Get seller name from profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', item.seller_id)
              .single();
              
            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              images: item.images || [],
              category: item.category,
              sellerId: item.seller_id,
              sellerName: profileData?.full_name || 'Unknown Seller',
              status: item.status,
              createdAt: item.created_at,
              updatedAt: item.updated_at
            };
          })
        );

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Failed to load products',
          description: 'There was an error loading your products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerProducts();
  }, [user, toast]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-agrigreen-900">Seller Dashboard</h1>
        <Link to="/seller/add-product">
          <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Dashboard Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dashboard Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Live Products</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'approved').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Approval</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Products</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center border-b border-gray-100 pb-4">
                      <div className="w-16 h-16 mr-4 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{product.name}</h3>
                          <span className="text-sm text-gray-600">₹{product.price}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        <div className="mt-1 flex items-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(product.status)}`}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            Added on {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't added any products yet</p>
                  <Link to="/seller/add-product" className="mt-2 inline-block text-agrigreen-600 hover:text-agrigreen-700">
                    Add your first product
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
