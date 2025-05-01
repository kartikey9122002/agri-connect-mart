
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Calculate cart total whenever cart items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setCartTotal(total);
  }, [cartItems]);

  // Fetch cart items from database
  const fetchCartItems = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching cart items...');
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('buyer_id', user.id);

      if (cartError) throw cartError;
      
      // If cart is empty, reset state and return early
      if (!cartData || cartData.length === 0) {
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      // Fetch product details for each cart item
      const cartItemsWithProducts = await Promise.all(
        cartData.map(async (item) => {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.product_id)
            .single();

          if (productError) {
            console.error('Error fetching product:', productError);
            return null;
          }

          // Get seller name 
          const { data: sellerData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', productData.seller_id)
            .single();

          const product: Product = {
            id: productData.id,
            name: productData.name,
            description: productData.description || '',
            price: productData.price,
            images: productData.images || [],
            category: productData.category,
            sellerId: productData.seller_id,
            sellerName: sellerData?.full_name || 'Unknown Seller',
            status: productData.status,
            availability: (productData as any).availability || 'available',
            createdAt: productData.created_at,
            updatedAt: productData.updated_at
          };

          return {
            id: item.id,
            product,
            quantity: item.quantity
          };
        })
      );

      // Filter out any null items from failed product fetches
      const validCartItems = cartItemsWithProducts.filter(item => item !== null) as CartItem[];
      setCartItems(validCartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: 'Failed to load cart',
        description: 'There was an error loading your cart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to add items to your cart.',
      });
      return false;
    }

    if (product.availability !== 'available') {
      toast({
        title: 'Product unavailable',
        description: 'This product is currently not available for purchase.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if product already exists in cart
      const existingItem = cartItems.find(item => item.product.id === product.id);

      if (existingItem) {
        // Update quantity if already in cart
        return await updateCartItemQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item to cart
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            buyer_id: user.id,
            product_id: product.id,
            quantity
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding to cart:', error);
          
          // Handle unique constraint violation gracefully
          if (error.code === '23505') { // PostgreSQL unique constraint violation
            toast({
              title: 'Item already in cart',
              description: 'This item is already in your cart. You can update the quantity from the cart page.',
            });
            return true;
          }
          
          throw error;
        }

        toast({
          title: 'Added to cart',
          description: `${product.name} has been added to your cart.`,
        });

        // Refresh cart to get updated data
        await fetchCartItems();
        return true;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Failed to add to cart',
        description: 'There was an error adding this item to your cart. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!user) return false;

    try {
      if (newQuantity <= 0) {
        return await removeFromCart(itemId);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
        .eq('buyer_id', user.id);

      if (error) throw error;

      toast({
        title: 'Cart updated',
        description: 'The quantity has been updated.',
      });

      // Refresh cart to get updated data
      await fetchCartItems();
      return true;
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: 'Failed to update cart',
        description: 'There was an error updating your cart. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('buyer_id', user.id);

      if (error) throw error;

      toast({
        title: 'Item removed',
        description: 'The item has been removed from your cart.',
      });

      // Update local state
      setCartItems(cartItems.filter(item => item.id !== itemId));
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Failed to remove item',
        description: 'There was an error removing this item from your cart. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('buyer_id', user.id);

      if (error) throw error;

      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      });

      // Update local state
      setCartItems([]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Failed to clear cart',
        description: 'There was an error clearing your cart. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Place order with delivery address
  const placeOrder = async (deliveryAddress: string) => {
    if (!user) return false;
    if (cartItems.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty. Add items before placing an order.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Calculate total amount
      const totalAmount = cartTotal;

      // Create order record
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

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      await clearCart();

      toast({
        title: 'Order placed successfully!',
        description: `Your order #${orderData.id.substring(0, 8)} has been placed and will be processed shortly.`,
      });

      return {
        success: true,
        orderId: orderData.id
      };
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Failed to place order',
        description: 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
      return {
        success: false,
        error
      };
    }
  };

  return {
    cartItems,
    isLoading,
    cartTotal,
    fetchCartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    placeOrder
  };
};
