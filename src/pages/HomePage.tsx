
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Truck, Package, Award, Monitor } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import ProductGrid from '@/components/products/ProductGrid';
import PricePredictionChart from '@/components/home/PricePredictionChart';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'approved')
          .eq('availability', 'available')
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedProducts: Product[] = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            images: product.images || [],
            category: product.category,
            sellerId: product.seller_id,
            sellerName: 'Farmer', // We would fetch this normally
            status: product.status,
            availability: product.availability || 'available',
            createdAt: product.created_at,
            updatedAt: product.updated_at
          }));
          setFeaturedProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);
  
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-agrigreen-900 to-agrigreen-700 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Farm Fresh Products Direct to Your Home
            </h1>
            <p className="text-xl mb-8 text-agrigreen-50">
              Support local farmers and enjoy fresh, high-quality produce delivered to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-agriorange-500 hover:bg-agriorange-600 text-white">
                  Browse Products <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Join as a Farmer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-agricream py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-agrigreen-900">Why Choose AgriConnect Mart?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-agrigreen-100 text-center">
              <div className="inline-block p-3 bg-agrigreen-100 rounded-full mb-4">
                <ShoppingBag className="h-6 w-6 text-agrigreen-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-agrigreen-800">Farm to Table</h3>
              <p className="text-gray-600">Direct from local farmers, ensuring the freshest produce for your table.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-agrigreen-100 text-center">
              <div className="inline-block p-3 bg-agrigreen-100 rounded-full mb-4">
                <Truck className="h-6 w-6 text-agrigreen-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-agrigreen-800">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery right to your doorstep.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-agrigreen-100 text-center">
              <div className="inline-block p-3 bg-agrigreen-100 rounded-full mb-4">
                <Package className="h-6 w-6 text-agrigreen-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-agrigreen-800">Quality Products</h3>
              <p className="text-gray-600">Carefully selected high-quality agricultural products.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-agrigreen-100 text-center">
              <div className="inline-block p-3 bg-agrigreen-100 rounded-full mb-4">
                <Award className="h-6 w-6 text-agrigreen-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-agrigreen-800">Support Farmers</h3>
              <p className="text-gray-600">Help local farmers grow their business and community.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products - Updated to load products on initial render */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-agrigreen-900">Featured Products</h2>
            <Link to="/products" className="text-agrigreen-600 hover:text-agrigreen-700 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <ProductGrid products={featuredProducts} isLoading={isLoadingProducts} />
        </div>
      </div>

      {/* Government Schemes Section */}
      <div className="py-16 bg-agricream">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-md border border-agrigreen-100">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4 text-agrigreen-900">Government Agricultural Schemes</h2>
                <p className="text-gray-700 mb-6">
                  Stay updated with the latest government schemes and subsidies for farmers and agricultural businesses.
                </p>
                <Link to="/schemes">
                  <Button className="bg-agrigreen-600 hover:bg-agrigreen-700">
                    View Available Schemes <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="bg-agrigreen-50 p-6 rounded-lg border border-agrigreen-100">
                  <h3 className="font-semibold text-lg mb-4 text-agrigreen-800">Featured Scheme</h3>
                  <h4 className="font-medium text-agriorange-700 mb-2">National Agriculture Market (e-NAM)</h4>
                  <p className="text-gray-700 mb-4">
                    A pan-India electronic trading portal that networks existing agricultural markets to create a unified national market for agricultural commodities.
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Application Deadline: August 15, 2025</span>
                    <Link to="/schemes/1" className="text-agrigreen-600 hover:text-agrigreen-700">
                      Learn more
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Prediction Section - Updated to show graph directly */}
      <div className="py-16 bg-gradient-to-r from-agrigreen-800 to-agrigreen-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <Monitor className="h-16 w-16 mb-6 text-agriorange-300" />
              <h2 className="text-3xl font-bold mb-4">Agricultural Price Predictions</h2>
              <p className="text-xl mb-6 text-agrigreen-50">
                Using advanced AI technology to predict future crop prices, helping farmers and buyers make informed decisions.
              </p>
            </div>
            <div className="md:w-1/2 relative">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden p-4">
                <h3 className="text-agrigreen-800 font-semibold mb-2">Price Trends (Next 30 Days)</h3>
                <div className="h-64 w-full">
                  <PricePredictionChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-agrigreen-900">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-agricream p-6 rounded-lg border border-agrigreen-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-agrigreen-200 rounded-full flex items-center justify-center text-agrigreen-700 font-bold text-xl">
                  R
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Rakesh Sharma</h3>
                  <p className="text-sm text-gray-500">Farmer, Punjab</p>
                </div>
              </div>
              <p className="text-gray-700">
                "AgriConnect Mart has helped me expand my customer base beyond local markets. Now I can sell directly to consumers across the country at fair prices."
              </p>
            </div>
            <div className="bg-agricream p-6 rounded-lg border border-agrigreen-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-agrigreen-200 rounded-full flex items-center justify-center text-agrigreen-700 font-bold text-xl">
                  A
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Anita Desai</h3>
                  <p className="text-sm text-gray-500">Consumer, Delhi</p>
                </div>
              </div>
              <p className="text-gray-700">
                "I love getting farm-fresh vegetables delivered to my doorstep. The quality is exceptional, and I feel good knowing I'm supporting local farmers directly."
              </p>
            </div>
            <div className="bg-agricream p-6 rounded-lg border border-agrigreen-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-agrigreen-200 rounded-full flex items-center justify-center text-agrigreen-700 font-bold text-xl">
                  V
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Vikram Patel</h3>
                  <p className="text-sm text-gray-500">Farmer, Gujarat</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The price prediction feature has been invaluable for planning my crops. I also learned about government schemes I wasn't aware of through the platform."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Join CTA */}
      <div className="py-16 bg-gradient-to-r from-agriorange-500 to-agriorange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join AgriConnect Mart?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a farmer looking to sell your products or a consumer seeking fresh produce, join our growing community today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-agriorange-600 hover:bg-gray-100">
                Create an Account
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
