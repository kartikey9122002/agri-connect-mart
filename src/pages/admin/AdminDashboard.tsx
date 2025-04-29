import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Check, PackageOpen, Users, FileCheck, MessageSquare, CreditCard, ChevronRight, Package, AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    activeSchemes: 0
  });
  const [recentActivity, setRecentActivity] = useState<{type: string, message: string, date: string}[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch pending products count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (pendingError) throw pendingError;
       


        // Fetch total products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (productsError) throw productsError;

        // Fetch total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;

        // Fetch total orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (ordersError) throw ordersError;

        // Update stats
        setStats({
          totalUsers: usersCount || 0,
          totalProducts: productsCount || 0,
          pendingProducts: pendingCount || 0,
          totalOrders: ordersCount || 0,
          activeSchemes: 6 // Default for now
        });
        
        console.log('pendingCount raw value:', pendingCount);
        console.log('Type:', typeof pendingCount);

        // Fetch recent activity (products awaiting approval)
        if (pendingCount > 0) {
          const { data: pendingProducts, error } = await supabase
            .from('products')
            .select('name, created_at')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);


          
          if (!error && pendingProducts) {
            const activity = pendingProducts.map(product => ({
              type: 'product',
              message: `New product "${product.name}" awaiting approval`,
              date: new Date(product.created_at).toLocaleDateString()
            }));
            
            setRecentActivity(activity);
          }
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (isAuthenticated && user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <div className="p-8 flex justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-agrigreen-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage products, users, and platform operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pendingProducts > 0 ? "border-amber-300" : ""}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold">{stats.pendingProducts}</p>
              </div>
              <div className={`${stats.pendingProducts > 0 ? 'bg-amber-100' : 'bg-gray-100'} p-3 rounded-full`}>
                <PackageOpen className={`h-5 w-5 ${stats.pendingProducts > 0 ? 'text-amber-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Schemes</p>
                <p className="text-2xl font-bold">{stats.activeSchemes}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FileCheck className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common admin operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant={stats.pendingProducts > 0 ? "default" : "outline"} 
                    className={`w-full flex justify-between items-center ${stats.pendingProducts > 0 ? 'bg-agrigreen-600' : ''}`}
                    asChild
                  >
                    <Link to="/admin/product-approval">
                      <div className="flex items-center gap-2">
                        <PackageOpen className="h-4 w-4" />
                        <span>Review Product Submissions</span>
                        {stats.pendingProducts > 0 && (
                          <span className="ml-2 bg-white text-agrigreen-600 rounded-full px-2 py-0.5 text-xs font-bold">
                            {stats.pendingProducts}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex justify-between items-center"
                    asChild
                  >
                    <Link to="/admin/manage-users">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Manage Users</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex justify-between items-center"
                    asChild
                  >
                    <Link to="/admin/view-orders">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>View Orders</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex justify-between items-center"
                    asChild
                  >
                    <Link to="/admin/manage-schemes">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        <span>Manage Schemes</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-[220px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-2">Detailed analytics coming soon</p>
                  <Button variant="outline" size="sm">View Reports</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
              <CardDescription>System health and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Processing</p>
                      <p className="text-sm text-gray-500">All systems operational</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Processing</p>
                      <p className="text-sm text-gray-500">All systems operational</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">User Authentication</p>
                      <p className="text-sm text-gray-500">All systems operational</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Analytics Engine</p>
                      <p className="text-sm text-gray-500">Under maintenance</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Partial</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((item, index) => (
                      <div key={index} className="flex gap-3 pb-4 border-b last:border-0">
                        <div className="bg-amber-100 p-2 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                          {item.type === 'product' && <PackageOpen className="h-4 w-4 text-amber-600" />}
                          {item.type === 'order' && <CreditCard className="h-4 w-4 text-purple-600" />}
                          {item.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div>
                          <p className="text-sm">{item.message}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Check className="h-8 w-8 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
