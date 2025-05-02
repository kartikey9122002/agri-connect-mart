
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { PackageOpen, Users, FileCheck } from 'lucide-react';

interface ActivityLog {
  id: string;
  type: 'product' | 'user' | 'scheme';
  action: string;
  target_id: string;
  target_name: string;
  actor_id?: string;
  actor_name?: string;
  created_at: string;
}

const RecentActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // In a real application, you'd have an activities table
        // For this demo, we'll generate activities based on products, users, and schemes

        // Get recent products
        const { data: recentProducts, error: productsError } = await supabase
          .from('products')
          .select('id, name, status, updated_at, created_at')
          .order('updated_at', { ascending: false })
          .limit(5);

        if (productsError) throw productsError;

        // Get recent profiles
        const { data: recentUsers, error: usersError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .order('id', { ascending: false })
          .limit(3);

        if (usersError) throw usersError;

        // Get recent schemes
        const { data: recentSchemes, error: schemesError } = await supabase
          .from('schemes')
          .select('id, title, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(3);

        if (schemesError) throw schemesError;

        // Combine and format activities
        let allActivities: ActivityLog[] = [];

        // Product activities
        if (recentProducts) {
          const productActivities = recentProducts.map(product => ({
            id: `product-${product.id}`,
            type: 'product' as const,
            action: product.status === 'approved' ? 'approved' : 
                   product.status === 'rejected' ? 'rejected' : 'submitted',
            target_id: product.id,
            target_name: product.name,
            actor_name: 'Admin', // In a real app, you'd store who approved/rejected
            created_at: product.updated_at
          }));
          allActivities = [...allActivities, ...productActivities];
        }

        // User activities
        if (recentUsers) {
          const userActivities = recentUsers.map(user => ({
            id: `user-${user.id}`,
            type: 'user' as const,
            action: 'registered',
            target_id: user.id,
            target_name: user.full_name || 'New User',
            created_at: new Date().toISOString() // Use current date since created_at isn't available
          }));
          allActivities = [...allActivities, ...userActivities];
        }

        // Scheme activities
        if (recentSchemes) {
          const schemeActivities = recentSchemes.map(scheme => ({
            id: `scheme-${scheme.id}`,
            type: 'scheme' as const,
            action: 'published',
            target_id: scheme.id,
            target_name: scheme.title,
            actor_name: 'Admin',
            created_at: scheme.updated_at
          }));
          allActivities = [...allActivities, ...schemeActivities];
        }

        // Sort by date, most recent first
        allActivities.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setActivities(allActivities.slice(0, 10));
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
    
    // Set up polling interval
    const interval = setInterval(fetchActivities, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <PackageOpen className="h-4 w-4 text-amber-600" />;
      case 'user':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'scheme':
        return <FileCheck className="h-4 w-4 text-indigo-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-200 rounded-full"></div>;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-amber-100';
      case 'user':
        return 'bg-blue-100';
      case 'scheme':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getActivityText = (activity: ActivityLog) => {
    switch (activity.type) {
      case 'product':
        return `Product "${activity.target_name}" was ${activity.action}${activity.actor_name ? ' by ' + activity.actor_name : ''}`;
      case 'user':
        return `New user "${activity.target_name}" registered`;
      case 'scheme':
        return `Scheme "${activity.target_name}" was ${activity.action}${activity.actor_name ? ' by ' + activity.actor_name : ''}`;
      default:
        return `Unknown activity`;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agrigreen-600"></div>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
                    <div className={`p-2 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${getActivityBgColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm">{getActivityText(activity)}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <PackageOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityLog;
