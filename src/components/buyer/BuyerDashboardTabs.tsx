
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, 
  Receipt, 
  Clock, 
  MessageSquare 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderTracker from '@/components/buyer/OrderTracker';
import PaymentReceipt from '@/components/buyer/PaymentReceipt';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductReceipt, ChatMessage } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const BuyerDashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<any>({
    orderStatus: 'out-for-delivery',
    orderNumber: '99ad3405',
    estimatedDelivery: 'Tomorrow'
  });
  const [receipts, setReceipts] = useState<ProductReceipt[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch payment receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      if (!user) return;
      
      try {
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            product_id,
            product_name,
            quantity,
            price,
            created_at,
            orders!inner(buyer_id, delivery_address)
          `)
          .eq('orders.buyer_id', user.id);

        if (orderItemsError) throw orderItemsError;

        const formattedReceipts = orderItems?.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          orderId: item.order_id,
          quantity: item.quantity,
          totalPrice: parseFloat(item.price),
          buyerId: user.id,
          buyerName: user.name,
          createdAt: item.created_at,
          deliveryAddress: item.orders?.delivery_address
        })) || [];

        setReceipts(formattedReceipts);
      } catch (error) {
        console.error('Error fetching receipts:', error);
        toast({
          title: 'Failed to load receipts',
          description: 'Could not load your payment receipts. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (activeTab === 'receipts') {
      fetchReceipts();
    }
  }, [user, activeTab, toast]);

  // Fetch browsing history (recent products)
  useEffect(() => {
    const fetchBrowsingHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, profiles!inner(full_name)')
          .eq('status', 'approved')
          .order('updated_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedHistory = data?.map(product => ({
          id: product.id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          sellerName: product.profiles?.full_name,
          price: product.price,
          viewedAt: new Date().toISOString() // Mock viewed date for demo
        })) || [];

        setBrowsingHistory(formattedHistory);
      } catch (error) {
        console.error('Error fetching browsing history:', error);
        toast({
          title: 'Failed to load browsing history',
          description: 'Could not load your browsing history. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (activeTab === 'history') {
      fetchBrowsingHistory();
    }
  }, [activeTab, toast]);

  // Fetch message threads
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      try {
        // Fetch threads where the current user is the buyer
        const { data: threads, error: threadsError } = await supabase
          .from('chat_threads')
          .select(`
            id,
            updated_at,
            seller_id,
            product_id,
            profiles!chat_threads_seller_id_fkey(full_name)
          `)
          .eq('buyer_id', user.id)
          .order('updated_at', { ascending: false });

        if (threadsError) throw threadsError;

        // Fetch the last message for each thread
        const messagePromises = threads?.map(async (thread) => {
          const { data: lastMessage, error: messageError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (messageError && messageError.code !== 'PGRST116') {
            throw messageError;
          }

          return {
            id: lastMessage?.id || `thread-${thread.id}`,
            threadId: thread.id,
            senderId: lastMessage?.sender_id || '',
            senderName: thread.profiles?.full_name || 'Unknown Seller',
            senderRole: 'seller',
            receiverId: user.id,
            receiverName: user.name,
            content: lastMessage?.content || 'Start a conversation...',
            timestamp: lastMessage?.created_at || thread.updated_at,
            isRead: lastMessage?.is_read || false
          };
        }) || [];

        const messagesData = await Promise.all(messagePromises);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Failed to load messages',
          description: 'Could not load your messages. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [user, activeTab, toast]);

  // Format date for display
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

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">My Orders</span>
        </TabsTrigger>
        <TabsTrigger value="receipts" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Payment Receipts</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Browsing History</span>
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Messages</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrderTracker 
              orderStatus={orders.orderStatus}
              orderNumber={orders.orderNumber}
              estimatedDelivery={orders.estimatedDelivery}
            />
          </div>
          <div className="lg:col-span-1">
            {/* Additional order information can go here */}
            <div className="bg-white p-4 rounded-md border shadow-sm">
              <h3 className="text-lg font-medium mb-2">Order Summary</h3>
              <div className="text-sm text-gray-600">
                <p>View your orders and track their delivery status.</p>
                <div className="mt-4">
                  <Button size="sm" asChild>
                    <Link to="/buyer/orders">View All Orders</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="receipts">
        <div className="bg-white rounded-md border shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Payment Receipts</h3>
            <p className="text-sm text-gray-600">View and download receipts for your purchases</p>
          </div>
          
          {receipts.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No payment receipts found</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">#{receipt.id.slice(0, 8)}</TableCell>
                        <TableCell>{receipt.productName}</TableCell>
                        <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                        <TableCell>₹{receipt.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/buyer/receipt/${receipt.orderId}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {receipts.length > 0 && (
                <div className="p-4">
                  <PaymentReceipt receipt={receipts[0]} />
                </div>
              )}
            </>
          )}
        </div>
      </TabsContent>

      <TabsContent value="history">
        <div className="bg-white rounded-md border shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Your Browsing History</h3>
            <p className="text-sm text-gray-600">Recently viewed products</p>
          </div>
          
          {browsingHistory.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No browsing history yet</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/products">Explore Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
              {browsingHistory.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32 bg-gray-100">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <p className="text-agrigreen-600 font-semibold text-sm">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Viewed {new Date(product.viewedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="p-4 border-t text-center">
            <Button variant="outline" asChild>
              <Link to="/buyer/history">View Full History</Link>
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="messages">
        <div className="bg-white rounded-md border shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Message Threads</h3>
            <p className="text-sm text-gray-600">Communicate with sellers about their products</p>
          </div>
          
          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No message threads yet</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">How to start a conversation:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside text-left max-w-xs mx-auto">
                  <li>Visit a product page</li>
                  <li>Click on "Chat with Seller"</li>
                  <li>Ask questions about the product</li>
                  <li>Discuss delivery options or special requirements</li>
                </ul>
                <Button className="mt-4" asChild>
                  <Link to="/products">Browse Products</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {messages.map((thread) => (
                <Link 
                  key={thread.id} 
                  to={`/buyer/messages?thread=${thread.threadId}`}
                  className="flex items-start p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 bg-agrigreen-100 text-agrigreen-800 rounded-full flex items-center justify-center font-medium">
                    {thread.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{thread.senderName}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(thread.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{thread.content}</p>
                  </div>
                  {!thread.isRead && (
                    <div className="h-2 w-2 bg-agrigreen-500 rounded-full mt-2"></div>
                  )}
                </Link>
              ))}
            </div>
          )}
          
          <div className="p-4 border-t text-center">
            <Button asChild>
              <Link to="/buyer/messages">View All Messages</Link>
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BuyerDashboardTabs;
