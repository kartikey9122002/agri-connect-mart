
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Search, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types';

const BrowsingHistoryPage = () => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch approved products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'approved')
          .order('updated_at', { ascending: false })
          .limit(12);

        if (error) throw error;

        // Process products with seller details
        const productsWithDetails = await Promise.all(
          (data || []).map(async (product) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', product.seller_id)
              .single();
              
            return {
              id: product.id,
              name: product.name,
              description: product.description || '',
              price: product.price,
              images: product.images || [],
              category: product.category,
              sellerId: product.seller_id,
              sellerName: profileData?.full_name || 'Unknown Seller',
              status: product.status,
              availability: product.availability || 'available',
              createdAt: product.created_at,
              updatedAt: product.updated_at
            } as Product;
          })
        );

        setRecentProducts(productsWithDetails);
      } catch (error) {
        console.error('Error fetching recent products:', error);
        toast({
          title: 'Failed to load products',
          description: 'Could not load recent products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProducts();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Browsing History</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-gray-100"></div>
              <CardContent className="p-3">
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Clock className="text-agrigreen-600 mr-2 h-5 w-5" />
          <h1 className="text-2xl font-bold">Your Browsing History</h1>
        </div>
        <Link to="/products">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </Link>
      </div>

      {recentProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium">No browsing history yet</h3>
                <p className="text-gray-500 mt-1">Start exploring our agricultural products!</p>
              </div>
              <Link to="/products">
                <Button className="mt-4 bg-agrigreen-600 hover:bg-agrigreen-700">
                  Discover Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-40 bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-agrigreen-600 font-semibold">
                        ₹{product.price.toFixed(2)}
                      </p>
                      <span className="text-xs text-gray-500">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      Sold by: {product.sellerName}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">Showing recent products you might be interested in.</p>
            <Link to="/products">
              <Button variant="outline" className="mt-2">
                View All Products
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default BrowsingHistoryPage;
