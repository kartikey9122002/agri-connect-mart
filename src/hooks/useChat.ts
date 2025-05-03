
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface Contact {
  id: string;
  name: string;
  role: UserRole;
  chatThreadId: string;
}

export const useChat = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchContacts();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user && selectedContact) {
      fetchMessages(selectedContact.chatThreadId);
    }
  }, [user, isAuthenticated, selectedContact]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      // Fetch contacts based on user role
      let query = supabase.from('profiles').select('id, full_name, role');

      if (user?.role === 'buyer') {
        // Buyer can only contact sellers
        query = query.eq('role', 'seller');
      } else if (user?.role === 'seller') {
        // Seller can only contact buyers
        query = query.eq('role', 'buyer');
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Map profiles to contacts and ensure each contact has a chatThreadId
      const contactsWithChatThreadIds = (data || []).map(contact => ({
        id: contact.id,
        name: contact.full_name || 'Unknown User',
        role: contact.role as UserRole,
        chatThreadId: generateChatThreadId(user.id, contact.id)
      }));

      setContacts(contactsWithChatThreadIds);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch contacts: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('timestamp', { ascending: true });

      if (error) {
        throw error;
      }

      // Convert database records to ChatMessage type
      const formattedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        threadId: msg.thread_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name || 'Unknown',
        senderRole: msg.sender_role || 'buyer',
        receiverId: msg.receiver_id,
        receiverName: msg.receiver_name || 'Unknown',
        content: msg.content,
        timestamp: msg.created_at || new Date().toISOString(),
        isRead: msg.is_read || false
      }));

      setMessages(formattedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch messages: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, receiverId: string, receiverName: string, threadId: string): Promise<boolean> => {
    if (!user || !isAuthenticated) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send messages.',
        variant: 'destructive',
      });
      return false;
    }

    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Create database-compatible object
      const newMessageRecord = {
        thread_id: threadId,
        sender_id: user.id,
        sender_name: user.name || 'User',
        sender_role: user.role,
        receiver_id: receiverId,
        receiver_name: receiverName,
        content,
        created_at: new Date().toISOString(),
        is_read: false
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([newMessageRecord])
        .select();

      if (error) {
        throw error;
      }

      // Format the returned data as a ChatMessage
      if (data && data[0]) {
        const newChatMessage: ChatMessage = {
          id: data[0].id,
          threadId: data[0].thread_id,
          senderId: data[0].sender_id,
          senderName: data[0].sender_name,
          senderRole: data[0].sender_role,
          receiverId: data[0].receiver_id,
          receiverName: data[0].receiver_name,
          content: data[0].content,
          timestamp: data[0].created_at,
          isRead: data[0].is_read
        };

        // Optimistically update the local state
        setMessages(prevMessages => [...prevMessages, newChatMessage]);
      }

      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const generateChatThreadId = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  return {
    messages,
    contacts,
    selectedContact,
    isLoading,
    sendMessage,
    fetchMessages,
    handleContactSelect
  };
};
