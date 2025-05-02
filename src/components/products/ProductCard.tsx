
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Guard against undefined product
  if (!product) {
    return null;
  }

  // Ensure images array is not undefined
  const images = product.images || [];
  const availability = product.availability || 'available';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-agrigreen-100 hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
        {availability === 'unavailable' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className="bg-red-500 text-lg">Unavailable</Badge>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-agrigreen-700 font-bold">₹{product.price.toFixed(2)}</p>
          <Badge variant={product.status === 'approved' ? 'default' : 'outline'} className={`
            ${product.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
            ${product.status === 'approved' ? 'bg-agrigreen-100 text-agrigreen-800 border-agrigreen-200' : ''}
            ${product.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
          `}>
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">{product.category}</span>
          <Link 
            to={`/products/${product.id}`}
            className="text-agrigreen-600 hover:text-agrigreen-800 text-sm font-medium"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
