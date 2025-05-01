import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BuyerInteraction, ChatMessage } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  Send, 
  Star, 
  MessageCircle,
  User,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface BuyerInteractionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  interactions: BuyerInteraction[];
  isLoading: boolean;
}

const BuyerInteractionsModal: React.FC<BuyerInteractionsModalProps> = ({
  isOpen,
  onClose,
  productName,
  productId,
  interactions,
  isLoading,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for the selected product
  useEffect(() => {
    if (!isOpen || !productId || !user) return;
    
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        // Get all threads related to this product
        const { data: threadsData, error: threadsError } = await supabase
          .from('chat_threads')
          .select('*')
          .eq('product_id', productId)
          .eq('seller_id', user.id);
          
        if (threadsError) throw threadsError;
        
        if (threadsData && threadsData.length > 0) {
          // Get all messages from these threads
          const threadIds = threadsData.map(thread => thread.id);
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .in('thread_id', threadIds)
            .order('created_at', { ascending: true });
            
          if (messagesError) throw messagesError;
          
          // Process messages with sender and receiver info
          if (messagesData) {
            const processedMessages = await Promise.all(messagesData.map(async (msg) => {
              // Get sender profile
              const { data: senderData } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', msg.sender_id)
                .single();
  
              // Get receiver profile
              const { data: receiverData } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', msg.receiver_id)
                .single();
  
              return {
                id: msg.id,
                senderId: msg.sender_id,
                senderName: senderData?.full_name || 'Unknown User',
                senderRole: senderData?.role || 'buyer',
                receiverId: msg.receiver_id,
                receiverName: receiverData?.full_name || 'Unknown User',
                content: msg.content,
                timestamp: msg.created_at,
                isRead: msg.is_read,
                threadId: msg.thread_id
              } as ChatMessage;
            }));
            
            setMessages(processedMessages);
            
            // If there are threads, select the first buyer
            if (threadsData.length > 0) {
              setSelectedBuyerId(threadsData[0].buyer_id);
              setThreadId(threadsData[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Failed to load messages',
          description: 'There was an error loading the conversation.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('product-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Get sender profile
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single();

          // Create and add the new message
          const newMessage: ChatMessage = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            senderName: senderData?.full_name || 'Unknown User',
            senderRole: senderData?.role || 'buyer',
            receiverId: payload.new.receiver_id,
            receiverName: user.name,
            content: payload.new.content,
            timestamp: payload.new.created_at,
            isRead: payload.new.is_read,
            threadId: payload.new.thread_id
          };
          
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
          
          // Mark message as read
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('id', payload.new.id);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, productId, user, toast]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedBuyerId || !threadId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          receiver_id: selectedBuyerId,
          content: messageInput,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update thread's updated_at timestamp
      await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

      // Add the new message to local state
      const newMessage: ChatMessage = {
        id: data.id,
        senderId: user.id,
        senderName: user.name,
        senderRole: 'seller',
        receiverId: selectedBuyerId,
        receiverName: messages.find(m => m.senderId === selectedBuyerId)?.senderName || 'Buyer',
        content: messageInput,
        timestamp: data.created_at,
        isRead: false,
        threadId: threadId
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'There was an error sending your message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get unique buyers from messages
  const uniqueBuyers = React.useMemo(() => {
    const buyers = new Map();
    messages.forEach(message => {
      if (message.senderRole === 'buyer') {
        buyers.set(message.senderId, {
          id: message.senderId,
          name: message.senderName,
          threadId: message.threadId
        });
      }
    });
    return Array.from(buyers.values());
  }, [messages]);

  // Filter messages by selected buyer
  const filteredMessages = selectedBuyerId 
    ? messages.filter(msg => 
        msg.senderId === selectedBuyerId || msg.receiverId === selectedBuyerId
      )
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-agrigreen-600" />
            Buyer Interactions: {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[500px] gap-4">
          {/* Buyers sidebar */}
          <div className="w-1/4 border-r pr-3">
            <h3 className="text-sm font-medium mb-2">Buyers</h3>
            {isLoadingMessages ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-agrigreen-600" />
              </div>
            ) : uniqueBuyers.length === 0 ? (
              <p className="text-sm text-gray-500">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {uniqueBuyers.map(buyer => (
                  <div
                    key={buyer.id}
                    onClick={() => {
                      setSelectedBuyerId(buyer.id);
                      setThreadId(buyer.threadId);
                    }}
                    className={`p-2 rounded cursor-pointer ${
                      selectedBuyerId === buyer.id 
                        ? 'bg-agrigreen-100 text-agrigreen-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm truncate">{buyer.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Messages area */}
          <div className="w-3/4 flex flex-col">
            {selectedBuyerId ? (
              <>
                <div className="flex-grow overflow-y-auto p-2 mb-2 border rounded">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-agrigreen-600" />
                      <span className="ml-2">Loading messages...</span>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                      <MessageCircle className="h-10 w-10 text-gray-300 mb-2" />
                      <p>No messages in this conversation yet</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderRole === 'seller' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`rounded-lg px-3 py-2 max-w-[80%] ${
                              message.senderRole === 'seller'
                                ? 'bg-agrigreen-600 text-white'
                                : 'bg-gray-100'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                <div className="flex">
                  <Textarea
                    placeholder="Type your reply..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-grow resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    className="ml-2 self-end" 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-lg">Select a buyer to view the conversation</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuyerInteractionsModal;
