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
      let query = supabase.from('users').select('id, name, role');

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

      // Map users to contacts and ensure each contact has a chatThreadId
      const contactsWithChatThreadIds = (data || []).map(contact => ({
        id: contact.id,
        name: contact.name,
        role: contact.role,
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

      setMessages(data || []);
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
      const newMessage: Omit<ChatMessage, 'id'> = {
        threadId,  // Add the threadId here
        senderId: user!.id,
        senderName: user!.name || 'User',
        senderRole: user!.role,
        receiverId,
        receiverName,
        content,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([newMessage])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Optimistically update the local state
      setMessages(prevMessages => [...prevMessages, data]);

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
    return `${sortedIds[0]}-${sortedIds[1]}`;
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
