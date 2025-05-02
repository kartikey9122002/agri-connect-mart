
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ProductGrid from '@/components/products/ProductGrid';
import PricePredictionChart from '@/components/home/PricePredictionChart';
import { Product } from '@/types';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoadingProducts(true);
      try {
        // Fetch approved products for the homepage
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'approved')
          .eq('availability', 'available')
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedProducts: Product[] = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            images: item.images || [],
            category: item.category,
            sellerId: item.seller_id,
            sellerName: 'Farmer', // We'd normally join with profile table
            status: item.status,
            availability: item.availability || 'available',
            createdAt: item.created_at,
            updatedAt: item.updated_at
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
      <section className="bg-agrigreen-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold text-agrigreen-900 leading-tight">
                Farm Fresh Products <br />Directly From Farmers
              </h1>
              <p className="text-gray-700 text-lg mt-4 mb-8">
                AgriConnect Mart brings you the freshest agricultural products directly 
                from farmers, eliminating middlemen and ensuring better prices.
              </p>
              <div className="space-x-4">
                <Link to="/products">
                  <Button>Explore Products</Button>
                </Link>
                <Link to="/schemes">
                  <Button variant="outline">View Schemes</Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <img
                src="/placeholder.svg"
                alt="Farmer with fresh produce"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
            <Link to="/products">
              <Button variant="link" className="text-agrigreen-600">
                View All
              </Button>
            </Link>
          </div>
          
          <ProductGrid products={featuredProducts} isLoading={isLoadingProducts} />
        </div>
      </section>

      {/* Price Prediction Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Agricultural Price Predictions</h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="h-[400px]">
                <PricePredictionChart />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Why Choose AgriConnect Mart?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-agrigreen-100 rounded-full flex items-center justify-center text-agrigreen-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Better Prices</h3>
              <p className="text-gray-600">
                By eliminating middlemen, farmers get better prices for their products and consumers pay less.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-agrigreen-100 rounded-full flex items-center justify-center text-agrigreen-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quality Assurance</h3>
              <p className="text-gray-600">
                All products on our platform undergo quality checks to ensure you get the best.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-agrigreen-100 rounded-full flex items-center justify-center text-agrigreen-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Transparent Origin</h3>
              <p className="text-gray-600">
                Know where your food comes from with complete transparency about the source.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
