
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from '@/types';

const ViewOrders = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, user, navigate, toast]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*');

        if (error) throw error;
        setOrders(data || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to fetch orders: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchOrders();
    }
  }, [isAuthenticated, user, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewOrderDetails = async (order: Order) => {
    try {
      // Fetch order items for the selected order
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      
      if (error) throw error;
      
      // Attach items to the order
      setSelectedOrder({
        ...order,
        products: items || []
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to fetch order details: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading || loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-agrigreen-900">View Orders</h1>
        <p className="text-gray-600">Manage customer orders</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>A list of all orders on the platform</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{order.buyerId.substring(0, 8)}...</TableCell>
                  <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewOrderDetails(order)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                          <DialogDescription>
                            Order ID: {selectedOrder?.id}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedOrder && (
                          <div className="mt-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Customer ID</p>
                                <p>{selectedOrder.buyerId}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <Badge className={getStatusBadgeClass(selectedOrder.status)}>
                                  {selectedOrder.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Order Date</p>
                                <p>{formatDate(selectedOrder.createdAt)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                <p className="font-medium">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                              <p>{selectedOrder.deliveryAddress}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-2">Order Items</p>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedOrder.products.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell>{item.product_name}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>₹{parseFloat(item.price).toFixed(2)}</TableCell>
                                      <TableCell>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">No orders found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ViewOrders;
