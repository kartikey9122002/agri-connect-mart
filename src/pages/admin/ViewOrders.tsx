import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ViewOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*');

        if (ordersError) {
          throw new Error(`Error fetching orders: ${ordersError.message}`);
        }

        if (!ordersData) {
          throw new Error('No orders found');
        }

        // Format orders to match the Order interface
        const formattedOrders = ordersData.map(order => ({
          id: order.id,
          buyerId: order.buyer_id,
          totalAmount: order.total_amount,
          deliveryAddress: order.delivery_address,
          status: order.status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          products: [] // Will be filled later
        }));

        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
          formattedOrders.map(async (order) => {
            const { data: orderItemsData, error: orderItemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);

            if (orderItemsError) {
              console.error(`Error fetching order items for order ${order.id}: ${orderItemsError.message}`);
              return order; // Return order without items in case of error
            }

            // Format order items
            const orderItems = orderItemsData.map(item => ({
              productId: item.product_id,
              productName: item.product_name,
              quantity: item.quantity,
              price: item.price
            }));

            return { ...order, products: orderItems };
          })
        );

        setOrders(ordersWithItems);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          Here are the orders placed by buyers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer ID</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Delivery Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Products</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.buyerId}</TableCell>
                <TableCell>{order.totalAmount}</TableCell>
                <TableCell>{order.deliveryAddress}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.createdAt}</TableCell>
                <TableCell>
                  {order.products.map((product) => (
                    <div key={product.productId}>
                      {product.productName} x {product.quantity}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ViewOrders;
