
import React, { useState, useEffect } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters, { FiltersType } from '@/components/products/ProductFilters';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const categories = [
  'Fruits',
  'Vegetables',
  'Grains',
  'Dairy', 
  'Meat',
  'Honey & Syrup',
  'Herbs & Spices',
  'Nuts & Seeds',
  'Oils',
  'Other'
];

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Only fetch approved products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'approved');

        if (error) {
          throw error;
        }

        // Fetch seller names separately to avoid join issues
        const productsWithSellers = await Promise.all(
          data.map(async (product) => {
            const { data: profileData } = await supabase
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
              sellerName: profileData?.full_name || 'Unknown Seller',
              status: product.status,
              createdAt: product.created_at,
              updatedAt: product.updated_at
            };
          })
        );

        setProducts(productsWithSellers);
        setFilteredProducts(productsWithSellers);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Failed to load products',
          description: 'There was an error loading the products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const handleFilterChange = (filters: FiltersType) => {
    // Apply filters to products
    let filtered = [...products];
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.name.toLowerCase().includes(searchLower) || 
          product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Price range filter
    filtered = filtered.filter(
      product => 
        product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1]
    );
    
    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // Keep default order
        break;
    }
    
    setFilteredProducts(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-agrigreen-900">Browse Products</h1>
        <p className="text-gray-600 mt-2">
          Discover fresh, high-quality agricultural products directly from farmers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <ProductFilters onFilterChange={handleFilterChange} categories={categories} />
        </div>
        <div className="md:col-span-3">
          <ProductGrid products={filteredProducts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
