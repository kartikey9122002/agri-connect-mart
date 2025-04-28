
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProductSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImages = async (productId: string, imageFiles: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Error uploading image ${i + 1}: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    return imageUrls;
  };

  const submitProduct = async (data: {
    name: string;
    description: string;
    price: number;
    category: string;
  }, imageFiles: File[]) => {
    if (!user) {
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to add products',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          seller_id: user.id,
          status: 'pending',
          images: []
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }

      const imageUrls = await uploadImages(product.id, imageFiles);

      const { error: updateError } = await supabase
        .from('products')
        .update({ images: imageUrls })
        .eq('id', product.id);

      if (updateError) {
        throw new Error(`Failed to update product with images: ${updateError.message}`);
      }

      toast({
        title: 'Product submitted',
        description: 'Your product has been submitted for admin approval.',
      });
      
      setTimeout(() => {
        navigate('/seller-dashboard', { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'There was an error submitting your product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitProduct
  };
};
