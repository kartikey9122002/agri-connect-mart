
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, MessageCircle, History, Receipt, TrendingUp } from 'lucide-react';
import OrderTracker from '@/components/buyer/OrderTracker';
import PaymentReceipt from '@/components/buyer/PaymentReceipt';
import SeasonalPriceTrendsCard from '@/components/buyer/SeasonalPriceTrendsCard';
import { Product, ProductReceipt } from '@/types';

interface Order {
  id: string;
  buyerId: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const BuyerDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<ProductReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user data
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            buyer_id,
            delivery_address,
            total_amount,
            status,
            created_at,
            updated_at,
            order_items (
              id,
              product_id,
              product_name,
              quantity,
              price
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (orderError) throw orderError;
        
        // Process orders into our Order type
        const processedOrders = (orderData || []).map(order => ({
          id: order.id,
          buyerId: order.buyer_id,
          products: (order.order_items || []).map(item => ({
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: order.total_amount,
          deliveryAddress: order.delivery_address,
          status: order.status,
          createdAt: order.created_at,
          updatedAt: order.updated_at
        }));
        
        setOrders(processedOrders);

        // For demo purposes, generate mock receipts
        if (orderData && orderData.length > 0) {
          generateMockReceipts(processedOrders);
        }

        // Fetch recently viewed products
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(4);

        if (productError) throw productError;

        // Process products
        const productsWithDetails = await Promise.all(
          (productData || []).map(async (product) => {
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
              availability: 'available', // Default value
              createdAt: product.created_at,
              updatedAt: product.updated_at
            } as Product;
          })
        );

        setRecentProducts(productsWithDetails);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Failed to load data',
          description: 'Could not load your dashboard data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  // Generate mock receipts for demo purposes
  const generateMockReceipts = (orders: Order[]) => {
    const mockReceipts = orders.slice(0, 2).map(order => {
      const product = order.products[0];
      return {
        id: `RCPT-${Math.random().toString(36).substring(7).toUpperCase()}`,
        productId: product?.productId || '',
        productName: product?.productName || 'Agricultural Product',
        orderId: order.id,
        quantity: product?.quantity || 1,
        totalPrice: product?.price || order.totalAmount,
        buyerId: order.buyerId,
        buyerName: 'You',
        createdAt: order.createdAt
      } as ProductReceipt;
    });
    
    setReceipts(mockReceipts);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-agrigreen-900">Buyer Dashboard</h1>
          <p className="text-gray-600">Welcome back{user ? `, ${user.name}` : ''}!</p>
        </div>
        
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Link to="/products">
            <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
              <ShoppingBag className="mr-2 h-4 w-4" /> Shop Products
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-gray-100 h-12"></CardHeader>
              <CardContent className="p-4">
                <div className="h-32 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" /> My Orders
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center">
              <Receipt className="mr-2 h-4 w-4" /> Payment Receipts
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="mr-2 h-4 w-4" /> Browsing History
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center">
              <MessageCircle className="mr-2 h-4 w-4" /> Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.length > 0 ? (
                <OrderTracker 
                  orderStatus="out-for-delivery" 
                  orderNumber={orders[0].id.slice(0, 8)} 
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <Link to="/products" className="mt-4 inline-block">
                      <Button>Browse Products</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              
              <SeasonalPriceTrendsCard />
            </div>
            
            {orders.length > 0 && (
              <div className="mt-6">
                <Link to={`/buyer/receipt/${orders[0].id}`}>
                  <Button variant="outline" className="w-full">
                    <Receipt className="mr-2 h-4 w-4" />
                    View Latest Order Receipt
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="receipts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {receipts.length > 0 ? (
                receipts.map(receipt => (
                  <PaymentReceipt key={receipt.id} receipt={receipt} />
                ))
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Receipts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">No payment receipts available.</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/buyer/history">
                <Button variant="outline">
                  <History className="mr-2 h-4 w-4" />
                  View Full Purchase History
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recently Viewed Products</CardTitle>
              </CardHeader>
              <CardContent>
                {recentProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recentProducts.map(product => (
                      <Link key={product.id} to={`/products/${product.id}`} className="group">
                        <div className="border rounded-md overflow-hidden transition-all group-hover:shadow-md">
                          <div className="h-32 bg-gray-100">
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
                          <div className="p-2">
                            <h3 className="font-medium text-sm truncate">{product.name}</h3>
                            <p className="text-agrigreen-700 text-xs">₹{product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recently viewed products.</p>
                )}
                
                <div className="mt-4 text-center">
                  <Link to="/buyer/history">
                    <Button variant="outline">
                      <History className="mr-2 h-4 w-4" />
                      View Full Browsing History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-agrigreen-600" />
                  Chat with Sellers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">
                    Communicate directly with farmers and sellers about their products.
                  </p>
                  <Link to="/buyer/messages">
                    <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Go to Messages
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-2">How to start a conversation:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Visit a product page</li>
                    <li>Click on "Chat with Seller"</li>
                    <li>Ask questions about the product</li>
                    <li>Discuss delivery options or special requirements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BuyerDashboard;
