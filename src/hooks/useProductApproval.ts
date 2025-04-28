
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types';

export const useProductApproval = () => {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = await Promise.all(
        data.map(async (item) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', item.seller_id)
            .single();
            
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            images: item.images || [],
            category: item.category,
            sellerId: item.seller_id,
            sellerName: profileData?.full_name || 'Unknown Seller',
            status: item.status,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          };
        })
      );

      setPendingProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching pending products:', error);
      toast({
        title: 'Failed to load',
        description: 'There was an error loading pending products.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'approved' })
        .eq('id', productId);

      if (error) throw error;

      setPendingProducts(prev => prev.filter(product => product.id !== productId));
      
      toast({
        title: 'Product approved',
        description: 'The product has been approved and is now live.',
      });
    } catch (error) {
      console.error('Error approving product:', error);
      toast({
        title: 'Approval failed',
        description: 'There was an error approving this product.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'rejected' })
        .eq('id', productId);

      if (error) throw error;

      setPendingProducts(prev => prev.filter(product => product.id !== productId));
      
      toast({
        title: 'Product rejected',
        description: 'The product has been rejected.',
      });
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        title: 'Rejection failed',
        description: 'There was an error rejecting this product.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  return {
    pendingProducts,
    isLoading,
    handleApprove,
    handleReject
  };
};
