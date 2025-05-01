
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, CreditCard, ChevronLeft, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  delivery_address: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const PaymentReceiptPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !orderId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('buyer_id', user.id)
          .single();

        if (orderError) throw orderError;
        if (!orderData) {
          toast({
            title: 'Order not found',
            description: 'The requested order could not be found.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        setOrder({
          ...orderData,
          items: itemsData || []
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch order details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = () => {
    // Placeholder for download functionality
    toast({
      title: 'Download initiated',
      description: 'Your receipt is being prepared for download.',
    });
    // In a real app, generate PDF or other format for download
  };

  const handleShare = () => {
    // Placeholder for share functionality
    if (navigator.share) {
      navigator.share({
        title: 'My AgriConnect Order Receipt',
        text: `Order ID: ${orderId?.slice(0, 8)}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback
      toast({
        title: 'Link copied',
        description: 'Receipt link copied to clipboard.',
      });
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="animate-pulse">
            <CardHeader className="h-20 bg-gray-100"></CardHeader>
            <CardContent className="space-y-4">
              <div className="h-12 bg-gray-100 rounded"></div>
              <div className="h-24 bg-gray-100 rounded"></div>
              <div className="h-32 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Order Not Found</h2>
          <p className="mb-6 text-gray-600">The requested order does not exist or you don't have permission to view it.</p>
          <Link to="/buyer-dashboard">
            <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link to="/buyer-dashboard" className="inline-flex items-center text-agrigreen-600 hover:text-agrigreen-800">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        
        <Card className="border-2 border-dashed border-gray-200">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-agrigreen-600" />
                Payment Receipt
              </CardTitle>
              <div className="text-sm font-medium text-gray-500">
                #{order.id.slice(0, 8)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-agrigreen-800">
                  AgriConnect Mart
                </h3>
                <p className="text-sm text-gray-500">
                  Farm fresh, direct to your doorstep
                </p>
              </div>

              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  {order.status.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">{formatDate(order.created_at)}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Delivery Address:</span>
                <span className="font-medium text-right">{order.delivery_address}</span>
              </div>
              
              <div className="border-b pb-2">
                <div className="font-medium mb-2">Order Items:</div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-800">Total Amount:</span>
                <span className="text-agrigreen-700">₹{order.total_amount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2 pt-2">
                <span className="text-gray-600">Payment Status:</span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Paid
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500">
              Thank you for shopping with AgriConnect Mart!
              <br />
              For any queries, please contact support@agriconnect.com
            </div>
          </CardContent>
          
          <CardFooter className="border-t bg-gray-50">
            <div className="w-full text-center text-sm text-gray-500">
              Receipt generated on {new Date().toLocaleDateString()}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentReceiptPage;
