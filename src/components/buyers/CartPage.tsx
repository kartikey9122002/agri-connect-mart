
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartItem, useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, Trash, Plus, Minus, ArrowLeft, ShoppingBag, AlertCircle, Truck
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { 
    cartItems, 
    isLoading, 
    cartTotal, 
    fetchCartItems, 
    updateCartItemQuantity, 
    removeFromCart,
    placeOrder
  } = useCart();
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleQuantityChange = (item: CartItem, incrementBy: number) => {
    const newQuantity = Math.max(1, item.quantity + incrementBy);
    updateCartItemQuantity(item.id, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: 'Address required',
        description: 'Please enter your delivery address.',
        variant: 'destructive',
      });
      return;
    }

    const result = await placeOrder(deliveryAddress);
    if (result.success) {
      setConfirmDialogOpen(false);
      navigate('/buyer-dashboard');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h2 className="text-2xl font-bold">Please Log In</h2>
              <p className="text-gray-500 mb-4">You need to be logged in to view your cart.</p>
              <Link to="/login">
                <Button>Log In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 h-24 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/products" className="text-agrigreen-600 hover:text-agrigreen-800 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Shopping
        </Link>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-agrigreen-600" /> Your Cart
          </h1>
          
          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <ShoppingBag className="h-16 w-16 text-gray-400" />
                  <h2 className="text-xl font-medium">Your cart is empty</h2>
                  <p className="text-gray-500 mb-4">Looks like you haven't added any items yet.</p>
                  <Link to="/products">
                    <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                            <Link to={`/products/${item.product.id}`} className="text-lg font-medium hover:text-agrigreen-600">
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-gray-600">{item.product.category}</p>
                          </div>
                          <div className="text-agrigreen-700 font-bold">
                            ₹{item.product.price.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                          <div className="flex items-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-2"
                              onClick={() => handleQuantityChange(item, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-2"
                              onClick={() => handleQuantityChange(item, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                            <div className="text-gray-600 text-sm">
                              Subtotal: <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {cartTotal >= 200 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>₹40.00</span>
                  )}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{(cartTotal >= 200 ? cartTotal : cartTotal + 40).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {cartTotal >= 200 && (
                <div className="mt-4 bg-green-50 p-2 rounded-md flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Free delivery on orders over ₹200!</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-agrigreen-600 hover:bg-agrigreen-700" 
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Your Order</DialogTitle>
                    <DialogDescription>
                      Please provide your delivery address to complete the order.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium">
                        Delivery Address
                      </label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium mb-2">Order Summary</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Items ({cartItems.length})</span>
                          <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery</span>
                          {cartTotal >= 200 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            <span>₹40.00</span>
                          )}
                        </div>
                        <div className="border-t pt-1 mt-1 font-bold">
                          <div className="flex justify-between">
                            <span>Total</span>
                            <span>₹{(cartTotal >= 200 ? cartTotal : cartTotal + 40).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-agrigreen-600 hover:bg-agrigreen-700"
                      onClick={handleCheckout}
                    >
                      Place Order
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Link to="/products" className="w-full">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
              
              <div className="flex items-center justify-center text-sm text-gray-500 gap-1 mt-2">
                <Badge variant="outline" className="bg-gray-50">Secure Payment</Badge>
                <Badge variant="outline" className="bg-gray-50">24/7 Support</Badge>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
