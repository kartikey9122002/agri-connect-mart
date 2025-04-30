
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreVertical, Trash, Eye, EyeOff, Tags } from 'lucide-react';

interface ProductActionMenuProps {
  productId: string;
  productName: string;
  isAvailable?: boolean;
  onViewReceipt: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
  onViewInteractions: () => void;
}

const ProductActionMenu = ({
  productId,
  productName,
  isAvailable = true,
  onViewReceipt,
  onDelete,
  onToggleAvailability,
  onViewInteractions,
}: ProductActionMenuProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onClick={onViewReceipt}>
            <Tags className="mr-2 h-4 w-4" />
            View Receipt
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onViewInteractions}>
            <Eye className="mr-2 h-4 w-4" />
            Buyer Interactions
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleAvailability}>
            {isAvailable ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Set Unavailable
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Set Available
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault();
                onDelete();
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductActionMenu;
