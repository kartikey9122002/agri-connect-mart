import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
import BuyerInteractionsModal from '@/components/products/BuyerInteractionsModal';
import ProductReceiptModal from '@/components/products/ProductReceiptModal';
import { useProductManagement } from '@/hooks/useProductManagement';
import { useSellerProductDetails } from '@/hooks/useSellerProductDetails';

// Import the new components
import DashboardSummary from '@/components/seller/DashboardSummary';
import PricePredictionCard from '@/components/seller/PricePredictionCard';
import ProductsList from '@/components/seller/ProductsList';
import SellerSchemesList from '@/components/products/SellerSchemesList';

const SellerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [showInteractionsModal, setShowInteractionsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { deleteProduct, updateProductAvailability } = useProductManagement();
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
    
    if (!buyerInteractions[productId]) {
      await fetchBuyerInteractions(productId);
    }
    
    setShowInteractionsModal(true);
  };

  const handleViewReceipt = async (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    
    if (!productReceipts[productId]) {
      await fetchProductReceipts(productId);
    }
    
    setShowReceiptModal(true);
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
        {/* Dashboard Summary Column */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardSummary products={products} />
          <PricePredictionCard products={products} />
          <SellerSchemesList 
            schemes={schemes}
            isLoading={isLoadingSchemes}
          />
        </div>

        {/* Products List Column */}
        <div className="lg:col-span-3">
          <ProductsList 
            products={products}
            isLoading={isLoading}
            onDeleteProduct={handleDeleteProduct}
            onToggleAvailability={handleToggleAvailability}
            onViewInteractions={handleViewInteractions}
            onViewReceipt={handleViewReceipt}
          />
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
