
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, CreditCard } from 'lucide-react';
import { ProductReceipt } from '@/types';

interface PaymentReceiptProps {
  receipt: ProductReceipt;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ receipt }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = () => {
    // Placeholder for download functionality
    console.log('Downloading receipt:', receipt.id);
    // In a real app, generate PDF or other format for download
  };

  const handleShare = () => {
    // Placeholder for share functionality
    console.log('Sharing receipt:', receipt.id);
    // In a real app, use Web Share API or other sharing method
  };

  return (
    <Card className="border-2 border-dashed border-gray-200">
      <CardHeader className="border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-agrigreen-600" />
            Payment Receipt
          </CardTitle>
          <div className="text-sm font-medium text-gray-500">
            #{receipt.id.slice(0, 8)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-agrigreen-800">
              AgriConnect Mart
            </h3>
            <p className="text-sm text-gray-500">
              Farm fresh, direct to your doorstep
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Receipt Date:</span>
            <span className="font-medium">{formatDate(receipt.createdAt)}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Product:</span>
            <span className="font-medium">{receipt.productName}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-medium">{receipt.quantity}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Unit Price:</span>
            <span className="font-medium">₹{(receipt.totalPrice / receipt.quantity).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2 font-bold">
            <span className="text-gray-800">Total Amount:</span>
            <span className="text-agrigreen-700">₹{receipt.totalPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Payment Status:</span>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Paid
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Thank you for shopping with AgriConnect Mart!
          <br />
          For any queries, please contact support@agriconnect.com
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentReceipt;
