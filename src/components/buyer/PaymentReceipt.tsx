
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, CreditCard, Mail } from 'lucide-react';
import { ProductReceipt } from '@/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    // Generate PDF for download
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(39, 174, 96);
    doc.text("AgriConnect Mart", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Payment Receipt", 105, 30, { align: "center" });
    
    // Receipt details
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    // Create a two-column layout for receipt details
    const startY = 50;
    const leftCol = 20;
    const rightCol = 120;
    
    doc.text("Receipt ID:", leftCol, startY);
    doc.text(`#${receipt.id.slice(0, 8)}`, leftCol + 25, startY);
    
    doc.text("Date:", leftCol, startY + 10);
    doc.text(formatDate(receipt.createdAt), leftCol + 25, startY + 10);
    
    doc.text("Product:", leftCol, startY + 20);
    doc.text(receipt.productName, leftCol + 25, startY + 20);
    
    doc.text("Quantity:", leftCol, startY + 30);
    doc.text(receipt.quantity.toString(), leftCol + 25, startY + 30);
    
    doc.text("Unit Price:", leftCol, startY + 40);
    doc.text(`₹${(receipt.totalPrice / receipt.quantity).toFixed(2)}`, leftCol + 25, startY + 40);
    
    doc.text("Total Amount:", leftCol, startY + 50);
    doc.text(`₹${receipt.totalPrice.toFixed(2)}`, leftCol + 25, startY + 50);
    
    if (receipt.deliveryAddress) {
      doc.text("Delivery Address:", leftCol, startY + 60);
      doc.text(receipt.deliveryAddress, leftCol + 25, startY + 60, { maxWidth: 100 });
    }
    
    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Thank you for shopping with AgriConnect Mart!", 105, pageHeight - 20, { align: "center" });
    doc.text("For any queries, please contact support@agriconnect.com", 105, pageHeight - 15, { align: "center" });
    
    // Save PDF
    doc.save(`AgriConnect_Receipt_${receipt.id.slice(0, 8)}.pdf`);
  };

  const handleShare = () => {
    // Share receipt via email
    const subject = `Your AgriConnect Mart Receipt #${receipt.id.slice(0, 8)}`;
    const body = `
Dear Customer,

Thank you for your purchase from AgriConnect Mart!

Receipt Details:
- Receipt ID: #${receipt.id.slice(0, 8)}
- Date: ${formatDate(receipt.createdAt)}
- Product: ${receipt.productName}
- Quantity: ${receipt.quantity}
- Unit Price: ₹${(receipt.totalPrice / receipt.quantity).toFixed(2)}
- Total Amount: ₹${receipt.totalPrice.toFixed(2)}
${receipt.deliveryAddress ? `- Delivery Address: ${receipt.deliveryAddress}` : ''}

If you have any questions about your order, please contact our customer support at support@agriconnect.com.

Thank you for supporting local farmers!
AgriConnect Mart Team
`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
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
            Download PDF
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleShare}
          >
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
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
