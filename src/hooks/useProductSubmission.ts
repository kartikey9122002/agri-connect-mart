
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
    console.log(`Uploading ${imageFiles.length} images for product ${productId}`);
    const imageUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log(`Uploading image ${i + 1}/${imageFiles.length}: ${filePath}`);

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        console.error(`Error uploading image ${i + 1}/${imageFiles.length}:`, error);
        throw new Error(`Error uploading image ${i + 1}: ${error.message}`);
      }

      console.log(`Successfully uploaded image ${i + 1}/${imageFiles.length}`);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log(`Generated public URL for image ${i + 1}: ${publicUrl}`);
      imageUrls.push(publicUrl);
    }

    console.log(`All ${imageFiles.length} images uploaded successfully`);
    return imageUrls;
  };

  const submitProduct = async (data: {
    name: string;
    description: string;
    price: number;
    category: string;
  }, imageFiles: File[]) => {
    if (!user) {
      console.error("Product submission attempted without user authentication");
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to add products',
        variant: 'destructive',
      });
      return;
    }

    console.log("Starting product submission process", {
      user: user.id,
      productData: data,
      imageCount: imageFiles.length
    });
    
    setIsSubmitting(true);

    try {
      // First create the product record
      console.log("Creating product record in database");
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
        console.error("Failed to create product record:", error);
        throw new Error(`Failed to create product: ${error.message}`);
      }

      console.log("Product record created successfully:", product.id);

      // Now upload the product images
      const imageUrls = await uploadImages(product.id, imageFiles);

      // Update the product record with image URLs
      console.log("Updating product with image URLs");
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: imageUrls })
        .eq('id', product.id);

      if (updateError) {
        console.error("Failed to update product with images:", updateError);
        throw new Error(`Failed to update product with images: ${updateError.message}`);
      }

      console.log("Product submission completed successfully");
      toast({
        title: 'Product submitted',
        description: 'Your product has been submitted for admin approval.',
      });
      
      setTimeout(() => {
        console.log("Redirecting to seller dashboard");
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
