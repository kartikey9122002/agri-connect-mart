import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, PricePrediction } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Phone, MessageCircle, TrendingUp, Gift, Truck, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import VoiceCommandButton from '@/components/buyer/VoiceCommandButton';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [pricePrediction, setPricePrediction] = useState<PricePrediction | null>(null);
  const [sellerSchemes, setSellerSchemes] = useState<{ title: string; description: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // Fetch seller name separately to avoid join issues
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.seller_id)
          .single();

        const productWithDetails = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: data.price,
          images: data.images || [],
          category: data.category,
          sellerId: data.seller_id,
          sellerName: profileData?.full_name || 'Unknown Seller',
          status: data.status,
          availability: (data as any).availability || 'available',
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        setProduct(productWithDetails);

        // Generate mock price prediction data
        if (productWithDetails) {
          generateMockPricePrediction(productWithDetails);
          generateMockSchemes();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Failed to load product',
          description: 'There was an error loading the product. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const generateMockPricePrediction = (product: Product) => {
    const today = new Date();
    const predictedPrices = [];
    const currentPrice = product.price;

    for (let i = 0; i < 6; i++) {
      const forecastDate = new Date();
      forecastDate.setMonth(today.getMonth() + i);
      const fluctuation = (Math.random() * 0.4) - 0.2; // Random fluctuation between -20% and +20%
      const predictedPrice = currentPrice * (1 + fluctuation);
      
      predictedPrices.push({
        date: forecastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        price: Number(predictedPrice.toFixed(2))
      });
    }

    setPricePrediction({
      productId: product.id,
      productName: product.name,
      currentPrice: product.price,
      predictedPrices
    });
  };

  const generateMockSchemes = () => {
    setSellerSchemes([
      {
        title: 'Kisan Credit Scheme',
        description: 'Easy loans for farmers to purchase agricultural inputs and equipment.'
      },
      {
        title: 'Pradhan Mantri Fasal Bima Yojana',
        description: 'Crop insurance scheme for farmers to protect against yield losses.'
      },
      {
        title: 'E-NAM Integration',
        description: 'Connect to the National Agriculture Market for better price discovery.'
      }
    ]);
  };

  const handleAddToCart = () => {
    toast({
      title: 'Added to cart',
      description: `${product?.name} has been added to your cart.`,
    });
  };

  const handleChatWithSeller = () => {
    toast({
      title: 'Chat feature coming soon',
      description: 'Our real-time chat feature will be available soon!',
    });
  };

  const handleVoiceCommand = (command: string) => {
    if (command.toLowerCase().includes('add to cart') && product) {
      handleAddToCart();
    } else if (command.toLowerCase().includes('chat') && product) {
      handleChatWithSeller();
    } else {
      toast({
        title: 'Command not recognized',
        description: 'Please try again with a valid command.',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  const isFirstTimeOffer = true;
  const qualifiesForFreeDelivery = product.price > 200;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/products" className="text-agrigreen-600 hover:text-agrigreen-800 flex items-center gap-2">
          &larr; Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          {product.images.length > 0 ? (
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
              <span className="text-gray-500">No image available</span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mt-4">
            {product.images.slice(1, 5).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-24 object-cover rounded-md cursor-pointer"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-agrigreen-900 mb-2">{product.name}</h1>
            <VoiceCommandButton onCommandDetected={handleVoiceCommand} />
          </div>
          
          <div className="flex items-center mb-4">
            <span className="text-agrigreen-700 font-bold text-2xl">₹{product.price.toFixed(2)}</span>
            <Badge className="ml-3 bg-agrigreen-100 text-agrigreen-800">
              {product.category}
            </Badge>
            {product.availability === 'available' ? (
              <Badge className="ml-2 bg-green-100 text-green-800">In Stock</Badge>
            ) : (
              <Badge className="ml-2 bg-red-100 text-red-800">Out of Stock</Badge>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
          
          <div className="flex flex-col mb-6">
            <div className="flex items-center mb-2">
              <Info size={16} className="mr-2 text-gray-500" />
              <span className="text-gray-700 font-medium">Seller:</span>
              <span className="text-agrigreen-600 ml-2">{product.sellerName}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {qualifiesForFreeDelivery && (
                <Badge variant="outline" className="bg-blue-50 flex items-center gap-1">
                  <Truck size={14} /> Free Delivery
                </Badge>
              )}
              
              {isFirstTimeOffer && (
                <Badge variant="outline" className="bg-amber-50 flex items-center gap-1">
                  <Gift size={14} /> First Order Discount Available
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              className="bg-agrigreen-600 hover:bg-agrigreen-700 flex-1"
              onClick={handleAddToCart}
              disabled={product.availability !== 'available'}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            
            <Button 
              variant="outline" 
              className="border-agrigreen-600 text-agrigreen-600 hover:bg-agrigreen-50"
              onClick={handleChatWithSeller}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat with Seller
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="prediction" className="mt-12">
        <TabsList className="mb-4">
          <TabsTrigger value="prediction">Price Prediction</TabsTrigger>
          <TabsTrigger value="schemes">Government Schemes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-agrigreen-600" />
                Price Prediction for Next 6 Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pricePrediction && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={pricePrediction.predictedPrices}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#16a34a"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <p className="text-sm text-gray-500 mt-4">
                *Predictions are based on historical data and market trends. Actual prices may vary.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schemes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="mr-2 h-5 w-5 text-agrigreen-600" />
                Available Government Schemes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellerSchemes.map((scheme, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="font-medium text-agrigreen-800">{scheme.title}</h3>
                    <p className="text-gray-600">{scheme.description}</p>
                    <Button variant="link" className="text-agrigreen-600 p-0 mt-1">
                      Learn more
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetail;
