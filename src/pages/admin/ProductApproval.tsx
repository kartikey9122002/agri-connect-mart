
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Eye } from 'lucide-react';
import { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const ProductApproval = () => {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Fetch pending products
  const fetchPendingProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles:seller_id(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Product[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        images: item.images || [],
        category: item.category,
        sellerId: item.seller_id,
        sellerName: item.profiles?.full_name || 'Unknown Seller',
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

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

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  // Handle product approval
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

  // Handle product rejection
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-agrigreen-900">Product Approval Queue</h1>
        <p className="text-gray-600">Review and approve/reject product submissions from sellers</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      ) : pendingProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <Check className="mx-auto h-12 w-12 text-green-500 mb-3" />
          <h3 className="text-xl font-medium">All caught up!</h3>
          <p className="text-gray-500 mt-2">No pending products to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProducts.map(product => (
            <Card key={product.id} className="overflow-hidden border-l-4 border-l-amber-400">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-24 h-24 bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-sm bg-agrigreen-100 text-agrigreen-800 px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                          <span className="text-sm text-gray-600">
                            ₹{product.price}
                          </span>
                          <span className="text-xs text-gray-500">
                            By {product.sellerName}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                          onClick={() => handleApprove(product.id)}
                        >
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleReject(product.id)}
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Submitted {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product detail dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Product details for review
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Product images */}
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Product Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedProduct.images.map((image, index) => (
                        <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                          <img 
                            src={image} 
                            alt={`${selectedProduct.name} - Image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-100 rounded-md">
                    <p className="text-gray-500">No product images</p>
                  </div>
                )}

                {/* Product details */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-medium">₹{selectedProduct.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Seller</p>
                      <p className="font-medium">{selectedProduct.sellerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Submission Date</p>
                      <p className="font-medium">{new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Product description */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                    <p>{selectedProduct.description}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                    onClick={() => {
                      handleApprove(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductApproval;
