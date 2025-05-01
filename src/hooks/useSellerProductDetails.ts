
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

  const fetchBuyerInteractions = async (productId: string) => {
    setIsLoadingInteractions(true);
    
    try {
      console.log(`Fetching buyer interactions for product ${productId}`);
      
      // Get all chat threads for this product
      const { data: threadsData, error: threadsError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('product_id', productId)
        .eq('seller_id', sellerId);
        
      if (threadsError) throw threadsError;
      
      let interactions: BuyerInteraction[] = [];
      
      if (threadsData && threadsData.length > 0) {
        // For each thread, get the first message as an interaction summary
        const interactionPromises = threadsData.map(async (thread) => {
          // Get first message in thread
          const { data: messageData, error: messageError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();
            
          if (messageError && messageError.code !== 'PGRST116') {
            console.error('Error fetching message:', messageError);
            return null;
          }
          
          if (!messageData) return null;
          
          // Get buyer name
          const { data: buyerData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', thread.buyer_id)
            .single();
            
          return {
            id: messageData.id,
            buyerId: thread.buyer_id,
            buyerName: buyerData?.full_name || 'Unknown Buyer',
            productId: thread.product_id || '',
            type: 'message',
            content: messageData.content,
            createdAt: messageData.created_at
          } as BuyerInteraction;
        });
        
        const interactionResults = await Promise.all(interactionPromises);
        interactions = interactionResults.filter(Boolean) as BuyerInteraction[];
      }
      
      setBuyerInteractions(prev => ({
        ...prev,
        [productId]: interactions
      }));
      
      return interactions;
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

  const fetchProductReceipts = async (productId: string) => {
    setIsLoadingReceipts(true);
    
    try {
      console.log(`Fetching receipts for product ${productId}`);
      
      // First get the order_items that contain this product
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('product_id', productId);
        
      if (orderItemsError) throw orderItemsError;
      
      if (!orderItemsData || orderItemsData.length === 0) {
        setProductReceipts(prev => ({
          ...prev,
          [productId]: []
        }));
        return [];
      }
      
      // Get the full order details for each order item
      const receiptPromises = orderItemsData.map(async (item) => {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', item.order_id)
          .single();
          
        if (orderError) {
          console.error('Error fetching order:', orderError);
          return null;
        }
        
        // Get buyer name
        const { data: buyerData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', orderData.buyer_id)
          .single();
          
        return {
          id: item.id,
          productId: item.product_id || '',
          productName: item.product_name,
          orderId: item.order_id,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          buyerId: orderData.buyer_id,
          buyerName: buyerData?.full_name || 'Unknown Buyer',
          createdAt: orderData.created_at,
          deliveryAddress: orderData.delivery_address
        } as ProductReceipt;
      });
      
      const receiptResults = await Promise.all(receiptPromises);
      const receipts = receiptResults.filter(Boolean) as ProductReceipt[];
      
      setProductReceipts(prev => ({
        ...prev,
        [productId]: receipts
      }));
      
      return receipts;
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
