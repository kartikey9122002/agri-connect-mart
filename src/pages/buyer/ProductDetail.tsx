
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  MessageSquare, 
  ShoppingCart,
  ChevronLeft, 
  ChevronRight, 
  Star,
  TrendingUp,
  FileText,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types';

// Mock product data
const productData: Record<string, Product> = {
  '1': {
    id: '1',
    name: 'Organic Rice',
    description: 'Premium quality organic rice grown without pesticides. This rice is cultivated using traditional farming methods in fertile soil, ensuring maximum nutrition and excellent taste. Perfect for daily consumption, our organic rice is free from harmful chemicals and pesticides, making it a healthy choice for your family.',
    price: 120,
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1576473086800-6020a7349568?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1614088459293-5669fadc3080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ],
    category: 'Grains',
    sellerId: 'seller-1',
    sellerName: 'Farmer John',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  '2': {
    id: '2',
    name: 'Fresh Tomatoes',
    description: 'Juicy, ripe tomatoes picked at peak freshness. Grown in nutrient-rich soil with care, these tomatoes are perfect for salads, sandwiches, or cooking. Enjoy their vibrant color and rich flavor in your favorite dishes.',
    price: 40,
    images: [
      'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1335&q=80',
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1598512752271-33f913a5af13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80',
      'https://images.unsplash.com/photo-1551289168-77e9869ebe09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2066&q=80'
    ],
    category: 'Vegetables',
    sellerId: 'seller-2',
    sellerName: 'Green Acres Farm',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Mock price prediction data
const pricePredictions = {
  '1': [
    { date: '2025-03', price: 110 },
    { date: '2025-04', price: 120 },
    { date: '2025-05', price: 125 },
    { date: '2025-06', price: 132 },
    { date: '2025-07', price: 138 },
    { date: '2025-08', price: 130 },
  ],
  '2': [
    { date: '2025-03', price: 35 },
    { date: '2025-04', price: 40 },
    { date: '2025-05', price: 42 },
    { date: '2025-06', price: 45 },
    { date: '2025-07', price: 48 },
    { date: '2025-08', price: 38 },
  ]
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { toast } = useToast();
  
  // In a real app, we would fetch this data from Supabase based on the ID
  const product = id ? productData[id] : null;
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="bg-agrigreen-600 hover:bg-agrigreen-700">
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const addToCart = () => {
    // In a real app, this would add the product to the cart in Supabase
    toast({
      title: 'Added to Cart',
      description: `${quantity} × ${product.name} added to your cart.`,
    });
  };

  const nextImage = () => {
    setActiveImage((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setActiveImage((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const prediction = id ? pricePredictions[id] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
            
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button 
                key={index}
                onClick={() => setActiveImage(index)} 
                className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                  index === activeImage ? 'border-agrigreen-500' : 'border-transparent'
                }`}
              >
                <img 
                  src={image} 
                  alt={`${product.name} thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <Badge className="bg-agrigreen-100 text-agrigreen-800 border-agrigreen-200">
                {product.category}
              </Badge>
            </div>
            <div className="flex items-center mt-2">
              <div className="flex text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current text-gray-300" />
              </div>
              <span className="text-sm text-gray-500 ml-2">4.0 (24 reviews)</span>
            </div>
            <div className="mt-4 text-2xl font-bold text-gray-900">
              ₹{product.price.toFixed(2)} <span className="text-sm font-normal text-gray-500">per kg</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mb-6 p-4 bg-agrigreen-50 rounded-lg border border-agrigreen-100">
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <Info className="h-5 w-5 mr-2 text-agrigreen-600" /> Product Information
            </h2>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Seller</span>
                <span className="font-medium">{product.sellerName}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{product.category}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Cultivation Method</span>
                <span className="font-medium">Organic</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Origin</span>
                <span className="font-medium">Punjab, India</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Available Stock</span>
                <span className="font-medium">100 kg</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <button
                onClick={decrementQuantity}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-l-md"
                disabled={quantity <= 1}
              >
                -
              </button>
              <div className="bg-gray-100 px-6 py-2">
                {quantity}
              </div>
              <button
                onClick={incrementQuantity}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-r-md"
              >
                +
              </button>
              <p className="ml-4 text-gray-600">
                Total: <span className="font-medium">₹{(product.price * quantity).toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={addToCart} 
              className="flex-1 bg-agrigreen-600 hover:bg-agrigreen-700"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-agriorange-500 text-agriorange-600 hover:bg-agriorange-50"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Contact Seller
            </Button>
          </div>

          <div className="mt-4 text-sm text-agrigreen-600">
            <p>✓ Free delivery on first order</p>
            <p>✓ Free delivery on orders over ₹200</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-agriorange-500" /> Price Prediction
          </h2>
          
          <div className="h-64 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
            <p className="text-gray-500">Price prediction graph will be displayed here</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="font-semibold">₹{product.price}/kg</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-gray-500">Predicted (1 month)</p>
              <p className="font-semibold text-green-600">
                ₹{prediction ? prediction[2].price : '--'}/kg 
                {prediction && (
                  <span className="text-xs ml-1">
                    (+{Math.round((prediction[2].price - product.price) / product.price * 100)}%)
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-gray-500">Predicted (3 months)</p>
              <p className="font-semibold text-green-600">
                ₹{prediction ? prediction[4].price : '--'}/kg
                {prediction && (
                  <span className="text-xs ml-1">
                    (+{Math.round((prediction[4].price - product.price) / product.price * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            <span className="font-medium">Price Analysis:</span> Based on historical data and market trends, the price of {product.name.toLowerCase()} is expected to increase over the next few months due to seasonal demand and reduced supply.
          </p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-agriorange-500" /> Related Schemes
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 border border-agriorange-100 rounded-md bg-agriorange-50">
              <h3 className="font-medium text-agriorange-800">National Food Security Mission</h3>
              <p className="text-sm text-gray-600 mt-1">
                Subsidy for buying quality seeds and farming equipment
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-agriorange-600 hover:text-agriorange-700"
                asChild
              >
                <Link to="/schemes/1">View Details</Link>
              </Button>
            </div>
            
            <div className="p-3 border border-agriorange-100 rounded-md bg-agriorange-50">
              <h3 className="font-medium text-agriorange-800">Kisan Credit Card</h3>
              <p className="text-sm text-gray-600 mt-1">
                Low-interest loans for agricultural expenses
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-agriorange-600 hover:text-agriorange-700"
                asChild
              >
                <Link to="/schemes/2">View Details</Link>
              </Button>
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                className="border-agriorange-500 text-agriorange-600 hover:bg-agriorange-50"
                asChild
              >
                <Link to="/schemes">
                  View All Schemes
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.values(productData)
            .filter(prod => prod.id !== product.id && prod.category === product.category)
            .slice(0, 4)
            .map(prod => (
              <div key={prod.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-agrigreen-100 hover:shadow-lg transition-shadow">
                <Link to={`/products/${prod.id}`}>
                  <div className="h-48 overflow-hidden">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{prod.name}</h3>
                    <div className="flex justify-between mt-2">
                      <p className="text-agrigreen-700 font-bold">₹{prod.price.toFixed(2)}</p>
                      <Badge className="bg-agrigreen-100 text-agrigreen-800 border-agrigreen-200">
                        {prod.category}
                      </Badge>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
