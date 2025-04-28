
import React from 'react';
import { Product } from '@/types';
import { Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProductDetailsDialogProps {
  product: Product | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  product,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!product) return null;

  const handleApprove = () => {
    onApprove(product.id);
    onClose();
  };

  const handleReject = () => {
    onReject(product.id);
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Submitted by {product.sellerName} on {new Date(product.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Images Gallery */}
          <div>
            <h3 className="text-sm font-medium mb-2">Product Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                    <img 
                      src={image} 
                      alt={`${product.name} - Image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center p-6 bg-gray-100 rounded-md">
                  <p className="text-gray-500">No product images</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium">{product.category}</p>
            </div>
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-medium">₹{product.price}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <div className="bg-gray-50 p-4 rounded-md text-gray-700">
              <p>{product.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleReject}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
