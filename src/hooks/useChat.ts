
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, UserRole } from '@/types';
import { toast } from "sonner";

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
      
      // Mark messages as read when a contact is selected
      markMessagesAsRead(selectedContact.chatThreadId);
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

      // Get unread message counts for each contact
      const contactsWithUnread = await Promise.all(contactsWithChatThreadIds.map(async (contact) => {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', contact.chatThreadId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
          
        return {
          ...contact,
          unreadCount: count || 0
        };
      }));

      setContacts(contactsWithUnread);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
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
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async (threadId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .eq('receiver_id', user.id);

      // Update contacts list to reflect read messages
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.chatThreadId === threadId 
            ? { ...contact, unreadCount: 0 } 
            : contact
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (content: string, receiverId: string, receiverName: string, threadId: string): Promise<boolean> => {
    if (!user || !isAuthenticated) {
      console.error('User must be logged in to send messages');
      toast.error('You must be logged in to send messages');
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

      // Update chat thread's timestamp
      await supabase.from('chat_threads').upsert([{
        id: threadId,
        buyer_id: user.role === 'buyer' ? user.id : receiverId,
        seller_id: user.role === 'seller' ? user.id : receiverId,
        updated_at: new Date().toISOString()
      }]);

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
      toast.error('Failed to send message');
      return false;
    }
  };

  const generateChatThreadId = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort();
    return `thread_${sortedIds[0]}_${sortedIds[1]}`;
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  // Set up realtime subscription when a contact is selected
  useEffect(() => {
    if (!selectedContact || !user) return;
    
    const channel = supabase
      .channel(`messages-${selectedContact.chatThreadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${selectedContact.chatThreadId}`
        },
        (payload) => {
          const newMessage = payload.new as MessageData;
          
          // If this message is for the current thread, add it
          if (newMessage.thread_id === selectedContact.chatThreadId) {
            const chatMessage: ChatMessage = {
              id: newMessage.id,
              threadId: newMessage.thread_id || '',
              senderId: newMessage.sender_id,
              senderName: newMessage.sender_name || 'Unknown',
              senderRole: (newMessage.sender_role as UserRole) || 'buyer',
              receiverId: newMessage.receiver_id,
              receiverName: newMessage.receiver_name || 'Unknown',
              content: newMessage.content,
              timestamp: newMessage.created_at,
              isRead: newMessage.is_read || false
            };
            
            setMessages(prev => [...prev, chatMessage]);
            
            // If message is for current user, mark as read
            if (newMessage.receiver_id === user.id) {
              markMessagesAsRead(selectedContact.chatThreadId);
            }
          }
          
          // Refresh contacts to update unread counts
          fetchContacts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedContact, user]);

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
