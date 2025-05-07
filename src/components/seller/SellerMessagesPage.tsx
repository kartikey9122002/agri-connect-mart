
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, UserRole } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  role: string;
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

const SellerMessagesPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buyers' | 'admins'>('buyers');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        // Fetch contacts based on active tab
        const role = activeTab === 'buyers' ? 'buyer' : 'admin';
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('role', role);

        if (error) {
          throw error;
        }

        if (!data) {
          setContacts([]);
          setIsLoading(false);
          return;
        }

        // Map each contact to a chat thread ID
        const contactsWithThreads = data.map(contact => ({
          id: contact.id,
          name: contact.full_name || 'Unknown User',
          role: contact.role || 'buyer',
          chatThreadId: generateChatThreadId(user.id, contact.id),
        }));

        // Get unread message counts
        const contactsWithUnread = await Promise.all(contactsWithThreads.map(async (contact) => {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('seller-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `receiver_id=eq.${user?.id}` },
        (payload: any) => {
          console.log('Real-time message update:', payload);
          if (selectedContact && payload.new && payload.new.thread_id === selectedContact.chatThreadId) {
            fetchMessages(selectedContact.chatThreadId);
          }
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeTab]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.chatThreadId);
      
      // Mark messages as read
      if (user) {
        supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('thread_id', selectedContact.chatThreadId)
          .eq('receiver_id', user.id);
      }
    }
  }, [selectedContact, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate a UUID from two user IDs to use as thread ID
  const generateChatThreadId = (userId1: string, userId2: string): string => {
    // Sort the IDs to ensure consistent thread ID generation
    const sortedIds = [userId1, userId2].sort();
    // Create a thread ID by using UUIDs v5 (name-based)
    // For simplicity, we'll just concatenate them with a prefix
    return `thread_${sortedIds[0]}_${sortedIds[1]}`;
  };

  const fetchMessages = async (threadId: string) => {
    try {
      console.log('Fetching messages for thread ID:', threadId);
      
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

      console.log('Messages data received:', data);

      // Transform database records to ChatMessage type
      const formattedMessages: ChatMessage[] = data.map((msg: MessageData) => ({
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
      }));

      setMessages(formattedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim() || !user) return;
    
    try {
      console.log('Sending message to thread:', selectedContact.chatThreadId);
      
      // Create a new message record in the database format
      const messageRecord = {
        thread_id: selectedContact.chatThreadId,
        sender_id: user.id,
        sender_name: user.name || 'Seller',
        sender_role: 'seller',
        receiver_id: selectedContact.id,
        receiver_name: selectedContact.name,
        receiver_role: selectedContact.role,
        content: newMessage,
        created_at: new Date().toISOString(),
        is_read: false
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageRecord])
        .select();

      if (error) {
        throw error;
      }

      // Update the thread's updated_at timestamp
      await supabase
        .from('chat_threads')
        .upsert([
          {
            id: selectedContact.chatThreadId,
            buyer_id: selectedContact.role === 'buyer' ? selectedContact.id : user.id, 
            seller_id: user.id,
            updated_at: new Date().toISOString()
          }
        ]);

      // Add message to state for immediate display
      // If data was returned, use it, otherwise generate a temporary ID
      const newMsg: ChatMessage = data && data.length > 0 
        ? {
            id: data[0].id,
            threadId: selectedContact.chatThreadId,
            senderId: user.id,
            senderName: user.name || 'Seller',
            senderRole: 'seller',
            receiverId: selectedContact.id,
            receiverName: selectedContact.name,
            content: newMessage,
            timestamp: new Date().toISOString(),
            isRead: false
          }
        : {
            id: `temp-${Date.now()}`,
            threadId: selectedContact.chatThreadId,
            senderId: user.id,
            senderName: user.name || 'Seller',
            senderRole: 'seller',
            receiverId: selectedContact.id,
            receiverName: selectedContact.name,
            content: newMessage,
            timestamp: new Date().toISOString(),
            isRead: false
          };
      
      setMessages(prevMessages => [...prevMessages, newMsg]);
      setNewMessage('');
      scrollToBottom();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Seller Messages</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'buyers' | 'admins')}>
        <TabsList className="mb-4">
          <TabsTrigger value="buyers">Chat with Buyers</TabsTrigger>
          <TabsTrigger value="admins">Chat with Admins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buyers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar - contacts list */}
            <div className="md:col-span-1">
              <Card className="h-[70vh] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Buyer Contacts</CardTitle>
                  <div className="relative">
                    <Input
                      placeholder="Search buyers..."
                      className="pl-2"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-2">
                  {isLoading ? (
                    <div className="space-y-3 p-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? "No buyers found matching your search" : "No buyers found"}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`py-2 px-4 rounded cursor-pointer hover:bg-gray-100 ${
                            selectedContact?.id === contact.id ? 'bg-gray-200' : ''
                          } ${contact.unreadCount ? 'border-l-4 border-primary' : ''}`}
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`https://avatar.vercel.sh/${contact.name}.png`} alt={contact.name} />
                              <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span>{contact.name}</span>
                              {contact.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2">{contact.unreadCount} new</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2">
              <Card className="h-[70vh] flex flex-col">
                {selectedContact ? (
                  <>
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-lg flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={`https://avatar.vercel.sh/${selectedContact.name}.png`} alt={selectedContact.name} />
                          <AvatarFallback>{selectedContact.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        Chat with {selectedContact.name}
                      </CardTitle>
                    </CardHeader>
                    
                    {/* Message Display Area */}
                    <CardContent className="flex-grow overflow-y-auto p-4">
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
                            <p className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500">No messages yet.</div>
                      )}
                      <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Input and Send Button */}
                    <div className="p-3 border-t">
                      <div className="flex">
                        <Input
                          type="text"
                          placeholder="Enter your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="mr-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4"/>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Select a buyer to start chatting</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="admins" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar - contacts list */}
            <div className="md:col-span-1">
              <Card className="h-[70vh] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Admin Contacts</CardTitle>
                  <div className="relative">
                    <Input
                      placeholder="Search admins..."
                      className="pl-2"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-2">
                  {isLoading ? (
                    <div className="space-y-3 p-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? "No admins found matching your search" : "No admins found"}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`py-2 px-4 rounded cursor-pointer hover:bg-gray-100 ${
                            selectedContact?.id === contact.id ? 'bg-gray-200' : ''
                          } ${contact.unreadCount ? 'border-l-4 border-primary' : ''}`}
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`https://avatar.vercel.sh/${contact.name}.png`} alt={contact.name} />
                              <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span>{contact.name}</span>
                              {contact.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2">{contact.unreadCount} new</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Area - Same as buyers tab */}
            <div className="md:col-span-2">
              <Card className="h-[70vh] flex flex-col">
                {selectedContact ? (
                  <>
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-lg flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={`https://avatar.vercel.sh/${selectedContact.name}.png`} alt={selectedContact.name} />
                          <AvatarFallback>{selectedContact.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        Chat with {selectedContact.name}
                      </CardTitle>
                    </CardHeader>
                    
                    {/* Message Display Area */}
                    <CardContent className="flex-grow overflow-y-auto p-4">
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
                            <p className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500">No messages yet.</div>
                      )}
                      <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Input and Send Button */}
                    <div className="p-3 border-t">
                      <div className="flex">
                        <Input
                          type="text"
                          placeholder="Enter your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="mr-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4"/>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Select an admin to start chatting</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerMessagesPage;
