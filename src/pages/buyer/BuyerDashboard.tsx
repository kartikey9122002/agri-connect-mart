
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  Map, 
  MessageSquare, 
  ChevronRight 
} from 'lucide-react';

// Mock orders data
const orders = [
  {
    id: 'ORD-001',
    date: '2025-04-20',
    total: 240,
    status: 'delivered',
    items: [
      {
        id: '1',
        name: 'Organic Rice',
        quantity: 2,
        price: 120,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
      }
    ],
    seller: {
      id: 'seller-1',
      name: 'Farmer John'
    }
  },
  {
    id: 'ORD-002',
    date: '2025-04-15',
    total: 80,
    status: 'processing',
    items: [
      {
        id: '4',
        name: 'Fresh Apples',
        quantity: 1,
        price: 80,
        image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
      }
    ],
    seller: {
      id: 'seller-1',
      name: 'Farmer John'
    }
  },
  {
    id: 'ORD-003',
    date: '2025-04-05',
    total: 250,
    status: 'delivered',
    items: [
      {
        id: '3',
        name: 'Raw Honey',
        quantity: 1,
        price: 250,
        image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
      }
    ],
    seller: {
      id: 'seller-3',
      name: 'Sweet Valley Apiaries'
    }
  }
];

const BuyerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-agrigreen-900">My Account</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Consumer'}</p>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Orders</CardTitle>
                  <CardDescription>All your purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ShoppingBag className="h-8 w-8 text-agriorange-500 mr-3" />
                    <div>
                      <p className="text-3xl font-bold">{orders.length}</p>
                      <p className="text-sm text-gray-500">Orders placed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Completed</CardTitle>
                  <CardDescription>Successfully delivered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-agrigreen-600 mr-3" />
                    <div>
                      <p className="text-3xl font-bold">
                        {orders.filter(order => order.status === 'delivered').length}
                      </p>
                      <p className="text-sm text-gray-500">Delivered orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">In Progress</CardTitle>
                  <CardDescription>Currently processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Truck className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-3xl font-bold">
                        {orders.filter(order => order.status === 'processing').length}
                      </p>
                      <p className="text-sm text-gray-500">Active orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track and manage your orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                    <p className="text-gray-500 mt-2">Start shopping to see your orders here.</p>
                    <Button asChild className="mt-6 bg-agrigreen-600 hover:bg-agrigreen-700">
                      <Link to="/products">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 p-4 border-b bg-muted/50 font-medium">
                      <div className="col-span-4 md:col-span-3">Order</div>
                      <div className="col-span-4 md:col-span-3">Date</div>
                      <div className="col-span-2 md:col-span-2">Total</div>
                      <div className="col-span-2 md:col-span-2">Status</div>
                      <div className="hidden md:block md:col-span-2">Actions</div>
                    </div>

                    {orders.map((order) => (
                      <div key={order.id} className="grid grid-cols-12 p-4 border-b hover:bg-muted/10 items-center">
                        <div className="col-span-4 md:col-span-3 font-medium">{order.id}</div>
                        <div className="col-span-4 md:col-span-3 text-gray-600">
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                        <div className="col-span-2 md:col-span-2">₹{order.total}</div>
                        <div className="col-span-2 md:col-span-2">
                          <Badge
                            className={
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : order.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : ''
                            }
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="hidden md:flex md:col-span-2 justify-end">
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/orders/${order.id}`}>
                              View <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Your most recent order</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders to display.</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-semibold">{orders[0].id}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(orders[0].date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        className={
                          orders[0].status === 'delivered'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : orders[0].status === 'processing'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : orders[0].status === 'shipped'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : ''
                        }
                      >
                        {orders[0].status.charAt(0).toUpperCase() + orders[0].status.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {orders[0].items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-3 border rounded-md">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Sold by: {orders[0].seller.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{orders[0].total}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Delivery</span>
                        <span className="text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>₹{orders[0].total}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3 justify-end">
                      <Button 
                        variant="outline" 
                        className="border-agrigreen-500 text-agrigreen-600 hover:bg-agrigreen-50"
                      >
                        <FileText className="mr-2 h-4 w-4" /> Download Receipt
                      </Button>
                      <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
                        <MessageSquare className="mr-2 h-4 w-4" /> Contact Seller
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
              <CardDescription>Track the real-time location of your deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.filter(order => order.status === 'processing').length === 0 ? (
                <div className="text-center py-12">
                  <Map className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No active deliveries</h3>
                  <p className="text-gray-500 mt-2">
                    You don't have any orders in transit at the moment.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {orders.find(order => order.status === 'processing')?.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Estimated delivery: April 27, 2025
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        In Transit
                      </Badge>
                    </div>

                    <div className="relative pt-6">
                      <div className="flex mb-10">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-agrigreen-600 z-10 flex items-center justify-center">
                            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="currentColor">
                              <path d="M10.28 4.28L5 9.56l-2.28-2.28a1 1 0 00-1.42 1.42l3 3a1 1 0 001.42 0l6-6a1 1 0 00-1.42-1.42z" />
                            </svg>
                          </div>
                          <div className="h-full border-l border-dashed border-gray-300 flex-grow"></div>
                        </div>
                        <div className="ml-4 pb-8 flex-grow">
                          <h4 className="font-medium">Order Confirmed</h4>
                          <p className="text-sm text-gray-500">April 15, 2025, 09:15 AM</p>
                        </div>
                      </div>

                      <div className="flex mb-10">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-agrigreen-600 z-10 flex items-center justify-center">
                            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="currentColor">
                              <path d="M10.28 4.28L5 9.56l-2.28-2.28a1 1 0 00-1.42 1.42l3 3a1 1 0 001.42 0l6-6a1 1 0 00-1.42-1.42z" />
                            </svg>
                          </div>
                          <div className="h-full border-l border-dashed border-gray-300 flex-grow"></div>
                        </div>
                        <div className="ml-4 pb-8 flex-grow">
                          <h4 className="font-medium">Processing</h4>
                          <p className="text-sm text-gray-500">April 16, 2025, 11:30 AM</p>
                        </div>
                      </div>

                      <div className="flex mb-10">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-blue-500 z-10 flex items-center justify-center relative">
                            <div className="absolute w-3 h-3 rounded-full bg-blue-200 animate-ping"></div>
                            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="currentColor">
                              <path d="M6 0.5a5.5 5.5 0 105.5 5.5A5.51 5.51 0 006 0.5zm.7 8.66a.75.75 0 01-1.4-0.32V4.25a.75.75 0 011.5 0v3.9l.9-0.9a.75.75 0 111.06 1.06l-2.1 2.1a.75.75 0 01-0.53.22z" />
                            </svg>
                          </div>
                          <div className="h-full border-l border-dashed border-gray-300 flex-grow"></div>
                        </div>
                        <div className="ml-4 pb-8 flex-grow">
                          <h4 className="font-medium">In Transit</h4>
                          <p className="text-sm text-gray-500">April 18, 2025, 14:45 PM</p>
                          <p className="text-sm text-blue-600 mt-1">Currently on the way to your location</p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-300 z-10"></div>
                        </div>
                        <div className="ml-4 flex-grow">
                          <h4 className="font-medium text-gray-500">Delivered</h4>
                          <p className="text-sm text-gray-500">Estimated: April 27, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-64 bg-gray-100 rounded-lg mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-500">Map tracking view will be displayed here</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" className="border-gray-300">
                      <MessageSquare className="mr-2 h-4 w-4" /> Contact Delivery Agent
                    </Button>
                    <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
                      Refresh Tracking
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Communicate with sellers and admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Recent Conversations</h3>
                    <Button variant="outline" size="sm" className="border-agrigreen-500 text-agrigreen-600 hover:bg-agrigreen-50">
                      <MessageSquare className="mr-2 h-4 w-4" /> New Message
                    </Button>
                  </div>
                </div>
                <div className="flex h-full">
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-agrigreen-100 rounded-full flex items-center justify-center text-agrigreen-600 font-medium">
                          F
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Farmer John</p>
                          <p className="text-sm text-gray-500 truncate">
                            Yes, it's available! How many kg...
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">5h ago</div>
                      </div>
                    </div>
                    <div className="p-3 border-b bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          S
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Sweet Valley Apiaries</p>
                          <p className="text-sm text-gray-500 truncate">
                            Thank you for your order! The...
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">2d ago</div>
                      </div>
                    </div>
                    <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                          A
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Admin Support</p>
                          <p className="text-sm text-gray-500 truncate">
                            How can I help you today?
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">1w ago</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-2/3 flex flex-col">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-agrigreen-100 rounded-full flex items-center justify-center text-agrigreen-600 font-medium">
                          F
                        </div>
                        <div>
                          <p className="font-medium">Farmer John</p>
                          <p className="text-sm text-gray-500">Seller</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <div className="bg-agrigreen-100 rounded-lg p-3 max-w-[80%]">
                            <p>Hello, I'm interested in your organic rice. Is it still available for purchase?</p>
                            <p className="text-xs text-gray-500 mt-1">5h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <p>Yes, it's available! How many kg would you like?</p>
                            <p className="text-xs text-gray-500 mt-1">5h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-agrigreen-100 rounded-lg p-3 max-w-[80%]">
                            <p>I'd like to order 5kg. Do you deliver to Delhi NCR?</p>
                            <p className="text-xs text-gray-500 mt-1">4h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <p>Yes, we deliver to Delhi NCR. The delivery is free for your first order!</p>
                            <p className="text-xs text-gray-500 mt-1">4h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-agrigreen-100 rounded-lg p-3 max-w-[80%]">
                            <p>Great! How long will it take to deliver?</p>
                            <p className="text-xs text-gray-500 mt-1">3h ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input placeholder="Type a message..." className="flex-grow" />
                        <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerDashboard;
