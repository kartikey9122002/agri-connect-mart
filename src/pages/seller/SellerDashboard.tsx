
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
import ProductActionMenu from '@/components/products/ProductActionMenu';
import BuyerInteractionsModal from '@/components/products/BuyerInteractionsModal';
import ProductReceiptModal from '@/components/products/ProductReceiptModal';
import SellerSchemesList from '@/components/products/SellerSchemesList';
import { useProductManagement } from '@/hooks/useProductManagement';
import { useSellerProductDetails } from '@/hooks/useSellerProductDetails';

const SellerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [showInteractionsModal, setShowInteractionsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { isUpdating, deleteProduct, updateProductAvailability } = useProductManagement();
  const { 
    buyerInteractions,
    productReceipts,
    schemes,
    isLoadingInteractions,
    isLoadingReceipts,
    isLoadingSchemes,
    fetchBuyerInteractions,
    fetchProductReceipts
  } = useSellerProductDetails(user?.id);

  useEffect(() => {
    if (!user) {
      console.log("SellerDashboard: No user found, skipping product fetch");
      return;
    }
    
    const fetchSellerProducts = async () => {
      setIsLoading(true);
      console.log(`SellerDashboard: Fetching products for seller ${user.id}`);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id);

        if (error) {
          console.error("Error fetching seller products:", error);
          throw error;
        }

        console.log(`SellerDashboard: Found ${data?.length || 0} products for seller ${user.id}`);

        // Process the data to match our Product type
        const formattedProducts = await Promise.all(
          data.map(async (item) => {
            // Get seller name from profile
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

        setProducts(formattedProducts);
        console.log("SellerDashboard: Successfully processed seller products");
      } catch (error) {
        console.error('Error in SellerDashboard:', error);
        toast({
          title: 'Failed to load products',
          description: 'There was an error loading your products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerProducts();
    
    // Set up real-time subscription for product status changes
    console.log("Setting up realtime subscription for seller's product updates");
    const channel = supabase
      .channel('seller-product-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `seller_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Received real-time seller product update:', payload);
          // Refresh the products list when updates occur
          fetchSellerProducts();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up seller product updates subscription");
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const handleDeleteProduct = async (productId: string) => {
    const success = await deleteProduct(productId);
    if (success) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleToggleAvailability = async (productId: string, currentAvailability: 'available' | 'unavailable') => {
    const newAvailability = currentAvailability === 'available' ? 'unavailable' : 'available';
    const success = await updateProductAvailability(productId, newAvailability);
    
    if (success) {
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, availability: newAvailability } 
          : p
      ));
    }
  };

  const handleViewInteractions = async (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    
    // Fetch interactions if not already loaded
    if (!buyerInteractions[productId]) {
      await fetchBuyerInteractions(productId);
    }
    
    setShowInteractionsModal(true);
  };

  const handleViewReceipt = async (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    
    // Fetch receipts if not already loaded
    if (!productReceipts[productId]) {
      await fetchProductReceipts(productId);
    }
    
    setShowReceiptModal(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityBadgeClass = (availability: string) => {
    return availability === 'available' 
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-agrigreen-900">Seller Dashboard</h1>
        <Link to="/seller/add-product">
          <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Dashboard Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dashboard Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Live Products</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'approved' && p.availability === 'available').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Approval</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Price Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Market trends predict price changes for your products
              </p>
              <div className="space-y-3">
                {products.slice(0, 3).map(product => (
                  <div key={`price-${product.id}`} className="flex justify-between items-center p-2 border-b border-gray-100">
                    <span className="text-sm font-medium truncate max-w-[150px]">{product.name}</span>
                    <div className="flex items-center">
                      <span className="text-sm font-bold mr-1">₹{product.price}</span>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        +5%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <SellerSchemesList 
            schemes={schemes}
            isLoading={isLoadingSchemes}
          />
        </div>

        {/* Products List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Products</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center border-b border-gray-100 pb-4">
                      <div className="w-16 h-16 mr-4 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Failed to load image for product ${product.id}`);
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{product.name}</h3>
                          <span className="text-sm text-gray-600">₹{product.price}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(product.status)}`}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getAvailabilityBadgeClass(product.availability || 'available')}`}>
                            {product.availability || 'Available'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Added on {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <ProductActionMenu
                          productId={product.id}
                          productName={product.name}
                          isAvailable={product.availability === 'available'}
                          onDelete={() => handleDeleteProduct(product.id)}
                          onToggleAvailability={() => handleToggleAvailability(product.id, product.availability || 'available')}
                          onViewInteractions={() => handleViewInteractions(product.id, product.name)}
                          onViewReceipt={() => handleViewReceipt(product.id, product.name)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't added any products yet</p>
                  <Link to="/seller/add-product" className="mt-2 inline-block text-agrigreen-600 hover:text-agrigreen-700">
                    Add your first product
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modals */}
      {selectedProductId && (
        <>
          <BuyerInteractionsModal
            isOpen={showInteractionsModal}
            onClose={() => setShowInteractionsModal(false)}
            productName={selectedProductName}
            interactions={buyerInteractions[selectedProductId] || []}
            isLoading={isLoadingInteractions}
          />
          
          <ProductReceiptModal
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            productName={selectedProductName}
            receipts={productReceipts[selectedProductId] || []}
            isLoading={isLoadingReceipts}
          />
        </>
      )}
    </div>
  );
};

export default SellerDashboard;
