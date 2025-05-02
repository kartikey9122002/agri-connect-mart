
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BuyerInteraction } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Star, Eye } from 'lucide-react';

interface BuyerInteractionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  interactions: BuyerInteraction[];
  isLoading: boolean;
}

const BuyerInteractionsModal: React.FC<BuyerInteractionsModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  interactions,
  isLoading
}) => {
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Buyer Interactions</DialogTitle>
          <DialogDescription>
            Recent buyer interactions for {productName}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-agrigreen-600"></div>
          </div>
        ) : interactions.length > 0 ? (
          <ScrollArea className="flex-grow">
            <div className="space-y-4">
              {interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="p-3 border rounded-md bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      {getInteractionIcon(interaction.type)}
                      <span className="ml-2 font-medium">{interaction.buyerName}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-200 rounded-full">
                        {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(interaction.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{interaction.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>No buyer interactions yet</p>
            <p className="text-sm mt-1">
              When buyers inquire about or review this product, they'll appear here.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyerInteractionsModal;
