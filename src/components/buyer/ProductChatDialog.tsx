
import React, { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProductChatDialogProps {
  product: Product;
  trigger?: React.ReactNode;
}

const ProductChatDialog: React.FC<ProductChatDialogProps> = ({ product, trigger }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const { messages, isLoading, fetchMessages, sendMessage } = useChat();
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize chat when dialog opens
  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen && user) {
      const thread = await getOrCreateThread(product.sellerId, product.id);
      if (thread) {
        setThreadId(thread.id);
        // Make sure to strip any prefixes when fetching messages
        fetchMessages(thread.id);
      }
    }
    setOpen(newOpen);
  };

  // Function to get or create a chat thread
  const getOrCreateThread = async (sellerId: string, productId: string) => {
    if (!user) return null;
    
    try {
      // Check if thread already exists
      const { data: existingThreads, error: findError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .eq('product_id', productId);
      
      if (findError) throw findError;
      
      if (existingThreads && existingThreads.length > 0) {
        return existingThreads[0];
      }
      
      // If no thread exists, create a new one
      const { data: newThread, error: createError } = await supabase
        .from('chat_threads')
        .insert([{
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createError) {
        throw createError;
      }
      
      return newThread;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to initialize chat: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Load messages when threadId changes
  useEffect(() => {
    if (threadId) {
      fetchMessages(threadId);
    }
  }, [threadId, fetchMessages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (message.trim() && threadId && user) {
      await sendMessage(message, product.sellerId, product.sellerName, threadId);
      setMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="border-agrigreen-600 text-agrigreen-600 hover:bg-agrigreen-50"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat with Seller
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-agrigreen-600" />
            Chat with {product.sellerName}
          </DialogTitle>
          <DialogDescription>
            Ask questions about {product.name} or discuss order details
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-4 text-center">
            Please log in to chat with the seller.
          </div>
        ) : isLoading ? (
          <div className="py-4 text-center">Loading conversation...</div>
        ) : (
          <>
            <div className="h-[300px] overflow-y-auto border rounded-md p-4 mb-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Start the conversation by sending a message.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.senderId === user.id
                          ? 'bg-agrigreen-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={message.trim() === ''}
                className="bg-agrigreen-600 hover:bg-agrigreen-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductChatDialog;
