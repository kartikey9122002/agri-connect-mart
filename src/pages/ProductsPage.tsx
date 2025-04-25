
import React, { useState, useEffect } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters, { FiltersType } from '@/components/products/ProductFilters';
import { Product } from '@/types';

// Mock data for initial development - will be replaced with actual API calls
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Rice',
    description: 'Premium quality organic rice grown without pesticides',
    price: 120,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
    category: 'Grains',
    sellerId: 'seller-1',
    sellerName: 'Farmer John',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Fresh Tomatoes',
    description: 'Juicy, ripe tomatoes picked at peak freshness',
    price: 40,
    images: ['https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1335&q=80'],
    category: 'Vegetables',
    sellerId: 'seller-2',
    sellerName: 'Green Acres Farm',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Raw Honey',
    description: 'Unprocessed, pure honey from wildflower meadows',
    price: 250,
    images: ['https://images.unsplash.com/photo-1471943311424-646960669fbc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
    category: 'Honey & Syrup',
    sellerId: 'seller-3',
    sellerName: 'Sweet Valley Apiaries',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Fresh Apples',
    description: 'Crisp, sweet apples picked from our orchard',
    price: 80,
    images: ['https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
    category: 'Fruits',
    sellerId: 'seller-1',
    sellerName: 'Farmer John',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Organic Wheat Flour',
    description: 'Stone-ground wheat flour from organically grown wheat',
    price: 65,
    images: ['https://images.unsplash.com/photo-1605133589929-1794e19058eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1780&q=80'],
    category: 'Grains',
    sellerId: 'seller-4',
    sellerName: 'Heritage Mill Farms',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Farm Fresh Milk',
    description: 'Non-homogenized, pasteurized milk from grass-fed cows',
    price: 60,
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80'],
    category: 'Dairy',
    sellerId: 'seller-5',
    sellerName: 'Green Meadow Dairy',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Organic Carrots',
    description: 'Sweet and crunchy organically grown carrots',
    price: 35,
    images: ['https://images.unsplash.com/photo-1582515073490-39981397c445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80'],
    category: 'Vegetables',
    sellerId: 'seller-2',
    sellerName: 'Green Acres Farm',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Fresh Farm Eggs',
    description: 'Free-range eggs from pasture-raised chickens',
    price: 90,
    images: ['https://images.unsplash.com/photo-1489734353536-27e3e5b51d41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80'],
    category: 'Dairy',
    sellerId: 'seller-1',
    sellerName: 'Farmer John',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const categories = ['Fruits', 'Vegetables', 'Grains', 'Dairy', 'Meat', 'Honey & Syrup'];

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating API fetch
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call to Supabase when integrated
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
    
    // Category filter - updated to handle the 'all' value
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
