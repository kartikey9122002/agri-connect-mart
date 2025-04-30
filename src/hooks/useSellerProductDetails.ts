
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BuyerInteraction, ProductReceipt, GovScheme } from '@/types';

export const useSellerProductDetails = (sellerId: string | undefined) => {
  const [buyerInteractions, setBuyerInteractions] = useState<Record<string, BuyerInteraction[]>>({});
  const [productReceipts, setProductReceipts] = useState<Record<string, ProductReceipt[]>>({});
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const { toast } = useToast();

  // This is a mock function since buyer interactions would require custom DB table
  const fetchBuyerInteractions = async (productId: string) => {
    setIsLoadingInteractions(true);
    
    try {
      // In a real implementation, we would fetch from a buyer_interactions table
      // For now, return mock data
      console.log(`Fetching buyer interactions for product ${productId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockInteractions: BuyerInteraction[] = [
        {
          id: '1',
          buyerId: 'buyer123',
          buyerName: 'Rahul Sharma',
          productId,
          type: 'inquiry',
          content: 'Is this product available for delivery to Mumbai?',
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: '2',
          buyerId: 'buyer456',
          buyerName: 'Priya Singh',
          productId,
          type: 'review',
          content: 'Excellent quality product! Highly recommended for other farmers.',
          createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
      
      setBuyerInteractions(prev => ({
        ...prev,
        [productId]: mockInteractions
      }));
      
      return mockInteractions;
    } catch (error) {
      console.error('Error fetching buyer interactions:', error);
      toast({
        title: 'Failed to load interactions',
        description: 'Could not load buyer interactions for this product.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoadingInteractions(false);
    }
  };

  // This is a mock function since we don't have an order_items / receipts table setup
  const fetchProductReceipts = async (productId: string) => {
    setIsLoadingReceipts(true);
    
    try {
      // In a real implementation, we would join orders and order_items tables
      console.log(`Fetching receipts for product ${productId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockReceipts: ProductReceipt[] = [
        {
          id: '1',
          productId,
          productName: 'Product Name',
          orderId: 'order123',
          quantity: 5,
          totalPrice: 750,
          buyerId: 'buyer123',
          buyerName: 'Rahul Sharma',
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: '2',
          productId,
          productName: 'Product Name',
          orderId: 'order456',
          quantity: 3,
          totalPrice: 450,
          buyerId: 'buyer456',
          buyerName: 'Priya Singh',
          createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
        }
      ];
      
      setProductReceipts(prev => ({
        ...prev,
        [productId]: mockReceipts
      }));
      
      return mockReceipts;
    } catch (error) {
      console.error('Error fetching product receipts:', error);
      toast({
        title: 'Failed to load receipts',
        description: 'Could not load sales receipts for this product.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  const fetchSchemes = async () => {
    if (!sellerId) return;
    
    setIsLoadingSchemes(true);
    try {
      console.log('Fetching schemes for seller');
      
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .limit(5);
        
      if (error) throw error;
      
      const formattedSchemes: GovScheme[] = data.map(scheme => ({
        id: scheme.id,
        title: scheme.title,
        description: scheme.description,
        eligibility: scheme.eligibility,
        benefits: scheme.benefits,
        applicationUrl: scheme.application_url,
        category: scheme.category,
        createdAt: scheme.created_at,
        updatedAt: scheme.updated_at
      }));
      
      setSchemes(formattedSchemes);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast({
        title: 'Failed to load schemes',
        description: 'Could not load government schemes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSchemes(false);
    }
  };
  
  useEffect(() => {
    if (sellerId) {
      fetchSchemes();
    }
  }, [sellerId]);

  return {
    buyerInteractions,
    productReceipts,
    schemes,
    isLoadingInteractions,
    isLoadingReceipts,
    isLoadingSchemes,
    fetchBuyerInteractions,
    fetchProductReceipts,
  };
};
