
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Check, 
  X, 
  ChevronRight,
  Plus 
} from 'lucide-react';
import { Product } from '@/types';

// Mock data for pending products
const mockPendingProducts: Product[] = [
  {
    id: '7',
    name: 'Organic Carrots',
    description: 'Sweet and crunchy organically grown carrots',
    price: 35,
    images: ['https://images.unsplash.com/photo-1582515073490-39981397c445?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80'],
    category: 'Vegetables',
    sellerId: 'seller-2',
    sellerName: 'Green Acres Farm',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Basmati Rice',
    description: 'Premium long-grain aromatic rice variety',
    price: 150,
    images: ['https://images.unsplash.com/photo-1550367083-9fa5411cb4e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80'],
    category: 'Grains',
    sellerId: 'seller-5',
    sellerName: 'Punjab Rice Fields',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for users
const mockUsers = [
  {
    id: 'seller-1',
    name: 'Farmer John',
    email: 'john@farm.com',
    role: 'seller',
    products: 3,
    joined: '2025-01-15',
    status: 'active'
  },
  {
    id: 'seller-2',
    name: 'Green Acres Farm',
    email: 'contact@greenacres.com',
    role: 'seller',
    products: 2,
    joined: '2025-02-10',
    status: 'active'
  },
  {
    id: 'buyer-1',
    name: 'Consumer Jane',
    email: 'jane@example.com',
    role: 'buyer',
    orders: 5,
    joined: '2025-01-20',
    status: 'active'
  },
  {
    id: 'buyer-2',
    name: 'Amit Kumar',
    email: 'amit@example.com',
    role: 'buyer',
    orders: 2,
    joined: '2025-03-05',
    status: 'active'
  }
];

// Mock data for government schemes
const mockSchemes = [
  {
    id: '1',
    title: 'National Agriculture Market (e-NAM)',
    description: 'A pan-India electronic trading portal that networks existing agricultural markets to create a unified national market for agricultural commodities.',
    createdAt: '2025-01-10',
    status: 'active'
  },
  {
    id: '2',
    title: 'PM Kisan Samman Nidhi Yojana',
    description: 'Financial benefit of ₹6000 per year in three equal installments to eligible farmer families.',
    createdAt: '2025-02-15',
    status: 'active'
  },
  {
    id: '3',
    title: 'Soil Health Card Scheme',
    description: 'Government scheme to issue soil cards to farmers which will carry crop-wise recommendations of nutrients and fertilizers required.',
    createdAt: '2025-03-20',
    status: 'active'
  }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingProducts] = useState<Product[]>(mockPendingProducts);
  const [users] = useState(mockUsers);
  const [schemes] = useState(mockSchemes);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-agrigreen-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Products</CardTitle>
            <CardDescription>Total listed products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-8 w-8 text-agrigreen-600 mr-3" />
              <div>
                <p className="text-3xl font-bold">8</p>
                <p className="text-sm text-gray-500">Listed products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Approval</CardTitle>
            <CardDescription>Products awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-8 w-8 text-agriorange-500 mr-3" />
              <div>
                <p className="text-3xl font-bold">{pendingProducts.length}</p>
                <p className="text-sm text-gray-500">Pending review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>Registered platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-3xl font-bold">{users.length}</p>
                <p className="text-sm text-gray-500">Total users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Unread Messages</CardTitle>
            <CardDescription>Customer support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm text-gray-500">Unread messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="schemes">Gov. Schemes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Products Pending Approval</CardTitle>
              <CardDescription>
                Review and approve or reject seller product submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No pending products</h3>
                  <p className="text-gray-500 mt-2">All products have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingProducts.map((product) => (
                    <div key={product.id} className="bg-white p-4 border rounded-md shadow-sm">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-24 h-24 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <Badge className="w-fit bg-yellow-100 text-yellow-800 border-yellow-200">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Category: {product.category}
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: ₹{product.price}
                          </p>
                          <p className="text-sm text-gray-600">
                            Seller: {product.sellerName}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-agrigreen-500 text-agrigreen-600 hover:bg-agrigreen-50"
                          asChild
                        >
                          <Link to={`/admin/product/${product.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-agrigreen-600 hover:bg-agrigreen-700"
                        >
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage sellers and buyers on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4">Sellers</h3>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-4 border-b bg-muted/50 font-medium">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Products</div>
                    <div className="col-span-2">Joined</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  {users
                    .filter(user => user.role === 'seller')
                    .map(seller => (
                      <div 
                        key={seller.id} 
                        className="grid grid-cols-12 p-4 border-b hover:bg-muted/10 items-center"
                      >
                        <div className="col-span-3 font-medium">{seller.name}</div>
                        <div className="col-span-3 text-gray-600">{seller.email}</div>
                        <div className="col-span-2">{seller.products}</div>
                        <div className="col-span-2 text-gray-600">
                          {new Date(seller.joined).toLocaleDateString()}
                        </div>
                        <div className="col-span-2">
                          <Button size="sm" variant="ghost">
                            View <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Buyers</h3>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-4 border-b bg-muted/50 font-medium">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Orders</div>
                    <div className="col-span-2">Joined</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  {users
                    .filter(user => user.role === 'buyer')
                    .map(buyer => (
                      <div 
                        key={buyer.id} 
                        className="grid grid-cols-12 p-4 border-b hover:bg-muted/10 items-center"
                      >
                        <div className="col-span-3 font-medium">{buyer.name}</div>
                        <div className="col-span-3 text-gray-600">{buyer.email}</div>
                        <div className="col-span-2">{buyer.orders}</div>
                        <div className="col-span-2 text-gray-600">
                          {new Date(buyer.joined).toLocaleDateString()}
                        </div>
                        <div className="col-span-2">
                          <Button size="sm" variant="ghost">
                            View <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemes">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <CardTitle>Government Schemes</CardTitle>
                  <CardDescription>Manage agricultural government schemes</CardDescription>
                </div>
                <Button className="mt-4 md:mt-0 bg-agrigreen-600 hover:bg-agrigreen-700">
                  <Plus className="mr-2 h-4 w-4" /> Add New Scheme
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 border-b bg-muted/50 font-medium">
                  <div className="col-span-4">Title</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {schemes.map(scheme => (
                  <div 
                    key={scheme.id} 
                    className="grid grid-cols-12 p-4 border-b hover:bg-muted/10 items-center"
                  >
                    <div className="col-span-4 font-medium">{scheme.title}</div>
                    <div className="col-span-4 text-gray-600 truncate">{scheme.description}</div>
                    <div className="col-span-2 text-gray-600">
                      {new Date(scheme.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>
                  Platform sales data and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Sales chart will be displayed here</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Monthly Sales</p>
                    <p className="font-semibold">₹28,500</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-gray-500">Growth</p>
                    <p className="font-semibold text-green-600">+12.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">User growth chart will be displayed here</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="font-semibold">124</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-gray-500">New This Month</p>
                    <p className="font-semibold text-green-600">16</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Predictions</CardTitle>
                <CardDescription>
                  AI-powered agricultural price trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Price prediction chart will be displayed here</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="font-medium">Rice</span>
                    <span className="text-green-600">+8.2% (30 days)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="font-medium">Wheat</span>
                    <span className="text-green-600">+5.7% (30 days)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="font-medium">Tomatoes</span>
                    <span className="text-red-600">-3.1% (30 days)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather Impact</CardTitle>
                <CardDescription>
                  Weather forecasts and crop impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Weather impact chart will be displayed here</p>
                </div>
                <div className="p-4 border rounded-md bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-2">Monsoon Forecast</h4>
                  <p className="text-sm text-gray-700">
                    The upcoming monsoon season is predicted to be favorable across most agricultural regions, with rainfall expected to be 2% above normal. This is likely to positively impact rice, wheat, and vegetable crops.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Message Center</CardTitle>
              <CardDescription>
                Manage conversations between buyers and sellers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Recent Conversations</h3>
                    <Badge className="bg-red-100 text-red-800 border-red-200">3 Unread</Badge>
                  </div>
                </div>
                <div className="flex h-full">
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-3 border-b bg-red-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          C
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Consumer Jane</p>
                            <Badge className="bg-red-100 text-red-800 border-red-200">New</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            I have an issue with my order...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-b bg-red-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-agrigreen-100 rounded-full flex items-center justify-center text-agrigreen-600 font-medium">
                          F
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Farmer John</p>
                            <Badge className="bg-red-100 text-red-800 border-red-200">New</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            When will my product be approved?
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-b bg-red-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                          A
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Amit Kumar</p>
                            <Badge className="bg-red-100 text-red-800 border-red-200">New</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            Need help with my delivery...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium">
                          S
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Sweet Valley Apiaries</p>
                          <p className="text-sm text-gray-500 truncate">
                            Thank you for your help with...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-2/3 flex flex-col">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                            C
                          </div>
                          <div>
                            <p className="font-medium">Consumer Jane</p>
                            <p className="text-sm text-gray-500">Buyer</p>
                          </div>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex justify-start">
                          <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                            <p>Hello admin, I have an issue with my order #ORD-003. The honey I received seems to have crystallized. Is this normal?</p>
                            <p className="text-xs text-gray-500 mt-1">2h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-agrigreen-100 rounded-lg p-3 max-w-[80%]">
                            <p className="mb-2">Hi Jane, thank you for reaching out.</p>
                            <p className="mb-2">Yes, it's completely normal for raw honey to crystallize over time. This is actually a sign of quality and doesn't affect the taste or nutritional value.</p>
                            <p>You can gently warm the jar in warm water to return it to liquid form if you prefer.</p>
                            <p className="text-xs text-gray-500 mt-1">1h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                            <p>Oh, I didn't know that! Thank you for the information and the tip about warming it. I'll try that.</p>
                            <p className="text-xs text-gray-500 mt-1">30m ago</p>
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

export default AdminDashboard;
