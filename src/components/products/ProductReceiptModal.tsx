
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductReceipt } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Receipt, Package, User, MapPin, CalendarDays, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProductReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  receipts: ProductReceipt[];
  isLoading: boolean;
}

const ProductReceiptModal: React.FC<ProductReceiptModalProps> = ({
  isOpen,
  onClose,
  productName,
  receipts = [],
  isLoading,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'recent'>('all');
  
  const filteredReceipts = receipts.filter(receipt => {
    if (selectedTab === 'recent') {
      const date = new Date(receipt.createdAt);
      const now = new Date();
      // Show receipts from the last 7 days
      const diff = now.getTime() - date.getTime();
      const daysDiff = diff / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }
    return true;
  });

  const sortedReceipts = [...filteredReceipts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groupedByDate = sortedReceipts.reduce((groups, receipt) => {
    const date = new Date(receipt.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(receipt);
    return groups;
  }, {} as { [date: string]: ProductReceipt[] });

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-agrigreen-600" />
            Sales Receipts: {productName}
          </DialogTitle>
          <div className="flex space-x-1">
            <Button
              variant={selectedTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('all')}
              className="text-xs"
            >
              All Time
            </Button>
            <Button
              variant={selectedTab === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('recent')}
              className="text-xs"
            >
              Recent (7 days)
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-agrigreen-600" />
              <span className="ml-2">Loading receipts...</span>
            </div>
          ) : sortedReceipts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No sales receipts found for this product</p>
              {selectedTab === 'recent' && (
                <p className="text-sm mt-1">
                  Try checking "All Time" to see older receipts
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, receipts]) => (
                <div key={date} className="border rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
                    <h3 className="font-medium text-sm">{date}</h3>
                  </div>
                  <div className="space-y-4">
                    {receipts.map((receipt) => (
                      <div key={receipt.id} className="bg-gray-50 rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-agrigreen-600" />
                            <span className="font-medium">{receipt.buyerName}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(receipt.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Quantity:</span>{' '}
                            <span className="font-medium">{receipt.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>{' '}
                            <span className="font-medium">₹{receipt.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        {receipt.deliveryAddress && (
                          <div className="mt-2 flex items-start text-sm">
                            <MapPin className="h-3 w-3 mr-1 mt-1 text-gray-500" />
                            <p className="text-gray-600">{receipt.deliveryAddress}</p>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Order ID: {receipt.orderId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductReceiptModal;
