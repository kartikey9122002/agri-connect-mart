import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Package, 
  MessageSquare, 
  FileText,
  Plus,
  ChevronRight
} from 'lucide-react';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Rice',
    description: 'Premium quality organic rice grown without pesticides',
    price: 120,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'],
    category: 'Grains',
    sellerId: 'seller-1',
    sellerName: 'Farmer John',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Fresh Apples',
    description: 'Crisp, sweet apples picked from our orchard',
    price: 80,
    images: ['https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'],
    category: 'Fruits',
    sellerId: 'seller-1',
    sellerName: 'Farmer John',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Fresh Farm Eggs',
    description: 'Free-range eggs from pasture-raised chickens',
    price: 90,
    images: ['https://images.unsplash.com/photo-1489734353536-27e3e5b51d41?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80'],
    category: 'Dairy',
    sellerId: 'seller-1',
    sellerName: 'Farmer John',
    status: 'rejected',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const SellerDashboard = () => {
  const { user } = useAuth();
  const [products] = useState<Product[]>(mockProducts);
  const [tab, setTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-agrigreen-900">Seller Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Seller'}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild className="bg-agrigreen-600 hover:bg-agrigreen-700">
            <Link to="/seller/add-product">
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Products</CardTitle>
                <CardDescription>All your listed products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-agrigreen-600 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{products.length}</p>
                    <p className="text-sm text-gray-500">Listed products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Approved Products</CardTitle>
                <CardDescription>Products ready to sell</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{products.filter(p => p.status === 'approved').length}</p>
                    <p className="text-sm text-gray-500">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Review</CardTitle>
                <CardDescription>Awaiting admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{products.filter(p => p.status === 'pending').length}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Sales</CardTitle>
                <CardDescription>Revenue from your products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-agriorange-500 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">₹1,250</p>
                    <p className="text-sm text-gray-500">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Your recently added products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-md hover:bg-gray-50">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-medium">₹{product.price}</p>
                        <Badge
                          className={`
                            ${product.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                            ${product.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                            ${product.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                          `}
                        >
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => setTab('products')} className="border-agrigreen-500 text-agrigreen-600 hover:bg-agrigreen-50">
                    View All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Latest Notifications</CardTitle>
                <CardDescription>Updates about your products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-md bg-green-50 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-green-800">Product Approved</p>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Your product "Organic Rice" has been approved.</p>
                  </div>
                  
                  <div className="p-3 rounded-md bg-yellow-50 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-yellow-800">New Message</p>
                      <span className="text-xs text-gray-500">5h ago</span>
                    </div>
                    <p className="text-sm text-gray-600">You have a new message from a buyer.</p>
                  </div>
                  
                  <div className="p-3 rounded-md bg-blue-50 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-blue-800">Price Alert</p>
                      <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Market price for "Rice" has increased by 5%.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Government Schemes</CardTitle>
                <CardDescription>Latest agricultural schemes that might benefit you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-agriorange-700">National Agriculture Market (e-NAM)</h4>
                        <p className="text-sm text-gray-600 mt-1">A pan-India electronic trading portal that networks existing agricultural markets to create a unified national market for agricultural commodities.</p>
                      </div>
                      <Button variant="outline" className="shrink-0 border-agriorange-500 text-agriorange-600 hover:bg-agriorange-50">
                        <FileText className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-agriorange-700">PM Kisan Samman Nidhi Yojana</h4>
                        <p className="text-sm text-gray-600 mt-1">Financial benefit of ₹6000 per year in three equal installments to eligible farmer families.</p>
                      </div>
                      <Button variant="outline" className="shrink-0 border-agriorange-500 text-agriorange-600 hover:bg-agriorange-50">
                        <FileText className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild className="border-agrigreen-500 text-agrigreen-600 hover:bg-agrigreen-50">
                    <Link to="/schemes">
                      View All Schemes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <CardTitle>My Products</CardTitle>
                  <CardDescription>Manage all your listed products</CardDescription>
                </div>
                <Button asChild className="mt-4 md:mt-0 bg-agrigreen-600 hover:bg-agrigreen-700">
                  <Link to="/seller/add-product">
                    <Plus className="mr-2 h-4 w-4" /> Add New Product
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 border-b bg-muted/50 font-medium">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1"></div>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="grid grid-cols-12 p-4 border-b items-center hover:bg-muted/20">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">{product.name}</div>
                    </div>
                    <div className="col-span-2">₹{product.price}</div>
                    <div className="col-span-2">{product.category}</div>
                    <div className="col-span-2">
                      <Badge
                        className={`
                          ${product.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                          ${product.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                          ${product.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                        `}
                      >
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p>No products found</p>
                    <Button className="mt-4 bg-agrigreen-600 hover:bg-agrigreen-700">
                      <Link to="/seller/add-product">
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Product
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Price Predictions & Analytics</CardTitle>
              <CardDescription>
                View price trends and predictions for your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium mb-4">Predicted Price Trends - Organic Rice</h3>
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500">Price prediction chart will be displayed here</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Current Price</p>
                      <p className="font-semibold">₹120/kg</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-gray-500">Predicted (1 month)</p>
                      <p className="font-semibold text-green-600">₹132/kg (+10%)</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-gray-500">Predicted (3 months)</p>
                      <p className="font-semibold text-green-600">₹138/kg (+15%)</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Market Average</p>
                      <p className="font-semibold">₹115/kg</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium mb-4">Weather Impact on Crops</h3>
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500">Weather impact chart will be displayed here</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Forecast:</span> The upcoming monsoon season is predicted to be favorable for rice cultivation in your region, potentially increasing yield by 8-12%.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium mb-4">Sales Performance</h3>
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500">Sales performance chart will be displayed here</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Total Sales (MTD)</p>
                      <p className="font-semibold">₹1,250</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Orders (MTD)</p>
                      <p className="font-semibold">8</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-gray-500">Growth (MoM)</p>
                      <p className="font-semibold text-green-600">+12.4%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Avg. Order Value</p>
                      <p className="font-semibold">₹156.25</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Communicate with buyers and admin
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
                          A
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Admin Support</p>
                          <p className="text-sm text-gray-500 truncate">
                            Your product has been approved...
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">2h ago</div>
                      </div>
                    </div>
                    <div className="p-3 border-b bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          R
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Rahul Sharma</p>
                          <p className="text-sm text-gray-500 truncate">
                            Is the rice still available for...
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">5h ago</div>
                      </div>
                    </div>
                    <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                          P
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Priya Desai</p>
                          <p className="text-sm text-gray-500 truncate">
                            Thank you for the quick delivery!
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">1d ago</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-2/3 flex flex-col">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          R
                        </div>
                        <div>
                          <p className="font-medium">Rahul Sharma</p>
                          <p className="text-sm text-gray-500">Buyer</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <p>Hello, I'm interested in your organic rice. Is it still available for purchase?</p>
                            <p className="text-xs text-gray-500 mt-1">5h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-agrigreen-100 rounded-lg p-3 max-w-[80%]">
                            <p>Yes, it's available! How many kg would you like?</p>
                            <p className="text-xs text-gray-500 mt-1">5h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <p>I'd like to order 5kg. Do you deliver to Delhi NCR?</p>
                            <p className="text-xs text-gray-500 mt-1">4h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-agrigreen-100 rounded-lg p-3 max-w-[80%]">
                            <p>Yes, we deliver to Delhi NCR. The delivery is free for your first order!</p>
                            <p className="text-xs text-gray-500 mt-1">4h ago</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
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

export default SellerDashboard;
