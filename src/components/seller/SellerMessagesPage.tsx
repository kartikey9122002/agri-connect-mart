import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Contact {
  id: string;
  name: string;
  chatThreadId: string;
}

const SellerMessagesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;

      try {
        // Fetch all users with the role of 'buyer'
        const { data: buyers, error: buyersError } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'buyer');

        if (buyersError) {
          console.error('Error fetching buyers:', buyersError);
          toast({
            title: 'Error',
            description: 'Failed to fetch buyers.',
            variant: 'destructive',
          });
          return;
        }

        // Map each buyer to a chat thread ID (you might need to create these IDs)
        const contactsWithThreads = buyers.map(buyer => ({
          id: buyer.id,
          name: buyer.name,
          chatThreadId: generateChatThreadId(user.id, buyer.id),
        }));

        setContacts(contactsWithThreads);
      } catch (error: any) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch contacts: ${error.message}`,
          variant: 'destructive',
        });
      }
    };

    fetchContacts();
  }, [user, toast]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('thread_id', selectedContact.chatThreadId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch messages.',
            variant: 'destructive',
          });
          return;
        }

        setMessages(data || []);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch messages: ${error.message}`,
          variant: 'destructive',
        });
      }
    };

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `thread_id=eq.${selectedContact?.chatThreadId}` },
        (payload) => {
          if (payload.new) {
            setMessages((prevMessages) => [...(prevMessages || []), payload.new as ChatMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedContact, user, toast]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const generateChatThreadId = (sellerId: string, buyerId: string): string => {
    const sortedIds = [sellerId, buyerId].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedContact || !content.trim()) return;
    
    try {
      // Create a new message including threadId
      const newMessage: Omit<ChatMessage, 'id'> = {
        threadId: selectedContact.chatThreadId, // Ensure this property exists
        senderId: user!.id,
        senderName: user!.name || 'Seller',
        senderRole: 'seller',
        receiverId: selectedContact.id,
        receiverName: selectedContact.name,
        content,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([newMessage])
        .select('*');

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message.',
          variant: 'destructive',
        });
        return;
      }

      setNewMessage('');
      // setMessages(prevMessages => [...(prevMessages || []), data[0]]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Seller Messages</h1>
      <div className="flex">
        {/* Contact List */}
        <div className="w-1/4 pr-4">
          <h2 className="text-lg font-semibold mb-2">Contacts</h2>
          <ul>
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className={`py-2 px-4 rounded cursor-pointer hover:bg-gray-100 ${selectedContact?.id === contact.id ? 'bg-gray-200' : ''}`}
                onClick={() => handleContactSelect(contact)}
              >
                {contact.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Area */}
        <div className="w-3/4">
          {selectedContact ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">Chat with {selectedContact.name}</h2>
              
              {/* Message Display Area */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50 rounded-md mb-2">
                {messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-2 p-2 rounded-md ${message.senderId === user?.id ? 'bg-blue-100 ml-auto w-fit max-w-[60%] ' : 'bg-gray-100 mr-auto w-fit max-w-[60%]'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://avatar.vercel.sh/${message.senderName}.png`} alt={message.senderName} />
                          <AvatarFallback>{message.senderName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold">{message.senderName}</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">No messages yet.</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input and Send Button */}
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Enter your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="mr-2"
                />
                <Button onClick={() => handleSendMessage(newMessage)}><Send className="h-4 w-4"/></Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Select a contact to start chatting.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerMessagesPage;
