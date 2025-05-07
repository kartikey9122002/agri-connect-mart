
import React, { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProductChatDialogProps {
  product: Product;
  trigger?: React.ReactNode;
}

interface MessageData {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id: string;
  receiver_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const ProductChatDialog: React.FC<ProductChatDialogProps> = ({ product, trigger }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Initialize chat when dialog opens
  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen && user) {
      setIsLoading(true);
      const thread = await getOrCreateThread(product.sellerId, product.id);
      if (thread) {
        setThreadId(thread.id);
        await fetchMessages(thread.id);
      }
      setIsLoading(false);
    }
    setOpen(newOpen);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!threadId || !open) return;

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          const newMessage = payload.new as MessageData;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, open]);

  // Function to get or create a chat thread
  const getOrCreateThread = async (sellerId: string, productId: string) => {
    if (!user) return null;
    
    try {
      // Generate thread ID
      const threadId = generateChatThreadId(user.id, sellerId);

      // Check if thread already exists
      const { data: existingThreads, error: findError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('id', threadId);
      
      if (findError) throw findError;
      
      if (existingThreads && existingThreads.length > 0) {
        return existingThreads[0];
      }
      
      // If no thread exists, create a new one
      const { data: newThread, error: createError } = await supabase
        .from('chat_threads')
        .insert([{
          id: threadId,
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
      console.error('Failed to initialize chat:', error.message);
      return null;
    }
  };

  // Generate a consistent thread ID for any two users
  const generateChatThreadId = (buyerId: string, sellerId: string): string => {
    const sortedIds = [buyerId, sellerId].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  };

  // Fetch messages for a thread
  const fetchMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setMessages(data);
        
        // Mark messages as read
        if (user) {
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('thread_id', threadId)
            .eq('receiver_id', user.id);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim() || !threadId || !user) return;
    
    try {
      const messageRecord = {
        thread_id: threadId,
        sender_id: user.id,
        sender_name: user.name || 'Buyer',
        sender_role: 'buyer',
        receiver_id: product.sellerId,
        receiver_name: product.sellerName,
        receiver_role: 'seller',
        content: message,
        created_at: new Date().toISOString(),
        is_read: false
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageRecord])
        .select();

      if (error) throw error;

      // Update thread's updated_at timestamp
      await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

      // If data was returned, use it, otherwise generate a temporary ID
      const newMessage: MessageData = data && data.length > 0 
        ? data[0] as MessageData 
        : { 
            id: `temp-${Date.now()}`, 
            ...messageRecord 
          };
      
      // Add to local messages immediately
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={`https://avatar.vercel.sh/${product.sellerName}.png`} alt={product.sellerName} />
                <AvatarFallback>{product.sellerName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              Chat with {product.sellerName}
            </div>
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
                    className={`flex flex-col ${msg.sender_id === user.id ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.sender_id === user.id
                          ? 'bg-agrigreen-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(msg.created_at)}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
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
                className="self-end bg-agrigreen-600 hover:bg-agrigreen-700"
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
