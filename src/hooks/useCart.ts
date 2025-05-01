
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export interface CartItem extends Product {
  quantity: number;
  cartItemId: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching cart items for user:', user.id);
      
      // Fetch cart items joined with product details
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          products (*)
        `)
        .eq('buyer_id', user.id);

      if (cartError) {
        throw cartError;
      }

      if (!cartData) {
        setCartItems([]);
        return;
      }

      // Map the joined data to our CartItem structure
      const mappedCartItems = await Promise.all(cartData.map(async (item) => {
        const product = item.products as any;
        
        // Get seller name from profiles
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', product.seller_id)
          .single();

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          images: product.images || [],
          category: product.category,
          sellerId: product.seller_id,
          sellerName: sellerData?.full_name || 'Unknown Seller',
          status: product.status,
          availability: product.availability || 'available',
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          quantity: item.quantity,
          cartItemId: item.id
        } as CartItem;
      }));

      setCartItems(mappedCartItems);
      console.log('Fetched cart items:', mappedCartItems.length);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch your cart items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be logged in to add items to your cart',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if the item is already in the cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('buyer_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Update quantity if the item is already in cart
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Add new item to cart
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            buyer_id: user.id,
            product_id: product.id,
            quantity
          });

        if (insertError) throw insertError;
      }

      await fetchCartItems();
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Failed to add item',
        description: 'There was an error adding this item to your cart.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!user) return false;

    try {
      // Find the cart item for this product
      const cartItem = cartItems.find(item => item.id === productId);
      if (!cartItem) return false;

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItem.cartItemId);

      if (error) throw error;

      // Update local state immediately for UI responsiveness
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Failed to update',
        description: 'Could not update the item quantity. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      // Find the cart item to get its ID
      const cartItem = cartItems.find(item => item.id === productId);
      if (!cartItem) return;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItem.cartItemId);

      if (error) throw error;

      // Update local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      
      toast({
        title: 'Item removed',
        description: 'The item has been removed from your cart.',
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Failed to remove item',
        description: 'Could not remove the item from your cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('buyer_id', user.id);

      if (error) throw error;
      
      setCartItems([]);
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Failed to clear cart',
        description: 'Could not clear your cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const placeOrder = async (orderItems: OrderItem[], deliveryAddress: string, totalAmount: number) => {
    if (!user || orderItems.length === 0) {
      throw new Error('User is not logged in or cart is empty');
    }

    try {
      // 1. Create new order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          delivery_address: deliveryAddress,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Failed to create order');

      // 2. Add order items
      const orderItemsToInsert = orderItems.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.productName,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Clear the user's cart
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('buyer_id', user.id);

      if (clearCartError) throw clearCartError;

      // 4. Update local cart state
      setCartItems([]);

      return orderData.id;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  };

  return {
    cartItems,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder
  };
};
