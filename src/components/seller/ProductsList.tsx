
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';
import ProductActionMenu from '@/components/products/ProductActionMenu';

interface ProductsListProps {
  products: Product[];
  isLoading: boolean;
  onDeleteProduct: (productId: string) => Promise<void>;
  onToggleAvailability: (productId: string, currentAvailability: 'available' | 'unavailable') => Promise<void>;
  onViewInteractions: (productId: string, productName: string) => void;
  onViewReceipt: (productId: string, productName: string) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  isLoading,
  onDeleteProduct,
  onToggleAvailability,
  onViewInteractions,
  onViewReceipt
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityBadgeClass = (availability: string) => {
    return availability === 'available' 
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="flex items-center border-b border-gray-100 pb-4">
                <div className="w-16 h-16 mr-4 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image for product ${product.id}`);
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{product.name}</h3>
                    <span className="text-sm text-gray-600">₹{product.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(product.status)}`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getAvailabilityBadgeClass(product.availability || 'available')}`}>
                      {product.availability || 'Available'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Added on {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>
                  <ProductActionMenu
                    productId={product.id}
                    productName={product.name}
                    isAvailable={product.availability === 'available'}
                    onDelete={() => onDeleteProduct(product.id)}
                    onToggleAvailability={() => onToggleAvailability(product.id, product.availability || 'available')}
                    onViewInteractions={() => onViewInteractions(product.id, product.name)}
                    onViewReceipt={() => onViewReceipt(product.id, product.name)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't added any products yet</p>
            <Link to="/seller/add-product" className="mt-2 inline-block text-agrigreen-600 hover:text-agrigreen-700">
              Add your first product
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsList;
