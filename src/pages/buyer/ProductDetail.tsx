import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // Fetch seller name separately to avoid join issues
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.seller_id)
          .single();

        const productWithDetails = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: data.price,
          images: data.images || [],
          category: data.category,
          sellerId: data.seller_id,
          sellerName: profileData?.full_name || 'Unknown Seller',
          status: data.status,
          availability: data.availability || 'available',
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        setProduct(productWithDetails);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Failed to load product',
          description: 'There was an error loading the product. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  if (isLoading) {
    return <div className="text-center py-12">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-auto rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-agrigreen-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-agrigreen-700 font-bold text-xl">₹{product.price.toFixed(2)}</span>
            <span className="text-gray-500">Category: {product.category}</span>
          </div>
          <div className="mb-4">
            <span className="text-gray-700 font-medium">Seller:</span>
            <span className="text-agrigreen-600 ml-1">{product.sellerName}</span>
          </div>
          <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
