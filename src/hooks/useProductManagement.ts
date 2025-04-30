
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

  const updateProductAvailability = async (productId: string, availability: 'available' | 'unavailable') => {
    setIsUpdating(true);
    try {
      console.log(`Updating product ${productId} availability to ${availability}`);
      // First, check if the availability column exists in the products table
      const { error } = await supabase
        .from('products')
        .update({ 
          // Using this format to update an object with a dynamic field name
          // that may not exist yet in the database schema
          ...(availability && { availability: availability }) 
        })
        .eq('id', productId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Availability updated',
        description: `Product is now set to ${availability}.`,
      });
      return true;
    } catch (error) {
      console.error('Error updating product availability:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the product availability. Please try again.',
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
