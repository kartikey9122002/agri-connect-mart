
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from '@/types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Create or find a thread between buyer and seller
  const getOrCreateThread = async (sellerId: string, productId: string) => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to chat with sellers.',
      });
      return null;
    }

    try {
      // Check if thread already exists
      let { data: threadData, error: threadError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .eq('product_id', productId)
        .single();

      if (threadError) {
        if (threadError.code === 'PGRST116') { // No rows returned
          // Create new thread
          const { data: newThread, error: createError } = await supabase
            .from('chat_threads')
            .insert({
              buyer_id: user.id,
              seller_id: sellerId,
              product_id: productId,
            })
            .select()
            .single();

          if (createError) throw createError;
          return newThread;
        } else {
          throw threadError;
        }
      }

      return threadData;
    } catch (error) {
      console.error('Error getting/creating chat thread:', error);
      toast({
        title: 'Chat error',
        description: 'Failed to start chat. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Load messages for a specific thread
  const loadMessages = async (threadId: string) => {
    if (!threadId || !user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process the messages
      const processedMessages = await Promise.all(data.map(async (msg) => {
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
          isRead: msg.is_read
        } as ChatMessage;
      }));

      setMessages(processedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Failed to load messages',
        description: 'There was an error loading your conversation.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (threadId: string, receiverId: string, content: string) => {
    if (!threadId || !user) return false;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          receiver_id: receiverId,
          content
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
        senderRole: user.role,
        receiverId,
        receiverName: 'Receiver', // This will be updated when messages are reloaded
        content,
        timestamp: data.created_at,
        isRead: false
      };

      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'There was an error sending your message. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    messages,
    isLoading,
    getOrCreateThread,
    loadMessages,
    sendMessage
  };
};
