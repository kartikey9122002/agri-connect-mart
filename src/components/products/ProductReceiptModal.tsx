
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductReceipt } from '@/types';

interface ProductReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  receipts: ProductReceipt[];
  isLoading: boolean;
}

const ProductReceiptModal = ({
  isOpen,
  onClose,
  productName,
  receipts,
  isLoading,
}: ProductReceiptModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Product Receipt - {productName}</DialogTitle>
          <DialogDescription>
            View sales receipts for this product.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : receipts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{receipt.buyerName}</TableCell>
                    <TableCell>{receipt.quantity}</TableCell>
                    <TableCell className="text-right">₹{receipt.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No sales receipt available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductReceiptModal;
