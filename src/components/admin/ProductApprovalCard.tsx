
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Eye } from 'lucide-react';

interface ProductApprovalCardProps {
  product: Product;
  onView: (product: Product) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ProductApprovalCard: React.FC<ProductApprovalCardProps> = ({
  product,
  onView,
  onApprove,
  onReject,
}) => {
  return (
    <Card className="overflow-hidden border-l-4 border-l-amber-400">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-24 h-24 bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>
          <div className="p-4 flex-grow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-sm bg-agrigreen-100 text-agrigreen-800 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                  <span className="text-sm text-gray-600">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    By {product.sellerName}
                  </span>
                </div>
              </div>
              <div className="mt-3 sm:mt-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(product)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  onClick={() => onApprove(product.id)}
                >
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onReject(product.id)}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Submitted {new Date(product.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
