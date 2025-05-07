
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, UserRole } from '@/types';

interface Contact {
  id: string;
  name: string;
  role: UserRole;
  chatThreadId: string;
  unreadCount?: number;
}

interface MessageData {
  id: string;
  thread_id: string | null;
  sender_id: string;
  sender_name: string | null;
  sender_role: string | null;
  receiver_id: string;
  receiver_name: string | null;
  content: string;
  created_at: string;
  is_read: boolean | null;
}

export const useChat = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        // Buyer can contact sellers and admins
        query = query.in('role', ['seller', 'admin']);
      } else if (user?.role === 'seller') {
        // Seller can contact buyers and admins
        query = query.in('role', ['buyer', 'admin']);
      } else if (user?.role === 'admin') {
        // Admin can contact buyers and sellers
        query = query.in('role', ['buyer', 'seller']);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data) {
        setContacts([]);
        return;
      }

      // Map profiles to contacts and ensure each contact has a chatThreadId
      const contactsWithChatThreadIds = data.map(contact => ({
        id: contact.id,
        name: contact.full_name || 'Unknown User',
        role: contact.role as UserRole,
        chatThreadId: generateChatThreadId(user.id, contact.id)
      }));

      setContacts(contactsWithChatThreadIds);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching messages for threadId:', threadId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      if (!data) {
        setMessages([]);
        return;
      }

      // Convert database records to ChatMessage type
      const formattedMessages: ChatMessage[] = data.map((msg: MessageData) => {
        return {
          id: msg.id,
          threadId: msg.thread_id || '',
          senderId: msg.sender_id,
          senderName: msg.sender_name || 'Unknown',
          senderRole: (msg.sender_role as UserRole) || 'buyer',
          receiverId: msg.receiver_id,
          receiverName: msg.receiver_name || 'Unknown',
          content: msg.content,
          timestamp: msg.created_at,
          isRead: msg.is_read || false
        };
      });

      setMessages(formattedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, receiverId: string, receiverName: string, threadId: string): Promise<boolean> => {
    if (!user || !isAuthenticated) {
      console.error('User must be logged in to send messages');
      return false;
    }

    if (!content.trim()) {
      console.error('Message cannot be empty');
      return false;
    }

    try {
      console.log('Sending message with threadId:', threadId);
      
      // First, get receiver's profile for their role
      const { data: receiverData, error: receiverError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', receiverId)
        .single();

      if (receiverError) {
        console.error('Error fetching receiver data:', receiverError);
      }

      // Create database-compatible object
      const newMessageRecord = {
        thread_id: threadId,
        sender_id: user.id,
        sender_name: user.name || 'User',
        sender_role: user.role,
        receiver_id: receiverId,
        receiver_name: receiverName,
        receiver_role: receiverData?.role || 'buyer',
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
        const msgData = data[0] as MessageData;
        const newChatMessage: ChatMessage = {
          id: msgData.id,
          threadId: msgData.thread_id || '',
          senderId: msgData.sender_id,
          senderName: msgData.sender_name || user.name || 'User',
          senderRole: (msgData.sender_role as UserRole) || user.role,
          receiverId: msgData.receiver_id,
          receiverName: msgData.receiver_name || receiverName,
          content: msgData.content,
          timestamp: msgData.created_at,
          isRead: msgData.is_read || false
        };

        // Optimistically update the local state
        setMessages(prevMessages => [...prevMessages, newChatMessage]);
      }

      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
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
