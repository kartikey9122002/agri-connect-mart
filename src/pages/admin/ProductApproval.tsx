
import React, { useState } from 'react';
import { useProductApproval } from '@/hooks/useProductApproval';
import { Check } from 'lucide-react';
import { Product } from '@/types';
import { ProductApprovalCard } from '@/components/admin/ProductApprovalCard';
import { ProductDetailsDialog } from '@/components/admin/ProductDetailsDialog';

const ProductApproval = () => {
  const { pendingProducts, isLoading, handleApprove, handleReject } = useProductApproval();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-agrigreen-900">Product Approval Queue</h1>
        <p className="text-gray-600">Review and approve/reject product submissions from sellers</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      ) : pendingProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <Check className="mx-auto h-12 w-12 text-green-500 mb-3" />
          <h3 className="text-xl font-medium">All caught up!</h3>
          <p className="text-gray-500 mt-2">No pending products to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProducts.map(product => (
            <ProductApprovalCard
              key={product.id}
              product={product}
              onView={setSelectedProduct}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      <ProductDetailsDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ProductApproval;
