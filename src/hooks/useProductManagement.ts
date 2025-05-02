
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const useProductManagement = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const deleteProduct = async (productId: string) => {
    setIsUpdating(true);
    try {
      console.log(`Deleting product ${productId}`);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Product deleted',
        description: 'The product has been removed successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the product. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProductAvailability = async (productId: string, currentAvailability: string) => {
    setIsUpdating(true);
    try {
      // Toggle the availability to the opposite value
      const newAvailability = currentAvailability === 'available' ? 'unavailable' : 'available';
      
      console.log(`Updating product ${productId} availability to ${newAvailability}`);
      
      // Use a raw SQL update to handle the availability field
      const { error } = await supabase
        .rpc('update_product_availability', {
          product_id: productId,
          new_availability: newAvailability
        });

      if (error) {
        console.error('Error updating product availability:', error);
        toast({
          title: 'Failed to update availability',
          description: 'There was an error updating the product availability. Please try again.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Product updated',
        description: `Product is now ${newAvailability}.`,
      });
      return true;
    } catch (error) {
      console.error('Error in updateProductAvailability:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    deleteProduct,
    updateProductAvailability
  };
};
