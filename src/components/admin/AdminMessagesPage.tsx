
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, UserRole } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Search, User, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface Contact {
  id: string;
  name: string;
  role: UserRole;
  chatThreadId: string;
  unreadCount?: number;
  isBlocked?: boolean;
}

const AdminMessagesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buyers' | 'sellers'>('buyers');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;

      try {
        // Fetch all users based on the active tab (buyers or sellers)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, is_blocked')
          .eq('role', activeTab === 'buyers' ? 'buyer' : 'seller')
          .order('full_name');

        if (error) {
          throw error;
        }

        if (!data) {
          setContacts([]);
          return;
        }

        // Map each contact to a chat thread ID
        const contactsWithThreads = data.map(contact => ({
          id: contact.id,
          name: contact.full_name || 'Unknown User',
          role: contact.role as UserRole,
          chatThreadId: generateChatThreadId(user.id, contact.id),
          isBlocked: contact.is_blocked || false
        }));

        // Get unread message count for each contact
        const contactsWithUnreadCounts = await Promise.all(
          contactsWithThreads.map(async (contact) => {
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
          })
        );

        setContacts(contactsWithUnreadCounts);
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

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `receiver_id=eq.${user?.id}` },
        (payload: any) => {
          // If we're viewing this contact's messages, refresh them
          if (selectedContact && payload.new && payload.new.thread_id === selectedContact.chatThreadId) {
            fetchMessages(selectedContact.chatThreadId);
          }
          
          // Refresh contacts to update unread counts
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, activeTab, selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.chatThreadId);
      
      // Mark messages as read
      if (user) {
        supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('thread_id', selectedContact.chatThreadId)
          .eq('receiver_id', user.id)
          .then(() => {
            // Update the contacts list to reflect the read messages
            setContacts(prev => 
              prev.map(contact => 
                contact.id === selectedContact.id 
                  ? { ...contact, unreadCount: 0 } 
                  : contact
              )
            );
          });
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

  const fetchMessages = async (threadId: string) => {
    try {
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

      // Format messages for display
      const formattedMessages: ChatMessage[] = data.map(msg => ({
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
      toast({
        title: 'Error',
        description: `Failed to fetch messages: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const generateChatThreadId = (adminId: string, userId: string): string => {
    const sortedIds = [adminId, userId].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim() || !user) return;
    
    try {
      // Create a new message record
      const messageRecord = {
        thread_id: selectedContact.chatThreadId,
        sender_id: user.id,
        sender_name: user.name || 'Admin',
        sender_role: 'admin',
        receiver_id: selectedContact.id,
        receiver_name: selectedContact.name,
        receiver_role: selectedContact.role,
        content: newMessage,
        created_at: new Date().toISOString(),
        is_read: false
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageRecord]);

      if (error) {
        throw error;
      }

      // Add new message to state for immediate display
      const newMessageObj: ChatMessage = {
        id: Date.now().toString(), // Temporary ID
        threadId: selectedContact.chatThreadId,
        senderId: user.id,
        senderName: user.name || 'Admin',
        senderRole: 'admin',
        receiverId: selectedContact.id,
        receiverName: selectedContact.name,
        content: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      setMessages([...messages, newMessageObj]);
      setNewMessage('');
      scrollToBottom();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive',
      });
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
      <h1 className="text-2xl font-bold mb-4">Admin Messages</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'buyers' | 'sellers')}>
        <TabsList className="mb-4">
          <TabsTrigger value="buyers">Chat with Buyers</TabsTrigger>
          <TabsTrigger value="sellers">Chat with Sellers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buyers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar - contacts list */}
            <div className="md:col-span-1">
              <Card className="h-[70vh] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Buyer Contacts</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search buyers..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-2">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? "No buyers found matching your search" : "No buyers found"}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                            selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                          } ${contact.unreadCount ? 'border-l-4 border-primary' : ''}`}
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={`https://avatar.vercel.sh/${contact.name}.png`} alt={contact.name} />
                              <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{contact.name}</span>
                                {contact.isBlocked && (
                                  <Badge variant="destructive" className="ml-1 text-xs">Blocked</Badge>
                                )}
                              </div>
                              {contact.unreadCount > 0 && (
                                <div className="mt-1">
                                  <Badge variant="default">{contact.unreadCount} new</Badge>
                                </div>
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
            
            {/* Right side - messages */}
            <div className="md:col-span-2">
              <Card className="h-[70vh] flex flex-col">
                {selectedContact ? (
                  <>
                    <CardHeader className="pb-2 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={`https://avatar.vercel.sh/${selectedContact.name}.png`} alt={selectedContact.name} />
                            <AvatarFallback>{selectedContact.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {selectedContact.name}
                        </CardTitle>
                        <Badge>{selectedContact.role}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                                  msg.senderId === user?.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatTimestamp(msg.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </CardContent>
                    <div className="p-3 border-t">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium">Select a buyer</h3>
                      <p className="text-gray-500">Choose a buyer from the list to start chatting</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="sellers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar - contacts list */}
            <div className="md:col-span-1">
              <Card className="h-[70vh] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Seller Contacts</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search sellers..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-2">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? "No sellers found matching your search" : "No sellers found"}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                            selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                          } ${contact.unreadCount ? 'border-l-4 border-primary' : ''}`}
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={`https://avatar.vercel.sh/${contact.name}.png`} alt={contact.name} />
                              <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{contact.name}</span>
                                {contact.isBlocked && (
                                  <Badge variant="destructive" className="ml-1 text-xs">Blocked</Badge>
                                )}
                              </div>
                              {contact.unreadCount > 0 && (
                                <div className="mt-1">
                                  <Badge variant="default">{contact.unreadCount} new</Badge>
                                </div>
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
            
            {/* Right side - messages - identical to buyers tab */}
            <div className="md:col-span-2">
              <Card className="h-[70vh] flex flex-col">
                {selectedContact ? (
                  <>
                    <CardHeader className="pb-2 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={`https://avatar.vercel.sh/${selectedContact.name}.png`} alt={selectedContact.name} />
                            <AvatarFallback>{selectedContact.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {selectedContact.name}
                        </CardTitle>
                        <Badge>{selectedContact.role}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                                  msg.senderId === user?.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatTimestamp(msg.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </CardContent>
                    <div className="p-3 border-t">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium">Select a seller</h3>
                      <p className="text-gray-500">Choose a seller from the list to start chatting</p>
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

export default AdminMessagesPage;
