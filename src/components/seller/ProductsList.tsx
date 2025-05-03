
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ProductWithRowNumber extends Product {
  rowNumber: number;
}

interface ProductsListProps {
  isLoading: boolean;
  onDeleteProduct: (productId: string) => Promise<void>;
  onToggleAvailability: (productId: string, currentAvailability: 'available' | 'unavailable') => Promise<void>;
  onViewInteractions: (productId: string, productName: string) => Promise<void>;
  onViewReceipt: (productId: string, productName: string) => Promise<void>;
  products: ProductWithRowNumber[];
}

const ProductsList = ({ 
  isLoading,
  products,
  onDeleteProduct,
  onToggleAvailability,
  onViewInteractions,
  onViewReceipt
}: ProductsListProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-4">No products listed yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
            <CardDescription className="text-gray-500">Category: {product.category}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="aspect-w-4 aspect-h-3 mb-3">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover rounded-md w-full h-full"
                />
              ) : (
                <div className="bg-gray-100 rounded-md flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <p className="text-gray-700 mb-2">₹{product.price.toFixed(2)}</p>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Link to={`/products/${product.id}`}>
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDeleteProduct(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onToggleAvailability(product.id, product.availability as 'available' | 'unavailable')}
              >
                {product.availability === 'available' ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Available
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Unavailable
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductsList;
