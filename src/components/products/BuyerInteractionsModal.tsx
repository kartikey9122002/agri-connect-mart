
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BuyerInteraction } from '@/types';

interface BuyerInteractionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  interactions: BuyerInteraction[];
  isLoading: boolean;
}

const BuyerInteractionsModal = ({
  isOpen,
  onClose,
  productName,
  interactions,
  isLoading,
}: BuyerInteractionsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buyer Interactions - {productName}</DialogTitle>
          <DialogDescription>
            View messages, inquiries, and reviews from buyers.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 mb-2 rounded"></div>
                    <div className="h-12 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : interactions.length > 0 ? (
            <div className="space-y-4 pt-4">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>{interaction.buyerName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{interaction.buyerName}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(interaction.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {interaction.type}
                      </span>
                    </div>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                      {interaction.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No buyer interactions yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyerInteractionsModal;
