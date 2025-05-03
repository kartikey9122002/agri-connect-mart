import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProductsListProps {
  sellerId: string;
}

const ProductsList: React.FC<ProductsListProps> = ({ sellerId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerId);

        if (error) throw error;

        setProducts(data as Product[]);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Failed to load products',
          description: 'Could not load products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [sellerId, toast]);

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        setProducts(products.filter(product => product.id !== productId));
        toast({
          title: 'Product deleted',
          description: 'Product has been successfully deleted.',
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: 'Deletion failed',
          description: 'Could not delete product. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleAvailability = async (productId: string, currentAvailability: string) => {
    try {
      const newAvailability = currentAvailability === 'available' ? 'unavailable' : 'available';
      
      // Call the RPC function to update product availability
      const { error } = await supabase.rpc('update_product_availability', {
        product_id: productId,
        new_availability: newAvailability
      });

      if (error) throw error;
      
      // Update the local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, availability: newAvailability as 'available' | 'unavailable' } 
          : product
      ));

      toast({
        title: 'Product updated',
        description: `Product availability changed to ${newAvailability}`,
      });
    } catch (error) {
      console.error('Error updating product availability:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update product availability',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-4">No products listed yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
            <CardDescription className="text-gray-500">Category: {product.category}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="aspect-w-4 aspect-h-3 mb-3">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover rounded-md w-full h-full"
                />
              ) : (
                <div className="bg-gray-100 rounded-md flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <p className="text-gray-700 mb-2">₹{product.price.toFixed(2)}</p>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Link to={`/products/${product.id}`}>
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleToggleAvailability(product.id, product.availability)}
              >
                {product.availability === 'available' ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Available
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Unavailable
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductsList;
