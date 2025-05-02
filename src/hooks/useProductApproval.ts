
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
    console.log("Fetching pending products for admin approval");
    
    try {
      // Using a proper join by first fetching products and then getting seller information separately
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error("Error fetching pending products:", productsError);
        throw productsError;
      }

      console.log(`Found ${productsData?.length || 0} pending products`);

      // Now fetch profiles for these products
      const formattedProducts: Product[] = await Promise.all(
        productsData.map(async (item) => {
          // Get seller profile information
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', item.seller_id)
            .single();

          if (profileError) {
            console.warn(`Could not fetch profile for seller ${item.seller_id}:`, profileError);
          }

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
            availability: item.availability || 'available',
            createdAt: item.created_at,
            updatedAt: item.updated_at
          };
        })
      );

      setPendingProducts(formattedProducts);
      console.log("Successfully processed pending products for admin review");
    } catch (error) {
      console.error('Error in useProductApproval hook:', error);
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
    console.log(`Attempting to approve product: ${productId}`);
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'approved' })
        .eq('id', productId);

      if (error) {
        console.error(`Error approving product ${productId}:`, error);
        throw error;
      }

      console.log(`Successfully approved product: ${productId}`);
      setPendingProducts(prev => prev.filter(product => product.id !== productId));
      
      toast({
        title: 'Product approved',
        description: 'The product has been approved and is now live.',
      });
    } catch (error) {
      console.error('Error in handleApprove function:', error);
      toast({
        title: 'Approval failed',
        description: 'There was an error approving this product.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (productId: string) => {
    console.log(`Attempting to reject product: ${productId}`);
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'rejected' })
        .eq('id', productId);

      if (error) {
        console.error(`Error rejecting product ${productId}:`, error);
        throw error;
      }

      console.log(`Successfully rejected product: ${productId}`);
      setPendingProducts(prev => prev.filter(product => product.id !== productId));
      
      toast({
        title: 'Product rejected',
        description: 'The product has been rejected.',
      });
    } catch (error) {
      console.error('Error in handleReject function:', error);
      toast({
        title: 'Rejection failed',
        description: 'There was an error rejecting this product.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchPendingProducts();
    console.log("Setting up realtime subscription for product updates");

    // Set up real-time subscription for product status changes
    const channel = supabase
      .channel('product-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: 'status=pending'
        },
        (payload) => {
          console.log('Received real-time product update:', payload);
          // Refresh the products list when updates occur
          fetchPendingProducts();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up product updates subscription");
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pendingProducts,
    isLoading,
    handleApprove,
    handleReject
  };
};
