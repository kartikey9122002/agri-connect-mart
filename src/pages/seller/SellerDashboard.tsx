
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductsList from '@/components/seller/ProductsList';
import DashboardSummary from '@/components/seller/DashboardSummary';
import PricePredictionCard from '@/components/seller/PricePredictionCard';
import WeatherWidget from '@/components/seller/WeatherWidget';
import SellerSchemesList from '@/components/products/SellerSchemesList';
import ProductReceiptModal from '@/components/products/ProductReceiptModal';
import BuyerInteractionsModal from '@/components/products/BuyerInteractionsModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useProductManagement } from '@/hooks/useProductManagement';
import { Product, BuyerInteraction } from '@/types';
import { Plus } from 'lucide-react';

const SellerDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [interactionsModalOpen, setInteractionsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [productInteractions, setProductInteractions] = useState<BuyerInteraction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const { deleteProduct, updateProductAvailability } = useProductManagement();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform database products to match Product type
        const formattedProducts = (data || []).map((product: any, index: number) => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          images: product.images || [],
          category: product.category,
          sellerId: product.seller_id,
          sellerName: user.name || 'Seller',
          status: product.status,
          availability: product.availability || 'available',
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          rowNumber: index + 1
        }));

        setProducts(formattedProducts);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch products: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchProducts();
    }
  }, [user, isAuthenticated, toast]);

  const handleDeleteProduct = async (productId: string) => {
    const success = await deleteProduct(productId);
    if (success) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const handleToggleAvailability = async (productId: string, currentAvailability: 'available' | 'unavailable') => {
    const success = await updateProductAvailability(productId, currentAvailability);
    if (success) {
      setProducts(products.map(product =>
        product.id === productId ? { ...product, availability: currentAvailability === 'available' ? 'unavailable' : 'available' } : product
      ));
    }
  };

  const handleViewReceipt = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setReceiptModalOpen(true);
  };

  const handleViewBuyerInteractions = async (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setLoadingInteractions(true);
    setInteractionsModalOpen(true);

    try {
      // This is a simple mock of buyer interactions
      const mockInteractions: BuyerInteraction[] = [
        {
          id: '1',
          buyerId: 'buyer-1',
          buyerName: 'John Doe',
          productId: productId,
          type: 'inquiry',
          content: 'Is this product still available?',
          createdAt: new Date().toISOString()
        }
      ];
      
      setProductInteractions(mockInteractions);
    } catch (error: any) {
      console.error('Error fetching buyer interactions:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch buyer interactions: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoadingInteractions(false);
    }
  };

  if (authLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-agrigreen-900">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your products and orders</p>
        </div>
        <Link to="/seller/add-product">
          <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DashboardSummary products={products} />
        </div>
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductsList
            products={products}
            isLoading={isLoading}
            onDeleteProduct={handleDeleteProduct}
            onToggleAvailability={handleToggleAvailability}
            onViewInteractions={handleViewBuyerInteractions}
            onViewReceipt={handleViewReceipt}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <PricePredictionCard />
          <SellerSchemesList />
        </div>
      </div>

      {/* Modals */}
      <ProductReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        productId={selectedProductId}
        productName={selectedProductName}
      />
      
      <BuyerInteractionsModal
        isOpen={interactionsModalOpen}
        onClose={() => setInteractionsModalOpen(false)}
        productId={selectedProductId}
        productName={selectedProductName}
        interactions={productInteractions}
        isLoading={loadingInteractions}
      />
    </div>
  );
};

export default SellerDashboard;
